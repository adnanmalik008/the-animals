import "server-only";
import { cache } from "react";
import { docsFromRows, type ContentDocs, type ModuleRow } from "@/lib/cms/docs";
import { parseDoc, type FieldErrors } from "@/lib/cms/parse";
import { byKey } from "@/lib/cms/registry";
import { setModuleContent } from "./boards";
import { supabaseAdmin } from "./supabase";

/* ============================================================
   The one door onto module content.

   There is one set of content for the whole product. A board is
   an access gate with a name of its own, not a content scope, so
   every board reads the same documents and nothing here takes a
   board id.

   Board reads never fail: a missing row, a malformed row, an
   unreachable database and an unapplied migration all resolve to
   the built-in content, so a board renders whatever happens.

   The admin gets the same fixtures but is *told* when the read
   failed. "The database did not answer" must never reach an
   editor as "nothing is saved": the write goes out over a
   different query that may well succeed, so a template presented
   as saved content is one Save away from replacing a real
   document.

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

/** The outcome of a read. `ok: false` says the query failed — which is never
    the same thing as nothing being saved. `code` is Postgres's SQLSTATE or
    PostgREST's own code when the answer carried one. */
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

export type SaveDocResult =
  | { ok: true; doc: unknown }
  | { ok: false; error: string; fieldErrors: FieldErrors };

/** A stored row, with `updated_at`. */
interface SavedModuleRow {
  module_key: string;
  data: unknown;
  updated_at: string;
}

/** A stored row + whether it still fits its definition: a document an editor
    typed, and a schema that may since have moved past it. */
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

/** A `module_content` read. `available: false` means the table is not there at
    all — the migration is unapplied, or Supabase is unconfigured — which is
    "nothing saved yet", the expected state, and not a failure. `ok: false` is
    a real one. */
export type ContentRead<T = ModuleRow> =
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

/** Supabase's `{ data, error }` from `module_content` → the rows to use. Pure
    and exported so the pre-migration path is testable without a live client,
    which matters because that path is the normal one until Adnan runs
    `0002_cms.sql`. */
export function contentRead<T = ModuleRow>(res: QueryAnswer): ContentRead<T> {
  const read = readResult<T>(res);
  if (read.ok) return { ok: true, rows: read.rows, available: true };
  if (read.code && MISSING_TABLE_CODES.has(read.code)) return { ok: true, rows: [], available: false };
  return { ok: false, error: read.error };
}

/** The saved content, as rows. Cached per request: one render reads the table
    once however many surfaces ask for it. */
export const getContentRows = cache(async (): Promise<ContentRead> => {
  const db = supabaseAdmin();
  if (!db) return { ok: true, rows: [], available: false };

  const read = contentRead(await db.from("module_content").select("module_key,data"));
  if (!read.ok) console.warn(`[cms] content: ${read.error} — showing built-in content`);
  return read;
});

/** Every registry key, with its saved doc or its fixture — what every board
    renders. Cached per request: the layout and the page below it read the
    same content.

    A failed read serves fixtures rather than an error, because a board must
    render whatever happens. The admin never comes through here — it reads
    `getContentRowInfos`, which reports a failure instead of quietly showing a
    template as though it were what is saved. */
export const getContentDocs = cache(async (): Promise<ContentDocs> => {
  const onInvalid = (key: string, error: string) =>
    console.warn(`[cms] content / ${key}: ${error} — showing built-in content`);

  const read = await getContentRows();
  return docsFromRows(read.ok ? read.rows : [], onInvalid);
});

/** The admin's view: what is actually stored, whether it still validates, and
    whether the table is there at all. A failed read comes back as `ok: false`
    so the screen can say so instead of offering a template as though it were
    the saved content. `available: false` is the normal state until
    `0002_cms.sql` runs — nothing saved, not a failure. */
export async function getContentRowInfos(): Promise<ContentRead<ModuleRowInfo>> {
  const db = supabaseAdmin();
  if (!db) return { ok: true, rows: [], available: false };

  const read = contentRead<SavedModuleRow>(
    await db.from("module_content").select("module_key,data,updated_at")
  );
  if (!read.ok) {
    console.warn(`[cms] content: ${read.error} — cannot say what is saved`);
    return read;
  }
  return { ok: true, available: read.available, rows: read.rows.map(rowInfo) };
}

/** Stores the *normalised* doc, so what a board reads back is what the schema
    produced. Keys without a definition keep the contract they have always
    had: their raw JSON is saved as typed, because the Advanced panel is the
    only editor they have until each one gets a definition. */
export async function saveContentDoc(moduleKey: string, raw: unknown): Promise<SaveDocResult> {
  const def = byKey(moduleKey);
  if (!def) {
    await setModuleContent(moduleKey, raw);
    return { ok: true, doc: raw };
  }
  const res = parseDoc(def, raw);
  if (!res.ok) return res;
  await setModuleContent(moduleKey, res.doc);
  return { ok: true, doc: res.doc };
}
