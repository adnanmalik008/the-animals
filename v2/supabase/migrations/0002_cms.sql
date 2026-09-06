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
-- `module_content` is absent and PostgREST answers PGRST205, which
-- the read layer treats as "nothing saved yet" and serves the
-- built-in fixtures; the team-login queries fail closed.
--
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================

-- ---------- (a) module_content: the content ----------
-- One set of content for the whole product: every board renders
-- these documents. The read chain is this table, then the fixture
-- compiled into the app. A board is an access gate with a name,
-- brief and logins of its own, not a content scope — the older
-- per-board module_data is left in place, empty and unread.
create table public.module_content (
  module_key text primary key check (char_length(module_key) between 1 and 60),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.module_content is
  'The one set of module content: every board reads these documents, falling back to the built-in fixtures for any module with no row.';

create trigger module_content_touch_updated_at
  before update on public.module_content
  for each row execute function public.touch_updated_at();

alter table public.module_content enable row level security;

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
-- The constraint is one-way: it stops a *client* row losing its board, but it
-- still permits a board-scoped row with role='admin' (board_id not null,
-- role='admin'). Nothing in the app creates one — addBoardUser inserts no
-- role, so Postgres defaults it to 'client' — but a hand-written row of that
-- shape would be invisible and unremovable in the CMS: the board screen lists
-- only role='client' rows and the team screen lists only board-less ones. Its
-- holder would keep admin access with no way to revoke it short of SQL. The
-- live table holds three logins and zero admin rows, so none exists today; if
-- one is ever created by hand, delete it by hand too.
alter table public.board_users add constraint board_users_admin_or_board
  check (board_id is not null or role = 'admin');
create unique index board_users_team_admin_username_key
  on public.board_users (lower(username)) where board_id is null;
