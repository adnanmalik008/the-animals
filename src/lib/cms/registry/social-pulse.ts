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
          /* The design's card prints a name above the handle and a face
             beside it. Both are optional: a post saved before the card
             grew them still validates, and prints the handle alone
             against a monogram. */
          name: f.text({ label: "Name", help: "The bold line above the handle", maxLength: 60, optional: true }),
          avatar: f.image({ label: "Avatar", help: "Square; shown as a circle", aspect: "1/1", optional: true }),
          text: f.textarea({ label: "Post", rows: 3, maxLength: 400 }),
          /* Counts are typed as they should read — the design prints them
             beside an icon with no unit of its own, so "48.2K" and "312"
             both belong. */
          likes: f.text({ label: "Likes", help: "As shown: 48.2K, 2.4K, 312", maxLength: 12 }),
          comments: f.text({ label: "Comments", help: "As shown: 1.2K, 214", maxLength: 12 }),
          shares: f.text({ label: "Shares", help: "As shown: 42, 1.1K. Left out, the card drops the stat.", maxLength: 12, optional: true }),
          /* Each platform's card prints what that platform prints: reddit
             a score between two arrows, Instagram a place, X a blue tick.
             All three are ignored by the other cards. */
          upvotes: f.text({ label: "Reddit score", help: "Printed between the vote arrows", maxLength: 12, optional: true }),
          place: f.text({ label: "Instagram place", help: "The line under the name", maxLength: 60, optional: true }),
          verified: f.boolean({ label: "Verified on X", help: "Prints the blue tick beside the name" }),
          timeAgo: f.text({ label: "Time label", help: "Free text, printed as typed: 3h ago", maxLength: 24 }),
          image: f.image({ label: "Picture", aspect: "4/3", alt: "imageAlt" }),
          imageAlt: f.text({ label: "Picture description", help: "For screen readers", maxLength: 120 }),
        },
      }),
    }),
  },
  /* `verified` is a boolean, so the document always carries one; the
     fixture only names it on the posts that fly the tick. */
  fixture: () => ({ posts: socialPosts.map((p) => ({ verified: false, ...p })) }),
});
