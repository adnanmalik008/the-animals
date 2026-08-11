"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { stageVideos } from "@/data/live";
import { StickerDropZone } from "./stickers";
import { CarouselArrow } from "./SocialPulse";

export function OnStage({ id }: { id: string }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const current = stageVideos[index];

  const go = (next: number) => {
    setPlaying(null); // stop any embed when sliding away
    setIndex((next + stageVideos.length) % stageVideos.length);
  };

  return (
    <Module
      id={id}
      eyebrow="Transmission № 04"
      title="On Stage"
      variant="editorial"
      headerExtra={
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-red/30 bg-red/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-red">
          <span className="pulse-dot h-2 w-2 rounded-full bg-red" aria-hidden />
          LIVE
        </span>
      }
    >
      <StickerDropZone
        className="mt-4 rounded-2xl"
        insight={() => ({
          circleId: "culture",
          headline: `${current.title} — ${current.description}`,
          source: "YouTube",
          category: "Culture",
          categoryColor: "green",
        })}
      >
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {stageVideos.map((v) => (
                <div key={v.id} className="relative aspect-video w-full shrink-0 overflow-hidden bg-bg3">
                  {playing === v.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${v.videoId}?autoplay=1&mute=1&rel=0`}
                      title={v.title}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlaying(v.id)}
                      aria-label={`Play ${v.title}`}
                      className="group absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg`}
                        alt={v.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
                      />
                      <span className="absolute inset-0 bg-ink/20 transition-colors group-hover:bg-ink/10" aria-hidden />
                      <span
                        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange text-white shadow-lg transition-transform group-hover:scale-110 motion-reduce:transition-none"
                        aria-hidden
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-2 right-2 flex items-center justify-between">
            <CarouselArrow dir="prev" label="Previous video" onClick={() => go(index - 1)} />
            <CarouselArrow dir="next" label="Next video" onClick={() => go(index + 1)} />
          </div>
        </div>

        <div className="px-1 pb-1 pt-3">
          <h3 className="text-base font-bold uppercase tracking-tight sm:text-lg">{current.title}</h3>
          <p className="mt-0.5 text-sm text-graphite">{current.description}</p>
        </div>
      </StickerDropZone>

      <div className="mt-2 flex items-center justify-center gap-1.5" aria-hidden>
        {stageVideos.map((v, i) => (
          <span
            key={v.id}
            className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
              i === index ? "w-5 bg-orange" : "w-1.5 bg-silver"
            }`}
          />
        ))}
      </div>
    </Module>
  );
}
