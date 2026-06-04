import 'dotenv/config';
import pkg from 'whatsapp-web.js';
const { Client, RemoteAuth } = pkg;
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer';
import admin from 'firebase-admin';
import express from 'express';
import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ═══════════════════════════════════════════════════════════════════
// FIREBASE — Inicialización
// ═══════════════════════════════════════════════════════════════════
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Producción (Render): credenciales desde variable de entorno
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log('✅ Firebase Admin inicializado desde variable de entorno.');
} else {
    const serviceAccountPath = resolve('../civco-a947d-firebase-adminsdk-fbsvc-a511374a46.json');
    if (existsSync(serviceAccountPath)) {
        // Desarrollo local: credenciales desde archivo en raíz del proyecto
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

// ═══════════════════════════════════════════════════════════════════
// CHROME PATH — Busca chrome-headless-shell (ahorro ~40% RAM) o Chrome
// ═══════════════════════════════════════════════════════════════════
const __dirname = dirname(fileURLToPath(import.meta.url));

function findInCache(browserSubdir, binaryName) {
    const searchRoots = [
        resolve(__dirname, '.cache'),
        resolve(__dirname, '..', '.cache'),
        process.env.HOME ? resolve(process.env.HOME, '.cache', 'puppeteer') : null,
        '/opt/render/project/src/.cache',
        '/opt/render/.cache/puppeteer',
    ].filter(Boolean);

    for (const root of searchRoots) {
        const dir = resolve(root, browserSubdir);
        if (!existsSync(dir)) continue;
        try {
            const platforms = readdirSync(dir);
            for (const platform of platforms) {
                const pDir = resolve(dir, platform);
                if (!existsSync(pDir)) continue;
                const versions = readdirSync(pDir);
                for (const version of versions) {
                    const candidate = resolve(pDir, version, binaryName);
                    if (existsSync(candidate)) return candidate;
                }
            }
        } catch { }
    }
    return null;
}

async function findChromePath() {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        const p = process.env.PUPPETEER_EXECUTABLE_PATH;
        if (existsSync(p)) return p;
    }

    // 1) chrome-headless-shell — mucho más ligero (~40% menos RAM)
    let binary = findInCache('chrome-headless-shell', 'chrome-headless-shell');
    if (binary) {
        console.log(`🔍 Usando chrome-headless-shell (ahorro de RAM): ${binary}`);
        return binary;
    }

    // 2) Full Chrome
    binary = findInCache('chrome', 'chrome');
    if (binary) {
        console.log(`🔍 Chrome encontrado en: ${binary}`);
        return binary;
    }

    // 3) Puppeteer built-in resolution
    try {
        const path = await puppeteer.executablePath();
        if (existsSync(path)) return path;
    } catch { }

    // 4) System Chrome/Chromium
    const candidates = [
        '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium-browser', '/usr/bin/chromium', '/snap/bin/chromium',
    ];
    for (const c of candidates) { if (existsSync(c)) return c; }

    // 5) which
    try {
        const out = execSync('which google-chrome chromium-browser chromium 2>/dev/null || true', { encoding: 'utf8' }).trim();
        if (out) {
            const first = out.split('\n')[0].trim();
            if (existsSync(first)) return first;
        }
    } catch { }

    throw new Error('No se encontró Chrome/Chromium en el sistema.');
}

// ═══════════════════════════════════════════════════════════════════
// REMOTE AUTH STORE — Guarda la sesión de WhatsApp en Firebase Storage
// ═══════════════════════════════════════════════════════════════════
class FirebaseAdminStore {
    constructor(storageBucket) {
        this.bucket = storageBucket;
    }

    async sessionExists({ session }) {
        // Normalizamos el nombre de la sesión para que coincida con el nombre usado en save()
        const cleanSession = session.replace(/\\.zip$/i, '');
        const zipName = cleanSession.startsWith('RemoteAuth-') ? cleanSession : `RemoteAuth-${cleanSession}`;
        const file = this.bucket.file(`whatsapp-sessions/${zipName}.zip`);
        const [exists] = await file.exists();
        return exists;
    }


    async save({ session }) {
        // Normalizamos el nombre de la sesión eliminando cualquier extensión .zip que venga incluida
        const cleanSession = session.replace(/\.zip$/i, '');
        // RemoteAuth guarda el zip dentro de .wwebjs_auth/RemoteAuth-<clientId>/
        const zipName = cleanSession.startsWith('RemoteAuth-') ? cleanSession : `RemoteAuth-${cleanSession}`;
        const localZipPath = resolve('.wwebjs_auth', `${zipName}.zip`);
        if (!existsSync(localZipPath)) {
            console.warn(`⚠️  [save] No se encontró el archivo ${localZipPath}, omitiendo subida.`);
            return;
        }
        await this.bucket.upload(localZipPath, {
            destination: `whatsapp-sessions/${zipName}.zip`,
            metadata: { contentType: 'application/zip' }
        });
        console.log(`☁️  Sesión "${zipName}" respaldada en Firebase Storage.`);
    }


    async extract({ session, path }) {
        const file = this.bucket.file(`whatsapp-sessions/${session}.zip`);
        try {
            await file.download({ destination: path });
            console.log(`📥 Sesión "${session}" restaurada desde Firebase Storage.`);
        } catch (err) {
            // If the file does not exist in the bucket, RemoteAuth will fallback to fresh login.
            console.warn(`⚠️ No se encontró la sesión "${session}" en Firebase Storage: ${err.message}`);
        }
    }

    async delete({ session }) {
        // No eliminamos la sesión de Firebase Storage para poder reutilizarla
        // en futuros despliegues. La sesión se sobrescribe en cada save().
        console.log(`ℹ️  Sesión "${session}" marcada para eliminación (LOGOUT), pero se conserva en Firebase Storage.`);
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPRESS — Health endpoint para evitar spin-down
// ═══════════════════════════════════════════════════════════════════
const expressApp = express();
const PORT = process.env.PORT || 3000;

// Module-level reference so the health endpoint can check status
let client = null;

expressApp.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        bot: client?.info ? 'connected' : 'initializing',
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
// ARRANQUE — Client is created here so we can await executablePath
// ═══════════════════════════════════════════════════════════════════
const store = new FirebaseAdminStore(bucket);
let isInitializing = false;

async function startBot() {
    if (isInitializing) return;
    isInitializing = true;
    try {
        // ── Resolve Chrome path (puppeteer v25 returns a Promise) ────────
        const chromePath = await findChromePath();
        console.log(`🔍 Chrome encontrado en: ${chromePath}`);

        // ── Ensure placeholder auth file exists (prevents ENOENT) ────────
        const localAuthFolder = resolve('.wwebjs_auth');
        if (!existsSync(localAuthFolder)) {
          mkdirSync(localAuthFolder, { recursive: true });
        }
        const placeholderPath = resolve('.wwebjs_auth', 'RemoteAuth-civco-bot.zip');
        if (!existsSync(placeholderPath)) {
          writeFileSync(placeholderPath, '');
        }

        // ── Create client with resolved (string) executablePath ─────────
        client = new Client({
            authStrategy: new RemoteAuth({
                clientId: 'civco-bot',
                store,
                backupSyncIntervalMs: 300_000   // Respalda cada 5 min
            }),
            puppeteer: {
                headless: true,
                executablePath: chromePath,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-zygote',
                    '--disable-features=site-per-process',
                    '--disable-component-update',
                    '--disable-background-networking',
                    '--disable-sync',
                    '--disable-translate',
                    '--disable-default-apps',
                    '--mute-audio',
                    '--no-cache',
                    '--js-flags=--max-old-space-size=128'
                ]
            }
        });

        // ── Eventos del cliente ──────────────────────────────────────
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

        client.on('disconnected', async (reason) => {
            console.log(`⚠️ Bot desconectado: ${reason}`);
            const oldClient = client;
            client = null;
            if (oldClient) {
                try {
                    await oldClient.destroy();
                } catch (e) {
                    console.error('Error al destruir cliente:', e.message);
                }
            }
            // Espera 15s para que Chrome libere toda la memoria antes de relanzar
            await new Promise(r => setTimeout(r, 15000));
            startBot();
        });

        // ── Manejador de mensajes (Lógica de negocio) ────────────────
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

        await client.initialize();
        isInitializing = false;
    } catch (e) {
        console.error('❌ Error al iniciar el bot:', e);
        try { if (client) await client.destroy(); } catch (_) {}
        isInitializing = false;
        setTimeout(startBot, 3000);
    }
}

startBot();
