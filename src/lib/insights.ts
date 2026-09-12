"use client";

import { useSyncExternalStore } from "react";
import {
  addCircle as addCircleOnServer,
  addIdea as addIdeaOnServer,
  addInsight as addInsightOnServer,
  adoptInsight as adoptInsightOnServer,
  clearBoard as clearBoardOnServer,
  loadBoard as loadBoardFromServer,
  moveInsight as moveInsightOnServer,
  removeCircle as removeCircleOnServer,
  removeIdea as removeIdeaOnServer,
  removeInsight as removeInsightOnServer,
  removeInsightsBySource as removeInsightsBySourceOnServer,
  tagIdea as tagIdeaOnServer,
  updateInsight as updateInsightOnServer,
} from "@/app/(board)/actions";
import {
  BUILTIN_CIRCLES,
  migrateCircleId,
  type AnomaliesDoc,
  type CircleId,
  type FusedIdea,
  type InsightItem,
  type StickerPlacement,
  type TopicCircle,
} from "@/lib/anomalies/types";

export {
  BUILTIN_CIRCLES,
  type CircleId,
  type FusedIdea,
  type InsightItem,
  type StickerPlacement,
  type TopicCircle,
};

/* ============================================================
   Shared insight store — the bridge between tabs.
   Live-tab stickers route content here; the Anomalies board
   reads circles, fuses insights into ideas.

   Supabase-backed, per board. The board is held in memory so
   every surface renders from one snapshot, each change is applied
   there first and sent on, and what the server sends back becomes
   the truth. That order is deliberate: a sticker has to land the
   instant it is dropped, and a round trip is not instant.

   Nothing storing it? Then the browser keeps it, exactly as this
   store used to — see `goLocal`. That is the state of any board
   before `0003_anomalies.sql` runs, and of local development with
   no Supabase project at all.
   ============================================================ */

interface StoreState {
  circles: TopicCircle[];
  insights: InsightItem[];
  ideas: FusedIdea[];
}

const STORAGE_KEY = "animals-board-v1";

const EMPTY: StoreState = { circles: BUILTIN_CIRCLES, insights: [], ideas: [] };

let state: StoreState = EMPTY;
/** Undefined until the first read comes back: the board has not said yet
    whether anything is storing it. */
let backed: boolean | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function set(next: StoreState) {
  state = next;
  if (backed === false) persistLocally();
  emit();
}

/* ---------------- the browser's own copy ---------------- */

/* Only ever written while `backed` is false. A board with a database behind
   it does not keep a second copy here: two stores and one board is how a
   stale tab overwrites a real edit, and how "I cleared it" turns into "it
   came back". */
function persistLocally() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota/private mode — in-memory only */
  }
}

function readLocally(): StoreState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    return {
      circles: [
        ...BUILTIN_CIRCLES,
        ...(parsed.circles ?? [])
          .filter((circle) => !circle.builtIn)
          .map((circle) => ({ ...circle, id: migrateCircleId(circle.id) }))
          .filter((circle) => !BUILTIN_CIRCLES.some((b) => b.id === circle.id)),
      ],
      insights: (parsed.insights ?? []).map((i) => ({ ...i, circleId: migrateCircleId(i.circleId) })),
      ideas: (parsed.ideas ?? []).map((idea) => ({
        ...idea,
        circleIds: idea.circleIds.map(migrateCircleId) as [CircleId, CircleId],
      })),
    };
  } catch {
    return null; /* corrupted storage — start clean */
  }
}

/** Nothing is storing this board: keep it in the browser, and stop asking.

    Called when a write comes back "not backed" — Supabase unconfigured, or
    `0003_anomalies.sql` not run yet. What is on screen is kept: the edits
    made before we found out are real work, and they are what gets written
    to the browser. */
