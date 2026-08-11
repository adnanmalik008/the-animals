import { searchKeywords, searchLandscape } from "@/data/competition";

/* Fully static chart — hardcoded widths, no transitions, no animation. */

export function SearchLandscape() {
  return (
    <div className="pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-graphite">Branded search volume, monthly</p>
        <span className="rounded-full border border-line px-3 py-1 text-xs text-graphite">
          90 days
        </span>
      </div>

      <ul className="flex flex-col gap-4">
        {searchLandscape.map((row) => (
          <li
            key={row.id}
            className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 sm:grid-cols-[8rem_1fr_auto]"
          >
            <span className={`truncate text-sm ${row.isClient ? "font-bold" : "font-semibold"}`}>
              {row.name}
            </span>
            <div className="h-3.5 overflow-hidden rounded-full bg-bg2">
              <div
                className={`h-full rounded-full ${row.isClient ? "bg-orange" : "bg-graphite"}`}
                style={{ width: `${row.widthPct}%` }}
              />
            </div>
            <span className="w-12 text-right text-sm tabular-nums text-graphite">
              {row.volumeLabel}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-line/70 pt-4">
        <p className="mb-2.5 text-xs uppercase tracking-wider text-graphite">
          Keyword landscape
        </p>
        <ul className="flex flex-wrap gap-2">
          {searchKeywords.map((kw) => (
            <li
              key={kw}
              className="rounded-full border border-line bg-bg2 px-3 py-1 text-xs text-ink"
            >
              {kw}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
