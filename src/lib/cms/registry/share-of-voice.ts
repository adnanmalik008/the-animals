import { defineModule, f } from "../spec";
import { shareOfVoice } from "@/data/board";

/* The bar's colour. A closed set because each value is a palette token the
   board resolves to a class, not a free colour. */
const COLORS = [
  { value: "orange", label: "Orange" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "yellow", label: "Yellow" },
] as const;

export const shareOfVoiceModule = defineModule({
  key: "share-of-voice",
  tab: "live",
  column: "data",
  order: 2,
  label: "Share of Voice",
  heading: { title: "Share of Voice" },
  boardPath: "/",
  fields: {
    subtitle: f.text({ label: "Subtitle", default: "AI + Web conversation", maxLength: 60 }),
    window: f.text({ label: "Window chip", help: "The pill on the right, e.g. 7 days", default: "7 days", maxLength: 20 }),
    rows: f.list({
      label: "Brands",
      min: 1,
      max: 8,
      summary: "label",
      idPrefix: "sov",
      item: f.object({
        fields: {
          id: f.id(),
          label: f.text({ label: "Brand", maxLength: 40 }),
          /* The bar is this number, not a share of the leading row, so it
             is the figure itself an editor types. */
          pct: f.number({ label: "Share of conversation", help: "0–100; the bar is this wide", integer: true, min: 0, max: 100 }),
          color: f.select({ label: "Bar colour", options: COLORS, default: "orange" }),
        },
      }),
    }),
  },
  fixture: () => ({ subtitle: "AI + Web conversation", window: "7 days", rows: shareOfVoice }),
});
