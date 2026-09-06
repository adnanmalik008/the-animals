/* Options for `ref` fields.

   A `ref` holds the id of a row in another list — the same document's, or
   another module's. The schema keeps it a plain string, because the target
   may not exist yet; the form turns it into a select whenever the rows can
   be found. This file is what finds them.

   Pure and zod-free, so the server page can build the options and hand
   them to the client form as plain data. */

import type { Fields, FieldSpec, RefSpec } from "./spec";

export interface RefOption {
  value: string;
  label: string;
}

export type RefSources = Record<string, readonly RefOption[]>;

/** Where a `ref` looks for its rows. */
export type RefSource = RefSpec["source"];

/** The key a source's options are filed under.

    Composite on purpose: one document can hold two lists, and keying by
    the document alone would hand a field the other list's rows. */
/* `labelField` is accepted but unused, so a whole source can be passed. */
export function refKey(source: { doc?: string; list: string; labelField?: string }): string {
  return `${source.doc ?? "self"}:${source.list}`;
}

/** Every distinct source referenced anywhere in a field tree. */
export function collectRefSources(fields: Fields): RefSource[] {
  const found = new Map<string, RefSource>();

  const walk = (spec: FieldSpec) => {
    switch (spec.kind) {
      case "ref":
        found.set(refKey(spec.source), spec.source);
        return;
      case "object":
        for (const field of Object.values(spec.fields)) walk(field);
        return;
      case "list":
        walk(spec.item);
        return;
      default:
        return;
    }
  };

  for (const field of Object.values(fields)) walk(field);
  return [...found.values()];
}

const isRow = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The rows of a named list inside a document, or none. */
function rowsOf(doc: unknown, list: string): Record<string, unknown>[] {
  if (!isRow(doc)) return [];
  const value = doc[list];
  return Array.isArray(value) ? value.filter(isRow) : [];
}

/** Turn one source's rows into options.

    A row with no usable id is skipped rather than offered: an option that
    cannot be stored is worse than a shorter list. A row whose label field
    is empty falls back to its id, so it is still selectable. */
export function optionsFor(doc: unknown, source: RefSource): RefOption[] {
  const options: RefOption[] = [];
  for (const row of rowsOf(doc, source.list)) {
    const id = row.id;
    if (typeof id !== "string" || id.length === 0) continue;
    const label = row[source.labelField];
    options.push({ value: id, label: typeof label === "string" && label.length > 0 ? label : id });
  }
  return options;
}

/** Every source in a field tree, resolved against the documents to hand.

    `docs` is keyed by module; `selfDoc` is the document being edited, which
    is not in `docs` while it is unsaved. A source pointing at a module with
    nothing to offer is left out entirely, which is what makes the field
    fall back to a typed id. */
export function buildRefSources(fields: Fields, docs: Record<string, unknown>, selfDoc: unknown): RefSources {
  const sources: Record<string, readonly RefOption[]> = {};
  for (const source of collectRefSources(fields)) {
    const doc = source.doc === undefined ? selfDoc : docs[source.doc];
    const options = optionsFor(doc, source);
    if (options.length > 0) sources[refKey(source)] = options;
  }
  return sources;
}

/* ---------------- widget columns ----------------

   A widget with columns (presence3 is the only one today) names them the
   same way a `ref` names its options: by pointing at a list in a document.
   The admin resolves them and passes them down by path, because the widget
   sits at one place in the tree and its neighbours may want different
   columns. */

import { pathKey, type Path } from "./paths";

export type WidgetColumns = Record<string, readonly string[]>;

export function buildWidgetColumns(
  fields: Fields,
  docs: Record<string, unknown>,
  selfDoc: unknown
): WidgetColumns {
  const columns: Record<string, readonly string[]> = {};

  const walk = (spec: FieldSpec, path: Path) => {
    switch (spec.kind) {
      case "custom": {
        if (!spec.columns) return;
        const doc = spec.columns.doc === undefined ? selfDoc : docs[spec.columns.doc];
        const labels = optionsFor(doc, spec.columns).map((option) => option.label);
        if (labels.length > 0) columns[pathKey(path)] = labels;
        return;
      }
      case "object":
        for (const [name, field] of Object.entries(spec.fields)) walk(field, [...path, name]);
        return;
      case "list":
        /* Every row renders the same widget at a different index, so the
           columns are filed under each row's own path. A list long enough
           to matter is still only a handful of rows. */
        if (Array.isArray(readAt(selfDoc, path))) {
          const rows = readAt(selfDoc, path) as unknown[];
          rows.forEach((_row, index) => walk(spec.item, [...path, index]));
        }
        return;
      default:
        return;
    }
  };

  for (const [name, field] of Object.entries(fields)) walk(field, [name]);
  return columns;
}

/** The value at a path inside a document, or undefined. */
function readAt(doc: unknown, path: Path): unknown {
  let current: unknown = doc;
  for (const step of path) {
    if (Array.isArray(current) && typeof step === "number") current = current[step];
    else if (isRow(current) && typeof step === "string") current = current[step];
    else return undefined;
  }
  return current;
}
