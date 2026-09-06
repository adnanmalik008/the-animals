/* Competition tab — manual fixtures for the dark editorial board.
   Demo field is the outdoor category: Patagonia, Arc'teryx, The North Face.
   Shapes mirror the future Supabase tables so the swap is a data-layer change only. */

export type BrandId = "patagonia" | "arcteryx" | "northface";

/* ---------------- Channel Mix (What's Driving Their Attention) ---------------- */

export interface ChannelBubble {
  key: string;
  label: string;
  /** Share of traffic, e.g. 16 or 0.7. Values under 1 render dim orange. */
  pct: number;
}

export interface CompetitorMix {
  id: BrandId;
  name: string;
  domain: string;
  /** "5 : 7" — channels above 1% out of channels tracked. */
  activeLabel: string;
  /** 7 bubbles, ring order from top going clockwise:
      Direct, Referral, Social, Organic search, Paid search, Display ADS, Mail. */
  channels: ChannelBubble[];
  /** Static reach slider position, 0–100. */
  reachPct: number;
  reachLabel: "High" | "Medium" | "Low";
}

const ring = (
  direct: number,
  referral: number,
  social: number,
  organic: number,
  paid: number,
  display: number,
  mail: number
): ChannelBubble[] => [
  { key: "direct", label: "Direct", pct: direct },
  { key: "referral", label: "Referral", pct: referral },
  { key: "social", label: "Social", pct: social },
  { key: "organic", label: "Organic search", pct: organic },
  { key: "paid", label: "Paid search", pct: paid },
  { key: "display", label: "Display ADS", pct: display },
  { key: "mail", label: "Mail", pct: mail },
];

export const channelMix: CompetitorMix[] = [
  {
    id: "patagonia",
    name: "Patagonia",
    domain: "patagonia.com",
    activeLabel: "5 : 7",
    channels: ring(16, 0.7, 26, 25, 0.6, 19, 13),
    reachPct: 84,
    reachLabel: "High",
  },
  {
    id: "arcteryx",
    name: "Arc'teryx",
    domain: "arcteryx.com",
    activeLabel: "5 : 7",
    channels: ring(17, 15, 28, 24, 15, 0.7, 0.6),
    reachPct: 30,
    reachLabel: "Low",
  },
  {
    id: "northface",
    name: "The North Face",
    domain: "thenorthface.com",
    activeLabel: "5 : 7",
    channels: ring(15, 0.4, 16, 28, 25, 15, 0.5),
    reachPct: 56,
    reachLabel: "Medium",
  },
];

/* ---------------- Media Overlap ---------------- */

/** Column order for the overlap table. */
export const overlapBrands: string[] = ["Patagonia", "Arc'teryx", "The North Face"];

/** How the brand reaches people through the channel — the design marks
    earned reach with a gold tick, paid with a red one, owned (Mail) with none,
    and tints a paid channel shared by all in olive rather than gold. */
export type ChannelKind = "earned" | "paid" | "owned";

export interface OverlapRow {
  channel: string;
  /** Presence per brand, same order as overlapBrands. */
  presence: [boolean, boolean, boolean];
  kind: ChannelKind;
}

export const mediaOverlap: OverlapRow[] = [
  { channel: "Direct", presence: [true, true, true], kind: "earned" },
  { channel: "Referral", presence: [false, true, false], kind: "earned" },
  { channel: "Social", presence: [true, true, true], kind: "earned" },
  { channel: "Organic Search", presence: [true, true, true], kind: "earned" },
  { channel: "Paid Search", presence: [true, true, true], kind: "paid" },
  { channel: "Display Ads", presence: [true, true, true], kind: "paid" },
  { channel: "Mail", presence: [true, false, false], kind: "owned" },
];

export const isSharedByAll = (row: OverlapRow) => row.presence.every(Boolean);

export const sharedByAllCount = mediaOverlap.filter(isSharedByAll).length;

/* ---------------- Animal View ---------------- */

export interface AnalystNote {
  title: string;
  date: string;
  headline: string;
  /** Bold opener that runs into the first paragraph. */
  lede?: string;
  /** The Attention note sets its lede in small caps; Horizon keeps sentence case. */
  ledeCaps?: boolean;
  paragraphs: string[];
}

