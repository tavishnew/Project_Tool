# Ledger Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved B+C "editorial-technical" visual/interaction redesign to the Ledger frontend: new design tokens, UI primitives (Toast, ConfirmPopover, Skeleton, StatusBadge, ErrorState), loading/error/empty states, motion, favicon/OG meta, and a branded 404 — without changing backend behavior.

**Architecture:** Extend the existing Tailwind v3 config + `styles.css` with the new token/system (warm paper, measured-grid texture, tinted shadows, corner ticks), add a small `src/components/ui/` primitives layer, then apply those primitives across the two pages and four components. A `ToastProvider` context supplies transient feedback; `ConfirmPopover` replaces the native `confirm()`; `Skeleton`/`ErrorState` cover loading/failure. React Router gains a `*` 404 route.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, React Router v6. Vitest + @testing-library/react (dev-only) for behavioral primitives.

## Global Constraints

- Tailwind must stay on **v3** (do not migrate to v4). (spec §3)
- Accent is **pine `#2F5D50`**; indigo is a one-token swap and out of scope unless requested. (spec §5.3)
- **No backend changes. No auth. No drag-and-drop. No dark mode.** (spec §3)
- Work with the existing stack; **do not add a UI component kit.** (spec §3)
- Keep the app working at every step; small, reviewable diffs. (spec §2)
- **Verification is static:** `npx tsc --noEmit` and `npm run build`. The sandbox blocks the browser, so never claim browser-confirmed polish. (spec §12)
- On Windows PowerShell use `npm.cmd` instead of `npm` if execution policy blocks `npm`. (memory)
- Vitest is added as a **dev-only** test harness (Task 0); it runs in jsdom, so it is unaffected by the browser block. Behavioral primitives get real tests; pure-CSS tasks are gated by typecheck + build.

---

## File Structure

```
frontend/
  package.json                      # + vitest/devDeps, "test" script (Task 0)
  vite.config.ts                    # + test config (Task 0)
  src/
    test/setup.ts                   # jest-dom + cleanup (Task 0)
    styles.css                      # body -> warm paper; + .bg-measured, .tick-frame (Task 2)
    main.tsx                        # wrap in ToastProvider; + 404 route (Task 9)
    components/
      ui/Toast.tsx                  # NEW (Task 4)
      ui/Toast.test.tsx             # NEW (Task 4)
      ui/ConfirmPopover.tsx         # NEW (Task 5)
      ui/ConfirmPopover.test.tsx    # NEW (Task 5)
      ui/Skeleton.tsx               # NEW (Task 6)
      ui/StatusBadge.tsx            # NEW (Task 7)
      ui/StatusBadge.test.tsx       # NEW (Task 7)
      ui/ErrorState.tsx             # NEW (Task 8)
      NotFoundPage.tsx              # NEW (Task 10)
      Column.tsx                    # hairline+corner-tick entries, staggered (Task 13)
      TaskCard.tsx                  # hairline+corner-tick, StatusBadge, pressed (Task 14)
      TaskModal.tsx                 # tinted shadow, pressed (Task 15)
      ProjectModal.tsx              # tinted shadow, pressed (Task 16)
    pages/
      ProjectsPage.tsx              # masthead, grid, Skeleton, ErrorState, ConfirmPopover, Toast (Task 11)
      BoardPage.tsx                 # grid, Skeleton, ErrorState, board transition, Toast (Task 12)
  index.html                        # favicon, meta description, OG tags (Task 3)
  public/favicon.svg                # NEW ledger "L" mark (Task 3)
  public/og-image.svg               # NEW social card (Task 3)
tailwind.config.js                  # tokens: paper/surface/grid, tinted shadows (Task 1)
```

---

### Task 0: Add Vitest test harness (dev-only)

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/test/setup.ts`

**Interfaces:** none consumed; produces the `npm test` command used by later tasks.

- [ ] **Step 1: Add dev dependencies and a `test` script**

In `frontend/package.json`, add to `devDependencies` and `scripts`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run"
},
"devDependencies": {
  "@testing-library/jest-dom": "^6.4.6",
  "@testing-library/react": "^16.0.0",
  "@types/react": "^18.3.3",
  "@types/react-dom": "^18.3.0",
  "@vitejs/plugin-react": "^4.3.1",
  "autoprefixer": "^10.4.19",
  "jsdom": "^24.1.0",
  "postcss": "^8.4.39",
  "tailwindcss": "^3.4.4",
  "typescript": "^5.5.3",
  "vite": "^5.3.3",
  "vitest": "^2.0.2"
}
```

