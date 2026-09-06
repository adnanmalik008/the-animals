import "server-only";
import { cache } from "react";
import { docsFromRows, type BoardDocs, type DocScope, type ModuleRow } from "@/lib/cms/docs";
import { parseDoc, type FieldErrors } from "@/lib/cms/parse";
import { byKey } from "@/lib/cms/registry";
import { setDefaultData, setModuleData } from "./boards";
import { supabaseAdmin } from "./supabase";

/* ============================================================
   The one door onto board content.

   Board reads never fail: a missing row, a malformed row, an
   unreachable database and fixture mode all resolve to the
   built-in content, so a board renders whatever happens.

   The admin gets the same fixtures but is *told* when the read
   failed. "The database did not answer" must never reach an
   editor as "this board has nothing saved": the write goes out
   over a different query that may well succeed, so a template
   presented as saved content is one Save away from replacing a
   real document.

   Writes fail loudly instead — a doc that does not match its
   module definition is refused before it reaches the table.
   ============================================================ */

/** A saved row exactly as stored — never normalised, never substituted.
    `unmanaged` means the key has no definition yet, so nothing validated it. */
export interface ModuleRowInfo {
  moduleKey: string;
  data: unknown;
  updatedAt: string;
  status: "custom" | "invalid" | "unmanaged";
}

/** The outcome of a `module_data` read. `ok: false` says the query failed —
    which is never the same thing as a board with nothing saved. `code` is
    Postgres's SQLSTATE or PostgREST's own code when the answer carried one. */
export type ReadResult<T> = { ok: true; rows: T[] } | { ok: false; error: string; code?: string };

/** What Supabase hands back from a `select`. */
interface QueryAnswer {
  data: unknown[] | null;
  error: { message: string; code?: string } | null;
}

/** Supabase's `{ data, error }` → rows, or the reason there are none. Pure and
    exported so the failure path is reachable in a unit test without a live
    client: it is the branch that used to collapse into "nothing saved". */
export function readResult<T>(res: QueryAnswer): ReadResult<T> {
  if (res.error) return { ok: false, error: res.error.message, code: res.error.code };
  if (!res.data) return { ok: false, error: "the query returned neither rows nor an error" };
  return { ok: true, rows: res.data as T[] };
}

/** Every registry key's doc, plus whether the fixtures among them are
    standing in for a failed read rather than for content nobody has saved. */
export interface BoardContent extends BoardDocs {
  unavailable: boolean;
}

export type SaveDocResult =
  | { ok: true; doc: unknown }
  | { ok: false; error: string; fieldErrors: FieldErrors };

/** A stored row, with `updated_at`. */
interface SavedModuleRow {
  module_key: string;
  data: unknown;
  updated_at: string;
}

/** A stored row + whether it still fits its definition. The same judgement for
    a board's row and for a shared one: both are documents an editor typed and
    a schema may since have moved past. */
function rowInfo(row: SavedModuleRow): ModuleRowInfo {
  const moduleKey = String(row.module_key);
  const def = byKey(moduleKey);
  return {
    moduleKey,
    data: row.data,
    updatedAt: String(row.updated_at),
    status: !def ? "unmanaged" : parseDoc(def, row.data).ok ? "custom" : "invalid",
  };
}

/* ---------------- shared defaults ---------------- */

/** A `module_defaults` read. `available: false` means the table is not there
    at all — the migration is unapplied, or Supabase is unconfigured — which is
    "no shared defaults", the expected state, and not a failure. `ok: false` is
    a real one. */
export type DefaultsRead<T = ModuleRow> =
  | { ok: true; rows: T[]; available: boolean }
  | { ok: false; error: string };

/* Two codes mean the same thing: PostgREST answers from its schema cache and
   never reaches Postgres (`PGRST205`, HTTP 404); a direct connection, or a
   query PostgREST does pass through, raises SQLSTATE `42P01`
   (`undefined_table`). Matching on the code and never on the wording is the
   point — "could not find the table" also appears in failures that have
   nothing to do with an unapplied migration, and reading one as the other is
   how a database problem turns into silent content loss. */
const MISSING_TABLE_CODES: ReadonlySet<string> = new Set(["PGRST205", "42P01"]);

/** Supabase's `{ data, error }` from `module_defaults` → the shared rows to
    use. Pure and exported so the pre-migration path is testable without a live
    client, which matters because that path is the normal one until Adnan runs
    `0002_cms.sql`. */
export function defaultsRead<T = ModuleRow>(res: QueryAnswer): DefaultsRead<T> {
  const read = readResult<T>(res);
  if (read.ok) return { ok: true, rows: read.rows, available: true };
  if (read.code && MISSING_TABLE_CODES.has(read.code)) return { ok: true, rows: [], available: false };
  return { ok: false, error: read.error };
}

/** The agency-wide defaults every board falls back to before the fixtures.
    Cached per request like `getBoardDocs`: one board render reads them once. */
