import pkg from 'whatsapp-web.js';
const { Client, RemoteAuth } = pkg;
import qrcode from 'qrcode-terminal';
import sharp from 'sharp';
import admin from 'firebase-admin';
import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ═══════════════════════════════════════════════════════════════════
// FIREBASE — Inicialización
// ═══════════════════════════════════════════════════════════════════
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Producción (Render): credenciales desde variable de entorno
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log('✅ Firebase Admin inicializado desde variable de entorno.');
} else {
    const serviceAccountPath = resolve('./serviceAccountKey.json');
    if (existsSync(serviceAccountPath)) {
        // Desarrollo local: credenciales desde archivo
        serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ Firebase Admin inicializado desde serviceAccountKey.json.');
    }
}

admin.initializeApp({
    credential: serviceAccount
        ? admin.credential.cert(serviceAccount)
        : admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'civco-a947d.appspot.com',
    projectId: 'civco-a947d'
});

const bucket = admin.storage().bucket();

// ═══════════════════════════════════════════════════════════════════
// REMOTE AUTH STORE — Guarda la sesión de WhatsApp en Firebase Storage
// ═══════════════════════════════════════════════════════════════════
class FirebaseAdminStore {
    constructor(storageBucket) {
        this.bucket = storageBucket;
    }

    async sessionExists({ session }) {
        const file = this.bucket.file(`whatsapp-sessions/${session}.zip`);
        const [exists] = await file.exists();
        return exists;
    }

    async save({ session }) {
        const localZipPath = `./${session}.zip`;
        await this.bucket.upload(localZipPath, {
            destination: `whatsapp-sessions/${session}.zip`,
            metadata: { contentType: 'application/zip' }
        });
        console.log(`☁️  Sesión "${session}" respaldada en Firebase Storage.`);
    }

    async extract({ session, path }) {
        const file = this.bucket.file(`whatsapp-sessions/${session}.zip`);
        await file.download({ destination: path });
        console.log(`📥 Sesión "${session}" restaurada desde Firebase Storage.`);
    }

    async delete({ session }) {
        const file = this.bucket.file(`whatsapp-sessions/${session}.zip`);
        await file.delete().catch(() => {});
        console.log(`🗑️  Sesión "${session}" eliminada de Firebase Storage.`);
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPRESS — Health endpoint para evitar spin-down
// ═══════════════════════════════════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        bot: client?.info ? 'connected' : 'initializing',
        uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Health endpoint activo en puerto ${PORT}`);
});

// ═══════════════════════════════════════════════════════════════════
// ESTADO EN MEMORIA
// ═══════════════════════════════════════════════════════════════════
const sessions = {};

// ═══════════════════════════════════════════════════════════════════
// CLIENTE DE WHATSAPP
// ═══════════════════════════════════════════════════════════════════
const store = new FirebaseAdminStore(bucket);

const client = new Client({
    authStrategy: new RemoteAuth({
        store,
        backupSyncIntervalMs: 300_000   // Respalda cada 5 min
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-extensions',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ]
    }
});

// ── Eventos del cliente ──────────────────────────────────────────
client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log(' ESCANEA ESTE CÓDIGO QR EN TU WHATSAPP:');
    console.log('======================================================\n');
    qrcode.generate(qr, { small: true });
    console.log('\n⚠️ Si el código de arriba sale deformado por el espaciado de Render, copia la siguiente línea de texto y pégala en cualquier generador de QR (ej. https://es.qr-code-generator.com/ eligiendo la opción "Texto"):');
    console.log(qr);
    console.log('======================================================\n');
});

client.on('ready', () => {
    console.log('\n🤖 ¡Bot de WhatsApp conectado y listo!\n');
});

client.on('remote_session_saved', () => {
    console.log('☁️  Sesión remota guardada exitosamente.');
});

// ── Manejador de mensajes (Lógica de negocio) ────────────────────
client.on('message_create', async message => {
    const from = message.fromMe ? message.to : message.from;
    const msgType = message.type;
    const msgBody = message.body || '';

    if (message.isStatus || message.from.includes('@g.us')) return;
    if (msgBody.includes('Entendido. Por favor, envía') || msgBody.includes('Ocurrió un error')) return;

    if (msgType === 'chat' && msgBody.toLowerCase().includes('reportar')) {
        const match = msgBody.match(/(?:da[ñn]o)\s+(.+)/i);
        const loanId = match ? match[1].trim() : null;

        if (!loanId) {
            await client.sendMessage(from, '⚠️ No se pudo identificar el préstamo.');
            return;
        }

        sessions[from] = { loanId, step: 'waiting_photo' };
        await client.sendMessage(from, `Entendido. Por favor, envía una fotografía mostrando claramente el daño del equipo.\n\n_Préstamo: ${loanId}_`);
        return;
    }

    if (msgType === 'image' || message.hasMedia) {
        const session = sessions[from];
        if (!session || session.step !== 'waiting_photo') return;

        const loanId = session.loanId;
        try {
            const media = await message.downloadMedia();
            if (!media || !media.data) throw new Error('Fallo descarga');

            const imageBuffer = Buffer.from(media.data, 'base64');
            const compressedBuffer = await sharp(imageBuffer)
                .resize(800)
                .jpeg({ quality: 80 })
                .toBuffer();

            const filePath = `damages/${loanId}/evidence.jpg`;
            const file = bucket.file(filePath);
            await file.save(compressedBuffer, { metadata: { contentType: 'image/jpeg' } });

            await admin.firestore().collection('devoluciones').doc(loanId).set({ fotoSubida: true }, { merge: true });

            delete sessions[from];
            await client.sendMessage(from, '*¡Gracias!* La evidencia ha sido registrada.');
        } catch (error) {
            await client.sendMessage(from, '❌ Ocurrió un error al procesar la imagen.');
        }
        return;
    }
});

// ═══════════════════════════════════════════════════════════════════
// ARRANQUE
// ═══════════════════════════════════════════════════════════════════
let isInitializing = false;
async function startBot() {
    if (isInitializing) return;
    isInitializing = true;
    try {
        await client.initialize();
        isInitializing = false;
    } catch (e) {
        console.error('❌ Error al iniciar el bot:', e);
        try { await client.destroy(); } catch (_) {}
        isInitializing = false;
        setTimeout(startBot, 3000);
    }
}

client.on('disconnected', (reason) => {
    client.destroy().then(() => startBot()).catch(() => startBot());
});

startBot();
