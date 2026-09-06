import { describe, expect, it } from "vitest";
import { MODULES, byKey } from "@/lib/cms/registry";
import { parseDoc } from "@/lib/cms/parse";
import { docsFromRows } from "@/lib/cms/docs";

describe("registry", () => {
  it("has unique keys", () => {
    const keys = MODULES.map((m) => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(MODULES.map((m) => [m.key, m] as const))("%s fixture round-trips", (_key, def) => {
    const fixture = def.fixture();
    const res = parseDoc(def, fixture);
    expect(res.ok, res.ok ? "" : JSON.stringify(res.fieldErrors)).toBe(true);
    if (res.ok) expect(res.doc).toEqual(fixture);
  });

  /* The fixture is what every board with no saved header renders. A logo
     in it would hang the first client's mark over every later client's
     brief — an error nobody would see in a test, and everybody would see
     on the board. The adidas PNG stays a name-matched branch in BrandBar
     instead, which is why nothing here should carry a logo. */
  it("the board-header fixture ships no logo", () => {
    const fixture = byKey("board-header").fixture();
    expect(fixture.logoUrl).toBeUndefined();
    expect(fixture.logoAlt).toBeUndefined();
    expect(JSON.stringify(fixture)).not.toContain("adidas");

    // and the saved doc that comes back out of validation carries none either
    const res = parseDoc(byKey("board-header"), fixture);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.doc.logoUrl).toBeUndefined();
  });

  it("the board-header fixture keeps the nav's two moderators and a GMT+1 clock", () => {
    const def = byKey("board-header");
    const fixture = def.fixture();
    expect(fixture.moderators.map((m) => m.name)).toEqual(["Amara Osei", "Jonas Keller"]);
    expect(fixture.clock).toEqual({ timeZone: "Etc/GMT-1", label: "GMT+1" });

    /* The field's own default matters as much as the fixture's value: it is
       what a cleared box in the form falls back to, so a city zone left here
       would put the summer-time drift back one save later. */
    expect(def.fields.clock.fields.timeZone.default).toBe("Etc/GMT-1");
    expect(def.fields.clock.fields.label.default).toBe("GMT+1");
  });

  /* The clock's label is fixed text, not something derived from the zone,
     and the clock this replaced simply added 60 minutes all year. So the
     shipped zone has to be a fixed offset: a city zone would put the board
     an hour off its own GMT+1 label every summer, which is a bug nobody
     sees until the clocks change. Etc/GMT-1 is UTC+1 with no daylight
     saving — the sign is inverted by the POSIX convention these names
     follow. Same UTC instant in January and July, same wall clock. */
  it("the default clock zone is a fixed UTC+1 with no daylight-saving shift", () => {
    const { timeZone } = byKey("board-header").fixture().clock;
    const hourAt = (utc: string) =>
      new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hour12: false }).format(
        new Date(utc)
      );

    expect(hourAt("2026-01-15T12:00:00Z")).toBe("13");
    expect(hourAt("2026-07-15T12:00:00Z")).toBe("13");
  });

  it("finds a definition by key", () => {
    expect(byKey("newswire")?.heading).toEqual({ eyebrow: "Dispatch", title: "Newswire" });
    expect(byKey("nope")).toBeUndefined();
  });

  /* The caps have to clear the content the design already ships — the
     built-in wire's longest summary is 185 characters and its longest body
     1,068 — while still refusing runaway paste. */
  it("newswire's textarea caps sit clear of the built-in article lengths", () => {
    const def = byKey("newswire");
    const fixture = def.fixture();
    const rows = [...fixture.items, fixture.incoming];
    const longest = (field: "summary" | "body") => Math.max(...rows.map((r) => (r?.[field] ?? "").length));

    expect(longest("summary")).toBeLessThan(400);
    expect(longest("body")).toBeLessThan(8000);

    const withFirstItem = (patch: Record<string, unknown>) => ({
      ...fixture,
      items: [{ ...fixture.items[0], ...patch }],
    });
    expect(parseDoc(def, withFirstItem({ summary: "x".repeat(400) })).ok).toBe(true);
    expect(parseDoc(def, withFirstItem({ summary: "x".repeat(401) })).ok).toBe(false);
    expect(parseDoc(def, withFirstItem({ body: "x".repeat(8000) })).ok).toBe(true);
    expect(parseDoc(def, withFirstItem({ body: "x".repeat(8001) })).ok).toBe(false);
  });
});

