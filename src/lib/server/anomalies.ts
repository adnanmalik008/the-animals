import "server-only";
import {
  BUILTIN_CIRCLES,
  EMPTY_DOC,
  migrateCircleId,
  type AnomaliesDoc,
  type FusedIdea,
  type InsightItem,
  type TopicCircle,
} from "@/lib/anomalies/types";
import { supabaseAdmin } from "./supabase";

/* ============================================================
   The Anomalies board, stored.

   One board's circles, cards and fused ideas, per board — unlike
   module content, which is one set for the whole product. A board
   is an access gate for reading that content, but what a client
   pulls out of it, files into a circle and fuses into an idea is
   their own work, and the tables have carried a board_id for it
   since 0001_init.sql.

   Two things this layer must never do: throw on a read, because a
   board has to render whatever happens, and pretend a write landed
   when it did not. So every call answers with what is true —
   `backed: false` when nothing is storing this yet (Supabase
   unconfigured, or 0003_anomalies.sql unapplied), an error when a
   backed write failed — and the client store decides what to do
   about it. Silently dropping a client's afternoon of work into an
   unapplied migration is the failure worth this much ceremony.
   ============================================================ */

/** What a write (or a read-for-write) answers with.

    `ok` carries the whole board back rather than the one row that changed:
    the client applied its own optimistic copy already, and one document it
    can swap in wholesale is what makes a second person's edits show up
    without a reconciliation pass of its own. */
export type AnomaliesResult =
  | { ok: true; doc: AnomaliesDoc }
  /** nothing is storing this — the browser keeps the board, as it always did */
  | { ok: false; backed: false }
  /** a real failure against a database that does have the tables */
  | { ok: false; backed: true; error: string };

interface PgError {
  message: string;
  code?: string;
}

/* The database is there but does not have the shape this code expects:
   the table is missing (an unapplied 0001), or a column is (an unapplied
   0003). PostgREST answers the first pair from its schema cache and the
   second when it cannot map a field; Postgres raises the SQLSTATEs when a
   query reaches it directly. All four mean the same thing here — "this is
   not stored yet" — which is not a failure, and must not be reported as one. */
const SCHEMA_GAP_CODES: ReadonlySet<string> = new Set(["PGRST204", "PGRST205", "42P01", "42703"]);

export function isSchemaGap(error: PgError | null): boolean {
  return Boolean(error?.code && SCHEMA_GAP_CODES.has(error.code));
}

/* ---------------- rows ↔ items ---------------- */

/* eslint-disable @typescript-eslint/no-explicit-any -- supabase rows are untyped here */

export function rowToCircle(row: any): TopicCircle {
  return {
    id: migrateCircleId(String(row.id)),
    name: String(row.name),
    color: row.color,
    icon: row.icon ?? "none",
    size: row.size ?? "md",
    ...(row.built_in ? { builtIn: true } : {}),
  };
}

/** Undefined rather than null on the way out: the board's types say a field
    is absent, and `source ?? undefined` at forty call sites is how a null
    leaks into a template as "null". */
const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

export function rowToInsight(row: any): InsightItem {
  return {
    id: String(row.id),
    circleId: migrateCircleId(String(row.circle_id)),
    headline: String(row.headline),
    source: text(row.source),
    category: text(row.category),
    categoryColor: text(row.category_color) as InsightItem["categoryColor"],
    author: text(row.author),
    detail: text(row.detail),
    meta: text(row.meta),
    sourceKey: text(row.source_key),
    sticker: row.sticker ?? undefined,
    createdAt: Date.parse(row.created_at) || 0,
  };
}

