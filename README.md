# Sistema de Control de Activos - CIVCO

Sistema web para la gestión de préstamos de equipos topográficos del Centro de Investigaciones en Vivienda y Construcción (CIVCO), Instituto Tecnológico de Costa Rica.

**Stack:** Angular · TypeScript · Firebase (Auth + Firestore) · Angular Fire

---

## Requisitos previos

- Node.js 18+
- Java 21+ (requerido por el emulador de Firebase)
- Firebase CLI: `npm install -g firebase-tools`

---

## Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase (solo para producción)

Edita `src/app/firebase.config.ts` con los datos reales de tu proyecto Firebase:

```ts
export const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  ...
};
```

En desarrollo los emuladores usan el proyecto `demo-civco` y no necesitan credenciales reales.

---

## Desarrollo local

Para correr el proyecto localmente se necesitan **tres terminales**:

### Terminal 1 — Emuladores de Firebase

```bash
npm run emulators
```

Levanta Auth (puerto 9099) y Firestore (puerto 8080) localmente.
UI del emulador disponible en http://127.0.0.1:4000

### Terminal 2 — Usuario de prueba

Espera a que los emuladores estén listos y luego ejecuta:

```bash
npm run seed
```

Acá se crean los usuarios de prueba, se borran al reiniciar la terminal

### Terminal 3 — Angular

```bash
npm start
```

Abre http://localhost:4200 en el navegador.

---

## Tests

### Reglas de Firestore (AU003)

Prueba las reglas de seguridad de Firestore contra el emulador:

```bash
npm run test:rules
```

Este comando levanta el emulador de Firestore automáticamente, corre los 13 tests y lo apaga. No requiere tener los emuladores corriendo de antemano.

---

## Puertos utilizados

| Servicio            | Puerto |
|---------------------|--------|
| Angular Dev Server  | 4200   |
| Emulador Auth       | 9099   |
| Emulador Firestore  | 8080   |
| Emulator UI         | 4000   |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   └── services/          # AuthService
│   ├── features/
│   │   └── auth/
│   │       └── login/         # Componente de login (AU003, AU005)
│   └── shared/
│       └── validators/        # institutionalEmailValidator (AU003)
├── environments/
│   ├── environment.ts         # Dev — conecta a emuladores
│   └── environment.prod.ts    # Prod — conecta a Firebase real
firestore.rules                # Reglas de seguridad Firestore (AU003)
tests/
└── firestore.rules.test.js    # Tests de las reglas
```
