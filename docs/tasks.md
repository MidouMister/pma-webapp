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

## M03 — Authentication & Onboarding

- **Goal:** Enable user registration, login, and the first-run onboarding wizard so that new users can create a Company, first Unit, and become the OWNER — the entry point for the entire application.
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

## M05 — Company Management

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

---

## M06 — Subscription & Plan Enforcement

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

---

## M07 — Unit Management

- **Goal:** Enable the OWNER to create and manage operational Units, each with an assigned Admin, so that the multi-unit company hierarchy is functional.
- **Covers PRD Sections:** §6.4 (Unit Management)
- **Key Deliverables:**
  - `/company/[companyId]/units` page: unit list with member count, project count, admin name; create/edit/delete controls
  - OWNER can assign exactly one Admin per Unit
  - ADMIN can edit their own Unit's profile (name, address, phone, email)
  - Deleting a Unit cascades deletion of all associated Projects, Phases, Tasks, Lanes, Tags, and Clients
  - `/unite/[unitId]` unit dashboard with KPIs, recent activity, team summary
- **Depends On:** M05, M06
- **Priority:** Must Have
- **Estimated Complexity:** Medium

---

## M08 — Team & Invitations

- **Goal:** Implement the invitation system and team management so that OWNER/ADMIN can build their workforce and assign members to project teams.
- **Covers PRD Sections:** §6.5 (Team & Invitations)
- **Key Deliverables:**
  - OWNER or ADMIN can invite users by email with role `ADMIN` or `USER` (never `OWNER`)
  - Clerk sends invitation email; `clerkInvitationId` stored for tracking
  - Invitation status transitions: PENDING → ACCEPTED or PENDING → REJECTED
  - `/company/[companyId]/team` page: company-wide member directory with roles, invite history, pending invitations
  - `/unite/[unitId]/users` page: unit member list with role badges, job titles, invite/remove controls
  - Project Team management: add/remove unit members to a Project's Team with project-specific role label
- **Depends On:** M07
- **Priority:** Must Have
- **Estimated Complexity:** High

---

## M09 — Client CRM

- **Goal:** Provide unit-scoped client management so that ADMINs can track their clients and link them to projects.
- **Covers PRD Sections:** §6.6 (Client CRM)
- **Key Deliverables:**
  - `/unite/[unitId]/clients` page: client list with search by name, sort by name / total TTC
  - ADMIN or OWNER can create, edit, and delete Clients (fields: name, wilaya, phone, email)
  - Client profile page showing: contact details, linked projects, total TTC contract value
  - USERs can view client info read-only for clients linked to their assigned projects
  - Deletion guard: cannot delete a Client with active (InProgress) projects
- **Depends On:** M07
- **Priority:** Must Have
- **Estimated Complexity:** Medium

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
