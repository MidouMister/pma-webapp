# PMA — Project Milestones

> **Derived from:** PRD v1.0.0 · **Generated:** 2026-03-08

---

## ✅ M01 — Project Foundation & Infrastructure Setup

- **Goal:** Establish the project skeleton, install all dependencies, and configure core infrastructure so that feature development can begin on a stable base.
- **Covers PRD Sections:** §5 (System Architecture Overview), §13 (Tech Stack)
- **Key Deliverables:**
  - Next.js configured with Turbopack and `cacheComponents` enabled in `next.config.ts`
  - All dependencies installed: Prisma, Clerk, shadcn/ui, Jotai, Framer Motion, @dnd-kit/core, Uploadthing
  - Project directory structure created (`app/`, `components/`, `lib/`, `hooks/`, `store/`) with placeholder single-source-of-truth files (`queries.ts`, `types.ts`, `cache.ts`, `utils.ts`)
  - Supabase PostgreSQL database provisioned and `DATABASE_URL` configured
  - Clerk application created with API keys configured in `.env`
  - shadcn/ui initialized with Tailwind CSS 4 and base component primitives available
- **Depends On:** None
- **Priority:** Must Have
- **Estimated Complexity:** Medium

### Tasks

#### ✅ M01-T01 — Update Next.js Configuration for Turbopack and Cache Components

- **Type:** Config
- **Description:** Enable Turbopack as the dev bundler and activate the `cacheComponents` experimental flag in `next.config.ts`. This unlocks the `'use cache'` directive, `cacheTag()`, and `cacheLife()` primitives required by the caching strategy (PRD §14). Turbopack is required for fast HMR during development (PRD §13).
- **Acceptance Criteria:**
  - `next.config.ts` exports a config object with `experimental: { cacheComponents: true }`
  - `next dev --turbopack` runs without errors
  - `package.json` dev script updated to `next dev --turbopack`
  - `'use cache'` directive is accepted by the compiler without errors in a test component
- **PRD Reference:** §13 (Tech Stack — Next.js 16.x)
- **Depends On:** None
- **Complexity:** S
- **Touches:** `next.config.ts`, `package.json`

---

#### ✅ M01-T02 — Create Environment Variables Template

- **Type:** Config
- **Description:** Create `.env.local` (gitignored, actual values) and `.env.example` (committed, placeholder keys) files containing all environment variables required by the project. This establishes the single reference for all service credentials and connection strings needed across Clerk, Supabase, Uploadthing, and the app itself.
- **Acceptance Criteria:**
  - `.env.example` exists at the project root with all required keys and placeholder values
  - `.env.local` exists and is listed in `.gitignore`
  - Required keys include: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `UPLOADTHING_TOKEN`, `NEXT_PUBLIC_APP_URL`
  - Application boots without missing-env-var errors when `.env.local` is populated
- **PRD Reference:** §13 (Tech Stack — all infrastructure services)
- **Depends On:** None
- **Complexity:** S
- **Touches:** `.env.example`, `.env.local`, `.gitignore`

---

#### ✅ M01-T03 — Adopt src/ Directory Structure and Update Path Aliases

- **Type:** Config
- **Description:** Move the existing `app/` directory into `src/app/` and update `tsconfig.json` path aliases from `@/*: ["./*"]` to `@/*: ["./src/*"]` to match the PRD §13 code architecture. This resolves the ⚠️ DIVERGES FROM PRD divergence flagged in AGENTS.md and establishes the canonical directory layout for the rest of the project.
- **Acceptance Criteria:**
  - `src/` directory exists containing `app/` (moved from root)
  - `tsconfig.json` path alias updated: `"@/*": ["./src/*"]`
  - `next dev --turbopack` boots and renders the page successfully after the move
  - No broken imports — all existing `@/` imports resolve correctly
- **PRD Reference:** §13 (Code Architecture diagram)
- **Depends On:** M01-T01
- **Complexity:** S
- **Touches:** `src/app/` (moved from `app/`), `tsconfig.json`

---

#### ✅ M01-T04 — Install and Configure Prisma ORM

- **Type:** Config
- **Description:** Install Prisma Client v7.2+ and Prisma CLI. Initialize the Prisma project with `prisma init` to generate the `prisma/` directory and a blank `schema.prisma` file configured for PostgreSQL. Create a reusable Prisma Client singleton at `src/lib/db.ts` to avoid multiple client instances in development.
- **Acceptance Criteria:**
  - `prisma` and `@prisma/client` installed in `package.json` (v7.2+)
  - `prisma/schema.prisma` exists with `provider = "postgresql"` and `datasource` referencing `DATABASE_URL` and `DIRECT_URL`
  - `src/lib/db.ts` exports a singleton `PrismaClient` instance (using globalThis pattern for dev HMR)
  - `npx prisma validate` passes without errors
  - `postinstall` script in `package.json` runs `prisma generate`
- **PRD Reference:** §13 (Tech Stack — Prisma v7.2+)
- **Depends On:** M01-T02, M01-T03
- **Complexity:** M
- **Touches:** `package.json`, `prisma/schema.prisma`, `src/lib/db.ts`

---

#### ✅ M01-T05 — Provision Supabase Database and Configure Connection

- **Type:** Config
- **Description:** Provision a PostgreSQL database on Supabase for the PMA project. Configure the connection string in `.env.local` using both the pooled URL (`DATABASE_URL` via PgBouncer) and direct URL (`DIRECT_URL` for migrations). Verify the Prisma-to-Supabase connection works end-to-end.
- **Acceptance Criteria:**
  - Supabase project exists with PostgreSQL database provisioned
  - `DATABASE_URL` and `DIRECT_URL` set in `.env.local` with valid Supabase credentials
  - `prisma/schema.prisma` datasource block uses both `url` and `directUrl`
  - `npx prisma db push` completes successfully against the Supabase database
  - A test query via `src/lib/db.ts` returns a result (e.g. `SELECT 1`)
- **PRD Reference:** §13 (Tech Stack — PostgreSQL/Supabase)
- **Depends On:** M01-T04
- **Complexity:** M
- **Touches:** `.env.local`, `prisma/schema.prisma`

---

#### ✅ M01-T06 — Install and Configure Clerk Authentication SDK

- **Type:** Config
- **Description:** Install the `@clerk/nextjs` package and configure it as the authentication provider. Add the `ClerkProvider` to the root layout, set up Clerk environment variables, and configure the Clerk middleware file. This establishes the auth shell that all protected routes will depend on.
- **Acceptance Criteria:**
  - `@clerk/nextjs` installed in `package.json`
  - `ClerkProvider` wraps the application in `src/app/layout.tsx`
  - `src/middleware.ts` exists with basic Clerk `clerkMiddleware()` configuration
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` loaded from env
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` set to `/company/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` set to `/company/sign-up`
  - `ClerkProvider` wrapped in `Suspense` inside `body` to support Next.js 16 PPR (Blocking Route fix applied 2026-03-09)
  - App boots without Clerk configuration errors
- **PRD Reference:** §13 (Tech Stack — Clerk), AUTH-06
- **Depends On:** M01-T02, M01-T03
- **Complexity:** M
- **Touches:** `package.json`, `src/app/layout.tsx`, `src/middleware.ts`, `.env.local`

---

#### ✅ M01-T07 — Initialize shadcn/ui with Tailwind CSS 4

- **Type:** Config
- **Description:** Initialize the shadcn/ui component library using `npx shadcn@latest init`. Configure it to work with Tailwind CSS 4 (already installed), set the components output path to `src/components/ui/`, and install foundational primitives that will be used across the app: Button, Input, Label, Card, Dialog, Sheet, Tooltip, DropdownMenu, Separator, Skeleton, Avatar, Badge, Tabs, ScrollArea, Select, Textarea.
- **Acceptance Criteria:**
  - `components.json` exists at the project root with correct paths (`src/components/ui/`, `src/lib/utils.ts`)
  - `src/lib/utils.ts` exists with the `cn()` utility (clsx + tailwind-merge)
  - All listed shadcn/ui components are installed in `src/components/ui/`
  - CSS variables and theme tokens are configured in `src/app/globals.css`
  - A test page importing a Button component renders correctly
- **PRD Reference:** §13 (Tech Stack — shadcn/ui), NFR-15, NFR-16
- **Depends On:** M01-T03
- **Complexity:** M
- **Touches:** `package.json`, `components.json`, `src/components/ui/*`, `src/lib/utils.ts`, `src/app/globals.css`

---

#### ✅ M01-T08 — Install UI and State Management Dependencies

- **Type:** Config
- **Description:** Install the remaining frontend libraries specified in the PRD tech stack: Jotai (lightweight client-side state), Framer Motion (page transitions and micro-animations), @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities (drag-and-drop for Kanban and Gantt), and Lucide React (icon library). These are not configured yet — just installed and importable.
- **Acceptance Criteria:**
  - `jotai` installed and importable
  - `framer-motion` installed and importable
  - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` installed and importable
  - `lucide-react` installed and importable
  - No dependency conflicts — `pnpm install` completes without errors
- **PRD Reference:** §13 (Tech Stack — Jotai, Framer Motion, @dnd-kit/core)
- **Depends On:** None
- **Complexity:** S
- **Touches:** `package.json`

---

#### ✅ M01-T09 — Install and Configure Uploadthing

- **Type:** Config
- **Description:** Install the `uploadthing` and `@uploadthing/react` packages. Create the Uploadthing API route handler at `src/app/api/uploadthing/route.ts` and the core configuration file at `src/lib/uploadthing.ts` defining the allowed file types and size limits. This enables file uploads for company logos and project documents.
- **Acceptance Criteria:**
  - `uploadthing` and `@uploadthing/react` installed in `package.json`
  - `UPLOADTHING_TOKEN` configured in `.env.local`
  - `src/app/api/uploadthing/route.ts` exports GET and POST handlers
  - `src/lib/uploadthing.ts` exports a file router with at least one route (`imageUploader`) accepting images up to 4MB
  - Upload endpoint responds to requests without errors (basic smoke test)
- **PRD Reference:** §13 (Tech Stack — Uploadthing), COMP-02, NFR-08
- **Depends On:** M01-T02, M01-T03
- **Complexity:** M
- **Touches:** `package.json`, `src/app/api/uploadthing/route.ts`, `src/lib/uploadthing.ts`

---

#### ✅ M01-T10 — Create Project Directory Structure and Placeholder Files

- **Type:** Config
- **Description:** Create the full directory skeleton defined in PRD §13 and establish all single-source-of-truth placeholder files. Each placeholder must contain a module header comment explaining its purpose and the rule that it is the sole location for its concern. This task cements the project conventions before any feature code is written.
- **Acceptance Criteria:**
  - Directories created: `src/components/global/`, `src/components/forms/`, `src/components/dashboard/`, `src/hooks/`, `src/store/`
  - `src/lib/queries.ts` exists with header: `// Single source of truth: ALL server actions and database queries`
  - `src/lib/types.ts` exists with header: `// Single source of truth: ALL TypeScript interfaces, types, and enums`
  - `src/lib/cache.ts` exists with header: `// Single source of truth: ALL cache tags, cacheLife profiles, and revalidation helpers`
  - `src/lib/utils.ts` already exists (from shadcn/ui init) — add `formatAmount()` and `formatDate()` stub functions with signature and JSDoc but no implementation yet
  - `src/store/atoms.ts` exists with header comment for Jotai atoms
