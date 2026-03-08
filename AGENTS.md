# AGENTS.md — PMA Project Reference

> **Generated:** 2026-03-08 · **PRD Version:** 1.0.0 · **Codebase Snapshot:** Fresh scaffold (pre-implementation)

---

## 1. Project Overview

**PMA** (Project Management App) is a multi-tenant, enterprise-grade web application for industries requiring granular tracking of projects, financial phases, and production rates — primarily construction, engineering, and public works sectors in Algeria.

### Who It's For

| Persona                                | Role    | Primary Concern                                               |
| -------------------------------------- | ------- | ------------------------------------------------------------- |
| Company Owner (CEO/Founder)            | `OWNER` | Cross-unit financial visibility, billing, team oversight      |
| Unit Administrator (Branch Manager)    | `ADMIN` | Project execution, Gantt planning, production monitoring, CRM |
| Regular Member (Field Worker/Engineer) | `USER`  | Task completion, time logging, assigned project view          |

### Core Domain Hierarchy

```
Company (1 Owner, 1 Subscription, 1 Plan)
  └── Unit (1 Admin, N Members)
        ├── Projects (Phases → SubPhases → GanttMarkers)
        │     ├── Team (TeamMembers)
        │     ├── Production (Product → Productions)
        │     └── TimeEntries
        ├── Clients
        ├── Lanes → Tasks (Tags)
        └── Invitations
```

⚠️ **All database queries must be scoped by `companyId` to enforce tenant isolation.**

---

## 2. Tech Stack

### 🚧 Implementation Status

The codebase is currently a **bare Next.js scaffold** generated via `create-next-app`. All libraries below are specified in the PRD but only Next.js, React, and Tailwind CSS are installed.

### Target Stack (from PRD)

#### Frontend

| Technology    | Version | Purpose                                                      | Installed?       |
| ------------- | ------- | ------------------------------------------------------------ | ---------------- |
| Next.js       | 16.x    | App Router, Turbopack, Server Actions, `use cache` directive | ✅ `16.1.6`      |
| React         | 19.x    | UI rendering, concurrent features                            | ✅ `19.2.3`      |
| Tailwind CSS  | 4.x     | Utility-first styling                                        | ✅ `^4`          |
| shadcn/ui     | Latest  | Radix UI-based component primitives                          | 🚧 NOT INSTALLED |
| Framer Motion | Latest  | Page transitions, micro-animations                           | 🚧 NOT INSTALLED |
| Jotai         | Latest  | Client-side state (theme, sidebar collapsed/expanded)        | 🚧 NOT INSTALLED |
| @dnd-kit/core | Latest  | Drag-and-drop for Kanban and Gantt reordering                | 🚧 NOT INSTALLED |

#### Backend & Infrastructure

| Technology            | Purpose                                          | Installed?        |
| --------------------- | ------------------------------------------------ | ----------------- |
| Prisma (v7.2+)        | Type-safe ORM; all queries in `lib/queries.ts`   | 🚧 NOT INSTALLED  |
| PostgreSQL (Supabase) | Hosted relational database with Realtime support | 🚧 NOT CONFIGURED |
| Clerk                 | Authentication, sessions, invitations, RBAC      | 🚧 NOT INSTALLED  |
| Uploadthing           | File and asset uploads (logos, documents)        | 🚧 NOT INSTALLED  |

#### 📌 UNDOCUMENTED IN PRD — Present in Codebase

| Technology            | Version              | Purpose                                                                    |
| --------------------- | -------------------- | -------------------------------------------------------------------------- |
| Geist / Geist Mono    | (bundled w/ Next.js) | Google Fonts loaded in `app/layout.tsx` — PRD specifies no particular font |
| `pnpm-workspace.yaml` | —                    | Monorepo workspace config exists but PRD doesn't mention monorepo          |

---

## 3. Repository Structure

### Current State (Scaffold)

```
pma-webapp/
├── app/                          # Next.js App Router — scaffold only
│   ├── layout.tsx                # Root layout — Geist fonts, metadata stub
│   ├── page.tsx                  # Default Next.js landing page (placeholder)
│   ├── globals.css               # Tailwind import + basic theme vars
│   └── favicon.ico
├── docs/
│   └── PRD.md                    # 📌 Product Requirements Document (1282 lines)
├── public/                       # Static assets (Next.js/Vercel logos)
├── next.config.ts                # Empty config — no cacheComponents, no turbopack
├── package.json                  # Core deps only (Next, React, Tailwind)
├── tsconfig.json                 # Standard Next.js TS config, @/* path alias
├── eslint.config.mjs             # ESLint config
├── postcss.config.mjs            # PostCSS with Tailwind plugin
├── pnpm-workspace.yaml           # 📌 Monorepo workspace (undocumented)
└── AGENTS.md                     # ← This file
```

### Target Structure (from PRD)

> 🚧 None of the directories below exist yet.

