/* ============================================================
   The Anomalies board's shapes, shared by both sides of the wire.

   The client store (`@/lib/insights`) and the server data layer
   (`@/lib/server/anomalies`) both speak these, so they live in a
   module with no "use client" and no server-only import: either
   side can hold them without dragging the other's runtime along.
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

/** Where a Live-tab sticker sits on the thing it tagged: which of the three
    shades it tore off the roll, and its position as a percentage of that
    target, so the sticker lands back where it was dropped at any width. */
export interface StickerPlacement {
  shade: number;
  x: number;
  y: number;
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
  /** the Live-tab sticker target that filed this card, and where the sticker
      sits on it. Both are set together or not at all: a card with a sourceKey
      is one a sticker put here, and peeling that sticker takes it away. */
  sourceKey?: string;
  sticker?: StickerPlacement;
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

/** The whole board, as one read hands it over. */
export interface AnomaliesDoc {
  circles: TopicCircle[];
  insights: InsightItem[];
  ideas: FusedIdea[];
  /** False when nothing is storing this: Supabase unconfigured, or
      `0003_anomalies.sql` not run yet. The client store then keeps the board
      in the browser the way it always did, rather than dropping every edit
      into a hole. */
  backed: boolean;
}

/* Exported so tests/cms/widgets.test.ts can hold WIDGET_DEFAULTS.circles7
   to these seven — the two lists are the same circles, described twice. */
export const BUILTIN_CIRCLES: TopicCircle[] = [
  { id: "news", name: "News", color: "orange", icon: "news", size: "md", builtIn: true },
  { id: "social", name: "Social", color: "blue", icon: "chat", size: "md", builtIn: true },
  { id: "key-influencers", name: "Key Influencers", color: "purple", icon: "chat", size: "sm", builtIn: true },
  { id: "culture", name: "Culture", color: "green", icon: "globe", size: "md", builtIn: true },
  { id: "customer-opinion", name: "Customer Opinion", color: "red", icon: "chat", size: "sm", builtIn: true },
  { id: "media-hotspots", name: "Media Hotspots", color: "yellow", icon: "signal", size: "md", builtIn: true },
  { id: "breakout-themes", name: "Breakout Themes", color: "blue", icon: "stack", size: "sm", builtIn: true },
];

export const EMPTY_DOC: AnomaliesDoc = { circles: BUILTIN_CIRCLES, insights: [], ideas: [], backed: false };

/* Circle ids the board used to ship with, renamed since. A board that filed
   cards under the old ones keeps them: the id travels with every card, every
   idea and every sticker, so it is rewritten on the way in rather than left
   to point at a circle that is no longer there. */
export function migrateCircleId(id: CircleId): CircleId {
  if (id === "channels") return "media-hotspots";
  if (id === "opinion-leaders") return "key-influencers";
  if (id === "name-2") return "breakout-themes";
  return id;
}