/* Each of the four sections closes on its own Animal View, as the design does. */
export const analystNotes: Record<string, AnalystNote> = {
  attention: {
    title: "Animal View",
    date: "9 June 2026",
    headline: "The Crowded Pond",
    lede: "Patagonia, Arc'teryx, and The North Face",
    ledeCaps: true,
    paragraphs: [
      "are running the same play. Mountain imagery. Extreme conditions. A lone figure against an unforgiving landscape.",
      "The message barely changes — only the logo does. Search and Social are universal. Every brand is bidding on the same intent, chasing the same scroll. The creative is aspirational and the copy is functional.",
      "Performance credentials on the left, purpose signalling on the right. The category has agreed, without meeting, on what outdoor means: altitude, effort, and the implication that buying the jacket is the first step to becoming the person wearing it. This is the default brief. And it's already occupied.",
    ],
  },
  "show-up": {
    title: "Animal View",
    date: "9 June 2026",
    headline: "One World, Three Logos.",
    paragraphs: [
      "From homepage to display ad, the three brands render as variations of the same asset pack — mountains, weather, a solitary silhouette, a promise of capability. The First Word softens into lifestyle, the Twelve Squares look like the same mood board with different filters, and the Window Display is where the mask slips — even Patagonia is leading with a discount.",
      "Above the fold each brand is aspirational; below the fold each is transactional. The distance between purpose and price is where every one of them lives — and none of them owns it.",
      "Six layers, one world. Swap the logos and the story barely moves.",
    ],
  },
  "find-them": {
    title: "Animal View",
    date: "9 June 2026",
    headline: "Buying Back Their Own Audience.",
    paragraphs: [
      "Discovery is quietly shifting under all three. Arc'teryx is the only brand growing in both organic and AI citation — earning trust where the answer is written. Patagonia is the loudest voice in the model but the weakest to convert, and its organic traffic is falling — the paid spend hike is compensation, not strategy. The North Face still leads on scale but is coasting on legacy authority, not new signal.",
      "The paid copy tells the same story: interchangeable headlines, free shipping, guarantee claims, discounts. A category paying Google to send back the traffic its brand used to earn.",
      "The organic well is drying up. Everyone is bidding to stay visible on their own name.",
    ],
  },
  horizon: {
    title: "Animal View",
    date: "9 June 2026",
    headline: "The next 12 months are pre-written",
    lede: "Patagonia",
    paragraphs: [
      "is investing in the chemistry story — PFAS-free, mycelium, repair-as-service. Arc'teryx is buying the community and shared foam IP it never grew. The North Face is quietly hedging out of cold weather entirely — cooling fabrics, modular fills, a Seoul hire that isn't about mountains.",
      "None of this is on their homepages yet. All of it is in the filings, the funds, and the LinkedIn posts. The launch is a formality.",
    ],
  },
};

/* ---------------- How They Show Up ---------------- */

export interface ShowUpCard {
  id: BrandId;
  name: string;
  /** Serif italic caption under the mock. */
  caption: string;
  observation: string;
}

export const homepageCards: ShowUpCard[] = [
  {
    id: "patagonia",
    name: "Patagonia",
    caption: "“Performance Foundations — For the pursuit of your wildest days.”",
    observation:
      "Softens activism, foregrounds performance. A quiet pivot from cause-led to capability-led messaging.",
  },
  {
    id: "arcteryx",
    name: "Arc'teryx",
    caption: "“Fresh Off the Line — Spring Climbing Collection”",
    observation:
      "Product-first, calendar-driven. Frames the site as a drop culture destination — closer to streetwear than gear.",
  },
  {
    id: "northface",
    name: "The North Face",
    caption: "“finding your moment in the sun”",
    observation:
      "Leads with a lifestyle mood, not product. 'Moment in the sun' softens the mountain codes — chasing warmth-seekers, not just climbers.",
  },
];

export interface SocialCard {
  id: BrandId;
  name: string;
  observation: string;
}

/* Social Feed — "Twelve Squares of Identity": the first twelve tiles of
   each brand's grid, captured from the design. */
export const socialCards: SocialCard[] = [
  {
    id: "patagonia",
    name: "Patagonia",
    observation:
      "Documentary aesthetic. Real people, real places. Still the most editorial feed, but noticeably less protest, more product.",
  },
  {
    id: "arcteryx",
    name: "Arc'teryx",
    observation:
      "Cold palette, alpine-only. Disciplined to the point of narrow — no lifestyle, no compromise on the mountain.",
  },
  {
    id: "northface",
    name: "The North Face",
    observation:
      "Warm palette, sun-drenched. Feed reads editorial travel more than technical outdoor — broadening beyond core.",
  },
];

