/* The admin surface's two pieces of plain logic: what a scope can hold, and
   where a link to it points. Both are shared by a server component (the
   directory) and a client one (the rail), and both decide something a
   renderer cannot be asked about in this repo — there is no DOM here. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { legacyKeys, moduleGroups } from "@/components/admin/module-groups";
import { directoryHref, directoryLabel, moduleHref, scopeSubtitle } from "@/components/admin/scope";
import type { EditScope } from "@/components/admin/scope";
import { MODULES } from "@/lib/cms/registry";
import { MODULE_TEMPLATES } from "@/lib/module-templates";
import { getDefaultRowInfos, getSharedDoc } from "@/lib/server/docs";

const board: EditScope = { kind: "board", slug: "acme", host: "acme.theanimals.live" };
const defaults: EditScope = { kind: "defaults" };

/** The keys that still save raw JSON, derived here from the two sources of
    truth rather than from the helper these tests are checking. */
const DEFINED = new Set<string>(MODULES.map((m) => m.key));
const JSON_ONLY = Object.keys(MODULE_TEMPLATES).filter((k) => !DEFINED.has(k));

describe("moduleGroups", () => {
  /* An empty group is dropped rather than shown as a heading with nothing
     under it, so the assertion is the order and not the whole list —
     Competition has no registry entry until M5. */
  it("groups in the order the agency reads a board", () => {
    const ORDER = [
      "Header",
      "Live · editorial",
      "Live · data",
      "Competition",
      "In the Wild",
      "Anomalies",
    ];
    const titles = moduleGroups({ includeLegacy: false }).map((g) => g.title);
    expect(titles.every((t) => ORDER.includes(t))).toBe(true);
    expect(titles).toEqual(ORDER.filter((t) => titles.includes(t)));
    expect(titles.length).toBeGreaterThan(0);
  });

  it("lists every registry module exactly once", () => {
    const keys = moduleGroups({ includeLegacy: false }).flatMap((g) => g.entries.map((e) => e.key));
    expect(keys.slice().sort()).toEqual(MODULES.map((m) => m.key).sort());
  });

  it("carries each module's locked heading, so the directory can show it", () => {
    const entries = moduleGroups({ includeLegacy: false }).flatMap((g) => g.entries);
    for (const def of MODULES) {
      const entry = entries.find((e) => e.key === def.key);
      expect(entry?.label).toBe(def.label);
      expect(entry?.heading).toContain(def.heading.title);
    }
  });

  /* The eighteen keys with a template but no definition still have to be
     reachable — they save raw JSON through the Advanced panel and would
     otherwise vanish from the admin entirely. Both assertions compare against
     MODULE_TEMPLATES minus the registry rather than against `legacyKeys`,
     which `moduleGroups` calls itself: measuring a function with its own
     output moves whenever it does. The count is pinned, so a template that
     silently stopped being listed fails instead of passing quietly. */
  it("adds the JSON-only keys last, and only for a board", () => {
    const groups = moduleGroups();
    expect(groups.at(-1)?.title).toBe("Still JSON");
    expect(groups.at(-1)?.entries.map((e) => e.key).sort()).toEqual(JSON_ONLY.slice().sort());
    expect(moduleGroups({ includeLegacy: false }).some((g) => g.title === "Still JSON")).toBe(false);
  });

  it("counts as JSON-only exactly the eighteen templates with no definition", () => {
    expect(JSON_ONLY).toHaveLength(18);
    expect(legacyKeys().slice().sort()).toEqual(JSON_ONLY.slice().sort());
  });

  it("gives a JSON-only key no heading — there is none fixed in code", () => {
    const still = moduleGroups().find((g) => g.title === "Still JSON");
    for (const entry of still?.entries ?? []) expect(entry.heading).toBeUndefined();
  });
});

describe("scope links", () => {
  it("points a board's rows at that board and the shared rows at the defaults", () => {
    expect(moduleHref(board, "newswire")).toBe("/admin/acme/modules/newswire");
    expect(moduleHref(defaults, "newswire")).toBe("/admin/defaults/newswire");
    expect(directoryHref(board)).toBe("/admin/acme");
    expect(directoryHref(defaults)).toBe("/admin/defaults");
  });

  it("names what is being edited, so a form page cannot be mistaken for the other one", () => {
    expect(directoryLabel(board)).toBe("All modules");
    expect(directoryLabel(defaults)).toBe("All shared content");
    expect(scopeSubtitle(board)).toBe("acme");
    expect(scopeSubtitle(defaults)).toMatch(/every board/);
  });
});

describe("shared defaults, with no Supabase configured", () => {
  /* This exercises the *unconfigured* early return, not the missing-table
     branch — with no env vars `supabaseAdmin()` is null and no query is made.
     The missing-table path, which is what the production database is in until
     0002_cms.sql runs, is covered by `defaultsRead` in server-docs.test.ts.
     Both must land on the same answer: "no shared content, and none to be
     had", which is not a failed read. */
  it("reads as an empty, unavailable table rather than an error", async () => {
    await expect(getDefaultRowInfos()).resolves.toEqual({ ok: true, rows: [], available: false });
  });

  it("offers no shared document to reset a board onto", async () => {
    await expect(getSharedDoc("newswire")).resolves.toBeUndefined();
    await expect(getSharedDoc("reddit")).resolves.toBeUndefined();
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
  newswire: "src/components/live/LiveBoard.tsx",
  "opinion-leaders": "src/components/live/OpinionLeaders.tsx",
  "traffic-sources": "src/components/live/TrafficSources.tsx",
  "wild-cams": "src/app/(board)/in-the-wild/page.tsx",
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
