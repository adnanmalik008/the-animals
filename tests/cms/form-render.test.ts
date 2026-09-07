/* Does the renderer actually render?

   There is no jsdom here, but `renderToStaticMarkup` needs none: it runs in
   plain node and still executes every component, hook and branch. That is
   enough to prove each `FieldSpec.kind` has a working branch — not only a
   branch the typechecker counted — and, more usefully, that a document
   missing a value still produces a *controlled* input rather than one React
   would later flip from uncontrolled to controlled.

   The controls are shadcn/ui, and two Radix habits shape what this file can
   look at. State lives in attributes: a checkbox is a `role="checkbox"`
   button whose `data-state` reads checked or unchecked, not a native box.
   And a select's items are mounted in a portal on the client, so none of
   them — not the offered ones, not the one the renderer adds to hold on to a
   value the options no longer offer — ever reaches this markup. Where a mark
   has to read an attribute instead of text it is a regular expression. */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { refKey } from "@/lib/cms/refs";
import { f } from "@/lib/cms/spec";
import type { FieldSpec } from "@/lib/cms/spec";
import { WIDGET_DEFAULTS } from "@/lib/cms/widgets";
import type { FieldErrors } from "@/lib/cms/parse";
import { Field } from "@/components/admin/form/Field";
import { ErrorSummary, FieldAnchors } from "@/components/admin/form/ErrorSummary";
import type { FieldSources } from "@/components/admin/form/field-types";

function render(spec: FieldSpec, value: unknown, errors: FieldErrors = {}, sources: FieldSources = {}) {
  return renderToStaticMarkup(
    createElement(
      FieldAnchors,
      null,
      createElement(Field, { spec, path: ["field"], value, onChange: () => {}, errors, ...sources })
    )
  );
}

/* one spec per kind in the union — the list is the test */
/* named so a test can build the key the renderer will look under */
const REF_SOURCE = { list: "circles", labelField: "name" } as const;

const SPECS: Record<FieldSpec["kind"], FieldSpec> = {
  text: f.text({ label: "Headline", maxLength: 40 }),
  textarea: f.textarea({ label: "Summary", rows: 3 }),
  number: f.number({ label: "Rank", min: 1, max: 9, integer: true }),
  boolean: f.boolean({ label: "Live" }),
  select: f.select({ label: "Tone", options: [{ value: "orange", label: "Orange" }] }),
  url: f.url({ label: "Link" }),
  image: f.image({ label: "Logo", aspect: "16/9" }),
  color: f.color({ label: "Tint" }),
  id: f.id(),
  ref: f.ref({ label: "Circle", source: REF_SOURCE }),
  object: f.object({ label: "Clock", fields: { label: f.text({ label: "Label" }) } }),
  list: f.list({ label: "Rows", item: f.text({ label: "Row" }) }),
  custom: f.custom({ label: "Points", widget: "points12" }),
};

/* Radix's select trigger carries `data-placeholder` only while it is showing
   its placeholder, so "out of the placeholder state" is how SSR says "this
   control holds a value". The `=` matters: the trigger's own class list
   mentions the `data-placeholder:` Tailwind variant, which is not it. */
const SELECT_HOLDS_A_VALUE = /role="combobox"(?![^>]*data-placeholder=)/;

/* For each kind: what the document holds, the mark that value must leave in
   the markup, and the mark the *empty* rendering must leave. Both are
   specific on purpose — "it rendered something" would pass on an empty div,
   and the empty case is the one that decides whether an input is controlled.
   A mark is a substring where the value is printed into the markup, and a
   regular expression where a Radix control states it in attributes. */
const SAMPLES: Record<FieldSpec["kind"], { value: unknown; shows: string | RegExp; blank: string | RegExp }> = {
  text: { value: "Hello", shows: 'value="Hello"', blank: 'value=""' },
  textarea: { value: "Hello", shows: ">Hello</textarea>", blank: "></textarea>" },
  number: { value: 3, shows: 'value="3"', blank: 'value=""' },
  /* the box is a button that spells both states out, so "unchecked" is a
     state to read rather than an attribute that is merely missing */
  boolean: {
    value: true,
    shows: /role="checkbox"[^>]*data-state="checked"/,
    blank: /role="checkbox"[^>]*data-state="unchecked"/,
  },
  /* the option labels are portalled, so a held value shows as the trigger
     being out of its placeholder state; the placeholder itself is printed */
  select: { value: "orange", shows: SELECT_HOLDS_A_VALUE, blank: ">Choose…</span>" },
  url: { value: "https://example.com", shows: 'value="https://example.com"', blank: 'value=""' },
  image: { value: "/assets/logo.png", shows: 'src="/assets/logo.png"', blank: ">No image<" },
  color: { value: "#ff4500", shows: 'value="#ff4500"', blank: 'value="#000000"' },
  id: { value: "nw-1234abcd", shows: "nw-1234abcd", blank: ">—</span>" },
  ref: { value: "news", shows: 'value="news"', blank: 'value=""' },
  object: { value: { label: "GMT+1" }, shows: 'value="GMT+1"', blank: 'value=""' },
  list: { value: ["one", "two"], shows: 'value="one"', blank: "Nothing here yet." },
  custom: { value: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], shows: 'value="7"', blank: 'value="0"' },
};

