/* Image uploads: what the server accepts, and what the picker shrinks.

   Everything decidable without a network lives in `checkUpload` and
   `sniffImageMime`, so this file covers the whole refusal surface. The last
   describe is a tie: the constants in `lib/cms/upload.ts` mirror the bucket
   created by 0002_cms.sql, and a file this code accepts but the bucket
   refuses would surface only as a bare 415 in production. */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, UPLOAD_ACCEPT } from "@/lib/cms/upload";
import { checkUpload, sniffImageMime } from "@/lib/server/media";
import { scaleFor, shouldResize, MAX_EDGE, RESIZE_ABOVE_BYTES } from "@/components/admin/form/image-resize";

const bytes = (...values: number[]) => new Uint8Array(values);
const pad = (head: number[], length = 64) =>
  new Uint8Array([...head, ...Array.from({ length: Math.max(0, length - head.length) }, () => 0)]);

const JPEG = pad([0xff, 0xd8, 0xff, 0xe0]);
const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF = pad([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const WEBP = pad([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
const SVG = new TextEncoder().encode('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>');

describe("sniffImageMime", () => {
  it("recognises every type the bucket accepts", () => {
    expect(sniffImageMime(JPEG)).toBe("image/jpeg");
    expect(sniffImageMime(PNG)).toBe("image/png");
    expect(sniffImageMime(GIF)).toBe("image/gif");
    expect(sniffImageMime(WEBP)).toBe("image/webp");
    expect(sniffImageMime(SVG)).toBe("image/svg+xml");
  });

  it("covers the whole whitelist — no accepted MIME is unsniffable", () => {
    const sniffable = new Set([JPEG, PNG, GIF, WEBP, SVG].map((b) => sniffImageMime(b)));
    expect([...Object.keys(ALLOWED_MIME)].every((mime) => sniffable.has(mime))).toBe(true);
  });

  it("refuses things that are not images", () => {
    expect(sniffImageMime(bytes(0x4d, 0x5a, 0x90, 0x00))).toBeNull(); // a Windows executable
    expect(sniffImageMime(new TextEncoder().encode("just some text"))).toBeNull();
    expect(sniffImageMime(bytes())).toBeNull();
  });

  it("does not take RIFF alone for a WebP", () => {
    expect(sniffImageMime(pad([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20]))).toBeNull();
  });

  it("wants an <svg> root, not merely angle brackets", () => {
    expect(sniffImageMime(new TextEncoder().encode("<html><body>hi</body></html>"))).toBeNull();
    expect(sniffImageMime(new TextEncoder().encode("<!-- a note -->\n<svg></svg>"))).toBe("image/svg+xml");
  });
});

describe("checkUpload", () => {
  it("accepts a real image and derives the extension from the bytes", () => {
    expect(checkUpload("image/png", PNG)).toEqual({ ok: true, mime: "image/png", ext: "png" });
    expect(checkUpload("image/jpeg", JPEG)).toEqual({ ok: true, mime: "image/jpeg", ext: "jpg" });
  });

  it("trusts the bytes over an unknown or absent claim", () => {
    /* A .jpg that is really a PNG stores as a PNG rather than being refused. */
    expect(checkUpload("", PNG)).toEqual({ ok: true, mime: "image/png", ext: "png" });
    expect(checkUpload("application/octet-stream", PNG)).toEqual({ ok: true, mime: "image/png", ext: "png" });
    expect(checkUpload("image/png; charset=binary", PNG)).toEqual({ ok: true, mime: "image/png", ext: "png" });
  });

  it("refuses a claim that contradicts the bytes", () => {
    const result = checkUpload("image/jpeg", PNG);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.status).toBe(415);
  });

  it("refuses an empty file", () => {
    const result = checkUpload("image/png", bytes());
    expect(result.ok === false && result.status).toBe(400);
  });

  it("refuses a file over the cap, and accepts one exactly at it", () => {
    const over = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    over.set(PNG.subarray(0, 8));
    const atCap = new Uint8Array(MAX_UPLOAD_BYTES);
    atCap.set(PNG.subarray(0, 8));

    const refused = checkUpload("image/png", over);
    expect(refused.ok === false && refused.status).toBe(413);
    expect(checkUpload("image/png", atCap).ok).toBe(true);
  });

  it("refuses a non-image whatever it claims to be", () => {
    const result = checkUpload("image/png", pad([0x4d, 0x5a, 0x90, 0x00]));
    expect(result.ok === false && result.status).toBe(415);
  });
});

describe("client downscaling policy", () => {
  it("leaves small rasters alone", () => {
    expect(shouldResize("image/jpeg", RESIZE_ABOVE_BYTES)).toBe(false);
    expect(shouldResize("image/jpeg", RESIZE_ABOVE_BYTES + 1)).toBe(true);
  });

  it("never re-encodes a GIF or an SVG — one would lose its animation, the other its point", () => {
    expect(shouldResize("image/gif", MAX_UPLOAD_BYTES)).toBe(false);
    expect(shouldResize("image/svg+xml", MAX_UPLOAD_BYTES)).toBe(false);
  });

  it("scales the longest edge down to the cap and never scales up", () => {
    expect(scaleFor(4000, 3000)).toBe(MAX_EDGE / 4000);
    expect(scaleFor(3000, 4000)).toBe(MAX_EDGE / 4000);
    expect(scaleFor(MAX_EDGE, MAX_EDGE)).toBe(1);
    expect(scaleFor(100, 50)).toBe(1);
  });
});

describe("the constants mirror the bucket in 0002_cms.sql", () => {
  const sql = readFileSync(new URL("../../supabase/migrations/0002_cms.sql", import.meta.url), "utf8");
  const bucket = sql.slice(sql.indexOf("storage.buckets"));

  it("allows exactly the MIME types the bucket allows", () => {
    const declared = [...bucket.matchAll(/'(image\/[a-z+]+)'/g)].map((m) => m[1]);
    expect(declared.length).toBeGreaterThan(0);
    expect(declared.sort()).toEqual(Object.keys(ALLOWED_MIME).sort());
  });

  it("caps size at or below the bucket's own limit", () => {
    const limit = Number(bucket.match(/true, *([0-9]+)/)?.[1]);
    expect(Number.isFinite(limit)).toBe(true);
    expect(MAX_UPLOAD_BYTES).toBeLessThanOrEqual(limit);
  });

  it("offers the picker every accepted type", () => {
    expect(UPLOAD_ACCEPT.split(",").sort()).toEqual(Object.keys(ALLOWED_MIME).sort());
  });
});
