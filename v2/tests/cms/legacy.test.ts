/* Backward-compatibility net: the shapes the current raw-JSON admin editor
   saves today (snapshotted from MODULE_TEMPLATES by
   scripts/snapshot-legacy-templates.ts) must still parse once a module gets
   a registry definition — including quirks a saved doc can carry that the
   fixture no longer does (e.g. opinion-leaders' dead `initials` field). */
import { describe, expect, it } from "vitest";
import { byKey } from "@/lib/cms/registry";
import { parseDoc } from "@/lib/cms/parse";

import conversationLegacy from "./legacy/conversation.json";
import newswireLegacy from "./legacy/newswire.json";
import onStageLegacy from "./legacy/on-stage.json";
import opinionLeadersLegacy from "./legacy/opinion-leaders.json";
import socialPulseLegacy from "./legacy/social-pulse.json";
import trafficSourcesLegacy from "./legacy/traffic-sources.json";
import wildCamsLegacy from "./legacy/wild-cams.json";

const LEGACY_DOCS: Record<string, unknown> = {
  newswire: newswireLegacy,
  "social-pulse": socialPulseLegacy,
  conversation: conversationLegacy,
  "on-stage": onStageLegacy,
  "opinion-leaders": opinionLeadersLegacy,
  "traffic-sources": trafficSourcesLegacy,
  "wild-cams": wildCamsLegacy,
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
