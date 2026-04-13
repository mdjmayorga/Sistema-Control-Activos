/**
 * Seed de usuarios de prueba para el emulador de Firebase.
 *
 * Crea en Auth + Firestore:
 *   - prueba@estudiantec.cr  / 12345678  → role: 'user'
 *   - admin@itcr.ac.cr       / 12345678  → role: 'admin'
 *
 * Uso: node scripts/seed.js
 * Requiere: emuladores corriendo (npm run emulators)
 */

const AUTH_SIGNUP_URL =
  'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key';
const AUTH_SIGNIN_URL =
  'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-key';
const FIRESTORE_BASE =
  'http://localhost:8080/v1/projects/demo-civco/databases/(default)/documents/users';

const USERS = [
  {
    email: 'prueba@estudiantec.cr',
    password: '12345678',
    nombre: 'Usuario Prueba',
    carnet: '2024000001',
    role: 'user',
  },
  {
    email: 'admin@itcr.ac.cr',
    password: '12345678',
    nombre: 'Admin CIVCO',
    carnet: '2024000000',
    role: 'admin',
  },
];

async function createAuthUser(email, password) {
  const res = await fetch(AUTH_SIGNUP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Auth signup error para ${email}: ${err.error?.message}`);
  }

  const data = await res.json();
  return data.localId; // UID
}

async function signIn(email, password) {
  const res = await fetch(AUTH_SIGNIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Auth signin error para ${email}: ${err.error?.message}`);
  }

  const data = await res.json();
  return data.idToken;
}

async function createFirestoreUser(uid, idToken, { email, nombre, carnet, role }) {
  const url = `${FIRESTORE_BASE}/${uid}`;
  const body = {
    fields: {
      uid:       { stringValue: uid },
      email:     { stringValue: email },
      nombre:    { stringValue: nombre },
      carnet:    { stringValue: carnet },
      role:      { stringValue: role },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Firestore error para ${email}: ${JSON.stringify(err)}`);
  }
}

async function main() {
  console.log('Creando usuarios de prueba...\n');

  for (const user of USERS) {
    try {
      const uid = await createAuthUser(user.email, user.password);
      const idToken = await signIn(user.email, user.password);
      await createFirestoreUser(uid, idToken, user);
      console.log(`✓ ${user.email}  (uid: ${uid})  rol: ${user.role}`);
    } catch (err) {
      console.error(`✗ ${err.message}`);
    }
  }

  console.log('\nListo. http://127.0.0.1:4000.');
}

main();
