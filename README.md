# ELIVA SCHOOL

Premium, mobile-first marketing site for ELIVA SCHOOL, built with Next.js App Router, TypeScript and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Current scope

Phase 0 foundation, Phase 1 design system + homepage shell, and the initial Supabase database foundation. Supabase authentication and the admin dashboard are planned for later phases.

## Supabase setup

The project uses the existing ELIVA Supabase project through `.env.local` (ignored by Git). Copy `.env.example` when setting up a new machine and add the project URL plus publishable key.

Database migrations live in `supabase/migrations/` and have already been applied to the connected project. The schema includes categories, trainers, courses, course sessions, registrations and site settings with RLS enabled.
