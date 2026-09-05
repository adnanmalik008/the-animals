"use client";

import { useMemo, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import {
  conversationQuotes,
  conversationPlatformLabel,
  type ConversationPlatform,
  type ConversationQuote,
} from "@/data/live";
import { StickerBadge, useStickerTarget } from "./stickers";
import { TornSheet } from "./TornSheet";

const filters: { id: ConversationPlatform | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "slack", label: "Slack" },
  { id: "discord", label: "Discord" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "whatsapp", label: "WhatsApp" },
];

/* the real brand marks exported from the design — slack, discord and linkedin
   sit in the Figma file as raster fills, only whatsapp is vector there */
const platformMark: Record<ConversationPlatform, string> = {
  slack: "/assets/social/slack.png",
  discord: "/assets/social/discord.png",
  linkedin: "/assets/social/linkedin.png",
  whatsapp: "/assets/social/whatsapp.svg",
};

/* the marks aren't all square, so the box is fixed and the artwork letterboxes
   inside it rather than stretching */
function PlatformIcon({ platform }: { platform: ConversationPlatform }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={platformMark[platform]}
      alt=""
      aria-hidden
      width={13}
      height={13}
      draggable={false}
      className="shrink-0 object-contain"
      style={{ width: 13, height: 13 }}
    />
  );
}

function QuoteCard({ quote, stock = "" }: { quote: ConversationQuote; stock?: string }) {
  const { targetProps, isOver, tagged, resolvedKey } = useStickerTarget(
    () => ({
      circleId: "social",
      headline: quote.text,
      source: conversationPlatformLabel[quote.platform],
      category: "Conversation",
      categoryColor: "green",
      detail: quote.replyTo ? `${quote.context}\n\nReplying to: ${quote.replyTo}` : quote.context,
      meta: `${quote.author} ${quote.handle} · ${quote.upvotes} upvotes · ${quote.timeAgo}`,
    }),
    `conversation:${quote.id}`
  );

  return (
    <article
      {...targetProps}
      className={`torn-host group/row relative isolate rounded-lg transition-shadow duration-300 motion-reduce:transition-none ${
        isOver ? "outline-2 outline-orange outline-offset-4" : ""
      }`}
    >
      {/* the same torn sheet Newswire uses fades in behind the quote on hover */}
      <TornSheet shown="hover" />
      {tagged !== undefined && <StickerBadge tag={tagged} tagKey={resolvedKey} />}
      <div className={`px-5 py-4 ${stock}`}>
        <div className="flex items-center justify-between gap-3 text-xs text-graphite">
          <span className="flex min-w-0 items-center gap-1.5">
            <PlatformIcon platform={quote.platform} />
            <span className="truncate">{quote.context}</span>
          </span>
          <span className="shrink-0">{quote.timeAgo}</span>
        </div>

        {quote.replyTo && (
          <p className="mt-1.5 truncate text-xs italic text-graphite/80">
            re: &ldquo;{quote.replyTo}&rdquo;
          </p>
        )}

        <blockquote className="mt-2 font-serif text-lg leading-snug">
          &ldquo;{quote.text}&rdquo;
        </blockquote>

        <div className="mt-3 flex items-end justify-between gap-3 border-t border-ink/10 pt-2">
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{quote.author}</span>
            <span className="block truncate text-xs text-graphite">{quote.handle}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm tabular-nums text-graphite">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {quote.upvotes}
          </span>
        </div>
      </div>
    </article>
  );
}

export function TheConversation({ id }: { id: string }) {
  const [filter, setFilter] = useState<ConversationPlatform | "all">("all");

  const quotes = useMemo(
    () =>
      filter === "all"
        ? conversationQuotes
        : conversationQuotes.filter((q) => q.platform === filter),
    [filter]
  );

  return (
    <Module
      id={id}
      eyebrow="Observation"
      title="The Conversation"
      variant="editorial"
    >
      <div className="pt-4">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by platform">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 ${
                  active
                    ? "border-orange bg-orange text-white"
                    : "border-line bg-card text-ink hover:border-graphite/40"
                }`}
              >
                {f.id !== "all" && <PlatformIcon platform={f.id} />}
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {quotes.map((q, i) => (
            <QuoteCard key={q.id} quote={q} stock={["", "stock-soft", "stock-crumple"][i % 3]} />
          ))}
        </div>
      </div>
    </Module>
  );
}
