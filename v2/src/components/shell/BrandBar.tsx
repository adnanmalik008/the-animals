"use client";

import { useBoardMeta } from "@/components/board/BoardDataContext";
import { LiveClock } from "./LiveClock";

export function BrandBar() {
  const boardMeta = useBoardMeta();

  return (
    <div className="bg-card border-b border-line">
      <div className="mx-auto flex max-w-[1560px] items-stretch gap-3 px-4 py-3 sm:px-6">
        {/* Client brief card */}
        <div className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl bg-bg2 px-4 py-3 sm:px-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-card text-lg font-black lowercase tracking-tight">
            {boardMeta.clientName}
          </div>
          <div className="min-w-0">
            <p className="font-serif text-lg font-bold sm:text-xl">{boardMeta.briefDate}</p>
            <div className="relative overflow-hidden">
              <div className="marquee-track gap-16 text-sm text-graphite sm:text-base">
                <span>{boardMeta.briefQuestion}</span>
                <span aria-hidden>{boardMeta.briefQuestion}</span>
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
