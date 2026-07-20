# Ledger — Redesign Design

**Date:** 2026-07-20
**Scope:** Visual + interaction polish of the existing "Ledger" project-management app (frontend only).
**Status:** Approved design, pending implementation plan.

---

## 1. Summary

Ledger is a Kanban project-management tool (FastAPI + SQLAlchemy + SQLite backend; React 18 + TypeScript + Vite + Tailwind v3 + React Router frontend). The current UI is already cohesive — a paper/ink "ledger" metaphor with Fraunces (display serif), Inter (UI), IBM Plex Mono (metadata), and a pine/gold/brick accent system.

This redesign applies the **full polish + motion pass (B)** plus a **bolder identity evolution (C)**, resolved as a **B + C blend**: an *editorial-technical* hybrid. Think a fine-publication masthead laid out on a measured grid — oversized Fraunces headings, generous whitespace, monospace metadata, and hairline entries with corner ticks. Accent defaults to **pine (warm)**; indigo (cool) is a one-token swap if desired later.

---

## 2. Goals

- Elevate the existing identity rather than rebuild it.
- Fix the concrete gaps the redesign audit flagged: no favicon/OG meta, native `confirm()` delete, no error states, no loading skeletons, no toast feedback, no pressed/active button feedback, untinted modal shadows, pure-white surface on warm paper.
- Add restrained motion: staggered entry, board transitions, branded 404.
- Keep the app fully working at every step; small, reviewable diffs.

## 3. Non-goals / Out of scope

- **No backend changes.** No auth, no drag-and-drop persistence, no schema changes. DnD and auth stay post-MVP (per README).
- **No dark mode.** The look is built around warm paper (light-first). Can be added later.
- **No new feature surface area** beyond the polish items below (e.g., no comments, no labels, no multi-user).
- No migration of framework or styling library (stays Tailwind v3, no UI kit added).

---

## 4. Current state (brief)

| Area | Today | Gap |
|------|-------|-----|
| `index.html` | Title + fonts only | No favicon, no meta description, no OG tags |
| Project delete | Native `confirm()` | Browser dialog; not styled/accessible |
| Loading | Plain text "Loading…" | No skeleton; jumps to content |
| API failure | Silent; falls through to wrong empty view | No error state |
| Create/delete | No feedback | No toast |
| Buttons | Hover only | No pressed/active feedback |
| Modal shadow | `shadow-xl` (black) | Untinted |
| `surface` | `#FFFFFF` | Pure white on warm paper |
| 404 | None (React Router has no catch-all) | Dead-end on bad URL |

---

## 5. Design direction

### 5.1 Identity — Editorial-Technical hybrid

Combines **B (editorial premium)**: oversized Fraunces masthead, asymmetric layout, lots of air, one restrained accent, hairline dividers — with **C (working draft)**: a faint measured grid, monospace-forward metadata, hairline entries with corner ticks, and technical/measurement-style labels (e.g., `#03 · med · due 07-20`).

### 5.2 Typography (unchanged families)

- **Display:** Fraunces (serif) for mastheads, page/section titles, project names. Use 600/700 weights at large sizes with tight tracking.
- **UI:** Inter for body, controls, task titles.
- **Metadata:** IBM Plex Mono for indices, counts, dates, status pills, kickers. Enable `tabular-nums`.
- Small kickers/labels: mono, uppercase, wide tracking.

### 5.3 Color & surfaces (token changes)

Updated in `tailwind.config.js` `theme.extend.colors`:

| Token | Today | New | Note |
|-------|-------|-----|------|
| `paper` | `#FAFAF8` | `#F6F3EC` | Warmer, grounds the grid texture |
| `surface` | `#FFFFFF` | `#FCFBF7` | Warm white; fixes pure-white mismatch |
| `ink` | `#1B1A17` | `#1B1A17` | unchanged |
| `muted` | `#6B6862` | `#6B6862` | unchanged (warm gray family) |
| `line` | `#E4E1DA` | `#E4E1DA` | unchanged |
| `pine` | `#2F5D50` / soft `#D9E6DE` / dark `#20423A` | unchanged | primary accent |
| `gold` | `#B8862E` / soft `#F1E4C8` | unchanged | reserved for rules/underlines |
| `brick` | `#B3402F` / soft `#F3DDD7` | unchanged | high priority only |
| `grid` | — | `rgba(47,93,80,0.05)` | faint measured-grid lines (pine-tinted) |

> Indigo variant (if swapped later): `pine` → `#2B3A67`, `paper` → `#F2F4F8`, `grid` → `rgba(43,58,103,0.06)`. Single place to change.

### 5.4 Texture & grid

- A faint measured grid (≈18px, `grid` color) sits behind page content via a reusable utility/class (e.g., `.bg-measured`). Very low opacity so it reads as "technical paper," not a pattern.
- Ruled-line body background is retired in favor of the measured grid for a more deliberate, architectural feel.

### 5.5 Component styling language

- **Entries/cards:** hairline border (`line`), warm `surface` fill, soft tinted shadow. Corner ticks = two small 6px squares absolutely positioned at top-left and bottom-right corners showing only the adjacent borders (the "draft" detail from C).
- **Status:** `StatusBadge` mono pill (`TODO` / `IN PROG` / `DONE`) with the corner-tick treatment; color follows status (pine for in-progress/done progression, muted for todo).
- **Rules:** thin gold rule under mastheads/labels as the single decorative accent.
- **Pressed state:** every interactive control gets `active:translate-y-px active:scale-[0.98]` plus the existing `focus-ring`.

### 5.6 Motion principles

- Use only `transform` and `opacity` (GPU-friendly).
- Staggered entry: lists/cards fade + rise (`translateY(8px)→0`), per-item `transition-delay`.
- Board transitions when a task advances columns (layout/opacity).
- All motion gated by the existing `@media (prefers-reduced-motion: reduce)` rule (already in `styles.css`).

---

## 6. Architecture & files changed

```
frontend/
  index.html                      # favicon, meta description, OG tags
  tailwind.config.js              # token updates (paper/surface/grid), shadow + tick utilities
  src/
    styles.css                    # .bg-measured grid, corner-tick helpers, tinted shadows, pressed state
    main.tsx                      # wrap app in ToastProvider; add 404 catch-all route
    types.ts                      # (no change expected)
    api.ts                        # (no change; errors surfaced by callers)
    components/
      ui/
        Toast.tsx                 # NEW: toast + ToastProvider context
        ConfirmPopover.tsx        # NEW: accessible inline delete confirm
        Skeleton.tsx              # NEW: shimmer blocks
        StatusBadge.tsx           # NEW: mono status pill w/ corner ticks
        ErrorState.tsx            # NEW: inline error + retry
      Column.tsx                  # hairline+corner-tick entries, staggered entry, StatusBadge
      TaskCard.tsx                # hairline+corner-tick, StatusBadge, pressed state
      TaskModal.tsx               # tinted shadow, pressed state
      ProjectModal.tsx            # tinted shadow, pressed state
      NotFoundPage.tsx            # NEW: branded 404
    pages/
      ProjectsPage.tsx            # masthead, grid bg, Skeleton, ErrorState, ConfirmPopover, Toast, staggered rows
      BoardPage.tsx               # grid bg, Skeleton, ErrorState, board transition, Toast
```

No backend files change.

---

## 7. New UI primitives (`src/components/ui/`)