- [ ] **Step 2: Add Vitest config to `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

- [ ] **Step 3: Create the test setup file**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **Step 4: Install deps and run the (empty) suite**

Run: `npm install` then `npm test`
Expected: `no test files found` / exit 0. (If `npm` is blocked by policy, use `npm.cmd`.)

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/vite.config.ts frontend/src/test/setup.ts
git commit -m "chore: add Vitest + Testing Library dev harness"
```

---

### Task 1: Update design tokens in `tailwind.config.js`

**Files:**
- Modify: `frontend/tailwind.config.js`

**Interfaces:** produces the `bg-measured` companion color, `shadow-card`, `shadow-pop`, and warmed `paper`/`surface` used by all later tasks.

- [ ] **Step 1: Replace `theme.extend` with warmed tokens + tinted shadows**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F3EC",
        surface: "#FCFBF7",
        ink: "#1B1A17",
        muted: "#6B6862",
        line: "#E4E1DA",
        grid: "rgba(47,93,80,0.05)",
        pine: {
          DEFAULT: "#2F5D50",
          soft: "#D9E6DE",
          dark: "#20423A",
        },
        brick: {
          DEFAULT: "#B3402F",
          soft: "#F3DDD7",
        },
        gold: {
          DEFAULT: "#B8862E",
          soft: "#F1E4C8",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,26,23,0.04), 0 1px 0 rgba(27,26,23,0.02)",
        pop: "0 12px 32px -8px rgba(32,66,58,0.28)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (config is JS, but confirms the project still compiles).

- [ ] **Step 3: Commit**

```bash
git add frontend/tailwind.config.js
git commit -m "style: warm paper/surface tokens, grid color, tinted shadows"
```

---

### Task 2: Add global CSS helpers in `styles.css`

**Files:**
- Modify: `frontend/src/styles.css`

**Interfaces:** produces `.bg-measured` (measured-grid background) and `.tick-frame` (corner-tick entries) consumed by pages and cards.

- [ ] **Step 1: Replace the `body` rule and append helpers**

Replace the existing `body { ... }` block with a warm-paper body (retire the ruled-line gradient), and append `.bg-measured` + `.tick-frame`:

```css
body {
  background-color: #F6F3EC;
  color: #1B1A17;
}

/* Measured-grid texture (editorial-technical signature) */
.bg-measured {
  background-color: #F6F3EC;
  background-image:
    linear-gradient(rgba(47,93,80,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(47,93,80,0.05) 1px, transparent 1px);
  background-size: 18px 18px;
}

/* Corner ticks: two small squares at top-left / bottom-right of an entry */
.tick-frame {
  position: relative;
}
.tick-frame::before,
.tick-frame::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  pointer-events: none;
  border-color: var(--tick, #E4E1DA);
}
.tick-frame::before {
  top: -1px;
  left: -1px;
  border-top: 1px solid var(--tick, #E4E1DA);
  border-left: 1px solid var(--tick, #E4E1DA);
}
.tick-frame::after {
  bottom: -1px;
  right: -1px;
  border-bottom: 1px solid var(--tick, #E4E1DA);
  border-right: 1px solid var(--tick, #E4E1DA);
}
```

Keep the existing `::selection`, `*` scrollbar, `prefers-reduced-motion`, and `.focus-ring` rules unchanged.

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/styles.css
git commit -m "style: measured-grid background + corner-tick frame helpers"
```

---

### Task 3: Favicon, meta description, and OG tags

**Files:**
- Modify: `frontend/index.html`
- Create: `frontend/public/favicon.svg`
- Create: `frontend/public/og-image.svg`

**Interfaces:** produces the document head metadata consumed by browsers/social scrapers; no component depends on it.

- [ ] **Step 1: Create `public/favicon.svg` (ledger "L" mark)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#F6F3EC"/>
  <text x="16" y="23" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700" text-anchor="middle" fill="#2F5D50">L</text>
</svg>
```

