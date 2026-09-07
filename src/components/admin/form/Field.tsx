"use client";

/* One FieldSpec → one control.

   The switch below has no `default` and returns `ReactElement`, which is
   what makes it exhaustive: `ReactNode` would include `undefined`, so a
   missing branch would compile and render nothing. With this return type a
   new `kind` in spec.ts fails the typecheck here until it has a branch.

   Every control is controlled: a document can hold anything, so each branch
   narrows its value to a string, number or boolean before binding it. A
   value that arrives `undefined` becomes "" — never a React input that
   silently switches from controlled to uncontrolled halfway through.

   The controls themselves are shadcn/ui, so the CMS looks like one product
   rather than a form engine with its own dialect. */

import type { ReactElement } from "react";
import { Lock } from "lucide-react";
import { pathKey } from "@/lib/cms/paths";
import { refKey } from "@/lib/cms/refs";
import type { FieldSpec } from "@/lib/cms/spec";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFieldAnchor } from "./ErrorSummary";
import type { FieldProps } from "./field-types";
import { ImageField } from "./ImageField";
import { ListField } from "./ListField";
import { ObjectField } from "./ObjectField";
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
  if ((spec.kind === "text" || spec.kind === "textarea") && spec.patternHint)
    return help ? `${help} ${spec.patternHint}.` : `${spec.patternHint}.`;
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
  const common = {
    id: controlId,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
  };

  /* A `select` or `ref` whose stored value the options no longer offer still
     has to show that value rather than silently reading as empty.

     `value` is passed straight through, including "". Mapping "" to
     `undefined` reads as tidier and is a bug: Radix treats `prop !== undefined`
     as "controlled", so an empty field would mount UNCONTROLLED, keep its own
     sticky value, and go on displaying a choice the document no longer holds —
     while Save sends the document. Radix already shows the placeholder for ""
     (`shouldShowPlaceholder`), so there is nothing to map. */
  function choice(
    current: string,
    options: readonly { readonly value: string; readonly label: string }[],
    placeholder: string
  ): ReactElement {
    const known = options.some((o) => o.value === current);
    return (
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger {...common} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {!known && current !== "" && <SelectItem value={current}>{current}</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  function control(): ReactElement {
    switch (spec.kind) {
      case "text":
        return (
          <Input
            {...common}
            type="text"
            maxLength={spec.maxLength}
            value={asText(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "textarea":
        return (
          <Textarea
            {...common}
            rows={spec.rows ?? 4}
            maxLength={spec.maxLength}
            value={asText(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "number":
        return (
          <Input
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
          <div className="flex items-center gap-2">
            <Checkbox
              id={controlId}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              checked={value === true}
              onCheckedChange={(checked) => onChange(checked === true)}
            />
            <Label htmlFor={controlId}>{spec.label}</Label>
          </div>
        );

      case "select":
        return choice(asText(value), spec.options, "Choose…");

      case "url":
        return (
          <Input
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
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-background p-1"
            />
            <Input
              {...common}
              type="text"
              spellCheck={false}
              placeholder="#FF4500"
              value={raw}
              onChange={(e) => onChange(e.target.value)}
              className="font-mono"
            />
          </div>
        );
      }

      /* never editable: a sticker on the Live board files against this id,
         so regenerating one orphans a client's saved work */
      case "id":
        return (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
            <Lock className="size-3" />
            {asText(value) || "—"}
          </span>
        );

      case "ref": {
        const options = sources.refSources?.[refKey(spec.source)] ?? [];
        const current = asText(value);
        /* nothing to choose from yet — the referenced module may not be
           filled in, so let the id be typed rather than blocking the field */
        if (options.length === 0) {
          return (
            <Input
              {...common}
              type="text"
              spellCheck={false}
              placeholder="id of the row to link"
              value={current}
              onChange={(e) => onChange(e.target.value)}
              className="font-mono"
            />
          );
        }
        return choice(current, options, "Choose…");
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
    <div ref={anchor} tabIndex={-1} className="flex flex-col gap-2 outline-none">
      {showLabel &&
        /* the id chip is not a labelable control, so it gets a plain caption */
        (spec.kind === "id" ? (
          <span className="text-sm font-medium">{label}</span>
        ) : (
          <Label htmlFor={controlId}>{label}</Label>
        ))}
      {control()}
      {/* object and list print their own help and error beside their legend */}
      {showMessages && help && (
        <p id={helpId} className="text-xs text-muted-foreground">
          {help}
        </p>
      )}
      {showMessages && error && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
