import "server-only";
import Link from "next/link";
import { StepEyebrow } from "@/app/admin/ui";
import { card, hint } from "@/components/admin/form/tokens";
import { moduleGroups, type ModuleEntry, type ModuleGroup } from "@/components/admin/module-groups";
import { ReadErrorNotice } from "@/components/admin/ReadError";
import { moduleHref, type EditScope } from "@/components/admin/scope";
import { boardHost } from "@/lib/board-url";
import type { ModuleStatus } from "@/lib/cms/types";
import type { BoardRecord } from "@/lib/server/boards";
import { getBoardDocs, getDefaultRowInfos, getModuleRows } from "@/lib/server/docs";

/* ============================================================
   Everything a scope can hold, and what state each piece is in.

   Two readers, one list. A board and the agency's shared content come from
   different tables and are judged by different questions — "does this board
   have its own copy?" against "does a shared copy exist at all?" — but they
   are the same rows on screen, so each answer is reduced to a badge and a
   timestamp before the list ever sees it.

   The read failing is the case that matters. "Nothing saved yet" and "the
   database did not answer" look identical in the data and could not be less
   alike in consequence: one invites a Save, the other makes it destructive.
   ============================================================ */

type Badge = "Custom" | "Shared" | "Default" | "Needs attention" | "Form coming";

const BADGE_TONE: Record<Badge, string> = {
  Custom: "bg-orange/10 text-orange",
  Shared: "bg-green/10 text-green",
  Default: "bg-bg2 text-graphite",
  "Needs attention": "bg-red/10 text-red",
  "Form coming": "bg-yellow/15 text-olive",
};

/* What each badge means, said in words rather than only in colour. It is a
   `title` for a mouse and an sr-only suffix for everyone else: a one-word
   badge is exactly the case where the meaning is carried entirely by context
   a screen reader never reaches. */
const BADGE_TITLE: Record<Badge, string> = {
  Custom: "This board's own content",
  Shared: "Showing the agency-wide shared content",
  Default: "Showing the content built into the code",
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

/* ---------------- the list ---------------- */

function ModuleList({
  scope,
  groups,
  states,
}: {
  scope: EditScope;
  groups: ModuleGroup[];
  states: Map<string, EntryState>;
}) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite">
            {group.title}
          </h3>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {group.entries.map((entry) => (
              <Row key={entry.key} scope={scope} entry={entry} state={states.get(entry.key)} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Row({
  scope,
  entry,
  state,
}: {
  scope: EditScope;
  entry: ModuleEntry;
  state: EntryState | undefined;
}) {
  const badge = state?.badge ?? "Default";
  const at = state?.updatedAt ? stamp(state.updatedAt) : null;

  return (
    <li className="relative flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
      <div className="min-w-0 flex-1">
        <Link
          href={moduleHref(scope, entry.key)}
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

/* ---------------- one board ---------------- */

const BOARD_BADGE: Record<ModuleStatus, Badge> = {
  custom: "Custom",
  shared: "Shared",
  default: "Default",
  invalid: "Needs attention",
};

export async function BoardModuleDirectory({ board }: { board: BoardRecord }) {
  const scope: EditScope = {
    kind: "board",
    slug: board.slug,
    host: boardHost(board.slug, process.env.BOARD_ROOT_DOMAIN),
  };
  /* `getBoardDocs` says which of the three sources each module is showing;
     `getModuleRows` says when this board last wrote one, and is the read that
     can report having failed. Both have to have worked for a badge to mean
     anything — `unavailable` also covers a shared-defaults read that failed,
     without which "Shared" and "Default" cannot be told apart. */
  const [content, read] = await Promise.all([getBoardDocs(board.id), getModuleRows(board.id)]);

  const states = new Map<string, EntryState>();
  if (read.ok && !content.unavailable) {
    const status = content.status as Record<string, ModuleStatus | undefined>;
    const saved = new Map(read.rows.map((r) => [r.moduleKey, r]));
    for (const group of moduleGroups()) {
      for (const entry of group.entries) {
        const known = entry.heading ? status[entry.key] : undefined;
        states.set(entry.key, {
          badge: known ? BOARD_BADGE[known] : "Form coming",
          updatedAt: saved.get(entry.key)?.updatedAt,
        });
      }
    }
  }

  return (
    <section className={`${card} flex flex-col gap-5`}>
      <div>
        <StepEyebrow n="02">Content</StepEyebrow>
        <h2 className="mt-1 text-lg font-bold">Modules</h2>
        <p className="mt-0.5 text-sm text-graphite">
          Every box on this client&apos;s board. Open one to edit what it says.
        </p>
      </div>

      {!read.ok || content.unavailable ? (
        <ReadErrorNotice
          what="this board's content"
          error={read.ok ? "the board's content could not be read" : read.error}
        />
      ) : (
        <ModuleList scope={scope} groups={moduleGroups()} states={states} />
      )}
    </section>
  );
}

/* ---------------- the agency's shared content ---------------- */

export async function SharedModuleDirectory() {
  const scope: EditScope = { kind: "defaults" };
  const read = await getDefaultRowInfos();

  const states = new Map<string, EntryState>();
  if (read.ok) {
    for (const row of read.rows) {
      states.set(row.moduleKey, {
        badge: row.status === "invalid" ? "Needs attention" : "Shared",
        updatedAt: row.updatedAt,
      });
    }
  }

  return (
    <section className={`${card} flex flex-col gap-5`}>
      {!read.ok ? (
        <ReadErrorNotice what="the shared content" error={read.error} />
      ) : (
        <>
          {!read.available && <NoSharedTable />}
          {/* no JSON-only keys: a shared document is read by every board that
              has none of its own, so a key nothing can validate never gets one */}
          <ModuleList scope={scope} groups={moduleGroups({ includeLegacy: false })} states={states} />
        </>
      )}
    </section>
  );
}

function NoSharedTable() {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-yellow/15 px-4 py-3">
      <p className="text-sm font-semibold text-ink">Shared content has nowhere to live yet</p>
      <p className="text-sm text-graphite">
        The <code className="font-mono text-xs">module_defaults</code> table has not been created, so every
        module below is showing the content built into the code and saving here will fail with a database
        error. Applying <code className="font-mono text-xs">v2/supabase/migrations/0002_cms.sql</code> turns
        this screen on. Nothing else is affected — a board reads shared content only when there is some.
      </p>
    </div>
  );
}
