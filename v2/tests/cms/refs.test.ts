/* Ref options and widget columns: the two things a FieldSpec cannot carry
   because they live in another document.

   Both were declared and threaded long before anything produced them, so
   these tests cover the producer — and, first of all, the key it files
   under, which is where the bug was. */
import { describe, expect, it } from "vitest";
import {
  buildRefSources,
  buildWidgetColumns,
  collectRefSources,
  optionsFor,
  refKey,
} from "@/lib/cms/refs";
import { byKey } from "@/lib/cms/registry";
import { f, type Fields } from "@/lib/cms/spec";

const competitorsDoc = {
  competitors: [
    { id: "patagonia", name: "Patagonia" },
    { id: "arcteryx", name: "Arc'teryx" },
  ],
};

describe("refKey", () => {
  it("separates two lists in one document", () => {
    const a = refKey({ doc: "reddit", list: "subreddits" });
    const b = refKey({ doc: "reddit", list: "influencers" });
    expect(a).not.toBe(b);
  });

  it("files a source with no document under the document being edited", () => {
    expect(refKey({ list: "items" })).toBe("self:items");
  });
});

describe("collectRefSources", () => {
  const fields: Fields = {
    rows: f.list({
      label: "Rows",
      item: f.object({
        fields: {
          id: f.id(),
          who: f.ref({ label: "Competitor", source: { doc: "competitors", list: "competitors", labelField: "name" } }),
          note: f.object({
            fields: {
              also: f.ref({ label: "Also", source: { doc: "competitors", list: "competitors", labelField: "name" } }),
              other: f.ref({ label: "Other", source: { list: "rows", labelField: "label" } }),
            },
          }),
        },
      }),
    }),
  };

  it("finds refs at any depth, and each source only once", () => {
    const sources = collectRefSources(fields);
    expect(sources).toHaveLength(2);
    expect(sources.map(refKey).sort()).toEqual(["competitors:competitors", "self:rows"]);
  });

  it("finds nothing in a tree with no refs", () => {
    expect(collectRefSources({ title: f.text({ label: "Title" }) })).toEqual([]);
  });
});

describe("optionsFor", () => {
  const source = { doc: "competitors", list: "competitors", labelField: "name" };

  it("labels each row by its named field", () => {
    expect(optionsFor(competitorsDoc, source)).toEqual([
      { value: "patagonia", label: "Patagonia" },
      { value: "arcteryx", label: "Arc'teryx" },
    ]);
  });

  it("skips a row that has no usable id, since the option could not be stored", () => {
    const doc = { competitors: [{ name: "No id" }, { id: "", name: "Blank id" }, { id: "ok", name: "Fine" }] };
    expect(optionsFor(doc, source)).toEqual([{ value: "ok", label: "Fine" }]);
  });

  it("falls back to the id when the label is missing, so the row is still selectable", () => {
    expect(optionsFor({ competitors: [{ id: "solo" }] }, source)).toEqual([{ value: "solo", label: "solo" }]);
  });

  it("shrugs off a document that is not there, or a list that is not a list", () => {
    expect(optionsFor(undefined, source)).toEqual([]);
    expect(optionsFor({ competitors: "nope" }, source)).toEqual([]);
  });
});

describe("buildRefSources", () => {
  const fields: Fields = {
    rows: f.list({
      label: "Rows",
      item: f.object({
        fields: {
          id: f.id(),
          who: f.ref({ label: "Competitor", source: { doc: "competitors", list: "competitors", labelField: "name" } }),
        },
      }),
    }),
  };

  it("resolves a source against another module's document", () => {
    const sources = buildRefSources(fields, { competitors: competitorsDoc }, {});
    expect(sources[refKey({ doc: "competitors", list: "competitors", labelField: "name" })]).toHaveLength(2);
  });

  it("leaves an empty source out entirely, so the field stays a typed id", () => {
    expect(buildRefSources(fields, {}, {})).toEqual({});
    expect(buildRefSources(fields, { competitors: { competitors: [] } }, {})).toEqual({});
  });

  it("reads a document-less source from the document being edited, unsaved and all", () => {
    const selfFields: Fields = {
      rows: f.list({ label: "Rows", item: f.object({ fields: { id: f.id(), label: f.text({ label: "L" }) } }) }),
      pick: f.ref({ label: "Pick", source: { list: "rows", labelField: "label" } }),
    };
    const draft = { rows: [{ id: "r-1", label: "Typed just now" }] };
    const sources = buildRefSources(selfFields, {}, draft);
    expect(sources["self:rows"]).toEqual([{ value: "r-1", label: "Typed just now" }]);
  });
});

describe("buildWidgetColumns", () => {
  const fields: Fields = {
    rows: f.list({
      label: "Rows",
      item: f.object({
        fields: {
          id: f.id(),
          presence: f.custom({
            label: "Presence",
            widget: "presence3",
            columns: { doc: "competitors", list: "competitors", labelField: "name" },
          }),
        },
      }),
    }),
  };

  it("names the columns of the widget in every row", () => {
    const doc = { rows: [{ id: "a", presence: [true, false, true] }, { id: "b", presence: [false, false, false] }] };
    const columns = buildWidgetColumns(fields, { competitors: competitorsDoc }, doc);
    expect(columns["rows.0.presence"]).toEqual(["Patagonia", "Arc'teryx"]);
    expect(columns["rows.1.presence"]).toEqual(["Patagonia", "Arc'teryx"]);
  });

  it("says nothing when the source has no rows, so the widget keeps its fallback headers", () => {
    const doc = { rows: [{ id: "a", presence: [true, false, true] }] };
    expect(buildWidgetColumns(fields, {}, doc)).toEqual({});
  });

  it("leaves a widget that names no source alone", () => {
    const plain: Fields = { points: f.custom({ label: "Points", widget: "points12" }) };
    expect(buildWidgetColumns(plain, { competitors: competitorsDoc }, {})).toEqual({});
  });
});

describe("the competitors module is a usable ref source", () => {
  it("offers every competitor, labelled by name", () => {
    const options = optionsFor(byKey("competitors").fixture(), {
      doc: "competitors",
      list: "competitors",
      labelField: "name",
    });
    expect(options.map((o) => o.value)).toEqual(["patagonia", "arcteryx", "northface"]);
    expect(options.map((o) => o.label)).toEqual(["Patagonia", "Arc'teryx", "The North Face"]);
  });
});
