/* Widget values, made safe to render.

   A saved document can hold anything a previous version of the schema
   allowed, or anything a hand-edited JSON blob contained. Every editor
   binds React inputs straight to these values, so each one is narrowed to
   its exact shape first — a widget must never hand an input `undefined` and
   flip it to uncontrolled. Kept apart from index.ts so the editors can
   import it without an import cycle. */

import { CIRCLE_COLORS, CIRCLE_ICONS, CIRCLE_IDS, CIRCLE_SIZES, WIDGET_DEFAULTS } from "@/lib/cms/widgets";
import type { WidgetValue } from "@/lib/cms/widgets";

type Circles7 = WidgetValue<"circles7">;
type Circle = Circles7[(typeof CIRCLE_IDS)[number]];

const asArray = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);

const clampPoint = (n: number): number => Math.min(100, Math.max(0, n));

/** Twelve numbers in 0–100: padded, truncated and clamped. */
export function toPoints12(value: unknown): number[] {
  const raw = asArray(value);
  return Array.from({ length: 12 }, (_, i) => {
    const n = raw[i];
    if (typeof n !== "number" || !Number.isFinite(n)) return 0;
    return clampPoint(n);
  });
}

/** One point written back, clamped the same way the box displays it.

    `max={100}` on a number input does not stop anyone typing 500, and
    `toPoints12` clamps only on the way out — so without this the document
    would hold 500 while the box read 100, and the save would fail with
    "At most 100" against a field that visibly says 100. */
export function withPoint(points: readonly number[], index: number, raw: string): number[] {
  const parsed = Number(raw);
  const next = toPoints12(points);
  next[index] = raw.trim() === "" || Number.isNaN(parsed) ? 0 : clampPoint(parsed);
  return next;
}

/** Exactly three booleans; anything else in a slot reads as unticked. */
export function toPresence3(value: unknown): boolean[] {
  const raw = asArray(value);
  return Array.from({ length: 3 }, (_, i) => raw[i] === true);
}

function member<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

/** All seven circles, each field a value the board can actually draw. */
export function toCircles7(value: unknown): Circles7 {
  const defaults = WIDGET_DEFAULTS.circles7();
  const raw = (value !== null && typeof value === "object" ? value : {}) as Record<string, unknown>;

  const out = {} as Record<(typeof CIRCLE_IDS)[number], Circle>;
  for (const id of CIRCLE_IDS) {
    const fallback = defaults[id];
    const saved = raw[id];
    if (saved === null || typeof saved !== "object") {
      out[id] = fallback;
      continue;
    }
    const c = saved as Record<string, unknown>;
    out[id] = {
      name: typeof c.name === "string" ? c.name : fallback.name,
      color: member(CIRCLE_COLORS, c.color, fallback.color),
      icon: member(CIRCLE_ICONS, c.icon, fallback.icon),
      size: member(CIRCLE_SIZES, c.size, fallback.size),
    };
  }
  return out;
}

/** An SVG path across `width` with 0 at the bottom and 100 at the top. */
export function sparklinePath(points: readonly number[], width: number, height: number): string {
  if (points.length === 0) return "";
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  return points
    .map((point, i) => {
      const y = height - (Math.min(100, Math.max(0, point)) / 100) * height;
      return `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
