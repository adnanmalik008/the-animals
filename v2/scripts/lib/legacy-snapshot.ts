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
    same generated content. A file whose existing content already differs
    from what `templates` would generate now — e.g.
    tests/cms/legacy/opinion-leaders.json, hand-edited to carry the
    `initials` field MODULE_TEMPLATES no longer has — is a deliberate
    hand-edit, not staleness to fix; overwriting it would silently destroy
    it with no test able to catch the loss. Such a file is left alone and
    reported in `skipped` (with a printed warning) instead. Delete a file
    to force it to regenerate from the current template. */
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
        `skipped ${key}.json — existing file differs from the generated fixture (looks hand-edited); delete it and re-run to regenerate from MODULE_TEMPLATES`
      );
      continue;
    }
    writeFileSync(path, `${JSON.stringify(generated, null, 2)}\n`);
    written.push(key);
    console.log(`wrote ${key}.json`);
  }

  return { written, skipped };
}
