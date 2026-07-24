# Orbit Redesign Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully migrate the Orbit redesign UI/Design System into Project_Tool while preserving all existing backend integration, authentication, APIs, business logic, and data flow.

**Architecture:** Incremental migration — replace frontend pages/components with Orbit equivalents one at a time, keeping the existing React Router v6 + AuthContext + api.ts layer intact. Orbit's file-based TanStack Router is NOT adopted; Project_Tool's existing routing stays.

**Tech Stack:** React 18, React Router v6, Vite, Tailwind CSS v3, Express + pglite (backend unchanged), Radix UI, Framer Motion, Zustand (only for mock store in Orbit — NOT used in production), TanStack Query (add for server state), Sonner (toasts).

## Global Constraints

- Backend (Express + pglite + JWT cookies) unchanged — no schema changes, no API contract changes
- Authentication flow (JWT httpOnly cookies, `/api/auth/me` refresh) preserved
- All existing CRUD operations via `api.ts` preserved
- Current routes (`/`, `/login`, `/register`, `/invite/:token`, `/projects`, `/projects/:id`, `/projects/:id/list`, `/projects/:id/settings`, `/members`) preserved
- Git history preserved — incremental commits
- TypeScript strict mode, ESLint, no build errors at each step
- Tailwind v3 syntax maintained (not v4)
- Dark mode mirrors light (Orbit design decision)

---

### Task 1: Install Missing Dependencies

**Files:**
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: Installed packages available for import

- [ ] **Step 1.1: Add missing Orbit dependencies**

```bash
cd C:/Users/tavis/Project_Tool/frontend
npm install cmdk@^1.1.1 vaul@^1.1.2 embla-carousel-react@^8.6.0 recharts@^2.15.4 react-day-picker@^9.14.0 input-otp@^1.4.2 react-resizable-panels@^4.6.5 @radix-ui/react-navigation-menu@^1.2.14 @radix-ui/react-context-menu@^2.2.16 @radix-ui/react-hover-card@^1.1.15 @radix-ui/react-popover@^1.1.15 @radix-ui/react-sheet@^1.1.15 @radix-ui/react-toggle@^1.1.10 @radix-ui/react-toggle-group@^1.1.11 @radix-ui/react-calendar@^1.1.8 @radix-ui/react-slider@^1.3.6 @tanstack/react-query@^5.101.1 sonner@^2.0.7
```

- [ ] **Step 1.2: Install dev dependency for Framer Motion (already in Orbit)**

```bash
npm install -D framer-motion@^12.42.2
```

- [ ] **Step 1.3: Verify install and commit**

```bash
npm ls cmdk vaul embla-carousel-react recharts react-day-picker input-otp react-resizable-panels sonner @tanstack/react-query
git add package.json package-lock.json
git commit -m "deps: add Orbit redesign dependencies (cmdk, vaul, sonner, etc.)"
```

---

### Task 2: Migrate Design Tokens (Tailwind Config + CSS Variables)

**Files:**
- Modify: `frontend/tailwind.config.js` (create if not exists) or update `frontend/src/styles.css`
- Modify: `frontend/src/styles.css`

**Interfaces:**
- Consumes: Orbit's `oribit_redsign/src/styles.css` (OKLCH palette, fonts, radius)
- Produces: Project_Tool CSS variables matching Orbit design system

- [ ] **Step 2.1: Read Orbit design tokens**

```bash
cat C:/Users/tavis/Project_Tool/oribit_redsign/src/styles.css
```

- [ ] **Step 2.2: Replace `frontend/src/styles.css` with Orbit tokens adapted for Tailwind v3**

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.75rem;

    --font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;
    --font-display: 'Sora', ui-sans-serif, system-ui, sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

    --background: oklch(1 0 0);
    --surface: oklch(0.985 0.005 60);
    --foreground: oklch(0.18 0.01 40);

    --card: oklch(1 0 0);
    --card-foreground: oklch(0.18 0.01 40);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.18 0.01 40);

    /* Coral #ff5a4e - oklch(0.68 0.19 32) */
    --primary: oklch(0.68 0.19 32);
    --primary-foreground: oklch(1 0 0);
    --primary-soft: oklch(0.96 0.03 32);

    --secondary: oklch(0.97 0.008 60);
    --secondary-foreground: oklch(0.2 0.01 40);
    --muted: oklch(0.965 0.006 60);
    --muted-foreground: oklch(0.5 0.01 40);
    --accent: oklch(0.96 0.03 32);
    --accent-foreground: oklch(0.35 0.15 32);

    --destructive: oklch(0.62 0.22 25);
    --destructive-foreground: oklch(1 0 0);
    --overdue: oklch(0.62 0.22 25);
    --success: oklch(0.68 0.15 155);
    --warning: oklch(0.78 0.14 80);
    --info: oklch(0.65 0.13 240);

    --border: oklch(0.925 0.005 60);
    --input: oklch(0.925 0.005 60);
    --ring: oklch(0.68 0.19 32 / 40%);

    --chart-1: oklch(0.68 0.19 32);
    --chart-2: oklch(0.75 0.12 60);
    --chart-3: oklch(0.65 0.13 240);
    --chart-4: oklch(0.68 0.15 155);
    --chart-5: oklch(0.55 0.15 300);

    --sidebar: oklch(0.995 0.003 60);
    --sidebar-foreground: oklch(0.25 0.01 40);
    --sidebar-primary: oklch(0.68 0.19 32);
    --sidebar-primary-foreground: oklch(1 0 0);
    --sidebar-accent: oklch(0.96 0.03 32);
    --sidebar-accent-foreground: oklch(0.35 0.15 32);
    --sidebar-border: oklch(0.93 0.005 60);
    --sidebar-ring: oklch(0.68 0.19 32 / 40%);
  }

  .dark {
    color-scheme: light;
  }

  * {
    border-color: hsl(var(--border));
  }

  html, body, #root {
    height: 100%;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }
}

