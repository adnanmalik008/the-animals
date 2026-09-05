import { Module } from "@/components/modules/ModuleColumn";
import { channelMix, type ChannelBubble, type CompetitorMix } from "@/data/competition";
import { AnimalView } from "./AnimalView";
import { BrandMark } from "./BrandMark";
import { MediaOverlap } from "./MediaOverlap";
import { DarkPanel, Kicker, Subtitle, bigTitle } from "./ui";

/* "What's Driving Their Attention" — one card per competitor, built to the
   design's channel-ecosystem card: the brand in a rounded tile with its
   domain, seven equal bubbles around the brand inside one faint enclosing
   ring, each share in gold (red under 1%), and a reach slider below. The
   ring is a single SVG in the design's own 840-unit card coordinates,
   measured off the design export, so it scales with the card and nothing
   in it is eyeballed. */

/* the design's card is 840 units wide; the ring takes y 240–860 of it */
const VIEW_W = 840;
const VIEW_H = 620;
const CX = 420;
const CY = 308;
const OUTER_R = 283;
const CENTER_R = 86;
const BUBBLE_R = 43;
const TILE = 108;
const LABEL_DY = 66;

/** bubble centres from the design; order matches CompetitorMix.channels
    (Direct, Referral, Social, Organic search, Paid search, Display ADS, Mail) */
const BUBBLES: { x: number; y: number }[] = [
  { x: 419, y: 99 },
  { x: 590, y: 199 },
  { x: 613, y: 351 },
  { x: 534, y: 487 },
  { x: 306, y: 487 },
  { x: 224, y: 351 },
  { x: 250, y: 199 },
];

function Bubble({ bubble, x, y }: { bubble: ChannelBubble; x: number; y: number }) {
  /* under 1% the share reads red; everything else gold */
  const weak = bubble.pct < 1;
  return (
    <g>
      <circle cx={x} cy={y} r={BUBBLE_R} className="fill-white/7" />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={30}
        className={`font-semibold tabular-nums ${weak ? "fill-red" : "fill-yellow"}`}
      >
        {bubble.pct}%
      </text>
      <text
        x={x}
        y={y + LABEL_DY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        className="fill-white/65"
      >
        {bubble.label}
      </text>
    </g>
  );
}

function ChannelRing({ mix }: { mix: CompetitorMix }) {
  return (
    <div className="relative mt-2">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" aria-hidden>
        {/* the enclosing ring, as faint as the design draws it */}
        <circle cx={CX} cy={CY} r={OUTER_R} className="fill-none stroke-white/6" strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={CENTER_R} className="fill-white/5" />
        {mix.channels.map((bubble, i) => (
          <Bubble key={bubble.key} bubble={bubble} x={BUBBLES[i].x} y={BUBBLES[i].y} />
        ))}
      </svg>
      {/* the brand tile sits in the centre circle, sized in the ring's units */}
      <div
        className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${(CX / VIEW_W) * 100}%`,
          top: `${(CY / VIEW_H) * 100}%`,
          width: `${(TILE / VIEW_W) * 100}%`,
        }}
      >
        <BrandMark id={mix.id} size="100%" rounded="rounded-[22%]" />
      </div>
    </div>
  );
}

function Globe() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}

function ReachSlider({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="-mx-5 mt-5 border-t border-white/8 px-5 pt-5">
      <div className="flex items-center justify-between text-[15px]">
        <span className="text-white/70">Reach</span>
        <span className="text-white">{label}</span>
      </div>
      {/* the design's track is orange end to end; the knob carries the reading */}
      <div className="relative mt-4 h-[3px] rounded-full bg-orange">
        <span
          aria-hidden
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange bg-white"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between" aria-hidden>
        <span className="h-2 w-px bg-white/20" />
        <span className="h-2 w-px bg-white/20" />
        <span className="h-2 w-px bg-white/20" />
      </div>
    </div>
  );
}

function CompetitorCard({ mix }: { mix: CompetitorMix }) {
  const active = mix.channels.filter((c) => c.pct >= 1).length;
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.035] px-5 pb-5">
      {/* header — the rounded tile crops the mark, as in the design */}
      <div className="flex items-center gap-3.5 py-4">
        <BrandMark id={mix.id} size={48} rounded="rounded-[22%]" />
        <h4 className="text-xl font-semibold text-white">{mix.name}</h4>
        <span className="ml-auto flex items-center gap-2 text-[15px] text-white/55">
          <Globe />
          {mix.domain}
        </span>
      </div>

      <div className="-mx-5 border-t border-white/8 px-5 pt-6">
        <div className="flex items-center justify-between text-[15px]">
          <span className="font-medium text-orange">Channel Ecosystem</span>
          <span className="tabular-nums text-white/50">
            <span className="text-yellow">{active}</span> / {mix.channels.length} active
          </span>
        </div>
        <ChannelRing mix={mix} />
      </div>

      <ReachSlider pct={mix.reachPct} label={mix.reachLabel} />
    </article>
  );
}

export function Attention({ id }: { id: string }) {
  return (
    <Module id={id} variant="panel" title="What's Driving Their Attention" titleClassName={bigTitle}>
      <Subtitle>How the category shows up.</Subtitle>
      <DarkPanel className="mt-5">
        <Kicker>Channel Mix</Kicker>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {channelMix.map((mix) => (
            <CompetitorCard key={mix.id} mix={mix} />
          ))}
        </div>
      </DarkPanel>

      {/* the design pairs the overlap matrix with this section's read */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <MediaOverlap />
        <AnimalView section={id} />
      </div>
    </Module>
  );
}
