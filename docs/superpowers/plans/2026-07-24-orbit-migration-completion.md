# Orbit Migration Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Complete the Orbit redesign migration by replacing placeholder route pages with full Orbit designs, wiring polish features, removing dead code, and aligning the backend.

**Architecture:** Incremental replacement of route file contents from oribit_redsign/src/routes/ into frontend/src/routes/, adapting mock-store calls to use api.ts + TanStack Query. Backend stays unchanged unless workspace members endpoint is needed.

**Tech Stack:** React 18, TypeScript, TanStack Router (file-based), TanStack Query v5, Framer Motion, Sonner, Radix UI, Tailwind CSS v3, Express + pglite.

## Global Constraints

- Backend schema unchanged (no new columns/tables unless workspace members is required)
- Auth flow preserved (JWT httpOnly cookies, /api/auth/me refresh, AuthContext)
- All existing API routes preserved
- TanStack Router routes stay as-is (DO NOT switch back to react-router-dom)
- npm run build and npx tsc --noEmit must pass at each commit
- Dark mode mirrors light (Orbit design decision)
- Tailwind v3 syntax only (not v4)
- Git history preserved - incremental commits

---

### Task 1: Migrate Landing Page (index.tsx)

**Files:**
- Modify: frontend/src/routes/index.tsx

**Interfaces:**
- Consumes: useAuth from @/auth, Orbit components (OrbitMark, AuroraBlob, SpotlightCard, MagneticButton, GridNoiseBackground), Link from @tanstack/react-router, lucide-react icons
- Produces: Full Orbit landing page at /

**Reference:** orbit_redsign/src/routes/index.tsx

- [ ] **Step 1.1: Replace routes/index.tsx with full Orbit landing design**

Replace the bare placeholder with Orbit hero + AuroraBlob + features grid + CTA. Adapt the Orbit source by replacing the mock auth check with useAuth() (if user logged in, redirect to /app).

Key sections:
1. Fixed nav with OrbitMark + Sign in / Get started buttons
2. Hero with AuroraBlob background + animated headline + CTA buttons (MagneticButton)
3. Features grid with 6 SpotlightCards
4. Workflow preview section
5. Pricing CTA section
6. Footer

Use Link from @tanstack/react-router instead of <a> tags.

- [ ] **Step 1.2: Build check** - cd frontend && npx tsc --noEmit

- [ ] **Step 1.3: Commit** - git add frontend/src/routes/index.tsx && git commit -m "feat: replace landing page with full Orbit design"

### Task 2: Migrate Login Page

**Files:**
- Modify: frontend/src/routes/login.tsx

**Interfaces:**
- Consumes: api.login from @/api, useAuth.setUser from @/auth, useNavigate, OrbitMark, AuroraBlob, Input, Label, Button, framer-motion
- Produces: Orbit login page at /login with AuthShell + AuroraBlob

**Reference:** orbit_redsign/src/routes/login.tsx

- [ ] **Step 2.1: Replace routes/login.tsx with Orbit AuthShell design**

Adapt from Orbit source:
- Replace useStore login with api.login + setUser
- Keep useNavigate from @tanstack/react-router
- Use OrbitMark and AuroraBlob for the left panel
- Use motion (framer-motion) for animated form transitions
- Preserve invite token redirect logic if present

- [ ] **Step 2.2: Build check** - cd frontend && npx tsc --noEmit

- [ ] **Step 2.3: Commit** - git add frontend/src/routes/login.tsx && git commit -m "feat: replace login page with Orbit AuthShell design"

### Task 3: Migrate Register Page

**Files:**
- Modify: frontend/src/routes/register.tsx

**Interfaces:**
- Consumes: api.register from @/api, useAuth.setUser from @/auth, useNavigate, OrbitMark, AuroraBlob, Input, Label, Button, framer-motion
- Produces: Orbit register page at /register with AuthShell + AuroraBlob

**Reference:** orbit_redsign/src/routes/register.tsx

- [ ] **Step 3.1: Replace routes/register.tsx with Orbit AuthShell design**

Same pattern as login - adapt Orbit source replacing useStore with api.register + setUser.

- [ ] **Step 3.2: Build check** - cd frontend && npx tsc --noEmit

- [ ] **Step 3.3: Commit** - git add frontend/src/routes/register.tsx && git commit -m "feat: replace register page with Orbit AuthShell design"

### Task 4: Migrate Invite Page

**Files:**
- Modify: frontend/src/routes/invite./index.tsx

**Interfaces:**
- Consumes: api.acceptInvite, useNavigate, useParams (token), OrbitMark, AuroraBlob, Button
- Produces: Orbit invite acceptance page at /invite/\

**Reference:** orbit_redsign/src/routes/invite.\.tsx

- [ ] **Step 4.1: Replace invite route with Orbit design**

Adapt Orbit source - replace mock-store invite acceptance with api.acceptInvite(token), redirect to project on success.

- [ ] **Step 4.2: Build check + commit**

### Task 5: Migrate Project Board (Kanban)

**Files:**
- Modify: frontend/src/routes/app/projects/`$id/index.tsx
- Create (if needed): frontend/src/components/orbit/task-dialog.tsx (from orbit_redsign/src/components/orbit/task-dialog.tsx)

**Interfaces:**
- Consumes: api.getProject, api.listTasks, api.updateTask, api.createTask, api.deleteTask, useAuth, useNavigate, useParams (id param), PriorityBadge, MemberAvatar, TaskDialog, Button, Input, framer-motion
- Produces: Orbit Kanban board at /app/projects/`$id

**Status mapping:** backlog -> todo, in_progress -> in_progress, review -> in_progress, done -> done

**Reference:** orbit_redsign/src/routes/app.projects.\.index.tsx