- [ ] **Step 2: Create `public/og-image.svg` (social card)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F6F3EC"/>
  <text x="80" y="320" font-family="Georgia, serif" font-size="140" font-weight="700" fill="#1B1A17">Ledger</text>
  <rect x="82" y="350" width="220" height="8" fill="#B8862E"/>
  <text x="84" y="420" font-family="monospace" font-size="34" fill="#6B6862">PROJECT MANAGEMENT</text>
</svg>
```

- [ ] **Step 3: Update `index.html` `<head>`**

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Ledger — Project Management</title>
<meta name="description" content="Ledger is a calm, paper-style Kanban tool for tracking projects and tasks." />
<meta property="og:type" content="website" />
<meta property="og:title" content="Ledger — Project Management" />
<meta property="og:description" content="A calm, paper-style Kanban tool for tracking projects and tasks." />
<meta property="og:image" content="/og-image.svg" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds and copies `public/` assets.

- [ ] **Step 5: Commit**

```bash
git add frontend/index.html frontend/public/favicon.svg frontend/public/og-image.svg
git commit -m "feat: favicon, meta description, and OG tags"
```

---

### Task 4: `Toast` + `ToastProvider`

**Files:**
- Create: `frontend/src/components/ui/Toast.tsx`
- Create: `frontend/src/components/ui/Toast.test.tsx`

**Interfaces:**
- Consumes: none.
- Produces: `ToastProvider` (wrap in `main.tsx`) and `useToast()` returning `{ toast(message: string, tone?: "success" | "error"): void }`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider, useToast } from "./Toast";

function Harness() {
  const { toast } = useToast();
  return <button onClick={() => toast("Saved", "success")}>go</button>;
}

describe("Toast", () => {
  it("renders the message and removes it after 3s", () => {
    vi.useFakeTimers();
    render(<ToastProvider><Harness /></ToastProvider>);
    fireEvent.click(screen.getByText("go"));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("throws when used outside the provider", () => {
    function Bad() { useToast(); return null; }
    expect(() => render(<Bad />)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Toast.tsx` does not exist yet.

- [ ] **Step 3: Implement `Toast.tsx`**

```tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Tone = "success" | "error";
interface ToastItem { id: number; message: string; tone: Tone; }
interface ToastApi { toast: (message: string, tone?: Tone) => void; }

const ToastCtx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`tick-frame rounded-sm border px-3 py-2 text-sm shadow-pop ${
              t.tone === "success" ? "border-pine/40 bg-surface text-pine" : "border-brick/40 bg-surface text-brick"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/Toast.tsx frontend/src/components/ui/Toast.test.tsx
git commit -m "feat: Toast + ToastProvider for transient feedback"
```

---

### Task 5: `ConfirmPopover`

**Files:**
- Create: `frontend/src/components/ui/ConfirmPopover.tsx`
- Create: `frontend/src/components/ui/ConfirmPopover.test.tsx`

**Interfaces:**
- Consumes: none.
- Produces: `ConfirmPopover` with props `{ message: string; onConfirm: () => void; onCancel: () => void }`. Renders absolutely positioned; the trigger's parent must be `relative`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmPopover from "./ConfirmPopover";

describe("ConfirmPopover", () => {
  it("confirms on Enter and cancels on Escape", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmPopover message="Delete this?" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText("Delete this?")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `ConfirmPopover.tsx` does not exist yet.

- [ ] **Step 3: Implement `ConfirmPopover.tsx`**

```tsx
import { useEffect, useRef } from "react";

export default function ConfirmPopover({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onConfirm, onCancel]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="tick-frame absolute right-0 top-9 z-50 w-60 rounded-sm border border-line bg-surface p-3 shadow-pop"
    >
      <p className="mb-3 text-sm text-ink">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-sm px-2 py-1 text-sm text-muted transition hover:text-ink focus-ring"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-sm bg-brick px-2 py-1 text-sm font-medium text-paper transition hover:bg-brick/90 active:translate-y-px focus-ring"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/ConfirmPopover.tsx frontend/src/components/ui/ConfirmPopover.test.tsx
git commit -m "feat: accessible ConfirmPopover replacing native confirm()"
```

---

### Task 6: `Skeleton`

**Files:**
- Create: `frontend/src/components/ui/Skeleton.tsx`

**Interfaces:**
- Consumes: none.
- Produces: `Skeleton.Row` and `Skeleton.Card` shimmer blocks sized to project rows / task cards.

- [ ] **Step 1: Implement `Skeleton.tsx`**

```tsx
function Bar({ w }: { w: string }) {
  return <div className={`animate-pulse rounded-sm bg-line/60 ${w}`} />;
}

export function Skeleton() {
  return null;
}

Skeleton.Row = function Row() {
  return (
    <div className="flex items-center gap-4 border-b border-line py-5">
      <Bar w="w-8 h-3" />
      <Bar w="w-2.5 h-2.5 rounded-full" />
      <div className="flex-1 space-y-2">
        <Bar w="w-48 h-3" />
        <Bar w="w-32 h-2.5" />
      </div>
      <Bar w="w-40 h-2.5" />
    </div>
  );
};

Skeleton.Card = function Card() {
  return (
    <div className="tick-frame space-y-2 rounded-sm border border-line bg-surface p-3 shadow-card">
      <Bar w="w-3/4 h-3" />
      <Bar w="w-full h-2.5" />
      <Bar w="w-1/2 h-2.5" />
    </div>
  );
};
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/Skeleton.tsx
git commit -m "feat: Skeleton loaders for rows and cards"
```

---

### Task 7: `StatusBadge`

**Files:**
- Create: `frontend/src/components/ui/StatusBadge.tsx`
- Create: `frontend/src/components/ui/StatusBadge.test.tsx`

**Interfaces:**
- Consumes: `TaskStatus` from `../../types`.
- Produces: `StatusBadge` with prop `{ status: TaskStatus }`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the correct label per status", () => {
    render(
      <div>
        <StatusBadge status="todo" />
        <StatusBadge status="in_progress" />
        <StatusBadge status="done" />
      </div>
    );
    expect(screen.getByText("TODO")).toBeInTheDocument();
    expect(screen.getByText("IN PROG")).toBeInTheDocument();
    expect(screen.getByText("DONE")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `StatusBadge.tsx` does not exist yet.

- [ ] **Step 3: Implement `StatusBadge.tsx`**

```tsx
import type { TaskStatus } from "../../types";

const TONE: Record<TaskStatus, { label: string; cls: string }> = {
  todo: { label: "TODO", cls: "border-line text-muted" },
  in_progress: { label: "IN PROG", cls: "border-pine/40 text-pine" },
  done: { label: "DONE", cls: "border-pine/40 text-pine" },
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const t = TONE[status];
  return (
    <span
      className={`tick-frame inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide ${t.cls}`}
      aria-label={`Status: ${t.label}`}
    >
      {t.label}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/StatusBadge.tsx frontend/src/components/ui/StatusBadge.test.tsx
git commit -m "feat: StatusBadge with corner-tick styling"
```

---

### Task 8: `ErrorState`

**Files:**
- Create: `frontend/src/components/ui/ErrorState.tsx`

**Interfaces:**
- Consumes: none.
- Produces: `ErrorState` with props `{ title: string; message: string; onRetry?: () => void }`.

- [ ] **Step 1: Implement `ErrorState.tsx`**

```tsx
export default function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="tick-frame rounded-sm border border-brick/40 bg-surface px-8 py-12 text-center shadow-card"
    >
      <p className="mb-1 font-display text-lg text-ink">{title}</p>
      <p className="mb-5 text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-sm bg-pine px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-pine-dark active:translate-y-px focus-ring"
        >
          Try again
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/ErrorState.tsx
git commit -m "feat: ErrorState with inline retry"
```

---

### Task 9: Wire `ToastProvider` + 404 route in `main.tsx`

**Files:**
- Modify: `frontend/src/main.tsx`
- Create: `frontend/src/components/NotFoundPage.tsx` (Task 10, created just after)

**Interfaces:** consumes `ToastProvider` (Task 4) and `NotFoundPage` (Task 10).

- [ ] **Step 1: Update `main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import ProjectsPage from "./pages/ProjectsPage";
import BoardPage from "./pages/BoardPage";
import NotFoundPage from "./components/NotFoundPage";
import { ToastProvider } from "./components/ui/Toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<BoardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
```

- [ ] **Step 2: Create `NotFoundPage.tsx` (Task 10)**

```tsx
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="bg-measured min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-widest text-muted">Error 404</p>
        <h1 className="font-display text-5xl font-medium tracking-tight text-ink">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">This entry isn't in the ledger.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-wide text-pine hover:underline focus-ring"
        >
          ← Back to projects
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds (ProjectsPage/BoardPage still compile even before their redesign edits).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/main.tsx frontend/src/components/NotFoundPage.tsx
git commit -m "feat: ToastProvider + branded 404 route"
```

---

### Task 10: `ProjectsPage` redesign (masthead, states, confirm, toast)

**Files:**
- Modify: `frontend/src/pages/ProjectsPage.tsx`

**Interfaces:** consumes `useToast` (Task 4), `ConfirmPopover` (Task 5), `Skeleton` (Task 6), `ErrorState` (Task 8).

- [ ] **Step 1: Rewrite `ProjectsPage.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Project } from "../types";
import ProjectModal from "../components/ProjectModal";
import ConfirmPopover from "../components/ui/ConfirmPopover";
import Skeleton from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    setError(null);
    api
      .listProjects()
      .then(setProjects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleCreate(data: { name: string; description: string; color: string }) {
    const p = await api.createProject(data);
    setProjects((prev) => [p, ...prev]);
    setShowModal(false);
    toast("Project created");
  }

  async function handleDelete(id: string) {
    await api.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConfirmId(null);
    toast("Project deleted");
  }

  return (
    <div className="bg-measured min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <header className="mb-12 flex items-end justify-between border-b border-ink/80 pb-5">
          <div>
            <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
              Project ledger / index
            </p>
            <h1 className="font-display text-4xl font-medium tracking-tight text-ink">Ledger</h1>
            <div className="mt-1 h-0.5 w-16 bg-gold" />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-sm bg-pine px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-pine-dark active:translate-y-px focus-ring"
          >
            + New project
          </button>
        </header>

        {loading && (
          <div>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton.Row key={i} />)}
          </div>
        )}

        {error && (
          <ErrorState title="Couldn't load projects" message={error} onRetry={load} />
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="tick-frame rounded-sm border border-dashed border-line px-8 py-16 text-center">
            <p className="mb-2 font-display text-lg text-ink">No projects yet</p>
            <p className="mb-5 text-sm text-muted">Every ledger starts with a first entry.</p>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-sm bg-pine px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-pine-dark active:translate-y-px focus-ring"
            >
              + Start your first project
            </button>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="flex flex-col">
            {projects.map((p, i) => {
              const pct = p.task_count ? Math.round((p.done_count / p.task_count) * 100) : 0;
              return (
                <Link
                  to={`/projects/${p.id}`}
                  key={p.id}
                  className="group flex items-center gap-4 border-b border-line py-5 opacity-0 animate-[fadeUp_0.4s_ease_forwards] focus-ring"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="w-8 shrink-0 font-mono text-xs text-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg font-medium text-ink group-hover:underline underline-offset-2">
                      {p.name}
                    </h3>
                    {p.description && <p className="truncate text-sm text-muted">{p.description}</p>}
                  </div>
                  <div className="hidden w-40 shrink-0 sm:block">
                    <div className="mb-1 flex justify-between font-mono text-[0.7rem] text-muted">
                      <span>{p.done_count}/{p.task_count} done</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-pine transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmId(p.id); }}
                      aria-label="Delete project"
                      className="rounded-sm px-2 text-muted opacity-0 transition group-hover:opacity-100 hover:text-brick focus-ring"
                    >
                      ×
                    </button>
                    {confirmId === p.id && (
                      <ConfirmPopover
                        message="Delete this project and all its tasks?"
                        onConfirm={() => handleDelete(p.id)}
                        onCancel={() => setConfirmId(null)}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the `fadeUp` keyframe to `styles.css`**

Append to `frontend/src/styles.css`:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3: Typecheck + build + tests**

Run: `npx tsc --noEmit && npm run build && npm test`
Expected: build succeeds, tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/ProjectsPage.tsx frontend/src/styles.css
git commit -m "feat: ProjectsPage editorial masthead, states, confirm, toast"
```

---

### Task 11: `BoardPage` redesign (grid, states, transition, toast)

**Files:**
- Modify: `frontend/src/pages/BoardPage.tsx`

**Interfaces:** consumes `useToast` (Task 4), `Skeleton` (Task 6), `ErrorState` (Task 8).

- [ ] **Step 1: Rewrite `BoardPage.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { ProjectDetail, Task, TaskStatus } from "../types";
import Column from "../components/Column";
import TaskModal from "../components/TaskModal";
import Skeleton from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
const NEXT: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalTask, setModalTask] = useState<Task | null | "new">(null);
  const { toast } = useToast();

  useEffect(() => { if (id) load(id); }, [id]);

  function load(projectId: string) {
    setLoading(true);
    setError(null);
    api
      .getProject(projectId)
      .then(setProject)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleAdvance(task: Task) {
    const next = NEXT[task.status];
    if (!next) return;
    const updated = await api.updateTask(task.id, { status: next });
    setProject((prev) => (prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === task.id ? updated : t)) } : prev));
    toast("Moved to " + next.replace("_", " "));
  }

  async function handleDelete(task: Task) {
    await api.deleteTask(task.id);
    setProject((prev) => (prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== task.id) } : prev));
    toast("Task deleted");
  }

  async function handleSave(data: { title: string; description: string; status: TaskStatus; priority: Task["priority"]; due_date: string | null; }) {
    if (!project) return;
    if (modalTask === "new") {
      const created = await api.createTask(project.id, data);
      setProject((prev) => (prev ? { ...prev, tasks: [...prev.tasks, created] } : prev));
      toast("Task created");
    } else if (modalTask) {
      const updated = await api.updateTask(modalTask.id, data);
      setProject((prev) => (prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === modalTask.id ? updated : t)) } : prev));
      toast("Task saved");
    }
    setModalTask(null);
  }

  if (loading) {
    return (
      <div className="bg-measured min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-10">
            {STATUSES.map((s) => (
              <div key={s} className="flex-1 space-y-2.5">
                <Skeleton.Card />
                <Skeleton.Card />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-measured min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <ErrorState title="Couldn't load board" message={error} onRetry={() => id && load(id)} />
          <Link to="/" className="mt-4 inline-block font-mono text-[0.7rem] uppercase tracking-wide text-pine hover:underline">
            ← All projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-measured min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-sm text-muted">Project not found.</p>
          <Link to="/" className="text-sm text-pine hover:underline">← Back to projects</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-measured min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-wide text-muted hover:text-ink focus-ring">
          ← All projects
        </Link>
        <header className="mb-10 flex items-start justify-between border-b border-ink/80 pb-5">
          <div className="flex items-start gap-3">
            <span className="mt-2 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
            <div>
              <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted">Board</p>
              <h1 className="font-display text-3xl font-medium tracking-tight text-ink">{project.name}</h1>
              {project.description && <p className="mt-1 max-w-xl text-sm text-muted">{project.description}</p>}
            </div>
          </div>
          <button
            onClick={() => setModalTask("new")}
            className="shrink-0 rounded-sm bg-pine px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-pine-dark active:translate-y-px focus-ring"
          >
            + New task
          </button>
        </header>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-10" key={project.id}>
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={project.tasks.filter((t) => t.status === status)}
              onOpenTask={(t) => setModalTask(t)}
              onAdvanceTask={handleAdvance}
              onDeleteTask={handleDelete}
              onAddTask={() => setModalTask("new")}
            />
          ))}
        </div>

        {modalTask && (
          <TaskModal task={modalTask === "new" ? null : modalTask} onClose={() => setModalTask(null)} onSave={handleSave} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build + tests**

Run: `npx tsc --noEmit && npm run build && npm test`
Expected: build succeeds, tests pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/BoardPage.tsx
git commit -m "feat: BoardPage grid, skeleton/error states, board transition, toast"
```

---

### Task 12: `Column` restyle (hairline entries, staggered)

**Files:**
- Modify: `frontend/src/components/Column.tsx`

**Interfaces:** consumes `TaskCard` (Task 13), `Skeleton` (Task 6).

- [ ] **Step 1: Rewrite `Column.tsx`**

```tsx
import type { Task, TaskStatus } from "../types";
import TaskCard from "./TaskCard";
import Skeleton from "./ui/Skeleton";

const LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function Column({
  status,
  tasks,
  onOpenTask,
  onAdvanceTask,
  onDeleteTask,
  onAddTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onOpenTask: (t: Task) => void;
  onAdvanceTask: (t: Task) => void;
  onDeleteTask: (t: Task) => void;
  onAddTask: () => void;
}) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col">
      <div className="mb-3 flex items-baseline justify-between border-b border-ink/80 pb-2">
        <h2 className="font-display text-[1.05rem] font-medium text-ink">{LABELS[status]}</h2>
        <span className="font-mono text-xs text-muted tabular-nums">{tasks.length}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {tasks.map((t, i) => (
          <div
            key={t.id}
            className="opacity-0 animate-[fadeUp_0.4s_ease_forwards]"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <TaskCard
              task={t}
              index={i}
              onOpen={() => onOpenTask(t)}
              onAdvance={() => onAdvanceTask(t)}
              onDelete={() => onDeleteTask(t)}
            />
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="tick-frame rounded-sm border border-dashed border-line px-3 py-4 text-center text-xs text-muted">
            Nothing here yet.
          </p>
        )}

        {status === "todo" && (
          <button
            onClick={onAddTask}
            className="tick-frame mt-1 rounded-sm border border-dashed border-line px-3 py-2 text-left text-sm text-muted transition hover:border-pine hover:text-pine focus-ring"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Column.tsx
git commit -m "style: Column hairline entries + staggered entry"
```

---

### Task 13: `TaskCard` restyle (hairline + corner ticks, StatusBadge, pressed)

**Files:**
- Modify: `frontend/src/components/TaskCard.tsx`

**Interfaces:** consumes `StatusBadge` (Task 7).

- [ ] **Step 1: Rewrite `TaskCard.tsx`**

```tsx
import type { Task, TaskStatus } from "../types";
import type { CSSProperties } from "react";
import StatusBadge from "./ui/StatusBadge";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  high: "bg-brick",
  medium: "bg-gold",
  low: "bg-pine",
};

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

const NEXT_LABEL: Record<TaskStatus, string> = {
  todo: "Start →",
  in_progress: "Finish →",
  done: "",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskCard({
  task,
  index,
  onOpen,
  onAdvance,
  onDelete,
}: {
  task: Task;
  index: number;
  onOpen: () => void;
  onAdvance: () => void;
  onDelete: () => void;
}) {
  const due = formatDate(task.due_date);
  const overdue =
    task.due_date && task.status !== "done" && new Date(task.due_date) < new Date(new Date().toDateString());

  return (
    <div
      className="tick-frame group relative flex gap-3 rounded-sm border border-line bg-surface py-3 pl-0 pr-3 shadow-card transition hover:border-ink/30 hover:shadow-pop"
      style={{ "--tick": "#E4E1DA" } as CSSProperties}
    >
      <div className={`w-1 shrink-0 rounded-l-sm ${PRIORITY_COLOR[task.priority]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={onOpen}
            className="text-left font-sans text-[0.925rem] font-medium leading-snug text-ink hover:underline underline-offset-2 focus-ring rounded-sm"
          >
            {task.title}
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete task"
            className="shrink-0 rounded-sm px-0.5 text-muted opacity-0 transition group-hover:opacity-100 hover:text-brick focus-ring active:translate-y-px"
          >
            ×
          </button>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-[0.8rem] leading-snug text-muted">{task.description}</p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[0.7rem]">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            <span className="font-mono text-muted tabular-nums">#{String(index + 1).padStart(2, "0")}</span>
            <span className="text-line">·</span>
            <span className={overdue ? "font-medium text-brick" : "text-muted"}>{due ? due : "no due date"}</span>
            <span className="text-line">·</span>
            <span className="uppercase tracking-wide text-muted">{PRIORITY_LABEL[task.priority]}</span>
          </div>
          {NEXT_STATUS[task.status] && (
            <button
              onClick={onAdvance}
              className="font-mono text-[0.7rem] text-pine opacity-0 transition group-hover:opacity-100 hover:text-pine-dark focus-ring rounded-sm active:translate-y-px"
            >
              {NEXT_LABEL[task.status]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/TaskCard.tsx
git commit -m "style: TaskCard hairline + corner ticks, StatusBadge, pressed state"
```

---

### Task 14: `TaskModal` tinted shadow + pressed state

**Files:**
- Modify: `frontend/src/components/TaskModal.tsx`

**Interfaces:** no new consumes.

- [ ] **Step 1: Replace `shadow-xl` and add pressed states**

In `frontend/src/components/TaskModal.tsx`, change the modal container class from `shadow-xl` to `shadow-pop`, and add `active:translate-y-px` to the Cancel and Save buttons. The two button lines become:

```tsx
<button
  onClick={onClose}
  className="rounded-sm px-3 py-2 text-sm text-muted transition hover:text-ink focus-ring active:translate-y-px"
>
  Cancel
</button>
<button
  disabled={!canSave}
  onClick={() =>
    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    })
  }
  className="rounded-sm bg-pine px-4 py-2 text-sm font-medium text-paper transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-40 focus-ring active:translate-y-px"
>
  {task ? "Save changes" : "Add task"}
</button>
```

and the modal wrapper:

```tsx
<div className="w-full max-w-md rounded-sm border border-line bg-surface p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/TaskModal.tsx
git commit -m "style: TaskModal tinted shadow + pressed state"
```

---

### Task 15: `ProjectModal` tinted shadow + pressed state

**Files:**
- Modify: `frontend/src/components/ProjectModal.tsx`

**Interfaces:** no new consumes.

- [ ] **Step 1: Replace `shadow-xl` and add pressed states**

In `frontend/src/components/ProjectModal.tsx`, change the modal container `shadow-xl` → `shadow-pop`, and add `active:translate-y-px` to the Cancel and Create buttons:

```tsx
<button
  onClick={onClose}
  className="rounded-sm px-3 py-2 text-sm text-muted transition hover:text-ink focus-ring active:translate-y-px"
>
  Cancel
</button>
<button
  disabled={!canSave}
  onClick={() => onSave({ name: name.trim(), description: description.trim(), color })}
  className="rounded-sm bg-pine px-4 py-2 text-sm font-medium text-paper transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-40 focus-ring active:translate-y-px"
>
  Create project
</button>
```

modal wrapper:

```tsx
<div className="w-full max-w-md rounded-sm border border-line bg-surface p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ProjectModal.tsx
git commit -m "style: ProjectModal tinted shadow + pressed state"
```

---

### Task 16: Final verification

**Files:** none new; verification only.

**Interfaces:** consumes all prior tasks.

- [ ] **Step 1: Full typecheck + build + tests**

Run: `npx tsc --noEmit && npm run build && npm test`
Expected: tsc clean, vite build succeeds, all Vitest tests pass.

- [ ] **Step 2: Grep for leftover generic patterns**

Run: `git grep -n "shadow-xl" frontend/src; git grep -n "confirm(" frontend/src; git grep -n "alert(" frontend/src`
Expected: no matches (all replaced).

- [ ] **Step 3: Commit (if any stray cleanup was needed)**

Only commit if Step 2 surfaced fixes. Otherwise no commit needed for this task.

```bash
git add -A frontend/src
git commit -m "chore: final redesign verification"
```

---

## Self-Review Notes

- **Spec coverage:** tokens (T1–T2), favicon/OG (T3), Toast (T4), ConfirmPopover (T5), Skeleton (T6), StatusBadge (T7), ErrorState (T8), 404 (T9–T10), ProjectsPage (T10), BoardPage (T11), Column (T12), TaskCard (T13), modals (T14–T15), final verify (T16). All spec sections §5–§10 mapped.
- **Placeholder scan:** every task shows concrete code or exact class edits; no TBD/TODO.
- **Type consistency:** `useToast` signature, `ConfirmPopover` props, `StatusBadge` props, `Skeleton.Row`/`Skeleton.Card`, and `ErrorState` props match across producing and consuming tasks.
- **Out of scope honored:** no backend, auth, DnD, or dark mode tasks included.
