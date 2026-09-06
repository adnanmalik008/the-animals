/* Upload limits, in the one place both sides can read.

   The picker needs the `accept` list and the size cap; the route and the
   storage bucket enforce them. `lib/server/media.ts` is `server-only`, so
   the constants live here instead — no imports, nothing to drag into a
   client bundle.

   These mirror the `board-media` bucket created by 0002_cms.sql. A file
   this list accepts but the bucket rejects surfaces as a bare 415, so the
   two must say the same thing. */

/** Matches the bucket's `file_size_limit`, under Vercel's 4.5 MB body cap. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);

/** MIME → file extension. Mirrors the bucket's `allowed_mime_types`. */
export const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/** The picker's `accept` attribute, kept in step with the whitelist. */
export const UPLOAD_ACCEPT = Object.keys(ALLOWED_MIME).join(",");

export const TOO_LARGE_MESSAGE = `Images must be under ${MAX_UPLOAD_MB} MB.`;
