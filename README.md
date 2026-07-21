# Cadence — Project Management Tool (MVP)

A focused, zero-config project management tool: projects, tasks, kanban board
with drag-to-move, list view, members, and JWT auth.

Stack: **React + Vite + TypeScript + Tailwind** frontend, **Express + PostgreSQL
(PGlite, embedded & zero-config)** backend. No external database account needed.

## Run locally

```bash
# terminal 1 — backend (PGlite data lives in backend/.data)
cd pm-tool/backend
npm install
npm run dev        # http://localhost:3001

# terminal 2 — frontend
cd pm-tool/frontend
npm install
npm run dev        # http://localhost:5173 (proxies /api -> :3001)
```

Open http://localhost:5173, register an account, and create a project.

## Scripts
- `backend`: `npm run dev` (watch) / `npm start`
- `frontend`: `npm run dev` / `npm run build` / `npm run preview`

## Notes
- Auth uses an httpOnly JWT cookie (7-day expiry); session persists on refresh.
- Inviting a teammate by email requires them to register first (MVP scope).
- The spec originally named MongoDB; this build uses PGlite (Postgres) to keep
  local dev zero-config, per the established Project_Tool setup.
