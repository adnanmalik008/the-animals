"use client";

import { useEffect, useRef } from "react";
import { XIcon } from "./CircleIcon";
import { focusRing } from "./palette";

/* "Clear the board" confirmation.

   Clearing cannot be undone and takes more than what is on this screen —
   the stickers on the Live tab go with the cards they filed — so the dialog
   counts what is about to go and says where the rest of it was. Cancel is
   the focused, default action; the destructive one has to be chosen. */
export function ClearBoardModal({
  insightCount,
  ideaCount,
  circleCount,
  onClose,
  onConfirm,
}: {
  insightCount: number;
  ideaCount: number;
  circleCount: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lines = [
    [insightCount, insightCount === 1 ? "insight card" : "insight cards"],
    [ideaCount, ideaCount === 1 ? "fused idea" : "fused ideas"],
    [circleCount, circleCount === 1 ? "circle you added" : "circles you added"],
  ] as const;

  const nothingToClear = insightCount + ideaCount + circleCount === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-board-title"
    >
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-[460px] rounded-3xl bg-card p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-graphite transition-colors hover:bg-bg2 hover:text-ink ${focusRing}`}
        >
          <XIcon size={16} />
        </button>

        <h2 id="clear-board-title" className="font-serif text-2xl font-bold text-ink">
          Clear the board?
        </h2>

        {nothingToClear ? (
          <p className="mt-3 text-sm leading-relaxed text-graphite">
            There is nothing on this board yet — no cards, no ideas, no circles of your own.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-graphite">
              This removes, for everyone who opens this board:
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-ink">
              {lines
                .filter(([count]) => count > 0)
                .map(([count, label]) => (
                  <li key={label} className="flex items-baseline gap-2">
                    <span className="font-semibold tabular-nums">{count}</span>
                    <span className="text-graphite">{label}</span>
                  </li>
                ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-graphite">
              The seven built-in circles stay, empty. Every sticker on the Live tab comes off with
              the card it filed. This cannot be undone.
            </p>
          </>
        )}

        <div className="mt-6 flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className={`flex-1 rounded-full border border-line py-3 text-base font-medium text-ink transition-colors hover:bg-bg2 ${focusRing}`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={nothingToClear}
            onClick={onConfirm}
            className={`flex-1 rounded-full bg-red py-3 text-base font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
          >
            Clear board
          </button>
        </div>
      </div>
    </div>
  );
}
