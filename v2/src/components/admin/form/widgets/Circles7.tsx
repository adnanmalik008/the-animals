"use client";

/* The seven Anomalies circles. The set is fixed — a circle's id is what a
   sticker files against, so rows cannot be added, removed, reordered, and
   the ids are never shown. Only the four things about a circle that are
   presentation are editable. */

import { CIRCLE_COLORS, CIRCLE_ICONS, CIRCLE_IDS, CIRCLE_SIZES } from "@/lib/cms/widgets";
import { input, invalidRing } from "../tokens";
import type { WidgetEditorProps } from "./index";
import { toCircles7 } from "./values";

const SIZE_LABELS: Record<(typeof CIRCLE_SIZES)[number], string> = { sm: "Small", md: "Medium", lg: "Large" };

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Circles7({ value, onChange, id, describedBy, invalid }: WidgetEditorProps) {
  const circles = toCircles7(value);
  const ring = invalid ? invalidRing : "";

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          <tr className="bg-bg2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-graphite">
            <th scope="col" className="px-3 py-2">
              Name
            </th>
            <th scope="col" className="px-3 py-2">
              Colour
            </th>
            <th scope="col" className="px-3 py-2">
              Icon
            </th>
            <th scope="col" className="px-3 py-2">
              Size
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {CIRCLE_IDS.map((circleId, row) => {
            const circle = circles[circleId];
            const patch = (fields: Partial<(typeof circles)[typeof circleId]>) =>
              onChange({ ...circles, [circleId]: { ...circle, ...fields } });
            const describe = row === 0 ? describedBy : undefined;

            return (
              <tr key={circleId}>
                <td className="px-3 py-2">
                  <input
                    id={`${id}-${circleId}-name`}
                    value={circle.name}
                    maxLength={24}
                    aria-label={`Circle ${row + 1} name`}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describe}
                    onChange={(e) => patch({ name: e.target.value })}
                    className={`${input} py-1.5 ${ring}`}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    id={`${id}-${circleId}-color`}
                    value={circle.color}
                    aria-label={`Circle ${row + 1} colour`}
                    onChange={(e) => patch({ color: e.target.value as (typeof CIRCLE_COLORS)[number] })}
                    className={`${input} py-1.5`}
                  >
                    {CIRCLE_COLORS.map((c) => (
                      <option key={c} value={c}>
                        {title(c)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    id={`${id}-${circleId}-icon`}
                    value={circle.icon}
                    aria-label={`Circle ${row + 1} icon`}
                    onChange={(e) => patch({ icon: e.target.value as (typeof CIRCLE_ICONS)[number] })}
                    className={`${input} py-1.5`}
                  >
                    {CIRCLE_ICONS.map((i) => (
                      <option key={i} value={i}>
                        {i === "none" ? "No icon" : title(i)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    id={`${id}-${circleId}-size`}
                    value={circle.size}
                    aria-label={`Circle ${row + 1} size`}
                    onChange={(e) => patch({ size: e.target.value as (typeof CIRCLE_SIZES)[number] })}
                    className={`${input} py-1.5`}
                  >
                    {CIRCLE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {SIZE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
