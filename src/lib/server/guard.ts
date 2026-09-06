import "server-only";
import { redirect } from "next/navigation";
import { getCurrentBoard, type BoardRecord } from "./boards";
import { getSession, sessionAllowsBoard } from "./session";

/* Call at the top of every board page AND in the board layout.

   Both, not either. A React Server Component request can render a layout
   without its page, or a page without its layout — the router asks for the
   segments it does not already hold. So a guard that sits only in the pages
   leaves the layout free to fetch and serialise the board's identity and
   every content document to a caller with no session, which is exactly what
   `curl -H 'RSC: 1' <board>/anomalies?_rsc` returned: 200, the client's
   brief, and the whole content set. A plain browser GET redirected properly,
   so it was invisible in normal use.

   `nextPath` is where to send the visitor back after logging in. The layout
   does not know which page it is wrapping, so it omits it and the visitor
   lands on the board root. */
export async function requireBoardAccess(nextPath = "/"): Promise<BoardRecord> {
  const board = await getCurrentBoard();
  if (!board.isProtected) return board;
  const session = await getSession();
  if (sessionAllowsBoard(session, board.slug)) return board;
  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}

/* Admin area guard. Called in the admin layout AND in every admin page,
   for the reason above: neither one renders the other on an RSC request,
   and the pages are what carry the client roster, the briefs, the logins
   and the saved content. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect(`/login?next=${encodeURIComponent("/admin")}&admin=1`);
  }
  return session;
}
