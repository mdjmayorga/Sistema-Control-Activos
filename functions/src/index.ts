import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {getDamageEmailTemplate} from "./emailTemplate";

admin.initializeApp();

export const notificarDanoActivo = onDocumentUpdated(
  "devoluciones/{devolucionId}",
  async (event) => {
    const dataNueva = event.data?.after.data();

    if (!dataNueva || dataNueva.danoConfirmado !== true) {
      return;
    }

    const estudiante = dataNueva.nombreEstudiante || "Estudiante Desconocido";
    const activo = dataNueva.nombreActivo || "Activo Desconocido";

    const htmlListo = getDamageEmailTemplate(estudiante, activo);

    await admin.firestore().collection("mail").add({
      to: "jccoto@itcr.ac.cr",
      message: {
        subject: `URGENTE: Daño en ${activo}`,
        html: htmlListo,
      },
    });

    console.log("Correo de daño enviado exitosamente.");
  }
);
