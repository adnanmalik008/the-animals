import { defineModule, f } from "../spec";
import { searchTerms } from "@/data/live";

/* The sticker's card sets the term in typographic quotes itself. */
const NOT_QUOTED = /^[^"'“«][\s\S]*[^"'”»]$/;

export const searchVelocity = defineModule({
  key: "search-velocity",
  tab: "live",
  column: "data",
  order: 3,
  label: "Search Velocity",
  heading: { title: "Search Velocity" },
  boardPath: "/",
  fields: {
    subtitle: f.text({ label: "Subtitle", default: "Branded search, trailing 12 weeks", maxLength: 80 }),
    terms: f.list({
      label: "Terms",
      min: 1,
      max: 10,
      summary: "term",
      idPrefix: "sv",
      item: f.object({
        fields: {
          id: f.id(),
          term: f.text({
            label: "Search term",
            help: "As typed by searchers, lower case",
            maxLength: 60,
            pattern: NOT_QUOTED,
            patternHint: "Without quote marks — a sticker's card adds them",
          }),
          /* The sign is the meaning: the sparkline strokes green above zero
             and red below it, and the card prints its own + for a rise. */
          delta: f.number({ label: "Change", help: "Per cent, signed: 42 or −7. Positive draws the line green.", integer: true, min: -100, max: 999 }),
          points: f.custom({
            label: "Trend",
            widget: "points12",
            help: "Twelve weekly points, each 0–100. They set the sparkline's shape, not its scale.",
          }),
        },
      }),
    }),
  },
  fixture: () => ({ subtitle: "Branded search, trailing 12 weeks", terms: searchTerms }),
});
