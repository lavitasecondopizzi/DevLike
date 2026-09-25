create extension if not exists pgcrypto;

create table if not exists public.leaderboard_runs (
  id uuid primary key default gen_random_uuid(),
  score integer not null default 0 check (score >= 0),
  nickname text not null check (char_length(nickname) between 1 and 20),
  team jsonb not null default '[]'::jsonb,
  commessa integer not null check (commessa between 1 and 999999),
  tappa integer not null check (tappa between 0 and 6),
  causa_perdita text not null check (char_length(causa_perdita) between 1 and 80),
  difficolta numeric(4,2) not null check (difficolta between 0.1 and 99.9),
  mazzo jsonb not null default '[]'::jsonb,
  nuzlocke jsonb not null default '{"enabled":false,"rules":[]}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.leaderboard_runs add column if not exists score integer not null default 0;

create index if not exists leaderboard_runs_score_idx on public.leaderboard_runs (score desc);

create index if not exists leaderboard_runs_created_at_idx
  on public.leaderboard_runs (created_at desc);

alter table public.leaderboard_runs enable row level security;

drop policy if exists "leaderboard public read" on public.leaderboard_runs;
create policy "leaderboard public read"
  on public.leaderboard_runs for select
  to anon, authenticated
  using (true);

drop policy if exists "leaderboard public insert" on public.leaderboard_runs;
