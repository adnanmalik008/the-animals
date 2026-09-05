/* The form engine's logic, without a renderer.

   There is no jsdom here on purpose: every decision the generated form makes
   — what a blank row contains, whether Add is allowed, which ids a duplicate
   gets, what a collapsed row is titled — lives in a pure function so it can
   be tested for real instead of through a DOM that would only prove React
   renders. The components are thin wrappers around what follows. */
import { describe, expect, it } from "vitest";
import { f } from "@/lib/cms/spec";
import type { ListSpec, ObjectSpec } from "@/lib/cms/spec";
import { WIDGET_DEFAULTS } from "@/lib/cms/widgets";
import {
  afterInsert,
  afterMove,
  afterRemove,
  blankObject,
  describePath,
  errorsUnder,
  listBounds,
  newRow,
  prefixFromPath,
  rowSummary,
  withFreshIds,
} from "@/components/admin/form/list-ops";
import { docReducer, initDocState, isDirty } from "@/components/admin/form/useDocState";
import { sparklinePath, toCircles7, toPoints12, toPresence3 } from "@/components/admin/form/widgets";

/* a list whose rows carry ids at two levels, so "fresh ids all the way
   down" is actually exercised */
const tagList = f.list({
  label: "Tags",
  idPrefix: "tag",
  item: f.object({ fields: { id: f.id(), name: f.text({ label: "Name" }) } }),
});

const rows: ListSpec = f.list({
  label: "Rows",
  min: 1,
  max: 3,
  summary: "headline",
  idPrefix: "nw",
  item: f.object({
    fields: {
      id: f.id(),
      headline: f.text({ label: "Headline" }),
      rank: f.number({ label: "Rank", min: 2 }),
      live: f.boolean({ label: "Live", default: true }),
      tone: f.select({
        label: "Tone",
        options: [
          { value: "orange", label: "Orange" },
          { value: "blue", label: "Blue" },
        ],
      }),
      link: f.url({ label: "Link", optional: true }),
      points: f.custom({ label: "Points", widget: "points12" }),
      tags: tagList,
      extra: f.object({ label: "Extra", optional: true, fields: { id: f.id(), note: f.text({ label: "Note" }) } }),
    },
  }),
});

const item = rows.item as ObjectSpec;

/* deterministic ids so the assertions can name them */
function minter() {
  let n = 0;
  return (prefix: string) => `${prefix}-${++n}`;
}

describe("newRow", () => {
  it("builds a blank row from the item spec, minting ids with the list's prefix", () => {
    const mint = minter();
    const row = newRow(rows, mint) as Record<string, unknown>;

    expect(row.id).toBe("nw-1");
    expect(row.headline).toBe("");
    expect(row.rank).toBe(2); // min, per defaultFor
    expect(row.live).toBe(true); // declared default
    expect(row.tone).toBe("orange"); // first option
    expect(row.link).toBe("");
    expect(row.points).toEqual(WIDGET_DEFAULTS.points12());
    expect(row.tags).toEqual([]);
    expect(row.extra).toBeUndefined(); // optional objects stay absent
  });

  it("falls back to the 'row' prefix when the list declares none", () => {
    const anon = f.list({ label: "Anon", item: f.object({ fields: { id: f.id() } }) });
    expect((newRow(anon, minter()) as { id: string }).id).toBe("row-1");
  });

  it("mints a real id when no minter is supplied", () => {
    const row = newRow(rows) as { id: string };
    expect(row.id).toMatch(/^nw-[0-9a-f]{8}$/);
  });

  it("seeds `exactly` lists with that many blank rows", () => {
    const pair = f.list({ label: "Pair", exactly: 2, item: f.number({ label: "n" }) });
    expect(blankObject(f.object({ fields: { pair } }), () => "x")).toEqual({ pair: [0, 0] });
  });
});

describe("blankObject", () => {
  it("builds the object an optional fieldset is switched on to", () => {
    const optional = f.object({
      label: "Extra",
      optional: true,
      fields: { id: f.id(), note: f.text({ label: "Note", default: "hi" }) },
    });
    const mint = minter();
    expect(blankObject(optional, () => mint("id"))).toEqual({ id: "id-1", note: "hi" });
  });
});

