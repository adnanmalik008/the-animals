import "server-only";
import { headers } from "next/headers";
import { compare, hash } from "bcryptjs";
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
    (PostgREST also rewrites `*` to `%`, which no escape survives — hence
    TEAM_USERNAME_RE, and hence the exact re-check in `teamAdminHash`.) */
function likeLiteral(value: string): string {
  return value.replace(/[\%_]/g, (c) => "\\" + c);
}

export async function listAdminUsers(): Promise<BoardUserRecord[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("board_users")
    .select("id,username,role,board_id,created_at")
    .is("board_id", null)
    .eq("role", "admin")
    .order("created_at");
  if (error || !Array.isArray(data)) return [];
  /* Re-checked in JS for the same reason `teamAdminHash` re-checks: a row shown
     here is offered a Remove button, so a board login must not be able to
     arrive in this list however the filters behaved. */
  return data
    .filter((r) => r && r.board_id == null && r.role === "admin")
    .map((r) => ({ id: r.id, username: r.username, role: "admin" as const, createdAt: r.created_at }));
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

export async function checkBoardLogin(
  boardSlug: string,
  username: string,
  password: string
): Promise<{ ok: boolean; role: "client" | "admin" }> {
  const db = supabaseAdmin();
  if (!db) return { ok: false, role: "client" };
  const board = await getBoardBySlug(boardSlug);
  if (!board || board.id === "fixture") return { ok: false, role: "client" };
  const { data } = await db
    .from("board_users")
    .select("password_hash,role")
    .eq("board_id", board.id)
    .ilike("username", likeLiteral(username))
    .maybeSingle();
  if (!data || typeof data.password_hash !== "string") return { ok: false, role: "client" };
  /* bcrypt throws on a malformed hash; a stored value we cannot read is a
     failed login, not a 500 that would also block the team-login check below. */
  let ok = false;
  try {
    ok = (await compare(password, data.password_hash)) === true;
  } catch {
    ok = false;
  }
  return { ok, role: ok && data.role === "admin" ? "admin" : "client" };
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
  const wanted = username.trim().toLowerCase();
  if (!wanted) return null;

  const matches = result.data.filter((row): row is { password_hash: string } => {
    if (!row || typeof row !== "object") return false;
    const r = row as Record<string, unknown>;
    /* Re-check in JS what the query filtered on. `ilike` is a pattern match and
       the filters are the server's word for it; neither is trusted to be the
       last say on whether this row is a board-less admin. */
    if (r.board_id !== null && r.board_id !== undefined) return false;
    if (r.role !== "admin") return false;
    if (typeof r.username !== "string" || r.username.toLowerCase() !== wanted) return false;
    return typeof r.password_hash === "string" && r.password_hash.length > 0;
  });

  return matches.length === 1 ? matches[0].password_hash : null;
}

/** A login that belongs to the agency, not to a board. Checked after the
    per-board lookup misses. Returns false on every error path. */
export async function checkAdminLogin(username: string, password: string): Promise<boolean> {
  if (!username || !password) return false;
  const db = supabaseAdmin();
  if (!db) return false;
  try {
    const result = await db
      .from("board_users")
      .select("username,role,board_id,password_hash")
      .is("board_id", null)
      .eq("role", "admin")
      .ilike("username", likeLiteral(username))
      .limit(TEAM_MATCH_LIMIT);
    const stored = teamAdminHash(result, username);
    if (!stored) return false;
    return (await compare(password, stored)) === true;
  } catch {
    /* A thrown client error (network, malformed hash, anything unforeseen) is
       "no". There is no branch in this function that answers yes on error. */
    return false;
  }
}