describe("every kind renders", () => {
  for (const kind of Object.keys(SPECS) as FieldSpec["kind"][]) {
    const spec = SPECS[kind];
    const { value, shows, blank } = SAMPLES[kind];

    it(`${kind} renders the value the document holds`, () => {
      expect(render(spec, value)).toMatch(shows);
    });

    /* a saved doc can simply not have the key. The field still has to draw
       its shell — the label the editor clicks to find it — and an empty
       control, not a missing one. */
    it(`${kind} renders an empty control when the document has no value`, () => {
      const html = render(spec, undefined);
      const label = kind === "id" ? "ID" : (spec as { label?: string }).label;
      expect(label).toBeDefined();
      expect(html).toContain(label);
      expect(html).toMatch(blank);
    });
  }
});

/* React only warns about a controlled/uncontrolled switch at the moment it
   happens, in a browser. Asserting the markup carries an explicit value is
   how that is caught here instead. */
describe("inputs are controlled even when the document has no value", () => {
  it("text and url bind an empty string", () => {
    expect(render(SPECS.text, undefined)).toContain('value=""');
    expect(render(SPECS.url, undefined)).toContain('value=""');
  });

  /* React renders a controlled textarea's value as its child text, so the
     proof is that the child follows the value in both directions */
  it("a textarea is bound by its child text, empty when there is no value", () => {
    expect(render(SPECS.textarea, "Hello")).toContain(">Hello</textarea>");
    expect(render(SPECS.textarea, undefined)).toContain("></textarea>");
  });

  it("a number bound to a non-number is empty, not NaN", () => {
    const html = render(SPECS.number, "not a number");
    expect(html).toContain('value=""');
    expect(html).not.toContain("NaN");
  });

  /* Radix also renders a hidden `<input type="checkbox">` beside the button
     so a form submits something, which is why these read the button: the
     mirror would say "checked" even if the real control never did. */
  it("a checkbox is unchecked rather than absent", () => {
    expect(render(SPECS.boolean, undefined)).toMatch(/role="checkbox"[^>]*data-state="unchecked"/);
    expect(render(SPECS.boolean, true)).toMatch(/role="checkbox"[^>]*data-state="checked"/);
  });

  it("a failing checkbox is announced invalid like every other control", () => {
    expect(render(SPECS.boolean, false, { field: "Required" })).toMatch(
      /role="checkbox"[^>]*aria-invalid="true"/
    );
  });

  /* The renderer answers an unrecognised value by adding an item for it, so
     the select still shows what the document holds. That item is portalled,
     so this markup cannot see it — what it can see is that the trigger is
     holding a value rather than sitting in its placeholder, exactly as it
     does for a value the options do offer. The item itself is client-side,
     and `choice` is internal to Field, so there is no unit of it to call. */
  it("a select keeps a value its options no longer offer", () => {
    const stale = render(SPECS.select, "chartreuse");
    expect(stale).toMatch(SELECT_HOLDS_A_VALUE);
    expect(stale).not.toContain('data-placeholder=""');
    expect(stale).not.toContain(">Choose…</span>");

    // the contrast: a document with nothing in it *is* the placeholder state
    expect(render(SPECS.select, undefined)).toContain('data-placeholder=""');
  });

  it("a colour swatch falls back to a valid hex while the text keeps the raw value", () => {
    const html = render(SPECS.color, "not-a-colour");
    expect(html).toContain('value="#000000"');
    expect(html).toContain('value="not-a-colour"');
  });

  it("widgets narrow a malformed value instead of binding it", () => {
    const html = render(SPECS.custom, ["nonsense"]);
    expect(html).not.toContain("nonsense");
    expect(html).toContain('value="0"');
  });
});

