/* The renderer's shared props.

   Kept apart from Field.tsx so ObjectField and ListField — which Field
   renders, and which render fields of their own — can type themselves
   without importing it back. Field passes itself down as `renderField`
   instead, so the recursion is a prop rather than an import cycle. */

import type { ComponentType, ReactNode } from "react";
import type { FieldErrors } from "@/lib/cms/parse";
import type { Path } from "@/lib/cms/paths";
import type { RefSources } from "@/lib/cms/refs";
import type { FieldSpec } from "@/lib/cms/spec";

/* Options for `ref` fields, keyed by `refKey(spec.source)` — the document
   and the list, since one document can hold two lists. A key with no entry
   leaves the field a plain text input, so a reference can still be typed
   before its source module has any rows. */
export type { RefOption, RefSources } from "@/lib/cms/refs";

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
