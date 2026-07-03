# Boardly

A multi-project task tracker with JWT auth, per-user data isolation, a kanban board, and a small analytics view. Built as a scoped, ship-in-3-days portfolio project rather than a sprawling feature list — the goal was a clean, fully working slice of a real product, not a partially-working big one.

## Features

- Email/password auth with JWT, bcrypt password hashing, and route-level guards
- Per-user data isolation: every project and task is scoped to its owner, enforced server-side, not just hidden in the UI
- Full CRUD for projects and tasks
- Kanban board (To do / In progress / Done) with optimistic UI updates
- Dashboard stats: total tasks, in-progress, done, overdue
- Zod-validated API with centralized error handling
- Backend test suite covering auth flow and tenant isolation (the part that actually matters in a multi-tenant app)
- Dockerized, one-command local run via `docker-compose up`

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | SQLite via Prisma (swap to Postgres by changing one line — see below) |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Testing | Vitest, Supertest |
| Deploy | Docker, docker-compose |

## Why these choices

- **SQLite for the demo, Postgres-ready for production.** Prisma abstracts the database, so the schema and every query are mostly identical either way. To switch: change `provider = "sqlite"` to `"postgresql"` in `backend/prisma/schema.prisma`, point `DATABASE_URL` at a Postgres instance, and delete/regenerate the migrations folder (`npx prisma migrate dev`).
- **`status`/`priority` are plain strings, not Prisma enums.** SQLite's connector doesn't support native enums — Prisma will fail schema validation if you declare one. Valid values are enforced at the API layer with Zod instead (see `backend/src/routes`). If you migrate to Postgres, these can be promoted back to real enum types.
- **Ownership checked at the data layer, not the UI.** `loadOwnedProject` is the single chokepoint every project- and task-scoped route goes through. It's tested directly (see `tests/isolation.test.js`) by trying to read/update/delete another user's project and asserting it's rejected.
- **Optimistic UI on the kanban board.** Moving a task updates local state immediately and reconciles with the server after; on failure it reloads from source of truth rather than leaving the UI in a lying state.
- **No real-time, no OAuth, no billing.** Deliberately cut to fit a 3-day scope. See "What I'd add next."

## Running locally

### With Docker (fastest)

```bash
docker-compose up --build
```

Frontend: http://localhost:5173 · API: http://localhost:4000/api

### Without Docker

```bash
# backend
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy   # applies the included migration, creates dev.db
npm run dev

# frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

> The `prisma/migrations` folder is included in this repo, so `migrate deploy` will just apply it — you don't need to run `migrate dev` unless you change the schema yourself.

### Running tests

```bash
cd backend
npm test
```

## API overview

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | – |
| POST | `/api/auth/login` | – |
| GET | `/api/auth/me` | ✓ |
| GET/POST | `/api/projects` | ✓ |
| GET/PATCH/DELETE | `/api/projects/:id` | ✓, owner only |
| GET/POST | `/api/projects/:id/tasks` | ✓, owner only |
| GET | `/api/projects/:id/stats` | ✓, owner only |
| PATCH/DELETE | `/api/tasks/:id` | ✓, owner only |

## What I'd add next

- Real-time task updates via WebSocket (deliberately cut — the biggest single time sink relative to what it demonstrates beyond the optimistic-update pattern already shown)
- OAuth (GitHub/Google) alongside email/password
- Workspaces with multiple members and roles (Owner/Admin/Member), rather than single-owner projects
- Rate limiting on auth endpoints
- E2E tests with Playwright covering the full create-project → create-task → move-task flow

## Project structure

```
boardly/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── routes/        auth, projects, tasks
│   │   ├── middleware/     auth guard, error handler
│   │   └── utils/          prisma client, ownership check
│   └── tests/               auth + isolation test suites
├── frontend/
│   └── src/
│       ├── pages/            Login, Register, Dashboard, ProjectBoard
│       ├── components/       Navbar, TaskCard, modals, stats
│       └── context/          AuthContext
└── docker-compose.yml
```
