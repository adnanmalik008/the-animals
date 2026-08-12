/* Live-tab content — manual fixtures for now.
   Shapes mirror the future Supabase tables so the swap is a data-layer change only. */

/* ---------------- Social Pulse ---------------- */

export type SocialPlatform = "tiktok" | "reddit" | "instagram" | "x";

export const socialPlatformLabel: Record<SocialPlatform, string> = {
  tiktok: "TikTok",
  reddit: "Reddit",
  instagram: "Instagram",
  x: "X",
};

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  author: string;
  text: string;
  likes: string;
  comments: string;
  timeAgo: string;
}

export const socialPosts: SocialPost[] = [
  {
    id: "sp-1",
    platform: "tiktok",
    author: "@stridecollective",
    text: "POV: your Saturday run club has a waitlist longer than the marathon itself. 5:45am and 200 people showed up.",
    likes: "48.2K",
    comments: "1.2K",
    timeAgo: "3h ago",
  },
  {
    id: "sp-2",
    platform: "reddit",
    author: "u/tempo_junkie",
    text: "Hot take: the Adizero Evo SL is the best daily trainer under $150 and it isn't close. Full 300-mile review inside.",
    likes: "2.4K",
    comments: "312",
    timeAgo: "5h ago",
  },
  {
    id: "sp-3",
    platform: "instagram",
    author: "@sambasunday",
    text: "Sambas at the finish line, espresso in hand. Race day is a lifestyle now.",
    likes: "12.6K",
    comments: "214",
    timeAgo: "7h ago",
  },
  {
    id: "sp-4",
    platform: "x",
    author: "@lacedup_ldn",
    text: "adidas quietly seeding the new Evo to sub-3 marathoners only. Scarcity marketing meets PB culture.",
    likes: "3.1K",
    comments: "428",
    timeAgo: "2h ago",
  },
  {
    id: "sp-5",
    platform: "tiktok",
    author: "@girlsthatrun",
    text: "Rating every run club in East London by their post-run pastry situation. Part 4: the croissant capital.",
    likes: "96K",
    comments: "2.3K",
    timeAgo: "1d ago",
  },
  {
    id: "sp-6",
    platform: "instagram",
    author: "@trackhouse.archive",
    text: "1972 Munich spikes, restored stitch by stitch. Some shoes are museums.",
    likes: "8.4K",
    comments: "96",
    timeAgo: "12h ago",
  },
  {
    id: "sp-7",
    platform: "reddit",
    author: "u/marathon_matt",
    text: "Pulled data from 400 Strava clubs: average group-run pace slowed 40s/mile since 2023. Social running is winning.",
    likes: "1.8K",
    comments: "267",
    timeAgo: "9h ago",
  },
  {
    id: "sp-8",
    platform: "x",
    author: "@sneakerlawyer",
    text: "Terrace culture did more for adidas' 2025 balance sheet than every performance launch combined. Discuss.",
    likes: "5.7K",
    comments: "891",
    timeAgo: "6h ago",
  },
  {
    id: "sp-9",
    platform: "tiktok",
    author: "@coachkofi",
    text: "Your shoes don't need more drop. You need more sleep. Anyway, here's my full rotation for 2026.",
    likes: "33K",
    comments: "780",
    timeAgo: "1d ago",
  },
];

/* ---------------- The Conversation ---------------- */

export type VoiceTab = "drivers" | "problems" | "solutions";

export interface VoiceQuote {
  id: string;
  text: string;
}

export const voiceQuotes: Record<VoiceTab, VoiceQuote[]> = {
  drivers: [
    { id: "vd-1", text: "I joined the run club for fitness. I stayed because it's the only place I make friends as an adult." },
    { id: "vd-2", text: "The Samba is the one shoe I can wear to the office, the pub, and the airport." },
    { id: "vd-3", text: "When a brand shows up at my local parkrun with pacers instead of billboards, I remember it." },
    { id: "vd-4", text: "I bought the Evo because a guy at my club ran a 2:58 in it, not because of an ad." },
    { id: "vd-5", text: "Retro styles feel honest. Like the brand remembers where it came from." },
    { id: "vd-6", text: "My whole feed is race recaps now. If you're not on a start line, you're invisible." },
  ],
  problems: [
    { id: "vp-1", text: "Every drop sells out in minutes and lands on resale for triple. It feels rigged." },
    { id: "vp-2", text: "The app says my size is in stock. The store says it never was." },
    { id: "vp-3", text: "I can't tell the difference between their fifteen shoe lines. Just tell me which one is for me." },
    { id: "vp-4", text: "Membership points expire faster than I can earn them. Why bother?" },
    { id: "vp-5", text: "They sponsor the big-city marathons but my hometown 10K gets nothing." },
    { id: "vp-6", text: "Quality has slipped. Third pair this year with the sole peeling loose." },
  ],
  solutions: [
    { id: "vs-1", text: "Let club captains reserve sizes for members before public drops." },
    { id: "vs-2", text: "A trade-in program for worn trainers would get me into the store every season." },
    { id: "vs-3", text: "Make one honest shoe-finder quiz instead of forty product pages." },
    { id: "vs-4", text: "Put repair stations in flagship stores. Fix my shoes, earn my loyalty." },
    { id: "vs-5", text: "Sponsor pacer groups at local races, not just the elites." },
    { id: "vs-6", text: "Let me pool loyalty points with my run club for group rewards." },
  ],
};

