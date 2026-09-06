"use client";

/* Three tick boxes, one per competitor column in Media Overlap. The column
   names live in the module's own doc, not in the widget's value, so the form
   passes them in; without them the widget still works, numbered. */

import { hint } from "../tokens";
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
          <label
            key={i}
            className="flex flex-1 min-w-32 items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm font-medium"
          >
            <input
              id={i === 0 ? id : `${id}-${i}`}
              type="checkbox"
              checked={on}
              aria-invalid={invalid || undefined}
              aria-describedby={i === 0 ? describedBy : undefined}
              onChange={(e) => {
                const next = [...flags];
                next[i] = e.target.checked;
                onChange(next);
              }}
              className="h-4 w-4 shrink-0 accent-[var(--orange)]"
            />
            <span className="truncate">{headers[i]}</span>
          </label>
        ))}
      </div>
      {!columns && <p className={hint}>Column names come from the module once it is wired.</p>}
    </div>
  );
}
