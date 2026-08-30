import type { BrandId } from "@/data/competition";

/* Real brand marks, exported from the design file. Patagonia keeps its
   colour; Arc'teryx and The North Face are white lockups drawn for the
   dark board, so each sits on the tile the design gives it. */

const marks: Record<BrandId, { src: string; tile: string; inset: number }> = {
  patagonia: { src: "/assets/competition/logo-patagonia.svg", tile: "bg-[#1c1c1c]", inset: 0 },
  arcteryx: { src: "/assets/competition/logo-arcteryx.svg", tile: "bg-[#1c1c1c]", inset: 0.14 },
  northface: { src: "/assets/competition/logo-northface.svg", tile: "bg-[#101010]", inset: 0.12 },
};

export function BrandMark({
  id,
  size = 28,
  className = "",
}: {
  id: BrandId;
  size?: number;
  className?: string;
}) {
  const mark = marks[id];
  const pad = Math.round(size * mark.inset);
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, padding: pad }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md ${mark.tile} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mark.src} alt="" className="h-full w-full object-contain" />
    </span>
  );
}
