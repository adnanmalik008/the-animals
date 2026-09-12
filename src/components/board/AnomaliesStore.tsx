"use client";

import { useEffect } from "react";
import type { AnomaliesDoc } from "@/lib/anomalies/types";
import { hydrateBoard, refreshBoard } from "@/lib/insights";

/* Hands the board the server read the layout already did, and keeps it
   current afterwards.

   Rendered above the page in the (board) layout, so it runs before anything
   subscribes to the store: the Live tab's stickers and the Anomalies circles
   then paint the real board on their first render rather than an empty one
   that fills in a moment later.

   Hydrating during render rather than in an effect is the point — an effect
   runs after paint, which is exactly the flash this avoids. Calling it on
   every render is harmless: the store takes the first one and ignores the
   rest, so a double render in development seeds the board once. */
export function AnomaliesStore({ doc }: { doc: AnomaliesDoc }) {
  hydrateBoard(doc);

  /* Somebody else may have been filing cards while this tab sat in the
     background — a second device, the agency's own window, the client's
     phone. Coming back to the foreground is when that shows up, so that is
     when the board re-reads. */
  useEffect(() => {
    const catchUp = () => {
      if (document.visibilityState === "visible") void refreshBoard();
    };
    window.addEventListener("focus", catchUp);
    document.addEventListener("visibilitychange", catchUp);
    return () => {
      window.removeEventListener("focus", catchUp);
      document.removeEventListener("visibilitychange", catchUp);
    };
  }, []);

  return null;
}
