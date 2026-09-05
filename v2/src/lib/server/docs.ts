import "server-only";
import { cache } from "react";
import { docsFromRows, type BoardDocs, type ModuleRow } from "@/lib/cms/docs";
import { parseDoc, type FieldErrors } from "@/lib/cms/parse";
import { byKey } from "@/lib/cms/registry";
import { setModuleData } from "./boards";
import { supabaseAdmin } from "./supabase";

/* ============================================================
   The one door onto board content.

   Reads never fail: a missing row, a malformed row, an
   unreachable database and fixture mode all resolve to the
   built-in content, so a board renders whatever happens.
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

export type SaveDocResult =
  | { ok: true; doc: unknown }
  | { ok: false; error: string; fieldErrors: FieldErrors };

/** Every registry key, with its validated doc or its fixture. Cached per
    request: the layout and the page below it read the same board. */
export const getBoardDocs = cache(async (boardId: string): Promise<BoardDocs> => {
  const onInvalid = (key: string, error: string) => {
    console.warn(`[cms] board ${boardId} / ${key}: ${error} — showing built-in content`);
  };

  const db = supabaseAdmin();
  if (!db || boardId === "fixture") return docsFromRows([], onInvalid);

  const { data, error } = await db
    .from("module_data")
    .select("module_key,data")
    .eq("board_id", boardId);
  if (error || !data) {
    if (error) console.warn(`[cms] board ${boardId}: ${error.message} — showing built-in content`);
    return docsFromRows([], onInvalid);
  }
  return docsFromRows(data as ModuleRow[], onInvalid);
});

/** The admin's view: what is actually stored, and whether it still validates. */
export async function getModuleRows(boardId: string): Promise<ModuleRowInfo[]> {
  const db = supabaseAdmin();
  if (!db || boardId === "fixture") return [];

  const { data, error } = await db
    .from("module_data")
    .select("module_key,data,updated_at")
    .eq("board_id", boardId);
  if (error || !data) {
    if (error) console.warn(`[cms] board ${boardId}: ${error.message} — listing no saved modules`);
    return [];
  }

  return data.map((row) => {
    const moduleKey = String(row.module_key);
    const def = byKey(moduleKey);
    return {
      moduleKey,
      data: row.data,
      updatedAt: String(row.updated_at),
      status: !def ? "unmanaged" : parseDoc(def, row.data).ok ? "custom" : "invalid",
    };
  });
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
