/* Widget schemas and their blank values. No module uses a `custom` field
   yet, so without this file nothing exercises widgets.ts at all — and
   nothing ties circles7's seven defaults to BUILTIN_CIRCLES, the same seven
   circles the Anomalies board renders today. The last test is that tie: it
   fails the day either list is edited alone. */
import { describe, expect, it } from "vitest";
import { CIRCLE_IDS, WIDGET_DEFAULTS, WIDGET_SCHEMAS } from "@/lib/cms/widgets";
import { BUILTIN_CIRCLES } from "@/lib/insights";

const twelve = (v: number) => Array.from({ length: 12 }, () => v);

describe("points12", () => {
  const schema = WIDGET_SCHEMAS.points12;

  it("accepts twelve values in 0–100", () => {
    expect(schema.safeParse(twelve(50)).success).toBe(true);
    expect(schema.safeParse([0, 100, ...twelve(1).slice(2)]).success).toBe(true);
  });

  it("rejects the wrong length and out-of-range values", () => {
    expect(schema.safeParse(twelve(0).slice(1)).success).toBe(false);
    expect(schema.safeParse([...twelve(0), 0]).success).toBe(false);
    expect(schema.safeParse([101, ...twelve(0).slice(1)]).success).toBe(false);
    expect(schema.safeParse([-1, ...twelve(0).slice(1)]).success).toBe(false);
    expect(schema.safeParse(twelve(0).map(String)).success).toBe(false);
  });

  it("blanks to twelve zeroes", () => {
    expect(WIDGET_DEFAULTS.points12()).toEqual(twelve(0));
    expect(schema.safeParse(WIDGET_DEFAULTS.points12()).success).toBe(true);
  });
});

describe("presence3", () => {
  const schema = WIDGET_SCHEMAS.presence3;

  it("accepts exactly three booleans", () => {
    expect(schema.safeParse([true, false, true]).success).toBe(true);
  });

  it("rejects the wrong length and non-booleans", () => {
    expect(schema.safeParse([true, false]).success).toBe(false);
    expect(schema.safeParse([true, false, true, false]).success).toBe(false);
    expect(schema.safeParse(["yes", "no", "yes"]).success).toBe(false);
  });

  it("blanks to three unticked columns", () => {
    expect(WIDGET_DEFAULTS.presence3()).toEqual([false, false, false]);
    expect(schema.safeParse(WIDGET_DEFAULTS.presence3()).success).toBe(true);
  });
});

describe("circles7", () => {
  const schema = WIDGET_SCHEMAS.circles7;

  it("accepts its own blank value", () => {
    expect(schema.safeParse(WIDGET_DEFAULTS.circles7()).success).toBe(true);
  });

  it("rejects a missing circle, an unknown enum value and a name that is blank or too long", () => {
    const missing: Record<string, unknown> = { ...WIDGET_DEFAULTS.circles7() };
    delete missing.news;
    expect(schema.safeParse(missing).success).toBe(false);

    const withNews = (patch: Record<string, unknown>) => {
      const all = WIDGET_DEFAULTS.circles7();
      return { ...all, news: { ...all.news, ...patch } };
    };
    expect(schema.safeParse(withNews({ color: "chartreuse" })).success).toBe(false);
    expect(schema.safeParse(withNews({ icon: "sparkle" })).success).toBe(false);
    expect(schema.safeParse(withNews({ size: "xl" })).success).toBe(false);
    expect(schema.safeParse(withNews({ name: "   " })).success).toBe(false);
    expect(schema.safeParse(withNews({ name: "x".repeat(25) })).success).toBe(false);
    expect(schema.safeParse(withNews({ name: "x".repeat(24) })).success).toBe(true);
  });

  it("strips the unknown keys a saved doc might carry", () => {
    const all = WIDGET_DEFAULTS.circles7();
    const res = schema.safeParse({ ...all, news: { ...all.news, builtIn: true } });
    expect(res.success).toBe(true);
    if (res.success) expect("builtIn" in res.data.news).toBe(false);
  });

  /* The link the future Anomalies CMS depends on: WIDGET_DEFAULTS.circles7
     and BUILTIN_CIRCLES describe the same seven circles, and nothing in the
     code makes one follow the other. */
  it("defaults match the board's built-in circles, field by field", () => {
    const defaults = WIDGET_DEFAULTS.circles7();

    expect(BUILTIN_CIRCLES.map((c) => c.id)).toEqual([...CIRCLE_IDS]);
    expect(Object.keys(defaults)).toEqual([...CIRCLE_IDS]);

    for (const circle of BUILTIN_CIRCLES) {
      const fromWidget = defaults[circle.id as (typeof CIRCLE_IDS)[number]];
      expect(fromWidget, `no widget default for circle ${circle.id}`).toBeDefined();
      expect(fromWidget.name).toBe(circle.name);
      expect(fromWidget.color).toBe(circle.color);
      expect(fromWidget.icon).toBe(circle.icon);
      expect(fromWidget.size).toBe(circle.size);
    }
  });
});
