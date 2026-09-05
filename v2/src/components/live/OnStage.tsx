"use client";

import { useEffect, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { stageEvents } from "@/data/live";
import { StickerBadge, useStickerTarget } from "./stickers";
import { TornSheet } from "./TornSheet";
import { CarouselArrow } from "./SocialPulse";

/* Keynote stages — what the category is saying from the podium. */
export function OnStage({ id }: { id: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = stageEvents[index];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % stageEvents.length), 7000);
    return () => clearInterval(t);
  }, [paused]);

  const { targetProps, isOver, tagged, resolvedKey } = useStickerTarget(
    () => ({
      circleId: "key-influencers",
      headline: current.quote,
      source: current.speaker,
      category: "Event",
      categoryColor: "green",
    }),
    `stage:${current.id}`
  );

  return (
    <Module id={id} eyebrow="Transmission" title="On Stage" variant="editorial">
      <div
        className="pt-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* the clip opens out to the panel edge so the sheet can bleed to it;
            with nothing left to hide them, neighbouring slides fade instead */}
        <div className="overflow-hidden -mx-4 px-4 sm:-mx-8 sm:px-8 -my-3 py-3">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {stageEvents.map((ev) => (
              <div
                key={ev.id}
                className={`w-full shrink-0 transition-opacity duration-500 motion-reduce:transition-none ${
                  ev.id === current.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <article
                  {...(ev.id === current.id ? targetProps : {})}
                  className={`torn-host relative isolate rounded-lg transition-shadow duration-300 motion-reduce:transition-none ${
                    ev.id === current.id && isOver ? "outline-2 outline-orange outline-offset-4" : ""
                  }`}
                >
                  {/* the design sets every stage card on the torn sheet, always */}
                  <TornSheet className="opacity-100" />
                  {ev.id === current.id && tagged !== undefined && (
                    <StickerBadge tag={tagged} tagKey={resolvedKey} />
                  )}
                  <div className="px-5 py-5 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wide">{ev.event}</span>
                      <span className="shrink-0 rounded-full bg-orange/10 px-2.5 py-0.5 text-xs font-medium text-orange">
                        {ev.hashtag}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-graphite">{ev.session}</p>

                    <blockquote className="mt-4 font-serif text-xl leading-snug sm:text-2xl">
                      «{ev.quote}»
                    </blockquote>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-ink/10 pt-2.5">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{ev.speaker}</span>
                        <span className="block truncate text-xs text-graphite">{ev.speakerTitle}</span>
                      </span>
                      <span className="shrink-0 text-xs text-graphite">
                        Live tweets: <span className="font-semibold text-ink">{ev.liveTweets}</span>
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <CarouselArrow
            dir="prev"
            label="Previous event"
            onClick={() => setIndex((i) => (i - 1 + stageEvents.length) % stageEvents.length)}
          />
          <span className="flex items-center gap-1.5">
            {stageEvents.map((ev, i) => (
              <span
                key={ev.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-orange" : "w-1.5 bg-silver"
                }`}
                aria-hidden
              />
            ))}
          </span>
          <CarouselArrow
            dir="next"
            label="Next event"
            onClick={() => setIndex((i) => (i + 1) % stageEvents.length)}
          />
        </div>
      </div>
    </Module>
  );
}
