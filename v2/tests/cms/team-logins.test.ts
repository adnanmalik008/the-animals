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
import { addAdminUser, checkAdminLogin, teamAdminHash } from "@/lib/server/boards";

/** A bcrypt hash of "correct horse" — never compared here (that is bcryptjs's
    job), only carried through, so the tests can assert *which* hash came
    back rather than merely that something did. */
const HASH = "$2b$10$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPQRSTU";

/** The one row that is a team admin: board-less, role admin, exact name,
    non-empty hash. Every case below mutates one field of this. */
function okRow(over: Record<string, unknown> = {}) {
  return { username: "adnan", role: "admin", board_id: null, password_hash: HASH, ...over };
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

  it("says no for a row that is not an object at all", () => {
    for (const row of [null, undefined, "adnan", 7, []]) {
      expect(teamAdminHash({ data: [row], error: null }, "adnan")).toBeNull();
    }
  });

  it("says no for an empty result — the state of the table until the migration runs", () => {
    expect(teamAdminHash({ data: [], error: null }, "adnan")).toBeNull();
  });
});

describe("checkAdminLogin", () => {
  it("is false with no Supabase configured, before any credential is considered", async () => {
    /* No env vars under vitest, so `supabaseAdmin()` is null and nothing here
       touches the network. The point is the answer, not the query. */
    await expect(checkAdminLogin("adnan", "correct horse")).resolves.toBe(false);
  });

  it("is false for a blank username or password without asking the database", async () => {
    await expect(checkAdminLogin("", "correct horse")).resolves.toBe(false);
    await expect(checkAdminLogin("adnan", "")).resolves.toBe(false);
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
