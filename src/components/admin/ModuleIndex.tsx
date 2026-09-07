"use client";

/* ============================================================
   The content index: thirty modules, and getting to one of them.

   Three things it holds to, whatever it is drawn with:

   • State is drawn only where it differs. A module showing the built-in
     content is the resting state of the whole screen, so it says nothing at
     all; the ones that have been edited, or no longer fit their fields, are
     the ones that get colour. The counts at the top carry the rest.
   • A module's name is printed once. Twenty of the thirty are titled
     exactly as they are labelled, so the second line is the eyebrow the board
     prints above the title — never the title again.
   • Thirty names is more than a person scans, so there is a filter. It
     matches the label, the eyebrow and the key, because someone who knows the
     board says "newswire" and someone who knows the design says "Dispatch".

   Filtering is client-side over a list that is already fully in hand: this is
   an index of a fixed set, not a search over a database, and a round trip per
   keystroke would be slower and no more correct.
   ============================================================ */

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleIcon } from "@/components/admin/module-icons";
import { moduleHref, type ModuleEntry, type ModuleGroup } from "@/components/admin/module-groups";

export type ModuleBadge = "Saved" | "Built-in" | "Needs attention" | "Form coming";

export interface EntryState {
  badge: ModuleBadge;
  /** when the row was last written; absent when nothing is stored */
  updatedAt?: string;
}

/* What each state means, said in words rather than only in colour — a `title`
   for a mouse and an sr-only suffix for everyone else. */
const BADGE_TITLE: Record<ModuleBadge, string> = {
  Saved: "Content you have saved — every board shows it",
  "Built-in": "Nothing saved, so every board shows the content built into the code",
  "Needs attention": "What is saved no longer fits this module's fields",
  "Form coming": "No form for this module yet — JSON only",
};

/** The icon tile's colour. "Built-in" is the resting state of thirty
    modules out of thirty, so it stays neutral and lets the exceptions
    carry the only colour on the screen. */
const TILE_TONE: Record<ModuleBadge, string> = {
  Saved: "border-primary/30 bg-primary/10 text-primary",
  "Built-in": "bg-muted text-muted-foreground group-hover:text-foreground",
  "Needs attention": "border-destructive/30 bg-destructive/10 text-destructive",
  "Form coming": "bg-muted text-muted-foreground/70",
};

/** The short word under the name, when the state is worth a word at all. */
const STATE_NOTE: Partial<Record<ModuleBadge, { text: string; tone: string }>> = {
  Saved: { text: "Edited", tone: "text-primary" },
  "Needs attention": { text: "Needs attention", tone: "text-destructive" },
  "Form coming": { text: "JSON only", tone: "text-muted-foreground" },
};

/** UTC and fixed-locale: a timestamp must not depend on where the machine
    that rendered it happens to be. */
const STAMP = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function stamp(iso: string): string | null {
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? null : STAMP.format(at);
}

/* ---------------- the tile ---------------- */

