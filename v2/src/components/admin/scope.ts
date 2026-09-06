/* What a module form is editing.

   There are two answers and they differ in almost nothing: one client's
   board, saved to `module_data`, or the agency-wide shared content, saved to
   `module_defaults`. The directory, the rail, the form, the errors and the
   dirty guard are the same surface pointed at one or the other, so the
   difference is carried as data rather than as a second copy of the screens.

   Plain strings only — this crosses the RSC boundary into the form. */

export type EditScope =
  | {
      kind: "board";
      slug: string;
      /** the board's published host, for the "Open board" link */
      host: string;
    }
  | { kind: "defaults" };

export function directoryHref(scope: EditScope): string {
  return scope.kind === "board" ? `/admin/${scope.slug}` : "/admin/defaults";
}

export function moduleHref(scope: EditScope, moduleKey: string): string {
  return scope.kind === "board"
    ? `/admin/${scope.slug}/modules/${moduleKey}`
    : `/admin/defaults/${moduleKey}`;
}

/** The label on the "back to the list" link, in both the rail and the footer. */
export function directoryLabel(scope: EditScope): string {
  return scope.kind === "board" ? "All modules" : "All shared content";
}

/** Second line under a form's title: which thing is being edited. */
export function scopeSubtitle(scope: EditScope): string {
  return scope.kind === "board" ? scope.slug : "shared across every board";
}
