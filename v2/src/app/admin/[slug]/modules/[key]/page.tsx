import "server-only";
import { notFound } from "next/navigation";
import { boardHost } from "@/lib/board-url";
import { byKey } from "@/lib/cms/registry";
import type { ModuleStatus } from "@/lib/cms/types";
import { MODULE_TEMPLATES } from "@/lib/module-templates";
import { getBoardBySlug } from "@/lib/server/boards";
import { getBoardDocs, getModuleRows, getSharedDoc } from "@/lib/server/docs";
import { ContentNav, DirtyGuard } from "@/components/admin/ContentNav";
import { ModuleForm, type ResetTarget } from "@/components/admin/ModuleForm";
import { moduleGroups } from "@/components/admin/module-groups";
import { ReadErrorPage } from "@/components/admin/ReadError";
import type { EditScope } from "@/components/admin/scope";

/* ============================================================
   One module of one client's board.

   `ModuleForm` is handed `moduleKey` as a string and never the definition:
   definitions carry functions, RegExps and a `fixture()` closure, none of
   which survive the RSC boundary. The client looks the same key up itself.

   Which document the form starts from is the interesting decision:

   • the read failed → nothing at all. A fixture presented as "what is
     saved" is one Save away from replacing the client's real content, and
     the form's whole purpose is to Save.
   • a saved doc that no longer validates → the *saved* doc, raw. Handing
     back the fixture instead would quietly discard whatever the board
     actually holds the moment anybody pressed Save.
   • anything else → whatever the board is showing: its own valid document,
     the agency's shared copy, or the built-in one.
   ============================================================ */

export default async function ModulePage({ params }: PageProps<"/admin/[slug]/modules/[key]">) {
  const { slug, key } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const def = byKey(key);
  const template = MODULE_TEMPLATES[key];
  // neither a definition nor a legacy template: there is no such module
  if (!def && template === undefined) notFound();

  const scope: EditScope = {
    kind: "board",
    slug,
    host: boardHost(board.slug, process.env.BOARD_ROOT_DOMAIN),
  };

  const [content, read, sharedDoc] = await Promise.all([
    getBoardDocs(board.id),
    getModuleRows(board.id),
    def ? getSharedDoc(key) : Promise.resolve(undefined),
  ]);

  if (content.unavailable || !read.ok) {
    return (
      <ReadErrorPage
        what="this board's content"
        error={read.ok ? "the board's content could not be read" : read.error}
        backHref={`/admin/${slug}`}
        backLabel="All modules"
      />
    );
  }

  const row = read.rows.find((r) => r.moduleKey === key);
  const status = (content.status as Record<string, ModuleStatus | undefined>)[key];
  const invalid = def !== undefined && row?.status === "invalid";
  /* a doc that failed validation is still the board's own content: load it
     as stored so it can be repaired, not replaced */
  const initialDoc = def ? (invalid ? row?.data : content.docs[def.key]) : (row?.data ?? template);

  /* "Start again" has two honest answers once the agency has a shared copy:
     what this board would show with nothing of its own, and the content built
     into the code. Offer both, most specific first, rather than letting one
     button silently mean whichever exists. */
  const resets: ResetTarget[] = [
    ...(sharedDoc !== undefined ? [{ kind: "shared" as const, doc: sharedDoc }] : []),
    { kind: "template", doc: def ? def.fixture() : template },
  ];

  return (
    <DirtyGuard>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <ContentNav scope={scope} currentKey={key} groups={moduleGroups()} />
        <div className="min-w-0 flex-1">
          <ModuleForm
            scope={scope}
            moduleKey={key}
            initialDoc={initialDoc}
            resets={resets}
            invalid={invalid}
            showingShared={status === "shared"}
            canSave={board.id !== "fixture"}
            warning={
              board.id === "fixture"
                ? "This is the built-in fixture board. Saving needs Supabase configured (see v2/README.md)."
                : undefined
            }
          />
        </div>
      </div>
    </DirtyGuard>
  );
}
