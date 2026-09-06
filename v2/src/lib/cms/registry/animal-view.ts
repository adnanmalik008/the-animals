import { defineModule, f } from "../spec";
import { analystNotes, type AnalystNote } from "@/data/competition";

/* Animal View — the agency's editorial read. Each of the four Competition
   sections closes on one.

   Modelled as an OBJECT with one note per section, not a list of notes each
   naming its section. The four sections are fixed in code — CompetitionBoard
   renders exactly attention, show-up, find-them and horizon — so the set the
   notes must cover is not editable, and an object of four required keys is
   the only shape that cannot drift from it. A list keyed by a select would
   validate perfectly well with two notes for one section, or with none for
   another, and the second of those silently drops a card off the board with
   nothing to say so. Here the schema refuses a fifth section, refuses a
   duplicate, and refuses a section left without a note.

   The keys ARE the section ids, so the card looks its note up directly and a
   renamed section fails to compile rather than rendering blank.

   The card's title is the design's, not the client's: all four notes carried
   the same "Animal View", so it lives in `heading` and the component prints
   it as a constant. */

/* The passage runs between the design's two orange quote glyphs, so a typed
   pair would print inside them. */
const NOT_QUOTED = /^[^"'“«][\s\S]*[^"'”»]$/;
const NOT_QUOTED_HINT = "Without quote marks — the card opens and closes the passage with its own quote glyph";

/* One note. The four are the same shape, so they share one builder; only the
   admin label and the prefix new paragraph rows are given change. */
const note = (label: string, idPrefix: string) =>
  f.object({
    label,
    collapsible: true,
    fields: {
      date: f.text({
        label: "Dateline",
        help: "Printed as typed, top right of the card: 9 June 2026",
        maxLength: 24,
      }),
      headline: f.text({
        label: "Headline",
        help: "One line above the passage, e.g. The Crowded Pond",
        maxLength: 80,
      }),
      lede: f.text({
        label: "Bold opener",
        help: "Runs into the first paragraph in bold — usually the brands the note is about. Leave empty to open on the paragraph itself.",
        maxLength: 60,
        pattern: NOT_QUOTED,
        patternHint: NOT_QUOTED_HINT,
        optional: true,
      }),
      /* Not derivable: the opener is stored in sentence case either way and
         the capitals are a typographic treatment the card applies, so
         nothing in the document says which note wants them. */
      ledeCaps: f.boolean({
        label: "Set the opener in capitals",
        help: "The Attention note capitalises its opener; Horizon keeps sentence case.",
        default: false,
      }),
      paragraphs: f.list({
        label: "Passage",
        help: "The first paragraph carries the bold opener, so it usually reads on from it. At least one.",
        /* the card prints paragraphs[0] beside the opening quote glyph */
        min: 1,
        max: 6,
        summary: "text",
        idPrefix,
        item: f.object({
          fields: {
            /* Each paragraph carries an id so the card can key on it. The
               rows used to be bare strings keyed by their own first 24
               characters, which collides the moment two paragraphs open the
               same way. */
            id: f.id(),
            text: f.textarea({
              label: "Paragraph",
              /* the built-in passage's longest paragraph is 408 characters,
                 so a note gets roughly double what the design carries */
              rows: 5,
              maxLength: 800,
              pattern: NOT_QUOTED,
              patternHint: NOT_QUOTED_HINT,
            }),
          },
        }),
      }),
    },
  });

const fromFixture = (idPrefix: string, source: AnalystNote) => ({
  date: source.date,
  headline: source.headline,
  /* `lede` is optional in both shapes — two of the four notes open straight
     on their first paragraph — so it is passed through as it is, absent and
     all, and the card reads a missing opener as no opener. */
  lede: source.lede,
  ledeCaps: source.ledeCaps ?? false,
  paragraphs: source.paragraphs.map((text, i) => ({ id: `${idPrefix}-${i + 1}`, text })),
});

export const animalView = defineModule({
  key: "animal-view",
  tab: "competition",
  order: 7,
  label: "Animal View",
  heading: { title: "Animal View" },
  boardPath: "/competition",
  intro: "The editorial read that closes each of the four sections. One note per section — the card's own title and quote glyphs are fixed in the design.",
  fields: {
    attention: note("What's Driving Their Attention", "av-at"),
    "show-up": note("How They Show Up", "av-su"),
    "find-them": note("How People Find Them", "av-ft"),
    horizon: note("On the Horizon", "av-hz"),
  },
  fixture: () => ({
    attention: fromFixture("av-at", analystNotes.attention),
    "show-up": fromFixture("av-su", analystNotes["show-up"]),
    "find-them": fromFixture("av-ft", analystNotes["find-them"]),
    horizon: fromFixture("av-hz", analystNotes.horizon),
  }),
});
