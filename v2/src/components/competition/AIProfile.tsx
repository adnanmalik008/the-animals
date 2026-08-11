"use client";

import { aiProfiles, type AiMetric } from "@/data/competition";
import { useCountUp, useInView } from "@/lib/hooks";

/* Count-up on scroll into view — same treatment as Live's AI Search Visibility. */

function MetricNumber({ metric, start }: { metric: AiMetric; start: boolean }) {
  const n = useCountUp(metric.value, start, 1200, metric.decimals);
  return (
    <>
      {metric.decimals ? n.toFixed(metric.decimals) : n}
      {metric.suffix}
    </>
  );
}

function ScoreNumber({ score, start }: { score: number; start: boolean }) {
  const n = useCountUp(score, start, 1200);
  return <>{n}</>;
}

export function AIProfile() {
  const { ref, inView } = useInView<HTMLUListElement>(0.2);

  return (
    <div className="pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-graphite">AI Platform Performance — full field</p>
        <span className="rounded-full border border-line px-3 py-1 text-xs text-graphite">
          Today
        </span>
      </div>

      <ul ref={ref} className="flex flex-col gap-2">
        {aiProfiles.map((row) => (
          <li
            key={row.id}
            className={`rounded-2xl px-4 py-3.5 sm:px-5 ${
              row.isClient ? "bg-bg2" : ""
            }`}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="flex items-baseline gap-2 font-semibold">
                {row.name}
                {row.isClient && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange">
                    Client
                  </span>
                )}
              </span>
              <span
                className={`text-2xl font-bold tabular-nums ${
                  row.isClient ? "text-orange" : ""
                }`}
              >
                <ScoreNumber score={row.score} start={inView} />
                <span className="ml-1 text-xs font-normal text-graphite">/100</span>
              </span>
            </div>

            {/* thin score bar — static width, no transition */}
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line/60">
              <div
                className={`h-full rounded-full ${row.isClient ? "bg-orange" : "bg-ink"}`}
                style={{ width: `${row.score}%` }}
              />
            </div>

            <p className="mt-2.5 flex items-center gap-5 text-sm tabular-nums text-graphite">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
                <MetricNumber metric={row.mentions} start={inView} />
                <span className="text-xs">mentions</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-silver" aria-hidden />
                <MetricNumber metric={row.cited} start={inView} />
                <span className="text-xs">cited pages</span>
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
