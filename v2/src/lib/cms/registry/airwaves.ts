import { defineModule, f } from "../spec";
import { podcastItems } from "@/data/live-extra";

/* The note's treatment, not its content: the design writes one as margin
   prose, one on a post-it and one on a spiral pad. It stays a closed set
   because each value is a piece of drawing, not a value a client owns. */
const NOTE_STYLES = [
  { value: "plain", label: "Margin prose" },
  { value: "sticky", label: "Post-it" },
  { value: "spiral", label: "Spiral pad" },
] as const;

export const airwaves = defineModule({
  key: "airwaves",
  tab: "live",
  column: "editorial",
  order: 7,
  label: "On the Airwaves",
  heading: { eyebrow: "Dispatch", title: "On the Airwaves" },
  boardPath: "/",
  fields: {
    items: f.list({
      label: "Episodes",
      min: 1,
      max: 10,
      summary: "show",
      idPrefix: "pc",
      item: f.object({
        fields: {
          id: f.id(),
          show: f.text({ label: "Show", maxLength: 60 }),
          network: f.text({ label: "Network or hosts", maxLength: 80 }),
          timestamp: f.text({
            label: "Timestamp",
            help: "Where in the episode, as printed: 00:38:20",
            pattern: /^\d{1,2}:\d{2}(:\d{2})?$/,
            patternHint: "hh:mm:ss or mm:ss",
            maxLength: 12,
          }),
          /* Was a three-value union keying a hardcoded map of cover art, so
             a client could only ever have those three shows. It is an
             uploadable picture now; the three built-in covers are the
             fixture's values. */
          cover: f.image({ label: "Cover art", aspect: "1/1" }),
          noteStyle: f.select({ label: "Note style", options: NOTE_STYLES, default: "plain" }),
          note: f.textarea({ label: "The note", rows: 5, maxLength: 600 }),
        },
      }),
    }),
  },
  fixture: () => ({
    items: podcastItems.map(({ cover, ...rest }) => ({ ...rest, cover: COVER_ASSET[cover] })),
  }),
});

/* The art the three built-in shows shipped with, by the key the old union
   used. Only this file needs it — a saved document carries its own URL. */
const COVER_ASSET: Record<string, string> = {
  pivot: "/assets/podcasts/pivot.jpg",
  startup: "/assets/podcasts/startup.jpg",
  oddlots: "/assets/podcasts/odd-lots.jpg",
};
