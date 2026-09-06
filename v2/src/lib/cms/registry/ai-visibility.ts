import { defineModule, f } from "../spec";
import { aiVisibility } from "@/data/board";

/* The four AI platforms, closed because each value keys a logo the design
   exports and the name printed beside it. Brand names and their icon sets
   stay in code — the same line that keeps TikTok out of the CMS. */
const PLATFORMS = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "grok", label: "Grok" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
] as const;

export const aiVisibilityModule = defineModule({
  key: "ai-visibility",
  tab: "live",
  column: "data",
  order: 1,
  label: "AI Search Visibility",
  heading: { title: "AI Search Visibility" },
  boardPath: "/",
  fields: {
    score: f.number({ label: "Visibility score", help: "0–100; counts up on the card", integer: true, min: 0, max: 100 }),
    /* Two fields per figure, because the unit is not derivable: 1.3 prints
       as "1.3M" but a platform's 717 prints as "717". The number is what
       the counter animates; the label is what a sticker files. */
    mentions: f.number({ label: "Mentions, in millions", help: "The card prints it with an M: 1.3 → 1.3M", min: 0 }),
    mentionsLabel: f.text({ label: "Mentions, as filed", help: "How a sticker's card reads it: 1.3M", maxLength: 12 }),
    cited: f.number({ label: "Cited pages, in millions", help: "The card prints it with an M: 3.2 → 3.2M", min: 0 }),
    citedLabel: f.text({ label: "Cited pages, as filed", help: "How a sticker's card reads it: 3.2M", maxLength: 12 }),
    platforms: f.list({
      label: "Platforms",
      help: "One row each. The logo and the name come from the platform picked.",
      min: 1,
      max: 4,
      summary: "id",
      item: f.object({
        fields: {
          /* This row's id is the platform, not a generated key: it is what
             the logo map is keyed by and what a sticker files against. */
          id: f.select({ label: "Platform", options: PLATFORMS, default: "chatgpt" }),
          mentionsLabel: f.text({ label: "Mentions", help: "As printed: 326.5K", maxLength: 12 }),
          citedLabel: f.text({ label: "Cited", help: "As printed: 1.5M, or 717 with no unit", maxLength: 12 }),
        },
      }),
    }),
  },
  /* The board prints only the two labels per row; the numbers the old
     fixture carried beside them were never read. */
  fixture: () => ({
    score: aiVisibility.score,
    mentions: aiVisibility.mentions,
    mentionsLabel: aiVisibility.mentionsLabel,
    cited: aiVisibility.cited,
    citedLabel: aiVisibility.citedLabel,
    platforms: aiVisibility.platforms.map((p) => ({
      id: p.id,
      mentionsLabel: p.mentionsLabel,
      citedLabel: p.citedLabel,
    })),
  }),
});
