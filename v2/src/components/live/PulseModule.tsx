"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { pulseWeek } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

export function PulseModule({ id }: { id: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const peak = pulseWeek.reduce((a, b) => (b.value > a.value ? b : a), pulseWeek[0]);

  return (
    <Module id={id} title="Pulse">
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "channels",
          headline: `Pulse — ${peak.day} peak, conversation index ${peak.value}`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <p className="mb-5 text-sm text-graphite">Weekly conversation pulse</p>
          <div className="flex h-[170px] items-end justify-between gap-2 border-b border-line sm:gap-4">
            {pulseWeek.map((d) => {
              const isPeak = d.day === peak.day;
              return (
                <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end">
                  {isPeak && (
                    <span className="mb-1 whitespace-nowrap rounded-full bg-orange px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      Peak day
                    </span>
                  )}
                  <span className="mb-1 text-[10px] font-bold tabular-nums leading-none text-graphite">
                    {d.value}
                  </span>
                  <div
                    className={`w-full max-w-[34px] rounded-t bg-gradient-to-t transition-[height] duration-1000 ease-out motion-reduce:transition-none ${
                      isPeak ? "from-orange to-orange-hover" : "from-orange/50 to-orange/80"
                    }`}
                    style={{ height: inView ? `${d.value}%` : "0%" }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 sm:gap-4">
            {pulseWeek.map((d) => (
              <span
                key={d.day}
                className={`flex-1 text-center text-[10px] font-semibold ${
                  d.day === peak.day ? "text-orange" : "text-graphite"
                }`}
              >
                {d.day}
              </span>
            ))}
          </div>
        </div>
      </StickerDropZone>
    </Module>
  );
}
