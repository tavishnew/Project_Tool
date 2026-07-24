# Orbit Redesign â€” Frontend Migration Completion & Backend Alignment

## Executive Summary

Complete the Orbit redesign migration from `oribit_redsign/` into the main `frontend/` codebase, then align the backend as needed. The frontend already has TanStack Router, design tokens, Orbit custom components, and Radix UI components in place. The remaining work is: replace placeholder route pages with full Orbit designs (adapted to use real API calls), wire up polish features (sonner toasts, command palette), remove dead code, and do minimal backend adjustments.

## Current State Assessment

### Already Complete
- TanStack Router file-based routing (`routes/`) â€” active and working
- OKLCH design tokens (coral primary, Sora/Manrope fonts) in `styles.css`
- All Radix UI components in `components/ui/`
- All 12 Orbit custom components in `components/orbit/`
- `sonner.tsx` component exists but not wired
- App layout (`routes/app/index.tsx`) uses AppSidebar + Topbar + GridNoiseBackground + PageTransition
- Dependencies installed: cmdk, framer-motion, sonner, recharts, etc.

### Needs Work
- `routes/index.tsx` (landing) â€” bare placeholder, needs full Orbit hero
- `routes/login.tsx` â€” basic form, needs Orbit AuthShell + AuroraBlob
- `routes/register.tsx` â€” basic form, needs Orbit AuthShell
- `routes/invite/$token/index.tsx` â€” minimal, needs Orbit acceptance UI
- `routes/app/projects/index.tsx` â€” has Orbit components but missing useState import
- `routes/app/projects/$id/index.tsx` â€” imports old pages/BoardPage, needs native Orbit Kanban
- `routes/app/projects/$id/list/index.tsx` â€” imports old pages/ListPage, needs Orbit table
- `routes/app/projects/$id/settings/index.tsx` â€” needs audit and Orbit styling
- `routes/app/members/` â€” needs audit
- Sonner toasts not wired (still using old ToastProvider)
- Command palette not wired (cmdk installed but unused)
- Dead code: pages/ folder, old components/Board.tsx, Column.tsx, TaskCard.tsx, Toast.tsx, Modal.tsx, InviteModal.tsx, ProjectModal.tsx, TaskModal.tsx
- Backend may need workspace members endpoint

## Design

### Architecture
- **Router**: TanStack Router file-based (already set up, keep as-is)
- **Auth Flow**: JWT httpOnly cookies via existing AuthContext + api.ts (unchanged)
- **Data Layer**: TanStack Query + api.ts for all CRUD (already partially set up)
- **UI**: Orbit design system (design tokens + Radix + Orbit custom components)
- **Backend**: Express + pglite, minimal changes only (workspace members if needed)

### Phase 1 â€” Route Page Migration (8 pages)
Each route file gets replaced with the Orbit version from `oribit_redsign/src/routes/`, adapting:
- Mock-store calls â†’ api.ts + TanStack Query hooks
- TanStack Router patterns stay (already compatible)
- Auth check via existing AuthContext (not mock store)

Order of replacement:
1. Landing (`index.tsx`) â€” Orbit hero + AuroraBlob + features grid
2. Login (`login.tsx`) â€” Orbit AuthShell + AuroraBlob + framer-motion
3. Register (`register.tsx`) â€” Orbit AuthShell + AuroraBlob
4. Invite (`invite/$token/index.tsx`) â€” Orbit invite acceptance + project redirect
5. Project board (`$id/index.tsx`) â€” Orbit Kanban (4 columns, drag-drop, TaskDialog)
6. Project list (`$id/list/index.tsx`) â€” Orbit table with PriorityBadge + StatusPill
7. Project settings (`$id/settings/index.tsx`) â€” Orbit Tabs (General/Members/Danger)
8. Members (`app/members/`) â€” Orbit member grid + invite form

### Phase 2 â€” Polish & Cleanup
- Wire sonner Toaster into main.tsx, replace all toast() calls with sonner
- Wire command palette with Cmd+K (cmdk + Command component)
- Add Topbar from Orbit (with search + notifications bell + user dropdown)
- Remove dead code: old `pages/`, old `components/Board.tsx`, `Column.tsx`, `TaskCard.tsx`, `Toast.tsx`, `Modal.tsx`, `InviteModal.tsx`, `ProjectModal.tsx`, `TaskModal.tsx`, `Topbar.tsx`

### Phase 3 â€” Backend Alignment
- Add workspace members endpoint if Orbit members page requires it
- Otherwise, no backend changes (existing schema and API contracts preserved)

### Phase 4 â€” Verification
- `npm run build` passes
- TypeScript clean (`npx tsc --noEmit`)
- All routes render with Orbit design
- Auth flow (login/register/logout/invite) works
- CRUD operations (create/edit/delete projects, tasks, members) work
- Kanban drag-drop works
- Toasts appear on actions
- Cmd+K opens palette
- Responsive layout

### Status Mapping (Orbit 4-status â†’ Backend 3-status)
| Orbit Status | Backend Status |
|-------------|---------------|
| backlog | todo |
| in_progress | in_progress |
| review | in_progress |
| done | done |

### Priority Mapping
| Orbit Priority | Backend Priority |
|---------------|-----------------|
| low | low |
| medium | medium |
| high | high |
| urgent | high |

## Constraints
- Backend schema unchanged (no new columns or tables unless workspace members is absolutely needed)
- Auth flow preserved (JWT cookies, /api/auth/me refresh)
- All existing API routes preserved
- Git history preserved

