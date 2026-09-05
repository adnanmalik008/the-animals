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
  type MouseEvent,
  type ReactNode,
} from "react";
import { addInsight, removeInsight, removeInsightsBySource, useBoardStore, type InsightItem } from "@/lib/insights";

/* ============================================================
   Stickers — the Live → Anomalies routing gesture.
   Drag a sticker onto a card or data module and its content is
   filed into the matching topic circle. The used sticker rolls
   away like a Rolodex and the next shade rolls up in its place;
   the sticker itself stays stuck on the tagged item.
   ============================================================ */

export const STICKER_MIME = "animals/sticker";
export const PLACED_STICKER_MIME = "animals/placed-sticker";

export type InsightPayload = Omit<InsightItem, "id" | "createdAt">;

interface StickerTag {
  shade: number;
  x: number;
  y: number;
  insightId?: string;
}

interface StickerCtxValue {
  /** how many stickers have been used — drives the Rolodex roll */
  used: number;
  armedSticker: number | null;
  toggleArm: () => void;
  /** sticker stuck on a given target, or undefined */
  tagOf: (key: string) => StickerTag | undefined;
  applySticker: (key: string, payload: InsightPayload, position?: Pick<StickerTag, "x" | "y">) => boolean;
  removeSticker: (key: string) => void;
}

const StickerCtx = createContext<StickerCtxValue>({
  used: 0,
  armedSticker: null,
  toggleArm: () => {},
  tagOf: () => undefined,
  applySticker: () => false,
  removeSticker: () => {},
});

const TAG_STORE_KEY = "animals-sticker-tags";

