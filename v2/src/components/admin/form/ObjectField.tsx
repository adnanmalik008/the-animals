"use client";

/* A group of fields: one fieldset, one child per entry in `spec.fields`.

   Two things it owns beyond laying its children out. A `collapsible` group
   folds into a <details>, opening itself when something inside it is wrong.
   An `optional` group is present or absent, not blank — the toggle writes
   the whole object or deletes the key, because "absent" is what the schema
   and the board both read. */

import { useState } from "react";
import { newId } from "@/lib/cms/ids";
import { pathKey } from "@/lib/cms/paths";
import type { ObjectSpec } from "@/lib/cms/spec";
import type { FieldProps, FieldRenderer, FieldSources } from "./field-types";
import { blankObject, errorsUnder, prefixFromPath } from "./list-ops";
import { fieldError, hint, quietBtn } from "./tokens";

interface Props extends FieldSources {
  spec: ObjectSpec;
  path: FieldProps["path"];
  value: unknown;
  onChange: (value: unknown) => void;
  errors: FieldProps["errors"];
  renderField: FieldRenderer;
}

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;

/** The alt-text fields an image field in this group already renders itself,
    so the group does not render them a second time. */
function altFieldNames(spec: ObjectSpec): Set<string> {
  const owned = new Set<string>();
  for (const field of Object.values(spec.fields)) {
    if (field.kind === "image" && field.alt && field.alt in spec.fields) owned.add(field.alt);
  }
  return owned;
}

export function ObjectField({ spec, path, value, onChange, errors, renderField: Field, ...sources }: Props) {
  const key = pathKey(path);
  const record = asRecord(value);
  const ownError = errors[key];
  const insideCount = errorsUnder(errors, path).length;

  /* a group that hides a failing field is a dead end, so it opens itself the
     moment one appears. Adjusted during render rather than in an effect —
     the group must already be open on the render that shows the error. */
  const [open, setOpen] = useState(insideCount > 0);
  const [lastCount, setLastCount] = useState(insideCount);
  if (spec.collapsible && lastCount !== insideCount) {
    setLastCount(insideCount);
    if (insideCount > 0) setOpen(true);
  }

  /* writing one child: `undefined` means the key goes away, which is how an
     optional child object records "not here" rather than "here but empty" */
  const setChild = (name: string, next: unknown) => {
    const base = { ...(record ?? {}) };
    if (next === undefined) delete base[name];
    else base[name] = next;
    onChange(base);
  };

  const renderChild = (name: string) => {
    const childSpec = spec.fields[name];
    const childPath = [...path, name];

    /* an image renders its alt text beside the preview, so the two are
       edited together instead of a caption drifting from its picture */
    const altName = childSpec.kind === "image" ? childSpec.alt : undefined;
    const altSlot =
      altName && altName in spec.fields ? (
        <Field
          spec={spec.fields[altName]}
          path={[...path, altName]}
          value={record?.[altName]}
          onChange={(next) => setChild(altName, next)}
          errors={errors}
          {...sources}
        />
      ) : undefined;

    return (
      <Field
        key={name}
        spec={childSpec}
        path={childPath}
        value={record?.[name]}
        onChange={(next) => setChild(name, next)}
        errors={errors}
        altSlot={altSlot}
        {...sources}
      />
    );
  };

  const owned = altFieldNames(spec);
  const names = Object.keys(spec.fields).filter((name) => !owned.has(name));
  const body = <div className="flex flex-col gap-4">{names.map(renderChild)}</div>;

  const heading = (
    <>
      {spec.label && <span className="text-sm font-semibold text-ink">{spec.label}</span>}
      {insideCount > 0 && (
        <span className="rounded-full bg-red/10 px-2 py-0.5 text-[11px] font-semibold text-red">
          {insideCount} to fix
        </span>
      )}
    </>
  );

  /* an optional group is a switch, not a set of blank inputs */
  if (spec.optional) {
    const present = record !== undefined;
    return (
      <fieldset className="flex flex-col gap-2 rounded-xl border border-line bg-bg2/40 p-4">
        <legend className="sr-only">{spec.label ?? key}</legend>
        <div className="flex flex-wrap items-center gap-2">
          {heading}
          <button
            type="button"
            onClick={() =>
              onChange(present ? undefined : blankObject(spec, () => newId(prefixFromPath(path, "id"))))
            }
            className={`${quietBtn} ml-auto`}
          >
            {present ? "Remove" : "Add"}
          </button>
        </div>
        {spec.help && <p className={hint}>{spec.help}</p>}
        {ownError && <p className={fieldError}>{ownError}</p>}
        {present && <div className="mt-2">{body}</div>}
      </fieldset>
    );
  }

  if (spec.collapsible) {
    return (
      <fieldset className="rounded-xl border border-line bg-bg2/40">
        <legend className="sr-only">{spec.label ?? key}</legend>
        <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-3 hover:bg-bg2 [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="text-graphite">
              {open ? "▾" : "▸"}
            </span>
            {heading}
          </summary>
          <div className="flex flex-col gap-4 border-t border-line px-4 py-4">
            {spec.help && <p className={hint}>{spec.help}</p>}
            {ownError && <p className={fieldError}>{ownError}</p>}
            {body}
          </div>
        </details>
      </fieldset>
    );
  }

  return (
    <fieldset className="flex flex-col gap-4">
      {spec.label && (
        <legend className="mb-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{spec.label}</span>
        </legend>
      )}
      {spec.help && <p className={hint}>{spec.help}</p>}
      {ownError && <p className={fieldError}>{ownError}</p>}
      {body}
    </fieldset>
  );
}
