import { defineModule, f } from "../spec";
import { searchLandscape, searchObservations } from "@/data/competition";

/* Their Search Landscape — one SEO card per competitor, its stats read down
   two columns in the order they are listed here. */

export const searchLandscapeModule = defineModule({
  key: "search-landscape",
  tab: "competition",
  order: 6,
  label: "Their Search Landscape",
  heading: { eyebrow: "Search Footprint", title: "Their Search Landscape" },
  boardPath: "/competition",
  fields: {
    cards: f.list({
      label: "Cards",
      help: "One card per competitor, left to right across the row.",
      min: 1,
      max: 6,
      summary: "id",
      item: f.object({
        fields: {
          /* The card *is* the competitor: the name in the card's header
             comes from the Competitive set, and naming the ref `id` is what
             stops two cards claiming the same brand. */
          id: f.ref({
            label: "Competitor",
            help: "The name in the card header comes from the Competitive set.",
            source: { doc: "competitors", list: "competitors", labelField: "name" },
          }),
          stats: f.list({
            label: "Stats",
            help: "Filled down two columns in this order, so order is the layout.",
            min: 1,
            max: 12,
            summary: "label",
            idPrefix: "seo",
            item: f.object({
              fields: {
                /* The cell used to be keyed by its label, so renaming a
                   stat rebuilt the cell. */
                id: f.id(),
                label: f.text({ label: "Stat", help: "The grey line under the figure", maxLength: 30 }),
                value: f.text({
                  label: "Figure",
                  help: "Pre-formatted, printed as typed: 76, 61.7K, 5.1M, 29%",
                  maxLength: 12,
                }),
                /* The tone is not a second field: the board colours a
                   delta orange when it opens with a minus and green
                   otherwise, which is what the built-in set already does
                   for all twelve of its movements. */
                delta: f.text({
                  label: "Movement",
                  help: "With its sign: -9.5%, +34%. A minus prints orange, anything else green.",
                  maxLength: 10,
                  optional: true,
                }),
                tag: f.text({
                  label: "Chip",
                  help: "The small pill beside the figure, e.g. Industry leader. Leave empty for none.",
                  maxLength: 30,
                  optional: true,
                }),
              },
            }),
          }),
        },
      }),
    }),
    /* The longest built-in read is 309 characters. */
    observations: f.textarea({
      label: "Observations",
      help: "The orange-labelled read under the row of cards.",
      rows: 4,
      maxLength: 700,
    }),
  },
  /* `name` is gone — it came from the competitor — and so is `deltaTone`,
     which the cell now takes from the sign of the movement. */
  fixture: () => ({
    cards: searchLandscape.map((card) => ({
      id: card.id,
      stats: card.stats.map((stat, i) => ({
        id: `seo-${card.id}-${i + 1}`,
        label: stat.label,
        value: stat.value,
        delta: stat.delta,
        tag: stat.tag,
      })),
    })),
    observations: searchObservations,
  }),
});
