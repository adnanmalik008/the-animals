"use client";

import { useEffect, useRef, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { creatorVideos, type CreatorVideo } from "@/data/live-extra";
import { CarouselArrow } from "./SocialPulse";
import { StickerDropZone } from "./stickers";

/* ============================================================
   YouTube Voices — creator watch. The thumbnails are the design's
   own artwork (239:4988): the white growth banner, the play button
   and the channel wordmark are baked into each image, so nothing
   is drawn over them.
   ============================================================ */

/* The thumbnail art, shared by the card and the fullscreen stage. */
function Thumbnail({ video, large = false }: { video: CreatorVideo; large?: boolean }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={video.thumb}
      alt={video.title}
      loading={large ? undefined : "lazy"}
      className="absolute inset-0 h-full w-full object-cover"
    />
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
        detail: video.description,
        meta: `${video.growthFrom} → ${video.growthTo}`,
      })}
    >
      <article className="flex h-full flex-col">
        {/* the design's own thumbnail; the gradient only shows while it loads */}
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
    <Module id={id} eyebrow="Field Notes" title="YouTube Voices" variant="editorial">
      <div className="pt-4">
        {/* the clip only has to hide the neighbouring slides horizontally, so it is
            given room back for the drop ring — 4px out is the slide's own gutter,
            which is as far as it can go before the next card bleeds in */}
        <div className="overflow-hidden -mx-1 px-1.5 -my-2 py-3">
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
