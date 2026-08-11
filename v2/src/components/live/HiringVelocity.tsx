"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { hiringRows } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

export function HiringVelocity({ id }: { id: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const lead = hiringRows[0];

  return (
    <Module id={id} title="Hiring Velocity">
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "channels",
          headline: `Hiring Velocity — ${lead.label} ${lead.roles} open roles (${lead.delta > 0 ? "+" : ""}${lead.delta}%)`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <p className="mb-4 text-sm text-graphite">Open roles by function</p>
          <ul className="flex flex-col gap-4">
            {hiringRows.map((row) => {
              const up = row.delta >= 0;
              return (
                <li key={row.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">{row.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="tabular-nums text-graphite">{row.roles} roles</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                          up ? "bg-green/10 text-green" : "bg-red/10 text-red"
                        }`}
                      >
                        {up ? "+" : ""}
                        {row.delta}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg2">
                    <div
                      className="bar-fill h-full rounded-full bg-orange"
                      style={{ width: inView ? `${row.pct}%` : "0%" }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </StickerDropZone>
    </Module>
  );
}
