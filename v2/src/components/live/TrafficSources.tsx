"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { trafficChannels } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

const MAX = 40; // y-axis ceiling, %

export function TrafficSources({ id }: { id: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const top = trafficChannels[0];

  return (
    <Module id={id} title="Sources of Traffic">
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "channels",
          headline: `Sources of Traffic — ${top.label} ${top.value}% of visits`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <p className="mb-5 text-sm text-graphite">.com traffic mix, last 30 days</p>
          <div className="pl-7">
            <div className="relative h-[190px] border-b border-line">
              {/* y-axis gridlines: 40 / 20 / 0 */}
              {[40, 20].map((tick) => (
                <div
                  key={tick}
                  aria-hidden
                  className="absolute inset-x-0 border-t border-dashed border-line/80"
                  style={{ top: `${(1 - tick / MAX) * 100}%` }}
                >
                  <span className="absolute -left-7 -top-2 w-6 text-right text-[9px] tabular-nums text-graphite">
                    {tick}%
                  </span>
                </div>
              ))}
              <span aria-hidden className="absolute -left-7 bottom-[-6px] w-6 text-right text-[9px] tabular-nums text-graphite">
                0
              </span>

              <div className="flex h-full items-end justify-between gap-1.5 sm:gap-3">
                {trafficChannels.map((c) => (
                  <div key={c.id} className="flex h-full flex-1 flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-bold tabular-nums leading-none">
                      {c.value}%
                    </span>
                    <div
                      className="w-full max-w-[30px] rounded-t bg-orange transition-[height] duration-1000 ease-out motion-reduce:transition-none"
                      style={{ height: inView ? `${Math.max((c.value / MAX) * 100, 0.75)}%` : "0%" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-start justify-between gap-1.5 sm:gap-3">
              {trafficChannels.map((c) => (
                <div key={c.id} className="flex flex-1 flex-col items-center text-center">
                  <span className="text-[10px] font-semibold leading-tight">{c.label}</span>
                  {c.target && (
                    <span className="mt-0.5 rounded-full bg-bg2 px-1.5 py-px text-[9px] leading-tight text-graphite">
                      {c.target}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </StickerDropZone>
    </Module>
  );
}
