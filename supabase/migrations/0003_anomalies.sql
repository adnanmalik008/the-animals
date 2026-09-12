-- ============================================================
-- The Animals — the Anomalies board moves server-side.
--
-- 0001_init.sql created `circles`, `insights` and `ideas` as "the
-- landing spot when board state moves server-side for multi-user".
-- This is that move. The tables have stood empty until now: every
-- circle, card and fused idea lived in one browser's localStorage,
-- so a client's work never reached the agency, never followed them
-- to a second device, and went with the site data when it was
-- cleared.
--
-- Only `insights` needs new columns — the board grew fields the
-- 2024 shape did not have: the copy behind a headline, its byline,
-- and, for a card a Live-tab sticker filed, which sticker target
-- filed it and where on that target the sticker sits. Peeling a
-- sticker off the Live board is what removes the card, so that
-- link has to be stored, not inferred.
--
-- Same access model as 0001 and 0002: the browser never talks to
-- Supabase, every read and write goes through Next.js server code
-- on the service_role key, and RLS stays enabled with no policies.
--
-- Everything works *before* this runs. Until it does, the writes
-- answer PGRST204 ("column not found"), which the board reads as
-- "not backed yet" and falls back to the browser store it used to
-- keep — the same shape of graceful degradation 0002_cms.sql has
-- for content.
--
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================

-- ---------- (a) insights: the fields the board actually carries ----------
alter table public.insights
  -- the full post, quote or article copy behind the headline, shown on hover
  add column if not exists detail text,
  -- byline-ish context: author, handle, timing, engagement
  add column if not exists meta text,
  -- the Live-tab sticker target that filed this card ("news:nw-1"), and the
  -- placement of the sticker stuck on it: { shade, x, y }. Both null for a
  -- card typed on the Anomalies board.
  add column if not exists source_key text,
  add column if not exists sticker jsonb;

comment on column public.insights.source_key is
  'Live-tab sticker target that filed this card; peeling that sticker deletes the card.';

-- Peeling a sticker deletes by (board, source_key), so that pair is looked up
-- on every removal.
create index if not exists insights_board_source_idx
  on public.insights (board_id, source_key)
  where source_key is not null;

-- ---------- (b) circles: the seven built-ins, per board ----------
-- `insights.circle_id` references `circles`, and the seven built-in circles
-- are defined in the app rather than the database, so a board needs its own
-- rows before a card can be filed into one. The server upserts them on first
-- read or write (see src/lib/server/anomalies.ts), which also covers boards
-- created after this migration — nothing here has to backfill.
comment on column public.circles.built_in is
  'True for the seven circles the product ships; false for circles a board added. Clearing a board keeps the built-ins and drops the rest.';