/* ---------------- On Stage ---------------- */

export interface StageVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
}

export const stageVideos: StageVideo[] = [
  {
    id: "os-1",
    videoId: "I2rdFe9S71Y",
    title: "Adizero Evo SL — 300 Mile Verdict",
    description: "The daily trainer that keeps stealing race-shoe headlines, tested to failure.",
  },
  {
    id: "os-2",
    videoId: "FsMK-cHOylg",
    title: "Samba vs Gazelle vs Spezial",
    description: "Terrace wars: which heritage silhouette actually earns the hype in 2026.",
  },
  {
    id: "os-3",
    videoId: "Fb9PYpxaYQ0",
    title: "Best Running Shoes of 2026 (So Far)",
    description: "Six months of testing distilled into one honest mid-year shortlist.",
  },
];

/* ---------------- Search Velocity ---------------- */

export interface SearchTerm {
  id: string;
  term: string;
  delta: number; // signed %
  points: number[]; // 0-100 normalized trend
}

export const searchTerms: SearchTerm[] = [
  {
    id: "sv-1",
    term: "adizero evo sl",
    delta: 42,
    points: [12, 18, 15, 24, 30, 27, 38, 45, 42, 58, 71, 86],
  },
  {
    id: "sv-2",
    term: "samba outfit",
    delta: 18,
    points: [30, 34, 28, 40, 37, 46, 44, 52, 49, 58, 63, 68],
  },
  {
    id: "sv-3",
    term: "ultraboost sale",
    delta: -7,
    points: [72, 66, 70, 61, 64, 55, 58, 49, 52, 44, 41, 38],
  },
];

/* ---------------- Top Sites ---------------- */

export type SiteTab = "news" | "social" | "searchai";

export interface SiteRow {
  id: string;
  name: string;
  visits: string;
  pct: number; // bar width relative to tab leader
  change: number; // signed %
}

export const topSites: Record<SiteTab, SiteRow[]> = {
  news: [
    { id: "ts-n1", name: "runnersworld.com", visits: "1.2M visits", pct: 100, change: 8 },
    { id: "ts-n2", name: "hypebeast.com", visits: "890K visits", pct: 74, change: 12 },
    { id: "ts-n3", name: "sneakernews.com", visits: "764K visits", pct: 64, change: -3 },
    { id: "ts-n4", name: "believeintherun.com", visits: "512K visits", pct: 43, change: 21 },
    { id: "ts-n5", name: "complex.com", visits: "448K visits", pct: 37, change: -6 },
  ],
  social: [
    { id: "ts-s1", name: "reddit.com/r/running", visits: "2.4M visits", pct: 100, change: 14 },
    { id: "ts-s2", name: "tiktok.com", visits: "1.9M visits", pct: 79, change: 22 },
    { id: "ts-s3", name: "instagram.com", visits: "1.4M visits", pct: 58, change: 5 },
    { id: "ts-s4", name: "strava.com", visits: "1.1M visits", pct: 46, change: 17 },
    { id: "ts-s5", name: "discord.gg/runclubs", visits: "320K visits", pct: 13, change: -2 },
  ],
  searchai: [
    { id: "ts-a1", name: "google.com", visits: "8.2M visits", pct: 100, change: -4 },
    { id: "ts-a2", name: "chatgpt.com", visits: "3.1M visits", pct: 38, change: 31 },
    { id: "ts-a3", name: "bing.com", visits: "1.4M visits", pct: 17, change: 2 },
    { id: "ts-a4", name: "perplexity.ai", visits: "1.2M visits", pct: 15, change: 46 },
    { id: "ts-a5", name: "gemini.google.com", visits: "940K visits", pct: 11, change: 24 },
  ],
};

/* ---------------- Opinion Leaders ---------------- */

export interface OpinionLeader {
  id: string;
  name: string;
  initials: string;
  color: "orange" | "blue" | "green" | "purple" | "yellow";
  platform: string;
  reach: string;
  trend: number; // signed %
}

export const opinionLeaders: OpinionLeader[] = [
  { id: "ol-1", name: "Kofi Mensah", initials: "KM", color: "orange", platform: "YouTube", reach: "2.1M", trend: 12 },
  { id: "ol-2", name: "Elsa Brandt", initials: "EB", color: "blue", platform: "TikTok", reach: "1.4M", trend: 8 },
  { id: "ol-3", name: "Jay Okafor", initials: "JO", color: "green", platform: "Instagram", reach: "980K", trend: -3 },
  { id: "ol-4", name: "Mara Silva", initials: "MS", color: "purple", platform: "Strava", reach: "640K", trend: 21 },
  { id: "ol-5", name: "Tom Whitfield", initials: "TW", color: "yellow", platform: "Podcast", reach: "420K", trend: 5 },
];