/* In Market — "Their Window Display": the display ad each brand is
   running, the layer where the positioning slips. */
export const marketCards: SocialCard[] = [
  {
    id: "patagonia",
    name: "Patagonia",
    observation:
      "Discount-forward. 'Up to 50% off' undercuts the mission halo — the biggest signal of category pressure in the whole row.",
  },
  {
    id: "arcteryx",
    name: "Arc'teryx",
    observation:
      "Cinematic, minimal copy. Leans on craft and silhouette. Feels the most premium of the three.",
  },
  {
    id: "northface",
    name: "The North Face",
    observation:
      "Athlete-forward, product hero. Familiar formula, low risk, high recognition — the safest play in the row.",
  },
];

/* ---------------- Their AI Profile ---------------- */

export type AiPlatformId = "chatgpt" | "grok" | "claude" | "gemini";

export interface AiPlatformRow {
  id: AiPlatformId;
  name: string;
  mentions: string;
  cited: string;
}

export interface AiProfile {
  id: BrandId;
  name: string;
  /** AI Visibility score out of 100. */
  visibility: number;
  mentions: string;
  cited: string;
  platforms: AiPlatformRow[];
}

export const aiProfiles: AiProfile[] = [
  {
    id: "patagonia",
    name: "Patagonia",
    visibility: 71,
    mentions: "1.3M",
    cited: "3.2M",
    platforms: [
      { id: "chatgpt", name: "ChatGPT", mentions: "326.5K", cited: "1.5M" },
      { id: "grok", name: "Grok", mentions: "353.8K", cited: "507.4K" },
      { id: "claude", name: "Claude", mentions: "333.4K", cited: "1.6M" },
      { id: "gemini", name: "Gemini", mentions: "318K", cited: "717" },
    ],
  },
  {
    id: "arcteryx",
    name: "Arc'teryx",
    visibility: 68,
    mentions: "412K",
    cited: "3.8M",
    platforms: [
      { id: "chatgpt", name: "ChatGPT", mentions: "118.2K", cited: "1.9M" },
      { id: "grok", name: "Grok", mentions: "96.4K", cited: "611.2K" },
      { id: "claude", name: "Claude", mentions: "104.8K", cited: "1.1M" },
      { id: "gemini", name: "Gemini", mentions: "92.6K", cited: "214K" },
    ],
  },
  {
    id: "northface",
    name: "The North Face",
    visibility: 64,
    mentions: "980K",
    cited: "1.9M",
    platforms: [
      { id: "chatgpt", name: "ChatGPT", mentions: "248.1K", cited: "640K" },
      { id: "grok", name: "Grok", mentions: "261.7K", cited: "380.2K" },
      { id: "claude", name: "Claude", mentions: "244.9K", cited: "560K" },
      { id: "gemini", name: "Gemini", mentions: "225.3K", cited: "310K" },
    ],
  },
];

export const aiObservations =
  "Arc'teryx punches above its weight — smaller mention volume but the highest citation rate, meaning models trust it. Patagonia has the loudest voice but the weakest conversion to citation. North Face sits in the middle, coasting on brand recognition rather than earning it in the answer layer.";

/* ---------------- Their Search Landscape ---------------- */

export interface SeoStat {
  label: string;
  value: string;
  /** e.g. "-9.5%" — tone picks the color. */
  delta?: string;
  deltaTone?: "up" | "down";
  /** e.g. "Industry leader" chip next to the value. */
  tag?: string;
}

export interface SearchLandscapeCard {
  id: BrandId;
  name: string;
  stats: SeoStat[];
}

