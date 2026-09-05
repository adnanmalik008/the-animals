"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "./CircleIcon";
import { focusRing } from "./palette";

/* "Your insight" quick-capture card (Figma frame 12). Also the editor for a
   card already on the board: pass initialText and the Save button rewrites
   the card instead of adding one.
   Desktop: floats under a circle's Add Insight pill (absolute, via className).
   Mobile: rendered inline inside a topic panel (closeOnOutside=false).
   Outside clicks are detected with a document listener rather than a fixed
   backdrop — the popover lives inside transformed ancestors (lava drift,
   zoom scale), which would scope position:fixed to the wrong box. */
export function AddInsightPopover({
  onSave,
  onClose,
  className = "",
  closeOnOutside = true,
  initialText = "",
  heading = "Your insight",
}: {
  onSave: (text: string) => void;
  onClose: () => void;
  className?: string;
  closeOnOutside?: boolean;
  initialText?: string;
  heading?: string;
}) {
  const [text, setText] = useState(initialText);
  const ref = useRef<HTMLDivElement>(null);
  const trimmed = text.trim();
  const editing = initialText !== "";
  const unchanged = editing && trimmed === initialText.trim();

  useEffect(() => {
    if (!closeOnOutside) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      // ignore the trigger pill: its own click handles the toggle, and closing
      // here first would make that click immediately reopen the popover
      if (target?.closest("[data-add-insight-trigger]")) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [closeOnOutside, onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={editing ? "Edit insight" : "Add insight"}
      className={`rounded-2xl border border-line bg-card p-4 text-left shadow-xl print:hidden ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">{heading}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`-mr-1 -mt-1 rounded-full p-1 text-graphite transition-colors hover:bg-bg2 hover:text-ink ${focusRing}`}
        >
          <XIcon size={12} />
        </button>
      </div>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 120))}
        maxLength={120}
        rows={3}
        placeholder="Add a thought, a link, or something you noticed..."
        className={`mt-3 w-full resize-none rounded-xl border border-line bg-card px-3.5 py-3 text-sm text-ink placeholder:text-graphite/70 ${focusRing}`}
      />
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={!trimmed || unchanged}
          onClick={() => trimmed && !unchanged && onSave(trimmed)}
          className={`rounded-full bg-orange px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className={`rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg2 ${focusRing}`}
        >
          Clear
        </button>
        <span className="ml-auto text-xs tabular-nums text-graphite" aria-live="polite">
          {text.length} / 120
        </span>
      </div>
    </div>
  );
}
