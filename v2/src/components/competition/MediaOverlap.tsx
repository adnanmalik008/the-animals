import {
  isSharedByAll,
  mediaOverlap,
  overlapBrands,
  sharedByAllCount,
} from "@/data/competition";
import { DarkPanel } from "./ui";

/* Media Overlap — dark presence matrix. The design sits it beside the
   Attention section's Animal View rather than giving it a section of its
   own, so it is a card. Static except for the cell-pulse on the dots of
   rows shared by all three brands. */

function Dot({ present, shared, label }: { present: boolean; shared: boolean; label: string }) {
  if (!present) {
    return (
      <>
        <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-white/15" />
        <span className="sr-only">{label}: absent</span>
      </>
    );
  }
  return (
    <span
      role="img"
      aria-label={`${label}: present`}
      className={`inline-block h-2 w-2 rounded-full bg-yellow ${shared ? "cell-pulse" : ""}`}
    />
  );
}

export function MediaOverlap({ className = "" }: { className?: string }) {
  return (
    <section aria-label="Media Overlap" className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight text-white">Media Overlap</h3>
        <span className="whitespace-nowrap text-xs text-white/50">
          {sharedByAllCount} shared by all
        </span>
      </div>
      <DarkPanel className="mt-4">
        {/* relative + min-w-0: keeps the wide table clipped to the panel
            instead of stretching the page at mobile widths */}
        <div className="relative min-w-0 overflow-x-auto">
          <table className="w-full min-w-[430px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th scope="col" className="py-2.5 pl-3 pr-4 font-serif text-sm font-normal italic text-white/40">
                  Channel
                </th>
                {overlapBrands.map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className="px-2 py-2.5 text-center font-serif text-sm font-normal italic text-white/55"
                  >
                    {name}
                  </th>
                ))}
                <th
                  scope="col"
                  className="py-2.5 pl-2 pr-3 text-center font-serif text-sm font-normal italic text-white/40"
                >
                  Shared
                </th>
              </tr>
            </thead>
            <tbody>
              {mediaOverlap.map((row) => {
                const shared = isSharedByAll(row);
                const count = row.presence.filter(Boolean).length;
                return (
                  <tr
                    key={row.channel}
                    className={`border-b border-white/[0.06] ${
                      shared ? "bg-yellow/[0.07]" : ""
                    }`}
                  >
                    <th
                      scope="row"
                      className={`whitespace-nowrap border-l-2 py-3 pl-3 pr-4 text-left font-serif text-[15px] font-normal italic ${
                        shared ? "border-yellow/60 text-white/90" : "border-transparent text-white/70"
                      }`}
                    >
                      {row.channel}
                    </th>
                    {row.presence.map((present, i) => (
                      <td key={overlapBrands[i]} className="px-2 py-3 text-center">
                        <Dot
                          present={present}
                          shared={shared}
                          label={`${overlapBrands[i]} — ${row.channel}`}
                        />
                      </td>
                    ))}
                    <td
                      className={`py-3 pl-2 pr-3 text-center text-xs tabular-nums ${
                        shared ? "font-semibold text-yellow" : "text-white/40"
                      }`}
                    >
                      {count}/3
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DarkPanel>
    </section>
  );
}
