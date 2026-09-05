import type { ReactNode } from "react";

/* Small shared pieces for the dark Competition board. */

/** Section titles — SF Pro Display Semibold 48px, 110% line height, no
    letter spacing, per the design's type panel. */
export const bigTitle =
  "font-display text-[32px] font-semibold uppercase leading-[1.1] tracking-normal text-white sm:text-[48px]";

/** Panel-style module title (Media Overlap / Animal View headers). */
export const panelTitle = "text-lg font-semibold tracking-tight text-white";

/** Uppercase kicker above a content group — SF Pro Display Regular 18 at
    70%, 110% line height, no rule beneath, as the design sets "Machine
    Vision" and its peers. */
export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-display text-lg uppercase leading-[1.1] text-white/70 ${className}`}>{children}</p>
  );
}

/** Sentence-case group heading under a kicker — SF Pro Display Semibold 32,
    110% line height, as the design sets "Their AI Profile" and its peers. */
export function GroupHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 font-display text-[32px] font-semibold leading-[1.1] text-white">{children}</h3>
  );
}

/** Subtitle line under a section title — SF Pro Display Regular 18 at 70%,
    16px below the title, set in with it. */
export function Subtitle({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 max-w-4xl font-display text-lg leading-[1.1] text-white/70 sm:pl-12">{children}</p>
  );
}

/** The design's Observations strip: an orange label over the read, on the
    card grey with a hairline. */
export function Observations({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 rounded-2xl border border-white/5 bg-bg3 p-5 ${className}`}>
      <p className="font-display text-xl text-orange">Observations</p>
      <p className="font-display text-base leading-[1.4] text-white/70">{text}</p>
    </div>
  );
}

/** The same label and read inside a card, with no frame of its own. */
export function ObservationsInline({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-1.5 p-5">
      <p className="font-display text-xl text-orange">Observations</p>
      <p className="font-display text-base leading-[1.4] text-white/70">{text}</p>
    </div>
  );
}
