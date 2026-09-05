/* CLI entry point: snapshots MODULE_TEMPLATES — the fixtures the current
   raw-JSON admin editor treats as "the shape of a saved doc" — to
   committed JSON files under tests/cms/legacy/. Captured once, before
   later CMS milestones reshape the fixture interfaces, so
   tests/cms/legacy.test.ts always has the exact shape a production board
   could have saved.

   The writer itself lives in ./lib/legacy-snapshot.ts: it protects any
   file whose committed content has been hand-edited to differ from the
   current template (e.g. opinion-leaders.json's restored `initials`
   field) from being silently overwritten. */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MODULE_TEMPLATES } from "@/lib/module-templates";
import { snapshotLegacyTemplates } from "./lib/legacy-snapshot";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../tests/cms/legacy");
const { written, skipped } = snapshotLegacyTemplates(outDir, MODULE_TEMPLATES);

console.log(`\n${written.length} legacy snapshots written, ${skipped.length} skipped (hand-edited) — ${outDir}`);
