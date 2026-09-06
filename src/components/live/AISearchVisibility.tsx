"use client";

import { useModuleDoc } from "@/components/board/BoardDataContext";
import { useCountUp, useInView } from "@/lib/hooks";
import { AI_PLATFORM_NAME, AiPlatformMark } from "./AiPlatformMark";
import { StickerDropZone } from "./stickers";

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
    <div className="h-full rounded-2xl border border-line bg-card px-5 py-4">
      <span className={`block text-3xl font-bold tabular-nums sm:text-4xl ${colorClass}`}>
        {decimals ? n.toFixed(1) : n}
        {suffix}
      </span>
      <span className="mt-1 block text-sm text-graphite">{label}</span>
    </div>
  );
}

/* Every headline figure and every platform row is its own drop target, so
   the section carries as many stickers as it has items. */
export function AISearchVisibility() {
  const doc = useModuleDoc("ai-visibility");
  const { ref, inView } = useInView<HTMLDivElement>();

  /* the three headline figures, each with the line it files as */
  const headlines = [
    {
      key: "score",
      value: doc.score,
      label: "AI Visibility",
      suffix: "",
      colorClass: "text-orange",
      decimals: 0,
      headline: `AI Search Visibility — score ${doc.score}`,
    },
    {
      key: "mentions",
      value: doc.mentions,
      label: "Mentions",
      suffix: "M",
      colorClass: "text-purple",
      decimals: 1,
      headline: `AI Search Visibility — ${doc.mentionsLabel} mentions across AI platforms`,
    },
    {
      key: "cited",
      value: doc.cited,
      label: "Cited Pages",
      suffix: "M",
      colorClass: "text-olive",
      decimals: 1,
      headline: `AI Search Visibility — ${doc.citedLabel} pages cited by AI platforms`,
    },
  ];

  return (
    <div ref={ref} className="pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-graphite">AI Platform Performance</p>
        <span className="rounded-full border border-line px-3 py-1 text-xs text-graphite">Today</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {headlines.map((h) => (
          <StickerDropZone
            key={h.key}
            tagKey={`ai-vis:${h.key}`}
            className="flex-1 rounded-2xl"
            insight={() => ({
              circleId: "media-hotspots",
              headline: h.headline,
              source: "Live board",
              category: "Signal",
              categoryColor: "orange",
            })}
          >
            <Headline
              value={h.value}
              label={h.label}
              suffix={h.suffix}
              colorClass={h.colorClass}
              start={inView}
              decimals={h.decimals}
            />
          </StickerDropZone>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-line">
        {doc.platforms.map((p) => (
          <li key={p.id}>
            <StickerDropZone
              tagKey={`ai-vis:${p.id}`}
              className="rounded-lg"
              insight={() => ({
                circleId: "media-hotspots",
                headline: `AI Search Visibility — ${AI_PLATFORM_NAME[p.id]} ${p.mentionsLabel} mentions, ${p.citedLabel} cited`,
                source: AI_PLATFORM_NAME[p.id],
                category: "Signal",
                categoryColor: "orange",
              })}
            >
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="flex items-center gap-2.5 font-semibold">
                  <AiPlatformMark id={p.id} />
                  {AI_PLATFORM_NAME[p.id]}
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
              </div>
            </StickerDropZone>
          </li>
        ))}
      </ul>
    </div>
  );
}