export function rowToIdea(row: any): FusedIdea {
  return {
    id: String(row.id),
    text: String(row.text),
    note: text(row.note),
    itemIds: (row.item_ids ?? []) as [string, string],
    circleIds: ((row.circle_ids ?? []) as string[]).map(migrateCircleId) as [string, string],
    colorTag: text(row.color_tag) as FusedIdea["colorTag"],
    createdAt: Date.parse(row.created_at) || 0,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export function circleToRow(boardId: string, circle: TopicCircle, sort = 0) {
  return {
    id: circle.id,
    board_id: boardId,
    name: circle.name,
    color: circle.color,
    icon: circle.icon,
    size: circle.size,
    built_in: Boolean(circle.builtIn),
    sort,
  };
}

export function insightToRow(boardId: string, item: InsightItem) {
  return {
    id: item.id,
    board_id: boardId,
    circle_id: item.circleId,
    headline: item.headline,
    source: item.source ?? null,
    category: item.category ?? null,
    category_color: item.categoryColor ?? null,
    author: item.author ?? null,
    detail: item.detail ?? null,
    meta: item.meta ?? null,
    source_key: item.sourceKey ?? null,
    sticker: item.sticker ?? null,
    created_at: new Date(item.createdAt || Date.now()).toISOString(),
  };
}

export function ideaToRow(boardId: string, idea: FusedIdea) {
  return {
    id: idea.id,
    board_id: boardId,
    text: idea.text,
    note: idea.note ?? null,
    item_ids: idea.itemIds,
    circle_ids: idea.circleIds,
    color_tag: idea.colorTag ?? null,
    created_at: new Date(idea.createdAt || Date.now()).toISOString(),
  };
}

/* ---------------- reads ---------------- */

/** The seven built-in circles as this board's own rows.

    They are defined in the app, not the database, but `insights.circle_id`
    references `circles`, so a board cannot file a card into "News" until its
    News row exists. Upserting them costs one statement and makes every board
    — including one created long after this migration — correct on first use,
    which a backfill in the migration could not promise. */
async function ensureBuiltInCircles(boardId: string): Promise<PgError | null> {
  const db = supabaseAdmin();
  if (!db) return null;
  const { error } = await db
    .from("circles")
    .upsert(
      BUILTIN_CIRCLES.map((circle, i) => circleToRow(boardId, circle, i)),
      { onConflict: "board_id,id" }
    );
  return error;
}

/** Everything on one board. Never throws: a board renders whatever happens. */
export async function readBoard(boardId: string): Promise<AnomaliesDoc> {
  const db = supabaseAdmin();
  if (!db) return EMPTY_DOC;

  const [circles, insights, ideas] = await Promise.all([
    db.from("circles").select("*").eq("board_id", boardId).order("sort"),
    db.from("insights").select("*").eq("board_id", boardId).order("created_at"),
    db.from("ideas").select("*").eq("board_id", boardId).order("created_at", { ascending: false }),
  ]);

  const failure = circles.error ?? insights.error ?? ideas.error;
  if (failure) {
    if (!isSchemaGap(failure)) {
      console.warn(`[anomalies] read: ${failure.message} — the board opens on the browser's own copy`);
    }
    return EMPTY_DOC;
  }

  /* A board that has never been opened has no circle rows yet. Its seven
     built-ins are shown from the app's own list rather than written on a
     read: a read that writes turns opening a board into an edit, and the
     first card filed calls ensureBuiltInCircles anyway. */
  const stored = (circles.data ?? []).map(rowToCircle);
  const custom = stored.filter((circle) => !circle.builtIn);

  return {
    circles: [...BUILTIN_CIRCLES, ...custom],
    insights: (insights.data ?? []).map(rowToInsight),
    ideas: (ideas.data ?? []).map(rowToIdea),
    backed: true,
  };
}

/* ---------------- writes ---------------- */

/** Runs one write, then hands back the whole board as it now stands.

    Every mutation goes through here so they all answer the same three ways,
    and so a write that found an unapplied migration says "not backed" rather
    than "failed" — the client keeps that board in the browser instead of
    showing an error for a state nobody has migrated into yet. */
async function write(
  boardId: string,
  run: (db: NonNullable<ReturnType<typeof supabaseAdmin>>) => Promise<PgError | null>
): Promise<AnomaliesResult> {
  const db = supabaseAdmin();
  if (!db) return { ok: false, backed: false };

  const circlesError = await ensureBuiltInCircles(boardId);
  if (isSchemaGap(circlesError)) return { ok: false, backed: false };

  const error = await run(db);
  if (error) {
    if (isSchemaGap(error)) return { ok: false, backed: false };
    console.warn(`[anomalies] write: ${error.message}`);
    return { ok: false, backed: true, error: error.message };
  }
  return { ok: true, doc: await readBoard(boardId) };
}

export function addInsight(boardId: string, item: InsightItem): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db.from("insights").upsert(insightToRow(boardId, item));
    return error;
  });
}

