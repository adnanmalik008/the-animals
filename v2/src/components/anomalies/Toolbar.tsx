"use client";

import type { ReactNode } from "react";
import { LightbulbIcon } from "./CircleIcon";
import { focusRing } from "./palette";

export const ZOOM_LEVELS = [50, 75, 100, 125, 150];

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-graphite transition-colors hover:bg-bg2 hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent ${focusRing}`}
    >
      {children}
    </button>
  );
}

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/* Board toolbar — white pill cluster + orange New-circle button (Figma frame 3). */
export function Toolbar({
  zoom,
  onZoom,
  onCopyLink,
  ideasCount,
  ideasOpen,
  onToggleIdeas,
  onNewCircle,
}: {
  zoom: number;
  onZoom: (zoom: number) => void;
  onCopyLink: () => void;
  ideasCount: number;
  ideasOpen: boolean;
  onToggleIdeas: () => void;
  onNewCircle: () => void;
}) {
  const idx = ZOOM_LEVELS.indexOf(zoom);
  const zoomIn = () => onZoom(ZOOM_LEVELS[Math.min(idx + 1, ZOOM_LEVELS.length - 1)] ?? 100);
  const zoomOut = () => onZoom(ZOOM_LEVELS[Math.max(idx - 1, 0)] ?? 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5 rounded-full border border-line bg-card p-1.5 shadow-sm">
        <div className="hidden items-center gap-0.5 lg:flex">
          <IconButton label="Zoom in" onClick={zoomIn} disabled={idx >= ZOOM_LEVELS.length - 1}>
            <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </IconButton>
          <IconButton label="Zoom out" onClick={zoomOut} disabled={idx <= 0}>
            <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
              <path d="M5 12h14" />
            </svg>
          </IconButton>

          <div className="relative mx-1">
            <select
              aria-label="Zoom level"
              value={zoom}
              onChange={(e) => onZoom(Number(e.target.value))}
              className={`appearance-none rounded-full bg-bg2/80 py-1.5 pl-3.5 pr-8 text-sm font-medium text-ink ${focusRing}`}
            >
              {ZOOM_LEVELS.map((z) => (
                <option key={z} value={z}>
                  {z}%
                </option>
              ))}
            </select>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              {...stroke}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-graphite"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        <IconButton label="Copy board link" onClick={onCopyLink}>
          <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
            <path d="M10 13a5 5 0 0 0 7.07 0l2.13-2.13a5 5 0 1 0-7.07-7.07l-1.42 1.42" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.13a5 5 0 1 0 7.07 7.07l1.41-1.42" />
          </svg>
        </IconButton>
        <span aria-hidden className="mx-1 h-6 w-px bg-line" />

        <button
          type="button"
          onClick={onToggleIdeas}
          aria-expanded={ideasOpen}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-bg2 ${
            ideasOpen ? "bg-bg2" : ""
          } ${focusRing}`}
        >
          <LightbulbIcon size={16} />
          Ideas
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
              ideasCount > 0 ? "bg-orange/10 text-orange" : "bg-bg2 text-graphite"
            }`}
          >
            {ideasCount}
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={onNewCircle}
        aria-label="New topic circle"
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-orange text-white shadow-lg transition-colors hover:bg-orange-hover ${focusRing}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} strokeWidth={2.2}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
