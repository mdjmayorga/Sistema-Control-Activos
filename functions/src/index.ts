import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import {getDamageEmailTemplate, getHistorialMensualTemplate} from "./emailTemplate";

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

export const notificarDanoActivo = onDocumentWritten(
  "devoluciones/{devolucionId}",
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!afterData) {
      console.log("No hay datos después del write. Fin.");
      return;
    }

    const beforeDanio = beforeData?.danoConfirmado === true;
    const afterDanio = afterData.danoConfirmado === true;

    if (!afterDanio || beforeDanio) {
      console.log("No aplica notificación.");
      return;
    }

    const estudiante = afterData.nombreEstudiante || "Estudiante Desconocido";
    const activo = afterData.nombreActivo || "Activo Desconocido";

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

    const htmlListo = getDamageEmailTemplate(
      estudiante,
      activo,
      numeroSerie,
      correoInstitucional,
      grupoCuadrilla,
      razonPrestamo
    );

    const payload = {
      to: "jccoto@itcr.ac.cr",
      message: {
        subject: `URGENTE: Daño en ${activo}`,
        html: htmlListo,
      },
    };

    if (IS_EMULATOR) {
      console.log("EMULADOR: correo simulado");
      console.log(JSON.stringify(payload, null, 2));
    }

    await admin.firestore().collection("mail").add(payload);
    console.log("Notificación creada en colección mail.");
  }
);

// ── HI007: Historial mensual por correo ──────────────────────────────────────
// Corre a las 11 PM hora Costa Rica los días 28-31. Dentro de la función se
// verifica si efectivamente es el último día del mes antes de enviar.
export const enviarHistorialMensual = onSchedule(
  {
    schedule: "0 23 28-31 * *",
    timeZone: "America/Costa_Rica",
  },
  async () => {
    // Hora actual en Costa Rica (UTC-6, sin DST)
    const CR_OFFSET_MS = -6 * 60 * 60 * 1000;
    const crNow = new Date(Date.now() + CR_OFFSET_MS);

    // VERIFICACIÓN TEMPORAL: deshabilitada para pruebas — restaurar después
    // const tomorrow = new Date(crNow);
    // tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    // if (tomorrow.getUTCDate() !== 1) {
    //   console.log(`No es el último día del mes. Fecha CR: ${crNow.toISOString()}`);
    //   return;
    // }

    const year = crNow.getUTCFullYear();
    const month = crNow.getUTCMonth(); // 0-indexed

    // Rango ISO del mes completo (UTC)
    const inicioMes = new Date(Date.UTC(year, month, 1)).toISOString();
    const finMes = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString();

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
