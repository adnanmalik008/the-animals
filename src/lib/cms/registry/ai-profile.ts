import { defineModule, f } from "../spec";
import { aiObservations, aiProfiles } from "@/data/competition";

/* Their AI Profile — the Live tab's AI Search Visibility card, redrawn for
   the dark board once per competitor.

   The four platforms are a closed set for exactly the reason `ai-visibility`
   closes them: each value keys the mark the design exports for the dark
   board and the model's own name printed beside it. Brand names and their
   icon sets stay in code. */
const PLATFORMS = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "grok", label: "Grok" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
] as const;

export const aiProfile = defineModule({
  key: "ai-profile",
  tab: "competition",
  order: 5,
  label: "Their AI Profile",
  heading: { eyebrow: "Machine Vision", title: "Their AI Profile" },
  boardPath: "/competition",
  fields: {
    profiles: f.list({
      label: "Cards",
      help: "One card per competitor, left to right across the row.",
      min: 1,
      max: 6,
      summary: "id",
      item: f.object({
        fields: {
          /* The card *is* the competitor, so the reference is the row's own
             identity: the name above the card comes from the Competitive
             set, and naming the ref `id` is what stops two cards claiming
             the same brand. */
          id: f.ref({
            label: "Competitor",
            help: "The name above the card comes from the Competitive set.",
            source: { doc: "competitors", list: "competitors", labelField: "name" },
          }),
          visibility: f.number({
            label: "AI Visibility",
            help: "0–100. The big orange figure in the black box.",
            integer: true,
            min: 0,
            max: 100,
          }),
          /* Not summed from the rows below. Three of the six built-in
             totals do add up, but Patagonia's cited pages read 3.2M against
             a row total of 3.6M, and the K/M rounding the design prints is
             not recoverable from the strings either — so both totals are
             authored, as they are today. */
          mentions: f.text({
            label: "Mentions, total",
            help: "Pre-formatted, printed as typed: 1.3M",
            maxLength: 12,
          }),
          cited: f.text({
            label: "Cited pages, total",
            help: "Pre-formatted, printed as typed: 3.2M",
            maxLength: 12,
          }),
          platforms: f.list({
            label: "Platforms",
            help: "One row each. The mark and the model's name come from the platform picked.",
            min: 1,
            max: 4,
            summary: "id",
            item: f.object({
              fields: {
                /* The row's id is the platform, not a generated key: it is
                   what the mark map is keyed by. */
                id: f.select({ label: "Platform", options: PLATFORMS, default: "chatgpt" }),
                mentions: f.text({
                  label: "Mentions",
                  help: "As printed, beside the orange dot: 326.5K",
                  maxLength: 12,
                }),
                cited: f.text({
                  label: "Cited",
                  help: "As printed, beside the purple dot: 1.5M, or 717 with no unit",
                  maxLength: 12,
                }),
              },
            }),
          }),
        },
      }),
    }),
    /* The longest built-in read is 292 characters; the cap gives an editor
       roughly double that before the strip stops looking like a strip. */
    observations: f.textarea({
      label: "Observations",
      help: "The orange-labelled read under the row of cards.",
      rows: 4,
      maxLength: 700,
    }),
  },
  /* The board prints the model's name from code, so the `name` the old
     fixture carried on every platform row is gone; the brand name above
     each card now comes from the competitor the row points at. */
  fixture: () => ({
    profiles: aiProfiles.map((profile) => ({
      id: profile.id,
      visibility: profile.visibility,
      mentions: profile.mentions,
      cited: profile.cited,
      platforms: profile.platforms.map((row) => ({
        id: row.id,
        mentions: row.mentions,
        cited: row.cited,
      })),
    })),
    observations: aiObservations,
  }),
});
