import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import sharp from 'sharp';
import admin from 'firebase-admin';

// Firebase 
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const serviceAccountPath = resolve('./serviceAccountKey.json');

if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'civco-a947d.appspot.com',
        projectId: 'civco-a947d'
    });
    console.log(' Firebase Admin inicializado con serviceAccountKey.');
} else {
    console.warn(" No se encontró 'serviceAccountKey.json'. Utilizando emuladores locales de Firebase.");
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
    process.env.STORAGE_EMULATOR_HOST = 'http://127.0.0.1:9199';

    admin.initializeApp({
        projectId: 'civco-a947d',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'civco-a947d.appspot.com'
    });
}
const bucket = admin.storage().bucket();

// Estado en memoria: { "telefono": { loanId, step } } 
const sessions = {};

// Cliente de WhatsApp 
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // QR en terminal
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
    }
});

client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log(' ESCANEA ESTE CÓDIGO QR EN TU WHATSAPP:');
    console.log('======================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('loading_screen', (percent, message) => {
    console.log(`Cargando WhatsApp Web... ${percent}% - ${message}`);
});

client.on('authenticated', () => {
    console.log('\n Autenticación exitosa. Esto puede tardar un minuto');
});

client.on('auth_failure', msg => {
    console.error('\n Fallo de autenticación:', msg);
});

client.on('ready', () => {
    console.log('\n ¡Bot de WhatsApp conectado y listo para recibir mensajes!\n');
});

client.on('message_create', async message => {
    // Si el usuario se envía un mensaje a sí mismo, from y to son iguales.
    // Usamos el número de destino o remitente consistentemente como identificador de sesión
    const from = message.fromMe ? message.to : message.from;
    const msgType = message.type;
    const msgBody = message.body || '';

    // Ignorar mensajes de grupos o estados
    if (message.isStatus || message.from.includes('@g.us')) return;

    // Ignorar las respuestas automáticas generadas por el propio bot para evitar bucles infinitos
    if (
        msgBody.includes('Entendido. Por favor, envía') ||
        msgBody.includes('Solo se aceptan *imágenes*') ||
        msgBody.includes('La evidencia fotográfica ha sido') ||
        msgBody.includes('No se pudo identificar el préstamo') ||
        msgBody.includes('No hay un reporte activo') ||
        msgBody.includes('Ocurrió un error al procesar')
    ) {
        return;
    }

    console.log(`Recibido de ${from} | Tipo: ${msgType} | Texto: "${msgBody}"`);

    // PASO 1: Usuario envía "Reportar Daño [LOAN_ID]"
    if (msgType === 'chat' && msgBody.toLowerCase().includes('reportar')) {
        // Extraer el loanId (última palabra o todo después de "Daño")
        const match = msgBody.match(/(?:da[ñn]o)\s+(.+)/i);
        const loanId = match ? match[1].trim() : null;

        if (!loanId) {
            await client.sendMessage(from, '⚠️ No se pudo identificar el préstamo. Envía el mensaje completo desde el enlace de la plataforma.');
            return;
        }

        sessions[from] = { loanId, step: 'waiting_photo' };
        console.log(`Sesión creada para ${from} con loanId: ${loanId}`);
        await client.sendMessage(from, `Entendido. Por favor, envía una fotografía mostrando claramente el daño del equipo.\n\n_Préstamo: ${loanId}_`);
        return;
    }
    // PASO 2: Usuario envía la foto
    if (msgType === 'image' || message.hasMedia) {
        const session = sessions[from];

        if (!session || session.step !== 'waiting_photo') {
            await client.sendMessage(from, 'No hay un reporte activo. Primero inicia el proceso de reporte desde el panel de control.');
            return;
        }

        const loanId = session.loanId;
        console.log(`Foto recibida de ${from} para préstamo ${loanId}. Procesando...`);

        try {
            // Descargar el media directamente con whatsapp-web.js
            const media = await message.downloadMedia();

            if (!media || !media.data) {
                throw new Error("No se pudo descargar la imagen");
            }

            // El contenido viene en base64, lo pasamos a buffer
            const imageBuffer = Buffer.from(media.data, 'base64');

            // Comprimir con Sharp
            const compressedBuffer = await sharp(imageBuffer)
                .resize(800)
                .jpeg({ quality: 80 })
                .toBuffer();

            // Subir a Firebase Storage
            const filePath = `damages/${loanId}/evidence.jpg`;
            const file = bucket.file(filePath);
            await file.save(compressedBuffer, {
                metadata: { contentType: 'image/jpeg' }
            });

            // Actualizar Firestore
            await admin.firestore().collection('devoluciones').doc(loanId).update({
                fotoSubida: true
            });

            // Limpiar sesión
            delete sessions[from];

            console.log(` Evidencia subida exitosamente para préstamo ${loanId}`);
            await client.sendMessage(from, '*¡Gracias!* La evidencia fotográfica ha sido registrada exitosamente.\n\nEl administrador podrá revisarla en el panel de control.');
        } catch (error) {
            console.error(' Error procesando imagen:', error.message);
            await client.sendMessage(from, ' Ocurrió un error al procesar la imagen. Por favor, intenta enviarla de nuevo.');
        }
        return;
    }
    // Cualquier otro mensaje mientras espera foto
    if (sessions[from]?.step === 'waiting_photo') {
        await client.sendMessage(from, ' Solo se aceptan *imágenes*. Por favor, envía una foto del daño.');
    }
});

// Arrancar el cliente con auto-reintento 
let isInitializing = false;

async function startBot() {
    if (isInitializing) return;
    isInitializing = true;

    try {
        console.log("Inicializando navegador...");
        await client.initialize();
        isInitializing = false;
    } catch (e) {
        console.error("\n Choque interno de WhatsApp Web detectado (Execution context destroyed).");
        console.log("Reiniciando el navegador en segundo plano automáticamente...\n");

        try {
            await client.destroy();
        } catch (err) { } // Ignorar error de destrucción

        isInitializing = false;
        setTimeout(startBot, 3000);
    }
}

// Interceptar eventos de desconexión abrupta
client.on('disconnected', (reason) => {
    console.log('\n Cliente desconectado:', reason);
    console.log(' Reconectando...\n');
    client.destroy().then(() => startBot()).catch(() => startBot());
});

startBot();