- [ ] **Step 5.1: Copy task-dialog.tsx from Orbit if missing**

- [ ] **Step 5.2: Replace board route with Orbit Kanban**

Replace the current file (imports old pages/BoardPage) with native Orbit Kanban:
- 4 columns: Backlog, In Progress, Review, Done
- Map statuses for API calls
- HTML5 drag-drop for moving tasks between columns
- Click task opens TaskDialog
- Add task inline per column
- Framer-motion animations for cards
- Topbar with tabs (Board | List | Settings) using TanStack Router Link

- [ ] **Step 5.3: Fix useParams bug** - current file uses { projectId } but TanStack Router param is id

- [ ] **Step 5.4: Build check + commit**

### Task 6: Migrate Project List Page

**Files:**
- Modify: frontend/src/routes/app/projects/`$id/list/index.tsx

**Interfaces:**
- Consumes: api.getProject, api.listTasks, api.updateTask, api.deleteTask, PriorityBadge, StatusPill, MemberAvatar, Table, Input, Search
- Produces: Orbit list view at /app/projects/`$id/list

**Reference:** orbit_redsign/src/routes/app.projects.\.list.tsx

- [ ] **Step 6.1: Replace list route with Orbit table**

Replace current file (imports old pages/ListPage) with Orbit table:
- Search input
- Sortable columns: Task, Status, Priority, Assignee, Due date
- Click row opens TaskDialog
- PriorityBadge and StatusPill components
- Empty state

- [ ] **Step 6.2: Build check + commit**

### Task 7: Migrate Project Settings Page

**Files:**
- Modify: frontend/src/routes/app/projects/`$id/settings/index.tsx

**Interfaces:**
- Consumes: api.getProject, api.updateProject, api.addMember, api.removeMember, api.deleteProject, api.createInvite, api.listInvites, api.revokeInvite, Tabs, Input, Button, Badge, MemberAvatar
- Produces: Orbit settings page at /app/projects/`$id/settings

**Reference:** orbit_redsign/src/routes/app.projects.\.settings.tsx

- [ ] **Step 7.1: Replace settings route with Orbit Tabs design**

Orbit settings has 3 tabs:
1. General - edit project name, description, save
2. Members - list with remove buttons, invite form, invite link
3. Danger - delete project with confirmation

Adapt from Orbit source, replace useStore with real API calls.

- [ ] **Step 7.2: Build check + commit**

### Task 8: Migrate Members Page

**Files:**
- Modify: frontend/src/routes/app/members/index.tsx

**Interfaces:**
- Consumes: api.listMembers (or add this endpoint), MemberAvatar, Badge, Button, Input
- Produces: Orbit members page at /app/members

**Reference:** orbit_redsign/src/routes/app.members.tsx

- [ ] **Step 8.1: Replace members route with Orbit design**

If backend has no workspace members endpoint, either:
- Add a minimal backend endpoint (GET /api/members), or
- Reuse project members for now

Choose pragmatic option (reuse project members).

- [ ] **Step 8.2: Build check + commit**

### Task 9: Wire Up Sonner Toasts

**Files:**
- Modify: frontend/src/main.tsx
- Modify: All route files using old toast patterns
- Delete (later): frontend/src/components/Toast.tsx

**Interfaces:**
- Consumes: Toaster from @/components/ui/sonner, toast from sonner
- Produces: Global toast system using Sonner

- [ ] **Step 9.1: Add Sonner Toaster to main.tsx**

Replace <ToastProvider> with <Toaster position=\"top-right\" /> from sonner.

- [ ] **Step 9.2: Update toast calls across all routes**

Replace old notify()/toast() with: import { toast } from 'sonner'; toast.success() / toast.error()

Files to update: all route files in routes/app/

- [ ] **Step 9.3: Build check + commit**

### Task 10: Wire Up Command Palette (Cmd+K)

**Files:**
- Modify: frontend/src/routes/app/index.tsx (add CommandPalette to app layout)
- Create: frontend/src/components/orbit/command-palette.tsx

**Interfaces:**
- Consumes: Command from @/components/ui/command (cmdk), useNavigate from @tanstack/react-router
- Produces: Global Cmd+K command palette on all authenticated pages

- [ ] **Step 10.1: Create CommandPalette component**

Component that:
- Uses CommandDialog from cmdk
- Opens on Cmd+K / Ctrl+K keyboard shortcut
- Has commands for navigating to routes (Projects, Members, Settings)
- Has commands for creating new projects/tasks

- [ ] **Step 10.2: Add CommandPalette to app layout (routes/app/index.tsx)**

- [ ] **Step 10.3: Build check + commit**

### Task 11: Remove Dead Code

**Files:**
- Delete: frontend/src/pages/ (entire folder)
- Delete: frontend/src/components/Board.tsx, Column.tsx, TaskCard.tsx, Toast.tsx, Modal.tsx, InviteModal.tsx, ProjectModal.tsx, TaskModal.tsx, Topbar.tsx

- [ ] **Step 11.1: Check for imports before deleting**

- [ ] **Step 11.2: Delete old pages folder and old components**

- [ ] **Step 11.3: Build check**

- [ ] **Step 11.4: Commit - git add -A && git commit -m \"chore: remove dead code (old pages and components)\"**

### Task 12: Final Verification

- [ ] **Step 12.1: Build passes** - cd frontend && npm run build
- [ ] **Step 12.2: TypeScript clean** - npx tsc --noEmit
- [ ] **Step 12.3: Smoke test** - All routes render, auth works, CRUD works, drag-drop works, toasts appear, Cmd+K opens palette

---

## Execution Handoff

Plan saved. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
**2. Inline Execution** - Execute tasks in this session

**Which approach?**
