"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ============================================================
   Module framework: every board section lives in a ModuleColumn.
   - collapse/expand per module (default expanded)
   - "Collapse all" / "Expand all" control per column
   - drag-to-reorder via the 6-dot handle (HTML5 DnD)
   ============================================================ */

interface ColumnCtx {
  isOpen: (id: string) => boolean;
  /** 1-based position in the column, for the eyebrow's file number */
  positionOf: (id: string) => number;
  toggle: (id: string) => void;
  dragId: string | null;
  overId: string | null;
  onHandleDragStart: (id: string) => void;
  onDragOverItem: (id: string) => void;
  onDrop: () => void;
}

const Ctx = createContext<ColumnCtx | null>(null);

export function ModuleColumn({
  ids,
  render,
  className = "",
}: {
  ids: string[];
  render: (id: string) => ReactNode;
  className?: string;
}) {
  const [order, setOrder] = useState(ids);
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const allClosed = closed.size >= order.length;

  const toggle = useCallback((id: string) => {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setClosed(allClosed ? new Set() : new Set(order));
  }, [allClosed, order]);

  const onDrop = useCallback(() => {
    if (dragId && overId && dragId !== overId) {
      setOrder((prev) => {
        const without = prev.filter((x) => x !== dragId);
        const insertAt =
          without.indexOf(overId) + (prev.indexOf(dragId) < prev.indexOf(overId) ? 1 : 0);
        without.splice(insertAt, 0, dragId);
        return without;
      });
    }
    setDragId(null);
    setOverId(null);
  }, [dragId, overId]);

  const ctx = useMemo<ColumnCtx>(
    () => ({
      isOpen: (id) => !closed.has(id),
      positionOf: (id) => order.indexOf(id) + 1,
      toggle,
      dragId,
      overId,
      onHandleDragStart: setDragId,
      onDragOverItem: setOverId,
      onDrop,
    }),
    [closed, order, toggle, dragId, overId, onDrop]
  );

  return (
    <Ctx.Provider value={ctx}>
      <div className={className}>
        <button
          type="button"
          onClick={toggleAll}
          className="mb-1 flex items-center gap-1.5 text-xs text-graphite hover:text-ink transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            {allClosed ? (
              <path d="M7 14l5 5 5-5M7 5l5 5 5-5" />
            ) : (
              <path d="M7 10l5-5 5 5M7 19l5-5 5 5" />
            )}
          </svg>
          {allClosed ? "Expand all" : "Collapse all"}
        </button>
        {order.map(render)}
      </div>
    </Ctx.Provider>
  );
}

export function Module({
  id,
  eyebrow,
  title,
  titleClassName = "",
  headerExtra,
  children,
  variant = "plain",
}: {
  id: string;
  eyebrow?: string;
  title: string;
  titleClassName?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  variant?: "plain" | "editorial" | "panel";
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Module must be used inside ModuleColumn");
  const open = ctx.isOpen(id);
  const isDragTarget = ctx.overId === id && ctx.dragId !== null && ctx.dragId !== id;

  return (
    <section
      aria-label={title}
      onDragOver={(e) => {
        if (ctx.dragId) {
          e.preventDefault();
          ctx.onDragOverItem(id);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        ctx.onDrop();
      }}
      className={`group/module relative transition-shadow ${
        /* Competition sets each section on its own rounded slab, the way the
           design separates them; every other board keeps the ruled divider. */
        variant === "panel"
          ? "mb-10 rounded-3xl bg-ink px-5 py-6 text-white last:mb-0 sm:px-7"
          : "border-b border-line/70 py-4"
      } ${ctx.dragId === id ? "opacity-60" : ""} ${
        isDragTarget ? "shadow-[inset_0_3px_0_0_var(--orange)]" : ""
      }`}
    >
      {/* 6-dot drag handle */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          ctx.onHandleDragStart(id);
        }}
        onDragEnd={ctx.onDrop}
        title="Drag to reorder"
        aria-label={`Reorder ${title}`}
        role="button"
        className={`absolute right-2 top-4 cursor-grab rounded-md p-1.5 text-graphite/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 active:cursor-grabbing ${
          /* on a dark slab the ink hover would vanish into the panel */
          variant === "panel" ? "hover:bg-white/10 hover:text-white" : "hover:bg-ink/5 hover:text-ink"
        }`}
        tabIndex={0}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="8" cy="5" r="1.7" /><circle cx="16" cy="5" r="1.7" />
          <circle cx="8" cy="12" r="1.7" /><circle cx="16" cy="12" r="1.7" />
          <circle cx="8" cy="19" r="1.7" /><circle cx="16" cy="19" r="1.7" />
        </svg>
      </div>

      {eyebrow && (
        <p className="mb-1 flex items-center gap-3 font-serif text-sm text-graphite">
          <span className="inline-block h-px w-8 bg-graphite/50" aria-hidden />
          {/* the design numbers the column in order, so dragging a section
              renumbers the run rather than carrying a fixed id with it */}
          {eyebrow} № {String(ctx.positionOf(id)).padStart(2, "0")}
        </p>
      )}

      <div className="flex items-center gap-2 pr-8">
        <button
          type="button"
          onClick={() => ctx.toggle(id)}
          aria-expanded={open}
          className="flex min-w-0 items-center gap-2.5 text-left"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
            className={`shrink-0 text-graphite transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span
            className={
              titleClassName ||
              (variant === "editorial"
                ? "font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
                : "text-xl font-bold uppercase tracking-tight sm:text-2xl")
            }
          >
            {title}
          </span>
        </button>
        {open && headerExtra}
      </div>

      <div
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        {/* The clip is widened and given the space straight back as padding, so
            content never moves: horizontally so a row can bleed its paper to the
            panel edge, vertically so a drop target's outward ring is not shaved
            off at the boundary. The vertical pair is dropped while closed —
            collapsed, the negative margin would have nothing to cancel it. */}
        <div
          className={`min-h-0 overflow-hidden -mx-4 px-4 sm:-mx-8 sm:px-8 ${
            open ? "-my-1 py-1" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
