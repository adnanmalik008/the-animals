import { z } from "zod";
import type { FusedIdea, InsightItem, TopicCircle } from "./types";

/* ============================================================
   What the board is allowed to send.

   Every card, circle and idea arrives from a browser, so none of
   it is trusted: the ids are generated client-side (so an
   optimistic card keeps its identity across the round trip) and
   the text is whatever somebody typed. The table's CHECK
   constraints are the last line — these schemas are the first,
   and the reason a 400-character headline comes back as "refused"
   rather than as a Postgres constraint message.

   The caps match the columns in 0001_init.sql where the column
   has one, and are generous but finite where it does not.
   ============================================================ */

const CIRCLE_COLORS = ["orange", "yellow", "blue", "green", "red", "purple"] as const;
const CARD_COLORS = ["orange", "blue", "green", "red", "purple"] as const;
const CIRCLE_ICONS = [
  "news",
  "chat",
  "signal",
  "globe",
  "scale",
  "coin",
  "stack",
  "folder",
  "box",
  "none",
] as const;

const id = z.string().trim().min(1).max(80);
const circleRef = z.string().trim().min(1).max(60);
const createdAt = z.number().int().min(0).max(4_102_444_800_000).optional();

export const circleSchema = z.object({
  id,
  name: z.string().trim().min(1).max(40),
  color: z.enum(CIRCLE_COLORS),
  icon: z.enum(CIRCLE_ICONS).default("none"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
  builtIn: z.boolean().optional(),
});

/** Percentages, not pixels: a sticker lands back where it was dropped
    whatever the board is rendered at. */
export const stickerSchema = z.object({
  shade: z.number().int().min(0).max(2),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const insightSchema = z.object({
  id,
  circleId: circleRef,
  headline: z.string().trim().min(1).max(300),
  source: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  categoryColor: z.enum(CARD_COLORS).optional(),
  author: z.string().trim().max(80).optional(),
  detail: z.string().max(6000).optional(),
  meta: z.string().trim().max(300).optional(),
  sourceKey: z.string().trim().max(200).optional(),
  sticker: stickerSchema.optional(),
  createdAt,
});

export const ideaSchema = z.object({
  id,
  text: z.string().trim().min(1).max(1000),
  note: z.string().trim().max(2000).optional(),
  itemIds: z.tuple([id, id]),
  circleIds: z.tuple([circleRef, circleRef]),
  colorTag: z.enum(CIRCLE_COLORS).optional(),
  createdAt,
});

/** Parsed and stamped: `createdAt` is filled in here rather than trusted, so
    a card cannot be back- or post-dated into the wrong end of a circle. */
export function parseInsight(raw: unknown): InsightItem | null {
  const res = insightSchema.safeParse(raw);
  if (!res.success) return null;
  return { ...res.data, createdAt: res.data.createdAt ?? Date.now() } as InsightItem;
}

export function parseCircle(raw: unknown): TopicCircle | null {
  const res = circleSchema.safeParse(raw);
  return res.success ? (res.data as TopicCircle) : null;
}

export function parseIdea(raw: unknown): FusedIdea | null {
  const res = ideaSchema.safeParse(raw);
  if (!res.success) return null;
  return { ...res.data, createdAt: res.data.createdAt ?? Date.now() } as FusedIdea;
}

export function parseSticker(raw: unknown): InsightItem["sticker"] | null {
  const res = stickerSchema.safeParse(raw);
  return res.success ? res.data : null;
}
