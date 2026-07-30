# Kanban Redesign Specification

## Context

The current dashboard at `/app/` shows stats cards, recent projects, recent tasks, backlog, and quick actions. The user wants to transform this into a **Global Kanban Board** showing all tasks across all projects, while keeping the same theme/style, sidebar, and topbar.

Project-level boards at `/app/projects/$id/` already exist as Kanban boards and will be enhanced with column stats, swimlanes, and cross-project drag support.

Sidebar will gain global filter buttons.

---

## Architecture

### Route Structure (unchanged)

```
/app/                    → Global Kanban Board (NEW)
/app/projects            → Project list (unchanged)
/app/projects/$id/       → Project Kanban Board (ENHANCED)
/app/projects/$id/list   → Project List view (unchanged)
/app/projects/$id/settings → Project Settings (unchanged)
/app/members             → Members (unchanged)
```

### Data Flow

**Global Board** (`/app/`):
- Uses existing `useProjectsOverview` hook (already fetches all projects + tasks + members)
- Groups tasks by status across all projects
- Columns: Backlog, In Progress, Review, Done
- Task cards show project color indicator

**Project Board** (`/app/projects/$id/`):
- Already fetches single project tasks
- Enhancements:
  - Column headers show task counts
  - Swimlane toggle (assignee/priority/none)
  - Cross-project drag target registration

---

## Components

### New / Modified Components

| Component | Path | Purpose |
|-----------|------|---------|
| `GlobalKanbanBoard` | `frontend/src/components/orbit/global-kanban-board.tsx` | Dashboard: all-tasks board |
| `KanbanColumn` | `frontend/src/components/orbit/kanban-column.tsx` | Reusable column with header, drop zone, cards |
| `KanbanTaskCard` | `frontend/src/components/orbit/kanban-task-card.tsx` | Compact task card (project color dot, assignee, priority, due) |
| `SwimlaneToggle` | `frontend/src/components/orbit/swimlane-toggle.tsx` | Project board: switch swimlane mode |
| `SidebarFilters` | `frontend/src/components/orbit/sidebar-filters.tsx` | Global filters in sidebar |

### Reused Components
- `TaskDialog` - task detail/edit (already exists)
- `ProgressRing` - column stats
- `MemberStack` / `MemberAvatar` - assignees
- `PriorityBadge` / `StatusPill` - badges
- `SpotlightCard` - project cards in projects list

---

## UI Design

