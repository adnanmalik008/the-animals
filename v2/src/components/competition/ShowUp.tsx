import { Module } from "@/components/modules/ModuleColumn";
import {
  homepageCards,
  socialCards,
  type BrandId,
  type ShowUpCard,
  type SocialCard,
} from "@/data/competition";
import { BrandMark } from "./BrandMark";
import { DarkPanel, GroupHeading, Kicker, bigTitle } from "./ui";

/* "How They Show Up" — stylized homepage screenshots and social tiles,
   built as pure CSS mocks (no external images). Static. */

/* ---------- homepage hero scenes ---------- */

function MountainSilhouette({ fill }: { fill: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 60"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 h-14 w-full"
    >
      <path d="M0 60 L40 22 L70 42 L110 8 L150 38 L190 18 L230 44 L265 26 L300 50 L300 60 Z" fill={fill} />
    </svg>
  );
}

function FakeNav({ tone }: { tone: "light" | "dark" }) {
  const text = tone === "light" ? "bg-white/60" : "bg-black/40";
  return (
    <div className="flex items-center justify-between px-3 pt-2.5">
      <span className={`h-1.5 w-8 rounded-full ${text}`} />
      <span className="flex gap-1.5">
        <span className={`h-1 w-4 rounded-full ${text}`} />
        <span className={`h-1 w-4 rounded-full ${text}`} />
        <span className={`h-1 w-4 rounded-full ${text}`} />
        <span className={`h-1 w-4 rounded-full ${text}`} />
      </span>
    </div>
  );
}

