"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { appStoreVoice, type AppPlatform } from "@/data/live";
import { useCountUp, useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

const platforms: { id: AppPlatform; label: string }[] = [
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
];

function Stars({ rating, platform }: { rating: number; platform: AppPlatform }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          // re-key per platform so the roll-in replays on toggle
          key={`${platform}-${i}`}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="roll-in text-yellow"
          style={{ animationDelay: `${i * 90}ms` }}
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

export function AppStoreVoice({ id }: { id: string }) {
  const [platform, setPlatform] = useState<AppPlatform>("ios");
  const { ref, inView } = useInView<HTMLDivElement>();
  const data = appStoreVoice[platform];
  const rating = useCountUp(data.rating, inView, 900, 1);

  return (
    <Module
      id={id}
      title="App Store Voice"
      headerExtra={
        <div
          role="group"
          aria-label="App platform"
          className="ml-auto flex items-center gap-1 rounded-full border border-line bg-card p-1 shadow-sm"
        >
          {platforms.map((p) => {
            const active = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPlatform(p.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 ${
                  active ? "bg-orange text-white" : "text-graphite hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      }
    >
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "customer-opinion",
          headline: `App Store Voice — ${platform === "ios" ? "iOS" : "Android"} rating ${data.rating}, ${data.stats[2].value} ${data.stats[2].label.toLowerCase()} chatter`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <p className="text-sm text-graphite">Unfiltered consumer reviews</p>

          <div className="mt-3 flex items-end gap-4">
            <span className="text-5xl font-bold tabular-nums leading-none">
              {rating.toFixed(1)}
            </span>
            <span className="mb-1 flex flex-col gap-1">
              <Stars rating={data.rating} platform={platform} />
              <span className="text-sm text-graphite">{data.totalLabel}</span>
            </span>
          </div>

          {/* review-theme movement chips */}
          <div className="mt-5 grid grid-cols-2 divide-line rounded-2xl border border-line sm:grid-cols-4 sm:divide-x">
            {data.stats.map((stat) => (
              <div key={stat.label} className="px-4 py-3.5 text-center">
                <span className="block text-xl font-bold tabular-nums sm:text-2xl">{stat.value}</span>
                <span className="mt-0.5 block text-xs text-graphite">{stat.label}</span>
              </div>
            ))}
          </div>

          <figure className="mt-5 border-l-2 border-orange pl-4">
            <Stars rating={5} platform={platform} />
            <blockquote className="mt-2 font-serif text-lg leading-snug">
              &ldquo;{data.review.text}&rdquo;
            </blockquote>
            <figcaption className="mt-2 text-xs uppercase tracking-wide text-graphite">
              — {data.review.author}
            </figcaption>
          </figure>
        </div>
      </StickerDropZone>
    </Module>
  );
}