@layer utilities {
  .grid-noise-bg {
    background-color: hsl(var(--background));
    background-image:
      linear-gradient(to right, hsl(var(--foreground) / 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, hsl(var(--foreground) / 0.04) 1px, transparent 1px);
    background-size: 32px 32px;
    position: relative;
  }

  .noise-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.35;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  }

  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }

  .skeleton {
    background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted) / 0.5) 37%, hsl(var(--muted)) 63%);
    background-size: 400% 100%;
    animation: shimmer 1.3s ease infinite;
    border-radius: 8px;
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-spin-slow {
    animation: spin-slow 14s linear infinite;
  }

  @keyframes orbit-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes orbit-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }

  @keyframes aurora-drift-1 {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(40px, -30px); }
    50% { transform: translate(-20px, 20px); }
    75% { transform: translate(-10px, -10px); }
  }

  @keyframes aurora-drift-2 {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(-30px, 20px); }
    50% { transform: translate(30px, -30px); }
    75% { transform: translate(15px, 15px); }
  }

  @keyframes pulse-soft {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }

  .animate-pulse-soft {
    animation: pulse-soft 2.4s ease-in-out infinite;
  }

  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out forwards;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .animate-fade-in {
    animation: fade-in 0.15s ease-out forwards;
  }

  @keyframes modal-in {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: none; }
  }

  .animate-modal-in {
    animation: modal-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes card-in {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }

  .animate-card-in {
    animation: card-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  .animate-toast-in {
    animation: toast-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes slide-in-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-slide-in-up {
    animation: slide-in-up 0.5s ease-out forwards;
  }

  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .animate-slide-in-right {
    animation: slide-in-right 0.5s ease-out forwards;
  }

  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(16px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .animate-slide-in-left {
    animation: slide-in-left 0.5s ease-out forwards;
  }

  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .animate-scale-in {
    animation: scale-in 0.3s ease-out forwards;
  }

  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-400 { animation-delay: 400ms; }
  .delay-500 { animation-delay: 500ms; }
  .delay-600 { animation-delay: 600ms; }
  .delay-700 { animation-delay: 700ms; }
  .delay-800 { animation-delay: 800ms; }
  .delay-900 { animation-delay: 900ms; }
  .delay-1000 { animation-delay: 1000ms; }
}

/* ---------- App shell ---------- */
.app-shell { display: flex; flex-direction: column; min-height: 100%; width: 100%; }

/* ---------- Landing page ---------- */
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 1rem 1.5rem;
}

/* ---------- Auth shell ---------- */
.auth-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .auth-shell {
    grid-template-columns: 1fr 1fr;
  }
}

.auth-shell__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.125rem;
  text-decoration: none;
}

/* ---------- Buttons ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5625rem 1rem;
  border-radius: 0.625rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.05s ease;
  white-space: nowrap;
}

.btn:active { transform: translateY(1px); }

.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.btn-primary:hover { filter: brightness(0.96); }

.btn-secondary {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.btn-secondary:hover { filter: brightness(0.96); }

.btn-ghost {
  background: transparent;
  color: hsl(var(--muted-foreground));
  border-color: hsl(var(--border));
}

.btn-ghost:hover {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.btn-destructive {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}

.btn-destructive:hover { filter: brightness(0.96); }

.btn-outline {
  background: transparent;
  border-color: hsl(var(--border));
  color: hsl(var(--foreground));
}

.btn-outline:hover {
  background: hsl(var(--accent));
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.75rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-icon {
  padding: 0.5rem;
}

.btn-full { width: 100%; }

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ---------- Forms ---------- */
.field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }

