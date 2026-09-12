"use server";

import type { AnomaliesResult } from "@/lib/server/anomalies";
import * as store from "@/lib/server/anomalies";
import { parseCircle, parseIdea, parseInsight, parseSticker } from "@/lib/anomalies/validate";
import { allowedBoard } from "@/lib/server/guard";

/* ============================================================
   The Anomalies board's writes, as server actions.

   Both board tabs call these: the Live tab files and peels cards
   with its stickers, the Anomalies tab types, moves, fuses and
   clears. They live in the (board) group rather than under
   /anomalies because of the Live tab — one door, one access
   check, whichever tab knocked.

   Every action re-checks access. The layout's guard stands in
   front of the *pages*, and an action is not a page: it is a POST
   a browser can make on its own, so it re-establishes which board
   is being written before it writes to it.
   ============================================================ */

/** No session for this board — or a board with nothing behind it.

    The fixture board is the second case: it stands in when Supabase is
    unconfigured or a slug has no row, and it has no id to write against, so
    a write on it is "nothing is storing this" rather than a failure. */
const NOT_BACKED: AnomaliesResult = { ok: false, backed: false };
const REFUSED: AnomaliesResult = { ok: false, backed: true, error: "Not signed in to this board." };

/** Wraps every action: resolve the board, or answer without touching the
    database. The two nothings stay apart — no session for this board is a
    refusal, no board to write against is "nothing is storing this" — because
    the client store does something different with each. */
async function onBoard(run: (id: string) => Promise<AnomaliesResult>): Promise<AnomaliesResult> {
  const board = await allowedBoard();
  if (!board) return REFUSED;
  if (board.id === "fixture") return NOT_BACKED;
  return run(board.id);
}

/** The board as stored. Used by the client store to catch up — on a tab
    coming back to the foreground, and after a write it could not confirm. */
export async function loadBoard(): Promise<AnomaliesResult> {
  return onBoard(async (id) => ({ ok: true, doc: await store.readBoard(id) }));
}

export async function addInsight(raw: unknown): Promise<AnomaliesResult> {
  const item = parseInsight(raw);
  if (!item) return { ok: false, backed: true, error: "That card did not look like a card." };
  return onBoard((id) => store.addInsight(id, item));
}

export async function adoptInsight(
  insightId: unknown,
  sourceKey: unknown,
  sticker: unknown
): Promise<AnomaliesResult> {
  if (typeof insightId !== "string" || typeof sourceKey !== "string") {
    return { ok: false, backed: true, error: "That sticker did not name a card." };
  }
  const placement = parseSticker(sticker);
  return onBoard((id) => store.adoptInsight(id, insightId, sourceKey, placement ?? undefined));
}

export async function removeInsight(insightId: unknown): Promise<AnomaliesResult> {
  if (typeof insightId !== "string") return REFUSED;
  return onBoard((id) => store.removeInsight(id, insightId));
}

export async function removeInsightsBySource(sourceKey: unknown): Promise<AnomaliesResult> {
  if (typeof sourceKey !== "string") return REFUSED;
  return onBoard((id) => store.removeInsightsBySource(id, sourceKey));
}

export async function updateInsight(insightId: unknown, headline: unknown): Promise<AnomaliesResult> {
  if (typeof insightId !== "string" || typeof headline !== "string") return REFUSED;
  const text = headline.trim();
  if (!text || text.length > 300) {
    return { ok: false, backed: true, error: "A headline is 1 to 300 characters." };
  }
  return onBoard((id) => store.updateInsight(id, insightId, text));
}

export async function moveInsight(insightId: unknown, circleId: unknown): Promise<AnomaliesResult> {
  if (typeof insightId !== "string" || typeof circleId !== "string") return REFUSED;
  return onBoard((id) => store.moveInsight(id, insightId, circleId));
}

export async function addCircle(raw: unknown): Promise<AnomaliesResult> {
  const circle = parseCircle(raw);
  if (!circle) return { ok: false, backed: true, error: "That circle did not look like a circle." };
  return onBoard((id) => store.addCircle(id, circle));
}

export async function removeCircle(circleId: unknown): Promise<AnomaliesResult> {
  if (typeof circleId !== "string") return REFUSED;
  return onBoard((id) => store.removeCircle(id, circleId));
}

export async function addIdea(raw: unknown): Promise<AnomaliesResult> {
  const idea = parseIdea(raw);
  if (!idea) return { ok: false, backed: true, error: "That idea did not look like an idea." };
  return onBoard((id) => store.addIdea(id, idea));
}

export async function removeIdea(ideaId: unknown): Promise<AnomaliesResult> {
  if (typeof ideaId !== "string") return REFUSED;
  return onBoard((id) => store.removeIdea(id, ideaId));
}

export async function tagIdea(ideaId: unknown, colorTag: unknown): Promise<AnomaliesResult> {
  if (typeof ideaId !== "string") return REFUSED;
  const tag = typeof colorTag === "string" ? colorTag : null;
  return onBoard((id) => store.tagIdea(id, ideaId, tag));
}

/** Empties the board — every card, every idea, every circle this board added.
    Irreversible, and the UI confirms before it calls this. */
export async function clearBoard(): Promise<AnomaliesResult> {
  return onBoard((id) => store.clearBoard(id));
}
