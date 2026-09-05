"use client";

import { useSyncExternalStore } from "react";
import { newsItems, shareOfVoice } from "@/data/board";
import {
  appStoreVoice,
  conversationPlatformLabel,
  conversationQuotes,
  insightStateLabel,
  opinionLeaders,
  redditInsights,
  searchTerms,
  socialPlatformLabel,
  socialPosts,
  stageEvents,
  subreddits,
  wikiPulse,
} from "@/data/live";
import { podcastItems, sightingItems } from "@/data/live-extra";

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
  /** which generation of demo seeds this board was built on — see SEED_VERSION */
  seedVersion?: number;
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

/* Demo insights — one or two per circle, each the very item a sticker on the
   matching Live module would file (same headline, source and framing), so the
   board reads true to the routing from first load:
     Newswire → News
     Social Pulse, The Conversation → Social
     On Stage, In Their Inbox, Opinion Leaders, Reddit influencers → Key Influencers
     Sightings, On the Airwaves, YouTube Voices → Culture
     Reddit insights, App Store Voice → Customer Opinion
     Top Sites, AI Search Visibility, Share of Voice, subreddits, Sources of Traffic → Media Hotspots
     Wikipedia Pulse, Hiring Velocity, Search Velocity → Breakout Themes
   Bump SEED_VERSION whenever this set changes: stored boards then swap their
   seeds for these once, keeping everything a person stuck or wrote. */
const SEED_VERSION = 2;

const [socialPost, redditPost] = socialPosts;
const conversation = conversationQuotes[0];
const leader = opinionLeaders[0];
const stage = stageEvents[0];
const sighting = sightingItems[0];
const podcast = podcastItems[0];
const review = appStoreVoice.ios.review;
const voiceShare = shareOfVoice[0];
const subreddit = subreddits[0];
const pulse = wikiPulse[0];
const searchTerm = searchTerms[0];