```
src/                              # ⚠️ PRD expects src/ prefix — codebase uses app/ at root
├── app/                          # Next.js App Router pages & layouts
│   ├── site/                     # Marketing landing page (rewritten from /)
│   ├── company/
│   │   ├── sign-in/              # Clerk login portal
│   │   ├── sign-up/              # Clerk registration portal
│   │   └── [companyId]/          # OWNER dashboard, units, team, settings, billing
│   ├── unite/
│   │   └── [unitId]/             # ADMIN dashboard, projects, tasks, clients, etc.
│   ├── user/
│   │   └── [userId]/             # USER workspace — tasks, projects, analytics
│   ├── dashboard/
│   │   └── notifications/        # Full notifications page
│   ├── onboarding/               # 3-step wizard (Company → Unit → Invite)
│   └── unauthorized/             # Role denial page
├── components/
│   ├── global/                   # Navbar, Sidebar, CustomModal, CustomSheet, ThemeToggle
│   ├── forms/                    # ⚠️ ALL forms must live here (ProjectForm, TaskForm, etc.)
│   ├── dashboard/                # Page-specific components
│   └── ui/                       # shadcn/ui re-exports and primitives
├── lib/
│   ├── queries.ts                # ⚠️ SINGLE SOURCE OF TRUTH — ALL server actions & DB queries
│   ├── types.ts                  # ⚠️ SINGLE SOURCE OF TRUTH — ALL TypeScript interfaces & types
│   ├── utils.ts                  # formatAmount(), formatDate(), cn(), calcProgress()
│   └── cache.ts                  # ⚠️ SINGLE SOURCE OF TRUTH — ALL cache tags & cacheLife profiles
├── hooks/                        # Custom React hooks (useTimer, useNotifications)
├── store/                        # Jotai atoms (theme, sidebar, active unit)
├── proxy.ts                      # ⚠️ Next.js Middleware — routing, auth, rewrites
└── prisma/
    └── schema.prisma             # Prisma schema with all models
```

### ⚠️ Single-Source-of-Truth Files — Never Duplicate Logic

| File                    | Rule                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `lib/queries.ts`        | ALL server actions, mutations, and database queries. No DB calls elsewhere.             |
| `lib/types.ts`          | ALL TypeScript interfaces, types, and enums. No inline type definitions.                |
| `lib/cache.ts`          | ALL cache tag constants and `cacheLife()` profiles. No inline string literals for tags. |
| `lib/utils.ts`          | ALL formatting functions (`formatAmount`, `formatDate`). Use these everywhere.          |
| `lib/db.ts`             | Prisma Client singleton (globalThis pattern for dev HMR). Import from here only.        |
| `lib/uploadthing.ts`    | Uploadthing file router configuration. All upload route definitions live here.          |
| `prisma/schema.prisma`  | ALL data models. This is the database schema authority.                                 |
| `proxy.ts` (middleware) | ALL routing rules, auth guards, and URL rewrites.                                       |

### Environment Variables

> 🚧 NOT YET IMPLEMENTED — Planned in M01-T02.

| Variable                            | Service                           | Public? |
| ----------------------------------- | --------------------------------- | ------- |
| `DATABASE_URL`                      | Supabase (pooled via PgBouncer)   | No      |
| `DIRECT_URL`                        | Supabase (direct, for migrations) | No      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk                             | Yes     |
| `CLERK_SECRET_KEY`                  | Clerk                             | No      |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | Clerk (`/company/sign-in`)        | Yes     |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | Clerk (`/company/sign-up`)        | Yes     |
| `UPLOADTHING_TOKEN`                 | Uploadthing                       | No      |
| `NEXT_PUBLIC_APP_URL`               | App base URL                      | Yes     |

⚠️ `.env.local` is gitignored. `.env.example` is committed with placeholder values.

---

## 4. Data Models

> 🚧 NOT YET IMPLEMENTED — No `prisma/schema.prisma` file exists. The table below is sourced from PRD §10.

