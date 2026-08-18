# The Animals — Client Intelligence Boards

## What this is
A multi-tenant client intelligence dashboard for The Animals agency. Each client
gets a board — four tabs (Live, Anomalies, Competition, In the Wild) — published
at its own subdomain behind its own logins, all managed from a small admin CMS.

**All code lives in `v2/`.** The original vanilla-JS prototype that used to sit at
the repo root was retired and removed (see git history if ever needed).
`design-reference/` holds stills from the client's Figma walkthrough videos.

## Stack
- Next.js (App Router) + React + TypeScript strict + Tailwind v4, in `v2/`
- Supabase (Postgres) for boards/users/module content; service_role key
  server-side only; stateless HMAC session cookies
- Deployed on Vercel, project `the-animals`, **Root Directory = `v2`** —
  pushing to `main` auto-deploys

## Publishing model (the point of the product)
- Domain `theanimals.live` uses Vercel nameservers; `*.theanimals.live` is
  attached to the project with a wildcard cert — any subdomain works instantly.
- Creating a board in `/admin` (slug = subdomain) publishes it at
  `https://<slug>.theanimals.live` immediately. Client logins are minted in the
  same screen. No DNS, cert, or deploy steps per client — ever.
- Unknown subdomains fall back to the default board (`DEFAULT_BOARD_SLUG`).
- Admin entry: `https://on-view.theanimals.live/admin`.

## Route layout (v2/src/app)
- `(board)/` — the client-facing board (nav + brand bar chrome): `/`,
  `/anomalies`, `/competition`, `/in-the-wild`
- `admin/` — chrome-free CMS (boards list, per-board settings / module JSON /
  client logins)
- `login/` — chrome-free, shared by clients and admin (`?admin=1`)

## Conventions
- Secrets only in `v2/.env.local` (gitignored). `.env.example` = placeholders.
- Design assets in `v2/public/assets/` are exported from the client's Figma
  file — use real assets, don't hand-draw stand-ins.
- Figma keyframes/utilities gotcha: Tailwind v4 translate utilities compile to
  the native `translate` property; keyframes must animate `translate`/`scale`
  (not `transform`) or they stack and displace elements.
- Board data flows: server components read Supabase → `BoardDataProvider` →
  modules read via `useModuleData(key)`, falling back to fixtures in
  `v2/src/data/` when no CMS doc exists.

## Plugins
Use `/frontend-design` when building or reshaping UI; `/feature-dev` for
planning multi-file features.

## Running locally
```bash
cd v2 && npm run dev -- -p 3100
```

## Git
- Remote: https://github.com/adnanmalik008/the-animals.git (account
  `adnanmalik008` — if push 403s, `gh auth switch -u adnanmalik008`)
