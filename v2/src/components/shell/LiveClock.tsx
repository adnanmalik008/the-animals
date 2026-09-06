"use client";

import { useEffect, useMemo, useState } from "react";

/* Board time is the client's own, not the viewer's: an IANA zone from the
   board header document, formatted by Intl so summer time is handled for
   us. The label beside it is free text the agency writes, so it is not
   derived from the zone. */

function formatterFor(timeZone: string) {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  try {
    return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone });
  } catch {
    /* An unrecognised zone throws in the constructor. A board that loses
       its clock is worse than one an hour out, so fall back to the
       viewer's own zone rather than letting this take the page down. */
    return new Intl.DateTimeFormat("en-GB", opts);
  }
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
