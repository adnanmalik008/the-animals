"use server";

import { redirect } from "next/navigation";
import { checkBoardLogin, checkEnvAdmin, resolveBoardSlug } from "@/lib/server/boards";
import { clearSession, setSession } from "@/lib/server/session";

export interface LoginState {
  error?: string;
}

function safeNext(raw: unknown): string {
  const next = typeof raw === "string" ? raw : "/";
  // internal paths only — no protocol-relative or absolute URLs
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!username || !password) return { error: "Enter a username and password." };

  // env-bootstrap admin works with or without the CMS configured
  if (checkEnvAdmin(username, password)) {
    await setSession({ username, role: "admin", boardSlug: "*" });
    redirect(next);
  }

  const boardSlug = await resolveBoardSlug();
  const result = await checkBoardLogin(boardSlug, username, password);
  if (!result.ok) return { error: "Wrong username or password for this board." };

  await setSession({
    username,
    role: result.role,
    boardSlug: result.role === "admin" ? "*" : boardSlug,
  });
  redirect(next);
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
