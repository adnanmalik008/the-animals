"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addAdminUser,
  addBoardUser,
  createBoard,
  deleteBoard,
  getBoardBySlug,
  removeAdminUser,
  removeBoardUser,
  updateBoard,
} from "@/lib/server/boards";
import { saveContentDoc } from "@/lib/server/docs";
import { revalidateBoard, revalidateContent } from "@/lib/server/revalidate";
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
  /* /admin/content is the content screen, and a static segment beats a
     dynamic one — a board on this slug would publish fine and then be
     unreachable in the admin */
  if (slug === "content") return { error: '"content" is reserved by the admin — pick another slug.' };
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

/** The one content save. The form posts a module key and the document as
    JSON; the answer is `{ ok, savedAt, doc, fieldErrors }`, which is what the
    form reads back.

    `setModuleContent` throws when the table is not there — until
    `0002_cms.sql` is applied that is every save — and `fail` turns it into
    the form's ordinary error line. Reads shrug the missing table off and
    serve fixtures; a write must not, because a save that quietly went
    nowhere is worse than one that visibly failed. */
export async function saveContentDocAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const moduleKey = String(formData.get("moduleKey") ?? "").trim();
  if (!moduleKey) return { error: "Module key is required." };

  let doc: unknown;
  try {
    doc = JSON.parse(String(formData.get("doc") ?? ""));
  } catch {
    return { error: "Invalid JSON — fix the syntax and save again." };
  }

  let result;
  try {
    result = await saveContentDoc(moduleKey, doc);
  } catch (e) {
    return fail(e);
  }
  if (!result.ok) return { error: result.error, fieldErrors: result.fieldErrors };
  revalidateContent(moduleKey);
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

/* ---------------- team logins ----------------
   An agency login: role='admin' with no board_id, so no board deletion can
   take it away. Both actions go through `requireAdmin` first — nothing here
   may be reachable to anyone who is not already an admin — and both are
   scoped in `boards.ts` to board-less admin rows, so neither can touch a
   client's board login whatever id is posted. */

export async function addTeamLoginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  try {
    await addAdminUser(username, password);
  } catch (e) {
    /* Until 0002_cms.sql runs, board_id is NOT NULL and this is where every
       add lands. `addAdminUser` turns that into a sentence about the pending
       migration; showing it is the honest answer, and far better than an add
       that appeared to work. */
    return fail(e);
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function removeTeamLoginAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("userId"));
  if (Number.isInteger(id)) await removeAdminUser(id);
  revalidatePath("/admin");
}
