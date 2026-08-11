"use client";

import { aiVisibility } from "@/data/board";
import { useCountUp, useInView } from "@/lib/hooks";

const platformDot: Record<string, string> = {
  chatgpt: "bg-green",
  grok: "bg-ink",
  claude: "bg-orange",
  gemini: "bg-blue",
};

function Headline({
  value,
  label,
  suffix,
  colorClass,
  start,
  decimals = 0,
}: {
  value: number;
  label: string;
  suffix: string;
  colorClass: string;
  start: boolean;
  decimals?: number;
}) {
  const n = useCountUp(value, start, 1200, decimals);
  return (
    <div className="flex-1 rounded-2xl border border-line bg-card px-5 py-4">
      <span className={`block text-3xl font-bold tabular-nums sm:text-4xl ${colorClass}`}>
        {decimals ? n.toFixed(1) : n}
        {suffix}
      </span>
      <span className="mt-1 block text-sm text-graphite">{label}</span>
    </div>
  );
}

export function AISearchVisibility() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-graphite">AI Platform Performance</p>
        <span className="rounded-full border border-line px-3 py-1 text-xs text-graphite">Today</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Headline value={aiVisibility.score} label="AI Visibility" suffix="" colorClass="text-orange" start={inView} />
        <Headline value={aiVisibility.mentions} label="Mentions" suffix="M" colorClass="text-purple" start={inView} decimals={1} />
        <Headline value={aiVisibility.cited} label="Cited Pages" suffix="M" colorClass="text-olive" start={inView} decimals={1} />
      </div>

      <ul className="mt-4 divide-y divide-line">
        {aiVisibility.platforms.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-3.5">
            <span className="flex items-center gap-2.5 font-semibold">
              <span className={`h-4 w-4 rounded-full ${platformDot[p.id]}`} aria-hidden />
              {p.name}
            </span>
            <span className="flex items-center gap-6 text-sm tabular-nums sm:gap-10">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
                {p.mentionsLabel}
              </span>
              <span className="text-graphite">/</span>
              <span className="flex items-center gap-1.5 text-graphite">
                <span className="h-1.5 w-1.5 rounded-full bg-silver" aria-hidden />
                {p.citedLabel}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