| Model          | Key Fields                                                                                                                             | Scoped By  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `User`         | id, name, email, role (OWNER/ADMIN/USER), jobTitle, avatarUrl, adminID, unitId, companyId                                              | —          |
| `Company`      | id, name, companyEmail, ownerId (unique, immutable), logo, nif, formJur, secteur, state, address, phone                                | —          |
| `Subscription` | id, startAt, endAt, price, active, companyId, planId                                                                                   | Company    |
| `Plan`         | id, name, monthlyCost, maxUnits, maxProjects, maxTasksPerProject, userLimit                                                            | — (global) |
| `Unit`         | id, name, address, phone, email, companyId, adminId                                                                                    | Company    |
| `Invitation`   | id, email (unique per company), unitId, companyId, status (PENDING/ACCEPTED/REJECTED), role, clerkInvitationId                         | Company    |
| `Project`      | id, name, code (unique/unit), type, montantHT, montantTTC, ods, delai, status (New/InProgress/Pause/Complete), signe, clientId, unitId | Unit       |
| `Phase`        | id, name, code, montantHT, start, end, status, obs, progress (0–100), duration (auto-calc days), projectId                             | Project    |
| `SubPhase`     | id, name, code, status (TODO/COMPLETED), progress (0–100), start, end, phaseId                                                         | Phase      |
| `GanttMarker`  | id, label, date, className, projectId                                                                                                  | Project    |
| `Product`      | id, date, taux, montantProd, phaseId                                                                                                   | Phase      |
| `Production`   | id, date, taux, mntProd, productId                                                                                                     | Product    |
| `Client`       | id, name (unique), wilaya, phone, email (unique), unitId                                                                               | Unit       |
| `Team`         | id, projectId                                                                                                                          | Project    |
| `TeamMember`   | id, role (label), teamId, userId                                                                                                       | Team       |
| `Task`         | id, title, description, startDate, dueDate, endDate, complete, assignedUserId, laneId, order, unitId                                   | Unit       |
| `Lane`         | id, name, color, order, unitId                                                                                                         | Unit       |
| `Tag`          | id, name, color, unitId                                                                                                                | Unit       |
| `TimeEntry`    | id, description, startTime, endTime, duration (minutes, auto-calc), userId, taskId, projectId                                          | User       |
| `Notification` | id, notification, companyId, unitId, userId, targetRole, targetUserId, read, type                                                      | Company    |
| `ActivityLog`  | id, companyId, unitId, userId, action, entityType, entityId, metadata (JSON), createdAt                                                | Company    |

### Key Model Constraints

- ⚠️ `Company.ownerId` is **unique and immutable** after creation
- ⚠️ `User.adminID` is **unique** — each unit has exactly one admin
- ⚠️ `Plan` limit fields: `null` means **unlimited**
- ⚠️ `Task` has a many-to-many with `Tag` (junction table)
- ⚠️ `Phase.duration` = `(end - start)` in calendar days — **auto-calculated on save**
- ⚠️ `Production.mntProd` = `Phase.montantHT × (taux / 100)` — **auto-calculated server-side**
- ⚠️ `TimeEntry.duration` = `(endTime - startTime)` in minutes — **auto-calculated**

---

## 5. Role-Based Access Control (RBAC)

> 🚧 NOT YET IMPLEMENTED — No middleware, no `queries.ts` role checks exist.

### Role Definitions

| Role    | Scope                                                     | How Assigned                                              |
| ------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `OWNER` | Company-wide (all units, all projects)                    | Auto-assigned at company creation — **cannot be invited** |
| `ADMIN` | Unit-scoped (their assigned unit only)                    | Via invitation with `role: ADMIN`, or promoted by OWNER   |
| `USER`  | Project-scoped (only assigned projects within their unit) | Via invitation with `role: USER`                          |

### ⚠️ Permission Matrix

| Action                                 | OWNER | ADMIN         | USER                       |
| -------------------------------------- | ----- | ------------- | -------------------------- |
| Create / delete Company                | ✓     | ✗             | ✗                          |
| Manage Subscription & Billing          | ✓     | ✗             | ✗                          |
| Create / delete Units                  | ✓     | ✗             | ✗                          |
| Edit Unit profile                      | ✓     | Own unit only | ✗                          |
| Invite members (any role except OWNER) | ✓     | Own unit only | ✗                          |
| Remove members                         | ✓     | Own unit only | ✗                          |
| Create / edit / delete Projects        | ✓     | Own unit only | ✗                          |
| View Project list                      | All   | Own unit      | Assigned only              |
| Edit Project financials                | ✓     | Own unit only | ✗                          |
| Create / edit Phases & SubPhases       | ✓     | Own unit only | ✗                          |
| Add GanttMarkers                       | ✓     | Own unit only | ✗                          |
| Reschedule Phases (drag)               | ✓     | Own unit only | ✗                          |
| Define Product (planned production)    | ✓     | Own unit only | ✗                          |
| Record Productions (actual)            | ✓     | Own unit only | ✗                          |
| View Production charts                 | ✓     | ✓             | Assigned projects only     |
| Manage Lanes                           | ✓     | Own unit only | ✗                          |
| Create / assign Tasks                  | ✓     | Own unit only | ✗                          |
| Move tasks between lanes               | ✓     | ✓             | Assigned tasks only        |
| Complete a task                        | ✓     | ✓             | Assigned tasks only        |
| Log Time Entries                       | ✓     | ✓             | ✓ (own entries)            |
| Edit / delete Time Entries             | ✓     | ✓             | Own entries only           |
| Manage Clients                         | ✓     | Own unit only | ✗                          |
| View Clients                           | ✓     | ✓             | Assigned projects' clients |
| View Activity Logs                     | All   | Own unit      | Assigned projects only     |
| Manage Tags                            | ✓     | Own unit only | ✗                          |

