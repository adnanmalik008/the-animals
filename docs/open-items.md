# Open items

Findings from the pre-merge review of the CMS branch (2026-09-07) that were
deliberately **not** fixed before merging. None blocks the product; the first
two are the ones with security weight.

The two criticals that review found — an unauthenticated RSC read of every
protected board, and the same for the whole admin — are **fixed and verified
live**; see commit `85d7874` and `tests/cms/route-guards.test.ts`.

## 1. Removing a login does not revoke access

`src/lib/server/session.ts`, `src/lib/server/guard.ts`

Sessions are stateless HMAC cookies valid for 7 days. `decodeSession` checks
the signature and `exp` and nothing else, and `requireAdmin` trusts
`session.role` without ever looking the row up again. Deleting a login is
therefore not revocation: a removed team admin keeps full admin access — edit
and save all global content, create and delete boards, mint logins, upload to
the public bucket — for up to a week, while the UI says they are gone.

Pre-existing, but the team-logins screen makes it easy to reach. Fix needs
either a session version/`jti` compared against the row, or a lookup in
`requireAdmin`. Until then, treat "Remove" as "stops future logins", and
rotate `SESSION_SECRET` to force everyone out immediately.

## 2. The SVG sniffer is too generous

`src/lib/server/media.ts`

`sniffImageMime` accepts any file whose first 1KB contains `<svg`, and the
`board-media` bucket is public. SVG is script-capable. It executes on the
Supabase storage origin rather than a board's, which limits the blast radius,
but the upload is admin-only for a reason and this widens what an admin can
publish. Consider dropping SVG from the whitelist, or sanitising.

## 3. Smaller ones

- **Client-side pre-validation skips `def.migrate`** (`ModuleForm.tsx`), so a
  legacy-shaped document the server would accept cannot be saved from the
  form. Unreachable while `module_content` is empty.
- **Presence3 loses its brand names** whenever the competitive set is not
  exactly three; the matrix is hard-coded to three columns.
- **The Anomalies "Topic circles" editor saves to a document no board reads** —
  the registry entry exists and is inert.
- **`rowSummary` titles a collapsed row by raw value**, so a list whose
  `summary` points at an `f.ref` shows the id (`patagonia`) rather than the
  competitor's name.
- **`module_data`** is unused and empty and should be dropped deliberately;
  **`ModuleStatus`** is produced on every board render but read only by tests.

## Never verified in a browser

`next dev` is broken on the current machine (a Windows Turbopack worker
panic — environmental, reproduces on a clean checkout), so the admin has only
ever been exercised through `next build && next start` and by hand. The image
picker, the generated forms and a real team login have not been clicked
through. Worth an hour when a working dev server exists.
