"use client";

import { Module, ModuleColumn } from "@/components/modules/ModuleColumn";
import { aiVisibility, shareOfVoice } from "@/data/board";
import { AISearchVisibility } from "./AISearchVisibility";
import { AppStoreVoice } from "./AppStoreVoice";
import { HiringVelocity } from "./HiringVelocity";
import { InTheirInbox } from "./InTheirInbox";
import { Newswire } from "./Newswire";
import { Notepad } from "./Notepad";
import { OnStage } from "./OnStage";
import { OnTheAirwaves } from "./OnTheAirwaves";
import { OpinionLeaders } from "./OpinionLeaders";
import { PulseModule } from "./PulseModule";
import { RedditModule } from "./RedditModule";
import { SearchVelocity } from "./SearchVelocity";
import { ShareOfVoice } from "./ShareOfVoice";
import { Sightings } from "./Sightings";
import { SocialPulse } from "./SocialPulse";
import { StickerDropZone, StickerProvider, StickerTray } from "./stickers";
import { TheConversation } from "./TheConversation";
import { TopSites } from "./TopSites";
import { TrafficSources } from "./TrafficSources";
import { YouTubeVoices } from "./YouTubeVoices";

/* Left column: human-curated, editorial. Right column: machine-led, clean. */

function renderEditorial(id: string) {
  switch (id) {
    case "newswire":
      return (
        <Module key={id} id={id} eyebrow="Dispatch" title="Newswire" variant="editorial">
          <Newswire />
        </Module>
      );
    case "social-pulse":
      return <SocialPulse key={id} id={id} />;
    case "conversation":
      return <TheConversation key={id} id={id} />;
    case "on-stage":
      return <OnStage key={id} id={id} />;
    case "in-their-inbox":
      return <InTheirInbox key={id} id={id} />;
    case "sightings":
      return <Sightings key={id} id={id} />;
    case "airwaves":
      return <OnTheAirwaves key={id} id={id} />;
    case "youtube-voices":
      return <YouTubeVoices key={id} id={id} />;
    case "notepad":
      return <Notepad key={id} id={id} />;
    default:
      return null;
  }
}

function renderData(id: string) {
  switch (id) {
    case "ai-visibility":
      return (
        <Module key={id} id={id} title="AI Search Visibility">
          <StickerDropZone
            className="rounded-xl"
            insight={() => ({
              circleId: "media-hotspots",
              headline: `AI Search Visibility — score ${aiVisibility.score}, ${aiVisibility.mentionsLabel} mentions`,
              source: "Live board",
              category: "Signal",
              categoryColor: "orange",
            })}
          >
            <AISearchVisibility />
          </StickerDropZone>
        </Module>
      );
    case "share-of-voice":
      return (
        <Module key={id} id={id} title="Share of Voice">
          <StickerDropZone
            className="rounded-xl"
            insight={() => ({
              circleId: "media-hotspots",
              headline: `Share of Voice — ${shareOfVoice[0].label} ${shareOfVoice[0].pct}% of conversation`,
              source: "Live board",
              category: "Signal",
              categoryColor: "orange",
            })}
          >
            <ShareOfVoice />
          </StickerDropZone>
        </Module>
      );
    case "search-velocity":
      return <SearchVelocity key={id} id={id} />;
    case "top-sites":
      return <TopSites key={id} id={id} />;
    case "opinion-leaders":
      return <OpinionLeaders key={id} id={id} />;
    case "reddit":
      return <RedditModule key={id} id={id} />;
    case "app-store":
      return <AppStoreVoice key={id} id={id} />;
    case "traffic-sources":
      return <TrafficSources key={id} id={id} />;
    case "pulse":
      return <PulseModule key={id} id={id} />;
    case "hiring":
      return <HiringVelocity key={id} id={id} />;
    default:
      return null;
  }
}

export function LiveBoard() {
  return (
    <StickerProvider>
      {/* pb clears the fixed sticker tray on small screens */}
      <main className="mx-auto grid w-full max-w-[1560px] flex-1 grid-cols-1 pb-36 lg:grid-cols-2 lg:pb-0">
        <ModuleColumn
          ids={[
            "newswire",
            "social-pulse",
            "conversation",
            "on-stage",
            "in-their-inbox",
            "sightings",
            "airwaves",
            "youtube-voices",
            "notepad",
          ]}
          render={renderEditorial}
          className="paper-surface px-4 py-5 sm:px-8"
        />
        <ModuleColumn
          ids={[
            "ai-visibility",
            "share-of-voice",
            "search-velocity",
            "top-sites",
            "opinion-leaders",
            "reddit",
            "app-store",
            "traffic-sources",
            "pulse",
            "hiring",
          ]}
          render={renderData}
          className="bg-card px-4 py-5 sm:px-8 border-l border-line"
        />
      </main>
      <StickerTray />
    </StickerProvider>
  );
}
