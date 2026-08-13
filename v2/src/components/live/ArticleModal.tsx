"use client";

import { useEffect, useRef } from "react";
import type { NewsItem } from "@/data/board";
import { SourceMark } from "./SourceMark";

/* Full-article reader. Opens from a Newswire row's "Read full article". */
export function ArticleModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    /* focus moves into the dialog, cycles inside it, and returns on close */
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [onClose]);

  const paragraphs = (item.body ?? item.summary).split("\n\n");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.headline}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 px-4 py-10 backdrop-blur-sm print:hidden"
    >
      <article ref={dialogRef} className="relative w-full max-w-3xl rounded-3xl bg-card shadow-2xl">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close article"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/80 text-white transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* hero */}
        <div className="h-52 rounded-t-3xl bg-gradient-to-br from-bg3 via-graphite to-ink sm:h-64" aria-hidden />

        <div className="px-6 py-7 sm:px-10 sm:py-9">
          <div className="flex items-center gap-3">
            <SourceMark source={item.source} />
            <span className="rounded-full bg-orange/10 px-2.5 py-0.5 text-xs font-medium text-orange">
              {item.category}
            </span>
          </div>

          <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{item.headline}</h1>

          <p className="mt-3 flex items-center gap-3 text-xs uppercase tracking-wide text-graphite">
            <span>{item.author}</span>
            <span aria-hidden>·</span>
            <span>{item.timeAgo}</span>
          </p>

          <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6">
            {paragraphs.map((p, i) => (
              <p key={i} className="font-serif text-[17px] leading-relaxed text-ink/90">
                {p}
              </p>
            ))}
          </div>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-orange hover:text-orange-hover"
            >
              Open at {item.source}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
