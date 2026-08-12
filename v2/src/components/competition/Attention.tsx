import { Module } from "@/components/modules/ModuleColumn";
import { channelMix, type ChannelBubble, type CompetitorMix } from "@/data/competition";
import { BrandMark } from "./BrandMark";
import { DarkPanel, Kicker, Subtitle, bigTitle } from "./ui";

/* "What's Driving Their Attention" — radial channel-bubble ring per competitor.
   Entirely static: bubbles sit at precomputed positions on a fixed square. */

const RING = 260; // px square
const CENTER = RING / 2;

/** Precomputed ring positions (7 bubbles, from top going clockwise).
    Order matches CompetitorMix.channels. Radius 92px. */
const POSITIONS: { x: number; y: number }[] = [
  { x: 130, y: 38 }, // Direct — top
  { x: 202, y: 73 }, // Referral — upper right
  { x: 220, y: 150 }, // Social — right
  { x: 170, y: 213 }, // Organic search — lower right
  { x: 90, y: 213 }, // Paid search — lower left
  { x: 40, y: 150 }, // Display ADS — left
  { x: 58, y: 73 }, // Mail — upper left
];

function Bubble({ bubble, x, y }: { bubble: ChannelBubble; x: number; y: number }) {
  const strong = bubble.pct >= 10;
  const weak = bubble.pct < 1;
  const diameter = weak ? 34 : Math.max(38, Math.min(56, 30 + bubble.pct));

  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: x, top: y }}
    >
      <span
        style={{ width: diameter, height: diameter }}
        className={`flex items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums ${
          strong
            ? "border-white/25 bg-white/10 text-white"
            : weak
              ? "border-white/10 bg-transparent text-orange/70"
              : "border-white/15 bg-white/5 text-white/80"
        }`}
      >
        {bubble.pct}%
      </span>
      <span className="mt-1 whitespace-nowrap text-[10px] text-white/45">
        {bubble.label}
      </span>
    </div>
  );
}

function ReachSlider({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/55">Reach</span>
        <span className="font-medium text-white/85">{label}</span>
      </div>
      <div className="relative mt-2.5 h-[3px] rounded-full bg-white/12">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-orange"
          style={{ width: `${pct}%` }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange bg-white"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CompetitorCard({ mix }: { mix: CompetitorMix }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      {/* header */}
      <div className="flex items-center gap-2.5">
        <BrandMark id={mix.id} size={28} />
        <h4 className="text-sm font-semibold text-white">{mix.name}</h4>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-white/45">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
          </svg>
          {mix.domain}
        </span>
      </div>

      {/* channel ecosystem label */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="font-medium text-orange">Channel Ecosystem</span>
        <span className="tabular-nums text-white/50">{mix.activeLabel} active</span>
      </div>

      {/* radial bubble ring */}
      <div className="mt-2 flex justify-center">
        <div className="relative" style={{ width: RING, height: RING }}>
          <span
            aria-hidden
            className="absolute rounded-full border border-white/[0.06]"
            style={{ left: CENTER - 92, top: CENTER - 92, width: 184, height: 184 }}
          />
          {/* center brand circle */}
          <div
            className="absolute flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06]"
            style={{ left: CENTER - 31, top: CENTER - 31, width: 62, height: 62 }}
          >
            <BrandMark id={mix.id} size={34} className="rounded-full" />
          </div>
          {mix.channels.map((bubble, i) => (
            <Bubble key={bubble.key} bubble={bubble} x={POSITIONS[i].x} y={POSITIONS[i].y} />
          ))}
        </div>
      </div>

      <ReachSlider pct={mix.reachPct} label={mix.reachLabel} />
    </article>
  );
}

export function Attention({ id }: { id: string }) {
  return (
    <Module id={id} title="What's Driving Their Attention" titleClassName={bigTitle}>
      <Subtitle>How the category shows up.</Subtitle>
      <DarkPanel className="mt-5">
        <Kicker>Channel Mix</Kicker>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {channelMix.map((mix) => (
            <CompetitorCard key={mix.id} mix={mix} />
          ))}
        </div>
      </DarkPanel>
    </Module>
  );
}
