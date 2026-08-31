import { analystNotes, type AnalystNote } from "@/data/competition";

/* Animal View — the agency's editorial read. Each of the four sections
   closes on one, so it is a card the section renders, not a module of its
   own. The design sets it on a grey panel a shade above the board
   (#2b2b2b), serif italic in light grey, framed by giant orange quotes. */

export function AnimalView({ section, className = "" }: { section: string; className?: string }) {
  const note: AnalystNote | undefined = analystNotes[section];
  if (!note) return null;

  return (
    <section aria-label={`${note.title} — ${note.headline}`} className={className}>
      <div className="rounded-3xl bg-[#2b2b2b] p-6 text-white sm:p-9">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-tight text-white">{note.title}</h3>
          <span className="whitespace-nowrap text-xs text-white/50">{note.date}</span>
        </div>

        <p className="mt-5 text-sm font-semibold tracking-tight text-white">{note.headline}</p>

        <div className="relative mt-4 pl-10 pr-6 sm:pl-14 sm:pr-10">
          <span
            aria-hidden
            className="absolute -top-3 left-0 font-serif text-6xl leading-none text-orange sm:text-7xl"
          >
            &ldquo;
          </span>

          <div className="space-y-4 font-serif text-[15px] italic leading-relaxed text-white/60">
            <p>
              {note.lede && (
                <>
                  <strong
                    className={`font-bold not-italic text-white ${
                      note.ledeCaps ? "uppercase tracking-wide" : ""
                    }`}
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

          <span
            aria-hidden
            className="absolute -bottom-6 right-0 font-serif text-6xl leading-none text-orange sm:text-7xl"
          >
            &rdquo;
          </span>
        </div>
        <div aria-hidden className="h-4" />
      </div>
    </section>
  );
}
