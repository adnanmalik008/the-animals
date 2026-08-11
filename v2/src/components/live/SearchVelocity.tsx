"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { searchTerms } from "@/data/live";
import { useInView } from "@/lib/hooks";
import { StickerDropZone } from "./stickers";

const W = 220;
const H = 44;
const PAD = 3;

function buildPath(points: number[]) {
  return points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * (W - PAD * 2) + PAD;
      const y = H - PAD - (v / 100) * (H - PAD * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function TrendLine({ points, up, inView }: { points: number[]; up: boolean; inView: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const d = useMemo(() => buildPath(points), [points]);

  /* measure once mounted, so the stroke can be hidden at full dash offset */
  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [d]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-11 w-full" preserveAspectRatio="none" aria-hidden>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`line-draw ${up ? "stroke-green" : "stroke-red"}`}
        style={{
          strokeDasharray: len || undefined,
          strokeDashoffset: len ? (inView ? 0 : len) : undefined,
          visibility: len ? "visible" : "hidden",
        }}
      />
    </svg>
  );
}

export function SearchVelocity({ id }: { id: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const lead = searchTerms[0];

  return (
    <Module id={id} title="Search Velocity">
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "channels",
          headline: `Search Velocity — “${lead.term}” ${lead.delta > 0 ? "+" : ""}${lead.delta}% branded search`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div ref={ref} className="pt-4">
          <p className="mb-4 text-sm text-graphite">Branded search, trailing 12 weeks</p>
          <ul className="flex flex-col gap-5">
            {searchTerms.map((t) => {
              const up = t.delta >= 0;
              return (
                <li key={t.id} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 truncate text-sm font-semibold sm:w-36">{t.term}</span>
                  <div className="min-w-0 flex-1">
                    <TrendLine points={t.points} up={up} inView={inView} />
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      up ? "bg-green/10 text-green" : "bg-red/10 text-red"
                    }`}
                  >
                    {up ? "+" : ""}
                    {t.delta}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </StickerDropZone>
    </Module>
  );
}
