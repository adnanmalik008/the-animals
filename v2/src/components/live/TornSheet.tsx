/* The torn paper sheet that slides in behind a row — Newswire's, shared.
   One PNG, one colour, one bleed: the sheet reaches the panel edge past
   the column padding, and its ragged top and bottom come from the design's
   own strip via the .torn-sheet mask. Modules that used to draw their own
   paper (a flat veil, a cover-cropped card) all render this instead, so the
   effect reads the same everywhere and nothing cover-crops into dark
   corners.

   The sheet is translucent, as it is in the design — the column's own
   crumple shows through it. Its strength is --sheet-strength, so every
   module's sheet reads alike. The host row must carry
   `torn-host group/row relative isolate`. */
export function TornSheet({
  tint,
  bleed = "column",
  shown = "hover",
  className = "",
}: {
  /** per-publisher paper shade; omit for the board's default sheet */
  tint?: string;
  /** "column" bleeds past the column padding; "list" also clears the
      Inbox list's own inner padding so it still meets the panel edge */
  bleed?: "column" | "list";
  /** true keeps the sheet on; "hover" fades it in while the host row is
      hovered; false hides it */
  shown?: boolean | "hover";
  className?: string;
}) {
  const inset = bleed === "list" ? "-inset-x-9 sm:-inset-x-14" : "-inset-x-4 sm:-inset-x-8";
  const state =
    shown === true
      ? "opacity-(--sheet-strength)"
      : shown === "hover"
        ? "opacity-0 group-hover/row:opacity-(--sheet-strength)"
        : "opacity-0";
  return (
    <div
      aria-hidden
      style={tint ? { ["--paper-tint" as string]: tint } : undefined}
      className={`torn-sheet pointer-events-none absolute -inset-y-1 -z-10 transition-opacity duration-200 motion-reduce:transition-none ${inset} ${state} ${className}`}
    />
  );
}
