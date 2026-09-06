/* The seven topic circles the Anomalies board is built around, plus the
   switch that decides whether it opens seeded with demo cards.

   Nothing reads this document yet — the Anomalies board still builds its
   circles in code. It is registered now so a board's `demoSeeds` can be
   set through the admin *before* the milestone that changes seeding
   behaviour ships, which is what stops the demo board opening blank on
   that deploy. */

import { defineModule, f } from "../spec";
import { WIDGET_DEFAULTS } from "../widgets";

export const anomalies = defineModule({
  key: "anomalies",
  tab: "anomalies",
  order: 1,
  label: "Topic circles",
  heading: { title: "Anomalies" },
  boardPath: "/anomalies",
  fields: {
    circles: f.custom({
      label: "Topic circles",
      help: "The seven circles are fixed — rename, recolour and resize them, but none can be added or removed.",
      widget: "circles7",
    }),
    demoSeeds: f.boolean({
      label: "Start with the demo cards",
      help: "Fills the circles with the built-in sample insights, the way the demo board opens. Leave off for a client board that should start empty.",
      default: false,
    }),
  },
  fixture: () => ({ circles: WIDGET_DEFAULTS.circles7(), demoSeeds: false }),
});
