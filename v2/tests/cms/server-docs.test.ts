/* The server read/write path with no Supabase configured — the mode the app
   falls back to whenever the CMS is unreachable. Nothing here may touch the
   network: `supabaseAdmin()` is null without env vars, and the "fixture"
   board id short-circuits before any query either way. The query-failure
   branch is reached through `readResult`, the pure mapper the two reads
   share, so no Supabase client has to be faked to exercise it. */
import { describe, expect, it } from "vitest";
import { getBoardDocs, getModuleRows, readResult, saveModuleDoc } from "@/lib/server/docs";
import { MODULES } from "@/lib/cms/registry";

describe("getBoardDocs", () => {
  it("serves every registry key's fixture, marked default", async () => {
    const { docs, status, unavailable } = await getBoardDocs("fixture");

    expect(Object.keys(docs).sort()).toEqual(MODULES.map((m) => m.key).sort());
    for (const def of MODULES) {
      expect(status[def.key]).toBe("default");
      expect(docs[def.key]).toEqual(def.fixture());
    }
    // Nothing was queried, so nothing failed: these fixtures mean "nothing saved".
    expect(unavailable).toBe(false);
  });
});

describe("getModuleRows", () => {
  it("reports no saved rows in fixture mode, as a successful read", async () => {
    await expect(getModuleRows("fixture")).resolves.toEqual({ ok: true, rows: [] });
  });
});

/* The finding this guards: a failed query used to return the same empty
   result as a board with nothing saved, so the admin would show "Default
   template" and the next Save would overwrite the board's real document. */
describe("readResult", () => {
  it("passes rows through when the query succeeded", () => {
    const rows = [{ module_key: "newswire", data: { items: [] } }];
    expect(readResult({ data: rows, error: null })).toEqual({ ok: true, rows });
  });

  it("keeps an empty result distinct from a failure", () => {
    const empty = readResult({ data: [], error: null });
    expect(empty).toEqual({ ok: true, rows: [] });
  });

  it("reports a query error rather than collapsing it into 'nothing saved'", () => {
    const failed = readResult({ data: null, error: { message: "connection terminated" } });
    expect(failed.ok).toBe(false);
    if (!failed.ok) expect(failed.error).toBe("connection terminated");
  });

  it("treats a result with neither rows nor an error as a failure too", () => {
    const odd = readResult({ data: null, error: null });
    expect(odd.ok).toBe(false);
    if (!odd.ok) expect(odd.error).toMatch(/neither rows nor an error/);
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