### ⚠️ Enforcement Rules

1. Role checks MUST happen **server-side** in `lib/queries.ts` — never trust client-side
2. Every mutation validates session AND role before executing
3. `companyId` scope is mandatory on every query
4. `OWNER` role **cannot** be assigned via invitation — only at company creation

---

## 6. Business Rules

> 🚧 NOT YET IMPLEMENTED — No `queries.ts` or business logic exists in the codebase.

### Financial Rules

| Rule              | Formula                                                    | Enforcement                                |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------ |
| TVA Amount        | `montantTTC - montantHT`                                   | Display calculation                        |
| TVA Percentage    | `((montantTTC - montantHT) / montantHT) × 100`             | Display calculation                        |
| Phase budget cap  | `Σ(Phase.montantHT) ≤ Project.montantHT`                   | ⚠️ Non-blocking warning (not a hard block) |
| Production amount | `Phase.montantHT × (Production.taux / 100)`                | ⚠️ Auto-calculated server-side on INSERT   |
| Project progress  | `Σ(Phase.progress × Phase.montantHT) / Σ(Phase.montantHT)` | Weighted average                           |

### Gantt & Planning Rules

| Rule                          | Constraint                                                               |
| ----------------------------- | ------------------------------------------------------------------------ |
| Phase duration                | `(Phase.end - Phase.start)` in calendar days — auto-calculated on save   |
| Phase start constraint        | ⚠️ `Phase.start ≥ Project.ods` — validate before save                    |
| SubPhase date range           | ⚠️ `SubPhase.start` and `SubPhase.end` must be within parent Phase range |
| Phase progress (w/ SubPhases) | `average(SubPhase.progress)` — auto-calculated                           |
| Phase progress (no SubPhases) | Set manually by ADMIN                                                    |

### Task & Kanban Rules

| Rule              | Detail                                                            |
| ----------------- | ----------------------------------------------------------------- |
| Lane ordering     | Ordered by `Lane.order` (ascending integer)                       |
| Task ordering     | Ordered by `Task.order` within each lane (ascending)              |
| Drag reorder      | Re-index only affected tasks' `order` values                      |
| Task completion   | ⚠️ `complete = true` does **NOT** auto-move task to a "Done" lane |
| Overdue detection | `dueDate < NOW && complete = false` → red badge                   |
| Time duration     | `(endTime - startTime)` in minutes — calculated on `endTime` set  |

### Subscription Enforcement Rules

| Rule                 | Detail                                                              |
| -------------------- | ------------------------------------------------------------------- |
| Limit check timing   | ⚠️ Before every `INSERT` for unit / project / task / member         |
| Unlimited indicator  | `Plan.maxX = null` → skip the check                                 |
| Enforcement location | ⚠️ Server-side in `queries.ts` — never client-side                  |
| Downgrade blocking   | If current usage > new plan limits → block and list exceeded limits |

### Subscription Lifecycle

| Plan            | Duration                  | Auto Activation        | Grace Period          | Post-Grace     |
| --------------- | ------------------------- | ---------------------- | --------------------- | -------------- |
| Starter (Trial) | 2 months from `createdAt` | ✅ At onboarding       | 7 days (banner shown) | Read-only mode |
| Pro             | Annual (paid, offline)    | ❌ Manual by pma admin | 7 days (banner shown) | Read-only mode |
| Premium         | Annual (paid, offline)    | ❌ Manual by pma admin | 7 days (banner shown) | Read-only mode |

⚠️ **No payment gateway.** All billing is offline (virement bancaire, chèque, contrat de prestation). Subscription activation is manual by pma platform admin.

⚠️ **No downgrade to Starter.** Once upgraded, cannot revert to trial.

### Plan Limits

| Feature             | Starter | Pro | Premium            |
| ------------------- | ------- | --- | ------------------ |
| Max Units           | 1       | 5   | Unlimited (`null`) |
| Max Projects        | 5       | 30  | Unlimited (`null`) |
| Max Tasks / Project | 20      | 200 | Unlimited (`null`) |
| Max Members         | 10      | 50  | Unlimited (`null`) |

### Notification Fan-Out Rules

| Rule                   | Detail                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| OWNER targeting        | Exactly 1 OWNER per company — `targetRole: OWNER` delivers to one user                      |
| USER project filtering | ⚠️ `USER` receives `PROJECT` notifications **only** for projects they are a `TeamMember` of |
| ADMIN fan-out          | Targets all ADMINs within the relevant unit                                                 |
| Read state             | `read = false` on creation; toggled per-user individually — **never globally**              |

### Notification Types

