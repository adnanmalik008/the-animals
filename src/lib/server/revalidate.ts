import "server-only";
import { revalidatePath } from "next/cache";

/* Saving is live immediately, so every surface that renders board content
   has to be dropped at once. Its own module, not actions.ts: a "use server"
   file may export only async functions, and this one is synchronous. */

const BOARD_PATHS = ["/", "/anomalies", "/competition", "/in-the-wild"] as const;

/** One board's settings changed: the client name, brief and progress show in
    the header of every tab, and the admin screen for the board repeats them. */
export function revalidateBoard(slug: string) {
  for (const path of BOARD_PATHS) revalidatePath(path);
  revalidatePath(`/admin/${slug}`);
}

/** Content is one set for the whole product, so one save changes what every
    client renders. There is no list of affected boards to walk — the four tab
    routes are the same routes for every subdomain. */
export function revalidateContent(moduleKey?: string) {
  for (const path of BOARD_PATHS) revalidatePath(path);
  revalidatePath("/admin/content");
  if (moduleKey) revalidatePath(`/admin/content/${moduleKey}`);
}
