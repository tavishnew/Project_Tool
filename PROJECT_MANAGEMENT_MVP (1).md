# Project Management Tool — MVP Spec

## 1. Overview
Users create projects, add tasks, assign to teammates, set deadlines, track progress (board/list view). MERN-ish stack, MVP scope.

## 2. Tech Stack
- Frontend: React (Vite), React Router, Axios, Tailwind, `react-beautiful-dnd` or `@dnd-kit/core` for drag-drop board
- Backend: Node.js, Express
- DB: MongoDB + Mongoose
- Auth: JWT (httpOnly cookie), bcrypt
- Hosting: Frontend → Netlify/Vercel. Backend → Render/Railway/Heroku. DB → Atlas.

## 3. Design System
**Style direction:** task-tracking tool, not a marketing/listing site — density, clarity, and status legibility matter more than visual flair. Kanban columns need clean whitespace; status color-coding does the "signature" work instead of ornament. Cool, focused, slightly technical feel (distinct from a consumer-facing job board).

**Color palette**
| Token | Hex | Use |
|---|---|---|
| `--color-primary` | `#1E3A5F` | nav, headers, primary buttons |
| `--color-secondary` | `#6B7A8F` | borders, meta text, inactive states |
| `--color-accent` | `#3DDC97` | primary CTA, "In Progress" highlight |
| `--color-bg` | `#F5F7FA` | page bg |
| `--color-ink` | `#141B2D` | body text |
| `--color-todo` | `#6B7A8F` | To Do column |
| `--color-progress` | `#3DDC97` | In Progress column |
| `--color-done` | `#2E86AB` | Done column |
| `--color-overdue` | `#E4572E` | overdue task badge |

**Typography:**
- Display/headers: `IBM Plex Sans` (600/700) — technical, structured, fits a tool used daily
- Body/UI: `Inter` (400/500)
- Data/labels: `IBM Plex Mono` (small caps/labels, task IDs, timestamps) — reinforces "tool" feel vs a consumer site

**Signature element:** kanban column header uses a thin top border in the status color; task cards show a small colored progress ring instead of a progress bar, keeping cards compact.

## 4. Data Models

```js
// User
{ _id, name, email (unique), passwordHash, avatarUrl, createdAt }

// Project
{
  _id, name, description,
  ownerId: ObjectId(User),
  memberIds: [ObjectId(User)],
  createdAt
}

// Task
{
  _id, projectId: ObjectId(Project),
  title, description,
  assigneeId: ObjectId(User) | null,
  status: 'todo' | 'in_progress' | 'done',
  priority: 'low' | 'medium' | 'high',
  dueDate: Date,
  createdAt
}
```

## 5. API Endpoints

```
POST   /api/auth/register        { name, email, password }
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/projects                  [projects user owns or is member of]
POST   /api/projects                  { name, description }
GET    /api/projects/:id
PATCH  /api/projects/:id              [owner only]
DELETE /api/projects/:id              [owner only]
POST   /api/projects/:id/members      { email } add member [owner only]
DELETE /api/projects/:id/members/:userId  [owner only]

GET    /api/projects/:id/tasks        ?status=&assignee=
POST   /api/projects/:id/tasks        { title, description, assigneeId, priority, dueDate }
PATCH  /api/tasks/:id                 { status, assigneeId, dueDate, priority, ... }
DELETE /api/tasks/:id
```

## 6. Pages / Routes

| Route | Page | Notes |
|---|---|---|
| `/login`, `/register` | Auth | |
| `/projects` | Project List | cards: name, member avatars, progress %, "New Project" |
| `/projects/:id` | Project Board | Kanban (To Do / In Progress / Done), drag to change status, "Add Task" |
| `/projects/:id/list` | List view toggle | table view: task, assignee, due date, priority, status — sortable |
| `/projects/:id/settings` | Project Settings | rename, manage members [owner only] |

