"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addCircle,
  addInsight,
  moveInsight,
  removeCircle,
  removeInsight,
  saveIdea,
  updateInsight,
  useBoardStore,
  type InsightItem,
  type TopicCircle,
} from "@/lib/insights";
import { XIcon } from "./CircleIcon";
import { FuseCircle } from "./FuseCircle";
import { IdeasPanel } from "./IdeasPanel";
import { NewCircleModal } from "./NewCircleModal";
import { Toolbar } from "./Toolbar";
import { TopicCircleView, TopicPanel, type CircleLayout } from "./TopicCircle";
import { circleText, focusRing } from "./palette";

const LAYOUT_STORE_KEY = "animals-circle-layouts-v1";

/* Homes mirror the loose Figma constellation. Every circle can then be moved/resized. */
const BUILTIN_LAYOUTS: Record<string, CircleLayout> = {
  news: { x: 1.5, y: 3, diameter: 380 },
  "key-influencers": { x: 29, y: 1, diameter: 280 },
  "breakout-themes": { x: 55, y: 73, diameter: 280 },
  "media-hotspots": { x: 73, y: 11, diameter: 340 },
  social: { x: 1.5, y: 63, diameter: 380 },
  "customer-opinion": { x: 28, y: 73, diameter: 260 },
  culture: { x: 73, y: 65, diameter: 340 },
};

const CUSTOM_LAYOUTS: CircleLayout[] = [
  { x: 35, y: 3, diameter: 280 },
  { x: 36, y: 72, diameter: 280 },
  { x: 3, y: 34, diameter: 280 },
  { x: 78, y: 38, diameter: 280 },
  { x: 17, y: 22, diameter: 260 },
  { x: 64, y: 72, diameter: 260 },
];

const LAVA = ["lava-a", "lava-b", "lava-c", "lava-d"];

const SHAKE_CSS = `
@keyframes anomalies-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(5px)}}
.anomalies-shake{animation:anomalies-shake .45s ease}
@media (prefers-reduced-motion: reduce){.anomalies-shake{animation:none}}
`;

