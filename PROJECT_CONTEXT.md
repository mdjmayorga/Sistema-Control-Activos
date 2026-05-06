# PROJECT CONTEXT — Sistema de Control de Activos (CIVCO)

> This document contains the complete technical context of the project. It is designed to be passed to another AI chat session or developer so they can fully understand the architecture, codebase, data models, services, components, and configuration without needing access to the source code.

---

## 1. PROJECT OVERVIEW

**Name:** Sistema de Control de Activos  
**Organization:** Centro de Investigaciones en Vivienda y Construccion (CIVCO) — Instituto Tecnologico de Costa Rica (ITCR)  
**Purpose:** Web application for managing topographic equipment loans at CIVCO. Students and staff from ITCR can request equipment loans, track active loans, return equipment, and report damage.  
**Language:** The UI is in Spanish. Code identifiers are a mix of English and Spanish (ongoing migration to English).  
**Firebase Project ID:** `civco-a947d`

---

## 2. TECH STACK

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | Angular (standalone components) | 20.3.0 |
| Language | TypeScript (strict mode) | 5.9.2 |
| Backend/BaaS | Firebase (Auth + Firestore) | 11.10.0 |
| Firebase Angular SDK | @angular/fire | 20.0.1 |
| Cloud Functions | firebase-functions (v2) | 7.0.0 |
| Cloud Functions Admin | firebase-admin | 13.6.0 (functions) / 13.7.0 (seed) |
| Forms | Angular Reactive Forms | (part of @angular/forms) |
| State Management | Angular Signals | (built-in Angular 20) |
| CSS | CSS custom properties (dark theme), component-scoped CSS | N/A |
| Font | Google Fonts — Roboto | 300, 400, 500, 700 |
| Testing (rules) | @firebase/rules-unit-testing | N/A |
| Testing (unit) | Jasmine + Karma | jasmine 5.9, karma 6.4 |
| Seed runner | tsx | 4.21.0 |
| Package manager | npm | >=8.0.0 |
| Node.js | Required | ^20.19.0, ^22.12.0, or >=24.0.0 |
| Java JDK | Required for Firestore emulator | >=11 |

---

## 3. PROJECT STRUCTURE

