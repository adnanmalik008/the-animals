import "server-only";
import { cache } from "react";
import { docsFromRows, type BoardDocs, type ModuleRow } from "@/lib/cms/docs";
import { parseDoc, type FieldErrors } from "@/lib/cms/parse";
import { byKey } from "@/lib/cms/registry";
import { setModuleData } from "./boards";
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
    which is never the same thing as a board with nothing saved. */
export type ReadResult<T> = { ok: true; rows: T[] } | { ok: false; error: string };

/** Supabase's `{ data, error }` → rows, or the reason there are none. Pure and
    exported so the failure path is reachable in a unit test without a live
    client: it is the branch that used to collapse into "nothing saved". */
export function readResult<T>(res: {
  data: unknown[] | null;
  error: { message: string } | null;
}): ReadResult<T> {
  if (res.error) return { ok: false, error: res.error.message };
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

/** Every registry key, with its validated doc or its fixture. Cached per
    request: the layout and the page below it read the same board. */
export const getBoardDocs = cache(async (boardId: string): Promise<BoardContent> => {
  const onInvalid = (key: string, error: string) => {
    console.warn(`[cms] board ${boardId} / ${key}: ${error} — showing built-in content`);
  };

  const db = supabaseAdmin();
  if (!db || boardId === "fixture") return { ...docsFromRows([], onInvalid), unavailable: false };

  const read = readResult<ModuleRow>(
    await db.from("module_data").select("module_key,data").eq("board_id", boardId)
  );
  if (!read.ok) {
    console.warn(`[cms] board ${boardId}: ${read.error} — showing built-in content`);
    return { ...docsFromRows([], onInvalid), unavailable: true };
  }
  return { ...docsFromRows(read.rows, onInvalid), unavailable: false };
});

interface SavedModuleRow {
  module_key: string;
  data: unknown;
  updated_at: string;
}

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

  return {
    ok: true,
    rows: read.rows.map((row) => {
      const moduleKey = String(row.module_key);
      const def = byKey(moduleKey);
      return {
        moduleKey,
        data: row.data,
        updatedAt: String(row.updated_at),
        status: !def ? "unmanaged" : parseDoc(def, row.data).ok ? "custom" : "invalid",
      };
    }),
  };
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
