import {
  onDocumentWritten, onDocumentCreated} from "firebase-functions/v2/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  getDamageEmailTemplate, getHistorialMensualTemplate, getPrestamoCreadoEmailTemplate} from "./emailTemplate";

admin.initializeApp();

const IS_EMULATOR = process.env.FUNCTIONS_EMULATOR === "true";

// ── Helpers CSV ──────────────────────────────────────────────────────────────

interface LoanData {
  activo?: string;
  numeroSerie?: string;
  grupoTopografia?: string;
  cuadrilla?: string;
  razonPrestamo?: string;
  usuarioNombre?: string;
  correoInstitucional?: string;
  estado?: string;
  fechaPrestamo?: string;
  fechaDevolucion?: string | null;
}

function escaparCeldaCSV(valor: string): string {
  const str = valor ?? "";
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, "\"\"")}"`;
  }
  return str;
}

function formatearFechaCSV(fechaISO: string): string {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function generarCSV(loans: LoanData[]): string {
  const encabezados = [
    "Activo",
    "Número de serie",
    "Grupo",
    "Cuadrilla",
    "Razón del préstamo",
    "Usuario",
    "Correo institucional",
    "Estado",
    "Fecha de préstamo",
    "Fecha de devolución",
  ];

  const filas = loans.map((loan) => [
    loan.activo ?? "",
    loan.numeroSerie ?? "",
    loan.grupoTopografia ?? "",
    loan.cuadrilla ?? "",
    loan.razonPrestamo ?? "",
    loan.usuarioNombre ?? "",
    loan.correoInstitucional ?? "",
    loan.estado ?? "",
    loan.fechaPrestamo ? formatearFechaCSV(loan.fechaPrestamo) : "",
    loan.fechaDevolucion ? formatearFechaCSV(loan.fechaDevolucion) : "",
  ]);

  return [encabezados, ...filas]
    .map((fila) => fila.map((celda) => escaparCeldaCSV(celda)).join(","))
    .join("\n");
}

// DV005 - Notificación de daño.
// Esta función se ejecuta cuando se crea o actualiza un documento en "devoluciones".
export const notificarDanoActivo = onDocumentWritten(
  "devoluciones/{devolucionId}",
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!afterData) {
      console.log("No hay datos después del write. Fin.");
      return;
    }

    // Evita enviar correos repetidos si el daño ya estaba confirmado.
    const beforeDanio = beforeData?.danoConfirmado === true;
    const afterDanio = afterData.danoConfirmado === true;

    if (!afterDanio || beforeDanio) {
      console.log("No aplica notificación.");
      return;
    }

    // Datos principales del reporte de daño.
    const estudiante = afterData.nombreEstudiante || "Estudiante Desconocido";
    const activo = afterData.nombreActivo || "Activo Desconocido";

    // Devuelve el valor "N/A" si viene vacío.
    const fieldOrNA = (value: unknown): string => {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }

      return "N/A";
    };

    const numeroSerie = fieldOrNA(afterData.numeroSerie);
    const correoInstitucional = fieldOrNA(
      afterData.correoInstitucional ?? afterData.correo ?? afterData.email
    );
    const grupo = fieldOrNA(
      afterData.grupoTopografia ?? afterData.grupo ?? afterData.group
    );
    const cuadrilla = fieldOrNA(afterData.cuadrilla ?? afterData.crew);
    const grupoCuadrilla =
      grupo === "N/A" && cuadrilla === "N/A" ?
        "N/A" :
        `${grupo} / ${cuadrilla}`;
    const razonPrestamo = fieldOrNA(
      afterData.razonPrestamo ?? afterData.razon ?? afterData.reason
    );

    // La plantilla HTML del correo de daño.
    const htmlListo = getDamageEmailTemplate(
      estudiante,
      activo,
      numeroSerie,
      correoInstitucional,
      grupoCuadrilla,
      razonPrestamo
    );

    // Documento que se agrega a "mail",  la extensión lo toma y envía el correo.
    const payload = {
      to: ["jccoto@itcr.ac.cr", "deyamaradiaga0112@gmail.com"],
      message: {
        subject: `URGENTE: Daño en ${activo}`,
        html: htmlListo,
      },
      tipo: "reporte-danio",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Para probar en el emulador
    if (IS_EMULATOR) {
      console.log("EMULADOR: correo simulado");
      console.log(JSON.stringify(payload, null, 2));
    }

    // En la base real crea el documento para que la extensión envíe el correo.
    await admin.firestore().collection("mail").add(payload);
    console.log("Notificación creada en colección mail.");
  }
);

