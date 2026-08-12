import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/* Stateless signed session cookie (HMAC-SHA256).
   Small, dependency-free alternative to a JWT lib — payload is
   base64url JSON + signature, verified with SESSION_SECRET. */

export interface Session {
  username: string;
  role: "admin" | "client";
  /** board slug a client login is scoped to; admins get "*" */
  boardSlug: string;
  /** unix seconds */
  exp: number;
}

const COOKIE_NAME = "animals_session";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.SESSION_SECRET || "dev-only-secret-change-me";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

export function encodeSession(session: Session): string {
  const payload = b64url(Buffer.from(JSON.stringify(session), "utf8"));
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (typeof session.exp !== "number" || session.exp * 1000 < Date.now()) return null;
    if (session.role !== "admin" && session.role !== "client") return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE_NAME)?.value);
}

export async function setSession(session: Omit<Session, "exp">) {
  const store = await cookies();
  const full: Session = { ...session, exp: Math.floor(Date.now() / 1000) + MAX_AGE_S };
  store.set(COOKIE_NAME, encodeSession(full), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/* A client session unlocks its own board; admins unlock everything. */
export function sessionAllowsBoard(session: Session | null, boardSlug: string): boolean {
  if (!session) return false;
  if (session.role === "admin") return true;
  return session.boardSlug === boardSlug;
}
