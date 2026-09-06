import { defineModule, f } from "../spec";
import { opinionLeaders as fixtureLeaders } from "@/data/live";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X" },
] as const;

/* Picks one of the stock headshots (Avatar.tsx TONE_PICK) until photos are uploaded. */
const TONES = [
  { value: "ember", label: "Ember" },
  { value: "ocean", label: "Ocean" },
  { value: "moss", label: "Moss" },
  { value: "violet", label: "Violet" },
  { value: "sun", label: "Sun" },
  { value: "slate", label: "Slate" },
] as const;

export const opinionLeaders = defineModule({
  key: "opinion-leaders",
  tab: "live",
  column: "data",
  order: 5,
  label: "Opinion Leaders",
  heading: { title: "Opinion Leaders" },
  boardPath: "/",
  fields: {
    leaders: f.list({
      label: "Leaders",
      min: 1,
      max: 10,
      summary: "name",
      idPrefix: "ol",
      item: f.object({
        fields: {
          id: f.id(),
          name: f.text({ label: "Name", maxLength: 60 }),
          role: f.text({ label: "Role", help: "e.g. Run culture analyst", maxLength: 60 }),
          eng: f.number({ label: "Engagement score", help: "0–100", integer: true, min: 0, max: 100 }),
          followers: f.text({ label: "Followers", help: "As shown: 2.1M, 980K", maxLength: 12 }),
          platform: f.select({ label: "Platform", options: PLATFORMS, default: "linkedin" }),
          tone: f.select({ label: "Stock headshot", options: TONES, default: "ember" }),
        },
      }),
    }),
  },
  fixture: () => ({ leaders: fixtureLeaders }),
});
