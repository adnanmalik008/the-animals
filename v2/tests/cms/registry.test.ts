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
    const first = docsFromRows([]);
    const second = docsFromRows([]);
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

/* The read chain, in full: the agency's saved document, then the fixture
   built into the code. There is one set of content for the whole product, so
   the same document reaches every board and the same fixture stands in
   wherever nothing is saved. */
describe("docsFromRows read chain", () => {
  const fixture = () => byKey("newswire").fixture();
  const withHeadline = (headline: string) => {
    const base = fixture();
    return { ...base, items: [{ ...base.items[0], headline }] };
  };
  const savedDoc = withHeadline("The agency wrote this");
  const row = (module_key: string, data: unknown) => ({ module_key, data });

  it("serves the saved document when there is one", () => {
    const { docs, status } = docsFromRows([row("newswire", savedDoc)]);

    expect(docs.newswire.items[0].headline).toBe("The agency wrote this");
    expect(docs.newswire.items).toHaveLength(1);
    expect(status.newswire).toBe("custom");
  });

  it("serves the fixture when nothing is saved", () => {
    const { docs, status } = docsFromRows([]);

    expect(docs.newswire).toEqual(fixture());
    expect(status.newswire).toBe("default");
  });

  /* A saved document that no longer fits its definition must cost that one
     module its content and nothing else: the fixture takes its place, the
     other modules are untouched, and the failure is reported rather than
     thrown at a client. */
  it("degrades an invalid saved document to the fixture, one module at a time", () => {
    const reported: string[] = [];
    const { docs, status } = docsFromRows(
      [row("newswire", { items: [] }), row("opinion-leaders", { people: 42 })],
      (key) => reported.push(key)
    );

    expect(docs.newswire).toEqual(fixture());
    expect(status.newswire).toBe("invalid");
    expect(docs["opinion-leaders"]).toEqual(byKey("opinion-leaders").fixture());
    expect(status["opinion-leaders"]).toBe("invalid");
    expect(docs["traffic-sources"]).toEqual(byKey("traffic-sources").fixture());
    expect(status["traffic-sources"]).toBe("default");
    expect(reported.sort()).toEqual(["newswire", "opinion-leaders"]);
  });

  /* A saved row is by construction the same input every board parses, so it
     is the one place a leaked reference would reach every client at once. */
  it("clones the saved document, so two boards never share one object", () => {
    const rows = [row("newswire", savedDoc)];
    const first = docsFromRows(rows);
    const second = docsFromRows(rows);

    expect(first.docs.newswire).toEqual(second.docs.newswire);
    expect(first.docs.newswire).not.toBe(second.docs.newswire);
    expect(first.docs.newswire.items).not.toBe(second.docs.newswire.items);

    first.docs.newswire.items[0].headline = "Rewritten in place";
    first.docs.newswire.items.push(first.docs.newswire.items[0]);

    expect(second.docs.newswire.items[0].headline).toBe("The agency wrote this");
    expect(second.docs.newswire.items).toHaveLength(1);
    expect(savedDoc.items[0].headline).toBe("The agency wrote this");
  });
});

/* The four Live editorial modules wired after the form engine. Their fixtures
   are covered by the round-trip above; what needs its own proof is the rules
   that were added with them, because a regex that matches nothing still lets
   every fixture through. */
describe("live editorial modules", () => {
  it.each([
    ["on-stage", "events", "quote"],
    ["in-their-inbox", "sends", "quote"],
  ] as const)("%s: the %s' %s refuses the quote marks the card prints itself", (key, list, field) => {
    const def = byKey(key);
    const fixture = def.fixture() as Record<string, Record<string, unknown>[]>;
    const rows = fixture[list];

    for (const wrapped of ['"Quoted by hand"', "«Quoted by hand»", "“Quoted by hand”"]) {
      const doc = { ...fixture, [list]: [{ ...rows[0], [field]: wrapped }, ...rows.slice(1)] };
      const res = parseDoc(def, doc);
      expect(res.ok, `${wrapped} was accepted`).toBe(false);
    }

    /* and an internal quote is still allowed — the rule is about the ends */
    const inner = { ...fixture, [list]: [{ ...rows[0], [field]: 'They said "no" and left' }, ...rows.slice(1)] };
    expect(parseDoc(def, inner).ok).toBe(true);
  });

  it("on-stage: an empty event list is refused, because the card reads events[0]", () => {
    const def = byKey("on-stage");
    expect(parseDoc(def, { events: [] }).ok).toBe(false);
    expect(parseDoc(def, def.fixture()).ok).toBe(true);
  });

  it("on-stage: a hashtag without its # is refused", () => {
    const def = byKey("on-stage");
    const fixture = def.fixture();
    const withTag = (hashtag: string) => ({
      ...fixture,
      events: [{ ...fixture.events[0], hashtag }, ...fixture.events.slice(1)],
    });
    expect(parseDoc(def, withTag("TRE2026")).ok).toBe(false);
    expect(parseDoc(def, withTag("#TRE 2026")).ok).toBe(false);
    expect(parseDoc(def, withTag("#TRE2026")).ok).toBe(true);
  });

  it("conversation: replyTo is the only optional field on a quote", () => {
    const def = byKey("conversation");
    const fixture = def.fixture();
    const withoutReply: Partial<(typeof fixture.quotes)[number]> = { ...fixture.quotes[0] };
    delete withoutReply.replyTo;
    const res = parseDoc(def, { quotes: [withoutReply] });
    expect(res.ok, res.ok ? "" : JSON.stringify(res.fieldErrors)).toBe(true);
    if (res.ok) expect(res.doc.quotes[0].replyTo).toBeUndefined();

    const withoutHandle: Partial<(typeof fixture.quotes)[number]> = { ...fixture.quotes[0] };
    delete withoutHandle.handle;
    expect(parseDoc(def, { quotes: [withoutHandle] }).ok).toBe(false);
  });

  it("social-pulse: the platform set is closed, since each value keys a brand mark", () => {
    const def = byKey("social-pulse");
    const fixture = def.fixture();
    const withPlatform = (platform: string) => ({
      ...fixture,
      posts: [{ ...fixture.posts[0], platform }, ...fixture.posts.slice(1)],
    });
    expect(parseDoc(def, withPlatform("threads")).ok).toBe(false);
    expect(parseDoc(def, withPlatform("tiktok")).ok).toBe(true);
  });
});
