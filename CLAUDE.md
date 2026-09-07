# The Animals — Client Intelligence Boards

## What this is
A multi-tenant client intelligence dashboard for The Animals agency. Each client
gets a board — four tabs (Live, Anomalies, Competition, In the Wild) — published
at its own subdomain behind its own logins, all managed from a small admin CMS.

**The repo root is the app.** It used to live one level down in `v2/`, beside a
vanilla-JS prototype that has since been retired and removed; the nesting went
with it, so `src/` and `package.json` now sit at the top (see git history for
either if ever needed). `design-reference/` holds stills from the client's
Figma walkthrough videos, and `docs/` the client correspondence.

## Stack
- Next.js (App Router) + React + TypeScript strict + Tailwind v4
- Supabase (Postgres) for boards/users/module content; service_role key
  server-side only; stateless HMAC session cookies
- Deployed on Vercel, project `the-animals`, **Root Directory = `.`** (the repo
  root — it was `v2` until the flattening) — pushing to `main` auto-deploys

## Publishing model (the point of the product)
- Domain `theanimals.live` uses Vercel nameservers; `*.theanimals.live` is
  attached to the project with a wildcard cert — any subdomain works instantly.
- Creating a board in `/admin` (slug = subdomain) publishes it at
  `https://<slug>.theanimals.live` immediately. Client logins are minted in the
  same screen. No DNS, cert, or deploy steps per client — ever.
- Unknown subdomains fall back to the default board (`DEFAULT_BOARD_SLUG`).
- Admin entry: `https://on-view.theanimals.live/admin`.

## Route layout (src/app)
- `(board)/` — the client-facing board (nav + brand bar chrome): `/`,
  `/anomalies`, `/competition`, `/in-the-wild`
- `admin/` — chrome-free CMS (boards list, per-board settings / module JSON /
  client logins)
- `login/` — chrome-free, shared by clients and admin (`?admin=1`)

## Conventions
- Secrets only in `.env.local` (gitignored). `.env.example` = placeholders.
- Design assets in `public/assets/` are exported from the client's Figma
  file — use real assets, don't hand-draw stand-ins.
- Figma keyframes/utilities gotcha: Tailwind v4 translate utilities compile to
  the native `translate` property; keyframes must animate `translate`/`scale`
  (not `transform`) or they stack and displace elements.
- The admin CMS is built from shadcn/ui (style `radix-nova`, config in
  `components.json`, components generated into `src/components/ui/` — add more
  with `npx shadcn@latest add <name>`, and don't hand-edit the generated
  files). Its semantic tokens (`--primary`, `--muted`, `--border` …) are
  mapped to the Figma palette in `globals.css`, so `bg-primary` is the brand
  orange. The client-facing board keeps its own classes (`bg-bg`,
  `text-graphite`, `paper-surface` …) and is not built from shadcn.
- Admin icons come from `lucide-react`; module glyphs are mapped by key in
  `src/components/admin/module-icons.tsx`.
- The CMS form engine keeps native `<details>` for list rows and collapsible
  groups: the error summary opens ancestor rows on its way to a buried field,
  which a Radix Collapsible could not be driven to do from outside.
- Board data flows: server components read Supabase through
  `src/lib/server/docs.ts` → `BoardDataProvider` → modules read
  `useModuleDoc(key)` from the typed board context. Documents are validated
  server-side against the module registry, and the built-in fixture in
  `src/data/` is substituted whenever a board's document is missing or no
  longer fits its module's shape.

## Plugins
Use `/frontend-design` when building or reshaping UI; `/feature-dev` for
planning multi-file features.

## Running locally
```bash
npm run dev -- -p 3100
```

## Git
- Remote: https://github.com/adnanmalik008/the-animals.git (account
  `adnanmalik008` — if push 403s, `gh auth switch -u adnanmalik008`)
