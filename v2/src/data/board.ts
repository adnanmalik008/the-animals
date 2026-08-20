/* Board content — manual fixtures for now.
   Shapes mirror the future Supabase tables so the swap is a data-layer change only. */

export type NewsSource =
  | "Bloomberg"
  | "The New York Times"
  | "CNN"
  | "MSN"
  | "Fox News"
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
    body:
      "MI5 has warned government departments that Chinese intelligence services are running fabricated recruiter profiles on LinkedIn at what it called an industrial scale, with more than ten thousand approaches to officials and contractors flagged in the past year alone.\n\nThe profiles follow a pattern: a plausible headshot, a consultancy nobody can quite place, and an offer of paid speaking or advisory work that begins with an innocuous request for a CV. Officials who engage are steered toward encrypted channels, where requests gradually sharpen toward policy detail and personnel gossip.\n\nThe guidance stops short of telling civil servants to leave the platform. Instead it asks them to treat unsolicited approaches the way they would treat a stranger at the department's front desk — and to report anything that flatters a little too precisely.",
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
    body:
      "LinkedIn found itself at the centre of a moderation storm this week after removing a post supportive of immigration enforcement that the platform labelled hateful, then partially walking the decision back after an appeal.\n\nThe episode is the latest in a series testing whether a professional network can hold a narrower speech standard than the open platforms without alienating half its audience. Advertisers, for their part, have been conspicuously quiet: brand-safety teams privately say the professional context is precisely why they spend there, and they would rather the platform err on the side of removal.\n\nThe company says enforcement decisions are made against published community policies, not politics. Critics on both sides say the published policies are broad enough to justify either outcome — which is, in effect, the problem.",
  },
  {
    id: "nw-fox",
    source: "Fox News",
    category: "Politics",
    categoryColor: "red",
    headline: "LinkedIn under fire after pro-ICE post removed as 'hateful'",
    author: "@ELENI COUREA",
    timeAgo: "2m ago",
    summary:
      "The takedown is drawing accusations of one-sided moderation from conservative commentators and a handful of advertisers.",
    body:
      "The removal of a pro-ICE post on LinkedIn has become the latest flashpoint in the running argument over who gets moderated on professional networks — and who doesn't.\n\nConservative commentators spent the day surfacing posts from the opposite side of the immigration debate that remain online, arguing the network enforces its rules in one direction. LinkedIn says the removed post violated existing policy against hateful content and that reports against other posts are being reviewed in order.\n\nThe stakes are commercial as much as political: the platform's pitch to advertisers rests on being the internet's most brand-safe feed, and every moderation fight tests whether that promise can survive contact with politics.",
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
    body:
      "The knives are out for LinkedIn after the network yanked a pro-ICE post it branded 'hateful' — and conservatives say the double standard is the story.\n\nUsers surfaced a string of posts on the other side of the immigration debate that remain live, some with sharper language than the removed item. The company insists each case is judged against the same community policies and that the comparison posts are under review, but declined to say how many had been actioned.\n\nFor a platform that sells itself to advertisers as the safest room on the internet, the fight is an unwelcome reminder that there is no such thing as a professional network without politics — only one where the politics arrive wearing a lanyard.",
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
