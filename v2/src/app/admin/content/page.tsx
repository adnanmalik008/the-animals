import "server-only";
import Link from "next/link";
import { ModuleDirectory } from "@/components/admin/ModuleDirectory";
import { requireAdmin } from "@/lib/server/guard";

/* The content, all of it.

   A static segment beats a dynamic one, so this route wins over
   /admin/[slug] — `createBoardAction` refuses the slug "content" for that
   reason, rather than letting a board publish fine and then be unreachable
   from the admin. */

export default async function ContentPage() {
  /* Guarded here as well as in the layout: an RSC request renders one
     without the other, and this page is what carries client data. */
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs text-graphite hover:text-ink">
          ← Admin
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Content</h1>
        <p className="mt-1 max-w-2xl text-sm text-graphite">
          Every box on the board, edited once. What you save here is what every board shows — boards differ
          in their name, their brief and who can log in, not in their content.
        </p>
      </div>

      <ModuleDirectory />
    </div>
  );
}
