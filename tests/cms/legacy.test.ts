/* Backward-compatibility net: the shapes the current raw-JSON admin editor
   saves today (snapshotted from MODULE_TEMPLATES by
   scripts/snapshot-legacy-templates.ts) must still parse once a module gets
   a registry definition — including quirks a saved doc can carry that the
   fixture no longer does (e.g. opinion-leaders' dead `initials` field). */
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { byKey } from "@/lib/cms/registry";
import { parseDoc } from "@/lib/cms/parse";

import aiVisibilityLegacy from "./legacy/ai-visibility.json";
import appStoreLegacy from "./legacy/app-store.json";
import channelMixLegacy from "./legacy/channel-mix.json";
import conversationLegacy from "./legacy/conversation.json";
import hiringLegacy from "./legacy/hiring.json";
import newswireLegacy from "./legacy/newswire.json";
import onStageLegacy from "./legacy/on-stage.json";
import opinionLeadersLegacy from "./legacy/opinion-leaders.json";
import pulseLegacy from "./legacy/pulse.json";
import redditLegacy from "./legacy/reddit.json";
import searchVelocityLegacy from "./legacy/search-velocity.json";
import shareOfVoiceLegacy from "./legacy/share-of-voice.json";
import topSitesLegacy from "./legacy/top-sites.json";
import socialPulseLegacy from "./legacy/social-pulse.json";
import trafficSourcesLegacy from "./legacy/traffic-sources.json";
import wildCamsLegacy from "./legacy/wild-cams.json";

const LEGACY_DOCS: Record<string, unknown> = {
  newswire: newswireLegacy,
  "social-pulse": socialPulseLegacy,
  conversation: conversationLegacy,
  "on-stage": onStageLegacy,
  "ai-visibility": aiVisibilityLegacy,
  "share-of-voice": shareOfVoiceLegacy,
  "search-velocity": searchVelocityLegacy,
  "top-sites": topSitesLegacy,
  pulse: pulseLegacy,
  hiring: hiringLegacy,
  "opinion-leaders": opinionLeadersLegacy,
  "traffic-sources": trafficSourcesLegacy,
  "wild-cams": wildCamsLegacy,
  /* parses only because channel-mix carries a `migrate`: the fields it
     drops are the ones the competitive set now owns. */
  "channel-mix": channelMixLegacy,
};

describe("legacy saved shapes", () => {
  it.each(Object.entries(LEGACY_DOCS))("%s: the saved shape still parses", (key, raw) => {
    const def = byKey(key);
    expect(def, `no registry definition for ${key}`).toBeDefined();
    const res = parseDoc(def!, raw);
    expect(res.ok, res.ok ? "" : JSON.stringify(res.fieldErrors)).toBe(true);
  });

  it("opinion-leaders: a row saved without platform defaults to linkedin", () => {
    const def = byKey("opinion-leaders");
    const doc = {
      leaders: [
        { id: "ol-1", name: "Kofi Mensah", role: "Run culture analyst", eng: 92, followers: "2.1M", tone: "ember" },
      ],
    };
    const res = parseDoc(def, doc);
    expect(res.ok, res.ok ? "" : JSON.stringify(res.fieldErrors)).toBe(true);
    if (res.ok) expect(res.doc.leaders[0].platform).toBe("linkedin");
  });

  it("traffic-sources: a doc saved without period/region/scope fills the defaults", () => {
    const def = byKey("traffic-sources");
    const doc = { channels: [{ id: "tc-1", label: "Direct", value: 42 }] };
    const res = parseDoc(def, doc);
    expect(res.ok, res.ok ? "" : JSON.stringify(res.fieldErrors)).toBe(true);
    if (res.ok) {
      expect(res.doc.period).toBe("Jan 2026");
      expect(res.doc.region).toBe("Worldwide");
      expect(res.doc.scope).toBe("All Traffic");
    }
  });

  it("wild-cams: an empty thumbnail string parses to undefined", () => {
    const def = byKey("wild-cams");
    const doc = {
      cams: [
        { id: "cam-1", name: "Test Cam", location: "Test Reserve", videoId: "abcdefghijk", thumbnail: "", emoji: "🐘" },
      ],
    };
    const res = parseDoc(def, doc);
    expect(res.ok, res.ok ? "" : JSON.stringify(res.fieldErrors)).toBe(true);
    if (res.ok) expect(res.doc.cams[0].thumbnail).toBeUndefined();
  });

  it("opinion-leaders: the legacy doc's dead initials field is stripped, not rejected", () => {
    /* Pin the input first. This assertion is the only thing standing between
       the one deliberately hand-edited snapshot and a silently vacuous test:
       if opinion-leaders.json ever loses `initials`, "no leader carries it
       afterwards" passes for the wrong reason. */
    const input = opinionLeadersLegacy as { leaders: Record<string, unknown>[] };
    expect(input.leaders.length).toBeGreaterThan(0);
    for (const leader of input.leaders) {
      expect(typeof leader.initials, `legacy/opinion-leaders.json lost its hand-edited initials field`).toBe("string");
    }

    const def = byKey("opinion-leaders");
    const res = parseDoc(def, opinionLeadersLegacy);
    expect(res.ok, res.ok ? "" : JSON.stringify(res.fieldErrors)).toBe(true);
    if (res.ok) {
      for (const leader of res.doc.leaders) {
        expect("initials" in leader).toBe(false);
      }
    }
  });

  it("newswire: an empty items list is rejected", () => {
    const def = byKey("newswire");
    const res = parseDoc(def, { items: [] });
    expect(res.ok).toBe(false);
  });
});

