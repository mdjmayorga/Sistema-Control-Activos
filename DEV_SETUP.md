# Guia de Configuracion - Entorno de Desarrollo

Sistema de Control de Activos para el CIVCO - ITCR.

---

## Requisitos Previos

| Herramienta       | Version requerida              | Verificar con          |
| ----------------- | ------------------------------ | ---------------------- |
| **Node.js**       | ^20.19.0, ^22.12.0 o >=24.0.0 | `node --version`       |
| **npm**           | ^6.11.0, ^7.5.6 o >=8.0.0     | `npm --version`        |
| **Angular CLI**   | ^20.x                         | `ng version`           |
| **Firebase CLI**  | >=13.0.0                       | `firebase --version`   |
| **Java (JDK)**    | >=11                           | `java -version`        |

> **Nota:** Java es requerido por el emulador de Firestore. Si no lo tienes instalado, el emulador no arrancara.

### Instalacion de requisitos

**Node.js** (se recomienda usar [nvm](https://github.com/nvm-sh/nvm)):

```bash
nvm install 22
nvm use 22
```

**Angular CLI** (global):

```bash
npm install -g @angular/cli
```

**Firebase CLI** (global):

```bash
npm install -g firebase-tools
```

**Java JDK** (macOS con Homebrew):

```bash
brew install openjdk@17
```

---

## Instalacion del Proyecto

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd Sistema-Control-Activos

# 2. Instalar dependencias
npm install
```

---

## Levantar el Entorno de Desarrollo

Se necesitan **dos terminales**:

### Terminal 1 - Emuladores de Firebase

```bash
npm run emulators
```

Esto inicia los emuladores locales de:

| Servicio       | Puerto | URL                          |
| -------------- | ------ | ---------------------------- |
| Emulator UI    | 4000   | http://localhost:4000        |
| Firestore      | 8080   | http://localhost:4000/firestore |
| Authentication | 9099   | http://localhost:4000/auth      |

### Terminal 2 - Servidor Angular

```bash
npm start
```

La aplicacion estara disponible en **http://localhost:4200**.

> En modo desarrollo, la app se conecta automaticamente a los emuladores locales. Ningun dato se envia al Firebase de produccion.

---

## Seed de la Base de Datos

Para poblar los emuladores con datos de prueba (usuarios, activos, prestamos):

```bash
npm run seed
```

> Los emuladores deben estar corriendo antes de ejecutar este comando.

### Credenciales de prueba

| Rol    | Correo                         | Contrasena |
| ------ | ------------------------------ | ---------- |
| Admin  | jccoto@itcr.ac.cr              | Admin123!  |
| User   | estudiante1@estudiantec.cr     | User123!   |
| User   | estudiante2@estudiantec.cr     | User123!   |
| User   | docente1@itcr.ac.cr            | User123!   |

### Datos generados

- **4 usuarios** (1 admin + 2 estudiantes + 1 docente)
- **10 activos** (equipos topograficos variados)
- **4 prestamos** (3 activos + 1 devuelto con reporte de dano)

El seed es **idempotente**: se puede ejecutar multiples veces y siempre regenera los datos desde cero.

---

## Persistencia de Datos del Emulador

Por defecto, los datos del emulador se pierden al detenerlo. Para conservar los datos entre sesiones:

```bash
npm run emulators:export
```

Esto exporta los datos automaticamente al directorio `emulator-data/` al cerrar el emulador, y los reimporta al iniciar la proxima vez.

---

## Comandos Disponibles

| Comando                  | Descripcion                                         |
| ------------------------ | --------------------------------------------------- |
| `npm start`              | Inicia el servidor de desarrollo Angular (port 4200)|
| `npm run build`          | Genera build de produccion                          |
| `npm test`               | Ejecuta las pruebas unitarias con Karma             |
| `npm run emulators`      | Inicia los emuladores de Firebase                   |
| `npm run emulators:export` | Inicia emuladores con persistencia de datos       |
| `npm run seed`           | Puebla el emulador con datos de prueba              |

---

## Estructura de Colecciones Firestore

### `users`
| Campo      | Tipo      | Descripcion                           |
| ---------- | --------- | ------------------------------------- |
| nombre     | string    | Nombre completo                       |
| carnet     | string    | Carnet estudiantil (o "N/A")          |
| correo     | string    | Correo institucional                  |
| role       | string    | `admin` o `user`                      |
| createdAt  | Timestamp | Fecha de creacion del perfil          |

### `activos`
| Campo       | Tipo   | Descripcion                                      |
| ----------- | ------ | ------------------------------------------------ |
| nombre      | string | Nombre del equipo                                |
| numeroSerie | string | Numero de serie unico                            |
| estado      | string | `disponible`, `prestado` o `danado`              |
| descripcion | string | Descripcion tecnica del equipo                   |

### `prestamos`
| Campo           | Tipo           | Descripcion                               |
| --------------- | -------------- | ----------------------------------------- |
| userId          | string         | ID del usuario que solicita               |
| activoId        | string         | ID del activo prestado                    |
| grupo           | string         | Grupo del curso                           |
| cuadrilla       | string         | Cuadrilla asignada                        |
| razon           | string         | Motivo del prestamo                       |
| estado          | string         | `activo` o `devuelto`                     |
| fechaPrestamo   | Timestamp      | Fecha de inicio del prestamo              |
| fechaDevolucion | Timestamp/null | Fecha de devolucion (null si esta activo) |
| reporteDano     | boolean        | Si se reporto dano al devolver            |
| createdAt       | Timestamp      | Fecha de creacion del registro            |

---
