/* Board content — manual fixtures for now.
   Shapes mirror the future Supabase tables so the swap is a data-layer change only. */

export type NewsSource =
  | "Bloomberg"
  | "The New York Times"
  | "CNN"
  | "MSN"
  | "New York Post"
  | "CNBC";

export interface NewsItem {
  id: string;
  source: NewsSource;
  category: string;
  categoryColor: "orange" | "blue" | "green" | "red" | "purple";
  headline: string;
  author: string;
  timeAgo: string;
  summary: string;
  link?: string;
  /** full article copy for the reader modal; paragraphs separated by blank lines */
  body?: string;
}

export interface BoardMeta {
  clientName: string;
  briefDate: string;
  briefQuestion: string;
  progressPct: number;
  userName: string;
}

export const boardMeta: BoardMeta = {
  clientName: "adidas",
  briefDate: "9th June 2026",
  briefQuestion:
    "Who is building identity around movement in 2026, and where are the communities that haven't been claimed yet?",
  progressPct: 0,
  userName: "R Basckin",
};

export const newsItems: NewsItem[] = [
  {
    id: "nw-1",
    source: "Bloomberg",
    category: "Technology",
    categoryColor: "orange",
    headline: "The loneliness economy finds its feet in run culture",
    author: "@ELENI COUREA",
    timeAgo: "2m ago",
    summary:
      "Run clubs have quietly become the fastest-growing social layer in major cities, and brands are treating weekly 5Ks as owned media channels rather than sponsorship opportunities.",
    body:
      "On a drizzly Saturday in Hackney, two hundred people queue for a run that has no prize money, no medal and no finish-line photographer. What it has is a waitlist. The club that organises it caps entries at 250, and the cap is hit within an hour of the signup link going live each Tuesday.\n\nSociologists have started calling it the loneliness economy: a wave of consumer behaviour driven less by product and more by the search for a room — or a pavement — full of people who expect you to show up. Running, cheap and schedulable, has become its main street. Club membership across the ten largest US and UK cities has tripled since 2023, and the average member joined for fitness but stays, surveys suggest, for the people.\n\nFor brands the implication is uncomfortable. The channel that now moves product is not a billboard or a feed but a WhatsApp group with 42 members and a strong opinion about tempo pace. The companies adapting fastest are the ones treating club captains the way they once treated magazine editors — early access, honest briefings, and no scripts.",
  },
  {
    id: "nw-2",
    source: "The New York Times",
    category: "Business",
    categoryColor: "blue",
    headline: "MI5 warns of Chinese operatives using LinkedIn to reach officials",
    author: "@ELENI COUREA",
    timeAgo: "2m ago",
    summary:
      "The security service issued fresh guidance after a wave of fabricated recruiter profiles targeted civil servants, raising questions about professional networks as intelligence surfaces.",
  },
  {
    id: "nw-3",
    source: "CNN",
    category: "Artificial Intelligence",
    categoryColor: "orange",
    headline: "LinkedIn deepens video ad push, taps more publishers and creators",
    author: "@ELENI COUREA",
    timeAgo: "2m ago",
    summary:
      "The platform is courting short-form video budgets with new publisher partnerships, positioning itself against TikTok for B2B attention.",
    body:
      "LinkedIn is expanding its video advertising program to a wider set of publishers and creators, the company said Tuesday, the latest sign that the professional network wants a serious share of the short-form budgets that have flowed almost exclusively to TikTok, Reels and Shorts.\n\nThe pitch to advertisers is context: the same fifteen-second clip that scrolls past on entertainment feeds lands differently, the company argues, when the viewer is in a professional mindset. Early partners report completion rates roughly double their entertainment-platform benchmarks, though from a far smaller base.\n\nAnalysts are split on whether the push changes the platform's character. Video now accounts for the fastest-growing slice of time spent on the network, but the most engaged conversations still happen in comments and direct messages — the quiet layer that no ad format has managed to reach.",
  },
  {
    id: "nw-4",
    source: "MSN",
    category: "News",
    categoryColor: "green",
    headline: "LinkedIn under fire after pro-ICE post removed as 'hateful'",
    author: "@ELENI COUREA",
    timeAgo: "2m ago",
    summary:
      "Moderation decisions on political speech keep pulling professional platforms into culture-war coverage, with advertisers watching closely.",
  },
  {
    id: "nw-5",
    source: "New York Post",
    category: "Politics",
    categoryColor: "red",
    headline: "LinkedIn under fire after pro-ICE post removed as 'hateful'",
    author: "@ELENI COUREA",
    timeAgo: "2m ago",
    summary:
      "Critics accuse the network of inconsistent enforcement; the company says the post violated existing community policies.",
  },
];

/* The item that folds in after 30 seconds to keep the wire feeling live */
export const incomingNewsItem: NewsItem = {
  id: "nw-incoming",
  source: "CNBC",
  category: "Retail",
  categoryColor: "purple",
  headline: "Sportswear giants chase run-club culture with community-first drops",
  author: "@ERIN LASSNER",
  timeAgo: "just now",
  summary:
    "Limited releases tied to local running crews are outperforming traditional launches, according to new retail traffic data.",
  body:
    "Sportswear brands are rewriting the launch playbook around a new gatekeeper: the neighbourhood run club. Limited releases seeded through local crews are outselling traditional wide launches by a widening margin, according to retail traffic data reviewed by CNBC.\n\nThe mechanics are simple and deliberately unglamorous. A brand offers a club early access — sometimes a colourway, sometimes a full silhouette — and lets the captains decide who gets pairs. No influencer contracts, no countdown clocks. The scarcity is real because the community is real.\n\nRetail analysts caution that the tactic works precisely because it is small. Scale it into a program with a logo and a landing page, one buyer said, and it becomes another marketing channel that runners will politely ignore.",
};

export interface AiPlatformRow {
  id: string;
  name: "ChatGPT" | "Grok" | "Claude" | "Gemini";
  mentions: number; // thousands
  mentionsLabel: string;
  cited: number;
  citedLabel: string;
}

export const aiVisibility = {
  score: 71,
  mentionsLabel: "1.3M",
  mentions: 1.3,
  citedLabel: "3.2M",
  cited: 3.2,
  platforms: [
    { id: "chatgpt", name: "ChatGPT", mentions: 326.5, mentionsLabel: "326.5K", cited: 1.5, citedLabel: "1.5M" },
    { id: "grok", name: "Grok", mentions: 353.8, mentionsLabel: "353.8K", cited: 507.4, citedLabel: "507.4K" },
    { id: "claude", name: "Claude", mentions: 333.4, mentionsLabel: "333.4K", cited: 1.6, citedLabel: "1.6M" },
    { id: "gemini", name: "Gemini", mentions: 318, mentionsLabel: "318K", cited: 717, citedLabel: "717" },
  ] satisfies AiPlatformRow[],
};

export interface VoiceShareRow {
  id: string;
  label: string;
  pct: number;
  color: "orange" | "blue" | "green" | "purple" | "yellow";
}

export const shareOfVoice: VoiceShareRow[] = [
  { id: "sov-brand", label: "Your Brand", pct: 42, color: "orange" },
  { id: "sov-nike", label: "Rival Co.", pct: 28, color: "blue" },
  { id: "sov-on", label: "Upstart Ltd", pct: 18, color: "green" },
  { id: "sov-nb", label: "Legacy Inc", pct: 12, color: "purple" },
];
