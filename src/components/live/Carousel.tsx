"use client";

/* The carousel furniture the design draws under every sliding module:
   a 44px white disc holding a hand-drawn arrow, a row of 6px dots, and
   another disc. The arrow is the file's own artwork — orange while the
   move is available, silver once the track has run out — and the same
   glyph mirrored serves both directions, exactly as the design does it. */

/* Both are drawn pointing left — the design mirrors one of them for the
   forward button rather than drawing a second arrow. */
const arrow = {
  live: "/assets/social/ui/carousel-live.svg", // orange
  idle: "/assets/social/ui/carousel-idle.svg", // silver
};

export function CarouselArrow({
  dir,
  onClick,
  disabled,
  label,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  /* Two drawings, four states: the colour says whether the move is there
     to make, and the forward button mirrors whichever one it took. */
  const src = disabled ? arrow.idle : arrow.live;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="pointer-events-auto shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 disabled:cursor-default disabled:hover:scale-100 motion-reduce:transition-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className={`size-11 ${dir === "next" ? "-scale-x-100" : ""}`}
      />
    </button>
  );
}

export function CarouselDots({ count, current }: { count: number; current: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`size-1.5 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
            i === current ? "bg-orange" : "bg-silver"
          }`}
        />
      ))}
    </div>
  );
}

/** prev · dots · next, on the design's 24px gaps. */
export function CarouselControls({
  count,
  current,
  onPrev,
  onNext,
  labels,
}: {
  count: number;
  current: number;
  onPrev: () => void;
  onNext: () => void;
  labels: { prev: string; next: string };
}) {
  return (
    <div className="flex items-center justify-center gap-6">
      <CarouselArrow dir="prev" label={labels.prev} disabled={current <= 0} onClick={onPrev} />
      <CarouselDots count={count} current={current} />
      <CarouselArrow dir="next" label={labels.next} disabled={current >= count - 1} onClick={onNext} />
    </div>
  );
}