/* ---------------- Reddit ---------------- */

export type RedditTab = "subreddits" | "influencers" | "insights";

export interface SubredditRow {
  id: string;
  name: string;
  members: string;
  activity: number; // 0-100
}

export const subreddits: SubredditRow[] = [
  { id: "rd-s1", name: "r/RunningShoeGeeks", members: "412K", activity: 92 },
  { id: "rd-s2", name: "r/running", members: "3.9M", activity: 84 },
  { id: "rd-s3", name: "r/AdvancedRunning", members: "310K", activity: 71 },
  { id: "rd-s4", name: "r/Sneakers", members: "5.2M", activity: 65 },
  { id: "rd-s5", name: "r/adidas", members: "210K", activity: 48 },
];

export interface RedditorRow {
  id: string;
  name: string;
  karma: string;
  pct: number; // 0-100
}

export const redditors: RedditorRow[] = [
  { id: "rd-i1", name: "u/tempo_junkie", karma: "184K karma", pct: 100 },
  { id: "rd-i2", name: "u/marathon_matt", karma: "122K karma", pct: 66 },
  { id: "rd-i3", name: "u/solereview_sam", karma: "98K karma", pct: 53 },
  { id: "rd-i4", name: "u/trackclubtina", karma: "76K karma", pct: 41 },
  { id: "rd-i5", name: "u/gel_vs_foam", karma: "41K karma", pct: 22 },
];

export const redditInsights: string[] = [
  "Fit inconsistency across lines is the single most repeated complaint — sizing threads outnumber colorway threads three to one.",
  "The Evo SL has become the default “what shoe should I buy” answer, displacing a rival that held that slot for two years.",
  "Run-club recruitment threads have doubled since January, and the gear questions increasingly come from first-time racers.",
];

/* ---------------- App Store Voice ---------------- */

export type AppPlatform = "ios" | "android";

export interface AppStoreData {
  rating: number;
  totalLabel: string;
  distribution: number[]; // 5-star .. 1-star, %
  review: { text: string; author: string };
}

export const appStoreVoice: Record<AppPlatform, AppStoreData> = {
  ios: {
    rating: 4.8,
    totalLabel: "312K ratings",
    distribution: [82, 9, 4, 2, 3],
    review: {
      text: "The club challenges keep our whole Tuesday group on the same plan. Best update in years.",
      author: "Runner_Jules",
    },
  },
  android: {
    rating: 4.4,
    totalLabel: "1.1M ratings",
    distribution: [64, 15, 9, 5, 7],
    review: {
      text: "Great tracking, but let me sync my club calendar without digging through three menus.",
      author: "kwame.runs",
    },
  },
};

/* ---------------- Sources of Traffic ---------------- */

export interface TrafficChannel {
  id: string;
  label: string;
  value: number; // %
  target?: string;
}

export const trafficChannels: TrafficChannel[] = [
  { id: "tc-1", label: "Direct", value: 34.95 },
  { id: "tc-2", label: "Organic", value: 20.88 },
  { id: "tc-3", label: "Paid", value: 34.25 },
  { id: "tc-4", label: "Referrals", value: 2.8, target: "Target 9%" },
  { id: "tc-5", label: "Display", value: 0.7 },
  { id: "tc-6", label: "Social", value: 6.35, target: "Target 20%" },
  { id: "tc-7", label: "Email", value: 0.06 },
];

/* ---------------- Pulse ---------------- */

export interface PulseDay {
  day: string;
  value: number; // 0-100 conversation index
}

export const pulseWeek: PulseDay[] = [
  { day: "Mon", value: 38 },
  { day: "Tue", value: 52 },
  { day: "Wed", value: 61 },
  { day: "Thu", value: 92 },
  { day: "Fri", value: 74 },
  { day: "Sat", value: 85 },
  { day: "Sun", value: 47 },
];

/* ---------------- Hiring Velocity ---------------- */

export interface HiringRow {
  id: string;
  label: string;
  roles: number;
  delta: number; // signed %
  pct: number; // bar width relative to leader
  note: string; // "→ strategic intent" annotation
}

export const hiringSummary = { open: 129, deltaPct: 98 };

export const hiringRows: HiringRow[] = [
  { id: "hv-1", label: "Digital & App Engineering", roles: 41, delta: 320, pct: 52, note: "Building the membership platform fast" },
  { id: "hv-2", label: "Retail Experience", roles: 58, delta: 56, pct: 60, note: "Flagship expansion continues" },
  { id: "hv-3", label: "Performance Footwear Design", roles: 24, delta: 180, pct: 40, note: "Doubling down on running silhouettes" },
  { id: "hv-4", label: "Heritage Marketing", roles: 6, delta: -40, pct: 12, note: "Pulling back on lifestyle spend" },
];
