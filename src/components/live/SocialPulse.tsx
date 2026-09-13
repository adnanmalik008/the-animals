"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useModuleDoc } from "@/components/board/BoardDataContext";
import { Module } from "@/components/modules/ModuleColumn";
import { socialPlatformLabel, type SocialPlatform } from "@/data/live";
import type { ModuleDocs } from "@/lib/cms/types";
import { CarouselControls } from "./Carousel";
import { StickerDropZone } from "./stickers";

/** One post, as the CMS stores it. */
type SocialPost = ModuleDocs["social-pulse"]["posts"][number];

/* ---------------- platform marks ---------------- */

/* the real brand marks exported from the design, recoloured to each platform's
   official palette: tiktok's cyan/red glitch, instagram's gradient, reddit's
   orange roundel. x's official mark is black, so it stays black */
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

export function PlatformIcon({ platform, size = 24 }: { platform: SocialPlatform; size?: number }) {
  return <Mark src={platformMark[platform]} size={size} />;
}

function AllIcon({ size = 24 }: { size?: number }) {
  return <Mark src="/assets/social/all.svg" size={size} />;
}

/* ---------------- card furniture ---------------- */

/* The design's own icons, each exported at the colour it is drawn in. */
const icon = {
  heart: "/assets/social/ui/heart.svg",
  comment: "/assets/social/ui/comment.svg",
  share: "/assets/social/ui/share.svg",
  arrow: "/assets/social/ui/arrow-down.svg",
  verified: "/assets/social/ui/verified.svg",
};

function Stat({ src, value, flip }: { src: string; value: string; flip?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-xs text-graphite">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" aria-hidden className={`size-4 shrink-0 ${flip ? "-scale-y-100" : ""}`} />
      {value}
    </span>
  );
}

/** The card's own bottom bar: its own white block under a hairline. */
function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-b-2xl border-t border-line bg-card p-4">
      {children}
    </div>
  );
}

/* A face where the document carries one, the handle's own initial where it
   doesn't — every post predating the avatar field still reads as a person. */
function Avatar({ post, size = 32 }: { post: SocialPost; size?: number }) {
  const initial = (post.name ?? post.author).replace(/^[@#]|^[ur]\//, "").charAt(0).toUpperCase();
  return post.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.avatar}
      alt=""
      loading="lazy"
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-bg2 text-xs font-semibold text-graphite"
    >
      {initial}
    </span>
  );
}

/** name over handle — or the handle alone, on a post that carries no name. */
function Identity({ post, sub, badge }: { post: SocialPost; sub?: string; badge?: boolean }) {
  const handle = post.name ? post.author : undefined;
  /* never print the handle twice: without a name it is already the top line */
  const second = sub === post.author ? handle : (sub ?? handle);
  return (
    <div className="flex items-start gap-3">
      <Avatar post={post} />
      <div className="min-w-0 text-sm">
        <p className="flex items-center gap-1 font-medium text-ink">
          <span className="truncate">{post.name ?? post.author}</span>
          {badge && post.verified && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon.verified} alt="Verified" className="size-3.5 shrink-0" />
          )}
        </p>
        {second && <p className="truncate text-graphite">{second}</p>}
      </div>
    </div>
  );
}

function PostImage({ post, className = "" }: { post: SocialPost; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.image}
      alt={post.imageAlt}
      loading="lazy"
      className={`w-full object-cover ${className}`}
    />
  );
}

