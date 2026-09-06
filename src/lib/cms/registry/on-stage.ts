import { defineModule, f } from "../spec";
import { stageEvents } from "@/data/live";

/* The card sets the quote in guillemets itself, so a typed pair would print
   twice. Unanchored `.regex` would match anywhere, hence the anchors. */
const NOT_QUOTED = /^[^"'“«][\s\S]*[^"'”»]$/;
const NOT_QUOTED_HINT = "Without quote marks — the card adds them";

export const onStage = defineModule({
  key: "on-stage",
  tab: "live",
  column: "editorial",
  order: 4,
  label: "On Stage",
  heading: { eyebrow: "Transmission", title: "On Stage" },
  boardPath: "/",
  fields: {
    events: f.list({
      label: "Events",
      /* The card reads `events[index]` on every render and cycles through
         them on a timer, so an empty list is a crash rather than an empty
         module. One is the floor. */
      min: 1,
      max: 12,
      summary: "speaker",
      idPrefix: "se",
      item: f.object({
        fields: {
          id: f.id(),
          event: f.text({
            label: "Event and place",
            help: "Printed uppercase as typed, e.g. THE RUNNING EVENT 2026 · AUSTIN, TX",
            maxLength: 80,
          }),
          hashtag: f.text({
            label: "Hashtag",
            help: "With its #",
            pattern: /^#\S+$/,
            patternHint: "A # followed by the tag, no spaces",
            maxLength: 40,
          }),
          session: f.text({ label: "Session", help: "e.g. Keynote · The Distribution Crisis", maxLength: 80 }),
          quote: f.textarea({ label: "Pull quote", rows: 3, maxLength: 300, pattern: NOT_QUOTED, patternHint: NOT_QUOTED_HINT }),
          speaker: f.text({ label: "Speaker", maxLength: 60 }),
          speakerTitle: f.text({ label: "Speaker's title", maxLength: 80 }),
          liveTweets: f.text({
            label: "Live tweets",
            help: "The number only — the card prints the 'Live tweets:' label itself",
            maxLength: 12,
          }),
        },
      }),
    }),
  },
  fixture: () => ({ events: stageEvents }),
});
