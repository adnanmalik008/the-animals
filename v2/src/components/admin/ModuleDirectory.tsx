import "server-only";
import Link from "next/link";
import { card, hint } from "@/components/admin/form/tokens";
import {
  moduleGroups,
  moduleHref,
  type ModuleEntry,
  type ModuleGroup,
} from "@/components/admin/module-groups";
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
   ============================================================ */

type Badge = "Saved" | "Built-in" | "Needs attention" | "Form coming";

const BADGE_TONE: Record<Badge, string> = {
  Saved: "bg-orange/10 text-orange",
  "Built-in": "bg-bg2 text-graphite",
  "Needs attention": "bg-red/10 text-red",
  "Form coming": "bg-yellow/15 text-olive",
};

/* What each badge means, said in words rather than only in colour. It is a
   `title` for a mouse and an sr-only suffix for everyone else: a one-word
   badge is exactly the case where the meaning is carried entirely by context
   a screen reader never reaches. */
const BADGE_TITLE: Record<Badge, string> = {
  Saved: "Content you have saved — every board shows it",
  "Built-in": "Nothing saved, so every board shows the content built into the code",
  "Needs attention": "What is saved no longer fits this module's fields",
  "Form coming": "No form for this module yet — JSON only",
};

/** UTC and fixed-locale: a server-rendered timestamp must not depend on
    where the machine that rendered it happens to be. */
const STAMP = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  hour12: false,
});

function stamp(iso: string): string | null {
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? null : `${STAMP.format(at)} UTC`;
}

interface EntryState {
  badge: Badge;
  /** when the row was last written; absent when nothing is stored */
  updatedAt?: string;
}

/** A stored row → its badge. A key with no definition has no form, so it says
    so whether or not something is saved for it; everything else is judged on
    whether what is saved still fits. */
function badgeFor(entry: ModuleEntry, row: ModuleRowInfo | undefined): Badge {
  if (!entry.heading) return "Form coming";
  if (!row) return "Built-in";
  return row.status === "invalid" ? "Needs attention" : "Saved";
}

function ModuleList({ groups, states }: { groups: ModuleGroup[]; states: Map<string, EntryState> }) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite">
            {group.title}
          </h3>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {group.entries.map((entry) => (
              <Row key={entry.key} entry={entry} state={states.get(entry.key)} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Row({ entry, state }: { entry: ModuleEntry; state: EntryState | undefined }) {
  const badge = state?.badge ?? "Built-in";
  const at = state?.updatedAt ? stamp(state.updatedAt) : null;

  return (
    <li className="relative flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
      <div className="min-w-0 flex-1">
        <Link
          href={moduleHref(entry.key)}
          className="text-sm font-semibold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-orange/70"
        >
          {entry.label}
        </Link>
        <p className={`${hint} truncate`}>{entry.heading ?? "Raw JSON only for now"}</p>
      </div>
      {at && <span className={`${hint} shrink-0`}>{at}</span>}
      <span
        title={BADGE_TITLE[badge]}
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_TONE[badge]}`}
      >
        {badge}
        <span className="sr-only"> — {BADGE_TITLE[badge]}</span>
      </span>
      <span className="shrink-0 text-xs font-medium text-ink">Edit →</span>
    </li>
  );
}

export async function ModuleDirectory() {
  const read = await getContentRowInfos();

  const states = new Map<string, EntryState>();
  const groups = moduleGroups();
  if (read.ok) {
    const saved = new Map(read.rows.map((r) => [r.moduleKey, r]));
    for (const group of groups) {
      for (const entry of group.entries) {
        const row = saved.get(entry.key);
        states.set(entry.key, { badge: badgeFor(entry, row), updatedAt: row?.updatedAt });
      }
    }
  }

  return (
    <section className={`${card} flex flex-col gap-5`}>
      {!read.ok ? (
        <ReadErrorNotice what="the content" error={read.error} />
      ) : (
        <>
          {!read.available && <NoContentTable />}
          <ModuleList groups={groups} states={states} />
        </>
      )}
    </section>
  );
}

function NoContentTable() {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-yellow/15 px-4 py-3">
      <p className="text-sm font-semibold text-ink">Content has nowhere to live yet</p>
      <p className="text-sm text-graphite">
        The <code className="font-mono text-xs">module_content</code> table has not been created, so every
        module below is showing the content built into the code and saving here will fail with a database
        error. Applying <code className="font-mono text-xs">v2/supabase/migrations/0002_cms.sql</code> turns
        this screen on. Nothing else is affected — the boards themselves are unchanged.
      </p>
    </div>
  );
}
