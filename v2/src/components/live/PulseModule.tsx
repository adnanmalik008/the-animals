"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { wikiPulse, wikiPulseSpikes } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

/* Wikipedia edit frequency — the early-warning signal. */
export function PulseModule({ id }: { id: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const lead = wikiPulse[0];

  return (
    <Module
      id={id}
      title="Wikipedia Pulse"
      headerExtra={
        <span className="ml-auto whitespace-nowrap text-sm font-semibold text-orange">
          {wikiPulseSpikes} spikes
        </span>
      }
    >
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "breakout-themes",
          headline: `Wikipedia Pulse — ${lead.entity} spiking at ${lead.count}/${lead.window}`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <p className="text-sm text-graphite">Edit frequency · early-warning signal</p>
          <ul className="divide-y divide-line">
            {wikiPulse.map((row) => (
              <li key={row.id} className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-semibold">{row.entity}</span>
                  {row.spike && (
                    <span className="shrink-0 rounded-full bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-orange">
                      Spike
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-graphite">{row.meta}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg2">
                    <div
                      className="bar-fill h-full rounded-full bg-orange"
                      style={{ width: inView ? `${row.pct}%` : "0%" }}
                    />
                  </div>
                  <span className="shrink-0 text-sm tabular-nums">
                    <span className="font-semibold">{row.count}</span>
                    <span className="text-graphite"> / {row.window}</span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-graphite">{row.baseline}</p>
              </li>
            ))}
          </ul>
        </div>
      </StickerDropZone>
    </Module>
  );
}
