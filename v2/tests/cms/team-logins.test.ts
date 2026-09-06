/* The team-login decision, on its own.

   `teamAdminHash` is the whole of it: given what Supabase answered and the
   name that was typed, either the one bcrypt hash to check against, or null
   for "not a team admin". It is pure precisely so this file can exist —
   0002_cms.sql is unapplied, `board_users.board_id` is still NOT NULL, and no
   row in the real table can satisfy the query these results stand in for.

   Every test below is the happy row with exactly one thing changed, so a null
   names its own reason: an authentication check that answers yes on a query
   error, an unexpected shape or an approximate name match is a bypass, not a
   bug. */
import { describe, expect, it } from "vitest";
import { hash } from "bcryptjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  addAdminUser,
  adminUsersRead,
  checkAdminLogin,
  teamAdminHash,
  type TeamAdminQuery,
} from "@/lib/server/boards";

/** A bcrypt hash of "correct horse" — never compared here (that is bcryptjs's
    job), only carried through, so the tests can assert *which* hash came
    back rather than merely that something did. */
const HASH = "$2b$10$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPQRSTU";

/** The one row that is a team admin: board-less, role admin, exact name,
    non-empty hash. Every case below mutates one field of this. */
function okRow(over: Record<string, unknown> = {}) {
  return { username: "adnan", role: "admin", board_id: null, password_hash: HASH, ...over };
}

/** `okRow` with a key removed outright, which is not the same thing as a key
    whose value is undefined: it is the shape a select that did not name the
    column would hand back. */
function rowWithout(key: string): Record<string, unknown> {
  const row: Record<string, unknown> = okRow();
  delete row[key];
  return row;
}

describe("teamAdminHash — the yes", () => {
  it("returns the hash for a board-less admin row whose name matches", () => {
    expect(teamAdminHash({ data: [okRow()], error: null }, "adnan")).toBe(HASH);
  });

  it("matches the name case-insensitively, as `ilike` does, but still exactly", () => {
    expect(teamAdminHash({ data: [okRow({ username: "AdNaN" })], error: null }, "adnan")).toBe(HASH);
    expect(teamAdminHash({ data: [okRow()], error: null }, "  ADNAN  ")).toBe(HASH);
  });

  it("ignores the other rows the query returned when exactly one is the admin", () => {
    /* `ilike` is a pattern match and the query is bounded, not exact: a result
       may legitimately carry rows for other names. One match is still a yes. */
    const data = [okRow({ username: "adnan-old", password_hash: "other" }), okRow()];
    expect(teamAdminHash({ data, error: null }, "adnan")).toBe(HASH);
  });
});

