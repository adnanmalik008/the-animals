/* The Anomalies board's server side, with no Supabase configured — the mode
   the app falls back to whenever nothing is storing the board. Nothing here
   touches the network: `supabaseAdmin()` is null without env vars, so the
   reads return the empty board and the writes answer "not backed" before a
   client is ever built. The row mappers and the validators are pure, so the
   shapes that cross the wire are exercised directly. */
import { describe, expect, it } from "vitest";
import {
  circleToRow,
  clearBoard,
  ideaToRow,
  insightToRow,
  isSchemaGap,
  readBoard,
  rowToIdea,
  rowToInsight,
  addInsight as storeAddInsight,
} from "@/lib/server/anomalies";
import { BUILTIN_CIRCLES, EMPTY_DOC, migrateCircleId } from "@/lib/anomalies/types";
import { parseCircle, parseIdea, parseInsight, parseSticker } from "@/lib/anomalies/validate";

const BOARD = "11111111-2222-3333-4444-555555555555";

const CARD = {
  id: "ins-1",
  circleId: "news",
  headline: "The loneliness economy finds its feet in run culture",
  source: "Bloomberg",
  category: "Technology",
  categoryColor: "orange" as const,
  detail: "First paragraph.\n\nSecond paragraph.",
  meta: "A Writer · 2h ago",
  sourceKey: "news:nw-1",
  sticker: { shade: 1, x: 12.5, y: 40 },
  createdAt: 1_700_000_000_000,
};

describe("reads with nothing configured", () => {
  it("opens the board empty and unbacked rather than failing", async () => {
    await expect(readBoard(BOARD)).resolves.toEqual(EMPTY_DOC);
    expect(EMPTY_DOC.backed).toBe(false);
    expect(EMPTY_DOC.circles).toEqual(BUILTIN_CIRCLES);
  });
});

describe("writes with nothing configured", () => {
  /* "Not backed" and "failed" are different answers and the client store does
     different things with them: the first keeps the board in the browser, the
     second re-reads. An unconfigured project must give the first. */
  it("answers not-backed, never an error", async () => {
    expect(await storeAddInsight(BOARD, CARD)).toEqual({ ok: false, backed: false });
    expect(await clearBoard(BOARD)).toEqual({ ok: false, backed: false });
  });
});

describe("isSchemaGap", () => {
  it("reads a missing table or column as 'not stored yet', not as a failure", () => {
    for (const code of ["PGRST204", "PGRST205", "42P01", "42703"]) {
      expect(isSchemaGap({ message: "whatever", code })).toBe(true);
    }
  });

  it("leaves every other failure a failure", () => {
    expect(isSchemaGap({ message: "deadlock detected", code: "40P01" })).toBe(false);
    expect(isSchemaGap({ message: "no code at all" })).toBe(false);
    expect(isSchemaGap(null)).toBe(false);
  });
});

describe("rows ↔ cards", () => {
  it("round-trips a sticker-filed card", () => {
    const row = insightToRow(BOARD, CARD);
    expect(row.board_id).toBe(BOARD);
    expect(row.source_key).toBe("news:nw-1");
    expect(row.sticker).toEqual({ shade: 1, x: 12.5, y: 40 });
    expect(rowToInsight(row)).toEqual(CARD);
  });

  /* The board's types say a field is absent, not null. A null that survives
     the trip renders as "null" in a byline. */
  it("brings absent columns back as undefined, not null", () => {
    const bare = insightToRow(BOARD, { ...CARD, source: undefined, meta: undefined, sticker: undefined });
    expect(bare.source).toBeNull();
    const back = rowToInsight(bare);
    expect(back.source).toBeUndefined();
    expect(back.meta).toBeUndefined();
    expect(back.sticker).toBeUndefined();
    expect("source" in back).toBe(true); // present as a key, absent as a value
  });

  it("rewrites circle ids the board has since renamed", () => {
    const row = { ...insightToRow(BOARD, CARD), circle_id: "channels" };
    expect(rowToInsight(row).circleId).toBe("media-hotspots");
    expect(migrateCircleId("opinion-leaders")).toBe("key-influencers");
  });

  it("keeps a fused idea's pair of ids on both sides", () => {
    const idea = {
      id: "idea-1",
      text: "Run clubs are the new third place",
      itemIds: ["ins-1", "ins-2"] as [string, string],
      circleIds: ["news", "culture"] as [string, string],
      colorTag: "orange" as const,
      createdAt: 1_700_000_000_000,
    };
    expect(rowToIdea(ideaToRow(BOARD, idea))).toEqual(idea);
  });

  it("marks the seven built-ins as built-in and everything else as not", () => {
    expect(circleToRow(BOARD, BUILTIN_CIRCLES[0], 0).built_in).toBe(true);
    expect(
      circleToRow(BOARD, { id: "c1", name: "Mine", color: "blue", icon: "none", size: "md" }).built_in
    ).toBe(false);
  });
});

describe("what a board is allowed to send", () => {
  it("takes a card the Live tab filed", () => {
    expect(parseInsight(CARD)).toEqual(CARD);
  });

  it("stamps a card that arrives without a time of its own", () => {
    const parsed = parseInsight({ ...CARD, createdAt: undefined });
    expect(parsed?.createdAt).toBeGreaterThan(0);
  });

  it("refuses a headline the column could not hold", () => {
    expect(parseInsight({ ...CARD, headline: "x".repeat(301) })).toBeNull();
    expect(parseInsight({ ...CARD, headline: "   " })).toBeNull();
  });

  it("refuses a colour or size that is not one of the board's", () => {
    expect(parseCircle({ id: "c1", name: "Mine", color: "chartreuse" })).toBeNull();
    expect(parseCircle({ id: "c1", name: "Mine", color: "blue", size: "enormous" })).toBeNull();
  });

  it("fills a new circle's unstated icon and size", () => {
    expect(parseCircle({ id: "c1", name: "Mine", color: "blue" })).toEqual({
      id: "c1",
      name: "Mine",
      color: "blue",
      icon: "none",
      size: "md",
    });
  });

  it("holds a fused idea to exactly two cards", () => {
    const idea = {
      id: "idea-1",
      text: "Two halves",
      itemIds: ["a", "b"],
      circleIds: ["news", "social"],
    };
    expect(parseIdea(idea)).not.toBeNull();
    expect(parseIdea({ ...idea, itemIds: ["a"] })).toBeNull();
    expect(parseIdea({ ...idea, itemIds: ["a", "b", "c"] })).toBeNull();
  });

  /* Placements are percentages of the target, so a sticker lands where it was
     dropped at any width — and anything outside 0-100 is not a placement. */
  it("keeps a sticker's placement on the target", () => {
    expect(parseSticker({ shade: 2, x: 0, y: 100 })).toEqual({ shade: 2, x: 0, y: 100 });
    expect(parseSticker({ shade: 2, x: -1, y: 50 })).toBeNull();
    expect(parseSticker({ shade: 9, x: 50, y: 50 })).toBeNull();
  });
});
