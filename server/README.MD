# TODO API (server)

REST API for the full-stack TODO app. Built with Node.js, Express 5, TypeScript, Drizzle ORM and a serverless Neon Postgres database.

## Tech stack

| Concern         | Choice                                   |
| --------------- | ---------------------------------------- |
| Runtime         | Node.js 22+ (ESM)                        |
| Framework       | Express 5                                |
| Language        | TypeScript                               |
| Database        | Neon (serverless Postgres)               |
| ORM / migrations| Drizzle ORM + drizzle-kit                |
| Validation      | Zod                                      |
| Logging         | pino + pino-http                         |
| Security        | helmet, cors                             |
| Package manager | pnpm (workspace monorepo)                |

## Prerequisites

- Node.js 22 or newer (uses the built-in `process.loadEnvFile()`)
- pnpm
- A free [Neon](https://neon.tech) account and project

## Getting started

Run these from the repository root unless noted.

```bash
# 1. Install dependencies for the whole workspace
pnpm install

# 2. Create your local env file
cp server/.env.example server/.env
# then edit server/.env and set DATABASE_URL (see "Database setup" below)

# 3. Create the todos table
cd server
pnpm db:migrate

# 4. Start the API with auto-reload
pnpm dev
```

The API is now available at `http://localhost:4000`. Check it with:

```bash
curl http://localhost:4000/api/health
```

You can also start it from the repo root with `pnpm dev:server`.

## Database setup (Neon)

This project uses **PostgreSQL on Neon** instead of MongoDB (the brief allows any database).

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Click **Connect** on the project dashboard.
3. Turn **Connection pooling** on and copy the connection string. The host contains `-pooler`.
4. Paste it into `server/.env` as `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

Notes:

- **Cold starts:** on Neon's free tier the compute suspends after a period of inactivity, so the first request after a pause can take a second or two longer.
- **Migrations:** if `pnpm db:migrate` ever fails through the pooled connection, use the **direct (non-pooled)** connection string for the migration command only.
- **Local Postgres:** the app uses Neon's HTTP driver, so it needs a Neon connection string. A plain local Postgres URL will not work without swapping the driver in `src/db/index.ts`.
- **Inspecting data:** run `pnpm db:studio` for Drizzle Studio, or use the Neon console SQL editor.

## Environment variables

Validated with Zod at startup. The server exits with a readable message if anything is invalid.

| Variable        | Required | Default                 | Description                                   |
| --------------- | -------- | ----------------------- | --------------------------------------------- |
| `DATABASE_URL`  | yes      | -                       | Neon Postgres connection string               |
| `PORT`          | no       | `4000`                  | Port the API listens on                       |
| `CLIENT_ORIGIN` | no       | `http://localhost:5173` | Frontend origin allowed by CORS               |
| `NODE_ENV`      | no       | `development`           | `development`, `production` or `test`         |

## Scripts

Run inside `server/`.

| Script             | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `pnpm dev`         | Start with hot reload (tsx watch), pretty logs      |
| `pnpm build`       | Compile TypeScript to `dist/`                       |
| `pnpm start`       | Run the compiled build (`node dist/index.js`)       |
| `pnpm typecheck`   | Type-check without emitting files                   |
| `pnpm db:generate` | Generate a SQL migration from `src/db/schema.ts`    |
| `pnpm db:migrate`  | Apply pending migrations to the database            |
| `pnpm db:studio`   | Open Drizzle Studio                                 |

After changing the schema, run `pnpm db:generate`, review the SQL in `drizzle/`, then `pnpm db:migrate`.

## API reference

Base path: `/api`. All bodies are JSON.

| Method | Endpoint               | Description                    | Success          |
| ------ | ---------------------- | ------------------------------ | ---------------- |
| GET    | `/api/health`          | Health check                   | `200`            |
| GET    | `/api/todos`           | List todos, newest first       | `200`            |
| POST   | `/api/todos`           | Create a todo                  | `201`            |
| PUT    | `/api/todos/:id`       | Update title and/or description| `200`            |
| PATCH  | `/api/todos/:id/done`  | Toggle the done status         | `200`            |
| DELETE | `/api/todos/:id`       | Delete a todo                  | `204` (no body)  |

### Todo object

```json
{
  "id": "3f1c2a4e-9b7d-4c1a-8e2f-5a6b7c8d9e0f",
  "title": "Buy milk",
  "description": "2 liters",
  "done": false,
  "createdAt": "2026-10-09T10:00:00.000Z",
  "updatedAt": "2026-10-09T10:00:00.000Z"
}
```

Successful responses wrap the result: `{ "data": <todo or todo[]> }`.

### Validation rules

| Field         | Rules                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| `title`       | Required on create. Trimmed, 1-200 characters.                              |
| `description` | Optional. Trimmed, up to 2000 characters. Blank or `null` is stored as `null`. |
| `id` (param)  | Must be a valid UUID.                                                       |

Unknown fields in a request body are ignored (for example, `done` cannot be set on create).

### Examples

```bash
# Create
curl -X POST http://localhost:4000/api/todos \
  -H 'content-type: application/json' \
  -d '{"title":"Buy milk","description":"2 liters"}'

# Update only the title (description is left unchanged)
curl -X PUT http://localhost:4000/api/todos/<id> \
  -H 'content-type: application/json' \
  -d '{"title":"Buy oat milk"}'

# Clear the description
curl -X PUT http://localhost:4000/api/todos/<id> \
  -H 'content-type: application/json' \
  -d '{"description":""}'

# Toggle done / not done
curl -X PATCH http://localhost:4000/api/todos/<id>/done

# Delete
curl -X DELETE http://localhost:4000/api/todos/<id>
```

### Update semantics

`PUT /api/todos/:id` accepts a partial body, as the brief asks for "title and/or description":

- A field that is **omitted** is left unchanged.
- A `description` of `null` or a blank string **clears** it.
- A body with neither field is rejected with `400`.

### Error format

Every error uses the same shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "title", "message": "Title is required" }]
  }
}
```

`details` is only present for validation errors.

| Status | Code                | When                                      |
| ------ | ------------------- | ----------------------------------------- |
| 400    | `VALIDATION_ERROR`  | Body or params fail validation            |
| 400    | `INVALID_JSON`      | Request body is not valid JSON            |
| 404    | `TODO_NOT_FOUND`    | No todo with that id                      |
| 404    | `ROUTE_NOT_FOUND`   | Unknown route                             |
| 413    | `PAYLOAD_TOO_LARGE` | Body larger than 16 KB                    |
| 500    | `INTERNAL_ERROR`    | Unexpected failure (details only in logs) |

## Project structure

```
server/
├── drizzle/                  # Generated SQL migrations (committed)
├── drizzle.config.ts         # drizzle-kit configuration
├── src/
│   ├── config/env.ts         # Zod-validated environment
│   ├── db/
│   │   ├── index.ts          # Drizzle + Neon client
│   │   └── schema.ts         # todos table definition
│   ├── errors/app-error.ts   # AppError for expected failures
│   ├── lib/logger.ts         # pino logger
│   ├── middleware/
│   │   ├── error-handler.ts  # Maps every error to the JSON error shape
│   │   ├── not-found.ts
│   │   └── validate.ts       # Zod validation for body and params
│   ├── modules/todos/
│   │   ├── todo.routes.ts    # URL -> handler wiring
│   │   ├── todo.controller.ts# HTTP in/out
│   │   ├── todo.service.ts   # Business logic and queries
│   │   └── todo.schemas.ts   # Zod schemas and inferred types
│   ├── app.ts                # createApp(): middleware and routes
│   └── index.ts              # Entry point
├── tsconfig.json             # Editor and typecheck config
└── tsconfig.build.json       # Production build config (src only)
```

## Design decisions

- **Layered modules:** routes call controllers, controllers call services, services call the database. Services know nothing about HTTP.
- **Validate at the edge:** Zod schemas run before any controller code, and their types are reused through `z.infer`, so runtime checks and compile-time types cannot drift apart.
- **One error contract:** expected failures throw `AppError`, validation failures throw `ZodError`, and a single handler turns both into the JSON format above. Unexpected errors return a generic 500 and are logged in full.
- **Atomic toggle:** `PATCH /done` runs `SET done = NOT done` in a single SQL statement, so concurrent toggles cannot overwrite each other.
- **No read-before-write:** update and delete use `RETURNING` and treat "no row returned" as 404, avoiding an extra query and a race condition.
- **Database-generated values:** ids (`gen_random_uuid()`) and timestamps come from Postgres.
- **Neon HTTP driver:** stateless queries over HTTPS suit serverless environments and need no connection pool.

## Assumptions and limitations

- **No authentication:** the API is open and all todos are shared. There are no users or per-user data.
- **No pagination:** `GET /api/todos` returns every todo, which is fine for a small list.
- **Hard delete:** deleted todos are removed permanently.
- **Repeat delete returns 404:** deleting an already-deleted todo is reported rather than silently accepted.
- **Single CORS origin:** `CLIENT_ORIGIN` accepts one origin.
- **No rate limiting or graceful shutdown:** both would be worthwhile before a real deployment.
- **No automated tests yet:** endpoints were verified manually with curl; a Vitest + supertest suite is the natural next step.
- **`updated_at` clock source:** updates made through `PUT` use the app server's clock, while the toggle uses the database clock. Both are accurate for this use case.