describe("docsFromRows", () => {
  it("falls back to the fixture for absent and invalid rows, honours a valid row", () => {
    const newswire = byKey("newswire");
    const custom = { ...newswire.fixture(), items: [newswire.fixture().items[0]] };
    const invalid: string[] = [];
    const { docs, status } = docsFromRows(
      [
        { module_key: "newswire", data: custom },
        { module_key: "traffic-sources", data: { channels: "nope" } },
        { module_key: "unknown-key", data: {} },
      ],
      [],
      (key) => invalid.push(key)
    );
    expect(docs.newswire.items).toHaveLength(1);
    expect(docs["traffic-sources"]).toEqual(byKey("traffic-sources").fixture());
    expect(docs["opinion-leaders"]).toEqual(byKey("opinion-leaders").fixture());
    expect(status.newswire).toBe("custom");
    expect(status["traffic-sources"]).toBe("invalid");
    expect(status["opinion-leaders"]).toBe("default");
    expect(invalid).toEqual(["traffic-sources"]);
  });

  /* Fixtures are module-scope arrays. Handing them out live would give every
     board served by one server process the same objects, so one board's edit
     would show up on the next board rendered. */
  it("clones the fixture, so two boards never share one object", () => {
    const first = docsFromRows([], []);
    const second = docsFromRows([], []);
    // Read before mutating: a shared-reference bug would move these too.
    const originalHeadline = byKey("newswire").fixture().items[0].headline;
    const originalCount = byKey("newswire").fixture().items.length;

    expect(first.docs.newswire).toEqual(second.docs.newswire);
    expect(first.docs.newswire).not.toBe(second.docs.newswire);
    expect(first.docs.newswire.items).not.toBe(second.docs.newswire.items);
    expect(first.docs.newswire.items[0]).not.toBe(second.docs.newswire.items[0]);

    first.docs.newswire.items[0].headline = "Rewritten in place";
    first.docs.newswire.items.push(first.docs.newswire.items[0]);
    expect(second.docs.newswire.items[0].headline).toBe(originalHeadline);
    expect(second.docs.newswire.items).toHaveLength(originalCount);
    expect(byKey("newswire").fixture().items[0].headline).toBe(originalHeadline);
  });
});

/* The three-step read chain, added when shared defaults arrived: a board's own
   saved document, then the agency-wide default, then the built-in fixture.
   The fixtures are the adidas demo material, so without the middle step every
   new client would either inherit adidas's content or have every module
   retyped. */
describe("docsFromRows fallback chain", () => {
  const fixture = () => byKey("newswire").fixture();
  const withHeadline = (headline: string) => {
    const base = fixture();
    return { ...base, items: [{ ...base.items[0], headline }] };
  };
  const boardDoc = withHeadline("The board wrote this");
  const sharedDoc = withHeadline("The agency wrote this");
  const row = (module_key: string, data: unknown) => ({ module_key, data });

  it("prefers the board's own document over the shared default", () => {
    const { docs, status } = docsFromRows([row("newswire", boardDoc)], [row("newswire", sharedDoc)]);

    expect(docs.newswire.items[0].headline).toBe("The board wrote this");
    expect(status.newswire).toBe("custom");
  });

  it("serves the shared default when the board has saved nothing", () => {
    const { docs, status } = docsFromRows([], [row("newswire", sharedDoc)]);

    expect(docs.newswire.items[0].headline).toBe("The agency wrote this");
    expect(docs.newswire.items).toHaveLength(1);
    expect(status.newswire).toBe("shared");
  });

  it("serves the fixture when neither the board nor the agency has a document", () => {
    const { docs, status } = docsFromRows([], []);

    expect(docs.newswire).toEqual(fixture());
    expect(status.newswire).toBe("default");
  });

  /* The board's document is broken, but the agency's is not — dropping all the
     way to the built-in demo content would be a bigger regression than showing
     the shared copy the editor would have seen anyway. */
  it("falls from an invalid board document to the shared default, not to the fixture", () => {
    const reported: Array<[string, string]> = [];
    const { docs, status } = docsFromRows(
      [row("newswire", { items: [] })],
      [row("newswire", sharedDoc)],
      (key, _error, scope) => reported.push([key, scope])
    );

    expect(docs.newswire.items[0].headline).toBe("The agency wrote this");
    // Still "invalid": what the editor must fix is this board's saved document.
    expect(status.newswire).toBe("invalid");
    expect(reported).toEqual([["newswire", "board"]]);
  });

  /* One bad shared document is the only write in this system whose blast
     radius is every client at once. It must cost one module its shared copy,
     never a board its own content and never an error on screen. */
  it("degrades an invalid shared default to the fixture without touching a board that has its own", () => {
    const reported: Array<[string, string]> = [];
    const { docs, status } = docsFromRows(
      [row("newswire", boardDoc)],
      [row("newswire", { items: "nope" }), row("opinion-leaders", { people: 42 })],
      (key, _error, scope) => reported.push([key, scope])
    );

    expect(docs.newswire.items[0].headline).toBe("The board wrote this");
    expect(status.newswire).toBe("custom");
    expect(docs["opinion-leaders"]).toEqual(byKey("opinion-leaders").fixture());
    expect(status["opinion-leaders"]).toBe("default");
    // The board's own newswire won outright, so its broken shared twin was never read.
    expect(reported).toEqual([["opinion-leaders", "shared"]]);
  });

  /* Shared rows are, by construction, the same input every board parses, so
     they are the one place a leaked reference would reach every client. */
  it("clones the shared default, so two boards never share one object", () => {
    const defaults = [row("newswire", sharedDoc)];
    const first = docsFromRows([], defaults);
    const second = docsFromRows([], defaults);

    expect(first.docs.newswire).toEqual(second.docs.newswire);
    expect(first.docs.newswire).not.toBe(second.docs.newswire);
    expect(first.docs.newswire.items).not.toBe(second.docs.newswire.items);

    first.docs.newswire.items[0].headline = "Rewritten in place";
    first.docs.newswire.items.push(first.docs.newswire.items[0]);

    expect(second.docs.newswire.items[0].headline).toBe("The agency wrote this");
    expect(second.docs.newswire.items).toHaveLength(1);
    expect(sharedDoc.items[0].headline).toBe("The agency wrote this");
  });
});
