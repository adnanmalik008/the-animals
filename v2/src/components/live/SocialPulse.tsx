"use client";

import { useEffect, useMemo, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import {
  socialPlatformLabel,
  socialPosts,
  type SocialPlatform,
  type SocialPost,
} from "@/data/live";
import { StickerDropZone } from "./stickers";

/* ---------------- inline platform icons ---------------- */

export function PlatformIcon({ platform, size = 16 }: { platform: SocialPlatform; size?: number }) {
  switch (platform) {
    case "tiktok":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "reddit":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <ellipse cx="12" cy="14" rx="7.5" ry="5.4" />
          <path d="M12 8.7l1.2-4.2 3.3.8" />
          <circle cx="17.1" cy="5.6" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="4.1" cy="11.6" r="1.5" />
          <circle cx="19.9" cy="11.6" r="1.5" />
          <circle cx="9.3" cy="13.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.7" cy="13.5" r="1" fill="currentColor" stroke="none" />
          <path d="M9.3 16.4c1.8 1.3 3.6 1.3 5.4 0" />
        </svg>
      );
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.59l5.25 6.93L18.9 1.15zm-1.29 19.49h2.04L6.49 3.24H4.3l13.31 17.4z" />
        </svg>
      );
  }
}

function AllIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 7h9M17.5 7H20M4 12h3M11 12h9M4 17h11M19 17h1" />
      <circle cx="15" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="17" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------------- carousel arrow ---------------- */

export function CarouselArrow({
  dir,
  onClick,
  disabled,
  label,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink shadow-sm transition-colors hover:border-graphite/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 disabled:cursor-default disabled:opacity-35 disabled:hover:border-line`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {dir === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

/* ---------------- post card ---------------- */

function PostCard({ post }: { post: SocialPost }) {
  const label = socialPlatformLabel[post.platform];
  return (
    <StickerDropZone
      className="h-full rounded-2xl"
      insight={() => ({
        circleId: "social",
        headline: post.text,
        source: label,
        category: label,
        categoryColor: "blue",
      })}
    >
      <article className="flex h-full flex-col gap-3 rounded-2xl border border-line/70 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg2" aria-label={label}>
            <PlatformIcon platform={post.platform} size={14} />
          </span>
          <span className="text-sm font-semibold">{post.author}</span>
        </div>
        <p className="flex-1 font-serif text-[15px] leading-snug sm:text-base">{post.text}</p>
        <div className="flex items-center justify-between border-t border-line/70 pt-2.5 text-xs text-graphite">
          <span className="flex items-center gap-3 tabular-nums">
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {post.comments}
            </span>
          </span>
          <span>{post.timeAgo}</span>
        </div>
      </article>
    </StickerDropZone>
  );
}

/* ---------------- module ---------------- */

const filters: { id: SocialPlatform | "all"; label: string }[] = [
  { id: "all", label: "All platforms" },
  { id: "tiktok", label: "TikTok" },
  { id: "reddit", label: "Reddit" },
  { id: "instagram", label: "Instagram" },
  { id: "x", label: "X" },
];

export function SocialPulse({ id }: { id: string }) {
  const [filter, setFilter] = useState<SocialPlatform | "all">("all");
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(2);
  const [paused, setPaused] = useState(false);

  const posts = useMemo(
    () => (filter === "all" ? socialPosts : socialPosts.filter((p) => p.platform === filter)),
    [filter]
  );
  const maxIndex = Math.max(0, posts.length - perView);
  /* clamp at render time so a filter/viewport change can never strand the track */
  const current = Math.min(index, maxIndex);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPerView(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* auto-advance every 6s, pause on hover */
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 6000);
    return () => clearInterval(t);
  }, [paused, maxIndex]);

  return (
    <Module
      id={id}
      eyebrow="Field Notes № 02"
      title="Social Pulse"
      variant="editorial"
      headerExtra={
        <div className="ml-auto flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter posts by platform">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id);
                  setIndex(0);
                }}
                aria-pressed={active}
                aria-label={f.label}
                title={f.label}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 sm:h-9 sm:w-9 ${
                  active
                    ? "border-orange bg-orange text-white"
                    : "border-line bg-card text-ink hover:border-graphite/40"
                }`}
              >
                {f.id === "all" ? <AllIcon /> : <PlatformIcon platform={f.id} />}
              </button>
            );
          })}
        </div>
      }
    >
      <div
        className="relative pt-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="overflow-hidden px-0.5 py-1">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * (100 / perView)}%)` }}
          >
            {posts.map((post) => (
              <div key={post.id} className="w-full shrink-0 px-1.5 md:w-1/2">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <CarouselArrow
            dir="prev"
            label="Previous posts"
            disabled={current <= 0}
            onClick={() => setIndex(Math.max(0, current - 1))}
          />
          <CarouselArrow
            dir="next"
            label="Next posts"
            disabled={current >= maxIndex}
            onClick={() => setIndex(Math.min(maxIndex, current + 1))}
          />
        </div>
      </div>
    </Module>
  );
}
