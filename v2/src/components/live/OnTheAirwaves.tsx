"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { podcastItems, type PodcastCover, type PodcastItem } from "@/data/live-extra";
import { StickerDropZone } from "./stickers";
import { CarouselArrow } from "./SocialPulse";

/* ============================================================
   On the Airwaves — podcast watch. Real show artwork from the
   design source on the left, a listener's annotation on the
   right: sometimes a post-it, sometimes a spiral-pad note,
   sometimes plain margin prose.
   ============================================================ */

const covers: Record<PodcastCover, string> = {
  pivot: "/assets/podcasts/pivot.jpg",
  startup: "/assets/podcasts/startup.jpg",
  oddlots: "/assets/podcasts/odd-lots.jpg",
};

/* ---------------- annotations ---------------- */

/* tiny coil row for the spiral-pad note */
function MiniSpiral() {
  return (
    <div aria-hidden className="pointer-events-none absolute -top-2 left-0 right-0 flex justify-around px-3">
      {Array.from({ length: 14 }, (_, i) => (
        <svg key={i} width="8" height="14" viewBox="0 0 8 14" fill="none" className="shrink-0">
          <path d="M2 12C1.5 7 2.5 2.5 4 2c1.6-.5 2.6 2.6 2.2 5.4" stroke="#7a7a7a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}

function Annotation({ item }: { item: PodcastItem }) {
  switch (item.noteStyle) {
    case "sticky":
      return (
        <div className="relative max-w-[290px] rotate-[1.5deg] p-4 shadow-[0_3px_10px_rgba(0,0,0,0.14)]" style={{ background: "#f8dcc7" }}>
          <p className="text-center text-[13px] leading-relaxed text-ink">{item.note}</p>
          {/* folded corner */}
          <span
            aria-hidden
            className="absolute -bottom-[9px] left-4 h-0 w-0 border-t-[12px] border-r-[12px] border-r-transparent"
            style={{ borderTopColor: "#e9c0a2" }}
          />
        </div>
      );
    case "spiral":
      return (
        <div className="relative mt-2 max-w-[300px] bg-card p-4 pt-4 shadow-[0_2px_8px_rgba(0,0,0,0.10)]">
          <MiniSpiral />
          <p className="text-center text-xs leading-relaxed text-graphite">{item.note}</p>
        </div>
      );
    default:
      return <p className="max-w-[320px] text-center font-serif text-sm leading-relaxed text-ink/90">{item.note}</p>;
  }
}

/* ---------------- rows ---------------- */

function PodcastRow({ item }: { item: PodcastItem }) {
  const cover = covers[item.cover];
  return (
    <StickerDropZone
      className="rounded-lg"
      insight={() => ({
        circleId: "culture",
        headline: item.note,
        source: item.show,
        category: "Podcast",
        categoryColor: "green",
      })}
    >
      <div
        className={`paper-card flex flex-col gap-4 p-4 sm:grid sm:grid-cols-[168px_1fr] sm:gap-6 ${
          item.noteStyle === "plain" ? "sm:items-start" : "sm:items-center"
        }`}
      >
        <div className="w-[168px] max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={`${item.show} cover art`}
            loading="lazy"
            className="aspect-square w-full object-cover shadow-sm"
          />
          <p className="mt-2 text-center text-sm font-bold text-ink">{item.show}</p>
          <p className="mt-0.5 text-center text-[11px] leading-relaxed text-graphite">
            <span className="block">{item.network}</span>
            <span className="block tabular-nums">{item.timestamp}</span>
          </p>
        </div>
        <Annotation item={item} />
      </div>
    </StickerDropZone>
  );
}

export function OnTheAirwaves({ id }: { id: string }) {
  const [index, setIndex] = useState(0);

  return (
    <Module id={id} eyebrow="Dispatch" title="On the Airwaves" variant="editorial">
      <div className="pt-4">
        <div className="overflow-hidden px-0.5 py-1">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {podcastItems.map((podcast) => (
              <div key={podcast.id} className="w-full shrink-0 px-1">
                <PodcastRow item={podcast} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <CarouselArrow
            dir="prev"
            label="Previous podcast"
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
          />
          <div className="flex items-center gap-1.5" aria-label={`${index + 1} of ${podcastItems.length}`}>
            {podcastItems.map((podcast, dot) => (
              <span
                key={podcast.id}
                aria-hidden
                className={`h-1.5 rounded-full transition-all ${
                  dot === index ? "w-5 bg-orange" : "w-1.5 bg-silver"
                }`}
              />
            ))}
          </div>
          <CarouselArrow
            dir="next"
            label="Next podcast"
            disabled={index === podcastItems.length - 1}
            onClick={() => setIndex((value) => Math.min(podcastItems.length - 1, value + 1))}
          />
        </div>
      </div>
    </Module>
  );
}
