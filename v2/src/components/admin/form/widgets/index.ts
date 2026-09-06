/* The widget registry: one editor per WidgetId, looked up by `custom` fields.

   Every editor takes the same props and narrows its own `unknown` value, so
   Field can index this map without a cast and without `any`. Adding a widget
   is: a schema and a default in lib/cms/widgets.ts, an editor here. */

import type { ComponentType } from "react";
import type { WidgetId } from "@/lib/cms/widgets";
import { Circles7 } from "./Circles7";
import { Points12 } from "./Points12";
import { Presence3 } from "./Presence3";

export interface WidgetEditorProps {
  /** whatever the document holds — each editor narrows it before rendering */
  value: unknown;
  onChange: (value: unknown) => void;
  /** id of the editor's first control, so the field's label points at it */
  id: string;
  describedBy?: string;
  invalid?: boolean;
  /** column headers, for the widgets whose columns are named by the module */
  columns?: readonly string[];
}

export const WIDGET_EDITORS: Record<WidgetId, ComponentType<WidgetEditorProps>> = {
  points12: Points12,
  presence3: Presence3,
  circles7: Circles7,
};

export { sparklinePath, toCircles7, toPoints12, toPresence3, withPoint } from "./values";
