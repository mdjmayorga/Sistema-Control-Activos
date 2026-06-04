# Migración: `whatsapp-web.js` → `@whiskeysockets/baileys`

## 1. Alcance

**Solo se modifica el directorio `bot/` y `render.yaml`.** El frontend Angular (`src/`), las Cloud Functions (`functions/`), y las reglas de Firestore no se tocan.

| Aspecto | Antes | Después |
|---|---|---|
| Conexión WhatsApp | `whatsapp-web.js` + `puppeteer` + Chrome | `@whiskeysockets/baileys` (protocolo directo, sin navegador) |
| RAM en Render | ~500MB (Chrome + Node) → OOM | ~80MB (Node puro) |
| Dependencias | 11 prod deps | ~7 prod deps (se eliminan 4, se agregan 2) |
| Compilación | Descarga Chrome en postinstall (`install.mjs`) | `npm install` simple |
| Persistencia sesión | `RemoteAuth` + `FirebaseAdminStore` (zip en Storage) | `useMultiFileAuthState` + backup manual zip a Storage |
| QR / vinculación | `qrcode-terminal` (QR en consola) | **Pairing Code** (código de 8 dígitos, más confiable en Render) + QR opcional |

---

## 2. Archivos a Eliminar / Limpiar

| Archivo / carpeta | Motivo |
|---|---|
| `bot/install.mjs` | Ya no se necesita descargar Chrome |
| `bot/.wwebjs_auth/` | Carpeta de sesión de `RemoteAuth` |
| `bot/.wwebjs_cache/` | Caché de `whatsapp-web.js` |
| `bot/.cache/` | Chrome descargado (~300MB) |

---

## 3. Cambios en `bot/package.json`

### Antes
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js",
    "postinstall": "node install.mjs"
  },
  "dependencies": {
    "archiver": "^8.0.0",
    "axios": "^1.7.0",
    "dotenv": "^16.4.5",
    "express": "^4.22.2",
    "firebase-admin": "^12.0.0",
    "fs-extra": "^11.3.5",
    "puppeteer": "^25.1.0",
    "qrcode-terminal": "^0.12.0",
    "sharp": "^0.33.2",
    "unzipper": "^0.12.3",
    "whatsapp-web.js": "github:pedroslopez/whatsapp-web.js#main"
  }
}
```

### Después
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.0",
    "archiver": "^8.0.0",
    "dotenv": "^16.4.5",
    "express": "^4.22.2",
    "firebase-admin": "^12.0.0",
    "pino": "^9.6.0",
    "sharp": "^0.33.2",
    "unzipper": "^0.12.3"
  }
}
```

- **Se eliminan**: `axios`, `fs-extra`, `puppeteer`, `qrcode-terminal`, `whatsapp-web.js`, script `postinstall`.
- **Se agregan**: `@whiskeysockets/baileys`, `pino`.
- **Se mantienen**: `archiver`, `dotenv`, `express`, `firebase-admin`, `sharp`, `unzipper`.

---

## 4. Cambios en `render.yaml`

### Antes
```yaml
services:
  - type: web
    name: civco-bot-whatsapp
    runtime: node
    rootDir: bot
    buildCommand: npm install
    startCommand: node app.js
    plan: free
    envVars:
      - key: NODE_OPTIONS
        value: "--max-old-space-size=64"
      - key: NODE_ENV
        value: production
      - key: FIREBASE_STORAGE_BUCKET
        value: civco-a947d.appspot.com
      - key: FIREBASE_SERVICE_ACCOUNT_JSON
        sync: false
```

### Después
```yaml
services:
  - type: web
    name: civco-bot-whatsapp
    runtime: node
    rootDir: bot
    buildCommand: npm install
    startCommand: node app.js
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
      - key: FIREBASE_STORAGE_BUCKET
        value: civco-a947d.appspot.com
      - key: FIREBASE_SERVICE_ACCOUNT_JSON
        sync: false
```

Se **elimina** `NODE_OPTIONS=--max-old-space-size=64`.

---

## 5. Nueva Implementación de `bot/app.js`

### 5.1 Arquitectura

```
1. Imports (Baileys, Firebase, Express, sharp, archiver, unzipper)
2. Firebase init (sin cambios)
3. Express + health endpoint (sin cambios)
4. Estado en memoria: sessions = {} (sin cambios)
5. Funciones de backup/restore de sesión a Firebase Storage (NUEVAS)
6. Función startBot() (REESCRITA)
   a. Restaurar auth desde Firebase Storage
   b. makeWASocket con useMultiFileAuthState
   c. Evento connection.update → Pairing Code / QR / reconexión
   d. Evento messages.upsert → misma lógica de negocio
   e. Evento creds.update → saveCreds + backup periódico
7. startBot()
```

### 5.2 Código Completo de `bot/app.js`