// ── HI007: Historial mensual por correo ──────────────────────────────────────
// Corre el día 1 de cada mes a las 6 AM hora Costa Rica.
// Envía el historial completo del mes anterior (ej: el 1 de junio envía mayo).
export const enviarHistorialMensual = onSchedule(
  {
    schedule: "0 6 1 * *",
    timeZone: "America/Costa_Rica",
  },
  async () => {
    const ahora = new Date();

    // Mes anterior: si estamos en enero (0), retrocede a diciembre (11) del año previo.
    const mesAnterior = ahora.getMonth() === 0 ? 11 : ahora.getMonth() - 1;
    const yearMesAnterior = ahora.getMonth() === 0
      ? ahora.getFullYear() - 1
      : ahora.getFullYear();

    // Rango ISO del mes anterior completo.
    const inicioMes = new Date(Date.UTC(yearMesAnterior, mesAnterior, 1)).toISOString();
    const finMes = new Date(
      Date.UTC(yearMesAnterior, mesAnterior + 1, 0, 23, 59, 59, 999)
    ).toISOString();

    const year = yearMesAnterior;
    const month = mesAnterior;

    const snapshot = await admin
      .firestore()
      .collection("prestamos")
      .where("fechaPrestamo", ">=", inicioMes)
      .where("fechaPrestamo", "<=", finMes)
      .orderBy("fechaPrestamo", "asc")
      .get();

    const loans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as LoanData),
    }));

    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    const mesLabel = `${meses[month]} ${year}`;
    const nombreArchivo = `historial-${year}-${String(month + 1).padStart(2, "0")}.csv`;

    const csvContent = generarCSV(loans);
    const htmlContent = getHistorialMensualTemplate(mesLabel, loans.length);

    const payload = {
      to: ["jccoto@itcr.ac.cr", "mayorga.halabi@gmail.com"],
      message: {
        subject: `Historial mensual de préstamos CIVCO — ${mesLabel}`,
        html: htmlContent,
        attachments: [
          {
            filename: nombreArchivo,
            content: Buffer.from("﻿" + csvContent).toString("base64"),
            encoding: "base64",
            contentType: "text/csv",
          },
        ],
      },
    };

    if (IS_EMULATOR) {
      console.log("EMULADOR: historial mensual simulado");
      console.log(JSON.stringify({
        ...payload,
        message: {
          ...payload.message,
          attachments: [{filename: nombreArchivo, bytesCSV: csvContent.length}],
        },
      }, null, 2));
      return;
    }

    await admin.firestore().collection("mail").add(payload);
    console.log(`Historial mensual enviado. Mes: ${mesLabel}, Préstamos: ${loans.length}`);
  }
);

// HI007 — Endpoint HTTP para probar el historial mensual (solo emulador).
// Acepta ?mes=5&year=2026 para simular cualquier mes.
export const enviarHistorialManual = onRequest(
  {region: "us-central1"},
  async (req, res) => {
    if (!IS_EMULATOR) {
      res.status(403).json({error: "Solo disponible en el emulador."});
      return;
    }

    const mesParam = Number(req.query.mes ?? new Date().getMonth() + 1);
    const yearParam = Number(req.query.year ?? new Date().getFullYear());
    const month = mesParam - 1; // 0-indexed

    const inicioMes = new Date(Date.UTC(yearParam, month, 1)).toISOString();
    const finMes = new Date(
      Date.UTC(yearParam, month + 1, 0, 23, 59, 59, 999)
    ).toISOString();

    const snapshot = await admin
      .firestore()
      .collection("prestamos")
      .where("fechaPrestamo", ">=", inicioMes)
      .where("fechaPrestamo", "<=", finMes)
      .orderBy("fechaPrestamo", "asc")
      .get();

    const loans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as LoanData),
    }));

    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    const mesLabel = `${meses[month]} ${yearParam}`;

    res.status(200).json({
      mensaje: "Historial generado (prueba)",
      mes: mesLabel,
      rango: {inicio: inicioMes, fin: finMes},
      prestamosEncontrados: loans.length,
      prestamos: loans.map((l) => ({
        activo: l.activo,
        usuario: l.usuarioNombre,
        estado: l.estado,
        fechaPrestamo: l.fechaPrestamo,
      })),
    });
  }
);

