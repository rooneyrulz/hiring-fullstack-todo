# TODO app

A small full-stack TODO application: a React frontend, an Express REST API, and a serverless Postgres database. Built as a take-home assignment, with the focus on clean structure, correct behaviour in failure cases, and accessible UI.

## Features

- Create, view, edit and delete todos (title plus optional description)
- Mark todos done or not done; completed items are muted and struck through
- Instant feedback: marking done and deleting update the screen immediately and roll back if the server fails
- Loading, empty and error states, with a retry button when the list can't load
- Validation on both the client and the server, with clear messages
- Keyboard accessible, with confirmation before deleting and support for "reduce motion"

## Tech stack

| Layer    | Technology                                                                    |
| -------- | ----------------------------------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, React Hook Form, Zod |
| Backend  | Node.js, Express 5, TypeScript, Zod, pino                                     |
| Database | Neon (serverless PostgreSQL) with Drizzle ORM and drizzle-kit migrations      |
| Tooling  | pnpm workspaces (monorepo), Prettier, oxlint                                  |

## Repository structure

```
.
├── client/    # React frontend       -> see client/README.md
├── server/    # Express API          -> see server/README.md
├── package.json
└── pnpm-workspace.yaml
```

- [Client README](./client/README.md): setup, architecture, UI and accessibility notes
- [Server README](./server/README.md): setup, Neon notes, full API reference, error format

## Quick start

**Prerequisites:** Node.js 22 or newer, pnpm, and a free [Neon](https://neon.tech) account.

```bash
# 1. Install everything
pnpm install

# 2. Configure the API
cp server/.env.example server/.env
#    then open server/.env and paste your Neon connection string into DATABASE_URL

# 3. Create the database table
pnpm --filter server db:migrate

# 4. Run the API and the client (two terminals)
pnpm dev:server
pnpm dev:client
```

Open [http://localhost:5173](http://localhost:5173). The API listens on `http://localhost:4000`.

Where to find a Neon connection string, and why the pooled one is recommended, is explained in the [server README](./server/README.md#database-setup-neon). The client needs no configuration for local development.

pnpm may print a note about ignored build scripts during install. It is harmless for this project.

## Scripts

Run from the repository root.

| Script           | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `pnpm dev:server`| Start the API with hot reload                     |
| `pnpm dev:client`| Start the Vite dev server                         |
| `pnpm build`     | Production build of both packages                 |
| `pnpm typecheck` | Type-check both packages                          |
| `pnpm lint`      | Lint the client                                   |
| `pnpm format`    | Format the repository with Prettier               |

Package-specific scripts (migrations, preview, Drizzle Studio) are listed in each package's README.

## How it fits together

```
 Browser                      Server                          Database
┌──────────────────┐  JSON  ┌──────────────────────────┐  SQL  ┌────────────────┐
│ React + TanStack │ <────> │ Express                  │ <───> │ Neon Postgres  │
│ Query            │  HTTP  │ routes > controllers >   │ HTTPS │ (via Drizzle)  │
│ (cache, optimistic│       │ services                 │       │                │
│  updates)        │        │ Zod validation, errors   │       │                │
└──────────────────┘        └──────────────────────────┘       └────────────────┘
```

### API at a glance

| Method | Endpoint                | Description                     |
| ------ | ----------------------- | ------------------------------- |
| GET    | `/api/todos`            | List todos, newest first        |
| POST   | `/api/todos`            | Create a todo                   |
| PUT    | `/api/todos/:id`        | Update title and/or description |
| PATCH  | `/api/todos/:id/done`   | Toggle the done status          |
| DELETE | `/api/todos/:id`        | Delete a todo                   |

Request and response shapes, validation rules and error codes are in the [server README](./server/README.md#api-reference).

## Key decisions

- **PostgreSQL on Neon instead of MongoDB.** The brief allows any database. A relational table with a typed schema suits this data, and Drizzle keeps queries type-safe and migrations versioned.
- **Layered backend.** Routes map URLs to controllers, controllers handle HTTP, and services hold the queries. Services know nothing about Express.
- **Validate at the boundary with Zod, on both sides.** Schemas produce the TypeScript types, so runtime checks and compile-time types cannot drift apart. The client also validates API responses.
- **One error format everywhere.** Every failure returns `{ error: { code, message, details? } }`, so the UI can show a precise message without parsing text.
- **Atomic toggle.** The done flag is flipped inside a single SQL statement, so concurrent requests can't overwrite each other.
- **Optimistic updates where they pay off.** Toggle and delete respond instantly and roll back on failure. Create and edit wait for the server, because they need server-generated values or are easy to retry.
- **Accessibility as a requirement.** Labelled fields, focus management in dialogs, announced errors, and reduced-motion support.
- **Small, focused commits.** The history follows [Conventional Commits](https://www.conventionalcommits.org/), one feature per commit, from scaffold to documentation.

## Assumptions and limitations

- No authentication: all visitors share one list.
- No pagination: the whole list is loaded at once.
- `PUT` accepts a partial body (title and/or description), following the brief's wording ("update the title and/or description").
- Deleted todos are removed permanently.
- No automated tests are included.
- Limitations specific to each side are listed in the [client](./client/README.md#assumptions-and-limitations) and [server](./server/README.md#assumptions-and-limitations) READMEs.

## Troubleshooting

| Symptom                                   | Fix                                                                           |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| API exits immediately with an env error   | `server/.env` is missing or `DATABASE_URL` is empty or invalid                |
| `relation "todos" does not exist`         | Run `pnpm --filter server db:migrate`                                         |
| "Can't reach the server" in the browser   | The API isn't running, or `CLIENT_ORIGIN` in `server/.env` doesn't match the client's URL |
| First request after a pause is slow       | Neon's free tier suspends idle databases; the next request wakes it           |
