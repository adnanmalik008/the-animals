-- ============================================================
-- The Animals — CMS milestone M1.
--
-- One migration for the whole milestone, so this is run once.
-- Same access model as 0001_init.sql: the browser never talks to
-- Supabase, every read/write goes through Next.js server code on
-- the service_role key, and RLS is enabled with no policies so the
-- anon/authenticated Data API roles can reach nothing.
--
-- Everything the app does works *before* this runs. Until it does,
-- `module_defaults` is absent and PostgREST answers PGRST205, which
-- the read layer treats as "no shared defaults yet" and serves the
-- built-in fixtures; the team-login queries fail closed.
--
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================

-- ---------- (a) module_defaults: agency-wide content ----------
-- The read chain is: a board's own module_data row, then this,
-- then the fixture compiled into the app. Content that is the same
-- for every client (the In the Wild cams, the starting Anomalies
-- circles) is edited here once instead of once per board.
create table public.module_defaults (
  module_key text primary key check (char_length(module_key) between 1 and 60),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.module_defaults is
  'Agency-wide default content: a board with no document of its own reads these before falling back to the built-in fixtures.';

create trigger module_defaults_touch_updated_at
  before update on public.module_defaults
  for each row execute function public.touch_updated_at();

alter table public.module_defaults enable row level security;

-- ---------- (b) board-media: uploaded images ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('board-media', 'board-media', true, 4194304,
        array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
on conflict (id) do nothing;
-- service_role writes bypass RLS; public reads need no policy; no anon policies (matches 0001_init.sql:4-8)

-- ---------- (c) team logins: admins that belong to no board ----------
-- Admin rows minted in the UI today are scoped to a board and
-- cascade-delete with it. A team login belongs to the agency, so its
-- board_id is null and no board deletion can take it away.
alter table public.board_users alter column board_id drop not null;
alter table public.board_users add constraint board_users_admin_or_board
  check (board_id is not null or role = 'admin');
create unique index board_users_team_admin_username_key
  on public.board_users (lower(username)) where board_id is null;
