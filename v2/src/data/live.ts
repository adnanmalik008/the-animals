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
  image: string;
  imageAlt: string;
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
    image: "/assets/sightings/london.jpg",
    imageAlt: "Run club gathering in London",
  },
  {
    id: "sp-2",
    platform: "reddit",
    author: "u/tempo_junkie",
    text: "Hot take: the Adizero Evo SL is the best daily trainer under $150 and it isn't close. Full 300-mile review inside.",
    likes: "2.4K",
    comments: "312",
    timeAgo: "5h ago",
    image: "/assets/sightings/berlin.jpg",
    imageAlt: "Performance footwear street sighting",
  },
  {
    id: "sp-3",
    platform: "instagram",
    author: "@sambasunday",
    text: "Sambas at the finish line, espresso in hand. Race day is a lifestyle now.",
    likes: "12.6K",
    comments: "214",
    timeAgo: "7h ago",
    image: "/assets/sightings/paris.jpg",
    imageAlt: "Race-day street style",
  },
  {
    id: "sp-4",
    platform: "x",
    author: "@lacedup_ldn",
    text: "adidas quietly seeding the new Evo to sub-3 marathoners only. Scarcity marketing meets PB culture.",
    likes: "3.1K",
    comments: "428",
    timeAgo: "2h ago",
    image: "/assets/sightings/ny.jpg",
    imageAlt: "Marathon runners in New York",
  },
  {
    id: "sp-5",
    platform: "tiktok",
    author: "@girlsthatrun",
    text: "Rating every run club in East London by their post-run pastry situation. Part 4: the croissant capital.",
    likes: "96K",
    comments: "2.3K",
    timeAgo: "1d ago",
    image: "/assets/sightings/manchester.jpg",
    imageAlt: "Runners meeting after a club run",
  },
  {
    id: "sp-6",
    platform: "instagram",
    author: "@trackhouse.archive",
    text: "1972 Munich spikes, restored stitch by stitch. Some shoes are museums.",
    likes: "8.4K",
    comments: "96",
    timeAgo: "12h ago",
    image: "/assets/sightings/tokyo.jpg",
    imageAlt: "Archive footwear display",
  },
  {
    id: "sp-7",
    platform: "reddit",
    author: "u/marathon_matt",
    text: "Pulled data from 400 Strava clubs: average group-run pace slowed 40s/mile since 2023. Social running is winning.",
    likes: "1.8K",
    comments: "267",
    timeAgo: "9h ago",
    image: "/assets/sightings/london.jpg",
    imageAlt: "Community running group",
  },
  {
    id: "sp-8",
    platform: "x",
    author: "@sneakerlawyer",
    text: "Terrace culture did more for adidas' 2025 balance sheet than every performance launch combined. Discuss.",
    likes: "5.7K",
    comments: "891",
    timeAgo: "6h ago",
    image: "/assets/sightings/berlin.jpg",
    imageAlt: "Terrace-inspired street style",
  },
  {
    id: "sp-9",
    platform: "tiktok",
    author: "@coachkofi",
    text: "Your shoes don't need more drop. You need more sleep. Anyway, here's my full rotation for 2026.",
    likes: "33K",
    comments: "780",
    timeAgo: "1d ago",
    image: "/assets/sightings/paris.jpg",
    imageAlt: "Coach sharing a shoe rotation",
  },
];

/* ---------------- The Conversation ---------------- */

export type ConversationPlatform = "slack" | "discord" | "linkedin" | "whatsapp";

export const conversationPlatformLabel: Record<ConversationPlatform, string> = {
  slack: "Slack",
  discord: "Discord",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
};

export interface ConversationQuote {
  id: string;
  platform: ConversationPlatform;
  /** channel/community context line, e.g. "#shoe-lab · Run Club Collective" */
  context: string;
  /** optional thread the quote replies to */
  replyTo?: string;
  text: string;
  author: string;
  handle: string;
  upvotes: number;
  timeAgo: string;
}

