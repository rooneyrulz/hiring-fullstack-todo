# TODO client

React frontend for the full-stack TODO app. A single-page, mobile-friendly interface for creating, editing, completing and deleting todos, backed by the REST API in [`../server`](../server/README.MD).

## Features

- View all todos, newest first
- Create a todo with a title and optional description
- Edit title and description in a dialog
- Mark a todo done or not done (completed items are muted and struck through)
- Delete a todo, with a confirmation step
- Loading skeletons, an empty state, and an error state with a retry button
- Client-side validation with clear, inline messages
- Instant (optimistic) feedback for marking done and deleting, with automatic rollback if the server fails
- Keyboard accessible, screen-reader friendly, and respects the "reduce motion" setting

## Tech stack

| Concern             | Choice                                         |
| ------------------- | ---------------------------------------------- |
| Framework           | React 19                                       |
| Build tool          | Vite 8                                         |
| Language            | TypeScript 7                                   |
| Styling             | Tailwind CSS 4                                 |
| Components          | shadcn/ui (Radix primitives, Lucide icons)     |
| Server state        | TanStack Query 5                               |
| Forms               | React Hook Form + Zod (via `@hookform/resolvers`) |
| Validation          | Zod                                            |
| Notifications       | Sonner                                         |
| Linting             | oxlint                                         |
| Package manager     | pnpm (workspace monorepo)                      |

## Prerequisites

- Node.js 22 or newer
- pnpm
- The API running locally (see the [server README](../server/README.MD) for database setup)

## Getting started

Run these from the repository root.

```bash
# 1. Install dependencies for the whole workspace
pnpm install

# 2. Start the API (in its own terminal; needs server/.env, see the server README)
pnpm dev:server

# 3. Start the client
pnpm dev:client
```

