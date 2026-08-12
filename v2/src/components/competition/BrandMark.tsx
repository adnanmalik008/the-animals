import type { BrandId } from "@/data/competition";

/* Abstract CSS/SVG brand marks — no external images on the dark board.
   Each mark evokes the brand's visual language without reproducing the logo. */

export function BrandMark({
  id,
  size = 28,
  className = "",
}: {
  id: BrandId;
  size?: number;
  className?: string;
}) {
  if (id === "patagonia") {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md ${className}`}
      >
        <svg viewBox="0 0 32 32" width={size} height={size}>
          <defs>
            <linearGradient id="pg-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7b5ea7" />
              <stop offset="55%" stopColor="#c25b8a" />
              <stop offset="100%" stopColor="#e58a4e" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" fill="url(#pg-sky)" />
          <path d="M0 24 L6 15 L10 20 L15 11 L20 19 L25 13 L32 22 L32 32 L0 32 Z" fill="#141220" />
        </svg>
      </span>
    );
  }

  if (id === "arcteryx") {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#1c1c1c] ${className}`}
      >
        <svg viewBox="0 0 32 32" width={size * 0.72} height={size * 0.72}>
          <path
            d="M5 25 C9 10, 14 5, 26 6 C18 8, 14 12, 12 17 L17 15 L11 20 L14 20 L9 24 Z"
            fill="#f2f2f2"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#101010] ${className}`}
    >
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62}>
        {/* quarter-dome arcs */}
        <path d="M4 26 A 22 22 0 0 1 26 4 L26 9 A 17 17 0 0 0 9 26 Z" fill="#ffffff" />
        <path d="M13 26 A 13 13 0 0 1 26 13 L26 18 A 8 8 0 0 0 18 26 Z" fill="#ffffff" />
      </svg>
    </span>
  );
}
