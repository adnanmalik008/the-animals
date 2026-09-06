import { NextResponse } from "next/server";
import { MAX_UPLOAD_BYTES, TOO_LARGE_MESSAGE } from "@/lib/cms/upload";
import { uploadBoardImage } from "@/lib/server/media";
import { getSession } from "@/lib/server/session";

/* POST an image, get a public URL back.

   A route handler rather than a server action, for two reasons: actions cap
   a request body at 1 MB, and they are dispatched one at a time, so an
   upload would block every other save in the tab.

   The admin check is the session test `requireAdmin` runs, but it answers
   401 instead of redirecting — a fetch() follows a redirect and would hand
   the picker the login page's HTML as if it were a result. */

export const runtime = "nodejs";

const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return fail(401, "Sign in again — your session has expired.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "That upload could not be read.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail(400, "No file was sent.");

  /* Checked before reading the body into memory as well as after, because
     `size` is known from the multipart headers and a 5 MB file should not
     be buffered just to be refused. */
  if (file.size > MAX_UPLOAD_BYTES) {
    return fail(413, TOO_LARGE_MESSAGE);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await uploadBoardImage(file.type, bytes);
  if (!result.ok) return fail(result.status, result.error);

  return NextResponse.json({ ok: true, url: result.url });
}