.field label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.input, .select, .textarea {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.625rem;
  padding: 0.625rem 0.75rem;
  width: 100%;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:focus, .select:focus, .textarea:focus {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.textarea { resize: vertical; min-height: 72px; }

/* ---------- Cards ---------- */
.card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}

.card-header { padding: 1.5rem; }
.card-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }
.card-description { color: hsl(var(--muted-foreground)); font-size: 0.875rem; margin-top: 0.25rem; }
.card-content { padding: 1.5rem; padding-top: 0; }
.card-footer { padding: 1.5rem; padding-top: 0; }

/* ---------- Badges ---------- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-mono);
  padding: 0.1875rem 0.5625rem;
  border-radius: 9999px;
}

.badge-primary { background: hsl(var(--primary-soft)); color: hsl(var(--primary)); }
.badge-secondary { background: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); }
.badge-destructive { background: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); }
.badge-success { background: hsl(var(--success) / 0.15); color: hsl(var(--success)); }
.badge-warning { background: hsl(var(--warning) / 0.15); color: hsl(var(--warning)); }
.badge-outline { border: 1px solid hsl(var(--border)); background: transparent; }

/* ---------- Avatar ---------- */
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  color: white;
  border: 2px solid hsl(var(--background));
  font-family: var(--font-mono);
}

.avatar-stack { display: inline-flex; }
.avatar-stack .avatar { margin-left: -0.5rem; }
.avatar-stack .avatar:first-child { margin-left: 0; }

/* ---------- Progress Ring ---------- */
.ring { position: relative; display: inline-grid; place-items: center; }
.ring svg { transform: rotate(-90deg); }
.ring-track { stroke: hsl(var(--border)); }
.ring-fill { transition: stroke-dashoffset 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
.ring-label { position: absolute; font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 600; color: hsl(var(--primary)); }

/* ---------- Board / Kanban ---------- */
.board-toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }

.seg {
  display: inline-flex;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.625rem;
  padding: 0.1875rem;
  gap: 0.125rem;
}

.seg button, .seg a {
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
}

.seg button.active, .seg a.active {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.125rem;
  align-items: start;
}

.column {
  background: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 0.625rem;
  min-height: 200px;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.column.drag-over { background: hsl(var(--primary) / 0.08); box-shadow: inset 0 0 0 2px hsl(var(--primary)); }
.column-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.5rem 0.75rem 0.75rem;
  margin: -0.625rem -0.625rem 0.5rem;
  padding-left: 0.875rem;
}