export const conversationQuotes: ConversationQuote[] = [
  {
    id: "cq-1",
    platform: "slack",
    context: "#shoe-lab · Run Club Collective",
    replyTo: "Is the Evo SL worth full retail?",
    text: "Half my club has stopped reading launch coverage entirely — the algorithm rewards rage-bait reviews now. The group chat is the only honest filter left.",
    author: "Priya N.",
    handle: "@priya.n",
    upvotes: 34,
    timeAgo: "2m ago",
  },
  {
    id: "cq-2",
    platform: "linkedin",
    context: "Comments · Run Culture Weekly post",
    replyTo: "The death of the brand ambassador",
    text: "The athletes I respect most quietly stopped posting. They DM, they pace club runs, they show up at 6am. The performance is exhausting.",
    author: "Sofia Alvarez",
    handle: "@sofia-alvarez",
    upvotes: 112,
    timeAgo: "38m ago",
  },
  {
    id: "cq-3",
    platform: "discord",
    context: "#gear-talk · Sub-3 Society",
    text: "Nobody in this server bought the last three colorways at retail. We're all watching the same two resale bots and pretending that's a community.",
    author: "Marcus Webb",
    handle: "@marcuswebb",
    upvotes: 58,
    timeAgo: "1h ago",
  },
  {
    id: "cq-4",
    platform: "whatsapp",
    context: "Sunday Long Run · 42 members",
    text: "The pacer-only drop got the whole chat talking again. First time a release felt like it was for us, not for the resellers.",
    author: "Dayo A.",
    handle: "@dayo.runs",
    upvotes: 21,
    timeAgo: "3h ago",
  },
  {
    id: "cq-5",
    platform: "slack",
    context: "#marathon-build · Distance Collective",
    text: "Carbon plates stopped being a flex. The flex now is showing up to a Tuesday session in whatever's already broken in.",
    author: "Jonas K.",
    handle: "@jonaskr",
    upvotes: 47,
    timeAgo: "5h ago",
  },
  {
    id: "cq-6",
    platform: "linkedin",
    context: "Comments · Sports Retail Digest post",
    replyTo: "Why run clubs beat billboards",
    text: "We measured it: one club captain seeding a shoe converts better than an entire out-of-home campaign. Community is the channel.",
    author: "Elena Marsh",
    handle: "@elena-marsh",
    upvotes: 89,
    timeAgo: "2h ago",
  },
  {
    id: "cq-7",
    platform: "discord",
    context: "#trail-den · Ultra Basement",
    replyTo: "Rotation check: what's actually getting miles?",
    text: "Everyone here owns the same six shoes. What we argue about is who actually runs in theirs.",
    author: "gravelghost",
    handle: "@gravelghost",
    upvotes: 33,
    timeAgo: "6h ago",
  },
  {
    id: "cq-8",
    platform: "whatsapp",
    context: "Track Tuesdays · 28 members",
    replyTo: "Kit order for autumn",
    text: "Vote's in: half the group wants the retro colours back. The new stuff photographs well but the old stuff gets worn.",
    author: "Nia T.",
    handle: "@nia.t",
    upvotes: 18,
    timeAgo: "8h ago",
  },
];

/* ---------------- On Stage ---------------- */

export interface StageEvent {
  id: string;
  /** "THE RUNNING EVENT 2026 · AUSTIN, TX" */
  event: string;
  /** "#TRE2026" */
  hashtag: string;
  /** "Keynote · The Distribution Crisis" */
  session: string;
  /** pull-quote, rendered in guillemets */
  quote: string;
  speaker: string;
  speakerTitle: string;
  liveTweets: string;
}

