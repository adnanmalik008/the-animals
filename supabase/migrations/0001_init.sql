-- ============================================================
-- The Animals — multi-tenant board CMS, initial schema.
--
-- Access model: the browser NEVER talks to Supabase directly.
-- All reads/writes go through Next.js server code using the
-- service_role key (which bypasses RLS). RLS is still enabled
-- on every table with no policies, so the anon/authenticated
-- Data API roles can read nothing — defense in depth.
--
-- Run this in the Supabase SQL editor (or `supabase db push`)
-- when creating the project.
-- ============================================================

-- ---------- boards: one row per client board ----------
create table public.boards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$'),
  client_name text not null check (char_length(client_name) between 1 and 80),
  brief_date text not null default '' check (char_length(brief_date) <= 80),
  brief_question text not null default '' check (char_length(brief_question) <= 500),
  progress_pct int not null default 0 check (progress_pct between 0 and 100),
  user_display_name text not null default '' check (char_length(user_display_name) <= 80),
  is_protected boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.boards is
  'One intelligence board per client; slug doubles as the subdomain label.';

-- ---------- board_users: simple per-board credentials ----------
-- The brief asks for up to N username/password sets per board
-- (3 to start), not email-based auth — so this is a plain
-- credentials table checked server-side with bcrypt.
create table public.board_users (
  id bigint generated always as identity primary key,
  board_id uuid not null references public.boards (id) on delete cascade,
  username text not null check (char_length(username) between 2 and 40),
  password_hash text not null,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

create unique index board_users_board_username_key
  on public.board_users (board_id, lower(username));

create index board_users_board_id_idx on public.board_users (board_id);

comment on table public.board_users is
  'Per-board client logins (bcrypt hashes). Admin logins may also live here with role=admin and any board_id.';

-- ---------- module_data: all manually-entered board content ----------
-- One jsonb blob per module per board (newswire items, social posts,
-- wild cams, competitor sets, metric numbers, ...). A later phase can
-- swap manual entry for live API feeds by writing the same keys.
create table public.module_data (
  board_id uuid not null references public.boards (id) on delete cascade,
  module_key text not null check (char_length(module_key) between 1 and 60),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (board_id, module_key)
);

comment on table public.module_data is
  'Manual CMS content, one jsonb document per module per board; API-fed later without schema change.';

-- ---------- anomalies board state (server-synced phase) ----------
-- The current UI keeps this in localStorage; these tables are the
-- landing spot when board state moves server-side for multi-user.
create table public.circles (
  id text not null,
  board_id uuid not null references public.boards (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text not null check (color in ('orange','yellow','blue','green','red','purple')),
  icon text not null default 'none',
  size text not null default 'md' check (size in ('sm','md','lg')),
  built_in boolean not null default false,
  sort int not null default 0,
  primary key (board_id, id)
);

create table public.insights (
  id text not null,
  board_id uuid not null references public.boards (id) on delete cascade,
  circle_id text not null,
  headline text not null check (char_length(headline) between 1 and 300),
  source text,
  category text,
  category_color text,
  author text,
  created_at timestamptz not null default now(),
  primary key (board_id, id),
  foreign key (board_id, circle_id)
    references public.circles (board_id, id) on delete cascade
);

create index insights_board_circle_idx on public.insights (board_id, circle_id);

create table public.ideas (
  id text not null,
  board_id uuid not null references public.boards (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 1000),
  note text,
  item_ids jsonb not null default '[]'::jsonb,
  circle_ids jsonb not null default '[]'::jsonb,
  color_tag text,
  created_at timestamptz not null default now(),
  primary key (board_id, id)
);

create index ideas_board_idx on public.ideas (board_id);

-- ---------- updated_at maintenance ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger boards_touch_updated_at
  before update on public.boards
  for each row execute function public.touch_updated_at();

create trigger module_data_touch_updated_at
  before update on public.module_data
  for each row execute function public.touch_updated_at();

-- ---------- RLS: enabled everywhere, zero policies ----------
-- service_role bypasses RLS; anon/authenticated can do nothing.
alter table public.boards enable row level security;
alter table public.board_users enable row level security;
alter table public.module_data enable row level security;
alter table public.circles enable row level security;
alter table public.insights enable row level security;
alter table public.ideas enable row level security;
