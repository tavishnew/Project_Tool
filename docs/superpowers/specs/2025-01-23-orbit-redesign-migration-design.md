# Orbit Redesign Migration into Project_Tool

## Executive Summary

Migrate the complete Orbit redesign (UI/design system) into the existing Project_Tool application while preserving all backend integration, authentication, API contracts, and business logic.

## Source & Target Analysis

### Source: Orbit Redesign (`oribit_redsign/`)
- **Stack**: TanStack Start + React Router v1 (file-based), TanStack Query v5, React 19, Tailwind CSS v4, Radix UI, Zustand (mock store), Framer Motion
- **Router**: File-based routes in `/src/routes/`
- **State**: Single Zustand store with all CRUD operations + mock data (no backend)
- **Auth**: Mock login persisted to localStorage
- **Pages**: Landing, Login, Register, Invite, Dashboard (Projects), Members, Project Board, Project List, Project Settings
- **Components**: 38 Radix UI components + 12 Orbit custom components
- **Design**: Coral primary (#ff5a4e / oklch(0.68 0.19 32)), Sora/Manrope fonts, Light-only theme, Grid noise background

### Target: Project_Tool (`frontend/`, `backend/`)
- **Stack**: React Router v6, React 18, Vite, Tailwind CSS v3, Express + PostgreSQL (pglite)
- **Router**: `<Routes>` in `App.tsx`
- **State**: AuthContext + per-component state + API calls via `api.ts`
- **Auth**: JWT httpOnly cookies, `/api/auth/me` refresh on load
- **Backend**: Full REST API with auth, project membership, task CRUD, invites
- **Pages**: Landing, Login, Register, Invite, Projects, Board, List, Settings, Members
- **Components**: Custom CSS + 38 shadcn-style components + **12 Orbit components already copied**
- **Design**: Similar OKLCH palette in CSS variables, but Tailwind v3 syntax

## Component Mapping

### Already Present in Project_Tool (12/12 Orbit components copied)
- `app-sidebar.tsx`, `aurora-blob.tsx`, `badges.tsx`, `grid-noise-background.tsx`
- `magnetic-button.tsx`, `member-avatar.tsx`, `new-project-dialog.tsx`
- `orbit-mark.tsx`, `page-transition.tsx`, `progress-ring.tsx`
- `spotlight-card.tsx`, `task-dialog.tsx`, `PriorityBadge.tsx`, `StatusPill.tsx`

### Missing UI Components (need to add from Orbit)
| Component | Source | Purpose |
|-----------|--------|---------|
| `command.tsx` | Orbit `/components/ui/command.tsx` | Command palette (cmdk) |
| `navigation-menu.tsx` | Orbit `/components/ui/navigation-menu.tsx` | Top navigation |
| `context-menu.tsx` | Orbit `/components/ui/context-menu.tsx` | Right-click menus |
| `hover-card.tsx` | Orbit `/components/ui/hover-card.tsx` | Hover previews |
| `popover.tsx` | Orbit `/components/ui/popover.tsx` | Popovers |
| `sheet.tsx` | Orbit `/components/ui/sheet.tsx` | Mobile drawers |
| `carousel.tsx` | Orbit `/components/ui/carousel.tsx` | Carousels |
| `calendar.tsx` | Orbit `/components/ui/calendar.tsx` | Date picker |
| `chart.tsx` | Orbit `/components/ui/chart.tsx` | Charts (recharts) |
| `input-otp.tsx` | Orbit `/components/ui/input-otp.tsx` | OTP input |
| `toggle.tsx`, `toggle-group.tsx` | Orbit `/components/ui/toggle*.tsx` | Toggle switches |
| `resizable.tsx` | Orbit `/components/ui/resizable.tsx` | Resizable panels |
| `sonner.tsx` | Orbit `/components/ui/sonner.tsx` | Toast provider (already have Toast) |

### Data Model Alignment

| Field | Orbit (Mock) | Project_Tool (Backend) | Resolution |
|-------|--------------|------------------------|------------|
| Task Status | `backlog`, `in_progress`, `review`, `done` (4) | `todo`, `in_progress`, `done` (3) | Map: backlog→todo, review→in_progress; or extend backend |
| Task Priority | `low`, `medium`, `high`, `urgent` (4) | `low`, `medium`, `high` (3) | Drop urgent or map to high |
| Project.color | String hex | Not in backend | Add color column or use default |
| Member.color | String hex | Not in backend | Generate from name/avatar |

**Decision**: Keep backend schema unchanged. Map Orbit's 4-status → 3-status in frontend; drop `urgent` priority. Project color stored in frontend only or add optional column later.

## Migration Phases

### Phase 2: Styling System Migration
- Port Orbit's Tailwind v4 design tokens (OKLCH colors, fonts, radius) to Project_Tool's `styles.css`
- Update `tailwind.config.js` / CSS variables to match Orbit palette
- Ensure dark mode mirrors light (Orbit design decision)

### Phase 3: Missing UI Components
- Add 12 missing Radix UI components from Orbit to Project_Tool
- Install missing deps: `cmdk`, `vaul`, `embla-carousel-react`, `recharts`, `react-day-picker`, `input-otp`, `react-resizable-panels`

### Phase 4: Page Migration (one by one, preserving API calls)
1. **LandingPage** — Replace with Orbit design, keep auth redirects
2. **LoginPage** — Replace with Orbit AuthShell + AuroraBlob, keep invite token logic
3. **RegisterPage** — Orbit design + invite prefill
4. **InvitePage** — Orbit design + backend acceptInvite
5. **ProjectsPage** — Orbit dashboard layout, stats cards, SpotlightCard grid, NewProjectDialog
6. **MembersPage** — Orbit member management UI, keep invite/create logic
7. **BoardPage** — Orbit Kanban columns (4 status), TaskCard, drag-drop, TaskDialog
8. **ListPage** — Orbit table with search/sort, PriorityBadge/StatusPill
9. **SettingsPage** — Orbit Tabs (General|Members|Danger), keep API calls

### Phase 5: Business Logic Reconnection
- All pages use existing `api.ts` functions
- AuthContext unchanged
- Status/priority mapping in components
- Member colors generated client-side

### Phase 6: New Features from Orbit
- Command palette (Cmd+K)
- Global search in Topbar
- Notifications (Bell icon + sonner toasts)
- Page transitions (Framer Motion)
- Empty states, loading skeletons, error boundaries

### Phase 7: Dead UI Removal
- Remove old custom CSS button classes (`.btn`, `.card`, etc.) once Radix components used everywhere
- Remove unused pages/components
- Clean up duplicate utilities

### Phase 8: Styling Polish
- Verify all colors, spacing, animations match Orbit
- Responsive breakpoints
- Reduced motion support

### Phase 9: Code Quality
- Remove dead imports, unused files
- Deduplicate utilities
- TypeScript strict mode clean

### Phase 10: Validation
- `npm run build` passes
- `npm run lint` passes
- TypeScript no errors
- All routes work
- Auth flow works
- CRUD operations work
- Responsive + dark mode

## Constraints Checklist
- ✅ Backend unchanged (Express + pglite + JWT)
- ✅ Database schema unchanged
- ✅ API contracts unchanged
- ✅ Authentication flow preserved
- ✅ Existing features not removed
- ✅ Git history preserved

## Success Criteria
1. Project_Tool builds and runs with zero errors
2. All 10 pages render with Orbit design
3. All CRUD operations functional via backend API
4. Authentication (login/register/logout/invite) works
5. Command palette opens with Cmd+K
6. Kanban drag-drop works with 4 columns (mapped to 3 backend statuses)
7. Responsive layout works mobile/desktop
8. Toast notifications appear for actions