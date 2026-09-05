/* Snapshots MODULE_TEMPLATES — the fixtures the current raw-JSON admin
   editor treats as "the shape of a saved doc" — to committed JSON files
   under tests/cms/legacy/. Captured once, before later CMS milestones
   reshape the fixture interfaces, so tests/cms/legacy.test.ts always has
   the exact shape a production board could have saved.

   Idempotent: re-running overwrites each file with the same content,
   since MODULE_TEMPLATES is static data (no ids/timestamps generated). */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MODULE_TEMPLATES } from "@/lib/module-templates";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../tests/cms/legacy");

mkdirSync(outDir, { recursive: true });

const keys = Object.keys(MODULE_TEMPLATES);
for (const key of keys) {
  const path = join(outDir, `${key}.json`);
  writeFileSync(path, `${JSON.stringify(MODULE_TEMPLATES[key], null, 2)}\n`);
  console.log(`wrote ${key}.json`);
}

console.log(`\n${keys.length} legacy snapshots written to ${outDir}`);
