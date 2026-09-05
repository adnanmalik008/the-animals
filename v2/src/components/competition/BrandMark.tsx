import type { BrandId } from "@/data/competition";

/* Real brand marks, exported from the design file. Patagonia keeps its
   colour; Arc'teryx and The North Face are white lockups drawn for the
   dark board, so each sits on the tile the design gives it. The mark is
   inset by a share of the tile, so the tile can be any size — a pixel
   count in a header, a percentage of its parent in a diagram. */

/* Patagonia's art is a 7:4 landscape, so it fills the tile and the tile's
   corners crop it, the way the design shows it; the two white lockups are
   square and sit inset on the lighter tile the design gives them. */
const marks: Record<BrandId, { src: string; tile: string; inset: number; fit: "cover" | "contain" }> = {
  patagonia: { src: "/assets/competition/logo-patagonia.svg", tile: "bg-[#1c1c1c]", inset: 0, fit: "cover" },
  arcteryx: { src: "/assets/competition/logo-arcteryx.svg", tile: "bg-[#2a2a2a]", inset: 0.14, fit: "contain" },
  northface: { src: "/assets/competition/logo-northface.svg", tile: "bg-[#262626]", inset: 0.12, fit: "contain" },
};

export function BrandMark({
  id,
  size = 28,
  rounded = "rounded-md",
  className = "",
}: {
  id: BrandId;
  /** px, or any CSS length — "100%" fills a sized parent */
  size?: number | string;
  /** the tile's corner rounding, as a utility class */
  rounded?: string;
  className?: string;
}) {
  const mark = marks[id];
  const inner = `${Math.round((1 - mark.inset * 2) * 100)}%`;
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${rounded} ${mark.tile} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mark.src}
        alt=""
        style={{ width: inner, height: inner }}
        className={mark.fit === "cover" ? "object-cover" : "object-contain"}
      />
    </span>
  );
}
