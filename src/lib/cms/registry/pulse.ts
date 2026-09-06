import { defineModule, f } from "../spec";
import { wikiPulse, wikiPulseSpikes } from "@/data/live";

export const pulse = defineModule({
  key: "pulse",
  tab: "live",
  column: "data",
  order: 8,
  label: "Wikipedia Pulse",
  heading: { title: "Wikipedia Pulse" },
  boardPath: "/",
  fields: {
    /* Authored, not counted. Four rows carry `spike` today while the chip
       reads "2 spikes", so deriving it would change what the board prints —
       a content call for the agency, not something wiring should decide. */
    spikes: f.number({
      label: "Spike chip",
      help: "The number in the chip beside the title. It is not counted from the rows below.",
      integer: true,
      min: 0,
      default: wikiPulseSpikes,
    }),
    rows: f.list({
      label: "Entities",
      min: 1,
      max: 10,
      summary: "entity",
      idPrefix: "wp",
      item: f.object({
        fields: {
          id: f.id(),
          entity: f.text({ label: "Entity", help: "The page or category, as printed", maxLength: 80 }),
          meta: f.text({ label: "Who and when", help: "As printed: 12 editors · 8m ago", maxLength: 60 }),
          /* The bar is derived from this, so the count is the only figure
             an editor sets: the longest bar is the biggest count. */
          count: f.number({ label: "Edits in the window", integer: true, min: 0 }),
          window: f.text({ label: "Window", help: "The unit after the count: 24H", maxLength: 10 }),
          baseline: f.text({ label: "Baseline", help: "As printed: Baseline 4/day · 11.8× normal", maxLength: 60 }),
          spike: f.boolean({ label: "Spiking", help: "Marks the row as a spike on the board." }),
        },
      }),
    }),
  },
  /* `pct` is dropped here: the board now works the bar out from the counts,
     and a width left in the document would be read by nothing. */
  fixture: () => ({
    spikes: wikiPulseSpikes,
    rows: wikiPulse.map((row) => ({
      id: row.id,
      entity: row.entity,
      meta: row.meta,
      count: row.count,
      window: row.window,
      baseline: row.baseline,
      spike: row.spike,
    })),
  }),
});
