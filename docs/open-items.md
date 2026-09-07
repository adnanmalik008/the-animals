# Open items

Findings from the pre-merge review of the CMS branch (2026-09-07) that were
deliberately **not** fixed. None blocks the product; the first two are the ones
with security weight.

Re-checked against the code as it stands after the shadcn rebuild of the admin
(`243b00e`, `f735841`, `493b970`): **every item below is still true**, and the
wording has been sharpened where the re-read found more than the original note
said.

The two criticals that review found — an unauthenticated RSC read of every
protected board, and the same for the whole admin — are **fixed and verified
live**; see commit `85d7874` and `tests/cms/route-guards.test.ts`.

## 1. Removing a login does not revoke access

`src/lib/server/session.ts`, `src/lib/server/guard.ts`,
`src/app/api/admin/upload/route.ts`

Sessions are stateless HMAC cookies, minted at login with a fixed 7-day expiry
(`MAX_AGE_S`) and never refreshed. `decodeSession` verifies the signature,
rejects an expired `exp`, checks `role` is one of the two literals, and stops —
there is no database read. `requireAdmin` then trusts `session.role`, and
`requireBoardAccess` trusts `session.boardSlug` through `sessionAllowsBoard`.
Neither guard ever looks at `board_users` again.

So "Remove" means "stops future logins", not revocation — and it applies to
both kinds of login:

- a removed **team admin** keeps everything an admin session grants for up to a
  week: edit and save all global content, create and delete boards, mint
  logins, upload to the public bucket. `sessionAllowsBoard` returns `true` for
  any slug when `role === "admin"`, so that includes every protected client
  board as well.
- a removed **client** keeps their own board for the rest of their week; the
  only test is `session.boardSlug === board.slug`.

Deleting a whole board does mostly cut its clients off, but by accident of
routing rather than by revocation: the row is gone, `getCurrentBoard` falls back
to `DEFAULT_BOARD_SLUG`, and the stale slug stops matching. Two holes in that —
delete the *default* board and the fallback is `fixtureBoard()`, whose slug
**is** `DEFAULT_BOARD_SLUG`, so those sessions still match; and recreating a
board under a slug that existed before re-admits every session minted for the
old one, because only the slug is ever compared, never the board id. (Client
rows themselves cascade away with the board — `on delete cascade` in
`0001_init.sql`. Team rows have no `board_id` and survive, by design.)

A fix needs a session version or `jti` compared against the row. Note that
adding a lookup to `requireAdmin` alone is **not** enough: the upload route runs
its own `getSession()` + `role !== "admin"` check and never calls
`requireAdmin`, and `requireBoardAccess` needs the same treatment for clients.
Until then, treat "Remove" as "stops future logins", and rotate
`SESSION_SECRET` to force everyone out immediately.

## 2. The SVG sniffer is too generous

`src/lib/server/media.ts`

`sniffImageMime` accepts any file whose first 1KB matches `/<svg[\s>]/i`, and
the `board-media` bucket is public. SVG is script-capable. It executes on the
Supabase storage origin rather than a board's, which limits the blast radius,
but the upload is admin-only for a reason and this widens what an admin can
publish. Consider dropping SVG from the whitelist, or sanitising.

## 3. Smaller ones

- **Client-side pre-validation skips `def.migrate`** (`ModuleForm.tsx` parses
  with `schemaFor(def)`, while the server goes through `parseDoc`, which runs
  `migrate` first), so a legacy-shaped document the server would accept cannot
  be saved from the form. Unreachable while `module_content` is empty.
- **Presence3 loses its brand names** whenever the competitive set is not
  exactly three: `columns && columns.length === 3` or it falls back to
  "Column 1…3". The matrix is hard-coded to three columns.
- **The Anomalies "Topic circles" editor saves to a document no board reads** —
  the registry entry exists and nothing calls `useModuleDoc` for it.
- **`rowSummary` titles a collapsed row by raw value**, so a list whose
  `summary` points at an `f.ref` shows the id (`patagonia`) rather than the
  competitor's name.
- **`module_data`** (from `0001_init.sql`) is unused and empty and should be
  dropped deliberately; the per-module **`ModuleStatus`** map in
  `src/lib/cms/docs.ts` is built on every board render and nothing reads it.
  (The admin's own row status in `src/lib/server/docs.ts` is a different thing
  and is used.)

## What has now been exercised in a browser

The note that used to sit here — that `next dev` was broken on this machine and
so the admin had only ever been driven through `next build && next start` — is
out of date. `next dev` runs, and the whole CMS was driven against it with a
real admin session, with every write reverted afterwards and the database
fingerprinted before and after to prove it.

Verified live: admin login; the sidebar, breadcrumb and account menu (Log out by
mouse **and** by keyboard); creating a board and deleting it; board settings
saved and re-read after a reload, including the protection switch; client logins
minted, listed and removed; team logins minted, listed and removed; the content
index's counts, tab filter and search; a module document edited, saved, re-read
after a reload and reverted; the JSON panel; the leave guard refusing to let a
dirty form navigate away; image upload through `/api/admin/upload`, its preview
and its Clear; all three custom widgets (circles7, points12, presence3) writing
into the document; list rows added, duplicated with fresh ids, moved and
deleted; an invalid save blocked, announced, and the summary entry focusing the
field it names; and the Discard and Reset dialogs.

Still not exercised: signing in **as a client** and reading a real board;
confirming (rather than cancelling) Reset to template; the upload failure paths
(over 4 MB, or a MIME the bucket refuses); the sidebar's mobile sheet; and the
no-Supabase fixture board path.
