"use client";

import { useEffect, useState } from "react";

/* Board time is fixed GMT+1 per the brief */
function gmtPlusOne(now: Date) {
  return new Date(now.getTime() + (now.getTimezoneOffset() + 60) * 60_000);
}

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setTime(gmtPlusOne(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = time
    ? `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
    : "--:--:--";

  return (
    <div className="hidden shrink-0 items-stretch overflow-hidden rounded-2xl border border-line lg:flex">
      <div className="flex flex-col justify-center bg-bg2 px-5 py-3">
        <span className="text-[10px] uppercase tracking-wide text-graphite">GMT+1</span>
        {/* one time string, big enough to fill the cube — no unit labels */}
        <span className="text-[28px] font-semibold leading-8 tabular-nums" aria-live="off">
          {clock}
        </span>
      </div>
    </div>
  );
}
