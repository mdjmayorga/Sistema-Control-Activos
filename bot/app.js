import 'dotenv/config';
import admin from 'firebase-admin';
import express from 'express';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';
import sharp from 'sharp';
import unzipper from 'unzipper';

import { makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } from '@whiskeysockets/baileys';
import pino from 'pino';

// ═══════════════════════════════════════════════════════════════════
// FIREBASE
// ═══════════════════════════════════════════════════════════════════
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log('✅ Firebase Admin inicializado desde variable de entorno.');
} else {
    const serviceAccountPath = resolve('../civco-a947d-firebase-adminsdk-fbsvc-a511374a46.json');
    if (existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ Firebase Admin inicializado desde serviceAccountKey.json (raíz).');
    } else {
        console.warn('⚠️ No se encontró serviceAccountKey.json en la raíz del proyecto.');
    }
}

admin.initializeApp({
    credential: serviceAccount
        ? admin.credential.cert(serviceAccount)
        : admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'civco-a947d.firebasestorage.app',
    projectId: 'civco-a947d'
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════════
// EXPRESS — Health endpoint
// ═══════════════════════════════════════════════════════════════════
const expressApp = express();
const PORT = process.env.PORT || 3000;

let isConnected = false;

expressApp.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        bot: isConnected ? 'connected' : 'initializing',
        uptime: process.uptime()
    });
});

expressApp.listen(PORT, () => {
    console.log(`🌐 Health endpoint activo en puerto ${PORT}`);
});

// ═══════════════════════════════════════════════════════════════════
// ESTADO EN MEMORIA
// ═══════════════════════════════════════════════════════════════════
const sessions = {};

// ═══════════════════════════════════════════════════════════════════
// BACKUP / RESTORE DE SESIÓN A FIREBASE STORAGE
// ═══════════════════════════════════════════════════════════════════
const AUTH_DIR = resolve('./baileys_auth');
const FIREBASE_AUTH_PATH = 'whatsapp-sessions/baileys-auth.zip';

async function backupAuthToFirebase() {
    if (!existsSync(AUTH_DIR)) {
        console.log('⚠️ backupAuthToFirebase: No existe el directorio de autenticación.');
        return;
    }
    const zipPath = resolve('./baileys-auth-temp.zip');
    try {
        const output = createWriteStream(zipPath);
        const archive = new ZipArchive({ zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(AUTH_DIR, false);
        await archive.finalize();
        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            output.on('error', reject);
        });
        await bucket.upload(zipPath, {
            destination: FIREBASE_AUTH_PATH,
            metadata: { contentType: 'application/zip' }
        });
        console.log('☁️ Sesión respaldada en Firebase Storage.');
    } catch (e) {
        console.warn('⚠️ Error al respaldar sesión:', e.message);
    } finally {
        if (existsSync(zipPath)) unlinkSync(zipPath);
    }
}

async function restoreAuthFromFirebase() {
    if (!existsSync(AUTH_DIR)) {
        mkdirSync(AUTH_DIR, { recursive: true });
        console.log('📁 Directorio de autenticación creado:', AUTH_DIR);
    }
    const file = bucket.file(FIREBASE_AUTH_PATH);
    const [exists] = await file.exists();
    if (!exists) {
        console.log('ℹ️ No hay sesión previa en Firebase Storage. Se necesita vincular.');
        return false;
    }
    const zipPath = resolve('./baileys-auth-temp.zip');
    try {
        await file.download({ destination: zipPath });
        const directory = await unzipper.Open.file(zipPath);
        await directory.extract({ path: AUTH_DIR });
        console.log('📥 Sesión restaurada desde Firebase Storage.');
        return true;
    } catch (e) {
        console.warn('⚠️ Error al restaurar sesión:', e.message);
        return false;
    } finally {
        if (existsSync(zipPath)) unlinkSync(zipPath);
    }
}

// ═══════════════════════════════════════════════════════════════════
// ARRANQUE
// ═══════════════════════════════════════════════════════════════════
let isInitializing = false;

