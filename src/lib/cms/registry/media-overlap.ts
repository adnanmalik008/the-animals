import { defineModule, f } from "../spec";
import { mediaOverlap } from "@/data/competition";

/* Media Overlap — the presence matrix.

   The columns are the competitive set, so they are not typed here: the
   card reads the `competitors` document for its headers, and the widget
   below points at the same list so the admin labels its three checkboxes
   with the brands the board will print. The old document carried its own
   `brands: string[]`, which was the same three names written twice.

   The card's "N shared by all" is counted from the rows, not authored. */

const KINDS = [
  { value: "earned", label: "Earned" },
  { value: "paid", label: "Paid" },
  { value: "owned", label: "Owned" },
] as const;

export const mediaOverlapModule = defineModule({
  key: "media-overlap",
  tab: "competition",
  order: 3,
  label: "Media Overlap",
  heading: { title: "Media Overlap" },
  boardPath: "/competition",
  fields: {
    rows: f.list({
      label: "Channels",
      help: "One row per channel, printed top to bottom in this order.",
      min: 1,
      max: 12,
      summary: "channel",
      idPrefix: "mo",
      item: f.object({
        fields: {
          id: f.id(),
          channel: f.text({ label: "Channel", help: "As printed: Organic Search, Display Ads", maxLength: 32 }),
          kind: f.select({
            label: "Reach",
            help: "The tick beside the name: gold for earned, red for paid, none for owned. Paid rows shared by every brand tint olive rather than gold.",
            options: KINDS,
            default: "earned",
          }),
          /* Three checkboxes, one per column, named by the competitive set
             rather than by this document — the widget's headers come from
             the same list the board prints above the matrix. */
          presence: f.custom({
            label: "Present on",
            help: "Tick each brand that reaches people through this channel. A row every brand uses is counted into 'shared by all'.",
            widget: "presence3",
            columns: { doc: "competitors", list: "competitors", labelField: "name" },
          }),
        },
      }),
    }),
  },
  fixture: () => ({
    /* Ids the demo's rows keep for good: a sticker or a saved edit files
       against the id, not the channel's name. */
    rows: mediaOverlap.map((row, i) => ({ id: `mo-${i + 1}`, ...row })),
  }),
});