```
Sistema-Control-Activos/
├── src/
│   ├── main.ts                          # Bootstrap: bootstrapApplication(App, appConfig)
│   ├── index.html                       # Single page shell, lang="es"
│   ├── styles.css                       # Global dark theme CSS variables + resets
│   ├── environments/
│   │   ├── environment.ts               # Dev: { production: false, useEmulators: true }
│   │   └── environment.prod.ts          # Prod: { production: true, useEmulators: false }
│   └── app/
│       ├── app.ts                       # Root component (just <router-outlet>)
│       ├── app.html                     # Root template
│       ├── app.css                      # Root styles (minimal)
│       ├── app.routes.ts                # All routes (lazy-loaded public, guarded private)
│       ├── app.config.ts                # Providers: router, Firebase, Firestore, Auth + emulator connections
│       ├── firebase.config.ts           # FirebaseOptions with projectId civco-a947d
│       │
│       ├── core/                        # App-wide singletons (no visual components)
│       │   ├── guards/
│       │   │   ├── auth.guard.ts        # Redirects unauthenticated users to /login
│       │   │   └── admin.guard.ts       # Redirects non-admin users to /unauthorized
│       │   ├── models/
│       │   │   ├── user.model.ts        # UserProfile interface + UserRole type
│       │   │   └── loan.model.ts        # Loan interface
│       │   └── services/
│       │       └── auth.service.ts      # Core AuthService: login, register, logout, getUserRole, currentUser$
│       │
│       ├── shared/                      # Reusable components, validators
│       │   ├── validators/
│       │   │   ├── institutional-email.validator.ts  # Validates @estudiantec.cr / @itcr.ac.cr domains
│       │   │   └── password-match.validator.ts       # Cross-field password === confirmPassword
│       │   └── components/
│       │       ├── confirm-modal/       # Generic confirmation modal (signal-based inputs/outputs)
│       │       ├── loan-item/           # Single loan card with optional return button + modal
│       │       ├── loans-list/          # List of loan items with event delegation
│       │       └── settings-item/       # Settings list item
│       │
│       ├── features/                    # Feature modules (lazy-loaded or eagerly loaded by route)
│       │   ├── auth/
│       │   │   ├── login/              # Login page (lazy-loaded at /login)
│       │   │   ├── register/           # Registration page (lazy-loaded at /register)
│       │   │   ├── unauthorized/       # Unauthorized access page (lazy-loaded at /unauthorized)
│       │   │   └── services/
│       │   │       └── auth.service.ts # Feature-local AuthService for registration (creates Auth user + Firestore doc)
│       │   ├── dashboard/
│       │   │   └── components/user-dashboard/  # "Mis prestamos" — user's active loans
│       │   ├── loans/
│       │   │   ├── components/
│       │   │   │   ├── loan-request/   # Loan request form
│       │   │   │   └── active-loans/   # Admin: all active loans view
│       │   │   └── services/
│       │   │       └── loan.service.ts # Firestore CRUD for prestamos + devoluciones
│       │   ├── returns/
│       │   │   └── components/
│       │   │       ├── return-button/  # Button to trigger return flow
│       │   │       └── return-modal/   # Modal with damage confirmation checkbox
│       │   ├── history/
│       │   │   └── components/
│       │   │       ├── historial-page/          # Admin: full history
│       │   │       └── historial-page-usuario/  # User: personal loan history
│       │   ├── settings/
│       │   │   └── components/
│       │   │       ├── configuraciones-page/          # Admin settings
│       │   │       └── configuraciones-page-usuario/  # User settings
│       │   ├── admin/
│       │   │   └── dashboard/          # Admin dashboard
│       │   └── user/
│       │       └── dashboard/          # User-specific dashboard variant
│       │
│       └── layout/                     # Layout wrapper components
│           └── components/
│               ├── authenticated-layout/  # Wraps authenticated routes (has navbar + router-outlet)
│               ├── navbar/               # Side navigation bar, role-aware (user vs admin)
│               └── page-layout/          # Reusable page content wrapper
│
├── functions/                          # Firebase Cloud Functions (TypeScript)
│   ├── src/
│   │   ├── index.ts                    # notificarDanoActivo — triggered on devoluciones/{id} write
│   │   └── emailTemplate.ts           # HTML email template for damage notifications
│   └── package.json                    # Node 24, firebase-functions v7, firebase-admin v13
│
├── scripts/
│   └── seed.ts                         # Seeds emulator with users, activos, prestamos
│
├── tests/
│   └── firestore.rules.test.js         # 13 security rule tests using @firebase/rules-unit-testing
│
├── firebase.json                       # Firestore rules, functions config, emulator ports
├── firestore.rules                     # Security rules (AU003/AU004)
├── firestore.indexes.json              # (empty — no custom indexes yet)
├── .firebaserc                         # Project alias: default -> civco-a947d
├── angular.json                        # Angular CLI config, build budgets, file replacements
├── tsconfig.json                       # Strict TS config, ES2022 target
├── package.json                        # Root dependencies and scripts
├── DEV_SETUP.md                        # Developer onboarding guide (Spanish)
├── PROJECT-STRUCTURE.md                # Directory structure documentation
└── README.md                           # Quick-start readme
```

---

## 4. ROUTING ARCHITECTURE

All routes are defined in `src/app/app.routes.ts`:

```
/ ──────────────────> redirects to /login

PUBLIC ROUTES (no guard):
  /login              → LoginComponent (lazy-loaded)
  /register           → RegisterComponent (lazy-loaded)
  /unauthorized       → UnauthorizedComponent (lazy-loaded)

AUTHENTICATED USER ROUTES (authGuard):
  /usuario            → AuthenticatedLayout wrapper
    /usuario/solicitar-prestamo  → LoanRequestComponent
    /usuario/mis-prestamos       → UserDashboardComponent
    /usuario/mi-historial        → HistorialPageUsuario
    /usuario/configuraciones     → ConfiguracionesPageUsuario

ADMIN ROUTES (authGuard + adminGuard):
  /admin              → AuthenticatedLayout wrapper
    /admin/solicitar-prestamo    → LoanRequestComponent
    /admin/mis-prestamos         → UserDashboardComponent
    /admin/prestamos-activos     → ActiveLoansPage
    /admin/mi-historial          → HistorialPageUsuario
    /admin/historial             → HistorialPage (all users)
    /admin/configuraciones       → ConfiguracionesPage

/** (wildcard)  → redirects to /login
```

**Guards:**
- `authGuard` — Checks Firebase Auth state. Redirects to `/login` if not authenticated.
- `adminGuard` — Checks if authenticated user has `role === 'admin'` in Firestore `users` collection. Redirects to `/unauthorized` if not admin.

**Lazy Loading:** Login, Register, and Unauthorized are lazy-loaded via `loadComponent()`. Authenticated routes use eagerly imported components within the `AuthenticatedLayout` parent.

---

## 5. FIREBASE CONFIGURATION

### 5.1 App Config (`app.config.ts`)

Provides Firebase services to the Angular DI system:
- `provideFirebaseApp()` — Initializes Firebase with the config from `firebase.config.ts`
- `provideFirestore()` — Gets Firestore instance; in dev mode (`isDevMode()`), connects to emulator at `localhost:8081`
- `provideAuth()` — Gets Auth instance; in dev mode, connects to emulator at `http://localhost:9099`

### 5.2 Firebase Config (`firebase.config.ts`)

```typescript
export const firebaseConfig: FirebaseOptions = {
  apiKey: 'YOUR_API_KEY',             // Placeholder — only needed for production
  authDomain: 'civco-a947d.firebaseapp.com',
  projectId: 'civco-a947d',
  storageBucket: 'civco-a947d.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

In local development, the emulators don't require real API keys. The `projectId` must match across `.firebaserc`, `firebase.config.ts`, and `seed.ts`.

### 5.3 Emulator Ports (`firebase.json`)

| Service | Port |
|---|---|
| Firebase Auth Emulator | 9099 |
| Firestore Emulator | 8081 |
| Emulator UI | 4000 |

### 5.4 Environment Files

- `environment.ts` (dev): `{ production: false, useEmulators: true }`
- `environment.prod.ts` (prod): `{ production: true, useEmulators: false }`

Angular uses `fileReplacements` in `angular.json` to swap the dev environment with prod at build time.

---

## 6. FIRESTORE DATA MODELS

### 6.1 `users` Collection

Stores user profile data. The document ID matches the Firebase Auth UID.

| Field | Type | Description |
|---|---|---|
| `fullName` | string | Full name |
| `studentId` | string | Student ID (10 digits) or "N/A" for staff |
| `email` | string | Institutional email (@estudiantec.cr or @itcr.ac.cr) |
| `role` | string | `'admin'` or `'user'` |
| `createdAt` | Timestamp | Server timestamp at registration |

**TypeScript Interface (`core/models/user.model.ts`):**
```typescript
export type UserRole = 'admin' | 'user';
export interface UserProfile {
  fullName: string;
  studentId: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}