describe("teamAdminHash — the noes", () => {
  it("says no when the query errored: a failed read is not a credential", () => {
    /* This is today's reality on any deployment where the table or column is
       not what the query expects. It must never read as "yes". */
    expect(teamAdminHash({ data: [okRow()], error: { message: "column does not exist" } }, "adnan")).toBeNull();
    expect(teamAdminHash({ data: null, error: { code: "PGRST205" } }, "adnan")).toBeNull();
  });

  it("says no when data is not an array — no shape to read a row out of", () => {
    for (const data of [null, undefined, {}, "adnan", 0, okRow()]) {
      expect(teamAdminHash({ data, error: null }, "adnan")).toBeNull();
    }
  });

  it("says no for a row that has a board_id: that is a board login, not a team one", () => {
    const boardScoped = okRow({ board_id: "0f2a5f4e-0000-4000-8000-000000000001" });
    expect(teamAdminHash({ data: [boardScoped], error: null }, "adnan")).toBeNull();
    /* and no partner row can rescue it — the whole result is board-scoped */
    expect(teamAdminHash({ data: [boardScoped, boardScoped], error: null }, "adnan")).toBeNull();
  });

  it("says no for a row with no board_id key at all, and for an undefined one", () => {
    /* The select names the column and PostgREST always returns what it was
       asked for, so this is unreachable today. It is also the entire reason the
       re-check exists: a second check earns its keep only when the first one
       stops being what the reader assumed. "Absent" is not "board-less" — it is
       a row this function cannot vouch for. */
    expect(teamAdminHash({ data: [rowWithout("board_id")], error: null }, "adnan")).toBeNull();
    expect(teamAdminHash({ data: [okRow({ board_id: undefined })], error: null }, "adnan")).toBeNull();
    /* the happy variant alongside, so the nulls above name their own cause */
    expect(teamAdminHash({ data: [okRow()], error: null }, "adnan")).toBe(HASH);
  });

  it("says no for a row whose role is not admin, however board-less it is", () => {
    for (const role of ["client", "ADMIN", "", null, undefined, 1]) {
      expect(teamAdminHash({ data: [okRow({ role })], error: null }, "adnan")).toBeNull();
    }
  });

  it("says no when the username is not an exact match after casefolding", () => {
    /* `ilike` was given an escaped literal, but the filter is the server's
       word for it and this is the check that does not take its word. A prefix,
       a suffix, a wildcard and a non-string all miss. */
    for (const username of ["adnanx", "adnan ", "dnan", "a", "%", "adnan%", 42, null]) {
      expect(teamAdminHash({ data: [okRow({ username })], error: null }, "adnan")).toBeNull();
    }
    /* and the pattern typed by the caller is not a pattern either */
    expect(teamAdminHash({ data: [okRow()], error: null }, "adna%")).toBeNull();
    expect(teamAdminHash({ data: [okRow()], error: null }, "adna_")).toBeNull();
  });

  it("says no for a blank name, so an empty form cannot match a blank row", () => {
    expect(teamAdminHash({ data: [okRow({ username: "" })], error: null }, "")).toBeNull();
    expect(teamAdminHash({ data: [okRow()], error: null }, "   ")).toBeNull();
  });

  it("says no when the hash is missing or empty — there is nothing to check", () => {
    for (const password_hash of [undefined, null, "", 0, {}]) {
      expect(teamAdminHash({ data: [okRow({ password_hash })], error: null }, "adnan")).toBeNull();
    }
  });

  it("says no when two rows match one name — an ambiguous answer is not a yes", () => {
    /* 0002_cms.sql's partial unique index makes this unreachable in the
       database. This is what happens if it ever is reached anyway: the check
       refuses to pick, rather than picking the first hash it finds. */
    const twins = [okRow(), okRow({ password_hash: "$2b$10$second" })];
    expect(teamAdminHash({ data: twins, error: null }, "adnan")).toBeNull();
  });

  it("says no for a non-string name, rather than throwing on one", () => {
    /* `checkAdminLogin` already refuses those, so this is the second lock. A
       throw would be caught and answered "no" anyway; answering it here keeps
       the pure function total. */
    const loose = teamAdminHash as unknown as (q: TeamAdminQuery, u: unknown) => string | null;
    for (const username of [null, undefined, 42, ["adnan"]]) {
      expect(loose({ data: [okRow()], error: null }, username)).toBeNull();
    }
  });

  it("says no for a row that is not an object at all", () => {
    for (const row of [null, undefined, "adnan", 7, []]) {
      expect(teamAdminHash({ data: [row], error: null }, "adnan")).toBeNull();
    }
  });

  it("says no for an empty result — the state of the table until the migration runs", () => {
    expect(teamAdminHash({ data: [], error: null }, "adnan")).toBeNull();
  });
});

/* A stub standing in for `supabaseAdmin()`. `checkAdminLogin` takes the client
   as a parameter for exactly this reason: without it, `supabaseAdmin()` returns
   null under vitest and the `!db` guard answers "no" for every input, so an
   assertion about any *other* guard passes whether that guard exists or not. An
   assertion that cannot fail is worse than none at all in an auth suite. */
