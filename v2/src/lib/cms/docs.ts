/* Rows from module_data + module_defaults → a complete, validated bag of docs
   (pure; no server imports, and nothing here knows a table or a query exists). */

import { MODULES } from "./registry";
import { parseDoc } from "./parse";
import type { ModuleDocs, ModuleKey, ModuleStatus } from "./types";

export interface ModuleRow {
  module_key: string;
  data: unknown;
}

/** Which document failed: this one board's, or the agency-wide default that
    every board without one of its own reads. */
export type DocScope = "board" | "shared";

export interface BoardDocs {
  docs: ModuleDocs;
  status: Record<ModuleKey, ModuleStatus>;
}

/** Every registry key gets a doc, resolved down a three-step chain: this
    board's saved row when it validates, then the agency-wide shared default
    when it validates, then the built-in fixture. `onInvalid` hears about every
    document that failed, and at which step.

    The middle step exists because the fixtures are the adidas demo material:
    without it the tenth client either inherits adidas's content or has every
    module retyped, and a dead livestream is re-fixed once per client.

    A broken *shared* default costs one module its shared copy on every board
    and nothing else — it falls through to the fixture, and a board with a
    valid document of its own never reaches it at all. That asymmetry is
    deliberate: it is the one write here whose blast radius is every client.

    Fixtures are module-scope arrays imported from `@/data`, and a shared row
    is by construction the same input every board parses, so handing either
    straight out would give every board in the process the same objects.
    Cloning here — rather than trusting `fixture()` or zod to hand back fresh
    values — means no caller can reach shared state. */
export function docsFromRows(
  rows: readonly ModuleRow[],
  defaults: readonly ModuleRow[],
  onInvalid?: (key: ModuleKey, error: string, scope: DocScope) => void
): BoardDocs {
  const saved = new Map(rows.map((r) => [r.module_key, r.data]));
  const shared = new Map(defaults.map((r) => [r.module_key, r.data]));
  const docs: Record<string, unknown> = {};
  const status: Record<string, ModuleStatus> = {};

  for (const def of MODULES) {
    /* Set once the board's own document is known broken. It outranks where the
       content ends up coming from, because it is the thing an editor must fix. */
    let boardInvalid = false;

    if (saved.has(def.key)) {
      const res = parseDoc(def, saved.get(def.key));
      if (res.ok) {
        docs[def.key] = res.doc;
        status[def.key] = "custom";
        continue;
      }
      boardInvalid = true;
      onInvalid?.(def.key, res.error, "board");
    }

    if (shared.has(def.key)) {
      const res = parseDoc(def, shared.get(def.key));
      if (res.ok) {
        docs[def.key] = structuredClone(res.doc);
        status[def.key] = boardInvalid ? "invalid" : "shared";
        continue;
      }
      onInvalid?.(def.key, res.error, "shared");
    }

    docs[def.key] = structuredClone(def.fixture());
    status[def.key] = boardInvalid ? "invalid" : "default";
  }

  return { docs: docs as ModuleDocs, status: status as Record<ModuleKey, ModuleStatus> };
}
