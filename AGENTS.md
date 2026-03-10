# AGENTS.md — PMA Project Reference

> **Generated:** 2026-03-08 · **PRD Version:** 1.0.0 · **Codebase Snapshot:** Foundation Implemented (M01 Complete)

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

### ✅ Foundation Implemented

The project foundation is fully configured with Next.js 16, Prisma 7, Clerk, and shadcn/ui.

### Finalized Stack

#### Frontend

| Technology    | Version | Purpose                                                      | Status         |
| ------------- | ------- | ------------------------------------------------------------ | -------------- |
| Next.js       | 16.1.6  | App Router, Turbopack, Server Actions, `use cache` directive | ✅ Installed   |
| React         | 19.2.3  | UI rendering, concurrent features                            | ✅ Installed   |
| Tailwind CSS  | 4.x     | Utility-first styling                                        | ✅ Configured  |
| shadcn/ui     | Latest  | Radix UI-based component primitives                          | ✅ Initialized |
| Framer Motion | Latest  | Page transitions, micro-animations                           | ✅ Installed   |
| Jotai         | Latest  | Client-side state (theme, sidebar collapsed/expanded)        | ✅ Installed   |
| @dnd-kit/core | Latest  | Drag-and-drop for Kanban and Gantt reordering                | ✅ Installed   |

#### Backend & Infrastructure

| Technology            | Purpose                                          | Status        |
| --------------------- | ------------------------------------------------ | ------------- |
| Prisma (v7.2+)        | Type-safe ORM; all queries in `lib/queries.ts`   | ✅ Configured |
| PostgreSQL (Supabase) | Hosted relational database with Realtime support | ✅ Configured |
| Clerk                 | Authentication, sessions, invitations, RBAC      | ✅ Configured |
| Uploadthing           | File and asset uploads (logos, documents)        | ✅ Configured |

#### 📌 UNDOCUMENTED IN PRD — Present in Codebase

| Technology         | Version              | Purpose                                                                    |
| ------------------ | -------------------- | -------------------------------------------------------------------------- |
| Geist / Geist Mono | (bundled w/ Next.js) | Google Fonts loaded in `app/layout.tsx` — PRD specifies no particular font |
| PostgreSQL Adapter | `@prisma/adapter-pg` | Required for Prisma 7 connection pooling support                           |

---

## 3. Repository Structure

### Current State (Foundation)

```
pma-webapp/
├── src/                          # Project source directory
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth routes group
│   │   ├── (main)/               # Main application routes group
│   │   ├── api/
│   │   │   └── uploadthing/      # Uploadthing endpoints
│   │   ├── layout.tsx            # Root layout — Clerk, Fonts, Globals
│   │   ├── page.tsx              # Landing page placeholder
│   │   └── globals.css           # Tailwind v4 + shadcn/ui theme
│   ├── components/
│   │   ├── forms/                # ⚠️ ALL forms live here
│   │   ├── global/               # CustomModal, CustomSheet stubs
│   │   └── ui/                   # shadcn/ui primitives (e.g., button.tsx)
│   ├── lib/
│   │   ├── queries.ts            # ⚠️ SSOT — DB Queries
│   │   ├── types.ts              # ⚠️ SSOT — TS Types
│   │   ├── cache.ts              # ⚠️ SSOT — Cache Strategy
│   │   ├── utils.ts              # formatAmount(), formatDate(), cn()
│   │   ├── db.ts                 # Prisma singleton with pg adapter
│   │   └── uploadthing.ts        # Uploadthing hooks re-exports
│   ├── hooks/                    # Custom React hooks
│   ├── providers/                # Context providers
│   └── proxy.ts                  # Next.js Middleware (Auth & Routing)
├── prisma/
│   └── schema.prisma             # Prisma schema (models only)
├── docs/
│   ├── PRD.md                    # Product Requirements Document
│   └── tasks.md                  # Milestone and task tracking
├── .env.example                  # Environment variables template
├── components.json               # shadcn/ui configuration
├── next.config.ts                # Next.js config (turbopack, cacheComponents)
├── package.json                  # Core dependencies and scripts
├── prisma.config.ts              # Prisma 7 CLI configuration
├── tsconfig.json                 # TypeScript config with @/* -> src/*
└── AGENTS.md                     # ← This file
```

### ⚠️ Single-Source-of-Truth Files — Never Duplicate Logic

| File                     | Rule                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `src/lib/queries.ts`     | ALL server actions, mutations, and database queries. No DB calls elsewhere.             |
| `src/lib/types.ts`       | ALL TypeScript interfaces, types, and enums. No inline type definitions.                |
| `src/lib/cache.ts`       | ALL cache tag constants and `cacheLife()` profiles. No inline string literals for tags. |
| `src/lib/utils.ts`       | ALL formatting functions (`formatAmount`, `formatDate`). Use these everywhere.          |
| `src/lib/db.ts`          | Prisma Client singleton (globalThis pattern for dev HMR). Import from here only.        |
| `src/lib/uploadthing.ts` | Uploadthing file router configuration. All upload route definitions live here.          |
| `prisma/schema.prisma`   | ALL data models. This is the database schema authority.                                 |
| `src/proxy.ts`           | ALL routing rules, auth guards, and URL rewrites.                                       |