```

### 6.2 `prestamos` (Loans) Collection

| Field | Type | Description |
|---|---|---|
| `grupoTopografia` | string | Topography course group |
| `cuadrilla` | string | Assigned crew |
| `razonPrestamo` | string | Reason for the loan |
| `activo` | string | Asset name |
| `numeroSerie` | string? | Asset serial number (optional) |
| `estado` | string | `'activo'` or `'devuelto'` |
| `fechaPrestamo` | string (ISO) | Loan date |
| `fechaDevolucion` | string/null | Return date (null if active) |
| `usuarioId` | string | Firebase Auth UID of the borrower |
| `usuarioNombre` | string | Display name of the borrower |

**TypeScript Interface (`core/models/loan.model.ts`):**
```typescript
export interface Loan {
  id?: string;
  grupoTopografia: string;
  cuadrilla: string;
  razonPrestamo: string;
  activo: string;
  numeroSerie?: string;
  estado: 'activo' | 'devuelto';
  fechaPrestamo: string;
  fechaDevolucion?: string | null;
  usuarioId: string;
  usuarioNombre: string;
}
```

### 6.3 `activos` (Assets) Collection

Managed via Admin SDK only (seed script). No client-side write access.

| Field | Type | Description |
|---|---|---|
| `name` | string | Equipment name |
| `serialNumber` | string | Unique serial number |
| `status` | string | `'available'`, `'loaned'`, or `'damaged'` |
| `description` | string | Technical description |

### 6.4 `devoluciones` (Returns) Collection

Created when a loan is returned. Document ID matches the prestamo ID.

| Field | Type | Description |
|---|---|---|
| `prestamoId` | string | ID of the related loan |
| `danoConfirmado` | boolean | Whether damage was reported |
| `nombreEstudiante` | string | Borrower's name |
| `nombreActivo` | string | Asset name |
| `fechaDevolucion` | string (ISO) | Return date |
| `updatedAt` | string (ISO) | Last update timestamp |

### 6.5 `mail` Collection

Used by Cloud Functions to queue emails (for use with Firebase Extensions like "Trigger Email").

| Field | Type | Description |
|---|---|---|
| `to` | string | Recipient email |
| `message.subject` | string | Email subject |
| `message.html` | string | HTML email body |

---

## 7. FIRESTORE SECURITY RULES

Located in `firestore.rules`. Key rules:

- **Authentication check:** `request.auth != null`
- **Institutional email validation (AU003):** Only `@estudiantec.cr` and `@itcr.ac.cr` domains allowed
- **Admin role check (AU004):** Reads the `users/{uid}` document to verify `role == 'admin'`
- **Users collection:** Owner can read/create/update own doc; admin can read/update any; delete is always denied
- **Prestamos collection:** Currently has **temporary permissive rules** for emulator development (`allow read/create/update: if true`)
- **Devoluciones collection:** Same temporary permissive rules for development
- **Activos collection:** Read-only for authenticated institutional users; writes blocked (managed via Admin SDK)

---

## 8. SERVICES

### 8.1 Core AuthService (`core/services/auth.service.ts`)

Singleton service (`providedIn: 'root'`) used across the app.

**Key methods:**
- `login(email, password)` — Signs in via Firebase Auth
- `register(email, password)` — Creates Firebase Auth account (basic, without Firestore profile)
- `logout()` — Signs out
- `getUserRole(uid)` — Reads Firestore `users/{uid}` to get the user's role
- `getCurrentUser()` — Returns current Firebase Auth user (synchronous)
- `getUserDisplayName(uid, displayName, email)` — Gets display name from Firestore profile, falling back to Auth displayName then email
- `currentUser$` — Observable of the current Firebase Auth user state

### 8.2 Feature AuthService (`features/auth/services/auth.service.ts`)

Used specifically by the register component. **Different from the core AuthService.**

**Key method:**
- `register(payload: RegisterPayload)` — Creates Firebase Auth user, updates their `displayName`, then creates a Firestore `users/{uid}` document with `UserProfile` data (fullName, studentId, email, role: 'user', createdAt: serverTimestamp)

**RegisterPayload interface:**
```typescript
interface RegisterPayload {
  fullName: string;
  studentId: string;
  email: string;
  password: string;
}
```

### 8.3 LoanService (`features/loans/services/loan.service.ts`)

**Key methods:**
- `crearPrestamo(prestamo: Loan)` — Adds a new loan document to `prestamos` collection
- `obtenerPrestamosActivos()` — Returns Observable of all loans where `estado == 'activo'`
- `obtenerPrestamosActivosByID(usuarioId)` — Returns Observable of active loans for a specific user
- `marcarPrestamoComoDevuelto(prestamoId, productoDanado)` — Creates a `devoluciones` document, then updates the `prestamos` document status to `'devuelto'`

---

## 9. COMPONENTS IN DETAIL

### 9.1 LoginComponent (`features/auth/login/`)

- **Route:** `/login` (lazy-loaded)
- **Form:** Reactive form with `email` (required, email format, institutional domain validator) and `password` (required)
- **Behavior:** On submit, calls `authService.login()`, then `getUserRole()`, then navigates to `/admin` or `/usuario` based on role
- **Error handling:** Maps Firebase error codes to Spanish messages
- **UI:** Dark-themed card layout, blue accent button, error banner with SVG icon, spinner during loading
- **Signals:** `loading`, `errorMessage`

### 9.2 RegisterComponent (`features/auth/register/`)

- **Route:** `/register` (lazy-loaded)
- **Form:** `FormBuilder.nonNullable.group()` with fields: `fullName`, `emailUser`, `emailDomain` (dropdown), `studentId` (conditional), `password`, `confirmPassword`, `acceptTerms`
- **Cross-field validator:** `passwordMatchValidator` — ensures password and confirmPassword match
- **Conditional field:** When `emailDomain === '@itcr.ac.cr'` (staff), the `studentId` field is hidden and its validators are cleared. When `@estudiantec.cr` is selected, `studentId` is required with 10-digit pattern.
- **Email composite:** Username text input + domain dropdown (`@estudiantec.cr` or `@itcr.ac.cr`). Full email is constructed as `${emailUser}${emailDomain}` on submit.
- **Terms modal:** Placeholder terms & conditions displayed in a modal overlay
- **Signals:** `isSubmitting`, `errorMessage`, `showPassword`, `showConfirmPassword`, `showTermsModal`, `isStaffEmail`
- **Important:** `isStaffEmail` is a `signal(false)` updated via `valueChanges.subscribe()` on `emailDomain` control — NOT a `computed()`, because `computed()` does not track reactive form value changes.

### 9.3 AuthenticatedLayout (`layout/components/authenticated-layout/`)

Wrapper component for all authenticated routes. Contains the `Navbar` component and a `<router-outlet>`.

### 9.4 Navbar (`layout/components/navbar/`)

- Reads current Firebase Auth user via `authService.currentUser$`
- Loads display name from Firestore `users/{uid}` profile
- Determines role from current URL (starts with `/admin` = admin, else user)
- Uses signals: `userRole`, `sessionUsername`, `isAdmin`, `displayUsername`
- Shows different navigation links based on role

### 9.5 LoanRequestComponent (`features/loans/components/loan-request/`)

- Form fields: `grupoTopografia`, `cuadrilla`, `razonPrestamo`, `activo`, `numeroSerie` (optional)
- On submit, opens a confirmation modal. On confirm, creates the loan in Firestore with the current user's info, then navigates to "Mis prestamos".

### 9.6 UserDashboardComponent ("Mis Prestamos") (`features/dashboard/components/user-dashboard/`)

- Loads active loans for the current user via `loanService.obtenerPrestamosActivosByID()`
- Displays a `LoansList` component with return buttons
- On return, calls `loanService.marcarPrestamoComoDevuelto()` and removes the loan from the local array

### 9.7 ActiveLoansPage (Admin) (`features/loans/components/active-loans/`)

- Loads ALL active loans via `loanService.obtenerPrestamosActivos()`
- Sorted by `fechaPrestamo` descending

### 9.8 Shared Components

- **LoansList:** Renders a list of `LoanItem` components. Delegates `devolver` events up.
- **LoanItem:** Displays a single loan card. Has optional return button that opens a `ReturnModal`.
- **ReturnModal:** Modal with damage confirmation checkbox. Emits `confirmar` event with `{ productoDanado: boolean }`.
- **ConfirmModal:** Generic modal with signal-based inputs (`abierto`, `titulo`, `mensaje`, `cargando`, `deshabilitado`) and outputs (`cerrar`, `confirmar`).
- **PageLayout:** Reusable page content wrapper component.

---

## 10. VALIDATORS

### 10.1 Institutional Email Validator (`shared/validators/institutional-email.validator.ts`)

Factory function pattern: `institutionalEmailValidator(): ValidatorFn`

- Exports `INSTITUTIONAL_DOMAINS = ['estudiantec.cr', 'itcr.ac.cr']`
- Extracts domain from email, checks if it matches an allowed domain
- Returns `{ institutionalEmail: { domain } }` error or `null`

### 10.2 Password Match Validator (`shared/validators/password-match.validator.ts`)

Cross-field validator applied at the group level:
- Compares `password` and `confirmPassword` controls
- Returns `{ passwordMismatch: true }` or `null`

---

## 11. CLOUD FUNCTIONS

### 11.1 `notificarDanoActivo` (`functions/src/index.ts`)

- **Trigger:** `onDocumentWritten("devoluciones/{devolucionId}")`
- **Logic:** When a `devoluciones` document is written and `danoConfirmado` changes from `false` to `true`, it creates a notification email in the `mail` collection
- **Email recipient:** `jccoto@itcr.ac.cr` (hardcoded admin email)
- **Email template:** Rich HTML email with TEC/CIVCO branding, asset name, and student name (`functions/src/emailTemplate.ts`)
- **Emulator mode:** In emulator, logs the email payload to console instead of sending

---

## 12. SEED SCRIPT (`scripts/seed.ts`)

Run with `npm run seed` (requires emulators running).

**Process:** Clears all collections → Seeds users (Auth + Firestore) → Seeds activos → Seeds prestamos

**Seed Data:**

| User | Email | Password | Role |
|---|---|---|---|
| Juan Carlos Coto | jccoto@itcr.ac.cr | Admin123! | admin |
| Maria Lopez | estudiante1@estudiantec.cr | User123! | user |
| Carlos Ramirez | estudiante2@estudiantec.cr | User123! | user |
| Ana Martinez | docente1@itcr.ac.cr | User123! | user |

- 5 assets (topographic equipment: total stations, automatic level, differential GPS, prism)
- 4 loans (3 active, 1 returned with damage report)

The script is **idempotent** — deletes existing data before re-creating.

Connects to emulators at:
- `FIRESTORE_EMULATOR_HOST=localhost:8081`
- `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`

---

## 13. SECURITY RULES TESTS (`tests/firestore.rules.test.js`)

13 tests using `@firebase/rules-unit-testing`:

**Users collection:**
1. @estudiantec.cr can create own document
2. @itcr.ac.cr can create own document
3. @gmail.com cannot create document
4. Unauthenticated cannot read
5. User cannot read another user's document
6. User cannot delete own document

**Prestamos collection:**
7. @estudiantec.cr can create a loan
8. @itcr.ac.cr can read loans
9. @gmail.com cannot read loans
10. User cannot delete a loan

**Activos collection:**
11. @estudiantec.cr can read activos
12. @estudiantec.cr cannot write activos
13. @gmail.com cannot read activos

---

## 14. UI / DESIGN SYSTEM

### Dark Mode Theme

The entire application uses a unified dark mode design. Global CSS variables are defined in `src/styles.css`:

```css
:root {
  --font-family-base: 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --bg: #111317;           /* Page background */
  --bg-card: #1a1d23;      /* Card background */
  --bg-input: #23272e;     /* Input background */
  --bg-input-focus: #2a2e36;  /* Input focused background */
  --border: #2e3340;        /* Default border */
  --border-focus: #3b82f6;  /* Focused border (blue) */
  --border-error: #ef4444;  /* Error border (red) */
  --text-primary: #f1f5f9;  /* Main text */
  --text-secondary: #94a3b8; /* Secondary text */
  --text-muted: #64748b;     /* Muted/helper text */
  --text-label: #cbd5e1;     /* Form labels */
  --accent: #3b82f6;         /* Primary accent (blue) */
  --accent-hover: #2563eb;   /* Accent hover */
  --accent-active: #1d4ed8;  /* Accent active */
  --error: #f87171;          /* Error text */
  --error-bg: rgba(239, 68, 68, 0.1);    /* Error background */
  --error-border: rgba(239, 68, 68, 0.3); /* Error border */
}
```

### Design Patterns

- **Auth pages (login/register):** Centered card on dark background, rounded corners, subtle border
- **Form inputs:** Dark background (`--bg-input`), lighter on focus, border transitions
- **Buttons:** Blue accent (`--accent`) with hover/active states, full-width on auth forms
- **Error states:** Red borders on inputs, red error text below fields, error banner with SVG icon at top of card
- **Loading states:** CSS spinner animation in submit buttons
- **Modals:** Overlay with backdrop blur, centered content card

### Shared CSS Class Names (auth pages)

Both login and register use consistent class names:
- `.auth-page` / `.register-page` — Full-page centered flex container
- `.auth-card` / `.register-card` — Card container with `--bg-card` background
- `.card-header`, `.card-title`, `.card-subtitle` — Header section
- `.form-group`, `.form-label`, `.form-input` — Form fields
- `.input-error` — Red border state on invalid inputs
- `.error-text` — Red validation message
- `.btn-submit` — Primary action button
- `.card-footer` — Bottom link (navigate between login/register)
- `.alert`, `.alert-error` — Error banner

---

## 15. DEV SETUP (from DEV_SETUP.md)

### Prerequisites

| Tool | Version | Verify |
|---|---|---|
| Node.js | ^20.19.0, ^22.12.0 or >=24.0.0 | `node --version` |
| npm | ^6.11.0, ^7.5.6 or >=8.0.0 | `npm --version` |
| Angular CLI | ^20.x | `ng version` |
| Firebase CLI | >=13.0.0 | `firebase --version` |
| Java (JDK) | >=11 | `java -version` |

### Installation

```bash
git clone <REPO_URL>
cd Sistema-Control-Activos
npm install
```

### Running Locally (2 terminals)

**Terminal 1 — Firebase Emulators:**
```bash
npm run emulators
```

**Terminal 2 — Angular Dev Server:**
```bash
npm start
```

App available at http://localhost:4200  
Emulator UI at http://localhost:4000

### Seed Database

```bash
npm run seed
```

Must run while emulators are active. Idempotent — safe to run multiple times.

### Available npm Scripts

| Command | Description |
|---|---|
| `npm start` | Start Angular dev server (port 4200) |
| `npm run build` | Production build |
| `npm test` | Unit tests with Karma |
| `npm run emulators` | Start Firebase emulators |
| `npm run emulators:export` | Start emulators with data persistence |
| `npm run seed` | Seed emulator with test data |

### Emulator Data Persistence

Data is lost when emulators stop. To persist:
```bash
npm run emulators:export
```
Exports to `emulator-data/` on shutdown, reimports on next start.

---

## 16. USER STORIES MAPPING

| Code | Story | Status | Main Files |
|---|---|---|---|
| CF001 | Project configuration | Done | `app.config.ts`, `firebase.config.ts`, `firebase.json` |
| AU001 | Registration form | Done | `features/auth/register/` |
| AU002 | Registration service | Done | `features/auth/services/auth.service.ts` |
| AU003 | Institutional domain validation | Done | `shared/validators/institutional-email.validator.ts`, `firestore.rules` |
| AU004 | User roles (admin/user) | Done | `core/guards/`, `core/models/user.model.ts`, `core/services/auth.service.ts` |
| AU005 | Login | Done | `features/auth/login/` |
| AU006 | Role-based views | Done | `app.routes.ts`, `layout/components/navbar/` |
| PR001 | Loan request form | Done | `features/loans/components/loan-request/` |
| PR002 | Loan creation service | Done | `features/loans/services/loan.service.ts` |
| PR003 | Active loans view | Done | `features/loans/components/active-loans/` |
| DV001 | Return interface | Done | `features/returns/components/` |
| DV002 | Return logic | Done | `features/loans/services/loan.service.ts` (marcarPrestamoComoDevuelto) |
| DV003 | Cloud Functions notification | Done | `functions/src/index.ts` |
| DV004 | Damage email template | Done | `functions/src/emailTemplate.ts` |
| HI | Loan history | In progress | `features/history/components/` |
| QA001 | Integration tests (rules) | Done | `tests/firestore.rules.test.js` |

---

## 17. KNOWN ARCHITECTURAL NOTES

1. **Two AuthService classes:** There are two separate `AuthService` classes — one in `core/services/` (used for login, role checks, session management) and one in `features/auth/services/` (used specifically for registration with Firestore profile creation). They are both `providedIn: 'root'` singletons but serve different purposes. Components import the one they need by path.

2. **Mixed Spanish/English naming:** Older code (loans, service methods, model fields) uses Spanish names (e.g., `grupoTopografia`, `cuadrilla`, `crearPrestamo`). Newer code (user model, seed data, auth components) uses English. There's an ongoing migration.

3. **Temporary permissive Firestore rules:** The `prestamos` and `devoluciones` collections currently have `allow read/create/update: if true` for emulator development. The commented-out production rules require authentication and institutional emails.

4. **Signal vs computed for form tracking:** Angular `computed()` does NOT track changes to reactive form controls. The `isStaffEmail` in RegisterComponent uses a `signal(false)` updated via `valueChanges.subscribe()` instead.

5. **Cloud Functions email:** The damage notification function writes to a `mail` collection. In production, this requires the Firebase "Trigger Email" extension (or similar) to actually send the email. In the emulator, it just logs to console.

6. **Loan dates as strings:** The `Loan` model uses ISO strings for dates (`fechaPrestamo`, `fechaDevolucion`) rather than Firestore Timestamps. The seed script uses Firestore Timestamps for `prestamos` — there's a mismatch.

7. **Build budget warnings:** The production build shows a warning that the initial bundle (754 KB) exceeds the 500 KB budget. The register component CSS (6.4 KB) exceeds the 4 KB per-component budget.

---

## 18. TYPESCRIPT CONFIGURATION

Strict mode is enabled with additional checks:
- `strict: true`
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `isolatedModules: true`
- `strictTemplates: true` (Angular)
- `strictInjectionParameters: true` (Angular)
- Target: `ES2022`, Module: `preserve`

---

## 19. KEY DEPENDENCIES

### Production
- `@angular/core`, `@angular/common`, `@angular/compiler`, `@angular/forms`, `@angular/platform-browser`, `@angular/router` — all ^20.3.0
- `@angular/fire` ^20.0.1 — Firebase Angular SDK
- `firebase` ^11.10.0 — Firebase JS SDK
- `rxjs` ~7.8.0
- `zone.js` ~0.15.0

### Development
- `@angular/build` ^20.3.8 — Angular build system
- `@angular/cli` ^20.3.8
- `firebase-admin` ^13.7.0 — Admin SDK for seed script
- `tsx` ^4.21.0 — TypeScript execution for seed script
- `typescript` ~5.9.2
- `jasmine-core` ~5.9.0, `karma` ~6.4.0 — Testing
