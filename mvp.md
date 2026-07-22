# Orbit — Modern Project Management Platform (MVP)

**Orbit** is a focused, zero-config project management platform: projects, tasks,
a drag-and-drop kanban board, a sortable list view, members, and JWT auth.

This file is the living MVP spec for the implementation. It tracks
what is built, the deliberate stack decisions, and how to run it.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | React Router for routing, plain `fetch` + Axios-free `api.ts` wrapper |
| Styling | Tailwind CSS + CSS design tokens | Theme tokens mirror the spec palette in `styles.css` |
| Backend | Node.js + Express (ESM) | `server.js` boots PGlite then mounts routes |
| Database | PostgreSQL via **PGlite** (embedded, file-based) | Zero-config: no server or Atlas account needed for local dev |
| Auth | JWT in httpOnly cookie + bcrypt | 7-day expiry; `requireAuth` / `requireProjectMember` / `requireProjectOwner` middleware |

> **Deviation from the original spec:** the spec named MongoDB + Mongoose and
> framer-motion / dnd-kit / React Bits. This build uses PGlite (Postgres) to keep
> local development zero-config, and native HTML5 drag-and-drop + CSS transitions
> instead of the animation libraries. Behavior and the design system are preserved.

## Design system

The token palette from the spec is implemented verbatim in `frontend/src/styles.css`:

| Token | Hex | Use |
|---|---|---|
| `--primary` | `#1E3A5F` | nav, headers, primary buttons |
| `--accent` | `#3DDC97` | CTA, "In Progress" highlight |
| `--bg` | `#F5F7FA` | page background |
| `--ink` | `#141B2D` | body text |
| `--todo` | `#6B7A8F` | To Do column |
| `--progress` | `#3DDC97` | In Progress column |
| `--done` | `#2E86AB` | Done column |
| `--overdue` | `#E4572E` | overdue badge |

Fonts (`IBM Plex Sans` for display, `Inter` for UI, `IBM Plex Mono` for data)
are loaded from Google Fonts in `frontend/index.html`. The signature elements are
present: kanban column headers carry a thin top border in the status color, and
task cards show a compact progress ring instead of a bar.

## Data models

`users`, `projects`, `project_members`, `tasks` (see `backend/db.js` schema).
Ids are integers in the DB and serialized as strings across the API.

## Routes / pages

| Route | Page | Status |
|---|---|---|
| `/login`, `/register` | Auth | done |
| `/projects` | Project list (cards + progress %, New Project) | done |
| `/projects/:id` | Kanban board (drag-and-drop) | done |
| `/projects/:id/list` | List view (sortable table) | done |
| `/projects/:id/settings` | Members, invites, project details | done |

## API surface (excerpt)

All endpoints under `/api` unless noted.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create account, set cookie |
| `POST` | `/auth/login` | — | Verify credentials, set cookie |
| `POST` | `/auth/logout` | ✓ | Clear cookie |
| `GET` | `/auth/me` | ✓ | Current user |
| `GET` | `/projects` | ✓ | List users projects |
| `POST` | `/projects` | ✓ | Create project (owner = caller) |
| `GET` | `/projects/:id` | ✓ | Project + members + task counts |
| `PATCH` | `/projects/:id` | owner | Update name / description |
| `DELETE` | `/projects/:id` | owner | Delete project + tasks |
| `POST` | `/projects/:id/members` | owner | Invite by email |
| `DELETE` | `/projects/:id/members/:uid` | owner | Remove member |
| `GET` | `/project/:id/tasks` | member | All tasks for board/list |
| `POST` | `/project/:id/tasks` | member | Create task |
| `PATCH` | `/tasks/:id` | member | Update task |
| `DELETE` | `/tasks/:id` | member | Delete task |

## Run locally

```bash
# terminal 1 — backend (PGlite data lives in backend/.data)
cd backend
npm install
npm run dev        # http://localhost:3001

# terminal 2 — frontend
cd frontend
npm install
npm run dev        # http://localhost:5173 (proxies /api -> :3001)
```

Open http://localhost:5173, register, and create a project.

## Scripts

- `backend`: `npm run dev` (watch) / `npm start`
- `frontend`: `npm run dev` / `npm run build` / `npm run preview` 
