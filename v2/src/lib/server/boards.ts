import "server-only";
import { headers } from "next/headers";
import { compare, hash } from "bcryptjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabase";
import { boardMeta as fixtureMeta } from "@/data/board";
import type { BoardMeta } from "@/data/board";

/* ============================================================
   Board resolution + CMS reads/writes.
   Every function degrades gracefully when Supabase is not
   configured: the app serves the built-in adidas fixture board.
   ============================================================ */

export interface BoardRecord {
  id: string;
  slug: string;
  clientName: string;
  briefDate: string;
  briefQuestion: string;
  progressPct: number;
  userDisplayName: string;
  isProtected: boolean;
}

export interface BoardUserRecord {
  id: number;
  username: string;
  role: "client" | "admin";
  createdAt: string;
}

const DEFAULT_SLUG = process.env.DEFAULT_BOARD_SLUG || "adidas";

/** Fallback board, used when the CMS is unreachable or the slug has no row.
    Protected by default: a deleted board or a database hiccup must never
    publish a client's board to the open web. Set PUBLIC_DEMO_BOARD=1 for a
    deliberately public demo. */
export function fixtureBoard(): BoardRecord {
  return {
    id: "fixture",
    slug: DEFAULT_SLUG,
    clientName: fixtureMeta.clientName,
    briefDate: fixtureMeta.briefDate,
    briefQuestion: fixtureMeta.briefQuestion,
    progressPct: fixtureMeta.progressPct,
    userDisplayName: fixtureMeta.userName,
    isProtected: process.env.PUBLIC_DEMO_BOARD !== "1",
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any -- supabase rows are untyped here */
function rowToBoard(row: any): BoardRecord {
  return {
    id: row.id,
    slug: row.slug,
    clientName: row.client_name,
    briefDate: row.brief_date,
    briefQuestion: row.brief_question,
    progressPct: row.progress_pct,
    userDisplayName: row.user_display_name,
    isProtected: row.is_protected,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Board slug from the request host. Subdomain routing only kicks in
    under the explicit BOARD_ROOT_DOMAIN (e.g. "animalsboards.com" →
    nike.animalsboards.com serves the nike board). Every other host —
    localhost, *.vercel.app preview/prod URLs, bare domains — serves
    the default board. */
export async function resolveBoardSlug(): Promise<string> {
  const root = (process.env.BOARD_ROOT_DOMAIN ?? "").toLowerCase().replace(/^\.+/, "");
  if (!root) return DEFAULT_SLUG;
  const h = await headers();
  const host = (h.get("host") ?? "").split(":")[0].toLowerCase();
  if (!host.endsWith("." + root)) return DEFAULT_SLUG;
  const label = host.slice(0, -(root.length + 1));
  // exactly one label, and not www
  if (!label || label.includes(".") || label === "www") return DEFAULT_SLUG;
  return label;
}

export async function getBoardBySlug(slug: string): Promise<BoardRecord | null> {
  const db = supabaseAdmin();
  if (!db) return slug === DEFAULT_SLUG ? fixtureBoard() : null;
  const { data, error } = await db.from("boards").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return slug === DEFAULT_SLUG ? fixtureBoard() : null;
  return rowToBoard(data);
}

export async function getCurrentBoard(): Promise<BoardRecord> {
  const slug = await resolveBoardSlug();
  const board = await getBoardBySlug(slug);
  if (board) return board;
  // Unknown subdomain: fall back to the DEFAULT board from the DB (so
  // non-board hosts like on-view.* stay protected), then to fixtures.
  return (await getBoardBySlug(DEFAULT_SLUG)) ?? fixtureBoard();
}

export function boardToMeta(board: BoardRecord): BoardMeta {
  return {
    clientName: board.clientName,
    briefDate: board.briefDate,
    briefQuestion: board.briefQuestion,
    progressPct: board.progressPct,
    userName: board.userDisplayName,
  };
}

/* ---------------- module content ---------------- */

/* `getModuleData` and `setModuleData` lived here: per-board content, in
   `module_data`. Content is one set for the whole product now — a board is an
   access gate with a name of its own, not a content scope — so both are gone
   and `module_data` is left empty and unread. `./docs.ts` is the only reader,
   and it reads `module_content`. */

/** The one copy of one module, read by every board. Throws on a missing table
    exactly as it throws on any other write error: a read may shrug the
    unapplied migration off and serve fixtures, but a save that quietly went
    nowhere would be a lie. */
export async function setModuleContent(moduleKey: string, data: unknown) {
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  const { error } = await db
    .from("module_content")
    .upsert({ module_key: moduleKey, data }, { onConflict: "module_key" });
  if (error) throw new Error(error.message);
}

/* ---------------- boards admin ---------------- */

export async function listBoards(): Promise<BoardRecord[]> {
  const db = supabaseAdmin();
  if (!db) return [fixtureBoard()];
  const { data, error } = await db.from("boards").select("*").order("created_at");
  if (error || !data) return [];
  return data.map(rowToBoard);
}

export async function createBoard(input: {
  slug: string;
  clientName: string;
  briefDate?: string;
  briefQuestion?: string;
}): Promise<BoardRecord> {
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured.");
  const { data, error } = await db
    .from("boards")
    .insert({
      slug: input.slug,
      client_name: input.clientName,
      brief_date: input.briefDate ?? "",
      brief_question: input.briefQuestion ?? "",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToBoard(data);
}

export async function updateBoard(
  boardId: string,
  patch: Partial<Pick<BoardRecord, "clientName" | "briefDate" | "briefQuestion" | "progressPct" | "userDisplayName" | "isProtected">>
) {
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured.");
  const { error } = await db
    .from("boards")
    .update({
      ...(patch.clientName !== undefined && { client_name: patch.clientName }),
      ...(patch.briefDate !== undefined && { brief_date: patch.briefDate }),
      ...(patch.briefQuestion !== undefined && { brief_question: patch.briefQuestion }),
      ...(patch.progressPct !== undefined && { progress_pct: patch.progressPct }),
      ...(patch.userDisplayName !== undefined && { user_display_name: patch.userDisplayName }),
      ...(patch.isProtected !== undefined && { is_protected: patch.isProtected }),
    })
    .eq("id", boardId);
  if (error) throw new Error(error.message);
}

export async function deleteBoard(boardId: string) {
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured.");
  const { error } = await db.from("boards").delete().eq("id", boardId);
  if (error) throw new Error(error.message);
}

/* ---------------- credentials ---------------- */

export async function listBoardUsers(boardId: string): Promise<BoardUserRecord[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("board_users")
    .select("id,username,role,created_at")
    .eq("board_id", boardId)
    .order("created_at");
  if (error || !data) return [];
  return data.map((r) => ({ id: r.id, username: r.username, role: r.role, createdAt: r.created_at }));
}

export async function addBoardUser(boardId: string, username: string, password: string) {
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  const password_hash = await hash(password, 10);
  const { error } = await db.from("board_users").insert({ board_id: boardId, username, password_hash });
  if (error) throw new Error(error.message);
}

export async function removeBoardUser(userId: number) {
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured.");
  /* Board-scoped rows only. A team login has no board_id, so the board screen's
     Remove button cannot reach one even if an id from elsewhere were posted to
     it. Before 0002_cms.sql every row has a board_id, so this narrows nothing. */
  const { error } = await db
    .from("board_users")
    .delete()
    .eq("id", userId)
    .not("board_id", "is", null);
  if (error) throw new Error(error.message);
}

/* ---------------- team logins ----------------
   A team login is a board_users row with role='admin' and board_id null: it
   belongs to the agency rather than to a client, so deleting a board can never
   take someone's admin access with it.

   `board_id is null` only becomes storable once 0002_cms.sql is applied. Until
   then the column is NOT NULL, so the list below is legitimately empty and the
   insert is rejected by Postgres — and, crucially, `checkAdminLogin` finds
   nothing and answers no. Every failure in this section is a "no". */

/** Usernames are restricted here rather than in the database because they are
    fed to `ilike` on the way back in: no wildcard can enter the table in the
    first place. */
const TEAM_USERNAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,39}$/;

/** How many candidate rows a login lookup will consider. The exact match is
    made in JS afterwards; this only bounds the query. */
const TEAM_MATCH_LIMIT = 25;

/** Escape the LIKE metacharacters so `ilike` matches the username literally.

    The backslash goes first because it is the escape character: without it,
    the username `a\_b` would go out as the pattern `a\\_b`, which LIKE
    reads as a literal backslash followed by a live `_` wildcard — escaping
    the metacharacters while leaving the escape itself unescaped widens the
    match instead of narrowing it. One pass over the three characters does it;
    a second pass would double the first pass's own output.

    `*` is beyond reach: PostgREST rewrites a literal `*` in the value to `%`
    after any escaping we do. That is why TEAM_USERNAME_RE keeps `*` out of the
    table, and why both lookups re-check the name in JavaScript rather than
    trusting the pattern to have matched exactly. */
export function likeLiteral(value: string): string {
  return value.replace(/[\\%_]/g, (c) => "\\" + c);
}

/** A read of the team-login list: the rows to show, and whether the list is
    an answer at all. Split like `getContentRows` in `./docs.ts`, and for the
    same reason — "the database did not answer" and "nobody holds agency
    admin" are opposite facts, and this is the one screen where mistaking the
    first for the second would be read as a statement about who can get in. */
export interface AdminUsersRead {
  users: BoardUserRecord[];
  /** false when the read failed. The list is then empty because it could not
      be read, not because it is empty. */
  ok: boolean;
}

/** Supabase's `{ data, error }` from `board_users` → the team logins to
    show. Pure and exported so both branches are reachable without a live
    client — which is the only way to reach them at all while 0002_cms.sql
    is unapplied and no row can satisfy the query. */
export function adminUsersRead(result: TeamAdminQuery): AdminUsersRead {
  if (result.error) return { ok: false, users: [] };
  if (!Array.isArray(result.data)) return { ok: false, users: [] };

  const users: BoardUserRecord[] = [];
  for (const row of result.data) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    /* Re-checked in JS for the same reason `teamAdminHash` re-checks: a row
       that reaches this list is offered a Remove button, so the query filters
       are not the last word on whether it belongs here. An absent `board_id`
       key is not a board-less row — it is a row nothing has vouched for. */
    if (!("board_id" in r) || r.board_id !== null) continue;
    if (r.role !== "admin") continue;
    if (typeof r.username !== "string") continue;
    /* No id is no Remove button, so there is nothing to draw. `id` is a
       Postgres bigint: PostgREST sends it as a JSON number today, and a digit
       string is accepted too so a change there empties the *button*, never the
       whole list. Nothing else keys off it — `removeAdminUser` is scoped to
       board-less admin rows whatever id reaches it. */
    const id =
      typeof r.id === "number" && Number.isInteger(r.id)
        ? r.id
        : typeof r.id === "string" && /^\d+$/.test(r.id)
          ? Number(r.id)
          : null;
    if (id === null) continue;
    users.push({
      id,
      username: r.username,
      role: "admin",
      createdAt: typeof r.created_at === "string" ? r.created_at : "",
    });
  }
  return { ok: true, users };
}

export async function listAdminUsers(): Promise<AdminUsersRead> {
  const db = supabaseAdmin();
  /* An unconfigured CMS is not a failed read: there is nothing to list and the
     screen should say so plainly, as it does for content. */
  if (!db) return { ok: true, users: [] };
  const read = adminUsersRead(
    await db
      .from("board_users")
      .select("id,username,role,board_id,created_at")
      .is("board_id", null)
      .eq("role", "admin")
      .order("created_at")
  );
  if (!read.ok) console.warn("[cms] team logins: the list could not be read");
  return read;
}

export async function addAdminUser(username: string, password: string) {
  /* Validated before the client is looked up, so the rule that keeps wildcards
     out of the table holds whether or not Supabase is configured — and so it
     can be tested without one. */
  if (!TEAM_USERNAME_RE.test(username)) {
    throw new Error("Username must be 2–40 characters: letters, numbers, dot, dash or underscore.");
  }
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured.");
  const password_hash = await hash(password, 10);
  const { error } = await db
    .from("board_users")
    .insert({ board_id: null, username, role: "admin", password_hash });
  if (!error) return;
  /* 23502 = not-null violation on board_id: the migration has not been run.
     Say that plainly instead of showing a Postgres string, because it is the
     one failure an admin will actually hit today. */
  if (error.code === "23502" || /null value in column "board_id"/i.test(error.message ?? "")) {
    throw new Error(
      "Team logins need the pending database migration (supabase/migrations/0002_cms.sql). Client logins are unaffected."
    );
  }
  if (error.code === "23505") throw new Error("That username is already taken by another team login.");
  throw new Error(error.message);
}

export async function removeAdminUser(userId: number) {
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured.");
  /* Scoped to team rows: this button must not be able to delete a client's
     board login, whatever id reaches it. */
  const { error } = await db
    .from("board_users")
    .delete()
    .eq("id", userId)
    .is("board_id", null)
    .eq("role", "admin");
  if (error) throw new Error(error.message);
}

/* ---------------- login checks ---------------- */

/** Admin bootstrap: env credentials work even before Supabase exists. */
export function checkEnvAdmin(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  return Boolean(u && p && username === u && password === p);
}

export interface BoardLoginRow {
  password_hash: string;
  role: "client" | "admin";
}

/** The stored row to check a board login against, or null. Pure, for the same
    reason `teamAdminHash` is: it is the whole decision about whether the row
    that came back belongs to the person who typed the name, and it has to be
    testable without a database.

    The name is re-checked here because the query cannot be taken at its word.
    PostgREST rewrites a literal `*` in an `ilike` value to `%` — after
    `likeLiteral` has run, so no escape survives it — and on a board with
    exactly one login `maybeSingle` then hands that row over for a username
    nobody has. Not an escalation (the password must still be right, and the
    row's own role is all it grants) but a username that is optional is half a
    credential gone. */
export function boardLoginMatch(data: unknown, username: string): BoardLoginRow | null {
  if (typeof username !== "string") return null;
  const wanted = username.trim().toLowerCase();
  if (!wanted) return null;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const r = data as Record<string, unknown>;
  if (typeof r.username !== "string" || r.username.toLowerCase() !== wanted) return null;
  if (typeof r.password_hash !== "string" || r.password_hash.length === 0) return null;
  /* Anything that is not exactly "admin" is a client — unchanged, and the
     conservative direction. */
  return { password_hash: r.password_hash, role: r.role === "admin" ? "admin" : "client" };
}

/** A fresh object each time, deliberately: a single shared literal handed back
    from an authentication check is an answer any caller could edit for every
    later caller. */
function noBoardLogin(): { ok: boolean; role: "client" | "admin" } {
  return { ok: false, role: "client" };
}

export async function checkBoardLogin(
  boardSlug: string,
  username: string,
  password: string
): Promise<{ ok: boolean; role: "client" | "admin" }> {
  if (typeof username !== "string" || typeof password !== "string") return noBoardLogin();
  /* Trimmed once, here, so the pattern that goes to the database and the name
     `boardLoginMatch` compares are the same string. `login()` already trims;
     this makes the function true on its own terms. */
  const name = username.trim();
  if (!name || !password) return noBoardLogin();
  const db = supabaseAdmin();
  if (!db) return noBoardLogin();
  const board = await getBoardBySlug(boardSlug);
  if (!board || board.id === "fixture") return noBoardLogin();
  const { data } = await db
    .from("board_users")
    .select("username,password_hash,role")
    .eq("board_id", board.id)
    .ilike("username", likeLiteral(name))
    .maybeSingle();
  const row = boardLoginMatch(data, name);
  if (!row) return noBoardLogin();
  /* bcrypt throws on a malformed hash; a stored value we cannot read is a
     failed login, not a 500 that would also block the team-login check below. */
  let ok = false;
  try {
    ok = (await compare(password, row.password_hash)) === true;
  } catch {
    ok = false;
  }
  return { ok, role: ok && row.role === "admin" ? "admin" : "client" };
}

/* ---------------- team-login check ----------------
   Split in two on purpose: `teamAdminHash` is the whole decision and is pure,
   so the paths that matter can be tested without a database — which is the
   only way to test them at all while 0002_cms.sql is unapplied and no row in
   the table can satisfy the query. */

export interface TeamAdminQuery {
  data: unknown;
  error: unknown;
}

/** The bcrypt hash to check `username` against, or null for "not a team
    admin". Every unexpected shape — a query error, a non-array, a row that is
    not board-less, a missing hash, two rows for one name — is a null. An
    authentication check that guesses is an authentication bypass. */
export function teamAdminHash(result: TeamAdminQuery, username: string): string | null {
  if (result.error) return null;
  if (!Array.isArray(result.data)) return null;
  if (typeof username !== "string") return null;
  const wanted = username.trim().toLowerCase();
  if (!wanted) return null;

  const matches = result.data.filter((row): row is { password_hash: string } => {
    if (!row || typeof row !== "object") return false;
    const r = row as Record<string, unknown>;
    /* Re-check in JS what the query filtered on. `ilike` is a pattern match and
       the filters are the server's word for it; neither is trusted to be the
       last say on whether this row is a board-less admin. */
    /* `!("board_id" in r)` and not a plain `!= null`: a row whose board_id key
       is absent, or undefined, is not a board-less row — it is a row this
       function has been given no way to vouch for, and "no way to tell" is a
       no. Unreachable while the select above names the column; reachable the
       day it does not, which is the whole reason this re-check exists. */
    if (!("board_id" in r) || r.board_id !== null) return false;
    if (r.role !== "admin") return false;
    if (typeof r.username !== "string" || r.username.toLowerCase() !== wanted) return false;
    return typeof r.password_hash === "string" && r.password_hash.length > 0;
  });

  return matches.length === 1 ? matches[0].password_hash : null;
}

/** A login that belongs to the agency, not to a board. Checked after the
    per-board lookup misses. Returns false on every error path.

    The client is a parameter, defaulting to `supabaseAdmin()`, purely so the
    guards in front of the query are reachable in a test. Without it the suite
    runs with no Supabase environment, `supabaseAdmin()` is null, and the `!db`
    return answers "no" for every input — which makes an assertion about
    any other guard pass whether that guard exists or not. An assertion that
    cannot fail is worse than none in an authentication suite. */
export async function checkAdminLogin(
  username: string,
  password: string,
  db: SupabaseClient | null = supabaseAdmin()
): Promise<boolean> {
  if (typeof username !== "string" || typeof password !== "string") return false;
  /* Trimmed once, here, so the name the query asks about and the name
     `teamAdminHash` insists on are the same string. */
  const name = username.trim();
  if (!name || !password) return false;
  if (!db) return false;
  try {
    const result = await db
      .from("board_users")
      .select("username,role,board_id,password_hash")
      .is("board_id", null)
      .eq("role", "admin")
      .ilike("username", likeLiteral(name))
      .limit(TEAM_MATCH_LIMIT);
    const stored = teamAdminHash(result, name);
    if (!stored) return false;
    return (await compare(password, stored)) === true;
  } catch {
    /* A thrown client error (network, malformed hash, anything unforeseen) is
       "no". There is no branch in this function that answers yes on error. */
    return false;
  }
}
