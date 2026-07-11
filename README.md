# Logbook — Weight & Measurement Tracker

A simple, private tracker for weight and body measurements (waist, hip, chest),
with trend charts and goal tracking. Built with Next.js (App Router),
Supabase (Postgres + Auth), and Recharts. Deploys to Vercel.

## What it does

- Email/password sign up & sign in (Supabase Auth, JWT-based sessions in cookies)
- Log entries: date, weight, waist, hip, chest, notes
- Line charts for each metric over time
- Summary cards: current weight, total change, distance to goal
- Set/edit a goal weight
- Delete entries
- Row-level security — each user can only ever see their own data

Intentionally simple: no units conversion, no reminders, no social features,
no advanced analytics. Just log, see the trend, repeat.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's created, open **SQL Editor** and run the contents of
   `supabase/schema.sql` (in this repo). This creates:
   - `profiles` table (display name + goal weight)
   - `entries` table (your measurements)
   - Row-level security policies so users only see their own rows
   - A trigger that auto-creates a `profiles` row on sign-up
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

By default, Supabase requires email confirmation before a session is issued.
For quick local testing you can turn this off under
**Authentication → Providers → Email → Confirm email** (toggle off), or just
confirm the email each time via the link Supabase sends.

## 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`. Create an
account, then start logging entries from `/dashboard`.

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, click **New Project** and import the repo.
3. Under **Environment Variables**, add the same two variables from
   `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel will detect Next.js automatically — no extra build config
   needed.
5. In Supabase, go to **Authentication → URL Configuration** and add your
   Vercel domain (e.g. `https://your-app.vercel.app`) to the
   **Site URL** / **Redirect URLs** so auth redirects work in production.

## Project structure

```
src/
  app/
    login/          Sign in page
    signup/         Sign up page
    dashboard/       Main app (server page + client component)
    layout.tsx        Fonts + global shell
    page.tsx           Redirects to /login or /dashboard
  components/         EntryForm, EntryTable, TrendChart, StatCards, GoalWeight
  lib/
    supabase/          Browser client, server client, middleware session refresh
    types.ts            Shared TypeScript types
  middleware.ts          Protects /dashboard, refreshes Supabase session
supabase/
  schema.sql             Run this once in the Supabase SQL editor
```

## Notes on data & privacy

All measurement data lives in your own Supabase project under your account.
Row-level security policies ensure only the signed-in user can read, insert,
update, or delete their own rows — there's no admin dashboard or shared data.
