/* ============================================================
   Declarative module definitions.

   One FieldSpec tree per module key is the single source of truth: it
   yields the zod schema (schema.ts), the admin form (Field renderer), the
   TypeScript doc type (Infer) and blank rows (parse.ts). This file has no
   runtime dependencies, so the board can import its types freely.
   ============================================================ */

import type { WidgetId, WidgetValue } from "./widgets";

export interface SelectOption<V extends string = string> {
  readonly value: V;
  readonly label: string;
}

export interface TextSpec {
  kind: "text";
  label: string;
  help?: string;
  maxLength?: number;
  pattern?: RegExp;
  patternHint?: string;
  optional?: true;
  default?: string;
}
/** Multi-line text; a blank line separates paragraphs. */
export interface TextareaSpec {
  kind: "textarea";
  label: string;
  help?: string;
  rows?: number;
  maxLength?: number;
  optional?: true;
  default?: string;
}
export interface NumberSpec {
  kind: "number";
  label: string;
  help?: string;
  min?: number;
  max?: number;
  integer?: true;
  /** input step; defaults to "any" unless `integer` */
  step?: number | "any";
  optional?: true;
  default?: number;
}
export interface BooleanSpec {
  kind: "boolean";
  label: string;
  help?: string;
  default?: boolean;
}
export interface SelectSpec<V extends string = string> {
  kind: "select";
  label: string;
  help?: string;
  options: readonly SelectOption<V>[];
  default?: V;
}
/** Absolute http(s) URL. */
export interface UrlSpec {
  kind: "url";
  label: string;
  help?: string;
  optional?: true;
}
/** Image reference: an https URL (uploaded or pasted) or a site `/assets/` path. */
export interface ImageSpec {
  kind: "image";
  label: string;
  help?: string;
  optional?: true;
  /** e.g. "16/9" — the crop the board applies, shown in the picker preview */
  aspect?: string;
  /** name of the sibling field that holds the alt text */
  alt?: string;
}
/** #rrggbb */
export interface ColorSpec {
  kind: "color";
  label: string;
  help?: string;
  optional?: true;
  default?: string;
}
/** Generated once when a row is added; never shown, never edited. Sticker keys depend on it. */
export interface IdSpec {
  kind: "id";
}
/** The id of a row in another list (same doc, or another module's doc). Free string in the schema; a select in the form. */
export interface RefSpec {
  kind: "ref";
  label: string;
  help?: string;
  source: { doc?: string; list: string; labelField: string };
}
export interface ObjectSpec<F extends Fields = Fields> {
  kind: "object";
  label?: string;
  help?: string;
  collapsible?: true;
  optional?: true;
  fields: F;
}
export interface ListSpec<I extends FieldSpec = FieldSpec> {
  kind: "list";
  label: string;
  help?: string;
  item: I;
  min?: number;
  max?: number;
  exactly?: number;
  /** field name inside an object item that titles a collapsed row */
  summary?: string;
  /** prefix for generated row ids */
  idPrefix?: string;
}
/** A value the generic renderer cannot express; widgets.ts owns its schema and editor. */
export interface CustomSpec<W extends WidgetId = WidgetId> {
  kind: "custom";
  label: string;
  help?: string;
  widget: W;
}

export type FieldSpec =
  | TextSpec
  | TextareaSpec
  | NumberSpec
  | BooleanSpec
  | SelectSpec
  | UrlSpec
  | ImageSpec
  | ColorSpec
  | IdSpec
  | RefSpec
  | ObjectSpec
  | ListSpec
  | CustomSpec;

export type Fields = Record<string, FieldSpec>;

/* ---------------- builders ----------------
   `const` type parameters keep every literal (kind, optional: true, option
   values) so Infer<> can read them back. */

type Without<S, K extends keyof S> = Omit<S, K>;