export const searchLandscape: SearchLandscapeCard[] = [
  {
    id: "patagonia",
    name: "Patagonia",
    stats: [
      { label: "Authority Score", value: "76", tag: "Industry leader" },
      { label: "Ref. Domains", value: "61.7K" },
      { label: "Organic Traffic", value: "5.1M", delta: "-9.5%", deltaTone: "down" },
      { label: "Paid Traffic", value: "200.7K", delta: "+34%", deltaTone: "up" },
      { label: "Traffic Share", value: "1.1M", delta: "-5.7%", deltaTone: "down" },
      { label: "Paid Keywords", value: "1.1K", delta: "+23%", deltaTone: "up" },
      { label: "Branded Share", value: "29%" },
      { label: "Backlinks", value: "8.5M" },
    ],
  },
  {
    id: "arcteryx",
    name: "Arc'teryx",
    stats: [
      { label: "Authority Score", value: "73", tag: "Strong" },
      { label: "Ref. Domains", value: "24.3K" },
      { label: "Organic Traffic", value: "2.2M", delta: "-3.1%", deltaTone: "down" },
      { label: "Paid Traffic", value: "88.4K", delta: "+51%", deltaTone: "up" },
      { label: "Traffic Share", value: "640K", delta: "-2.2%", deltaTone: "down" },
      { label: "Paid Keywords", value: "720", delta: "+38%", deltaTone: "up" },
      { label: "Branded Share", value: "34%" },
      { label: "Backlinks", value: "3.1M" },
    ],
  },
  {
    id: "northface",
    name: "The North Face",
    stats: [
      { label: "Authority Score", value: "76", tag: "Industry leader" },
      { label: "Ref. Domains", value: "48.9K" },
      { label: "Organic Traffic", value: "4.4M", delta: "-6.8%", deltaTone: "down" },
      { label: "Paid Traffic", value: "176.2K", delta: "+21%", deltaTone: "up" },
      { label: "Traffic Share", value: "990K", delta: "-4.9%", deltaTone: "down" },
      { label: "Paid Keywords", value: "1.4K", delta: "+12%", deltaTone: "up" },
      { label: "Branded Share", value: "41%" },
      { label: "Backlinks", value: "7.2M" },
    ],
  },
];

/* ---------------- On the Horizon ---------------- */

export type HorizonStatus = "hot" | "warm" | "watch";

/* ---------------- Words They Pay For (Paid Search) ---------------- */

export interface TextAd {
  headline: string;
  url: string;
  body: string;
}

export interface PaidSearchCard {
  id: BrandId;
  name: string;
  ads: TextAd[];
}

export const searchObservations =
  "The North Face owns the organic empire on sheer scale, but Patagonia is bleeding — the only brand with negative organic growth. Arc'teryx is the quiet climber, growing traffic and paid keywords fastest despite the smallest footprint. All three are ramping paid spend, signalling the organic well is drying up.";

export const paidSearch: PaidSearchCard[] = [
  {
    id: "patagonia",
    name: "Patagonia",
    ads: [
      {
        headline: "Patagonia® Official Site. Now Up to 50% Off",
        url: "patagonia.com",
        body: "Patagonia Web Specials Are Now Up to 50% Off — Including Select New Styles. Shop Men's, Women's, Kids' & Baby and Packs & Gear.",
      },
      {
        headline: "Patagonia® Clothing & Gear. Outdoor Clothing & Gear",
        url: "patagonia.com",
        body: "Shop Patagonia® Clothing and Gear Built for Lifetimes of Doing What You Love. Guaranteed Quality. Profits Go to the Planet. Ironclad Guarantee. 1% for the Planet®",
      },
    ],
  },
  {
    id: "arcteryx",
    name: "Arc'teryx",
    ads: [
      {
        headline: "Arc'teryx Official. Technical Apparel & Footwear",
        url: "https://arcteryx.com",
        body: "Arc'teryx Gore-Tex shells, alpine packs, and climbing gear. Engineered for the alpine. Free shipping on orders $99+. Lifetime guarantee on materials.",
      },
      {
        headline: "Arc'teryx® Beta Jacket. Lightweight Gore-Tex Shell",
        url: "https://arcteryx.com",
        body: "The Beta is our most versatile shell — packable, waterproof, and built for everything from the trail to the summit. Shop the latest colors and sizes.",
      },
    ],
  },
  {
    id: "northface",
    name: "The North Face",
    ads: [
      {
        headline: "The North Face® Official Site. Free Shipping Over $50",
        url: "https://www.thenorthface.com",
        body: "Shop The North Face® jackets, gear & footwear built for the outdoors. Free shipping on orders $50+. Members earn rewards on every purchase.",
      },
      {
        headline: "The North Face® Summit Series. Engineered for the Mountain",
        url: "https://www.thenorthface.com",
        body: "Athlete-tested expedition gear from base camp to summit. Shop the Summit Series collection. Built for the most demanding alpine conditions.",
      },
    ],
  },
];

