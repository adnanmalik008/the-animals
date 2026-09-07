"use client";

/* An image: uploaded, or pasted by address.

   Both halves end in the same place — `onChange` with a URL string — so
   nothing above this component knows or cares which one an editor used.
   The preview is the useful part either way: it crops to the aspect the
   board applies, so a wrong image is obvious before saving.

   The upload posts to /api/admin/upload rather than a server action:
   actions cap a body at 1 MB and run one at a time. Large photos are
   downscaled here first, so a phone picture does not bounce off the 4 MB
   limit. */

import { useId, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import type { ReactNode } from "react";
import type { ImageSpec } from "@/lib/cms/spec";
import { UPLOAD_ACCEPT } from "@/lib/cms/upload";
import { downscaleImage } from "./image-resize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const statusId = useId();

  async function upload(file: File) {
    setBusy(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", await downscaleImage(file));
      const response = await fetch("/api/admin/upload", { method: "POST", body });

      /* A non-JSON body means something upstream answered instead of the
         route — a proxy, or a platform-level size refusal. */
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setUploadError(typeof result?.error === "string" ? result.error : "Upload failed. Try again.");
        return;
      }
      onChange(result.url as string);
    } catch {
      setUploadError("Upload failed — check your connection and try again.");
    } finally {
      setBusy(false);
      /* Cleared so picking the same file twice fires `change` again. */
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div
        style={{ aspectRatio: spec.aspect ?? "16 / 9" }}
        className="grid w-full max-w-56 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted"
      >
        {showable ? (
          /* an arbitrary pasted URL cannot go through next/image's loader */
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">{src ? "Not a usable address" : "No image"}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Input
          id={id}
          type="text"
          inputMode="url"
          spellCheck={false}
          placeholder="https://… or /assets/…"
          value={value}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept={UPLOAD_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            aria-describedby={statusId}
          >
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            {busy ? "Uploading…" : "Upload"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            disabled={!value || busy}
          >
            <X />
            Clear
          </Button>
          {spec.aspect && (
            <span className="text-xs text-muted-foreground">
              Cropped to {spec.aspect.replace("/", ":")}
            </span>
          )}
        </div>
        <p
          id={statusId}
          role="status"
          className={uploadError ? "text-xs font-medium text-destructive" : "sr-only"}
        >
          {uploadError ?? (busy ? "Uploading…" : "")}
        </p>
        {altSlot}
      </div>
    </div>
  );
}
