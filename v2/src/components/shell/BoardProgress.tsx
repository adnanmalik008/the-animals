"use client";

import { useBoardStore } from "@/lib/insights";

/* The pill beside the tabs. Adam asked what it represents, so until he
   confirms it reads the one thing the board can actually measure: how much
   of the Anomalies board has been fed. A topic circle counts as covered
   once at least one insight has been routed into it, which is exactly what
   the sticker gesture does — so the number moves as the board is worked.
   Falls back to the CMS value before the store hydrates. */
export function BoardProgress({ fallbackPct }: { fallbackPct: number }) {
  const { circles, insights } = useBoardStore();

  const covered = circles.filter((c) => insights.some((i) => i.circleId === c.id)).length;
  const pct = circles.length ? Math.round((covered / circles.length) * 100) : fallbackPct;

  return (
    <span
      title={`${covered} of ${circles.length} Anomalies circles have insights`}
      aria-label={`Board coverage: ${covered} of ${circles.length} Anomalies circles have insights`}
      className="ml-1 rounded-full border border-line px-2.5 py-1 text-xs text-graphite"
    >
      {pct}%
    </span>
  );
}
