/* Every CMS module, in admin order.

   Entries carry plain data and functions. The board never imports this at
   runtime — @/lib/cms/types is its type-only view — so the zod that
   reaches the Anomalies entry through widgets.ts stays out of the board
   bundle. */

import type { ModuleTab } from "../spec";
import { aiVisibilityModule } from "./ai-visibility";
import { airwaves } from "./airwaves";
import { anomalies } from "./anomalies";
import { boardHeader } from "./board-header";
import { conversation } from "./conversation";
import { inTheirInbox } from "./in-their-inbox";
import { newswire } from "./newswire";
import { onStage } from "./on-stage";
import { opinionLeaders } from "./opinion-leaders";
import { sightings } from "./sightings";
import { socialPulse } from "./social-pulse";
import { trafficSources } from "./traffic-sources";
import { wildCams } from "./wild-cams";
import { youtubeVoices } from "./youtube-voices";

export const MODULES = [
  boardHeader,
  newswire,
  socialPulse,
  conversation,
  onStage,
  inTheirInbox,
  sightings,
  airwaves,
  youtubeVoices,
  aiVisibilityModule,
  opinionLeaders,
  trafficSources,
  wildCams,
  anomalies,
] as const;

export type AnyModule = (typeof MODULES)[number];

export function byKey<K extends AnyModule["key"]>(key: K): Extract<AnyModule, { key: K }>;
export function byKey(key: string): AnyModule | undefined;
export function byKey(key: string): AnyModule | undefined {
  return MODULES.find((m) => m.key === key);
}

export function byTab(tab: ModuleTab): AnyModule[] {
  return MODULES.filter((m) => m.tab === tab).sort((a, b) => a.order - b.order);
}
