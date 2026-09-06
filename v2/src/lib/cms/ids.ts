/** Short stable row id, e.g. "nw-3f9a1c2b". Generated once when a row is
    added and never changed — sticker tags on the Live board key on it. */
export function newId(prefix: string): string {
  return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
}
