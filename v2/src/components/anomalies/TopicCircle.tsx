"use client";

import {
  useCallback,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { InsightItem, TopicCircle } from "@/lib/insights";
import { AddInsightPopover } from "./AddInsightPopover";
import { CircleIcon } from "./CircleIcon";
import { InsightCard, INSIGHT_DRAG_TYPE } from "./InsightCard";
import { circleBadge, circleBorderSoft, circleText, circleTint, focusRing } from "./palette";

const DIAMETER: Record<TopicCircle["size"], number> = { sm: 280, md: 380, lg: 460 };
const MIN_DIAMETER = 220;
const MAX_DIAMETER = 520;

export interface CircleLayout {
  x: number;
  y: number;
  diameter: number;
}

/* Slight horizontal offsets so stacked cards read like a loose pile (Figma frame 3). */
const PAGE_SIZE = 3;
const OFFSETS = [-12, 14, 2];

interface SharedProps {
  circle: TopicCircle;
  insights: InsightItem[];
  selectedIds: string[];
  onPick: (id: string) => void;
  addOpen: boolean;
  onAddToggle: (circleId: string | null) => void;
  onAddSave: (circleId: string, text: string) => void;
  /** refile a card dragged in from another circle */
  onMoveInsight: (insightId: string, circleId: string) => void;
}

/* A circle accepts cards dragged from any other circle: the drop refiles
   the card under this topic. */
function useCircleDropTarget(circleId: string, onMove: (id: string, circleId: string) => void) {
  const [isOver, setIsOver] = useState(false);

  const onDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    if (!e.dataTransfer.types.includes(INSIGHT_DRAG_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      const id = e.dataTransfer.getData(INSIGHT_DRAG_TYPE);
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      setIsOver(false);
      onMove(id, circleId);
    },
    [circleId, onMove]
  );

  return { isOver, dropProps: { onDragOver, onDragLeave, onDrop } };
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
  onMoveInsight,
  lavaClass,
  layout,
  boardRef,
  onLayoutChange,
  onDelete,
}: SharedProps & {
  lavaClass: string;
  layout: CircleLayout;
  boardRef: RefObject<HTMLDivElement | null>;
  onLayoutChange: (circleId: string, layout: CircleLayout) => void;
  onDelete: (circleId: string) => void;
}) {
  const d = layout.diameter || DIAMETER[circle.size];
  /* three cards fit a disc; the rest page. Newest page shows until the
     reader steps back, and the page clamps as cards come and go */
  const pageCount = Math.max(1, Math.ceil(insights.length / PAGE_SIZE));
  const [pageChoice, setPageChoice] = useState<number | null>(null);
  const page = pageChoice === null ? pageCount - 1 : Math.min(pageChoice, pageCount - 1);
  const visible = insights.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const { isOver, dropProps } = useCircleDropTarget(circle.id, onMoveInsight);
  const [manipulating, setManipulating] = useState(false);

  const beginMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button,textarea,input,select")) return;
    const board = boardRef.current;
    if (!board) return;
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY, layout };
    const boardRect = board.getBoundingClientRect();
    setManipulating(true);

    const move = (event: PointerEvent) => {
      const widthPct = (start.layout.diameter / Math.max(board.offsetWidth, 1)) * 100;
      const heightPct = (start.layout.diameter / Math.max(board.offsetHeight, 1)) * 100;
      onLayoutChange(circle.id, {
        ...start.layout,
        x: Math.max(0, Math.min(100 - widthPct, start.layout.x + ((event.clientX - start.x) / boardRect.width) * 100)),
        y: Math.max(0, Math.min(100 - heightPct, start.layout.y + ((event.clientY - start.y) / boardRect.height) * 100)),
      });
    };
    const end = () => {
      setManipulating(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
  };

  const beginResize = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const board = boardRef.current;
    if (!board) return;
    e.preventDefault();
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY, layout };
    const renderedScale = board.getBoundingClientRect().width / Math.max(board.offsetWidth, 1);
    setManipulating(true);

    const move = (event: PointerEvent) => {
      const delta = Math.max(event.clientX - start.x, event.clientY - start.y) / Math.max(renderedScale, 0.01);
      onLayoutChange(circle.id, {
        ...start.layout,
        diameter: Math.max(MIN_DIAMETER, Math.min(MAX_DIAMETER, start.layout.diameter + delta)),
      });
    };
    const end = () => {
      setManipulating(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
  };

  const resizeBy = (amount: number) =>
    onLayoutChange(circle.id, {
      ...layout,
      diameter: Math.max(MIN_DIAMETER, Math.min(MAX_DIAMETER, layout.diameter + amount)),
    });

  return (
    // z-20 lifts an open popover above the fuse circle (z-10) — the lava
    // transform creates a stacking context that would otherwise trap it
    <div
      className={`absolute touch-none ${addOpen || isOver || manipulating ? "z-20" : ""}`}
      style={{ left: `${layout.x}%`, top: `${layout.y}%` }}
    >
      <div className={manipulating ? "" : lavaClass}>
        <div
          {...dropProps}
          onPointerDown={beginMove}
          className={`group/circle relative flex cursor-move flex-col items-center rounded-full transition-shadow duration-200 motion-reduce:transition-none ${circleTint[circle.color]} ${
            isOver ? "ring-2 ring-orange ring-offset-4 ring-offset-bg" : ""
          }`}
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
            {pageCount > 1 && (
              <div
                className={`flex items-center gap-1 text-xs tabular-nums ${circleText[circle.color]}`}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setPageChoice(Math.max(0, page - 1))}
                  disabled={page === 0}
                  aria-label="Earlier insights"
                  className={`rounded-full p-1 transition-colors hover:bg-card/70 disabled:opacity-30 ${focusRing}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <span aria-live="polite">
                  {page + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPageChoice(Math.min(pageCount - 1, page + 1))}
                  disabled={page === pageCount - 1}
                  aria-label="Later insights"
                  className={`rounded-full p-1 transition-colors hover:bg-card/70 disabled:opacity-30 ${focusRing}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <AddInsightPill
            circle={circle}
            addOpen={addOpen}
            onAddToggle={onAddToggle}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          />

          {!circle.builtIn && (
            <button
              type="button"
              onClick={() => onDelete(circle.id)}
              aria-label={`Delete ${circle.name} circle`}
              title="Delete circle"
              className={`absolute right-[9%] top-[12%] flex h-8 w-8 items-center justify-center rounded-full border border-line bg-card/90 text-graphite opacity-0 shadow-sm transition-opacity hover:text-red group-hover/circle:opacity-100 focus-visible:opacity-100 ${focusRing}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onPointerDown={beginResize}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "+") {
                e.preventDefault();
                resizeBy(16);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "-") {
                e.preventDefault();
                resizeBy(-16);
              }
            }}
            aria-label={`Resize ${circle.name} circle`}
            title="Drag to resize"
            className={`absolute bottom-[7%] right-[7%] flex h-9 w-9 cursor-nwse-resize items-center justify-center rounded-full border border-line bg-card/90 text-graphite opacity-0 shadow-sm transition-opacity group-hover/circle:opacity-100 focus-visible:opacity-100 ${focusRing}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M8 16 16 8M11 17h6v-6" />
            </svg>
          </button>

          {addOpen && (
            <AddInsightPopover
              onClose={() => onAddToggle(null)}
              onSave={(text) => onAddSave(circle.id, text)}
              className={`absolute left-1/2 z-30 w-80 -translate-x-1/2 ${
                layout.y > 50 ? "bottom-[92%]" : "top-[86%]"
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
  onMoveInsight,
}: SharedProps) {
  const { isOver, dropProps } = useCircleDropTarget(circle.id, onMoveInsight);

  return (
    <section
      {...dropProps}
      className={`rounded-3xl p-4 transition-shadow duration-200 motion-reduce:transition-none ${circleTint[circle.color]} ${
        isOver ? "outline-2 outline-orange outline-offset-4" : ""
      }`}
      aria-label={circle.name}
    >
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
            draggable
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
