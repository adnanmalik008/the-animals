import "server-only";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  moduleGroups,
  type ModuleEntry,
} from "@/components/admin/module-groups";
import { ModuleIndex, type EntryState, type ModuleBadge } from "@/components/admin/ModuleIndex";
import { ReadErrorNotice } from "@/components/admin/ReadError";
import { getContentRowInfos, type ModuleRowInfo } from "@/lib/server/docs";

/* ============================================================
   Every module the agency can edit, and what state each one is in.

   One list, one read. A row is either saved (and still valid, or not) or it
   is absent, in which case every board is showing the content built into the
   code.

   The read failing is the case that matters. "Nothing saved yet" and "the
   database did not answer" look identical in the data and could not be less
   alike in consequence: one invites a Save, the other makes it destructive.

   This half is the read and the judgement. Drawing it — and filtering it,
   which needs state — is `ModuleIndex`, a client component that is handed
   nothing but plain data.
   ============================================================ */

/** A stored row → its badge. A key with no definition has no form, so it says
    so whether or not something is saved for it; everything else is judged on
    whether what is saved still fits. */
function badgeFor(entry: ModuleEntry, row: ModuleRowInfo | undefined): ModuleBadge {
  if (!entry.heading) return "Form coming";
  if (!row) return "Built-in";
  return row.status === "invalid" ? "Needs attention" : "Saved";
}

export async function ModuleDirectory() {
  const read = await getContentRowInfos();

  if (!read.ok) {
    return <ReadErrorNotice what="the content" error={read.error} />;
  }

  /* Only the modules that differ from the resting state are worth sending:
     a key absent from this map is showing the content built into the code,
     which is what the index assumes of anything it is not told about. */
  const groups = moduleGroups();
  const saved = new Map(read.rows.map((r) => [r.moduleKey, r]));
  const states: Record<string, EntryState> = {};
  for (const entry of groups.flatMap((g) => g.entries)) {
    const row = saved.get(entry.key);
    const badge = badgeFor(entry, row);
    if (badge === "Built-in") continue;
    states[entry.key] = { badge, updatedAt: row?.updatedAt };
  }

  return (
    <ModuleIndex
      groups={groups}
      states={states}
      notice={read.available ? undefined : <NoContentTable />}
    />
  );
}

function NoContentTable() {
  return (
    <Alert>
      <TriangleAlert />
      <AlertTitle>Content has nowhere to live yet</AlertTitle>
      <AlertDescription>
        The <code className="font-mono text-xs">module_content</code> table has not been created, so
        every module below is showing the content built into the code and saving here will fail with a
        database error. Applying{" "}
        <code className="font-mono text-xs">supabase/migrations/0002_cms.sql</code> turns this screen
        on. Nothing else is affected — the boards themselves are unchanged.
      </AlertDescription>
    </Alert>
  );
}
