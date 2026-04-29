# Team Task Manager

A production-ready full-stack team task management app. Admins create projects, manage members, and assign tasks; members track and update their work on a Kanban board. Includes JWT auth with role-based access control, a stats dashboard with charts, drag-and-drop, comments, global search (⌘K), and filters.

**Stack:** React 18 · Vite · Tailwind CSS · Node.js · Express · MongoDB + Mongoose · JWT · Recharts · @dnd-kit · Zustand · React Hook Form + Zod

---

## Features

- **Auth:** signup / login, bcrypt-hashed passwords, JWT, persisted session
- **RBAC:** Admin (full control) vs Member (read + update own tasks), enforced server-side
- **Projects:** create, edit, delete, invite members, status (active / completed), deadline
- **Tasks:** title, description, priority (low/medium/high), status (todo/in-progress/completed), due date, assignee, comments
- **Kanban board:** drag & drop with `@dnd-kit`, optimistic updates, RBAC-aware (members can only drag tasks assigned to them)
- **Dashboard:** 6 KPI cards + pie / bar / line charts (Recharts), 7-day productivity trend
- **Global search (⌘K / Ctrl+K):** projects, tasks, members in one modal
- **Filters:** status, priority, assignee, search; per-project and global
- **Polished UI:** responsive, skeleton loaders, toast alerts, smooth animations
- **Hardened API:** Helmet, strict CORS allowlist, rate limiting, Zod validation, central error handler

---

## Repo layout

```
backend/             Express + Mongoose API
frontend/            React + Vite SPA
docker-compose.yml   Optional local MongoDB
README.md
```

---

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB** — pick one:
  - macOS Homebrew: `brew install mongodb-community@6.0`
  - Docker: included `docker-compose.yml`
  - Cloud: a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

## Quick start (local development)

### 1. Start MongoDB

**Option A — Homebrew (macOS):**
```bash
brew services start mongodb-community@6.0
# Listens on mongodb://127.0.0.1:27017 (no auth)
```

**Option B — Docker:**
```bash
docker compose up -d
# Mongo:  mongodb://ttm:ttmpass@localhost:27017
# UI:     http://localhost:8081
```

**Option C — MongoDB Atlas:** create a cluster, allow your IP, copy the connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run seed         # optional: creates demo users + sample project
npm run dev          # → http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env  # default points at http://localhost:4000/api
npm install
npm run dev           # → http://localhost:5173
```

Open **http://localhost:5173** and sign in (or sign up).

### Demo accounts (after `npm run seed`)

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `Password123` | Admin |
| `member@example.com` | `Password123` | Member |

---

## Environment variables

### `backend/.env`

| Variable | Required | Default | Notes |
|---|---|---|---|
| `PORT` | — | `4000` | API port |
| `NODE_ENV` | — | `development` | `development` / `production` |
| `MONGODB_URI` | ✅ | — | e.g. `mongodb://127.0.0.1:27017/team_task_manager` or an Atlas SRV string |
| `JWT_SECRET` | ✅ | — | Long random string (`openssl rand -hex 48`) |
| `JWT_EXPIRES_IN` | — | `7d` | Token TTL |
| `CORS_ORIGIN` | — | `http://localhost:5173` | Comma-separated allowlist |

### `frontend/.env`

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000/api` | Backend API base URL |

---

## API reference

All endpoints are JSON. Authenticated routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/register` | — | `{ name, email, password, role? }` |
| POST | `/login` | — | `{ email, password }` |
| GET  | `/profile` | ✅ | — |

Returns `{ token, user }` from register/login.

### Projects — `/api/projects`

| Method | Path | Role |
|---|---|---|
| GET    | `/` | any |
| GET    | `/:id` | any (must be member) |
| POST   | `/` | admin |
| PUT    | `/:id` | admin / project creator |
| DELETE | `/:id` | admin / project creator (cascades tasks + comments) |
| POST   | `/:id/members` | admin / project creator |
| DELETE | `/:id/members/:userId` | admin / project creator |

### Tasks — `/api/tasks`

| Method | Path | Notes |
|---|---|---|
| GET    | `/?project=&status=&priority=&assignedTo=&search=&mine=true` | Filters |
| GET    | `/:id` | — |
| POST   | `/` | Project admin only |
| PUT    | `/:id` | Members can only change `status` / `order` on tasks assigned to them |
| DELETE | `/:id` | Project admin only |
| GET    | `/:id/comments` | — |
| POST   | `/:id/comments` | `{ message }` |