Open [http://localhost:5173](http://localhost:5173).

The client works with no configuration as long as the API is on `http://localhost:4000`. To point it elsewhere, create `client/.env`:

```bash
cp client/.env.example client/.env
```

## Environment variables

Validated with Zod at startup (`src/lib/env.ts`). Vite only exposes variables prefixed with `VITE_` to browser code, and **they are public**, so never put secrets in them.

| Variable       | Required | Default                 | Description                                    |
| -------------- | -------- | ----------------------- | ---------------------------------------------- |
| `VITE_API_URL` | no       | `http://localhost:4000` | Base URL of the API (a trailing slash is ignored) |

The API must allow the client's origin through its `CLIENT_ORIGIN` setting, which defaults to `http://localhost:5173`. If you run the client on another port or host, update `CLIENT_ORIGIN` in `server/.env` to match.

## Scripts

Run inside `client/`, or from the root with `pnpm --filter client <script>`.

| Script           | What it does                                       |
| ---------------- | -------------------------------------------------- |
| `pnpm dev`       | Start the Vite dev server with hot reload          |
| `pnpm build`     | Type-check, then create a production build in `dist/` |
| `pnpm preview`   | Serve the production build locally                 |
| `pnpm typecheck` | Type-check only (`tsc -b`)                         |
| `pnpm lint`      | Lint with oxlint                                   |

## Project structure

```
client/
├── public/favicon.svg
├── components.json               # shadcn/ui configuration
└── src/
    ├── main.tsx                  # Entry point, QueryClientProvider
    ├── App.tsx                   # Page layout
    ├── index.css                 # Tailwind, theme tokens, motion
    ├── components/ui/            # shadcn/ui components (generated, owned by this repo)
    ├── lib/
    │   ├── env.ts                # Zod-validated environment
    │   ├── api-client.ts         # fetch wrapper, ApiError, getErrorMessage
    │   ├── query-client.ts       # TanStack Query defaults and retry policy
    │   └── utils.ts              # cn() class helper
    └── features/todos/
        ├── todo.schemas.ts       # Zod schemas: API responses and form input
        ├── todos-api.ts          # One function per endpoint
        ├── todo.queries.ts       # Query keys and the useTodos hook
        ├── todo.mutations.ts     # Create, update, toggle and delete hooks
        ├── todo-focus.ts         # Focus helper for the new-todo field
        └── components/
            ├── todo-list.tsx         # Chooses loading / error / empty / list
            ├── todo-list-states.tsx  # Skeleton, empty and error views
            ├── todo-item.tsx         # One row
            ├── todo-form.tsx         # Create form
            ├── todo-fields.tsx       # Title and description inputs (shared)
            ├── edit-todo-dialog.tsx
            └── delete-todo-dialog.tsx
```

The code is organised by feature: everything about todos lives under `features/todos`, while `lib` holds feature-independent plumbing.

## How it works

### Talking to the API

All HTTP goes through one function, `request()` in `src/lib/api-client.ts`. It sets JSON headers, handles `204` responses, and validates every successful response against a Zod schema, so an unexpected response shape becomes a controlled error instead of a crash deeper in the UI.

Failures of every kind (error responses from the API, non-JSON error pages from a proxy, and no network at all) are turned into one `ApiError` with a `status`, a stable `code` and a user-safe `message`. This mirrors the API's `{ error: { code, message, details } }` format. `getErrorMessage()` converts any thrown value into text that is safe to show.

### Server state

TanStack Query owns the todo list: caching, loading and error states, request cancellation and retries. Network and 5xx errors retry twice, while 4xx errors never retry, because they would only fail again. Mutations never retry automatically, which avoids duplicate creates.

### Mutations

| Action | Request                | Strategy                                                                                       |
| ------ | ---------------------- | ---------------------------------------------------------------------------------------------- |
| Create | `POST /api/todos`      | Wait for the server (the new id is unknown), then add the returned todo to the top of the cache |
| Edit   | `PUT /api/todos/:id`   | Wait for the server, then replace the todo in the cache. Saving without changes sends no request |
| Toggle | `PATCH /api/todos/:id/done` | Optimistic: flip immediately, roll back that one todo on failure                          |
| Delete | `DELETE /api/todos/:id`| Optimistic: remove immediately, restore at the original position on failure                    |

Details worth knowing:

- Only one toggle request per row is allowed at a time, because the API flips whatever value it currently holds.
- After the last optimistic mutation finishes, the list is re-fetched once so the cache matches the server.
- Deleting a todo that is already gone (404) counts as success.
- Editing a todo that was deleted elsewhere shows "Todo not found" and the list resyncs.

### Forms and validation

Forms use React Hook Form with the Zod schema in `todo.schemas.ts` (title: 1-200 characters, description: up to 2000, both trimmed). The same fields component is used by the create form and the edit dialog. Input is kept after a failed submit so nothing has to be retyped.

### Where errors appear

| Situation                | Where the user sees it                                  |
| ------------------------ | ------------------------------------------------------- |
| List fails to load       | In place of the list, with a **Try again** button       |
| Create fails             | Next to the **Add todo** button                         |
| Edit fails               | Inside the dialog, which stays open                     |
| Toggle fails             | Under that row (the checkbox rolls back)                |
| Delete fails             | A toast (the row has already been restored)             |

## Design and accessibility

- A single centred column with hairline dividers rather than cards. One accent colour (teal) is used only for the completed state.
- Real `<label>`s on every field, `aria-invalid` and `aria-describedby` on invalid inputs, `role="alert"` on errors, and the checkbox is named by its todo's title.
- Dialogs trap focus, close with Escape, and return focus to the button that opened them. After a confirmed delete, focus moves to the new-todo field because the row no longer exists. The delete confirmation focuses **Cancel** first.
- Small motion: rows ease in, the strikethrough fades, the checkbox dips when pressed. All motion is switched off when the operating system's "reduce motion" setting is on.
- The checkbox looks 20px but has a larger invisible tap area for touch screens.

## Adding shadcn/ui components

Components are copied into `src/components/ui` and can be edited freely.

```bash
cd client
pnpm dlx shadcn@latest add <component>
```

Components currently used: `alert-dialog`, `button`, `checkbox`, `dialog`, `input`, `skeleton`, `sonner`, `textarea`.

## Assumptions and limitations

- **API required:** there is no offline mode or local persistence. If the API is down, the list cannot load, and the UI shows a retry option.
- **No authentication:** every visitor sees and edits the same shared list.
- **Whole list in memory:** there is no pagination or virtualisation, which is fine for a small list.
- **Validation limits are duplicated:** the 200 and 2000 character limits appear in both the client and server schemas. A shared workspace package would remove the duplication.
- **Toggle is not idempotent:** the API flips the current value, which is why the client limits each row to one in-flight toggle. A "set done to X" endpoint would be safer under concurrency.
- **Light theme only:** there is no theme switcher.
- **English only:** strings are inline and not yet extracted for translation.
- **No automated tests:** behaviour was checked manually in the browser.
- **Multiple tabs:** another tab's changes appear when the window regains focus, after the data is 30 seconds old, not in real time.
- **Browser support:** current evergreen browsers (Vite's default modern target).

## Troubleshooting

| Symptom                                                  | Likely cause and fix                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| "Can't reach the server" on load                         | The API isn't running, or `VITE_API_URL` points to the wrong address                 |
| Same message, and the browser console mentions CORS      | `CLIENT_ORIGIN` in `server/.env` doesn't match the URL the client runs on            |
| Changed `.env` but nothing happened                      | Restart `pnpm dev`; Vite reads environment files at startup                          |
| `@/...` imports not resolving in the editor              | Restart the TypeScript server; the alias is defined in `tsconfig.app.json` and `vite.config.ts` |
