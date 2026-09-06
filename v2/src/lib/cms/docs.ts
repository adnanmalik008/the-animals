/* Rows from module_content → a complete, validated bag of docs (pure; no
   server imports, and nothing here knows a table or a query exists). */

import { MODULES } from "./registry";
import { parseDoc } from "./parse";
import type { ModuleDocs, ModuleKey, ModuleStatus } from "./types";

export interface ModuleRow {
  module_key: string;
  data: unknown;
}

export interface ContentDocs {
  docs: ModuleDocs;
  status: Record<ModuleKey, ModuleStatus>;
}

/** Every registry key gets a doc: the agency's saved row when it validates,
    then the built-in fixture. `onInvalid` hears about every saved document
    that failed, so a broken row costs one module its content and nothing
    else — the board still renders.

    Content is one set for the whole product, so a saved row is by
    construction the same input every board parses, and the fixtures are
    module-scope arrays imported from `@/data`. Handing either straight out
    would give every board in the process the same objects, so both are
    cloned here rather than trusting `fixture()` or zod to hand back fresh
    values — no caller can reach shared state. */
export function docsFromRows(
  rows: readonly ModuleRow[],
  onInvalid?: (key: ModuleKey, error: string) => void
): ContentDocs {
  const saved = new Map(rows.map((r) => [r.module_key, r.data]));
  const docs: Record<string, unknown> = {};
  const status: Record<string, ModuleStatus> = {};

  for (const def of MODULES) {
    if (saved.has(def.key)) {
      const res = parseDoc(def, saved.get(def.key));
      if (res.ok) {
        docs[def.key] = structuredClone(res.doc);
        status[def.key] = "custom";
        continue;
      }
      onInvalid?.(def.key, res.error);
      docs[def.key] = structuredClone(def.fixture());
      status[def.key] = "invalid";
      continue;
    }

    docs[def.key] = structuredClone(def.fixture());
    status[def.key] = "default";
  }

  return { docs: docs as ModuleDocs, status: status as Record<ModuleKey, ModuleStatus> };
}
