# GymTrack Backend (Next.js + Prisma + PostgreSQL)

API para GymTrack usando PostgreSQL con Prisma.

## Quick start

1. Entra en la carpeta `Backend`.
2. Crea variables de entorno (si no existe `.env`):
   ```bash
   copy .env.example .env
   ```
   En PowerShell tambien puedes usar:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Levanta PostgreSQL con Docker:
   ```bash
   docker compose up -d
   ```
4. Instala dependencias:
   ```bash
   npm install
   ```
5. Genera cliente Prisma:
   ```bash
   npm run db:generate
   ```
6. Aplica migraciones:
   ```bash
   npm run db:migrate
   ```
7. Arranca backend:
   ```bash
   npm run dev
   ```

API: `http://localhost:3000/api`

## Requisitos

- Node.js 18+
- Docker Desktop (Windows/macOS) o Docker Engine

## Variables de entorno

Archivo `.env`:

```env
DATABASE_URL="postgresql://gymtrack:gymtrack@localhost:5432/gymtrack?schema=public"
```

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Levanta Next en desarrollo |
| `npm run build` | Build de Next (sin regenerar Prisma) |
| `npm run build:full` | `prisma generate` + build completo |
| `npm run db:generate` | Genera cliente Prisma |
| `npm run db:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run db:migrate:deploy` | Aplica migraciones en produccion |
| `npm run db:push` | Sincroniza schema sin migracion |
| `npm run db:studio` | Abre Prisma Studio |

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/auth/login` | Login (`email`, `password`) |
| POST | `/api/auth/register` | Registro (`name`, `email`, `password`) |
| GET | `/api/users` | Lista usuarios (query `email`) |
| GET | `/api/users/:id` | Usuario por id |
| POST | `/api/users` | Crear/reinsertar usuario (backup) |
| GET | `/api/routines?userId=...` | Lista rutinas del usuario |
| POST | `/api/routines` | Crear rutina con ejercicios |
| GET | `/api/routines/:id?userId=...` | Obtener rutina por id |
| PATCH | `/api/routines/:id` | Editar rutina completa |
| DELETE | `/api/routines/:id?userId=...` | Eliminar rutina |
| GET | `/api/trainings?userId=...` | Histórico de entrenamientos |
| GET | `/api/trainings?userId=...&active=true` | Entrenamiento activo |
| POST | `/api/trainings` | Iniciar entrenamiento desde rutina |
| PATCH | `/api/trainings/:id` | Finalizar entrenamiento |
| POST | `/api/trainings/:id/sets` | Añadir serie (peso y/o tiempo) |
| GET | `/api/trainings/stats?userId=...` | Media global (series/peso/tiempo) |
| GET | `/api/trainings/exercise-stats?userId=...&routineId=...` | Media histórica por ejercicio de una rutina |
| POST | `/api/uploads` | Subir imagen real de ejercicio (multipart/form-data, `file`) |

Las imágenes se guardan en `Backend/public/uploads` y se sirven en `/uploads/...`.

## Troubleshooting

### Error: `Environment variable not found: DATABASE_URL`

No existe `.env` o no tiene `DATABASE_URL`.

Solucion:
1. `Copy-Item .env.example .env`
2. Verifica `DATABASE_URL`.

### Error: `Can't reach database server at localhost:5432`

PostgreSQL no esta corriendo.

Solucion:
1. Abre Docker Desktop.
2. Ejecuta `docker compose up -d`.
3. Reintenta `npm run db:migrate`.

### Error en Windows: `EPERM ... query_engine-windows.dll.node`

El engine de Prisma esta bloqueado por otro proceso.

Solucion:
1. Cierra procesos Node/Next/Prisma abiertos.
2. Reintenta `npm run db:generate`.
3. Si persiste, reinicia terminal/IDE o Windows.

## Notas

- `.env` esta en `.gitignore` y no se versiona.
- `docker-compose.yml` crea la DB `gymtrack` con user/pass `gymtrack`.
