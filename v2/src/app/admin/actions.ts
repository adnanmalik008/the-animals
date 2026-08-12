"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addBoardUser,
  createBoard,
  deleteBoard,
  getBoardBySlug,
  removeBoardUser,
  setModuleData,
  updateBoard,
} from "@/lib/server/boards";
import { requireAdmin } from "@/lib/server/guard";

export interface ActionState {
  error?: string;
  ok?: boolean;
}

function fail(e: unknown): ActionState {
  return { error: e instanceof Error ? e.message : "Something went wrong." };
}

export async function createBoardAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const clientName = String(formData.get("clientName") ?? "").trim();
  if (!/^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/.test(slug)) {
    return { error: "Slug must be lowercase letters, numbers and dashes (this becomes the subdomain)." };
  }
  if (!clientName) return { error: "Client name is required." };
  try {
    await createBoard({ slug, clientName });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/admin");
  redirect(`/admin/${slug}`);
}

export async function updateBoardAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const board = await getBoardBySlug(slug);
  if (!board || board.id === "fixture") return { error: "Board not found (is the CMS configured?)." };
  try {
    await updateBoard(board.id, {
      clientName: String(formData.get("clientName") ?? board.clientName),
      briefDate: String(formData.get("briefDate") ?? board.briefDate),
      briefQuestion: String(formData.get("briefQuestion") ?? board.briefQuestion),
      progressPct: Math.min(100, Math.max(0, Number(formData.get("progressPct") ?? board.progressPct) || 0)),
      userDisplayName: String(formData.get("userDisplayName") ?? board.userDisplayName),
      isProtected: formData.get("isProtected") === "on",
    });
  } catch (e) {
    return fail(e);
  }
  revalidatePath(`/admin/${slug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteBoardAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const board = await getBoardBySlug(slug);
  if (board && board.id !== "fixture") await deleteBoard(board.id);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function saveModuleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const moduleKey = String(formData.get("moduleKey") ?? "").trim();
  const raw = String(formData.get("json") ?? "");
  const board = await getBoardBySlug(slug);
  if (!board || board.id === "fixture") return { error: "Board not found (is the CMS configured?)." };
  if (!moduleKey) return { error: "Module key is required." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON — fix the syntax and save again." };
  }
  try {
    await setModuleData(board.id, moduleKey, parsed);
  } catch (e) {
    return fail(e);
  }
  revalidatePath(`/admin/${slug}`);
  revalidatePath("/");
  revalidatePath("/in-the-wild");
  return { ok: true };
}

export async function addUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const board = await getBoardBySlug(slug);
  if (!board || board.id === "fixture") return { error: "Board not found (is the CMS configured?)." };
  if (username.length < 2) return { error: "Username must be at least 2 characters." };
  try {
    await addBoardUser(board.id, username, password);
  } catch (e) {
    return fail(e);
  }
  revalidatePath(`/admin/${slug}`);
  return { ok: true };
}

export async function removeUserAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("userId"));
  const slug = String(formData.get("slug") ?? "");
  if (Number.isFinite(id)) await removeBoardUser(id);
  revalidatePath(`/admin/${slug}`);
}
