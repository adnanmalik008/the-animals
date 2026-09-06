/* Every module a scope can hold, grouped the way the agency reads a board.

   Plain data with no server or client marking: the directory (a server
   component) and the form page's rail (a client one) show the same list, so
   neither may own it. */

import { byKey, byTab } from "@/lib/cms/registry";
import { MODULE_TEMPLATES } from "@/lib/module-templates";

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
    nothing to generate a form from yet. They belong to a board only — a
    shared default has to validate before every board reads it, so an
    unvalidatable key can never have one. */
export function legacyKeys(): string[] {
  return Object.keys(MODULE_TEMPLATES).filter((key) => !byKey(key));
}

/** The board's own tabs, in the order the agency reads them.
    `includeLegacy` adds the JSON-only keys, which is a board scope only. */
export function moduleGroups({ includeLegacy = true } = {}): ModuleGroup[] {
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

  if (includeLegacy) {
    const legacy = legacyKeys().map((key) => ({ key, label: key }));
    if (legacy.length > 0) out.push({ title: "Still JSON", entries: legacy });
  }

  return out;
}
