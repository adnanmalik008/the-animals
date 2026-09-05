import { analystNotes, type AnalystNote } from "@/data/competition";

/* Animal View — the agency's editorial read. Each of the four sections
   closes on one, so it is a card the section renders, not a module of its
   own. Built to the design's card: the Bg4 grey (#2b2b2b) with a hairline
   border and 16px corners, the title in a header over a rule, the headline
   set in from the left to sit over the text column, the body in the light
   italic serif in white, and the design's own orange quote glyph opening
   the passage and, turned, closing it. */

const QUOTE = "/assets/competition/quote-mark.svg";

export function AnimalView({ section, className = "" }: { section: string; className?: string }) {
  const note: AnalystNote | undefined = analystNotes[section];
  if (!note) return null;

  return (
    <section
      aria-label={`${note.title} — ${note.headline}`}
      className={`flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#2b2b2b] text-white ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/5 p-5">
        <h3 className="font-display text-2xl font-medium">{note.title}</h3>
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
              {note.paragraphs[0]}
            </p>
            {note.paragraphs.slice(1).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
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
