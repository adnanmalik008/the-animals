"use client";

/* The left rail on a module form page, and the guard that stops a half-typed
   edit walking out of the door.

   The App Router fires no route-change event, so there is nothing to hook: a
   <Link> click is a click and then the page is gone. The guard is therefore
   two halves. `beforeunload` covers leaving the site — reload, close, an
   address typed over the top. Every in-app link a form page renders asks
   first, through `useLeaveGuard`, and cancels its own navigation when the
   answer is no.

   That leaves the browser's own Back button, which cannot be cancelled from a
   page without rewriting history behind the user. It is not covered, and
   pretending otherwise would be worse than saying so. */

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { quietBtn } from "@/components/admin/form/tokens";
import { CONTENT_HREF, moduleHref, type ModuleGroup } from "@/components/admin/module-groups";

interface DirtyApi {
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
}

const DirtyContext = createContext<DirtyApi | null>(null);

const LEAVE = "You have unsaved changes on this module. Leave without saving?";

/** Wraps the form page. Without it the form still works — it simply stops
    asking before it throws an edit away. */
export function DirtyGuard({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const ask = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // older browsers still key off returnValue; the string itself is ignored
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", ask);
    return () => window.removeEventListener("beforeunload", ask);
  }, [dirty]);

  const value = useMemo<DirtyApi>(() => ({ dirty, setDirty }), [dirty]);
  return <DirtyContext.Provider value={value}>{children}</DirtyContext.Provider>;
}

/** The form publishes its own dirty flag up to the guard. */
export function usePublishDirty(dirty: boolean) {
  const setDirty = useContext(DirtyContext)?.setDirty;
  useEffect(() => {
    setDirty?.(dirty);
    /* leaving by a route the guard cannot see should not leave the flag set
       for whatever renders next */
    return () => setDirty?.(false);
  }, [setDirty, dirty]);
}

/** An onClick for any in-app link that would abandon unsaved edits. */
export function useLeaveGuard() {
  const dirty = useContext(DirtyContext)?.dirty ?? false;
  return useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (!dirty) return;
      if (!window.confirm(LEAVE)) e.preventDefault();
    },
    [dirty]
  );
}

export function ContentNav({ currentKey, groups }: { currentKey: string; groups: ModuleGroup[] }) {
  const dirty = useContext(DirtyContext)?.dirty ?? false;
  const guard = useLeaveGuard();

  return (
    <nav aria-label="Modules" className="w-full shrink-0 lg:sticky lg:top-6 lg:w-56">
      <Link href={CONTENT_HREF} onClick={guard} className={`${quietBtn} inline-block`}>
        ← All content
      </Link>

      <div className="mt-4 flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <h2 className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite">
              {group.title}
            </h2>
            <ul className="flex flex-col">
              {group.entries.map((entry) => {
                const current = entry.key === currentKey;
                return (
                  <li key={entry.key}>
                    <Link
                      href={moduleHref(entry.key)}
                      onClick={guard}
                      aria-current={current ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 ${
                        current ? "bg-orange/10 font-semibold text-orange" : "text-graphite hover:bg-bg2 hover:text-ink"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                      {current && dirty && (
                        <span
                          aria-label="unsaved changes"
                          title="Unsaved changes"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
