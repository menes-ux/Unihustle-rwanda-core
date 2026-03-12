# UniHustle Rwanda

A student-focused freelance marketplace connecting ALU Rwanda students with local businesses and peers. Built as a BSc. Software Engineering Foundations project at the African Leadership University, January 2026 cohort.

---

## Overview

UniHustle Rwanda is a two-sided marketplace platform modeled after industry-standard freelance platforms. It enables ALU students to monetize their skills by offering services (gigs) to businesses and peers, while allowing businesses and individuals to post jobs and hire directly from the student talent pool.

Access is restricted to verified ALU student accounts (`@alustudent.com`) on the student side, ensuring a trusted and academically grounded community.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Inline styles |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma |
| Authentication | Supabase Auth |
| Fonts | Plus Jakarta Sans (Google Fonts) |

---

## Project Structure

```
unihustle/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── auth/
│   │   └── page.tsx              # Login and registration (role-based)
│   ├── marketplace/
│   │   └── page.tsx              # Public gig browse page
│   └── dashboard/
│       ├── student/
│       │   └── page.tsx          # Student seller dashboard
│       └── business/
│           └── page.tsx          # Business buyer dashboard
├── components/                   # Shared UI components (planned)
├── lib/
│   └── supabase.ts               # Supabase client configuration
├── prisma/
│   └── schema.prisma             # Database schema
└── public/
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase project with a PostgreSQL database

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/unihustle-rwanda.git
cd unihustle-rwanda
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_connection_string
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

Push the Prisma schema to your Supabase database:

```bash
npx prisma db push
npx prisma generate
```

---

## User Roles

The platform supports two distinct user roles, selected at registration.

**Student**
- Register with a verified `@alustudent.com` email address
- Create and manage service listings (gigs)
- Receive and fulfill orders from buyers
- Apply to business job postings
- Access the student seller dashboard

**Business**
- Register with a company work email
- Browse and book student gigs directly
- Post job listings and review applicants
- Manage active hires and release payments
- Access the business buyer dashboard

---

## Application Flow

```
Landing Page
    |
    ├── Marketplace (public, no login required)
    |       |
    |       └── Browse gigs, filter by category, price, rating, delivery time
    |
    └── Auth Page (Login / Register)
            |
            ├── Student Login  -->  Student Dashboard
            └── Business Login -->  Business Dashboard
```

---

## Design System

| Token | Value |
|---|---|
| Primary font | Plus Jakarta Sans |
| Background | `#F5F5F4` |
| Card background | `#FFFFFF` |
| Card border | `1px solid #E7E5E4` |
| Primary orange | `#F97316` |
| Dark orange | `#EA580C` |
| Near black | `#0C0A09` |
| Muted text | `#A8A29E` |

All UI components follow a flat, minimalist SaaS aesthetic. No gradients, no decorative elements. Orange is used exclusively for primary call-to-action buttons and active states.

---

## Current Development Status

| Page | Status | Notes |
|---|---|---|
| Landing page | Complete | Fully designed, static content |
| Auth page | Complete | Login and register flows, role toggle |
| Marketplace | Complete | Live filtering, sorting, search |
| Student dashboard | Complete | Orders table, gig management |
| Business dashboard | Complete | Hires table, job cards, browse panel |
| Supabase auth integration | Pending | Role-based redirect on login |
| Database schema | Pending | Prisma schema definition |
| API routes | Pending | Gigs, orders, jobs endpoints |
| Gig detail page | Pending | Full gig view with booking |
| Order / checkout flow | Pending | Booking confirmation screen |
| Create gig form | Pending | Student gig listing form |
| Post a job form | Pending | Business job posting form |

---

## Roadmap

**Phase 1 — UI (Complete)**
All core pages designed and implemented as static Next.js components with consistent design system and responsive layouts.

**Phase 2 — Authentication (In Progress)**
Supabase Auth integration, role-based registration, protected routes, and session management.

**Phase 3 — Database and API**
Prisma schema for users, gigs, orders, and jobs. Full CRUD API routes using Next.js App Router server actions or route handlers.

**Phase 4 — Transactions and Notifications**
Order lifecycle management, delivery confirmation, payment release, and in-app notification system.

---

## Academic Context

- Institution: African Leadership University, Rwanda
- Program: BSc. Software Engineering
- Course: Foundations Project
- Cohort: January 2026
- Team: Riptide (Group 4)

---

## License

This project is developed for academic purposes. All rights reserved by the project team and African Leadership University.