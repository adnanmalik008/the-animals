import { defineModule, f } from "../spec";
import { channelMix } from "@/data/competition";

/* The competitive set, and the one place it is named.

   It used to be a three-value union — patagonia | arcteryx | northface —
   keying hardcoded maps of logos and screenshots, so a client could only
   ever have the demo's three outdoor brands. Every Competition module now
   points at a row here by id, and the logo travels with the row.

   The ids stay the brand slugs the fixtures already used, so the documents
   that reference them read the same. */

const FITS = [
  { value: "cover", label: "Fill the tile (crop)" },
  { value: "contain", label: "Fit inside the tile" },
] as const;

export const competitors = defineModule({
  key: "competitors",
  tab: "competition",
  order: 1,
  label: "Competitive set",
  heading: { title: "Competitors" },
  boardPath: "/competition",
  fields: {
    competitors: f.list({
      label: "Competitors",
      help: "Every module on this tab points at these by name.",
      min: 1,
      max: 6,
      summary: "name",
      idPrefix: "cmp",
      item: f.object({
        fields: {
          id: f.id(),
          name: f.text({ label: "Name", maxLength: 40 }),
          domain: f.text({ label: "Domain", help: "As printed, without https://", maxLength: 60 }),
          logo: f.image({ label: "Logo", help: "Sits on the tile colour below.", aspect: "1/1" }),
          /* The board is dark, so a mark needs its own ground: Patagonia's
             art is a full-bleed landscape, the two white lockups sit inset
             on a lighter tile. */
          tile: f.color({ label: "Tile colour", help: "The square behind the logo.", default: "#1c1c1c" }),
          fit: f.select({ label: "How the logo sits", options: FITS, default: "contain" }),
          inset: f.number({
            label: "Padding",
            help: "0–40 % of the tile. Use 0 for artwork meant to bleed to the edges.",
            integer: true,
            min: 0,
            max: 40,
            default: 12,
          }),
        },
      }),
    }),
  },
  /* The three the demo ships with, carrying exactly the art and the tiles
     BrandMark drew for them. */
  fixture: () => ({
    competitors: [
      {
        id: "patagonia",
        name: "Patagonia",
        domain: "patagonia.com",
        logo: "/assets/competition/logo-patagonia.svg",
        tile: "#1c1c1c",
        fit: "cover" as const,
        inset: 0,
      },
      {
        id: "arcteryx",
        name: "Arc'teryx",
        domain: "arcteryx.com",
        logo: "/assets/competition/logo-arcteryx.svg",
        tile: "#2a2a2a",
        fit: "contain" as const,
        inset: 14,
      },
      {
        id: "northface",
        name: "The North Face",
        domain: "thenorthface.com",
        logo: "/assets/competition/logo-northface.svg",
        tile: "#262626",
        fit: "contain" as const,
        inset: 12,
      },
    ],
  }),
});

/* The demo's own ids, so a fixture elsewhere can name one without a magic
   string. Nothing at runtime depends on the set being exactly these. */
export const DEMO_COMPETITOR_IDS = channelMix.map((mix) => mix.id);
