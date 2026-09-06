/* The server read/write path with no Supabase configured — the mode the app
   falls back to whenever the CMS is unreachable. Nothing here may touch the
   network: `supabaseAdmin()` is null without env vars, and the "fixture"
   board id short-circuits before any query either way. The query-failure
   branch is reached through `readResult`, the pure mapper the two reads
   share, so no Supabase client has to be faked to exercise it. */
import { describe, expect, it } from "vitest";
import {
  defaultsRead,
  getBoardDocs,
  getDefaultRows,
  getModuleRows,
  readResult,
  saveDefaultDoc,
  saveModuleDoc,
} from "@/lib/server/docs";
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

/* Shared defaults live in `module_defaults`, which does not exist until Adnan
   runs 0002_cms.sql. Every payload below was captured from the live project
   with the migration unapplied (a read-only probe over PostgREST), so these
   are the exact shapes the app meets today. */
describe("defaultsRead", () => {
  const missingTable = {
    code: "PGRST205",
    details: null,
    hint: "Perhaps you meant the table 'public.module_data'",
    message: "Could not find the table 'public.module_defaults' in the schema cache",
  };

  it("reads rows when the table is there", () => {
    const rows = [{ module_key: "wild-cams", data: { cams: [] } }];
    expect(defaultsRead({ data: rows, error: null })).toEqual({ ok: true, rows, available: true });
  });

  it("reports an empty table as an empty read, not as an absent one", () => {
    expect(defaultsRead({ data: [], error: null })).toEqual({ ok: true, rows: [], available: true });
  });

  /* The pre-migration state, and the whole point of this branch: no shared
     defaults yet is the *expected* answer, so boards carry on with fixtures. */
  it("treats PostgREST's schema-cache miss as 'no shared defaults yet'", () => {
    expect(defaultsRead({ data: null, error: missingTable })).toEqual({
      ok: true,
      rows: [],
      available: false,
    });
  });

  it("treats Postgres's undefined_table the same way", () => {
    const res = defaultsRead({
      data: null,
      error: { code: "42P01", message: 'relation "public.module_defaults" does not exist' },
    });
    expect(res).toEqual({ ok: true, rows: [], available: false });
  });

  /* The distinction the previous milestone was built around: a database blip
     must never read as "there is nothing here". */
  it("keeps a genuine query failure a failure", () => {
    const res = defaultsRead({ data: null, error: { code: "42703", message: "column does not exist" } });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("column does not exist");
  });

  it("keeps a transport failure — which carries no code — a failure", () => {
    const res = defaultsRead({ data: null, error: { message: "TypeError: fetch failed" } });
    expect(res.ok).toBe(false);
  });

  /* Matching the code, never the message: an unrelated failure that happens to
     name the table must not be mistaken for the migration being unapplied. */
  it("does not read 'no such table' out of a failure's wording", () => {
    const res = defaultsRead({
      data: null,
      error: { code: "57014", message: "canceling statement: could not find the table in time" },
    });
    expect(res.ok).toBe(false);
  });
});

describe("getDefaultRows", () => {
  it("reports no shared defaults, and no table, in fixture mode", async () => {
    await expect(getDefaultRows()).resolves.toEqual({ ok: true, rows: [], available: false });
  });
});

describe("saveDefaultDoc", () => {
  /* A shared default lands on every board at once, so an unvalidatable key has
     no shared copy at all — unlike `saveModuleDoc`, which still stores raw JSON
     for the keys that have no definition yet. */
  it("refuses a key with no module definition", async () => {
    const res = await saveDefaultDoc("reddit", { anything: true });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/no module definition/);
  });

  it("rejects a doc that fails its definition, before writing anything", async () => {
    const res = await saveDefaultDoc("newswire", { items: [] });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(Object.keys(res.fieldErrors)).toContain("items");
  });
});
