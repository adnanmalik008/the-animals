/* Validate a raw doc against a module definition; build blank values. */

import type { z } from "zod";
import type { DocOf, FieldSpec, Fields, ModuleDefinition } from "./spec";
import { schemaFor } from "./schema";
import { WIDGET_DEFAULTS } from "./widgets";

/** dotted field path ("items.2.headline") → first message for that path */
export type FieldErrors = Record<string, string>;

export type ParseResult<T> = { ok: true; doc: T } | { ok: false; error: string; fieldErrors: FieldErrors };

export function issuesToFieldErrors(issues: readonly z.core.$ZodIssue[]): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Runs `def.migrate` (legacy shape → current) then the schema. */
export function parseDoc<D extends ModuleDefinition<string, Fields>>(def: D, raw: unknown): ParseResult<DocOf<D>> {
  const input = def.migrate ? def.migrate(raw) : raw;
  const res = schemaFor(def).safeParse(input);
  if (res.success) return { ok: true, doc: res.data };
  const fieldErrors = issuesToFieldErrors(res.error.issues);
  const n = Object.keys(fieldErrors).length;
  return {
    ok: false,
    error: n === 1 ? "1 field needs attention" : `${n} fields need attention`,
    fieldErrors,
  };
}

/** A blank value for a spec: defaults where declared, "" / 0 / false otherwise,
    empty lists (or `exactly` blank rows), optional objects omitted. `makeId`
    supplies ids for `id` fields. */
export function defaultFor(spec: FieldSpec, makeId: () => string = () => ""): unknown {
  switch (spec.kind) {
    case "text":
    case "textarea":
      return spec.default ?? "";
    case "number":
      return spec.default ?? spec.min ?? 0;
    case "boolean":
      return spec.default ?? false;
    case "select":
      return spec.default ?? spec.options[0]?.value ?? "";
    case "url":
    case "image":
    case "ref":
      return "";
    case "color":
      return spec.default ?? "";
    case "id":
      return makeId();
    case "object": {
      if (spec.optional) return undefined;
      const out: Record<string, unknown> = {};
      for (const [name, field] of Object.entries(spec.fields)) {
        const v = defaultFor(field, makeId);
        if (v !== undefined) out[name] = v;
      }
      return out;
    }
    case "list":
      return spec.exactly ? Array.from({ length: spec.exactly }, () => defaultFor(spec.item, makeId)) : [];
    case "custom":
      return WIDGET_DEFAULTS[spec.widget]();
  }
}
