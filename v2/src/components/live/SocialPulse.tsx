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

/* ---------------- platform marks ---------------- */

/* the real brand marks exported from the design — tiktok, instagram and x are
   monochrome black there, reddit keeps its orange roundel */
const platformMark: Record<SocialPlatform, string> = {
  tiktok: "/assets/social/tiktok.svg",
  reddit: "/assets/social/reddit.svg",
  instagram: "/assets/social/instagram.svg",
  x: "/assets/social/x.svg",
};

/* the marks aren't square, so the box is fixed and the artwork letterboxes
   inside it rather than stretching */
function Mark({ src, size }: { src: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" style={{ width: size, height: size }} className="object-contain" />
  );
}

export function PlatformIcon({ platform, size = 16 }: { platform: SocialPlatform; size?: number }) {
  return <Mark src={platformMark[platform]} size={size} />;
}

function AllIcon({ size = 16 }: { size?: number }) {
  return <Mark src="/assets/social/all.svg" size={size} />;
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
      className="pointer-events-auto flex h-9 w-11 shrink-0 items-center justify-center bg-transparent text-ink transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 disabled:cursor-default disabled:opacity-30"
    >
      <svg width="38" height="18" viewBox="0 0 38 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {dir === "prev" ? (
          <path d="M36 9.6C27 8.2 17.1 8.5 3 9.1m7-6.6C7.2 4.6 5 6.8 2.4 9.1 5.3 11 7.7 13.1 10 15.5" />
        ) : (
          <path d="M2 8.4c9 1.4 18.9 1.1 33 .5m-7-6.4c2.8 2.1 5 4.3 7.6 6.6-2.9 1.9-5.3 4-7.6 6.4" />
        )}
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image}
          alt={post.imageAlt}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
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
      eyebrow="Field Notes"
      title="Social Pulse"
      variant="editorial"
      headerExtra={
        <div className="ml-auto flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter posts by platform">
          {filters.map((f) => {
            const active = filter === f.id;
            /* the marks are images now, so the active pill knocks them back to
               white with a filter rather than currentColor */
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
                    ? "border-orange bg-orange [&_img]:brightness-0 [&_img]:invert"
                    : "border-line bg-card hover:border-graphite/40"
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
        <div className="mt-3 flex items-center justify-center gap-3">
          <CarouselArrow
            dir="prev"
            label="Previous posts"
            disabled={current <= 0}
            onClick={() => setIndex(Math.max(0, current - 1))}
          />
          <div className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                  i === current ? "w-5 bg-orange" : "w-1.5 bg-silver"
                }`}
              />
            ))}
          </div>
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
