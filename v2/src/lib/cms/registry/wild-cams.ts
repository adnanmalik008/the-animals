import { defineModule, f } from "../spec";
import { wildCams as fixtureCams } from "@/data/wild";

export const wildCams = defineModule({
  key: "wild-cams",
  tab: "wild",
  order: 1,
  label: "Live cams",
  heading: { eyebrow: "№ 01 · Live Feeds", title: "In the Wild" },
  boardPath: "/in-the-wild",
  fields: {
    volume: f.text({ label: "Masthead, right side", default: "Vol. I · Dispatch", maxLength: 40 }),
    cams: f.list({
      label: "Cams",
      help: "Desktop fills two columns alternately, so order matters.",
      min: 1,
      max: 12,
      summary: "name",
      idPrefix: "cam",
      item: f.object({
        fields: {
          id: f.id(),
          name: f.text({ label: "Name", maxLength: 60 }),
          location: f.text({ label: "Location", help: "Place · Country, as shown", maxLength: 80 }),
          videoId: f.text({
            label: "YouTube video id",
            help: "The 11 characters after v= in the video's URL",
            pattern: /^[\w-]{11}$/,
            patternHint: "11 characters: letters, digits, - or _",
          }),
          thumbnail: f.image({
            label: "Cover still",
            help: "Shown before play; without one the YouTube thumbnail is used.",
            optional: true,
            aspect: "16/9",
          }),
          emoji: f.text({
            label: "Emoji",
            help: "Beside the name, and the fallback tile when no picture loads",
            pattern: /^\p{Extended_Pictographic}/u,
            patternHint: "One emoji",
          }),
        },
      }),
    }),
  },
  fixture: () => ({ volume: "Vol. I · Dispatch", cams: fixtureCams }),
});
