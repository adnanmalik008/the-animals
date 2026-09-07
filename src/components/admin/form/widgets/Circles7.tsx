"use client";

/* The seven Anomalies circles. The set is fixed — a circle's id is what a
   sticker files against, so rows cannot be added, removed, reordered, and
   the ids are never shown. Only the four things about a circle that are
   presentation are editable. */

import { CIRCLE_COLORS, CIRCLE_ICONS, CIRCLE_IDS, CIRCLE_SIZES } from "@/lib/cms/widgets";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WidgetEditorProps } from "./index";
import { toCircles7 } from "./values";

const SIZE_LABELS: Record<(typeof CIRCLE_SIZES)[number], string> = { sm: "Small", md: "Medium", lg: "Large" };

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Circles7({ value, onChange, id, describedBy, invalid }: WidgetEditorProps) {
  const circles = toCircles7(value);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className="min-w-[34rem]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Colour</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CIRCLE_IDS.map((circleId, row) => {
            const circle = circles[circleId];
            const patch = (fields: Partial<(typeof circles)[typeof circleId]>) =>
              onChange({ ...circles, [circleId]: { ...circle, ...fields } });
            const describe = row === 0 ? describedBy : undefined;

            return (
              <TableRow key={circleId}>
                <TableCell>
                  <Input
                    // the field's own <label for> points at the bare id
                    id={row === 0 ? id : `${id}-${circleId}-name`}
                    value={circle.name}
                    maxLength={24}
                    aria-label={`Circle ${row + 1} name`}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describe}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={circle.color}
                    onValueChange={(next) => patch({ color: next as (typeof CIRCLE_COLORS)[number] })}
                  >
                    <SelectTrigger id={`${id}-${circleId}-color`} aria-label={`Circle ${row + 1} colour`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CIRCLE_COLORS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {title(o)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={circle.icon}
                    onValueChange={(next) => patch({ icon: next as (typeof CIRCLE_ICONS)[number] })}
                  >
                    <SelectTrigger id={`${id}-${circleId}-icon`} aria-label={`Circle ${row + 1} icon`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CIRCLE_ICONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o === "none" ? "No icon" : title(o)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={circle.size}
                    onValueChange={(next) => patch({ size: next as (typeof CIRCLE_SIZES)[number] })}
                  >
                    <SelectTrigger id={`${id}-${circleId}-size`} aria-label={`Circle ${row + 1} size`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CIRCLE_SIZES.map((o) => (
                        <SelectItem key={o} value={o}>
                          {SIZE_LABELS[o]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