function ModuleTile({ entry, state }: { entry: ModuleEntry; state: EntryState | undefined }) {
  const badge = state?.badge ?? "Built-in";
  const note = STATE_NOTE[badge];
  const at = state?.updatedAt ? stamp(state.updatedAt) : null;

  /* The second line is the eyebrow the board prints above this module's
     title — never the title itself, which is the line above. Where a module
     has no eyebrow there is nothing to add, and the tile stays one line. */
  const sub = entry.heading === undefined ? "Raw JSON only for now" : entry.eyebrow;

  return (
    <li className="relative">
      <div className="group flex h-full items-center gap-3 rounded-lg border bg-card px-3.5 py-3 transition-colors hover:bg-muted/50">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-md border border-transparent transition-colors ${TILE_TONE[badge]}`}
        >
          <ModuleIcon moduleKey={entry.key} />
        </span>

        <span className="min-w-0 flex-1">
          <Link
            href={moduleHref(entry.key)}
            title={BADGE_TITLE[badge]}
            className="block truncate text-sm font-medium after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring/60"
          >
            {entry.label}
            <span className="sr-only"> — {BADGE_TITLE[badge]}</span>
          </Link>
          {sub && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{sub}</span>}
        </span>

        {note && (
          <span className={`shrink-0 text-xs font-medium ${note.tone}`}>
            {note.text}
            {at && <span className="ml-1.5 font-normal text-muted-foreground">{at}</span>}
          </span>
        )}

        {/* The row is a link, so it needs to look like one goes somewhere. */}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </li>
  );
}

/* ---------------- the screen ---------------- */

export function ModuleIndex({
  groups,
  states,
  notice,
}: {
  groups: ModuleGroup[];
  /** key → state; a key absent from it is showing the built-in content */
  states: Record<string, EntryState>;
  /** rendered above the toolbar — the "no table yet" warning, when there is one */
  notice?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<string>("all");
  const inputId = useId();

  const all = useMemo(() => groups.flatMap((g) => g.entries), [groups]);

  /* The three numbers worth stating. Everything not counted here is showing
     the content built into the code, which is what the total minus the rest
     already says. */
  const counts = useMemo(() => {
    let edited = 0;
    let attention = 0;
    for (const entry of all) {
      const badge = states[entry.key]?.badge;
      if (badge === "Saved") edited += 1;
      else if (badge === "Needs attention") attention += 1;
    }
    return { total: all.length, edited, attention };
  }, [all, states]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => tab === "all" || g.id === tab)
      .map((g) => ({
        ...g,
        entries: q
          ? g.entries.filter((e) =>
              `${e.label} ${e.eyebrow ?? ""} ${e.key}`.toLowerCase().includes(q)
            )
          : g.entries,
      }))
      .filter((g) => g.entries.length > 0);
  }, [groups, query, tab]);

  const shown = visible.reduce((n, g) => n + g.entries.length, 0);
  const filtering = query.trim() !== "" || tab !== "all";

  const clear = () => {
    setQuery("");
    setTab("all");
  };

  return (
    <div className="flex flex-col gap-5">
      {notice}

      {/* What the whole set is doing, in three numbers rather than thirty chips. */}
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b pb-4 text-sm">
        <div className="flex items-baseline gap-1.5">
          <dd className="text-base font-semibold tabular-nums">{counts.total}</dd>
          <dt className="text-muted-foreground">modules</dt>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dd
            className={`text-base font-semibold tabular-nums ${counts.edited > 0 ? "text-primary" : ""}`}
          >
            {counts.edited}
          </dd>
          <dt className="text-muted-foreground">edited</dt>
        </div>
        {counts.attention > 0 && (
          <div className="flex items-baseline gap-1.5">
            <dd className="text-base font-semibold tabular-nums text-destructive">
              {counts.attention}
            </dd>
            <dt className="text-muted-foreground">need attention</dt>
          </div>
        )}
        <p className="text-xs text-muted-foreground sm:ml-auto">
          {counts.edited === 0
            ? "Every board is showing the content built into the code."
            : "The rest show the content built into the code."}
        </p>
      </dl>

      {/* Filter by name, or narrow to one tab of the board. */}
      <div className="flex flex-col gap-3">
        <div className="relative sm:max-w-xs">
          <label htmlFor={inputId} className="sr-only">
            Filter modules by name
          </label>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter modules"
            /* `type=search` earns the Escape-to-clear and the search semantics,
               and brings WebKit's own clear button with it — which lands next to
               ours as a second X. Ours stays: it is the one that also resets the
               tab. */
            className="pl-8 pr-8 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setQuery("")}
              aria-label="Clear the filter"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <X />
            </Button>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {groups.map((g) => (
              <TabsTrigger key={g.id} value={g.id}>
                {g.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Announced rather than only drawn: filtering changes the list under
          someone who cannot see it change. */}
      <p aria-live="polite" className="sr-only">
        {shown} of {counts.total} modules shown
      </p>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed px-5 py-10">
          <p className="text-sm font-medium">No module matches “{query.trim()}”.</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Modules are searched by their name, by the eyebrow the board prints above them, and by
            their key — try “dispatch”, or “reddit”.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={clear}>
            Show all modules
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {visible.map((group) => (
            <section key={group.id} className="flex flex-col gap-2.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                {group.title}
                <Badge variant="secondary" className="tabular-nums">
                  {group.entries.length}
                </Badge>
              </h3>
              <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {group.entries.map((entry) => (
                  <ModuleTile key={entry.key} entry={entry} state={states[entry.key]} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {filtering && visible.length > 0 && shown < counts.total && (
        <p className="text-xs text-muted-foreground">
          Showing {shown} of {counts.total}.{" "}
          <Button type="button" variant="link" size="xs" onClick={clear} className="px-0">
            Show all
          </Button>
        </p>
      )}
    </div>
  );
}
