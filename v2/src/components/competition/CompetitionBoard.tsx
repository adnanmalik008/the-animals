"use client";

import { ModuleColumn } from "@/components/modules/ModuleColumn";
import { AnimalView } from "./AnimalView";
import { Attention } from "./Attention";
import { FindThem } from "./FindThem";
import { Horizon } from "./Horizon";
import { MediaOverlap } from "./MediaOverlap";
import { ShowUp } from "./ShowUp";

/* Competition — the dark editorial board. One full-width column on a
   black canvas; every section keeps collapse + reorder via Module. */

function renderModule(id: string) {
  switch (id) {
    case "attention":
      return <Attention key={id} id={id} />;
    case "media-overlap":
      return <MediaOverlap key={id} id={id} />;
    case "animal-view":
      return <AnimalView key={id} id={id} />;
    case "show-up":
      return <ShowUp key={id} id={id} />;
    case "find-them":
      return <FindThem key={id} id={id} />;
    case "horizon":
      return <Horizon key={id} id={id} />;
    default:
      return null;
  }
}

export function CompetitionBoard() {
  return (
    <main className="w-full flex-1 bg-ink text-white">
      <div className="mx-auto max-w-[1560px]">
        <ModuleColumn
          ids={[
            "attention",
            "media-overlap",
            "animal-view",
            "show-up",
            "find-them",
            "horizon",
          ]}
          render={renderModule}
          className="px-4 py-6 sm:px-8"
        />
      </div>
    </main>
  );
}
