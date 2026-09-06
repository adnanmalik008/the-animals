/* The session secret.

   Sessions are stateless: a cookie is `{username, role, boardSlug, exp}` plus
   an HMAC over it. Whoever knows the key can mint `{role:"admin",
   boardSlug:"*"}` and read, edit, publish and delete every client board — so
   the key is the whole of the product's access control, and the development
   fallback for it is a fixed string committed to this repository.

   An unset SESSION_SECRET in production therefore does not degrade the
   product; it removes the lock. Refusing to sign is the only safe answer:
   nobody can log in, which is loud, recoverable, and a great deal better than
   a login page that quietly accepts forged cookies. */
import { afterEach, describe, expect, it } from "vitest";
import { decodeSession, encodeSession, sessionSecret, type Session } from "@/lib/server/session";

const FALLBACK = "dev-only-secret-change-me";

const savedSecret = process.env.SESSION_SECRET;
afterEach(() => {
  /* Only SESSION_SECRET is ever mutated here; NODE_ENV is passed in rather
     than set, so a test cannot leave the process looking like production. */
  process.env.SESSION_SECRET = savedSecret;
});

/** A stand-in environment. `sessionSecret` takes one so both branches are
    reachable without changing the environment the suite itself runs in. */
function env(nodeEnv: string, secret?: string): NodeJS.ProcessEnv {
  return {
    NODE_ENV: nodeEnv,
    ...(secret === undefined ? {} : { SESSION_SECRET: secret }),
  } as NodeJS.ProcessEnv;
}

describe("sessionSecret in production", () => {
  it("refuses to sign when SESSION_SECRET is unset", () => {
    expect(() => sessionSecret(env("production"))).toThrow(/SESSION_SECRET/);
  });

  it("refuses the committed development fallback, which is the same as unset", () => {
    expect(() => sessionSecret(env("production", FALLBACK))).toThrow(/SESSION_SECRET/);
    /* and an empty or whitespace-only value is unset with extra steps */
    expect(() => sessionSecret(env("production", ""))).toThrow(/SESSION_SECRET/);
    expect(() => sessionSecret(env("production", "   "))).toThrow(/SESSION_SECRET/);
    expect(() => sessionSecret(env("production", ` ${FALLBACK} `))).toThrow(/SESSION_SECRET/);
  });

  it("accepts a real secret", () => {
    expect(sessionSecret(env("production", "a-real-32-byte-random-string-here"))).toBe(
      "a-real-32-byte-random-string-here"
    );
  });
});

describe("sessionSecret outside production", () => {
  it("falls back so development and the test suite need no configuration", () => {
    expect(sessionSecret(env("development"))).toBe(FALLBACK);
    expect(sessionSecret(env("test"))).toBe(FALLBACK);
    expect(sessionSecret(env("development", "local"))).toBe("local");
  });
});

describe("the cookie the secret signs", () => {
  const session: Session = {
    username: "animals-admin",
    role: "admin",
    boardSlug: "*",
    exp: Math.floor(Date.now() / 1000) + 60,
  };

  it("round-trips a session it signed itself", () => {
    expect(decodeSession(encodeSession(session))).toEqual(session);
  });

  it("rejects a session signed with a different secret", () => {
    /* The reason the fallback matters: this is exactly what an attacker can do
       when the key is the one printed in this repository. */
    const token = encodeSession(session);
    process.env.SESSION_SECRET = "some-other-secret";
    expect(decodeSession(token)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const [payload, sig] = encodeSession(session).split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...session, username: "someone-else" }),
      "utf8"
    ).toString("base64url");
    expect(forged).not.toBe(payload);
    expect(decodeSession(`${forged}.${sig}`)).toBeNull();
  });
});
