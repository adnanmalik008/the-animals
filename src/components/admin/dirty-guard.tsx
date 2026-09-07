"use client";

/* The guard that stops a half-typed edit walking out of the door.

   The App Router fires no route-change event, so there is nothing to hook: a
   <Link> click is a click and then the page is gone. The guard is therefore
   two halves. `beforeunload` covers leaving the site — reload, close, an
   address typed over the top. Every in-app link rendered while a form is open
   asks first, through `useLeaveGuard`, and cancels its own navigation when the
   answer is no.

   That leaves the browser's own Back button, which cannot be cancelled from a
   page without rewriting history behind the user. It is not covered, and
   pretending otherwise would be worse than saying so.

   It wraps the whole admin, not one page: the module list is in the sidebar,
   so the links that can throw an edit away are rendered by the shell. */

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

interface DirtyApi {
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
}

const DirtyContext = createContext<DirtyApi | null>(null);

const LEAVE = "You have unsaved changes on this module. Leave without saving?";

/** Wraps the admin. Without it a form still works — it simply stops asking
    before it throws an edit away. */
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

/** Whether anything on screen is holding unsaved edits. */
export function useDirty(): boolean {
  return useContext(DirtyContext)?.dirty ?? false;
}

/** An onClick for any in-app link that would abandon unsaved edits. */
export function useLeaveGuard() {
  const dirty = useDirty();
  return useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (!dirty) return;
      if (!window.confirm(LEAVE)) e.preventDefault();
    },
    [dirty]
  );
}
