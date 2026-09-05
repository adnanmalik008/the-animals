/* The server read/write path with no Supabase configured — the mode the app
   falls back to whenever the CMS is unreachable. Nothing here may touch the
   network: `supabaseAdmin()` is null without env vars, and the "fixture"
   board id short-circuits before any query either way. */
import { describe, expect, it } from "vitest";
import { getBoardDocs, getModuleRows, saveModuleDoc } from "@/lib/server/docs";
import { MODULES } from "@/lib/cms/registry";

describe("getBoardDocs", () => {
  it("serves every registry key's fixture, marked default", async () => {
    const { docs, status } = await getBoardDocs("fixture");

    expect(Object.keys(docs).sort()).toEqual(MODULES.map((m) => m.key).sort());
    for (const def of MODULES) {
      expect(status[def.key]).toBe("default");
      expect(docs[def.key]).toEqual(def.fixture());
    }
  });
});

describe("getModuleRows", () => {
  it("reports no saved rows in fixture mode", async () => {
    await expect(getModuleRows("fixture")).resolves.toEqual([]);
  });
});

describe("saveModuleDoc", () => {
  /* The write is unreachable here — setModuleData throws without Supabase —
     so a clean rejection proves validation happens before any upsert. */
  it("rejects a doc that fails its definition, before writing anything", async () => {
    const res = await saveModuleDoc("fixture", "newswire", { items: [] });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/needs? attention/);
      expect(Object.keys(res.fieldErrors)).toContain("items");
    }
  });
});
