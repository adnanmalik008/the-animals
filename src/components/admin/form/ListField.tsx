"use client";

/* A list of rows, collapsed to their summaries.

   Twelve newswire articles open at once is unreadable, so a row shows its
   headline until you open it. The consequences of that are what this
   component is: a collapsed row still has to announce an error inside it,
   and the expanded rows have to follow their content when the list is
   reordered — both handled by pure functions in list-ops.ts.

   Row bodies are <details>, not React-only state, so the error summary can
   open an ancestor row on its way to a buried field. */

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, X } from "lucide-react";
import { newId } from "@/lib/cms/ids";
import { pathKey } from "@/lib/cms/paths";
import type { ListSpec } from "@/lib/cms/spec";
import type { FieldProps, FieldRenderer, FieldSources } from "./field-types";
import {
  afterInsert,
  afterMove,
  afterRemove,
  errorsUnder,
  listBounds,
  newRow,
  rowSummary,
  withFreshIds,
} from "./list-ops";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props extends FieldSources {
  spec: ListSpec;
  path: FieldProps["path"];
  value: unknown;
  onChange: (value: unknown) => void;
  errors: FieldProps["errors"];
  renderField: FieldRenderer;
}

function RowButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function ListField({ spec, path, value, onChange, errors, renderField: Field, ...sources }: Props) {
  const rows = Array.isArray(value) ? value : [];
  const key = pathKey(path);
  // a list at the document root has an empty path key; "-title" is not an id
  const titleId = `cms-${key || "doc"}-title`;
  const ownError = errors[key];
  const bounds = listBounds(spec, rows.length);

  /* which rows are expanded, by index — every operation moves them with the
     rows they belong to */
  const [open, setOpen] = useState<number[]>([]);
  const mint = () => newId(spec.idPrefix ?? "row");

  const commit = (next: unknown[]) => onChange(next);

  const add = () => {
    commit([...rows, newRow(spec)]);
    setOpen((was) => [...afterInsert(was, rows.length), rows.length]);
  };

  const duplicate = (index: number) => {
    const copy = [...rows];
    copy.splice(index + 1, 0, withFreshIds(spec.item, rows[index], mint));
    commit(copy);
    setOpen((was) => [...afterInsert(was, index + 1), index + 1]);
  };

  const remove = (index: number) => {
    commit(rows.filter((_, i) => i !== index));
    setOpen((was) => afterRemove(was, index));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    commit(next);
    setOpen((was) => afterMove(was, from, to));
  };

  const toggle = (index: number, isOpen: boolean) =>
    setOpen((was) => (isOpen ? (was.includes(index) ? was : [...was, index]) : was.filter((i) => i !== index)));

  return (
    <section className="flex flex-col gap-2" aria-labelledby={titleId}>
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 id={titleId} className="text-sm font-semibold">
          {spec.label}
        </h3>
        <span className="text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? "item" : "items"}
        </span>
      </div>
      {spec.help && <p className="text-xs text-muted-foreground">{spec.help}</p>}
      {ownError && <p className="text-xs font-medium text-destructive">{ownError}</p>}

      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">
          Nothing here yet.
        </p>
      )}

      <ol className="flex flex-col gap-2">
        {rows.map((row, index) => {
          const rowPath = [...path, index];
          const inside = errorsUnder(errors, rowPath).length;
          const isOpen = open.includes(index);

          return (
            <li key={index} className="relative rounded-lg border bg-card">
              <details open={isOpen} onToggle={(e) => toggle(index, e.currentTarget.open)}>
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg py-2.5 pl-3 pr-36 hover:bg-muted/60 [&::-webkit-details-marker]:hidden">
                  <span aria-hidden className="w-3 shrink-0 text-muted-foreground">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{rowSummary(spec, row, index)}</span>
                  {/* a collapsed row must still say something inside it is wrong */}
                  {inside > 0 && (
                    <Badge variant="destructive" className="shrink-0">
                      {inside} to fix
                    </Badge>
                  )}
                </summary>
                <div className="border-t px-4 py-4">
                  <Field
                    spec={spec.item}
                    path={rowPath}
                    value={row}
                    onChange={(next) => commit(rows.map((r, i) => (i === index ? next : r)))}
                    errors={errors}
                    {...sources}
                  />
                </div>
              </details>

              {/* outside the <summary>: buttons nested in one are unreliable */}
              <div className="absolute right-2 top-1.5 flex items-center gap-1">
                <RowButton label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}>
                  <ArrowUp />
                </RowButton>
                <RowButton
                  label="Move down"
                  disabled={index === rows.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown />
                </RowButton>
                <RowButton label="Duplicate" disabled={!bounds.canAdd} onClick={() => duplicate(index)}>
                  <Copy />
                </RowButton>
                <RowButton label="Delete" disabled={!bounds.canRemove} onClick={() => remove(index)}>
                  <X />
                </RowButton>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={!bounds.canAdd}
          aria-label={`Add to ${spec.label}`}
        >
          <Plus />
          Add
        </Button>
        {bounds.addReason && <span className="text-xs text-muted-foreground">{bounds.addReason}</span>}
        {!bounds.canRemove && bounds.removeReason && rows.length > 0 && (
          <span className="text-xs text-muted-foreground">{bounds.removeReason}</span>
        )}
      </div>
    </section>
  );
}
