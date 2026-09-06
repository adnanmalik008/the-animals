import "server-only";
import Link from "next/link";
import { SharedModuleDirectory } from "@/components/admin/ModuleDirectory";

/* The agency's one copy of each module.

   A static segment beats a dynamic one, so this route wins over
   /admin/[slug] — `createBoardAction` refuses the slug "defaults" for that
   reason, rather than letting a board publish fine and then be unreachable
   from the admin. */

export default function SharedContentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs text-graphite hover:text-ink">
          ← All boards
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Shared content</h1>
        <p className="mt-1 max-w-2xl text-sm text-graphite">
          Some content is the same for every client — the six nature livestreams, the starting set of
          Anomalies circles. Edit it once here and every board that has no content of its own for that
          module shows it, including boards created later. A board that has its own content keeps it.
        </p>
      </div>

      <SharedModuleDirectory />
    </div>
  );
}
