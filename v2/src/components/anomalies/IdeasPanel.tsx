"use client";

import { useMemo, useState } from "react";
import { useBoardMeta } from "@/components/board/BoardDataContext";
import { downloadIdeasDocx } from "@/lib/ideas-export";
import { deleteIdea, tagIdea, useBoardStore, type FusedIdea } from "@/lib/insights";
import { LightbulbIcon, XIcon } from "./CircleIcon";
import { circleText, colorSolid, focusRing } from "./palette";

const TAGS: NonNullable<FusedIdea["colorTag"]>[] = [
  "orange",
  "green",
  "yellow",
  "blue",
  "red",
  "purple",
];

/* Right slide-in Ideas panel (Figma frames 9 + 10). */
export function IdeasPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { circles, ideas, insights } = useBoardStore();
  const meta = useBoardMeta();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [paletteFor, setPaletteFor] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const circleById = useMemo(() => new Map(circles.map((c) => [c.id, c])), [circles]);

  const q = query.trim().toLowerCase();
  const visible = ideas.filter((idea) => {
    const matchQ =
      !q || idea.text.toLowerCase().includes(q) || (idea.note ?? "").toLowerCase().includes(q);
    const matchC = filter === "all" || idea.circleIds.includes(filter);
    return matchQ && matchC;
  });

  /* Export what the panel is showing: a search or circle filter narrows the
     document the same way it narrows the list, and the doc says so. */
  const exportIdeas = async () => {
    if (exporting || visible.length === 0) return;
    setExporting(true);
    try {
      const parts: string[] = [];
      if (filter !== "all") parts.push(circleById.get(filter)?.name ?? "");
      if (q) parts.push(`search "${query.trim()}"`);
      await downloadIdeasDocx({
        meta,
        ideas: visible,
        circles,
        insights,
        filterLabel: parts.filter(Boolean).join(" · ") || undefined,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <aside
      inert={!open}
      aria-label="Ideas"
      className={`fixed bottom-0 right-0 top-16 z-30 flex w-[380px] max-w-full flex-col border-l border-line bg-card shadow-2xl transition-transform duration-300 print:hidden ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* header */}
      <div className="flex items-center gap-2 border-b border-line p-4">
        <LightbulbIcon size={18} className="text-orange" />
        <h2 className="text-lg font-semibold text-ink">Ideas</h2>
        <span className="rounded-full bg-orange/10 px-2 py-0.5 text-xs font-semibold text-orange">
          {ideas.length}
        </span>
        <button
          type="button"
          onClick={exportIdeas}
          disabled={exporting || visible.length === 0}
          aria-label="Export ideas to Word"
          title="Export to Word (.docx)"
          className={`ml-auto flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink ${focusRing}`}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          {exporting ? "Exporting…" : "Export"}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ideas panel"
          className={`rounded-full p-1.5 text-graphite transition-colors hover:bg-bg2 hover:text-ink ${focusRing}`}
        >
          <XIcon />
        </button>
      </div>

      {/* search + filter */}
      <div className="flex items-center gap-2 p-4">
        <div className="relative flex-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Ideas..."
            aria-label="Search ideas"
            className={`w-full rounded-xl border border-line bg-bg2/50 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-graphite/70 ${focusRing}`}
          />
        </div>
        <div className="relative shrink-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter ideas by circle"
            className={`appearance-none rounded-xl border border-line bg-card py-2 pl-3 pr-8 text-sm text-ink ${focusRing}`}
          >
            <option value="all">Data Filter</option>
            {circles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-graphite"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {visible.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <LightbulbIcon size={28} className="text-silver" />
            <p className="max-w-[240px] text-sm text-graphite">
              {ideas.length === 0
                ? "Fuse two insights to unlock your first idea."
                : "No ideas match your search."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((idea) => (
              <article key={idea.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Tag idea with a color"
                      aria-expanded={paletteFor === idea.id}
                      onClick={() => setPaletteFor(paletteFor === idea.id ? null : idea.id)}
                      className={`block h-4 w-4 rounded-full transition-transform hover:scale-110 ${
                        colorSolid[idea.colorTag ?? "orange"]
                      } ${focusRing}`}
                    />
                    {paletteFor === idea.id && (
                      <>
                        <button
                          type="button"
                          aria-label="Close color palette"
                          onClick={() => setPaletteFor(null)}
                          className="fixed inset-0 z-10 cursor-default"
                        />
                        <div className="absolute -left-2 top-6 z-20 flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 shadow-lg">
                          {TAGS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              aria-label={`Tag ${t}`}
                              onClick={() => {
                                tagIdea(idea.id, t);
                                setPaletteFor(null);
                              }}
                              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                                idea.colorTag === t ? "border-ink/60" : "border-line hover:border-silver"
                              } ${focusRing}`}
                            >
                              <span className={`h-3 w-3 rounded-full ${colorSolid[t]}`} aria-hidden />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Delete idea"
                    onClick={() => deleteIdea(idea.id)}
                    className={`-mr-1.5 -mt-1.5 rounded-full p-1 text-silver transition-colors hover:text-red ${focusRing}`}
                  >
                    <XIcon size={12} />
                  </button>
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                  {idea.circleIds.map((cid, i) => {
                    const c = circleById.get(cid);
                    return (
                      <span key={`${cid}-${i}`} className="flex items-center gap-1.5">
                        {i > 0 && <span className="font-normal text-silver">/</span>}
                        <span className={c ? circleText[c.color] : "text-graphite"}>
                          {c?.name ?? "Removed"}
                        </span>
                      </span>
                    );
                  })}
                </p>

                <p className="mt-1.5 text-sm font-semibold leading-snug text-ink">{idea.text}</p>

                {idea.note && (
                  <p className="mt-2.5 rounded-xl bg-bg2 p-3 text-xs leading-relaxed text-graphite">
                    {idea.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
