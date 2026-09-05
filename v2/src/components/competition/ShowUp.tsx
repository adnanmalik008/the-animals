import { Module } from "@/components/modules/ModuleColumn";
import {
  homepageCards,
  marketCards,
  socialCards,
  type BrandId,
  type ShowUpCard,
  type SocialCard,
} from "@/data/competition";
import { AnimalView } from "./AnimalView";
import { GroupHeading, Kicker, ObservationsInline, bigTitle } from "./ui";

/* "How They Show Up" — three layers of the same brand, captured from the
   design: the homepage, the first twelve squares of the social grid, and
   the display ad. Real screenshots, not mock-ups; the point of the module
   is that the three brands look interchangeable. */

const homepage: Record<BrandId, string> = {
  patagonia: "/assets/competition/home-patagonia.jpg",
  arcteryx: "/assets/competition/home-arcteryx.jpg",
  northface: "/assets/competition/home-northface.jpg",
};

const socialGrid: Record<BrandId, string> = {
  patagonia: "/assets/competition/grid-patagonia.jpg",
  arcteryx: "/assets/competition/grid-arcteryx.jpg",
  northface: "/assets/competition/grid-northface.jpg",
};

const displayAd: Record<BrandId, string> = {
  patagonia: "/assets/competition/ad-patagonia.jpg",
  arcteryx: "/assets/competition/ad-arcteryx.jpg",
  northface: "/assets/competition/ad-northface.jpg",
};

/* every card in the section is the design's frame: the brand's name in a
   short header, the capture edge to edge on a white/10 well, the homepage's
   line in italic serif between hairlines, and the Observations read */
function CaptureCard({
  name,
  src,
  alt,
  aspect,
  caption,
  observation,
}: {
  name: string;
  src: string;
  alt: string;
  aspect: string;
  caption?: string;
  observation: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-bg3">
      <p className="px-5 py-3 font-display text-base text-white/70">{name}</p>
      <div className={`overflow-hidden bg-white/10 ${aspect}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover object-top" />
      </div>
      {caption && (
        <p className="border-y border-white/5 px-5 py-3.5 font-serif text-sm font-light italic leading-[1.4] text-white">
          {caption}
        </p>
      )}
      <ObservationsInline text={observation} />
    </article>
  );
}

function HomepageCard({ card }: { card: ShowUpCard }) {
  return (
    <CaptureCard
      name={card.name}
      src={homepage[card.id]}
      alt={`${card.name} homepage`}
      aspect="aspect-[446/300]"
      caption={card.caption}
      observation={card.observation}
    />
  );
}

function SocialGridCard({ card }: { card: SocialCard }) {
  return (
    <CaptureCard
      name={card.name}
      src={socialGrid[card.id]}
      alt={`${card.name} social feed`}
      aspect="aspect-[446/300]"
      observation={card.observation}
    />
  );
}

function MarketCard({ card }: { card: SocialCard }) {
  return (
    <CaptureCard
      name={card.name}
      src={displayAd[card.id]}
      alt={`${card.name} display ad`}
      aspect="aspect-[446/481]"
      observation={card.observation}
    />
  );
}

export function ShowUp({ id }: { id: string }) {
  return (
    <Module id={id} variant="panel" title="How They Show Up" titleClassName={bigTitle}>
      <Kicker className="mt-12">Homepage</Kicker>
      <GroupHeading>Their First Word</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {homepageCards.map((card) => (
          <HomepageCard key={card.id} card={card} />
        ))}
      </div>

      <Kicker className="mt-12">Social Feed</Kicker>
      <GroupHeading>Twelve Squares of Identity</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {socialCards.map((card) => (
          <SocialGridCard key={card.id} card={card} />
        ))}
      </div>

      <Kicker className="mt-12">In Market</Kicker>
      <GroupHeading>Their Window Display</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {marketCards.map((card) => (
          <MarketCard key={card.id} card={card} />
        ))}
      </div>

      <AnimalView section={id} className="mt-12" />
    </Module>
  );
}