describe("withFreshIds", () => {
  it("replaces every id in the copied subtree and leaves everything else alone", () => {
    const original = {
      id: "nw-old",
      headline: "Keep me",
      rank: 4,
      live: false,
      tone: "blue",
      link: "https://example.com",
      points: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      tags: [
        { id: "tag-old-a", name: "A" },
        { id: "tag-old-b", name: "B" },
      ],
      extra: { id: "x-old", note: "n" },
    };

    const mint = minter();
    const copy = withFreshIds(item, original, () => mint("fresh")) as typeof original;

    expect(copy.id).toBe("fresh-1");
    expect(copy.tags.map((t) => t.id)).toEqual(["fresh-2", "fresh-3"]);
    expect(copy.extra.id).toBe("fresh-4");

    expect(copy.headline).toBe("Keep me");
    expect(copy.rank).toBe(4);
    expect(copy.live).toBe(false);
    expect(copy.tone).toBe("blue");
    expect(copy.link).toBe("https://example.com");
    expect(copy.tags.map((t) => t.name)).toEqual(["A", "B"]);
    expect(copy.extra.note).toBe("n");
  });

  it("does not touch the original, and shares no mutable structure with it", () => {
    const original = { id: "a", tags: [{ id: "b", name: "B" }], points: [0] };
    const copy = withFreshIds(item, original, () => "z") as typeof original;

    expect(original.id).toBe("a");
    expect(original.tags[0].id).toBe("b");
    expect(copy.tags).not.toBe(original.tags);
    expect(copy.tags[0]).not.toBe(original.tags[0]);
    expect(copy.points).not.toBe(original.points);
  });

  it("survives a row whose shape does not match the spec", () => {
    expect(withFreshIds(item, null, () => "x")).toBe(null);
    expect(withFreshIds(item, { tags: "not a list" }, () => "x")).toEqual({ id: "x", tags: "not a list" });
  });
});

describe("listBounds", () => {
  it("allows both when the list is between its bounds", () => {
    const b = listBounds(rows, 2);
    expect(b.canAdd).toBe(true);
    expect(b.canRemove).toBe(true);
    expect(b.addReason).toBeUndefined();
    expect(b.removeReason).toBeUndefined();
  });

  it("stops Add at max and Remove at min, with the reason", () => {
    expect(listBounds(rows, 3)).toMatchObject({ canAdd: false, addReason: "At most 3 items", canRemove: true });
    expect(listBounds(rows, 1)).toMatchObject({ canAdd: true, canRemove: false, removeReason: "At least 1 item" });
  });

  it("locks a fixed-length list in both directions", () => {
    const fixed = f.list({ label: "Fixed", exactly: 4, item: f.text({ label: "t" }) });
    expect(listBounds(fixed, 4)).toMatchObject({
      canAdd: false,
      addReason: "Exactly 4 items",
      canRemove: false,
      removeReason: "Exactly 4 items",
    });
  });

  it("never offers Remove on an empty list", () => {
    const free = f.list({ label: "Free", item: f.text({ label: "t" }) });
    expect(listBounds(free, 0)).toMatchObject({ canAdd: true, canRemove: false });
    expect(listBounds(free, 1).canRemove).toBe(true);
  });
});

describe("rowSummary", () => {
  it("titles a row with its summary field", () => {
    expect(rowSummary(rows, { headline: "Nike goes big" }, 0)).toBe("Nike goes big");
  });

  it("falls back to the position when the summary is blank, missing or not a row", () => {
    expect(rowSummary(rows, { headline: "   " }, 0)).toBe("Item 1");
    expect(rowSummary(rows, {}, 4)).toBe("Item 5");
    expect(rowSummary(rows, "plain string", 1)).toBe("Item 2");
    const unsummarised = f.list({ label: "L", item: f.text({ label: "t" }) });
    expect(rowSummary(unsummarised, "text", 0)).toBe("Item 1");
  });

  it("prints a numeric summary", () => {
    const numbered = f.list({
      label: "L",
      summary: "year",
      item: f.object({ fields: { year: f.number({ label: "Y" }) } }),
    });
    expect(rowSummary(numbered, { year: 2026 }, 0)).toBe("2026");
  });
});

