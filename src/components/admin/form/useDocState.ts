"use client";

/* The edited document, and the four ways a form changes it.

   The reducer is exported and pure so the interesting part — what an
   out-of-range move does, when the form counts as dirty — is testable
   without React. */

import { useCallback, useMemo, useReducer } from "react";
import { getAt, insertAt, moveAt, removeAt, setAt, type Path } from "@/lib/cms/paths";

export interface DocState {
  doc: unknown;
  /** JSON of the last saved (or loaded) document; `dirty` is a diff against it */
  baseline: string;
}

export type DocAction =
  | { type: "set"; path: Path; value: unknown }
  | { type: "insert"; path: Path; index: number; value: unknown }
  | { type: "remove"; path: Path; index: number }
  | { type: "move"; path: Path; from: number; to: number }
  /** adopt `doc` (or the current one) as the new clean baseline */
  | { type: "reset"; doc?: unknown };

const json = (value: unknown) => JSON.stringify(value) ?? "";

export function initDocState(initial: unknown): DocState {
  return { doc: initial, baseline: json(initial) };
}

export function isDirty(state: DocState): boolean {
  return json(state.doc) !== state.baseline;
}

function lengthAt(doc: unknown, path: Path): number {
  const list = getAt(doc, path);
  return Array.isArray(list) ? list.length : 0;
}

export function docReducer(state: DocState, action: DocAction): DocState {
  switch (action.type) {
    case "set":
      return { ...state, doc: setAt(state.doc, action.path, action.value) };

    /* the paths helpers splice blindly, so an index the list does not have
       would drop a row or splice `undefined` into it — refuse instead */
    case "insert": {
      const len = lengthAt(state.doc, action.path);
      if (action.index < 0 || action.index > len) return state;
      return { ...state, doc: insertAt(state.doc, action.path, action.index, action.value) };
    }
    case "remove": {
      const len = lengthAt(state.doc, action.path);
      if (action.index < 0 || action.index >= len) return state;
      return { ...state, doc: removeAt(state.doc, action.path, action.index) };
    }
    case "move": {
      const len = lengthAt(state.doc, action.path);
      const { from, to } = action;
      if (from === to || from < 0 || from >= len || to < 0 || to >= len) return state;
      return { ...state, doc: moveAt(state.doc, action.path, from, to) };
    }
    case "reset": {
      const next = "doc" in action ? action.doc : state.doc;
      return { doc: next, baseline: json(next) };
    }
  }
}

export interface DocStateApi {
  doc: unknown;
  dirty: boolean;
  set: (path: Path, value: unknown) => void;
  insert: (listPath: Path, index: number, value: unknown) => void;
  remove: (listPath: Path, index: number) => void;
  move: (listPath: Path, from: number, to: number) => void;
  /** with no argument: keep the document, call it saved */
  reset: (next?: unknown) => void;
}

export function useDocState(initial: unknown): DocStateApi {
  const [state, dispatch] = useReducer(docReducer, initial, initDocState);

  const set = useCallback((path: Path, value: unknown) => dispatch({ type: "set", path, value }), []);
  const insert = useCallback(
    (listPath: Path, index: number, value: unknown) => dispatch({ type: "insert", path: listPath, index, value }),
    []
  );
  const remove = useCallback(
    (listPath: Path, index: number) => dispatch({ type: "remove", path: listPath, index }),
    []
  );
  const move = useCallback(
    (listPath: Path, from: number, to: number) => dispatch({ type: "move", path: listPath, from, to }),
    []
  );
  /* `reset()` keeps the document and calls it saved; `reset(next)` swaps it.
     A document is never `undefined`, so the argument's absence is the signal. */
  const reset = useCallback(
    (next?: unknown) => dispatch(next === undefined ? { type: "reset" } : { type: "reset", doc: next }),
    []
  );

  const dirty = useMemo(() => isDirty(state), [state]);

  return { doc: state.doc, dirty, set, insert, remove, move, reset };
}
