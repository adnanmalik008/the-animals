/* The server read/write path with no Supabase configured — the mode the app
   falls back to whenever the CMS is unreachable. Nothing here may touch the
   network: `supabaseAdmin()` is null without env vars, so every read returns
   early. The query-failure branches are reached through `readResult` and
   `contentRead`, the pure mappers the reads share, so no Supabase client has
   to be faked to exercise them. */
import { describe, expect, it } from "vitest";
import {
  contentRead,
  getContentDocs,
  getContentRowInfos,
  getContentRows,
  readResult,
  saveContentDoc,
} from "@/lib/server/docs";
import { MODULES } from "@/lib/cms/registry";

describe("getContentDocs", () => {
  it("serves every registry key's fixture, marked default", async () => {
    const { docs, status } = await getContentDocs();

    expect(Object.keys(docs).sort()).toEqual(MODULES.map((m) => m.key).sort());
    for (const def of MODULES) {
      expect(status[def.key]).toBe("default");
      expect(docs[def.key]).toEqual(def.fixture());
    }
  });
});

describe("getContentRows", () => {
  it("reports nothing saved, and no table, with no Supabase configured", async () => {
    await expect(getContentRows()).resolves.toEqual({ ok: true, rows: [], available: false });
  });
});

describe("getContentRowInfos", () => {
  /* Same answer as `getContentRows` and for the same reason, but this is the
     read the admin screens use, so it is pinned separately: "nothing saved,
     and nowhere to save it" is not a failed read. */
  it("reports an empty, unavailable table rather than an error", async () => {
    await expect(getContentRowInfos()).resolves.toEqual({ ok: true, rows: [], available: false });
  });
});

/* The finding this guards: a failed query used to return the same empty
   result as nothing being saved, so the admin would show "Default template"
   and the next Save would overwrite the real document. */
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

/* Content lives in `module_content`, which does not exist until Adnan runs
   0002_cms.sql. Every payload below was captured from the live project with
   the migration unapplied (a read-only probe over PostgREST), so these are the
   exact shapes the app meets today — only the table name has moved. */
describe("contentRead", () => {
  const missingTable = {
    code: "PGRST205",
    details: null,
    hint: "Perhaps you meant the table 'public.module_data'",
    message: "Could not find the table 'public.module_content' in the schema cache",
  };

  it("reads rows when the table is there", () => {
    const rows = [{ module_key: "wild-cams", data: { cams: [] } }];
    expect(contentRead({ data: rows, error: null })).toEqual({ ok: true, rows, available: true });
  });

  it("reports an empty table as an empty read, not as an absent one", () => {
    expect(contentRead({ data: [], error: null })).toEqual({ ok: true, rows: [], available: true });
  });

  /* The pre-migration state, and the whole point of this branch: nothing
     saved yet is the *expected* answer, so boards carry on with fixtures. */
  it("treats PostgREST's schema-cache miss as 'nothing saved yet'", () => {
    expect(contentRead({ data: null, error: missingTable })).toEqual({
      ok: true,
      rows: [],
      available: false,
    });
  });

  it("treats Postgres's undefined_table the same way", () => {
    const res = contentRead({
      data: null,
      error: { code: "42P01", message: 'relation "public.module_content" does not exist' },
    });
    expect(res).toEqual({ ok: true, rows: [], available: false });
  });

  /* The distinction the previous milestone was built around: a database blip
     must never read as "there is nothing here". */
  it("keeps a genuine query failure a failure", () => {
    const res = contentRead({ data: null, error: { code: "42703", message: "column does not exist" } });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("column does not exist");
  });

  it("keeps a transport failure — which carries no code — a failure", () => {
    const res = contentRead({ data: null, error: { message: "TypeError: fetch failed" } });
    expect(res.ok).toBe(false);
  });

  /* Matching the code, never the message: an unrelated failure that happens to
     name the table must not be mistaken for the migration being unapplied. */
  it("does not read 'no such table' out of a failure's wording", () => {
    const res = contentRead({
      data: null,
      error: { code: "57014", message: "canceling statement: could not find the table in time" },
    });
    expect(res.ok).toBe(false);
  });
});

describe("saveContentDoc", () => {
  /* The write is unreachable here — setModuleContent throws without Supabase —
     so a clean rejection proves validation happens before any upsert. */
  it("rejects a doc that fails its definition, before writing anything", async () => {
    const res = await saveContentDoc("newswire", { items: [] });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/needs? attention/);
      expect(Object.keys(res.fieldErrors)).toContain("items");
    }
  });

  /* A key with no definition has no schema to check it against, so it keeps
     the contract it has always had: the raw JSON goes to the table as typed.
     It gets that far — the failure below is the missing write, not a refusal. */
  it("sends an unmanaged key's raw JSON to the table rather than refusing it", async () => {
    await expect(saveContentDoc("reddit", { anything: true })).rejects.toThrow(/not configured/);
  });
});