describe("prefixFromPath", () => {
  it("names generated ids after the field they sit in", () => {
    expect(prefixFromPath(["items", 2, "tags"])).toBe("tags");
    expect(prefixFromPath(["incoming"])).toBe("incoming");
  });

  it("falls back when the path ends in an index or is empty", () => {
    expect(prefixFromPath(["items", 2])).toBe("row");
    expect(prefixFromPath([])).toBe("row");
    expect(prefixFromPath([], "id")).toBe("id");
  });
});

describe("errorsUnder", () => {
  const errors = {
    "items.0.headline": "Required",
    "items.2.tags.1.name": "Required",
    "items.20.headline": "Required",
    title: "Required",
  };

  /* a collapsed row has to show that something inside it is wrong, or the
     error is unreachable: the summary points at a field nobody can see */
  it("finds an error anywhere inside a row", () => {
    expect(errorsUnder(errors, ["items", 0])).toEqual(["items.0.headline"]);
    expect(errorsUnder(errors, ["items", 2])).toEqual(["items.2.tags.1.name"]);
    expect(errorsUnder(errors, ["items", 1])).toEqual([]);
  });

  it("counts an error on the row itself", () => {
    expect(errorsUnder({ "items.0": "Duplicate id" }, ["items", 0])).toEqual(["items.0"]);
  });

  /* "items.2" must not match "items.20" */
  it("does not mistake a longer index for a prefix", () => {
    expect(errorsUnder(errors, ["items", 2])).not.toContain("items.20.headline");
  });

  it("returns every error for the whole document", () => {
    expect(errorsUnder(errors, [])).toHaveLength(4);
  });
});

describe("describePath", () => {
  it("turns a path key into something a person can read", () => {
    expect(describePath("items.2.headline")).toBe("Items › 3 › Headline");
    expect(describePath("clock.timeZone")).toBe("Clock › Time zone");
    expect(describePath("logoUrl")).toBe("Logo url");
    expect(describePath("")).toBe("Document");
  });
});

describe("open-row bookkeeping", () => {
  it("keeps the right rows open when one is inserted", () => {
    expect(afterInsert([0, 2], 1)).toEqual([0, 3]);
    expect(afterInsert([0, 1], 2)).toEqual([0, 1]);
  });

  it("keeps the right rows open when one is removed", () => {
    expect(afterRemove([0, 1, 2], 1)).toEqual([0, 1]);
    expect(afterRemove([1], 1)).toEqual([]);
  });

  it("follows a row that moves", () => {
    expect(afterMove([0], 0, 2)).toEqual([2]);
    expect(afterMove([2], 2, 0)).toEqual([0]);
    expect(afterMove([1], 0, 2)).toEqual([0]);
    expect(afterMove([0], 2, 0)).toEqual([1]);
    expect(afterMove([3], 0, 2)).toEqual([3]);
  });
});