const SEED_INSIGHTS: InsightItem[] = [
  /* News ← Newswire */
  ...newsItems.slice(0, 3).map((item, i) => ({
    id: `seed-n${i + 1}`,
    circleId: "news",
    headline: item.headline,
    source: item.source,
    category: item.category,
    categoryColor: item.categoryColor,
    detail: item.body ? `${item.summary}\n\n${item.body}` : item.summary,
    meta: `${item.author} · ${item.timeAgo}`,
    createdAt: i + 1,
  })),

  /* Social ← Social Pulse, The Conversation */
  {
    id: "seed-s1",
    circleId: "social",
    headline: socialPost.text,
    source: socialPlatformLabel[socialPost.platform],
    category: socialPlatformLabel[socialPost.platform],
    categoryColor: "blue",
    meta: `${socialPost.author} · ${socialPost.likes} likes · ${socialPost.comments} comments · ${socialPost.timeAgo}`,
    createdAt: 4,
  },
  {
    id: "seed-s2",
    circleId: "social",
    headline: redditPost.text,
    source: socialPlatformLabel[redditPost.platform],
    category: socialPlatformLabel[redditPost.platform],
    categoryColor: "blue",
    meta: `${redditPost.author} · ${redditPost.likes} likes · ${redditPost.comments} comments · ${redditPost.timeAgo}`,
    createdAt: 5,
  },
  {
    id: "seed-s3",
    circleId: "social",
    headline: conversation.text,
    source: conversationPlatformLabel[conversation.platform],
    category: "Conversation",
    categoryColor: "green",
    detail: conversation.replyTo
      ? `${conversation.context}\n\nReplying to: ${conversation.replyTo}`
      : conversation.context,
    meta: `${conversation.author} ${conversation.handle} · ${conversation.upvotes} upvotes · ${conversation.timeAgo}`,
    createdAt: 6,
  },

  /* Key Influencers ← Opinion Leaders, On Stage */
  {
    id: "seed-x1",
    circleId: "key-influencers",
    headline: `${leader.name} — ${leader.role}, ENG ${leader.eng}, ${leader.followers} followers`,
    source: "LinkedIn",
    category: "Voice",
    categoryColor: "purple",
    detail:
      "Kofi posts weekly run-crew breakdowns across TikTok and Substack. Engagement 92, 2.1M followers, and the most-cited voice in the Opinion Leaders ranking this month.",
    createdAt: 7,
  },
  {
    id: "seed-k2",
    circleId: "key-influencers",
    headline: stage.quote,
    source: stage.speaker,
    category: "Event",
    categoryColor: "green",
    detail: `${stage.event} · ${stage.hashtag}\n\n${stage.session}`,
    meta: stage.speakerTitle,
    createdAt: 8,
  },

  /* Culture ← Sightings, On the Airwaves */
  {
    id: "seed-cu1",
    circleId: "culture",
    headline: sighting.caption,
    source: sighting.city,
    category: "OOH",
    categoryColor: "green",
    meta: `${sighting.city} · ${sighting.time}`,
    createdAt: 9,
  },
  {
    id: "seed-cu2",
    circleId: "culture",
    headline: podcast.note,
    source: podcast.show,
    category: "Podcast",
    categoryColor: "green",
    meta: `${podcast.network} · ${podcast.timestamp}`,
    createdAt: 10,
  },

  /* Customer Opinion ← Reddit insights, App Store Voice */
  {
    id: "seed-o1",
    circleId: "customer-opinion",
    headline: redditInsights[0],
    source: "Reddit",
    category: insightStateLabel.drivers,
    categoryColor: "orange",
    createdAt: 11,
  },
  {
    id: "seed-o2",
    circleId: "customer-opinion",
    headline: `“${review.text}”`,
    source: "iOS review",
    category: "Review",
    categoryColor: "orange",
    meta: review.author,
    createdAt: 12,
  },

  /* Media Hotspots ← Share of Voice, Reddit subreddits */
  {
    id: "seed-m1",
    circleId: "media-hotspots",
    headline: `Share of Voice — ${voiceShare.label} ${voiceShare.pct}% of conversation`,
    source: "Live board",
    category: "Signal",
    categoryColor: "orange",
    createdAt: 13,
  },
  {
    id: "seed-m2",
    circleId: "media-hotspots",
    headline: `Reddit — ${subreddit.name} ${subreddit.members} members, activity ${subreddit.activity}`,
    source: "Reddit",
    category: "Signal",
    categoryColor: "orange",
    createdAt: 14,
  },

  /* Breakout Themes ← Wikipedia Pulse, Search Velocity */
  {
    id: "seed-b1",
    circleId: "breakout-themes",
    headline: `Wikipedia Pulse — ${pulse.entity} ${pulse.count} edits / ${pulse.window}${pulse.spike ? ", spiking" : ""}`,
    source: "Live board",
    category: "Signal",
    categoryColor: "orange",
    meta: `${pulse.meta} · ${pulse.baseline}`,
    createdAt: 15,
  },
  {
    id: "seed-b2",
    circleId: "breakout-themes",
    headline: `Search Velocity — “${searchTerm.term}” ${searchTerm.delta >= 0 ? "+" : ""}${searchTerm.delta}% branded search`,
    source: "Live board",
    category: "Signal",
    categoryColor: "orange",
    createdAt: 16,
  },
];

const DEFAULT_STATE: StoreState = {
  circles: BUILTIN_CIRCLES,
  insights: SEED_INSIGHTS,
  ideas: [],
  seedVersion: SEED_VERSION,
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

  /* A board built on an older seed set swaps its seeds for the current ones
     once (the earlier set filed Newswire items into Breakout Themes, Media
     Hotspots, Social and Culture). Everything a person stuck or wrote is
     kept; a board already on this generation keeps its seeds as they are,
     moves and removals included. */
  const stored = parsed.insights ?? SEED_INSIGHTS;
  const reseeded =
    (parsed.seedVersion ?? 1) < SEED_VERSION
      ? [...SEED_INSIGHTS, ...stored.filter((insight) => !insight.id.startsWith("seed-"))]
      : stored;

  return {
    circles: [...BUILTIN_CIRCLES, ...customCircles],
    insights: reseeded.map((insight) => ({
      ...insight,
      circleId: migrateCircleId(insight.circleId),
    })),
    ideas: (parsed.ideas ?? DEFAULT_STATE.ideas).map((idea) => ({
      ...idea,
      circleIds: idea.circleIds.map(migrateCircleId) as [CircleId, CircleId],
    })),
    seedVersion: SEED_VERSION,
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
      /* a reseeded board is written straight back, so the swap happens once
         rather than on every load */
      if ((parsed.seedVersion ?? 1) < SEED_VERSION) persist();
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
