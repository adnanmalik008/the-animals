"use client";

import { useEffect, useRef, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { useLocalStorage } from "@/lib/hooks";

/* Spiral coil across the top of the pad — one repeated ring glyph. */
function SpiralBinding() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-4 left-0 right-0 flex justify-around px-4"
    >
      {Array.from({ length: 16 }, (_, i) => (
        <svg key={i} width="18" height="30" viewBox="0 0 18 30" fill="none" className="shrink-0">
          {/* ring shadow into the paper */}
          <ellipse cx="9" cy="24" rx="4.5" ry="2.4" fill="rgba(0,0,0,0.18)" />
          {/* coil */}
          <path
            d="M4 25C3 15 5 5 9 4c4-1 6 6 5 12"
            stroke="#4a4a4a"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M4 25C3 15 5 5 9 4"
            stroke="#9b9b9b"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}

export function Notepad({ id }: { id: string }) {
  const [notes, setNotes] = useLocalStorage("live-notepad", "");
  const [saved, setSaved] = useState(false);
  const timers = useRef<{ idle?: ReturnType<typeof setTimeout>; hide?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    const t = timers.current;
    return () => {
      clearTimeout(t.idle);
      clearTimeout(t.hide);
    };
  }, []);

  const flashSaved = () => {
    clearTimeout(timers.current.hide);
    setSaved(true);
    timers.current.hide = setTimeout(() => setSaved(false), 1800);
  };

  const onChange = (value: string) => {
    setNotes(value);
    setSaved(false);
    clearTimeout(timers.current.idle);
    clearTimeout(timers.current.hide);
    /* the value is persisted immediately; the indicator waits for the pen to lift */
    timers.current.idle = setTimeout(flashSaved, 800);
  };

  return (
    <Module
      id={id}
      eyebrow="Margins № 05"
      title="Notepad"
      variant="editorial"
      headerExtra={
        <span className="ml-auto flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs text-graphite transition-opacity duration-300 motion-reduce:transition-none ${
              saved ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {/* live region announces only when text content actually changes */}
            <span aria-live="polite">{saved ? "Saved" : ""}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setNotes("");
              flashSaved();
            }}
            title="Tear off — start a fresh page"
            aria-label="Start a fresh page"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-orange shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 motion-reduce:transition-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </span>
      }
    >
      <div className="pt-8">
        {/* the pad: white sheet with ruled lines under a spiral binding */}
        <div className="relative">
          <SpiralBinding />
          <div className="rounded-sm bg-card px-5 pb-16 pt-8 shadow-[0_2px_10px_rgba(0,0,0,0.10),0_10px_16px_-12px_rgba(0,0,0,0.25)]">
            <label htmlFor="live-notepad" className="sr-only">
              Notes
            </label>
            <textarea
              id="live-notepad"
              value={notes}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Scribble in the margins — hunches, threads to pull, names to remember…"
              spellCheck={false}
              rows={9}
              className="min-h-[288px] w-full resize-y bg-transparent font-serif text-lg leading-8 text-ink placeholder:text-graphite/50 focus-visible:outline-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent, transparent 31px, var(--line) 31px, var(--line) 32px)",
                backgroundAttachment: "local",
              }}
            />
            <button
              type="button"
              onClick={flashSaved}
              className="absolute bottom-5 right-5 rounded-full bg-orange px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Module>
  );
}
