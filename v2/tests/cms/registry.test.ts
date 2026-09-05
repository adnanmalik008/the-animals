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

  it("finds a definition by key", () => {
    expect(byKey("newswire")?.heading).toEqual({ eyebrow: "Dispatch", title: "Newswire" });
    expect(byKey("nope")).toBeUndefined();
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
});
