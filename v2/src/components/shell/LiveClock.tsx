"use client";

import { useEffect, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  return (
    <div className="hidden shrink-0 items-stretch gap-px overflow-hidden rounded-2xl border border-line lg:flex">
      <div className="flex flex-col justify-center bg-bg2 px-5 py-3">
        <span className="text-[10px] uppercase tracking-wide text-graphite">GMT+1</span>
        <div className="flex items-end gap-2 tabular-nums" aria-live="off">
          {(["Hours", "Minutes", "Seconds"] as const).map((unit, i) => {
            const value = time
              ? [time.getHours(), time.getMinutes(), time.getSeconds()][i]
              : 0;
            return (
              <span key={unit} className="flex flex-col items-center">
                <span className="text-xl font-semibold leading-6">
                  {time ? pad(value) : "--"}
                </span>
                <span className="text-[9px] uppercase tracking-wide text-graphite">{unit}</span>
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center bg-card px-4 py-3">
        <span className="text-[10px] uppercase tracking-wide text-graphite">
          {time ? DAYS[time.getDay()] : "---"}
        </span>
        <span className="text-xl font-semibold leading-6 tabular-nums">
          {time ? pad(time.getDate()) : "--"}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-graphite">
          {time ? MONTHS[time.getMonth()] : "---"}
        </span>
      </div>
    </div>
  );
}
