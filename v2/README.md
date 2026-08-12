# The Animals — Intelligence Board (v2)

Four-tab client intelligence dashboard: **Live**, **Anomalies**, **Competition**, **In the Wild**, plus a lightweight CMS at **/admin**.

## Run locally

```bash
npm install
npm run dev
```

Without any environment variables the app runs in **fixture mode**: the built-in adidas demo board renders with all content from `src/data/*`, boards are not protected, and the admin panel is a read-only preview.

## Enable the CMS (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/migrations/0001_init.sql`.
3. Copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API). Server-only — the browser never talks to Supabase.
   - `SESSION_SECRET` — any long random string.
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — bootstrap login for the team.
4. Restart dev. Log in at `/login` with the admin credentials → `/admin`.

### What the CMS edits

- **Boards** — one per client; slug doubles as the subdomain label. Client name, brief date, scrolling brief question, progress %, displayed user name, password protection toggle.
- **Module content** — every dashboard module has a key (`newswire`, `social-pulse`, `wild-cams`, `channel-mix`, …) editable as a JSON document pre-filled from the fixture template. Components fall back to fixtures for any key that hasn't been saved, so partially-filled boards always render.
- **Client logins** — up to N username/password sets per board (3 to start). Clients see only their own board; the team admin login opens everything.

## Publishing per client

Deploy once to Vercel and point a wildcard domain (`*.yourdomain.com`) at it. The app reads the first host label as the board slug: `nike.yourdomain.com` serves the `nike` board. `localhost` and the bare domain serve `DEFAULT_BOARD_SLUG`.

Protected boards redirect to `/login`; a client session only unlocks its own board's subdomain.

## Later phase: live API feeds

`module_data` stores one JSON document per module per board. The future Semrush/Meta integration writes the same keys on a schedule — no schema or UI change needed.

## Architecture notes

- Next.js 16 App Router + TypeScript + Tailwind v4.
- All Supabase access is server-side with the service-role key; RLS is enabled on every table with **no** policies, so the public Data API exposes nothing.
- Sessions are stateless HMAC-signed cookies (`src/lib/server/session.ts`).
- Anomalies board state (circles/insights/ideas) currently persists per-browser in localStorage; matching tables already exist in the schema for the move to shared server state.
