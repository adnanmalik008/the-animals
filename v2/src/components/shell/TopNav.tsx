"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useBoardMeta } from "@/components/board/BoardDataContext";

const tabs = [
  { label: "Live", href: "/" },
  { label: "Anomalies", href: "/anomalies" },
  { label: "Competition", href: "/competition" },
  { label: "In the Wild", href: "/in-the-wild" },
];

export function TopNav() {
  const pathname = usePathname();
  const boardMeta = useBoardMeta();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-line">
      <div className="mx-auto flex h-16 max-w-[1560px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Wordmark */}
        <Link href="/" className="shrink-0 select-none" aria-label="The Animals — home">
          {/* v1 logo asset is white-on-transparent; invert for the light shell */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo/logo.png"
            alt="The Animals"
            className="h-9 w-auto invert"
          />
        </Link>

        {/* Desktop tab pill */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-line bg-card px-1.5 py-1 shadow-sm">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-orange text-white"
                    : "text-ink hover:bg-bg2"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
          <span className="ml-1 rounded-full border border-line px-2.5 py-1 text-xs text-graphite">
            {boardMeta.progressPct}%
          </span>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex -space-x-1.5">
              <span className="h-7 w-7 rounded-full border-2 border-card bg-orange" aria-hidden />
              <span className="h-7 w-7 rounded-full border-2 border-card bg-blue" aria-hidden />
            </span>
            <span className="text-graphite text-sm">/</span>
            <span className="text-sm font-medium">{boardMeta.userName}</span>
          </div>
          <span className="h-9 w-9 rounded-full bg-gradient-to-br from-orange to-purple" aria-hidden />

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-full border border-line"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`h-0.5 w-4 bg-ink transition-transform ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-4 bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-4 bg-ink transition-transform ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav sheet */}
      {menuOpen && (
        <nav className="md:hidden border-t border-line bg-card px-4 py-3 flex flex-col gap-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium ${
                  active ? "bg-orange text-white" : "text-ink hover:bg-bg2"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
