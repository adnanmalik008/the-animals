/* Every module the agency can edit, grouped the way it reads a board, and
   where each one is edited.

   Plain data with no server or client marking: the directory (a server
   component) and the form page's rail (a client one) show the same list, so
   neither may own it. */

import { byKey, byTab } from "@/lib/cms/registry";
import { MODULE_TEMPLATES } from "@/lib/module-templates";

/** The content screens. One set of content for the whole product, so one
    place — a board page carries publishing and access, and no content. */
export const CONTENT_HREF = "/admin/content";

export function moduleHref(moduleKey: string): string {
  return `${CONTENT_HREF}/${moduleKey}`;
}

export interface ModuleEntry {
  key: string;
  label: string;
  /** the eyebrow/title fixed in code; absent for a key with no definition */
  heading?: string;
}

export interface ModuleGroup {
  title: string;
  entries: ModuleEntry[];
}

const headingOf = (h: { eyebrow?: string; title: string }) =>
  h.eyebrow ? `${h.eyebrow} · ${h.title}` : h.title;

const entriesFor = (defs: ReturnType<typeof byTab>): ModuleEntry[] =>
  defs.map((d) => ({ key: d.key, label: d.label, heading: headingOf(d.heading) }));

/** Keys that still save raw JSON: a template but no definition, so there is
    nothing to generate a form from yet. */
export function legacyKeys(): string[] {
  return Object.keys(MODULE_TEMPLATES).filter((key) => !byKey(key));
}

/** The board's tabs, in the order the agency reads them, with the JSON-only
    keys last. */
export function moduleGroups(): ModuleGroup[] {
  const live = byTab("live");
  /* a live module with no column is data, not nothing — the fallback keeps
     a future registry entry from disappearing out of the directory */
  const out: ModuleGroup[] = [
    { title: "Header", entries: entriesFor(byTab("header")) },
    { title: "Live · editorial", entries: entriesFor(live.filter((m) => m.column === "editorial")) },
    { title: "Live · data", entries: entriesFor(live.filter((m) => m.column !== "editorial")) },
    { title: "Competition", entries: entriesFor(byTab("competition")) },
    { title: "In the Wild", entries: entriesFor(byTab("wild")) },
    { title: "Anomalies", entries: entriesFor(byTab("anomalies")) },
  ].filter((g) => g.entries.length > 0);

  const legacy = legacyKeys().map((key) => ({ key, label: key }));
  if (legacy.length > 0) out.push({ title: "Still JSON", entries: legacy });

  return out;
}
