"use client";

import { useSyncExternalStore } from "react";

/* ============================================================
   Shared insight store — the bridge between tabs.
   Live-tab stickers route content here; the Anomalies board
   reads circles, fuses insights into ideas.
   localStorage-backed now; swaps to Supabase later.
   ============================================================ */

export type CircleId = string;

export interface TopicCircle {
  id: CircleId;
  name: string;
  color: "orange" | "yellow" | "blue" | "green" | "red" | "purple";
  icon: "news" | "chat" | "signal" | "globe" | "scale" | "coin" | "stack" | "folder" | "box" | "none";
  size: "sm" | "md" | "lg";
  builtIn?: boolean;
}

export interface InsightItem {
  id: string;
  circleId: CircleId;
  headline: string;
  source?: string;
  category?: string;
  categoryColor?: "orange" | "blue" | "green" | "red" | "purple";
  author?: string; // set for user-authored insights ("R Basckin")
  /** the full post, quote or article copy behind the headline — shown on hover;
      paragraphs separated by blank lines */
  detail?: string;
  /** byline-ish context: author, handle, timing, engagement */
  meta?: string;
  /** the Live-tab sticker target that filed this insight, so removing the
      sticker can find it even if the tag lost its insight id */
  sourceKey?: string;
  createdAt: number;
}

export interface FusedIdea {
  id: string;
  text: string;
  note?: string;
  itemIds: [string, string];
  circleIds: [CircleId, CircleId];
  colorTag?: "orange" | "green" | "yellow" | "blue" | "red" | "purple";
  createdAt: number;
}

interface StoreState {
  circles: TopicCircle[];
  insights: InsightItem[];
  ideas: FusedIdea[];
}

const STORAGE_KEY = "animals-board-v1";

const BUILTIN_CIRCLES: TopicCircle[] = [
  { id: "news", name: "News", color: "orange", icon: "news", size: "md", builtIn: true },
  { id: "social", name: "Social", color: "blue", icon: "chat", size: "md", builtIn: true },
  { id: "key-influencers", name: "Key Influencers", color: "purple", icon: "chat", size: "sm", builtIn: true },
  { id: "culture", name: "Culture", color: "green", icon: "globe", size: "md", builtIn: true },
  { id: "customer-opinion", name: "Customer Opinion", color: "red", icon: "chat", size: "sm", builtIn: true },
  { id: "media-hotspots", name: "Media Hotspots", color: "yellow", icon: "signal", size: "md", builtIn: true },
  { id: "breakout-themes", name: "Breakout Themes", color: "blue", icon: "stack", size: "sm", builtIn: true },
];

