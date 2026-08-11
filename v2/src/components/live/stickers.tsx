"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { addInsight, useBoardStore, type InsightItem } from "@/lib/insights";

/* ============================================================
   Stickers — the Live → Anomalies routing gesture.
   Drag one of the three orange dots onto a card or data module
   and its content is filed into the matching topic circle.
   ============================================================ */

export const STICKER_MIME = "animals/sticker";
const STICKER_COUNT = 3;

export type InsightPayload = Omit<InsightItem, "id" | "createdAt">;

interface StickerCtxValue {
  usedSticker: number | null;
  /** sticker armed via click/Enter/tap — the keyboard & touch path to a drop */
  armedSticker: number | null;
  reportDrop: (stickerIndex: number, circleId: string) => void;
  toggleArm: (stickerIndex: number) => void;
  /** completes an armed "drop" on a target; returns false when nothing armed */
  completeArmedDrop: (payload: InsightPayload) => boolean;
}

const StickerCtx = createContext<StickerCtxValue>({
  usedSticker: null,
  armedSticker: null,
  reportDrop: () => {},
  toggleArm: () => {},
  completeArmedDrop: () => false,
});

export function StickerProvider({ children }: { children: ReactNode }) {
  const { circles } = useBoardStore();
  const [usedSticker, setUsedSticker] = useState<number | null>(null);
  const [armedSticker, setArmedSticker] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const timers = useRef<{ sticker?: ReturnType<typeof setTimeout>; toast?: ReturnType<typeof setTimeout> }>({});

  const circlesRef = useRef(circles);
  useEffect(() => {
    circlesRef.current = circles;
  }, [circles]);

  const reportDrop = useCallback((stickerIndex: number, circleId: string) => {
    const circle = circlesRef.current.find((c) => c.id === circleId);
    const name = circle?.name ?? circleId.charAt(0).toUpperCase() + circleId.slice(1);
    setUsedSticker(stickerIndex);
    clearTimeout(timers.current.sticker);
    timers.current.sticker = setTimeout(() => setUsedSticker(null), 1200);
    setToast({ msg: `Sent to Anomalies — ${name}`, key: Date.now() });
    clearTimeout(timers.current.toast);
    timers.current.toast = setTimeout(() => setToast(null), 2400);
  }, []);

  const toggleArm = useCallback((stickerIndex: number) => {
    setArmedSticker((prev) => (prev === stickerIndex ? null : stickerIndex));
  }, []);

  const armedRef = useRef(armedSticker);
  useEffect(() => {
    armedRef.current = armedSticker;
  }, [armedSticker]);

  const completeArmedDrop = useCallback(
    (payload: InsightPayload) => {
      const armed = armedRef.current;
      if (armed === null) return false;
      addInsight(payload);
      setArmedSticker(null);
      reportDrop(armed, payload.circleId);
      return true;
    },
    [reportDrop]
  );

  /* Escape disarms */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmedSticker(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const t = timers.current;
    return () => {
      clearTimeout(t.sticker);
      clearTimeout(t.toast);
    };
  }, []);

  return (
    <StickerCtx.Provider value={{ usedSticker, armedSticker, reportDrop, toggleArm, completeArmedDrop }}>
      {children}
      {toast && <Toast key={toast.key} msg={toast.msg} />}
    </StickerCtx.Provider>
  );
}

function Toast({ msg }: { msg: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-bg3 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {msg}
    </div>
  );
}

/* ---------------- the floating tray ---------------- */

export function StickerTray() {
  const { usedSticker, armedSticker, toggleArm } = useContext(StickerCtx);
  return (
    <div
      role="toolbar"
      aria-label="Stickers — drag one onto a card or module to send it to Anomalies, or click to arm then click a target"
      aria-orientation="vertical"
      className="fixed bottom-4 right-4 z-40 flex flex-row gap-2 rounded-full border border-line bg-card p-1.5 shadow-lg lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:flex-col"
    >
      {Array.from({ length: STICKER_COUNT }, (_, i) => (
        <button
          key={i}
          type="button"
          draggable
          aria-pressed={armedSticker === i}
          aria-label={`Sticker ${i + 1} — drag onto a card, or press to arm and then choose a target`}
          title="Drag onto a card or module — or click to arm, then click a target"
          onClick={() => toggleArm(i)}
          onDragStart={(e) => {
            e.dataTransfer.setData(STICKER_MIME, String(i));
            e.dataTransfer.effectAllowed = "copy";
          }}
          className={`flex h-9 w-9 cursor-grab items-center justify-center rounded-full bg-orange shadow-sm transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 active:cursor-grabbing motion-reduce:transition-none ${
            armedSticker === i ? "scale-110 ring-2 ring-ink ring-offset-2" : ""
          }`}
        >
          {usedSticker === i && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------------- drop-target behavior ---------------- */

export function useStickerTarget(getPayload: () => InsightPayload) {
  const { reportDrop, armedSticker, completeArmedDrop } = useContext(StickerCtx);
  const [isOver, setIsOver] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const payloadRef = useRef(getPayload);
  useEffect(() => {
    payloadRef.current = getPayload;
  });
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const flash = useCallback(() => {
    setJustDropped(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setJustDropped(false), 600);
  }, []);

  /* armed sticker + click on target = drop (keyboard & touch path) */
  const onClick = useCallback(() => {
    if (armedSticker === null) return;
    if (completeArmedDrop(payloadRef.current())) flash();
  }, [armedSticker, completeArmedDrop, flash]);

  const onDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    if (!e.dataTransfer.types.includes(STICKER_MIME)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsOver(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (!e.dataTransfer.types.includes(STICKER_MIME)) return;
      e.preventDefault();
      e.stopPropagation();
      setIsOver(false);
      const stickerIndex = Number(e.dataTransfer.getData(STICKER_MIME)) || 0;
      const payload = payloadRef.current();
      addInsight(payload);
      reportDrop(stickerIndex, payload.circleId);
      flash();
    },
    [reportDrop, flash]
  );

  return {
    targetProps: { onDragOver, onDragLeave, onDrop, onClick },
    /* also highlight all targets while a sticker is armed, so the next click is obvious */
    isOver: isOver || armedSticker !== null,
    justDropped,
  };
}

/* Convenience wrapper: a div that highlights on sticker dragover
   and files the payload on drop. */
export function StickerDropZone({
  insight,
  className = "",
  children,
}: {
  insight: () => InsightPayload;
  className?: string;
  children: ReactNode;
}) {
  const { targetProps, isOver, justDropped } = useStickerTarget(insight);
  return (
    <div
      {...targetProps}
      className={`rounded-xl transition-shadow duration-300 motion-reduce:transition-none ${
        justDropped
          ? "ring-4 ring-orange"
          : isOver
            ? "ring-2 ring-orange"
            : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
