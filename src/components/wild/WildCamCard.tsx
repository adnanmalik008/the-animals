"use client";

import { useState } from "react";
import { useInView } from "@/lib/hooks";
import type { WildCam } from "@/data/wild";

/* ((•)) broadcast/signal mark for the location line */
function BroadcastIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="shrink-0"
      aria-hidden
    >
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M8.6 8.6a4.8 4.8 0 0 0 0 6.8M15.4 8.6a4.8 4.8 0 0 1 0 6.8" />
      <path d="M5.8 5.8a8.8 8.8 0 0 0 0 12.4M18.2 5.8a8.8 8.8 0 0 1 0 12.4" />
    </svg>
  );
}

export function WildCamCard({ cam, index }: { cam: WildCam; index: number }) {
  const { ref, inView } = useInView<HTMLElement>(0.15);
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const mediaShape = [
    "aspect-[16/9]",
    "aspect-[3/2]",
    "aspect-square",
    "aspect-[3/2]",
    "aspect-[5/2]",
    "aspect-square",
  ][index % 6];

  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`flex flex-col gap-4 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {/* Media area — thumbnail first, iframe swapped in on play */}
      <div className={`relative overflow-hidden bg-bg3 ${mediaShape}`}>
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${cam.videoId}?autoplay=1&mute=1`}
            title={`${cam.name} — live cam, ${cam.location}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${cam.name} live stream`}
            className="group absolute inset-0 block h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange"
          >
            {thumbFailed ? (
              <span
                className="flex h-full w-full items-center justify-center bg-bg3 text-7xl"
                aria-hidden
              >
                {cam.emoji}
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cam.thumbnail ?? `https://img.youtube.com/vi/${cam.videoId}/hqdefault.jpg`}
                alt={`${cam.name} — ${cam.location}`}
                loading="lazy"
                onError={() => setThumbFailed(true)}
                onLoad={(e) => {
                  // YouTube's soft-404 serves a decodable 120x90 gray placeholder,
                  // so onError never fires for dead ids — detect it by size
                  if (e.currentTarget.naturalWidth <= 120) setThumbFailed(true);
                }}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            )}

            {/* subtle dark gradient so the play button always reads */}
            <span
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20"
              aria-hidden
            />

            {/* centered play button */}
            <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card/90 shadow-lg transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-0.5 text-ink"
                  aria-hidden
                >
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Meta row: emoji + name / location — LIVE badge right */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span aria-hidden>{cam.emoji}</span>
            {cam.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-graphite">
            <BroadcastIcon />
            {cam.location}
          </p>
        </div>
        <span className="mt-1.5 flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red">
          <span className="pulse-dot h-2 w-2 rounded-full bg-red" aria-hidden />
          Live
        </span>
      </div>
    </article>
  );
}