const DEFAULT_STATE: StoreState = {
  circles: BUILTIN_CIRCLES,
  insights: [
    { id: "seed-n1", circleId: "news", headline: "LinkedIn deepens video ad push, taps more publishers", source: "CNN", category: "Artificial Intelligence", categoryColor: "orange", detail: "The platform is courting short-form video budgets with new publisher partnerships, positioning itself against TikTok for B2B attention.", meta: "@ELENI COUREA · 2m ago", createdAt: 1 },
    { id: "seed-n2", circleId: "news", headline: "MI5 warns of Chinese operatives using LinkedIn", source: "The New York Times", category: "Business", categoryColor: "blue", detail: "The security service issued fresh guidance after a wave of fabricated recruiter profiles targeted civil servants, raising questions about professional networks as intelligence surfaces.", meta: "@ELENI COUREA · 2m ago", createdAt: 2 },
    { id: "seed-n3", circleId: "news", headline: "The loneliness economy finds its feet in run culture", source: "Bloomberg", category: "Technology", categoryColor: "orange", detail: "Run clubs have quietly become the fastest-growing social layer in major cities, and brands are treating weekly 5Ks as owned media channels rather than sponsorship opportunities.", meta: "@ELENI COUREA · 2m ago", createdAt: 3 },
    { id: "seed-c1", circleId: "media-hotspots", headline: "MI5 warns of Chinese operatives using LinkedIn", source: "The New York Times", category: "Business", categoryColor: "blue", detail: "The security service issued fresh guidance after a wave of fabricated recruiter profiles targeted civil servants, raising questions about professional networks as intelligence surfaces.", meta: "@ELENI COUREA · 2m ago", createdAt: 4 },
    { id: "seed-s1", circleId: "social", headline: "LinkedIn under fire after pro-ICE post removed", source: "CNBC", category: "Politics", categoryColor: "red", detail: "Critics accuse the network of inconsistent enforcement; the company says the post violated existing community policies.", meta: "@ELENI COUREA · 2m ago", createdAt: 5 },
    { id: "seed-s2", circleId: "social", headline: "LinkedIn deepens video ad push, taps more creators", source: "CNN", category: "Artificial Intelligence", categoryColor: "orange", detail: "The platform is courting short-form video budgets with new publisher partnerships, positioning itself against TikTok for B2B attention.", meta: "@ELENI COUREA · 2m ago", createdAt: 6 },
    { id: "seed-s3", circleId: "social", headline: "MI5 warns of Chinese operatives using LinkedIn", source: "The New York Times", category: "Business", categoryColor: "blue", detail: "The security service issued fresh guidance after a wave of fabricated recruiter profiles targeted civil servants, raising questions about professional networks as intelligence surfaces.", meta: "@ELENI COUREA · 2m ago", createdAt: 7 },
    { id: "seed-s4", circleId: "social", headline: "The loneliness economy finds its feet in run culture", source: "Bloomberg", category: "Technology", categoryColor: "orange", detail: "Run clubs have quietly become the fastest-growing social layer in major cities, and brands are treating weekly 5Ks as owned media channels rather than sponsorship opportunities.", meta: "@ELENI COUREA · 2m ago", createdAt: 8 },
    { id: "seed-cu1", circleId: "culture", headline: "LinkedIn under fire after pro-ICE post removed", source: "CNBC", category: "Politics", categoryColor: "red", detail: "Moderation decisions on political speech keep pulling professional platforms into culture-war coverage, with advertisers watching closely.", meta: "@ELENI COUREA · 2m ago", createdAt: 9 },
    { id: "seed-cu2", circleId: "culture", headline: "The loneliness economy finds its feet in run culture", source: "Bloomberg", category: "Technology", categoryColor: "orange", detail: "Run clubs have quietly become the fastest-growing social layer in major cities, and brands are treating weekly 5Ks as owned media channels rather than sponsorship opportunities.", meta: "@ELENI COUREA · 2m ago", createdAt: 10 },
    { id: "seed-x1", circleId: "key-influencers", headline: "Kofi Mensah — run culture analyst, 2.1M followers", source: "Live board", category: "Voice", categoryColor: "purple", detail: "Kofi posts weekly run-crew breakdowns across TikTok and Substack. Engagement 92, 2.1M followers, and the most-cited voice in the Opinion Leaders ranking this month.", meta: "Opinion Leaders · TikTok", createdAt: 11 },
    { id: "seed-x2", circleId: "breakout-themes", headline: "MI5 warns of Chinese operatives using LinkedIn to recruit", source: "The New York Times", category: "Business", categoryColor: "blue", detail: "The security service issued fresh guidance after a wave of fabricated recruiter profiles targeted civil servants, raising questions about professional networks as intelligence surfaces.", meta: "@ELENI COUREA · 2m ago", createdAt: 12 },
    { id: "seed-o1", circleId: "customer-opinion", headline: "Fit inconsistency is now the most repeated customer complaint", source: "Live board", category: "Customer signal", categoryColor: "red", detail: "App Store and Reddit threads converge on the same complaint: the same size fits differently across models. It now outranks price and durability in unprompted review mentions.", meta: "App Store Voice · iOS 4.6★", createdAt: 13 },
  ],
  ideas: [],
};

let state: StoreState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode / quota) — state stays in memory */
  }
}

function migrateCircleId(id: CircleId): CircleId {
  if (id === "channels") return "media-hotspots";
  if (id === "opinion-leaders") return "key-influencers";
  if (id === "name-2") return "breakout-themes";
  return id;
}