- **PRD Reference:** §13 (Code Architecture), §9 (Business Rules — formatting)
- **Depends On:** M01-T03, M01-T07
- **Complexity:** S
- **Touches:** `src/lib/queries.ts`, `src/lib/types.ts`, `src/lib/cache.ts`, `src/lib/utils.ts`, `src/store/atoms.ts`, `src/components/global/`, `src/components/forms/`, `src/components/dashboard/`, `src/hooks/`

---

## M02 — Database Schema & Seed Data

- **Goal:** Define all Prisma models matching the PRD data model specification and seed reference data (Plans) so that all feature milestones have a working database layer.
- **Covers PRD Sections:** §10 (Data Models Summary), §6.3 (Plans definition)
- **Key Deliverables:**
  - `prisma/schema.prisma` contains all 20 models (User, Company, Subscription, Plan, Unit, Invitation, Project, Phase, SubPhase, GanttMarker, Product, Production, Client, Team, TeamMember, Task, Lane, Tag, TimeEntry, Notification, ActivityLog) with correct relations and constraints
  - Seed script creates the three Plan tiers (Starter, Pro, Premium) with correct limits
  - `companyId` scoping enforced at the schema level where applicable via required relations
  - All enums defined: Role, InvitationStatus, ProjectStatus, SubPhaseStatus, NotificationType, TaskDependencyType (reserved)
  - Migration runs cleanly against Supabase PostgreSQL
  - `lib/types.ts` populated with TypeScript types matching the schema
- **Depends On:** M01
- **Priority:** Must Have
- **Estimated Complexity:** High

### Tasks

#### ✅ M02-T01 — Define Prisma Enums and Core Organizational Models

- **Type:** Schema
- **Description:** Define the foundation of the Prisma schema including all necessary enums (`Role`, `InvitationStatus`, `ProjectStatus`, `SubPhaseStatus`, `NotificationType`, `TaskDependencyType`) and the core organizational models (`Plan`, `Company`, `Subscription`, `User`, `Unit`, `Invitation`). Ensure `Company` is the root entity and `companyId` scoping is established via relations where applicable. Maintain referential integrity for unit and user scoping.
- **Acceptance Criteria:**
  - Enums defined: `Role` (OWNER, ADMIN, USER), `InvitationStatus`, `ProjectStatus`, `SubPhaseStatus`, `NotificationType`, `TaskDependencyType`
  - Models `Plan`, `Company`, `Subscription`, `User`, `Unit`, `Invitation` are added with correct fields from PRD summary
  - Relations are correctly mapped (e.g., Unit belongs to Company, User belongs to Unit/Company)
  - `Company.ownerId` is tracked
- **PRD Reference:** §10 (Data Models Summary), §6.3, §6.4, §6.5
- **Depends On:** M01
- **Complexity:** M
- **Touches:** `prisma/schema.prisma`

---

#### ✅ M02-T02 — Define Project, Phase, and Production Models

- **Type:** Schema
- **Description:** Expand the schema to include `Client`, `Project`, `Team`, `TeamMember`, `Phase`, `SubPhase`, `GanttMarker`, `Product`, and `Production` models. These models form the core operational domain. Enforce `companyId` or `unitId` scoping for these entities via relations to ensure tenant isolation.
- **Acceptance Criteria:**
  - Models `Client`, `Project`, `Team`, `TeamMember` are defined and related correctly
  - Models `Phase`, `SubPhase`, `GanttMarker`, `Product`, `Production` are defined with appropriate relations
  - Financial and progress fields (e.g., `montantHT`, `progress`, `taux`) use appropriate data types (e.g., Float or Decimal)
  - Required relations (like `projectId` on Phase, `phaseId` on Product) are strictly non-nullable
- **PRD Reference:** §10, §6.6, §6.7, §6.8, §6.9
- **Depends On:** M02-T01
- **Complexity:** M
- **Touches:** `prisma/schema.prisma`

---

#### ✅ M02-T03 — Define Kanban, Time Tracking, and System Models

- **Type:** Schema
- **Description:** Define the remaining models for execution tracking (`Task`, `Lane`, `Tag`, `TimeEntry`) and system observability (`Notification`, `ActivityLog`). Ensure robust relational mapping to projects, users, and the root organizational hierarchy to allow role-based access.
- **Acceptance Criteria:**
  - Models `Lane`, `Task`, `Tag`, `TimeEntry` are defined
  - Models `Notification`, `ActivityLog` are defined with target roles, JSON metadata (for ActivityLog), and scoping IDs
  - Schema validates without error using `npx prisma validate`
- **PRD Reference:** §10, §6.10, §6.11, §6.12, §6.13
- **Depends On:** M02-T02
- **Complexity:** M
- **Touches:** `prisma/schema.prisma`

---

#### ✅ M02-T04 — Apply Database Migrations and Generate Prisma Client

- **Type:** Config
- **Description:** Push the finalized schema to the Supabase PostgreSQL database using `npx prisma db push` to sync the physical database schema without creating a formal migration file yet. Check for no compilation issues and generate the Prisma client to ensure strong typing is available to the rest of the application.
- **Acceptance Criteria:**
  - `npx prisma db push` completes successfully against the configured Supabase database
  - Database tables reflect the defined schema accurately
  - `npx prisma generate` runs and creates the Prisma Client
- **PRD Reference:** §13 (Tech Stack)
- **Depends On:** M02-T03
- **Complexity:** S
- **Touches:** None (executed via CLI)

---

#### ✅ M02-T05 — Create Database Seed Script for Plans

- **Type:** Logic
- **Description:** Create a Prisma seed script (`prisma/seed.ts`) to populate the baseline required data. Generate the three subscription tiers (Starter, Pro, Premium) matching the PRD definitions and limits. This ensures all environments start with a standardized set of Plan definitions.
- **Acceptance Criteria:**
  - `prisma/seed.ts` exists and uses the Prisma Client
  - The script upserts the three plans: Starter (maxUnits: 1, maxProjects: 5, maxTasksPerProject: 20, maxMembers: 10), Pro (maxUnits: 5, maxProjects: 30, maxTasksPerProject: 200, maxMembers: 50), and Premium (maxUnits: null, maxProjects: null)
  - `package.json` contains a `prisma.seed` configuration
  - Running `npx prisma db seed` successfully populates the `Plan` table in Supabase
- **PRD Reference:** §6.3 (Plans)
- **Depends On:** M02-T04
- **Complexity:** S
- **Touches:** `prisma/seed.ts`, `package.json`

---

#### ✅ M02-T06 — Sync TypeScript Types with DB Schema

- **Type:** Schema
- **Description:** Export the necessary TypeScript types that correspond to the generated Prisma models in the single-source-of-truth file, `src/lib/types.ts`.
- **Acceptance Criteria:**
  - `src/lib/types.ts` is populated with type aliases deriving from `@prisma/client`
  - Export common composite types (e.g., `ProjectWithPhases`) anticipated by the features
  - File compiles without TypeScript errors
- **PRD Reference:** §13 (Code Architecture)
- **Depends On:** M02-T04
- **Complexity:** S
- **Touches:** `src/lib/types.ts`

---

### M03: Authentication & Onboarding (✅ Complete & Audited)

**Goal:** Enable user registration, login, and the first-run onboarding wizard.

| Task ID | Type       | Description                                                           | Status      |
| ------- | ---------- | --------------------------------------------------------------------- | ----------- |
| M03-T01 | UI/UX      | Create Branded Authentication Pages                                   | ✅ Complete |
| M03-T02 | Backend    | Implement Clerk Webhook for User Synchronization                      | ✅ Complete |
| M03-T03 | Frontend   | Build Onboarding Wizard UI State and Shell                            | ✅ Complete |
| M03-T04 | Frontend   | Implement Onboarding Forms & Validation (incl. State Restoration Fix) | ✅ Complete |
| M03-T05 | Full-stack | Complete Onboarding Action & Final Redirection (incl. Schema Fixes)   | ✅ Complete |

- **Covers PRD Sections:** §6.1 (Authentication & Onboarding)
- **Key Deliverables:**
  - Clerk sign-in and sign-up pages at `/company/sign-in` and `/company/sign-up`
  - Clerk webhook (`user.created`) syncs new users to the PMA database
  - 3-step onboarding wizard at `/onboarding`: Company Profile → First Unit → Invite Team (skippable)
  - Completing onboarding creates Company, assigns OWNER role, auto-creates Starter trial subscription (`startAt = now`, `endAt = now + 2 months`), and creates first Unit
  - Users arriving via invitation link skip onboarding and are assigned to their Unit directly
- **Depends On:** M01, M02
- **Priority:** Must Have
- **Estimated Complexity:** High

### Tasks

#### ✅ M03-T01 — Create Branded Authentication Pages

- **Type:** UI
- **Description:** Implement custom Clerk `<SignIn />` and `<SignUp />` components at `/company/sign-in` and `/company/sign-up`. These pages must be styled to match the project's premium glassmorphism aesthetic and handle redirecting users properly after login.
- **Acceptance Criteria:**
  - `src/app/company/sign-in/[[...sign-in]]/page.tsx` renders Clerk's SignIn component
  - `src/app/company/sign-up/[[...sign-up]]/page.tsx` renders Clerk's SignUp component
  - Pages are accessible and visually aligned with the rest of the application
- **PRD Reference:** §11.4
- **Depends On:** None
- **Complexity:** S
- **Touches:** `src/app/company/sign-in/[[...sign-in]]/page.tsx`, `src/app/company/sign-up/[[...sign-up]]/page.tsx`

---

#### ✅ M03-T02 — Implement Clerk Webhook for User Synchronization

- **Type:** API
- **Description:** Create an API endpoint (`/api/webhooks/clerk`) to receive Clerk webhooks. When a `user.created` event is received, it must insert a corresponding `User` record into the PMA database.
- **Acceptance Criteria:**
  - Endpoint `src/app/api/webhooks/clerk/route.ts` exists and verifies Svix signatures
  - Handling `user.created` creates a new `User` in the database with role `USER` by default, copying `id`, `email`, `name`, and `avatarUrl`
  - Webhook secret is documented as required in `.env.local`
- **PRD Reference:** §6.1 (AUTH-07)
- **Depends On:** M02-T04
- **Complexity:** M
- **Touches:** `src/app/api/webhooks/clerk/route.ts`, `src/lib/queries.ts`

---

#### ✅ M03-T03 — Build Onboarding Wizard UI State and Shell

- **Type:** UI
- **Description:** Create a multi-step form shell at `/onboarding` to handle the 3-step process for new owners (Company Profile → First Unit → Invite Team). Use Jotai or local React state to track progression and temporary data between steps before final submission.
- **Acceptance Criteria:**
  - `src/app/onboarding/page.tsx` renders a step indicator and container for the steps
  - State management allows moving Next/Back between steps without losing entered data
  - Renders a clean, distraction-free layout appropriate for an onboarding flow
- **PRD Reference:** §6.1 (AUTH-03)
- **Depends On:** M03-T01
- **Complexity:** M
- **Touches:** `src/app/onboarding/page.tsx`, `src/components/forms/onboarding-wizard.tsx`

---

#### ✅ M03-T04 — Implement Onboarding Step 1 (Company) & Step 2 (Unit) Forms

