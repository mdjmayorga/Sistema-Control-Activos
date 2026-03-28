# Project Structure — CIVCO Asset Control System

> Angular + Firebase | TEC — Centro de Investigaciones en Vivienda y Construccion

---

## Overview

```
src/app/
├── core/                       # Singleton services, guards, and interceptors (app-wide)
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── shared/                     # Reusable components, pipes, directives, and utilities
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   ├── utils/
│   └── validators/
├── features/                   # Feature modules (lazy-loaded)
│   ├── admin/                  # Admin panel
│   │   ├── components/
│   │   └── services/
│   ├── auth/                   # AU001-AU006: Authentication and users
│   │   ├── components/
│   │   ├── guards/
│   │   └── services/
│   ├── dashboard/              # Regular user main view
│   │   └── components/
│   ├── history/                # HI (MVP2): Loan history
│   │   ├── components/
│   │   └── services/
│   ├── loans/                  # PR001-PR003: Loan requests and management
│   │   ├── components/
│   │   └── services/
│   └── returns/                # DV001-DV004: Asset returns and damage reporting
│       ├── components/
│       └── services/
├── layout/                     # Visual structure components
│   └── components/
│       ├── footer/
│       ├── navbar/
│       └── sidebar/
├── app.ts                      # Root component
├── app.routes.ts               # Main routes (lazy loading)
├── app.config.ts               # App configuration
└── firebase.config.ts          # Firebase SDK configuration

functions/                      # Firebase Cloud Functions (DV003, DV004, MVP3)
└── src/
```

---

## Directory Details

### `core/` — Application Core

Contains singleton services, global guards, and interceptors instantiated once across the entire app. **Must not contain visual components.**

| Directory | Purpose | Example Files |
|---|---|---|
| `core/services/` | Global singleton services | `auth.service.ts`, `firestore.service.ts`, `notification.service.ts` |
| `core/guards/` | Global route guards | `auth.guard.ts`, `role.guard.ts`, `no-auth.guard.ts` |
| `core/interceptors/` | HTTP interceptors | `error.interceptor.ts`, `loading.interceptor.ts` |
| `core/models/` | Global interfaces and types | `user.model.ts`, `loan.model.ts`, `return.model.ts`, `asset.model.ts` |

---

### `shared/` — Reusable Code

Contains elements used across multiple features. All components here must be **presentational** (no business logic).

| Directory | Purpose | Example Files |
|---|---|---|
| `shared/components/` | Reusable UI components | `loading-spinner/`, `confirm-dialog/`, `data-table/` |
| `shared/directives/` | Custom directives | `highlight.directive.ts`, `click-outside.directive.ts` |
| `shared/pipes/` | Custom pipes | `relative-date.pipe.ts`, `loan-status.pipe.ts` |
| `shared/validators/` | Form validators | `email-domain.validator.ts` (validates @estudiantec.cr / @itcr.ac.cr) |
| `shared/utils/` | Pure utility functions | `date.utils.ts`, `string.utils.ts` |

---

### `features/` — Feature Modules

Each feature is a **self-contained** module with its own components, services, and models. They are loaded via **lazy loading** from `app.routes.ts`. Components live directly inside the `components/` folder of each feature (no extra subdirectory per component).

---

#### `features/auth/` — Authentication and Users

> User Stories: **AU001** (registration), **AU002** (registration service), **AU003** (domain validation), **AU004** (roles), **AU005** (login), **AU006** (role-based views)

| Directory | Purpose |
|---|---|
| `auth/components/` | Login component (Firebase Auth + role-based redirect), Registration form (name, student ID, email, password, confirmation, terms checkbox) |
| `auth/services/` | `auth.service.ts` — Firebase Auth registration + Firestore user doc creation, login, logout, session state |
| `auth/guards/` | Auth-specific guards (e.g., `no-auth.guard.ts` to redirect already logged-in users) |

---

#### `features/loans/` — Loan Requests and Management

> User Stories: **PR001** (request form), **PR002** (creation service), **PR003** (active loans)

| Directory | Purpose |
|---|---|
| `loans/components/` | Loan request form (group, crew, reason, asset, serial number), Active loans view for admin (user, asset, loan date, return date) |
| `loans/services/` | `loan.service.ts` — Firestore loan CRUD, status-based queries |

