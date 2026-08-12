import "server-only";
import { redirect } from "next/navigation";
import { getCurrentBoard, type BoardRecord } from "./boards";
import { getSession, sessionAllowsBoard } from "./session";

/* Call at the top of every board page (server component).
   Unprotected boards (and the fixture board) render for everyone;
   protected boards redirect to /login until a valid session exists. */
export async function requireBoardAccess(nextPath: string): Promise<BoardRecord> {
  const board = await getCurrentBoard();
  if (!board.isProtected) return board;
  const session = await getSession();
  if (sessionAllowsBoard(session, board.slug)) return board;
  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}

/* Admin area guard. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect(`/login?next=${encodeURIComponent("/admin")}&admin=1`);
  }
  return session;
}