.column-title { font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.column-count { font-family: var(--font-mono); font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
.column-body { display: flex; flex-direction: column; gap: 0.625rem; min-height: 60px; }

.task-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  padding: 0.75rem 0.8125rem;
  box-shadow: 0 1px 2px hsl(var(--foreground) / 0.04), 0 1px 0 hsl(var(--foreground) / 0.03);
  cursor: grab;
  display: flex; flex-direction: column; gap: 0.625rem;
  animation: card-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.task-card:active { cursor: grabbing; }
.task-card.dragging { opacity: 0.45; }
.task-top { display: flex; align-items: flex-start; gap: 0.625rem; }
.task-title { font-size: 0.875rem; font-weight: 600; color: hsl(var(--foreground)); line-height: 1.35; flex: 1; }
.task-meta { display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; }
.task-due { font-family: var(--font-mono); font-size: 0.6875rem; color: hsl(var(--muted-foreground)); }

.status-dot { width: 0.875rem; height: 0.875rem; border-radius: 50%; flex: none; border: 2px solid; background: transparent; }
.status-dot.filled { background: currentColor; }

/* ---------- Modal ---------- */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(21, 43, 71, 0.45); backdrop-filter: blur(2px);
  display: grid; place-items: center; padding: 20px; z-index: 50;
  animation: fade-in 0.15s ease both;
}
.modal {
  width: 100%; max-width: 460px; background: var(--surface); border-radius: 16px;
  box-shadow: 0 40px 120px -40px hsl(var(--primary) / 0.25); padding: 1.5rem;
  animation: modal-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.modal-head h2 { font-size: 18px; }
.modal-close { background: none; border: none; font-size: 22px; line-height: 1; color: hsl(var(--muted-foreground)); cursor: pointer; }

#root { height: 100%; }

/* ---------- Toast ---------- */
.toast-wrap { position: fixed; bottom: 1.375rem; left: 50%; transform: translateX(-50%); z-index: 60; display: flex; flex-direction: column; gap: 0.5rem; align-items: center; }
.toast {
  background: hsl(var(--foreground)); color: hsl(var(--background)); padding: 0.625rem 1.125rem; border-radius: 0.625rem;
  font-size: 0.875rem; box-shadow: 0 40px 120px -40px hsl(var(--primary) / 0.25); animation: toast-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.toast.error { background: hsl(var(--destructive)); }

/* ---------- Members ---------- */
.member-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid hsl(var(--border)); }
.member-row:last-child { border-bottom: none; }
.member-info { flex: 1; }
.member-name { font-weight: 600; font-size: 0.875rem; }
.member-email { color: hsl(var(--muted-foreground)); font-size: 0.8125rem; }
.owner-tag { font-family: var(--font-mono); font-size: 0.6875rem; color: hsl(var(--primary)); background: hsl(var(--primary-soft)); padding: 0.125rem 0.5rem; border-radius: 9999px; }

/* ---------- Invites ---------- */
.invite-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0; border-bottom: 1px solid hsl(var(--border)); }
.invite-row:last-child { border-bottom: none; }
.invite-info { flex: 1; min-width: 0; }
.invite-target { font-weight: 600; font-size: 0.875rem; }
.invite-meta { color: hsl(var(--muted-foreground)); font-size: 0.75rem; font-family: var(--font-mono); }
.invite-made {
  display: flex; align-items: center; gap: 0.625rem; margin: 0.875rem 0;
  padding: 0.75rem; background: hsl(var(--primary-soft)); border: 1px solid hsl(var(--border)); border-radius: 0.625rem;
}
.invite-link {
  flex: 1; min-width: 0; font-family: var(--font-mono); font-size: 0.75rem;
  color: hsl(var(--primary)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ---------- Empty state ---------- */
.empty-state { text-align: center; color: hsl(var(--muted-foreground)); padding: 3.5rem 1.25rem; border: 1px dashed hsl(var(--border)); border-radius: var(--radius); }
.empty-state h3 { font-family: var(--font-display); font-size: 1.125rem; font-weight: 600; color: hsl(var(--muted-foreground)); margin-bottom: 0.375rem; }

/* ---------- Responsive ---------- */
@media (max-width: 860px) {
  .board { grid-template-columns: 1fr; }
  .column { min-height: auto; }
}
@media (max-width: 520px) {
  .content { padding: 1.25rem 1rem 3rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

/* ---------- Scrollbar hiding ---------- */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2.3: Update/ensure `frontend/tailwind.config.js` exists with proper content paths**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        'radius': 'var(--radius)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          soft: 'hsl(var(--primary-soft))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
        overdue: 'hsl(var(--overdue))',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2.4: Build and verify no CSS errors**

```bash
cd C:/Users/tavis/Project_Tool/frontend
npm run build
```

- [ ] **Step 2.5: Commit**

```bash
git add src/styles.css tailwind.config.js
git commit -m "style: migrate Orbit design tokens (OKLCH palette, fonts, animations)"
```

---

### Task 3: Add Missing Radix UI Components from Orbit

**Files:**
- Create: `frontend/src/components/ui/command.tsx`
- Create: `frontend/src/components/ui/navigation-menu.tsx`
- Create: `frontend/src/components/ui/context-menu.tsx`
- Create: `frontend/src/components/ui/hover-card.tsx`
- Create: `frontend/src/components/ui/popover.tsx`
- Create: `frontend/src/components/ui/sheet.tsx`
- Create: `frontend/src/components/ui/carousel.tsx`
- Create: `frontend/src/components/ui/calendar.tsx`
- Create: `frontend/src/components/ui/chart.tsx`
- Create: `frontend/src/components/ui/input-otp.tsx`
- Create: `frontend/src/components/ui/toggle.tsx`
- Create: `frontend/src/components/ui/toggle-group.tsx`
- Create: `frontend/src/components/ui/resizable.tsx`
- Create: `frontend/src/components/ui/sonner.tsx`
- Create: `frontend/src/components/ui/sidebar.tsx` (update existing with Orbit version)

**Interfaces:**
- Consumes: Orbit's `/oribit_redsign/src/components/ui/*.tsx`
- Produces: Complete Radix UI component library matching Orbit

- [ ] **Step 3.1: Copy each missing component from Orbit to Project_Tool (adapt imports from `@/` to `@/components/ui`)**

Reference Orbit components:
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/command.tsx` → uses `@radix-ui/react-dialog` + `cmdk`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/navigation-menu.tsx` → `@radix-ui/react-navigation-menu`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/context-menu.tsx` → `@radix-ui/react-context-menu`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/hover-card.tsx` → `@radix-ui/react-hover-card`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/popover.tsx` → `@radix-ui/react-popover`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/sheet.tsx` → `@radix-ui/react-dialog` + `vaul`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/carousel.tsx` → `embla-carousel-react`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/calendar.tsx` → `@radix-ui/react-calendar` + `react-day-picker`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/chart.tsx` → `recharts`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/input-otp.tsx` → `input-otp`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/toggle.tsx` → `@radix-ui/react-toggle`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/toggle-group.tsx` → `@radix-ui/react-toggle-group`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/resizable.tsx` → `react-resizable-panels`
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/sonner.tsx` → `sonner` (Toaster wrapper)
- `C:/Users/tavis/Project_Tool/oribit_redsign/src/components/ui/sidebar.tsx` → Replace existing with Orbit's full sidebar

- [ ] **Step 3.2: For each component, update import paths from `@/lib/utils` to `@/lib/utils` (already exists) and ensure Tailwind classes use new design tokens**

- [ ] **Step 3.3: Run build to verify no TypeScript errors**

```bash
cd C:/Users/tavis/Project_Tool/frontend
npx tsc --noEmit
```

- [ ] **Step 3.4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add missing Radix UI components from Orbit (command, navigation-menu, context-menu, etc.)"
```

---

### Task 4: Add Orbit Custom Components (Already Present - Verify & Sync)

**Files:**
- Verify/Modify: `frontend/src/components/orbit/*.tsx` (12 files already present)

**Interfaces:**
- Consumes: Orbit's `/oribit_redsign/src/components/orbit/*.tsx`
- Produces: Synced Orbit components using new design tokens

- [ ] **Step 4.1: Compare each existing Orbit component with source and sync any differences**

```bash
# Compare all 12 components
diff C:/Users/tavis/Project_Tool/oribit_redsign/src/components/orbit/app-sidebar.tsx C:/Users/tavis/Project_Tool/frontend/src/components/orbit/app-sidebar.tsx
diff C:/Users/tavis/Project_Tool/oribit_redsign/src/components/orbit/aurora-blob.tsx C:/Users/tavis/Project_Tool/frontend/src/components/orbit/aurora-blob.tsx
# ... repeat for all 12
```

- [ ] **Step 4.2: Update any that differ (especially imports and classNames)**

- [ ] **Step 4.3: Add missing `Topbar` component from Orbit**

Create `frontend/src/components/orbit/topbar.tsx` from `oribit_redsign/src/components/orbit/topbar.tsx` with imports fixed.

- [ ] **Step 4.4: Add missing `SidebarTrigger`, `SidebarInset`, `SidebarRail`, etc. exports to `sidebar.tsx`** (already in the big sidebar component)

- [ ] **Step 4.5: Create `frontend/src/components/orbit/index.ts` barrel export if missing**

```typescript
export * from './app-sidebar';
export * from './aurora-blob';
export * from './badges';
export * from './grid-noise-background';
export * from './magnetic-button';
export * from './member-avatar';
export * from './new-project-dialog';
export * from './orbit-mark';
export * from './page-transition';
export * from './progress-ring';
export * from './spotlight-card';
export * from './task-dialog';
export * from './topbar';
export * from './PriorityBadge';
export * from './StatusPill';
```

- [ ] **Step 4.6: Build and commit**

```bash
npm run build
git add src/components/orbit/
git commit -m "feat: sync Orbit custom components with design system source"
```

---

### Task 5: Create Landing Page (Orbit Design)

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`
- Create: `frontend/src/components/orbit/preview-board.tsx` (for landing preview, optional)

**Interfaces:**
- Consumes: `AuthProvider` (redirects if logged in), `OrbitMark`, `AuroraBlob`, `SpotlightCard`, `MagneticButton`, `ArrowRight`, `Sparkles`, `KanbanSquare`, `Users`, `Zap`, `ShieldCheck`, `Layers` from lucide-react
- Produces: New landing page at `/`

- [ ] **Step 5.1: Replace `LandingPage.tsx` with Orbit landing page implementation**

Adapt from `oribit_redsign/src/routes/index.tsx` — replace TanStack Router `Link`/`useNavigate` with React Router v6 `Link`/`useNavigate`.

Key sections:
1. Header with OrbitMark + nav links + Sign in / Get started
2. Hero with AuroraBlob background, animated headline, CTA buttons
3. Preview surface (animated board preview)
4. Features grid (6 SpotlightCards)
5. Workflow section with PreviewBoard
6. Pricing CTA
7. Footer

- [ ] **Step 5.2: Ensure OrbitMark, AuroraBlob, SpotlightCard, MagneticButton imports work**

- [ ] **Step 5.3: Test landing page loads at `/` when not authenticated**

```bash
npm run dev
# Visit http://localhost:5173 - should show Orbit landing page
```

- [ ] **Step 5.4: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat: replace LandingPage with Orbit design"
```

---

### Task 6: Create Login Page (Orbit AuthShell + AuroraBlob)

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`

**Interfaces:**
- Consumes: `AuthShell`, `OrbitMark`, `AuroraBlob`, `api.login`, `useAuth.setUser`, `useNavigate`, `useSearchParams` (for invite token)
- Produces: Login page at `/login` with Orbit design

- [ ] **Step 6.1: Replace `LoginPage.tsx` with Orbit version**

Adapt from `oribit_redsign/src/routes/login.tsx` — replace:
- `@tanstack/react-router` → `react-router-dom` (Link, useNavigate, useSearchParams)
- `useStore` login → `api.login` + `setUser`
- `AuthShell` component (copy from Orbit)

- [ ] **Step 6.2: Preserve invite token handling** (redirect to `/projects/:id` after accept)

- [ ] **Step 6.3: Test login flow**

```bash
# Visit /login - should show Orbit auth shell with AuroraBlob
# Login with valid credentials - should redirect to /projects
```

- [ ] **Step 6.4: Commit**

```bash
git add src/pages/LoginPage.tsx
git commit -m "feat: replace LoginPage with Orbit AuthShell design"
```

---

### Task 7: Create Register Page (Orbit Design)

**Files:**
- Modify: `frontend/src/pages/RegisterPage.tsx` (create if not exists)

**Interfaces:**
- Consumes: `AuthShell`, `OrbitMark`, `AuroraBlob`, `api.register`, `useAuth.setUser`, `useNavigate`
- Produces: Register page at `/register`

- [ ] **Step 7.1: Read Orbit register route**

```bash
cat C:/Users/tavis/Project_Tool/oribit_redsign/src/routes/register.tsx
```

- [ ] **Step 7.2: Create `RegisterPage.tsx` adapted for React Router v6**

- [ ] **Step 7.3: Add route in `App.tsx`** (if missing)

```typescript
<Route path="/register" element={user ? <Navigate to="/projects" replace /> : <RegisterPage />} />
```

- [ ] **Step 7.4: Test registration**

- [ ] **Step 7.5: Commit**

---

### Task 8: Create Invite Page (Orbit Design)

**Files:**
- Modify: `frontend/src/pages/InvitePage.tsx`

**Interfaces:**
- Consumes: `api.acceptInvite`, `useNavigate`, `useParams` (token)
- Produces: Invite acceptance page at `/invite/:token`

- [ ] **Step 8.1: Read Orbit invite route**

```bash
cat C:/Users/tavis/Project_Tool/oribit_redsign/src/routes/invite.$token.tsx
```

- [ ] **Step 8.2: Update `InvitePage.tsx` with Orbit design (AuthShell + form)**

- [ ] **Step 8.3: Preserve existing invite acceptance logic** (call `api.acceptInvite(token)`, redirect to project)

- [ ] **Step 8.4: Test invite flow**

- [ ] **Step 8.5: Commit**

---

### Task 9: Migrate Projects Page (Dashboard) — Core Page

**Files:**
- Modify: `frontend/src/pages/ProjectsPage.tsx`
- Uses: `SpotlightCard`, `ProgressRing`, `MemberStack`, `NewProjectDialog`, `MagneticButton`, `Plus`, `FolderKanban`, `CheckCircle2`, `Clock`, `Users`

**Interfaces:**
- Consumes: `api.listProjects`, `api.getProject`, `api.listTasks`, `useAuth`, `useToast`, `useNavigate`
- Produces: Dashboard at `/projects` with stats cards + project grid

- [ ] **Step 9.1: Replace `ProjectsPage.tsx` completely with Orbit version**

Adapt from `oribit_redsign/src/routes/app.projects.tsx`:
- Replace `useStore` hooks with actual API calls (already in current `ProjectsPage.tsx`)
- Keep existing `loadData`/`refetch` logic but render Orbit UI
- Stats cards: Projects, Open tasks, In progress, Completed
- Project grid with `SpotlightCard` + `ProgressRing` + `MemberStack`
- `NewProjectDialog` for creating projects
- Empty state with CTA

- [ ] **Step 9.2: Map status/priority for stats calculation**

Orbit has 4 statuses (backlog, in_progress, review, done) → Backend has 3 (todo, in_progress, done)
Mapping for stats: `backlog` + `todo` → "Open", `in_progress` → "In progress", `done` → "Completed"

- [ ] **Step 9.3: Ensure `NewProjectDialog` uses `api.createProject`** (already connected!)

- [ ] **Step 9.4: Test dashboard loads with real data**

- [ ] **Step 9.5: Commit**

```bash
git add src/pages/ProjectsPage.tsx
git commit -m "feat: migrate ProjectsPage to Orbit dashboard design"
```

---

### Task 10: Migrate Board Page (Kanban) — Core Page

**Files:**
- Modify: `frontend/src/pages/BoardPage.tsx`
- Uses: `TaskDialog`, `PriorityBadge`, `MemberAvatar`, `Button`, `KanbanSquare`, `ListChecks`, `Settings`, `ChevronLeft`, `Plus`, `MoreHorizontal`, `Calendar`

**Interfaces:**
- Consumes: `api.getProject`, `api.listTasks`, `api.updateTask` (move), `api.createTask`, `api.deleteTask`, `useToast`, `useNavigate`, `useParams`
- Produces: Kanban board at `/projects/:id`

- [ ] **Step 10.1: Replace `BoardPage.tsx` with Orbit Kanban implementation**

Adapt from `oribit_redsign/src/routes/app.projects.$id.index.tsx`:
- 4 columns: Backlog, In Progress, Review, Done (map to backend: Todo, In Progress, [merge Review into In Progress], Done)
- Drag-and-drop with HTML5 Drag API (Orbit implementation)
- `TaskCard` component with priority badge, due date, assignee avatar
- Click task → `TaskDialog` (already exists as Orbit component!)
- Add task inline in column
- Topbar with tabs (Board | List | Settings)

- [ ] **Step 10.2: Status mapping in component**

```typescript
const STATUS_MAP = {
  backlog: 'todo',
  in_progress: 'in_progress',
  review: 'in_progress',  // merge into in_progress for backend
  done: 'done',
} as const;
```

- [ ] **Step 10.3: Preserve existing `moveTask` optimistic update + API call pattern**

- [ ] **Step 10.4: Test drag-drop, create, edit, delete tasks**

- [ ] **Step 10.5: Commit**

```bash
git add src/pages/BoardPage.tsx
git commit -m "feat: migrate BoardPage to Orbit Kanban with 4 columns"
```

---

### Task 11: Migrate List Page — Core Page

**Files:**
- Modify: `frontend/src/pages/ListPage.tsx`

**Interfaces:**
- Consumes: `api.getProject`, `api.listTasks`, `api.updateTask`, `api.deleteTask`, `PriorityBadge`, `StatusPill`, `MemberAvatar`, `Table` components
- Produces: List view at `/projects/:id/list`

- [ ] **Step 11.1: Replace `ListPage.tsx` with Orbit version**

Adapt from `oribit_redsign/src/routes/app.projects.$id.list.tsx`:
- Search input
- Sortable table (Task, Status, Priority, Assignee)
- Click row → `TaskDialog`
- Status/Priority badges using Orbit components
- Empty state

- [ ] **Step 11.2: Use existing `Table` components** (already Radix-based)

- [ ] **Step 11.3: Test list view with sorting/search**

- [ ] **Step 11.4: Commit**

---

### Task 12: Migrate Settings Page — Core Page

**Files:**
- Modify: `frontend/src/pages/SettingsPage.tsx`

**Interfaces:**
- Consumes: `api.getProject`, `api.updateProject`, `api.addMember`, `api.removeMember`, `api.deleteProject`, `api.createInvite`, `api.listInvites`, `api.revokeInvite`, `Tabs`, `Input`, `Textarea`, `Button`, `Badge`, `MemberAvatar`, `useToast`, `useNavigate`, `useParams`
- Produces: Settings at `/projects/:id/settings`

- [ ] **Step 12.1: Replace `SettingsPage.tsx` with Orbit version**

Adapt from `oribit_redsign/src/routes/app.projects.$id.settings.tsx`:
- Tabs: General | Members | Danger zone
- General: name, description, save
- Members: list with remove, invite form, invite link
- Danger: delete project

- [ ] **Step 12.2: Preserve all API calls** (current `SettingsPage.tsx` already has them)

- [ ] **Step 12.3: Test all settings actions**

- [ ] **Step 12.4: Commit**

---

### Task 13: Migrate Members Page (Workspace Members)

**Files:**
- Modify: `frontend/src/pages/MembersPage.tsx`

**Interfaces:**
- Consumes: `api.listMembers` (need to add endpoint) or use project members, `MemberAvatar`, `Badge`, `Button`, `Input`, `useToast`
- Produces: Members at `/members`

- [ ] **Step 13.1: Replace `MembersPage.tsx` with Orbit version**

Adapt from `oribit_redsign/src/routes/app.members.tsx`:
- Invite form (name + email)
- Member grid with avatars + role badges
- Note: Backend has project members, not workspace members — adapt to show current project members or add workspace endpoint

- [ ] **Step 13.2: If workspace members API missing, add minimal backend route** (or reuse project members for now)

- [ ] **Step 13.3: Test members page**

- [ ] **Step 13.4: Commit**

---

### Task 14: Add Global Topbar + Command Palette + Toasts (Sonner)

**Files:**
- Create: `frontend/src/components/orbit/topbar.tsx` (from Task 4)
- Modify: `frontend/src/components/Layout.tsx` or `App.tsx` to include Topbar
- Modify: `frontend/src/main.tsx` to wrap with `Toaster` (Sonner)

**Interfaces:**
- Consumes: `Topbar` (search, notifications bell, user dropdown), `Toaster` (sonner)
- Produces: Persistent topbar on all authenticated pages, global toasts

- [ ] **Step 14.1: Add Sonner Toaster to `main.tsx`**

```tsx
import { Toaster } from '@/components/ui/sonner';
// In root render:
<Toaster position="top-right" />
```

- [ ] **Step 14.2: Integrate `Topbar` into authenticated layout**

Current `DashboardLayout` or `Layout` component → add `<Topbar />` above content

- [ ] **Step 14.3: Replace existing `useToast`/`ToastProvider` with Sonner's `toast`**

Update all `notify()` calls to use `import { toast } from 'sonner'`

- [ ] **Step 14.4: Add Command Palette (Cmd+K)**

Create `CommandPalette` component using `cmdk` + `Command` UI component
Trigger with `useEffect` listening for `cmd+k` / `ctrl+k`

- [ ] **Step 14.5: Test toasts appear on actions, Cmd+K opens palette**

- [ ] **Step 14.6: Commit**

---

### Task 15: Add Page Transitions (Framer Motion)

**Files:**
- Use: `frontend/src/components/orbit/page-transition.tsx` (already exists)
- Modify: Layout/page wrapper to include `<PageTransition>`

**Interfaces:**
- Consumes: `PageTransition` component
- Produces: Smooth page transitions on route change

- [ ] **Step 15.1: Wrap page content with `PageTransition`**

In `DashboardLayout` or each page, wrap `<Outlet />` or page content:
```tsx
<PageTransition><Outlet /></PageTransition>
```

- [ ] **Step 15.2: Verify transitions work on navigation**

- [ ] **Step 15.3: Commit**

---

### Task 16: Add Missing Features from Orbit

**Files:**
- Various new components/pages

**Interfaces:**
- Produces: Command palette, Notifications panel, Empty states, Loading skeletons, Error boundaries

- [ ] **Step 16.1: Command Palette** (part of Task 14)
- [ ] **Step 16.2: Notification Bell + Dropdown** (in Topbar — uses `DropdownMenu`, `ScrollArea`)
- [ ] **Step 16.3: Empty States** — all pages use `.empty-state` CSS class
- [ ] **Step 16.4: Loading Skeletons** — `Skeleton` component from Radix (already exists)
- [ ] **Step 16.5: Error Boundaries** — wrap routes/components with React Error Boundary
- [ ] **Step 16.6: Responsive Sidebar** — `Sidebar` component already handles mobile (Sheet)

- [ ] **Step 16.7: Commit**

---

### Task 17: Remove Dead/Legacy Code

**Files:**
- Delete/Modify: Legacy CSS classes, unused components, duplicate utilities

**Interfaces:**
- Produces: Cleaner codebase

- [ ] **Step 17.1: Remove old custom CSS button classes** (`.btn`, `.card`, `.input`, etc.) from `styles.css` — now using Radix components

- [ ] **Step 17.2: Remove unused components** (old `Board.tsx`, `Column.tsx`, `TaskCard.tsx`, `Modal.tsx`, `Toast.tsx` if replaced by Radix)

- [ ] **Step 17.3: Remove dead imports and utility duplicates**

- [ ] **Step 17.4: Run build + lint**

```bash
npm run build
npm run lint
```

- [ ] **Step 17.5: Commit**

---

### Task 18: Final Validation (Phase 10)

**Files:**
- All

**Interfaces:**
- Verifies: Complete functional app

- [ ] **Step 18.1: Build passes**

```bash
cd C:/Users/tavis/Project_Tool/frontend && npm run build
```

- [ ] **Step 18.2: TypeScript clean**

```bash
npx tsc --noEmit
```

- [ ] **Step 18.3: ESLint clean**

```bash
npm run lint
```

- [ ] **Step 18.4: Manual smoke test checklist**

- [ ] App loads at `/` → shows Orbit landing page
- [ ] `/login` → Orbit AuthShell with AuroraBlob, login works, redirects to `/projects`
- [ ] `/register` → works, redirects to `/projects`
- [ ] `/invite/:token` → accepts invite, redirects to project
- [ ] `/projects` → dashboard with stats cards, project grid, create project dialog works
- [ ] `/projects/:id` → Kanban board with 4 columns, drag-drop works, task dialog works
- [ ] `/projects/:id/list` → table with search/sort, click opens task dialog
- [ ] `/projects/:id/settings` → tabs (General/Members/Danger), all actions work
- [ ] `/members` → member grid, invite works
- [ ] Topbar: search, notifications bell, user dropdown (profile/sign out)
- [ ] Cmd+K opens command palette
- [ ] Toasts appear on create/update/delete
- [ ] Page transitions animate
- [ ] Responsive: mobile sidebar (hamburger), board stacks columns
- [ ] Dark mode: works (mirrors light per Orbit design)

- [ ] **Step 18.5: Verify backend API unchanged**

```bash
cd C:/Users/tavis/Project_Tool/backend && npm test  # if tests exist
# Or manual curl tests against running backend
```

- [ ] **Step 18.6: Final commit**

```bash
git add -A
git commit -m "feat: complete Orbit redesign migration — all pages, components, features integrated"
```

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2025-01-23-orbit-redesign-migration.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
   - REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints for review
   - REQUIRED SUB-SKILL: Use superpowers:executing-plans

**Which approach?**