// PR004 - Correo automático al usuario cuando crea un préstamo.
// Se ejecuta cuando se crea un documento en "prestamos".
export const notificarPrestamoCreado = onDocumentCreated(
  "prestamos/{prestamoId}",
  async (event) => {
    const prestamo = event.data?.data();

    if (!prestamo) {
      console.log("No hay datos del préstamo.");
      return;
    }

    // Devuelve el valor del campo o "N/A" si no existe.
    const fieldOrNA = (value: unknown): string => {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }

      return "N/A";
    };

    // Datos necesarios para el correo.
    const correoUsuario = fieldOrNA(prestamo.correoInstitucional);
    const activo = fieldOrNA(prestamo.activo);
    const grupo = fieldOrNA(prestamo.grupoTopografia);
    const cuadrilla = fieldOrNA(prestamo.cuadrilla);
    const fechaPrestamo = fieldOrNA(prestamo.fechaPrestamo);

    if (correoUsuario === "N/A") {
      console.log("El préstamo no tiene correo.");
      return;
    }

    // Genera el HTML usando la plantilla.
    const htmlListo = getPrestamoCreadoEmailTemplate(
      activo,
      grupo,
      cuadrilla,
      fechaPrestamo
    );

    // Construye el documento que se guardará en "mail".
    const payload = {
      to: [correoUsuario],

      message: {
        subject: `Confirmación de préstamo registrado - ${activo}`,
        html: htmlListo,
      },

      tipo: "confirmacion-prestamo",

      prestamoId: event.params.prestamoId,

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (IS_EMULATOR) {
      console.log("Correo de préstamo generado:");
      console.log(JSON.stringify(payload, null, 2));
    }

    // Guarda el correo en la colección "mail".
    await admin.firestore().collection("mail").add(payload);

    console.log(`Correo creado para ${correoUsuario}`);
  }
);

// ── AD001: Limpieza periódica de Storage ─────────────────────────────────────

interface ResultadoLimpieza {
  examinados: number;
  eliminados: number;
  omitidos: number;
  errores: number;
}

async function ejecutarLimpiezaStorage(
  diasAntiguedad: number
): Promise<ResultadoLimpieza> {
  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  const ahora = new Date();
  const fechaLimite = new Date(ahora);
  fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);
  const fechaLimiteISO = fechaLimite.toISOString();

  const snapshot = await db
    .collection("devoluciones")
    .where("fotoSubida", "==", true)
    .get();

  let eliminados = 0;
  let omitidos = 0;
  let errores = 0;
  const refsActualizar: admin.firestore.DocumentReference[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Saltar archivos ya limpiados en ejecuciones anteriores.
    if (data.archivoLimpiado === true) {
      omitidos++;
      continue;
    }

    // Saltar préstamos devueltos hace menos de diasAntiguedad días.
    const fechaDevolucion = data.fechaDevolucion as string | undefined;
    if (!fechaDevolucion || fechaDevolucion > fechaLimiteISO) {
      omitidos++;
      continue;
    }

    const filePath = `damages/${doc.id}/evidence.jpg`;

    try {
      const file = bucket.file(filePath);
      const [exists] = await file.exists();

      if (exists) {
        await file.delete();
        console.log(`[AD001] Archivo eliminado: ${filePath}`);
        eliminados++;
      } else {
        console.log(`[AD001] Archivo no encontrado (ya eliminado): ${filePath}`);
      }

      refsActualizar.push(doc.ref);
    } catch (error) {
      console.error(`[AD001] Error procesando ${filePath}:`, error);
      errores++;
    }
  }

  for (let i = 0; i < refsActualizar.length; i += 500) {
    const lote = db.batch();
    refsActualizar.slice(i, i + 500).forEach((ref) => {
      lote.update(ref, {
        archivoLimpiado: true,
        fechaLimpieza: ahora.toISOString(),
      });
    });
    await lote.commit();
  }

  return {
    examinados: snapshot.size,
    eliminados,
    omitidos,
    errores,
  };
}

