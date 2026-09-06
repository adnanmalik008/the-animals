import { defineModule, f } from "../spec";
import { creatorVideos } from "@/data/live-extra";

export const youtubeVoices = defineModule({
  key: "youtube-voices",
  tab: "live",
  column: "editorial",
  order: 8,
  label: "YouTube Voices",
  heading: { eyebrow: "Field Notes", title: "YouTube Voices" },
  boardPath: "/",
  fields: {
    videos: f.list({
      label: "Videos",
      min: 1,
      max: 12,
      summary: "title",
      idPrefix: "yv",
      item: f.object({
        fields: {
          id: f.id(),
          title: f.text({ label: "Title", maxLength: 120 }),
          description: f.text({
            label: "One-line description",
            help: "Truncated on the card, printed in full on the fullscreen stage",
            maxLength: 200,
          }),
          /* The design's artwork already carries the growth banner, so
             these two reach the client only through a sticker's card on
             the Anomalies board. */
          growthFrom: f.text({ label: "Grew from", help: "With its unit: 0 followers", maxLength: 30 }),
          growthTo: f.text({ label: "Grew to", help: "With its unit: 846K followers", maxLength: 30 }),
          markA: f.text({ label: "Channel, first word", help: "Filed as the source on a sticker", maxLength: 24 }),
          markB: f.text({ label: "Channel, second word", maxLength: 24 }),
          thumb: f.image({ label: "Thumbnail", help: "The card's whole picture — wordmark and play button included.", aspect: "16/9" }),
          link: f.url({ label: "Link", help: "Where the card sends a click when there is no video id.", optional: true }),
          videoId: f.text({
            label: "YouTube video id",
            help: "The 11 characters after v= in the video's URL. With one, the fullscreen stage streams the real video.",
            pattern: /^[\w-]{11}$/,
            patternHint: "11 characters: letters, digits, - or _",
            optional: true,
          }),
        },
      }),
    }),
  },
  fixture: () => ({ videos: creatorVideos }),
});
