import { defineModule, f } from "../spec";
import { appStoreVoice } from "@/data/live";

/* The card prints the review inside typographic quotes. */
const NOT_QUOTED = /^[^"'“«][\s\S]*[^"'”»]$/;

/* One platform's panel. Both tabs are the same shape, and the two tabs are
   fixed in code: they are the two app stores, not a list a client edits. */
const platform = (label: string) =>
  f.object({
    label,
    fields: {
      rating: f.number({ label: "Rating", help: "0–5, one decimal; the stars round it", min: 0, max: 5, step: 0.1 }),
      totalLabel: f.text({ label: "Review count", help: "As printed: 12 840 reviews", maxLength: 30 }),
      stats: f.list({
        label: "Movement chips",
        help: "The row of review themes under the rating.",
        min: 1,
        max: 4,
        summary: "label",
        idPrefix: "as",
        item: f.object({
          fields: {
            /* A sticker files against this id. The chips used to key on
               their own label, so renaming a theme moved its sticker. */
            id: f.id(),
            value: f.text({ label: "Movement", help: "With its sign and unit: +34%", maxLength: 12 }),
            label: f.text({ label: "Theme", maxLength: 30 }),
          },
        }),
      }),
      review: f.object({
        label: "Featured review",
        fields: {
          text: f.textarea({
            label: "Review",
            rows: 3,
            maxLength: 400,
            pattern: NOT_QUOTED,
            patternHint: "Without quote marks — the card adds them",
          }),
          author: f.text({ label: "Reviewer", maxLength: 40 }),
        },
      }),
    },
  });

const withStatIds = (prefix: string, stats: { value: string; label: string }[]) =>
  stats.map((stat, i) => ({ id: `as-${prefix}-${i + 1}`, ...stat }));

export const appStore = defineModule({
  key: "app-store",
  tab: "live",
  column: "data",
  order: 7,
  label: "App Store Voice",
  heading: { title: "App Store Voice" },
  boardPath: "/",
  fields: {
    ios: platform("iOS"),
    android: platform("Android"),
  },
  fixture: () => ({
    ios: { ...appStoreVoice.ios, stats: withStatIds("i", appStoreVoice.ios.stats) },
    android: { ...appStoreVoice.android, stats: withStatIds("a", appStoreVoice.android.stats) },
  }),
});
