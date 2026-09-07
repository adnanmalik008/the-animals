/* The torn paper sheet that slides in behind a row — Newswire's, shared.
   One PNG, one colour, one bleed: the sheet reaches the panel edge past
   the column padding, and its ragged top and bottom come from the design's
   own strip via the .torn-sheet mask. Modules that used to draw their own
   paper (a flat veil, a cover-cropped card) all render this instead, so the
   effect reads the same everywhere and nothing cover-crops into dark
   corners.

   The design frames the strip as a 775x169 box on a 123px row — about 24px
   of paper above and below the content, the sides clipped by the column —
   with its image fill at 50%, so the column's own crumple shows through.
   -inset-y-6 carries the first; the 50% lives in .torn-sheet's own paper
   layer, so this element fades between 0 and 1 and each sheet keeps whatever
   strength its class sets. The host row must carry
   `torn-host group/row relative isolate`. */
export function TornSheet({
  tint,
  bleed = "column",
  shown = "hover",
  variant = "sheet",
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
  /** which of the design's papers to tear. "sheet" is Newswire's; "stage"
      and "conversation" swap in the scan and strength those modules use;
      "inbox" is In Their Inbox's own opaque paper (see .inbox-sheet) */
  variant?: "sheet" | "stage" | "conversation" | "inbox";
  className?: string;
}) {
  const inset = bleed === "list" ? "-inset-x-9 sm:-inset-x-14" : "-inset-x-4 sm:-inset-x-8";
  const state =
    shown === true
      ? "opacity-100"
      : shown === "hover"
        ? "opacity-0 group-hover/row:opacity-100"
        : "opacity-0";
  const surface =
    variant === "inbox"
      ? "inbox-sheet"
      : variant === "stage"
        ? "torn-sheet sheet-stage"
        : variant === "conversation"
          ? "torn-sheet sheet-conversation"
          : "torn-sheet";
  return (
    <div
      aria-hidden
      style={tint ? { ["--paper-tint" as string]: tint } : undefined}
      className={`${surface} pointer-events-none absolute -inset-y-6 -z-10 transition-opacity duration-200 motion-reduce:transition-none ${inset} ${state} ${className}`}
    />
  );
}