| Type         | OWNER | ADMIN | USER          | Trigger                            |
| ------------ | ----- | ----- | ------------- | ---------------------------------- |
| `INVITATION` | ✓     | ✓     | ✓             | Invite accepted or rejected        |
| `PROJECT`    | ✓     | ✓     | Assigned only | Project status change              |
| `TASK`       | ✓     | ✓     | ✓ (assigned)  | Task assigned to user              |
| `TEAM`       | ✓     | ✓     | ✓             | Added/removed from project team    |
| `PHASE`      | ✓     | ✓     | —             | Phase status change                |
| `CLIENT`     | ✓     | ✓     | —             | Client added or updated            |
| `PRODUCTION` | ✓     | ✓     | —             | Milestone / underperformance alert |
| `LANE`       | ✓     | ✓     | —             | Lane created or deleted            |
| `TAG`        | ✓     | ✓     | —             | Tag created or deleted             |
| `GENERAL`    | ✓     | ✓     | ✓             | System-wide announcements          |

---

## 7. Caching Strategy

> 🚧 NOT YET IMPLEMENTED — No `lib/cache.ts` file exists.

### Cache Life Profiles (to be defined in `lib/cache.ts`)

| Profile              | Stale  | Revalidate | Expire | Used For                                      |
| -------------------- | ------ | ---------- | ------ | --------------------------------------------- |
| `"static"`           | ∞      | ∞          | ∞      | Plan definitions — immutable at runtime       |
| `"days"`             | 1 day  | 1 day      | 7 days | Company profile, Unit profile                 |
| `"hours"`            | 1 hour | 1 hour     | 1 day  | Project list, Client list, Team members       |
| `"minutes"`          | 1 min  | 1 min      | 5 min  | Project detail, Phase list, Production charts |
| `"seconds"` (custom) | 30 sec | 30 sec     | 2 min  | Kanban lanes & tasks (high interactivity)     |
| `noStore`            | —      | —          | —      | Notifications, Activity logs (always fresh)   |

### Cache Tag Taxonomy (to be defined in `lib/cache.ts`)

Tags follow hierarchical naming: `domain:scope:id`

| Tag Function                 | Pattern                     | Scope           |
| ---------------------------- | --------------------------- | --------------- |
| `PLANS_TAG`                  | `"plans"`                   | Global (static) |
| `companyTag(id)`             | `company:${id}`             | Company         |
| `companyTeamTag(id)`         | `company:${id}:team`        | Company         |
| `subscriptionTag(companyId)` | `subscription:${companyId}` | Company         |
| `unitTag(id)`                | `unit:${id}`                | Unit            |
| `unitMembersTag(id)`         | `unit:${id}:members`        | Unit            |
| `unitProjectsTag(id)`        | `unit:${id}:projects`       | Unit            |
| `unitClientsTag(id)`         | `unit:${id}:clients`        | Unit            |
| `unitLanesTag(id)`           | `unit:${id}:lanes`          | Unit            |
| `unitTasksTag(id)`           | `unit:${id}:tasks`          | Unit            |
| `unitTagsTag(id)`            | `unit:${id}:tags`           | Unit            |
| `unitProductionsTag(id)`     | `unit:${id}:productions`    | Unit            |
| `projectTag(id)`             | `project:${id}`             | Project         |
| `projectPhasesTag(id)`       | `project:${id}:phases`      | Project         |
| `projectGanttTag(id)`        | `project:${id}:gantt`       | Project         |
| `projectTeamTag(id)`         | `project:${id}:team`        | Project         |
| `projectTimeTag(id)`         | `project:${id}:time`        | Project         |
| `phaseTag(id)`               | `phase:${id}`               | Phase           |
| `phaseProductionTag(id)`     | `phase:${id}:production`    | Phase           |
| `userTag(id)`                | `user:${id}`                | User            |
| `userTasksTag(id)`           | `user:${id}:tasks`          | User            |
| `userProjectsTag(id)`        | `user:${id}:projects`       | User            |
| `userAnalyticsTag(id)`       | `user:${id}:analytics`      | User            |

### ⚠️ Never-Cached Data (Always `unstable_noStore()`)

| Function                | Reason                              |
| ----------------------- | ----------------------------------- |
| `getNotifications()`    | Must reflect real-time unread state |
| `getActivityLogs()`     | Audit trail must be exactly current |
| `getUnreadCount()`      | Bell badge must be accurate         |
| `getInvitationStatus()` | State changes externally via Clerk  |

### Mutation → Revalidation Map

