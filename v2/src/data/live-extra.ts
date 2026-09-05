/* Extra Live-tab left-column fixtures — In Their Inbox, Sightings,
   On the Airwaves, YouTube Voices. Manual fixtures for now; shapes mirror
   the future Supabase tables so the swap is a data-layer change only. */

/* ---------------- In Their Inbox ---------------- */

export interface NewsletterItem {
  id: string;
  name: string; // newsletter name
  authors: string;
  subs: string; // "78K subs"
  openRate: string; // "58% open"
  subject: string;
  timeAgo: string;
  /** the line worth reading, shown when the send is open */
  quote: string;
  /** the framing it belongs to — the orange tag under the quote */
  tag: string;
}

export const newsletterItems: NewsletterItem[] = [
  {
    id: "nl-1",
    name: "Why is this interesting?",
    authors: "Noah Brier & Colin Nagy",
    subs: "78K subs",
    openRate: "58% open",
    subject: "The Newsletter-as-Brand Edition",
    timeAgo: "4d ago",
    quote:
      "The newsletters that still convert aren't selling a product. They're selling a point of view you can't get from the brand's own feed.",
    tag: "Brand as media",
  },
  {
    id: "nl-2",
    name: "The Morning Shakeout",
    authors: "Mario Fraioli",
    subs: "42K subs",
    openRate: "61% open",
    subject: "The Super-Shoe Arms Race Is Cooling Off",
    timeAgo: "2d ago",
    quote:
      "Every brand has a carbon plate now. The runners I coach stopped asking which shoe is fastest and started asking which one they'll still want to wear in March.",
    tag: "Post-hype",
  },
  {
    id: "nl-3",
    name: "After School",
    authors: "Casey Lewis",
    subs: "51K subs",
    openRate: "47% open",
    subject: "Gen Z Won't Buy Your Performance Story",
    timeAgo: "3d ago",
    quote:
      "Gen Z isn't anti-performance. They're anti being told a jacket will make them a better person.",
    tag: "Tone shift",
  },
  {
    id: "nl-4",
    name: "Feed Me",
    authors: "Emily Sundberg",
    subs: "120K subs",
    openRate: "52% open",
    subject: "Terrace Shoes Ate the Office Dress Code",
    timeAgo: "5d ago",
    quote:
      "The Samba didn't win the office by being a running shoe. It won by being the one shoe nobody had to explain.",
    tag: "Terrace crossover",
  },
];

/* ---------------- Sightings ---------------- */

export interface SightingItem {
  id: string;
  caption: string;
  time: string; // "14:00 GMT"
  city: string;
  /** photo asset from the design source, under /assets/sightings */
  photo: string;
}

export const sightingItems: SightingItem[] = [
  {
    id: "sg-1",
    caption: "Billboard, Times Square — competitor promoting AI running coach",
    time: "14:00 GMT",
    city: "New York",
    photo: "/assets/sightings/ny.jpg",
  },
  {
    id: "sg-2",
    caption: "Tram wrap, Alexanderplatz — Evo SL launch takeover in full carbon black",
    time: "09:20 GMT",
    city: "Berlin",
    photo: "/assets/sightings/berlin.jpg",
  },
  {
    id: "sg-3",
    caption: "Projection, Shibuya crossing — midnight run-club invite, QR only",
    time: "23:45 GMT",
    city: "Tokyo",
    photo: "/assets/sightings/tokyo.jpg",
  },
  {
    id: "sg-4",
    caption: "Marathon expo wall, ExCeL — rival stacking carbon plates floor to ceiling",
    time: "11:30 GMT",
    city: "London",
    photo: "/assets/sightings/london.jpg",
  },
  {
    id: "sg-5",
    caption: "Bus shelter, Le Marais — retro Samba campaign shot on grainy film",
    time: "16:10 GMT",
    city: "Paris",
    photo: "/assets/sightings/paris.jpg",
  },
  {
    id: "sg-6",
    caption: "Stadium banner, Old Trafford — grassroots 10K sponsorship reveal",
    time: "19:05 GMT",
    city: "Manchester",
    photo: "/assets/sightings/manchester.jpg",
  },
];

/* ---------------- On the Airwaves ---------------- */

export type PodcastCover = "pivot" | "startup" | "oddlots";
export type PodcastNoteStyle = "plain" | "sticky" | "spiral";

export interface PodcastItem {
  id: string;
  show: string;
  network: string;
  timestamp: string; // "00:38:20"
  cover: PodcastCover;
  noteStyle: PodcastNoteStyle;
  note: string;
}

export const podcastItems: PodcastItem[] = [
  {
    id: "pc-1",
    show: "Pivot",
    network: "Kara Swisher & Scott Galloway Media",
    timestamp: "00:38:20",
    cover: "pivot",
    noteStyle: "plain",
    note: "Eight straight minutes on the running-brand culture wars. The take: heritage sneakers are the new streaming bundle, and adidas is the only player holding both the catalog and the pipeline.",
  },
  {
    id: "pc-2",
    show: "StartUp",
    network: "Gimlet Media",
    timestamp: "00:38:20",
    cover: "startup",
    noteStyle: "sticky",
    note: "Flag for brand team — whole segment on run crews out-recruiting paid acquisition. Clip 38:20 for Monday's standup.",
  },
  {
    id: "pc-3",
    show: "Odd Lots",
    network: "Tracy Alloway & Joe Weisenthal",
    timestamp: "00:52:45",
    cover: "oddlots",
    noteStyle: "spiral",
    note: "Tracy and Joe walk the super-shoe supply chain: carbon plates, Vietnam factory capacity, and why midsole foam is quietly the new lithium.",
  },
];

/* ---------------- YouTube Voices ---------------- */

export interface CreatorVideo {
  id: string;
  title: string;
  description: string;
  growthFrom: string; // "0 followers"
  growthTo: string; // "846K followers"
  /** thumbnail wordmark, two segments — second renders in the blue box */
  markA: string;
  markB: string;
  /** the design's own thumbnail; the growth banner, play button and
      wordmark are part of the artwork, so nothing is drawn over it */
  thumb: string;
  link?: string;
  /** YouTube id; when set, the fullscreen player streams the real video */
  videoId?: string;
}

export const creatorVideos: CreatorVideo[] = [
  {
    id: "yv-1",
    thumb: "/assets/youtube/blueprint.jpg",
    title: "The Evo SL effect: a running reset",
    description: "How one daily trainer rewired sneaker YouTube's entire review economy.",
    growthFrom: "0 followers",
    growthTo: "846K followers",
    markA: "run",
    markB: "blueprint",
  },
  {
    id: "yv-2",
    thumb: "/assets/youtube/stride.jpg",
    title: "Run clubs: the US perspective",
    description: "US coverage examining social running's takeover of city culture.",
    growthFrom: "12K followers",
    growthTo: "480K followers",
    markA: "stride",
    markB: "report",
  },
  {
    id: "yv-3",
    thumb: "/assets/youtube/blueprint.jpg",
    title: "Terrace shoes, explained in 12 minutes",
    description: "From Spezial forums to front rows — how the terraces conquered retail.",
    growthFrom: "3K followers",
    growthTo: "1.2M followers",
    markA: "sole",
    markB: "theory",
  },
  {
    id: "yv-4",
    thumb: "/assets/youtube/stride.jpg",
    title: "Marathon majors are broken",
    description: "Lottery odds, charity bids, and the economics locking runners out.",
    growthFrom: "40K followers",
    growthTo: "610K followers",
    markA: "pace",
    markB: "notes",
  },
];
