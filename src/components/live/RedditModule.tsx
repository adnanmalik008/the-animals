"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { useModuleDoc } from "@/components/board/BoardDataContext";
import { insightStateLabel, type InsightState, type RedditTab } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { CarouselControls } from "./Carousel";
import { StickerDropZone, type InsightPayload } from "./stickers";
import { TabPills } from "./TabPills";

const tabs: { id: RedditTab; label: string }[] = [
  { id: "subreddits", label: "Subreddits" },
  { id: "influencers", label: "Influencers" },
  { id: "insights", label: "Insights" },
];

/* One subreddit: its name, a track the width of its activity, and the
   membership figure — the three columns the design rules off from each
   other, rather than a caption stacked over a bar. */
function SubredditRow({
  name,
  members,
  pct,
  inView,
  tagKey,
  insight,
}: {
  name: string;
  members: string;
  pct: number;
  inView: boolean;
  tagKey: string;
  insight: () => InsightPayload;
}) {
  return (
    <li className="border-b border-line last:border-b-0">
      <StickerDropZone tagKey={tagKey} className="rounded-lg" insight={insight}>
        <div className="flex items-center gap-4 py-4">
          <span className="w-[38%] shrink-0 truncate text-sm font-medium text-ink sm:text-base">{name}</span>
          <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-bg">
            {/* mount-keyed grow-x so the tracks fill again on every tab switch */}
            {inView && <span className="grow-x block h-full rounded-full bg-orange" style={{ width: `${pct}%` }} />}
          </span>
          <span className="w-[72px] shrink-0 text-right text-sm tabular-nums text-ink sm:text-base">{members}</span>
        </div>
      </StickerDropZone>
    </li>
  );
}

/* One redditor: face, handle over karma, and the engagement score the
   design sets to the right under its own label. */
function InfluencerRow({
  name,
  karma,
  eng,
  avatar,
  tagKey,
  insight,
}: {
  name: string;
  karma: string;
  eng: number;
  avatar?: string;
  tagKey: string;
  insight: () => InsightPayload;
}) {
  return (
    <li className="border-b border-line last:border-b-0">
      <StickerDropZone tagKey={tagKey} className="rounded-lg" insight={insight}>
        <div className="flex items-center gap-3 py-3">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" loading="lazy" className="size-10 shrink-0 rounded-full object-cover" />
          ) : (
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg2 text-sm font-semibold text-graphite"
            >
              {name.replace(/^u\//, "").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink sm:text-base">{name}</span>
            <span className="block truncate text-sm text-graphite">{karma}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-[11px] tracking-[0.5px] text-graphite">ENG</span>
            <span className="block text-base font-semibold tabular-nums text-ink">{eng}</span>
          </span>
        </div>
      </StickerDropZone>
    </li>
  );
}

/* The Insights tab is its own little board: a heading with what it was
   sourced from, the three consumer states, and two opinions at a time on
   the same carousel furniture the editorial column uses. */
function Insights({
  source,
  sets,
}: {
  source: string;
  sets: Record<InsightState, { id: string; text: string }[]>;
}) {
  const [state, setState] = useState<InsightState>("drivers");
  const [page, setPage] = useState(0);

  const rows = sets[state];
  const perPage = 2;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(page, pages - 1);
  const shown = rows.slice(current * perPage, current * perPage + perPage);

  return (
    <div className="pt-1">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-xl font-semibold uppercase tracking-normal text-ink sm:text-2xl">
            Opinions
          </h4>
          <p className="text-sm text-graphite">{source}</p>
        </div>
        <TabPills
          items={(Object.keys(insightStateLabel) as InsightState[]).map((s) => ({
            id: s,
            label: insightStateLabel[s],
          }))}
          active={state}
          /* a new state starts at its own first page, not halfway through
             the last one's */
          onChange={(s) => {
            setState(s);
            setPage(0);
          }}
          label="Insight state"
        />
      </div>

      {/* each opinion is its own drop target */}
      <ul className="mt-4 flex flex-col gap-2">
        {shown.map(({ id: insightId, text }) => (
          <li key={insightId}>
            <StickerDropZone
              tagKey={`reddit:insight:${insightId}`}
              className="rounded-lg"
              insight={() => ({
                circleId: "customer-opinion",
                headline: text,
                source: "Reddit",
                category: insightStateLabel[state],
                categoryColor: "orange",
              })}
            >
              <div className="rounded-lg bg-bg p-3">
                <p className="text-sm uppercase text-orange">Consumer voice</p>
                <p className="mt-2 text-base leading-snug text-graphite">{text}</p>
              </div>
            </StickerDropZone>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="mt-6">
          <CarouselControls
            count={pages}
            current={current}
            onPrev={() => setPage(Math.max(0, current - 1))}
            onNext={() => setPage(Math.min(pages - 1, current + 1))}
            labels={{ prev: "Previous opinions", next: "More opinions" }}
          />
        </div>
      )}
    </div>
  );
}

export function RedditModule({ id }: { id: string }) {
  const { subtitle, subreddits, influencers, insights } = useModuleDoc("reddit");
  const [tab, setTab] = useState<RedditTab>("subreddits");
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Module
      id={id}
      title="Reddit"
      headerExtra={<TabPills items={tabs} active={tab} onChange={setTab} label="Reddit view" />}
    >
      <div ref={ref} className="pt-3">
        <p className="text-sm leading-snug text-graphite">{subtitle}</p>

        <div className="mt-4">
          {tab === "subreddits" && (
            <ul className="flex flex-col">
              {subreddits.map((s) => (
                <SubredditRow
                  key={s.id}
                  name={s.name}
                  members={s.members}
                  pct={s.activity}
                  inView={inView}
                  tagKey={`reddit:sub:${s.id}`}
                  insight={() => ({
                    circleId: "media-hotspots",
                    headline: `Reddit — ${s.name} ${s.members} members, activity ${s.activity}`,
                    source: "Reddit",
                    category: "Signal",
                    categoryColor: "orange",
                  })}
                />
              ))}
            </ul>
          )}
          {tab === "influencers" && (
            <ul className="flex flex-col">
              {influencers.map((r) => (
                <InfluencerRow
                  key={r.id}
                  name={r.name}
                  karma={r.karma}
                  eng={r.pct}
                  avatar={r.avatar}
                  tagKey={`reddit:inf:${r.id}`}
                  insight={() => ({
                    circleId: "key-influencers",
                    headline: `Reddit influencer — ${r.name}, ${r.karma}`,
                    source: "Reddit",
                    category: "Voice",
                    categoryColor: "purple",
                  })}
                />
              ))}
            </ul>
          )}
          {tab === "insights" && (
            <Insights
              source={insights.source}
              sets={{
                drivers: insights.drivers,
                problems: insights.problems,
                solutions: insights.solutions,
              }}
            />
          )}
        </div>
      </div>
    </Module>
  );
}