### Global Kanban Board (`/app/`)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Topbar (search, notifications, user)                                │
├──────────────┬──────────────────────────────────────────────────────┤
│ Sidebar      │  Global Kanban Board                                 │
│              │  ┌──────────┬────────────┬──────────┬────────────┐  │
│ [Filters]    │  │ Backlog  │ In Progress│ Review   │ Done       │  │
│  ☐ My Tasks  │  │ (12)     │ (5)        │ (3)      │ (28)       │  │
│  ☐ Overdue   │  │ ─────────│ ───────────│ ──────── │ ────────── │  │
│  ☐ High Prio │  │ ● Proj A │ ● Proj B   │ ● Proj A │ ● Proj C   │  │
│              │  │ Task 1   │ Task 3     │ Task 4   │ Task 5     │  │
│ Projects     │  │ Task 2   │            │          │ Task 6     │  │
│  ▸ Project A │  │          │            │          │ ...        │  │
│  ▸ Project B │  └──────────┴────────────┴──────────┴────────────┘  │
│  ▸ Project C │                                                    │
└──────────────┴──────────────────────────────────────────────────────┘
```

- Full-width board (max-w-7xl centered)
- 4 columns, equal width, min-h-[500px]
- Column header: status label + count + progress ring (done/total)
- Task card: title, project color dot, priority badge, assignee avatar, due date
- Empty state: "Add task" button per column
- Drag-drop between columns (existing logic reused)

### Project Kanban Board (`/app/projects/$id/`) - Enhanced

```
┌─────────────────────────────────────────────────────────────────────┐
│ Project Header + Tab Nav (Board | List | Settings)                  │
├─────────────────────────────────────────────────────────────────────┤
│ [Swimlanes: ▼ None | Assignee | Priority]  [Filter] [Add Task]     │
├──────────┬────────────┬──────────┬────────────┤
│ Backlog  │ In Prog... │ Review   │ Done       │
│ (8) 🔄42%│ (3) 🔄60%  │ (2)     │ (15)       │
├──────────┼────────────┼──────────┼────────────┤
│          │            │          │            │
│  ▸ User A│  ▸ User A  │  ▸ User B│  ▸ User A  │
│  Task 1  │  Task 3    │  Task 4  │  Task 5    │
│  Task 2  │            │          │  Task 6    │
│          │            │          │            │
│  ▸ User B│  ▸ Unassign│          │  ▸ User C  │
│  Task 7  │            │          │  Task 8    │
└──────────┴────────────┴──────────┴────────────┘
```

- Swimlane toggle in toolbar (None / Assignee / Priority)
- Column stats: count + progress ring
- Cross-project drag: accept drops from global board (creates task in this project)

### Sidebar Filters
- Added above "Projects" group
- Checkboxes: My Tasks, Overdue, High Priority
- Filter applied to global board and project boards

---

## Implementation Phases

### Phase 1: Global Kanban Board Component
1. Create `GlobalKanbanBoard` component using existing `useProjectsOverview` data
2. Create `KanbanColumn` + `KanbanTaskCard` reusable components
3. Replace dashboard content in `app.index.tsx` with `GlobalKanbanBoard`
4. Connect drag-drop (reuse logic from `app.projects.$id.index.tsx`)

### Phase 2: Project Board Enhancements
1. Add column stats (count + progress) to project board headers
2. Add `SwimlaneToggle` component and integrate
3. Implement swimlane rendering (assignee / priority groupings)
4. Add cross-project drag support (drop creates task in target project)

### Phase 3: Sidebar Filters
1. Create `SidebarFilters` component
2. Add to `AppSidebar` above Projects group
3. Connect filter state to global board and project boards via URL search params or context

### Phase 4: Polish
- Responsive: stack columns on mobile (< 640px) or horizontal scroll
- Empty states, loading skeletons
- Keyboard accessibility for drag-drop
- Animations (framer-motion) for column reorder, card movement

---

## Technical Details

### Drag-Drop Reuse
- Use native HTML5 drag-drop (already implemented in project board)
- `KanbanColumn` handles drop zone logic
- `KanbanTaskCard` handles drag start
- DataTransfer: `{ taskId, projectId, source: 'global' | 'project' }`

### Filter State
- Store in URL search params: `?filter=my-tasks&filter=overdue`
- Or React Context for instant UI updates without navigation
- Apply filter in `useProjectsOverview` derived data or component-level

### Swimlane Logic
- **None**: Flat list per column (current)
- **Assignee**: Group tasks by assignee within each column; "Unassigned" group last
- **Priority**: Group by priority (Urgent → High → Medium → Low) within each column

---

## Verification

1. **Global Board**: Visit `/app/` → see all tasks across projects in 4 columns, drag between columns updates status
2. **Project Board**: Visit `/app/projects/$id/` → see column stats, swimlane toggle works, can drop task from global board
3. **Sidebar Filters**: Check filters → global board updates instantly
4. **Theme/Style**: All components use existing Orbit design tokens, Tailwind classes, framer-motion
5. **Responsive**: Test < 640px, 640-1024px, > 1024px

---

## Files to Modify

| File | Change |
|------|--------|
| `frontend/src/routes/app.index.tsx` | Replace dashboard with GlobalKanbanBoard |
| `frontend/src/routes/app.projects.$id.index.tsx` | Add column stats, swimlanes, cross-project drag |
| `frontend/src/components/orbit/app-sidebar.tsx` | Add SidebarFilters above Projects group |
| `frontend/src/components/orbit/global-kanban-board.tsx` | **NEW** |
| `frontend/src/components/orbit/kanban-column.tsx` | **NEW** |
| `frontend/src/components/orbit/kanban-task-card.tsx` | **NEW** |
| `frontend/src/components/orbit/swimlane-toggle.tsx` | **NEW** |
| `frontend/src/components/orbit/sidebar-filters.tsx` | **NEW** |