export const getDefaultRows = cache(async (): Promise<DefaultsRead> => {
  const db = supabaseAdmin();
  if (!db) return { ok: true, rows: [], available: false };

  const read = defaultsRead(await db.from("module_defaults").select("module_key,data"));
  if (!read.ok) console.warn(`[cms] shared defaults: ${read.error} — showing built-in content`);
  return read;
});

/** Stores a *normalised* shared default. Unlike `saveModuleDoc`, a key with no
    definition is refused rather than stored raw: this document lands on every
    board that has none of its own, so nothing unvalidatable may become one. */
export async function saveDefaultDoc(moduleKey: string, raw: unknown): Promise<SaveDocResult> {
  const def = byKey(moduleKey);
  if (!def) {
    return {
      ok: false,
      error: `"${moduleKey}" has no module definition, so it can have no shared default.`,
      fieldErrors: {},
    };
  }
  const res = parseDoc(def, raw);
  if (!res.ok) return res;
  await setDefaultData(moduleKey, res.doc);
  return { ok: true, doc: res.doc };
}

/** The shared-defaults admin view: what is stored, whether it still validates,
    and whether the table is there at all. `available: false` is the normal
    state until `0002_cms.sql` runs — no shared content, not a failure. */
export async function getDefaultRowInfos(): Promise<DefaultsRead<ModuleRowInfo>> {
  const db = supabaseAdmin();
  if (!db) return { ok: true, rows: [], available: false };

  const read = defaultsRead<SavedModuleRow>(
    await db.from("module_defaults").select("module_key,data,updated_at")
  );
  if (!read.ok) {
    console.warn(`[cms] shared defaults: ${read.error} — cannot say what is saved`);
    return read;
  }
  return { ok: true, available: read.available, rows: read.rows.map(rowInfo) };
}

/** The agency-wide default for one module, validated and cloned — what "Reset
    to shared default" puts back on a board form. `undefined` when there is
    none, or when the one there no longer fits its definition: a board must
    never be reset onto a document the board itself would refuse. */
export async function getSharedDoc(moduleKey: string): Promise<unknown> {
  const def = byKey(moduleKey);
  if (!def) return undefined;
  const read = await getDefaultRows();
  if (!read.ok) return undefined;
  const row = read.rows.find((r) => r.module_key === moduleKey);
  if (!row) return undefined;
  const res = parseDoc(def, row.data);
  return res.ok ? structuredClone(res.doc) : undefined;
}

/* ---------------- board content ---------------- */

/** Every registry key, with its validated doc or its fixture. Cached per
    request: the layout and the page below it read the same board. */
export const getBoardDocs = cache(async (boardId: string): Promise<BoardContent> => {
  const onInvalid = (key: string, error: string, scope: DocScope) => {
    const whose = scope === "shared" ? "shared default" : `board ${boardId}`;
    console.warn(`[cms] ${whose} / ${key}: ${error} — showing built-in content`);
  };

  const db = supabaseAdmin();
  if (!db || boardId === "fixture") return { ...docsFromRows([], [], onInvalid), unavailable: false };

  const [answer, defaults] = await Promise.all([
    db.from("module_data").select("module_key,data").eq("board_id", boardId),
    getDefaultRows(),
  ]);
  const read = readResult<ModuleRow>(answer);
  if (!read.ok) console.warn(`[cms] board ${boardId}: ${read.error} — showing built-in content`);

  /* Either read failing means a fixture on screen may be standing in for a
     document that exists — this board's, or the agency's — so the admin must
     not be shown "nothing saved" and offered a Save over the top of it. */
  return {
    ...docsFromRows(read.ok ? read.rows : [], defaults.ok ? defaults.rows : [], onInvalid),
    unavailable: !read.ok || !defaults.ok,
  };
});

/** The admin's view: what is actually stored, and whether it still validates.
    A failed read comes back as `ok: false` so the screen can say so instead of
    offering a template as though it were the board's saved content. */
export async function getModuleRows(boardId: string): Promise<ReadResult<ModuleRowInfo>> {
  const db = supabaseAdmin();
  if (!db || boardId === "fixture") return { ok: true, rows: [] };

  const read = readResult<SavedModuleRow>(
    await db.from("module_data").select("module_key,data,updated_at").eq("board_id", boardId)
  );
  if (!read.ok) {
    console.warn(`[cms] board ${boardId}: ${read.error} — cannot say what is saved`);
    return read;
  }

  return { ok: true, rows: read.rows.map(rowInfo) };
}

/** Stores the *normalised* doc, so what the board reads back is what the
    schema produced. Keys without a definition keep the old contract: their
    raw JSON is saved as typed. */
export async function saveModuleDoc(
  boardId: string,
  moduleKey: string,
  raw: unknown
): Promise<SaveDocResult> {
  const def = byKey(moduleKey);
  if (!def) {
    await setModuleData(boardId, moduleKey, raw);
    return { ok: true, doc: raw };
  }
  const res = parseDoc(def, raw);
  if (!res.ok) return res;
  await setModuleData(boardId, moduleKey, res.doc);
  return { ok: true, doc: res.doc };
}
