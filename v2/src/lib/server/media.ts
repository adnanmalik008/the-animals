import "server-only";
import { randomUUID } from "node:crypto";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, TOO_LARGE_MESSAGE } from "@/lib/cms/upload";
import { supabaseAdmin } from "./supabase";

/* Uploading an image into the `board-media` bucket.

   The bucket is created by 0002_cms.sql with a size limit and a MIME
   whitelist; the constants here mirror it deliberately. A file this module
   accepts but the bucket rejects would surface as a bare 415 from storage,
   so the two lists must say the same thing.

   Two facts drive the shape of this file:

   - `storage-js` labels a Buffer/Uint8Array body `text/plain` unless
     `contentType` is passed, and the bucket's whitelist then refuses it.
     So the MIME is passed explicitly, and the file extension is derived
     from that same MIME rather than from the uploaded filename — a name is
     the one part of an upload the browser lets anyone choose.
   - Vercel caps a request body at 4.5 MB, so anything above 4 MB is
     refused here rather than failing as an opaque platform error. The
     picker downscales large rasters before they get this far. */

export const MEDIA_BUCKET = "board-media";

export type UploadCheck = { ok: true; mime: string; ext: string } | { ok: false; status: number; error: string };

const startsWith = (bytes: Uint8Array, sig: readonly number[], at = 0) =>
  bytes.length >= at + sig.length && sig.every((b, i) => bytes[at + i] === b);

/** What the bytes actually are, for the types we accept; null when unrecognised.

    The browser hands us `file.type`, which comes from the OS by file
    extension — it is a claim, not evidence. Sniffing means a renamed
    executable cannot enter a public bucket wearing an image label. */
export function sniffImageMime(bytes: Uint8Array): string | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  // RIFF....WEBP
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  if (isSvg(bytes)) return "image/svg+xml";
  return null;
}

/* SVG has no magic number — it is XML. Read the head as text and require an
   <svg> root, allowing a declaration, a doctype or comments before it. */
function isSvg(bytes: Uint8Array): boolean {
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, 1024)).trimStart();
  if (!head.startsWith("<")) return false;
  return /<svg[\s>]/i.test(head);
}

/** Everything decidable about an upload before touching the network. */
export function checkUpload(claimedMime: string, bytes: Uint8Array): UploadCheck {
  if (bytes.length === 0) return { ok: false, status: 400, error: "That file is empty." };
  if (bytes.length > MAX_UPLOAD_BYTES) {
    return { ok: false, status: 413, error: TOO_LARGE_MESSAGE };
  }

  const sniffed = sniffImageMime(bytes);
  if (!sniffed) return { ok: false, status: 415, error: "That file is not a JPEG, PNG, WebP, GIF or SVG." };

  /* The claim is only used to catch a mismatch: a PNG named .jpg is
     harmless, but a claim we cannot honour means the picker and the bucket
     disagree about what was sent. The sniffed type is what gets stored. */
  const claimed = claimedMime.split(";")[0].trim().toLowerCase();
  if (claimed && claimed !== sniffed && ALLOWED_MIME[claimed]) {
    return { ok: false, status: 415, error: "That file's contents do not match its type." };
  }

  return { ok: true, mime: sniffed, ext: ALLOWED_MIME[sniffed] };
}

export type UploadResult = { ok: true; url: string } | { ok: false; status: number; error: string };

/** Validate, store, and return the public URL. */
export async function uploadBoardImage(claimedMime: string, bytes: Uint8Array): Promise<UploadResult> {
  const check = checkUpload(claimedMime, bytes);
  if (!check.ok) return check;

  const db = supabaseAdmin();
  if (!db) return { ok: false, status: 503, error: "Storage is not configured on this server." };

  /* A random name, not the uploaded one: names collide, carry paths, and
     leak whatever the editor happened to call the file. */
  const path = `uploads/${randomUUID()}.${check.ext}`;

  const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, bytes, {
    contentType: check.mime,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    /* Until 0002_cms.sql is applied the bucket does not exist, which is a
       state the admin can fix — say so rather than printing storage's own
       wording. */
    const missing = /bucket not found/i.test(error.message);
    return {
      ok: false,
      status: missing ? 503 : 502,
      error: missing ? "The image bucket does not exist yet — run the 0002_cms migration." : "Upload failed. Try again.",
    };
  }

  const { data } = db.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
