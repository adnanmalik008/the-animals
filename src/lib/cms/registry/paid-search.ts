import { defineModule, f } from "../spec";
import { paidObservations, paidSearch } from "@/data/competition";

/* Words They Pay For — a competitor's paid results, set the way the SERP
   sets them: mark on a plate, headline, display URL, body. The board prints
   all three lines exactly as typed — no quote marks, no prefix, nothing
   wrapped around them — so nothing here has to refuse a typed pair. */

export const paidSearchModule = defineModule({
  key: "paid-search",
  tab: "competition",
  order: 8,
  label: "Words They Pay For",
  heading: { eyebrow: "Paid Search", title: "Words They Pay For" },
  boardPath: "/competition",
  fields: {
    cards: f.list({
      label: "Cards",
      help: "One card per competitor, left to right across the row.",
      min: 1,
      max: 6,
      summary: "id",
      item: f.object({
        fields: {
          /* The card *is* the competitor: the name beside "Text Ads"
             and the mark on every ad come from the Competitive set, and
             naming the ref `id` is what stops two cards claiming the same
             brand. */
          id: f.ref({
            label: "Competitor",
            help: "The name in the card header and the mark on each ad come from the Competitive set.",
            source: { doc: "competitors", list: "competitors", labelField: "name" },
          }),
          ads: f.list({
            label: "Text ads",
            min: 1,
            max: 6,
            summary: "headline",
            idPrefix: "ad",
            item: f.object({
              fields: {
                /* The row used to be keyed by its headline, so editing the
                   copy rebuilt the ad. */
                id: f.id(),
                headline: f.text({
                  label: "Headline",
                  help: "The blue line of the result, printed as typed.",
                  maxLength: 120,
                }),
                /* A display URL, not a link: the board prints it beside a
                   globe and never navigates to it, and the built-in set
                   carries both bare hosts and full https:// ones. It is
                   also not the competitor's domain — two of the three
                   built-in brands advertise on a different spelling of it. */
                url: f.text({
                  label: "Display URL",
                  help: "As the ad shows it: patagonia.com, or https://www.thenorthface.com",
                  maxLength: 120,
                }),
                body: f.textarea({
                  label: "Ad copy",
                  help: "The two grey lines under the URL.",
                  rows: 3,
                  maxLength: 400,
                }),
              },
            }),
          }),
        },
      }),
    }),
    /* The longest built-in read is 270 characters. */
    observations: f.textarea({
      label: "Observations",
      help: "The orange-labelled read under the row of cards.",
      rows: 4,
      maxLength: 700,
    }),
  },
  /* `name` is gone — it came from the competitor. */
  fixture: () => ({
    cards: paidSearch.map((card) => ({
      id: card.id,
      ads: card.ads.map((ad, i) => ({
        id: `ad-${card.id}-${i + 1}`,
        headline: ad.headline,
        url: ad.url,
        body: ad.body,
      })),
    })),
    observations: paidObservations,
  }),
});
