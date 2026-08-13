"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { podcastItems, type PodcastCover, type PodcastItem } from "@/data/live-extra";
import { StickerDropZone } from "./stickers";

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
          <p className="text-[13px] leading-relaxed text-ink">{item.note}</p>
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
          <p className="text-xs leading-relaxed text-graphite">{item.note}</p>
        </div>
      );
    default:
      return <p className="max-w-[320px] font-serif text-sm leading-relaxed text-ink/90">{item.note}</p>;
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
        className={`flex flex-col gap-4 py-2 sm:grid sm:grid-cols-[168px_1fr] sm:gap-6 ${
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
          <p className="mt-2 text-sm font-bold text-ink">{item.show}</p>
          <p className="mt-0.5 flex items-baseline justify-between gap-2 text-[11px] text-graphite">
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
    <Module id={id} eyebrow="Dispatch № 07" title="On the Airwaves" variant="editorial">
      <div className="flex flex-col gap-5 pt-4">
        {podcastItems.map((item) => (
          <PodcastRow key={item.id} item={item} />
        ))}
      </div>
    </Module>
  );
}
