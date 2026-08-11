"use client";

import { useEffect, useMemo, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { voiceQuotes, type VoiceQuote, type VoiceTab } from "@/data/live";
import { StickerDropZone } from "./stickers";
import { CarouselArrow } from "./SocialPulse";

const tabs: { id: VoiceTab; label: string }[] = [
  { id: "drivers", label: "Drivers" },
  { id: "problems", label: "Problems" },
  { id: "solutions", label: "Solutions" },
];

function QuoteCard({ quote }: { quote: VoiceQuote }) {
  return (
    <StickerDropZone
      className="h-full rounded-2xl"
      insight={() => ({
        circleId: "culture",
        headline: quote.text,
        source: "Consumer voice",
        category: "Culture",
        categoryColor: "green",
      })}
    >
      <figure className="flex h-full flex-col gap-3 rounded-2xl border border-line/70 bg-card p-5 shadow-sm">
        <figcaption className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange">
          Consumer Voice
        </figcaption>
        <blockquote className="font-serif text-lg leading-snug sm:text-xl">
          “{quote.text}”
        </blockquote>
      </figure>
    </StickerDropZone>
  );
}

export function TheConversation({ id }: { id: string }) {
  const [tab, setTab] = useState<VoiceTab>("drivers");
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  /* 6 quotes per tab shown two at a time → 3 pages */
  const pages = useMemo(() => {
    const quotes = voiceQuotes[tab];
    const chunks: VoiceQuote[][] = [];
    for (let i = 0; i < quotes.length; i += 2) chunks.push(quotes.slice(i, i + 2));
    return chunks;
  }, [tab]);

  /* auto-rotate every 5s, pause on hover */
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setPage((p) => (p + 1) % pages.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused, pages.length]);

  return (
    <Module id={id} eyebrow="Observation № 03" title="The Conversation" variant="editorial">
      <div
        className="pt-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Consumer voice categories">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setTab(t.id);
                  setPage(0);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 ${
                  active
                    ? "bg-orange text-white shadow-sm"
                    : "border border-line bg-card text-graphite hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden px-0.5 py-1">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((pair, i) => (
              <div key={`${tab}-${i}`} className="grid w-full shrink-0 grid-cols-1 gap-3 px-1 sm:grid-cols-2">
                {pair.map((q) => (
                  <QuoteCard key={q.id} quote={q} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs tabular-nums text-graphite">
            {page + 1} / {pages.length}
          </span>
          <div className="flex items-center gap-2">
            <CarouselArrow
              dir="prev"
              label="Previous voices"
              onClick={() => setPage((p) => (p - 1 + pages.length) % pages.length)}
            />
            <CarouselArrow
              dir="next"
              label="Next voices"
              onClick={() => setPage((p) => (p + 1) % pages.length)}
            />
          </div>
        </div>
      </div>
    </Module>
  );
}
