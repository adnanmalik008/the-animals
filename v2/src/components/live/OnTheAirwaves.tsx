"use client";

import type { ReactElement } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { podcastItems, type PodcastCover, type PodcastItem } from "@/data/live-extra";
import { StickerDropZone } from "./stickers";

/* ============================================================
   On the Airwaves — podcast watch. Stylized CSS cover mocks on
   the left, a listener's annotation on the right: sometimes a
   post-it, sometimes a spiral-pad note, sometimes plain margin
   prose. No external artwork.
   ============================================================ */

/* ---------------- cover art (pure CSS) ---------------- */

function PivotCover() {
  return (
    <div
      className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(150deg, #3d3d3d 0%, #5a5a5a 45%, #222222 100%)" }}
    >
      {/* two faint studio silhouettes behind the wordmark */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 32% 46% at 32% 56%, rgba(255,255,255,0.16), transparent 70%), radial-gradient(ellipse 34% 50% at 70% 52%, rgba(255,255,255,0.12), transparent 70%)",
        }}
      />
      <span className="absolute right-3 top-2 font-serif text-[11px] italic text-white/80">New York</span>
      <span className="relative font-sans text-[42px] font-black italic leading-none tracking-tighter text-red [text-shadow:0_1px_0_rgba(255,255,255,0.45)]">
        PIVOT
      </span>
      <span className="absolute bottom-2.5 left-0 right-0 px-2 text-center text-[7px] font-bold uppercase tracking-[0.18em] text-white">
        Hosted by Kara Swisher and Scott Galloway
      </span>
    </div>
  );
}

function StartUpCover() {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-blue">
      {/* night sky */}
      <span aria-hidden className="absolute left-[14%] top-[12%] text-[9px] text-white/70">✦</span>
      <span aria-hidden className="absolute right-[18%] top-[20%] text-[7px] text-white/60">✦</span>
      <span aria-hidden className="absolute left-[30%] top-[28%] text-[6px] text-white/50">✦</span>
      <span aria-hidden className="absolute right-[34%] top-[9%] text-[8px] text-white/60">✦</span>
      <span className="relative -mt-8 font-sans text-4xl font-black italic tracking-tight text-white">
        Start<span className="text-yellow">Up</span>
      </span>
      {/* rooftop under construction */}
      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-[32%]" style={{ background: "#54341f" }}>
        <div className="absolute bottom-[22%] left-[30%] flex gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className="h-4 w-5 bg-yellow" />
          ))}
        </div>
        <div className="absolute bottom-[58%] left-[42%] flex gap-2">
          <span className="h-3.5 w-5 bg-yellow" />
        </div>
        {/* ladder */}
        <svg
          className="absolute -top-6 left-[10%]"
          width="26"
          height="64"
          viewBox="0 0 26 64"
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="2.4"
        >
          <path d="M6 2v60M20 2v60M6 12h14M6 24h14M6 36h14M6 48h14" />
        </svg>
      </div>
    </div>
  );
}

function OddLotsCover() {
  return (
    <div className="relative flex aspect-square w-full flex-col overflow-hidden bg-bg3 px-3 pb-2.5 pt-2">
      <span className="text-[8px] font-semibold tracking-wide text-white/85">Bloomberg</span>
      {/* the gift pile */}
      <div aria-hidden className="relative mx-auto mt-1 h-[48%] w-[74%]">
        <span
          className="absolute bottom-0 left-[6%] h-9 w-9 -rotate-6 rounded-[2px] bg-purple"
          style={{ backgroundImage: "linear-gradient(90deg, transparent 44%, rgba(255,255,255,0.5) 44%, rgba(255,255,255,0.5) 56%, transparent 56%)" }}
        />
        <span
          className="absolute bottom-0.5 left-[38%] h-11 w-8 rotate-3 rounded-[2px] bg-orange"
          style={{ backgroundImage: "linear-gradient(0deg, transparent 46%, rgba(255,255,255,0.5) 46%, rgba(255,255,255,0.5) 56%, transparent 56%)" }}
        />
        <span
          className="absolute bottom-0 right-[6%] h-8 w-10 rotate-6 rounded-[2px] bg-green"
          style={{ backgroundImage: "linear-gradient(90deg, transparent 44%, rgba(255,255,255,0.5) 44%, rgba(255,255,255,0.5) 56%, transparent 56%)" }}
        />
        <span className="absolute bottom-8 left-[24%] h-7 w-7 -rotate-12 rounded-[2px] bg-yellow" />
        <span className="absolute bottom-7 right-[18%] h-6 w-8 rotate-12 rounded-[2px] bg-red" />
      </div>
      <span className="mt-auto text-center font-serif text-[26px] font-semibold leading-none text-white">
        Odd Lots
      </span>
    </div>
  );
}

const covers: Record<PodcastCover, () => ReactElement> = {
  pivot: PivotCover,
  startup: StartUpCover,
  oddlots: OddLotsCover,
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
  const Cover = covers[item.cover];
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
          <div className="shadow-sm">
            <Cover />
          </div>
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