### Environment Variables

| Variable                            | Service                           | Status         | Public? |
| ----------------------------------- | --------------------------------- | -------------- | ------- |
| `DATABASE_URL`                      | Supabase (pooled via PgBouncer)   | ✅ Implemented | No      |
| `DIRECT_URL`                        | Supabase (direct, for migrations) | ✅ Implemented | No      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk                             | ✅ Implemented | Yes     |
| `CLERK_SECRET_KEY`                  | Clerk                             | ✅ Implemented | No      |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | Clerk (`/company/sign-in`)        | ✅ Implemented | Yes     |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | Clerk (`/company/sign-up`)        | ✅ Implemented | Yes     |
| `UPLOADTHING_TOKEN`                 | Uploadthing                       | ✅ Implemented | No      |
| `NEXT_PUBLIC_APP_URL`               | App base URL                      | ✅ Implemented | Yes     |

⚠️ `.env.local` is gitignored. `.env.example` is committed with placeholder values.

---

## 4. Data Models

✅ **M02 schema implemented.** The Prisma schema defines a multi-tenant structure.

**Core Entities:**

- `Plan` & `Subscription`: Billing and limits.
- `Company`: The root tenant entity (`ownerId` tracked).
- `User`: RBAC driven (`Role`: `OWNER`, `ADMIN`, `USER`). Global to Company, scoped to `Unit`.
- `Unit`: The core operational silo. Belongs to `Company`, managed by `adminId` (a User).
- `Invitation`: Tracks pending user invites mapping to `Company`/`Unit`.

**Operational Entities (Scoped to Unit):**

- `Client`: Unit's customers.
- `Project`: Main entity for features, billed to `Client`, executed by `Team`.
- `Team` & `TeamMember`: Associates Users to Projects with specific roles.
- `Phase` & `SubPhase`: Deliverables within a project. Financial tracking (`montantHT`).
- `Product` & `Production`: Physical tracking of progress against `Phase`.
- `GanttMarker`: Timeline milestones.

**Execution & Tracking:**

- `Lane`, `Task`, `Tag`: Kanban board execution (`unitId` scoped, assigned to `User`).
- `TimeEntry`: Allows Users to log time against `Task` or `Project`.

**System:**

- `Notification`: Targetting roles or specific users. Uncached real-time.
- `ActivityLog`: Track state changes/actions for auditing.

_All tenant-heavy models enforce `companyId` or `unitId` cascading deletions appropriately._
_Referential integrity is guaranteed by `restrict` and `set null` when retaining operational trails vs structural ties._

---

## 5. Role-Based Access Control (RBAC)

> 🚧 NOT YET IMPLEMENTED — Middleware (`src/proxy.ts`) exists but no guards or role checks are active.

---

## 6. Business Rules

> 🚧 NOT YET IMPLEMENTED — Placeholders exist in `src/lib/queries.ts`. No logic implemented.

---

## 7. Caching Strategy

### ✅ Foundation Implemented

- `cacheComponents` enabled in `next.config.ts`.
- `src/lib/cache.ts` created for centralized cache management.
- `use cache` directive verified as working.

---

## 8. Routing & Middleware

### Finalized Middleware (`src/proxy.ts`)

- `clerkMiddleware()` configured to protect routes.
- Renamed from `middleware.ts` to `proxy.ts` following Next.js 16 conventions.

### Route Inventory

- `src/app/company/sign-in/[[...sign-in]]/page.tsx` - Clerk Sign In
- `src/app/company/sign-up/[[...sign-up]]/page.tsx` - Clerk Sign Up
- `src/app/onboarding/page.tsx` - Initial Auth Flow Onboarding Wizard

---

## 9. Key Conventions

### Formatting Standards

| What             | Format                                        | Function                           | Status         |
| ---------------- | --------------------------------------------- | ---------------------------------- | -------------- |
| Monetary amounts | `1 234 567,89 DA` (Algerian Dinar, FR locale) | `formatAmount()` in `lib/utils.ts` | ✅ Implemented |
| Dates            | `DD MMM YYYY` (e.g. `15 Jan 2026`)            | `formatDate()` in `lib/utils.ts`   | ✅ Implemented |
| Auth Shell       | `ClerkProvider` in `Suspense` inside `body`   | Required for Next.js 16 PPR        | ✅ Implemented |

---

## 10. Open Questions

### From Codebase Analysis

| Finding               | Detail                                                                                                      | Status       |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ |
| ✅ `src/` prefix      | **Resolved:** Project adopted `src/` directory. Path alias updated.                                         | ✅ COMPLETED |
| ✅ Next.js config gap | **Resolved:** Turbopack and `cacheComponents` enabled.                                                      | ✅ COMPLETED |
| 📌 Monorepo workspace | `pnpm-workspace.yaml` exists but no workspace packages are defined. Is monorepo intended or safe to remove? | Open         |
| 📌 Font choice        | Codebase uses Geist fonts (Next.js default). PRD doesn't specify typography. Decision needed.               | Open         |

---

_End of AGENTS.md — Updated 2026-03-08 after Milestone M01 completion._