describe("field wiring", () => {
  it("an id is read-only: no input, just the value", () => {
    const html = render(SPECS.id, "nw-1234abcd");
    expect(html).toContain("nw-1234abcd");
    expect(html).not.toContain("<input");
  });

  it("an error is announced on the control and printed beneath it", () => {
    const html = render(SPECS.text, "", { field: "Required" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="cms-field-error"');
    expect(html).toContain('id="cms-field-error"');
    expect(html).toContain("Required");
  });

  it("help is wired to the control by id", () => {
    const html = render(f.text({ label: "Byline", help: "Printed uppercase." }), "");
    expect(html).toContain('aria-describedby="cms-field-help"');
    expect(html).toContain('id="cms-field-help"');
  });

  it("a ref with no source list falls back to a text input", () => {
    expect(render(SPECS.ref, "news")).toContain("<input");
    const withOptions = render(SPECS.ref, "news", {}, {
      refSources: { [refKey(REF_SOURCE)]: [{ value: "news", label: "News" }] },
    });
    /* given rows to offer it becomes a Radix select instead: a combobox
       trigger carrying the field's id and holding the stored value, and no
       text box to type an id into. "News" is an item's label, mounted in a
       portal on the client, so it is not in this markup to look for. */
    expect(withOptions).toContain('data-slot="select-trigger"');
    expect(withOptions).toContain('role="combobox"');
    expect(withOptions).toContain('id="cms-field"');
    expect(withOptions).toMatch(SELECT_HOLDS_A_VALUE);
    expect(withOptions).not.toContain("<input");
  });

  /* The key is the document *and* the list: one document can hold two, and
     keying by the document alone handed a field the other list's rows. */
  it("a ref ignores options filed under the document alone", () => {
    const html = render(SPECS.ref, "news", {}, { refSources: { self: [{ value: "news", label: "News" }] } });
    expect(html).toContain("<input");
    expect(html).not.toContain('role="combobox"');
  });

  it("an image renders its alt field beside the preview, and only once", () => {
    const spec = f.object({
      fields: { hero: f.image({ label: "Hero", alt: "heroAlt" }), heroAlt: f.text({ label: "Hero alt text" }) },
    });
    const html = render(spec, { hero: "/assets/a.png", heroAlt: "A dog" });
    expect(html.match(/Hero alt text/g)).toHaveLength(1);
    expect(html).toContain("A dog");
  });

  it("a collapsed row shows that something inside it is wrong", () => {
    const spec = f.list({
      label: "Articles",
      summary: "headline",
      item: f.object({ fields: { headline: f.text({ label: "Headline" }) } }),
    });
    const html = render(spec, [{ headline: "First" }, { headline: "Second" }], {
      "field.1.headline": "Required",
    });
    expect(html).toContain("Second");
    expect(html).toContain("1 to fix");
  });

  it("an optional group offers Add and renders nothing until it is added", () => {
    const spec = f.object({ label: "Late arrival", optional: true, fields: { note: f.text({ label: "Note" }) } });
    expect(render(spec, undefined)).not.toContain("Note");
    expect(render(spec, undefined)).toContain(">Add<");
    expect(render(spec, { note: "hi" })).toContain("Note");
  });

  /* newswire's `incoming` is optional AND collapsible today. If `optional`
     wins, a whole duplicate article form sits permanently expanded under a
     twelve-row list — the exact readability problem `collapsible` exists to
     prevent. */
  it("a group that is both optional and collapsible stays collapsible", () => {
    const spec = f.object({
      label: "Late arrival",
      optional: true,
      collapsible: true,
      fields: { headline: f.text({ label: "Headline" }) },
    });

    // absent: a compact header with Add, nothing to expand
    const absent = render(spec, undefined);
    expect(absent).toContain(">Add<");
    expect(absent).not.toContain("Headline");

    // present: the body is behind a <details>, closed, with Remove offered
    const present = render(spec, { headline: "Late one" });
    expect(present).toContain("<details");
    expect(present).toContain(">Remove<");
    expect(present).toContain("Headline");
    expect(present).not.toContain("<details open");
  });

  it("an optional collapsible group opens itself when a field inside it fails", () => {
    const spec = f.object({
      label: "Late arrival",
      optional: true,
      collapsible: true,
      fields: { headline: f.text({ label: "Headline" }) },
    });
    const html = render(spec, { headline: "" }, { "field.headline": "Required" });
    expect(html).toContain("<details open");
    expect(html).toContain("1 to fix");
  });

  it("a list at the document root does not emit an id of '-title'", () => {
    const html = renderToStaticMarkup(
      createElement(
        FieldAnchors,
        null,
        createElement(Field, {
          spec: f.list({ label: "Rows", item: f.text({ label: "Row" }) }),
          path: [],
          value: [],
          onChange: () => {},
          errors: {},
        })
      )
    );
    expect(html).not.toContain('"-title"');
    expect(html).toContain('id="cms-doc-title"');
    expect(html).toContain('aria-labelledby="cms-doc-title"');
  });

  it("a list at its maximum disables Add and says why", () => {
    const spec = f.list({ label: "Rows", max: 2, item: f.text({ label: "Row" }) });
    /* Scoped to the Add button and to the attribute. A bare
       toContain("disabled") matches the row's own Move/Delete buttons, and
       even within one button it matches the `disabled:` Tailwind variants
       sitting in its class list — so the class attribute goes first. */
    const addButton = (html: string) =>
      (html.match(/<button[^>]*aria-label="Add to Rows"[^>]*>/)?.[0] ?? "NO ADD BUTTON").replace(/class="[^"]*"/, "");

    const full = render(spec, ["one", "two"]);
    expect(addButton(full)).toContain('disabled=""');
    expect(full).toContain("At most 2 items");

    const room = render(spec, ["one"]);
    expect(addButton(room)).toContain("<button");
    expect(addButton(room)).not.toContain("disabled");
    expect(room).not.toContain("At most 2 items");
  });
});

/* widgets/index.ts states the contract: the bare `id` goes on the editor's
   first control. Field puts its <label for> on that id, so an editor that
   never emits it leaves the field's own label pointing at nothing. */
describe("every widget honours the id contract", () => {
  const cases: [string, ReturnType<typeof f.custom>, unknown][] = [
    ["points12", f.custom({ label: "Weekly", widget: "points12" }), WIDGET_DEFAULTS.points12()],
    ["presence3", f.custom({ label: "Seen on", widget: "presence3" }), WIDGET_DEFAULTS.presence3()],
    ["circles7", f.custom({ label: "Circles", widget: "circles7" }), WIDGET_DEFAULTS.circles7()],
  ];

  for (const [name, spec, value] of cases) {
    it(`${name} puts the bare id on its first control, once`, () => {
      const html = render(spec, value);
      expect(html).toContain('for="cms-field"');
      expect(html.match(/ id="cms-field"/g)).toHaveLength(1);
    });
  }
});

describe("the three custom widgets", () => {
  it("points12 draws twelve boxes and a sparkline over them", () => {
    const html = render(f.custom({ label: "Weekly", widget: "points12" }), [
      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 50,
    ]);
    expect(html.match(/type="number"/g)).toHaveLength(12);
    expect(html).toContain("<path");
    expect(html).toContain("M0.00,56.00"); // week 1 at zero sits on the floor
    expect(html).toContain("W12");
  });

  it("presence3 draws three checkboxes, named when the module names them", () => {
    const spec = f.custom({ label: "Seen on", widget: "presence3" });
    const plain = render(spec, [true, false, true]);
    expect(plain.match(/role="checkbox"/g)).toHaveLength(3);
    expect(plain).toContain("Column 1");

    const named = render(spec, [true, false, true], {}, { widgetColumns: { field: ["Nike", "Adidas", "Puma"] } });
    expect(named).toContain("Adidas");
    expect(named).not.toContain("Column 1");
  });

  it("circles7 draws the seven fixed circles and never shows an id", () => {
    const html = render(f.custom({ label: "Circles", widget: "circles7" }), WIDGET_DEFAULTS.circles7());
    /* rows are shadcn table rows, so they are counted by their slot — and
       only inside the body, because the header is one of those rows too */
    const body = html.slice(html.indexOf('data-slot="table-body"'));
    expect(body.match(/data-slot="table-row"/g)).toHaveLength(7);
    expect(html).toContain("Key Influencers");
    expect(html).not.toContain("key-influencers</"); // the id is a key, not content
    // colour, icon and size per row — Radix triggers, not native <select>s
    expect(html.match(/data-slot="select-trigger"/g)).toHaveLength(21);
  });
});

describe("ErrorSummary", () => {
  it("counts the errors and names each one", () => {
    const html = renderToStaticMarkup(
      createElement(ErrorSummary, { errors: { "items.0.headline": "Required", title: "Required" } })
    );
    expect(html).toContain("2 fields need attention");
    expect(html).toContain("Items › 1 › Headline");
  });

  it("says nothing when there is nothing wrong", () => {
    expect(renderToStaticMarkup(createElement(ErrorSummary, { errors: {} }))).toBe("");
  });
});
