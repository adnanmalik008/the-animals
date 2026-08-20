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

export async function getModuleData(boardId: string): Promise<Record<string, unknown>> {
  const db = supabaseAdmin();
  if (!db || boardId === "fixture") return {};
  const { data, error } = await db
    .from("module_data")
    .select("module_key,data")
    .eq("board_id", boardId);
  if (error || !data) return {};
  const out: Record<string, unknown> = {};
  for (const row of data) out[row.module_key] = row.data;
  return out;
}

export async function setModuleData(boardId: string, moduleKey: string, data: unknown) {
  const db = supabaseAdmin();
  if (!db) throw new Error("CMS is not configured (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  const { error } = await db
    .from("module_data")
    .upsert({ board_id: boardId, module_key: moduleKey, data }, { onConflict: "board_id,module_key" });
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
  const { error } = await db.from("board_users").delete().eq("id", userId);
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
    .ilike("username", username)
    .maybeSingle();
  if (!data) return { ok: false, role: "client" };
  const ok = await compare(password, data.password_hash);
  return { ok, role: data.role === "admin" ? "admin" : "client" };
}
