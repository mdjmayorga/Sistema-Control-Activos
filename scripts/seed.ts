/**
 * Firestore Emulator Seed Script
 *
 * Seeds the Firestore emulator with sample data for local development.
 * Run with: npm run seed (emulators must be running first)
 *
 * Collections:
 *   - users:     User profiles with roles (admin/user)
 *   - activos:   Topographic equipment catalog
 *   - prestamos: Loan records linking users to assets
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8081';
process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';

const app = initializeApp({ projectId: 'civco-a947d' });
const db = getFirestore(app);
const auth = getAuth(app);

// ─── Seed Data ───────────────────────────────────────────────────────────────

interface SeedUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  firestoreData: {
    fullName: string;
    studentId: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: Timestamp;
  };
}

const users: SeedUser[] = [
  {
    uid: 'admin-001',
    email: 'jccoto@itcr.ac.cr',
    password: 'Admin123!',
    displayName: 'Juan Carlos Coto',
    firestoreData: {
      fullName: 'Juan Carlos Coto',
      studentId: 'N/A',
      email: 'jccoto@itcr.ac.cr',
      role: 'admin',
      createdAt: Timestamp.now(),
    },
  },
  {
    uid: 'user-001',
    email: 'estudiante1@estudiantec.cr',
    password: 'User123!',
    displayName: 'Maria Lopez',
    firestoreData: {
      fullName: 'Maria Lopez',
      studentId: '2021456789',
      email: 'estudiante1@estudiantec.cr',
      role: 'user',
      createdAt: Timestamp.now(),
    },
  },
  {
    uid: 'user-002',
    email: 'estudiante2@estudiantec.cr',
    password: 'User123!',
    displayName: 'Carlos Ramirez',
    firestoreData: {
      fullName: 'Carlos Ramirez',
      studentId: '2022123456',
      email: 'estudiante2@estudiantec.cr',
      role: 'user',
      createdAt: Timestamp.now(),
    },
  },
  {
    uid: 'user-003',
    email: 'docente1@itcr.ac.cr',
    password: 'User123!',
    displayName: 'Ana Martinez',
    firestoreData: {
      fullName: 'Ana Martinez',
      studentId: 'N/A',
      email: 'docente1@itcr.ac.cr',
      role: 'user',
      createdAt: Timestamp.now(),
    },
  },
];

interface SeedActivo {
  id: string;
  name: string;
  serialNumber: string;
  status: 'available' | 'loaned' | 'damaged';
  description: string;
}

const activos: SeedActivo[] = [
  {
    id: 'activo-001',
    name: 'Estacion Total Topcon ES-105',
    serialNumber: 'ET-2024-001',
    status: 'available',
    description: 'Estacion total con precision angular de 5 segundos, alcance de 500m sin prisma.',
  },
  {
    id: 'activo-002',
    name: 'Estacion Total Topcon ES-105',
    serialNumber: 'ET-2024-002',
    status: 'loaned',
    description: 'Estacion total con precision angular de 5 segundos, alcance de 500m sin prisma.',
  },
  {
    id: 'activo-003',
    name: 'Nivel Automatico Sokkia B40A',
    serialNumber: 'NA-2024-001',
    status: 'available',
    description: 'Nivel automatico con precision de 1mm por km, aumento de 24x.',
  },
  {
    id: 'activo-004',
    name: 'GPS Diferencial Trimble R2',
    serialNumber: 'GPS-2024-001',
    status: 'available',
    description: 'Receptor GNSS con precision centimetrica en modo RTK.',
  },
  {
    id: 'activo-005',
    name: 'Prisma con Baston Topcon',
    serialNumber: 'PB-2024-001',
    status: 'available',
    description: 'Prisma circular con baston telescopico de 2.5m.',
  },
];

interface SeedPrestamo {
  id: string;
  userId: string;
  assetId: string;
  group: string;
  crew: string;
  reason: string;
  status: 'active' | 'returned';
  loanDate: Timestamp;
  returnDate: Timestamp | null;
  damageReported: boolean;
  createdAt: Timestamp;
}

const twoDaysAgo = Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
const fiveDaysAgo = Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
const tenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000));

const prestamos: SeedPrestamo[] = [
  {
    id: 'prestamo-001',
    userId: 'user-001',
    assetId: 'activo-002',
    group: 'Grupo 3',
    crew: 'Cuadrilla A',
    reason: 'Practica de levantamiento topografico - Curso CI-3201',
    status: 'active',
    loanDate: twoDaysAgo,
    returnDate: null,
    damageReported: false,
    createdAt: twoDaysAgo,
  },
  {
    id: 'prestamo-002',
    userId: 'user-001',
    assetId: 'activo-006',
    group: 'Grupo 3',
    crew: 'Cuadrilla A',
    reason: 'Practica de levantamiento topografico - Curso CI-3201',
    status: 'active',
    loanDate: twoDaysAgo,
    returnDate: null,
    damageReported: false,
    createdAt: twoDaysAgo,
  },
  {
    id: 'prestamo-003',
    userId: 'user-002',
    assetId: 'activo-009',
    group: 'Grupo 1',
    crew: 'Cuadrilla B',
    reason: 'Trabajo Final de Graduacion - Levantamiento catastral',
    status: 'active',
    loanDate: fiveDaysAgo,
    returnDate: null,
    damageReported: false,
    createdAt: fiveDaysAgo,
  },
  {
    id: 'prestamo-004',
    userId: 'user-003',
    assetId: 'activo-010',
    group: 'Docencia',
    crew: 'N/A',
    reason: 'Demostracion en clase de Topografia II',
    status: 'returned',
    loanDate: tenDaysAgo,
    returnDate: fiveDaysAgo,
    damageReported: true,
    createdAt: tenDaysAgo,
  },
];

// ─── Seed Functions ──────────────────────────────────────────────────────────

async function clearCollections() {
  const collections = ['users', 'activos', 'prestamos'];
  for (const name of collections) {
    const snapshot = await db.collection(name).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  console.log('  Cleared existing collections');
}

async function seedUsers() {
  for (const user of users) {
    try {
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true,
      });
    } catch (e: any) {
      if (e.code === 'auth/uid-already-exists') {
        await auth.deleteUser(user.uid);
        await auth.createUser({
          uid: user.uid,
          email: user.email,
          password: user.password,
          displayName: user.displayName,
          emailVerified: true,
        });
      }
    }

    await db.collection('users').doc(user.uid).set(user.firestoreData);
  }
  console.log(`  Seeded ${users.length} users (Auth + Firestore)`);
}

async function seedActivos() {
  for (const activo of activos) {
    const { id, ...data } = activo;
    await db.collection('activos').doc(id).set(data);
  }
  console.log(`  Seeded ${activos.length} activos`);
}

async function seedPrestamos() {
  for (const prestamo of prestamos) {
    const { id, ...data } = prestamo;
    await db.collection('prestamos').doc(id).set(data);
  }
  console.log(`  Seeded ${prestamos.length} prestamos`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nSeeding Firestore emulator...\n');

  await clearCollections();
  await seedUsers();
  await seedActivos();
  await seedPrestamos();

  console.log('\nDone! Emulator data is ready.\n');
  console.log('Test credentials:');
  console.log('  Admin:  jccoto@itcr.ac.cr / Admin123!');
  console.log('  User 1: estudiante1@estudiantec.cr / User123!');
  console.log('  User 2: estudiante2@estudiantec.cr / User123!');
  console.log('  User 3: docente1@itcr.ac.cr / User123!\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