export function AnomaliesBoard() {
  const { circles, insights, ideas } = useBoardStore();

  /* fuse state — raw ids; stale ids (removed from the store) are filtered at render */
  const [rawSlots, setSlots] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ideaText, setIdeaText] = useState("");
  const [shake, setShake] = useState(false);
  const [rejectHint, setRejectHint] = useState(false);

  /* chrome state */
  const [zoom, setZoom] = useState(100);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [addFor, setAddFor] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savedLayouts, setSavedLayouts] = useState<Record<string, CircleLayout>>({});
  const boardRef = useRef<HTMLDivElement>(null);

  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(LAYOUT_STORE_KEY);
        if (raw) setSavedLayouts(JSON.parse(raw) as Record<string, CircleLayout>);
      } catch {
        /* corrupted/private storage — use the designed defaults */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const insightsById = useMemo(
    () => new Map(insights.map((i) => [i.id, i])),
    [insights]
  );
  const circleById = useMemo(() => new Map(circles.map((c) => [c.id, c])), [circles]);
  const byCircle = useMemo(() => {
    const m = new Map<string, InsightItem[]>();
    for (const ins of insights) {
      const arr = m.get(ins.circleId);
      if (arr) arr.push(ins);
      else m.set(ins.circleId, [ins]);
    }
    return m;
  }, [insights]);

  /* Slots derived at render: insights deleted from the store simply drop out. */
  const slots = useMemo(
    () => rawSlots.filter((id) => insightsById.has(id)),
    [rawSlots, insightsById]
  );

  const slotItems = slots
    .map((id) => insightsById.get(id))
    .filter((x): x is InsightItem => Boolean(x));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const triggerReject = useCallback(() => {
    setShake(true);
    setRejectHint(true);
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    shakeTimer.current = setTimeout(() => setShake(false), 500);
    hintTimer.current = setTimeout(() => setRejectHint(false), 2600);
  }, []);

  /* Core fuse rule: max two insights, each from a different circle. */
  const addToFuse = useCallback(
    (id: string) => {
      const insight = insightsById.get(id);
      if (!insight || slots.length >= 2) return;
      const firstId = slots[0];
      if (firstId) {
        const first = insightsById.get(firstId);
        if (first && first.circleId === insight.circleId) {
          triggerReject();
          return;
        }
      }
      setSlots([...slots, id]);
    },
    [insightsById, slots, triggerReject]
  );

  /* Drop path: dropping an already-slotted card is a no-op. */
  const dropInsight = useCallback(
    (id: string) => {
      if (slots.includes(id)) return;
      addToFuse(id);
    },
    [slots, addToFuse]
  );

  /* Click/tap path: toggles off if already slotted (also the keyboard path). */
  const pickInsight = useCallback(
    (id: string) => {
      if (slots.includes(id)) {
        setSlots(slots.filter((s) => s !== id));
        return;
      }
      addToFuse(id);
    },
    [slots, addToFuse]
  );

  const removeSlot = useCallback((id: string) => {
    setSlots((prev) => prev.filter((s) => s !== id));
  }, []);

  const clearFuse = useCallback(() => {
    setSlots([]);
    setIdeaText("");
  }, []);

  const saveFuse = useCallback(() => {
    const a = slotItems[0];
    const b = slotItems[1];
    const text = ideaText.trim();
    if (!a || !b || !text) return;
    saveIdea({ text, itemIds: [a.id, b.id], circleIds: [a.circleId, b.circleId] });
    setSlots([]);
    setIdeaText("");
    setIdeasOpen(true);
    showToast("Idea saved");
  }, [slotItems, ideaText, showToast]);

  const handleAddInsight = useCallback(
    (circleId: string, text: string) => {
      addInsight({ circleId, headline: text, author: "R Basckin" });
      setAddFor(null);
      showToast("Insight added");
    },
    [showToast]
  );

  /* a card the user typed can be rewritten or taken off the board; the add
     popover and the editor never show at once */
  const openAdd = useCallback((circleId: string | null) => {
    setAddFor(circleId);
    if (circleId) setEditingId(null);
  }, []);

  const handleEditToggle = useCallback((id: string | null) => {
    setEditingId(id);
    if (id) setAddFor(null);
  }, []);

  const handleEditSave = useCallback(
    (id: string, text: string) => {
      if (updateInsight(id, text)) showToast("Insight updated");
      setEditingId(null);
    },
    [showToast]
  );

  const handleDeleteInsight = useCallback(
    (id: string) => {
      removeInsight(id);
      setSlots((prev) => prev.filter((s) => s !== id));
      setEditingId((prev) => (prev === id ? null : prev));
      showToast("Insight removed");
    },
    [showToast]
  );

  /* dragging a card onto another circle refiles it there */
  const handleMoveInsight = useCallback(
    (insightId: string, circleId: string) => {
      if (!moveInsight(insightId, circleId)) return;
      const name = circleById.get(circleId)?.name ?? "circle";
      showToast(`Moved to ${name}`);
    },
    [circleById, showToast]
  );

  const handleNewCircle = useCallback(
    (c: Omit<TopicCircle, "id" | "builtIn">) => {
      addCircle(c);
      setModalOpen(false);
      showToast("Circle added to the board");
    },
    [showToast]
  );

  const updateCircleLayout = useCallback((circleId: string, layout: CircleLayout) => {
    setSavedLayouts((prev) => {
      const next = { ...prev, [circleId]: layout };
      try {
        localStorage.setItem(LAYOUT_STORE_KEY, JSON.stringify(next));
      } catch {
        /* in-memory movement still works */
      }
      return next;
    });
  }, []);

  const deleteCircle = useCallback(
    (circleId: string) => {
      const circle = circleById.get(circleId);
      if (!circle || circle.builtIn) return;
      removeCircle(circleId);
      setSavedLayouts((prev) => {
        const next = { ...prev };
        delete next[circleId];
        try {
          localStorage.setItem(LAYOUT_STORE_KEY, JSON.stringify(next));
        } catch {
          /* in-memory removal still works */
        }
        return next;
      });
      showToast(`${circle.name} circle deleted`);
    },
    [circleById, showToast]
  );

  const copyLink = useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => showToast("Link copied"),
        () => showToast("Couldn't copy link")
      );
    } else {
      showToast("Couldn't copy link");
    }
  }, [showToast]);

  /* Escape closes the topmost layer. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // the modal (z-50) overlays everything, so it must close first
      if (modalOpen) setModalOpen(false);
      else if (addFor) setAddFor(null);
      else if (editingId) setEditingId(null);
      else if (ideasOpen) setIdeasOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [addFor, editingId, modalOpen, ideasOpen]);

  const circleFor = useCallback(
    (circleId: string) => circleById.get(circleId),
    [circleById]
  );

  let freeIdx = 0;

  return (
    <main className="relative mx-auto w-full max-w-[1560px] flex-1 bg-bg">
      <style>{SHAKE_CSS}</style>

      {/* toolbar */}
      <div className="relative z-20 flex justify-end px-4 pt-4 sm:px-6 lg:absolute lg:right-8 lg:top-6 lg:px-0 lg:pt-0 print:hidden">
        <Toolbar
          zoom={zoom}
          onZoom={setZoom}
          onCopyLink={copyLink}
          ideasCount={ideas.length}
          ideasOpen={ideasOpen}
          onToggleIdeas={() => setIdeasOpen((v) => !v)}
          onNewCircle={() => setModalOpen(true)}
        />
      </div>

      {/* desktop board */}
      <div className="relative hidden overflow-hidden lg:block lg:min-h-[max(1400px,calc(100vh-8.5rem))] print:block print:min-h-[1400px]">
        <div
          ref={boardRef}
          className="absolute inset-0 print:!transform-none"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          <div className="relative h-full w-full">
            {circles.map((c, i) => {
              const fallback = c.builtIn
                ? BUILTIN_LAYOUTS[c.id]
                : CUSTOM_LAYOUTS[freeIdx++ % CUSTOM_LAYOUTS.length];
              const layout = savedLayouts[c.id] ?? fallback ?? { x: 35, y: 3, diameter: 280 };
              return (
                <TopicCircleView
                  key={c.id}
                  circle={c}
                  insights={byCircle.get(c.id) ?? []}
                  lavaClass={LAVA[i % LAVA.length]}
                  layout={layout}
                  boardRef={boardRef}
                  onLayoutChange={updateCircleLayout}
                  onDelete={deleteCircle}
                  selectedIds={slots}
                  onPick={pickInsight}
                  addOpen={addFor === c.id}
                  onAddToggle={openAdd}
                  onAddSave={handleAddInsight}
                  onMoveInsight={handleMoveInsight}
                  editingId={editingId}
                  onEditToggle={handleEditToggle}
                  onEditSave={handleEditSave}
                  onDeleteInsight={handleDeleteInsight}
                />
              );
            })}

            <FuseCircle
              slotItems={slotItems}
              circleFor={circleFor}
              ideaText={ideaText}
              onIdeaText={setIdeaText}
              onDrop={dropInsight}
              onRemove={removeSlot}
              onSave={saveFuse}
              onClear={clearFuse}
              shake={shake}
              rejectHint={rejectHint}
            />
          </div>
        </div>
      </div>

      {/* mobile board: vertical stack of panels */}
      <div className="flex flex-col gap-4 px-4 pb-56 pt-4 sm:px-6 lg:hidden print:hidden">
        {circles.map((c) => (
          <TopicPanel
            key={c.id}
            circle={c}
            insights={byCircle.get(c.id) ?? []}
            selectedIds={slots}
            onPick={pickInsight}
            addOpen={addFor === c.id}
            onAddToggle={openAdd}
            onAddSave={handleAddInsight}
            onMoveInsight={handleMoveInsight}
            editingId={editingId}
            onEditToggle={handleEditToggle}
            onEditSave={handleEditSave}
            onDeleteInsight={handleDeleteInsight}
          />
        ))}
      </div>

      {/* mobile fuse bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden print:hidden">
        <div
          className={`border-t border-line bg-card px-4 pb-4 pt-3 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.3)] ${
            shake ? "anomalies-shake" : ""
          }`}
        >
          <div className="mx-auto w-full max-w-xl">
            <div className="flex items-stretch gap-2">
              {[0, 1].map((i) => {
                const item = slotItems[i];
                const c = item ? circleById.get(item.circleId) : undefined;
                return item ? (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-bg2/60 px-3 py-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[10px] font-bold uppercase tracking-wide ${
                          c ? circleText[c.color] : "text-graphite"
                        }`}
                      >
                        {c?.name ?? "—"}
                      </span>
                      <span className="block truncate text-xs text-ink">{item.headline}</span>
                    </span>
                    <button
                      type="button"
                      aria-label="Remove from fuse"
                      onClick={() => removeSlot(item.id)}
                      className={`shrink-0 rounded-full p-1 text-graphite transition-colors hover:text-red ${focusRing}`}
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    key={`empty-${i}`}
                    className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-silver px-3 py-3 text-center text-xs text-graphite"
                  >
                    {i === 0
                      ? "Tap an insight to select it"
                      : slotItems.length === 1
                        ? "Pick one from another circle"
                        : "Then a second insight"}
                  </div>
                );
              })}
            </div>

            {rejectHint && (
              <p role="status" className="mt-2 text-center text-xs font-medium text-red">
                Pick insights from two different circles.
              </p>
            )}

            {slotItems.length >= 2 && (
              <div className="mt-3">
                <label htmlFor="fuse-idea-mobile" className="text-sm font-semibold text-ink">
                  Your new idea
                </label>
                <textarea
                  id="fuse-idea-mobile"
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  rows={2}
                  placeholder="Write the idea this intersection unlocks..."
                  className={`mt-1.5 w-full resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-graphite/70 ${focusRing}`}
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!ideaText.trim()}
                    onClick={saveFuse}
                    className={`rounded-full bg-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                  >
                    Save idea
                  </button>
                  <button
                    type="button"
                    onClick={clearFuse}
                    className={`rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg2 ${focusRing}`}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* overlays */}
      <IdeasPanel open={ideasOpen} onClose={() => setIdeasOpen(false)} />
      {modalOpen && <NewCircleModal onClose={() => setModalOpen(false)} onSave={handleNewCircle} />}

      {toast && (
        <div
          role="status"
          className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg lg:bottom-6 print:hidden"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
