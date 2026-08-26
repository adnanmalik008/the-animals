"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { newsletterItems, type NewsletterItem } from "@/data/live-extra";
import { StickerBadge, useStickerTarget } from "./stickers";

/* ============================================================
   In Their Inbox — newsletter watch. A single torn sheet holds
   the week's must-open sends, separated by hairlines like an
   inbox printout pinned to the board.
   ============================================================ */

function InboxItem({ item }: { item: NewsletterItem }) {
  /* sticker drop files the send into the News circle */
  const { targetProps, isOver, tagged } = useStickerTarget(
    () => ({
      circleId: "culture",
      headline: item.subject,
      source: item.name,
      category: "Newsletter",
      categoryColor: "purple",
    }),
    `inbox:${item.id}`
  );

  return (
    <article
      {...targetProps}
      className={`relative rounded-md py-4 transition-shadow duration-300 first:pt-1 last:pb-1 motion-reduce:transition-none ${
        tagged !== undefined ? "ring-2 ring-orange/60" : isOver ? "ring-2 ring-orange" : ""
      }`}
    >
      {tagged !== undefined && <StickerBadge shade={tagged} />}
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg font-bold leading-snug sm:text-xl">{item.name}</h3>
        <span className="shrink-0 text-xs text-graphite">{item.timeAgo}</span>
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-graphite">
        <span className="truncate">
          {item.authors} · {item.subs}
        </span>
        <span className="shrink-0 tabular-nums">{item.openRate}</span>
      </div>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="shrink-0 text-xs tracking-wide text-graphite">Subject:</span>
        <span className="font-serif text-base leading-snug sm:text-lg">{item.subject}</span>
      </p>
    </article>
  );
}

export function InTheirInbox({ id }: { id: string }) {
  return (
    <Module id={id} eyebrow="Bulletin" title="In Their Inbox" variant="editorial">
      <div className="pt-4">
        <div className="torn-card divide-y divide-ink/10 px-5 py-4 sm:px-6">
          {newsletterItems.map((item) => (
            <InboxItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </Module>
  );
}
