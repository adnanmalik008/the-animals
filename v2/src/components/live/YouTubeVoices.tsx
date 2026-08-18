"use client";

import { useEffect, useRef, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { creatorVideos, type CreatorVideo } from "@/data/live-extra";
import { CarouselArrow } from "./SocialPulse";
import { StickerDropZone } from "./stickers";

/* ============================================================
   YouTube Voices — creator watch. Mock thumbnails (pure CSS)
   carry a white growth banner: where the channel started, and
   where covering this beat has taken it.
   ============================================================ */

function GrowthBanner({ from, to }: { from: string; to: string }) {
  return (
    <div className="absolute left-0 right-0 top-3 flex items-center gap-2 bg-white px-2 py-1.5 shadow-sm">
      <span className="shrink-0 text-[10px] font-bold leading-none text-ink">{from}</span>
      {/* dashed arrow */}
      <svg className="h-2.5 min-w-0 flex-1" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
        <line x1="0" y1="5" x2="92" y2="5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="4 3" className="text-ink" />
        <path d="M92 1l7 4-7 4z" fill="currentColor" className="text-ink" />
      </svg>
      <span className="shrink-0 bg-bg3 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{to}</span>
    </div>
  );
}

/* The thumbnail art, shared by the card and the fullscreen stage. */
function Thumbnail({ video, large = false }: { video: CreatorVideo; large?: boolean }) {
  return (
    <>
      {/* faint desk glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 62%, rgba(255,255,255,0.14), transparent 70%)" }}
      />
      <GrowthBanner from={video.growthFrom} to={video.growthTo} />
      <span
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-md ${
          large ? "h-16 w-16" : "h-10 w-10"
        }`}
        aria-hidden
      >
        <svg width={large ? 24 : 14} height={large ? 24 : 14} viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      {/* channel wordmark */}
      <span className="absolute bottom-2.5 left-0 right-0 flex items-baseline justify-center gap-1 lowercase">
        <span className={`font-extrabold tracking-tight text-white ${large ? "text-4xl" : "text-lg"}`}>
          {video.markA}
        </span>
        <span
          className={`rounded-sm bg-blue2 px-1 pb-0.5 font-extrabold leading-none tracking-tight text-white ${
            large ? "text-4xl" : "text-lg"
          }`}
        >
          {video.markB}
        </span>
      </span>
    </>
  );
}

/* Fullscreen player. Plays the embed when the CMS supplies a videoId;
   otherwise the thumbnail fills the stage. Click-off or Escape returns. */
function VideoLightbox({ video, onClose }: { video: CreatorVideo; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-4 py-8 backdrop-blur-sm print:hidden"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl"
        style={{ background: "linear-gradient(140deg, #2e2e2e 0%, #1a1a1a 55%, #303030 100%)" }}
      >
        {video.videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <Thumbnail video={video} large />
        )}
      </div>

      <div className="mt-4 w-full max-w-5xl text-white">
        <h2 className="font-serif text-xl font-semibold leading-snug sm:text-2xl">{video.title}</h2>
        <p className="mt-1 text-sm text-white/70">{video.description}</p>
      </div>
    </div>
  );
}

function VideoCard({ video, onOpen }: { video: CreatorVideo; onOpen: (v: CreatorVideo) => void }) {
  return (
    <StickerDropZone
      className="h-full rounded-lg"
      insight={() => ({
        circleId: "culture",
        headline: video.title,
        source: `${video.markA} ${video.markB}`,
        category: "YouTube",
        categoryColor: "blue",
      })}
    >
      <article className="flex h-full flex-col">
        {/* thumbnail mock — dark CSS art, no external images */}
        <button
          type="button"
          onClick={() => onOpen(video)}
          aria-label={`Play ${video.title}`}
          className="group relative block aspect-video w-full overflow-hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
          style={{ background: "linear-gradient(140deg, #2e2e2e 0%, #1a1a1a 55%, #303030 100%)" }}
        >
          <span className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none">
            <Thumbnail video={video} />
          </span>
        </button>

        <h3 className="mt-2.5 font-serif text-base font-semibold leading-snug">{video.title}</h3>
        <p className="mt-0.5 truncate text-xs text-graphite">{video.description}</p>
        <a
          href={video.link ?? "#"}
          target={video.link ? "_blank" : undefined}
          rel={video.link ? "noreferrer" : undefined}
          className="mt-1.5 inline-flex items-center gap-1 font-serif text-sm text-orange hover:text-orange-hover"
        >
          Read full article
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </a>
      </article>
    </StickerDropZone>
  );
}

export function YouTubeVoices({ id }: { id: string }) {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(2);
  const [playing, setPlaying] = useState<CreatorVideo | null>(null);

  const maxIndex = Math.max(0, creatorVideos.length - perView);
  /* clamp at render time so a viewport change can never strand the track */
  const current = Math.min(index, maxIndex);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPerView(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <Module id={id} eyebrow="Field Notes № 08" title="YouTube Voices" variant="editorial">
      <div className="pt-4">
        <div className="overflow-hidden px-0.5 py-1">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * (100 / perView)}%)` }}
          >
            {creatorVideos.map((video) => (
              <div key={video.id} className="w-full shrink-0 px-1.5 md:w-1/2">
                <VideoCard video={video} onOpen={setPlaying} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <CarouselArrow
            dir="prev"
            label="Previous videos"
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
            label="Next videos"
            disabled={current >= maxIndex}
            onClick={() => setIndex(Math.min(maxIndex, current + 1))}
          />
        </div>
      </div>
      {playing && <VideoLightbox video={playing} onClose={() => setPlaying(null)} />}
    </Module>
  );
}
