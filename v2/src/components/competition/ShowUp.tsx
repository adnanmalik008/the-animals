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
import { DarkPanel, GroupHeading, Kicker, bigTitle } from "./ui";

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

function Observations({ text }: { text: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-orange">Observations</p>
      <p className="mt-1 text-xs leading-relaxed text-white/70">{text}</p>
    </div>
  );
}

/* every card in the section is the same frame: label, capture, note */
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
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-xs text-white/60">{name}</p>
      <div className={`overflow-hidden rounded-lg border border-white/10 bg-black ${aspect}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover object-top" />
      </div>
      {caption && <p className="mt-3 font-serif text-xs italic text-white/55">{caption}</p>}
      <Observations text={observation} />
    </article>
  );
}

function HomepageCard({ card }: { card: ShowUpCard }) {
  return (
    <CaptureCard
      name={card.name}
      src={homepage[card.id]}
      alt={`${card.name} homepage`}
      aspect="aspect-[16/10]"
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
      aspect="aspect-[3/2]"
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
      aspect="aspect-[3/4]"
      observation={card.observation}
    />
  );
}

export function ShowUp({ id }: { id: string }) {
  return (
    <Module id={id} variant="panel" title="How They Show Up" titleClassName={bigTitle}>
      <DarkPanel className="mt-5">
        <Kicker>Homepage</Kicker>
        <GroupHeading>Their First Word</GroupHeading>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {homepageCards.map((card) => (
            <HomepageCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-10">
          <Kicker>Social Feed</Kicker>
          <GroupHeading>Twelve Squares of Identity</GroupHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {socialCards.map((card) => (
              <SocialGridCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Kicker>In Market</Kicker>
          <GroupHeading>Their Window Display</GroupHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {marketCards.map((card) => (
              <MarketCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </DarkPanel>
      <AnimalView section={id} className="mt-5" />
    </Module>
  );
}
