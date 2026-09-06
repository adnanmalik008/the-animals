import Link from "next/link";
import { listAdminUsers, listBoards } from "@/lib/server/boards";
import { boardHost } from "@/lib/board-url";
import { CONTENT_HREF } from "@/components/admin/module-groups";
import { NewBoardForm, PublishChip } from "./ui";
import { TeamLogins } from "./TeamLogins";

/* Content first, boards second — which is the order the work happens in.
   There is one set of content for the whole product; a board is a name, an
   address and a set of logins onto it. */

export default async function AdminHome() {
  const boards = await listBoards();
  /* Empty until 0002_cms.sql makes board_id nullable, and empty rather than
     an error if the read fails at all — the boards below must still list. */
  const teamUsers = await listAdminUsers();
  const root = process.env.BOARD_ROOT_DOMAIN;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board CMS</h1>
        <p className="mt-1 max-w-2xl text-sm text-graphite">
          Edit the content once; publish it to as many clients as you like.
        </p>
      </div>

      <Link
        href={CONTENT_HREF}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
      >
        <span className="min-w-0">
          <span className="block text-lg font-bold">Content</span>
          <span className="mt-0.5 block max-w-2xl text-sm text-graphite">
            Every box on the board — the newswire, the livestreams, the topic circles. One set, edited
            once, shown on every board including the ones created next week.
          </span>
        </span>
        <span className="shrink-0 text-xs font-medium text-ink">Open →</span>
      </Link>

      <div>
        <h2 className="text-lg font-bold">
          Boards
          <span className="ml-2 align-middle text-sm font-medium text-graphite">
            {boards.length} live
          </span>
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-graphite">
          Publishing and access: each board is a name, its own address and its own logins. Creating one
          publishes it immediately.
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

      <TeamLogins users={teamUsers} />
    </div>
  );
}
