import {onDocumentWritten} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {getDamageEmailTemplate} from "./emailTemplate";

admin.initializeApp();

const IS_EMULATOR = process.env.FUNCTIONS_EMULATOR === "true";

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
      grupo === "N/A" && cuadrilla === "N/A"
        ? "N/A"
        : `${grupo} / ${cuadrilla}`;
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
