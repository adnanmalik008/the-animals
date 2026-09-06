/* FieldSpec → zod. Server and admin only; the board never imports this. */

import { z } from "zod";
import type { DocOf, FieldSpec, Fields, ModuleDefinition } from "./spec";
import { WIDGET_SCHEMAS } from "./widgets";

const URL_RE = /^https?:\/\/\S+$/;
const IMAGE_RE = /^(https?:\/\/\S+|\/assets\/\S+)$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const MSG = {
  required: "Required",
  url: "Must start with http:// or https://",
  image: "Upload an image, or paste an https:// URL or a /assets/ path",
  color: "Use a hex colour like #FF4500",
};

/** A cleared form input arrives as "" — for optional and defaulted fields that means "absent". */
const blankToUndefined = (v: unknown) => (v === "" ? undefined : v);

function stringField(
  base: z.ZodString,
  opts: { optional?: true; default?: string }
): z.ZodType {
  if (opts.optional) return z.preprocess(blankToUndefined, base.optional());
  if (opts.default !== undefined) return z.preprocess(blankToUndefined, base.min(1, MSG.required).default(opts.default));
  return base.min(1, MSG.required);
}

function count(n: number, noun: string) {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

export function fieldSchema(spec: FieldSpec): z.ZodType {
  switch (spec.kind) {
    case "text": {
      let s = z.string().trim();
      if (spec.maxLength) s = s.max(spec.maxLength, `At most ${count(spec.maxLength, "character")}`);
      if (spec.pattern) s = s.regex(spec.pattern, spec.patternHint ?? "Invalid format");
      return stringField(s, spec);
    }
    case "textarea": {
      let s = z.string().trim();
      if (spec.maxLength) s = s.max(spec.maxLength, `At most ${count(spec.maxLength, "character")}`);
      if (spec.pattern) s = s.regex(spec.pattern, spec.patternHint ?? "Invalid format");
      return stringField(s, spec);
    }
    case "number": {
      let s = z.number();
      if (spec.integer) s = s.int("Whole numbers only");
      if (spec.min !== undefined) s = s.min(spec.min, `At least ${spec.min}`);
      if (spec.max !== undefined) s = s.max(spec.max, `At most ${spec.max}`);
      if (spec.optional) return s.optional();
      if (spec.default !== undefined) return s.default(spec.default);
      return s;
    }
    case "boolean":
      return z.boolean().default(spec.default ?? false);
    case "select": {
      const values = spec.options.map((o) => o.value);
      const e = z.enum(values as [string, ...string[]]);
      return spec.default !== undefined ? e.default(spec.default) : e;
    }
    case "url":
      return stringField(z.string().trim().max(500).regex(URL_RE, MSG.url), spec);
    case "image":
      return stringField(z.string().trim().max(500).regex(IMAGE_RE, MSG.image), spec);
    case "color":
      return stringField(z.string().trim().regex(COLOR_RE, MSG.color), spec);
    case "id":
      return z.string().min(1);
    case "ref":
      return z.string().min(1, MSG.required);
    case "object": {
      const o = objectSchema(spec.fields);
      return spec.optional ? o.optional() : o;
    }
    case "list": {
      let a = z.array(fieldSchema(spec.item));
      if (spec.exactly !== undefined) a = a.length(spec.exactly, `Exactly ${count(spec.exactly, "item")}`);
      if (spec.min !== undefined) a = a.min(spec.min, `At least ${count(spec.min, "item")}`);
      if (spec.max !== undefined) a = a.max(spec.max, `At most ${count(spec.max, "item")}`);
      const hasId = spec.item.kind === "object" && "id" in spec.item.fields;
      if (!hasId) return a;
      return a.superRefine((rows, ctx) => {
        const seen = new Set<string>();
        rows.forEach((row, i) => {
          const id = (row as { id?: unknown }).id;
          if (typeof id !== "string") return;
          if (seen.has(id)) ctx.addIssue({ code: "custom", message: "Duplicate id", path: [i, "id"] });
          seen.add(id);
        });
      });
    }
    case "custom":
      return WIDGET_SCHEMAS[spec.widget];
  }
}

function objectSchema(fields: Fields) {
  const shape: Record<string, z.ZodType> = {};
  for (const [name, spec] of Object.entries(fields)) shape[name] = fieldSchema(spec);
  // zod 4 strips unknown keys by default, so dead fields vanish on the next save
  return z.object(shape);
}

const cache = new WeakMap<ModuleDefinition<string, Fields>, z.ZodType>();

/** The validated doc shape for a module; memoised per definition. */
export function schemaFor<D extends ModuleDefinition<string, Fields>>(def: D): z.ZodType<DocOf<D>, unknown> {
  let s = cache.get(def);
  if (!s) {
    s = objectSchema(def.fields);
    cache.set(def, s);
  }
  return s as z.ZodType<DocOf<D>, unknown>;
}
