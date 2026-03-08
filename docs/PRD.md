# PMA — Product Requirements Document

**Version:** 1.0.0
**Status:** Draft
**Last Updated:** March 2026
**Author:** Product Team
**Stakeholders:** Engineering, Design, QA, Business

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [System Architecture Overview](#5-system-architecture-overview)
6. [Functional Requirements](#6-functional-requirements)
   - 6.1 [Authentication & Onboarding](#61-authentication--onboarding)
   - 6.2 [Company Management](#62-company-management)
   - 6.3 [Subscription & Plans](#63-subscription--plans)
   - 6.4 [Unit Management](#64-unit-management)
   - 6.5 [Team & Invitations](#65-team--invitations)
   - 6.6 [Client CRM](#66-client-crm)
   - 6.7 [Project Management](#67-project-management)
   - 6.8 [Phase & Gantt Planning](#68-phase--gantt-planning)
   - 6.9 [Production Monitoring](#69-production-monitoring)
   - 6.10 [Task & Kanban Board](#610-task--kanban-board)
   - 6.11 [Time Tracking](#611-time-tracking)
   - 6.12 [Notifications](#612-notifications)
   - 6.13 [Activity Logs](#613-activity-logs)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Role-Based Access Control (RBAC)](#8-role-based-access-control-rbac)
9. [Business Rules & Constraints](#9-business-rules--constraints)
10. [Data Models Summary](#10-data-models-summary)
11. [Page & Route Inventory](#11-page--route-inventory)

- 11.1 [Routing Middleware — src/proxy.ts](#111-routing-middleware--srcproxyts)
- 11.2 [Dynamic Role-Based Redirection](#112-dynamic-role-based-redirection)
- 11.3 [Public Routes](#113-public-routes)
- 11.4 [Authentication Routes](#114-authentication-routes-company-branded)
- 11.5 [Company Management Routes](#115-company-management-routes)
- 11.6 [Unit (Unite) Operation Routes](#116-unit-unite-operation-routes)
- 11.7 [User Workspace Routes](#117-user-workspace-routes)
- 11.8 [Shared / Utility Routes](#118-shared--utility-routes)

12. [Navigation Sidebar](#12-navigation-sidebar)

- 12.1 [Sidebar Menu — By Role & Context](#121-sidebar-menu--by-role--context)
- 12.2 [Core Sidebar Features](#122-core-sidebar-features)
- 12.3 [Sidebar Requirements](#123-sidebar-requirements)

13. [Tech Stack](#13-tech-stack)
14. [Next.js 16 Caching Strategy](#14-nextjs-16-caching-strategy)

- 14.1 [Caching Primitives](#141-caching-primitives-used)
- 14.2 [Cache Life Profiles](#142-cache-life-profiles-srclibcachets)
- 14.3 [Cache Tag Taxonomy](#143-cache-tag-taxonomy-srclibcachets)
- 14.4 [Caching Decision Map](#144-caching-decision-map--by-page--data-type)
- 14.5 [Cache Invalidation](#145-cache-invalidation--server-actions)
- 14.6 [Caching Requirements](#146-caching-requirements)

15. [Out of Scope](#15-out-of-scope)
16. [Open Questions](#16-open-questions)
17. [Glossary](#17-glossary)

---

## 1. Executive Summary

**PMA** (Project Management App) is a multi-tenant, enterprise-grade web application designed for industries that require granular tracking of projects, financial phases, and production rates — primarily construction, engineering, and public works sectors.

The platform is structured around a **Company → Units → Projects** hierarchy. A single Company Owner bootstraps the account and manages multiple operational Units. Each Unit operates semi-independently with its own Admin, members, clients, projects, and Kanban board. Regular members interact exclusively with projects they are assigned to.

PMA aims to be the single source of truth for a company's project financials (HT/TTC), Gantt-based planning, production output monitoring, and day-to-day task execution — replacing fragmented spreadsheet workflows with a cohesive, role-enforced, real-time platform.

---

## 2. Problem Statement

Companies in project-heavy industries (construction, infrastructure, consulting) face recurring operational challenges:

- **Fragmented planning tools.** Gantt charts live in Excel, tasks live in a separate app, financials in another. No single view of a project's health.
- **No production accountability.** Planned vs. actual production rates are tracked manually (if at all), making it impossible to detect underperformance early.
- **Weak access control.** Sharing spreadsheets gives everyone full read/write access regardless of role. Sensitive financial data leaks down to regular workers.
- **Multi-unit chaos.** Companies with multiple regional branches or departments have no structured way to manage them under one organizational roof.
- **Subscription scalability.** Small teams need a lightweight entry point; large enterprises need no hard limits. A tiered plan system is needed to accommodate both.

PMA solves all of the above within a single, cohesive platform.

---

## 3. Goals & Success Metrics

### Product Goals

| #   | Goal                          | Description                                                                         |
| --- | ----------------------------- | ----------------------------------------------------------------------------------- |
| G1  | Unified project view          | Every project's financial, planning, and production data accessible from one screen |
| G2  | Role-enforced data access     | Users see only what their role permits — no over-exposure of sensitive data         |
| G3  | Production variance detection | Automated alerts when actual production falls below planned thresholds              |
| G4  | Structured multi-tenancy      | Companies can manage multiple independent units under one account                   |
| G5  | Scalable monetization         | Tiered plans that grow with the customer without requiring code changes             |

### Key Metrics (KPIs)

| Metric                                                                    | Target (6 months post-launch) |
| ------------------------------------------------------------------------- | ----------------------------- |
| User activation rate (onboarding completed)                               | > 75% of signups              |
| Weekly Active Users (WAU)                                                 | > 60% of registered users     |
| Average projects per active unit                                          | ≥ 3                           |
| Notification open rate                                                    | > 40%                         |
| Trial-to-paid conversion (Starter trial → Pro or Premium within 2 months) | > 25%                         |
| Support tickets related to permissions                                    | < 5% of active users/month    |

---

## 4. User Personas

### Persona 1 — The Company Owner

> **"I need a 10,000-foot view of every project in every unit at any time."**

- **Who:** Founder or CEO of a construction/engineering firm
- **Tech comfort:** Moderate — uses web apps daily, not a developer
- **Goals:** Track overall company financial performance, manage subscriptions, ensure units are staffed correctly
- **Pain points:** Currently calls unit managers for updates; has no real-time financial visibility across projects
- **Key features used:** Dashboard KPIs, company settings, billing, cross-unit project overview, all notifications

---

### Persona 2 — The Unit Administrator

> **"I run my unit. I need to create projects, assign work, and monitor delivery."**

- **Who:** Branch manager, project director, or site supervisor
- **Tech comfort:** Moderate to high
- **Goals:** Create and track projects end-to-end, manage their team, record production progress, keep clients informed
- **Pain points:** Managing Gantt charts in Excel; no automatic variance alerts; difficulty coordinating task assignment
- **Key features used:** Project creation, Gantt planning, phase management, production recording, Kanban board, client CRM, team invitations

---

### Persona 3 — The Regular Member

> **"Tell me what I need to do today and let me log my work."**

- **Who:** Engineer, technician, field worker, or analyst
- **Tech comfort:** Low to moderate
- **Goals:** See their assigned tasks, update progress, log working hours
- **Pain points:** Currently receives instructions via WhatsApp or email; no structured place to report progress
- **Key features used:** Kanban board (assigned tasks only), time tracking, notifications, assigned project view

---

## 5. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        COMPANY                          │
│  (one Owner · one Subscription · one Plan)              │
│  ┌───────────────────┐  ┌───────────────────┐           │
│  │      UNIT A       │  │      UNIT B       │  ...      │
│  │  Admin + Members  │  │  Admin + Members  │           │
│  │  ┌─────────────┐  │  │  ┌─────────────┐  │           │
│  │  │  Project 1  │  │  │  │  Project 3  │  │           │
│  │  │  Project 2  │  │  │  └─────────────┘  │           │
│  │  └─────────────┘  │  │  Clients          │           │
│  │  Clients          │  │  Lanes / Tasks    │           │
│  │  Lanes / Tasks    │  └───────────────────┘           │
│  └───────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

### Hierarchy Rules

- One Company is owned by exactly **one User** (the creator — bootstrapped at onboarding)
- A Company contains **one or more Units** (limited by Plan)
- Each Unit has **one Admin** and **many Members**
- Projects belong to a Unit; Members access only projects where they are a **TeamMember**
- All entities are isolated by `companyId` at the database query level

---

## 6. Functional Requirements

### 6.1 Authentication & Onboarding

**Provider:** Clerk

#### Requirements

| ID      | Requirement                                                                                                                                                                                                                | Priority  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| AUTH-01 | Users must register and log in via Clerk (email/password or OAuth)                                                                                                                                                         | Must Have |
| AUTH-02 | On first login, if no Company is associated, redirect to `/onboarding`                                                                                                                                                     | Must Have |
| AUTH-03 | Onboarding wizard collects: Company name, email, address, phone, logo, NIF, legal form (formJur), state, sector                                                                                                            | Must Have |
| AUTH-04 | Completing onboarding creates: Company record, assigns OWNER role, auto-creates a **2-month Starter trial subscription** (`startAt = now`, `endAt = now + 2 months`), and creates first Unit — no operator action required | Must Have |
| AUTH-05 | Users arriving via invitation link skip onboarding and are assigned to their Unit directly                                                                                                                                 | Must Have |
| AUTH-06 | All `/dashboard/*` routes are protected by Clerk middleware; unauthenticated users redirect to `/sign-in`                                                                                                                  | Must Have |
| AUTH-07 | Clerk webhook `user.created` syncs the new user to the PMA database                                                                                                                                                        | Must Have |

#### Onboarding Steps

1. **Step 1 — Company Profile:** Name, logo upload (Uploadthing), legal form, NIF, sector, state, address, phone, email
2. **Step 2 — First Unit:** Unit name, address, phone, email
3. **Step 3 — Invite Team (optional):** Email + role picker, skippable

---

### 6.2 Company Management

#### Requirements

| ID      | Requirement                                                                                                 | Priority    |
| ------- | ----------------------------------------------------------------------------------------------------------- | ----------- |
| COMP-01 | OWNER can edit all Company fields (name, logo, address, legal info)                                         | Must Have   |
| COMP-02 | Company logo is uploaded via Uploadthing and stored as a URL                                                | Must Have   |
| COMP-03 | OWNER is the only user with `Role.OWNER`; this cannot be granted via invitation                             | Must Have   |
| COMP-04 | `Company.ownerId` is unique and immutable after creation                                                    | Must Have   |
| COMP-05 | OWNER can view aggregated data across all units (projects, members, financials)                             | Must Have   |
| COMP-06 | OWNER can delete the Company — cascades deletion of all Units, Projects, Phases, Tasks, and associated data | Should Have |

---

### 6.3 Subscription & Plans

#### Context — Algerian Payment Reality

Algerian companies do not use online/electronic payment systems for B2B software subscriptions. All commercial transactions are conducted through **traditional offline methods**: physical cheques, bank wire transfers (virement bancaire), and formal service contracts. The pma billing system is designed entirely around this reality — there is **no payment gateway integration**, and no credit card flows.

The subscription lifecycle is managed **manually by the pma platform administrator** (the SaaS operator), who activates, renews, or suspends subscriptions after confirming payment receipt offline.

#### Payment Methods Supported

| Method             | Arabic / FR Term      | Flow                                                                                     |
| ------------------ | --------------------- | ---------------------------------------------------------------------------------------- |
| Bank Wire Transfer | Virement Bancaire     | Company sends transfer to pma's bank account; operator confirms and activates            |
| Business Cheque    | Chèque                | Company mails or hands over a cheque; operator cashes and activates                      |
| Service Contract   | Contrat de Prestation | Signed contract defines plan, duration, and price; activation follows contract signature |

#### Plan Tiers

| Feature             | Starter (Trial)                       | Pro           | Premium       |
| ------------------- | ------------------------------------- | ------------- | ------------- |
| Duration            | **2 months free** — then must upgrade | Annual (paid) | Annual (paid) |
| Price (DA HT)       | 0 DA — trial only                     | Paid          | Paid          |
| Max Units           | 1                                     | 5             | Unlimited     |
| Max Projects        | 5                                     | 30            | Unlimited     |
| Max Tasks / Project | 20                                    | 200           | Unlimited     |
| Max Members         | 10                                    | 50            | Unlimited     |
| Contract Required   | No                                    | Yes           | Yes           |
| Support Level       | None                                  | Email         | Dedicated     |

> **Note:** A `null` value in any Plan limit field means unlimited. Pricing is defined in Algerian Dinar (DA) and invoiced HT (Hors Taxe) with TVA applied per Algerian fiscal law.

#### Starter Trial Policy

The Starter plan is a **time-limited free trial**, not a permanent free tier. Its purpose is to allow a company to evaluate pma before committing to a paid plan.

- **Duration:** 2 calendar months from the date of company creation (`Company.createdAt`)
- **Activation:** Automatically assigned at onboarding — no operator action required
- **`startAt`:** Set to `Company.createdAt`
- **`endAt`:** Set to `Company.createdAt + 2 months`
- **After expiry:** The company enters a **grace period of 7 days** during which features remain accessible but a persistent upgrade banner is shown on every page
- **After grace period:** The account is **locked in read-only mode** — data is preserved but no new entities (projects, tasks, phases, etc.) can be created until the OWNER upgrades to Pro or Premium
- **No downgrade back to Starter:** Once a company upgrades to Pro or Premium, they cannot return to the Starter trial plan

#### Trial Expiry Timeline

```
Day 0 (Onboarding)
  └─► Starter trial starts automatically (startAt = now, endAt = now + 2 months)

Day 30 (T - 30 days before expiry)
  └─► GENERAL notification: "Your free trial expires in 30 days. Upgrade to continue."

Day 53 (T - 7 days before expiry)
  └─► GENERAL notification: "Your free trial expires in 7 days. Upgrade now to avoid interruption."

Day 57 (T - 3 days before expiry)
  └─► GENERAL notification: "Your trial ends in 3 days. Your account will become read-only."

Day 60 (Trial ends — endAt reached)
  └─► Persistent upgrade banner shown on every page
  └─► GENERAL notification: "Your trial has ended. Upgrade to Pro or Premium to continue."
  └─► 7-day grace period begins (features still accessible, banner blocking new actions)

Day 67 (Grace period ends)
  └─► Account enters READ-ONLY mode
  └─► All CREATE / UPDATE / DELETE actions blocked with upgrade modal
  └─► Data is fully preserved — nothing is deleted
  └─► GENERAL notification: "Your account is now read-only. Contact pma to upgrade."
```

#### Paid Plan Subscription Lifecycle

```
Company requests upgrade  ──►  pma Admin reviews  ──►  Contract signed (Pro/Premium)
          │                                                       │
          ▼                                                       ▼
  Cheque / Virement                                   pma Admin activates
  sent to pma bank                                   Subscription in DB
          │                                          (startAt, endAt, active=true)
          ▼                                                       │
  pma Admin confirms                                             ▼
  payment received                                Company notified (GENERAL notification)
          │                                                       │
          └───────────────────────────────────────────────────────►
                                                    Company accesses paid plan features
```

#### Renewal & Suspension (Pro / Premium)

- Paid subscriptions have a defined `startAt` and `endAt` date set by the pma operator
- **30 days before expiry:** OWNER receives a `GENERAL` notification reminding them to renew
- **7 days before expiry:** Second reminder notification sent
- **3 days before expiry:** Final reminder notification sent
- **On expiry:** 7-day grace period — features remain accessible; persistent renewal banner shown
- **After grace period:** Account enters read-only mode — same behavior as expired Starter trial
- **Manual reactivation:** pma operator sets new `startAt`, `endAt`, and `active = true` after payment confirmation

#### Requirements

| ID     | Requirement                                                                                                                                                           | Priority    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| SUB-01 | Every Company has exactly one active Subscription linked to one Plan                                                                                                  | Must Have   |
| SUB-02 | Before any CREATE action (unit/project/task/member), the system checks the applicable Plan limit                                                                      | Must Have   |
| SUB-03 | If the limit is reached, display an Upgrade Prompt Modal with a CTA to `/company/[companyId]/settings/billing`                                                        | Must Have   |
| SUB-04 | The billing page displays the current plan, its limits, expiry date, days remaining, and a **"Request Upgrade"** form — not a payment button                          | Must Have   |
| SUB-05 | "Request Upgrade" form collects: desired plan, company name, contact email, phone, preferred payment method (virement / chèque / contrat), and a message field        | Must Have   |
| SUB-06 | Submitting the upgrade request sends an email notification to the pma operator and creates a `GENERAL` notification for the OWNER confirming the request was received | Must Have   |
| SUB-07 | Subscription activation (`active`, `startAt`, `endAt`, `planId`) is set exclusively by the pma platform admin via an internal admin interface or direct DB update     | Must Have   |
| SUB-08 | Starter plan is automatically created at onboarding with `startAt = Company.createdAt` and `endAt = createdAt + 2 months` — no operator action required               | Must Have   |
| SUB-09 | After Starter trial `endAt`, a 7-day grace period begins — features remain accessible but a persistent upgrade banner is shown on every dashboard page                | Must Have   |
| SUB-10 | After grace period ends, the account enters **read-only mode** — all CREATE/UPDATE/DELETE actions are blocked; data is fully preserved                                | Must Have   |
| SUB-11 | OWNER receives `GENERAL` notifications at: T-30 days, T-7 days, T-3 days before `endAt`, on expiry, and on grace period end                                           | Must Have   |
| SUB-12 | Once upgraded to Pro or Premium, the company cannot revert to the Starter trial plan                                                                                  | Must Have   |
| SUB-13 | Downgrading between paid plans: if current usage exceeds the new plan's limits, block the request and list which limits are exceeded                                  | Should Have |
| SUB-14 | The billing page shows a downloadable **proforma invoice** (PDF) generated from the Subscription and Plan data for the company's accounting records                   | Should Have |
| SUB-15 | All subscription amounts displayed in DA (Algerian Dinar) formatted as `1 234 567,89 DA` with TVA line shown separately                                               | Must Have   |
| SUB-16 | A **days-remaining countdown** is displayed on the billing page and as a subtle chip in the sidebar footer when trial has fewer than 30 days left                     | Must Have   |

---

### 6.4 Unit Management

#### Requirements

| ID      | Requirement                                                                                           | Priority  |
| ------- | ----------------------------------------------------------------------------------------------------- | --------- |
| UNIT-01 | OWNER can create, edit, and delete Units                                                              | Must Have |
| UNIT-02 | OWNER assigns exactly one Admin per Unit (User.adminID is unique)                                     | Must Have |
| UNIT-03 | ADMIN can edit their own Unit's profile (name, address, phone, email)                                 | Must Have |
| UNIT-04 | Each Unit has its own member list, project list, client list, lanes, and tags                         | Must Have |
| UNIT-05 | Deleting a Unit cascades deletion of all associated Projects, Phases, Tasks, Lanes, Tags, and Clients | Must Have |
| UNIT-06 | OWNER can view all Units from `/dashboard/units` with member count, project count, and admin name     | Must Have |

---

### 6.5 Team & Invitations

#### Requirements

| ID     | Requirement                                                                               | Priority    |
| ------ | ----------------------------------------------------------------------------------------- | ----------- |
| INV-01 | OWNER or ADMIN can invite a user by email with a role of `ADMIN` or `USER`                | Must Have   |
| INV-02 | Inviting as OWNER role via the invitation system is explicitly forbidden                  | Must Have   |
| INV-03 | Clerk sends the invitation email; `clerkInvitationId` is stored for tracking              | Must Have   |
| INV-04 | Invitation status transitions: `PENDING → ACCEPTED` or `PENDING → REJECTED`               | Must Have   |
| INV-05 | One active invitation per email per Company (unique email in Invitation table)            | Must Have   |
| INV-06 | ADMIN or OWNER can cancel a PENDING invitation                                            | Must Have   |
| INV-07 | ADMIN or OWNER can resend a PENDING invitation                                            | Should Have |
| INV-08 | On acceptance, User is assigned to the Unit with the specified role                       | Must Have   |
| INV-09 | OWNER receives an `INVITATION` notification when a pending invite is accepted or rejected | Must Have   |
| INV-10 | OWNER can remove a member from a Unit; this does not delete the User account              | Must Have   |
| INV-11 | A user removed from a Unit loses access to all Unit-scoped data                           | Must Have   |
| INV-12 | Members page shows: avatar, name, email, role badge, job title, joined date, status       | Must Have   |

#### Project Team

| ID      | Requirement                                                                                | Priority  |
| ------- | ------------------------------------------------------------------------------------------ | --------- |
| TEAM-01 | Each Project has exactly one Team record                                                   | Must Have |
| TEAM-02 | ADMIN or OWNER can add Unit members to a Project's Team with a project-specific role label | Must Have |
| TEAM-03 | Adding a member to a project team sends them a `TEAM` notification                         | Must Have |
| TEAM-04 | USER can only view projects they are a TeamMember of                                       | Must Have |
| TEAM-05 | ADMIN can remove a member from a project team                                              | Must Have |

---

### 6.6 Client CRM

#### Requirements

| ID     | Requirement                                                                                                                                   | Priority    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| CLT-01 | Clients are Unit-scoped — each Unit manages its own client list                                                                               | Must Have   |
| CLT-02 | ADMIN or OWNER can create, edit, and delete Clients                                                                                           | Must Have   |
| CLT-03 | Client fields: name (unique), wilaya, phone, email (unique), unit                                                                             | Must Have   |
| CLT-04 | Each Client has a profile page showing: contact details, all linked projects, total TTC contract value (sum of associated Project.montantTTC) | Must Have   |
| CLT-05 | USERs can view client info (read-only) for clients linked to their assigned projects                                                          | Must Have   |
| CLT-06 | Client list supports search by name and sort by name / total contract value                                                                   | Must Have   |
| CLT-07 | A Client cannot be deleted if they have active (InProgress) projects                                                                          | Should Have |

---

### 6.7 Project Management

#### Requirements

| ID      | Requirement                                                                                                                                        | Priority    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| PROJ-01 | ADMIN or OWNER can create a Project within their Unit                                                                                              | Must Have   |
| PROJ-02 | Project fields: name, code (unique within unit), type, montantHT, montantTTC, ODS date, delai (deadline string), status, signe (boolean), clientId | Must Have   |
| PROJ-03 | Project status lifecycle: `New → InProgress → Pause → Complete`                                                                                    | Must Have   |
| PROJ-04 | Project `signe` flag indicates whether the contract is signed                                                                                      | Must Have   |
| PROJ-05 | Project overview shows: financials (HT, TTC, TVA difference), progress (weighted average of phase progress by montantHT), team, client, dates      | Must Have   |
| PROJ-06 | Project detail page has tabs: Overview, Gantt, Production, Tasks, Time Tracking, Documents                                                         | Must Have   |
| PROJ-07 | A Project automatically creates an empty Team on creation                                                                                          | Must Have   |
| PROJ-08 | OWNER can view all projects across all units; ADMIN sees only their unit's projects; USER sees only assigned projects                              | Must Have   |
| PROJ-09 | Project list supports filter by status, unit (OWNER only), client, and sort by date / montantTTC                                                   | Must Have   |
| PROJ-10 | Documents tab supports file uploads via Uploadthing (PDFs, images, drawings)                                                                       | Should Have |
| PROJ-11 | ADMIN can archive / soft-delete a project                                                                                                          | Should Have |

#### Financial Logic

- `TVA Amount = montantTTC - montantHT`
- `TVA % = ((montantTTC - montantHT) / montantHT) × 100`
- `Project Progress (%) = Σ(Phase.progress × Phase.montantHT) / Σ(Phase.montantHT)` — weighted average
- All monetary amounts display in Algerian format: `1 234 567,89 DA`

---

### 6.8 Phase & Gantt Planning

#### Phase Requirements

| ID    | Requirement                                                                                                                           | Priority    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| PH-01 | ADMIN or OWNER can create Phases for a Project                                                                                        | Must Have   |
| PH-02 | Phase fields: name, code, montantHT, start date, end date, status, observations, progress (0–100), duration (auto-calculated in days) | Must Have   |
| PH-03 | `Phase.start` must be ≥ `Project.ods`                                                                                                 | Must Have   |
| PH-04 | `Phase.duration` is auto-calculated as `(end - start)` in days on save                                                                | Must Have   |
| PH-05 | Sum of all `Phase.montantHT` must not exceed `Project.montantHT` — show a warning if it does                                          | Must Have   |
| PH-06 | Each Phase can have multiple SubPhases                                                                                                | Must Have   |
| PH-07 | SubPhase fields: name, code, status (TODO / COMPLETED), progress (0–100), start, end                                                  | Must Have   |
| PH-08 | SubPhase dates must be within the parent Phase's date range                                                                           | Must Have   |
| PH-09 | `Phase.progress` auto-calculates as the average of its SubPhase progress values (if SubPhases exist)                                  | Should Have |
| PH-10 | ADMIN can add GanttMarkers to a Project: label, date, optional CSS className for styling                                              | Must Have   |
| PH-11 | Overlapping phases within the same project trigger a visual warning on the Gantt chart                                                | Should Have |

#### Gantt Chart UI

| ID     | Requirement                                                                | Priority    |
| ------ | -------------------------------------------------------------------------- | ----------- |
| GNT-01 | Display all Phases as horizontal bars on a timeline, color-coded by status | Must Have   |
| GNT-02 | SubPhases display as nested, indented bars beneath their parent Phase      | Must Have   |
| GNT-03 | GanttMarkers render as vertical dashed lines with a diamond icon and label | Must Have   |
| GNT-04 | Each bar shows a progress fill overlay representing Phase.progress %       | Must Have   |
| GNT-05 | Timeline header supports Month / Week / Day zoom levels                    | Must Have   |
| GNT-06 | ADMIN/OWNER can drag phase bars to reschedule (updates start/end/duration) | Should Have |
| GNT-07 | Clicking a phase bar opens a Phase detail sheet                            | Must Have   |

---

### 6.9 Production Monitoring

The production module tracks planned vs. actual output for each Phase, ensuring financial and physical progress stay in sync.

#### Data Model Clarification

- **Product** — the planned baseline for a Phase: planned `taux` (rate %), planned `montantProd`, reference `date`
- **Production** — individual actual entries recorded against a Product: actual `taux`, actual `mntProd`, `date`

#### Requirements

| ID      | Requirement                                                                                                                                     | Priority   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| PROD-01 | Each Phase can have at most one Product (planned baseline)                                                                                      | Must Have  |
| PROD-02 | ADMIN creates the Product first, defining the planned taux and montantProd for the phase                                                        | Must Have  |
| PROD-03 | ADMIN then records individual Production entries (actual results) against the Product                                                           | Must Have  |
| PROD-04 | `Production.mntProd = Phase.montantHT × (Production.taux / 100)` — system auto-calculates on save                                               | Must Have  |
| PROD-05 | Production tab shows two charts: (1) Planned vs Actual production rate (line chart), (2) Planned vs Actual produced amount (grouped bar chart)  | Must Have  |
| PROD-06 | A data table below charts shows: date, planned taux, actual taux, variance, variance % — rows are conditionally colored red if actual < planned | Must Have  |
| PROD-07 | If `actual taux < 80% of planned taux`, create a `PRODUCTION` notification targeting the OWNER                                                  | Must Have  |
| PROD-08 | When a Phase is marked as Complete and the production milestone is reached, create a `PRODUCTION` notification                                  | Must Have  |
| PROD-09 | Configurable threshold for underperformance alerts (default 80%)                                                                                | Could Have |

---

### 6.10 Task & Kanban Board

#### Lane Requirements

| ID      | Requirement                                                                                           | Priority  |
| ------- | ----------------------------------------------------------------------------------------------------- | --------- |
| LANE-01 | Lanes are Unit-scoped (shared across all projects within a unit)                                      | Must Have |
| LANE-02 | ADMIN or OWNER can create, rename, reorder, change color of, and delete Lanes                         | Must Have |
| LANE-03 | Lanes have an `order` integer field; display in ascending order                                       | Must Have |
| LANE-04 | Deleting a Lane with tasks prompts a confirmation; tasks are unassigned from the lane (laneId = null) | Must Have |

#### Task Requirements

| ID      | Requirement                                                                                                                   | Priority  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- | --------- |
| TASK-01 | ADMIN or OWNER can create Tasks within a Lane, scoped to a Unit                                                               | Must Have |
| TASK-02 | Task fields: title, description, startDate, dueDate, endDate, complete, assignedUserId, laneId, order, tags[]                 | Must Have |
| TASK-03 | Task creation checks `Plan.maxTasksPerProject` limit before INSERT                                                            | Must Have |
| TASK-04 | Assigning a task to a user sends them a `TASK` notification                                                                   | Must Have |
| TASK-05 | Tasks are displayed as cards on the Kanban board, ordered by `Task.order` within each lane                                    | Must Have |
| TASK-06 | ADMIN/OWNER can drag tasks between lanes (updates `laneId` and `order`)                                                       | Must Have |
| TASK-07 | USER can drag only their own assigned tasks between lanes                                                                     | Must Have |
| TASK-08 | A task is **overdue** if `dueDate < NOW` and `complete = false` — display a red overdue badge                                 | Must Have |
| TASK-09 | Clicking a task card opens a Task Detail Side Sheet (480px slide-over panel)                                                  | Must Have |
| TASK-10 | Task Detail Sheet shows: title, description, status, lane, assignee picker, due date picker, tags, time entries, activity log | Must Have |
| TASK-11 | Any unit member can mark a task complete if assigned to them; ADMIN/OWNER can mark any task complete                          | Must Have |
| TASK-12 | Tags are Unit-scoped, have a name and a color, and can be applied to multiple tasks                                           | Must Have |

---

### 6.11 Time Tracking

#### Requirements

| ID      | Requirement                                                                                             | Priority  |
| ------- | ------------------------------------------------------------------------------------------------------- | --------- |
| TIME-01 | Any user (OWNER, ADMIN, USER) can log time entries                                                      | Must Have |
| TIME-02 | A TimeEntry can be linked to a Task, a Project, or both                                                 | Must Have |
| TIME-03 | Fields: description, startTime, endTime, duration (minutes, auto-calculated)                            | Must Have |
| TIME-04 | Users can start a live timer on a task; stopping it auto-fills endTime and calculates duration          | Must Have |
| TIME-05 | Manual entry form allows direct input of startTime, endTime, and description                            | Must Have |
| TIME-06 | Users can only edit or delete their own time entries (unless OWNER/ADMIN)                               | Must Have |
| TIME-07 | Project Time Tracking tab shows: entries grouped by user, total duration per user per week, grand total | Must Have |
| TIME-08 | Task detail sheet shows all time entries for that task with user, duration, and description             | Must Have |

---

### 6.12 Notifications

#### Notification Types by Role

| Type         | OWNER | ADMIN | USER          | Trigger                                    |
| ------------ | ----- | ----- | ------------- | ------------------------------------------ |
| `INVITATION` | ✓     | ✓     | ✓             | Invite accepted or rejected                |
| `PROJECT`    | ✓     | ✓     | Assigned only | Project status change, update              |
| `TASK`       | ✓     | ✓     | ✓ (assigned)  | Task assigned to user                      |
| `TEAM`       | ✓     | ✓     | ✓             | Added to / removed from project team       |
| `PHASE`      | ✓     | ✓     | —             | Phase status change                        |
| `CLIENT`     | ✓     | ✓     | —             | Client added or updated                    |
| `PRODUCTION` | ✓     | ✓     | —             | Milestone reached / underperformance alert |
| `LANE`       | ✓     | ✓     | —             | Lane created or deleted                    |
| `TAG`        | ✓     | ✓     | —             | Tag created or deleted                     |
| `GENERAL`    | ✓     | ✓     | ✓             | System-wide announcements                  |

#### Requirements

| ID       | Requirement                                                                                                           | Priority    |
| -------- | --------------------------------------------------------------------------------------------------------------------- | ----------- |
| NOTIF-01 | Notifications are stored in the DB with `userId`, `companyId`, `unitId`, `type`, `read`, `targetRole`, `targetUserId` | Must Have   |
| NOTIF-02 | Bell icon in the header shows unread count badge                                                                      | Must Have   |
| NOTIF-03 | Bell dropdown shows latest 5 unread notifications with type icon, message, and timestamp                              | Must Have   |
| NOTIF-04 | Full notifications page at `/dashboard/notifications` with filter tabs: All / Unread / by Type                        | Must Have   |
| NOTIF-05 | "Mark all as read" action available on notifications page                                                             | Must Have   |
| NOTIF-06 | Since there is exactly one OWNER, role-targeted notifications (`targetRole: OWNER`) are delivered to that single user | Must Have   |
| NOTIF-07 | USER receives `PROJECT` notifications only for projects they are a TeamMember of                                      | Must Have   |
| NOTIF-08 | Notifications are polled or delivered via Supabase Realtime for near-real-time updates                                | Should Have |

---

### 6.13 Activity Logs

#### Requirements

| ID     | Requirement                                                                                                      | Priority    |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ----------- |
| ACT-01 | Key user actions generate an ActivityLog entry: create/edit/delete for Projects, Phases, Tasks, Clients, Members | Must Have   |
| ACT-02 | ActivityLog fields: companyId, unitId, userId, action (string), entityType, entityId, metadata (JSON), createdAt | Must Have   |
| ACT-03 | OWNER can view all activity logs company-wide                                                                    | Must Have   |
| ACT-04 | ADMIN can view activity logs for their unit only                                                                 | Must Have   |
| ACT-05 | USER can view activity logs scoped to their assigned projects only                                               | Must Have   |
| ACT-06 | Activity log page supports filter by: date range, entityType, user                                               | Should Have |

---

## 7. Non-Functional Requirements

### Performance

| ID     | Requirement                                                                          |
| ------ | ------------------------------------------------------------------------------------ |
| NFR-01 | Initial page load (LCP) < 2.5s on a standard broadband connection                    |
| NFR-02 | Server Actions (mutations) respond in < 500ms under normal load                      |
| NFR-03 | Gantt chart renders up to 50 phases without visible lag                              |
| NFR-04 | Kanban board renders up to 200 tasks across 10 lanes without performance degradation |

### Security

| ID     | Requirement                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------ |
| NFR-05 | All authentication handled by Clerk; no passwords stored in PMA's database                       |
| NFR-06 | All database queries include `companyId` scope to enforce tenant isolation                       |
| NFR-07 | Row-level role checks enforced in `queries.ts` on every mutation — never trusted from the client |
| NFR-08 | File uploads validated by Uploadthing (file type, max size)                                      |
| NFR-09 | API routes and Server Actions validate session and role before executing                         |

### Reliability

| ID     | Requirement                                                            |
| ------ | ---------------------------------------------------------------------- |
| NFR-10 | System uptime target: 99.5% monthly                                    |
| NFR-11 | Database hosted on Supabase with automated daily backups               |
| NFR-12 | Failed mutations surface a user-facing toast error; no silent failures |

### Scalability

| ID     | Requirement                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------ |
| NFR-13 | Architecture supports adding new Plan tiers without code changes (Plan is a DB entity)                 |
| NFR-14 | New notification types can be added to the `NotificationType` enum without breaking existing consumers |

### Usability

| ID     | Requirement                                                           |
| ------ | --------------------------------------------------------------------- |
| NFR-15 | Application is desktop-first, responsive down to 768px (tablet)       |
| NFR-16 | Dark mode by default; light mode toggle available                     |
| NFR-17 | All monetary amounts formatted as: `1 234 567,89 DA`                  |
| NFR-18 | All dates formatted as: `DD MMM YYYY` (e.g. 15 Jan 2026)              |
| NFR-19 | Skeleton loaders display on all data-fetching components              |
| NFR-20 | Empty states include an illustration, a message, and a contextual CTA |

---

## 8. Role-Based Access Control (RBAC)

### Role Definitions

| Role    | Scope                                                     | How Assigned                                            |
| ------- | --------------------------------------------------------- | ------------------------------------------------------- |
| `OWNER` | Company-wide (all units, all projects)                    | Automatically at company creation — cannot be invited   |
| `ADMIN` | Unit-scoped (their assigned unit only)                    | Via invitation with `role: ADMIN`, or promoted by OWNER |
| `USER`  | Project-scoped (only assigned projects within their unit) | Via invitation with `role: USER`                        |

### Permission Summary

| Action                                 | OWNER | ADMIN         | USER                       |
| -------------------------------------- | ----- | ------------- | -------------------------- |
| Create / delete Company                | ✓     | ✗             | ✗                          |
| Manage Subscription & Billing          | ✓     | ✗             | ✗                          |
| Create / delete Units                  | ✓     | ✗             | ✗                          |
| Edit Unit profile                      | ✓     | Own only      | ✗                          |
| Invite members (any role except OWNER) | ✓     | Own unit only | ✗                          |
| Remove members                         | ✓     | Own unit only | ✗                          |
| Create / edit / delete Projects        | ✓     | Own unit only | ✗                          |
| View Project list                      | ✓ All | Own unit      | Assigned only              |
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
| View Activity Logs                     | ✓ All | Own unit      | Assigned projects only     |
| Manage Tags                            | ✓     | Own unit only | ✗                          |

---

## 9. Business Rules & Constraints

### Financial Rules

1. `TVA = montantTTC - montantHT`
2. `TVA % = (TVA / montantHT) × 100`
3. Sum of all `Phase.montantHT` within a project **should not exceed** `Project.montantHT` — surface a non-blocking warning if violated
4. `Production.mntProd = Phase.montantHT × (Production.taux / 100)` — calculated server-side on insert
5. Cumulative production for a phase = `Σ Production.mntProd` for all records linked to that phase's Product

### Gantt & Planning Rules

1. `Phase.duration = (Phase.end - Phase.start)` in calendar days — auto-calculated on save
2. `Phase.start` must be ≥ `Project.ods` — validate before save
3. `SubPhase.start` and `SubPhase.end` must be within the parent `Phase` date range
4. If SubPhases exist: `Phase.progress = average(SubPhase.progress)` — auto-calculated
5. If no SubPhases: `Phase.progress` is set manually by ADMIN
6. `Project.progress = Σ(Phase.progress × Phase.montantHT) / Σ(Phase.montantHT)` — weighted average

### Task & Kanban Rules

1. Lanes are ordered by `Lane.order` (ascending integer)
2. Tasks within a lane are ordered by `Task.order` (ascending integer)
3. On drag-and-drop reorder, re-index only the affected tasks' `order` values
4. `Task.complete = true` does **not** automatically move the task to a "Done" lane
5. A task is **overdue** if `dueDate < NOW` and `complete = false`
6. `TimeEntry.duration (minutes) = (endTime - startTime)` in minutes — calculated on endTime set

### Subscription Enforcement Rules

1. Before any `INSERT` for a limited entity, query the current count and compare to the Plan limit
2. If `Plan.maxX = null` → skip the check entirely (unlimited)
3. The limit check runs **server-side** in `queries.ts` — never rely on client-side enforcement
4. Downgrading: if current usage exceeds the new plan's limits, block the downgrade and show which limits are exceeded

### Notification Rules

1. There is exactly **one OWNER** per company — `targetRole: OWNER` delivers to one user only
2. `USER` receives `PROJECT` notifications **only** if they are a `TeamMember` on that project
3. Notification fan-out for `ADMIN` role notifications targets all ADMIN users within the relevant unit
4. `read = false` on creation; toggled per-user individually — never globally mutated across users

---

## 10. Data Models Summary

| Model          | Key Fields                                                                               | Scoped By |
| -------------- | ---------------------------------------------------------------------------------------- | --------- |
| `User`         | id, name, email, role, jobTitle, avatarUrl, adminID, unitId, companyId                   | —         |
| `Company`      | id, name, companyEmail, ownerId, logo, nif, formJur, secteur                             | —         |
| `Subscription` | id, startAt, endAt, price, active, companyId, planId                                     | Company   |
| `Plan`         | id, name, monthlyCost, maxUnits, maxProjects, maxTasksPerProject, userLimit              | —         |
| `Unit`         | id, name, address, phone, email, companyId, adminId                                      | Company   |
| `Invitation`   | id, email, unitId, companyId, status, role, clerkInvitationId                            | Company   |
| `Project`      | id, name, code, type, montantHT, montantTTC, ods, delai, status, signe, clientId, unitId | Unit      |
| `Phase`        | id, name, code, montantHT, start, end, status, obs, progress, duration, projectId        | Project   |
| `SubPhase`     | id, name, code, status, progress, start, end, phaseId                                    | Phase     |
| `GanttMarker`  | id, label, date, className, projectId                                                    | Project   |
| `Product`      | id, date, taux, montantProd, phaseId                                                     | Phase     |
| `Production`   | id, date, taux, mntProd, productId                                                       | Product   |
| `Client`       | id, name, wilaya, phone, email, unitId                                                   | Unit      |
| `Team`         | id, projectId                                                                            | Project   |
| `TeamMember`   | id, role, teamId, userId                                                                 | Team      |
| `Task`         | id, title, description, dueDate, complete, assignedUserId, laneId, order, unitId         | Unit      |
| `Lane`         | id, name, color, order, unitId                                                           | Unit      |
| `Tag`          | id, name, color, unitId                                                                  | Unit      |
| `TimeEntry`    | id, description, startTime, endTime, duration, userId, taskId, projectId                 | User      |
| `Notification` | id, notification, companyId, unitId, userId, targetRole, targetUserId, read, type        | Company   |

---

## 11. Page & Route Inventory

The application is architected around four primary domains: **Public**, **Company**, **Unit (Unite)**, and **User**. Routing logic is enforced by `src/proxy.ts` (Next.js Middleware), which acts as the security and routing engine for the entire app.

---

### 11.1 Routing Middleware — `src/proxy.ts`

`src/proxy.ts` is the Next.js Middleware layer that runs before any page is rendered. It is the single traffic controller of the application.

| Responsibility             | Detail                                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Route Protection**       | Uses `auth.protect()` to gatekeep all routes under `/company/*` and `/unite/*` — unauthenticated users are blocked                                              |
| **Invitation Handling**    | Detects `__clerk_ticket` query parameter (Clerk invitation links) and automatically routes the invitee to `/company/sign-up` while preserving their credentials |
| **URL Normalization**      | Redirects generic `/sign-in` and `/sign-up` paths to `/company/sign-in` and `/company/sign-up` respectively                                                     |
| **Path Masking (Rewrite)** | Rewrites the root `/` to serve `/site` content — the browser URL stays clean as `yourdomain.com/`                                                               |
| **Static Asset Exclusion** | Matcher config excludes static files (images, CSS, JS, fonts) from middleware execution to preserve performance                                                 |

---

### 11.2 Dynamic Role-Based Redirection

Upon successful login, the middleware reads the authenticated user's role and redirects them to their designated landing experience:

| Role    | Redirect Target        | Landing Experience                                                                       |
| ------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `OWNER` | `/company/[companyId]` | Company-level dashboard — overview of all units, billing, team, company-wide performance |
| `ADMIN` | `/unite`               | Unit management area — selects and manages their assigned unit's operations              |
| `USER`  | `/user/[userId]`       | Personal workspace — scoped to their assigned tasks, projects, and notifications only    |

**Special Case Scenarios:**

| Scenario                             | Behavior                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 🆕 New Owner (no company yet)        | Redirected to `/company` — prompted to create company profile and choose a subscription plan (onboarding launchpad)                 |
| 📩 Invited User (pending acceptance) | Middleware halts redirection and renders `InvitationProcessor` — properly assigns role and unit before routing to final destination |
| 🚫 Unrecognized role / no companyId  | Redirected to `/unauthorized` page — access to all protected routes is denied                                                       |

---

### 11.3 Public Routes

| Route   | Access | Description                                                       |
| ------- | ------ | ----------------------------------------------------------------- |
| `/`     | Public | Rewritten to `/site` by middleware — browser URL remains `/`      |
| `/site` | Public | Marketing landing page — product overview, features, pricing, CTA |

---

### 11.4 Authentication Routes (Company-Branded)

| Route              | Access                   | Description                                                                             |
| ------------------ | ------------------------ | --------------------------------------------------------------------------------------- |
| `/company/sign-in` | Public (unauthenticated) | Clerk-integrated login portal, branded with company identity                            |
| `/company/sign-up` | Public (unauthenticated) | Clerk-integrated registration portal; invitation links land here via middleware rewrite |

---

### 11.5 Company Management Routes

> **Access:** OWNER only (middleware blocks all other roles)

| Route                                   | Description                                                                                                                                                                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/company`                              | Onboarding launchpad — shown to new Owners with no company yet; prompts company creation and plan selection                                                                                                                                     |
| `/company/[companyId]`                  | Main company dashboard — KPIs across all units, activity feed, high-level financial summary, upcoming milestones                                                                                                                                |
| `/company/[companyId]/units`            | Units management — list of all units with member count, project count, admin name, and creation controls; OWNER can create, edit, delete units and assign admins                                                                                |
| `/company/[companyId]/team`             | Company-wide team management — all members across all units, roles, invite history, pending invitations, role changes                                                                                                                           |
| `/company/[companyId]/settings`         | Company settings — edit company metadata (name, logo, NIF, legal form, sector, address); billing tab links to subscription management                                                                                                           |
| `/company/[companyId]/settings/billing` | Subscription & billing — current plan details, expiry date, usage vs. limits, plan comparison (Starter / Pro / Premium), **Request Upgrade form** (offline payment — virement / chèque / contrat), proforma invoice download, renewal reminders |

---

### 11.6 Unit (Unite) Operation Routes

> **Access:** OWNER (all units) · ADMIN (own unit only) — enforced by middleware + server-side role check

| Route                                  | Access                          | Description                                                                                                                                                                                                             |
| -------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/unite`                               | ADMIN                           | Unit selection entry point — lists units the ADMIN is assigned to; clicking a unit navigates to its dashboard                                                                                                           |
| `/unite/[unitId]`                      | OWNER · ADMIN                   | Unit operational dashboard — unit KPIs, recent project activity, team summary, production snapshot                                                                                                                      |
| `/unite/[unitId]/projects`             | OWNER · ADMIN                   | All projects within the unit — filterable by status, client, date; ADMIN can create new projects here                                                                                                                   |
| `/unite/[unitId]/projects/[projectId]` | OWNER · ADMIN · USER (assigned) | Project detail page with tabs: **Overview** (financials, progress, team), **Gantt** (phases, subphases, markers, timeline), **Production** (charts & table), **Tasks** (Kanban board), **Time Tracking**, **Documents** |
| `/unite/[unitId]/tasks`                | OWNER · ADMIN                   | Unit-wide Kanban board — all lanes and tasks for the unit; ADMIN manages lanes and assigns tasks                                                                                                                        |
| `/unite/[unitId]/clients`              | OWNER · ADMIN                   | Unit client CRM — client list with search/sort; click through to client profile with linked projects and total TTC                                                                                                      |
| `/unite/[unitId]/productions`          | OWNER · ADMIN                   | Unit-wide production monitoring — aggregate planned vs. actual charts across all phases, variance alerts, production records table                                                                                      |
| `/unite/[unitId]/users`                | OWNER · ADMIN                   | Unit member directory — staff list with role badges, job titles, joined dates, pending invitations, invite and remove controls                                                                                          |

---

### 11.7 User Workspace Routes

> **Access:** The authenticated USER themselves (own workspace only) · OWNER/ADMIN can view any user's profile

| Route                      | Access                     | Description                                                                                                                                            |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/user/[userId]`           | USER (own) · OWNER · ADMIN | Personal landing page — today's assigned tasks, active projects summary, unread notifications count, recent time entries                               |
| `/user/[userId]/profile`   | USER (own)                 | Personal account settings — edit name, job title, avatar; notification preferences                                                                     |
| `/user/[userId]/tasks`     | USER (own) · ADMIN         | Aggregated view of all tasks assigned to this user across their unit — filterable by status, due date, project; supports complete and time-log actions |
| `/user/[userId]/projects`  | USER (own) · ADMIN         | List of projects the user is a TeamMember of — project name, status, their role on the team, progress, next milestone                                  |
| `/user/[userId]/analytics` | USER (own) · OWNER · ADMIN | Personal performance metrics — total hours logged per week/month, tasks completed vs. pending, activity timeline                                       |

---

### 11.8 Shared / Utility Routes

| Route            | Access                  | Description                                                                                                                          |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/unauthorized`  | Any authenticated user  | Shown when role does not permit access to the requested route                                                                        |
| `/notifications` | All authenticated roles | Full notifications page — all notification types, filter by type (TASK / PROJECT / PRODUCTION / TEAM / INVITATION), mark all as read |

---

## 12. Navigation Sidebar

The Sidebar in `pma` is a dynamic, context-aware navigation component. It adapts its structure and menu items based on two factors: the **User's Role** and the **Current View Context** (Company, Unit, or User workspace). It is one of the most critical UI components in the application, acting as both the primary navigation system and a visual signal of which domain the user is operating in.

---

### 12.1 Sidebar Menu — By Role & Context

#### 👑 OWNER — Company Context (`/company/[companyId]`)

> Sidebar focuses on **Enterprise Governance** — high-level oversight of the entire organization.

| Menu Item (FR)  | Route                                   | Description                                                                                                                                                       |
| --------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tableau de Bord | `/company/[companyId]`                  | High-level overview of the entire company — KPIs, all units, financial summary                                                                                    |
| Commencer       | `/company`                              | Onboarding launchpad and quick-start actions for new owners                                                                                                       |
| Paiement        | `/company/[companyId]/settings/billing` | Subscription management — current plan, expiry date, usage limits, upgrade request form (offline payment: virement / chèque / contrat), proforma invoice download |
| Paramètres      | `/company/[companyId]/settings`         | Company metadata, logo upload, legal information (NIF, formJur, sector)                                                                                           |
| Unités          | `/company/[companyId]/units`            | Create, manage, and monitor all business units and their assigned admins                                                                                          |
| Équipes         | `/company/[companyId]/team`             | Company-wide human resources — all members, roles, pending invitations                                                                                            |

---

#### 🛡️ ADMIN & OWNER — Unit Context (`/unite/[unitId]`)

> When entering a specific Unit, the sidebar shifts to **Operational Execution** — the day-to-day running of the unit.

| Menu Item (FR)  | Route                         | Description                                                                |
| --------------- | ----------------------------- | -------------------------------------------------------------------------- |
| Tableau de Bord | `/unite/[unitId]`             | Metrics and activity snapshot for that specific unit                       |
| Équipe          | `/unite/[unitId]/users`       | Members assigned to this unit — roles, job titles, invite management       |
| Projets         | `/unite/[unitId]/projects`    | All projects owned by this unit — filterable by status, client, date       |
| Clients         | `/unite/[unitId]/clients`     | Unit-specific CRM for regional clients and their linked projects           |
| Tâches          | `/unite/[unitId]/tasks`       | Kanban board and task management interface for the unit                    |
| Productions     | `/unite/[unitId]/productions` | Production rate monitoring — planned vs. actual charts and variance alerts |

---

#### 👤 USER — Personal Context (`/user/[userId]`)

> For regular members, the sidebar is tailored for **Individual Productivity** — focused exclusively on their own work.

| Menu Item (FR)  | Route                              | Description                                                                         |
| --------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| Tableau de Bord | `/user/[userId]`                   | Personal activity summary — upcoming deadlines, assigned tasks, recent time entries |
| Profil          | `/user/[userId]/profile`           | Personal account settings — name, job title, avatar, notification preferences       |
| Projets         | `/user/[userId]/projects`          | Projects the user is actively contributing to (TeamMember only)                     |
| Tâches          | `/user/[userId]/tasks`             | Consolidated list of all tasks assigned specifically to this user                   |
| Équipe          | Unit members directory (read-only) | View of immediate teammates within the user's unit                                  |
| Analytique      | `/user/[userId]/analytics`         | Personal performance metrics — hours logged, tasks completed, activity timeline     |

---

### 12.2 Core Sidebar Features

#### Context Switcher ("The Compass")

The sidebar includes a **Compass / Building selector** at the top, below the company logo:

| Role    | Behavior                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OWNER` | Full **Unit Switcher** — dropdown lists all company units; selecting one navigates to `/unite/[unitId]`; a "Company" option returns to `/company/[companyId]` |
| `ADMIN` | Static label showing their assigned unit name — no switching capability                                                                                       |
| `USER`  | Static label showing their unit name — no switching capability                                                                                                |

#### Responsive Behavior

| Breakpoint              | Behavior                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (≥ 1024px)      | **Expanded mode** (240px): full icon + text label navigation; togglable to **Collapsed mode** (64px): icon-only with Radix `Tooltip` on hover |
| Tablet (768px – 1023px) | Collapsed icon-only mode by default                                                                                                           |
| Mobile (< 768px)        | Hidden by default; triggered by a hamburger menu button in the top header; renders as a **slide-out Sheet** (shadcn/ui `Sheet` component)     |

The collapsed/expanded state is persisted in a **Jotai atom** and synced to `localStorage`.

#### Visual Branding

| Element             | Specification                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Company Logo        | Displayed at the top of the sidebar, loaded from `Company.logo` (Uploadthing URL); falls back to company initials in an indigo avatar                                                          |
| Icons               | Lucide React icons for all navigation items — consistent stroke weight and size (`18px`)                                                                                                       |
| Active State        | Indigo left-border accent (`border-l-2 border-indigo-500`) + soft indigo background tint (`bg-indigo-500/10`) on the active route                                                              |
| User Profile Footer | Fixed at the bottom of the sidebar — shows user avatar, full name, role badge with contextual icon (Crown for OWNER, Shield for ADMIN, User for USER); clicking opens a dropdown with Sign Out |

#### Glassmorphism Aesthetic

The sidebar uses a **premium translucent visual style**:

| Property        | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Background      | `rgba(10, 10, 15, 0.7)` — semi-transparent near-black                   |
| Backdrop blur   | `backdrop-blur-xl`                                                      |
| Border          | `border-r border-white/5` — ultra-subtle right separator                |
| Gradient accent | Subtle vertical indigo gradient on the active item indicator            |
| Transition      | `transition-all duration-200 ease-in-out` for expand/collapse animation |

---

### 12.3 Sidebar Requirements

| ID    | Requirement                                                                                               | Priority    |
| ----- | --------------------------------------------------------------------------------------------------------- | ----------- |
| SB-01 | Sidebar menu items and structure must change based on the current URL domain (company vs. unite vs. user) | Must Have   |
| SB-02 | Context Switcher must be visible to OWNER on all views; hidden or static for ADMIN and USER               | Must Have   |
| SB-03 | Active route must be visually highlighted with indigo left-border and background tint                     | Must Have   |
| SB-04 | Collapsed/expanded state must persist via Jotai atom synced to localStorage                               | Must Have   |
| SB-05 | On mobile, sidebar must render as a shadcn/ui Sheet triggered by a header hamburger button                | Must Have   |
| SB-06 | Company logo renders from Uploadthing URL; falls back to initials avatar if not set                       | Must Have   |
| SB-07 | User profile section at the bottom must show avatar, name, and a role-specific icon                       | Must Have   |
| SB-08 | Collapsed mode must show Radix Tooltip on icon hover with the menu item label                             | Must Have   |
| SB-09 | Sidebar must apply glassmorphism styling: semi-transparent background + `backdrop-blur-xl`                | Must Have   |
| SB-10 | All Lucide icons must use consistent size (18px) and stroke width (1.5)                                   | Should Have |

---

## 13. Tech Stack

### Frontend

| Technology    | Version | Purpose                                                                                                                             |
| ------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Next.js       | 16.x    | App Router, Turbopack, Server Actions, Server Components, **`use cache` directive**, `cacheTag()`, `cacheLife()`, `revalidateTag()` |
| React         | 19.x    | UI rendering, concurrent features                                                                                                   |
| Tailwind CSS  | 4.x     | Utility-first styling                                                                                                               |
| shadcn/ui     | Latest  | Radix UI-based component primitives                                                                                                 |
| Framer Motion | Latest  | Page transitions, micro-animations                                                                                                  |
| Jotai         | Latest  | Lightweight client-side state (theme, UI state)                                                                                     |
| @dnd-kit/core | Latest  | Drag-and-drop for Kanban and Gantt reordering                                                                                       |

### Backend & Infrastructure

| Technology            | Purpose                                                     |
| --------------------- | ----------------------------------------------------------- |
| Prisma (v7.2+)        | Type-safe ORM; all queries in `src/lib/queries.ts`          |
| PostgreSQL (Supabase) | Hosted relational database with Realtime support            |
| Clerk                 | Authentication, session management, invitation emails, RBAC |
| Uploadthing           | File and asset uploads (logos, project documents)           |

### Code Architecture

```
src/
├── app/                      # Next.js App Router pages & layouts
├── components/
│   ├── global/               # Navbar, Sidebar, Modals, Sheets, ThemeToggle
│   ├── forms/                # ProjectForm, TaskForm, PhaseForm, ClientForm, etc.
│   ├── dashboard/            # Page-specific components
│   └── ui/                   # shadcn/ui re-exports and primitives
├── lib/
│   ├── queries.ts            # ALL server actions and database queries (single source of truth)
│   ├── types.ts              # ALL TypeScript interfaces, types, and enums
│   ├── utils.ts              # formatAmount(), formatDate(), cn(), calcProgress()
│   └── cache.ts              # ALL cacheTag() constants and cacheLife() profiles (single source of truth)
├── hooks/                    # Custom React hooks (useTimer, useNotifications, etc.)
└── store/                    # Jotai atoms (theme, sidebar state, active unit, etc.)
```

---

## 14. Next.js 16 Caching Strategy

PMA leverages the **Next.js 16 `use cache` directive** system wherever data is stable enough to benefit from caching. This replaces the old `fetch`-level caching model with a more granular, function-level approach using `cacheTag()` and `cacheLife()` for fine-grained invalidation and TTL control.

All cache tags and profiles are defined as constants in `src/lib/cache.ts` — the single source of truth for cache configuration across the app.

---

### 14.1 Caching Primitives Used

| Primitive               | Purpose                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `'use cache'` directive | Marks a Server Component or async function as cacheable                            |
| `cacheTag(tag)`         | Associates a cache entry with one or more named tags for targeted invalidation     |
| `cacheLife(profile)`    | Sets the TTL (stale / revalidate / expire) using named profiles                    |
| `revalidateTag(tag)`    | Called inside Server Actions after mutations to purge specific cache entries       |
| `unstable_noStore()`    | Opts a component fully out of caching (used for real-time data like notifications) |

---

### 14.2 Cache Life Profiles (`src/lib/cache.ts`)

Named profiles define how long data stays fresh, how long stale data is served while revalidating, and the absolute expiry. These map to Next.js 16 `cacheLife()` built-in profiles plus custom ones:

| Profile Name         | Stale  | Revalidate | Expire | Used For                                      |
| -------------------- | ------ | ---------- | ------ | --------------------------------------------- |
| `"static"`           | ∞      | ∞          | ∞      | Plan definitions — never change at runtime    |
| `"days"`             | 1 day  | 1 day      | 7 days | Company profile, Unit profile                 |
| `"hours"`            | 1 hour | 1 hour     | 1 day  | Project list, Client list, Team members       |
| `"minutes"`          | 1 min  | 1 min      | 5 min  | Project detail, Phase list, Production charts |
| `"seconds"` (custom) | 30 sec | 30 sec     | 2 min  | Kanban lanes & tasks (high interactivity)     |
| `noStore`            | —      | —          | —      | Notifications, Activity logs (always fresh)   |

---

### 14.3 Cache Tag Taxonomy (`src/lib/cache.ts`)

All tags follow a hierarchical naming convention: `domain:scope:id`.

```typescript
// src/lib/cache.ts

// ── Plans (static — never invalidated at runtime)
export const PLANS_TAG = "plans";

// ── Company scope
export const companyTag = (id: string) => `company:${id}`;
export const companyTeamTag = (id: string) => `company:${id}:team`;

// ── Subscription scope
export const subscriptionTag = (companyId: string) =>
  `subscription:${companyId}`;

// ── Unit scope
export const unitTag = (id: string) => `unit:${id}`;
export const unitMembersTag = (id: string) => `unit:${id}:members`;
export const unitProjectsTag = (id: string) => `unit:${id}:projects`;
export const unitClientsTag = (id: string) => `unit:${id}:clients`;
export const unitLanesTag = (id: string) => `unit:${id}:lanes`;
export const unitTasksTag = (id: string) => `unit:${id}:tasks`;
export const unitTagsTag = (id: string) => `unit:${id}:tags`;
export const unitProductionsTag = (id: string) => `unit:${id}:productions`;

// ── Project scope
export const projectTag = (id: string) => `project:${id}`;
export const projectPhasesTag = (id: string) => `project:${id}:phases`;
export const projectGanttTag = (id: string) => `project:${id}:gantt`;
export const projectTeamTag = (id: string) => `project:${id}:team`;
export const projectTimeTag = (id: string) => `project:${id}:time`;

// ── Phase scope
export const phaseTag = (id: string) => `phase:${id}`;
export const phaseProductionTag = (id: string) => `phase:${id}:production`;

// ── User scope
export const userTag = (id: string) => `user:${id}`;
export const userTasksTag = (id: string) => `user:${id}:tasks`;
export const userProjectsTag = (id: string) => `user:${id}:projects`;
export const userAnalyticsTag = (id: string) => `user:${id}:analytics`;
```

---

### 14.4 Caching Decision Map — By Page & Data Type

#### Public & Auth

| Component / Function    | Cache Strategy                        | Tags | Rationale                       |
| ----------------------- | ------------------------------------- | ---- | ------------------------------- |
| Landing page (`/site`)  | `"use cache"` + `cacheLife("static")` | —    | Fully static marketing content  |
| Sign-in / Sign-up pages | No cache                              | —    | Auth state must always be fresh |

#### Company Domain

| Component / Function | Cache Strategy                        | Tags                                | Rationale                                        |
| -------------------- | ------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| `getCompanyById()`   | `"use cache"` + `cacheLife("days")`   | `companyTag(id)`                    | Company profile rarely changes                   |
| `getCompanyKPIs()`   | `"use cache"` + `cacheLife("hours")`  | `companyTag(id)`, `unitTag(unitId)` | Aggregated metrics — acceptable 1-hour staleness |
| `getAllUnits()`      | `"use cache"` + `cacheLife("hours")`  | `companyTag(id)`                    | Unit list changes only on create/delete          |
| `getCompanyTeam()`   | `"use cache"` + `cacheLife("hours")`  | `companyTeamTag(id)`                | Member list changes on invite/remove             |
| `getSubscription()`  | `"use cache"` + `cacheLife("hours")`  | `subscriptionTag(companyId)`        | Plan rarely changes mid-session                  |
| `getPlans()`         | `"use cache"` + `cacheLife("static")` | `PLANS_TAG`                         | Plan definitions are immutable at runtime        |

#### Unit Domain

| Component / Function   | Cache Strategy                         | Tags                     | Rationale                                   |
| ---------------------- | -------------------------------------- | ------------------------ | ------------------------------------------- |
| `getUnitById()`        | `"use cache"` + `cacheLife("days")`    | `unitTag(id)`            | Unit profile changes rarely                 |
| `getUnitMembers()`     | `"use cache"` + `cacheLife("hours")`   | `unitMembersTag(id)`     | Member list is stable between invites       |
| `getUnitProjects()`    | `"use cache"` + `cacheLife("hours")`   | `unitProjectsTag(id)`    | Project list changes only on create/archive |
| `getUnitClients()`     | `"use cache"` + `cacheLife("hours")`   | `unitClientsTag(id)`     | Client list is relatively stable            |
| `getUnitLanes()`       | `"use cache"` + `cacheLife("seconds")` | `unitLanesTag(id)`       | Lanes change on reorder/add/delete          |
| `getUnitTasks()`       | `"use cache"` + `cacheLife("seconds")` | `unitTasksTag(id)`       | Tasks change frequently (drag, complete)    |
| `getUnitTags()`        | `"use cache"` + `cacheLife("hours")`   | `unitTagsTag(id)`        | Tags rarely change                          |
| `getUnitProductions()` | `"use cache"` + `cacheLife("minutes")` | `unitProductionsTag(id)` | Production data updated by ADMIN            |

#### Project Domain

| Component / Function   | Cache Strategy                         | Tags                     | Rationale                                  |
| ---------------------- | -------------------------------------- | ------------------------ | ------------------------------------------ |
| `getProjectById()`     | `"use cache"` + `cacheLife("minutes")` | `projectTag(id)`         | Status/financials may change during work   |
| `getProjectPhases()`   | `"use cache"` + `cacheLife("minutes")` | `projectPhasesTag(id)`   | Phases change on edit/progress update      |
| `getGanttData()`       | `"use cache"` + `cacheLife("minutes")` | `projectGanttTag(id)`    | Gantt renders phases + subphases + markers |
| `getProjectTeam()`     | `"use cache"` + `cacheLife("hours")`   | `projectTeamTag(id)`     | Team changes only on add/remove member     |
| `getTimeEntries()`     | `"use cache"` + `cacheLife("minutes")` | `projectTimeTag(id)`     | Time entries logged frequently             |
| `getPhaseProduction()` | `"use cache"` + `cacheLife("minutes")` | `phaseProductionTag(id)` | Production data added by ADMIN             |

#### User Domain

| Component / Function | Cache Strategy                         | Tags                   | Rationale                          |
| -------------------- | -------------------------------------- | ---------------------- | ---------------------------------- |
| `getUserById()`      | `"use cache"` + `cacheLife("days")`    | `userTag(id)`          | Profile changes rarely             |
| `getUserTasks()`     | `"use cache"` + `cacheLife("seconds")` | `userTasksTag(id)`     | Tasks update frequently            |
| `getUserProjects()`  | `"use cache"` + `cacheLife("hours")`   | `userProjectsTag(id)`  | Project membership changes rarely  |
| `getUserAnalytics()` | `"use cache"` + `cacheLife("minutes")` | `userAnalyticsTag(id)` | Metrics computed from time entries |

#### Never Cached (Always Fresh)

| Component / Function    | Strategy             | Rationale                                     |
| ----------------------- | -------------------- | --------------------------------------------- |
| `getNotifications()`    | `unstable_noStore()` | Must always reflect real-time unread state    |
| `getActivityLogs()`     | `unstable_noStore()` | Audit trail must be exactly current           |
| `getUnreadCount()`      | `unstable_noStore()` | Bell badge must be accurate                   |
| `getInvitationStatus()` | `unstable_noStore()` | Invitation state changes externally via Clerk |

---

### 14.5 Cache Invalidation — Server Actions

Every mutation in `queries.ts` calls `revalidateTag()` immediately after a successful DB write. The tags invalidated are always the **minimum set** required — never broad invalidations.

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

### 14.6 Caching Requirements

| ID       | Requirement                                                                                                                    | Priority  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | --------- |
| CACHE-01 | All cacheable data-fetching functions in `queries.ts` must use the `'use cache'` directive                                     | Must Have |
| CACHE-02 | All cache tags must be defined as typed constants in `src/lib/cache.ts` — no inline string literals in queries                 | Must Have |
| CACHE-03 | Every Server Action mutation must call `revalidateTag()` for the minimum set of affected tags                                  | Must Have |
| CACHE-04 | Notification count, activity logs, and invitation status must use `unstable_noStore()` — never cached                          | Must Have |
| CACHE-05 | `cacheLife("static")` applied to `getPlans()` — Plan data never changes at runtime                                             | Must Have |
| CACHE-06 | Kanban lanes and tasks use `cacheLife("seconds")` — short TTL to minimize lag after mutations                                  | Must Have |
| CACHE-07 | Cache tags must be scoped to the entity ID (e.g. `unit:${unitId}:tasks`) — never global broad tags                             | Must Have |
| CACHE-08 | The `use cache` directive must only appear in Server Components and async server functions — never in Client Components        | Must Have |
| CACHE-09 | When a phase's progress is updated, `projectTag(projectId)` must also be invalidated to refresh the aggregate project progress | Must Have |
| CACHE-10 | When a subscription is activated by the operator, `subscriptionTag(companyId)` is invalidated immediately                      | Must Have |

---

## 15. Out of Scope

The following features are explicitly **not** included in v1.0 and deferred to future iterations:

| Feature                                           | Reason Deferred                                               |
| ------------------------------------------------- | ------------------------------------------------------------- |
| Mobile native app (iOS / Android)                 | Desktop-first; mobile web is sufficient for v1                |
| Real-time collaborative editing (live cursors)    | Complexity; polling/Supabase Realtime sufficient              |
| Gantt task dependency arrows (FS, SS, FF, SF)     | `TaskDependencyType` enum is defined in schema for future use |
| Advanced reporting & PDF export                   | Phase 2 feature                                               |
| Two-factor authentication (2FA)                   | Delegated to Clerk's own settings                             |
| Custom domain / white-labeling                    | Enterprise tier only, post-launch                             |
| Offline mode / PWA                                | Out of scope for v1                                           |
| External calendar sync (Google Calendar, Outlook) | Phase 2                                                       |
| Public project share links                        | Phase 2                                                       |

---

## 16. Open Questions

| #     | Question                                                                                                                                                                                                                                                               | Owner       | Status      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------- |
| OQ-01 | Should the `delai` field on Project be a free-text string or a structured duration (e.g. number of months)?                                                                                                                                                            | Product     | Open        |
| OQ-02 | What is the exact TVA percentage to use as default in Algeria (currently 19%)?                                                                                                                                                                                         | Business    | Open        |
| OQ-03 | Should `Lane` be Project-scoped instead of Unit-scoped to allow per-project Kanban configurations?                                                                                                                                                                     | Engineering | Open        |
| OQ-04 | ~~What payment gateway will be used?~~ **Resolved:** No payment gateway. All billing is offline (virement bancaire, chèque, contrat). Subscription activated manually by pma operator after payment confirmation. Starter plan is a 2-month auto-activated free trial. | Business    | ✅ Resolved |
| OQ-09 | Should the proforma invoice PDF be auto-generated from DB data or manually uploaded by the pma operator?                                                                                                                                                               | Engineering | Open        |
| OQ-10 | Should the "Request Upgrade" form send an email via a transactional email service (Resend / Nodemailer) or post to a Slack/webhook channel for the operator?                                                                                                           | Engineering | Open        |
| OQ-05 | Should USER be able to create time entries on projects they are not assigned to?                                                                                                                                                                                       | Product     | Open        |
| OQ-06 | Is the 80% production variance alert threshold configurable per-unit or per-company?                                                                                                                                                                                   | Product     | Open        |
| OQ-07 | What happens to a User's data (tasks, time entries) if they are removed from a unit — delete or retain?                                                                                                                                                                | Engineering | Open        |
| OQ-08 | Should Clients be Company-scoped (shared across units) or Unit-scoped (isolated per unit)? Current schema is Unit-scoped.                                                                                                                                              | Product     | Open        |

---

## 17. Glossary

| Term                             | Definition                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------- |
| **HT (Hors Taxe)**               | Pre-tax amount (excluding VAT)                                                |
| **TTC (Toutes Taxes Comprises)** | Total amount including all taxes                                              |
| **TVA**                          | Taxe sur la Valeur Ajoutée — the applicable VAT in Algeria                    |
| **ODS**                          | Ordre de Service — the official project start order date                      |
| **Délai**                        | The contractual deadline or duration for a project                            |
| **Taux**                         | Production rate, expressed as a percentage (0–100%)                           |
| **montantProd**                  | Produced monetary amount = Phase.montantHT × (taux / 100)                     |
| **Phase**                        | A major deliverable block within a project with its own budget and timeline   |
| **SubPhase**                     | A granular sub-task within a Phase                                            |
| **GanttMarker**                  | A vertical milestone line on the Gantt chart with a label and date            |
| **Product**                      | The planned production baseline for a Phase (one per phase)                   |
| **Production**                   | An individual actual production record logged against a Product               |
| **Lane**                         | A Kanban board column (e.g. "To Do", "In Progress")                           |
| **TeamMember**                   | A junction record linking a User to a Project's Team with a role label        |
| **Multi-Tenant**                 | Architecture where one app instance serves multiple isolated companies        |
| **RBAC**                         | Role-Based Access Control — permissions are tied to a user's Role             |
| **Onboarding**                   | The first-run wizard that creates the Company, first Unit, and sets the OWNER |

---

_End of Document — PMA PRD v1.0.0_
