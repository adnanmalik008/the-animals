"use client";

/* Twelve weekly points, 0–100, as the Search Velocity sparkline draws them.
   The chart is the point: typing a number and seeing the line move is the
   only way to author a curve that reads well on the board. */

import { input, invalidRing } from "../tokens";
import type { WidgetEditorProps } from "./index";
import { sparklinePath, toPoints12 } from "./values";

const W = 264;
const H = 56;

export function Points12({ value, onChange, id, describedBy, invalid }: WidgetEditorProps) {
  const points = toPoints12(value);

  const setPoint = (index: number, next: number) => {
    const copy = [...points];
    copy[index] = next;
    onChange(copy);
  };

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        aria-hidden
        className="rounded-xl border border-line bg-bg2"
      >
        <path d={sparklinePath(points, W, H)} fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
        {points.map((point, i) => (
          <li key={i} className="flex flex-col gap-1">
            <label className="text-center text-[10px] font-medium uppercase tracking-wide text-graphite" htmlFor={`${id}-${i}`}>
              W{i + 1}
            </label>
            <input
              id={`${id}-${i}`}
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              value={String(point)}
              aria-label={`Week ${i + 1}`}
              aria-invalid={invalid || undefined}
              aria-describedby={i === 0 ? describedBy : undefined}
              onChange={(e) => {
                const parsed = Number(e.target.value);
                setPoint(i, e.target.value === "" || Number.isNaN(parsed) ? 0 : parsed);
              }}
              className={`${input} px-1.5 py-1.5 text-center text-xs ${invalid ? invalidRing : ""}`}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
