import { Module } from "@/components/modules/ModuleColumn";
import {
  aiObservations,
  aiProfiles,
  paidObservations,
  paidSearch,
  searchLandscape,
  searchObservations,
  type AiPlatformId,
  type AiProfile,
  type PaidSearchCard,
  type SearchLandscapeCard,
  type SeoStat,
  type TextAd,
} from "@/data/competition";
import { BrandMark } from "./BrandMark";
import { AnimalView } from "./AnimalView";
import { GroupHeading, Kicker, Observations, bigTitle } from "./ui";

/* "How People Find Them" — the AI Search Visibility layout re-rendered
   dark per competitor, then per-brand SEO stat cards. Fully static. */

/* the design lists each model behind its own mark: the file's raster tiles,
   exported for the dark board — ChatGPT is its green app tile, Grok its white
   plate — with the corner radius the file gives each */
const platformMark: Record<AiPlatformId, { src: string; rounded: string }> = {
  chatgpt: { src: "/assets/competition/ai-chatgpt.png", rounded: "rounded-[5px]" },
  grok: { src: "/assets/competition/ai-grok.png", rounded: "rounded-[3px]" },
  claude: { src: "/assets/competition/ai-claude.png", rounded: "" },
  gemini: { src: "/assets/competition/ai-gemini.png", rounded: "" },
};

/* one tile of the black stats box: the figure in its colour over a muted label */
function StatBox({
  value,
  label,
  colorClass,
}: {
  value: string;
  label: string;
  colorClass: string;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-xl bg-bg3 px-4 py-2">
      <span className={`block font-display text-[40px] font-medium leading-tight tabular-nums ${colorClass}`}>
        {value}
      </span>
      <span className="mt-3 block font-display text-base leading-[1.1] text-white/50">{label}</span>
    </div>
  );
}

/* the design's "Today" filter pill — its own filter and chevron glyphs */
function TodayPill() {
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/5 py-1.5 pl-3 pr-2 font-display text-base tracking-[-0.01em] text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/competition/filter-sort.svg" alt="" aria-hidden className="size-4" />
      Today
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/competition/chevron-down-small.svg" alt="" aria-hidden className="size-5" />
    </span>
  );
}

function AiProfileCard({ profile }: { profile: AiProfile }) {
  return (
    <article>
      {/* the design's three cards are unlabelled placeholders; ours carry real
          figures per brand, so the brand is named above in the card's own grey */}
      <p className="mb-3 font-display text-base text-white/70">{profile.name}</p>
      <div className="flex flex-col gap-8 rounded-2xl border border-white/5 bg-bg3 p-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="font-display text-xl font-semibold leading-[1.1] text-white">Ai Search Visibility</p>
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-base leading-[1.1] text-white/70">AI Platform Performance</p>
              <TodayPill />
            </div>
          </div>

          <div className="flex gap-1 rounded-2xl border border-white/15 bg-black p-1">
            <StatBox value={String(profile.visibility)} label="AI Visibility" colorClass="text-orange" />
            <StatBox value={profile.mentions} label="Mentions" colorClass="text-purple" />
            <StatBox value={profile.cited} label="Cited Pages" colorClass="text-olive" />
          </div>
        </div>

        <ul className="flex flex-col gap-4">
          {profile.platforms.map((p, i) => {
            const mark = platformMark[p.id];
            return (
              <li
                key={p.id}
                className={`flex items-center justify-between gap-3 pb-4 ${
                  i < profile.platforms.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <span className="flex items-center gap-3 font-display text-xl font-medium leading-[1.1] text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mark.src} alt="" aria-hidden className={`size-6 shrink-0 object-cover ${mark.rounded}`} />
                  {p.name}
                </span>
                <span className="flex items-center gap-3 font-display text-lg leading-[1.1] tabular-nums text-white">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-orange" aria-hidden />
                    {p.mentions}
                  </span>
                  <span className="text-base text-silver">/</span>
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple" aria-hidden />
                    {p.cited}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

function SeoStatCell({ stat }: { stat: SeoStat }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-display text-2xl font-medium leading-[1.1] tabular-nums text-white">{stat.value}</span>
        {stat.tag && (
          <span className="rounded bg-white/5 px-2 py-px font-display text-xs leading-5 text-white/70">
            {stat.tag}
          </span>
        )}
        {stat.delta && (
          <span
            className={`font-display text-sm lowercase tabular-nums ${
              stat.deltaTone === "down" ? "text-orange" : "text-green"
            }`}
          >
            {stat.delta}
          </span>
        )}
      </div>
      <p className="font-display text-sm text-white/70">{stat.label}</p>
    </div>
  );
}

/* a paid result as the SERP renders it: mark on a plate, headline, url, body */
function TextAdRow({ id, ad, last }: { id: PaidSearchCard["id"]; ad: TextAd; last: boolean }) {
  return (
    <li className={`flex flex-col gap-4 p-5 ${last ? "" : "border-b border-white/5"}`}>
      <div className="flex items-start gap-3">
        <BrandMark id={id} size={32} rounded="rounded-[4px]" plate />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-display text-lg font-medium leading-[1.3] text-white">{ad.headline}</p>
          <p className="flex items-center gap-2 font-display text-base text-white/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/competition/globe.svg" alt="" aria-hidden className="size-4 shrink-0" />
            {ad.url}
          </p>
        </div>
      </div>
      <p className="font-display text-base leading-[1.4] text-white/70">{ad.body}</p>
    </li>
  );
}

function PaidSearchCardView({ card }: { card: PaidSearchCard }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-bg3">
      <p className="flex items-center gap-2 border-b border-white/5 p-5 font-display text-base">
        <span className="font-medium text-white">Sample Text Ads</span>
        <span className="text-white/70">{card.name}</span>
      </p>
      <ul>
        {card.ads.map((ad, i) => (
          <TextAdRow key={ad.headline} id={card.id} ad={ad} last={i === card.ads.length - 1} />
        ))}
      </ul>
    </article>
  );
}

function SeoCard({ card }: { card: SearchLandscapeCard }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-bg3">
      <div className="flex items-center justify-between border-b border-white/5 p-5">
        <span className="rounded-lg bg-white/5 px-2.5 py-1.5 font-display text-base leading-5 text-white/70">SEO</span>
        <span className="font-display text-base text-white/70">{card.name}</span>
      </div>
      {/* two columns, read down: the first half of the stats, then the second */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 p-5">
        {card.stats.map((stat) => (
          <SeoStatCell key={stat.label} stat={stat} />
        ))}
      </div>
    </article>
  );
}

export function FindThem({ id }: { id: string }) {
  return (
    <Module id={id} variant="panel" title="How People Find Them" titleClassName={bigTitle}>
      <Kicker className="mt-12">Machine Vision</Kicker>
      <GroupHeading>Their AI Profile</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {aiProfiles.map((profile) => (
          <AiProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
      <Observations text={aiObservations} className="mt-6" />

      <Kicker className="mt-12">Search Footprint</Kicker>
      <GroupHeading>Their Search Landscape</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {searchLandscape.map((card) => (
          <SeoCard key={card.id} card={card} />
        ))}
      </div>
      <Observations text={searchObservations} className="mt-6" />

      <Kicker className="mt-12">Paid Search</Kicker>
      <GroupHeading>Words They Pay For</GroupHeading>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {paidSearch.map((card) => (
          <PaidSearchCardView key={card.id} card={card} />
        ))}
      </div>
      <Observations text={paidObservations} className="mt-6" />

      <AnimalView section={id} className="mt-12" />
    </Module>
  );
}
