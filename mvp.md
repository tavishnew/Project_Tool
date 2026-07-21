# Cadence — Project Management Tool (MVP)

**Cadence** is a focused, zero-config project management tool: projects, tasks,
a drag-and-drop kanban board, a sortable list view, members, and JWT auth.

This file is the living MVP spec for the implementation in `pm-tool/`. It tracks
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
| `/projects/:id` | Kanban board (drag to change status) | done |
| `/projects/:id/list` | Sortable table view | done |
| `/projects/:id/settings` | Rename, manage members (owner only) | done |

## Core flows

1. **Create project** — `/projects` → New Project modal → owner auto-added as member.
2. **Add teammate** — settings → invite by email → 404 "user must register first" if unknown.
3. **Create/assign task** — board → Add Task → title, assignee, priority, due date.
4. **Track progress** — drag card between columns → `PATCH /api/tasks/:id` status; project % = done/total.
5. **Overdue flag** — client-side `dueDate < now && status !== 'done'` renders a red badge.

## API endpoints

`POST /api/auth/register|login|logout`, `GET /api/auth/me`,
`GET|POST /api/projects`, `GET|PATCH|DELETE /api/projects/:id`,
`POST|DELETE /api/projects/:id/members[/:userId]`,
`GET /api/projects/:id/tasks` (`?status=&assignee=`),
`POST /api/projects/:id/tasks`, `PATCH|DELETE /api/tasks/:id`.

## Run locally

```bash
# terminal 1 — backend (PGlite data in backend/.data)
cd pm-tool/backend && npm install && npm run dev      # http://localhost:3001

# terminal 2 — frontend (proxies /api -> :3001)
cd pm-tool/frontend && npm install && npm run dev      # http://localhost:5173
```

Open http://localhost:5173, register, and create a project. The backend also
serves the built `frontend/dist` when present, so a single process can host both.

## Acceptance checklist

- [x] Register/login, session persists (JWT cookie + `/auth/me`)
- [x] Create / rename / delete project (owner only)
- [x] Add / remove members (owner only)
- [x] Create task, assign to member, set priority + due date
- [x] Drag task across kanban columns updates status
- [x] List view sortable by due date / priority / assignee
- [x] Overdue tasks visually flagged
- [x] Responsive down to 375px
- [ ] Deployed (Netlify/Vercel + Render + Atlas) — not deployed; local-only per MVP scope

## Verification notes

The backend was smoke-tested end-to-end (register → project → tasks → status
change → delete) including the owner-only endpoints. Two ownership bugs were found
and fixed during implementation: numeric DB ids were compared against the string
`req.user.id`, so `requireProjectOwner` always 403'd and `is_owner` was always
false. Both now coerce before comparing (`backend/auth.js`, `backend/routes/projects.js`).

The frontend was reviewed statically; it was not compiled here because dependency
install requires network access that is unavailable in this environment.
