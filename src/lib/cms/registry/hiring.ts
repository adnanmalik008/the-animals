import { defineModule, f } from "../spec";
import { hiringRows, hiringSummary } from "@/data/live";

export const hiring = defineModule({
  key: "hiring",
  tab: "live",
  column: "data",
  order: 9,
  label: "Hiring Velocity",
  heading: { title: "Hiring Velocity" },
  boardPath: "/",
  fields: {
    /* The "129 OPEN" half of the chip is the sum of the rows and is added
       up by the board; only the movement beside it is authored. */
    deltaPct: f.number({ label: "Movement", help: "Per cent beside the open-roles count, e.g. 98", integer: true, min: -100, max: 999, default: hiringSummary.deltaPct }),
    rows: f.list({
      label: "Functions",
      min: 1,
      max: 10,
      summary: "label",
      idPrefix: "hv",
      item: f.object({
        fields: {
          id: f.id(),
          label: f.text({ label: "Function", maxLength: 60 }),
          roles: f.number({ label: "Open roles", integer: true, min: 0 }),
          delta: f.number({ label: "Change", help: "Per cent, signed: 320 or −40", integer: true, min: -100, max: 9999 }),
          /* Not derivable from `roles`: the shipped bars do not track the
             role counts (41 roles draws 52%, 58 draws 60%), so the length
             is its own judgement about the function's momentum. */
          pct: f.number({ label: "Bar length", help: "0–100, relative to the busiest function", integer: true, min: 0, max: 100 }),
          note: f.text({ label: "What it means", help: "The annotation after the arrow", maxLength: 80 }),
        },
      }),
    }),
  },
  fixture: () => ({ deltaPct: hiringSummary.deltaPct, rows: hiringRows }),
});