- **Type:** UI
- **Description:** Implement the form validations using Zod and React Hook Form for Step 1 (Company Details: Name, Logo via Uploadthing, formJur, NIF, sector, state, address, phone, email) and Step 2 (Unit Details: Name, address, phone, email).
- **Acceptance Criteria:**
  - Step 1 form correctly captures and validates company data
  - Logo upload delegates to Uploadthing and stores the URL in form state
  - Step 2 form captures and validates the first unit's data
- **PRD Reference:** §6.1 (Onboarding Steps 1 & 2)
- **Depends On:** M03-T03
- **Complexity:** M
- **Touches:** `src/components/forms/onboarding-step-company.tsx`, `src/components/forms/onboarding-step-unit.tsx`, `src/lib/types.ts`

---

#### ✅ M03-T05 — Complete Onboarding Action & Final Redirection Server Action

- **Type:** Logic
- **Description:** Implement Step 3 (optional team invites) and the final submission logic. Create a robust, transactional Server Action in `src/lib/queries.ts` that receives the collected onboarding data and provisions the entire tenant.
- **Acceptance Criteria:**
  - Step 3 allows entering emails and roles, or skipping
  - Server action `completeOnboarding()` executes a Prisma transaction that:
    1. Creates `Company` with the current user as `ownerId`
    2. Updates the current `User` setting `role = OWNER` and linking `companyId`
    3. Creates the `Starter` trial `Subscription` (active, 2 months) linked to the company
    4. Creates the first `Unit` linked to the company
    5. Redirects to `/company/[companyId]`
- **PRD Reference:** §6.1 (AUTH-04)
- **Depends On:** M03-T04
- **Complexity:** H
- **Touches:** `src/components/forms/onboarding-step-invite.tsx`, `src/lib/queries.ts`, `src/app/onboarding/page.tsx`

---

### Tasks

#### ✅ M04-T01 — Implement Dynamic Redirection in Middleware (`src/proxy.ts`)

- **Type:** Logic
- **Description:** Implement advanced redirect logic in `src/proxy.ts`. After a user signs in, the middleware must inspect their session or fetch metadata to redirect them to the correct dashboard: OWNERs to `/company/[companyId]`, ADMINs to `/unite/[unitId]`, and USERs to `/user/[userId]`. New owners awaiting onboarding are sent to `/onboarding`. Handle basic path normalization ($ /$ -> $/site$).
- **Acceptance Criteria:**
  - authenticated users without a company/role are consistently redirected to `/onboarding`
  - Signed-out users are blocked from dashboard paths and redirected to sign-in
  - Post-login landing logic respects the user's role and associations
- **PRD Reference:** §11.1
- **Depends On:** M03
- **Complexity:** M
- **Touches:** `src/proxy.ts`

---

#### ✅ M04-T02 — Build Dashboard Layout Shell & Global State (Jotai)

- **Type:** UI
- **Description:** Establish the parent layout for all dashboard routes in `src/app/(dashboard)/layout.tsx`. Create a responsive shell with side-by-side Sidebar and Main Content areas. Use Jotai to manage a global `sidebarCollapsedAtom` with localStorage persistence to remember user preference.
- **Acceptance Criteria:**
  - `src/app/(dashboard)/layout.tsx` wraps all dashboard sub-pages
  - Jotai atom `sidebarCollapsedAtom` in `src/store/atoms.ts` persists expansion state
  - Layout is fully responsive, utilizing a Sheet component for the sidebar on mobile
