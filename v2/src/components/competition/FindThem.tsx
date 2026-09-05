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
import { DarkPanel, GroupHeading, Kicker, bigTitle } from "./ui";

/* "How People Find Them" — the AI Search Visibility layout re-rendered
   dark per competitor, then per-brand SEO stat cards. Fully static. */

/* the design lists each model behind its own mark, not a colour dot */
const platformLogo: Record<AiPlatformId, string> = {
  chatgpt: "/assets/ai/chatgpt.png",
  grok: "/assets/ai/grok.png",
  claude: "/assets/ai/claude.png",
  gemini: "/assets/ai/gemini.png",
};

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
    <div className="flex-1 rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5">
      <span className={`block text-2xl font-bold tabular-nums ${colorClass}`}>{value}</span>
      <span className="mt-0.5 block text-[11px] text-white/50">{label}</span>
    </div>
  );
}

function AiProfileCard({ profile }: { profile: AiProfile }) {
  return (
    <article>
      <p className="mb-3 text-xs text-white/60">{profile.name}</p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">Ai Search Visibility</p>
            <p className="mt-0.5 text-xs text-white/50">AI Platform Performance</p>
          </div>
          <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60">
            Today
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <StatBox value={String(profile.visibility)} label="AI Visibility" colorClass="text-orange" />
          <StatBox value={profile.mentions} label="Mentions" colorClass="text-purple" />
          <StatBox value={profile.cited} label="Cited Pages" colorClass="text-yellow" />
        </div>

        <ul className="mt-3 divide-y divide-white/[0.08]">
          {profile.platforms.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={platformLogo[p.id]} alt="" aria-hidden className="h-4 w-4 shrink-0 object-contain" />
                {p.name}
              </span>
              <span className="flex items-center gap-2 text-xs tabular-nums">
                <span className="flex items-center gap-1 text-white/85">
                  <span className="h-1 w-1 rounded-full bg-orange" aria-hidden />
                  {p.mentions}
                </span>
                <span className="text-white/30">/</span>
                <span className="flex items-center gap-1 text-white/50">
                  <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden />
                  {p.cited}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function SeoStatCell({ stat }: { stat: SeoStat }) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tabular-nums text-white">{stat.value}</span>
        {stat.tag && (
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-white/60">
            {stat.tag}
          </span>
        )}
        {stat.delta && (
          <span
            className={`text-[11px] font-semibold tabular-nums ${
              stat.deltaTone === "down" ? "text-red" : "text-green"
            }`}
          >
            {stat.delta}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[11px] text-white/45">{stat.label}</p>
    </div>
  );
}

function ObservationPanel({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-medium text-orange">Observations</p>
      <p className="mt-1.5 text-xs leading-relaxed text-white/70">{text}</p>
    </div>
  );
}

/* a paid result as the SERP renders it: mark, headline, url, body */
function TextAdRow({ id, ad }: { id: PaidSearchCard["id"]; ad: TextAd }) {
  return (
    <li className="flex gap-2.5 py-3 first:pt-0">
      <BrandMark id={id} size={22} className="mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug text-white">{ad.headline}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-white/50">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
          </svg>
          {ad.url}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-white/70">{ad.body}</p>
      </div>
    </li>
  );
}

function PaidSearchCardView({ card }: { card: PaidSearchCard }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-1 text-xs text-white/60">
        <span className="font-semibold text-white/85">Sample Text Ads</span> {card.name}
      </p>
      <ul className="divide-y divide-white/[0.08]">
        {card.ads.map((ad) => (
          <TextAdRow key={ad.headline} id={card.id} ad={ad} />
        ))}
      </ul>
    </article>
  );
}

function SeoCard({ card }: { card: SearchLandscapeCard }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
          SEO
        </span>
        <span className="text-xs text-white/60">{card.name}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
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
      <DarkPanel className="mt-5">
        <Kicker>Machine Vision</Kicker>
        <GroupHeading>Their AI Profile</GroupHeading>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {aiProfiles.map((profile) => (
            <AiProfileCard key={profile.id} profile={profile} />
          ))}
        </div>

        <ObservationPanel text={aiObservations} />

        <div className="mt-10">
          <Kicker>Search Footprint</Kicker>
          <GroupHeading>Their Search Landscape</GroupHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {searchLandscape.map((card) => (
              <SeoCard key={card.id} card={card} />
            ))}
          </div>
          <ObservationPanel text={searchObservations} />
        </div>

        <div className="mt-10">
          <Kicker>Paid Search</Kicker>
          <GroupHeading>Words They Pay For</GroupHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {paidSearch.map((card) => (
              <PaidSearchCardView key={card.id} card={card} />
            ))}
          </div>
          <ObservationPanel text={paidObservations} />
        </div>
      </DarkPanel>
      <AnimalView section={id} className="mt-4" />
    </Module>
  );
}