/* Reddit is the one snapshot deliberately left out of LEGACY_DOCS above.
   Its template was already stale: it stores `insights` as one flat list,
   while the board has rendered three states behind pills — drivers,
   problems, solutions — for as long as the module has existed. So the
   shape the old editor would have saved was never the shape the board
   reads, and preserving it would mean carrying a shape nothing renders.
   Production holds zero saved documents, so nothing is lost; this test
   records the reason rather than asserting it. */
describe("reddit's legacy template was stale before it was wired", () => {
  it("stored one flat list where the board reads three states", () => {
    const legacy = redditLegacy as { insights: unknown };
    expect(Array.isArray(legacy.insights)).toBe(true);

    const def = byKey("reddit");
    expect(Object.keys(def.fields.insights.fields).sort()).toEqual(["drivers", "problems", "solutions"]);

    /* and so it does not parse — which is why it is not in the net above */
    expect(parseDoc(def, legacy).ok).toBe(false);
  });

  it("gives every insight an id, so a sticker survives a reorder", () => {
    const def = byKey("reddit");
    const fixture = def.fixture();
    const ids = [
      ...fixture.insights.drivers,
      ...fixture.insights.problems,
      ...fixture.insights.solutions,
    ].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.length > 0)).toBe(true);
  });
});

/* app-store is the second deliberate omission, for the same kind of reason
   as reddit: its movement chips had no ids, because the board keyed a
   sticker on the chip's own label — renaming a theme moved its sticker to
   the new name and orphaned what was filed under the old one. Giving the
   chips ids is the fix, and a document written before they existed cannot
   supply them. Zero documents exist, so this costs nothing. */
describe("app-store's legacy template predates the chip ids", () => {
  it("has chips with no id, which is the defect the ids close", () => {
    const legacy = appStoreLegacy as { ios: { stats: Record<string, unknown>[] } };
    expect(legacy.ios.stats.length).toBeGreaterThan(0);
    expect(legacy.ios.stats.every((stat) => stat.id === undefined)).toBe(true);
    expect(parseDoc(byKey("app-store"), legacy).ok).toBe(false);
  });

  it("gives every chip an id in the fixture that replaces it", () => {
    const fixture = byKey("app-store").fixture();
    const ids = [...fixture.ios.stats, ...fixture.android.stats].map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/* ============================================================
   Every snapshot is accounted for, one way or the other.

   A snapshot either parses — and is in LEGACY_DOCS above, where it is
   checked — or its module's shape deliberately moved on and it is listed
   here with the reason. Nothing may fall between the two: the last test
   reads the directory and fails on a snapshot that is in neither list, so
   a module wired tomorrow cannot quietly drop its own compatibility.

   Abandoning a shape costs nothing today: production holds zero saved
   documents, and these are the shapes the *old raw-JSON editor* would have
   written, not documents anyone has. Every entry below is a shape the
   board never actually read, or one that gained the identity it needed.
   ============================================================ */
const ABANDONED: Record<string, string> = {
  reddit: "stored insights as one flat list; the board renders three states behind pills",
  "app-store": "movement chips had no ids, so a sticker keyed on the chip's own label",
  "media-overlap": "rows had no identity at all, so nothing could be filed against one",
  "animal-view": "paragraphs were bare strings; each is a row with an id now",
  "show-up": "screenshots lived in a hardcoded map keyed by the brand union, not on the row",
  horizon: "columns named a brand instead of referencing the competitive set, and events had no ids",
  "ai-profile": "the template predates the module: it stored one blob, not a profile per competitor",
  "search-landscape": "same — the per-competitor shape did not exist when the template was written",
};

describe("every legacy snapshot is either kept or abandoned on the record", () => {
  const snapshots = readdirSync(new URL("./legacy/", import.meta.url)).map((f) => f.replace(/\.json$/, ""));

  it("has a snapshot for every key it claims to cover", () => {
    expect(snapshots.length).toBeGreaterThan(0);
    for (const key of [...Object.keys(LEGACY_DOCS), ...Object.keys(ABANDONED)]) {
      expect(snapshots, `${key} is listed but has no snapshot`).toContain(key);
    }
  });

  it("accounts for every snapshot exactly once", () => {
    for (const key of snapshots) {
      const kept = key in LEGACY_DOCS;
      const abandoned = key in ABANDONED;
      expect(kept || abandoned, `${key} is in neither LEGACY_DOCS nor ABANDONED`).toBe(true);
      expect(kept && abandoned, `${key} is in both lists`).toBe(false);
    }
  });

  /* The reason has to stay true: a shape recorded as abandoned that quietly
     starts parsing means the note above is now a lie about the code. */
  it("an abandoned shape really does not parse", () => {
    for (const [key, reason] of Object.entries(ABANDONED)) {
      const def = byKey(key);
      expect(def, `${key} has no definition`).toBeDefined();
      const raw = JSON.parse(readFileSync(new URL(`./legacy/${key}.json`, import.meta.url), "utf8"));
      expect(parseDoc(def!, raw).ok, `${key} parses now — remove it from ABANDONED (${reason})`).toBe(false);
    }
  });
});
