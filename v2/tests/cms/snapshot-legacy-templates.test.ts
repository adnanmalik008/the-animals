/* Regression test for a review finding: MODULE_TEMPLATES["opinion-leaders"]
   no longer carries `initials` (the field was dropped from the fixture in
   the CMS core commit), but the committed tests/cms/legacy/opinion-leaders.json
   was hand-edited to restore it, because a real saved doc can still carry
   it. A naive writer would silently strip that hand-edit back out on the
   next `npm run cms:snapshot`, quietly turning the "initials are stripped,
   not rejected" assertion in legacy.test.ts into a vacuous check.

   Drives the exported writer against a throwaway temp directory — never
   the committed fixtures — so this stays fast and cannot corrupt real data. */
import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MODULE_TEMPLATES } from "@/lib/module-templates";
import { snapshotLegacyTemplates } from "../../scripts/lib/legacy-snapshot";

interface OpinionLeaderRow {
  id: string;
  name: string;
  initials?: string;
  [key: string]: unknown;
}

function withTempDir(run: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "cms-snapshot-"));
  try {
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("snapshotLegacyTemplates", () => {
  it("writes the current templates, then leaves a hand-edited file untouched across repeat runs", () => {
    withTempDir((outDir) => {
      const first = snapshotLegacyTemplates(outDir, MODULE_TEMPLATES);
      expect(first.skipped).toEqual([]);
      expect(first.written).toContain("opinion-leaders");

      // Simulate the real hand-edit this test guards against: restore a
      // field the current template no longer carries.
      const path = join(outDir, "opinion-leaders.json");
      const doc = JSON.parse(readFileSync(path, "utf8")) as { leaders: OpinionLeaderRow[] };
      for (const leader of doc.leaders) {
        leader.initials = leader.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase();
      }
      writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`);

      // Two more runs: the hand-edit must survive both, with no warning
      // suppressed and no manual re-editing required.
      snapshotLegacyTemplates(outDir, MODULE_TEMPLATES);
      const third = snapshotLegacyTemplates(outDir, MODULE_TEMPLATES);

      expect(third.skipped).toEqual(["opinion-leaders"]);
      expect(third.written).not.toContain("opinion-leaders");
      expect(third.written).toContain("newswire"); // an untouched file keeps being written normally

      const after = JSON.parse(readFileSync(path, "utf8")) as { leaders: OpinionLeaderRow[] };
      expect(after.leaders.every((leader) => Boolean(leader.initials))).toBe(true);
    });
  });

  it("overwrites a file whose content still matches the generated template", () => {
    withTempDir((outDir) => {
      snapshotLegacyTemplates(outDir, MODULE_TEMPLATES);
      const second = snapshotLegacyTemplates(outDir, MODULE_TEMPLATES);
      expect(second.skipped).toEqual([]);
      expect(second.written.sort()).toEqual(Object.keys(MODULE_TEMPLATES).sort());
    });
  });
});
