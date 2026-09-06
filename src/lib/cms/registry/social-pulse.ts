import { defineModule, f } from "../spec";
import { socialPosts } from "@/data/live";

/* The platform is a closed set, not free text: each value keys a brand mark
   the design exports (tiktok's glitch, instagram's gradient, reddit's
   roundel, x's black) and the filter row at the top of the module. Brand
   names and their icon sets stay in code — the client asked for the copy,
   not the furniture. */
const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "reddit", label: "Reddit" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X" },
] as const;

export const socialPulse = defineModule({
  key: "social-pulse",
  tab: "live",
  column: "editorial",
  order: 2,
  label: "Social Pulse",
  heading: { eyebrow: "Field Notes", title: "Social Pulse" },
  boardPath: "/",
  fields: {
    posts: f.list({
      label: "Posts",
      help: "Two at a time on desktop, advancing every six seconds — order is the order they appear.",
      min: 1,
      max: 16,
      summary: "author",
      idPrefix: "sp",
      item: f.object({
        fields: {
          id: f.id(),
          platform: f.select({ label: "Platform", options: PLATFORMS, default: "tiktok" }),
          author: f.text({ label: "Handle", help: "As shown, with its @ or u/ prefix", maxLength: 40 }),
          text: f.textarea({ label: "Post", rows: 3, maxLength: 400 }),
          /* Counts are typed as they should read — the design prints them
             beside an icon with no unit of its own, so "48.2K" and "312"
             both belong. */
          likes: f.text({ label: "Likes", help: "As shown: 48.2K, 2.4K, 312", maxLength: 12 }),
          comments: f.text({ label: "Comments", help: "As shown: 1.2K, 214", maxLength: 12 }),
          timeAgo: f.text({ label: "Time label", help: "Free text, printed as typed: 3h ago", maxLength: 24 }),
          image: f.image({ label: "Picture", aspect: "4/3", alt: "imageAlt" }),
          imageAlt: f.text({ label: "Picture description", help: "For screen readers", maxLength: 120 }),
        },
      }),
    }),
  },
  fixture: () => ({ posts: socialPosts }),
});
