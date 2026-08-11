"use client";

import { Module, ModuleColumn } from "@/components/modules/ModuleColumn";
import { AISearchVisibility } from "./AISearchVisibility";
import { Newswire } from "./Newswire";
import { ShareOfVoice } from "./ShareOfVoice";

/* Left column: human-curated, editorial. Right column: machine-led, clean. */

function renderEditorial(id: string) {
  switch (id) {
    case "newswire":
      return (
        <Module key={id} id={id} eyebrow="Dispatch № 01" title="Newswire" variant="editorial">
          <Newswire />
        </Module>
      );
    case "social-pulse":
      return (
        <Module key={id} id={id} eyebrow="Field Notes № 02" title="Social Pulse" variant="editorial">
          <p className="pt-4 text-sm text-graphite">
            Carousel of posts from Slack, Discord, LinkedIn and WhatsApp — next build step.
          </p>
        </Module>
      );
    case "notepad":
      return (
        <Module key={id} id={id} eyebrow="Margins № 03" title="Notepad" variant="editorial">
          <p className="pt-4 text-sm text-graphite">
            Persistent free-text notes — next build step.
          </p>
        </Module>
      );
    default:
      return null;
  }
}

function renderData(id: string) {
  switch (id) {
    case "ai-visibility":
      return (
        <Module key={id} id={id} title="AI Search Visibility">
          <AISearchVisibility />
        </Module>
      );
    case "share-of-voice":
      return (
        <Module key={id} id={id} title="Share of Voice">
          <ShareOfVoice />
        </Module>
      );
    case "search-velocity":
      return (
        <Module key={id} id={id} title="Search Velocity">
          <p className="pt-4 text-sm text-graphite">Animated trend lines — next build step.</p>
        </Module>
      );
    default:
      return null;
  }
}

export function LiveBoard() {
  return (
    <main className="mx-auto grid w-full max-w-[1560px] flex-1 grid-cols-1 lg:grid-cols-2">
      <ModuleColumn
        ids={["newswire", "social-pulse", "notepad"]}
        render={renderEditorial}
        className="paper-surface px-4 py-5 sm:px-8"
      />
      <ModuleColumn
        ids={["ai-visibility", "share-of-voice", "search-velocity"]}
        render={renderData}
        className="bg-card px-4 py-5 sm:px-8 border-l border-line"
      />
    </main>
  );
}
