"use client";

import { ModuleColumn } from "@/components/modules/ModuleColumn";
import { Attention } from "./Attention";
import { FindThem } from "./FindThem";
import { Horizon } from "./Horizon";
import { ShowUp } from "./ShowUp";

/* Competition — the dark editorial board. One full-width column on a
   black canvas; every section keeps collapse + reorder via Module. */

function renderModule(id: string) {
  switch (id) {
    case "attention":
      return <Attention key={id} id={id} />;
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
    /* the design floats the sections as dark slabs on the light page, so the
       canvas stays light and each Module carries its own black panel */
    <main className="w-full flex-1 bg-bg text-ink">
      <div className="mx-auto max-w-[1560px]">
        <ModuleColumn
          /* four sections, as the design has them — Media Overlap and each
             section's Animal View live inside their section */
          ids={["attention", "show-up", "find-them", "horizon"]}
          render={renderModule}
          className="px-4 py-6 sm:px-8"
          controls="panel"
        />
      </div>
    </main>
  );
}
