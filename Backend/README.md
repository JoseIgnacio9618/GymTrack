# GymTrack Backend (Next.js + Prisma + PostgreSQL)

API para la app GymTrack. Base de datos **PostgreSQL** con **Prisma**.

---

## Si ves: "Can't reach database server at localhost:5432"

Ese error significa que **PostgreSQL no está corriendo**. Tienes que hacer esto **antes** de usar la app o `npm run dev`:

1. **Abre Docker Desktop** (en Windows, búscalo en el menú inicio). Espera a que esté en marcha (icono de la ballena en la bandeja).
2. Abre una terminal, ve a la carpeta del backend y levanta la base de datos:
   ```bash
   cd backend
   docker compose up -d
   ```
3. Crea las tablas en la base de datos (solo la primera vez, o si cambias el schema):
   ```bash
   npm run db:migrate
   ```
4. Arranca el backend:
   ```bash
   npm run dev
   ```

Si no tienes Docker instalado, instálalo desde [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/). Sin Docker (o sin PostgreSQL instalado en el sistema), el backend no puede conectar a la base de datos.

---

## Requisitos

- Node.js 18+
- Docker (para PostgreSQL en desarrollo)

## Instalación

### 1. Levantar PostgreSQL

Desde la carpeta `backend`:

```bash
docker compose up -d
```

(Abre Docker Desktop antes si usas Windows.)

### 2. Variables de entorno

El archivo `.env` ya tiene la URL por defecto. Si cambias usuario/contraseña en Docker, actualiza `DATABASE_URL`.

### 3. Dependencias y migraciones

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
```

### 4. Desarrollo

```bash
npm run dev
```

API en `http://localhost:3000`. La app Ionic usa `apiUrl: 'http://localhost:3000/api'`.

## Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run db:generate` | Genera el cliente Prisma |
| `npm run db:migrate` | Crea/aplica migraciones (desarrollo) |
| `npm run db:migrate:deploy` | Aplica migraciones (producción) |
| `npm run db:studio` | Abre Prisma Studio para ver la BD |

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login. Body: `{ "email", "password" }` |
| POST | `/api/auth/register` | Registro. Body: `{ "name", "email", "password" }` |
| GET | `/api/users` | Lista usuarios. Query: `?email=...` |
| GET | `/api/users/:id` | Usuario por id |
| POST | `/api/users` | Crear/reinsertar usuario (backup) |

## Ver la base de datos

- **Prisma Studio:** `npm run db:studio` (abre en el navegador).
- **DBeaver / pgAdmin:** Host `localhost`, puerto `5432`, base `gymtrack`, usuario `gymtrack`, contraseña `gymtrack`.