export const paidObservations =
  "The copy is interchangeable. Free shipping, technical language, guarantee claims — nothing here reveals a brand you couldn't guess with the logo removed. Patagonia's discount-led lines are the biggest tell of category pressure; the eco-hero brand is now bidding on sale.";

export const horizonLegend: { status: HorizonStatus; label: string }[] = [
  { status: "hot", label: "Hot — imminent" },
  { status: "warm", label: "Warm — building" },
  { status: "watch", label: "Watch — early" },
];

export type HorizonKind = "Investment" | "R&D" | "Hiring";

export interface HorizonEvent {
  kind: HorizonKind;
  date: string;
  status: HorizonStatus;
  headline: string;
  detail: string;
  source: string;
  implies?: string;
}

export interface HorizonColumn {
  id: BrandId;
  name: string;
  thesis: string;
  events: HorizonEvent[];
}

export const horizon: HorizonColumn[] = [
  {
    id: "patagonia",
    name: "Patagonia",
    thesis: "Doubling down on circularity as a product moat, not just a values line.",
    events: [
      {
        kind: "Investment",
        date: "May 2026",
        status: "warm",
        headline: "$18M into Tin Shed Ventures Fund IV",
        detail: "Portfolio skewing to bio-based dyes and mycelium leather startups.",
        source: "Tin Shed Ventures release",
        implies: "Worn Wear scaling to in-country repair — service as product.",
      },
      {
        kind: "R&D",
        date: "May 2026",
        status: "watch",
        headline: "Filed: solvent-free DWR coating process",
        detail: "USPTO application 2026/0421 — replaces C6 chemistry entirely.",
        source: "USPTO",
        implies: "PFAS-free rain shells become a real spec claim, not marketing.",
      },
      {
        kind: "Hiring",
        date: "May 2026",
        status: "hot",
        headline: "3 senior roles in Repair Network Ops",
        detail: "New hub roles in Reno, Amsterdam, Osaka.",
        source: "LinkedIn",
        implies: "Worn Wear moving from campaign to P&L line.",
      },
    ],
  },
  {
    id: "arcteryx",
    name: "Arc'teryx",
    thesis: "Buying its way into the community layer it never earned organically.",
    events: [
      {
        kind: "Investment",
        date: "May 2026",
        status: "warm",
        headline: "Acquired trail-run app Kōan (undisclosed)",
        detail: "Small Vancouver team, ~40k MAU, GPS + route sharing.",
        source: "The Globe and Mail",
        implies: "First-party athlete data feed — expect a connected shoe within a year.",
      },
      {
        kind: "R&D",
        date: "May 2026",
        status: "watch",
        headline: "Whistler advanced materials lab expansion",
        detail: "Doubling headcount on 3D-knit and seamless construction.",
        source: "Amer Sports Q1 call",
      },
      /* the file's third card here repeats Patagonia's lines, so this event
         stays as written */
      {
        kind: "Hiring",
        date: "Jun 2026",
        status: "hot",
        headline: "12 firmware engineers — Vancouver HQ",
        detail: "Embedded systems, BLE, sensor fusion. None existed a quarter ago.",
        source: "Careers page diff",
        implies: "Hardware is no longer a rumour.",
      },
    ],
  },
  {
    id: "northface",
    name: "The North Face",
    thesis: "Betting on urban-adjacent culture and heat, not the mountain.",
    events: [
      {
        kind: "Investment",
        date: "May 2026",
        status: "warm",
        headline: "Minority stake in Kelvin Thermal Technologies",
        detail: "Graphene-based passive cooling fabric, ~$12M round.",
        source: "Bloomberg",
        implies: "Summer product line pivoting to cooling — climate-hedge assortment.",
      },
      {
        kind: "R&D",
        date: "May 2026",
        status: "watch",
        headline: "Filed: modular puffer with swappable insulation cassette",
        detail: "One shell, seasonal fills — reduces returns and inventory risk.",
        source: "EPO",
        implies: "Aiming to own the 'one jacket, four seasons' story before Uniqlo.",
      },
      {
        kind: "Hiring",
        date: "May 2026",
        status: "hot",
        headline: "VP of Cultural Marketing, based Seoul",
        detail: "Former Nike SB and Adidas Originals background.",
        source: "LinkedIn",
        implies: "APAC streetwear push, less alpine — brand drifts urban.",
      },
    ],
  },
];
