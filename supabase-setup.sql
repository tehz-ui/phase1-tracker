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

create table if not exists whoop_tokens (
  id            uuid default gen_random_uuid() primary key,
  user_id       text default 'default' unique not null,
  access_token  text,
  refresh_token text,
  expires_at    timestamptz
);

alter table daily_logs disable row level security;
alter table zozo_scans disable row level security;
alter table whoop_tokens disable row level security;
