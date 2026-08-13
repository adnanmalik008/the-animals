"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { addInsight, useBoardStore, type InsightItem } from "@/lib/insights";

/* ============================================================
   Stickers — the Live → Anomalies routing gesture.
   Drag a sticker onto a card or data module and its content is
   filed into the matching topic circle. The used sticker rolls
   away like a Rolodex and the next shade rolls up in its place;
   the sticker itself stays stuck on the tagged item.
   ============================================================ */

export const STICKER_MIME = "animals/sticker";

/* three shades of orange, per the client's note */
const SHADES = ["#FF4500", "#FF652C", "#FF8A5B"];
const STICKER_COUNT = SHADES.length;

export type InsightPayload = Omit<InsightItem, "id" | "createdAt">;

interface StickerCtxValue {
  /** wheel[0] is the sticker currently on top and ready to use */
  wheel: number[];
  armedSticker: number | null;
  toggleArm: () => void;
  /** shade index stuck on a given target, or undefined */
  tagOf: (key: string) => number | undefined;
  applySticker: (key: string, payload: InsightPayload) => boolean;
}

const StickerCtx = createContext<StickerCtxValue>({
  wheel: [0, 1, 2],
  armedSticker: null,
  toggleArm: () => {},
  tagOf: () => undefined,
  applySticker: () => false,
});

const TAG_STORE_KEY = "animals-sticker-tags";

export function StickerProvider({ children }: { children: ReactNode }) {
  const { circles } = useBoardStore();
  const [wheel, setWheel] = useState<number[]>(() =>
    Array.from({ length: STICKER_COUNT }, (_, i) => i)
  );
  const [armed, setArmed] = useState(false);
  const [tags, setTags] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* tags survive a reload so a tagged article stays visibly tagged */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(TAG_STORE_KEY);
        if (raw) setTags(JSON.parse(raw) as Record<string, number>);
      } catch {
        /* unavailable or corrupted — start clean */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const circlesRef = useRef(circles);
  useEffect(() => {
    circlesRef.current = circles;
  }, [circles]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const applySticker = useCallback(
    (key: string, payload: InsightPayload) => {
      const shade = wheel[0];
      addInsight(payload);

      setTags((prev) => {
        const next = { ...prev, [key]: shade };
        try {
          localStorage.setItem(TAG_STORE_KEY, JSON.stringify(next));
        } catch {
          /* quota/private mode — in-memory only */
        }
        return next;
      });

      /* Rolodex: the used sticker rotates to the back of the wheel */
      setWheel((prev) => [...prev.slice(1), prev[0]]);
      setArmed(false);

      const circle = circlesRef.current.find((c) => c.id === payload.circleId);
      const name =
        circle?.name ?? payload.circleId.charAt(0).toUpperCase() + payload.circleId.slice(1);
      setToast({ msg: `Sent to Anomalies — ${name}`, key: Date.now() });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2400);
      return true;
    },
    [wheel]
  );

  /* Escape disarms */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<StickerCtxValue>(
    () => ({
      wheel,
      armedSticker: armed ? wheel[0] : null,
      toggleArm: () => setArmed((v) => !v),
      tagOf: (key: string) => tags[key],
      applySticker,
    }),
    [wheel, armed, tags, applySticker]
  );

  return (
    <StickerCtx.Provider value={value}>
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

/* A stuck sticker badge, rendered on tagged cards and modules. */
export function StickerBadge({ shade, className = "" }: { shade: number; className?: string }) {
  return (
    <span
      aria-label="Tagged for Anomalies"
      title="Tagged for Anomalies"
      className={`pointer-events-none absolute -left-2.5 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md ring-2 ring-white ${className}`}
      style={{ backgroundColor: SHADES[shade] ?? SHADES[0] }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

/* ---------------- the floating tray ---------------- */

export function StickerTray() {
  const { wheel, armedSticker, toggleArm } = useContext(StickerCtx);

  return (
    <div
      role="toolbar"
      aria-label="Sticker wheel — drag the top sticker onto a card or module to send it to Anomalies, or press it and then choose a target"
      className="fixed bottom-4 right-4 z-40 h-[105px] w-[60px] lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
    >
      {/* the pill + peeking stickers, straight from the design source */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/stickers/sticker-wheel.svg"
        alt=""
        aria-hidden
        draggable={false}
        className={`pointer-events-none absolute inset-0 h-full w-full select-none transition-transform duration-500 ease-out motion-reduce:transition-none ${
          armedSticker !== null ? "scale-105" : ""
        }`}
      />

      {/* the live sticker sits over the middle of the wheel */}
      <button
        key={wheel[0]}
        type="button"
        draggable
        aria-pressed={armedSticker !== null}
        aria-label="Sticker — drag onto a card, or press to arm and then choose a target"
        title="Drag onto a card or module — or press, then click a target"
        onClick={toggleArm}
        onDragStart={(e) => {
          e.dataTransfer.setData(STICKER_MIME, String(wheel[0]));
          e.dataTransfer.effectAllowed = "copy";
        }}
        className={`sticker-pop absolute left-1/2 top-1/2 h-[31px] w-[31px] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 active:cursor-grabbing ${
          armedSticker !== null ? "ring-2 ring-ink ring-offset-2" : ""
        }`}
      />
    </div>
  );
}

/* ---------------- drop-target behavior ---------------- */

export function useStickerTarget(getPayload: () => InsightPayload, tagKey?: string) {
  const { armedSticker, applySticker, tagOf } = useContext(StickerCtx);
  const [isOver, setIsOver] = useState(false);
  const payloadRef = useRef(getPayload);
  useEffect(() => {
    payloadRef.current = getPayload;
  });

  /* a stable key so the stuck sticker survives re-render and reload */
  const keyRef = useRef(tagKey);
  useEffect(() => {
    keyRef.current = tagKey;
  }, [tagKey]);
  const resolveKey = useCallback(
    () => keyRef.current ?? payloadRef.current().headline.slice(0, 80),
    []
  );

  const stick = useCallback(() => {
    applySticker(resolveKey(), payloadRef.current());
  }, [applySticker, resolveKey]);

  const onClick = useCallback(() => {
    if (armedSticker === null) return;
    stick();
  }, [armedSticker, stick]);

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
      stick();
    },
    [stick]
  );

  const tagged = tagOf(tagKey ?? "");

  return {
    targetProps: { onDragOver, onDragLeave, onDrop, onClick },
    /* highlight every target while a sticker is armed so the next click is obvious */
    isOver: isOver || armedSticker !== null,
    /** shade index of the sticker stuck here, or undefined */
    tagged,
    /** kept for callers that only need the drop flash */
    justDropped: tagged !== undefined,
  };
}

/* Convenience wrapper: highlights on sticker dragover, files the payload
   on drop, and keeps the sticker visible afterwards. */
export function StickerDropZone({
  insight,
  tagKey,
  className = "",
  children,
}: {
  insight: () => InsightPayload;
  tagKey?: string;
  className?: string;
  children: ReactNode;
}) {
  const { targetProps, isOver, tagged } = useStickerTarget(insight, tagKey);
  return (
    <div
      {...targetProps}
      className={`relative rounded-xl transition-shadow duration-300 motion-reduce:transition-none ${
        tagged !== undefined ? "ring-2 ring-orange/60" : isOver ? "ring-2 ring-orange" : ""
      } ${className}`}
    >
      {tagged !== undefined && <StickerBadge shade={tagged} />}
      {children}
    </div>
  );
}
