import {
  isSharedByAll,
  mediaOverlap,
  overlapBrands,
  sharedByAllCount,
  type OverlapRow,
} from "@/data/competition";

/* Media Overlap — the presence matrix, built to the design's card: the title
   in the card's own header over a hairline rule; italic serif column heads;
   one 44px row per channel with an 8px gap between rows, tinted gold at 10%
   when all three brands are present (olive on the paid channels), each name
   led by a gold or red tick; 10px dots — gold when the row is shared, the
   design's Line grey when only some brands are present, its Gray when
   absent; the count as a white numerator over a half-strength "/3". Static:
   the design draws nothing moving here. */

const tint: Record<OverlapRow["kind"], string> = {
  earned: "bg-yellow/10",
  paid: "bg-[rgba(146,129,0,0.1)]",
  owned: "bg-yellow/10",
};

const tick: Record<OverlapRow["kind"], string | null> = {
  earned: "bg-yellow",
  paid: "bg-red",
  owned: null,
};

function Dot({ present, shared, label }: { present: boolean; shared: boolean; label: string }) {
  return (
    <span
      role="img"
      aria-label={`${label}: ${present ? "present" : "absent"}`}
      className={`inline-block size-2.5 rounded-full ${
        present ? (shared ? "bg-yellow" : "bg-line") : "bg-graphite"
      }`}
    />
  );
}

export function MediaOverlap({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="Media Overlap"
      className={`flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-bg3 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/5 p-5">
        <h3 className="font-display text-2xl font-medium text-white">Media Overlap</h3>
        <span className="whitespace-nowrap font-display text-base text-white/70">
          {sharedByAllCount} shared by all
        </span>
      </div>

      {/* min-w-0 + overflow-x keeps the matrix inside the card at narrow widths */}
      <div className="min-w-0 overflow-x-auto p-5 pt-[19px]">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-2 font-display text-lg text-white">
          <colgroup>
            <col className="w-[24%]" />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr className="font-serif font-light italic leading-[1.4]">
              <th scope="col" className="pb-0 text-left font-light">
                Channel
              </th>
              {overlapBrands.map((name) => (
                <th key={name} scope="col" className="pb-0 pl-2.5 text-left font-light">
                  {name}
                </th>
              ))}
              <th scope="col" className="pb-0 pl-2.5 text-left font-light">
                Shared
              </th>
            </tr>
          </thead>
          <tbody>
            {mediaOverlap.map((row, r) => {
              const shared = isSharedByAll(row);
              const count = row.presence.filter(Boolean).length;
              const last = r === mediaOverlap.length - 1;
              /* the design rules every row underneath except the last, and
                 the first one on top as well */
              const cell = `h-11 border-white/5 ${last ? "" : "border-b"} ${r === 0 ? "border-t" : ""} ${
                shared ? tint[row.kind] : ""
              }`;
              const mark = tick[row.kind];
              return (
                <tr key={row.channel}>
                  <th scope="row" className={`${cell} text-left font-normal`}>
                    <span className="flex items-center gap-2.5">
                      {mark && <span aria-hidden className={`h-4 w-px shrink-0 ${mark}`} />}
                      <span className="whitespace-nowrap">{row.channel}</span>
                    </span>
                  </th>
                  {row.presence.map((present, i) => (
                    <td key={overlapBrands[i]} className={`${cell} pl-2.5`}>
                      <Dot present={present} shared={shared} label={`${overlapBrands[i]} — ${row.channel}`} />
                    </td>
                  ))}
                  <td className={`${cell} pl-2.5 tabular-nums`}>
                    {count}
                    <span className="text-white/50">/3</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
