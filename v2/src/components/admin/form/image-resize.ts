/* Shrinking a large photo in the browser, before it is uploaded.

   The server refuses anything over 4 MB (Vercel's request-body cap sits
   just above it), and a phone photo clears that on its own. Downscaling
   here turns a refusal into a successful upload without the editor having
   to know what a resampler is.

   Only rasters are touched. A GIF goes through untouched because a canvas
   keeps one frame and would silently kill the animation, and an SVG is
   already resolution-independent. */

export const MAX_EDGE = 2000;

/** Below this, the pixels are not worth re-encoding. */
export const RESIZE_ABOVE_BYTES = 1024 * 1024;

const RESIZABLE = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Pure, so the policy is testable without a canvas. */
export function shouldResize(type: string, size: number): boolean {
  return RESIZABLE.has(type) && size > RESIZE_ABOVE_BYTES;
}

/** The scale factor for an image of these dimensions; 1 when it already fits. */
export function scaleFor(width: number, height: number, maxEdge = MAX_EDGE): number {
  const longest = Math.max(width, height);
  return longest > maxEdge ? maxEdge / longest : 1;
}

/** Returns a smaller file, or the original when shrinking it would not help.

    WebP is the output because it keeps transparency (a PNG logo re-encoded
    as JPEG would gain a black background) and the bucket accepts it. */
export async function downscaleImage(file: File): Promise<File> {
  if (!shouldResize(file.type, file.size)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    /* An image the browser cannot decode is the server's problem to
       report, not a reason to fail the click here. */
    return file;
  }

  try {
    const scale = scaleFor(bitmap.width, bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    /* Re-encoding can grow a file that was already well compressed. */
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}
