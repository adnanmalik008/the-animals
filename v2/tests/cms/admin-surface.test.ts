/* The admin surface's two pieces of plain logic: what a scope can hold, and
   where a link to it points. Both are shared by a server component (the
   directory) and a client one (the rail), and both decide something a
   renderer cannot be asked about in this repo — there is no DOM here. */
import { describe, expect, it } from "vitest";
import { legacyKeys, moduleGroups } from "@/components/admin/module-groups";
import { directoryHref, directoryLabel, moduleHref, scopeSubtitle } from "@/components/admin/scope";
import type { EditScope } from "@/components/admin/scope";
import { MODULES } from "@/lib/cms/registry";
import { MODULE_TEMPLATES } from "@/lib/module-templates";
import { getDefaultRowInfos, getSharedDoc } from "@/lib/server/docs";

const board: EditScope = { kind: "board", slug: "acme", host: "acme.theanimals.live" };
const defaults: EditScope = { kind: "defaults" };

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
     otherwise vanish from the admin entirely. */
  it("adds the JSON-only keys last, and only for a board", () => {
    const groups = moduleGroups();
    expect(groups.at(-1)?.title).toBe("Still JSON");
    expect(groups.at(-1)?.entries.map((e) => e.key).sort()).toEqual(legacyKeys().slice().sort());
    expect(moduleGroups({ includeLegacy: false }).some((g) => g.title === "Still JSON")).toBe(false);
  });

  it("counts as JSON-only exactly the templates with no definition", () => {
    const defined = new Set(MODULES.map((m) => m.key));
    const expected = Object.keys(MODULE_TEMPLATES).filter((k) => !defined.has(k as never));
    expect(legacyKeys().slice().sort()).toEqual(expected.sort());
    expect(legacyKeys().length).toBeGreaterThan(0);
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

describe("shared defaults, unconfigured", () => {
  /* The state the app is in until 0002_cms.sql runs: no table, which is "no
     shared content" and not a failed read — the directory must render, badge
     everything Default, and say why saving will not work. */
  it("reads as an empty, unavailable table rather than an error", async () => {
    await expect(getDefaultRowInfos()).resolves.toEqual({ ok: true, rows: [], available: false });
  });

  it("offers no shared document to reset a board onto", async () => {
    await expect(getSharedDoc("newswire")).resolves.toBeUndefined();
    await expect(getSharedDoc("reddit")).resolves.toBeUndefined();
  });
});
