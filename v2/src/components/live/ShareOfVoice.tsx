"use client";

import { shareOfVoice } from "@/data/board";
import { useInView } from "@/lib/hooks";

const barColor: Record<string, string> = {
  orange: "bg-orange",
  blue: "bg-blue",
  green: "bg-green",
  purple: "bg-purple",
  yellow: "bg-yellow",
};

export function ShareOfVoice() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-graphite">AI + Web conversation</p>
        <span className="rounded-full border border-line px-3 py-1 text-xs text-graphite">7 days</span>
      </div>

      <ul className="flex flex-col gap-5">
        {shareOfVoice.map((row) => (
          <li key={row.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-semibold">{row.label}</span>
              <span className="tabular-nums text-graphite">{row.pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg2">
              <div
                className={`bar-fill h-full rounded-full ${barColor[row.color]}`}
                style={{ width: inView ? `${row.pct}%` : "0%" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
