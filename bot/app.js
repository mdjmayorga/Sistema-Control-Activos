import 'dotenv/config';
import admin from 'firebase-admin';
import express from 'express';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { resolve } from 'path';
import sharp from 'sharp';
import unzipper from 'unzipper';

import { makeWASocket, useMultiFileAuthState, downloadContentFromMessage, fetchLatestWaWebVersion } from '@whiskeysockets/baileys';
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
const FIRESTORE_FILES_COL = 'bot-sessions/whatsapp-auth/files';
const STORAGE_LEGACY_ZIP  = 'whatsapp-sessions/baileys-auth.zip';
const sanitizeDocId       = (name) => name.replace(/[.\/=@]/g, '_');

async function backupAuthToFirestore() {
    if (!existsSync(AUTH_DIR)) {
        console.log('⚠️ backupAuthToFirestore: directorio de auth no existe.');
        return;
    }
    try {
        const files = readdirSync(AUTH_DIR);
        if (files.length === 0) {
            console.log('⚠️ backupAuthToFirestore: directorio vacío, nada que respaldar.');
            return;
        }
        const batch = db.batch();
        for (const filename of files) {
            // Leemos como string crudo — NO parseamos JSON.
            // Los archivos de Baileys usan BufferJSON.replacer; parsearlo
            // corrompería los objetos Buffer al restaurar.
            const content = readFileSync(resolve(AUTH_DIR, filename), 'utf8');
            const docRef = db.collection(FIRESTORE_FILES_COL).doc(sanitizeDocId(filename));
            batch.set(docRef, {
                content,
                originalName: filename,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        await batch.commit();
        console.log(`☁️ Sesión respaldada en Firestore (${files.length} archivos).`);
    } catch (e) {
        console.warn('⚠️ Error al respaldar sesión en Firestore:', e.message);
    }
}

async function restoreAuth() {
    if (!existsSync(AUTH_DIR)) {
        mkdirSync(AUTH_DIR, { recursive: true });
        console.log('📁 Directorio de autenticación creado:', AUTH_DIR);
    }

    // ── Capa 1: credenciales locales (siempre las más frescas) ──────
    if (existsSync(resolve(AUTH_DIR, 'creds.json'))) {
        console.log('📂 Usando credenciales locales.');
        return true;
    }

    // ── Capa 2: Firestore (camino normal post-migración) ─────────────
    try {
        const snapshot = await db.collection(FIRESTORE_FILES_COL).get();
        if (!snapshot.empty) {
            for (const doc of snapshot.docs) {
                const { content, originalName } = doc.data();
                if (!originalName) {
                    // Nunca debería ocurrir con código nuevo; si pasa, abortar.
                    throw new Error(`Doc ${doc.id} sin campo originalName — sesión corrupta.`);
                }
                writeFileSync(resolve(AUTH_DIR, originalName), content, 'utf8');
            }
            console.log(`📥 Sesión restaurada desde Firestore (${snapshot.size} archivos).`);
            return true;
        }
        console.log('ℹ️ Firestore no tiene sesión previa. Buscando en Storage...');
    } catch (e) {
        console.warn('⚠️ Error al leer Firestore:', e.message);
        // No retornamos false — intentamos la Capa 3 como último recurso.
    }

    // ── Capa 3: migración única desde Storage ────────────────────────
    try {
        const legacyFile = bucket.file(STORAGE_LEGACY_ZIP);
        const [exists] = await legacyFile.exists();
        if (!exists) {
            console.log('ℹ️ No hay sesión en Firestore ni en Storage. Se necesita vincular.');
            return false;
        }
        console.log('🔄 Migrando sesión desde Storage a Firestore (única vez)...');
        const zipPath = resolve('./baileys-auth-temp.zip');
        await legacyFile.download({ destination: zipPath });
        const directory = await unzipper.Open.file(zipPath);
        await directory.extract({ path: AUTH_DIR });
        if (existsSync(zipPath)) unlinkSync(zipPath);
        // Subir inmediatamente a Firestore para no depender más de Storage.
        await backupAuthToFirestore();
        // Eliminar ZIP legacy de Storage para dejar de generar costo.
        try {
            await legacyFile.delete();
            console.log('🗑️ ZIP legacy eliminado de Storage.');
        } catch (delErr) {
            console.warn('⚠️ No se pudo eliminar ZIP de Storage (no crítico):', delErr.message);
        }
        console.log('✅ Migración a Firestore completada.');
        return true;
    } catch (e) {
        console.warn('⚠️ Error en migración desde Storage:', e.message);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// ARRANQUE
// ═══════════════════════════════════════════════════════════════════
let isInitializing = false;
let reconnectAttempt = 0;
let reconnectTimer = null;

process.on('unhandledRejection', (err) => {
    console.error(`💥 Unhandled rejection: ${err?.message || err}`);
    console.error(err?.stack || '');
});
process.on('uncaughtException', (err) => {
    console.error(`💥 Uncaught exception: ${err?.message || err}`);
    console.error(err?.stack || '');
});

function getReconnectDelay(forceFast) {
    if (forceFast) return 5000;
    const base = process.env.NODE_ENV === 'production' ? 120000 : 5000;
    const delay = Math.min(base * Math.pow(2, reconnectAttempt), 600000);
    return delay;
}

function scheduleReconnect(fn, delay) {
    if (reconnectTimer) {
        console.log('⏳ Ya hay una reconexión programada, ignorando.');
        return;
    }
    console.log(`🔄 Reconectando en ${Math.round(delay / 1000)}s...`);
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        fn();
    }, delay);
}

async function startBot() {
    if (isInitializing) {
        console.log('⚠️ startBot ya está en ejecución, ignorando llamada.');
        return;
    }
    isInitializing = true;
    console.log(`🚀 Iniciando bot de WhatsApp (Baileys) — intento #${reconnectAttempt + 1}...`);

    try {
        const restored = await restoreAuth();
        if (restored) {
            console.log('✅ Sesión restaurada exitosamente.');
        } else {
            console.log('ℹ️ No se restauró sesión previa. Se usará vinculación nueva.');
        }

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        // If not registered, clear stale creds.me left from a previous failed pairing
        // so validateConnection sends REGISTRATION (not LOGIN with a fake JID).
        if (!state.creds.registered && state.creds.me) {
            state.creds.me = undefined;
            await saveCreds();
            console.log('🧹 Credenciales obsoletas limpiadas antes de conectar.');
        }

        let waVersion;
        try {
            const { version, isLatest } = await fetchLatestWaWebVersion();
            waVersion = version;
            if (isLatest) {
                console.log(`📱 Versión WhatsApp Web: ${waVersion.join('.')}`);
            }
        } catch (_) {
            waVersion = [2, 3000, 1037641644];
            console.log(`📱 Versión WhatsApp Web (fallback): ${waVersion.join('.')}`);
        }

        const sock = makeWASocket({
            version: waVersion,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'warn' }),
            browser: ['CIVCO Bot', 'Chrome', '10.0.0']
        });
        console.log('🔌 Socket de WhatsApp creado.');

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr, isNewLogin } = update;

            if (qr) {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qr)}`;
                console.log(`\n📱 ESCANEA ESTE CÓDIGO QR DESDE WHATSAPP:`);
                console.log(`   ${qrUrl}`);
                console.log(`   Abre WhatsApp → Dispositivos vinculados → Vincular con QR\n`);
            }
            if (isNewLogin) {
                console.log(`🔐 Vinculación exitosa. JID: ${state.creds?.me?.id || 'desconocido'}`);
                // Mark registered so paired creds survive reconnection.
                // QR flow's configureSuccessfulPairing sets creds.me but NOT registered.
                state.creds.registered = true;
                await saveCreds();
            }

            if (connection === 'open') {
                console.log('\n🤖 ¡Bot de WhatsApp conectado y listo!\n');
                isConnected = true;
                isInitializing = false;
                reconnectAttempt = 0;
                console.log('☁️ Respaldando sesión inicial en Firestore...');
                await backupAuthToFirestore();
            }

            if (connection === 'close') {
                isConnected = false;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const errorMsg = lastDisconnect?.error?.message || '';
                const isRestartRequired = statusCode === 515;
                console.log(`⚠️ Conexión cerrada. Código: ${statusCode || 'desconocido'}`);
                console.log(`   Detalle: ${errorMsg}`);
                if (lastDisconnect?.error?.data) {
                    console.log(`   Datos: ${JSON.stringify(lastDisconnect.error.data)}`);
                }
                if (isRestartRequired) {
                    console.log('   ↳ Reinicio requerido tras vinculación. Reconectando rápido...');
                }
                // Clear incomplete pairing creds so validateConnection sends REGISTRATION on reconnect
                if (state.creds?.me && !state.creds.registered) {
                    state.creds.me = undefined;
                    await saveCreds();
                    console.log('🧹 Credenciales de vinculación incompleta limpiadas.');
                }
                isInitializing = false;
                const delay = getReconnectDelay(isRestartRequired);
                reconnectAttempt++;
                scheduleReconnect(startBot, delay);
            }
        });

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            console.log(`📩 messages.upsert (type=${type}): ${messages.length} msgs`);
            for (const msg of messages) {
                if (msg.key.remoteJid.endsWith('@g.us')) { console.log('   ↳ skip @g.us'); continue; }
                if (msg.key.remoteJid === 'status@broadcast') { console.log('   ↳ skip status'); continue; }
                // NOTE: fromMe=true messages can arrive when the user sends a command
                // from their phone (same WhatsApp account). Baileys sets fromMe=true via
                // areJidsSameUser. We must NOT skip them — the content-based filters
                // below prevent infinite loops from bot's own outgoing messages.

                const from = msg.key.remoteJid;
                const messageType = Object.keys(msg.message || {})[0];
                const msgBody = msg.message?.conversation
                    || msg.message?.extendedTextMessage?.text
                    || '';
                console.log(`   📨 from=${from} type=${messageType} body="${msgBody.slice(0, 100)}"`);

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
                await backupAuthToFirestore();
            }
        }, 5 * 60 * 1000);

    } catch (e) {
        console.error('❌ Error al iniciar el bot:', e);
        isInitializing = false;
        const delay = getReconnectDelay();
        reconnectAttempt++;
        scheduleReconnect(startBot, delay);
    }
}

startBot();