// Corre a las 3 AM (hora Costa Rica) el día 1 de cada mes (~30 días).
export const limpiarAlmacenamientoPeriodico = onSchedule(
  {
    schedule: "0 3 1 * *",
    timeZone: "America/Costa_Rica",
  },
  async () => {
    console.log("[AD001] Iniciando limpieza periódica de almacenamiento...");
    const resultado = await ejecutarLimpiezaStorage(30);
    console.log(
      `[AD001] Limpieza completada — examinados: ${resultado.examinados}, ` +
      `eliminados: ${resultado.eliminados}, ` +
      `omitidos: ${resultado.omitidos}, ` +
      `errores: ${resultado.errores}`
    );
  }
);

// Endpoint HTTP para disparar la limpieza manualmente desde el emulador.
// En producción responde 403 para evitar ejecuciones no autorizadas.
export const limpiarAlmacenamientoManual = onRequest(
  {region: "us-central1"},
  async (req, res) => {
    if (!IS_EMULATOR) {
      res.status(403).json({error: "Solo disponible en el emulador."});
      return;
    }

    const diasParam = Number(req.query.dias ?? "0");
    const diasAntiguedad = diasParam >= 0 ? diasParam : 30;

    console.log(`[AD001] Limpieza manual iniciada — diasAntiguedad=${diasAntiguedad}`);
    const resultado = await ejecutarLimpiezaStorage(diasAntiguedad);

    res.status(200).json({
      mensaje: "Limpieza completada",
      diasAntiguedad,
      ...resultado,
    });
  }
);

// ── DP004: Respaldo automático de Firestore ─────────────────────────────────

const COLECCIONES_RESPALDO = [
  "users",
  "prestamos",
  "devoluciones",
  "activos",
];

async function ejecutarRespaldo(): Promise<{
  colecciones: number;
  documentos: number;
  archivoRuta: string;
}> {
  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  const ahora = new Date();
  const stamp = ahora.toISOString().replace(/[:.]/g, "-");
  const archivoRuta = `backups/firestore-backup-${stamp}.json`;

  const respaldo: Record<string, Record<string, admin.firestore.DocumentData>> = {};
  let totalDocs = 0;

  for (const nombre of COLECCIONES_RESPALDO) {
    const snapshot = await db.collection(nombre).get();
    respaldo[nombre] = {};
    for (const doc of snapshot.docs) {
      respaldo[nombre][doc.id] = doc.data();
      totalDocs++;
    }
  }

  const contenido = JSON.stringify(respaldo, null, 2);
  const file = bucket.file(archivoRuta);
  await file.save(contenido, {contentType: "application/json"});

  console.log(
    `[DP004] Respaldo completado — ${COLECCIONES_RESPALDO.length} colecciones, ` +
    `${totalDocs} documentos, archivo: ${archivoRuta}`
  );

  return {
    colecciones: COLECCIONES_RESPALDO.length,
    documentos: totalDocs,
    archivoRuta,
  };
}

// Respaldo semanal: domingos a las 2 AM hora Costa Rica.
export const respaldarFirestoreSemanal = onSchedule(
  {
    schedule: "0 2 * * 0",
    timeZone: "America/Costa_Rica",
  },
  async () => {
    console.log("[DP004] Iniciando respaldo semanal de Firestore...");
    await ejecutarRespaldo();
  }
);

// Endpoint HTTP para disparar el respaldo manualmente (solo emulador).
export const respaldarFirestoreManual = onRequest(
  {region: "us-central1"},
  async (req, res) => {
    if (!IS_EMULATOR) {
      res.status(403).json({error: "Solo disponible en el emulador."});
      return;
    }

    console.log("[DP004] Respaldo manual iniciado...");
    const resultado = await ejecutarRespaldo();

    res.status(200).json({
      mensaje: "Respaldo completado",
      ...resultado,
    });
  }
);
