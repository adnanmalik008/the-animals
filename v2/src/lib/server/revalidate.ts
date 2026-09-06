import "server-only";
import { revalidatePath } from "next/cache";

/* Saving is live immediately, so every surface that renders board content
   has to be dropped at once. Its own module, not actions.ts: a "use server"
   file may export only async functions, and this one is synchronous. */

const BOARD_PATHS = ["/", "/anomalies", "/competition", "/in-the-wild"] as const;

/** All four client tabs plus the admin screens for the board — the header
    (client name, brief, progress) shows on every tab, so a settings change
    invalidates as much as a content change does. */
export function revalidateBoard(slug: string, moduleKey?: string) {
  for (const path of BOARD_PATHS) revalidatePath(path);
  revalidatePath(`/admin/${slug}`);
  if (moduleKey) revalidatePath(`/admin/${slug}/modules/${moduleKey}`);
}

/** A shared default is the content of every board that has none of its own,
    so one save changes what an unknown number of clients render. There is no
    list of affected boards to walk — the four tab routes are the same routes
    for every subdomain, and the admin's per-board screens are reached by
    revalidating their route patterns rather than each slug in turn. */
export function revalidateSharedDefault(moduleKey?: string) {
  for (const path of BOARD_PATHS) revalidatePath(path);
  revalidatePath("/admin/defaults");
  if (moduleKey) revalidatePath(`/admin/defaults/${moduleKey}`);
  /* every board's admin pages: their badges say whether a module is showing
     the shared copy, and that answer just moved */
  revalidatePath("/admin/[slug]", "page");
  revalidatePath("/admin/[slug]/modules/[key]", "page");
}
