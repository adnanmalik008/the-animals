"use client";

import { useEffect, useRef, useState } from "react";
import type { TopicCircle } from "@/lib/insights";
import { CircleIcon, XIcon } from "./CircleIcon";
import { circleBadge, circleText, circleTint, colorSolid, focusRing } from "./palette";

type Color = TopicCircle["color"];
type Icon = TopicCircle["icon"];
type Size = TopicCircle["size"];

const COLORS: Color[] = ["orange", "green", "yellow", "blue", "red", "purple"];
const ICON_LIST: Exclude<Icon, "none">[] = [
  "news",
  "chat",
  "signal",
  "globe",
  "scale",
  "coin",
  "stack",
  "folder",
  "box",
];
const SIZES: { id: Size; label: string }[] = [
  { id: "sm", label: "Small" },
  { id: "md", label: "Medium" },
  { id: "lg", label: "Large" },
];

/* "New topic circle" modal (Figma frame 4). */
export function NewCircleModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (circle: { name: string; color: Color; icon: Icon; size: Size }) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<Color>("orange");
  const [icon, setIcon] = useState<Icon>("news");
  const [size, setSize] = useState<Size>("md");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const trimmed = name.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-circle-title"
    >
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div className="relative max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-bg2 text-ink transition-colors hover:bg-line ${focusRing}`}
        >
          <XIcon />
        </button>

        <h2 id="new-circle-title" className="text-2xl font-semibold tracking-tight text-ink">
          New topic circle
        </h2>
        <p className="mt-1 text-sm text-graphite">Add a themed circle to the board</p>
        <div className="my-5 h-px bg-line" aria-hidden />

        {/* live preview */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-bg2/70 p-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${circleTint[color]}`}>
            {icon === "none" ? (
              <span className={`text-lg font-bold ${circleText[color]}`}>
                {(trimmed[0] ?? "•").toUpperCase()}
              </span>
            ) : (
              <CircleIcon icon={icon} size={20} className={circleText[color]} />
            )}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <span className={`truncate text-base font-semibold ${circleText[color]}`}>
                {trimmed || "New circle"}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${circleBadge[color]}`}>
                0
              </span>
            </span>
            <span className="text-xs text-graphite">Live preview</span>
          </span>
        </div>

        <label className="mt-5 block text-sm font-medium text-ink" htmlFor="circle-name">
          Name
        </label>
        <input
          ref={nameRef}
          id="circle-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="e.g. Retail"
          className={`mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-graphite/60 ${focusRing}`}
        />

        <p className="mt-5 text-sm font-medium text-ink">Color</p>
        <div role="radiogroup" aria-label="Circle color" className="mt-2 flex items-center gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                color === c ? "border-ink/60" : "border-line hover:border-silver"
              } ${focusRing}`}
            >
              <span className={`h-3.5 w-3.5 rounded-full ${colorSolid[c]}`} aria-hidden />
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm font-medium text-ink">Icon</p>
        <div role="radiogroup" aria-label="Circle icon" className="mt-2 flex flex-wrap items-center gap-2">
          {ICON_LIST.map((ic) => (
            <button
              key={ic}
              type="button"
              role="radio"
              aria-checked={icon === ic}
              aria-label={ic}
              onClick={() => setIcon(ic)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                icon === ic ? "border-ink bg-bg2" : "border-line hover:bg-bg2/60"
              } ${focusRing}`}
            >
              <CircleIcon icon={ic} size={18} className="text-ink/80" />
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={icon === "none"}
            onClick={() => setIcon("none")}
            className={`flex h-11 items-center rounded-xl border px-4 text-sm font-medium text-ink transition-colors ${
              icon === "none" ? "border-ink bg-bg2" : "border-line hover:bg-bg2/60"
            } ${focusRing}`}
          >
            None
          </button>
        </div>

        <p className="mt-5 text-sm font-medium text-ink">Starting size</p>
        <div role="radiogroup" aria-label="Starting size" className="mt-2 grid grid-cols-3 gap-3">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={size === s.id}
              onClick={() => setSize(s.id)}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium text-ink transition-colors ${
                size === s.id ? "border-ink" : "border-line bg-bg2/50 hover:bg-bg2"
              } ${focusRing}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-graphite">You can resize it on the board later.</p>

        <button
          type="button"
          disabled={!trimmed}
          onClick={() => trimmed && onSave({ name: trimmed, color, icon, size })}
          className={`mt-6 w-full rounded-full bg-orange py-3.5 text-base font-medium text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          Save
        </button>
      </div>
    </div>
  );
}
