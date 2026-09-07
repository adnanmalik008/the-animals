import { notFound } from "next/navigation";
import { getBoardBySlug, listBoardUsers } from "@/lib/server/boards";
import { boardHost } from "@/lib/board-url";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BoardMetaForm,
  DeleteBoardButton,
  ProtectionBadge,
  PublishChip,
  UsersManager,
} from "../ui";
import { requireAdmin } from "@/lib/server/guard";

export default async function BoardAdminPage({ params }: PageProps<"/admin/[slug]">) {
  /* Guarded here as well as in the layout: an RSC request renders one
     without the other, and this page is what carries client data. */
  await requireAdmin();

  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const users = await listBoardUsers(board.id);
  const host = boardHost(board.slug, process.env.BOARD_ROOT_DOMAIN);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{board.clientName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PublishChip host={host} />
            <ProtectionBadge isProtected={board.isProtected} />
          </div>
        </div>
        {board.id !== "fixture" && (
          <DeleteBoardButton slug={board.slug} clientName={board.clientName} />
        )}
      </div>

      {board.id === "fixture" && (
        <Alert>
          <AlertTitle>This is the built-in fixture board</AlertTitle>
          <AlertDescription>
            Configure Supabase (see README.md) to create and edit real boards — saving below will fail
            until then.
          </AlertDescription>
        </Alert>
      )}

      <BoardMetaForm board={board} />
      <UsersManager board={board} users={users} host={host} />
    </div>
  );
}
