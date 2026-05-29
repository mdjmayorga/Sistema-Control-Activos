/**
 * Seed PROD — Sistema Control Activos CIVCO/TEC
 *
 * Idempotente y seguro:
 *   - NO borra colecciones existentes (a diferencia de seed.ts dev).
 *   - Crea usuarios test solo si no existen en Auth.
 *   - Crea activos solo si no existen en Firestore.
 *   - Imprime contraseñas a stdout UNA sola vez. Guardalas en un gestor.
 *
 * Requisitos:
 *   - serviceAccountKey.json en raíz del repo (descargar de
 *     Firebase Console → Project Settings → Service accounts → Generate new private key).
 *   - NO commitear la key. Ya está cubierta por .gitignore (*.local) — verificar.
 *
 * Uso:
 *   tsx scripts/seed-prod.ts
 *
 * Para correr SOLO una sección:
 *   tsx scripts/seed-prod.ts users
 *   tsx scripts/seed-prod.ts activos
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { randomInt } from 'crypto';
import { createInterface } from 'readline';

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ─── Guard: emulator env vars NO deben estar definidas ──────────────────────

const EMU_VARS = [
  'FIRESTORE_EMULATOR_HOST',
  'FIREBASE_AUTH_EMULATOR_HOST',
  'FIREBASE_STORAGE_EMULATOR_HOST',
];

for (const v of EMU_VARS) {
  if (process.env[v]) {
    console.error(`ABORT — ${v} está seteado. Este script es para PROD.`);
    console.error('Usa scripts/seed.ts si quieres seedear el emulador.');
    process.exit(1);
  }
}

// ─── Service account ─────────────────────────────────────────────────────────

const keyPath = resolve(process.cwd(), 'serviceAccountKey.json');

if (!existsSync(keyPath)) {
  console.error(`ABORT — no se encontró ${keyPath}`);
  console.error(
    'Descargala de Firebase Console → Project Settings → Service accounts → Generate new private key.'
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

if (serviceAccount.project_id !== 'civco-a947d') {
  console.error(
    `ABORT — project_id de la key es "${serviceAccount.project_id}", esperaba "civco-a947d".`
  );
  process.exit(1);
}

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const auth = getAuth(app);

// ─── Generador de contraseñas fuertes ────────────────────────────────────────

function strongPassword(len = 18): string {
  // Sin caracteres ambiguos (0/O, 1/l/I).
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digit = '23456789';
  const symbol = '!@#$%^&*-_=+';
  const all = upper + lower + digit + symbol;

  // Garantiza al menos uno de cada categoría.
  const out: string[] = [
    upper[randomInt(upper.length)],
    lower[randomInt(lower.length)],
    digit[randomInt(digit.length)],
    symbol[randomInt(symbol.length)],
  ];

  while (out.length < len) {
    out.push(all[randomInt(all.length)]);
  }

  // Fisher–Yates shuffle.
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out.join('');
}

// ─── Confirmación interactiva ────────────────────────────────────────────────

function confirm(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase() === 'yes');
    });
  });
}

// ─── Definición de datos ─────────────────────────────────────────────────────

interface TestUser {
  email: string;
  displayName: string;
  fullName: string;
  studentId: string;
  role: 'admin' | 'user';
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin.test@itcr.ac.cr',
    displayName: 'Admin Test CIVCO',
    fullName: 'Admin Test CIVCO',
    studentId: 'N/A',
    role: 'admin',
  },
  {
    email: 'estudiante.test@estudiantec.cr',
    displayName: 'Estudiante Test',
    fullName: 'Estudiante Test',
    studentId: '2099000001',
    role: 'user',
  },
];

interface SeedActivo {
  id: string;
  name: string;
  serialNumber: string;
  status: 'available' | 'loaned' | 'damaged';
  description: string;
}

const ACTIVOS: SeedActivo[] = [
  {
    id: 'activo-001',
    name: 'Estacion Total Topcon ES-105',
    serialNumber: 'ET-2024-001',
    status: 'available',
    description: 'Estacion total con precision angular 5", alcance 500m sin prisma.',
  },
  {
    id: 'activo-002',
    name: 'Estacion Total Topcon ES-105',
    serialNumber: 'ET-2024-002',
    status: 'available',
    description: 'Estacion total con precision angular 5", alcance 500m sin prisma.',
  },
  {
    id: 'activo-003',
    name: 'Nivel Automatico Sokkia B40A',
    serialNumber: 'NA-2024-001',
    status: 'available',
    description: 'Nivel automatico, precision 1mm/km, aumento 24x.',
  },
  {
    id: 'activo-004',
    name: 'GPS Diferencial Trimble R2',
    serialNumber: 'GPS-2024-001',
    status: 'available',
    description: 'Receptor GNSS, precision centimetrica modo RTK.',
  },
  {
    id: 'activo-005',
    name: 'Prisma con Baston Topcon',
    serialNumber: 'PB-2024-001',
    status: 'available',
    description: 'Prisma circular, baston telescopico 2.5m.',
  },
];

// ─── Seeders ─────────────────────────────────────────────────────────────────

interface CreatedUser {
  email: string;
  uid: string;
  password: string | null;
  isNew: boolean;
}

async function seedUsers(): Promise<CreatedUser[]> {
  console.log('\n── Sembrando usuarios test ─────────────────────────────');
  const results: CreatedUser[] = [];

  for (const u of TEST_USERS) {
    let uid: string;
    let password: string | null = null;
    let isNew = false;

    try {
      const existing = await auth.getUserByEmail(u.email);
      uid = existing.uid;
      console.log(`  • ${u.email} → ya existe (uid=${uid}), skip Auth.`);
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') throw e;
      password = strongPassword(18);
      const created = await auth.createUser({
        email: u.email,
        password,
        displayName: u.displayName,
        emailVerified: true,
      });
      uid = created.uid;
      isNew = true;
      console.log(`  • ${u.email} → creado (uid=${uid}).`);
    }

    const userDocRef = db.collection('users').doc(uid);
    const snapshot = await userDocRef.get();

    if (snapshot.exists) {
      console.log(`    ↳ users/${uid} ya existe, skip Firestore.`);
    } else {
      await userDocRef.set({
        fullName: u.fullName,
        studentId: u.studentId,
        email: u.email,
        role: u.role,
        createdAt: Timestamp.now(),
      });
      console.log(`    ↳ users/${uid} creado (role=${u.role}).`);
    }

    results.push({ email: u.email, uid, password, isNew });
  }

  return results;
}

async function seedActivos(): Promise<void> {
  console.log('\n── Sembrando catalogo de activos ───────────────────────');
  let creados = 0;
  let omitidos = 0;

  for (const a of ACTIVOS) {
    const ref = db.collection('activos').doc(a.id);
    const snap = await ref.get();

    if (snap.exists) {
      omitidos++;
      continue;
    }

    const { id, ...data } = a;
    await ref.set({ ...data, createdAt: FieldValue.serverTimestamp() });
    creados++;
  }

  console.log(`  Activos creados: ${creados}, omitidos (ya existian): ${omitidos}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const target = (process.argv[2] || 'all').toLowerCase();
  const valid = ['all', 'users', 'activos'];

  if (!valid.includes(target)) {
    console.error(`Argumento invalido: "${target}". Usa: ${valid.join(' | ')}`);
    process.exit(1);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  SEED PROD — civco-a947d                                 ║');
  console.log(`║  Target: ${target.padEnd(48)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\nEste script escribe en la base de datos REAL del proyecto.');

  const ok = await confirm('\nEscribe "yes" para continuar: ');
  if (!ok) {
    console.log('Cancelado.');
    process.exit(0);
  }

  const created: CreatedUser[] = [];

  if (target === 'all' || target === 'users') {
    created.push(...(await seedUsers()));
  }

  if (target === 'all' || target === 'activos') {
    await seedActivos();
  }

  // ─── Reporte de credenciales (solo nuevas) ────────────────────────────────
  const nuevos = created.filter((u) => u.isNew && u.password);

  if (nuevos.length > 0) {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  CREDENCIALES — guardalas YA, no se mostraran de nuevo  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    for (const u of nuevos) {
      console.log(`  Email:    ${u.email}`);
      console.log(`  Password: ${u.password}`);
      console.log(`  UID:      ${u.uid}`);
      console.log('  ──────────────────────────────────────────────────────');
    }
    console.log(
      '\n⚠ Cambia las contraseñas tras el primer login si el usuario no es solo para pruebas.'
    );
  } else if (target === 'all' || target === 'users') {
    console.log('\nTodos los usuarios test ya existian. No se crearon credenciales nuevas.');
    console.log('Si perdiste contraseñas, usa el flujo "Olvide contraseña" o resetea desde Console.');
  }

  console.log('\nDone.\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\nSeed PROD fallo:', err);
  process.exit(1);
});
