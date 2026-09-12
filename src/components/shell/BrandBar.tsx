"use client";

import { useBoardMeta, useModuleDoc } from "@/components/board/BoardDataContext";
import { LiveClock } from "./LiveClock";

/* The mark shown before any client uploaded one. It stays as a
   name-matched fallback rather than moving into the header fixture:
   a logo in the fixture is the logo every board with nothing saved
   renders, which would put this on every new client's brief. */
const ADIDAS_LOGO = "/assets/brand-bar/adidas-logo.png";

export function BrandBar() {
  const boardMeta = useBoardMeta();
  const header = useModuleDoc("board-header");
  /* close each pass with a full stop so the loop reads as a sentence */
  const q = boardMeta.briefQuestion.trim();
  const question = /[.?!]$/.test(q) ? q : q + ".";

  /* saved logo → the legacy adidas branch → the client's name as a wordmark */
  const logo = header.logoUrl
    ? { src: header.logoUrl, alt: header.logoAlt ?? boardMeta.clientName }
    : boardMeta.clientName.toLowerCase() === "adidas"
      ? { src: ADIDAS_LOGO, alt: "adidas" }
      : null;

  return (
    <div className="bg-card border-b border-line">
      <div className="mx-auto flex max-w-[1560px] items-stretch gap-3 px-4 py-3 sm:px-6">
        {/* Client brief card */}
        <div className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl bg-bg2 px-4 py-3 sm:px-5">
          <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-card px-2">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo.src} alt={logo.alt} className="h-9 w-auto" />
            ) : (
              <span className="text-lg font-black lowercase tracking-tight">
                {boardMeta.clientName}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-serif text-lg font-bold sm:text-xl">{boardMeta.briefDate}</p>
            <div className="relative overflow-hidden">
              {/* the separator lives inside each copy so the -50% loop wraps
                  seamlessly; a full stop closes each pass and the dot marks
                  where the question starts over */}
              <div className="marquee-track text-sm text-graphite sm:text-base">
                <span>{question}</span>
                <span aria-hidden className="px-3 text-graphite/60">&bull;</span>
                <span aria-hidden>{question}</span>
                <span aria-hidden className="px-3 text-graphite/60">&bull;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clock */}
        <LiveClock timeZone={header.clock.timeZone} label={header.clock.label} />
      </div>
    </div>
  );
}
