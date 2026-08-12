"use client";

import { useEffect, useState } from "react";
import { incomingNewsItem as fixtureIncoming, newsItems as fixtureItems, type NewsItem } from "@/data/board";
import { useModuleData } from "@/components/board/BoardDataContext";
import { SourceMark } from "./SourceMark";
import { StickerBadge, useStickerTarget } from "./stickers";

const categoryText: Record<NewsItem["categoryColor"], string> = {
  orange: "text-orange bg-orange/10",
  blue: "text-blue bg-blue/10",
  green: "text-green bg-green/10",
  red: "text-red bg-red/10",
  purple: "text-purple bg-purple/15",
};

function NewswireCard({ item, isNew }: { item: NewsItem; isNew?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  /* sticker drops file this article into the News circle on the Anomalies board */
  /* no author here: InsightItem.author means user-authored, and the Anomalies
     board renders source wordmarks only when author is absent */
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

  return (
    <article
      {...targetProps}
      className={`${isNew ? "fold-in " : ""}relative rounded-lg transition-shadow duration-300 motion-reduce:transition-none ${
        tagged !== undefined ? "ring-2 ring-orange/60" : isOver ? "ring-2 ring-orange" : ""
      }`}
    >
      {tagged !== undefined && <StickerBadge shade={tagged} />}
      <div className="torn-card px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <SourceMark source={item.source} />
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryText[item.categoryColor]}`}>
            {item.category}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 block w-full text-left"
        >
          <h3 className="font-serif text-lg leading-snug sm:text-xl">{item.headline}</h3>
        </button>

        <div className="mt-2 flex items-center justify-between border-t border-ink/10 pt-2 text-xs text-graphite">
          <span className="uppercase tracking-wide">{item.author}</span>
          <span>{item.timeAgo}</span>
        </div>

        <div
          inert={!expanded}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <p className="pt-3 text-sm leading-relaxed text-graphite">{item.summary}</p>
            <a
              href={item.link ?? "#"}
              target={item.link ? "_blank" : undefined}
              rel={item.link ? "noreferrer" : undefined}
              className="mt-2 inline-flex items-center gap-1 pb-1 font-serif text-sm text-orange hover:text-orange-hover"
            >
              Read full article
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
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
    <div className="flex flex-col gap-4 pt-4">
      {items.map((item) => (
        <NewswireCard key={item.id} item={item} isNew={item.id === newId} />
      ))}
    </div>
  );
}