function goLocal() {
  if (backed === false) return;
  backed = false;
  const stored = readLocally();
  /* An empty board adopts what the browser already had; a board somebody has
     been filing into keeps what is in front of them. */
  if (stored && !state.insights.length && !state.ideas.length) state = stored;
  persistLocally();
  emit();
}

/* ---------------- the server ---------------- */

type ServerAnswer =
  | { ok: true; doc: AnomaliesDoc }
  | { ok: false; backed: false }
  | { ok: false; backed: true; error: string };

function adopt(doc: AnomaliesDoc) {
  backed = doc.backed;
  if (!doc.backed) {
    goLocal();
    return;
  }
  state = { circles: doc.circles, insights: doc.insights, ideas: doc.ideas };
  emit();
}

/** In-flight writes. A reply only becomes the truth when it is the last one
    outstanding: sticking three cards quickly fires three writes, and the
    board each of them read is one card behind the next. */
let pending = 0;

async function push(answer: Promise<ServerAnswer>) {
  pending += 1;
  let res: ServerAnswer | null = null;
  try {
    res = await answer;
  } catch (e) {
    /* Offline, or the action never reached the server. Keep what is on
       screen; the next refresh reconciles it. */
    console.warn("[anomalies] the board could not be saved just now", e);
  } finally {
    pending -= 1;
  }

  if (!res) return;
  if (res.ok) {
    if (pending === 0) adopt(res.doc);
    return;
  }
  if (!res.backed) {
    goLocal();
    return;
  }
  /* A real failure against a database that does have the tables. The
     optimistic copy on screen is now a guess, so re-read rather than leave
     it standing. */
  console.warn(`[anomalies] ${res.error}`);
  if (pending === 0) void refreshBoard();
}

/** Applies a change here, then sends it. Every action in this file is one of
    these: local first so the board answers the pointer, server second so it
    is still there tomorrow, on another device, for whoever opens it next. */
function mutate(next: StoreState, answer: () => Promise<ServerAnswer>) {
  set(next);
  if (backed === false) return;
  void push(answer());
}

/** The board as stored, replacing what is here. Called on hydration and
    whenever a tab comes back to the foreground. */
export async function refreshBoard(): Promise<void> {
  try {
    const res = await loadBoardFromServer();
    if (res.ok) adopt(res.doc);
    else if (!res.backed) goLocal();
    /* A refusal is the session having gone while the tab sat there. Saying so
       beats a board that quietly stops keeping up with itself. */
    else console.warn(`[anomalies] ${res.error}`);
  } catch (e) {
    /* offline — keep what is on screen */
    console.warn("[anomalies] the board could not be read just now", e);
  }
}

/** Seeds the store from the server read the board layout already did, so the
    first paint is the real board rather than an empty one that fills in. */
export function hydrateBoard(doc: AnomaliesDoc) {
  if (backed !== undefined) return;
  adopt(doc);
}

/* ---------------- store plumbing ---------------- */

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

let counter = 0;
export function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

/* ---------------- actions ---------------- */

export function addInsight(item: Omit<InsightItem, "id" | "createdAt"> & { id?: string }) {
  const full: InsightItem = { ...item, id: item.id ?? nextId("ins"), createdAt: Date.now() };
  mutate({ ...state, insights: [...state.insights, full] }, () => addInsightOnServer(full));
  return full;
}

/** File the content a Live-board sticker tagged.

    A circle that already holds this very card — one filed by a sticker that
    was peeled off and stuck back on, or one somebody added by hand from the
    same source — is adopted rather than twinned: the sticker takes ownership
    of the card already sitting there. Without that, sticking a story the
    circle already shows files a second copy, and peeling the sticker off
    leaves its identical twin behind, which reads as the removal never
    happening. A card another sticker owns, or one somebody typed on the
    Anomalies board, is left alone. */
