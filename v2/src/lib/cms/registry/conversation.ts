import { defineModule, f } from "../spec";
import { conversationQuotes } from "@/data/live";

/* Same reasoning as Social Pulse: each value keys a brand mark and a filter
   pill, so the set is closed and lives in code. */
const PLATFORMS = [
  { value: "slack", label: "Slack" },
  { value: "discord", label: "Discord" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export const conversation = defineModule({
  key: "conversation",
  tab: "live",
  column: "editorial",
  order: 3,
  label: "The Conversation",
  heading: { eyebrow: "Observation", title: "The Conversation" },
  boardPath: "/",
  fields: {
    quotes: f.list({
      label: "Quotes",
      min: 1,
      max: 16,
      summary: "author",
      idPrefix: "cq",
      item: f.object({
        fields: {
          id: f.id(),
          platform: f.select({ label: "Platform", options: PLATFORMS, default: "slack" }),
          context: f.text({
            label: "Where it was said",
            help: "The channel or community line, e.g. #shoe-lab · Run Club Collective",
            maxLength: 80,
          }),
          replyTo: f.text({
            label: "Replying to",
            help: "The thread it answers. Leave empty for a standalone post.",
            optional: true,
            maxLength: 120,
          }),
          text: f.textarea({ label: "Quote", rows: 3, maxLength: 400 }),
          author: f.text({ label: "Name", maxLength: 60 }),
          handle: f.text({ label: "Handle", help: "As shown, with its @ prefix", maxLength: 40 }),
          upvotes: f.number({ label: "Upvotes", help: "A whole number; the design prints it as typed", integer: true, min: 0 }),
          timeAgo: f.text({ label: "Time label", help: "Free text, printed as typed: 38m ago", maxLength: 24 }),
        },
      }),
    }),
  },
  fixture: () => ({ quotes: conversationQuotes }),
});
