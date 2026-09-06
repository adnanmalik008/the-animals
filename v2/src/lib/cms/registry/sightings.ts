import { defineModule, f } from "../spec";
import { sightingItems } from "@/data/live-extra";

export const sightings = defineModule({
  key: "sightings",
  tab: "live",
  column: "editorial",
  order: 6,
  label: "Sightings",
  heading: { eyebrow: "Correspondence", title: "Sightings" },
  boardPath: "/",
  fields: {
    items: f.list({
      label: "Sightings",
      help: "Three at a time on desktop, in this order.",
      min: 1,
      max: 16,
      summary: "city",
      idPrefix: "sg",
      item: f.object({
        fields: {
          id: f.id(),
          caption: f.textarea({
            label: "What was seen",
            help: "The line under the photo, e.g. Billboard, Times Square — competitor promoting AI running coach",
            rows: 2,
            maxLength: 200,
          }),
          time: f.text({ label: "Time", help: "As printed, with its zone: 14:00 GMT", maxLength: 20 }),
          city: f.text({ label: "City", maxLength: 40 }),
          /* The card frames the photo square and crops to fill, so a wide
             shot loses its edges — the picker previews the same crop. */
          photo: f.image({ label: "Photo", aspect: "1/1" }),
        },
      }),
    }),
  },
  fixture: () => ({ items: sightingItems }),
});
