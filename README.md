# ♻️ EcoAudit — Community Waste Logger

EcoAudit is a web app where community members log disposed waste (category +
weight). To keep the data trustworthy, **every entry is geo-verified**: the app
captures the user's real latitude/longitude from the browser at submission time.
There is **no manual location field** — this is the core anti-fraud mechanism.

A live dashboard shows all submitted logs (including their captured coordinates)
and aggregated totals such as **Total E-Waste Logged**.

## Features

- **Log a waste entry** — pick a category (Plastic, E-Waste, Organic, Paper,
  Glass, Metal) and enter a weight in kg.
- **Validated geolocation (anti-fraud)** — coordinates are captured via the
  browser's native Geolocation API on submit. If the user denies or location is
  unavailable, the entry is blocked. No manual location input exists.
- **Audit dashboard** — a feed of all logs fetched from the database, each card
  showing the captured coordinates (linked to Google Maps) and timestamp.
- **Live totaling** — grand total weight, a featured "Total E-Waste Logged"
  metric, entry count, and a per-category breakdown — all updated as logs come in.
- **Real persistence** — data is stored in a Supabase (Postgres) database.

## Tech stack

| Layer      | Choice                                  |
| ---------- | --------------------------------------- |
| Framework  | Next.js 14 (App Router, full-stack)     |
| Language   | TypeScript                              |
| Styling    | Tailwind CSS                            |
| Database   | Supabase (Postgres) via `@supabase/supabase-js` |
| Hosting    | Vercel                                  |

## Project structure

```
.
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Dashboard: form + stats + audit feed
│   ├── globals.css           # Tailwind directives
│   └── api/logs/route.ts     # GET (list) + POST (create) — server-side DB access & validation
├── components/
│   ├── WasteLogForm.tsx      # Form + geolocation capture + status states
│   ├── StatsSummary.tsx      # Live aggregated metrics
│   ├── LogList.tsx           # Responsive grid of log cards
│   ├── LogCard.tsx           # A single log card
│   └── CategoryBadge.tsx     # Colored category label
├── lib/
│   ├── supabase.ts           # Supabase client (anon key)
│   ├── types.ts              # Shared types & category list
│   └── aggregations.ts       # Pure totaling helpers
├── supabase/
│   └── schema.sql            # Table + Row Level Security policies
└── .env.local.example        # Required environment variables
```

## Running locally

### 1. Prerequisites

- Node.js 18.18+ (Node 22 recommended)
- A free [Supabase](https://supabase.com) account

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database (Supabase)

1. Go to [supabase.com](https://supabase.com) and **create a new project**
   (pick any name + database password; wait for it to finish provisioning).
2. In the project, open **SQL Editor → New query**.
3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql), paste it
   in, and click **Run**. This creates the `waste_logs` table and enables Row
   Level Security with public read/insert policies.
4. Open **Project Settings → API** and copy:
   - the **Project URL**
   - the **anon / public** API key (⚠️ *not* the `service_role` key)

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Why is the anon key safe to expose?** Access is controlled by the Row Level
> Security policies in `schema.sql`. The anon key can only read and insert logs —
> exactly what this public app needs. The `service_role` key is never used.

### 5. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>. When you submit a log, the browser will ask for
location permission — allow it. Geolocation works on `localhost` and over HTTPS.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com), **Add New → Project**, and import the
   repo.
3. In the project's **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel serves the app over HTTPS, which the Geolocation API requires
   in production.

## How the anti-fraud geolocation works

1. On submit, `WasteLogForm` calls `navigator.geolocation.getCurrentPosition()`.
2. The captured `latitude`/`longitude` are sent to `POST /api/logs`.
3. The API route validates the category, weight, and coordinate ranges before
   inserting; the database also enforces `CHECK` constraints.
4. If the user denies permission or location is unavailable, submission fails
   with a clear message — there is no way to type a location manually.