| Server Action          | Tags Invalidated                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `createUnit()`         | `companyTag(companyId)`                                                              |
| `updateUnit()`         | `unitTag(unitId)`                                                                    |
| `deleteUnit()`         | `companyTag(companyId)`, `unitTag(unitId)`                                           |
| `createProject()`      | `unitProjectsTag(unitId)`                                                            |
| `updateProject()`      | `projectTag(projectId)`, `unitProjectsTag(unitId)`                                   |
| `deleteProject()`      | `unitProjectsTag(unitId)`, `projectTag(projectId)`                                   |
| `createPhase()`        | `projectPhasesTag(projectId)`, `projectGanttTag(projectId)`, `projectTag(projectId)` |
| `updatePhase()`        | `projectPhasesTag(projectId)`, `projectGanttTag(projectId)`, `projectTag(projectId)` |
| `deletePhase()`        | `projectPhasesTag(projectId)`, `projectGanttTag(projectId)`                          |
| `createProduction()`   | `phaseProductionTag(phaseId)`, `unitProductionsTag(unitId)`                          |
| `updateProduction()`   | `phaseProductionTag(phaseId)`, `unitProductionsTag(unitId)`                          |
| `createTask()`         | `unitTasksTag(unitId)`, `userTasksTag(assignedUserId)`                               |
| `updateTask()`         | `unitTasksTag(unitId)`, `userTasksTag(assignedUserId)`                               |
| `moveTask()`           | `unitTasksTag(unitId)`, `unitLanesTag(unitId)`                                       |
| `deleteTask()`         | `unitTasksTag(unitId)`, `userTasksTag(assignedUserId)`                               |
| `createLane()`         | `unitLanesTag(unitId)`                                                               |
| `updateLane()`         | `unitLanesTag(unitId)`                                                               |
| `deleteLane()`         | `unitLanesTag(unitId)`, `unitTasksTag(unitId)`                                       |
| `createClient()`       | `unitClientsTag(unitId)`                                                             |
| `updateClient()`       | `unitClientsTag(unitId)`                                                             |
| `deleteClient()`       | `unitClientsTag(unitId)`                                                             |
| `addTeamMember()`      | `projectTeamTag(projectId)`, `userProjectsTag(userId)`, `companyTeamTag(companyId)`  |
| `removeTeamMember()`   | `projectTeamTag(projectId)`, `userProjectsTag(userId)`, `companyTeamTag(companyId)`  |
| `createTimeEntry()`    | `projectTimeTag(projectId)`, `userAnalyticsTag(userId)`                              |
| `updateTimeEntry()`    | `projectTimeTag(projectId)`, `userAnalyticsTag(userId)`                              |
| `updateSubscription()` | `subscriptionTag(companyId)`                                                         |
| `updateCompany()`      | `companyTag(companyId)`                                                              |
| `updateUser()`         | `userTag(userId)`                                                                    |
| `acceptInvitation()`   | `unitMembersTag(unitId)`, `companyTeamTag(companyId)`                                |

---

## 8. Routing & Middleware

> 🚧 NOT YET IMPLEMENTED — No `proxy.ts` / `middleware.ts` exists.

### Middleware Responsibilities (`proxy.ts`)

| Responsibility         | Detail                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| Route Protection       | `auth.protect()` on all `/company/*` and `/unite/*` routes       |
| Invitation Handling    | Detect `__clerk_ticket` param → route to `/company/sign-up`      |
| URL Normalization      | `/sign-in` → `/company/sign-in`, `/sign-up` → `/company/sign-up` |
| Path Masking           | Rewrite `/` → `/site` (browser URL stays `/`)                    |
| Static Asset Exclusion | Matcher excludes images, CSS, JS, fonts                          |

### Post-Login Redirect Logic

| Role    | Redirect Target        | Landing Experience          |
| ------- | ---------------------- | --------------------------- |
| `OWNER` | `/company/[companyId]` | Company dashboard           |
| `ADMIN` | `/unite`               | Unit selection / management |
| `USER`  | `/user/[userId]`       | Personal workspace          |

| Edge Case                        | Behavior                          |
| -------------------------------- | --------------------------------- |
| New Owner (no company)           | → `/company` onboarding launchpad |
| Invited User (pending)           | → `InvitationProcessor` component |
| Unrecognized role / no companyId | → `/unauthorized`                 |

### Route Domains

#### Public Routes

| Route              | Description                           |
| ------------------ | ------------------------------------- |
| `/`                | Rewritten to `/site` — marketing page |
| `/site`            | Landing page — features, pricing, CTA |
| `/company/sign-in` | Clerk login portal                    |
| `/company/sign-up` | Clerk registration portal             |

#### Company Routes (OWNER only)

| Route                                   | Description                                 |
| --------------------------------------- | ------------------------------------------- |
| `/company`                              | Onboarding launchpad                        |
| `/company/[companyId]`                  | Company dashboard — KPIs, financial summary |
| `/company/[companyId]/units`            | Unit management — CRUD, admin assignment    |
| `/company/[companyId]/team`             | Company-wide team directory                 |
| `/company/[companyId]/settings`         | Company metadata editing                    |
| `/company/[companyId]/settings/billing` | Subscription, plan limits, upgrade request  |

#### Unit Routes (OWNER + ADMIN)

