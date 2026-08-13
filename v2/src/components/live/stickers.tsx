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
  type KeyboardEvent as ReactKeyboardEvent,
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

export type InsightPayload = Omit<InsightItem, "id" | "createdAt">;

interface StickerCtxValue {
  /** how many stickers have been used — drives the Rolodex roll */
  used: number;
  armedSticker: number | null;
  toggleArm: () => void;
  /** shade index stuck on a given target, or undefined */
  tagOf: (key: string) => number | undefined;
  applySticker: (key: string, payload: InsightPayload) => boolean;
}

const StickerCtx = createContext<StickerCtxValue>({
  used: 0,
  armedSticker: null,
  toggleArm: () => {},
  tagOf: () => undefined,
  applySticker: () => false,
});

const TAG_STORE_KEY = "animals-sticker-tags";

export function StickerProvider({ children }: { children: ReactNode }) {
  const { circles } = useBoardStore();
  const [used, setUsed] = useState(0);
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
      const shade = used % 3;
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

      /* Rolodex: the used sticker leaves; the queue advances */
      setUsed((u) => u + 1);
      setArmed(false);

      const circle = circlesRef.current.find((c) => c.id === payload.circleId);
      const name =
        circle?.name ?? payload.circleId.charAt(0).toUpperCase() + payload.circleId.slice(1);
      setToast({ msg: `Sent to Anomalies — ${name}`, key: Date.now() });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2400);
      return true;
    },
    [used]
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
      used,
      armedSticker: armed ? used % 3 : null,
      toggleArm: () => setArmed((v) => !v),
      tagOf: (key: string) => tags[key],
      applySticker,
    }),
    [used, armed, tags, applySticker]
  );

  return (
    <StickerCtx.Provider value={value}>
      {children}
      {/* persistent live region so screen readers hear every confirmation */}
      <div role="status" aria-live="polite" className="sr-only">
        {toast?.msg}
      </div>
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

/* A stuck sticker badge, rendered on tagged cards and modules —
   the real sticker asset, tilted slightly so it reads as hand-placed. */
export function StickerBadge({ shade, className = "" }: { shade: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/stickers/sticker-red.png"
      alt="Tagged for Anomalies"
      title="Tagged for Anomalies"
      draggable={false}
      className={`pointer-events-none absolute -left-1 top-1 z-10 h-8 w-8 drop-shadow-md ${className}`}
      style={{ transform: `rotate(${((shade % 3) - 1) * 14}deg)` }}
    />
  );
}

/* ---------------- the floating tray ---------------- */

export function StickerTray() {
  const { used, armedSticker, toggleArm } = useContext(StickerCtx);
  const liveStickerRef = useRef<HTMLImageElement | null>(null);
  const [inHand, setInHand] = useState(false);

  /* a successful drop advances `used` — the dragged sticker is gone,
     so stop hiding the (new) center sticker */
  useEffect(() => {
    setInHand(false);
  }, [used]);

  return (
    <div
      role="toolbar"
      aria-label="Sticker wheel — drag the top sticker onto a card or module to send it to Anomalies, or press it and then choose a target"
      className={`fixed bottom-4 right-4 z-40 h-[105px] w-[60px] rounded-full border border-line bg-card shadow-[0_2px_10px_rgba(0,0,0,0.12)] transition-transform duration-500 ease-out motion-reduce:transition-none lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 ${
        armedSticker !== null ? "scale-105" : ""
      }`}
    >
      {/* the rest of the roll: orange stickers half-showing at both ends,
          clipped inside the pill — the cue that more stickers are queued.
          The top one is the next in line: on use it rolls down into the
          center, and a fresh sticker pops in up top. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`top-${used}`}
          src="/assets/stickers/sticker-red.png"
          alt=""
          draggable={false}
          className="sticker-pop absolute top-1.5 left-1/2 h-[26px] w-[26px] -translate-x-1/2 select-none opacity-90"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/stickers/sticker-red.png"
          alt=""
          draggable={false}
          className="absolute bottom-1.5 left-1/2 h-[26px] w-[26px] -translate-x-1/2 select-none opacity-90"
        />
      </div>

      {/* the live sticker in the middle. Dragging lifts it off the wheel
          (the slot empties while it rides with the cursor); when it lands,
          the top sticker rolls down into the empty slot. */}
      <button
        key={used}
        type="button"
        draggable
        aria-pressed={armedSticker !== null}
        aria-label="Sticker — drag onto a card, or press to arm and then choose a target"
        title="Drag onto a card or module — or press, then click a target"
        onClick={toggleArm}
        onDragStart={(e) => {
          e.dataTransfer.setData(STICKER_MIME, String(used % 3));
          e.dataTransfer.effectAllowed = "copy";
          if (liveStickerRef.current) {
            e.dataTransfer.setDragImage(liveStickerRef.current, 20, 20);
          }
          /* hide after the browser snapshots the drag image */
          requestAnimationFrame(() => setInHand(true));
        }}
        onDragEnd={() => setInHand(false)}
        className={`sticker-roll absolute left-1/2 top-1/2 h-[40px] w-[40px] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 active:cursor-grabbing ${
          inHand ? "opacity-0" : "opacity-100"
        } ${armedSticker !== null ? "ring-2 ring-ink ring-offset-2" : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={liveStickerRef}
          src="/assets/stickers/sticker-red.png"
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none h-full w-full select-none drop-shadow-sm"
        />
      </button>
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
    const key = resolveKey();
    /* one sticker per target — re-sticking would file duplicates */
    if (tagOf(key) !== undefined) return;
    applySticker(key, payloadRef.current());
  }, [applySticker, resolveKey, tagOf]);

  const onClick = useCallback(() => {
    if (armedSticker === null) return;
    stick();
  }, [armedSticker, stick]);

  /* armed targets are reachable and actionable by keyboard */
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (armedSticker === null) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      stick();
    },
    [armedSticker, stick]
  );

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

  /* read under the same key stick() writes, or keyless zones never show their sticker */
  const tagged = tagOf(tagKey ?? getPayload().headline.slice(0, 80));

  const armed = armedSticker !== null;
  return {
    targetProps: {
      onDragOver,
      onDragLeave,
      onDrop,
      onClick,
      onKeyDown,
      /* focusable + announced only while a sticker is armed */
      tabIndex: armed ? 0 : undefined,
      role: armed ? ("button" as const) : undefined,
      "aria-label": armed ? "Stick here — send to Anomalies" : undefined,
    },
    /* highlight every target while a sticker is armed so the next click is obvious */
    isOver: isOver || armed,
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
