# Project_Tool — Claude Code Task List

Run these tasks **one at a time, in order**. After each task: run the app locally,
visually confirm the change in the browser, run `npm run build` and
`npx tsc --noEmit`, then commit before moving to the next task. Do not batch
multiple tasks into one commit — if something doesn't show up locally, you need
to know which single task broke it.

Reference files: `frontend/src/routes/app.index.tsx` (Dashboard),
`frontend/src/routes/app.projects.tsx` (Projects list),
`frontend/src/routes/app.projects.$id.index.tsx` (Kanban board),
`frontend/src/components/orbit/progress-ring.tsx`.

---

## Before you start

1. Confirm which dev server process is actually serving the browser tab you'll
   check against — run `ps aux | grep -E "vite|node"` and note the port. Kill
   any stale/duplicate dev server processes so there's exactly one running.
2. Run `git status` — working tree should be clean before task 1.
3. After every task, do a **hard refresh** (disable cache in devtools or use
   an incognito window) before deciding whether a change "isn't showing up."

---

## Task 1 — Extract shared data hook

Extract the shared data-fetching logic from `app.index.tsx` and
`app.projects.tsx` (projects query, tasks query, members query,
`generateMemberColor`, and the stats array calculation) into a single hook
`useProjectsOverview()` in `src/hooks/use-projects-overview.ts`. Update both
routes to import and call this hook, and delete the old inline `useQuery`
calls and stats logic from both files — do not leave the old code sitting
alongside the new hook.

**Verify:** Load `/` and `/projects` in the browser. Stats numbers should
match on both pages and come from Network tab requests to the same
endpoints, not duplicated calls per page.

---

## Task 2 — Parallelize independent queries

In `useProjectsOverview()`, ensure the members query has no `enabled`
dependency on the projects query and starts immediately in parallel. Only the
tasks query should depend on projects resolving first.

**Verify:** Open React Query devtools (or the Network tab), reload `/`, and
confirm the members request and projects request fire at the same time, not
one after the other.

---

## Task 3 — Differentiate the Projects page header

In `app.projects.tsx`, replace the greeting header (date + "Good to see you,
{name}") with: a page title "Projects", the total project count next to it,
and a right-aligned toolbar area (search input, status filter dropdown, "New
project" button — filter/search wiring comes in Task 4). Leave the greeting
header only on `app.index.tsx`.

**Verify:** `/projects` should visually look distinct from `/` — no
greeting/date at the top of `/projects`.

---

## Task 4 — Search, filter, sort, pagination on Projects page

In `app.projects.tsx`, add local state for a search string and a status
filter (`"all" | "active" | "completed" | "archived"`). Filter the `projects`
array by case-insensitive name match and status before rendering the grid.
Add a sort control (Recently updated / Name A-Z / Progress). If
`projects.length > 12`, paginate the grid at 12 per page with Previous/Next
controls below the grid.

**Verify:** Type in the search box on `/projects` and confirm the grid
filters live. Switch the status filter and sort dropdown and confirm the
grid reorders/filters accordingly.

---

## Task 5 — Accessible status labels (remove color-only indicators)

In `app.projects.$id.index.tsx` and `app.index.tsx`, wherever a status dot
(`<span className="h-2 w-2 rounded-full ...">`) appears next to a task, add
an `sr-only` text label describing the status (e.g. "Status: In Progress").
Confirm the visible status label text is always present nearby, not implied
by color alone. Check color contrast of each status dot against its
background meets WCAG AA (4.5:1 text / 3:1 graphical).

**Verify:** Inspect the DOM in devtools next to a status dot and confirm the
`sr-only` span is present with correct text for each status.

---

## Task 6 — Keyboard-accessible task status changes

In `app.projects.$id.index.tsx`, ensure the "Change status" dropdown menu
(via the `MoreHorizontal` button on each task card) is fully keyboard
operable: tab to focus, Enter/Space to open, arrow keys to move between
items, visible focus ring. Add `aria-label="Task actions"` to the trigger
button. Confirm tab order moves logically column by column, card by card
across the whole board.

**Verify:** Unplug the mouse mentally — using only Tab/Enter/Arrow keys/Space,
open a task's menu and change its status without ever dragging.

---

## Task 7 — Progress ring numeric label + ARIA

In `src/components/orbit/progress-ring.tsx`, add a centered numeric
percentage label inside the ring (e.g. "62%") sized to fit the ring's current
dimensions. Add `role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`,
`aria-valuemax={100}`, and an `aria-label`.

**Verify:** Every place ProgressRing renders (dashboard, project cards)
should now show a visible percentage number, not just a bare ring.

---

## Task 8 — Relative timestamps

Add `date-fns` as a dependency if not already present. In `app.index.tsx`,
add a right-aligned relative timestamp (e.g. "2h ago", "3d ago") to each
Recent Tasks list item and each Backlog list item, derived from
`created_at` using `formatDistanceToNowStrict`.

**Verify:** Recent Tasks and Backlog items on `/` show a relative time next
to each entry.

---

## Task 9 — Clarify "Backlog" section labeling

In `app.index.tsx`, rename the dashboard "Backlog" section header to
"Backlog (all projects)" and add a one-line subcopy: "Unstarted tasks across
every project — open a project board to work them."

**Verify:** The dashboard Backlog section header text has changed and the
subcopy line is visible underneath it.

---

## Task 10 — Shared loading skeleton

Extract a shared `DashboardSkeleton` component into
`src/components/orbit/dashboard-skeleton.tsx`, matching the existing
skeleton pattern from `app.index.tsx` (animate-pulse stat cards + skeleton
grid placeholders). Use it in both `app.index.tsx` and `app.projects.tsx`
in place of their current (inconsistent) loading states.

**Verify:** Throttle network in devtools (Slow 3G), reload both `/` and
`/projects`, and confirm both show the same skeleton pattern while loading.

---

## After all tasks

Run `npm run build` and `npx tsc --noEmit` one final time. Then do a full
manual pass in the browser: `/` and `/projects` and one project's Kanban
board (`/projects/:id`), confirming every change above is actually visible
and interactive — not just present in the source files. Report back a
checklist of what you visually confirmed, not just what compiled.