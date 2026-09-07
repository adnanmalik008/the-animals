"use client";

/* Twelve weekly points, 0–100, as the Search Velocity sparkline draws them.
   The chart is the point: typing a number and seeing the line move is the
   only way to author a curve that reads well on the board. */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WidgetEditorProps } from "./index";
import { sparklinePath, toPoints12, withPoint } from "./values";

const W = 264;
const H = 56;

export function Points12({ value, onChange, id, describedBy, invalid }: WidgetEditorProps) {
  const points = toPoints12(value);

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        aria-hidden
        className="rounded-lg border bg-muted"
      >
        <path d={sparklinePath(points, W, H)} fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
        {points.map((point, i) => {
          // the field's own <label for> points at the bare id, so week 1 owns it
          const inputId = i === 0 ? id : `${id}-${i}`;
          return (
          <li key={i} className="flex flex-col gap-1">
            <Label
              className="justify-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              htmlFor={inputId}
            >
              W{i + 1}
            </Label>
            <Input
              id={inputId}
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              value={String(point)}
              aria-label={`Week ${i + 1}`}
              aria-invalid={invalid || undefined}
              aria-describedby={i === 0 ? describedBy : undefined}
              onChange={(e) => onChange(withPoint(points, i, e.target.value))}
              className="px-1.5 text-center text-xs"
            />
          </li>
          );
        })}
      </ol>
    </div>
  );
}
