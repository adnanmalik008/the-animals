"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { newsletterItems, type NewsletterItem } from "@/data/live-extra";
import { StickerBadge, useStickerTarget } from "./stickers";
import { TornSheet } from "./TornSheet";

/* ============================================================
   In Their Inbox — newsletter watch. The week's must-open sends
   are separated by hairlines like an inbox printout. The send
   you're reading opens to its quote and framing tag, and sits on
   the module's own torn paper; the paper also lifts under a send
   you hover. One send is open at a time, the first by default,
   as in the design.
   ============================================================ */

function InboxItem({
  item,
  open,
  hideRule,
  onToggle,
}: {
  item: NewsletterItem;
  open: boolean;
  /** the hairline above this send steps aside where a sheet overshoots it */
  hideRule: boolean;
  onToggle: () => void;
}) {
  /* sticker drop files the send into the Key Influencers circle */
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
      className={`torn-host group/row relative isolate rounded-md py-4 transition-shadow duration-300 motion-reduce:transition-none ${
        hideRule ? "" : "border-t border-ink/10"
      } ${isOver ? "outline-2 outline-orange outline-offset-4" : ""}`}
    >
      <TornSheet variant="inbox" bleed="list" shown={open ? true : "hover"} />
      {tagged !== undefined && <StickerBadge tag={tagged} tagKey={resolvedKey} />}

      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug">{item.name}</h3>
        <span className="shrink-0 text-xs text-graphite">{item.timeAgo}</span>
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-graphite">
        <span className="truncate">
          {item.authors} · {item.subs}
        </span>
        <span className="shrink-0 tabular-nums">{item.openRate}</span>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-3 flex w-full items-baseline gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
      >
        <span className="shrink-0 text-xs tracking-wide text-graphite">Subject:</span>
        <span
          className={`font-serif leading-snug ${open ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}
        >
          {item.subject}
        </span>
      </button>

      <div
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="mt-4 border-t border-ink/10 pt-4 font-serif text-lg leading-snug text-graphite">
            &quot;{item.quote}&quot;
          </p>
          <p className="mt-3 pb-1 text-sm font-medium text-orange">{item.tag}</p>
        </div>
      </div>
    </article>
  );
}

export function InTheirInbox({ id }: { id: string }) {
  const [openId, setOpenId] = useState<string | null>(newsletterItems[0]?.id ?? null);

  return (
    <Module id={id} eyebrow="Bulletin" title="In Their Inbox" variant="editorial">
      <div className="pt-4">
        <div className="px-5 py-4 sm:px-6">
          {newsletterItems.map((item, i) => {
            const open = openId === item.id;
            const prevOpen = i > 0 && openId === newsletterItems[i - 1].id;
            return (
              <InboxItem
                key={item.id}
                item={item}
                open={open}
                hideRule={i === 0 || open || prevOpen}
                onToggle={() => setOpenId(open ? null : item.id)}
              />
            );
          })}
        </div>
      </div>
    </Module>
  );
}
