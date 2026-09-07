"use client";

/* Three tick boxes, one per competitor column in Media Overlap. The column
   names live in the module's own doc, not in the widget's value, so the form
   passes them in; without them the widget still works, numbered. */

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { WidgetEditorProps } from "./index";
import { toPresence3 } from "./values";

const FALLBACK = ["Column 1", "Column 2", "Column 3"] as const;

export function Presence3({ value, onChange, id, describedBy, invalid, columns }: WidgetEditorProps) {
  const flags = toPresence3(value);
  const headers = columns && columns.length === 3 ? columns : FALLBACK;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        {flags.map((on, i) => (
          <Label
            key={i}
            htmlFor={i === 0 ? id : `${id}-${i}`}
            className="flex min-w-32 flex-1 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium"
          >
            <Checkbox
              id={i === 0 ? id : `${id}-${i}`}
              checked={on}
              aria-invalid={invalid || undefined}
              aria-describedby={i === 0 ? describedBy : undefined}
              onCheckedChange={(checked) => {
                const next = [...flags];
                next[i] = checked === true;
                onChange(next);
              }}
            />
            <span className="truncate">{headers[i]}</span>
          </Label>
        ))}
      </div>
      {!columns && (
        <p className="text-xs text-muted-foreground">
          Column names come from the module once it is wired.
        </p>
      )}
    </div>
  );
}