- **PRD Reference:** §12 (Navigation Sidebar Layout)
- **Depends On:** M01-T07, M01-T10
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/layout.tsx`, `src/store/atoms.ts`, `src/components/global/sidebar.tsx`

---

#### ✅ M04-T03 — Develop Dynamic Sidebar with Multi-Context Modes

- **Type:** UI
- **Description:** Build a premium Sidebar in `src/components/global/sidebar.tsx` that supports three context modes: Company, Unit, and Personal. Implement a "Context Switcher" for OWNERS to toggle between their company dashboard and individual units. Apply the project's glassmorphism aesthetic with Framer Motion animations for collapsibility.
- **Acceptance Criteria:**
  - Sidebar menu items dynamically change based on current route context (e.g. `/company/*` vs `/unite/*`)
  - Integration of `ModeSwitcher` for context swapping
  - Active route highlighting logic is implemented for side menu items
  - Sidebar footer displays current user profile with role badge
- **PRD Reference:** §12 (Sidebar Logic)
- **Depends On:** M04-T02
- **Complexity:** H
- **Touches:** `src/components/global/sidebar.tsx`, `src/components/global/mode-switcher.tsx`

---

#### ✅ M04-T04 — Implement Header with breadcrumbs and User Menu

- **Type:** UI
- **Description:** Build the top header for the dashboard layout in `src/components/global/header.tsx`. Include dynamic breadcrumbs that reflect the navigation path and a custom user profile dropdown. Include a placeholder bell icon for notifications.
- **Acceptance Criteria:**
  - Breadcrumbs reflect the current dashboard hierarchy
  - User profile menu exposes Clerk's sign-out and profile actions
  - Premium glassmorphism styling applied to the header
- **PRD Reference:** §11.1, §11.4
- **Depends On:** M04-T02
- **Complexity:** M
- **Touches:** `src/components/global/header.tsx`, `src/components/global/breadcrumbs.tsx`

---

#### ✅ M04-T05 — Create Branded Error & Access Restricted Pages

- **Type:** UI
- **Description:** Implement custom pages for `/unauthorized` and `/not-found` at their respective paths. Apply the same high-design standards as the onboarding flow to these utility pages, ensuring a cohesive user experience even during failures.
- **Acceptance Criteria:**
  - Branded `/unauthorized` page exists for permission errors
  - `src/app/not-found.tsx` provides a meaningful and beautiful 404 experience
  - Both pages provide clear "Back to Dashboard" navigation
- **PRD Reference:** §11.1
- **Depends On:** M04-T01
- **Complexity:** S
- **Touches:** `src/app/unauthorized/page.tsx`, `src/app/not-found.tsx`

---

## ✅ M05 — Company Management

- **Goal:** Allow the OWNER to manage their company profile and view a high-level company dashboard, providing the administrative foundation for all downstream features.
- **Covers PRD Sections:** §6.2 (Company Management)
- **Key Deliverables:**
  - `/company/[companyId]` dashboard with KPIs across all units, financial summary
  - `/company/[companyId]/settings` page: edit company metadata (name, logo via Uploadthing, NIF, formJur, sector, address, phone, email)
  - OWNER-only access enforced on all company routes
  - `Company.ownerId` validated as unique and immutable
  - `updateCompany()` server action in `queries.ts` with `revalidateTag(companyTag(companyId))`
- **Depends On:** M04
- **Priority:** Must Have
- **Estimated Complexity:** Medium

### Tasks

#### ✅ M05-T01 — Implement the Owner's Company Dashboard (2026-03-09)

- **Type:** UI
- **Description:** Implement the landing page for company owners at `/company/[companyId]`. This page must display aggregate KPIs (total units, total active projects, total members) and a high-level summary of each unit's performance. Enforce strictly that only the company OWNER can access this route group.
- **Acceptance Criteria:**
  - Route `/company/[companyId]` renders a dashboard with aggregate stats
  - Non-owner users are redirected to `/unauthorized` if they attempt to access `/company/*`
  - Units are listed with quick links to their respective unit dashboards
  - Data is fetched using `'use cache'` with appropriate `companyTag`
- **PRD Reference:** §6.2 (COMP-05)
- **Depends On:** M04
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/company/[companyId]/page.tsx`, `src/lib/queries.ts`

---

#### ✅ M05-T02 — Develop Company Settings & Profile Management (2026-03-09)

- **Type:** UI
- **Description:** Create the settings page at `/company/[companyId]/settings` for updating core company metadata. This includes name, NIF, legal form, sector, and contact info. Re-use the Uploadthing component for the company logo.
- **Acceptance Criteria:**
  - Form validates all fields according to PRD models using Zod
  - Logo update works and previews before saving
  - Layout matches the premium "glassmorphism" aesthetic
- **PRD Reference:** §6.2 (COMP-01, COMP-02)
- **Depends On:** M05-T01
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/company/[companyId]/settings/page.tsx`, `src/components/forms/company-settings-form.tsx`

---

#### ✅ M05-T03 — Implement updateCompany Server Action & Cache Invalidation (2026-03-09)

- **Type:** Logic
- **Description:** Finalize the `updateCompany` server action in `src/lib/queries.ts`. Implement row-level RBAC to ensure only the owner can trigger the update. Ensure a successful update triggers `updateTag(TAGS.COMPANY(companyId))` to refresh the UI globally.
- **Acceptance Criteria:**
  - Server action checks `user.id === company.ownerId` before proceeding
  - Successful update triggers revalidation for the company tag
  - Error messages are user-friendly and surface via toast
- **PRD Reference:** §14.5, §6.2
- **Depends On:** M05-T02
- **Complexity:** S
- **Touches:** `src/lib/queries.ts`

---

## 🚧 M06 — Subscription & Plan Enforcement

- **Goal:** Implement the subscription lifecycle, billing page, plan limit enforcement, and trial expiry logic so that the monetization model is fully operational.
- **Covers PRD Sections:** §6.3 (Subscription & Plans), §9 (Subscription Enforcement Rules)
- **Key Deliverables:**
  - `/company/[companyId]/settings/billing` page: current plan details, limits vs. usage, expiry date, days-remaining countdown, plan comparison table
  - "Request Upgrade" form collecting: desired plan, company name, contact email, phone, payment method (virement / chèque / contrat), message
  - Plan limit checks enforced server-side in `queries.ts` before every INSERT for units, projects, tasks, members
  - Upgrade Prompt Modal shown when a limit is reached, with CTA to billing page
  - Trial expiry notifications at T-30, T-7, T-3 days, on expiry, and on grace period end
  - Grace period logic (7 days post-expiry) and read-only mode enforcement after grace period
- **Depends On:** M05
- **Priority:** Must Have
- **Estimated Complexity:** High

### Tasks

#### M06-T01 — Implement the Billing & Plan Overview Page

## ✅ M06 — Subscription & Plan Enforcement

- **Goal:** Protect company resources by ensuring usage fits within the active plan, while providing the OWNER with tool to monitor and upgrade as needed.
- **Covers PRD Sections:** §6.3 (Plan Enforcement), §9 (Plan Limits)
- **Status:** ✅ Complete (2026-03-11)

- [x] **M06-T01: Implement the Billing & Plan Overview Page** ✅ 2026-03-09
  - Create `src/app/(dashboard)/company/[companyId]/settings/billing/page.tsx`
  - Implement usage progress bars (Units/Projects/Members usage vs. Plan limit)
  - Display plan comparison table for upgrade requests
- [x] **M06-T02: Implement Plan Limit Enforcement Logic** ✅ 2026-03-09
  - Add server-side check helpers in `src/lib/queries.ts` (e.g., `checkPlanLimit`)
  - Ensure entity creation (Units/Projects) is blocked if limits are reached
- [x] **M06-T03: Dashboard Logic for Subscription Warnings** ✅ 2026-03-09
  - Show warning banners in the Company Dashboard if usage > 80% or plan expires soon
- [x] **M06-T04: Verification & Testing (OWNER View)** ✅ 2026-03-09
  - Verify layout, icons, and logic for subscription status
  - `checkPlanLimit` accurately counts active records for the specific entity type
  - Attempting to create a unit/project/member/task beyond plan limit throws a specific "Plan Limit Reached" error
  - Grace period (7 days) is respected before locking the system
- **PRD Reference:** §9 (Subscription Enforcement Rules)
- **Depends On:** M02, M06-T01
- **Complexity:** H
- **Touches:** `src/lib/queries.ts`

---

#### ✅ M06-T03 — Develop the "Request Upgrade" Flow

- **Type:** UI/Logic
- **Description:** Implement a form to request a plan upgrade. Since payments are offline (bank transfer/check), this form must capture the user's requirements and notify the system (for now, log it or create a "BillingRequest" record if we decide to add it, or simply simulate a success state).
- **Acceptance Criteria:**
  - Modal or page for upgrade request with plan selection
  - Form validation for contact details
  - Success state provides instructions for offline payment
- **PRD Reference:** §6.3 (PLAN-03)
- **Depends On:** M06-T01
- **Complexity:** S
- **Touches:** `src/components/forms/upgrade-request-form.tsx`, `src/app/(dashboard)/company/[companyId]/settings/billing/page.tsx`
- **Status:** ✅ Complete (2026-03-11)

---

#### ✅ M06-T04 — Implement Expiry & Grace Period Enforcement

- **Type:** Logic
- **Description:** Implement the logic to calculate "days remaining" and handle expired subscriptions. Enforce "Read-Only" mode across the dashboard if the subscription is expired AND the grace period has ended.
- **Acceptance Criteria:**
  - Countdown timer / days remaining displayed on billing page
  - Global middleware or HOC blocks mutation actions if subscription is invalid
  - System remains readable but blocks all create/edit/delete actions after grace period
- **PRD Reference:** §9 (Expiry & Grace Period)
- **Depends On:** M06-T02
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`, `src/middleware.ts`
- **Status:** ✅ Complete (2026-03-11)

---

## ✅ M07 — Unit Management

- **Goal:** Enable the OWNER to create and manage operational Units, each with an assigned Admin, so that the multi-unit company hierarchy is functional.
- **Covers PRD Sections:** §6.4 (Unit Management)
- **Status:** ✅ Complete (2026-03-11)

- [x] **M07-T01: Build the Units List Page** ✅ 2026-03-11
  - Created `/company/[companyId]/units` page with unit cards showing name, admin, member count, project count
  - "Create Unit" button opens dialog with unit creation form
  - Empty state with CTA when no units exist
  - Only OWNER can access - uses verifyCompanyOwner()

- [x] **M07-T02: Implement Unit CRUD Server Actions** ✅ 2026-03-11
  - Added createUnit(), updateUnit(), deleteUnit() in queries.ts
  - Plan limit check (maxUnits) before creation
  - RBAC: OWNER can create/delete any unit, ADMIN can only update their own
  - deleteUnit() cascades via Prisma schema (Projects, Phases, Tasks, Lanes, Tags, Clients)
  - Cache invalidation: companyTag(companyId), unitTag(unitId)

- [x] **M07-T03: Create Unit Form with Admin Assignment** ✅ 2026-03-11
  - Created unit-form.tsx with Zod validation
  - Admin picker shows eligible users (not already admin of another unit)
  - Uses getEligibleAdmins() to fetch available company members
  - Edit mode pre-fills existing data

- [x] **M07-T04: Build Unit Dashboard Page** ✅ 2026-03-11
  - Created `/unite/[unitId]` page with KPI cards
  - Shows: active projects, members, clients, contract value
  - Team members overview with avatars
  - RBAC: OWNER can access any unit, ADMIN can only access their own

- [x] **M07-T05: Implement Unit Delete Confirmation & Cascade Guard** ✅ 2026-03-11
  - Created unit-delete-dialog.tsx with confirmation input
  - Shows impact summary (projects, clients, members)
  - Requires typing unit name to confirm deletion

---

## M08 — Team & Invitations
- **Depends On:** M06-T02
- **Complexity:** H
- **Touches:** `src/lib/queries.ts`

---

#### M07-T03 — Create Unit Form with Admin Assignment

- **Type:** UI
- **Description:** Build a Zod-validated form for creating and editing units (fields: name, address, phone, email). Include an admin picker dropdown that lists company members eligible for the ADMIN role. The picker must enforce the one-admin-per-unit constraint.
- **Acceptance Criteria:**
  - Form validates all fields using Zod schema
  - Admin picker shows eligible users (not already admin of another unit)
  - Edit mode pre-fills existing unit data
  - Form submits via `createUnit()` or `updateUnit()` server action
  - Success triggers toast notification and list refresh
- **PRD Reference:** §6.4 (UNIT-01, UNIT-02, UNIT-03)
- **Depends On:** M07-T02
- **Complexity:** M
- **Touches:** `src/components/forms/unit-form.tsx`

---

#### M07-T04 — Build Unit Dashboard Page

- **Type:** UI
- **Description:** Create the unit operational dashboard at `/unite/[unitId]`. Display unit-level KPIs (active projects, total members, tasks in progress, production summary), recent activity feed, and a team overview section. This page is accessible by the unit's ADMIN and the OWNER.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/unite/[unitId]/page.tsx` exists and renders KPI cards
  - KPIs include: active project count, member count, open tasks count, recent production rates
  - Recent activity section shows latest ActivityLog entries for the unit
  - RBAC: OWNER can access any unit dashboard; ADMIN can access only their own
  - Data fetched with `'use cache'` + `cacheLife("hours")` + `unitTag(id)`
- **PRD Reference:** §11.6, §6.4 (UNIT-04)
- **Depends On:** M07-T02
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/unite/[unitId]/page.tsx`, `src/lib/queries.ts`

---

#### M07-T05 — Implement Unit Delete Confirmation & Cascade Guard

- **Type:** UI/Logic
- **Description:** Add a confirmation dialog for unit deletion that warns the OWNER about cascading data loss. Show a summary of what will be deleted (N projects, N tasks, N clients, N members). Require the OWNER to type the unit name to confirm.
- **Acceptance Criteria:**
  - Delete button opens a confirmation dialog listing cascade impact
  - Dialog requires typing the unit name to enable the "Delete" button
  - On confirmation, calls `deleteUnit()` which cascades all child records
  - Success navigates back to the units list with a toast
- **PRD Reference:** §6.4 (UNIT-05)
- **Depends On:** M07-T02
- **Complexity:** S
- **Touches:** `src/components/forms/unit-delete-dialog.tsx`

---

## ✅ M08 — Team & Invitations

- **Goal:** Implement the invitation system and team management so that OWNER/ADMIN can build their workforce and assign members to project teams.
- **Covers PRD Sections:** §6.5 (Team & Invitations)
- **Status:** ✅ Complete (2026-03-11)

- [x] **M08-T01: Implement Invitation Server Actions** ✅ 2026-03-11
  - Created `sendInvitation()`, `cancelInvitation()`, `resendInvitation()` in queries.ts
  - Creates Clerk invitation + DB record, enforces plan limits, blocks OWNER role
  - Added helper functions: `getCompanyMembers`, `getCompanyInvitations`, `getUnitInvitations`, `checkPlanLimitForMembers`

- [x] **M08-T02: Build Company-Wide Team Page** ✅ 2026-03-11
  - Created `/company/[companyId]/team/page.tsx` with members table
  - Shows avatar, name, email, role badge, unit, job title, joined date
  - Pending invitations section with cancel/resend actions
  - "Invite Member" button opens dialog form

- [x] **M08-T03: Build Unit Members Page** ✅ 2026-03-11
  - Created `/unite/[unitId]/users/page.tsx` with member list
  - ADMIN can invite/remove members from their unit
  - Added `removeUserFromUnit()` server action

- [x] **M08-T04: Implement Invitation Acceptance & User Assignment** ✅ 2026-03-11
  - Updated webhook (`user.created`) to detect invitations and assign user to unit
  - Updates Invitation status to ACCEPTED on signup
  - Creates INVITATION notification for company owner
  - Updated middleware to bypass onboarding for invited users

- [x] **M08-T05: Implement Project Team Management** ✅ 2026-03-11
  - Added `addTeamMember()` and `removeTeamMember()` server actions
  - Created project-team-panel.tsx component
  - Sends TEAM notification when user is added
  - Cache invalidation for projectTeamTag, userProjectsTag

---

## ✅ M09 — Client CRM

- **Goal:** Provide unit-scoped client management so that ADMINs can track their clients and link them to projects.
- **Covers PRD Sections:** §6.6 (Client CRM)
- **Status:** ✅ Complete (2026-03-12)

- [x] **M09-T01: Implement Client CRUD Server Actions** ✅ 2026-03-12
  - Created `createClient()`, `updateClient()`, `deleteClient()` in queries.ts
  - Added validation schemas, helper functions (authenticateClientAdmin, verifyClientAccess)
  - Implemented active project guard for deletion
  - Cache invalidation for UNIT_CLIENTS and CLIENT tags

- [x] **M09-T02: Build Client List Page** ✅ 2026-03-12
  - Created `/unite/[unitId]/clients/page.tsx` with search and sort
  - Implemented debounced search by name/wilaya/email
  - Sort by name or total TTC ascending/descending
  - RBAC: ADMIN/OWNER full CRUD, USER read-only for linked projects

- [x] **M09-T03: Create Client Form** ✅ 2026-03-12
  - Created `client-form.tsx` with Zod validation
  - Shared form for Create and Edit modes
  - Uses shadcn/ui Dialog with glassmorphism styling

- [x] **M09-T04: Build Client Profile Page** ✅ 2026-03-12
  - Created `/unite/[unitId]/clients/[clientId]/page.tsx`
  - Contact details card with icons
  - Linked projects list with status badges
  - Total TTC contract value summary
  - Delete guard with active project check
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

#### M09-T02 — Build Client List Page

- **Type:** UI
- **Description:** Create the clients page at `/unite/[unitId]/clients`. Display clients in a searchable, sortable table with columns: name, wilaya, phone, email, total TTC (sum of linked projects' montantTTC), linked project count. Include "Add Client" CTA. USERs see a read-only subset for clients linked to their projects.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/unite/[unitId]/clients/page.tsx` renders client list
  - Search by client name (debounced input)
  - Sort by name or total TTC contract value
  - Empty state with illustration and CTA
  - USER sees only clients linked to their assigned projects (read-only)
- **PRD Reference:** §6.6 (CLT-05, CLT-06)
- **Depends On:** M09-T01
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/unite/[unitId]/clients/page.tsx`

---

#### M09-T03 — Create Client Form

- **Type:** UI
- **Description:** Build a Zod-validated form for creating/editing clients with fields: name, wilaya, phone, email. Use a Dialog or Sheet for the form. Pre-fill on edit mode.
- **Acceptance Criteria:**
  - Form validates all fields (email format, required name)
  - "Create" and "Edit" modes share the same form component
  - Successful submission triggers toast and list refresh
- **PRD Reference:** §6.6 (CLT-02, CLT-03)
- **Depends On:** M09-T01
- **Complexity:** S
- **Touches:** `src/components/forms/client-form.tsx`

---

#### M09-T04 — Build Client Profile Page

- **Type:** UI
- **Description:** Create a client detail/profile page or expandable panel showing: contact details, all linked projects (name, status, montantTTC), and the total TTC contract value (sum). Include edit and delete actions for ADMIN/OWNER.
- **Acceptance Criteria:**
  - Client profile shows contact info and linked projects list
  - Total TTC calculated as `Σ Project.montantTTC` for linked projects
  - Delete button shows the active-project guard message if applicable
  - Premium aesthetic with card layout
- **PRD Reference:** §6.6 (CLT-04, CLT-07)
- **Depends On:** M09-T02
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/unite/[unitId]/clients/[clientId]/page.tsx`

---

## M10 — Project Management

- **Goal:** Implement full project CRUD, financials, status lifecycle, and the project detail page shell so that units can track their project portfolio.
- **Covers PRD Sections:** §6.7 (Project Management), §9 (Financial Rules)
- **Key Deliverables:**
  - `/unite/[unitId]/projects` page: project list with filters (status, client, date) and sort (date, montantTTC)
  - ADMIN or OWNER can create/edit/delete a Project (fields: name, code, type, montantHT, montantTTC, ODS, delai, status, signe, clientId)
  - Project status lifecycle: New → InProgress → Pause → Complete
  - Project detail page at `/unite/[unitId]/projects/[projectId]` with tab navigation: Overview, Gantt, Production, Tasks, Time Tracking, Documents
  - Project overview tab: financials (HT, TTC, TVA), progress (weighted average), team list, client, dates
  - Financial calculations: TVA amount, TVA %, project progress (weighted by phase montantHT)
  - Auto-create empty Team record on project creation
  - OWNER sees all projects; ADMIN sees own unit; USER sees assigned only
- **Depends On:** M08, M09
- **Priority:** Must Have
- **Estimated Complexity:** High

### Tasks

#### M10-T01 — Implement Project CRUD Server Actions

- **Type:** Logic
- **Description:** Create `createProject()`, `updateProject()`, and `deleteProject()` server actions in `src/lib/queries.ts`. On create: validate Plan.maxProjects limit, auto-create an empty Team record, enforce unique `code` within unit. Implement status lifecycle transitions. Calculate and store TVA fields server-side.
- **Acceptance Criteria:**
  - `createProject()` checks plan limit, creates project + empty Team in a transaction
  - `updateProject()` enforces status lifecycle (`New → InProgress → Pause → Complete`)
  - `deleteProject()` cascades deletion of Phases, SubPhases, Tasks, Team, TimeEntries
  - Financial auto-calc: `TVA = montantTTC - montantHT`, `TVA% = (TVA / montantHT) × 100`
  - Cache invalidation per §14.5 mapping
  - RBAC: ADMIN/OWNER only for mutations
- **PRD Reference:** §6.7 (PROJ-01 through PROJ-08), §9, §14.5
- **Depends On:** M08, M09
- **Complexity:** H
- **Touches:** `src/lib/queries.ts`

---

#### M10-T02 — Build Project List Page

- **Type:** UI
- **Description:** Create the projects page at `/unite/[unitId]/projects`. Display projects in a filterable, sortable table/grid with: name, code, client name, status badge, montantTTC (formatted), progress %, ODS date. Include filters (status, client, date range) and sort (date, montantTTC). USERs see only assigned projects.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/unite/[unitId]/projects/page.tsx` renders project list
  - Status filter with multi-select (New, InProgress, Pause, Complete)
  - Client filter dropdown populated from unit's clients
  - Sort by creation date or montantTTC
  - "Create Project" button for ADMIN/OWNER
  - USER sees only projects where they are a TeamMember
  - Empty state with CTA
- **PRD Reference:** §6.7 (PROJ-08, PROJ-09)
- **Depends On:** M10-T01
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/unite/[unitId]/projects/page.tsx`

---

#### M10-T03 — Create Project Form

- **Type:** UI
- **Description:** Build a comprehensive Zod-validated form for creating/editing projects with all required fields: name, code, type, montantHT, montantTTC, ODS date, delai, status, signe (checkbox), clientId (dropdown). Auto-calculate TVA amount and TVA% in real-time as user types HT/TTC.
- **Acceptance Criteria:**
  - Form validates all fields including unique code within unit
  - Client dropdown populated from unit's client list
  - TVA amount and percentage calculated live as montantHT/TTC change
  - Monetary inputs formatted as `1 234 567,89 DA`
  - Edit mode pre-fills existing data with status lifecycle constraint
- **PRD Reference:** §6.7 (PROJ-02, PROJ-04), §9
- **Depends On:** M10-T01, M09
- **Complexity:** M
- **Touches:** `src/components/forms/project-form.tsx`

---

#### M10-T04 — Build Project Detail Page Shell with Tab Navigation

- **Type:** UI
- **Description:** Create the project detail page at `/unite/[unitId]/projects/[projectId]` with a tabbed layout. Implement tabs: Overview, Gantt, Production, Tasks, Time Tracking, Documents. Only the Overview tab is fully implemented in this task; other tabs render placeholder shells to be implemented in later milestones.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/unite/[unitId]/projects/[projectId]/page.tsx` renders with tab navigation
  - Tabs use URL search params or shadcn/ui Tabs component
  - Overview tab shows: financials (HT, TTC, TVA), progress bar, team members, client info, dates
  - Project progress calculated as weighted average of phases
  - RBAC: OWNER sees all; ADMIN sees own unit; USER sees if TeamMember
- **PRD Reference:** §6.7 (PROJ-05, PROJ-06)
- **Depends On:** M10-T01
- **Complexity:** H
- **Touches:** `src/app/(dashboard)/unite/[unitId]/projects/[projectId]/page.tsx`, `src/components/dashboard/project-overview.tsx`

---

#### M10-T05 — Implement getProjectById & Data Fetching with Cache

- **Type:** Logic
- **Description:** Create `getProjectById()`, `getUnitProjects()`, and `getProjectWithDetails()` data-fetching functions in `src/lib/queries.ts` using `'use cache'` directive. Apply appropriate cache tags and cache life profiles per the caching decision map.
- **Acceptance Criteria:**
  - `getProjectById()` uses `cacheLife("minutes")` + `projectTag(id)`
  - `getUnitProjects()` uses `cacheLife("hours")` + `unitProjectsTag(id)`
  - `getProjectWithDetails()` includes phases, team, client, and computed progress
  - All functions enforce `companyId` scoping for tenant isolation
- **PRD Reference:** §14.4, §14.5
- **Depends On:** M10-T01
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

## M11 — Phase & Gantt Planning

- **Goal:** Implement Phase/SubPhase management and the interactive Gantt chart UI so that project planning and progress tracking is visualized.
- **Covers PRD Sections:** §6.8 (Phase & Gantt Planning), §9 (Gantt & Planning Rules)
- **Key Deliverables:**
  - ADMIN/OWNER can create, edit, delete Phases (fields: name, code, montantHT, start, end, status, observations, progress)
  - Phase constraints enforced: `start ≥ Project.ods`, `duration` auto-calculated, `Σ Phase.montantHT ≤ Project.montantHT` warning
  - SubPhase CRUD with date range constrained within parent Phase
  - Gantt chart: horizontal bars color-coded by status, nested SubPhase bars, progress fill overlay, GanttMarkers as vertical dashed lines
  - Timeline zoom: Month / Week / Day levels
  - Click phase bar → Phase detail sheet
- **Depends On:** M10
- **Priority:** Must Have
- **Estimated Complexity:** High

### Tasks

#### M11-T01 — Implement Phase CRUD Server Actions

- **Type:** Logic
- **Description:** Create `createPhase()`, `updatePhase()`, and `deletePhase()` server actions. Enforce constraints: `Phase.start ≥ Project.ods`, auto-calculate `duration = (end - start)` in days. Warn if `Σ Phase.montantHT > Project.montantHT`. Auto-calculate Phase progress as average of SubPhase progress when SubPhases exist.
- **Acceptance Criteria:**
  - `createPhase()` validates start ≥ Project.ods, auto-calculates duration
  - `updatePhase()` recalculates duration and progress on save
  - Budget warning returned when sum of Phase.montantHT exceeds Project.montantHT
  - Cache invalidation: `projectPhasesTag`, `projectGanttTag`, `projectTag`
  - RBAC: ADMIN/OWNER only
- **PRD Reference:** §6.8 (PH-01 through PH-05), §9, §14.5
- **Depends On:** M10
- **Complexity:** H
- **Touches:** `src/lib/queries.ts`

---

#### M11-T02 — Implement SubPhase CRUD & GanttMarker Actions

- **Type:** Logic
- **Description:** Create SubPhase CRUD actions enforcing that SubPhase dates fall within parent Phase range. Create GanttMarker CRUD (label, date, optional className). When SubPhases change, recalculate parent Phase progress.
- **Acceptance Criteria:**
  - SubPhase.start ≥ Phase.start and SubPhase.end ≤ Phase.end
  - Phase.progress auto-recalculated as average of SubPhase.progress
  - GanttMarker CRUD with project-scoped access
  - Cache invalidation: `projectGanttTag`, `projectPhasesTag`
- **PRD Reference:** §6.8 (PH-06 through PH-10)
- **Depends On:** M11-T01
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

#### M11-T03 — Build Phase Management UI

- **Type:** UI
- **Description:** Create a Phase form (dialog/sheet) for creating and editing phases with all fields: name, code, montantHT, start date, end date, status, observations, progress slider. Show a warning badge when budget sum exceeds project montantHT. Display phase list on the project detail Gantt tab.
- **Acceptance Criteria:**
  - Phase form validates all fields using Zod
  - Budget warning displayed inline when sum exceeds project montantHT
  - Duration auto-displayed based on start/end selection
  - Phase list shows status badges, progress bars, and montantHT
- **PRD Reference:** §6.8 (PH-01, PH-02, PH-05)
- **Depends On:** M11-T01
- **Complexity:** M
- **Touches:** `src/components/forms/phase-form.tsx`, `src/components/dashboard/phase-list.tsx`

---

#### M11-T04 — Build Interactive Gantt Chart Component

- **Type:** UI
- **Description:** Build a custom Gantt chart component using HTML/CSS/Canvas or a lightweight library. Render Phases as horizontal bars color-coded by status, SubPhases as nested indented bars, progress fill overlays, and GanttMarkers as vertical dashed lines with diamond icons.
- **Acceptance Criteria:**
  - Phases render as horizontal bars with status-based colors
  - SubPhases nest below parent Phase bars with indentation
  - Progress % displayed as a fill overlay on each bar
  - GanttMarkers render as vertical dashed lines with label
  - Timeline header supports Month / Week / Day zoom levels
  - Clicking a phase bar opens a Phase detail sheet
  - Performs smoothly with 50+ phases (PRD NFR-03)
- **PRD Reference:** §6.8 (GNT-01 through GNT-07), NFR-03
- **Depends On:** M11-T03
- **Complexity:** H
- **Touches:** `src/components/dashboard/gantt-chart.tsx`

---

#### M11-T05 — Integrate Gantt Tab into Project Detail Page

- **Type:** UI
- **Description:** Wire the Gantt chart component into the project detail page's Gantt tab. Fetch phases, subphases, and markers with cached queries. Add zoom controls and marker management UI.
- **Acceptance Criteria:**
  - Gantt tab fully functional on `/unite/[unitId]/projects/[projectId]?tab=gantt`
  - Zoom controls toggle between Month, Week, Day views
  - "Add Marker" button for ADMIN/OWNER
  - Phase bars are clickable → open Phase detail sheet
  - Data fetched via `getGanttData()` with `cacheLife("minutes")` + `projectGanttTag`
- **PRD Reference:** §6.8 (GNT-05), §14.4
- **Depends On:** M11-T04, M10-T04
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/unite/[unitId]/projects/[projectId]/page.tsx`

---

## M12 — Production Monitoring

- **Goal:** Enable planned vs. actual production tracking per Phase with charts and variance alerts so that project delivery performance is measurable.
- **Covers PRD Sections:** §6.9 (Production Monitoring), §9 (Financial Rules — production formulas)
- **Key Deliverables:**
  - ADMIN creates Product (planned baseline) per Phase: planned taux, montantProd, date
  - ADMIN records Production entries (actual): actual taux, mntProd (auto-calculated: `Phase.montantHT × taux / 100`), date
  - Production tab on project detail: line chart (planned vs actual rate), grouped bar chart (planned vs actual amount)
  - Data table: date, planned taux, actual taux, variance, variance % — rows red-colored if actual < planned
  - `/unite/[unitId]/productions` page: aggregate production across all phases in the unit
  - Underperformance alert: if `actual taux < 80% of planned taux` → create `PRODUCTION` notification for OWNER
- **Depends On:** M11
- **Priority:** Must Have
- **Estimated Complexity:** High

### Tasks

#### M12-T01 — Implement Product & Production CRUD Actions

- **Type:** Logic
- **Description:** Create server actions for Product (planned baseline) and Production (actual recordings). Product is one-per-phase. Production entries auto-calculate `mntProd = Phase.montantHT × (taux / 100)`. Trigger `PRODUCTION` notification when `actual taux < 80% of planned taux`.
- **Acceptance Criteria:**
  - `createProduct()` enforces one Product per Phase
  - `createProduction()` auto-calculates `mntProd` server-side
  - Underperformance alert triggers PRODUCTION notification for OWNER
  - Cache invalidation: `phaseProductionTag`, `unitProductionsTag`
  - RBAC: ADMIN/OWNER only
- **PRD Reference:** §6.9 (PROD-01 through PROD-08), §9, §14.5
- **Depends On:** M11
- **Complexity:** H
- **Touches:** `src/lib/queries.ts`

---

#### M12-T02 — Build Production Tab Charts

- **Type:** UI
- **Description:** Implement the Production tab on the project detail page with two charts: (1) a line chart for planned vs actual production rate over time, and (2) a grouped bar chart for planned vs actual produced amounts. Use a charting library (recharts or similar).
- **Acceptance Criteria:**
  - Line chart shows planned taux vs actual taux over time
  - Bar chart shows planned montantProd vs actual mntProd grouped by date
  - Charts are responsive and follow the premium design aesthetic
  - Legend, tooltips, and axis labels present
- **PRD Reference:** §6.9 (PROD-05)
- **Depends On:** M12-T01, M10-T04
- **Complexity:** H
- **Touches:** `src/components/dashboard/production-charts.tsx`

---

#### M12-T03 — Build Production Data Table with Variance

- **Type:** UI
- **Description:** Create a data table below the charts showing: date, planned taux, actual taux, variance (actual - planned), variance %. Rows where actual < planned are conditionally styled with red background. Include forms for logging new Production entries.
- **Acceptance Criteria:**
  - Table shows all production entries with computed variance columns
  - Red row styling when actual < planned
  - "Log Production" form for ADMIN/OWNER
  - Amounts formatted as `1 234 567,89 DA`
- **PRD Reference:** §6.9 (PROD-06)
- **Depends On:** M12-T01
- **Complexity:** M
- **Touches:** `src/components/dashboard/production-table.tsx`

---

#### M12-T04 — Build Unit-Wide Productions Page

- **Type:** UI
- **Description:** Create the aggregate production monitoring page at `/unite/[unitId]/productions`. Display cross-phase production summaries, consolidated charts, and variance alerts for all phases in the unit.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/unite/[unitId]/productions/page.tsx` renders aggregate data
  - Shows per-phase production summary cards with progress indicators
  - Underperformance alerts highlighted with warning badges
  - Data fetched with `cacheLife("minutes")` + `unitProductionsTag`
- **PRD Reference:** §6.9, §11.6
- **Depends On:** M12-T02
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/unite/[unitId]/productions/page.tsx`

---

## M13 — Task & Kanban Board

- **Goal:** Implement the unit-wide Kanban board with lanes, tasks, drag-and-drop, and the task detail sheet so that day-to-day work execution is managed.
- **Covers PRD Sections:** §6.10 (Task & Kanban Board), §9 (Task & Kanban Rules)
- **Key Deliverables:**
  - `/unite/[unitId]/tasks` page: Kanban board with lanes ordered by `Lane.order`
  - ADMIN/OWNER can create, rename, reorder, change color, and delete Lanes
  - ADMIN/OWNER can create Tasks within a Lane (fields: title, description, dates, assignee, tags, order)
  - Drag-and-drop: ADMIN/OWNER can drag any task between lanes; USER can drag only their assigned tasks
  - Task detail side sheet (480px): title, description, status, lane, assignee picker, due date, tags, time entries, activity log
  - Task creation checks `Plan.maxTasksPerProject` limit
  - Overdue badge: red indicator when `dueDate < NOW && complete = false`
  - Tags CRUD: unit-scoped, name + color
- **Depends On:** M07, M10
- **Priority:** Must Have
- **Estimated Complexity:** High

### Tasks

#### M13-T01 — Implement Lane CRUD Server Actions

- **Type:** Logic
- **Description:** Create `createLane()`, `updateLane()`, `reorderLanes()`, and `deleteLane()` server actions. Lanes are unit-scoped and ordered by `Lane.order`. Deleting a lane with tasks unassigns them (`laneId = null`).
- **Acceptance Criteria:**
  - `createLane()` creates a lane with next available order value
  - `updateLane()` supports rename and color change
  - `reorderLanes()` updates order values for affected lanes
  - `deleteLane()` prompts confirmation; sets tasks' laneId to null
  - Cache invalidation: `unitLanesTag(unitId)`, `unitTasksTag(unitId)` on delete
- **PRD Reference:** §6.10 (LANE-01 through LANE-04), §14.5
- **Depends On:** M07
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

#### M13-T02 — Implement Task CRUD & Move Actions

- **Type:** Logic
- **Description:** Create `createTask()`, `updateTask()`, `moveTask()`, and `deleteTask()` server actions. Task creation checks `Plan.maxTasksPerProject`. Assigning a task sends a `TASK` notification. `moveTask()` updates `laneId` and `order` efficiently.
- **Acceptance Criteria:**
  - `createTask()` checks plan limit before INSERT
  - `moveTask()` updates laneId and reindexes order in target lane
  - Assigning task triggers TASK notification to assignee
  - Overdue detection: `dueDate < NOW && complete = false`
  - Cache invalidation: `unitTasksTag`, `userTasksTag`
- **PRD Reference:** §6.10 (TASK-01 through TASK-12), §9, §14.5
- **Depends On:** M13-T01, M10
- **Complexity:** H
- **Touches:** `src/lib/queries.ts`

---

#### M13-T03 — Build Kanban Board UI with Drag-and-Drop

- **Type:** UI
- **Description:** Create the Kanban board at `/unite/[unitId]/tasks` using `@dnd-kit/core` and `@dnd-kit/sortable`. Render lanes as columns with task cards inside. ADMIN/OWNER can drag any task; USER drags only assigned tasks. Task cards show: title, assignee avatar, due date, tags, overdue badge.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/unite/[unitId]/tasks/page.tsx` renders the Kanban board
  - Lanes rendered as columns ordered by `Lane.order`
  - Task cards display title, assignee, due date, tags, overdue badge
  - Drag-and-drop between lanes with smooth animations
  - USER drag restricted to own assigned tasks
  - Optimistic UI update on drag, with server confirmation
  - Renders 200 tasks across 10 lanes without degradation (NFR-04)
- **PRD Reference:** §6.10 (TASK-05 through TASK-08), NFR-04
- **Depends On:** M13-T02
- **Complexity:** H
- **Touches:** `src/app/(dashboard)/unite/[unitId]/tasks/page.tsx`, `src/components/dashboard/kanban-board.tsx`, `src/components/dashboard/task-card.tsx`

---

#### M13-T04 — Build Task Detail Side Sheet

- **Type:** UI
- **Description:** Create a 480px slide-over panel (Sheet) that opens when a task card is clicked. Display: title, description, status, lane selector, assignee picker, due date picker, tags (add/remove), time entries list, and activity log. Allow inline editing.
- **Acceptance Criteria:**
  - Sheet opens on task card click with smooth animation
  - All task fields editable inline (title, description, assignee, due date, lane)
  - Tags can be added/removed from the task
  - Time entries for this task listed with user, duration, description
  - Activity log section shows recent actions on this task
  - "Mark Complete" button available per RBAC rules
- **PRD Reference:** §6.10 (TASK-09, TASK-10, TASK-11)
- **Depends On:** M13-T03
- **Complexity:** H
- **Touches:** `src/components/dashboard/task-detail-sheet.tsx`

---

#### M13-T05 — Implement Tags CRUD

- **Type:** UI/Logic
- **Description:** Create unit-scoped Tags management: CRUD server actions and a tags management UI. Tags have a name and a color. Tags can be applied to multiple tasks. Add a tag picker to the task form and detail sheet.
- **Acceptance Criteria:**
  - `createTag()`, `updateTag()`, `deleteTag()` server actions in queries.ts
  - Tags are unit-scoped — each unit has independent tags
  - Tag picker in task form/detail sheet with color swatches
  - Cache invalidation: `unitTagsTag(unitId)`
- **PRD Reference:** §6.10 (TASK-12)
- **Depends On:** M13-T02
- **Complexity:** S
- **Touches:** `src/lib/queries.ts`, `src/components/dashboard/tag-picker.tsx`

---

#### M13-T06 — Build Lane Management UI

- **Type:** UI
- **Description:** Add lane management controls to the Kanban board header: create lane, rename lane, change lane color, reorder lanes (drag column headers), and delete lane with confirmation. Lane color applies as the header accent.
- **Acceptance Criteria:**
  - "Add Lane" button creates a new lane with a name and color
  - Right-click or dropdown on lane header: rename, change color, delete
  - Delete confirmation warns about tasks becoming unassigned
  - Lane reorder via drag on column headers
- **PRD Reference:** §6.10 (LANE-02, LANE-04)
- **Depends On:** M13-T01
- **Complexity:** M
- **Touches:** `src/components/dashboard/kanban-board.tsx`

---

## M14 — Time Tracking

- **Goal:** Enable users to log working hours against tasks and projects with both manual entry and live timer so that effort is tracked per person.
- **Covers PRD Sections:** §6.11 (Time Tracking)
- **Key Deliverables:**
  - Any user can log time entries linked to a Task, a Project, or both
  - Manual entry form: startTime, endTime, description; `duration` auto-calculated in minutes
  - Live timer: start on a task, stop auto-fills endTime and calculates duration
  - Users can only edit/delete their own entries (unless OWNER/ADMIN)
  - Project Time Tracking tab: entries grouped by user, total duration per user per week, grand total
  - Task detail sheet: all time entries for that task with user, duration, description
- **Depends On:** M13
- **Priority:** Must Have
- **Estimated Complexity:** Medium

### Tasks

#### M14-T01 — Implement TimeEntry CRUD Server Actions

- **Type:** Logic
- **Description:** Create `createTimeEntry()`, `updateTimeEntry()`, and `deleteTimeEntry()` server actions. Auto-calculate `duration = (endTime - startTime)` in minutes. Enforce that USERs can only edit/delete their own entries; OWNER/ADMIN can edit any.
- **Acceptance Criteria:**
  - `createTimeEntry()` accepts taskId, projectId (or both), startTime, endTime, description
  - Duration auto-calculated server-side in minutes
  - RBAC: USER edits own entries only; ADMIN/OWNER can edit any
  - Cache invalidation: `projectTimeTag(projectId)`, `userAnalyticsTag(userId)`
- **PRD Reference:** §6.11 (TIME-01 through TIME-06), §14.5
- **Depends On:** M13
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

#### M14-T02 — Build Manual Time Entry Form

- **Type:** UI
- **Description:** Create a form for manual time entry with fields: description, start time (datetime picker), end time (datetime picker), task selector, project selector. Auto-calculate and display duration as the user selects times. Accessible from the task detail sheet and the project time tracking tab.
- **Acceptance Criteria:**
  - Form validates startTime < endTime
  - Duration displays in hours:minutes format as user selects times
  - Task and project selectors populated from unit context
  - Successful submission triggers toast and list refresh
- **PRD Reference:** §6.11 (TIME-03, TIME-05)
- **Depends On:** M14-T01
- **Complexity:** M
- **Touches:** `src/components/forms/time-entry-form.tsx`

---

#### M14-T03 — Implement Live Timer Hook & UI

- **Type:** UI/Logic
- **Description:** Create a `useTimer` custom hook in `src/hooks/useTimer.ts` that manages a live stopwatch. Build a timer UI widget that can be started on a task, shows elapsed time, and on stop auto-fills endTime and calculates duration. Timer state persisted in Jotai atom with localStorage.
- **Acceptance Criteria:**
  - `useTimer` hook manages start, stop, reset, and elapsed time state
  - Timer widget shows running elapsed time in HH:MM:SS
  - Stopping the timer creates a TimeEntry with auto-filled times
  - Timer state persists across page navigations (Jotai + localStorage)
  - Only one timer can run at a time — starting a new one stops the current
- **PRD Reference:** §6.11 (TIME-04)
- **Depends On:** M14-T01
- **Complexity:** M
- **Touches:** `src/hooks/useTimer.ts`, `src/components/dashboard/timer-widget.tsx`, `src/store/atoms.ts`

---

#### M14-T04 — Build Project Time Tracking Tab

- **Type:** UI
- **Description:** Implement the Time Tracking tab on the project detail page. Display time entries grouped by user, showing total duration per user per week in a summary table. Include a grand total row. Add ability to log new entries directly from this tab.
- **Acceptance Criteria:**
  - Time Tracking tab shows all entries for the project
  - Entries grouped by user with per-user weekly totals
  - Grand total displayed at the bottom
  - "Log Time" button opens the manual entry form
  - Data fetched via `getTimeEntries()` with `cacheLife("minutes")` + `projectTimeTag`
- **PRD Reference:** §6.11 (TIME-07), §14.4
- **Depends On:** M14-T02, M10-T04
- **Complexity:** M
- **Touches:** `src/components/dashboard/project-time-tracking.tsx`

---

## M15 — User Workspace

- **Goal:** Provide regular members with a personal workspace showing their assigned tasks, projects, and performance metrics so that USERs have a productive home experience.
- **Covers PRD Sections:** §11.7 (User Workspace Routes)
- **Key Deliverables:**
  - `/user/[userId]` landing page: today's assigned tasks, active projects, unread notifications count, recent time entries
  - `/user/[userId]/profile` page: edit name, job title, avatar, notification preferences
  - `/user/[userId]/tasks` page: all assigned tasks across the unit, filterable by status/due date/project
  - `/user/[userId]/projects` page: projects where user is a TeamMember
  - `/user/[userId]/analytics` page: total hours logged per week/month, tasks completed vs. pending, activity timeline
- **Depends On:** M13, M14
- **Priority:** Must Have
- **Estimated Complexity:** Medium

### Tasks

#### M15-T01 — Build User Dashboard Landing Page

- **Type:** UI
- **Description:** Create the personal landing page at `/user/[userId]`. Display today's assigned tasks (due today or overdue), active projects summary, unread notifications count badge, and recent time entries. This is the USER's home screen after login.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/user/[userId]/page.tsx` renders the personal dashboard
  - "Today's Tasks" section shows tasks due today or overdue with status indicators
  - Active projects section shows project name, status, and user's team role
  - Unread notification count displayed with bell badge
  - Recent time entries listed with task name, duration, date
  - USER can only access their own workspace; OWNER/ADMIN can view any
- **PRD Reference:** §11.7
- **Depends On:** M13, M14
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/user/[userId]/page.tsx`, `src/lib/queries.ts`

---

#### M15-T02 — Build User Profile Page

- **Type:** UI
- **Description:** Create the profile settings page at `/user/[userId]/profile`. Allow users to edit their name, job title, and avatar. Include notification preferences toggles for each notification type.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/user/[userId]/profile/page.tsx` renders profile form
  - Name, job title, and avatar editable with Zod validation
  - Avatar upload via Uploadthing
  - Only the user themselves can edit their own profile
  - Changes trigger `userTag(userId)` cache invalidation
- **PRD Reference:** §11.7
- **Depends On:** None (within M15)
- **Complexity:** S
- **Touches:** `src/app/(dashboard)/user/[userId]/profile/page.tsx`, `src/components/forms/user-profile-form.tsx`

---

#### M15-T03 — Build User Tasks Page

- **Type:** UI
- **Description:** Create a consolidated task view at `/user/[userId]/tasks`. Show all tasks assigned to this user across their unit, with filters for status (complete/incomplete), due date range, and project. Support "Mark Complete" and "Log Time" quick actions.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/user/[userId]/tasks/page.tsx` renders assigned tasks list
  - Filters: status (complete/incomplete), due date, project
  - Tasks show: title, project name, due date, lane, overdue badge
  - Quick actions: "Mark Complete", "Log Time" on each task
  - Data fetched via `getUserTasks()` with `cacheLife("seconds")` + `userTasksTag`
- **PRD Reference:** §11.7
- **Depends On:** M13
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/user/[userId]/tasks/page.tsx`

---

#### M15-T04 — Build User Projects Page

- **Type:** UI
- **Description:** Create the user projects page at `/user/[userId]/projects`. List all projects where the user is a TeamMember, showing project name, status, their role on the team, project progress, and next milestone.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/user/[userId]/projects/page.tsx` renders project list
  - Shows only projects where user is a TeamMember
  - Each project card shows: name, status badge, team role, progress bar
  - Clicking a project navigates to the project detail page
  - Data fetched via `getUserProjects()` with `cacheLife("hours")` + `userProjectsTag`
- **PRD Reference:** §11.7
- **Depends On:** M08-T05
- **Complexity:** S
- **Touches:** `src/app/(dashboard)/user/[userId]/projects/page.tsx`

---

#### M15-T05 — Build User Analytics Page

- **Type:** UI
- **Description:** Create performance metrics page at `/user/[userId]/analytics`. Display: total hours logged per week and per month (bar chart), tasks completed vs. pending (donut chart), and an activity timeline of recent actions.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/user/[userId]/analytics/page.tsx` renders analytics
  - Weekly/monthly hours bar chart using recharts or similar
  - Tasks completed vs pending donut/pie chart
  - Activity timeline showing recent task completions and time logs
  - Data fetched via `getUserAnalytics()` with `cacheLife("minutes")` + `userAnalyticsTag`
- **PRD Reference:** §11.7
- **Depends On:** M14
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/user/[userId]/analytics/page.tsx`

---

## M16 — Notifications System

- **Goal:** Implement the full notification infrastructure so that users are informed of relevant events based on their role and project assignments.
- **Covers PRD Sections:** §6.12 (Notifications), §9 (Notification Rules)
- **Key Deliverables:**
  - All 10 notification types implemented with correct role targeting and fan-out rules
  - Bell icon in header with unread count badge
  - Bell dropdown: latest 5 unread notifications with type icon, message, timestamp
  - `/notifications` page: full list with filter tabs (All / Unread / by Type), "Mark all as read" action
  - OWNER-targeted notifications deliver to exactly one user; USER receives PROJECT notifications only for TeamMember projects
  - Subscription expiry notifications at T-30, T-7, T-3, on expiry, and on grace period end
- **Depends On:** M08, M10, M13
- **Priority:** Must Have
- **Estimated Complexity:** High

### Tasks

#### M16-T01 — Implement Notification Creation Utility

- **Type:** Logic
- **Description:** Create a `createNotification()` utility function in `src/lib/queries.ts` that handles fan-out logic based on `targetRole` and `targetUserId`. OWNER-targeted notifications go to exactly one user. USER notifications for PROJECT type filter by TeamMember status. Support all 10 notification types.
- **Acceptance Criteria:**
  - `createNotification()` accepts type, message, companyId, unitId, targetRole, targetUserId
  - OWNER-targeted → single notification to the company owner
  - ADMIN-targeted → fan-out to all ADMINs in the relevant unit
  - USER PROJECT notifications → only TeamMembers of the project
  - All 10 notification types defined in the NotificationType enum
- **PRD Reference:** §6.12 (NOTIF-01, NOTIF-06, NOTIF-07), §9
- **Depends On:** M08, M10, M13
- **Complexity:** H
- **Touches:** `src/lib/queries.ts`

---

#### M16-T02 — Build Bell Icon with Unread Count Badge

- **Type:** UI
- **Description:** Add a bell icon to the dashboard header that shows the unread notification count as a badge. Clicking the bell opens a dropdown showing the latest 5 unread notifications with type-specific icon, message preview, and relative timestamp.
- **Acceptance Criteria:**
  - Bell icon in header with dynamic unread count badge
  - Badge hidden when count is 0
  - Dropdown shows latest 5 unread notifications
  - Each notification displays type icon, message, and relative time ("2 min ago")
  - Clicking a notification marks it as read and navigates to the relevant page
  - Unread count fetched via `getUnreadCount()` with `unstable_noStore()`
- **PRD Reference:** §6.12 (NOTIF-02, NOTIF-03)
- **Depends On:** M16-T01
- **Complexity:** M
- **Touches:** `src/components/global/notification-bell.tsx`, `src/components/global/header.tsx`

---

#### M16-T03 — Build Full Notifications Page

- **Type:** UI
- **Description:** Create the full notifications page at `/notifications`. Display all notifications with filter tabs (All / Unread / by Type). Include "Mark all as read" action. Each notification shows type icon, full message, timestamp, and read status.
- **Acceptance Criteria:**
  - Route `src/app/(dashboard)/notifications/page.tsx` renders notification list
  - Filter tabs: All, Unread, and per notification type
  - "Mark all as read" button marks all unread as read
  - Individual notification click marks it as read
  - Pagination or infinite scroll for long lists
  - Data fetched via `getNotifications()` with `unstable_noStore()`
- **PRD Reference:** §6.12 (NOTIF-04, NOTIF-05)
- **Depends On:** M16-T01
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/notifications/page.tsx`

---

#### M16-T04 — Wire Notification Triggers Into Existing Actions

- **Type:** Logic
- **Description:** Integrate `createNotification()` calls into all existing server actions that should trigger notifications: task assignment (TASK), team member addition (TEAM), project status change (PROJECT), phase status change (PHASE), client changes (CLIENT), production alerts (PRODUCTION), lane/tag changes (LANE/TAG), invitation acceptance (INVITATION).
- **Acceptance Criteria:**
  - All 10 notification types triggered from their respective server actions
  - Correct role targeting applied per PRD notification matrix
  - No duplicate notifications on retries (idempotent)
  - Subscription expiry notifications (T-30, T-7, T-3, expiry, grace end) triggered
- **PRD Reference:** §6.12, §6.3 (SUB-11), §9
- **Depends On:** M16-T01
- **Complexity:** H
- **Touches:** `src/lib/queries.ts`

---

#### M16-T05 — Implement Mark-as-Read & Notification Queries

- **Type:** Logic
- **Description:** Create `markNotificationRead()`, `markAllRead()`, `getNotifications()`, and `getUnreadCount()` server actions/queries. Notifications use `unstable_noStore()` — never cached.
- **Acceptance Criteria:**
  - `markNotificationRead()` toggles individual notification read status
  - `markAllRead()` marks all unread notifications for the user as read
  - `getNotifications()` returns paginated, filterable notification list
  - `getUnreadCount()` returns the unread count for the bell badge
  - All queries use `unstable_noStore()` per caching requirements
- **PRD Reference:** §6.12 (NOTIF-04, NOTIF-05), §14.4
- **Depends On:** M16-T01
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

## M17 — Activity Logs

- **Goal:** Record an audit trail of key user actions so that stakeholders have accountability and visibility into who changed what and when.
- **Covers PRD Sections:** §6.13 (Activity Logs)
- **Key Deliverables:**
  - Key actions generate ActivityLog entries: create/edit/delete for Projects, Phases, Tasks, Clients, Members
  - ActivityLog fields: companyId, unitId, userId, action, entityType, entityId, metadata (JSON), createdAt
  - OWNER views all logs company-wide; ADMIN views own unit; USER views assigned projects only
  - Activity log page with filters: date range, entityType, user
- **Depends On:** M10, M13
- **Priority:** Must Have
- **Estimated Complexity:** Medium

### Tasks

#### M17-T01 — Implement ActivityLog Creation Utility

- **Type:** Logic
- **Description:** Create a `logActivity()` utility in `src/lib/queries.ts` that inserts an ActivityLog record with companyId, unitId, userId, action (string), entityType (string), entityId, and metadata (JSON). This function is called from within other server actions after successful mutations.
- **Acceptance Criteria:**
  - `logActivity()` creates an ActivityLog entry with all required fields
  - Metadata stores before/after snapshots or relevant context as JSON
  - Function is non-blocking — failure to log does not fail the parent action
  - Activity logs use `unstable_noStore()` — never cached
- **PRD Reference:** §6.13 (ACT-01, ACT-02)
- **Depends On:** M10, M13
- **Complexity:** S
- **Touches:** `src/lib/queries.ts`

---

#### M17-T02 — Wire Activity Logging Into Existing Actions

- **Type:** Logic
- **Description:** Add `logActivity()` calls to all server actions that modify Projects, Phases, Tasks, Clients, and Members. Log create, edit, and delete actions with the relevant metadata.
- **Acceptance Criteria:**
  - Project create/edit/delete → ActivityLog entry
  - Phase create/edit/delete → ActivityLog entry
  - Task create/edit/delete/move → ActivityLog entry
  - Client create/edit/delete → ActivityLog entry
  - Member add/remove → ActivityLog entry
  - Each log captures: action type, entity details, user who performed it
- **PRD Reference:** §6.13 (ACT-01)
- **Depends On:** M17-T01
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

#### M17-T03 — Build Activity Log Page

- **Type:** UI
- **Description:** Create an activity log viewing page accessible from the dashboard. OWNER sees all logs company-wide; ADMIN sees own unit; USER sees only assigned project logs. Include filters for date range, entity type, and user.
- **Acceptance Criteria:**
  - Activity log page renders a chronological list of actions
  - Filters: date range picker, entity type dropdown, user selector
  - Each entry shows: user avatar+name, action description, entity link, timestamp
  - RBAC-scoped: OWNER → all; ADMIN → own unit; USER → assigned projects
  - Data fetched via `getActivityLogs()` with `unstable_noStore()`
  - Pagination for long lists
- **PRD Reference:** §6.13 (ACT-03 through ACT-06)
- **Depends On:** M17-T02
- **Complexity:** M
- **Touches:** `src/app/(dashboard)/activity/page.tsx`, `src/components/dashboard/activity-log-list.tsx`

---

## M18 — Caching & Performance Optimization

- **Goal:** Apply the Next.js 16 `use cache` directive strategy across all data-fetching functions and ensure all mutations trigger correct cache invalidation so that the app meets performance targets.
- **Covers PRD Sections:** §14 (Next.js 16 Caching Strategy), §7 (NFR-01 through NFR-04 — Performance)
- **Key Deliverables:**
  - `lib/cache.ts` fully populated with all cache tag constants and cacheLife profiles (static, days, hours, minutes, seconds)
  - All cacheable functions in `queries.ts` use `'use cache'` directive with appropriate `cacheTag()` and `cacheLife()` calls
  - All mutations call `revalidateTag()` for the minimum set of affected tags per the revalidation map
  - Notifications, activity logs, unread count, and invitation status use `unstable_noStore()` — never cached
  - LCP < 2.5s, Server Actions < 500ms, Gantt renders 50 phases without lag, Kanban renders 200 tasks across 10 lanes without degradation
- **Depends On:** M10, M13, M16, M17
- **Priority:** Must Have
- **Estimated Complexity:** Medium

### Tasks

#### M18-T01 — Populate cache.ts with All Tags & Profiles

- **Type:** Config
- **Description:** Finalize `src/lib/cache.ts` with all cache tag factory functions and cacheLife profiles as defined in PRD §14.2 and §14.3. Ensure every tag used across queries.ts is defined as a typed constant — no inline string literals.
- **Acceptance Criteria:**
  - All tag factories from PRD §14.3 are exported (plans, company, subscription, unit, project, phase, user scopes)
  - Custom `"seconds"` cacheLife profile registered for Kanban data
  - All exported constants are type-safe with autocomplete support
  - No inline cache tag strings exist anywhere in `queries.ts`
- **PRD Reference:** §14.2, §14.3 (CACHE-01, CACHE-02, CACHE-07)
- **Depends On:** None (within M18)
- **Complexity:** S
- **Touches:** `src/lib/cache.ts`

---

#### M18-T02 — Apply 'use cache' Directives to All Queries

- **Type:** Logic
- **Description:** Audit all data-fetching functions in `src/lib/queries.ts` and apply the `'use cache'` directive with appropriate `cacheTag()` and `cacheLife()` calls per the caching decision map (PRD §14.4). Ensure never-cached functions use `unstable_noStore()`.
- **Acceptance Criteria:**
  - All cacheable queries use `'use cache'` with correct tag + life profile
  - `getPlans()` → `cacheLife("static")`
  - `getCompanyById()` → `cacheLife("days")` + `companyTag(id)`
  - `getUnitTasks()` → `cacheLife("seconds")` + `unitTasksTag(id)`
  - `getNotifications()`, `getActivityLogs()`, `getUnreadCount()` → `unstable_noStore()`
  - `'use cache'` only in server functions — never in Client Components
- **PRD Reference:** §14.4, §14.6 (CACHE-01, CACHE-04 through CACHE-08)
- **Depends On:** M18-T01
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

#### M18-T03 — Audit & Complete Cache Invalidation in Mutations

- **Type:** Logic
- **Description:** Audit all server action mutations in `src/lib/queries.ts` and ensure each calls `revalidateTag()` for the exact minimum set of affected tags per the invalidation map in PRD §14.5. Fix any missing or over-broad invalidations.
- **Acceptance Criteria:**
  - Every mutation calls `revalidateTag()` per the §14.5 mapping
  - Phase progress update also invalidates `projectTag(projectId)` (CACHE-09)
  - Subscription activation invalidates `subscriptionTag(companyId)` (CACHE-10)
  - No broad/global invalidations — always scoped to entity ID
  - Verified: mutation → tag pairing matches the PRD table exactly
- **PRD Reference:** §14.5, §14.6 (CACHE-03, CACHE-09, CACHE-10)
- **Depends On:** M18-T02
- **Complexity:** M
- **Touches:** `src/lib/queries.ts`

---

#### M18-T04 — Performance Testing & Optimization

- **Type:** Testing
- **Description:** Run performance benchmarks against the PRD targets. Measure LCP, Server Action response times, Gantt rendering with 50+ phases, and Kanban rendering with 200+ tasks. Identify and fix any bottlenecks (N+1 queries, excessive re-renders, large bundles).
- **Acceptance Criteria:**
  - LCP < 2.5s on standard broadband (NFR-01)
  - Server Actions respond in < 500ms under normal load (NFR-02)
  - Gantt chart renders 50 phases without visible lag (NFR-03)
  - Kanban board renders 200 tasks across 10 lanes without degradation (NFR-04)
  - Any identified bottlenecks documented and resolved
  - Lighthouse performance score ≥ 90 on key pages
- **PRD Reference:** §7 (NFR-01 through NFR-04)
- **Depends On:** M18-T03
- **Complexity:** H
- **Touches:** Multiple files (optimization targets identified during testing)

---

## Milestone Dependency Graph

```
M01 ──► M02 ──► M03 ──► M04 ──► M05 ──► M06 ──► M07 ──┬──► M08 ──► M10 ──┬──► M11 ──► M12
                                                        │                   │
                                                        ├──► M09 ──► M10    ├──► M13 ──► M14 ──► M15
                                                        │                   │
                                                        │                   ├──► M16
                                                        │                   │
                                                        │                   ├──► M17
                                                        │                   │
                                                        │                   └──► M18
                                                        └──► M13
```

## Summary Table

| ID  | Name                                      | Priority  | Complexity | Depends On         |
| --- | ----------------------------------------- | --------- | ---------- | ------------------ |
| M01 | Project Foundation & Infrastructure Setup | Must Have | Medium     | None               |
| M02 | Database Schema & Seed Data               | Must Have | High       | M01                |
| M03 | Authentication & Onboarding               | Must Have | High       | M01, M02           |
| M04 | Routing, Middleware & Layout Shell        | Must Have | High       | M03                |
| M05 | Company Management                        | Must Have | Medium     | M04                |
| M06 | Subscription & Plan Enforcement           | Must Have | High       | M05                |
| M07 | Unit Management                           | Must Have | Medium     | M05, M06           |
| M08 | Team & Invitations                        | Must Have | High       | M07                |
| M09 | Client CRM                                | Must Have | Medium     | M07                |
| M10 | Project Management                        | Must Have | High       | M08, M09           |
| M11 | Phase & Gantt Planning                    | Must Have | High       | M10                |
| M12 | Production Monitoring                     | Must Have | High       | M11                |
| M13 | Task & Kanban Board                       | Must Have | High       | M07, M10           |
| M14 | Time Tracking                             | Must Have | Medium     | M13                |
| M15 | User Workspace                            | Must Have | Medium     | M13, M14           |
| M16 | Notifications System                      | Must Have | High       | M08, M10, M13      |
| M17 | Activity Logs                             | Must Have | Medium     | M10, M13           |
| M18 | Caching & Performance Optimization        | Must Have | Medium     | M10, M13, M16, M17 |
