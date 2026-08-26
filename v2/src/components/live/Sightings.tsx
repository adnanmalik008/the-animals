"use client";

import { useEffect, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { sightingItems, type SightingItem } from "@/data/live-extra";
import { CarouselArrow } from "./SocialPulse";
import { StickerDropZone } from "./stickers";

/* ============================================================
   Sightings — out-of-home spots phoned in from the field.
   White-framed photo cards ride a carousel, three up on desktop.
   ============================================================ */

function SightingCard({ item }: { item: SightingItem }) {
  return (
    <StickerDropZone
      className="h-full rounded-lg"
      insight={() => ({
        circleId: "channels",
        headline: item.caption,
        source: item.city,
        category: "OOH",
        categoryColor: "green",
      })}
    >
      <figure className="flex h-full flex-col border border-line/70 bg-card p-2.5 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photo}
          alt=""
          aria-hidden
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
        <figcaption className="flex flex-1 flex-col px-0.5">
          <p className="mt-3 flex-1 font-serif text-sm leading-snug">{item.caption}</p>
          <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 text-xs text-graphite">
            <span className="tabular-nums">{item.time}</span>
            <span>{item.city}</span>
          </div>
        </figcaption>
      </figure>
    </StickerDropZone>
  );
}

export function Sightings({ id }: { id: string }) {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);

  const maxIndex = Math.max(0, sightingItems.length - perView);
  /* clamp at render time so a viewport change can never strand the track */
  const current = Math.min(index, maxIndex);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPerView(mq.matches ? 3 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <Module id={id} eyebrow="Correspondence" title="Sightings" variant="editorial">
      <div className="pt-4">
        <div className="overflow-hidden px-0.5 py-1">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * (100 / perView)}%)` }}
          >
            {sightingItems.map((item) => (
              <div key={item.id} className="w-full shrink-0 px-1.5 md:w-1/3">
                <SightingCard item={item} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <CarouselArrow
            dir="prev"
            label="Previous sightings"
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
            label="Next sightings"
            disabled={current >= maxIndex}
            onClick={() => setIndex(Math.min(maxIndex, current + 1))}
          />
        </div>
      </div>
    </Module>
  );
}
