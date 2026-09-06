"use client";

import { useState } from "react";
import { Module } from "@/components/modules/ModuleColumn";
import { useLocalStorage } from "@/lib/hooks";

interface SavedNote {
  id: string;
  text: string;
  savedAt: string;
}

/* Spiral coil across the top of the pad — one repeated ring glyph. */
function SpiralBinding() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-4 left-0 right-0 flex justify-around px-4"
    >
      {Array.from({ length: 16 }, (_, i) => (
        <svg key={i} width="18" height="30" viewBox="0 0 18 30" fill="none" className="shrink-0">
          <ellipse cx="9" cy="24" rx="4.5" ry="2.4" fill="rgba(0,0,0,0.18)" />
          <path d="M4 25C3 15 5 5 9 4c4-1 6 6 5 12" stroke="#4a4a4a" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M4 25C3 15 5 5 9 4" stroke="#9b9b9b" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}

export function Notepad({ id }: { id: string }) {
  const [draft, setDraft] = useLocalStorage("live-notepad", "");
  const [notes, setNotes] = useLocalStorage<SavedNote[]>("live-notepad-saved", []);
  const [justSaved, setJustSaved] = useState(false);

  const saveNote = () => {
    const text = draft.trim();
    if (!text) return;
    const stamp = new Date();
    setNotes((prev) => [
      {
        id: `note-${stamp.getTime()}`,
        text,
        savedAt: stamp.toLocaleString(undefined, {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);
    setDraft("");
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1800);
  };

  const removeNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <Module
      id={id}
      eyebrow="Notepad"
      title="Notepad"
      variant="editorial"
      headerExtra={
        <span className="ml-auto flex items-center gap-2">
          <span className="text-xs text-graphite" aria-live="polite">
            {justSaved ? "Saved" : notes.length > 0 ? `${notes.length} saved` : ""}
          </span>
          <button
            type="button"
            onClick={() => setDraft("")}
            title="Start a fresh page"
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
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
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
              onClick={saveNote}
              disabled={!draft.trim()}
              className="absolute bottom-5 right-5 rounded-full bg-orange px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
            >
              Save
            </button>
          </div>
        </div>

        {/* saved notes stack */}
        {notes.length > 0 && (
          <ul className="mt-5 flex flex-col gap-2.5">
            {notes.map((note) => (
              <li
                key={note.id}
                className="group/note relative rounded-sm bg-card px-4 py-3 shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
              >
                <p className="whitespace-pre-wrap font-serif text-base leading-relaxed">{note.text}</p>
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-1.5">
                  <span className="text-xs text-graphite">{note.savedAt}</span>
                  <button
                    type="button"
                    onClick={() => removeNote(note.id)}
                    aria-label="Delete note"
                    className="rounded-full px-2 py-0.5 text-xs text-graphite opacity-0 transition-opacity hover:text-red focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70 group-hover/note:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Module>
  );
}
