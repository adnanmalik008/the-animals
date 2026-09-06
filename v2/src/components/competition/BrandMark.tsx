"use client";

/* A competitor's mark.

   The art, the tile it sits on and how far it is inset all come from the
   `competitors` document now — they used to be a hardcoded map keyed by a
   three-value union, which is why a client could not bring its own
   competitive set. Callers still pass an id, so nothing above this changed.

   The mark is inset by a share of the tile, so the tile can be any size: a
   pixel count in a header, a percentage of its parent in a diagram. */

import { useModuleDoc } from "@/components/board/BoardDataContext";
import type { ModuleDocs } from "@/lib/cms/types";

export type Competitor = ModuleDocs["competitors"]["competitors"][number];

/** The row for an id, or undefined when a document names one that is gone. */
export function useCompetitor(id: string): Competitor | undefined {
  return useModuleDoc("competitors").competitors.find((c) => c.id === id);
}

export function BrandMark({
  id,
  size = 28,
  rounded = "rounded-md",
  plate = false,
  className = "",
}: {
  id: string;
  /** px, or any CSS length — "100%" fills a sized parent */
  size?: number | string;
  /** the tile's corner rounding, as a utility class */
  rounded?: string;
  /** a translucent white plate instead of the brand's own tile colour —
      the channel cards set every mark this way */
  plate?: boolean;
  className?: string;
}) {
  const mark = useCompetitor(id);

  /* An id with no competitor behind it draws the empty tile rather than
     nothing, so a layout built around a row of marks keeps its shape. */
  const inner = `${Math.round((1 - (mark?.inset ?? 0) / 100 * 2) * 100)}%`;

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, background: plate ? undefined : mark?.tile }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${rounded} ${
        plate ? "bg-white/5" : ""
      } ${className}`}
    >
      {mark && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={mark.logo}
          alt=""
          style={{ width: inner, height: inner }}
          className={mark.fit === "cover" ? "object-cover" : "object-contain"}
        />
      )}
    </span>
  );
}