function migrateState(parsed: Partial<StoreState>): StoreState {
  const customCircles = (parsed.circles ?? [])
    .filter((circle) => !circle.builtIn)
    .map((circle) => ({ ...circle, id: migrateCircleId(circle.id) }))
    .filter((circle) => !BUILTIN_CIRCLES.some((builtIn) => builtIn.id === circle.id));

  return {
    circles: [...BUILTIN_CIRCLES, ...customCircles],
    insights: (parsed.insights ?? DEFAULT_STATE.insights).map((insight) => {
      /* seeds saved by an earlier build have no detail copy — backfill it */
      const seed = DEFAULT_STATE.insights.find((s) => s.id === insight.id);
      return {
        ...insight,
        detail: insight.detail ?? seed?.detail,
        meta: insight.meta ?? seed?.meta,
        circleId: migrateCircleId(insight.circleId),
      };
    }),
    ideas: (parsed.ideas ?? DEFAULT_STATE.ideas).map((idea) => ({
      ...idea,
      circleIds: idea.circleIds.map(migrateCircleId) as [CircleId, CircleId],
    })),
  };
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoreState>;
      state = migrateState(parsed);
      queueMicrotask(emit);
    }
  } catch {
    /* corrupted storage — keep defaults */
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => DEFAULT_STATE;

function update(mutate: (prev: StoreState) => StoreState) {
  state = mutate(state);
  persist();
  emit();
}

let counter = 0;
export function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

/* ---------------- actions ---------------- */

/* Reset everything to defaults (used by the Anomalies toolbar refresh). */
export function resetStore() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — in-memory reset still applies */
  }
  state = DEFAULT_STATE;
  emit();
}

export function addInsight(item: Omit<InsightItem, "id" | "createdAt"> & { id?: string }) {
  const full: InsightItem = { ...item, id: item.id ?? nextId("ins"), createdAt: Date.now() };
  update((prev) => ({ ...prev, insights: [...prev.insights, full] }));
  return full;
}

export function removeInsight(id: string) {
  update((prev) => ({ ...prev, insights: prev.insights.filter((i) => i.id !== id) }));
}

/** Drop every insight a given Live-tab sticker target filed. */
export function removeInsightsBySource(sourceKey: string) {
  update((prev) => ({ ...prev, insights: prev.insights.filter((i) => i.sourceKey !== sourceKey) }));
}

/** Refile a card under another circle. Returns false when nothing moved. */
export function moveInsight(id: string, circleId: CircleId): boolean {
  let moved = false;
  update((prev) => {
    const item = prev.insights.find((i) => i.id === id);
    if (!item || item.circleId === circleId) return prev;
    moved = true;
    return {
      ...prev,
      insights: prev.insights.map((i) => (i.id === id ? { ...i, circleId } : i)),
    };
  });
  return moved;
}

export function addCircle(circle: Omit<TopicCircle, "id"> & { id?: string }) {
  const full: TopicCircle = { ...circle, id: circle.id ?? nextId("circle") };
  update((prev) => ({ ...prev, circles: [...prev.circles, full] }));
  return full;
}

export function removeCircle(id: CircleId) {
  update((prev) => ({
    ...prev,
    circles: prev.circles.filter((c) => c.id !== id),
    insights: prev.insights.filter((i) => i.circleId !== id),
  }));
}

export function saveIdea(idea: Omit<FusedIdea, "id" | "createdAt">) {
  const full: FusedIdea = { ...idea, id: nextId("idea"), createdAt: Date.now() };
  update((prev) => ({ ...prev, ideas: [full, ...prev.ideas] }));
  return full;
}

export function deleteIdea(id: string) {
  update((prev) => ({ ...prev, ideas: prev.ideas.filter((i) => i.id !== id) }));
}

export function tagIdea(id: string, colorTag: FusedIdea["colorTag"]) {
  update((prev) => ({
    ...prev,
    ideas: prev.ideas.map((i) => (i.id === id ? { ...i, colorTag } : i)),
  }));
}

/* ---------------- hooks ---------------- */

export function useBoardStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCircleInsights(circleId: CircleId): InsightItem[] {
  const { insights } = useBoardStore();
  return insights.filter((i) => i.circleId === circleId);
}
