"use client";

import { useModuleDoc } from "@/components/board/BoardDataContext";
import { Module } from "@/components/modules/ModuleColumn";
import type { ModuleDocs } from "@/lib/cms/types";
import { AnimalView } from "./AnimalView";
import { useCompetitor } from "./BrandMark";
import { GroupHeading, Kicker, ObservationsInline, bigTitle } from "./ui";

/* "How They Show Up" — three layers of the same brand, captured from the
   design: the homepage, the first twelve squares of the social grid, and
   the display ad. Real screenshots, not mock-ups; the point of the module
   is that the three brands look interchangeable.

   The captures used to be three maps in this file keyed by a three-value
   brand union, which is why the section could only ever show the demo's
   three outdoor brands. Every capture rides on its own row now, and the
   brand's name is read from the competitive set rather than repeated here.

   The title, the kickers and the group headings are the design's own
   structure and stay in code. */

type ShowUpDoc = ModuleDocs["show-up"];
type HomepageRow = ShowUpDoc["homepage"][number];
type SocialRow = ShowUpDoc["social"][number];
type MarketRow = ShowUpDoc["market"][number];

/** The brand's name, from the competitive set — never stored twice.
    Blank when a row points at a competitor that has since been deleted:
    the capture and the read are still worth showing, so the card keeps its
    frame rather than vanishing. */
function useBrandName(competitorId: string): string {
  return useCompetitor(competitorId)?.name ?? "";
}

/* every card in the section is the design's frame: the brand's name in a
   short header, the capture edge to edge on a white/10 well, the homepage's
   line in italic serif between hairlines, and the Observations read */
function CaptureCard({
  name,
  src,
  layer,
  aspect,
  caption,
  observation,
}: {
  name: string;
  src: string;
  /** what the capture is of, e.g. "homepage" — the alt text is the two */
  layer: string;
  aspect: string;
  caption?: string;
  observation: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-bg3">
      <p className="px-5 py-3 font-display text-base text-white/70">{name}</p>
      <div className={`overflow-hidden bg-white/10 ${aspect}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={[name, layer].filter(Boolean).join(" ")}
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
      </div>
      {caption && (
        <p className="border-y border-white/5 px-5 py-3.5 font-serif text-sm font-light italic leading-[1.4] text-white">
          {/* the design sets the line in quotes, so the card prints them
              and the stored line carries none */}
          “{caption}”
        </p>
      )}
      <ObservationsInline text={observation} />
    </article>
  );
}

function HomepageCard({ card }: { card: HomepageRow }) {
  const name = useBrandName(card.competitor);
  return (
    <CaptureCard
      name={name}
      src={card.screenshot}
      layer="homepage"
      aspect="aspect-[446/300]"
      caption={card.caption}
      observation={card.observation}
    />
  );
}

function SocialGridCard({ card }: { card: SocialRow }) {
  const name = useBrandName(card.competitor);
  return (
    <CaptureCard
      name={name}
      src={card.screenshot}
      layer="social feed"
      aspect="aspect-[446/300]"
      observation={card.observation}
    />
  );
}

function MarketCard({ card }: { card: MarketRow }) {
  const name = useBrandName(card.competitor);
  return (
    <CaptureCard
      name={name}
      src={card.screenshot}
      layer="display ad"
      aspect="aspect-[446/481]"
      observation={card.observation}
    />
  );
}

export function ShowUp({ id }: { id: string }) {
  const { homepage, social, market } = useModuleDoc("show-up");

  return (
    <Module id={id} variant="panel" title="How They Show Up" titleClassName={bigTitle}>
      <Kicker className="mt-12">Homepage</Kicker>
      <GroupHeading>Their First Word</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {homepage.map((card) => (
          <HomepageCard key={card.id} card={card} />
        ))}
      </div>

      <Kicker className="mt-12">Social Feed</Kicker>
      <GroupHeading>Twelve Squares of Identity</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {social.map((card) => (
          <SocialGridCard key={card.id} card={card} />
        ))}
      </div>

      <Kicker className="mt-12">In Market</Kicker>
      <GroupHeading>Their Window Display</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {market.map((card) => (
          <MarketCard key={card.id} card={card} />
        ))}
      </div>

      <AnimalView section={id} className="mt-12" />
    </Module>
  );
}
