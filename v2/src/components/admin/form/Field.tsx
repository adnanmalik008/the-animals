"use client";

/* One FieldSpec → one control.

   The switch below has no `default` and returns `ReactElement`, which is
   what makes it exhaustive: `ReactNode` would include `undefined`, so a
   missing branch would compile and render nothing. With this return type a
   new `kind` in spec.ts fails the typecheck here until it has a branch.

   Every control is controlled: a document can hold anything, so each branch
   narrows its value to a string, number or boolean before binding it. A
   value that arrives `undefined` becomes "" — never a React input that
   silently switches from controlled to uncontrolled halfway through. */

import type { ReactElement } from "react";
import { pathKey } from "@/lib/cms/paths";
import type { FieldSpec } from "@/lib/cms/spec";
import { useFieldAnchor } from "./ErrorSummary";
import type { FieldProps } from "./field-types";
import { ImageField } from "./ImageField";
import { ListField } from "./ListField";
import { ObjectField } from "./ObjectField";
import { fieldError, hint, input, invalidRing } from "./tokens";
import { WIDGET_EDITORS } from "./widgets";

const asText = (value: unknown): string => (typeof value === "string" ? value : "");
const asNumberText = (value: unknown): string =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

/** `id` has no label of its own, and object/list labels are optional. */
function labelOf(spec: FieldSpec): string | undefined {
  if (spec.kind === "id") return "ID";
  return "label" in spec ? spec.label : undefined;
}

function helpOf(spec: FieldSpec): string | undefined {
  const help = "help" in spec ? spec.help : undefined;
  if (spec.kind === "text" && spec.patternHint) return help ? `${help} ${spec.patternHint}.` : `${spec.patternHint}.`;
  return help;
}

/** Kinds that print their own label — a checkbox wants it beside the box, a
    group wants it as a legend — and those that print their own help and
    error next to it. */
const OWN_LABEL = new Set<FieldSpec["kind"]>(["boolean", "object", "list"]);
const OWN_MESSAGES = new Set<FieldSpec["kind"]>(["object", "list"]);

export function Field({ spec, path, value, onChange, errors, altSlot, ...sources }: FieldProps) {
  const key = pathKey(path);
  const anchor = useFieldAnchor(key);

  const error = errors[key];
  const controlId = `cms-${key || "doc"}`;
  const errorId = `${controlId}-error`;
  const helpId = `${controlId}-help`;
  const help = helpOf(spec);
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const invalid = error !== undefined;
  const ring = invalid ? invalidRing : "";
  const common = {
    id: controlId,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
    className: `${input} ${ring}`,
  };

  function control(): ReactElement {
    switch (spec.kind) {
      case "text":
        return (
          <input
            {...common}
            type="text"
            maxLength={spec.maxLength}
            value={asText(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "textarea":
        return (
          <textarea
            {...common}
            rows={spec.rows ?? 4}
            maxLength={spec.maxLength}
            value={asText(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "number":
        return (
          <input
            {...common}
            type="number"
            inputMode={spec.integer ? "numeric" : "decimal"}
            step={spec.integer ? 1 : (spec.step ?? "any")}
            min={spec.min}
            max={spec.max}
            value={asNumberText(value)}
            /* an emptied box is "no number", not 0 — the schema decides
               whether that is allowed, so the form must not invent a value */
            onChange={(e) => {
              const next = Number(e.target.value);
              onChange(e.target.value === "" || Number.isNaN(next) ? undefined : next);
            }}
          />
        );

      case "boolean":
        return (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              id={controlId}
              type="checkbox"
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 accent-[var(--orange)]"
            />
            {spec.label}
          </label>
        );

      case "select": {
        const current = asText(value);
        const known = spec.options.some((o) => o.value === current);
        return (
          <select {...common} value={current} onChange={(e) => onChange(e.target.value)}>
            {/* a value the options no longer offer still has to show */}
            {!known && <option value={current}>{current === "" ? "Choose…" : current}</option>}
            {spec.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      }

      case "url":
        return (
          <input
            {...common}
            type="text"
            inputMode="url"
            spellCheck={false}
            placeholder="https://…"
            value={asText(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "image":
        return (
          <ImageField
            spec={spec}
            id={controlId}
            value={asText(value)}
            onChange={onChange}
            describedBy={describedBy}
            invalid={invalid}
            altSlot={altSlot}
          />
        );

      case "color": {
        const raw = asText(value);
        const swatch = /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : "#000000";
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={swatch}
              aria-label={`${spec.label} — colour picker`}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-card p-1"
            />
            <input
              {...common}
              type="text"
              spellCheck={false}
              placeholder="#FF4500"
              value={raw}
              onChange={(e) => onChange(e.target.value)}
              className={`${input} ${ring} font-mono`}
            />
          </div>
        );
      }

      /* never editable: a sticker on the Live board files against this id,
         so regenerating one orphans a client's saved work */
      case "id":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg2 px-2.5 py-1.5 font-mono text-xs text-graphite">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 1 1 8 0v4" />
            </svg>
            {asText(value) || "—"}
          </span>
        );

      case "ref": {
        const options = sources.refSources?.[spec.source.doc ?? "self"] ?? [];
        const current = asText(value);
        /* nothing to choose from yet — the referenced module may not be
           filled in, so let the id be typed rather than blocking the field */
        if (options.length === 0) {
          return (
            <input
              {...common}
              type="text"
              spellCheck={false}
              placeholder="id of the row to link"
              value={current}
              onChange={(e) => onChange(e.target.value)}
              className={`${input} ${ring} font-mono`}
            />
          );
        }
        const known = options.some((o) => o.value === current);
        return (
          <select {...common} value={current} onChange={(e) => onChange(e.target.value)}>
            {!known && <option value={current}>{current === "" ? "Choose…" : current}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      }

      case "object":
        return (
          <ObjectField
            spec={spec}
            path={path}
            value={value}
            onChange={onChange}
            errors={errors}
            renderField={Field}
            {...sources}
          />
        );

      case "list":
        return (
          <ListField
            spec={spec}
            path={path}
            value={value}
            onChange={onChange}
            errors={errors}
            renderField={Field}
            {...sources}
          />
        );

      case "custom": {
        const Editor = WIDGET_EDITORS[spec.widget];
        return (
          <Editor
            value={value}
            onChange={onChange}
            id={controlId}
            describedBy={describedBy}
            invalid={invalid}
            columns={sources.widgetColumns?.[key]}
          />
        );
      }
    }
  }

  const label = labelOf(spec);
  const showLabel = label !== undefined && !OWN_LABEL.has(spec.kind);
  const showMessages = !OWN_MESSAGES.has(spec.kind);

  return (
    <div ref={anchor} tabIndex={-1} className="flex flex-col gap-1.5 outline-none">
      {showLabel &&
        /* the id chip is not a labelable control, so it gets a plain caption */
        (spec.kind === "id" ? (
          <span className="text-sm font-medium">{label}</span>
        ) : (
          <label htmlFor={controlId} className="text-sm font-medium">
            {label}
          </label>
        ))}
      {control()}
      {/* object and list print their own help and error beside their legend */}
      {showMessages && help && (
        <p id={helpId} className={hint}>
          {help}
        </p>
      )}
      {showMessages && error && (
        <p id={errorId} className={fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}
