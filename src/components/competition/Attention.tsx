"use client";

import { useModuleDoc } from "@/components/board/BoardDataContext";
import { Module } from "@/components/modules/ModuleColumn";
import type { ModuleDocs } from "@/lib/cms/types";
import { AnimalView } from "./AnimalView";
import { BrandMark, useCompetitor } from "./BrandMark";
import { MediaOverlap } from "./MediaOverlap";
import { Kicker, Subtitle, bigTitle } from "./ui";

/* "What's Driving Their Attention" — one card per competitor, built to the
   design's channel-ecosystem card: the brand in a rounded tile with its
   domain, seven equal bubbles around the brand inside one faint enclosing
   ring, each share in gold (red under 1%), and a reach slider below. The
   ring is a single SVG in the design's own 840-unit card coordinates,
   measured off the design export, so it scales with the card and nothing
   in it is eyeballed. */

/** One card, as the CMS stores it: a competitor id and its numbers. */
type Card = ModuleDocs["channel-mix"]["competitors"][number];

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

/** The ring: the seven channels in the order they go round the circle,
    each with the bubble centre measured off the design. Name and position
    travel together, so a label can never drift onto another bubble — and
    they stay in code, because the ring is a drawing and not a list a
    client edits. The document supplies only the shares. */
const CHANNELS = [
  { key: "direct", label: "Direct", x: 419, y: 99 },
  { key: "referral", label: "Referral", x: 590, y: 199 },
  { key: "social", label: "Social", x: 613, y: 351 },
  { key: "organic", label: "Organic search", x: 534, y: 487 },
  { key: "paid", label: "Paid search", x: 306, y: 487 },
  { key: "display", label: "Display ADS", x: 224, y: 351 },
  { key: "mail", label: "Mail", x: 250, y: 199 },
] as const satisfies readonly { key: keyof Card["channels"]; label: string; x: number; y: number }[];

/** A channel counts towards "5 / 7 active" at 1% or more — the same
    threshold the bubble uses to decide it reads red. */
const ACTIVE_AT = 1;

function Bubble({ label, pct, x, y }: { label: string; pct: number; x: number; y: number }) {
  /* under 1% the share reads red; everything else gold */
  const weak = pct < ACTIVE_AT;
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
        {pct}%
      </text>
      <text
        x={x}
        y={y + LABEL_DY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        className="fill-white/70"
      >
        {label}
      </text>
    </g>
  );
}

function ChannelRing({ card }: { card: Card }) {
  return (
    <div className="relative mt-2">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" aria-hidden>
        {/* the enclosing disc: the card's own colour with a hairline edge */}
        <circle cx={CX} cy={CY} r={OUTER_R} className="fill-bg3 stroke-white/5" strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={CENTER_R} className="fill-white/5" />
        {CHANNELS.map((channel) => (
          <Bubble
            key={channel.key}
            label={channel.label}
            pct={card.channels[channel.key]}
            x={channel.x}
            y={channel.y}
          />
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
        <BrandMark id={card.competitor} size="100%" rounded="rounded-[25%]" plate />
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

function CompetitorCard({ card }: { card: Card }) {
  /* the name, the domain and the art are the competitor's, not this card's */
  const brand = useCompetitor(card.competitor);

  /* a card naming a competitor that has since been deleted has no mark, no
     name and no domain — three quarters of it — so it stands down rather
     than printing an empty tile over a raw slug */
  if (!brand) return null;

  const active = CHANNELS.filter((channel) => card.channels[channel.key] >= ACTIVE_AT).length;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-bg3 px-5 pb-5">
      {/* header — the mark on a 48px white/5 tile whose corners crop it, as in the file */}
      <div className="flex items-center gap-4 py-5">
        <BrandMark id={card.competitor} size={48} rounded="rounded-xl" plate />
        <h4 className="font-display text-xl font-medium text-white">{brand.name}</h4>
        <span className="ml-auto flex items-center gap-2 font-display text-base text-white/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/competition/globe.svg" alt="" aria-hidden className="size-4 shrink-0" />
          {brand.domain}
        </span>
      </div>

      <div className="-mx-5 border-t border-white/5 px-5 pt-5">
        <div className="flex items-center justify-between font-display text-base">
          <span className="text-orange">Channel Ecosystem</span>
          <span className="flex items-center gap-[3px] tabular-nums">
            <span className="text-yellow">{active}</span>
            <span className="text-white/15">/</span>
            <span className="text-white/70">{CHANNELS.length} active</span>
          </span>
        </div>
        <ChannelRing card={card} />
      </div>

      <ReachSlider pct={card.reachPct} label={card.reachLabel} />
    </article>
  );
}

export function Attention({ id }: { id: string }) {
  const { competitors } = useModuleDoc("channel-mix");

  return (
    <Module id={id} variant="panel" title="What's Driving Their Attention" titleClassName={bigTitle}>
      <Subtitle>Website traffic by channel</Subtitle>
      <Kicker className="mt-12">Channel Mix</Kicker>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {competitors.map((card) => (
          <CompetitorCard key={card.id} card={card} />
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
