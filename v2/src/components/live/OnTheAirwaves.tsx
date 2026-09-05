"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { podcastItems, type PodcastCover, type PodcastItem } from "@/data/live-extra";
import { StickerDropZone } from "./stickers";

/* ============================================================
   On the Airwaves — podcast watch. Real show artwork from the
   design source on the left, a listener's annotation on the
   right: sometimes a post-it, sometimes a spiral-pad note,
   sometimes plain margin prose. Three rows stacked, as the
   design lays them out, each note centred against its cover.
   ============================================================ */

const covers: Record<PodcastCover, string> = {
  pivot: "/assets/podcasts/pivot.jpg",
  startup: "/assets/podcasts/startup.jpg",
  oddlots: "/assets/podcasts/odd-lots.jpg",
};

/* ---------------- annotations ---------------- */

/* coil row for the spiral-pad note */
function Spiral() {
  return (
    <div aria-hidden className="pointer-events-none absolute -top-2.5 left-0 right-0 flex justify-around px-3">
      {Array.from({ length: 18 }, (_, i) => (
        <svg key={i} width="8" height="16" viewBox="0 0 8 16" fill="none" className="shrink-0">
          <path d="M2 14C1.5 8 2.5 3 4 2.5c1.6-.5 2.6 2.6 2.2 5.4" stroke="#8a8a8a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}

function Annotation({ item }: { item: PodcastItem }) {
  switch (item.noteStyle) {
    case "sticky":
      return (
        <div
          className="relative w-full max-w-[440px] -rotate-1 p-6 font-serif text-base leading-relaxed text-ink shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
          style={{ background: "#fbe9e3" }}
        >
          {item.note}
          {/* folded corner */}
          <span
            aria-hidden
            className="absolute -bottom-[14px] left-5 h-0 w-0 border-t-[16px] border-r-[16px] border-r-transparent"
            style={{ borderTopColor: "#efcfc4" }}
          />
        </div>
      );
    case "spiral":
      return (
        <div className="relative mt-3 w-full max-w-[500px] border border-line/60 bg-card px-7 pb-10 pt-9 font-serif text-[15px] leading-relaxed text-graphite shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <Spiral />
          {item.note}
        </div>
      );
    default:
      return <p className="font-serif text-lg leading-relaxed text-graphite">{item.note}</p>;
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
      {/* cover takes a little under half the row, the note the rest, and the
          note sits on the cover's centre line whatever its height */}
      <div className="flex flex-col gap-5 sm:grid sm:grid-cols-[5fr_6fr] sm:items-center sm:gap-8">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={`${item.show} cover art`}
            loading="lazy"
            className="aspect-square w-full object-cover shadow-sm"
          />
          <p className="mt-3 px-3 font-serif text-lg text-ink">{item.show}</p>
          <p className="mt-1 flex items-baseline justify-between gap-3 px-3 text-sm text-graphite">
            <span className="min-w-0">{item.network}</span>
            <span className="shrink-0 tabular-nums">{item.timestamp}</span>
          </p>
        </div>
        <Annotation item={item} />
      </div>
    </StickerDropZone>
  );
}

export function OnTheAirwaves({ id }: { id: string }) {
  return (
    <Module id={id} eyebrow="Dispatch" title="On the Airwaves" variant="editorial">
      <div className="flex flex-col gap-10 pt-4">
        {podcastItems.map((item) => (
          <PodcastRow key={item.id} item={item} />
        ))}
      </div>
    </Module>
  );
}
