import { defineModule, f } from "../spec";
import { homepageCards, marketCards, socialCards, type BrandId } from "@/data/competition";

/* "How They Show Up" — one brand at three layers: the homepage above the
   fold, the first twelve squares of its social grid, and the display ad it
   is running in market. The point of the section is that the three brands
   look interchangeable, so every card is a real capture rather than a
   mock-up.

   Those captures used to be three maps inside the component, each keyed by
   the three-value brand union — so a client's own competitor had no
   screenshot to draw and could not appear in the section at all. The
   capture is a picture on its own row now, and the brand behind the row is
   a reference into the competitive set instead of a name typed a second
   time: rename Arc'teryx once and all nine cards follow.

   The section's furniture stays in code, as the client asked: the title,
   the three kickers (Homepage / Social Feed / In Market) and their group
   headings are the design's structure, not content. */

const competitor = f.ref({
  label: "Brand",
  help: "One of the competitive set. Its name titles the card.",
  source: { doc: "competitors", list: "competitors", labelField: "name" },
});

const observation = f.textarea({
  label: "Observations",
  help: "The agency's read, printed under the capture.",
  rows: 3,
  maxLength: 300,
});

/* The card sets this line in the design's typographic quotes itself, so a
   typed pair would print doubled. */
const NOT_QUOTED = /^[^"'“«][\s\S]*[^"'”»]$/;

/* The art the three built-in brands have always carried. Nothing keys on
   the union any more — these only seed the fixture. */
const HOMEPAGE_CAPTURE: Record<BrandId, string> = {
  patagonia: "/assets/competition/home-patagonia.jpg",
  arcteryx: "/assets/competition/home-arcteryx.jpg",
  northface: "/assets/competition/home-northface.jpg",
};

const SOCIAL_CAPTURE: Record<BrandId, string> = {
  patagonia: "/assets/competition/grid-patagonia.jpg",
  arcteryx: "/assets/competition/grid-arcteryx.jpg",
  northface: "/assets/competition/grid-northface.jpg",
};

const MARKET_CAPTURE: Record<BrandId, string> = {
  patagonia: "/assets/competition/ad-patagonia.jpg",
  arcteryx: "/assets/competition/ad-arcteryx.jpg",
  northface: "/assets/competition/ad-northface.jpg",
};

/* The shipped captions carry the quotes the card now prints. */
const unquote = (line: string) => line.replace(/^[“"]|[”"]$/g, "");

export const showUp = defineModule({
  key: "show-up",
  tab: "competition",
  order: 4,
  label: "How They Show Up",
  heading: { title: "How They Show Up" },
  boardPath: "/competition",
  fields: {
    homepage: f.list({
      label: "Homepage — Their First Word",
      help: "One card per brand, in the order the row reads.",
      min: 1,
      max: 6,
      summary: "competitor",
      idPrefix: "su-h",
      item: f.object({
        fields: {
          id: f.id(),
          competitor,
          screenshot: f.image({
            label: "Homepage capture",
            help: "The homepage above the fold. The card crops it to 446 × 300 from the top.",
            aspect: "446/300",
          }),
          caption: f.text({
            label: "Their first line",
            help: "The headline the homepage leads with. No quote marks — the card sets them.",
            maxLength: 140,
            pattern: NOT_QUOTED,
            patternHint: "Without quote marks — the card adds them",
          }),
          observation,
        },
      }),
    }),
    social: f.list({
      label: "Social Feed — Twelve Squares of Identity",
      min: 1,
      max: 6,
      summary: "competitor",
      idPrefix: "su-s",
      item: f.object({
        fields: {
          id: f.id(),
          competitor,
          screenshot: f.image({
            label: "Feed capture",
            help: "The first twelve tiles of the brand's grid. Cropped to 446 × 300 from the top.",
            aspect: "446/300",
          }),
          observation,
        },
      }),
    }),
    market: f.list({
      label: "In Market — Their Window Display",
      min: 1,
      max: 6,
      summary: "competitor",
      idPrefix: "su-m",
      item: f.object({
        fields: {
          id: f.id(),
          competitor,
          screenshot: f.image({
            label: "Display ad capture",
            help: "The ad the brand is running. Taller than the other two rows: 446 × 481.",
            aspect: "446/481",
          }),
          observation,
        },
      }),
    }),
  },
  fixture: () => ({
    homepage: homepageCards.map((card, i) => ({
      id: `su-h-${i + 1}`,
      competitor: card.id,
      screenshot: HOMEPAGE_CAPTURE[card.id],
      caption: unquote(card.caption),
      observation: card.observation,
    })),
    social: socialCards.map((card, i) => ({
      id: `su-s-${i + 1}`,
      competitor: card.id,
      screenshot: SOCIAL_CAPTURE[card.id],
      observation: card.observation,
    })),
    market: marketCards.map((card, i) => ({
      id: `su-m-${i + 1}`,
      competitor: card.id,
      screenshot: MARKET_CAPTURE[card.id],
      observation: card.observation,
    })),
  }),
});
