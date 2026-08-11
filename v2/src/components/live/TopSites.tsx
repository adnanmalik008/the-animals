"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { topSites, type SiteTab } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

const tabs: { id: SiteTab; label: string }[] = [
  { id: "news", label: "News" },
  { id: "social", label: "Social" },
  { id: "searchai", label: "Search/AI" },
];

export function ChangeArrow({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span
      className={`flex shrink-0 items-center gap-0.5 text-xs font-bold tabular-nums ${up ? "text-green" : "text-red"}`}
      aria-label={`${up ? "Up" : "Down"} ${Math.abs(change)} percent`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {up ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M19 12l-7 7-7-7" />}
      </svg>
      {Math.abs(change)}%
    </span>
  );
}

/* Shared tab-pill group used by several right-column modules */
export function TabPills<T extends string>({
  items,
  active,
  onChange,
  label,
}: {
  items: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="ml-auto flex items-center gap-1 rounded-full border border-line bg-card p-1 shadow-sm"
    >
      {items.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(t.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 ${
              isActive ? "bg-orange text-white" : "text-graphite hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function TopSites({ id }: { id: string }) {
  const [tab, setTab] = useState<SiteTab>("news");
  const { ref, inView } = useInView<HTMLDivElement>();
  const rows = topSites[tab];
  const leader = rows[0];

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
          headline: `Top Sites — ${leader.name} leads ${tabs.find((t) => t.id === tab)?.label ?? tab} at ${leader.visits}`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <ol className="flex flex-col">
            {rows.map((row, i) => (
              <li key={row.id} className="flex items-center gap-3 border-b border-line/60 py-3 last:border-b-0">
                <span className="w-5 shrink-0 text-sm font-bold tabular-nums text-graphite">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-semibold">{row.name}</span>
                    <span className="shrink-0 tabular-nums text-graphite">{row.visits}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg2">
                    {/* mount-keyed grow-x so bars slide again on every tab switch */}
                    {inView && (
                      <div className="grow-x h-full rounded-full bg-orange" style={{ width: `${row.pct}%` }} />
                    )}
                  </div>
                </div>
                <ChangeArrow change={row.change} />
              </li>
            ))}
          </ol>
        </div>
      </StickerDropZone>
    </Module>
  );
}
