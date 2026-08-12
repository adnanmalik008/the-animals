"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { topSites, topSitesSubtitle, type SiteTab } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";
import { TabPills } from "./TabPills";

const tabs: { id: SiteTab; label: string }[] = [
  { id: "news", label: "News" },
  { id: "social", label: "Social" },
  { id: "searchai", label: "Search/AI" },
];

export function TopSites({ id }: { id: string }) {
  const [tab, setTab] = useState<SiteTab>("news");
  const { ref, inView } = useInView<HTMLDivElement>();
  const groups = topSites[tab];
  const leader = [...groups].sort((a, b) => b.audience - a.audience)[0];

  return (
    <Module
      id={id}
      title="Top Sites"
      headerExtra={<TabPills items={tabs} active={tab} onChange={setTab} label="Top sites source" />}
    >
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "channels",
          headline: `Top Sites — ${leader.label} over-indexes at ${leader.audience}% vs ${leader.average}% US average`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <p className="text-sm leading-snug text-graphite">{topSitesSubtitle}</p>

          <div className="mt-3 flex items-center gap-4 text-xs text-graphite">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange" aria-hidden /> Your Audience
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue2/60" aria-hidden /> US Average
            </span>
          </div>

          {/* grouped columns: audience vs average per property */}
          <div className="relative mt-4 h-52">
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
            <div className="absolute inset-y-0 left-11 right-0 flex items-end gap-1.5 pb-[18px]">
              {groups.map((g) => (
                <div key={g.id} className="flex flex-1 items-end justify-center gap-[3px]">
                  <div
                    className="w-1/2 rounded-t-sm bg-gradient-to-b from-orange to-orange/45 transition-[height] duration-1000 ease-out motion-reduce:transition-none"
                    style={{ height: inView ? `${g.audience * 1.7}px` : "0px" }}
                    title={`${g.label} — your audience ${g.audience}%`}
                  />
                  <div
                    className="w-1/2 rounded-t-sm bg-gradient-to-b from-blue2/55 to-blue2/20 transition-[height] duration-1000 ease-out motion-reduce:transition-none"
                    style={{ height: inView ? `${g.average * 1.7}px` : "0px" }}
                    title={`${g.label} — US average ${g.average}%`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="ml-11 flex gap-1.5">
            {groups.map((g) => (
              <span key={g.id} className="flex-1 truncate text-center text-[10px] text-graphite">
                {g.label}
              </span>
            ))}
          </div>
        </div>
      </StickerDropZone>
    </Module>
  );
}
