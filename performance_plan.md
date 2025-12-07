### ✅ Recommended Architecture: Layout-Level Convex Subscriptions
Problem We Are Solving

In a React + Vite app using Convex, pages inside the dashboard are unmounted and remounted when navigating.
If each page uses its own useQuery, Convex subscriptions restart and we briefly see loading states or flicker.
The goal is to eliminate re-fetching and UI delays while keeping Convex as the single source of truth.

### ✅ Core Principle

Convex should be the global data cache.
Pages should not fetch server data directly.
Subscriptions must live in a component that never unmounts.

### ✅ High-Level Strategy

Move all Convex useQuery calls for dashboard data into the Dashboard layout component.

Keep the layout mounted for the entire /dashboard/* route using React Router nested routes.

Share fetched data with child pages via React Context.

Use Zustand only for UI and client state, not server data mirroring.

Chat, tasks, calendar, and members stay reactive without re-fetching.

### ✅ Data Ownership Rules
Type of State	Where it Lives
Tasks, Members, Calendar Events	Convex (useQuery in layout)
Chat Messages	Convex (mounted in layout)
Selected Task	Zustand
UI Toggles / Modals	Zustand
Filters / Sorting	Zustand
Convex owns server truth
Zustand owns local UI behavior

### Folder Structure
src/
 ├─ layouts/
 │   └─ DashboardLayout.tsx
 ├─ context/
 │   └─ DashboardDataContext.tsx
 ├─ pages/
 │   ├─ DashboardHome.tsx
 │   ├─ Tasks.tsx
 │   ├─ Calendar.tsx
 │   └─ Members.tsx
 ├─ components/
 │   └─ chat/
 │       └─ ChatPanel.tsx


### Dashboard Layout Responsibilities

DashboardLayout.tsx should:

Call all required useQuery hooks exactly once

Stay mounted while navigating dashboard routes

Provide data to pages via Context

Mount ChatPanel permanently

Example responsibilities:

Fetch tasks

Fetch members

Fetch calendar events

Handle initial loading once


### Context Consumption Pattern

Pages must not call useQuery.



### ✅ Loading State Strategy

Show a full dashboard loader only once when layout mounts.

Never show loaders inside child pages for shared data.

Pages must assume data already exists.

This matches professional dashboard UX.


### Why This Is Better Than Global Store Caching

Avoids double caches (Convex + Zustand)

No manual sync logic

No stale data issues

Convex already handles diffs, ordering, and real time updates

This approach is simpler, safer, and faster.


### ✅ Performance & Scalability

Convex deduplicates queries

WebSocket stays open

Minimal network chatter

Clean separation of concerns

Scales well with large teams

### ✅ Final Rule for the AI Agent

Fetch shared server data only in the layout.
Never mirror Convex data into Zustand.
Never fetch the same data in multiple pages.