- **`Toast` + `ToastProvider`** — context API `useToast()` → `toast(message, tone?)`. Renders a stack of auto-dismissing toasts (top-right). Tones: `success` (pine), `error` (brick). Respects reduced-motion. Used for create/save/delete confirmation.
- **`ConfirmPopover`** — replaces native `confirm()`. Props: `message`, `onConfirm`, `onCancel`. Inline popover anchored to the trigger; focus moved in, `Esc` cancels, `Enter` confirms, focus restored on close. Styled (hairline + corner ticks).
- **`Skeleton`** — `Skeleton.Row` and `Skeleton.Card` shimmer blocks sized to match project rows and task cards.
- **`StatusBadge`** — `tone: 'todo' | 'in_progress' | 'done'` → mono pill with corner-tick styling.
- **`ErrorState`** — `title`, `message`, `onRetry?`; inline, no `alert()`.

---

## 8. Page & component updates

### ProjectsPage
- Editorial masthead: mono kicker ("Project ledger / index"), large Fraunces "Ledger", gold rule.
- `.bg-measured` page background.
- Loading → `Skeleton.Row` list. Failure → `ErrorState` with retry (re-calls `load()`).
- Each project row: staggered entry, index in mono, color dot, Fraunces/Inter title, mono `done/total · %`, hairline progress.
- Delete uses `ConfirmPopover` (replaces `confirm()`); on success shows `Toast` and removes the row.
- Create shows success `Toast`.

### BoardPage + Column + TaskCard
- `.bg-measured` background; editorial board header (project name in Fraunces, mono meta).
- Loading → `Skeleton.Card` columns. Failure → `ErrorState` with retry.
- `TaskCard`: hairline border + corner ticks, `StatusBadge`, mono metadata (`#0n · priority · due`), pressed state, hover reveal of delete/advance kept.
- Staggered entry on cards; when a task advances columns, animate the move (opacity/transform).
- Create/edit/delete task → `Toast`; delete uses `ConfirmPopover` where appropriate (advance stays one-click).

### TaskModal / ProjectModal
- Replace `shadow-xl` with tinted `shadow-pop`; add pressed states; keep `focus-ring`.

---

## 9. Loading, empty, error states

- **Loading:** `Skeleton` lists/cards (replaces text). Brief, only while `loading` is true.
- **Empty:** existing empty states kept and lightly restyled (hairline + corner-tick container, mono label).
- **Error:** `ErrorState` shown when `api.*` rejects; never silently falls through to empty. Retry re-invokes the loader.

---

## 10. Meta, favicon, 404

- **`index.html`:** add `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`), and an inline SVG favicon (ledger "L" mark in pine on paper). `og:image` points to a static asset under `public/` (added as an SVG/PNG).
- **`NotFoundPage`:** branded 404 with the masthead, a line of copy, and a "← Back to projects" link. Wired as the `*` route in `main.tsx`.

---

## 11. Accessibility

- Keep semantic landmarks (`header`, `main`, `nav` where relevant).
- `ConfirmPopover` and `Toast` are keyboard-operable; focus managed; `aria-live` on toasts/errors.
- Visible `focus-ring` retained on all controls.
- Corner ticks are decorative (`aria-hidden`).
- Color is never the sole carrier of status (text label present in `StatusBadge`).

---

## 12. Verification

- `npx tsc --noEmit` passes (TypeScript strict check).
- `npm run build` (tsc -b + vite build) succeeds.
- Manual reasoning over each changed component for hover/active/focus states.
- **Note:** live browser verification is blocked in this sandbox; I will verify statically (typecheck + build) and state that explicitly rather than claim browser-confirmed polish.

---

## 13. Risks & mitigations

- **Regression in working app** → incremental primitives + apply per page; typecheck/build after each batch.
- **Grid texture too loud** → keep opacity very low (`grid` token); easy to dial down.
- **Motion causes jank** → transform/opacity only; reduced-motion fallback.
- **`.superpowers/` mockups committed** → add `.superpowers/` to `.gitignore`.

---

## 14. Open decisions / defaults

- Accent: **pine (warm)** by default; indigo is a one-token swap (§5.3).
- Dark mode: not included.
- Drag-and-drop, auth: post-MVP, unchanged.
