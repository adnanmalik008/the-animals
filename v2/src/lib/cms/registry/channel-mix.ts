import { defineModule, f } from "../spec";
import { channelMix as fixtureMix, type CompetitorMix } from "@/data/competition";

/* Channel Mix — the row of cards inside "What's Driving Their Attention".

   Three things the fixture used to carry are deliberately not in this spec:

   · the brand's name and domain, which belong to the competitor and not to
     this module. A row points at a row in `competitors` and the card reads
     the mark, the name and the domain back from it, so renaming a brand
     renames it on every Competition module at once instead of in four
     places that can disagree.

   · `activeLabel` ("5 : 7"), which is a count of the shares below it. The
     card has always worked it out itself and has never printed the stored
     string, so dropping it changes nothing on screen.

   · the seven channel keys and labels, which are the ring itself.

   The channels are seven named fields rather than a list of rows. The ring
   is a drawing: each bubble's centre was measured off the design export and
   its label is printed under that centre, so the order is not a preference
   an editor holds — it is the geometry. A list, even one locked to seven
   rows, would let a reorder or a rename move a label away from the bubble
   it belongs to and would leave the component indexing a parallel array of
   coordinates by position. Seven fields cannot come apart: the schema
   demands all seven, the labels stay beside the coordinates in the
   component, and the editor is left with the only thing that is really
   theirs — the numbers. */

const share = (label: string) =>
  f.number({
    label,
    help: "Share of traffic, 0–100. Fractions are fine (0.7). Anything under 1 % prints red and stops counting as active.",
    min: 0,
    max: 100,
  });

const REACH = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
] as const;

/** One channel's share out of the legacy/fixture array, by its own key. */
const pctOf = (channels: { key: string; pct: number }[], key: string) =>
  channels.find((c) => c.key === key)?.pct ?? 0;

const ringOf = (channels: { key: string; pct: number }[]) => ({
  direct: pctOf(channels, "direct"),
  referral: pctOf(channels, "referral"),
  social: pctOf(channels, "social"),
  organic: pctOf(channels, "organic"),
  paid: pctOf(channels, "paid"),
  display: pctOf(channels, "display"),
  mail: pctOf(channels, "mail"),
});

const fixtureRow = (mix: CompetitorMix) => ({
  id: `cx-${mix.id}`,
  competitor: mix.id,
  channels: ringOf(mix.channels),
  reachPct: mix.reachPct,
  reachLabel: mix.reachLabel,
});

/* The shape the raw-JSON editor could have saved: every card carried its
   own name, domain and activeLabel, and its channels as an array of
   {key,label,pct}. Unlike the other pre-registry snapshots there is nothing
   to invent here — the dropped fields are exactly the ones the competitive
   set now owns or the card now computes — so the old document converts
   losslessly rather than being abandoned. Detected on the array: a current
   document holds `channels` as an object and passes straight through. */
interface LegacyRow {
  id?: unknown;
  channels?: unknown;
  [key: string]: unknown;
}

const isLegacyRow = (row: unknown): row is LegacyRow =>
  typeof row === "object" && row !== null && Array.isArray((row as LegacyRow).channels);

const isBubble = (c: unknown): c is { key: string; pct: number } =>
  typeof c === "object" &&
  c !== null &&
  typeof (c as { key?: unknown }).key === "string" &&
  typeof (c as { pct?: unknown }).pct === "number";

function migrate(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const rows = (raw as { competitors?: unknown }).competitors;
  if (!Array.isArray(rows) || !rows.some(isLegacyRow)) return raw;

  return {
    ...raw,
    competitors: rows.map((row) => {
      if (!isLegacyRow(row)) return row;
      /* The old row id was the brand slug, which is now what the ref
         holds; the row keeps an id of its own so two cards could name the
         same brand. name, domain and activeLabel are left alone — the
         schema strips unknown keys, so they fall away on the next save. */
      const slug = typeof row.id === "string" ? row.id : "";
      return {
        ...row,
        id: slug ? `cx-${slug}` : "",
        competitor: slug,
        channels: ringOf((row.channels as unknown[]).filter(isBubble)),
      };
    }),
  };
}

export const channelMix = defineModule({
  key: "channel-mix",
  tab: "competition",
  order: 2,
  label: "Channel Mix",
  heading: { eyebrow: "What's Driving Their Attention", title: "Channel Mix" },
  boardPath: "/competition",
  fields: {
    competitors: f.list({
      label: "Cards",
      help: "One card per competitor, laid out in this order.",
      min: 1,
      max: 6,
      summary: "competitor",
      idPrefix: "cx",
      item: f.object({
        fields: {
          id: f.id(),
          competitor: f.ref({
            label: "Competitor",
            help: "The mark, the name and the domain on the card all come from the competitive set.",
            source: { doc: "competitors", list: "competitors", labelField: "name" },
          }),
          channels: f.object({
            label: "Channel ecosystem",
            help: "The seven bubbles, clockwise from the top. The count above the ring — 5 / 7 active — is worked out from these; a channel counts as active at 1 % or more.",
            fields: {
              direct: share("Direct"),
              referral: share("Referral"),
              social: share("Social"),
              organic: share("Organic search"),
              paid: share("Paid search"),
              display: share("Display ADS"),
              mail: share("Mail"),
            },
          }),
          reachPct: f.number({
            label: "Reach",
            help: "0–100. The orange bar fills to here and the knob sits on it.",
            integer: true,
            min: 0,
            max: 100,
          }),
          reachLabel: f.select({
            label: "Reach reading",
            help: "Printed opposite “Reach”, above the slider. Set it to match the bar — nothing derives one from the other.",
            options: REACH,
            default: "Medium",
          }),
        },
      }),
    }),
  },
  migrate,
  fixture: () => ({ competitors: fixtureMix.map(fixtureRow) }),
});

