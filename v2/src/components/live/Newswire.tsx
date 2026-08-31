"use client";

import { useEffect, useState } from "react";
import {
  incomingNewsItem as fixtureIncoming,
  newsItems as fixtureItems,
  type NewsItem,
  type NewsSource,
} from "@/data/board";
import { useModuleData } from "@/components/board/BoardDataContext";
import { ArticleModal } from "./ArticleModal";
import { SourceMark } from "./SourceMark";
import { StickerBadge, useStickerTarget } from "./stickers";

/* the design chips every category the same peach pill */
const chipClass = "text-orange bg-orange/10";

/* each publisher tears its own shade of paper, sampled from the design;
   one torn asset takes the tint, so there is no per-source image */
const PAPER_TINT: Record<NewsSource, string> = {
  Bloomberg: "#eae4e1",
  "The New York Times": "#e9e1d4",
  CNN: "#e4d8d0",
  MSN: "#dddbcd",
  "Fox News": "#d5d8ca",
  "New York Post": "#dde3df",
  CNBC: "#eadcd5",
};

function NewswireCard({
  item,
  isNew,
  onOpen,
}: {
  item: NewsItem;
  isNew?: boolean;
  onOpen: (item: NewsItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  /* sticker drops file this article into the News circle on the Anomalies board.
     No author: InsightItem.author means user-authored, and the Anomalies board
     renders source wordmarks only when author is absent. */
  const { targetProps, isOver, tagged, resolvedKey } = useStickerTarget(
    () => ({
      circleId: "news",
      headline: item.headline,
      source: item.source,
      category: item.category,
      categoryColor: item.categoryColor,
    }),
    `news:${item.id}`
  );

  return (
    <article
      {...targetProps}
      className={`torn-host group/row relative isolate transition-colors ${isNew ? "fold-in" : ""}`}
    >
      {/* the torn sheet slides in behind the row on hover and stays open */}
      <div
        aria-hidden
        style={{ ["--paper-tint" as string]: PAPER_TINT[item.source] }}
        className={`torn-sheet pointer-events-none absolute -inset-x-4 sm:-inset-x-8 -inset-y-1 -z-10 transition-opacity duration-200 motion-reduce:transition-none ${
          expanded ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
        }`}
      />

      {tagged !== undefined && <StickerBadge tag={tagged} tagKey={resolvedKey} />}

      <div
        /* the design's row is a fixed 123px tall, whatever the headline */
        className={`min-h-[123px] px-1 py-3.5 transition-colors ${
          /* while a sticker is armed the row reads as its own rounded card,
             like every other drop target, so the rule between rows steps aside */
          expanded || isOver ? "" : "border-b border-ink/10"
        } ${isOver ? "rounded-xl ring-2 ring-orange" : ""}`}
      >
        <div className="flex items-center justify-between gap-3">
          <SourceMark source={item.source} />
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${chipClass}`}
          >
            {item.category}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1.5 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
        >
          <h3
            className={`font-serif text-lg leading-snug sm:text-xl ${
              /* the design's rows are a fixed 123px, so a long headline
                 truncates rather than wrapping; opening it shows the rest */
              expanded ? "" : "line-clamp-1"
            }`}
          >
            {item.headline}
          </h3>
        </button>

        <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-graphite">
          <span className="uppercase tracking-wide">{item.author}</span>
          <span>{item.timeAgo}</span>
        </div>

        <div
          inert={!expanded}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <p className="border-t border-ink/10 pt-3 text-sm leading-relaxed text-graphite">
              {item.summary}
            </p>
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="mt-2 inline-flex items-center gap-1 pb-1 text-sm font-medium text-orange hover:text-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
            >
              Read summary
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Newswire() {
  /* CMS document when the board has one; fixtures otherwise. A CMS board
     without an `incoming` article gets none — the fixture must not fold
     into a real client's wire. */
  const cms = useModuleData<{ items?: NewsItem[]; incoming?: NewsItem }>("newswire");
  const baseItems = cms?.items?.length ? cms.items : fixtureItems;
  const incoming = cms ? (cms.incoming ?? null) : fixtureIncoming;

  const [items, setItems] = useState(baseItems);
  const [newId, setNewId] = useState<string | null>(null);
  const [reading, setReading] = useState<NewsItem | null>(null);

  /* A fresh article folds into the top after 30s — the wire feels alive */
  useEffect(() => {
    if (!incoming) return;
    const id = setTimeout(() => {
      setItems((prev) =>
        prev.some((p) => p.id === incoming.id) ? prev : [incoming, ...prev]
      );
      setNewId(incoming.id);
    }, 30_000);
    return () => clearTimeout(id);
  }, [incoming]);

  return (
    <>
      {/* 123px row + 8px gap = the design's 131px pitch */}
      <div className="flex flex-col gap-2 pt-3">
        {items.map((item) => (
          <NewswireCard
            key={item.id}
            item={item}
            isNew={item.id === newId}
            onOpen={setReading}
          />
        ))}
      </div>
      {reading && <ArticleModal item={reading} onClose={() => setReading(null)} />}
    </>
  );
}
