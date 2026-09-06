import Link from "next/link";
import { listBoards } from "@/lib/server/boards";
import { boardHost } from "@/lib/board-url";
import { NewBoardForm, PublishChip } from "./ui";

export default async function AdminHome() {
  const boards = await listBoards();
  const root = process.env.BOARD_ROOT_DOMAIN;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Boards
          <span className="ml-2 align-middle text-sm font-medium text-graphite">
            {boards.length} live
          </span>
        </h1>
        <p className="mt-1 text-sm text-graphite">
          One board per client. Creating a board publishes it at its own address immediately.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((b) => (
          <li key={b.id} className="relative">
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/admin/${b.slug}`}
                  className="text-lg font-bold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-orange/70"
                >
                  {b.clientName}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    b.isProtected ? "bg-green/10 text-green" : "bg-yellow/15 text-olive"
                  }`}
                >
                  {b.isProtected ? "Login required" : "Open to anyone"}
                </span>
              </div>

              <PublishChip host={boardHost(b.slug, root)} className="self-start" />

              <p className="line-clamp-2 text-xs text-graphite/80">
                {b.briefQuestion || "No brief question yet — set one in board settings."}
              </p>

              <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs text-graphite">
                <span>Progress {b.progressPct}%</span>
                <span className="font-medium text-ink">Manage →</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <NewBoardForm rootDomain={root} />

      {/* Shared content is the answer to "the tenth client should not have to
          retype the same six livestreams", so it belongs on the boards list —
          the screen where a tenth client gets created. */}
      <Link
        href="/admin/defaults"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
      >
        <span className="min-w-0">
          <span className="block text-lg font-bold">Shared content</span>
          <span className="mt-0.5 block max-w-2xl text-sm text-graphite">
            One set of content every board falls back to when it has nothing of its own — edit it once and
            it lands on every client, including the ones created next week.
          </span>
        </span>
        <span className="shrink-0 text-xs font-medium text-ink">Open →</span>
      </Link>
    </div>
  );
}