/* X writes its hashtags in link blue; nothing else in the file does. */
function withHashtags(text: string) {
  return text.split(/(#[\w-]+)/g).map((part, i) =>
    part.startsWith("#") ? (
      <span key={i} className="text-blue">
        {part}
      </span>
    ) : (
      part
    )
  );
}

/* ---------------- the five cards ---------------- */

/* Each platform prints its own furniture in the design — reddit a score
   between two arrows, Instagram a place over a full-bleed frame, X a tick
   and blue hashtags, TikTok the app's own screen. The shell (white, 16px
   corners, 16px padding, a hairline over the stats) is shared. */

function CardShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-2xl bg-card ${className}`}>
      {children}
    </article>
  );
}

function DefaultCard({ post }: { post: SocialPost }) {
  return (
    <CardShell>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Identity post={post} />
        <p className="text-sm leading-normal text-graphite">{post.text}</p>
        <PostImage post={post} className="aspect-[278/164] rounded-lg" />
      </div>
      <CardFooter>
        <Stat src={icon.heart} value={post.likes} />
        <Stat src={icon.comment} value={post.comments} />
        {post.shares && <Stat src={icon.share} value={post.shares} />}
      </CardFooter>
    </CardShell>
  );
}

function RedditCard({ post }: { post: SocialPost }) {
  return (
    <CardShell>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Identity post={post} sub={post.timeAgo} />
        <p className="text-sm leading-normal text-graphite">{post.text}</p>
        <PostImage post={post} className="aspect-[278/164] rounded-lg" />
      </div>
      <CardFooter>
        {/* the arrow is drawn pointing down, so the upvote is the flipped one */}
        <span className="flex items-center gap-1 text-xs text-graphite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon.arrow} alt="" aria-hidden className="size-4 -scale-y-100" />
          {post.upvotes ?? post.likes}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon.arrow} alt="" aria-hidden className="size-4" />
        </span>
        <Stat src={icon.comment} value={post.comments} />
        {post.shares && <Stat src={icon.share} value={post.shares} />}
      </CardFooter>
    </CardShell>
  );
}

function InstagramCard({ post }: { post: SocialPost }) {
  return (
    <CardShell>
      <div className="flex flex-1 flex-col">
        <div className="p-4">
          <Identity post={post} sub={post.place ?? post.author} />
        </div>
        {/* Instagram's frame runs to the card's own edges */}
        <PostImage post={post} className="aspect-square" />
      </div>
      <CardFooter>
        <Stat src={icon.heart} value={post.likes} />
        <Stat src={icon.comment} value={post.comments} />
        {post.shares && <Stat src={icon.share} value={post.shares} />}
      </CardFooter>
    </CardShell>
  );
}

function XCard({ post }: { post: SocialPost }) {
  return (
    <CardShell>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Identity post={post} badge />
        <p className="text-sm leading-normal text-graphite">{withHashtags(post.text)}</p>
        <PostImage post={post} className="aspect-[278/150] rounded-lg" />
      </div>
      {/* X counts the reply first and the like last */}
      <CardFooter>
        <Stat src={icon.comment} value={post.comments} />
        {post.shares && <Stat src={icon.share} value={post.shares} />}
        <Stat src={icon.heart} value={post.likes} />
      </CardFooter>
    </CardShell>
  );
}

/* TikTok's card hands the whole post to the app's own screen: the feed
   tabs, the rail of counts down the right, the caption and the music line
   over the still. Drawn from the design's frame, at its 185×381 ratio. */
function TikTokCard({ post }: { post: SocialPost }) {
  return (
    <CardShell>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Identity post={post} />
        <p className="line-clamp-2 text-sm leading-normal text-graphite">{post.text}</p>
        {/* the phone keeps the design's 185px width rather than the card's:
            stretched to a full-width slide it would stand 700px tall */}
        <div className="relative mx-auto aspect-[185/381] w-full max-w-[200px] overflow-hidden rounded-lg bg-ink">
          <PostImage post={post} className="absolute inset-0 h-full" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70" />

          {/* feed tabs */}
          <div className="absolute inset-x-0 top-1.5 flex items-center justify-center gap-3 text-[9px] text-white/70">
            <span>Following</span>
            <span className="h-2.5 w-px bg-white/40" />
            <span className="font-semibold text-white">For You</span>
          </div>

          {/* the rail of counts */}
          <div className="absolute bottom-12 right-1.5 flex flex-col items-center gap-2.5 text-[8px] text-white">
            <Avatar post={post} size={21} />
            <span className="flex flex-col items-center gap-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon.heart} alt="" aria-hidden className="size-4 brightness-0 invert" />
              {post.likes}
            </span>
            <span className="flex flex-col items-center gap-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon.comment} alt="" aria-hidden className="size-4 brightness-0 invert" />
              {post.comments}
            </span>
            {post.shares && (
              <span className="flex flex-col items-center gap-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon.share} alt="" aria-hidden className="size-4 brightness-0 invert" />
                {post.shares}
              </span>
            )}
          </div>

          {/* caption and music, as the app stacks them */}
          <div className="absolute inset-x-1.5 bottom-7 space-y-0.5 pr-10 text-[8px] leading-tight text-white">
            <p className="font-semibold">
              {post.author} · {post.timeAgo}
            </p>
            <p className="line-clamp-2 text-white/85">{post.text}</p>
          </div>

          {/* the app's tab bar, drawn as the flat band the design shows */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/85 px-2 py-1.5 text-[7px] text-white/60">
            <span className="text-white">Home</span>
            <span>Discover</span>
            <span className="rounded-[3px] bg-white px-1.5 py-0.5 text-black">+</span>
            <span>Inbox</span>
            <span>Me</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function PostCard({ post }: { post: SocialPost }) {
  const label = socialPlatformLabel[post.platform];
  const Card =
    post.platform === "tiktok"
      ? TikTokCard
      : post.platform === "reddit"
        ? RedditCard
        : post.platform === "instagram"
          ? InstagramCard
          : post.platform === "x"
            ? XCard
            : DefaultCard;

  return (
    <StickerDropZone
      className="h-full rounded-2xl"
      insight={() => ({
        circleId: "social",
        headline: post.text,
        source: label,
        category: label,
        categoryColor: "blue",
        meta: `${post.author} · ${post.likes} likes · ${post.comments} comments · ${post.timeAgo}`,
      })}
    >
      <Card post={post} />
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
  const { posts: allPosts } = useModuleDoc("social-pulse");
  const [filter, setFilter] = useState<SocialPlatform | "all">("all");
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);
  const [paused, setPaused] = useState(false);

  const posts = useMemo(
    () => (filter === "all" ? allPosts : allPosts.filter((p) => p.platform === filter)),
    [allPosts, filter]
  );
  /* The design counts a dot per screenful, not per card, so the track moves
     a screenful at a time and the last page simply holds fewer cards. */
  const pages = Math.max(1, Math.ceil(posts.length / perView));
  /* clamp at render time so a filter/viewport change can never strand the track */
  const current = Math.min(index, pages - 1);

  useEffect(() => {
    /* three across on the desktop board, as the design lays them out; two
       on a tablet and one on a phone, where a third would be unreadable */
    const wide = window.matchMedia("(min-width: 1024px)");
    const mid = window.matchMedia("(min-width: 640px)");
    const apply = () => setPerView(wide.matches ? 3 : mid.matches ? 2 : 1);
    apply();
    wide.addEventListener("change", apply);
    mid.addEventListener("change", apply);
    return () => {
      wide.removeEventListener("change", apply);
      mid.removeEventListener("change", apply);
    };
  }, []);

  /* auto-advance every 6s, pause on hover */
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i >= pages - 1 ? 0 : i + 1));
    }, 6000);
    return () => clearInterval(t);
  }, [paused, pages]);

  return (
    <Module
      id={id}
      eyebrow="Field Notes"
      title="Social Pulse"
      variant="editorial"
      headerExtra={
        <div className="ml-auto flex flex-wrap items-center gap-1" role="group" aria-label="Filter posts by platform">
          {filters.map((f) => {
            const active = filter === f.id;
            /* 48px tiles on the design's 16px corner; the marks are images,
               so the active tile knocks them back to white with a filter
               rather than currentColor */
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
                className={`flex size-10 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 sm:size-12 ${
                  active ? "bg-orange [&_img]:brightness-0 [&_img]:invert" : "bg-card hover:bg-bg2"
                }`}
              >
                {f.id === "all" ? <AllIcon size={20} /> : <PlatformIcon platform={f.id} size={20} />}
              </button>
            );
          })}
        </div>
      }
    >
      <div
        className="relative pt-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* the clip only has to hide the neighbouring slides horizontally, so it is
            given room back for the drop ring — 4px out is the slide's own gutter,
            which is as far as it can go before the next card bleeds in */}
        <div className="overflow-hidden -mx-1 px-1 -my-2 py-3">
          <div
            className="flex items-stretch transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className="w-full shrink-0 px-1 sm:w-1/2 lg:w-1/3"
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <CarouselControls
            count={pages}
            current={current}
            onPrev={() => setIndex(Math.max(0, current - 1))}
            onNext={() => setIndex(Math.min(pages - 1, current + 1))}
            labels={{ prev: "Previous posts", next: "Next posts" }}
          />
        </div>
      </div>
    </Module>
  );
}
