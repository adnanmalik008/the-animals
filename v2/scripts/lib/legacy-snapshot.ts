/* Core writer behind scripts/snapshot-legacy-templates.ts, split into its
   own pure module (no top-level side effects) so
   tests/cms/snapshot-legacy-templates.test.ts can drive it against a
   throwaway directory — never the committed fixtures, and without
   shelling out to the CLI script. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface SnapshotResult {
  /** keys written this run: new, or already matched the generated content */
  written: string[];
  /** keys left untouched because the existing file's content already
      differs from what would be generated now — see hasConflictingContent */
  skipped: string[];
}

/** True when `path` exists and its parsed content differs from `generated`.
    Comparing parsed values (not raw text) means whitespace, line endings
    and key order never count as a difference — only real content does.
    An unparseable existing file also counts as "differs": it is never
    overwritten silently either. */
function hasConflictingContent(path: string, generated: unknown): boolean {
  if (!existsSync(path)) return false;
  try {
    const existing = JSON.parse(readFileSync(path, "utf8"));
    return JSON.stringify(existing) !== JSON.stringify(generated);
  } catch {
    return true;
  }
}

/** Writes one pretty-printed JSON file per template key into `outDir`.
    Idempotent for untouched files: re-running overwrites a file with the
    same generated content.

    A committed file whose content already differs from what `templates`
    would generate now is the record of a shape a production board could
    have saved — e.g. tests/cms/legacy/opinion-leaders.json, hand-edited to
    carry the `initials` field MODULE_TEMPLATES no longer has. Overwriting
    it would destroy that record and quietly empty the compatibility test
    that reads it. Such a file is kept as it stands and reported in
    `skipped`; as fixtures are reshaped, most files will end up skipped, and
    that is the writer working, not a backlog to clear. */
export function snapshotLegacyTemplates(outDir: string, templates: Record<string, unknown>): SnapshotResult {
  mkdirSync(outDir, { recursive: true });
  const written: string[] = [];
  const skipped: string[] = [];

  for (const key of Object.keys(templates)) {
    const path = join(outDir, `${key}.json`);
    const generated = templates[key];
    if (hasConflictingContent(path, generated)) {
      skipped.push(key);
      console.warn(
        `kept ${key}.json — the committed file records a saved shape the current template no longer produces, so it is left untouched`
      );
      continue;
    }
    writeFileSync(path, `${JSON.stringify(generated, null, 2)}\n`);
    written.push(key);
    console.log(`wrote ${key}.json`);
  }

  return { written, skipped };
}
