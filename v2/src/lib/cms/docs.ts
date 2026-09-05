/* Rows from module_data → a complete, validated bag of docs (pure; no server imports). */

import { MODULES } from "./registry";
import { parseDoc } from "./parse";
import type { ModuleDocs, ModuleKey, ModuleStatus } from "./types";

export interface ModuleRow {
  module_key: string;
  data: unknown;
}

export interface BoardDocs {
  docs: ModuleDocs;
  status: Record<ModuleKey, ModuleStatus>;
}

/** Every registry key gets a doc: the saved one when it validates, the
    fixture otherwise. `onInvalid` hears about saved docs that failed. */
export function docsFromRows(
  rows: readonly ModuleRow[],
  onInvalid?: (key: ModuleKey, error: string) => void
): BoardDocs {
  const saved = new Map(rows.map((r) => [r.module_key, r.data]));
  const docs: Record<string, unknown> = {};
  const status: Record<string, ModuleStatus> = {};
  for (const def of MODULES) {
    if (!saved.has(def.key)) {
      docs[def.key] = def.fixture();
      status[def.key] = "default";
      continue;
    }
    const res = parseDoc(def, saved.get(def.key));
    if (res.ok) {
      docs[def.key] = res.doc;
      status[def.key] = "custom";
    } else {
      docs[def.key] = def.fixture();
      status[def.key] = "invalid";
      onInvalid?.(def.key, res.error);
    }
  }
  return { docs: docs as ModuleDocs, status: status as Record<ModuleKey, ModuleStatus> };
}
