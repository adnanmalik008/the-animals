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
      toggle,
      dragId,
      overId,
      onHandleDragStart: setDragId,
      onDragOverItem: setOverId,
      onDrop,
    }),
    [closed, toggle, dragId, overId, onDrop]
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
  variant?: "plain" | "editorial";
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
      className={`group/module relative border-b border-line/70 py-4 transition-shadow ${
        ctx.dragId === id ? "opacity-60" : ""
      } ${isDragTarget ? "shadow-[inset_0_3px_0_0_var(--orange)]" : ""}`}
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
        className="absolute right-2 top-4 cursor-grab p-1 text-silver opacity-40 transition-opacity hover:text-graphite group-hover/module:opacity-100 active:cursor-grabbing"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="8" cy="5" r="1.7" /><circle cx="16" cy="5" r="1.7" />
          <circle cx="8" cy="12" r="1.7" /><circle cx="16" cy="12" r="1.7" />
          <circle cx="8" cy="19" r="1.7" /><circle cx="16" cy="19" r="1.7" />
        </svg>
      </div>

      {eyebrow && (
        <p className="mb-1 flex items-center gap-3 font-serif text-sm text-graphite">
          <span className="inline-block h-px w-8 bg-graphite/50" aria-hidden />
          {eyebrow}
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
            className={`shrink-0 text-graphite transition-transform ${open ? "" : "-rotate-90"}`}
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
        {headerExtra}
      </div>

      <div
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </section>
  );
}
