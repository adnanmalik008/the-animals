/* The admin's class vocabulary, in one place.

   These started life at the top of app/admin/ui.tsx; the generated form is a
   second surface that has to look like the first, so they moved here and
   ui.tsx re-exports them. Plain strings, no "use client" — a server component
   can import them too. */

export const input =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-graphite/60 outline-none focus-visible:ring-2 focus-visible:ring-orange/70";

export const label = "flex flex-col gap-1.5 text-sm font-medium";

export const primaryBtn =
  "rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70";

export const quietBtn =
  "rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-graphite transition-colors hover:bg-bg2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70";

export const card = "rounded-2xl border border-line bg-card p-6 shadow-sm";

/* ---------------- added for the generated form ---------------- */

/** `quietBtn` for buttons the form disables at a list's bounds — the plain
    token gives a disabled button no visual difference at all. */
export const quietBtnDisablable = `${quietBtn} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-graphite`;

/** the message under a field that failed validation */
export const fieldError = "text-xs font-medium text-red";

/** the quiet line under a field: its `help`, or why a button is disabled */
export const hint = "text-xs text-graphite";

/** a control that has an error — pairs with `input` */
export const invalidRing = "border-red/60 focus-visible:ring-red/50";