/** Stamps an existing card as the one a sticker now owns, rather than filing
    a second copy of a card the circle already shows. See `fileInsight` in
    @/lib/insights for why a twin is worse than it sounds. */
export function adoptInsight(
  boardId: string,
  id: string,
  sourceKey: string,
  sticker: InsightItem["sticker"]
): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db
      .from("insights")
      .update({ source_key: sourceKey, sticker: sticker ?? null })
      .eq("board_id", boardId)
      .eq("id", id);
    return error;
  });
}

export function removeInsight(boardId: string, id: string): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db.from("insights").delete().eq("board_id", boardId).eq("id", id);
    return error;
  });
}

/** Every card a given Live-tab sticker target filed — what peeling the
    sticker off removes. */
export function removeInsightsBySource(boardId: string, sourceKey: string): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db
      .from("insights")
      .delete()
      .eq("board_id", boardId)
      .eq("source_key", sourceKey);
    return error;
  });
}

export function updateInsight(boardId: string, id: string, headline: string): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db
      .from("insights")
      .update({ headline })
      .eq("board_id", boardId)
      .eq("id", id);
    return error;
  });
}

export function moveInsight(boardId: string, id: string, circleId: string): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db
      .from("insights")
      .update({ circle_id: circleId })
      .eq("board_id", boardId)
      .eq("id", id);
    return error;
  });
}

export function addCircle(boardId: string, circle: TopicCircle): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db
      .from("circles")
      .upsert(circleToRow(boardId, { ...circle, builtIn: false }, BUILTIN_CIRCLES.length));
    return error;
  });
}

/** The cards filed into it go with it — `insights.circle_id` cascades, so
    this is one statement and there is no window where a card points at a
    circle that is gone. */
export function removeCircle(boardId: string, id: string): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db.from("circles").delete().eq("board_id", boardId).eq("id", id);
    return error;
  });
}

export function addIdea(boardId: string, idea: FusedIdea): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db.from("ideas").upsert(ideaToRow(boardId, idea));
    return error;
  });
}

export function removeIdea(boardId: string, id: string): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db.from("ideas").delete().eq("board_id", boardId).eq("id", id);
    return error;
  });
}

export function tagIdea(boardId: string, id: string, colorTag: string | null): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const { error } = await db
      .from("ideas")
      .update({ color_tag: colorTag })
      .eq("board_id", boardId)
      .eq("id", id);
    return error;
  });
}

/** Empties the board: every card, every fused idea, and every circle this
    board added. The seven built-in circles stay — they are the board's
    furniture, not its contents — and so the Live tab loses its stickers
    along with the cards they filed, which is the point of clearing. */
export function clearBoard(boardId: string): Promise<AnomaliesResult> {
  return write(boardId, async (db) => {
    const ideas = await db.from("ideas").delete().eq("board_id", boardId);
    if (ideas.error) return ideas.error;
    const insights = await db.from("insights").delete().eq("board_id", boardId);
    if (insights.error) return insights.error;
    const circles = await db
      .from("circles")
      .delete()
      .eq("board_id", boardId)
      .eq("built_in", false);
    return circles.error;
  });
}
