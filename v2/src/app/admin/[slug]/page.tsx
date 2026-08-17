import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoardBySlug, getModuleData, listBoardUsers } from "@/lib/server/boards";
import { boardHost } from "@/lib/board-url";
import { BoardMetaForm, DeleteBoardButton, ModuleEditor, PublishChip, UsersManager } from "../ui";
import { MODULE_TEMPLATES } from "@/lib/module-templates";

export default async function BoardAdminPage({ params }: PageProps<"/admin/[slug]">) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const [modules, users] = await Promise.all([
    getModuleData(board.id),
    listBoardUsers(board.id),
  ]);
  const host = boardHost(board.slug, process.env.BOARD_ROOT_DOMAIN);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link href="/admin" className="text-xs text-graphite hover:text-ink">
            ← All boards
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{board.clientName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PublishChip host={host} />
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                board.isProtected ? "bg-green/10 text-green" : "bg-yellow/15 text-olive"
              }`}
            >
              {board.isProtected ? "Login required" : "Open to anyone"}
            </span>
          </div>
        </div>
        {board.id !== "fixture" && (
          <DeleteBoardButton slug={board.slug} clientName={board.clientName} />
        )}
      </div>

      {board.id === "fixture" && (
        <p className="rounded-xl bg-yellow/15 px-4 py-3 text-sm text-ink">
          This is the built-in fixture board. Configure Supabase (see v2/README.md) to create and edit
          real boards — saving below will fail until then.
        </p>
      )}

      <BoardMetaForm board={board} />
      <ModuleEditor
        board={board}
        moduleKeys={Object.keys(MODULE_TEMPLATES)}
        existing={modules}
        templates={MODULE_TEMPLATES}
      />
      <UsersManager board={board} users={users} host={host} />
    </div>
  );
}