---

#### `features/returns/` — Asset Returns

> User Stories: **DV001** (return interface), **DV002** (return logic), **DV003** (Cloud Functions notification), **DV004** (email template)

| Directory | Purpose |
|---|---|
| `returns/components/` | Return form (list of user's active loans with damage confirmation checkbox), Damage report component |
| `returns/services/` | `return.service.ts` — update status to "returned", record date, trigger notification |

---

#### `features/history/` — Loan History (MVP2)

> User Stories: **HI** (pending and past loan history)

| Directory | Purpose |
|---|---|
| `history/components/` | View of pending and past loans per user |
| `history/services/` | `history.service.ts` — Firestore history queries |

---

#### `features/admin/` — Admin Panel

> User Stories: **AU006** (role-based views), **PR003** (admin active loans)

| Directory | Purpose |
|---|---|
| `admin/components/` | Admin dashboard, loan request list for approval/tracking, asset management (CRUD) |
| `admin/services/` | `admin.service.ts` — administrative operations |

---

#### `features/dashboard/` — User Dashboard

| Directory | Purpose |
|---|---|
| `dashboard/components/` | Main view for regular users (students/teachers) |

---

### `layout/` — Visual Structure

Layout components that wrap the app. Used in the root component.

| Directory | Purpose |
|---|---|
| `layout/components/navbar/` | Top navigation bar with role-based options |
| `layout/components/footer/` | Page footer |
| `layout/components/sidebar/` | Side menu (admin) |

---

### `functions/` — Firebase Cloud Functions

> User Stories: **DV003** (email notification), **DV004** (email template), **AD** (DB cleanup — MVP3)

| Directory | Purpose |
|---|---|
| `functions/src/` | Cloud Functions: damage notification emails, periodic storage cleanup (every 30 days) |

---

## Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Component | `name.ts` + `name.html` + `name.css` | `login.ts`, `login.html` |
| Service | `name.service.ts` | `auth.service.ts` |
| Guard | `name.guard.ts` | `role.guard.ts` |
| Model/Interface | `name.model.ts` | `user.model.ts` |
| Pipe | `name.pipe.ts` | `loan-status.pipe.ts` |
| Directive | `name.directive.ts` | `highlight.directive.ts` |
| Validator | `name.validator.ts` | `email-domain.validator.ts` |

---

## Data Models (Firestore)

These are the main interfaces to be defined in `core/models/`:

### `User`
```typescript
interface User {
  uid: string;
  name: string;
  studentId: string;
  email: string;            // @estudiantec.cr or @itcr.ac.cr
  role: 'user' | 'admin';
  registrationDate: Timestamp;
}
```

### `Loan`
```typescript
interface Loan {
  id: string;
  userId: string;
  group: string;
  crew: string;
  reason: string;
  asset: string;
  serialNumber: string;
  status: 'active' | 'returned';
  loanDate: Timestamp;
  returnDate?: Timestamp;
  damageReported: boolean;
}
```

### `Asset`
```typescript
interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  status: 'available' | 'loaned' | 'damaged';
  description?: string;
}
```

---

## User Story → Directory Mapping

| Code | Story | Main Directory |
|---|---|---|
| CF001 | Project configuration | `app.config.ts`, `firebase.config.ts`, `app.routes.ts` |
| AU001 | Registration form | `features/auth/components/` |
| AU002 | Registration service | `features/auth/services/`, `core/services/` |
| AU003 | Institutional domain validation | `shared/validators/`, `features/auth/services/` |
| AU004 | User roles | `core/models/`, `core/guards/` |
| AU005 | Login | `features/auth/components/` |
| AU006 | Role-based views | `features/admin/`, `features/dashboard/` |
| PR001 | Loan request form | `features/loans/components/` |
| PR002 | Loan creation service | `features/loans/services/` |
| PR003 | Active loans | `features/loans/components/` |
| DV001 | Return interface | `features/returns/components/` |
| DV002 | Return logic | `features/returns/services/` |
| DV003 | Cloud Functions notification | `functions/src/` |
| DV004 | Damage email template | `functions/src/` |
| QA001 | Integration tests | `*.spec.ts` files in each component/service |
