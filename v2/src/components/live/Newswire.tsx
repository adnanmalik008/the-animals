"use client";

import { useEffect, useState } from "react";
import { incomingNewsItem as fixtureIncoming, newsItems as fixtureItems, type NewsItem } from "@/data/board";
import { useModuleData } from "@/components/board/BoardDataContext";
import { ArticleModal } from "./ArticleModal";
import { SourceMark } from "./SourceMark";
import { StickerBadge, useStickerTarget } from "./stickers";

const categoryText: Record<NewsItem["categoryColor"], string> = {
  orange: "text-orange bg-orange/10",
  blue: "text-blue bg-blue/10",
  green: "text-green bg-green/10",
  red: "text-red bg-red/10",
  purple: "text-purple bg-purple/15",
};

/* the wire mixes real paper stocks as it runs down the column */
const PAPER_STOCKS = ["", "stock-soft", "", "stock-crumple", "", "stock-soft"];

function NewswireCard({
  item,
  index,
  isNew,
  onOpen,
}: {
  item: NewsItem;
  index: number;
  isNew?: boolean;
  onOpen: (item: NewsItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  /* sticker drops file this article into the News circle on the Anomalies board.
     No author: InsightItem.author means user-authored, and the Anomalies board
     renders source wordmarks only when author is absent. */
  const { targetProps, isOver, tagged } = useStickerTarget(
    () => ({
      circleId: "news",
      headline: item.headline,
      source: item.source,
      category: item.category,
      categoryColor: item.categoryColor,
    }),
    `news:${item.id}`
  );

  const stock = PAPER_STOCKS[index % PAPER_STOCKS.length];

  return (
    <article
      {...targetProps}
      className={`group/row relative isolate ${isNew ? "fold-in" : ""}`}
    >
      {/* the paper slides in behind the row on hover, and stays while open */}
      <div
        aria-hidden
        className={`torn-strip pointer-events-none absolute -inset-x-1 -inset-y-1 -z-10 transition-opacity duration-200 motion-reduce:transition-none ${stock} ${
          expanded ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
        }`}
      />

      {tagged !== undefined && <StickerBadge shade={tagged} />}

      <div
        className={`px-1 py-3.5 transition-colors ${
          expanded ? "" : "border-b border-ink/10"
        } ${isOver ? "ring-2 ring-orange" : ""}`}
      >
        <div className="flex items-center justify-between gap-3">
          <SourceMark source={item.source} />
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryText[item.categoryColor]}`}
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
          <h3 className="font-serif text-lg leading-snug sm:text-xl">{item.headline}</h3>
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
              Read full article
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
  /* CMS document when the board has one; fixtures otherwise */
  const cms = useModuleData<{ items?: NewsItem[]; incoming?: NewsItem }>("newswire");
  const baseItems = cms?.items?.length ? cms.items : fixtureItems;
  const incoming = cms?.incoming ?? fixtureIncoming;

  const [items, setItems] = useState(baseItems);
  const [newId, setNewId] = useState<string | null>(null);
  const [reading, setReading] = useState<NewsItem | null>(null);

  /* A fresh article folds into the top after 30s — the wire feels alive */
  useEffect(() => {
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
      <div className="flex flex-col pt-3">
        {items.map((item, i) => (
          <NewswireCard
            key={item.id}
            item={item}
            index={i}
            isNew={item.id === newId}
            onOpen={setReading}
          />
        ))}
      </div>
      {reading && <ArticleModal item={reading} onClose={() => setReading(null)} />}
    </>
  );
}
