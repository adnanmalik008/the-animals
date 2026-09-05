/* Immutable path helpers shared by the form state and error mapping. */

export type Path = readonly (string | number)[];

/** "rows.2.name" — the same key zod issues map to. */
export function pathKey(path: Path): string {
  return path.map(String).join(".");
}

export function getAt(doc: unknown, path: Path): unknown {
  let cur: unknown = doc;
  for (const p of path) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string | number, unknown>)[p];
  }
  return cur;
}

/** Returns a copy with `value` at `path`; untouched branches keep their identity. */
export function setAt<T>(doc: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const container = (doc ?? (typeof head === "number" ? [] : {})) as Record<string | number, unknown>;
  const copy = (Array.isArray(container) ? [...container] : { ...container }) as Record<string | number, unknown>;
  copy[head] = setAt(container[head], rest, value);
  return copy as T;
}

function listAt(doc: unknown, listPath: Path): unknown[] {
  const list = getAt(doc, listPath);
  return Array.isArray(list) ? [...list] : [];
}

export function insertAt<T>(doc: T, listPath: Path, index: number, value: unknown): T {
  const next = listAt(doc, listPath);
  next.splice(index, 0, value);
  return setAt(doc, listPath, next);
}

export function removeAt<T>(doc: T, listPath: Path, index: number): T {
  const next = listAt(doc, listPath);
  next.splice(index, 1);
  return setAt(doc, listPath, next);
}

export function moveAt<T>(doc: T, listPath: Path, from: number, to: number): T {
  const next = listAt(doc, listPath);
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return setAt(doc, listPath, next);
}