async function startBot() {
    if (isInitializing) {
        console.log('⚠️ startBot ya está en ejecución, ignorando llamada.');
        return;
    }
    isInitializing = true;
    console.log('🚀 Iniciando bot de WhatsApp (Baileys)...');

    try {
        const restored = await restoreAuthFromFirebase();
        if (restored) {
            console.log('✅ Sesión restaurada exitosamente.');
        } else {
            console.log('ℹ️ No se restauró sesión previa. Se usará vinculación nueva.');
        }

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'error' }),
            browser: ['CIVCO Bot', 'Chrome', '']
        });
        console.log('🔌 Socket de WhatsApp creado.');

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('\n======================================================');
                console.log('📱 CÓDIGO QR (escanear con WhatsApp):');
                console.log('======================================================\n');
                console.log(qr);
                console.log('\n⚠️ Si el QR no se renderiza bien, usa el código de vinculación:');
                try {
                    const code = await sock.requestPairingCode('50687716817');
                    console.log(`🔑 Código de vinculación: ${code}`);
                    console.log('   (WhatsApp → Dispositivos vinculados → Vincular con número)');
                } catch (_) {
                    console.log('   (Código de vinculación no disponible en esta versión)');
                }
                console.log('======================================================\n');
            }

            if (connection === 'open') {
                console.log('\n🤖 ¡Bot de WhatsApp conectado y listo!\n');
                isConnected = true;
                isInitializing = false;
                console.log('☁️ Respaldando sesión inicial en Firebase Storage...');
                await backupAuthToFirebase();
            }

            if (connection === 'close') {
                isConnected = false;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                console.log(`⚠️ Conexión cerrada. Código: ${statusCode || 'desconocido'}`);
                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('❌ Sesión cerrada (LOGOUT). La sesión en Firebase se conserva para reintento.');
                    isInitializing = false;
                    console.log('🔄 Reintentando en 5 segundos...');
                    setTimeout(startBot, 5000);
                } else {
                    console.log(`🔄 Desconectado (código ${statusCode}). Reconectando en 5 segundos...`);
                    isInitializing = false;
                    setTimeout(startBot, 5000);
                }
            }
        });

        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (msg.key.remoteJid.endsWith('@g.us')) continue;
                if (msg.key.remoteJid === 'status@broadcast') continue;
                if (msg.key.fromMe) continue;

                const from = msg.key.remoteJid;
                const messageType = Object.keys(msg.message || {})[0];
                const msgBody = msg.message?.conversation
                    || msg.message?.extendedTextMessage?.text
                    || '';

                if (msgBody.includes('Entendido. Por favor, envía') || msgBody.includes('Ocurrió un error')) continue;

                if (msgBody.toLowerCase().includes('reportar')) {
                    const match = msgBody.match(/(?:da[ñn]o)\s+(.+)/i);
                    const loanId = match ? match[1].trim() : null;

                    if (!loanId) {
                        console.log(`⚠️ No se pudo identificar préstamo en mensaje de: ${from}`);
                        await sock.sendMessage(from, { text: '⚠️ No se pudo identificar el préstamo.' });
                        continue;
                    }

                    sessions[from] = { loanId, step: 'waiting_photo' };
                    console.log(`📝 Solicitud de reporte de daño iniciada: Préstamo ${loanId} de ${from}`);
                    await sock.sendMessage(from, {
                        text: `Entendido. Por favor, envía una fotografía mostrando claramente el daño del equipo.\n\n_Préstamo: ${loanId}_`
                    });
                    continue;
                }

                if (messageType === 'imageMessage') {
                    const session = sessions[from];
                    if (!session || session.step !== 'waiting_photo') continue;

                    const loanId = session.loanId;
                    console.log(`📸 Recibiendo imagen para préstamo ${loanId} de ${from}`);
                    try {
                        const stream = await downloadContentFromMessage(msg.message.imageMessage, 'image');
                        const chunks = [];
                        for await (const chunk of stream) {
                            chunks.push(chunk);
                        }
                        const imageBuffer = Buffer.concat(chunks);

                        const compressedBuffer = await sharp(imageBuffer)
                            .resize(800)
                            .jpeg({ quality: 80 })
                            .toBuffer();

                        const filePath = `damages/${loanId}/evidence.jpg`;
                        const file = bucket.file(filePath);
                        await file.save(compressedBuffer, { metadata: { contentType: 'image/jpeg' } });
                        console.log(`✅ Imagen guardada en Firebase Storage: ${filePath}`);

                        await db.collection('devoluciones').doc(loanId).set({ fotoSubida: true }, { merge: true });
                        console.log(`✅ Firestore actualizado: devoluciones/${loanId}.fotoSubida = true`);

                        delete sessions[from];
                        await sock.sendMessage(from, { text: '*¡Gracias!* La evidencia ha sido registrada.' });
                        console.log(`✅ Proceso completado para préstamo ${loanId}`);
                    } catch (error) {
                        console.error('❌ Error al procesar imagen:', error);
                        await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' });
                    }
                }
            }
        });

        setInterval(async () => {
            if (isConnected) {
                console.log('⏲️ Respaldo periódico de sesión...');
                await backupAuthToFirebase();
            }
        }, 5 * 60 * 1000);

    } catch (e) {
        console.error('❌ Error al iniciar el bot:', e);
        isInitializing = false;
        console.log('🔄 Reintentando en 5 segundos...');
        setTimeout(startBot, 5000);
    }
}

startBot();
