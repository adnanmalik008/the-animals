"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { appStoreVoice, type AppPlatform } from "@/data/live";
import { useCountUp, useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";
import { TabPills } from "./TopSites";

const platforms: { id: AppPlatform; label: string }[] = [
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
];

const starLabels = ["5", "4", "3", "2", "1"];

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={filled ? "text-yellow" : "text-silver"}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function AppStoreVoice({ id }: { id: string }) {
  const [platform, setPlatform] = useState<AppPlatform>("ios");
  const { ref, inView } = useInView<HTMLDivElement>();
  const data = appStoreVoice[platform];
  const rating = useCountUp(data.rating, inView, 1200, 1);

  return (
    <Module
      id={id}
      title="App Store Voice"
      headerExtra={<TabPills items={platforms} active={platform} onChange={setPlatform} label="App platform" />}
    >
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "channels",
          headline: `App Store Voice — ${platform === "ios" ? "iOS" : "Android"} rated ${data.rating} across ${data.totalLabel}`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
            <span className="text-5xl font-bold tabular-nums leading-none sm:text-6xl">
              {rating.toFixed(1)}
            </span>
            <div className="pb-0.5">
              {/* keyed by platform + visibility so the stars roll in again on toggle */}
              <div key={inView ? platform : "hidden"} className="flex items-center gap-0.5" aria-label={`${data.rating} out of 5 stars`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={inView ? "roll-in" : "opacity-0"}
                    style={inView ? { animationDelay: `${i * 110}ms` } : undefined}
                  >
                    <Star filled={i < Math.round(data.rating)} />
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-graphite">{data.totalLabel}</p>
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-2">
            {data.distribution.map((pct, i) => (
              <li key={starLabels[i]} className="flex items-center gap-3">
                <span className="flex w-6 shrink-0 items-center gap-0.5 text-xs font-semibold tabular-nums text-graphite">
                  {starLabels[i]}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="text-graphite">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg2">
                  <div
                    className="bar-fill h-full rounded-full bg-yellow"
                    style={{ width: inView ? `${pct}%` : "0%" }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-xs tabular-nums text-graphite">{pct}%</span>
              </li>
            ))}
          </ul>

          <figure className="mt-5 rounded-xl border border-line bg-bg2/60 p-4">
            <blockquote className="font-serif text-[15px] leading-snug sm:text-base">
              “{data.review.text}”
            </blockquote>
            <figcaption className="mt-2 text-xs font-semibold uppercase tracking-wide text-graphite">
              — {data.review.author}
            </figcaption>
          </figure>
        </div>
      </StickerDropZone>
    </Module>
  );
}
