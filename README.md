# UniHustle Rwanda

**A dual-interface freelance marketplace connecting ALU students with Kigali businesses.**

BSc. Software Engineering — Foundations Project | African Leadership University | January 2026  
Team Riptide — Group 4

---

## Live Demo

| Resource | Link |
|---|---|
| Live Application | `[https://unihustle-rwanda-core-ll86.vercel.app/]` |
| Demo Video | `[link to be added]` |
| GitHub Repository | https://github.com/menes-ux/Unihustle-rwanda-core |

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [AI Assistance](#ai-assistance)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Team](#team)
- [Acknowledgements](#acknowledgements)

---

## Overview

UniHustle Rwanda is a full-stack web platform built to solve a specific, measurable problem: university students in Rwanda — particularly at ALU — have no dedicated, trusted channel to find flexible freelance work, and local businesses have no affordable way to access verified student talent.

The platform operates as a two-sided marketplace. Students create service listings (gigs), and businesses browse, book, and manage orders through separate role-based dashboards. Every account is tied to a verified institutional email, which is what distinguishes UniHustle from global platforms like Fiverr where anyone can register.

---

## The Problem

Over 70% of Rwandan youth face difficulty entering the labor market after graduation (World Bank, 2022). Students specifically struggle with:

- No centralized platform for short-term, flexible work that fits academic schedules
- Dependence on informal networks and word-of-mouth for job opportunities
- Inability to compete on global platforms (Fiverr, Upwork) due to high competition, complex onboarding, and service fees of 10–20%
- No institutional verification, which reduces trust from employers

On the employer side, small and medium businesses in Kigali face:

- High cost of traditional agency hiring (typically 3x the actual freelancer rate)
- No easy way to find affordable, skilled, and flexible talent for short-term projects

---

## Our Solution

UniHustle addresses this by being:

**Localized** — restricted to verified `@alustudent.com` emails for students, with plans to expand to all Rwandan universities.

**Trust-first** — every student profile shows a verified badge, cohort year, GPA, and hustle score built from completed order history.

**Dual-interface** — students and businesses each have a dedicated dashboard with analytics, order management, and profile tools built specifically for their role.

**Zero-friction auth** — OTP-based authentication with no passwords. Enter your email, get a 6-digit code, and you are in.

---

## Features

### Student Side

| Feature | Description |
|---|---|
| OTP Authentication | Email-verified login restricted to `@alustudent.com` |
| Student Dashboard | Real-time stats — active orders, total earnings, completed jobs, GPA badge |
| Gig Management | Create, edit, and delete service listings with delivery time, revisions, and skill tags |
| Order Delivery | One-click delivery with automatic hustle score increment |
| Portfolio | Add GitHub, Figma, Behance, and live project links visible before first review |
| Reviews | Automatically populated after each completed order |
| Edit Profile | Update bio, major, cohort, year of study, GPA, and skills inline |
| Post-Gig Form | Full form with live preview showing how the gig will appear in the marketplace |

### Business Side

| Feature | Description |
|---|---|
| Business Dashboard | Active hires, total spent, unique students hired — all live from the DB |
| Analytics | Monthly spend vs agency estimate chart, university breakdown, top skills hired |
| ROI Calculator | Shows savings vs traditional agency rates (estimated at 3.1x student rate) |
| Active Hires Table | Real-time order status with Release Payment button |
| Marketplace Browse | Gig cards with direct booking flow from the business dashboard |

### Marketplace

| Feature | Description |
|---|---|
| Gig Listings | Filterable by category, university, price range, delivery time, and cohort access |
| Gig Detail Page | Full gig info, seller profile, reviews, and Book button for business users |
| Booking Flow | End-to-end: business clicks Book, order is created, student sees it immediately |
| Cohort Access | Gigs from expired cohorts are visible but read-only, preserving portfolio value |

### Authentication and Security

| Feature | Description |
|---|---|
| OTP Flow | 6-digit code generated, stored with 10-minute expiry, one-time use |
| Cookie Session | Native Next.js 15 `cookies()` — HttpOnly, SameSite: lax, 7-day maxAge |
| Route Protection | Middleware guards `/dashboards/*` and `/marketplace/*` — unauthenticated users redirect to `/login` |
| Role Separation | Business users cannot access student dashboard routes and vice versa |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│   Landing Page    Marketplace     Student Dashboard             │
│   Auth Page       Gig Detail      Business Dashboard            │
│   Post Gig Form                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / Cookie Session
┌────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS 15 APP ROUTER                        │
│                                                                 │
│   Server Components        Client Components                    │
│   (data fetching, auth)    (interactive buttons, modals)        │
│                                                                 │
│   Server Actions           API Route Handlers                   │
│   (deliver, edit profile,  (/api/auth/*, /api/gigs,             │
│    add portfolio item)      /api/orders, /api/orders/release)   │
│                                                                 │
│   Middleware               Cookie Session (lib/session.ts)      │
│   (route protection)       (HttpOnly, 7-day, SameSite: lax)    │
└────────────────────────────┬────────────────────────────────────┘
                             │ Prisma ORM
┌────────────────────────────▼────────────────────────────────────┐
│                   SUPABASE / POSTGRESQL                         │
│                                                                 │
│   User    Gig    Order    Review    PortfolioItem               │
│                                                                 │
│   Hosted on Supabase with pgBouncer for connection pooling      │
└─────────────────────────────────────────────────────────────────┘
```

**Data flow:** Browser makes an HTTP request → Next.js middleware checks the session cookie → Server Component reads the session and queries Prisma → Prisma queries PostgreSQL on Supabase → data is rendered server-side and returned as HTML → Client Components handle interactive state (modals, buttons).

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 15 (App Router), React 18, TypeScript | Server Components, routing, UI |
| Styling | Inline styles + CSS media queries via `<style>` tags | Design system, responsiveness |
| Backend | Next.js API Route Handlers, Server Actions | REST endpoints, DB mutations |
| ORM | Prisma | Type-safe database access, migrations |
| Database | PostgreSQL via Supabase | Primary data store |
| Auth | Native Next.js `cookies()` | HttpOnly session management |
| Charts | Recharts | Business dashboard analytics |
| Font | Plus Jakarta Sans | Typography |
| Package Manager | npm | Dependency management |
| Code Quality | ESLint | Static analysis |
| Version Control | Git / GitHub | Collaboration |

---

## Database Schema

The full schema lives at `prisma/schema.prisma`. Below is a summary of all models and their key fields.

### User

| Field | Type | Description |
|---|---|---|
| user_id | Int (PK) | Auto-increment primary key |
| email | String (unique) | Institutional email used as login identifier |
| full_name | String | Display name set on first dashboard load |
| role | Enum | student or business — controls which dashboard the user sees |
| is_verified | Boolean | Set to true after first successful OTP login |
| hustle_score | Int | Platform reputation score, increments on delivery |
| skills | String[] | Skill tags shown on the student profile card |
| bio | String? | Profile bio |
| major | String? | Academic major |
| cohort | String? | e.g. "Class of 2026" |
| year_of_study | String? | e.g. "Year 2" |
| gpa | Float? | Shown with colour-coded Dean's List badge |
| school | String | University — defaults to "ALU" |

### Gig

| Field | Type | Description |
|---|---|---|
| gig_id | Int (PK) | Auto-increment primary key |
| student_id | Int (FK) | References User |
| title | String | Gig title — must start with "I will..." |
| category | String | Development, Design, Writing, Marketing, etc. |
| price | Int | Starting price in RWF |
| status | Enum | active or paused — controls marketplace visibility |
| description | String? | Full gig description |
| delivery_days | Int | Default 3 |
| revisions | Int | Default 2 |
| tags | String[] | Skill tags for marketplace search |

### Order

| Field | Type | Description |
|---|---|---|
| order_id | Int (PK) | Auto-increment primary key |
| gig_id | Int (FK) | References Gig |
| buyer_id | Int (FK) | References User (business account) |
| status | Enum | pending / in_progress / completed / cancelled |
| deadline | DateTime? | Calculated from gig.delivery_days at booking time |
| created_at | DateTime | Auto-set on creation |
| updated_at | DateTime | Auto-updated on change |

### Review

| Field | Type | Description |
|---|---|---|
| review_id | Int (PK) | Auto-increment |
| order_id | Int (unique FK) | One review per order |
| student_id | Int (FK) | The student who received the review |
| reviewer_id | Int (FK) | The business that left the review |
| gig_id | Int (FK) | Which gig the review is about |
| rating | Int | 1 to 5 stars |
| comment | String | Written review |
| created_at | DateTime | Auto-set |

### PortfolioItem

| Field | Type | Description |
|---|---|---|
| portfolio_id | Int (PK) | Auto-increment |
| student_id | Int (FK) | References User |
| title | String | Project name |
| link | String | URL to GitHub, Figma, live site, or Behance |
| description | String? | Short project description |
| type | String | GitHub / Figma / Live / Behance |
| tags | String[] | Tech stack tags |

---

## AI Assistance

This project used AI tools at specific points in the development process — not as a replacement for the team's engineering work, but as a support layer for research, structure, and debugging.

### Google Gemini

Gemini was used early in the project during the **research and ideation phase**. The team used it to explore the problem space — asking questions about youth unemployment in Rwanda, understanding how platforms like Fiverr and Upwork are structured, and getting initial suggestions on what features a student-focused freelance marketplace might need. It helped us structure our literature review and frame the problem statement before any code was written.

### Claude (Anthropic)

Claude was used during **development** as a coding assistant — primarily for debugging tricky issues, understanding Next.js 15 App Router patterns (which are relatively new and sparsely documented), and getting suggestions on how to structure Prisma queries and Server Actions cleanly. A few of the more verbose sections of this README were drafted with Claude's help and then edited by the team.

### How we used AI responsibly

- All final code was written, understood, and reviewed by team members — we did not copy-paste AI-generated code without reading and adapting it.
- AI was never used to generate test results, fabricate research data, or write sections of the academic report without human review and editing.
- The core architecture decisions, database schema design, UI/UX choices, and feature scoping were all made by the team, with AI consulted as a sounding board rather than a decision-maker.

We treated AI tools the same way we treated documentation and Stack Overflow — useful references that speed up the work, but not a substitute for understanding what you are building.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Supabase project with a PostgreSQL database
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/menes-ux/Unihustle-rwanda-core.git
cd Unihustle-rwanda-core
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for the full list.

**4. Run database migrations**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**5. Seed the database with test data**

```bash
npx ts-node prisma/seed.ts
```

This creates 6 student accounts, 3 business accounts, 9 gigs across all categories, 4 orders in various statuses, and sample reviews.

**6. Start the development server**

```bash
npm run dev
```

The application will be running at `http://localhost:3000`.

### Test Accounts

After seeding, you can log in with the following accounts. Enter the email on the login page, then check the terminal — in development mode the OTP code is printed to the console instead of being sent by email.

| Role | Email | What you can test |
|---|---|---|
| Student | d.achibiri@alustudent.com | Full student dashboard, active orders, portfolio |
| Student | m.adisso@alustudent.com | Student dashboard with completed orders and reviews |
| Business | startupHub@example.com | Business dashboard with analytics and active hires |
| Business | kigaliCreative@example.com | Business dashboard with no orders — tests empty states |

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase / PostgreSQL
# The pooled connection URL for Prisma queries (via pgBouncer)
DATABASE_URL="postgresql://postgres.[your-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# The direct (non-pooled) connection URL for migrations
DIRECT_URL="postgresql://postgres.[your-project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# The public URL of your deployed application
# Used for links in any future email templates
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Where to find these values:** Go to your Supabase project → Settings → Database → Connection string. Copy the Transaction URL into `DATABASE_URL` and the Session URL into `DIRECT_URL`.

---

## Project Structure

```
unihustle-rwanda-core/
│
├── app/
│   ├── page.tsx                          # Landing page
│   ├── login/
│   │   └── page.tsx                      # OTP auth page
│   ├── marketplace/
│   │   ├── page.tsx                      # Gig browse + filters
│   │   └── gigs/
│   │       └── [id]/
│   │           ├── page.tsx              # Gig detail + booking CTA
│   │           └── BookingButton.tsx     # Client: creates order on click
│   ├── dashboards/
│   │   ├── student/
│   │   │   ├── page.tsx                  # Student dashboard (Server Component)
│   │   │   ├── actions.ts                # Server Actions: deliver, edit profile, portfolio
│   │   │   ├── DeliverButton.tsx         # Client: delivers order
│   │   │   ├── EditProfileButton.tsx     # Client: opens edit profile modal
│   │   │   ├── EditProfileModal.tsx      # Client: edit profile form
│   │   │   ├── AddProjectModal.tsx       # Client: add portfolio item
│   │   │   ├── PortfolioSection.tsx      # Client: portfolio grid + delete
│   │   │   ├── ReviewsSection.tsx        # Server: reviews from DB
│   │   │   └── post-gig/
│   │   │       └── page.tsx              # Post a Gig form (Client)
│   │   └── business/
│   │       ├── page.tsx                  # Business dashboard (Server Component)
│   │       └── ReleaseButton.tsx         # Client: releases payment
│   └── api/
│       ├── auth/
│       │   ├── request-code/route.ts     # POST: generate + store OTP
│       │   └── verify-code/route.ts      # POST: verify OTP + set session cookie
│       ├── gigs/
│       │   └── route.ts                  # GET: list active gigs | POST: create gig
│       └── orders/
│           ├── route.ts                  # POST: create order (booking)
│           └── release/
│               └── route.ts             # POST: business releases payment
│
├── lib/
│   ├── db.ts                             # Prisma client singleton
│   └── session.ts                        # createSession / getSession / clearSession
│
├── middleware.ts                          # Route protection + role-based redirect
│
├── prisma/
│   ├── schema.prisma                      # Full data model
│   ├── migrations/                        # Migration history
│   └── seed.ts                            # Test data seed script
│
└── public/                                # Static assets
```

---

## API Reference

All API routes are located under `app/api/`. Every protected route reads the session cookie and returns `401` if the user is not authenticated.

### POST /api/auth/request-code

Generates a 6-digit OTP and stores it with a 10-minute expiry. Creates the user record if this is their first login.

**Request body:**

```json
{
  "email": "d.achibiri@alustudent.com",
  "role": "student"
}
```

**Validation:** `email` and `role` are required. If `role` is `student`, the email must end with `@alustudent.com`.

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ "success": true }` | OTP generated and stored |
| 400 | `{ "error": "..." }` | Missing fields or invalid student email |
| 500 | `{ "error": "..." }` | Server error |

---

### POST /api/auth/verify-code

Validates the submitted OTP. On success, writes the session cookie and returns the user's role for client-side redirect.

**Request body:**

```json
{
  "email": "d.achibiri@alustudent.com",
  "code": "482910"
}
```

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ "role": "student" }` | Verified — session cookie set |
| 401 | `{ "error": "Incorrect code..." }` | Wrong OTP |
| 401 | `{ "error": "This code has expired..." }` | Expired OTP |
| 404 | `{ "error": "No account found..." }` | Email not in DB |

---

### GET /api/gigs

Returns all active gigs with seller information and active order count. Used by the marketplace page.

---

### POST /api/gigs

Creates a new gig. Requires an active student session.

**Request body:**

```json
{
  "title": "I will build a REST API with Node.js and Express",
  "category": "Development",
  "description": "Full API with authentication, CRUD, and documentation.",
  "price": 40000,
  "delivery_days": 5,
  "revisions": 2,
  "tags": ["Node.js", "Express", "API"]
}
```

| Status | Body | Meaning |
|---|---|---|
| 201 | `{ "gig_id": 12 }` | Gig created |
| 400 | `{ "error": "Missing required fields" }` | Incomplete body |
| 401 | `{ "error": "..." }` | Not authenticated |
| 403 | `{ "error": "..." }` | Not a student account |

---

### POST /api/orders

Creates a new order when a business books a gig. Calculates the deadline from `gig.delivery_days`. Requires an active business session.

**Request body:**

```json
{
  "gig_id": 7,
  "delivery_days": 5
}
```

| Status | Body | Meaning |
|---|---|---|
| 201 | `{ "order_id": 34 }` | Order created with status `pending` |
| 400 | `{ "error": "This gig is not currently available" }` | Gig is paused |
| 400 | `{ "error": "You cannot book your own gig" }` | Student tried to self-book |
| 403 | `{ "error": "Only business accounts can book gigs" }` | Wrong role |

---

### POST /api/orders/release

Marks an order as `completed` from the business side. Verifies buyer ownership before updating.

**Request body:**

```json
{ "order_id": 34 }
```

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ "success": true }` | Order marked completed |
| 404 | `{ "error": "Order not found or not owned by this account" }` | Ownership check failed |
| 401 | `{ "error": "Not authenticated" }` | No session |

---

### Server Actions

These are Next.js Server Actions called directly from Client Components. They live in `app/dashboards/student/actions.ts`.

| Action | Parameters | Effect |
|---|---|---|
| `deliverOrder` | `orderId`, `studentEmail` | Sets order to `completed`, increments `hustle_score` by 10, revalidates dashboard |
| `updateStudentProfile` | `studentEmail`, `data` | Updates bio, major, cohort, year, GPA, skills |
| `addPortfolioItem` | `studentEmail`, `data` | Creates a new PortfolioItem row |
| `deletePortfolioItem` | `portfolioId`, `studentEmail` | Deletes item after verifying ownership |
| `logout` | — | Clears session cookie, redirects to `/login` |

---

## Testing

The project was tested across four levels. Full tables are documented in Chapter 4 of the project report.

### Unit Tests

| Function | Input | Expected Output | Result |
|---|---|---|---|
| `toCategoryLabel()` | `"development"` | `"Development"` | Pass |
| `toCategoryLabel()` | Unknown string | Defaults to `"Data"` | Pass |
| `getAccessStatus()` | Cohort within 0 years | `"active"` | Pass |
| `getAccessStatus()` | Cohort >= 2 years | `"expired"` | Pass |
| `getGpaStyle()` | GPA 3.85 | Dean's List style object | Pass |
| `getInitials()` | `"David Achibiri"` | `"DA"` | Pass |
| `formatDeadline()` | Date 2 days ahead | `"Due in 2 days"` | Pass |

### Validation Tests

| Endpoint | Input | Expected | Result |
|---|---|---|---|
| `POST /api/auth/request-code` | Missing email/role | HTTP 400 | Pass |
| `POST /api/auth/request-code` | Student with non-ALU email | HTTP 400 | Pass |
| `POST /api/auth/verify-code` | Wrong OTP code | HTTP 401 | Pass |
| `POST /api/gigs` | Missing required fields | HTTP 400 | Pass |
| `POST /api/orders` | Buyer role is not business | HTTP 403 | Pass |
| `POST /api/orders` | Student booking own gig | HTTP 400 | Pass |

### Integration Tests

| Flow | Components Involved | Result |
|---|---|---|
| Full auth flow | Login page, request-code API, verify-code API, session cookie, dashboard redirect | Pass |
| Student posts gig | Post-gig form, gigs API, DB, student dashboard | Pass |
| Business books gig | Marketplace, gig detail, orders API, DB, student Active Orders | Pass |
| Student delivers order | DeliverButton, deliverOrder action, DB, hustle score increment | Pass |
| Business releases payment | ReleaseButton, release API, DB, order marked completed | Pass |

### Acceptance Tests

| User Story | Acceptance Criteria | Outcome |
|---|---|---|
| Log in as a student | Valid ALU email + OTP grants dashboard access | Accepted |
| Post a gig | Gig saved and visible in marketplace after submission | Accepted |
| Browse gigs as a student | Marketplace lists active gigs with filters | Accepted |
| Book a gig as a business | Order created with pending status, visible in student dashboard | Accepted |
| Deliver an order | Order status changes, hustle score increments by 10 | Accepted |
| Release payment | Order moves to completed from business side | Accepted |
| Role-based access | Student cannot access business dashboard and vice versa | Accepted |

---

## Team

| Name | Role | Email |
|---|---|---|
| Ménès Adisso | Project Manager, Frontend + Backend Overview | m.adisso@alustudent.com |
| Jean Nepo Munezero | Backend Lead | j.munezero1@alustudent.com |
| Gilbert Ntivunwa | Business Analyst | g.ntivunwa@alustudent.com |
| David Achibiri | Frontend Lead | d.achibiri@alustudent.com |
| Bonheur MUNEZERO | UI/UX Designer | b.munezero@alustudent.com |
| Manuelle Ackun | Database Architect | m.ackun@alustudent.com |

---

## Acknowledgements

- African Leadership University for the project brief and academic support
- The World Bank and ILO for the research data that grounded the problem statement
- Supabase for the hosted PostgreSQL infrastructure
- Vercel for Next.js and deployment tooling
- Recharts for the business dashboard analytics visualizations
- Plus Jakarta Sans (Google Fonts) for the typography
- Google Gemini for early-stage research support and problem framing
- Claude (Anthropic) for development assistance, debugging, and documentation drafting

---

## License

This project was developed as an academic submission for the BSc. Software Engineering Foundations Project at African Leadership University, January 2026. All code is original work by Team Riptide — Group 4.