/* The per-board login lookup, on its own.

   `checkBoardLogin` reaches Supabase, so the part worth testing is split out
   of it the same way `teamAdminHash` is split out of `checkAdminLogin`:
   `boardLoginMatch` is the whole decision about whether the row that came back
   is the person who typed the name, and `likeLiteral` is the escaping that
   decides which rows can come back at all.

   The name has to be re-checked in JavaScript because the query cannot be
   trusted to have matched it exactly: PostgREST rewrites a literal `*` in an
   `ilike` value to `%`, and no backslash survives that rewrite. On a board with
   exactly one login, `*` would otherwise match that row through `maybeSingle`
   and authenticate against its hash — no privilege escalation, but a username
   that is optional is half a credential. */
import { describe, expect, it } from "vitest";
import { boardLoginMatch, likeLiteral } from "@/lib/server/boards";

const HASH = "$2b$10$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPQRSTU";

/** The row `maybeSingle` hands back for the board login "adam". */
function okRow(over: Record<string, unknown> = {}) {
  return { username: "adam", role: "client", password_hash: HASH, ...over };
}

describe("likeLiteral", () => {
  it("leaves an ordinary username alone", () => {
    expect(likeLiteral("adam")).toBe("adam");
    expect(likeLiteral("ad.am_")).toBe("ad.am\\_");
  });

  it("escapes every LIKE metacharacter, the backslash included", () => {
    /* The escape character has to be escaped first, or it re-arms the
       character after it: the username a\_b would otherwise go out as the
       pattern a\\_b, which LIKE reads as a literal backslash followed by a
       live _ wildcard. */
    expect(likeLiteral("a%b")).toBe("a\\%b");
    expect(likeLiteral("a_b")).toBe("a\\_b");
    expect(likeLiteral("a\\b")).toBe("a\\\\b");
    expect(likeLiteral("a\\_b")).toBe("a\\\\\\_b");
  });

  it("cannot help with `*`, which is why the re-check exists", () => {
    /* PostgREST rewrites `*` to `%` in the value after any escaping we do, so
       this passes through untouched and widens the query. `boardLoginMatch`
       below is what stops it mattering. */
    expect(likeLiteral("*")).toBe("*");
  });
});

describe("boardLoginMatch", () => {
  it("returns the row for the exact name, casefolded and trimmed", () => {
    expect(boardLoginMatch(okRow(), "adam")).toEqual({ password_hash: HASH, role: "client" });
    expect(boardLoginMatch(okRow({ username: "AdAm" }), "adam")).toEqual({
      password_hash: HASH,
      role: "client",
    });
    expect(boardLoginMatch(okRow(), "  ADAM  ")).toEqual({ password_hash: HASH, role: "client" });
  });

  it("carries the admin role through when the row has one", () => {
    expect(boardLoginMatch(okRow({ role: "admin" }), "adam")).toEqual({
      password_hash: HASH,
      role: "admin",
    });
    /* anything that is not exactly "admin" is a client, as before */
    for (const role of ["ADMIN", "", null, undefined, 1, "client"]) {
      expect(boardLoginMatch(okRow({ role }), "adam")?.role).toBe("client");
    }
  });

  it("says no to a wildcard typed in place of a username", () => {
    /* The bug this function exists for. `*` reaches PostgREST as `%`, matches
       the board's only login, and `maybeSingle` hands it over. */
    for (const typed of ["*", "%", "_", "a%", "%m", "ad_m", "a*"]) {
      expect(boardLoginMatch(okRow(), typed)).toBeNull();
    }
  });

  it("says no to a prefix, a suffix or a blank name", () => {
    for (const typed of ["ada", "adamx", "adam x", "", "   "]) {
      expect(boardLoginMatch(okRow(), typed)).toBeNull();
    }
  });

  it("says no when the row carries no username to check against", () => {
    expect(boardLoginMatch({ password_hash: HASH, role: "client" }, "adam")).toBeNull();
    for (const username of [null, undefined, 42, ["adam"]]) {
      expect(boardLoginMatch(okRow({ username }), "adam")).toBeNull();
    }
  });

  it("says no when there is no hash to check, or no row at all", () => {
    for (const password_hash of [undefined, null, "", 0, {}]) {
      expect(boardLoginMatch(okRow({ password_hash }), "adam")).toBeNull();
    }
    for (const data of [null, undefined, "adam", 7, [okRow()]]) {
      expect(boardLoginMatch(data, "adam")).toBeNull();
    }
  });

  it("says no for a non-string name, rather than throwing on it", () => {
    const loose = boardLoginMatch as unknown as (d: unknown, u: unknown) => unknown;
    for (const typed of [null, undefined, 42, ["adam"]]) {
      expect(loose(okRow(), typed)).toBeNull();
    }
  });
});
