import { Module } from "@/components/modules/ModuleColumn";
import { analystNote } from "@/data/competition";
import { panelTitle } from "./ui";

/* Animal View — the agency's editorial read. A white card set against
   the dark board, serif italic, framed by giant orange quote marks. Static. */

export function AnimalView({ id }: { id: string }) {
  return (
    <Module
      id={id}
      title={analystNote.title}
      titleClassName={panelTitle}
      headerExtra={
        <span className="ml-auto mr-8 whitespace-nowrap text-xs text-white/50">
          {analystNote.date}
        </span>
      }
    >
      <div className="mt-4 rounded-3xl bg-[#f4f2ee] p-6 text-ink sm:p-9">
        <p className="text-sm font-semibold tracking-tight">{analystNote.headline}</p>

        <div className="relative mt-4 pl-10 pr-6 sm:pl-14 sm:pr-10">
          <span
            aria-hidden
            className="absolute -top-3 left-0 font-serif text-6xl leading-none text-orange sm:text-7xl"
          >
            &ldquo;
          </span>

          <div className="space-y-4 font-serif text-[15px] italic leading-relaxed text-graphite">
            <p>
              <strong className="font-bold uppercase not-italic tracking-wide text-ink">
                {analystNote.lede}
              </strong>{" "}
              {analystNote.paragraphs[0]}
            </p>
            {analystNote.paragraphs.slice(1).map((p) => (
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
    </Module>
  );
}
