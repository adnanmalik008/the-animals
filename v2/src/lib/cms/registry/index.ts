/* Every CMS module, in admin order. Client-safe: entries carry plain data
   and functions, no zod. */

import type { ModuleTab } from "../spec";
import { newswire } from "./newswire";
import { opinionLeaders } from "./opinion-leaders";
import { trafficSources } from "./traffic-sources";
import { wildCams } from "./wild-cams";

export const MODULES = [newswire, opinionLeaders, trafficSources, wildCams] as const;

export type AnyModule = (typeof MODULES)[number];

export function byKey<K extends AnyModule["key"]>(key: K): Extract<AnyModule, { key: K }>;
export function byKey(key: string): AnyModule | undefined;
export function byKey(key: string): AnyModule | undefined {
  return MODULES.find((m) => m.key === key);
}

export function byTab(tab: ModuleTab): AnyModule[] {
  return MODULES.filter((m) => m.tab === tab).sort((a, b) => a.order - b.order);
}
