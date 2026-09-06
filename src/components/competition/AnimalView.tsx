"use client";

import { useModuleDoc } from "@/components/board/BoardDataContext";
import type { ModuleDocs } from "@/lib/cms/types";

/* Animal View — the agency's editorial read. Each of the four sections
   closes on one, so it is a card the section renders, not a module of its
   own. Built to the design's card: the Bg4 grey (#2b2b2b) with a hairline
   border and 16px corners, the title in a header over a rule, the headline
   set in from the left to sit over the text column, the body in the light
   italic serif in white, and the design's own orange quote glyph opening
   the passage and, turned, closing it. */

const QUOTE = "/assets/competition/quote-mark.svg";

/* The card's own title, fixed in the design — every note printed it. */
const TITLE = "Animal View";

type AnimalViewDoc = ModuleDocs["animal-view"];
/** The four Competition section ids, as the document keys them. */
type SectionId = keyof AnimalViewDoc;
type Note = AnimalViewDoc[SectionId];

/* The section id arrives as a plain string from the module column, so it is
   checked against the document rather than cast into it. */
function isSection(doc: AnimalViewDoc, section: string): section is SectionId & string {
  return Object.prototype.hasOwnProperty.call(doc, section);
}

export function AnimalView({ section, className = "" }: { section: string; className?: string }) {
  const doc = useModuleDoc("animal-view");
  const note: Note | undefined = isSection(doc, section) ? doc[section] : undefined;

  /* after the hook: an unknown section, or a note whose passage was emptied,
     renders nothing rather than an empty card */
  if (!note || note.paragraphs.length === 0) return null;

  const [opening, ...rest] = note.paragraphs;

  return (
    <section
      aria-label={`${TITLE} — ${note.headline}`}
      className={`flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#2b2b2b] text-white ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/5 p-5">
        <h3 className="font-display text-2xl font-medium">{TITLE}</h3>
        <span className="whitespace-nowrap font-display text-base text-white/70">{note.date}</span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-[19px]">
        {/* the headline starts where the body text does: past the quote glyph and its gap */}
        <p className="pl-14 font-display text-xl">{note.headline}</p>

        <div className="mt-5 flex items-start gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={QUOTE} alt="" aria-hidden className="h-[27px] w-8 shrink-0" />
          <div className="min-w-0 flex-1 space-y-[25px] font-serif text-lg font-light italic leading-[1.4]">
            <p>
              {note.lede && (
                <>
                  <strong
                    className={`font-semibold not-italic ${note.ledeCaps ? "uppercase" : ""}`}
                  >
                    {note.lede}
                  </strong>{" "}
                </>
              )}
              {opening.text}
            </p>
            {rest.map((p) => (
              <p key={p.id}>{p.text}</p>
            ))}
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={QUOTE} alt="" aria-hidden className="h-[27px] w-8 rotate-180" />
        </div>
      </div>
    </section>
  );
}
