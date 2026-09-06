import "server-only";
import { notFound } from "next/navigation";
import { byKey } from "@/lib/cms/registry";
import { getDefaultRowInfos } from "@/lib/server/docs";
import { isCmsConfigured } from "@/lib/server/supabase";
import { ContentNav, DirtyGuard } from "@/components/admin/ContentNav";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { moduleGroups } from "@/components/admin/module-groups";
import { ReadErrorPage } from "@/components/admin/ReadError";
import type { EditScope } from "@/components/admin/scope";

/* ============================================================
   One module of the agency's shared content.

   The same form as a board's, pointed at `module_defaults`. Two things are
   deliberately unlike the board page:

   • A key with no registry definition has no page here at all. Its document
     would be read by every board that has none of its own and nothing could
     check its shape first, so `saveDefaultDoc` refuses it — better to have
     no route than a form whose Save can only fail.
   • Until `0002_cms.sql` is applied the table does not exist. The read
     shrugs that off and reports "no shared content", which is true; the
     warning below says so, and a Save still goes out and fails loudly with
     the database's own message rather than appearing to work.
   ============================================================ */

const SCOPE: EditScope = { kind: "defaults" };

export default async function SharedModulePage({ params }: PageProps<"/admin/defaults/[key]">) {
  const { key } = await params;
  const def = byKey(key);
  if (!def) notFound();

  const read = await getDefaultRowInfos();
  if (!read.ok) {
    return (
      <ReadErrorPage
        what="the shared content"
        error={read.error}
        backHref="/admin/defaults"
        backLabel="All shared content"
      />
    );
  }

  const row = read.rows.find((r) => r.moduleKey === key);
  const invalid = row?.status === "invalid";
  const configured = isCmsConfigured();

  return (
    <DirtyGuard>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <ContentNav
          scope={SCOPE}
          currentKey={key}
          groups={moduleGroups({ includeLegacy: false })}
        />
        <div className="min-w-0 flex-1">
          <ModuleForm
            scope={SCOPE}
            moduleKey={key}
            /* nothing shared yet: start from the built-in content, which is
               what every board is showing for this module right now */
            initialDoc={row ? row.data : def.fixture()}
            resets={[{ kind: "template", doc: def.fixture() }]}
            invalid={invalid}
            canSave={configured}
            warning={
              !configured
                ? "Supabase is not configured, so there is nowhere to save shared content (see v2/README.md)."
                : read.available
                  ? undefined
                  : "Shared content has no table yet — v2/supabase/migrations/0002_cms.sql has not been run. You can edit here, but saving will fail until it is."
            }
          />
        </div>
      </div>
    </DirtyGuard>
  );
}
