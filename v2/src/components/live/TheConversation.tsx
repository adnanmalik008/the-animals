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

const filters: { id: ConversationPlatform | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "slack", label: "Slack" },
  { id: "discord", label: "Discord" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "whatsapp", label: "WhatsApp" },
];

function PlatformIcon({ platform }: { platform: ConversationPlatform }) {
  const common = { width: 13, height: 13, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (platform) {
    case "slack":
      return (
        <svg {...common} fill="currentColor" className="text-purple">
          <path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 0 1 4 0v5a2 2 0 1 1-4 0v-5zM9 6a2 2 0 1 1 2-2v2H9zm0 1a2 2 0 0 1 0 4H4a2 2 0 1 1 0-4h5zm9 2a2 2 0 1 1 2 2h-2V9zm-1 0a2 2 0 0 1-4 0V4a2 2 0 1 1 4 0v5zm-2 9a2 2 0 1 1-2 2v-2h2zm0-1a2 2 0 0 1 0-4h5a2 2 0 1 1 0 4h-5z" />
        </svg>
      );
    case "discord":
      return (
        <svg {...common} fill="currentColor" className="text-blue2">
          <path d="M19.5 6.2A16 16 0 0 0 15.6 5l-.2.4a12 12 0 0 1 3.4 1.7 14 14 0 0 0-11.6 0A12 12 0 0 1 10.6 5.4L10.4 5a16 16 0 0 0-3.9 1.2C3.9 10 3.2 13.7 3.5 17.3A16 16 0 0 0 8.4 19l.9-1.4a10 10 0 0 1-1.6-.8l.4-.3a11 11 0 0 0 9.6 0l.4.3a10 10 0 0 1-1.6.8l.9 1.4a16 16 0 0 0 4.9-1.7c.4-4.2-.6-7.9-2.8-11.1zM9.5 15c-.9 0-1.7-.9-1.7-1.9S8.6 11 9.5 11s1.7.9 1.7 2-.8 2-1.7 2zm5 0c-.9 0-1.7-.9-1.7-1.9s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} fill="currentColor" className="text-blue">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.5 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3s-2.3 1.57-2.3 3.2V21H9z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common} fill="currentColor" className="text-green">
          <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-6.9-6c-.5-.8-.8-1.7-.8-2.5 0-.9.5-1.4.7-1.6.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.1-.2.3 0 .5a8 8 0 0 0 3.6 3.1c.3.1.4.1.6-.1l.8-1c.2-.2.3-.2.5-.1l2 1c.2.1.3.2.4.3v.8z" />
        </svg>
      );
  }
}

function QuoteCard({ quote }: { quote: ConversationQuote }) {
  const { targetProps, isOver, tagged } = useStickerTarget(
    () => ({
      circleId: "culture",
      headline: quote.text,
      source: conversationPlatformLabel[quote.platform],
      category: "Conversation",
      categoryColor: "green",
    }),
    `conversation:${quote.id}`
  );

  return (
    <article
      {...targetProps}
      className={`relative rounded-lg transition-shadow duration-300 motion-reduce:transition-none ${
        tagged !== undefined ? "ring-2 ring-orange/60" : isOver ? "ring-2 ring-orange" : ""
      }`}
    >
      {tagged !== undefined && <StickerBadge shade={tagged} />}
      <div className="torn-card px-5 py-4">
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
      eyebrow="Observation № 03"
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
          {quotes.map((q) => (
            <QuoteCard key={q.id} quote={q} />
          ))}
        </div>
      </div>
    </Module>
  );
}