## 7. Core Flows
1. **Create project**: `/projects` → New Project modal → name + description → POST /api/projects → owner auto-added as member.
2. **Add teammate**: project settings → invite by email → POST members → if user doesn't exist yet, MVP just errors "user must register first" (no email invite flow in MVP).
3. **Create/assign task**: board view → "Add Task" → title, assignee (dropdown of project members), priority, due date → POST /api/projects/:id/tasks.
4. **Track progress**: drag task card between columns → PATCH status. Project card progress % = done tasks / total tasks.
5. **Overdue flag**: any task `dueDate < now && status !== 'done'` renders red badge, computed client-side from `dueDate`.

## 8. Auth & Security (MVP-adequate)
- bcrypt hashed passwords, JWT httpOnly cookie, 7-day expiry.
- Middleware: `requireAuth`, `requireProjectMember`, `requireProjectOwner`.
- Only project members can view/edit that project's tasks.

## 9. Folder Structure
```
project-mgmt/
  client/
    src/
      pages/
      components/
        Board/
        TaskCard.jsx
      lib/api.js
      styles/tokens.css   # token system above, standalone to this project
  server/
    models/
    routes/
    middleware/
    server.js
  README.md
```

## 10. Animation & Motion

**Stack:** `shadcn/ui` (Radix primitives) + `framer-motion` (orchestration, drag/reorder) + selected `React Bits` (reactbits.dev) for one signature dashboard moment. This is a daily-use tool — motion must feel fast and functional, never decorative or delaying task actions.

**Setup**
```bash
npx shadcn@latest init
npx shadcn@latest add button dialog input select badge skeleton toast dropdown-menu avatar progress
npm install framer-motion
# React Bits: copy component source directly from reactbits.dev (no npm package)
```

**Where motion applies**

| Element | Library | Behavior |
|---|---|---|
| Kanban drag/reorder | Framer Motion `Reorder.Group` / `Reorder.Item` (or `@dnd-kit` + Framer for drop animation) | task card follows cursor, other cards spring out of the way (`layout` prop), drop settles with spring (`stiffness: 400, damping: 30`) |
| Column status change (drag between columns) | Framer `layout` + `AnimatePresence` | card animates position across column boundary, ~200ms |
| Task card mount/unmount | Framer `AnimatePresence` | new task fades+scales in (0.95→1, 150ms); deleted task fades out before removal from DOM |
| Progress ring on task card | React Bits or custom `motion.circle` `strokeDashoffset` animation | animates from 0 to current % on mount/update, 400ms ease-out |
| Project list → project board transition | Framer `layoutId` shared-element | clicking a project card morphs it into the board header (shared layout animation), reinforces spatial continuity |
| Overdue badge appearance | Framer `motion.span` | pulse once (scale 1→1.15→1) when a task crosses into overdue, not a looping pulse |
| Sidebar/settings panel | shadcn `Dialog` or `Sheet` | slide-in from right, Radix default easing |
| Member avatar stack | React Bits (`AnimatedTooltip` style component) | avatars slightly separate/lift on hover to reveal name tooltip |
| Loading states | shadcn `Skeleton` | board columns show skeleton cards while tasks fetch, not spinners |
| Toast on task update | shadcn `Toast` | brief, auto-dismiss 2.5s, no motion beyond default slide-in |

**Rules**
- Respect `prefers-reduced-motion`: disable drag-spring physics and layout animations, fall back to instant snap.
- Drag interactions must never feel laggy — keep spring `stiffness` high (300–500), no long eased drags.
- One signature motion moment: the project-card → board `layoutId` morph. Everything else stays under 250ms and purely functional.

## 11. Acceptance Checklist (MVP done when)
- [ ] Register/login, session persists
- [ ] Create/rename/delete project (owner)
- [ ] Add/remove members
- [ ] Create task, assign to member, set priority + due date
- [ ] Drag task across kanban columns updates status
- [ ] List view sortable by due date / priority / assignee
- [ ] Overdue tasks visually flagged
- [ ] Responsive down to 375px width
- [ ] Deployed: frontend Netlify/Vercel, backend Render, DB Atlas
