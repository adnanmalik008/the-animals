import type { ReactNode } from "react";

/* Small shared pieces for the dark Competition board. */

/** Section titles — SF Pro Display Semibold 48px, 110% line height, no
    letter spacing, per the design's type panel. */
export const bigTitle =
  "font-display text-[32px] font-semibold uppercase leading-[1.1] tracking-normal text-white sm:text-[48px]";

/** Panel-style module title (Media Overlap / Animal View headers). */
export const panelTitle = "text-lg font-semibold tracking-tight text-white";

/** Rounded near-black panel that wraps each section's content. */
export function DarkPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 rounded-3xl bg-bg3 p-5 sm:p-7 ${className}`}>{children}</div>
  );
}

/** Small uppercase tracking-widest kicker above a content group. */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="border-b border-white/10 pb-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/40">
      {children}
    </p>
  );
}

/** Sentence-case group heading under a kicker. */
export function GroupHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-5 text-xl font-bold tracking-tight text-white">{children}</h3>
  );
}

/** Muted subtitle line rendered directly under a module title. */
export function Subtitle({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 max-w-xl text-sm text-white/50">{children}</p>;
}
