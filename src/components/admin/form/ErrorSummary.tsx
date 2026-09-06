"use client";

/* "3 fields need attention", and a way to get to each one.

   A long form scrolls, and a list collapses its rows, so an error message
   can easily sit somewhere nobody can see. Every field registers its element
   here by path key; the summary turns each error into a button that scrolls
   that element into view and focuses the control inside it. */

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import type { FieldErrors } from "@/lib/cms/parse";
import { describePath } from "./list-ops";
import { quietBtn } from "./tokens";

interface Anchors {
  register: (key: string, el: HTMLElement | null) => void;
  reveal: (key: string) => void;
}

const AnchorsContext = createContext<Anchors | null>(null);

const CONTROLS = "input:not([type='hidden']), textarea, select, button";

/** Wraps a form so its fields can be found by path key. Without it the
    fields still render — the summary simply cannot jump to them. */
export function FieldAnchors({ children }: { children: ReactNode }) {
  const anchors = useRef<Map<string, HTMLElement>>(new Map());

  const value = useMemo<Anchors>(
    () => ({
      register(key, el) {
        if (el) anchors.current.set(key, el);
        else anchors.current.delete(key);
      },
      reveal(key) {
        const el = anchors.current.get(key);
        if (!el) return;
        /* the field may sit inside collapsed rows; open every one of them.
           Each <details> is React-controlled and syncs back via onToggle. */
        for (let d = el.closest("details"); d; d = d.parentElement?.closest("details") ?? null) d.open = true;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // prefer a real control; the wrapper itself is only focusable as a fallback
        (el.querySelector<HTMLElement>(CONTROLS) ?? el).focus({ preventScroll: true });
      },
    }),
    []
  );

  return <AnchorsContext.Provider value={value}>{children}</AnchorsContext.Provider>;
}

/** A ref callback a field puts on its wrapper element. */
export function useFieldAnchor(key: string) {
  const anchors = useContext(AnchorsContext);
  return useCallback(
    (el: HTMLElement | null) => {
      anchors?.register(key, el);
      return () => anchors?.register(key, null);
    },
    [anchors, key]
  );
}

export function ErrorSummary({ errors, className = "" }: { errors: FieldErrors; className?: string }) {
  const anchors = useContext(AnchorsContext);
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div role="alert" className={`flex flex-col gap-2 rounded-xl border border-red/40 bg-red/5 p-4 ${className}`}>
      <p className="text-sm font-semibold text-red">
        {entries.length === 1 ? "1 field needs attention" : `${entries.length} fields need attention`}
      </p>
      <ul className="flex flex-col gap-1">
        {entries.map(([key, message]) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => anchors?.reveal(key)}
              className={`${quietBtn} w-full !rounded-lg text-left`}
            >
              <span className="font-semibold text-ink">{describePath(key)}</span>
              <span className="text-graphite"> — {message}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
