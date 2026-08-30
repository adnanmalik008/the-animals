"use client";

import { useModuleData } from "@/components/board/BoardDataContext";
import { Module } from "@/components/modules/ModuleColumn";
import { trafficChannels as fixtureChannels, type TrafficChannel } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

/* Static context labels. Not controls: the window is fixed until the
   CMS drives it, so they carry no dropdown affordance. */
const filterIcons = [
  {
    icon: (
      <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    ),
  },
  {
    icon: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 21 12 21s-3.8-2.6-3.8-9S9.5 3 12 3z" />,
  },
  {
    icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  },
];

export function TrafficSources({ id }: { id: string }) {
  const cms = useModuleData<{
    period?: string;
    region?: string;
    scope?: string;
    channels?: TrafficChannel[];
  }>("traffic-sources");
  const trafficChannels = cms?.channels?.length ? cms.channels : fixtureChannels;
  const filters = [cms?.period ?? "Jan 2026", cms?.region ?? "Worldwide", cms?.scope ?? "All Traffic"].map(
    (label, index) => ({ label, icon: filterIcons[index].icon })
  );
  const { ref, inView } = useInView<HTMLDivElement>();
  const lead = [...trafficChannels].sort((a, b) => b.value - a.value)[0];

  return (
    <Module id={id} title="Sources of Traffic">
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "media-hotspots",
          headline: `Sources of Traffic — ${lead.label} leads web traffic`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <p className="text-sm text-graphite">Web traffic from marketing channels</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <span
                key={f.label}
                className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink shadow-sm"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-graphite" aria-hidden>
                  {f.icon}
                </svg>
                {f.label}
              </span>
            ))}
          </div>

          {/* gradient columns growing from the axis */}
          <div className="relative mt-5 h-56">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[100, 75, 50, 25, 0].map((tick) => (
                <div key={tick} className="flex items-center gap-2">
                  <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-graphite">
                    {tick}%
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
              ))}
            </div>
            <div className="absolute inset-y-0 left-11 right-0 flex items-end gap-2 pb-[18px]">
              {trafficChannels.map((c) => (
                <div key={c.id} className="flex flex-1 flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t-sm border-t-2 border-orange bg-gradient-to-b from-orange/45 to-orange/0 transition-[height] duration-1000 ease-out motion-reduce:transition-none"
                    style={{ height: inView ? `${c.value * 1.9}px` : "0px" }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="ml-11 flex gap-2">
            {trafficChannels.map((c) => (
              <span key={c.id} className="flex-1 text-center text-[10px] text-graphite">
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </StickerDropZone>
    </Module>
  );
}
