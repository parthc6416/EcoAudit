# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

EcoAudit — a Next.js 14 (App Router) + TypeScript community waste logger. Users log waste (category + weight); the browser Geolocation API captures real coordinates at submit time as an anti-fraud measure. Data persists in Supabase (Postgres). See `README.md` for end-user setup.

## Commands

```bash
npm run dev      # local dev server at http://localhost:3000
npm run build    # production build (also runs type-check + lint)
npm start        # serve the production build
npm run lint     # eslint via next lint
```

There is no test suite. `npm run build` is the primary verification gate — it type-checks the whole project.

The app will not boot without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (`lib/supabase.ts` throws at import if missing). To build without a real project, pass placeholder values inline — `createClient` makes no network call at build time and `/api/logs` is `force-dynamic` so its handlers don't run during build:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-key" npx next build
```

## Architecture

**Data flow is one-directional through the API route — components never touch Supabase directly.** Even though the anon key is browser-safe, all DB reads/writes go through `app/api/logs/route.ts` (`GET` lists newest-first, `POST` validates then inserts). `lib/supabase.ts` is imported only by that route.

**Security model: anon key + RLS, never the service_role key.** `supabase/schema.sql` enables Row Level Security with public read/insert policies, which is what makes shipping the anon key safe. Don't introduce the service_role key. Validation is layered: client (`WasteLogForm`), API route (`route.ts`), and DB `CHECK` constraints (`schema.sql`) — keep the three in sync, especially the category list and coordinate/weight ranges.

**Single source of truth for categories: `lib/types.ts`.** `WASTE_CATEGORIES` drives the form dropdown, the API validation, and `CategoryBadge` styling. Adding a category means updating this constant, the `CategoryBadge` color map, and the `CHECK` constraint in `schema.sql`.

**The dashboard is a client component that owns refresh.** `app/page.tsx` fetches logs via `loadLogs` and passes it to `WasteLogForm` as `onLogged`; a successful submit re-fetches so stats and feed update live. Aggregated metrics are computed client-side from the fetched logs by the pure functions in `lib/aggregations.ts` (rendered in `StatsSummary`) — there is no aggregation query in the DB.

**Geolocation is the core feature, not a field.** `WasteLogForm` calls `getCurrentPosition()` on submit and runs an explicit status machine (`idle → locating → submitting → success`/`error`). There is deliberately no manual lat/lng input; if permission is denied the submit fails. Geolocation requires HTTPS in production (Vercel) and works on localhost.

## Conventions

- `@/*` path alias maps to the repo root (see `tsconfig.json`).
- Server code (API route, `lib/supabase.ts`) is plain modules; only `app/page.tsx` and `components/WasteLogForm.tsx` are `"use client"`.
- Styling is Tailwind only; the custom `eco` color scale lives in `tailwind.config.ts`.
