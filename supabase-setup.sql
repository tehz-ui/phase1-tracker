-- Run this in the Supabase SQL editor

create table if not exists daily_logs (
  id   uuid default gen_random_uuid() primary key,
  date text unique not null,
  data jsonb
);

create table if not exists zozo_scans (
  id   uuid default gen_random_uuid() primary key,
  date text unique not null,
  data jsonb
);

alter table daily_logs disable row level security;
alter table zozo_scans disable row level security;
