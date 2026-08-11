"use client";

import { useEffect, useRef, useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { useLocalStorage } from "@/lib/hooks";

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

  const onChange = (value: string) => {
    setNotes(value);
    setSaved(false);
    clearTimeout(timers.current.idle);
    clearTimeout(timers.current.hide);
    /* the value is persisted immediately; the indicator waits for the pen to lift */
    timers.current.idle = setTimeout(() => {
      setSaved(true);
      timers.current.hide = setTimeout(() => setSaved(false), 1800);
    }, 800);
  };

  return (
    <Module
      id={id}
      eyebrow="Margins № 05"
      title="Notepad"
      variant="editorial"
      headerExtra={
        <span
          className={`ml-auto flex items-center gap-1 text-xs text-graphite transition-opacity duration-300 motion-reduce:transition-none ${
            saved ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {/* live region announces only when text content actually changes */}
          <span aria-live="polite">{saved ? "Saved" : ""}</span>
        </span>
      }
    >
      <div className="pt-4">
        <label htmlFor="live-notepad" className="sr-only">
          Notes
        </label>
        <textarea
          id="live-notepad"
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Scribble in the margins — hunches, threads to pull, names to remember…"
          spellCheck={false}
          className="min-h-[190px] w-full resize-y rounded-md bg-transparent p-2 font-serif text-lg leading-8 text-ink placeholder:text-graphite/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.07) 31px, rgba(0,0,0,0.07) 32px)",
            backgroundAttachment: "local",
            backgroundPosition: "0 10px",
          }}
        />
      </div>
    </Module>
  );
}
