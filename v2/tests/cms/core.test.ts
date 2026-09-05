import { describe, expect, it } from "vitest";
import { defineModule, f } from "@/lib/cms/spec";
import { schemaFor } from "@/lib/cms/schema";
import { defaultFor, issuesToFieldErrors, parseDoc } from "@/lib/cms/parse";
import { getAt, insertAt, moveAt, pathKey, removeAt, setAt } from "@/lib/cms/paths";
import { newId } from "@/lib/cms/ids";

const sample = defineModule({
  key: "sample",
  tab: "live",
  order: 1,
  label: "Sample",
  heading: { eyebrow: "Dispatch", title: "Sample" },
  boardPath: "/",
  fields: {
    subtitle: f.text({ label: "Subtitle", default: "Hello", maxLength: 20 }),
    note: f.text({ label: "Note", optional: true }),
    count: f.number({ label: "Count", integer: true, min: 0, max: 100 }),
    ratio: f.number({ label: "Ratio", min: 0, max: 5 }),
    live: f.boolean({ label: "Live" }),
    tone: f.select({
      label: "Tone",
      options: [
        { value: "orange", label: "Orange" },
        { value: "blue", label: "Blue" },
      ],
      default: "orange",
    }),
    logo: f.image({ label: "Logo", optional: true }),
    tint: f.color({ label: "Tint", optional: true }),
    rows: f.list({
      label: "Rows",
      min: 1,
      max: 3,
      summary: "name",
      idPrefix: "row",
      item: f.object({
        fields: {
          id: f.id(),
          name: f.text({ label: "Name" }),
          link: f.url({ label: "Link", optional: true }),
        },
      }),
    }),
    quad: f.list({ label: "Quad", exactly: 2, item: f.number({ label: "n" }) }),
    extra: f.object({ label: "Extra", optional: true, fields: { text: f.text({ label: "Text" }) } }),
  },
  fixture: () => ({
    subtitle: "Hello",
    count: 3,
    ratio: 1.5,
    live: true,
    tone: "orange",
    rows: [{ id: "row-1", name: "One" }],
    quad: [1, 2],
  }),
});

const valid = sample.fixture();

describe("schemaFor", () => {
  const schema = schemaFor(sample);

  it("accepts the fixture and fills nothing extra", () => {
    const out = schema.parse(valid);
    expect(out).toEqual(valid);
  });

  it("fills defaults for missing defaulted scalars and strips unknown keys", () => {
    const rest: Record<string, unknown> = { ...valid, bogus: 1 };
    delete rest.subtitle;
    delete rest.tone;
    const out = schema.parse(rest);
    expect(out.subtitle).toBe("Hello");
    expect(out.tone).toBe("orange");
    expect("bogus" in out).toBe(false);
  });

  it("rejects an empty required text and trims", () => {
    expect(schema.safeParse({ ...valid, rows: [{ id: "row-1", name: "  " }] }).success).toBe(false);
    expect(schema.parse({ ...valid, rows: [{ id: "row-1", name: "  One " }] }).rows[0].name).toBe("One");
  });

  it("turns an empty optional string into undefined", () => {
    const out = schema.parse({ ...valid, note: "", logo: "" });
    expect(out.note).toBeUndefined();
    expect(out.logo).toBeUndefined();
  });

  it("enforces maxLength, integer, min/max and select membership", () => {
    expect(schema.safeParse({ ...valid, subtitle: "x".repeat(21) }).success).toBe(false);
    expect(schema.safeParse({ ...valid, count: 1.5 }).success).toBe(false);
    expect(schema.safeParse({ ...valid, count: 101 }).success).toBe(false);
    expect(schema.safeParse({ ...valid, ratio: 4.25 }).success).toBe(true);
    expect(schema.safeParse({ ...valid, tone: "green" }).success).toBe(false);
  });

  it("validates image, url and color formats", () => {
    expect(schema.safeParse({ ...valid, logo: "/assets/x/y.png" }).success).toBe(true);
    expect(schema.safeParse({ ...valid, logo: "https://cdn.example.com/a.png" }).success).toBe(true);
    expect(schema.safeParse({ ...valid, logo: "C:/pictures/a.png" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, rows: [{ id: "a", name: "A", link: "ftp://x" }] }).success).toBe(false);
    expect(schema.safeParse({ ...valid, tint: "#FF4500" }).success).toBe(true);
    expect(schema.safeParse({ ...valid, tint: "orange" }).success).toBe(false);
  });

  it("enforces list bounds and exact lengths", () => {
    expect(schema.safeParse({ ...valid, rows: [] }).success).toBe(false);
    expect(schema.safeParse({ ...valid, quad: [1, 2, 3] }).success).toBe(false);
  });

  it("rejects duplicate row ids at the offending row", () => {
    const res = schema.safeParse({
      ...valid,
      rows: [
        { id: "row-1", name: "One" },
        { id: "row-1", name: "Two" },
      ],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(issuesToFieldErrors(res.error.issues)).toHaveProperty("rows.1.id");
    }
  });

  it("allows an optional object to be absent", () => {
    expect(schema.safeParse({ ...valid, extra: { text: "hi" } }).success).toBe(true);
    expect(schema.safeParse({ ...valid, extra: undefined }).success).toBe(true);
  });
});

describe("parseDoc", () => {
  it("returns the parsed doc on success", () => {
    const res = parseDoc(sample, valid);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.doc.rows[0].name).toBe("One");
  });

  it("keys field errors by dotted path and counts them", () => {
    const res = parseDoc(sample, { ...valid, count: -1, rows: [{ id: "r", name: "" }] });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(Object.keys(res.fieldErrors).sort()).toEqual(["count", "rows.0.name"]);
      expect(res.error).toBe("2 fields need attention");
    }
  });

  it("applies migrate before validating", () => {
    const legacy = defineModule({
      ...sample,
      key: "legacy",
      migrate: (raw) => {
        const r = raw as Record<string, unknown>;
        return "items" in r ? { ...r, rows: r.items } : r;
      },
    });
    const { rows, ...rest } = valid;
    const res = parseDoc(legacy, { ...rest, items: rows });
    expect(res.ok).toBe(true);
  });
});