describe("docReducer", () => {
  const initial = { title: "One", rows: [{ id: "a" }, { id: "b" }, { id: "c" }] };

  it("starts clean", () => {
    expect(isDirty(initDocState(initial))).toBe(false);
  });

  it("sets a value at a path without mutating the previous doc", () => {
    const s0 = initDocState(initial);
    const s1 = docReducer(s0, { type: "set", path: ["rows", 1, "id"], value: "B" });

    expect(s1.doc).toEqual({ title: "One", rows: [{ id: "a" }, { id: "B" }, { id: "c" }] });
    expect(s0.doc).toEqual(initial);
    expect(isDirty(s1)).toBe(true);
  });

  it("goes clean again when the value is put back", () => {
    let s = initDocState(initial);
    s = docReducer(s, { type: "set", path: ["title"], value: "Two" });
    expect(isDirty(s)).toBe(true);
    s = docReducer(s, { type: "set", path: ["title"], value: "One" });
    expect(isDirty(s)).toBe(false);
  });

  it("inserts, removes and moves rows", () => {
    let s = initDocState(initial);
    s = docReducer(s, { type: "insert", path: ["rows"], index: 1, value: { id: "d" } });
    expect(s.doc).toMatchObject({ rows: [{ id: "a" }, { id: "d" }, { id: "b" }, { id: "c" }] });
    s = docReducer(s, { type: "remove", path: ["rows"], index: 0 });
    expect(s.doc).toMatchObject({ rows: [{ id: "d" }, { id: "b" }, { id: "c" }] });
    s = docReducer(s, { type: "move", path: ["rows"], from: 2, to: 0 });
    expect(s.doc).toMatchObject({ rows: [{ id: "c" }, { id: "d" }, { id: "b" }] });
  });

  /* moveAt/removeAt splice blindly; an out-of-range index would otherwise
     drop a row or splice `undefined` into the list */
  it("ignores out-of-range list operations", () => {
    const s0 = initDocState(initial);
    expect(docReducer(s0, { type: "move", path: ["rows"], from: 5, to: 0 })).toBe(s0);
    expect(docReducer(s0, { type: "move", path: ["rows"], from: 0, to: 9 })).toBe(s0);
    expect(docReducer(s0, { type: "move", path: ["rows"], from: 1, to: 1 })).toBe(s0);
    expect(docReducer(s0, { type: "remove", path: ["rows"], index: 3 })).toBe(s0);
    expect(docReducer(s0, { type: "remove", path: ["rows"], index: -1 })).toBe(s0);
    expect(docReducer(s0, { type: "insert", path: ["rows"], index: 4, value: {} })).toBe(s0);
  });

  it("reset() marks the current doc as the new baseline", () => {
    let s = initDocState(initial);
    s = docReducer(s, { type: "set", path: ["title"], value: "Two" });
    s = docReducer(s, { type: "reset" });
    expect(isDirty(s)).toBe(false);
    expect(s.doc).toMatchObject({ title: "Two" });
  });

  it("reset(next) replaces the doc and the baseline together", () => {
    let s = initDocState(initial);
    s = docReducer(s, { type: "set", path: ["title"], value: "Two" });
    s = docReducer(s, { type: "reset", doc: { title: "Fresh" } });
    expect(s.doc).toEqual({ title: "Fresh" });
    expect(isDirty(s)).toBe(false);
  });

  it("is not fooled into dirty by a no-op set", () => {
    const s0 = initDocState(initial);
    const s1 = docReducer(s0, { type: "set", path: ["title"], value: "One" });
    expect(isDirty(s1)).toBe(false);
  });
});

describe("widget value coercion", () => {
  it("points12 pads, truncates and clamps whatever a saved doc holds", () => {
    expect(toPoints12(undefined)).toEqual(WIDGET_DEFAULTS.points12());
    expect(toPoints12([1, 2, 3])).toEqual([1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(toPoints12(Array.from({ length: 14 }, (_, i) => i))).toHaveLength(12);
    expect(toPoints12([-5, 500, "x", null, ...Array(8).fill(1)]).slice(0, 4)).toEqual([0, 100, 0, 0]);
  });

  it("presence3 always yields three booleans", () => {
    expect(toPresence3(undefined)).toEqual([false, false, false]);
    expect(toPresence3([true])).toEqual([true, false, false]);
    expect(toPresence3([1, "yes", true, true])).toEqual([false, false, true]);
  });

  it("circles7 fills in any circle a saved doc is missing", () => {
    const defaults = WIDGET_DEFAULTS.circles7();
    expect(toCircles7(undefined)).toEqual(defaults);
    const patched = toCircles7({ news: { name: "Headlines", color: "red", icon: "globe", size: "lg" } });
    expect(patched.news).toEqual({ name: "Headlines", color: "red", icon: "globe", size: "lg" });
    expect(patched.social).toEqual(defaults.social);
    expect(toCircles7({ news: { name: "N", color: "chartreuse", icon: "?", size: "xl" } }).news).toEqual({
      name: "N",
      color: defaults.news.color,
      icon: defaults.news.icon,
      size: defaults.news.size,
    });
  });

  it("draws a sparkline that spans the box and inverts the axis", () => {
    expect(sparklinePath(WIDGET_DEFAULTS.points12(), 110, 24)).toBe(
      Array.from({ length: 12 }, (_, i) => `${i === 0 ? "M" : "L"}${((i * 110) / 11).toFixed(2)},24.00`).join(" ")
    );
    const top = sparklinePath(
      Array.from({ length: 12 }, () => 100),
      110,
      24
    );
    expect(top.startsWith("M0.00,0.00")).toBe(true);
    expect(top.endsWith("L110.00,0.00")).toBe(true);
    expect(sparklinePath([], 110, 24)).toBe("");
  });
});