export const stageEvents: StageEvent[] = [
  {
    id: "se-1",
    event: "THE RUNNING EVENT 2026 · AUSTIN, TX",
    hashtag: "#TRE2026",
    session: "Keynote · The Distribution Crisis",
    quote:
      "Retail isn't a shelf anymore. It's a Saturday morning run club with a waitlist — and most brands are still buying shelf space.",
    speaker: "Lena Ortiz",
    speakerTitle: "Founder, The Running Event",
    liveTweets: "1240",
  },
  {
    id: "se-2",
    event: "GLOBAL RUNNING SUMMIT 2026 · MUNICH",
    hashtag: "#RunSummit26",
    session: "Panel · Super Shoes After the Arms Race",
    quote:
      "The carbon-plate era taught runners to read midsole patents. You cannot market past an educated athlete.",
    speaker: "Dr. Femi Adeyemi",
    speakerTitle: "Head of Performance, Sportslab Institute",
    liveTweets: "860",
  },
  {
    id: "se-3",
    event: "SNEAKERCON 2026 · NEW YORK, NY",
    hashtag: "#SneakerCon",
    session: "Fireside · Heritage as Strategy",
    quote:
      "Every archive re-issue is a promise: we were here before the hype, and we'll be here after it.",
    speaker: "Maya Chen",
    speakerTitle: "VP Brand, Terrace Archive",
    liveTweets: "2310",
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

export interface SiteGroup {
  id: string;
  label: string;
  /** % of your audience who searched/prompted this property 10+ times */
  audience: number;
  /** % of the US average who did */
  average: number;
}

export const topSitesSubtitle =
  "% who searched/prompted these properties 10+ times by US runners interested in performance gear";

export const topSites: Record<SiteTab, SiteGroup[]> = {
  news: [
    { id: "ts-n1", label: "CNN", audience: 78, average: 62 },
    { id: "ts-n2", label: "BBC", audience: 92, average: 70 },
    { id: "ts-n3", label: "NYT", audience: 64, average: 48 },
    { id: "ts-n4", label: "Reuters", audience: 88, average: 58 },
    { id: "ts-n5", label: "Bloomberg", audience: 71, average: 54 },
    { id: "ts-n6", label: "TechCrunch", audience: 96, average: 66 },
    { id: "ts-n7", label: "The Verge", audience: 82, average: 60 },
    { id: "ts-n8", label: "Wired", audience: 90, average: 68 },
  ],
  social: [
    { id: "ts-s1", label: "Reddit", audience: 94, average: 61 },
    { id: "ts-s2", label: "TikTok", audience: 88, average: 72 },
    { id: "ts-s3", label: "Instagram", audience: 90, average: 78 },
    { id: "ts-s4", label: "YouTube", audience: 97, average: 84 },
    { id: "ts-s5", label: "Strava", audience: 82, average: 34 },
    { id: "ts-s6", label: "X", audience: 58, average: 49 },
    { id: "ts-s7", label: "Discord", audience: 46, average: 28 },
    { id: "ts-s8", label: "Facebook", audience: 52, average: 64 },
  ],
  searchai: [
    { id: "ts-a1", label: "Google", audience: 98, average: 92 },
    { id: "ts-a2", label: "ChatGPT", audience: 84, average: 58 },
    { id: "ts-a3", label: "Gemini", audience: 62, average: 44 },
    { id: "ts-a4", label: "Perplexity", audience: 48, average: 22 },
    { id: "ts-a5", label: "Bing", audience: 34, average: 38 },
    { id: "ts-a6", label: "Claude", audience: 41, average: 23 },
    { id: "ts-a7", label: "Copilot", audience: 36, average: 30 },
    { id: "ts-a8", label: "DuckDuckGo", audience: 22, average: 18 },
  ],
};

/* ---------------- Opinion Leaders ---------------- */

export type LeaderTone = "ember" | "ocean" | "moss" | "violet" | "sun";
export type LeaderPlatform = "linkedin" | "instagram" | "youtube" | "tiktok" | "x";

export interface OpinionLeader {
  id: string;
  name: string;
  initials: string;
  /** avatar gradient key, mapped to classes in the component */
  tone: LeaderTone;
  role: string;
  eng: number; // engagement score 0-100
  followers: string;
  platform: LeaderPlatform;
}

export const opinionLeaders: OpinionLeader[] = [
  { id: "ol-1", name: "Kofi Mensah", initials: "KM", tone: "ember", role: "Run culture analyst", eng: 92, followers: "2.1M", platform: "linkedin" },
  { id: "ol-2", name: "Elsa Brandt", initials: "EB", tone: "ocean", role: "Performance gear reviewer", eng: 87, followers: "1.4M", platform: "instagram" },
  { id: "ol-3", name: "Jay Okafor", initials: "JO", tone: "moss", role: "Marathon coach", eng: 84, followers: "980K", platform: "youtube" },
  { id: "ol-4", name: "Mara Silva", initials: "MS", tone: "violet", role: "Run club organiser", eng: 79, followers: "640K", platform: "tiktok" },
  { id: "ol-5", name: "Tom Whitfield", initials: "TW", tone: "sun", role: "Track podcast host", eng: 75, followers: "420K", platform: "x" },
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

/* Insights split into the three consumer states the client reads them by. */
export type InsightState = "drivers" | "problems" | "solutions";

export const insightStateLabel: Record<InsightState, string> = {
  drivers: "Drivers",
  problems: "Problems",
  solutions: "Solutions",
};

export const redditInsightStates: Record<InsightState, string[]> = {
  drivers: redditInsights,
  problems: [
    "Squeaky midsoles dominate the return threads — the same three models come up in every complaint post.",
    "Wide-fit availability is the most common reason a recommendation thread ends in a rival purchase.",
    "Price rises are now argued in every launch thread, and the defence is coming from users rather than the brand.",
  ],
  solutions: [
    "Club-seeded early access is the most requested fix — runners want pairs going to people who log miles, not resellers.",
    "A published sizing chart per last would defuse the majority of fit arguments before they reach a return.",
    "Repair and re-sole programmes get spontaneous praise whenever a rival announces one.",
  ],
};

/* ---------------- App Store Voice ---------------- */

export type AppPlatform = "ios" | "android";

export interface AppStoreStat {
  value: string; // "+34%"
  label: string; // "Onboarding"
}

export interface AppStoreData {
  rating: number;
  totalLabel: string;
  /** review-theme movement chips */
  stats: AppStoreStat[];
  review: { text: string; author: string };
}

export const appStoreVoice: Record<AppPlatform, AppStoreData> = {
  ios: {
    rating: 4.3,
    totalLabel: "12 840 reviews",
    stats: [
      { value: "+34%", label: "Onboarding" },
      { value: "+128%", label: "Crashes" },
      { value: "+212%", label: "AI features" },
      { value: "+48%", label: "Pricing" },
    ],
    review: {
      text: "The new AI running coach is genuinely useful but the app crashes every time I open it on iOS 18.",
      author: "Runner_Jules",
    },
  },
  android: {
    rating: 4.5,
    totalLabel: "31 260 reviews",
    stats: [
      { value: "+21%", label: "Onboarding" },
      { value: "+64%", label: "Crashes" },
      { value: "+176%", label: "AI features" },
      { value: "+39%", label: "Pricing" },
    ],
    review: {
      text: "Club challenges keep our whole Tuesday group on one plan — just let me sync the calendar without three menus.",
      author: "kwame.runs",
    },
  },
};

/* ---------------- Sources of Traffic ---------------- */

export interface TrafficChannel {
  id: string;
  label: string;
  value: number; // 0-100 traffic index
}

export const trafficChannels: TrafficChannel[] = [
  { id: "tc-1", label: "Direct", value: 98 },
  { id: "tc-2", label: "Organic", value: 88 },
  { id: "tc-3", label: "Paid", value: 76 },
  { id: "tc-4", label: "Referrals", value: 100 },
  { id: "tc-5", label: "Display", value: 90 },
  { id: "tc-6", label: "Social", value: 54 },
  { id: "tc-7", label: "Email", value: 82 },
];

/* ---------------- Wikipedia Pulse ---------------- */

export interface WikiPulseRow {
  id: string;
  entity: string; // "adidas (company)"
  meta: string; // "12 editors · 8m ago"
  count: number; // edits in the window
  window: string; // "24H"
  pct: number; // bar width relative to leader
  baseline: string; // "Baseline 4/day · 11.8× normal"
  spike: boolean;
}

export const wikiPulseSpikes = 2;

export const wikiPulse: WikiPulseRow[] = [
  {
    id: "wp-1",
    entity: "adidas (company)",
    meta: "12 editors · 8m ago",
    count: 47,
    window: "24H",
    pct: 100,
    baseline: "Baseline 4/day · 11.8× normal",
    spike: true,
  },
  {
    id: "wp-2",
    entity: "Category: Super shoes",
    meta: "9 editors · 22m ago",
    count: 28,
    window: "24H",
    pct: 60,
    baseline: "Baseline 6/day · 4.7× normal",
    spike: true,
  },
  {
    id: "wp-3",
    entity: "Rival Co.",
    meta: "5 editors · 1h ago",
    count: 12,
    window: "24H",
    pct: 26,
    baseline: "Baseline 3/day · 4.0× normal",
    spike: true,
  },
  {
    id: "wp-4",
    entity: "Industry term (carbon plate)",
    meta: "3 editors · 3h ago",
    count: 6,
    window: "24H",
    pct: 13,
    baseline: "Baseline 2/day · 3.0× normal",
    spike: true,
  },
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
