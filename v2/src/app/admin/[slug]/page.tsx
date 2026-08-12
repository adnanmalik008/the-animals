import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoardBySlug, getModuleData, listBoardUsers } from "@/lib/server/boards";
import { BoardMetaForm, ModuleEditor, UsersManager } from "../ui";
import { deleteBoardAction } from "../actions";
import { MODULE_TEMPLATES } from "@/lib/module-templates";

export default async function BoardAdminPage({ params }: PageProps<"/admin/[slug]">) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const [modules, users] = await Promise.all([
    getModuleData(board.id),
    listBoardUsers(board.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-xs text-graphite hover:text-ink">
            ← All boards
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{board.clientName}</h1>
          <p className="text-sm text-graphite">{board.slug}.yourdomain.com</p>
        </div>
        {board.id !== "fixture" && (
          <form
            action={deleteBoardAction}
            className="self-start"
          >
            <input type="hidden" name="slug" value={board.slug} />
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-1.5 text-xs text-graphite transition-colors hover:bg-red/10 hover:text-red"
            >
              Delete board
            </button>
          </form>
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
      <UsersManager board={board} users={users} />
    </div>
  );
}
