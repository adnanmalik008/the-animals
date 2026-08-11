"use client";

import { Module, ModuleColumn } from "@/components/modules/ModuleColumn";
import { AIProfile } from "./AIProfile";
import { AnimalView } from "./AnimalView";
import { ChannelMix } from "./ChannelMix";
import { MediaOverlap } from "./MediaOverlap";
import { SearchLandscape } from "./SearchLandscape";

/* Competition — one clean full-width column, mostly static by design.
   Collapse / reorder still come from the shared Module framework. */

function renderModule(id: string) {
  switch (id) {
    case "channel-mix":
      return (
        <Module key={id} id={id} title="Channel Mix">
          <ChannelMix />
        </Module>
      );
    case "media-overlap":
      return (
        <Module key={id} id={id} title="Media Overlap">
          <MediaOverlap />
        </Module>
      );
    case "animal-view":
      return (
        <Module key={id} id={id} title="Animal View">
          <AnimalView />
        </Module>
      );
    case "ai-profile":
      return (
        <Module key={id} id={id} title="AI Profile">
          <AIProfile />
        </Module>
      );
    case "search-landscape":
      return (
        <Module key={id} id={id} title="Search Landscape">
          <SearchLandscape />
        </Module>
      );
    default:
      return null;
  }
}

export function CompetitionBoard() {
  return (
    <main className="mx-auto w-full max-w-[1560px] flex-1 bg-card">
      <ModuleColumn
        ids={[
          "channel-mix",
          "media-overlap",
          "animal-view",
          "ai-profile",
          "search-landscape",
        ]}
        render={renderModule}
        className="px-4 py-5 sm:px-8"
      />
    </main>
  );
}