function fakeDb(answer: TeamAdminQuery | Error) {
  const seen = { queries: 0, pattern: null as string | null };
  const chain: Record<string, unknown> = {};
  const same = () => chain;
  chain.select = same;
  chain.is = same;
  chain.eq = same;
  chain.ilike = (_column: string, pattern: string) => {
    seen.pattern = pattern;
    return chain;
  };
  chain.limit = async () => {
    if (answer instanceof Error) throw answer;
    return answer;
  };
  const db = {
    from: () => {
      seen.queries += 1;
      return chain;
    },
  };
  return { db: db as unknown as SupabaseClient, seen };
}

describe("checkAdminLogin", () => {
  it("is false with no Supabase configured, before any credential is considered", async () => {
    await expect(checkAdminLogin("adnan", "correct horse", null)).resolves.toBe(false);
  });

  it("is false for a blank username or password *without asking the database*", async () => {
    for (const [username, password] of [
      ["", "correct horse"],
      ["   ", "correct horse"],
      ["adnan", ""],
    ]) {
      const { db, seen } = fakeDb({ data: [], error: null });
      await expect(checkAdminLogin(username, password, db)).resolves.toBe(false);
      expect(seen.queries).toBe(0);
    }
  });

  it("says yes for the right password on a board-less admin row", async () => {
    /* The one path that answers "yes", end to end: the query, the re-check and
       bcrypt. No other test in this file reaches bcrypt at all, so without this
       one every assertion here would still hold if the function had been
       written to return false unconditionally. */
    const stored = await hash("correct horse", 4);
    const { db, seen } = fakeDb({
      data: [{ username: "adnan", role: "admin", board_id: null, password_hash: stored }],
      error: null,
    });
    await expect(checkAdminLogin("  Adnan  ", "correct horse", db)).resolves.toBe(true);
    /* and the name reached the query trimmed, so the pure half and the impure
       half are asking about the same person */
    expect(seen.pattern).toBe("Adnan");
  });

  it("says no for the wrong password against that same row", async () => {
    const stored = await hash("correct horse", 4);
    const { db } = fakeDb({
      data: [{ username: "adnan", role: "admin", board_id: null, password_hash: stored }],
      error: null,
    });
    await expect(checkAdminLogin("adnan", "wrong horse", db)).resolves.toBe(false);
  });

  it("says no when the query errors, even carrying a row that would otherwise match", async () => {
    const stored = await hash("correct horse", 4);
    const { db } = fakeDb({
      data: [{ username: "adnan", role: "admin", board_id: null, password_hash: stored }],
      error: { message: "column board_users.board_id does not exist" },
    });
    await expect(checkAdminLogin("adnan", "correct horse", db)).resolves.toBe(false);
  });

  it("says no when the client throws", async () => {
    const { db } = fakeDb(new Error("fetch failed"));
    await expect(checkAdminLogin("adnan", "correct horse", db)).resolves.toBe(false);
  });

  it("says no for a non-string username or password", async () => {
    /* `login()` stringifies, so this is defence in depth — but a `.trim()` on a
       null is a throw, and a throw here is a 500 on the login form rather than
       a "no". */
    const { db, seen } = fakeDb({ data: [], error: null });
    const loose = checkAdminLogin as unknown as (
      u: unknown,
      p: unknown,
      db: SupabaseClient | null
    ) => Promise<boolean>;
    for (const [username, password] of [
      [null, "correct horse"],
      [42, "correct horse"],
      [["adnan"], "correct horse"],
      ["adnan", null],
    ]) {
      await expect(loose(username, password, db)).resolves.toBe(false);
    }
    expect(seen.queries).toBe(0);
  });
});

