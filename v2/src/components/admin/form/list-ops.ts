/* Every decision ListField and ObjectField make, as pure functions.

   The components below are deliberately thin: a row's blank value, whether
   Add is allowed, which ids a duplicate gets and what a collapsed row is
   called are all decided here, so they can be tested without a DOM. */

import { defaultFor } from "@/lib/cms/parse";
import type { FieldErrors } from "@/lib/cms/parse";
import { newId } from "@/lib/cms/ids";
import { pathKey, type Path } from "@/lib/cms/paths";
import type { FieldSpec, ListSpec, ObjectSpec } from "@/lib/cms/spec";

/** Mints an id for one `id` field, given the prefix its list declares. */
export type Minter = (prefix: string) => string;

function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

/** The prefix generated ids take when the spec names none: the field the
    object sits in, so an `incoming` object gets `incoming-3f9a1c2b`. */
export function prefixFromPath(path: Path, fallback = "row"): string {
  const last = path[path.length - 1];
  return typeof last === "string" && last.length > 0 ? last : fallback;
}

/** The blank value "Add row" appends. */
export function newRow(spec: ListSpec, mint: Minter = newId): unknown {
  const prefix = spec.idPrefix ?? "row";
  return defaultFor(spec.item, () => mint(prefix));
}

/** The object an optional fieldset is switched on to. `defaultFor` returns
    `undefined` for an optional object — that is the point of it — so the
    "Add" toggle needs the shape underneath. */
export function blankObject(spec: ObjectSpec, makeId: () => string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(spec.fields)) {
    const value = defaultFor(field, makeId);
    if (value !== undefined) out[name] = value;
  }
  return out;
}

/** A deep copy with a new id at every `id` field in the subtree. Ids are what
    a Live-board sticker keys on, so a duplicated row must never carry the
    original's — at any depth. Values the spec does not describe are copied
    through untouched. */
export function withFreshIds(spec: FieldSpec, value: unknown, makeId: () => string): unknown {
  switch (spec.kind) {
    case "text":
    case "textarea":
    case "number":
    case "boolean":
    case "select":
    case "url":
    case "image":
    case "color":
    case "ref":
      return value;
    case "id":
      return makeId();
    case "custom":
      // widget values are arrays/objects; the copy must not alias the original
      return value === undefined ? value : structuredClone(value);
    case "object": {
      if (value === null || typeof value !== "object" || Array.isArray(value)) return value;
      const src = value as Record<string, unknown>;
      const out: Record<string, unknown> = structuredClone(src);
      for (const [name, field] of Object.entries(spec.fields)) {
        // an id the saved row is missing is still minted — it is required
        if (field.kind === "id" || name in src) out[name] = withFreshIds(field, src[name], makeId);
      }
      return out;
    }
    case "list":
      return Array.isArray(value) ? value.map((row) => withFreshIds(spec.item, row, makeId)) : value;
  }
}

export interface ListBounds {
  canAdd: boolean;
  /** why Add is off, shown as a hint next to it */
  addReason?: string;
  canRemove: boolean;
  removeReason?: string;
}

/** Whether Add and Delete are offered at this length, and why not. Mirrors
    the `exactly`/`min`/`max` messages the zod schema would produce, so the
    button's reason and the save error say the same thing. */
export function listBounds(spec: ListSpec, length: number): ListBounds {
  if (spec.exactly !== undefined) {
    const reason = `Exactly ${count(spec.exactly, "item")}`;
    return { canAdd: false, addReason: reason, canRemove: false, removeReason: reason };
  }

  const bounds: ListBounds = { canAdd: true, canRemove: length > 0 };
  if (spec.max !== undefined && length >= spec.max) {
    bounds.canAdd = false;
    bounds.addReason = `At most ${count(spec.max, "item")}`;
  }
  if (spec.min !== undefined && length <= spec.min) {
    bounds.canRemove = false;
    bounds.removeReason = `At least ${count(spec.min, "item")}`;
  }
  return bounds;
}

/** The title on a collapsed row. */
export function rowSummary(spec: ListSpec, row: unknown, index: number): string {
  const fallback = `Item ${index + 1}`;
  if (!spec.summary || row === null || typeof row !== "object") return fallback;
  const value = (row as Record<string, unknown>)[spec.summary];
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

/* ---------------- errors, by position ---------------- */

/** Every error key at `path` or inside it. A collapsed row uses this to say
    that something under it is wrong; without it a validation message can
    point at a field the editor cannot see. */
export function errorsUnder(errors: FieldErrors, path: Path): string[] {
  const prefix = pathKey(path);
  if (prefix === "") return Object.keys(errors);
  return Object.keys(errors).filter((key) => key === prefix || key.startsWith(`${prefix}.`));
}

/** A path key as a person reads it: "items.2.headline" → "Items › 3 › Headline".
    The error summary has only the key to work with, and a raw one names
    fields the way the code does, not the way the form labels them. */
export function describePath(key: string): string {
  if (key === "") return "Document";
  return key
    .split(".")
    .map((part) => {
      if (/^\d+$/.test(part)) return String(Number(part) + 1);
      const spaced = part.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
      return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
    })
    .join(" › ");
}

/* ---------------- which rows stay open ----------------
   Expanded rows are tracked by index, so every list operation has to move
   them with the rows. Without this, deleting row 0 leaves row 1's body on
   screen under row 0's header. */

/** After inserting at `index`: rows at or after it shift up one. */
export function afterInsert(open: readonly number[], index: number): number[] {
  return open.map((i) => (i >= index ? i + 1 : i));
}

/** After removing `index`: it closes, and the rows after it shift down one. */
export function afterRemove(open: readonly number[], index: number): number[] {
  return open.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i));
}

/** After moving `from` → `to`: the moved row follows, the rows it passed shift. */
export function afterMove(open: readonly number[], from: number, to: number): number[] {
  return open.map((i) => {
    if (i === from) return to;
    if (from < i && i <= to) return i - 1;
    if (to <= i && i < from) return i + 1;
    return i;
  });
}
