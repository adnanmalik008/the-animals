import "server-only";
import { notFound } from "next/navigation";
import { buildRefSources } from "@/lib/cms/refs";
import { byKey } from "@/lib/cms/registry";
import { MODULE_TEMPLATES } from "@/lib/module-templates";
import { getContentDocs, getContentRowInfos } from "@/lib/server/docs";
import { isCmsConfigured } from "@/lib/server/supabase";
import { ContentNav, DirtyGuard } from "@/components/admin/ContentNav";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { CONTENT_HREF, moduleGroups } from "@/components/admin/module-groups";
import { ReadErrorPage } from "@/components/admin/ReadError";

/* ============================================================
   One module of the content.

   `ModuleForm` is handed `moduleKey` as a string and never the definition:
   definitions carry functions, RegExps and a `fixture()` closure, none of
   which survive the RSC boundary. The client looks the same key up itself.

   Which document the form starts from is the interesting decision:

   • the read failed → nothing at all. A fixture presented as "what is saved"
     is one Save away from replacing the real content, and the form's whole
     purpose is to Save.
   • a saved doc that no longer validates → the *saved* doc, raw. Handing back
     the fixture instead would quietly discard whatever is stored the moment
     anybody pressed Save.
   • nothing saved → the built-in content, which is what every board is
     showing for this module right now.

   Until `0002_cms.sql` is applied the table does not exist. The read shrugs
   that off and reports "nothing saved", which is true; the warning below says
   so, and a Save still goes out and fails loudly with the database's own
   message rather than appearing to work.
   ============================================================ */

export default async function ContentModulePage({ params }: PageProps<"/admin/content/[key]">) {
  const { key } = await params;
  const def = byKey(key);
  const template = MODULE_TEMPLATES[key];
  // neither a definition nor a legacy template: there is no such module
  if (!def && template === undefined) notFound();

  const read = await getContentRowInfos();
  if (!read.ok) {
    return (
      <ReadErrorPage
        what="the content"
        error={read.error}
        backHref={CONTENT_HREF}
        backLabel="All content"
      />
    );
  }

  const row = read.rows.find((r) => r.moduleKey === key);
  const invalid = row?.status === "invalid";
  const configured = isCmsConfigured();
  const startingDoc = row ? row.data : def ? def.fixture() : template;

  /* A `ref` field stores the id of a row in another module — a competitor,
     say. The options are resolved here, where every document is already in
     hand, and travel to the form as plain {value,label} pairs: definitions
     do not cross the RSC boundary, and neither does the registry. */
  const refSources = def ? buildRefSources(def.fields, { ...(await getContentDocs()) }, startingDoc) : undefined;

  return (
    <DirtyGuard>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <ContentNav currentKey={key} groups={moduleGroups()} />
        <div className="min-w-0 flex-1">
          <ModuleForm
            moduleKey={key}
            initialDoc={startingDoc}
            resetDoc={def ? def.fixture() : template}
            invalid={invalid}
            canSave={configured}
            refSources={refSources}
            warning={
              !configured
                ? "Supabase is not configured, so there is nowhere to save content (see v2/README.md)."
                : read.available
                  ? undefined
                  : "Content has no table yet — v2/supabase/migrations/0002_cms.sql has not been run. You can edit here, but saving will fail until it is."
            }
          />
        </div>
      </div>
    </DirtyGuard>
  );
}
