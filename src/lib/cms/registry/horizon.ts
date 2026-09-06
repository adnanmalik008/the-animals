import { defineModule, f } from "../spec";
import { horizon } from "@/data/competition";

/* "On the Horizon" — one column per competitor: a forward thesis, then the
   signals underneath it.

   A column no longer carries a brand name of its own. It points at a row in
   the `competitors` document and the name, the logo and the tile behind it
   all travel with that row, so a client's own competitive set draws the
   columns. The referenced ids stay the demo's brand slugs, so the fixture
   reads exactly as the file it replaces.

   `status` and `kind` stay closed sets. Each keys artwork that lives in the
   component — the dot's colour on the fixed hot / warm / watch scale, the
   chip's colour per kind — so neither can be free text, and neither gates an
   image a client could bring instead.

   The legend stays in code with them. It is the caption to that colour
   scale: its three rows are the three statuses, in order, and nothing else
   is renderable — a client cannot add a fourth status, and editing "Hot —
   imminent" could only ever make the words disagree with the orange dot
   beside them. */

const STATUSES = [
  { value: "hot", label: "Hot — imminent" },
  { value: "warm", label: "Warm — building" },
  { value: "watch", label: "Watch — early" },
] as const;

const KINDS = [
  { value: "Investment", label: "Investment" },
  { value: "R&D", label: "R&D" },
  { value: "Hiring", label: "Hiring" },
] as const;

/* The card prints "Source:" in front of the value. */
const UNLABELLED = /^(?!\s*[Ss]ource\s*:)/;

/* Inline in the component until now; a client's competitive set is not
   necessarily reading investments, patents and hires, so the line moves
   into the document. The default is what the board prints today. */
const SUBTITLE =
  "What the competition is about to do — investments, patents, hires and deals that reveal the next move before the launch.";

/* One signal. It carries an id because the cards used to key on their own
   headline, so retyping a headline threw the card away and rebuilt it. */
const signal = f.object({
  fields: {
    id: f.id(),
    kind: f.select({
      label: "Kind",
      help: "Printed on the chip and colours it: Investment blue, R&D green, Hiring yellow.",
      options: KINDS,
      default: "Investment",
    }),
    date: f.text({ label: "When", help: "Free text, printed as typed: May 2026", maxLength: 24 }),
    status: f.select({
      label: "Heat",
      help: "The dot on the card, on the legend's fixed scale: hot orange, warm blue, watch purple.",
      options: STATUSES,
      default: "warm",
    }),
    headline: f.text({ label: "Signal", help: "The line in bold: what was seen.", maxLength: 120 }),
    detail: f.text({ label: "Detail", help: "One line under the signal.", maxLength: 160 }),
    source: f.text({
      label: "Source",
      help: "Where it was seen: LinkedIn, USPTO, Bloomberg.",
      maxLength: 60,
      pattern: UNLABELLED,
      patternHint: "Just the source — the card prints 'Source:' in front",
    }),
    implies: f.textarea({
      label: "Implies",
      help: "The orange-ruled read under the signal — what it means for the client. Leave empty for none.",
      rows: 2,
      maxLength: 200,
      optional: true,
    }),
  },
});

export const horizonModule = defineModule({
  key: "horizon",
  tab: "competition",
  order: 9,
  label: "On the Horizon",
  heading: { title: "On the Horizon" },
  boardPath: "/competition",
  fields: {
    subtitle: f.textarea({
      label: "Subtitle",
      help: "The line under the section title.",
      rows: 2,
      maxLength: 240,
      default: SUBTITLE,
    }),
    columns: f.list({
      label: "Columns",
      help: "One per competitor, left to right. The brand's name and mark come from the competitive set.",
      min: 1,
      max: 6,
      summary: "thesis",
      idPrefix: "hz",
      item: f.object({
        fields: {
          id: f.id(),
          competitor: f.ref({
            label: "Competitor",
            help: "Titles the column and draws its mark. Edit the name or logo in Competitive set.",
            source: { doc: "competitors", list: "competitors", labelField: "name" },
          }),
          thesis: f.text({
            label: "Forward thesis",
            help: "The italic line under the brand — where this one is heading.",
            maxLength: 160,
          }),
          events: f.list({
            label: "Signals",
            help: "Newest first, as the column reads.",
            min: 1,
            max: 8,
            summary: "headline",
            idPrefix: "hz-e",
            item: signal,
          }),
        },
      }),
    }),
  },
  /* `name` is dropped: the column's title is the referenced competitor's
     name, read at render. The three brand slugs the file already used stay
     as the referenced ids, so the columns title themselves the same. */
  fixture: () => ({
    subtitle: SUBTITLE,
    columns: horizon.map((column) => ({
      id: `hz-${column.id}`,
      competitor: column.id,
      thesis: column.thesis,
      events: column.events.map((event, i) => ({
        id: `hz-${column.id}-${i + 1}`,
        kind: event.kind,
        date: event.date,
        status: event.status,
        headline: event.headline,
        detail: event.detail,
        source: event.source,
        implies: event.implies,
      })),
    })),
  }),
});
