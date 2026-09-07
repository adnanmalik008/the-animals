import Link from "next/link";
import { ArrowRight, LayoutGrid, Plus } from "lucide-react";
import { listAdminUsers, listBoards } from "@/lib/server/boards";
import { boardHost } from "@/lib/board-url";
import { CONTENT_HREF } from "@/components/admin/module-groups";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewBoardForm, ProtectionBadge, PublishChip } from "./ui";
import { TeamLogins } from "./TeamLogins";
import { requireAdmin } from "@/lib/server/guard";

/* Content first, boards second — which is the order the work happens in.
   There is one set of content for the whole product; a board is a name, an
   address and a set of logins onto it. */

export default async function AdminHome() {
  /* Guarded here as well as in the layout: an RSC request renders one
     without the other, and this page is what carries client data. */
  await requireAdmin();

  const boards = await listBoards();
  /* Empty until 0002_cms.sql makes board_id nullable. A failed read is still a
     list, so the boards above keep rendering — but it carries `ok: false`,
     because "we could not read the list" must not reach an admin as "nobody
     holds agency admin". */
  const teamLogins = await listAdminUsers();
  const root = process.env.BOARD_ROOT_DOMAIN;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Board CMS</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Edit the content once; publish it to as many clients as you like.
        </p>
      </div>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="size-4 text-primary" />
            Content
          </CardTitle>
          <CardDescription className="max-w-2xl">
            Every box on the board — the newswire, the livestreams, the topic circles. One set, edited
            once, shown on every board including the ones created next week.
          </CardDescription>
          <CardAction>
            <Button asChild variant="outline" size="sm">
              <Link href={CONTENT_HREF}>
                Open
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-baseline gap-2 text-lg font-semibold">
              Boards
              <span className="text-sm font-normal text-muted-foreground">{boards.length} live</span>
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Publishing and access: each board is a name, its own address and its own logins. Creating
              one publishes it immediately.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="#new-board">
              <Plus />
              New board
            </Link>
          </Button>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => (
            <li key={b.id} className="relative">
              <Card className="h-full gap-4 transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/admin/${b.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring/60"
                    >
                      {b.clientName}
                    </Link>
                  </CardTitle>
                  <CardAction>
                    <ProtectionBadge isProtected={b.isProtected} />
                  </CardAction>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <PublishChip host={boardHost(b.slug, root)} className="self-start" />
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {b.briefQuestion || "No brief question yet — set one in board settings."}
                  </p>
                </CardContent>
                <CardFooter className="mt-auto justify-between border-t pt-4 text-xs text-muted-foreground">
                  <span>Progress {b.progressPct}%</span>
                  <span className="font-medium text-foreground">Manage →</span>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <NewBoardForm rootDomain={root} />

      <TeamLogins users={teamLogins.users} readOk={teamLogins.ok} />
    </div>
  );
}
