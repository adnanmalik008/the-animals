"use client";

import type { CSSProperties } from "react";
import type { InsightItem, TopicCircle } from "@/lib/insights";
import { AddInsightPopover } from "./AddInsightPopover";
import { CircleIcon } from "./CircleIcon";
import { InsightCard } from "./InsightCard";
import { circleBadge, circleBorderSoft, circleText, circleTint, focusRing } from "./palette";

const DIAMETER: Record<TopicCircle["size"], number> = { sm: 280, md: 380, lg: 460 };

/* Slight horizontal offsets so stacked cards read like a loose pile (Figma frame 3). */
const OFFSETS = [-12, 14, 2];

interface SharedProps {
  circle: TopicCircle;
  insights: InsightItem[];
  selectedIds: string[];
  onPick: (id: string) => void;
  addOpen: boolean;
  onAddToggle: (circleId: string | null) => void;
  onAddSave: (circleId: string, text: string) => void;
}

function CircleHeader({ circle, count }: { circle: TopicCircle; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <CircleIcon icon={circle.icon} size={17} className={circleText[circle.color]} />
      <span className={`text-base font-semibold ${circleText[circle.color]}`}>{circle.name}</span>
      <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${circleBadge[circle.color]}`}>
        {count}
      </span>
    </div>
  );
}

function AddInsightPill({
  circle,
  addOpen,
  onAddToggle,
  className = "",
}: {
  circle: TopicCircle;
  addOpen: boolean;
  onAddToggle: (circleId: string | null) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-add-insight-trigger
      onClick={() => onAddToggle(addOpen ? null : circle.id)}
      aria-expanded={addOpen}
      className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border bg-card/80 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-card ${circleBorderSoft[circle.color]} ${circleText[circle.color]} ${focusRing} ${className}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add Insight
    </button>
  );
}

/* ---------- Desktop: soft tinted disc, absolutely positioned on the board ---------- */

export function TopicCircleView({
  circle,
  insights,
  selectedIds,
  onPick,
  addOpen,
  onAddToggle,
  onAddSave,
  lavaClass,
  position,
  popoverFlip = false,
}: SharedProps & {
  lavaClass: string;
  position: CSSProperties;
  /** Open the Add Insight popover above the circle (bottom-anchored circles would clip below). */
  popoverFlip?: boolean;
}) {
  const d = DIAMETER[circle.size];
  const visible = insights.slice(-3);

  return (
    // z-20 lifts an open popover above the fuse circle (z-10) — the lava
    // transform creates a stacking context that would otherwise trap it
    <div className={`absolute ${addOpen ? "z-20" : ""}`} style={position}>
      <div className={lavaClass}>
        <div
          className={`relative flex flex-col items-center rounded-full ${circleTint[circle.color]}`}
          style={{ width: d, height: d }}
        >
          <div className={circle.size === "sm" ? "pt-6" : "pt-10"}>
            <CircleHeader circle={circle} count={insights.length} />
          </div>

          <div
            className={`flex w-full flex-1 flex-col items-center justify-center gap-2.5 pb-12 ${
              circle.size === "sm" ? "px-5" : "px-9"
            }`}
          >
            {visible.length === 0 && (
              <p className="px-4 text-center text-xs text-graphite/80">
                No insights yet — add one below.
              </p>
            )}
            {visible.map((ins, i) => (
              <InsightCard
                key={ins.id}
                insight={ins}
                color={circle.color}
                draggable
                onPick={onPick}
                selected={selectedIds.includes(ins.id)}
                className="max-w-[300px]"
                style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }}
              />
            ))}
          </div>

          <AddInsightPill
            circle={circle}
            addOpen={addOpen}
            onAddToggle={onAddToggle}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          />

          {addOpen && (
            <AddInsightPopover
              onClose={() => onAddToggle(null)}
              onSave={(text) => onAddSave(circle.id, text)}
              className={`absolute left-1/2 z-30 w-80 -translate-x-1/2 ${
                popoverFlip ? "bottom-[92%]" : "top-[86%]"
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile: rounded tinted panel in a vertical stack ---------- */

export function TopicPanel({
  circle,
  insights,
  selectedIds,
  onPick,
  addOpen,
  onAddToggle,
  onAddSave,
}: SharedProps) {
  return (
    <section className={`rounded-3xl p-4 ${circleTint[circle.color]}`} aria-label={circle.name}>
      <CircleHeader circle={circle} count={insights.length} />

      <div className="mt-3 flex flex-col gap-2.5">
        {insights.length === 0 && (
          <p className="text-xs text-graphite/80">No insights yet — add one below.</p>
        )}
        {insights.map((ins) => (
          <InsightCard
            key={ins.id}
            insight={ins}
            color={circle.color}
            onPick={onPick}
            selected={selectedIds.includes(ins.id)}
          />
        ))}
      </div>

      {addOpen ? (
        <AddInsightPopover
          onClose={() => onAddToggle(null)}
          onSave={(text) => onAddSave(circle.id, text)}
          closeOnOutside={false}
          className="mt-3 w-full"
        />
      ) : (
        <AddInsightPill
          circle={circle}
          addOpen={addOpen}
          onAddToggle={onAddToggle}
          className="mt-3 w-full"
        />
      )}
    </section>
  );
}
