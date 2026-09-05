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