describe("defaultFor", () => {
  it("builds a blank row with defaults, a fresh id and empty lists", () => {
    const row = defaultFor(sample.fields.rows.item, () => "row-x") as Record<string, unknown>;
    expect(row).toEqual({ id: "row-x", name: "", link: "" });
    const whole = defaultFor({ kind: "object", fields: sample.fields }, () => "id") as Record<string, unknown>;
    expect(whole.subtitle).toBe("Hello");
    expect(whole.tone).toBe("orange");
    expect(whole.count).toBe(0);
    expect(whole.live).toBe(false);
    expect(whole.rows).toEqual([]);
    expect(whole.quad).toEqual([0, 0]);
    expect("extra" in whole).toBe(false);
  });
});

describe("paths", () => {
  const doc = { a: { list: [{ n: 1 }, { n: 2 }, { n: 3 }] } };

  it("reads and writes immutably", () => {
    expect(getAt(doc, ["a", "list", 1, "n"])).toBe(2);
    const next = setAt(doc, ["a", "list", 1, "n"], 9) as typeof doc;
    expect(next.a.list[1].n).toBe(9);
    expect(doc.a.list[1].n).toBe(2);
    expect(next.a.list[0]).toBe(doc.a.list[0]);
  });

  it("inserts, removes and moves list rows", () => {
    const ins = insertAt(doc, ["a", "list"], 1, { n: 7 }) as typeof doc;
    expect(ins.a.list.map((r) => r.n)).toEqual([1, 7, 2, 3]);
    const rem = removeAt(doc, ["a", "list"], 0) as typeof doc;
    expect(rem.a.list.map((r) => r.n)).toEqual([2, 3]);
    const mov = moveAt(doc, ["a", "list"], 0, 2) as typeof doc;
    expect(mov.a.list.map((r) => r.n)).toEqual([2, 3, 1]);
  });

  it("formats a path key", () => {
    expect(pathKey(["rows", 2, "name"])).toBe("rows.2.name");
  });
});

describe("ids", () => {
  it("prefixes and never repeats", () => {
    const a = newId("row");
    const b = newId("row");
    expect(a).toMatch(/^row-[0-9a-f]{8}$/);
    expect(a).not.toBe(b);
  });
});