export function fileInsight(item: Omit<InsightItem, "id" | "createdAt">): InsightItem {
  const existing = state.insights.find(
    (i) => !i.sourceKey && !i.author && i.circleId === item.circleId && i.headline === item.headline
  );
  if (!existing) return addInsight(item);

  const adopted: InsightItem = { ...existing, sourceKey: item.sourceKey, sticker: item.sticker };
  mutate(
    { ...state, insights: state.insights.map((i) => (i.id === adopted.id ? adopted : i)) },
    () => adoptInsightOnServer(adopted.id, item.sourceKey ?? "", item.sticker)
  );
  return adopted;
}

export function removeInsight(id: string) {
  mutate({ ...state, insights: state.insights.filter((i) => i.id !== id) }, () =>
    removeInsightOnServer(id)
  );
}

/** Drop every insight a given Live-tab sticker target filed. */
export function removeInsightsBySource(sourceKey: string) {
  mutate({ ...state, insights: state.insights.filter((i) => i.sourceKey !== sourceKey) }, () =>
    removeInsightsBySourceOnServer(sourceKey)
  );
}

/** Rewrite a card's headline. Returns false when nothing changed. */
export function updateInsight(id: string, headline: string): boolean {
  const text = headline.trim();
  const item = state.insights.find((i) => i.id === id);
  if (!item || !text || item.headline === text) return false;

  mutate(
    { ...state, insights: state.insights.map((i) => (i.id === id ? { ...i, headline: text } : i)) },
    () => updateInsightOnServer(id, text)
  );
  return true;
}

/** Cards typed on the Anomalies board carry an author; stickers and imports
    do not. Only these can be edited or removed from the board. */
export function isUserInsight(item: InsightItem): boolean {
  return Boolean(item.author) && !item.sourceKey;
}

/** Refile a card under another circle. Returns false when nothing moved. */
export function moveInsight(id: string, circleId: CircleId): boolean {
  const item = state.insights.find((i) => i.id === id);
  if (!item || item.circleId === circleId) return false;

  mutate(
    { ...state, insights: state.insights.map((i) => (i.id === id ? { ...i, circleId } : i)) },
    () => moveInsightOnServer(id, circleId)
  );
  return true;
}

export function addCircle(circle: Omit<TopicCircle, "id"> & { id?: string }) {
  const full: TopicCircle = { ...circle, id: circle.id ?? nextId("circle") };
  mutate({ ...state, circles: [...state.circles, full] }, () => addCircleOnServer(full));
  return full;
}

export function removeCircle(id: CircleId) {
  mutate(
    {
      ...state,
      circles: state.circles.filter((c) => c.id !== id),
      insights: state.insights.filter((i) => i.circleId !== id),
    },
    () => removeCircleOnServer(id)
  );
}

export function saveIdea(idea: Omit<FusedIdea, "id" | "createdAt">) {
  const full: FusedIdea = { ...idea, id: nextId("idea"), createdAt: Date.now() };
  mutate({ ...state, ideas: [full, ...state.ideas] }, () => addIdeaOnServer(full));
  return full;
}

export function deleteIdea(id: string) {
  mutate({ ...state, ideas: state.ideas.filter((i) => i.id !== id) }, () => removeIdeaOnServer(id));
}

export function tagIdea(id: string, colorTag: FusedIdea["colorTag"]) {
  mutate(
    { ...state, ideas: state.ideas.map((i) => (i.id === id ? { ...i, colorTag } : i)) },
    () => tagIdeaOnServer(id, colorTag ?? null)
  );
}

/** Empty the board — every card, every fused idea, every circle this board
    added, and with them every sticker stuck on the Live tab. Irreversible:
    the UI confirms first. */
export function clearBoard() {
  mutate({ circles: BUILTIN_CIRCLES, insights: [], ideas: [] }, () => clearBoardOnServer());
}

/* ---------------- hooks ---------------- */

export function useBoardStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCircleInsights(circleId: CircleId): InsightItem[] {
  const { insights } = useBoardStore();
  return insights.filter((i) => i.circleId === circleId);
}
