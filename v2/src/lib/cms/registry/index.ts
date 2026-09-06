/* Every CMS module, in admin order.

   Entries carry plain data and functions. The board never imports this at
   runtime — @/lib/cms/types is its type-only view — so the zod that
   reaches the Anomalies entry through widgets.ts stays out of the board
   bundle. */

import type { ModuleTab } from "../spec";
import { anomalies } from "./anomalies";
import { boardHeader } from "./board-header";
import { newswire } from "./newswire";
import { opinionLeaders } from "./opinion-leaders";
import { trafficSources } from "./traffic-sources";
import { wildCams } from "./wild-cams";

export const MODULES = [boardHeader, newswire, opinionLeaders, trafficSources, wildCams, anomalies] as const;

export type AnyModule = (typeof MODULES)[number];

export function byKey<K extends AnyModule["key"]>(key: K): Extract<AnyModule, { key: K }>;
export function byKey(key: string): AnyModule | undefined;
export function byKey(key: string): AnyModule | undefined {
  return MODULES.find((m) => m.key === key);
}

export function byTab(tab: ModuleTab): AnyModule[] {
  return MODULES.filter((m) => m.tab === tab).sort((a, b) => a.order - b.order);
}