| Route                                  | Access                          | Description                                                           |
| -------------------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| `/unite`                               | ADMIN                           | Unit selection entry                                                  |
| `/unite/[unitId]`                      | OWNER · ADMIN                   | Unit dashboard                                                        |
| `/unite/[unitId]/projects`             | OWNER · ADMIN                   | Project list + create                                                 |
| `/unite/[unitId]/projects/[projectId]` | OWNER · ADMIN · USER (assigned) | Project detail (tabs: Overview, Gantt, Production, Tasks, Time, Docs) |
| `/unite/[unitId]/tasks`                | OWNER · ADMIN                   | Unit Kanban board                                                     |
| `/unite/[unitId]/clients`              | OWNER · ADMIN                   | Unit CRM                                                              |
| `/unite/[unitId]/productions`          | OWNER · ADMIN                   | Production monitoring                                                 |
| `/unite/[unitId]/users`                | OWNER · ADMIN                   | Unit member directory                                                 |

#### User Routes

| Route                      | Access                     | Description                                       |
| -------------------------- | -------------------------- | ------------------------------------------------- |
| `/user/[userId]`           | USER (own) · OWNER · ADMIN | Personal landing — tasks, projects, notifications |
| `/user/[userId]/profile`   | USER (own)                 | Edit name, job title, avatar                      |
| `/user/[userId]/tasks`     | USER (own) · ADMIN         | All assigned tasks                                |
| `/user/[userId]/projects`  | USER (own) · ADMIN         | TeamMember projects                               |
| `/user/[userId]/analytics` | USER (own) · OWNER · ADMIN | Hours logged, tasks completed                     |

#### Shared Routes

| Route            | Access            | Description                               |
| ---------------- | ----------------- | ----------------------------------------- |
| `/unauthorized`  | Any authenticated | Role denial page                          |
| `/notifications` | All authenticated | Full notifications page with type filters |

---

## 9. Key Conventions

### Formatting Standards

| What             | Format                                        | Function                           |
| ---------------- | --------------------------------------------- | ---------------------------------- |
| Monetary amounts | `1 234 567,89 DA` (Algerian Dinar, FR locale) | `formatAmount()` in `lib/utils.ts` |
| Dates            | `DD MMM YYYY` (e.g. `15 Jan 2026`)            | `formatDate()` in `lib/utils.ts`   |
| TVA display      | Show HT and TTC with TVA difference           | Calculated display                 |
| Currency symbol  | `DA` (Algerian Dinar) — always suffix         | —                                  |

### Component Patterns

| Pattern              | Rule                                                        |
| -------------------- | ----------------------------------------------------------- |
| Forms                | ⚠️ ALL forms in `components/forms/` — never inline          |
| Modals               | Use `CustomModal` from `components/global/custom-modal.tsx` |
| Sheets / Side Panels | Use `CustomSheet` from `components/global/custom-sheet.tsx` |
| UI Components        | shadcn/ui re-exports from `components/ui/`                  |
| Server Actions       | ALL in `lib/queries.ts` — single file                       |
| Types                | ALL in `lib/types.ts` — single file                         |

### UI/UX Rules (from PRD)

| Rule                   | Detail                                                                |
| ---------------------- | --------------------------------------------------------------------- |
| Default theme          | Dark mode by default; light mode toggle available                     |
| Responsive target      | Desktop-first, responsive down to 768px (tablet)                      |
| Loading states         | Skeleton loaders on all data-fetching components                      |
| Empty states           | Illustration + message + contextual CTA                               |
| Sidebar state          | Persisted via Jotai atom synced to `localStorage`                     |
| Sidebar aesthetic      | Glassmorphism — `rgba(10,10,15,0.7)` + `backdrop-blur-xl`             |
| Active route highlight | `border-l-2 border-indigo-500` + `bg-indigo-500/10`                   |
| Icon standard          | Lucide React, 18px size, 1.5 stroke width                             |
| Toast errors           | All failed mutations surface a user-facing toast — no silent failures |

### 📌 UNDOCUMENTED IN PRD — Present in Codebase

| Finding                                   | Location                                                           |
| ----------------------------------------- | ------------------------------------------------------------------ |
| Uses Geist / Geist Mono fonts             | `app/layout.tsx` — PRD doesn't specify fonts                       |
| `pnpm-workspace.yaml` exists              | Project root — PRD doesn't mention monorepo                        |
| `@/*` path alias maps to root (no `src/`) | `tsconfig.json` — ⚠️ DIVERGES FROM PRD which assumes `src/` prefix |

### ⚠️ DIVERGES FROM PRD

| Divergence           | PRD Says                                                              | Codebase Reality                                  |
| -------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| Directory structure  | `src/` prefix (`src/app/`, `src/lib/`, `src/components/`)             | No `src/` directory — `app/` is at project root   |
| Next.js config       | Should enable Turbopack, `cacheComponents`, Cache Components          | `next.config.ts` is empty — no config options set |
| Metadata             | App-specific title and description                                    | Default `"Create Next App"` scaffold metadata     |
| Landing page         | `/site` marketing page with features, pricing, CTA                    | Default Next.js scaffold placeholder page         |
| Package dependencies | Prisma, Clerk, shadcn/ui, Jotai, Framer Motion, @dnd-kit, Uploadthing | Only Next.js, React, Tailwind CSS                 |

