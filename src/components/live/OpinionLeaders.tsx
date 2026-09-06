"use client";

import { useModuleDoc } from "@/components/board/BoardDataContext";
import { Module } from "@/components/modules/ModuleColumn";
import { Avatar } from "@/components/shell/Avatar";
import type { LeaderPlatform } from "@/data/live";
import { StickerDropZone } from "./stickers";

const platformLabel: Record<LeaderPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
};

function PlatformMark({ platform }: { platform: LeaderPlatform }) {
  const base = "flex h-5 w-5 items-center justify-center rounded-full border-2 border-card text-[9px] font-black text-white shadow-sm";
  if (platform === "linkedin") return <span className={`${base} bg-[#0a66c2]`}>in</span>;
  if (platform === "instagram") return <span className={`${base} bg-[#e1306c]`}>◎</span>;
  if (platform === "youtube") return <span className={`${base} bg-[#ff0000]`}>▶</span>;
  if (platform === "tiktok") return <span className={`${base} bg-black`}>♪</span>;
  return <span className={`${base} bg-black`}>𝕏</span>;
}

export function OpinionLeaders({ id }: { id: string }) {
  const leaders = useModuleDoc("opinion-leaders").leaders;

  return (
    <Module id={id} title="Opinion Leaders">
      <div className="pt-4">
        <p className="mb-3 text-sm text-graphite">Who the category listens to</p>
        <div className="divide-y divide-line" role="list">
          {leaders.map((leader) => (
            <StickerDropZone
              key={leader.id}
              tagKey={`opinion-leader:${leader.id}`}
              className="rounded-lg"
              insight={() => ({
                circleId: "key-influencers",
                headline: `${leader.name} — ${leader.role}, ENG ${leader.eng}, ${leader.followers} followers`,
                source: platformLabel[leader.platform],
                category: "Voice",
                categoryColor: "purple",
              })}
            >
              <div className="flex items-center gap-3 py-3.5" role="listitem">
                <span className="relative shrink-0">
                  <Avatar name={leader.name} tone={leader.tone} size={44} />
                  <span className="absolute -bottom-1 -right-1" title={platformLabel[leader.platform]}>
                    <PlatformMark platform={leader.platform} />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{leader.name}</span>
                  <span className="block truncate text-sm text-graphite">
                    {leader.role} · {platformLabel[leader.platform]}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  <span className="text-graphite">ENG</span>{" "}
                  <span className="font-semibold">{leader.eng}</span>
                  <span className="mx-2 text-silver">|</span>
                  <span className="text-graphite">Followers</span>{" "}
                  <span className="font-semibold">{leader.followers}</span>
                </span>
              </div>
            </StickerDropZone>
          ))}
        </div>
      </div>
    </Module>
  );
}
