-- EcoAudit - database schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

-- 1. The table that stores every waste log entry.
create table if not exists waste_logs (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('Plastic', 'E-Waste', 'Organic', 'Paper', 'Glass', 'Metal')),
  weight_kg   numeric not null check (weight_kg > 0),
  latitude    double precision not null check (latitude between -90 and 90),
  longitude   double precision not null check (longitude between -180 and 180),
  created_at  timestamptz not null default now()
);

-- Index to keep the "newest first" dashboard query fast.
create index if not exists waste_logs_created_at_idx on waste_logs (created_at desc);

-- 2. Row Level Security.
-- With RLS on, the public "anon" key can ONLY do what the policies below allow.
-- This is why it is safe to ship the anon key to the browser.
alter table waste_logs enable row level security;

-- Anyone may read all logs (this is a public community audit feed).
drop policy if exists "public read" on waste_logs;
create policy "public read"
  on waste_logs
  for select
  using (true);

-- Anyone may insert a new log. The CHECK constraints above plus the API-route
-- validation guard against bad / fraudulent data.
drop policy if exists "public insert" on waste_logs;
create policy "public insert"
  on waste_logs
  for insert
  with check (true);
