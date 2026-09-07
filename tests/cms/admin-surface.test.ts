/* The admin surface's two pieces of plain logic: what the content screens
   list, and where a link to one points. Both are shared by a server component
   (the directory) and a client one (the rail), and both decide something a
   renderer cannot be asked about in this repo — there is no DOM here. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CONTENT_HREF, legacyKeys, moduleGroups, moduleHref } from "@/components/admin/module-groups";
import { hasModuleIcon } from "@/components/admin/module-icons";
import { MODULES } from "@/lib/cms/registry";
import { MODULE_TEMPLATES } from "@/lib/module-templates";

/** The keys that still save raw JSON, derived here from the two sources of
    truth rather than from the helper these tests are checking. */
const DEFINED = new Set<string>(MODULES.map((m) => m.key));
const JSON_ONLY = Object.keys(MODULE_TEMPLATES).filter((k) => !DEFINED.has(k));

describe("moduleGroups", () => {
  /* An empty group is dropped rather than shown as a heading with nothing
     under it, so the assertion is the order and not the whole list —
     Competition has no registry entry until M5. */
  it("groups in the order the board's own tabs run", () => {
    /* TopNav prints Live, Anomalies, Competition, In the Wild. The rail used to
       run Competition before Anomalies, so the CMS and the board disagreed
       about the same six things; this is the board's order, with the header
       above the tabs where it sits on screen. */
    const ORDER = [
      "Header",
      "Live · editorial",
      "Live · data",
      "Anomalies",
      "Competition",
      "In the Wild",
    ];
    const titles = moduleGroups()
      .map((g) => g.title)
      .filter((t) => t !== "Still JSON");
    expect(titles.every((t) => ORDER.includes(t))).toBe(true);
    expect(titles).toEqual(ORDER.filter((t) => titles.includes(t)));
    expect(titles.length).toBeGreaterThan(0);
  });

  it("lists every registry module exactly once", () => {
    const keys = moduleGroups()
      .filter((g) => g.title !== "Still JSON")
      .flatMap((g) => g.entries.map((e) => e.key));
    expect(keys.slice().sort()).toEqual(MODULES.map((m) => m.key).sort());
  });

  it("carries each module's locked heading, so the directory can show it", () => {
    const entries = moduleGroups().flatMap((g) => g.entries);
    for (const def of MODULES) {
      const entry = entries.find((e) => e.key === def.key);
      expect(entry?.label).toBe(def.label);
      expect(entry?.heading).toContain(def.heading.title);
    }
  });

  /* The index prints `eyebrow` as the module's second line. Twenty of the
     thirty modules are titled exactly as they are labelled, so printing
     `heading` there repeated the name back twenty times ("Reddit" over
     "Reddit"); `eyebrow` is the part that is *not* the name, and is absent
     whenever there is none. Both halves matter: an eyebrow that had drifted
     into carrying the title would put the duplication straight back. */
  it("carries the eyebrow alone as the module's second line, never its name", () => {
    const entries = moduleGroups().flatMap((g) => g.entries);
    for (const def of MODULES) {
      const entry = entries.find((e) => e.key === def.key);
      expect(entry?.eyebrow).toBe(def.heading.eyebrow);
      if (entry?.eyebrow !== undefined) expect(entry.eyebrow).not.toBe(entry.label);
    }
  });

  it("gives every group a stable id, so the tab filter is not keyed by prose", () => {
    const ids = moduleGroups().map((g) => g.id);
    expect(ids.every((id) => /^[a-z-]+$/.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /* The eighteen keys with a template but no definition still have to be
     reachable — they save raw JSON through the Advanced panel and would
     otherwise vanish from the admin entirely. Both assertions compare against
     MODULE_TEMPLATES minus the registry rather than against `legacyKeys`,
     which `moduleGroups` calls itself: measuring a function with its own
     output moves whenever it does. The count is pinned, so a template that
     silently stopped being listed fails instead of passing quietly. */
  it("adds the JSON-only keys last, and shows no such group once there are none", () => {
    const groups = moduleGroups();
    if (JSON_ONLY.length === 0) {
      /* An empty group is dropped rather than shown as a heading with
         nothing under it, so the section disappears entirely. */
      expect(groups.some((g) => g.title === "Still JSON")).toBe(false);
      return;
    }
    expect(groups.at(-1)?.title).toBe("Still JSON");
    expect(groups.at(-1)?.entries.map((e) => e.key).sort()).toEqual(JSON_ONLY.slice().sort());
  });

  /* Every template now has a definition, so this reads zero. It is still
     derived from the two sources rather than hard-coded at zero: a template
     added later with no definition has to be noticed, not silently listed. */
  it("counts as JSON-only exactly the templates with no definition", () => {
    expect(JSON_ONLY).toHaveLength(0);
    expect(legacyKeys().slice().sort()).toEqual(JSON_ONLY.slice().sort());
  });

  it("gives a JSON-only key no heading — there is none fixed in code", () => {
    const still = moduleGroups().find((g) => g.title === "Still JSON");
    for (const entry of still?.entries ?? []) expect(entry.heading).toBeUndefined();
  });
});

/* The index draws each module as its subject rather than as a bullet, which
   only works while every module has a subject drawn for it. A key with no
   glyph still renders — it falls back to a plain document — so nothing breaks
   loudly, and that is exactly why it needs a test: a module added in six
   months would otherwise join the list as the one anonymous row and no one
   would notice. */
describe("module icons", () => {
  it("draws every registry module as itself, not as the fallback document", () => {
    const missing = MODULES.filter((m) => !hasModuleIcon(m.key)).map((m) => m.key);
    expect(missing).toEqual([]);
  });

  /* JSON-only keys are the deliberate exception: there is no form for them
     yet, and the plain document says so. */
  it("leaves the JSON-only keys on the fallback", () => {
    for (const key of JSON_ONLY) expect(hasModuleIcon(key)).toBe(false);
  });
});

/* Content is edited in one place, so every module link lands under the one
   static route. A board page carries publishing and access and no content at
   all — nothing links a module to a slug. */
describe("content links", () => {
  it("points every module at the content screens", () => {
    expect(CONTENT_HREF).toBe("/admin/content");
    expect(moduleHref("newswire")).toBe("/admin/content/newswire");
    expect(moduleHref("reddit")).toBe("/admin/content/reddit");
  });

  it("gives every listed module a link, JSON-only keys included", () => {
    for (const entry of moduleGroups().flatMap((g) => g.entries)) {
      expect(moduleHref(entry.key)).toBe(`${CONTENT_HREF}/${entry.key}`);
    }
  });
});

/* ============================================================
   The locked heading is a promise, and this is what keeps it true.

   Every form tells an editor "this module's eyebrow and title are part of the
   design" and prints `def.heading` as proof. The board prints its own copy of
   those words: `Module eyebrow="Dispatch" title="Newswire"` in LiveBoard, the
   editorial header in the In the Wild page, and so on. Nothing ties the two.

   They cannot be tied at runtime: the board must not import the registry, or
   zod reaches the board bundle through the widget schemas. So the check is
   made here instead, over the source text — which is coarse (a match inside a
   comment would count) but catches the failure that matters, one side being
   reworded while the other is not.

   Reading the text is the only option: these are client components with JSX,
   and vitest here has no DOM to render them into.
   ============================================================ */

/** Where each module's heading is printed to the client, or `null` when the
    heading names an admin screen with no counterpart on the board. Every
    registry key must appear, so a new module forces the question. */
const HEADING_SOURCE: Record<string, string | null> = {
  /* the shell itself — logo, faces, clock. "Board header" is the admin's name
     for it and is printed nowhere on the board. */
  "board-header": null,
  /* the competitive set is named on every Competition module but has no
     heading of its own; "Competitors" is the admin's word for the list */
  competitors: null,
  newswire: "src/components/live/LiveBoard.tsx",
  "social-pulse": "src/components/live/SocialPulse.tsx",
  conversation: "src/components/live/TheConversation.tsx",
  "on-stage": "src/components/live/OnStage.tsx",
  "in-their-inbox": "src/components/live/InTheirInbox.tsx",
  sightings: "src/components/live/Sightings.tsx",
  airwaves: "src/components/live/OnTheAirwaves.tsx",
  "youtube-voices": "src/components/live/YouTubeVoices.tsx",
  /* printed by the column that frames the module, not by the module */
  "ai-visibility": "src/components/live/LiveBoard.tsx",
  "share-of-voice": "src/components/live/LiveBoard.tsx",
  "search-velocity": "src/components/live/SearchVelocity.tsx",
  "top-sites": "src/components/live/TopSites.tsx",
  reddit: "src/components/live/RedditModule.tsx",
  "app-store": "src/components/live/AppStoreVoice.tsx",
  pulse: "src/components/live/PulseModule.tsx",
  hiring: "src/components/live/HiringVelocity.tsx",
  "opinion-leaders": "src/components/live/OpinionLeaders.tsx",
  "traffic-sources": "src/components/live/TrafficSources.tsx",
  "wild-cams": "src/app/(board)/in-the-wild/page.tsx",
  "channel-mix": "src/components/competition/Attention.tsx",
  "media-overlap": "src/components/competition/MediaOverlap.tsx",
  "show-up": "src/components/competition/ShowUp.tsx",
  "ai-profile": "src/components/competition/FindThem.tsx",
  "search-landscape": "src/components/competition/FindThem.tsx",
  "paid-search": "src/components/competition/FindThem.tsx",
  "animal-view": "src/components/competition/AnimalView.tsx",
  horizon: "src/components/competition/Horizon.tsx",
  /* the Anomalies board prints no heading of its own; the word the client
     reads is the tab in the top nav */
  anomalies: "src/components/shell/TopNav.tsx",
};

const source = (rel: string) =>
  readFileSync(fileURLToPath(new URL(`../../${rel}`, import.meta.url)), "utf8");

describe("the locked heading matches what the board prints", () => {
  it("has a verdict for every registry module", () => {
    expect(Object.keys(HEADING_SOURCE).sort()).toEqual(MODULES.map((m) => m.key).sort());
  });

  for (const def of MODULES) {
    const rel = HEADING_SOURCE[def.key];
    if (rel === null) continue;

    it(`${def.key}: ${rel} still prints its eyebrow and title`, () => {
      const text = source(rel);
      expect(text).toContain(def.heading.title);
      if (def.heading.eyebrow) expect(text).toContain(def.heading.eyebrow);
    });
  }
});
