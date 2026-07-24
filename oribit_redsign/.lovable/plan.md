## Goal

Rebuild the uploaded Orbit project-management app as a clean, cohesive UI on the current TanStack Start stack. Strict white theme, coral accent, Sora + Manrope typography, shadcn UI + Lucide icons + Framer Motion animations, ReactBits-inspired flourishes. Data is mocked in-memory (no backend), so the whole app is navigable and interactive but nothing persists.

## Design system

Update `src/styles.css`:
- Load Sora + Manrope via `<link>` in `__root.tsx` head.
- Tokens (oklch): background `#ffffff`, surface `#faf7f5`, foreground `#1a1a1a`, muted `#f5f2ef` / `#6b6b6b`, primary/accent `#ff5a4e`, primary-foreground `#ffffff`, border `#ececec`, ring coral at low chroma.
- `--font-display: "Sora"`, `--font-sans: "Manrope"`. Headings use display; body uses sans.
- Radius 0.75rem, soft shadows only.
- Dark mode is not shipped — keep the white theme strictly.

Dashboard background utility (applied on app-shell routes only):
- Faint grid lines (1px, ~4% ink) at 32px spacing via CSS gradient.
- Subtle SVG noise overlay at ~3% opacity.
- Wrapped in a `<GridNoiseBackground/>` component so landing/auth stay flat white.

## Routes (TanStack Start, replaces react-router-dom)

```text
/                       Landing (marketing)
/login                  Login (mock — any creds sign in)
/register               Register (mock)
/app                    Layout w/ sidebar + grid-noise bg + <Outlet/>
  /app/projects         Projects grid (dashboard)
  /app/projects/$id     Board (kanban)
  /app/projects/$id/list List view
  /app/projects/$id/settings Settings
/invite/$token          Invite accept (mock)
* (root notFound)       404
```

Each leaf route sets its own `head()` with unique title + description + og tags. No `og:image` unless a real hero URL exists.

## Components (shadcn + Lucide + Framer Motion)

Install: `framer-motion`, shadcn primitives already present are reused (button, card, dialog, input, dropdown-menu, avatar, badge, tabs, sheet, separator, skeleton, sonner, tooltip, progress, sidebar).

New/rewritten components in `src/components/orbit/`:
- `AppSidebar` — shadcn sidebar, Lucide icons (LayoutGrid, KanbanSquare, ListChecks, Settings, Users, Plus), active route via `useRouterState`, collapsible.
- `Topbar` — search, notifications, avatar dropdown, `SidebarTrigger`.
- `GridNoiseBackground` — reusable white bg wrapper.
- `ProjectCard` — coral progress ring, member avatars, hover lift via `motion.div`.
- `KanbanBoard` / `KanbanColumn` / `TaskCard` — HTML5 drag-and-drop, animated reorders with `AnimatePresence` + `layout`.
- `TaskDialog`, `ProjectDialog`, `InviteDialog` — shadcn `Dialog` + form fields.
- `EmptyState`, `StatCard`, `ProgressRing`, `PriorityBadge`, `StatusPill`.
- `MagneticButton`, `SpotlightCard`, `Aurora` — ReactBits-style, ported to Framer Motion, used sparingly on landing/auth only (kept off dashboard to preserve white).
- `PageTransition` — wraps route content with a subtle fade/slide via `motion` + `AnimatePresence`.

## Mock data layer

`src/lib/mock-store.ts` — Zustand store (add dep) with seeded projects, tasks (columns: Backlog / In Progress / Review / Done), members, current user. Exposes actions: `createProject`, `updateTask`, `moveTask`, `inviteMember`, `login`, `logout`. Persists to `localStorage` (read in `useEffect` to avoid hydration mismatch).

`src/lib/auth-mock.ts` — trivial `useAuth()` hook backed by the same store; `<Protected>` wrapper redirects to `/login`.

## Page redesigns

- **Landing** — hero with Sora display headline, coral CTA, MagneticButton, subtle Aurora blob top-right at 8% opacity, feature grid (3 cards), testimonial strip, footer. Framer Motion `whileInView` reveals.
- **Login / Register** — split screen: left form (shadcn inputs), right side white with big display quote + coral orbital ring illustration.
- **Projects dashboard** — grid-noise bg, stat row (4 StatCards), "Your projects" heading + `New project` coral button, responsive `ProjectCard` grid, empty state.
- **Board** — 4 columns, drag-and-drop tasks with animated reordering, add-task inline, task dialog on click.
- **List** — shadcn `Table` with priority/status pills, filters, sortable headers.
- **Settings** — tabs (General, Members, Danger zone), InviteDialog, member list with role badges.
- **Invite** — centered card, coral accept button.
- **404** — already exists in `__root`; add a friendlier `notFoundComponent` at `/app` layout too.

## Technical notes

- Bootstrap files stay: `src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx` (rewritten to Landing).
- No react-router-dom; all navigation via `@tanstack/react-router` `Link` / `useNavigate`.
- Fonts loaded via `<link>` in root head, referenced in `@theme` — never `@import` a URL in `styles.css`.
- Framer Motion animations respect `prefers-reduced-motion`.
- Icons: Lucide only; no emoji, no other icon sets.
- No hardcoded color classes in components — everything via semantic tokens.
- Backend, `.smoke2.mjs`, Express routes, PGlite — ignored. Not ported.

## Deliverable

A fully navigable redesigned Orbit app: landing → auth → dashboard → board/list/settings, all styled in the new white + coral system with cohesive motion, running entirely on mock data.