```javascript
import 'dotenv/config';
import admin from 'firebase-admin';
import express from 'express';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import sharp from 'sharp';

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

let client = null;
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
    if (!existsSync(AUTH_DIR)) return;
    const zipPath = resolve('./baileys-auth-temp.zip');
    try {
        const output = createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
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
        const { default: unzipper } = await import('unzipper');
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
    if (isInitializing) return;
    isInitializing = true;

    try {
        await restoreAuthFromFirebase();

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ['CIVCO Bot', 'Chrome', '']
        });

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
                client = sock;
                isConnected = true;
                isInitializing = false;
                await backupAuthToFirebase();
            }

            if (connection === 'close') {
                isConnected = false;
                client = null;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('❌ Sesión cerrada (LOGOUT). La sesión en Firebase se conserva.');
                    isInitializing = false;
                    setTimeout(startBot, 5000);
                } else {
                    console.log(`⚠️ Desconectado (código ${statusCode}). Reconectando en 5s...`);
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
                        await sock.sendMessage(from, { text: '⚠️ No se pudo identificar el préstamo.' });
                        continue;
                    }

                    sessions[from] = { loanId, step: 'waiting_photo' };
                    await sock.sendMessage(from, {
                        text: `Entendido. Por favor, envía una fotografía mostrando claramente el daño del equipo.\n\n_Préstamo: ${loanId}_`
                    });
                    continue;
                }

                if (messageType === 'imageMessage') {
                    const session = sessions[from];
                    if (!session || session.step !== 'waiting_photo') continue;

                    const loanId = session.loanId;
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

                        await db.collection('devoluciones').doc(loanId).set({ fotoSubida: true }, { merge: true });

                        delete sessions[from];
                        await sock.sendMessage(from, { text: '*¡Gracias!* La evidencia ha sido registrada.' });
                    } catch (error) {
                        console.error('❌ Error al procesar imagen:', error);
                        await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' });
                    }
                }
            }
        });

        setInterval(async () => {
            if (isConnected) {
                await backupAuthToFirebase();
            }
        }, 5 * 60 * 1000);

    } catch (e) {
        console.error('❌ Error al iniciar el bot:', e);
        isInitializing = false;
        setTimeout(startBot, 5000);
    }
}

startBot();
```

### 5.3 Diferencias Clave

| Aspecto | Código Anterior | Código Nuevo |
|---|---|---|
| Conexión | `new Client({ authStrategy: new RemoteAuth(...), puppeteer: {...} })` | `makeWASocket({ auth: state })` |
| QR | `client.on('qr', ...)` + `qrcode.generate()` | `connection.update` + `sock.requestPairingCode()` |
| Ready | `client.on('ready', ...)` | `connection === 'open'` |
| Desconexión | `client.on('disconnected', ...)` | `connection === 'close'` |
| Mensajes | `client.on('message_create', ...)` | `sock.ev.on('messages.upsert', ...)` |
| Descargar imagen | `message.downloadMedia()` → base64 | `downloadContentFromMessage()` → stream → Buffer |
| Enviar texto | `client.sendMessage(from, text)` | `sock.sendMessage(jid, { text })` |
| Sesión | `RemoteAuth` automático | `useMultiFileAuthState` + backup manual |
| Health check | `client?.info ? 'connected' : 'initializing'` | `isConnected ? 'connected' : 'initializing'` |

---

## 6. Flujo de Vinculación (Pairing Code)

En Render (sin terminal interactiva), el **Pairing Code** es más confiable que el QR:

1. El bot imprime en los logs: `🔑 Código de vinculación: XXXX-XXXX`
2. El usuario abre WhatsApp en su teléfono
3. Va a **Ajustes → Dispositivos vinculados → Vincular un dispositivo**
4. En lugar de escanear QR, selecciona **"Vincular con número de teléfono"**
5. Ingresa el número `+506 8771 6817` y el código de 8 dígitos
6. El bot se conecta automáticamente

---

## 7. Pruebas Locales (Windows)

```powershell
cd bot
npm install
node --check app.js
node app.js
```

Verificar en orden:
- `✅ Firebase Admin inicializado`
- `📱 CÓDIGO QR` o `🔑 Código de vinculación: XXXX-XXXX`
- Vincular en WhatsApp
- `🤖 ¡Bot de WhatsApp conectado y listo!`
- Enviar "Reportar Daño PR001" → respuesta del bot
- Enviar imagen → `*¡Gracias!* La evidencia ha sido registrada.`
- Confirmar en Firebase Console: `devoluciones/PR001.fotoSubida === true` y `damages/PR001/evidence.jpg` existe

---

## 8. Despliegue en Render

```powershell
git rm -r bot/install.mjs bot/.wwebjs_auth bot/.wwebjs_cache
rm -rf bot/.cache
git add bot/package.json bot/app.js render.yaml
git commit -m "Migrate whatsapp-web.js → @whiskeysockets/baileys (no browser, ~80MB RAM)"
git push
```

Monitorear logs de Render:
- Build: `npm install` (rápido, sin Chrome)
- Runtime: QR o pairing code → vincular → `🤖 ¡Bot conectado!`
- En despliegues subsecuentes: carga sesión desde Firebase automáticamente

---

## 9. Rollback

```powershell
git revert HEAD --no-edit
git push
```

Render redeployea con la versión anterior. Las sesiones de Baileys en Firebase Storage se mantienen (no interfieren con whatsapp-web.js porque usan paths distintos).
