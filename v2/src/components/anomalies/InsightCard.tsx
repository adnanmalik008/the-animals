"use client";

import type { CSSProperties, DragEvent } from "react";
import type { InsightItem } from "@/lib/insights";
import { XIcon } from "./CircleIcon";
import { circleText, focusRing, type CircleColor } from "./palette";

/* Custom MIME type carrying the insight id during HTML5 drag. */
export const INSIGHT_DRAG_TYPE = "animals/insight";

export function InsightCard({
  insight,
  color,
  onPick,
  onRemove,
  selected = false,
  draggable = false,
  className = "",
  style,
}: {
  insight: InsightItem;
  color: CircleColor;
  /** Click/tap adds the card to the fuse slots (also the keyboard path). */
  onPick?: (id: string) => void;
  /** Renders a small X badge that removes the card from the fuse slots. */
  onRemove?: (id: string) => void;
  selected?: boolean;
  draggable?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const body = (
    <>
      {(insight.author || insight.category) && (
        <span className="flex items-center justify-between gap-2">
          {insight.author ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              aria-hidden
              className="h-4 w-4 shrink-0 rounded-full bg-gradient-to-br from-orange to-purple"
            />
            <span className="truncate text-xs font-bold text-ink">{insight.author}</span>
          </span>
          ) : (
            <span />
          )}
          {insight.category && (
            <span className={`shrink-0 text-xs font-medium ${circleText[color]}`}>
              {insight.category}
            </span>
          )}
        </span>
      )}
      <span className="mt-1.5 line-clamp-2 font-serif text-sm leading-snug text-ink group-hover/card:line-clamp-none group-focus-visible/card:line-clamp-none">
        {insight.headline}
      </span>
    </>
  );

  const base = `group/card relative w-full rounded-lg border border-line/60 bg-card px-3.5 py-2.5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.09)] ${
    selected ? "ring-2 ring-orange/60" : ""
  } ${className}`;

  if (!onPick) {
    return (
      <div className={base} style={style}>
        {body}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(insight.id)}
            aria-label="Remove from fuse"
            className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-card text-graphite shadow-sm transition-colors hover:text-red ${focusRing}`}
          >
            <XIcon size={10} />
          </button>
        )}
      </div>
    );
  }

  const handleDragStart = (e: DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData(INSIGHT_DRAG_TYPE, insight.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onClick={() => onPick(insight.id)}
      title={draggable ? "Drag into the fuse circle, or click to select" : "Tap to select for the fuse"}
      className={`${base} block transition-shadow hover:shadow-md ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${focusRing}`}
      style={style}
    >
      {body}
    </button>
  );
}