describe("addAdminUser", () => {
  /* The rule that keeps wildcards out of the table in the first place, checked
     before the client is looked up so it holds with or without Supabase. */
  it("rejects a username that could become a pattern on the way back in", async () => {
    for (const bad of ["a", "", "%", "ad%nan", "ad nan", "_adnan", "adnan!", "a".repeat(41)]) {
      await expect(addAdminUser(bad, "long enough")).rejects.toThrow(/Username must be/);
    }
  });

  it("rejects a short password", async () => {
    await expect(addAdminUser("adnan", "short")).rejects.toThrow(/at least 8 characters/);
  });

  /* Deliberately no "and a valid pair succeeds" test: `addAdminUser` inserts,
     and a suite that happened to run with the production service-role key in
     the environment would mint a real login. The validation above rejects
     before a client is ever asked for, which is the part worth pinning. */
});

describe("adminUsersRead", () => {
  /* The team-login list is the one screen where "nobody holds agency admin" is
     a claim worth being right about. A failed read must not render as that
     claim: it has to come back as a list the page can still draw *and* a flag
     saying the list is not an answer. `getContentRows` in `server/docs.ts`
     splits the same way for the same reason. */
  function listRow(over: Record<string, unknown> = {}) {
    return {
      id: 7,
      username: "adnan",
      role: "admin",
      board_id: null,
      created_at: "2026-09-01T00:00:00Z",
      ...over,
    };
  }

  it("reports a failed read as a failure, not as an empty agency", () => {
    const failed = adminUsersRead({ data: [listRow()], error: { message: "timeout" } });
    expect(failed).toEqual({ ok: false, users: [] });
    /* a result with no shape to read rows out of is a failure too */
    for (const data of [null, undefined, {}, "adnan", 0]) {
      expect(adminUsersRead({ data, error: null }).ok).toBe(false);
    }
  });

  it("reports an empty table as an empty list that is genuinely empty", () => {
    /* The normal state until 0002_cms.sql runs: board_id is still NOT NULL, so
       `is("board_id", null)` legitimately matches nothing. Nobody has a team
       login, and the screen should say exactly that. */
    expect(adminUsersRead({ data: [], error: null })).toEqual({ ok: true, users: [] });
  });

  it("lists a board-less admin row", () => {
    expect(adminUsersRead({ data: [listRow()], error: null })).toEqual({
      ok: true,
      users: [{ id: 7, username: "adnan", role: "admin", createdAt: "2026-09-01T00:00:00Z" }],
    });
  });

  it("takes a stringified bigint id, so the list does not silently empty", () => {
    /* `id` is a Postgres bigint. PostgREST sends it as a JSON number today; if
       that ever changed, dropping every row would read as "nobody holds agency
       admin" — the exact confusion this read is meant to prevent. */
    expect(adminUsersRead({ data: [listRow({ id: "7" })], error: null }).users[0]?.id).toBe(7);
  });

  it("still lists a row whose created_at is missing", () => {
    /* The timestamp is decoration; the row is real and must stay removable. */
    expect(adminUsersRead({ data: [listRow({ created_at: undefined })], error: null }).users).toEqual([
      { id: 7, username: "adnan", role: "admin", createdAt: "" },
    ]);
  });

  it("drops any row that is not a board-less admin, however it got into the result", () => {
    /* Every row listed here is offered a Remove button, so the filters are not
       the last word on whether a row belongs. A missing `board_id` key is not
       a board-less row — it is a row nothing has vouched for. */
    for (const row of [
      listRow({ board_id: "0f2a5f4e-0000-4000-8000-000000000001" }),
      listRow({ board_id: undefined }),
      (() => {
        const r: Record<string, unknown> = listRow();
        delete r.board_id;
        return r;
      })(),
      listRow({ role: "client" }),
      listRow({ role: "ADMIN" }),
      listRow({ username: 42 }),
      listRow({ id: 7.5 }),
      listRow({ id: "seven" }),
      listRow({ id: null }),
      null,
      "adnan",
    ]) {
      expect(adminUsersRead({ data: [row], error: null })).toEqual({ ok: true, users: [] });
    }
  });
});
