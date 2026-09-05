"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { createPortal } from "react-dom";
import { isUserInsight, type InsightItem } from "@/lib/insights";
import { XIcon } from "./CircleIcon";
import { circleText, focusRing, type CircleColor } from "./palette";

/* Custom MIME type carrying the insight id during HTML5 drag. */
export const INSIGHT_DRAG_TYPE = "animals/insight";

/* ---------------- hover detail ----------------
   The card shows two lines of headline; resting on it opens the whole
   thing — source, byline, full headline and the post or article copy
   behind it. Rendered through a portal so the circles' lava transforms
   (each a stacking context) cannot trap it under a neighbour. */

const PANEL_W = 340;
const GAP = 12;
const EDGE = 12;

function DetailPanel({
  insight,
  color,
  anchor,
}: {
  insight: InsightItem;
  color: CircleColor;
  anchor: DOMRect;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const h = panel.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    /* beside the card, on whichever side has room; then clamp to the viewport */
    const right = anchor.right + GAP;
    const left = right + PANEL_W <= vw - EDGE ? right : Math.max(EDGE, anchor.left - GAP - PANEL_W);
    const top = Math.max(EDGE, Math.min(vh - EDGE - h, anchor.top + anchor.height / 2 - h / 2));
    setPos({ left, top });
  }, [anchor]);

  const paragraphs = insight.detail?.split(/\n\s*\n/).filter(Boolean) ?? [];

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      className="pointer-events-none fixed z-[60] rounded-xl border border-line/70 bg-card p-4 text-left shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]"
      style={{
        width: PANEL_W,
        maxHeight: "70vh",
        overflow: "hidden",
        left: pos?.left ?? -9999,
        top: pos?.top ?? -9999,
        opacity: pos ? 1 : 0,
      }}
    >
      {(insight.source || insight.category) && (
        <p className="flex items-baseline justify-between gap-3 text-xs">
          <span className="min-w-0 truncate font-semibold text-ink">{insight.source}</span>
          {insight.category && (
            <span className={`shrink-0 font-medium ${circleText[color]}`}>{insight.category}</span>
          )}
        </p>
      )}
      {(insight.author || insight.meta) && (
        <p className="mt-1 text-xs text-graphite">{insight.author ?? insight.meta}</p>
      )}
      <p className="mt-2 font-serif text-base leading-snug text-ink">{insight.headline}</p>
      {paragraphs.map((para, i) => (
        <p key={i} className="mt-2 text-[13px] leading-relaxed text-graphite">
          {para}
        </p>
      ))}
    </div>,
    document.body
  );
}

/* Opens after a short rest so sweeping the pointer across a circle does not
   flash a panel per card; closes on leave, blur, or the start of a drag. */
function useHoverDetail() {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const open = (el: HTMLElement) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAnchor(el.getBoundingClientRect()), 180);
  };
  const close = () => {
    clearTimeout(timer.current);
    setAnchor(null);
  };

  return {
    anchor,
    close,
    hoverProps: {
      onMouseEnter: (e: { currentTarget: HTMLElement }) => open(e.currentTarget),
      onMouseLeave: close,
      onFocus: (e: { currentTarget: HTMLElement }) => open(e.currentTarget),
      onBlur: close,
    },
  };
}

/* Pencil + bin that surface on hover over a card the user typed themselves.
   Siblings of the card button (never nested buttons), so they sit in a
   wrapper that also carries the card's offset transform. */
function OwnCardControls({
  id,
  onEdit,
  onDelete,
}: {
  id: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const btn = `flex h-6 w-6 items-center justify-center rounded-full border border-line bg-card text-graphite shadow-sm transition-colors ${focusRing}`;
  return (
    <span className="absolute -right-2 -top-2.5 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover/own:opacity-100 group-focus-within/own:opacity-100">
      <button
        type="button"
        data-add-insight-trigger
        onClick={() => onEdit(id)}
        aria-label="Edit insight"
        title="Edit"
        className={`${btn} hover:text-orange`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onDelete(id)}
        aria-label="Delete insight"
        title="Delete"
        className={`${btn} hover:text-red`}
      >
        <XIcon size={10} />
      </button>
    </span>
  );
}

export function InsightCard({
  insight,
  color,
  onPick,
  onRemove,
  onEdit,
  onDelete,
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
  /** Own cards only (typed on the board): open the editor for this card. */
  onEdit?: (id: string) => void;
  /** Own cards only: take the card off the board for good. */
  onDelete?: (id: string) => void;
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
      <span className="mt-1.5 line-clamp-2 font-serif text-sm leading-snug text-ink">
        {insight.headline}
      </span>
    </>
  );

  const { anchor, close, hoverProps } = useHoverDetail();
  const panel = anchor && <DetailPanel insight={insight} color={color} anchor={anchor} />;

  const base = `group/card relative w-full rounded-lg border border-line/60 bg-card px-3.5 py-2.5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.09)] ${
    selected ? "ring-2 ring-orange/60" : ""
  }`;

  if (!onPick) {
    return (
      <div className={`${base} ${className}`} style={style} {...hoverProps}>
        {panel}
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
    close();
    e.dataTransfer.setData(INSIGHT_DRAG_TYPE, insight.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const own = isUserInsight(insight) && onEdit && onDelete;

  const card = (
    <button
      type="button"
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onClick={() => onPick(insight.id)}
      title={draggable ? "Drag into the fuse circle, or click to select" : "Tap to select for the fuse"}
      className={`${base} ${own ? "" : className} block transition-shadow hover:shadow-md ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${focusRing}`}
      style={own ? undefined : style}
      {...hoverProps}
    >
      {panel}
      {body}
    </button>
  );

  if (!own) return card;

  return (
    <div className={`group/own relative w-full ${className}`} style={style}>
      {card}
      <OwnCardControls id={insight.id} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
