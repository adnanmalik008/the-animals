"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { newsletterItems, type NewsletterItem } from "@/data/live-extra";
import { StickerBadge, useStickerTarget } from "./stickers";
import { TornSheet } from "./TornSheet";

/* ============================================================
   In Their Inbox — newsletter watch. The week's must-open sends
   are separated by hairlines like an inbox printout, and the
   torn paper only lifts under the send you're reading.
   ============================================================ */

function InboxItem({ item }: { item: NewsletterItem }) {
  /* sticker drop files the send into the News circle */
  const { targetProps, isOver, tagged, resolvedKey } = useStickerTarget(
    () => ({
      circleId: "key-influencers",
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
      className={`torn-host group/row relative isolate rounded-md py-4 transition-shadow duration-300 first:pt-1 last:pb-1 motion-reduce:transition-none ${
        isOver ? "outline-2 outline-orange outline-offset-4" : ""
      }`}
    >
      {/* Newswire's torn sheet fades in behind the send on hover; "list"
          clears the list's own padding so it still meets the panel edge */}
      <TornSheet bleed="list" shown="hover" />
      {tagged !== undefined && <StickerBadge tag={tagged} tagKey={resolvedKey} />}
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
        <div className="divide-y divide-ink/10 px-5 py-4 sm:px-6">
          {newsletterItems.map((item) => (
            <InboxItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </Module>
  );
}