export const f = {
  text: <const S extends Without<TextSpec, "kind">>(s: S) => ({ kind: "text", ...s }) as { kind: "text" } & S,
  textarea: <const S extends Without<TextareaSpec, "kind">>(s: S) =>
    ({ kind: "textarea", ...s }) as { kind: "textarea" } & S,
  number: <const S extends Without<NumberSpec, "kind">>(s: S) => ({ kind: "number", ...s }) as { kind: "number" } & S,
  boolean: <const S extends Without<BooleanSpec, "kind">>(s: S) =>
    ({ kind: "boolean", ...s }) as { kind: "boolean" } & S,
  select: <const S extends Without<SelectSpec, "kind">>(s: S) => ({ kind: "select", ...s }) as { kind: "select" } & S,
  url: <const S extends Without<UrlSpec, "kind">>(s: S) => ({ kind: "url", ...s }) as { kind: "url" } & S,
  image: <const S extends Without<ImageSpec, "kind">>(s: S) => ({ kind: "image", ...s }) as { kind: "image" } & S,
  color: <const S extends Without<ColorSpec, "kind">>(s: S) => ({ kind: "color", ...s }) as { kind: "color" } & S,
  id: () => ({ kind: "id" }) as IdSpec,
  ref: <const S extends Without<RefSpec, "kind">>(s: S) => ({ kind: "ref", ...s }) as { kind: "ref" } & S,
  object: <const S extends Without<ObjectSpec, "kind">>(s: S) => ({ kind: "object", ...s }) as { kind: "object" } & S,
  list: <const S extends Without<ListSpec, "kind">>(s: S) => ({ kind: "list", ...s }) as { kind: "list" } & S,
  custom: <const S extends Without<CustomSpec, "kind">>(s: S) => ({ kind: "custom", ...s }) as { kind: "custom" } & S,
};

/* ---------------- inferred doc types ---------------- */

type Simplify<T> = { [K in keyof T]: T[K] } & {};
type IsOptional<S> = S extends { optional: true } ? true : false;

/** Object type for a field map: optional specs become optional keys. */
export type ObjectOf<F extends Fields> = Simplify<
  { -readonly [K in keyof F as IsOptional<F[K]> extends true ? never : K]: Infer<F[K]> } & {
    -readonly [K in keyof F as IsOptional<F[K]> extends true ? K : never]?: Infer<F[K]>;
  }
>;

export type Infer<S> = S extends { kind: "select"; options: readonly { value: infer V extends string }[] }
  ? V
  : S extends { kind: "text" | "textarea" | "url" | "image" | "color" | "id" | "ref" }
    ? string
    : S extends { kind: "number" }
      ? number
      : S extends { kind: "boolean" }
        ? boolean
        : S extends { kind: "object"; fields: infer F extends Fields }
          ? ObjectOf<F>
          : S extends { kind: "list"; item: infer I }
            ? Infer<I>[]
            : S extends { kind: "custom"; widget: infer W extends WidgetId }
              ? WidgetValue<W>
              : never;

/* ---------------- module definition ---------------- */

export type ModuleTab = "header" | "live" | "competition" | "wild" | "anomalies";

export interface ModuleDefinition<K extends string = string, F extends Fields = Fields> {
  /** module_data.module_key */
  key: K;
  tab: ModuleTab;
  /** Live tab only */
  column?: "editorial" | "data";
  /** position within the tab's admin list */
  order: number;
  /** admin label, e.g. "Sources of Traffic" */
  label: string;
  /** rendered read-only above the form — fixed in code per the client */
  heading: { eyebrow?: string; title: string };
  /** board path the "Open board" link points at */
  boardPath: string;
  intro?: string;
  fields: F;
  /** the built-in content, used when a board has no (valid) doc */
  fixture: () => ObjectOf<F>;
  /** legacy shape → current, shape-detected, applied before validation */
  migrate?: (raw: unknown) => unknown;
}

export function defineModule<const K extends string, const F extends Fields>(
  def: ModuleDefinition<K, F>
): ModuleDefinition<K, F> {
  return def;
}

export type DocOf<D> = D extends ModuleDefinition<string, infer F> ? ObjectOf<F> : never;
