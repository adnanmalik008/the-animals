"use client";

import { useEffect, useMemo, useState } from "react";

/* Board time is the client's own, not the viewer's: an IANA zone from the
   board header document, formatted by Intl so a zone that observes summer
   time is handled for us. The label beside it is free text the agency
   writes, and is not derived from the zone. */

/* Mirrors the `clock.timeZone` default in the board-header module. It is
   repeated rather than imported because the registry reaches zod and zod
   stays out of the board bundle; a test asserts the two never drift. */
export const FALLBACK_TIME_ZONE = "Etc/GMT-1";

const PARTS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat("en-GB", { ...PARTS, timeZone });
  } catch {
    /* The zone is free text, so "Europe/Pars" saves cleanly and only
       throws here. Falling back to the viewer's own zone would put a Tokyo
       client and a Berlin editor on different times under one fixed GMT+1
       label — precisely the divergence a fixed default zone exists to
       prevent. The shipped default is wrong about the client, but at least
       it still agrees with the label printed above it. */
    return new Intl.DateTimeFormat("en-GB", { ...PARTS, timeZone: FALLBACK_TIME_ZONE });
  }
}

/** The clock face for a zone at an instant — what the cube renders. */
export function formatClock(timeZone: string, date: Date): string {
  return formatterFor(timeZone).format(date);
}

export function LiveClock({ timeZone, label }: { timeZone: string; label: string }) {
  const [clock, setClock] = useState<string | null>(null);
  const format = useMemo(() => formatterFor(timeZone), [timeZone]);

  useEffect(() => {
    const tick = () => setClock(format.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [format]);

  return (
    <div className="hidden shrink-0 items-stretch overflow-hidden rounded-2xl border border-line lg:flex">
      <div className="flex flex-col justify-center bg-bg2 px-5 py-3">
        <span className="text-[10px] uppercase tracking-wide text-graphite">{label}</span>
        {/* one time string, big enough to fill the cube — no unit labels */}
        <span className="text-[28px] font-semibold leading-8 tabular-nums" aria-live="off">
          {/* the placeholder holds the box until the first client tick, so
              the server and client markup agree */}
          {clock ?? "--:--:--"}
        </span>
      </div>
    </div>
  );
}
