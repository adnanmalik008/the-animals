import { Module } from "@/components/modules/ModuleColumn";
import { channelMix, type ChannelBubble, type CompetitorMix } from "@/data/competition";
import { AnimalView } from "./AnimalView";
import { BrandMark } from "./BrandMark";
import { MediaOverlap } from "./MediaOverlap";
import { Kicker, Subtitle, bigTitle } from "./ui";

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
      <circle cx={x} cy={y} r={BUBBLE_R} className="fill-white/10" />
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
        className="fill-white/70"
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
        {/* the enclosing disc: the card's own colour with a hairline edge */}
        <circle cx={CX} cy={CY} r={OUTER_R} className="fill-bg3 stroke-white/5" strokeWidth={1.5} />
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
        <BrandMark id={mix.id} size="100%" rounded="rounded-[25%]" plate />
      </div>
    </div>
  );
}

function ReachSlider({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="-mx-5 mt-5 border-t border-white/5 px-5 pt-5">
      <div className="flex items-center justify-between font-display text-base text-white">
        <span>Reach</span>
        <span>{label}</span>
      </div>
      {/* the file's track: a white/5 rail, orange up to the knob, a white knob
          with an orange centre, three 8px ticks beneath */}
      <div className="relative mt-3 h-1.5 rounded-full bg-white/5">
        <div className="absolute inset-y-0 left-0 rounded-full bg-orange" style={{ width: `${pct}%` }} />
        <span
          aria-hidden
          className="absolute top-1/2 flex size-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white"
          style={{ left: `${pct}%` }}
        >
          <span className="size-1.5 rounded-full bg-orange" />
        </span>
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
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-bg3 px-5 pb-5">
      {/* header — the mark on a 48px white/5 tile whose corners crop it, as in the file */}
      <div className="flex items-center gap-4 py-5">
        <BrandMark id={mix.id} size={48} rounded="rounded-xl" plate />
        <h4 className="font-display text-xl font-medium text-white">{mix.name}</h4>
        <span className="ml-auto flex items-center gap-2 font-display text-base text-white/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/competition/globe.svg" alt="" aria-hidden className="size-4 shrink-0" />
          {mix.domain}
        </span>
      </div>

      <div className="-mx-5 border-t border-white/5 px-5 pt-5">
        <div className="flex items-center justify-between font-display text-base">
          <span className="text-orange">Channel Ecosystem</span>
          <span className="flex items-center gap-[3px] tabular-nums">
            <span className="text-yellow">{active}</span>
            <span className="text-white/15">/</span>
            <span className="text-white/70">{mix.channels.length} active</span>
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
      <Kicker className="mt-12">Channel Mix</Kicker>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {channelMix.map((mix) => (
          <CompetitorCard key={mix.id} mix={mix} />
        ))}
      </div>

      {/* the design pairs the overlap matrix with this section's read */}
      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MediaOverlap />
        <AnimalView section={id} />
      </div>
    </Module>
  );
}
