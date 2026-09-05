/* The renderer's shared props.

   Kept apart from Field.tsx so ObjectField and ListField — which Field
   renders, and which render fields of their own — can type themselves
   without importing it back. Field passes itself down as `renderField`
   instead, so the recursion is a prop rather than an import cycle. */

import type { ComponentType, ReactNode } from "react";
import type { FieldErrors } from "@/lib/cms/parse";
import type { Path } from "@/lib/cms/paths";
import type { FieldSpec } from "@/lib/cms/spec";

export interface RefOption {
  value: string;
  label: string;
}

/** Options for `ref` fields, keyed by `spec.source.doc ?? "self"`. A key with
    no entry (or an empty one) leaves the field as a plain text input, so a
    reference can still be typed before its source module exists. */
export type RefSources = Record<string, readonly RefOption[]>;

/** What the renderer needs that a FieldSpec cannot carry: values that come
    from other documents. Threaded unchanged through objects and lists. */
export interface FieldSources {
  refSources?: RefSources;
  /** column headers for widgets whose columns the module names, by path key */
  widgetColumns?: Record<string, readonly string[]>;
}

export interface FieldProps extends FieldSources {
  spec: FieldSpec;
  path: Path;
  value: unknown;
  onChange: (value: unknown) => void;
  /** dotted path → message, exactly as zod issues map (see `pathKey`) */
  errors: FieldErrors;
  /** an image field's alt-text input, rendered by the object that owns both */
  altSlot?: ReactNode;
}

/** `Field` itself, passed down so the tree can recurse without a cycle. */
export type FieldRenderer = ComponentType<FieldProps>;