### Other

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Counts + chart series for the current user's visible projects |
| GET | `/api/users?search=` | User directory (member-pickers, global search) |
| GET | `/health` | Liveness probe |

---

## Role-based access control

| Action | Admin | Member |
|---|---|---|
| Create / edit / delete project | ✅ | ❌ |
| Add / remove project members | ✅ | ❌ |
| Create / edit / delete task | ✅ | ❌ |
| Drag own task on Kanban (status update) | ✅ | ✅ |
| Comment on tasks | ✅ | ✅ |
| View dashboard / projects / tasks | ✅ all | ✅ where they're a member |

Enforced server-side in [`backend/src/middleware/rbac.js`](backend/src/middleware/rbac.js) and per-controller checks. The frontend mirrors it for UX (hidden buttons, drag disabled).

---

## Database schema

```
User      { name, email (unique), password (bcrypt), role: admin|member }
Project   { title, description, deadline, status, createdBy → User, members → [User] }
Task      { title, description, priority, status, dueDate, project → Project,
            assignedTo → User, createdBy → User, order }
Comment   { task → Task, author → User, message }
```

All models include `createdAt` / `updatedAt`. Text indexes on `Project.title/description` and `Task.title/description` power the global search.

---

## Architecture

```
backend/src
  config/       env + db connect
  models/       Mongoose schemas
  middleware/   auth (JWT), rbac, validate (Zod), errorHandler, notFound
  validators/   Zod schemas
  controllers/  business logic
  routes/       thin Express routers
  utils/        ApiError, asyncHandler, token signing
  scripts/      seed.js

frontend/src
  pages/        Login, Signup, Dashboard, Projects, ProjectDetails, Tasks, Profile
  components/   KanbanBoard, TaskCard, TaskFormModal, TaskDetailModal,
                ProjectCard, ProjectFormModal, MemberPicker, GlobalSearch,
                StatsCard, ProtectedRoute, ui/* primitives, layout/*
  store/        Zustand auth store (persisted)
  lib/          axios client + helpers
```

---

## Security

- Passwords hashed with **bcrypt** (cost factor 12)
- **JWT** signed with `JWT_SECRET`, 7-day default expiry, sent via `Authorization: Bearer …`
- 401 responses auto-clear the persisted session in the frontend
- **Helmet** for security headers
- **Strict CORS allowlist** (no wildcards in production)
- **Rate limiting:** 200 req/min/IP globally, 20 req / 15 min / IP for `/auth/*`
- **Zod validation** on every write endpoint; central error handler returns `{ error, details }`
- Mongoose `CastError` and duplicate-key errors translated to `400` / `409`

---

## Deployment

### Backend → Railway

1. Provision MongoDB (recommend [MongoDB Atlas free tier](https://www.mongodb.com/cloud/atlas) or Railway's MongoDB plugin).
2. Create a new Railway project → "Deploy from GitHub" → pick this repo, **root directory = `backend`**.
3. Railway auto-detects the `Dockerfile` and `railway.json` (health check at `/health`).
4. Set env vars:
   - `MONGODB_URI` — Atlas SRV connection string
   - `JWT_SECRET` — `openssl rand -hex 48`
   - `NODE_ENV=production`
   - `CORS_ORIGIN` — your deployed frontend URL
5. Generate a public domain and copy the URL.

### Frontend → Vercel

1. Import the repo, **root directory = `frontend`**.
2. Vercel auto-detects Vite (the `vercel.json` adds the SPA rewrite).
3. Set env var:
   - `VITE_API_BASE_URL=https://<your-backend>.up.railway.app/api`
4. Deploy → copy the Vercel URL back into the backend's `CORS_ORIGIN`.

### Frontend → Railway (alternative)

Vercel is simpler for a static SPA, but Railway works too — point a service at `frontend/`, build with `npm run build`, and serve `dist/` with any static server (e.g. `npx serve -s dist`).

---

## Available scripts

### Backend
```bash
npm run dev      # nodemon, hot-reload
npm start        # production
npm run seed     # wipe + reseed Users / Projects / Tasks
```

### Frontend
```bash
npm run dev      # Vite dev server
npm run build    # production build → dist/
npm run preview  # preview the built app
```

---

## Roadmap (intentionally not in MVP)

- Real-time updates with Socket.io
- Team chat / file attachments / activity log
- Email notifications (assignment + due-date reminders)
- Calendar view + recurring tasks
- Refresh-token rotation + httpOnly cookies
- Dark mode
- E2E + integration test suite

---

## License

MIT
