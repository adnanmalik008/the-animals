"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { hiringRows, hiringSummary } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

/* Open roles by function. Every function is its own drop target, so the
   section carries as many stickers as it has rows. */
export function HiringVelocity({ id }: { id: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Module
      id={id}
      title="Hiring Velocity"
      headerExtra={
        <span className="ml-auto whitespace-nowrap text-sm font-semibold tabular-nums">
          {hiringSummary.open} OPEN ·{" "}
          <span className="text-orange">+{hiringSummary.deltaPct}%</span>
        </span>
      }
    >
      <div ref={ref} className="pt-4">
        <p className="text-sm text-graphite">Open roles · strategic intent signal</p>
        <ul className="divide-y divide-line">
          {hiringRows.map((row) => {
            const up = row.delta >= 0;
            return (
              <li key={row.id}>
                <StickerDropZone
                  tagKey={`hiring:${row.id}`}
                  className="rounded-lg"
                  insight={() => ({
                    circleId: "breakout-themes",
                    headline: `Hiring Velocity — ${row.label} ${row.roles} open roles (${up ? "+" : ""}${row.delta}%)`,
                    source: "Live board",
                    category: "Signal",
                    categoryColor: "orange",
                    meta: row.note,
                  })}
                >
                  <div className="py-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold tracking-tight">{row.label}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums ${
                          up ? "bg-blue2/10 text-blue2" : "bg-orange/10 text-orange"
                        }`}
                      >
                        {up ? "+" : ""}
                        {row.delta}%
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg2">
                        <div
                          className={`bar-fill h-full rounded-full ${up ? "bg-blue2" : "bg-orange"}`}
                          style={{ width: inView ? `${row.pct}%` : "0%" }}
                        />
                      </div>
                      <span className="shrink-0 text-base tabular-nums">
                        <span className="font-semibold">{row.roles}</span>{" "}
                        <span className="text-graphite">Roles</span>
                      </span>
                    </div>
                    <p className="mt-2.5 flex items-center gap-1.5 text-sm text-graphite">
                      <span aria-hidden>→</span>
                      {row.note}
                    </p>
                  </div>
                </StickerDropZone>
              </li>
            );
          })}
        </ul>
      </div>
    </Module>
  );
}
