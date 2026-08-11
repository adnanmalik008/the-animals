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
  { id: "sov-nike", label: "Competitor A", pct: 27, color: "blue" },
  { id: "sov-on", label: "Competitor B", pct: 18, color: "green" },
  { id: "sov-nb", label: "Competitor C", pct: 13, color: "purple" },
];
