"use client";

import { useBoardMeta } from "@/components/board/BoardDataContext";
import { LiveClock } from "./LiveClock";

export function BrandBar() {
  const boardMeta = useBoardMeta();
  /* close each pass with a full stop so the loop reads as a sentence */
  const q = boardMeta.briefQuestion.trim();
  const question = /[.?!]$/.test(q) ? q : q + ".";

  return (
    <div className="bg-card border-b border-line">
      <div className="mx-auto flex max-w-[1560px] items-stretch gap-3 px-4 py-3 sm:px-6">
        {/* Client brief card */}
        <div className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl bg-bg2 px-4 py-3 sm:px-5">
          <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-card px-2">
            {boardMeta.clientName.toLowerCase() === "adidas" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/assets/brand-bar/adidas-logo.png" alt="adidas" className="h-9 w-auto" />
            ) : (
              <span className="text-lg font-black lowercase tracking-tight">
                {boardMeta.clientName}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-serif text-lg font-bold sm:text-xl">{boardMeta.briefDate}</p>
            <div className="relative overflow-hidden">
              {/* the gap lives inside each copy so the -50% loop wraps seamlessly;
                  a full stop closes each pass and the gap stays tight */}
              <div className="marquee-track text-sm text-graphite sm:text-base">
                <span className="pr-6">{question}</span>
                <span aria-hidden className="pr-6">{question}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clock */}
        <LiveClock />
      </div>
    </div>
  );
}
