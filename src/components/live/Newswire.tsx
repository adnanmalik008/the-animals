"use client";

import { useEffect, useState } from "react";
import { useModuleDoc } from "@/components/board/BoardDataContext";
import type { ModuleDocs } from "@/lib/cms/types";
import { ArticleModal } from "./ArticleModal";
import { SourceMark } from "./SourceMark";
import { StickerBadge, useStickerTarget } from "./stickers";
import { TornSheet } from "./TornSheet";

/** One article on the wire, as the CMS stores it. */
export type NewswireArticle = ModuleDocs["newswire"]["items"][number];

/* the design chips every category the same peach pill */
const chipClass = "text-orange bg-orange/10";

/* each publisher tears its own shade of paper. The design paints a flat rect
   in the publisher's colour under the sheet, at a 0.55 fill through a mask
   that is itself half-opaque — so each tint lands at 0.55 x 0.502 = 0.276.
   One torn asset takes the tint; there is no per-source image. Bloomberg has
   no rect at all, and neither does a publisher a board names that we have no
   tint for: both tear plain paper. */
const TINT_ALPHA = 0.276;
const tint = (rgb: string) => `rgba(${rgb}, ${TINT_ALPHA})`;

const PAPER_TINT: Record<string, string | undefined> = {
  "The New York Times": tint("255, 234, 165"),
  CNN: tint("255, 200, 165"),
  MSN: tint("224, 255, 165"),
  "Fox News": tint("188, 255, 165"),
  "New York Post": tint("165, 255, 242"),
  CNBC: tint("255, 191, 165"),
};

function NewswireCard({
  item,
  isNew,
  onOpen,
}: {
  item: NewswireArticle;
  isNew?: boolean;
  onOpen: (item: NewswireArticle) => void;
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
      detail: item.body ? `${item.summary}\n\n${item.body}` : item.summary,
      meta: `${item.author} · ${item.timeAgo}`,
    }),
    `news:${item.id}`
  );

  return (
    <article
      {...targetProps}
      data-open={expanded ? "true" : undefined}
      /* raised while its sheet is out, so the sheet reaches over the rules of
         the rows it overshoots instead of stopping at its own bounds */
      className={`torn-row torn-host group/row relative isolate z-0 transition-colors hover:z-10 ${
        expanded ? "z-10" : ""
      } ${isNew ? "fold-in" : ""}`}
    >
      {/* the torn sheet slides in behind the row on hover and stays open */}
      <TornSheet tint={PAPER_TINT[item.source]} shown={expanded ? true : "hover"} />

      {/* the rule between rows, below the sheet rather than drawn across it */}
      {!isOver && (
        <span
          aria-hidden
          className="torn-rule pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-px bg-ink/10"
        />
      )}

      {tagged !== undefined && <StickerBadge tag={tagged} tagKey={resolvedKey} />}

      <div
        /* the design's row is a fixed 123px tall, whatever the headline */
        className={`min-h-[123px] px-1 py-3.5 transition-colors ${
          isOver ? "rounded-xl outline-2 outline-orange outline-offset-4" : ""
        }`}
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
  const doc = useModuleDoc("newswire");
  /* A board without a late arrival gets none — the built-in one must not
     fold into a real client's wire. */
  const incoming = doc.incoming ?? null;

  const [items, setItems] = useState(doc.items);
  const [newId, setNewId] = useState<string | null>(null);
  const [reading, setReading] = useState<NewswireArticle | null>(null);

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
