import { channelMix, type BrandId, type CompetitorMix } from "@/data/competition";

/* Deliberately static — no animation. Restraint is the design. */

const strokeClass: Record<string, string> = {
  orange: "stroke-orange",
  blue: "stroke-blue",
  green: "stroke-green",
  purple: "stroke-purple",
};

const dotClass: Record<string, string> = {
  orange: "bg-orange",
  blue: "bg-blue",
  green: "bg-green",
  purple: "bg-purple",
};

/* Each wordmark gets its own typographic voice. */
const wordmarkClass: Record<BrandId, string> = {
  adidas: "text-2xl font-bold lowercase tracking-tight",
  nike: "text-2xl font-black uppercase italic tracking-tighter",
  on: "text-2xl font-extrabold tracking-tight",
  hoka: "text-xl font-black uppercase tracking-[0.2em]",
  newbalance: "text-base font-semibold uppercase tracking-[0.18em]",
};

const R = 40;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ChannelDonut({ brand }: { brand: CompetitorMix }) {
  // precompute each arc's start offset so nothing mutates during render
  const segments = brand.channels.reduce<{ slice: CompetitorMix["channels"][number]; start: number }[]>(
    (acc, slice) => {
      const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].slice.pct : 0;
      acc.push({ slice, start });
      return acc;
    },
    []
  );
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-[100px] w-[100px] shrink-0"
      role="img"
      aria-label={`${brand.name} channel mix, total reach ${brand.reachLabel}`}
    >
      <g transform="rotate(-90 50 50)">
        {segments.map(({ slice, start }) => {
          const dash = (slice.pct / 100) * CIRCUMFERENCE;
          const offset = -(start / 100) * CIRCUMFERENCE;
          return (
            <circle
              key={slice.key}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              strokeWidth="13"
              className={strokeClass[slice.color]}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </g>
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink text-[19px] font-bold tabular-nums"
      >
        {brand.reachLabel}
      </text>
    </svg>
  );
}

function ReachSlider({ pct }: { pct: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="uppercase tracking-wider text-graphite">Reach</span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="relative h-1 rounded-full bg-bg2">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-ink"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-card shadow-sm"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function ChannelMix() {
  return (
    <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 xl:grid-cols-4">
      {channelMix.map((brand) => (
        <article
          key={brand.id}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5"
        >
          <h3 className={wordmarkClass[brand.id]}>{brand.name}</h3>

          <div className="flex items-center gap-4">
            <ChannelDonut brand={brand} />
            <ul className="flex flex-1 flex-col gap-1.5">
              {brand.channels.map((slice) => (
                <li
                  key={slice.key}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-graphite">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass[slice.color]}`}
                      aria-hidden
                    />
                    {slice.label}
                  </span>
                  <span className="font-semibold tabular-nums">{slice.pct}%</span>
                </li>
              ))}
            </ul>
          </div>

          <ReachSlider pct={brand.reachPct} />
        </article>
      ))}
    </div>
  );
}
