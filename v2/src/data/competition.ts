/* Competition tab — manual fixtures.
   Demo client is adidas; the field is Nike, On, Hoka, New Balance.
   Shapes mirror the future Supabase tables so the swap is a data-layer change only. */

export type BrandId = "adidas" | "nike" | "on" | "hoka" | "newbalance";

export type ChannelKey = "paid" | "organic" | "social" | "retail";

export interface ChannelSlice {
  key: ChannelKey;
  label: string;
  color: "orange" | "blue" | "green" | "purple";
  pct: number;
}

export interface CompetitorMix {
  id: BrandId;
  name: string;
  /** Total addressable monthly reach, shown in the donut centre. */
  reachLabel: string;
  /** Position of the static reach slider, 0–100. */
  reachPct: number;
  channels: ChannelSlice[];
}

const channel = (
  key: ChannelKey,
  pct: number
): ChannelSlice => {
  const meta: Record<ChannelKey, { label: string; color: ChannelSlice["color"] }> = {
    paid: { label: "Paid", color: "orange" },
    organic: { label: "Organic", color: "blue" },
    social: { label: "Social", color: "green" },
    retail: { label: "Retail", color: "purple" },
  };
  return { key, ...meta[key], pct };
};

export const channelMix: CompetitorMix[] = [
  {
    id: "nike",
    name: "Nike",
    reachLabel: "38M",
    reachPct: 82,
    channels: [channel("paid", 36), channel("organic", 21), channel("social", 27), channel("retail", 16)],
  },
  {
    id: "on",
    name: "On",
    reachLabel: "9M",
    reachPct: 31,
    channels: [channel("paid", 17), channel("organic", 35), channel("social", 30), channel("retail", 18)],
  },
  {
    id: "hoka",
    name: "Hoka",
    reachLabel: "12M",
    reachPct: 42,
    channels: [channel("paid", 22), channel("organic", 39), channel("social", 24), channel("retail", 15)],
  },
  {
    id: "newbalance",
    name: "New Balance",
    reachLabel: "21M",
    reachPct: 58,
    channels: [channel("paid", 26), channel("organic", 23), channel("social", 35), channel("retail", 16)],
  },
];

/* ---------------- Media Overlap ---------------- */

export interface OverlapBrand {
  id: BrandId;
  name: string;
}

/** adidas first, then the field — column order for the overlap table. */
export const overlapBrands: OverlapBrand[] = [
  { id: "adidas", name: "adidas" },
  { id: "nike", name: "Nike" },
  { id: "on", name: "On" },
  { id: "hoka", name: "Hoka" },
  { id: "newbalance", name: "New Balance" },
];

export interface OverlapRow {
  outlet: string;
  /** Presence per brand, same order as overlapBrands. */
  presence: [boolean, boolean, boolean, boolean, boolean];
}

export const mediaOverlap: OverlapRow[] = [
  { outlet: "ESPN", presence: [true, true, true, true, true] },
  { outlet: "Hypebeast", presence: [true, true, false, false, true] },
  { outlet: "Runner's World", presence: [true, true, true, true, true] },
  { outlet: "GQ", presence: [true, false, true, false, true] },
  { outlet: "Complex", presence: [true, true, false, false, true] },
  { outlet: "The Guardian", presence: [true, false, true, true, false] },
  { outlet: "TikTok Trends", presence: [true, true, true, true, true] },
  { outlet: "Highsnobiety", presence: [true, true, true, false, true] },
];

export const isSharedByAll = (row: OverlapRow) => row.presence.every(Boolean);

/* ---------------- Animal View ---------------- */

export const analystNote = {
  label: "The Animals — Analyst Note",
  paragraphs: [
    "Nike still buys the biggest room, but it is renting attention adidas already owns in culture. The sharper pressure comes from below: On and Hoka have converted specialist credibility into a lifestyle position, and they are building it inside the running media adidas still treats as secondary.",
    "New Balance shows the play — hold the performance base steady and let fashion do the shouting. adidas should stop matching Nike's spend line for line and start crowding the run-club and retro corners, where the challengers are still cheap to beat.",
  ],
};

/* ---------------- AI Profile ---------------- */

export interface AiMetric {
  /** Numeric value fed to the count-up. */
  value: number;
  /** Decimal places while counting. */
  decimals: number;
  /** "M" / "K" / "" appended after the number. */
  suffix: string;
}

export interface AiProfileRow {
  id: BrandId;
  name: string;
  /** AI Visibility score out of 100 — also the static bar width. */
  score: number;
  mentions: AiMetric;
  cited: AiMetric;
  isClient?: boolean;
}

export const aiProfiles: AiProfileRow[] = [
  {
    id: "adidas",
    name: "adidas",
    score: 71,
    mentions: { value: 1.3, decimals: 1, suffix: "M" },
    cited: { value: 3.2, decimals: 1, suffix: "M" },
    isClient: true,
  },
  {
    id: "nike",
    name: "Nike",
    score: 84,
    mentions: { value: 2.1, decimals: 1, suffix: "M" },
    cited: { value: 4.8, decimals: 1, suffix: "M" },
  },
  {
    id: "on",
    name: "On",
    score: 62,
    mentions: { value: 486, decimals: 0, suffix: "K" },
    cited: { value: 1.1, decimals: 1, suffix: "M" },
  },
  {
    id: "hoka",
    name: "Hoka",
    score: 58,
    mentions: { value: 512, decimals: 0, suffix: "K" },
    cited: { value: 890, decimals: 0, suffix: "K" },
  },
  {
    id: "newbalance",
    name: "New Balance",
    score: 66,
    mentions: { value: 941, decimals: 0, suffix: "K" },
    cited: { value: 1.9, decimals: 1, suffix: "M" },
  },
];

/* ---------------- Search Landscape ---------------- */

export interface SearchVolumeRow {
  id: BrandId;
  name: string;
  volumeLabel: string;
  /** Hardcoded bar width, 0–100. */
  widthPct: number;
  isClient?: boolean;
}

export const searchLandscape: SearchVolumeRow[] = [
  { id: "nike", name: "Nike", volumeLabel: "9.1M", widthPct: 100 },
  { id: "adidas", name: "adidas", volumeLabel: "6.7M", widthPct: 74, isClient: true },
  { id: "newbalance", name: "New Balance", volumeLabel: "2.4M", widthPct: 26 },
  { id: "hoka", name: "Hoka", volumeLabel: "1.8M", widthPct: 20 },
  { id: "on", name: "On", volumeLabel: "1.5M", widthPct: 16 },
];

export const searchKeywords: string[] = [
  "running shoes",
  "marathon trainers",
  "super shoes",
  "carbon plate",
  "daily trainer",
  "gym to street",
  "retro runners",
  "trail shoes",
];
