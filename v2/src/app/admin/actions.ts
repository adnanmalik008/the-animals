"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addBoardUser,
  createBoard,
  deleteBoard,
  getBoardBySlug,
  removeBoardUser,
  updateBoard,
} from "@/lib/server/boards";
import { saveDefaultDoc, saveModuleDoc } from "@/lib/server/docs";
import { revalidateBoard, revalidateSharedDefault } from "@/lib/server/revalidate";
import { requireAdmin } from "@/lib/server/guard";

export interface ActionState {
  error?: string;
  ok?: boolean;
  /** dotted field path → message, when a doc failed its module definition */
  fieldErrors?: Record<string, string>;
  savedAt?: number;
  /** the normalised doc that was stored */
  doc?: unknown;
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
  /* /admin/defaults is the shared-content screen, and a static segment beats a
     dynamic one — a board on this slug would publish fine and then be
     unreachable in the admin */
  if (slug === "defaults") return { error: '"defaults" is reserved by the admin — pick another slug.' };
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
  revalidateBoard(slug);
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

/* The two module-form actions. Both scopes submit the same form — a module
   key and the document as JSON — and both answer with the same
   `{ ok, savedAt, doc, fieldErrors }`, because the form that reads the answer
   is one component. Only the table underneath and what has to be dropped from
   the cache afterwards differ. */

interface DocSubmission {
  moduleKey: string;
  doc: unknown;
}

/** The half of a save that is identical either side: a module key, and JSON
    that has to parse before anything else is worth doing. */
function readSubmission(formData: FormData): DocSubmission | ActionState {
  const moduleKey = String(formData.get("moduleKey") ?? "").trim();
  if (!moduleKey) return { error: "Module key is required." };
  try {
    return { moduleKey, doc: JSON.parse(String(formData.get("doc") ?? "")) };
  } catch {
    return { error: "Invalid JSON — fix the syntax and save again." };
  }
}

const isSubmission = (v: DocSubmission | ActionState): v is DocSubmission => "moduleKey" in v;

export async function saveModuleDocAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const sub = readSubmission(formData);
  if (!isSubmission(sub)) return sub;

  const slug = String(formData.get("slug") ?? "");
  const board = await getBoardBySlug(slug);
  if (!board || board.id === "fixture") return { error: "Board not found (is the CMS configured?)." };

  let result;
  try {
    result = await saveModuleDoc(board.id, sub.moduleKey, sub.doc);
  } catch (e) {
    return fail(e);
  }
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors };
  revalidateBoard(slug, sub.moduleKey);
  return { ok: true, savedAt: Date.now(), doc: result.doc };
}

/** The agency-wide copy of one module. `setDefaultData` throws when the table
    is not there — until `0002_cms.sql` is applied that is every save — and
    `fail` turns it into the form's ordinary error line. Reads shrug the
    missing table off and serve fixtures; a write must not, because a save
    that quietly went nowhere is worse than one that visibly failed. */
export async function saveDefaultDocAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const sub = readSubmission(formData);
  if (!isSubmission(sub)) return sub;

  let result;
  try {
    result = await saveDefaultDoc(sub.moduleKey, sub.doc);
  } catch (e) {
    return fail(e);
  }
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors };
  revalidateSharedDefault(sub.moduleKey);
  return { ok: true, savedAt: Date.now(), doc: result.doc };
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