export function StickerProvider({ children }: { children: ReactNode }) {
  const { circles } = useBoardStore();
  const [used, setUsed] = useState(0);
  const [armed, setArmed] = useState(false);
  const [tags, setTags] = useState<Record<string, StickerTag>>({});
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* updaters must stay pure — React may run them twice — so writes to the
     insight store and to localStorage happen here, against a mirror of the
     current tags rather than inside setTags */
  const tagsRef = useRef(tags);
  const commitTags = useCallback((next: Record<string, StickerTag>) => {
    tagsRef.current = next;
    setTags(next);
    try {
      localStorage.setItem(TAG_STORE_KEY, JSON.stringify(next));
    } catch {
      /* quota/private mode — in-memory only */
    }
  }, []);

  /* tags survive a reload so a tagged article stays visibly tagged */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(TAG_STORE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, StickerTag | number>;
          const restored = Object.fromEntries(
            Object.entries(parsed).map(([key, value]) => [
              key,
              typeof value === "number" ? { shade: value, x: 6, y: 10 } : value,
            ])
          );
          /* seed the mirror too, or the next sticker would drop the restored tags */
          tagsRef.current = restored;
          setTags(restored);
        }
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
    (key: string, payload: InsightPayload, position = { x: 6, y: 10 }) => {
      const shade = used % 3;
      const insight = addInsight({ ...payload, sourceKey: key });

      commitTags({
        ...tagsRef.current,
        [key]: {
          shade,
          x: Math.max(4, Math.min(96, position.x)),
          y: Math.max(6, Math.min(94, position.y)),
          insightId: insight.id,
        },
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
    [used, commitTags]
  );

  const removeSticker = useCallback((key: string) => {
    const tag = tagsRef.current[key];
    if (!tag) return;
    /* tags saved by an earlier build carry no insight id, so fall back to
       the source key the insight itself remembers */
    if (tag.insightId) removeInsight(tag.insightId);
    removeInsightsBySource(key);
    const next = { ...tagsRef.current };
    delete next[key];
    commitTags(next);
    setToast({ msg: "Sticker returned to the tray", key: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, [commitTags]);

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
      removeSticker,
    }),
    [used, armed, tags, applySticker, removeSticker]
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
export function StickerBadge({
  shade,
  tag,
  tagKey,
  className = "",
}: {
  shade?: number;
  tag?: StickerTag;
  tagKey?: string;
  className?: string;
}) {
  const { removeSticker } = useContext(StickerCtx);
  const value = tag ?? { shade: shade ?? 0, x: 6, y: 10 };
  return (
    <button
      type="button"
      draggable={Boolean(tagKey)}
      aria-label="Sticker tagged for Anomalies. Drag it back to the sticker tray to remove it."
      title="Drag back to the sticker tray to remove"
      onDragStart={(e) => {
        if (!tagKey) return;
        e.stopPropagation();
        e.dataTransfer.setData(PLACED_STICKER_MIME, tagKey);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (!tagKey || (e.key !== "Delete" && e.key !== "Backspace")) return;
        e.preventDefault();
        removeSticker(tagKey);
      }}
      className={`absolute z-20 h-8 w-8 cursor-grab rounded-full drop-shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 active:cursor-grabbing ${className}`}
      style={{
        left: `${value.x}%`,
        top: `${value.y}%`,
        translate: "-50% -50%",
        rotate: `${((value.shade % 3) - 1) * 14}deg`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/stickers/sticker-red.png"
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full"
      />
    </button>
  );
}

/* ---------------- the floating tray ---------------- */

export function StickerTray() {
  const { used, armedSticker, toggleArm, removeSticker } = useContext(StickerCtx);
  const liveStickerRef = useRef<HTMLImageElement | null>(null);
  const [inHand, setInHand] = useState(false);
  const [removeOver, setRemoveOver] = useState(false);

  /* The live sticker is keyed on `used`, so a successful drop swaps it for a
     fresh one mid-drag — the dragged element unmounts and its dragend never
     fires. Clear the hand here too, or the centre slot stays empty. */
  useEffect(() => {
    setInHand(false);
  }, [used]);

  return (
    <div
      role="toolbar"
      aria-label="Sticker wheel — drag the top sticker onto a card or module to send it to Anomalies, or press it and then choose a target"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(PLACED_STICKER_MIME)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setRemoveOver(true);
      }}
      onDragLeave={() => setRemoveOver(false)}
      onDrop={(e) => {
        const key = e.dataTransfer.getData(PLACED_STICKER_MIME);
        if (!key) return;
        e.preventDefault();
        setRemoveOver(false);
        removeSticker(key);
      }}
      className={`fixed bottom-4 right-4 z-40 h-[105px] w-[60px] rounded-full border bg-card shadow-[0_2px_10px_rgba(0,0,0,0.12)] transition-[transform,border-color,background-color] duration-500 ease-out motion-reduce:transition-none lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 ${
        removeOver
          ? "scale-110 border-orange bg-orange/10"
          : armedSticker !== null
            ? "scale-105 border-line"
            : "border-line"
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
  /* pointer presence, so an armed sticker highlights the one target under
     the cursor rather than every target on the board */
  const [hovered, setHovered] = useState(false);
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

  const stick = useCallback((position?: Pick<StickerTag, "x" | "y">) => {
    const key = resolveKey();
    /* one sticker per target — re-sticking would file duplicates */
    if (tagOf(key) !== undefined) return;
    applySticker(key, payloadRef.current(), position);
  }, [applySticker, resolveKey, tagOf]);

  /* both paths place the sticker where the pointer landed */
  const pointFrom = (e: { currentTarget: HTMLElement; clientX: number; clientY: number }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100,
      y: ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100,
    };
  };

  const onClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (armedSticker === null) return;
      /* keyboard activation reports 0,0 — fall back to the default corner */
      stick(e.detail === 0 ? undefined : pointFrom(e));
    },
    [armedSticker, stick]
  );

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
      stick(pointFrom(e));
    },
    [stick]
  );

  /* read under the same key stick() writes, or keyless zones never show their sticker */
  const resolvedKey = tagKey ?? getPayload().headline.slice(0, 80);
  const tagged = tagOf(resolvedKey);

  const armed = armedSticker !== null;
  return {
    targetProps: {
      onDragOver,
      onDragLeave,
      onDrop,
      onClick,
      onKeyDown,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      /* focusable + announced only while a sticker is armed */
      tabIndex: armed ? 0 : undefined,
      role: armed ? ("button" as const) : undefined,
      "aria-label": armed ? "Stick here — send to Anomalies" : undefined,
    },
    /* only the target under the pointer lights up — while dragging via
       dragover, while armed via hover. Never the whole board at once. */
    isOver: isOver || (armed && hovered),
    /** placement of the sticker stuck here, or undefined */
    tagged,
    resolvedKey,
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
  const { targetProps, isOver, tagged, resolvedKey } = useStickerTarget(insight, tagKey);
  return (
    <div
      {...targetProps}
      className={`relative rounded-xl transition-shadow duration-300 motion-reduce:transition-none ${
        isOver ? "outline-2 outline-orange outline-offset-4" : ""
      } ${className}`}
    >
      {tagged !== undefined && <StickerBadge tag={tagged} tagKey={resolvedKey} />}
      {children}
    </div>
  );
}
