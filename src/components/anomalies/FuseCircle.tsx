"use client";

import { useState, type DragEvent } from "react";
import type { InsightItem, TopicCircle } from "@/lib/insights";
import { INSIGHT_DRAG_TYPE, InsightCard } from "./InsightCard";
import { focusRing } from "./palette";

function GhostWordmark() {
  return (
    // Figma-exported logo, faded back to a ghost watermark
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/logo/animals-logo.png"
      alt=""
      aria-hidden
      className="pointer-events-none w-44 select-none opacity-10"
    />
  );
}

/* Center fuse circle — the drop target where two insights become an idea.
   States: empty → one card ("Drop one more") → two cards (idea form). */
export function FuseCircle({
  slotItems,
  circleFor,
  ideaText,
  onIdeaText,
  onDrop,
  onRemove,
  onSave,
  onClear,
  shake,
  rejectHint,
}: {
  slotItems: InsightItem[];
  circleFor: (circleId: string) => TopicCircle | undefined;
  ideaText: string;
  onIdeaText: (text: string) => void;
  onDrop: (id: string) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
  onClear: () => void;
  shake: boolean;
  rejectHint: boolean;
}) {
  const [over, setOver] = useState(false);
  const full = slotItems.length >= 2;
  const first = slotItems[0];
  const second = slotItems[1];

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(INSIGHT_DRAG_TYPE)) return;
    if (full) {
      // both slots taken — let the browser show the not-allowed cursor
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData(INSIGHT_DRAG_TYPE);
    if (id) onDrop(id);
  };

  return (
    <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
      {/* subtle double border ring */}
      <div
        className={`rounded-full border p-3 transition-colors ${
          over ? "border-orange/50" : "border-line/80"
        }`}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Fuse circle — drop two insights from different circles here"
          className={`relative flex h-[520px] w-[520px] flex-col items-center justify-center gap-3 rounded-full border bg-card px-16 text-center shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)] transition-colors ${
            over ? "border-orange/60" : "border-line"
          } ${shake ? "anomalies-shake" : ""}`}
        >
          {first && (
            <InsightCard
              insight={first}
              color={circleFor(first.circleId)?.color ?? "orange"}
              onRemove={onRemove}
              className="max-w-[300px]"
            />
          )}

          {slotItems.length === 0 && (
            <>
              <GhostWordmark />
              <p className="mt-4 text-[28px] font-medium leading-tight tracking-tight text-ink">
                Drag two insights here
              </p>
              <p className="mt-0.5 text-base text-graphite">From different circles to fuse</p>
            </>
          )}

          {slotItems.length === 1 && (
            <>
              <p className="mt-10 text-[28px] font-medium leading-tight tracking-tight text-ink">
                Drop one more
              </p>
              <p className="mt-0.5 text-base text-graphite">From a different circle</p>
            </>
          )}

          {full && (
            <div className="w-full max-w-[310px] text-left">
              <label htmlFor="fuse-idea" className="text-base font-semibold text-ink">
                Your new idea
              </label>
              <textarea
                id="fuse-idea"
                value={ideaText}
                onChange={(e) => onIdeaText(e.target.value)}
                rows={3}
                placeholder="Write the idea this intersection unlocks..."
                className={`mt-2 w-full resize-none rounded-2xl border border-line bg-card px-4 py-3 text-sm text-ink shadow-sm placeholder:text-graphite/70 ${focusRing}`}
              />
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!ideaText.trim()}
                  onClick={onSave}
                  className={`rounded-full bg-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                >
                  Save idea
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className={`rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg2 ${focusRing}`}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {second && (
            <InsightCard
              insight={second}
              color={circleFor(second.circleId)?.color ?? "orange"}
              onRemove={onRemove}
              className="max-w-[300px]"
            />
          )}

          {rejectHint && (
            <p role="status" className="text-sm font-medium text-red">
              Pick insights from two different circles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
