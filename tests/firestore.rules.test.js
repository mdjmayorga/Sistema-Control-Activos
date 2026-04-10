const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');
const path = require('path');

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-civco',
    firestore: {
      rules: readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

// ─── helpers (lazy — usan testEnv ya inicializado) ─────────────────────────

const db = (email) =>
  testEnv.authenticatedContext('uid-test', { email, email_verified: true }).firestore();

const dbNoAuth = () => testEnv.unauthenticatedContext().firestore();

// ─── /users/{userId} ───────────────────────────────────────────────────────

describe('AU003 — colección /users', () => {

  test('usuario @estudiantec.cr puede crear su propio documento', async () => {
    await assertSucceeds(db('fulano@estudiantec.cr').collection('users').doc('uid-test').set({ nombre: 'Fulano' }));
  });

  test('usuario @itcr.ac.cr puede crear su propio documento', async () => {
    await assertSucceeds(db('profe@itcr.ac.cr').collection('users').doc('uid-test').set({ nombre: 'Profe' }));
  });

  test('usuario @gmail.com NO puede crear documento', async () => {
    await assertFails(db('hacker@gmail.com').collection('users').doc('uid-test').set({ nombre: 'Hacker' }));
  });

  test('usuario no autenticado NO puede leer', async () => {
    await assertFails(dbNoAuth().collection('users').doc('uid-test').get());
  });

  test('usuario NO puede leer el documento de otro usuario', async () => {
    await assertFails(db('fulano@estudiantec.cr').collection('users').doc('otro-uid').get());
  });

  test('usuario NO puede eliminar su propio documento', async () => {
    await assertFails(db('fulano@estudiantec.cr').collection('users').doc('uid-test').delete());
  });
});

// ─── /prestamos ────────────────────────────────────────────────────────────

describe('AU003 — colección /prestamos', () => {

  test('usuario @estudiantec.cr puede crear un préstamo', async () => {
    await assertSucceeds(db('fulano@estudiantec.cr').collection('prestamos').add({ activo: 'Teodolito' }));
  });

  test('usuario @itcr.ac.cr puede leer préstamos', async () => {
    await assertSucceeds(db('profe@itcr.ac.cr').collection('prestamos').get());
  });

  test('usuario @gmail.com NO puede leer préstamos', async () => {
    await assertFails(db('hacker@gmail.com').collection('prestamos').get());
  });

  test('usuario NO puede eliminar un préstamo', async () => {
    await assertFails(db('fulano@estudiantec.cr').collection('prestamos').doc('p1').delete());
  });
});

// ─── /activos ──────────────────────────────────────────────────────────────

describe('AU003 — colección /activos', () => {

  test('usuario @estudiantec.cr puede leer activos', async () => {
    await assertSucceeds(db('fulano@estudiantec.cr').collection('activos').get());
  });

  test('usuario @estudiantec.cr NO puede escribir activos', async () => {
    await assertFails(db('fulano@estudiantec.cr').collection('activos').add({ nombre: 'GPS' }));
  });

  test('usuario @gmail.com NO puede leer activos', async () => {
    await assertFails(db('hacker@gmail.com').collection('activos').get());
  });
});