---

## 10. Open Questions

### From PRD §16 (Unresolved)

| #     | Question                                                                                           | Owner       | Status |
| ----- | -------------------------------------------------------------------------------------------------- | ----------- | ------ |
| OQ-01 | Should `delai` on Project be free-text or structured duration (number of months)?                  | Product     | Open   |
| OQ-02 | Exact TVA percentage for Algeria (currently assumed 19%)?                                          | Business    | Open   |
| OQ-03 | Should `Lane` be Project-scoped instead of Unit-scoped for per-project Kanban?                     | Engineering | Open   |
| OQ-05 | Can USER create time entries on unassigned projects?                                               | Product     | Open   |
| OQ-06 | Is the 80% production variance threshold configurable per-unit or per-company?                     | Product     | Open   |
| OQ-07 | What happens to a User's data (tasks, time entries) when removed from a unit?                      | Engineering | Open   |
| OQ-08 | Should Clients be Company-scoped (shared) or Unit-scoped (isolated)? Currently Unit-scoped in PRD. | Product     | Open   |
| OQ-09 | Should proforma invoice PDF be auto-generated or manually uploaded?                                | Engineering | Open   |
| OQ-10 | Should "Request Upgrade" form send email (Resend/Nodemailer) or post to Slack/webhook?             | Engineering | Open   |

### From Codebase Analysis

| Finding               | Detail                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ `src/` prefix      | **Resolved (M01-T03):** Adopting `src/` directory structure per PRD. `tsconfig.json` path alias will be updated to `@/*: ["./src/*"]`. |
| 📌 Monorepo workspace | `pnpm-workspace.yaml` exists but no workspace packages are defined. Is monorepo intended?                                              |
| 📌 Font choice        | Codebase uses Geist fonts (Next.js default). PRD doesn't specify typography. Decision needed.                                          |
| ✅ Next.js config gap | **Resolved (M01-T01):** Turbopack and `cacheComponents` will be enabled in `next.config.ts`.                                           |

---

## 11. Out of Scope (Deferred from v1.0)

| Feature                                           | Reason Deferred                                            |
| ------------------------------------------------- | ---------------------------------------------------------- |
| Mobile native app (iOS / Android)                 | Desktop-first; mobile web sufficient for v1                |
| Real-time collaborative editing (live cursors)    | Complexity; polling/Supabase Realtime sufficient           |
| Gantt task dependency arrows (FS, SS, FF, SF)     | `TaskDependencyType` enum defined in schema for future use |
| Advanced reporting & PDF export                   | Phase 2 feature                                            |
| Two-factor authentication (2FA)                   | Delegated to Clerk's own settings                          |
| Custom domain / white-labeling                    | Enterprise tier, post-launch                               |
| Offline mode / PWA                                | Out of scope for v1                                        |
| External calendar sync (Google Calendar, Outlook) | Phase 2                                                    |
| Public project share links                        | Phase 2                                                    |

---

## 12. Glossary

| Term                             | Definition                                                            |
| -------------------------------- | --------------------------------------------------------------------- |
| **HT (Hors Taxe)**               | Pre-tax amount (excluding VAT)                                        |
| **TTC (Toutes Taxes Comprises)** | Total amount including all taxes                                      |
| **TVA**                          | Taxe sur la Valeur Ajoutée — VAT in Algeria                           |
| **ODS**                          | Ordre de Service — official project start order date                  |
| **Délai**                        | Contractual deadline or duration for a project                        |
| **Taux**                         | Production rate (0–100%)                                              |
| **montantProd**                  | Produced monetary amount = `Phase.montantHT × (taux / 100)`           |
| **Phase**                        | Major deliverable block within a project with own budget and timeline |
| **SubPhase**                     | Granular sub-task within a Phase                                      |
| **GanttMarker**                  | Vertical milestone line on Gantt chart with label and date            |
| **Product**                      | Planned production baseline for a Phase (one per phase max)           |
| **Production**                   | Individual actual production record logged against a Product          |
| **Lane**                         | Kanban board column (e.g. "To Do", "In Progress")                     |
| **TeamMember**                   | Junction record linking User to Project's Team with role label        |
| **Multi-Tenant**                 | One app instance serves multiple isolated companies                   |
| **RBAC**                         | Role-Based Access Control — permissions tied to Role                  |
| **Onboarding**                   | First-run wizard creating Company, first Unit, setting OWNER          |
| **DA**                           | Algerian Dinar — national currency                                    |
| **formJur**                      | Forme Juridique — legal form/structure of the company                 |
| **NIF**                          | Numéro d'Identification Fiscale — tax identification number           |
| **Wilaya**                       | Province/administrative division in Algeria                           |

---

_End of AGENTS.md — Cross-referenced from PRD v1.0.0 and codebase snapshot 2026-03-08_
