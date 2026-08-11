import { analystNote } from "@/data/competition";

/* Static editorial commentary — an analyst note, not a widget. */

export function AnimalView() {
  return (
    <div className="pt-4">
      <div className="max-w-3xl border-l-[3px] border-orange py-1 pl-5 sm:pl-7">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">
          {analystNote.label}
        </p>
        {analystNote.paragraphs.map((text, i) => (
          <p
            key={i}
            className={`font-serif text-lg leading-8 text-ink sm:text-xl sm:leading-9 ${
              i > 0 ? "mt-4" : ""
            }`}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
