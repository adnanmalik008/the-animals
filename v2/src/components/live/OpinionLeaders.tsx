"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { opinionLeaders } from "@/data/live";
import { StickerDropZone } from "./stickers";

const avatarBg: Record<string, string> = {
  orange: "bg-orange text-white",
  blue: "bg-blue text-white",
  green: "bg-green text-white",
  purple: "bg-purple text-white",
  yellow: "bg-yellow text-ink",
};

export function OpinionLeaders({ id }: { id: string }) {
  const lead = opinionLeaders[0];

  return (
    <Module id={id} title="Opinion Leaders">
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "channels",
          headline: `Opinion Leaders — ${lead.name} reach ${lead.reach} (${lead.trend > 0 ? "+" : ""}${lead.trend}%)`,
          source: "Live board",
          category: "Signal",
          categoryColor: "orange",
        })}
      >
        <div className="pt-4">
          <ul className="flex flex-col">
            {opinionLeaders.map((leader) => {
              const up = leader.trend >= 0;
              return (
                <li key={leader.id} className="flex items-center gap-3 border-b border-line/60 py-3 last:border-b-0">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarBg[leader.color]}`}
                    aria-hidden
                  >
                    {leader.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{leader.name}</p>
                    <p className="text-xs text-graphite">{leader.platform}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums">{leader.reach}</span>
                  <span
                    className={`w-14 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-bold tabular-nums ${
                      up ? "bg-green/10 text-green" : "bg-red/10 text-red"
                    }`}
                  >
                    {up ? "+" : ""}
                    {leader.trend}%
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
