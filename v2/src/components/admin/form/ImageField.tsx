"use client";

/* An image, by URL.

   M1 is paste-only: an https:// address or a /assets/ path, which is what
   every board image is today. The preview is the useful half — it crops to
   the aspect the board applies, so a wrong image is obvious before saving.

   M2 SEAM: upload goes in the marked slot below. It writes to the Supabase
   bucket, then calls the same `onChange` with the public URL — nothing else
   in this component, or above it, has to change. */

import type { ImageSpec } from "@/lib/cms/spec";
import { hint, input, invalidRing, quietBtnDisablable } from "./tokens";
import type { ReactNode } from "react";

export function ImageField({
  spec,
  id,
  value,
  onChange,
  describedBy,
  invalid,
  altSlot,
}: {
  spec: ImageSpec;
  id: string;
  value: string;
  onChange: (value: string) => void;
  describedBy?: string;
  invalid?: boolean;
  altSlot?: ReactNode;
}) {
  const src = value.trim();
  const showable = /^(https?:\/\/|\/)/.test(src);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div
        style={{ aspectRatio: spec.aspect ?? "16 / 9" }}
        className="grid w-full max-w-56 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-bg2"
      >
        {showable ? (
          /* an arbitrary pasted URL cannot go through next/image's loader */
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className={hint}>{src ? "Not a usable address" : "No image"}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <input
          id={id}
          type="text"
          inputMode="url"
          spellCheck={false}
          placeholder="https://… or /assets/…"
          value={value}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={`${input} font-mono text-xs ${invalid ? invalidRing : ""}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onChange("")} disabled={!value} className={quietBtnDisablable}>
            Clear
          </button>
          {/* M2 SEAM: the upload button lands here */}
          {spec.aspect && <span className={hint}>Cropped to {spec.aspect.replace("/", ":")}</span>}
        </div>
        {altSlot}
      </div>
    </div>
  );
}
