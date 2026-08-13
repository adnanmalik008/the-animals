"use client";

import { Module } from "@/components/modules/ModuleColumn";
import { opinionLeaders } from "@/data/live";
import { Avatar, type AvatarTone } from "@/components/shell/Avatar";
import { StickerDropZone } from "./stickers";

export function OpinionLeaders({ id }: { id: string }) {
  const lead = opinionLeaders[0];

  return (
    <Module id={id} title="Opinion Leaders">
      <StickerDropZone
        className="rounded-xl"
        insight={() => ({
          circleId: "opinion-leaders",
          headline: `Opinion Leaders — ${lead.name}, ENG ${lead.eng}, ${lead.followers} followers`,
          source: "Live board",
          category: "Voice",
          categoryColor: "purple",
        })}
      >
        <div className="pt-4">
          <p className="mb-3 text-sm text-graphite">Who the category listens to</p>
          <ul className="divide-y divide-line">
            {opinionLeaders.map((leader) => (
              <li key={leader.id} className="flex items-center gap-3 py-3.5">
                <Avatar name={leader.name} tone={leader.tone as AvatarTone} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{leader.name}</span>
                  <span className="block truncate text-sm text-graphite">{leader.role}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  <span className="text-graphite">ENG</span>{" "}
                  <span className="font-semibold">{leader.eng}</span>
                  <span className="mx-2 text-silver">|</span>
                  <span className="text-graphite">Followers</span>{" "}
                  <span className="font-semibold">{leader.followers}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </StickerDropZone>
    </Module>
  );
}