function HomepageScene({ id }: { id: BrandId }) {
  if (id === "patagonia") {
    return (
      <div className="relative h-40 bg-gradient-to-b from-[#22423a] via-[#183028] to-[#0b1a14]">
        <FakeNav tone="light" />
        <MountainSilhouette fill="rgba(0,0,0,0.35)" />
        <div className="absolute left-3 top-9">
          <p className="text-[13px] font-bold leading-tight text-white">
            Performance
            <br />
            Foundations
          </p>
          <div className="mt-2 flex gap-1">
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[6px] font-semibold text-[#183028]">
              Explore
            </span>
            <span className="rounded-full border border-white/60 px-2 py-0.5 text-[6px] text-white/90">
              Men
            </span>
            <span className="rounded-full border border-white/60 px-2 py-0.5 text-[6px] text-white/90">
              Women
            </span>
          </div>
        </div>
        {/* thumbnail strip */}
        <div className="absolute bottom-1.5 left-3 right-3 flex gap-1">
          <span className="h-6 flex-1 rounded-sm bg-gradient-to-br from-[#4a6d5a] to-[#22362c]" />
          <span className="h-6 flex-1 rounded-sm bg-gradient-to-br from-[#7d8f6a] to-[#3c4a34]" />
          <span className="h-6 flex-1 rounded-sm bg-gradient-to-br from-[#5a7d8f] to-[#2c3f4a]" />
        </div>
      </div>
    );
  }

  if (id === "arcteryx") {
    return (
      <div className="relative h-40 bg-gradient-to-b from-[#75786f] via-[#565a52] to-[#33362f]">
        <FakeNav tone="light" />
        {/* rock face texture */}
        <svg
          aria-hidden
          viewBox="0 0 300 120"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-28 w-full opacity-50"
        >
          <path d="M0 120 L0 40 L60 70 L120 20 L180 80 L240 35 L300 60 L300 120 Z" fill="#2b2e28" />
          <path d="M40 120 L90 60 L150 100 L210 55 L300 90 L300 120 Z" fill="#20231e" />
        </svg>
        {/* lone climber dot */}
        <span className="absolute left-[58%] top-[46%] h-1.5 w-1 rounded-full bg-[#d8452b]" aria-hidden />
        <div className="absolute inset-x-0 top-10 text-center">
          <p className="text-[8px] uppercase tracking-[0.3em] text-white/80">Fresh Off the Line</p>
          <p className="mt-1 text-[7px] tracking-wide text-white/50">Spring Climbing Collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-40 bg-[#e9e1cf]">
      <FakeNav tone="dark" />
      {/* product tile grid */}
      <div className="absolute left-3 right-3 top-8 grid grid-cols-6 gap-1">
        {["#c9b98f", "#8a7a5a", "#5c5a3e", "#b0a684", "#7d6b4a", "#a39070"].map((c, i) => (
          <span key={i} className="h-10 rounded-sm" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-6 text-center">
        <p className="font-serif text-[11px] italic text-[#4a3f2b]">
          finding your moment in the sun
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
        <span className="rounded-full bg-[#1c1c1c] px-2 py-0.5 text-[6px] font-semibold text-white">
          Shop
        </span>
        <span className="rounded-full border border-[#1c1c1c]/50 px-2 py-0.5 text-[6px] text-[#1c1c1c]">
          Explore
        </span>
      </div>
    </div>
  );
}

function BrowserFrame({ id }: { id: BrandId }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <div className="flex h-5 items-center gap-1 bg-[#262626] px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" aria-hidden />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" aria-hidden />
        <span className="ml-2 h-2 flex-1 rounded-full bg-white/10" aria-hidden />
      </div>
      <HomepageScene id={id} />
    </div>
  );
}

/* ---------- social post scenes ---------- */

function SocialScene({ id }: { id: BrandId }) {
  if (id === "patagonia") {
    return (
      <div className="relative h-32 bg-gradient-to-br from-[#4a3f2b] via-[#6b5a3a] to-[#2c2418]">
        {/* workbench + hands vibe: patch rectangles */}
        <span className="absolute left-[18%] top-[30%] h-8 w-12 rotate-[-6deg] rounded-sm bg-[#a33b2b]" aria-hidden />
        <span className="absolute left-[42%] top-[42%] h-7 w-10 rotate-[8deg] rounded-sm bg-[#31556b]" aria-hidden />
        <span className="absolute left-[62%] top-[26%] h-6 w-9 rotate-[-12deg] rounded-sm bg-[#5c6b31]" aria-hidden />
        <span className="absolute bottom-2 left-3 rounded-sm bg-black/50 px-1.5 py-0.5 text-[7px] uppercase tracking-widest text-white/90">
          Worn Wear
        </span>
      </div>
    );
  }
  if (id === "arcteryx") {
    return (
      <div className="relative h-32 bg-gradient-to-b from-[#8fa3b0] via-[#5c707d] to-[#2e3a42]">
        <MountainSilhouette fill="rgba(20,26,30,0.55)" />
        <span className="absolute left-[48%] top-[38%] h-2 w-1.5 rounded-full bg-[#d8452b]" aria-hidden />
        <span className="absolute bottom-2 left-3 rounded-sm bg-black/50 px-1.5 py-0.5 text-[7px] uppercase tracking-widest text-white/90">
          Athlete repost
        </span>
      </div>
    );
  }
  return (
    <div className="relative h-32 bg-gradient-to-b from-[#e0863a] via-[#b05a3a] to-[#3a2c2c]">
      {/* city skyline */}
      <svg
        aria-hidden
        viewBox="0 0 300 80"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-16 w-full"
      >
        <path
          d="M0 80 L0 46 L28 46 L28 30 L52 30 L52 52 L80 52 L80 22 L104 22 L104 44 L136 44 L136 34 L160 34 L160 54 L192 54 L192 18 L214 18 L214 48 L248 48 L248 38 L272 38 L272 56 L300 56 L300 80 Z"
          fill="rgba(20,16,16,0.7)"
        />
      </svg>
      <span className="absolute bottom-2 left-3 rounded-sm bg-black/50 px-1.5 py-0.5 text-[7px] uppercase tracking-widest text-white/90">
        City summit
      </span>
    </div>
  );
}

function SocialFrame({ card }: { card: SocialCard }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0c0c0c]">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <BrandMark id={card.id} size={18} className="rounded-full" />
        <span className="text-[10px] font-semibold text-white">{card.handle}</span>
        <span className="ml-auto text-[10px] tracking-widest text-white/40">•••</span>
      </div>
      <SocialScene id={card.id} />
      <div className="px-2.5 py-2">
        <div className="flex items-center gap-2.5 text-white/60">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 21C7 16.5 3 13.2 3 8.9 3 6.2 5.2 4 7.9 4c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2C18.8 4 21 6.2 21 8.9c0 4.3-4 7.6-9 12.1z" />
          </svg>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4c-1.6 0-3-.4-4.3-1L3 20l1.2-4.9A8.3 8.3 0 0 1 3.5 11 8.4 8.4 0 0 1 12 2.7a8.4 8.4 0 0 1 9 8.8z" />
          </svg>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          <span className="ml-auto text-[9px] tabular-nums text-white/50">{card.likes} likes</span>
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-white/75">
          <span className="font-semibold text-white">{card.handle}</span> {card.post}
        </p>
      </div>
    </div>
  );
}

/* ---------- cards ---------- */

function Observations({ text }: { text: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-orange">Observations</p>
      <p className="mt-1 text-xs leading-relaxed text-white/70">{text}</p>
    </div>
  );
}

function HomepageCard({ card }: { card: ShowUpCard }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-xs text-white/60">{card.name}</p>
      <BrowserFrame id={card.id} />
      <p className="mt-3 font-serif text-xs italic text-white/55">{card.caption}</p>
      <Observations text={card.observation} />
    </article>
  );
}

function SocialCardView({ card }: { card: SocialCard }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-xs text-white/60">{card.name}</p>
      <SocialFrame card={card} />
      <p className="mt-3 font-serif text-xs italic text-white/55">{card.caption}</p>
      <Observations text={card.observation} />
    </article>
  );
}

export function ShowUp({ id }: { id: string }) {
  return (
    <Module id={id} title="How They Show Up" titleClassName={bigTitle}>
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
          <GroupHeading>Their Daily Scroll</GroupHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {socialCards.map((card) => (
              <SocialCardView key={card.id} card={card} />
            ))}
          </div>
        </div>
      </DarkPanel>
    </Module>
  );
}
