"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import {
  insightStateLabel,
  redditInsightStates,
  redditors,
  subreddits,
  type InsightState,
  type RedditTab,
} from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";
import { TabPills } from "./TabPills";

const tabs: { id: RedditTab; label: string }[] = [
  { id: "subreddits", label: "Subreddits" },
  { id: "influencers", label: "Influencers" },
  { id: "insights", label: "Insights" },
];

function BarRow({
  name,
  meta,
  pct,
  inView,
}: {
  name: string;
  meta: string;
  pct: number;
  inView: boolean;
}) {
  return (
    <li className="border-b border-line/60 py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate font-semibold">{name}</span>
        <span className="shrink-0 tabular-nums text-graphite">{meta}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg2">
        {/* mount-keyed grow-x so bars slide again on every tab switch */}
        {inView && <div className="grow-x h-full rounded-full bg-orange" style={{ width: `${pct}%` }} />}
      </div>
    </li>
  );
}

export function RedditModule({ id }: { id: string }) {
  const [tab, setTab] = useState<RedditTab>("subreddits");
  const [state, setState] = useState<InsightState>("drivers");
  const { ref, inView } = useInView<HTMLDivElement>();
  const top = subreddits[0];

  return (
    <Module
      id={id}
      title="Reddit"
      headerExtra={<TabPills items={tabs} active={tab} onChange={setTab} label="Reddit view" />}
    >
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "channels",
          headline: `Reddit — ${top.name} ${top.members} members, activity ${top.activity}`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          {tab === "subreddits" && (
            <ul className="flex flex-col">
              {subreddits.map((s) => (
                <BarRow key={s.id} name={s.name} meta={`${s.members} members`} pct={s.activity} inView={inView} />
              ))}
            </ul>
          )}
          {tab === "influencers" && (
            <ul className="flex flex-col">
              {redditors.map((r) => (
                <BarRow key={r.id} name={r.name} meta={r.karma} pct={r.pct} inView={inView} />
              ))}
            </ul>
          )}
          {tab === "insights" && (
            <div className="py-1">
              <div className="mb-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Insight state">
                {(Object.keys(insightStateLabel) as InsightState[]).map((s) => {
                  const active = state === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setState(s)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 ${
                        active
                          ? "border-orange bg-orange text-white"
                          : "border-line bg-card text-graphite hover:text-ink"
                      }`}
                    >
                      {insightStateLabel[s]}
                    </button>
                  );
                })}
              </div>
              <ul className="flex flex-col gap-4">
                {redditInsightStates[state].map((text, i) => (
                  <li key={`${state}-${i}`} className="border-l-2 border-orange pl-3.5">
                    <p className="font-serif text-[15px] leading-snug text-ink sm:text-base">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </StickerDropZone>
    </Module>
  );
}
