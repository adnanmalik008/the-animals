/* A glyph for every module the agency can edit.

   Lucide, which is the icon set shadcn/ui draws with, so the CMS has one
   icon vocabulary rather than a hand-drawn set beside a library one.

   Each glyph says what the module is *about*, because the label already says
   what it is called. Two modules that read alike in a list ("Search Velocity",
   "Sources of Traffic") should not look alike here. */

import {
  Activity,
  Antenna,
  BadgeDollarSign,
  Blend,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Cctv,
  ChartPie,
  CircleDashed,
  Eye,
  FileText,
  Globe,
  Layers,
  LayoutPanelTop,
  Mail,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Mic,
  MonitorPlay,
  Newspaper,
  PawPrint,
  Presentation,
  Radio,
  Route,
  Search,
  Smartphone,
  Sunrise,
  Swords,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  /* ---- header ---- */
  "board-header": LayoutPanelTop,

  /* ---- Live · editorial ---- */
  newswire: Newspaper,
  "social-pulse": Activity,
  conversation: MessagesSquare,
  "on-stage": Mic,
  "in-their-inbox": Mail,
  sightings: Eye,
  airwaves: Radio,
  "youtube-voices": MonitorPlay,

  /* ---- Live · data ---- */
  "ai-visibility": BrainCircuit,
  "share-of-voice": ChartPie,
  "search-velocity": TrendingUp,
  "top-sites": Globe,
  "opinion-leaders": Megaphone,
  reddit: MessageCircle,
  "app-store": Smartphone,
  "traffic-sources": Route,
  pulse: BookOpen,
  hiring: Briefcase,

  /* ---- Competition ---- */
  competitors: Swords,
  "channel-mix": Layers,
  "media-overlap": Blend,
  "show-up": Presentation,
  "ai-profile": Antenna,
  "search-landscape": Search,
  "animal-view": PawPrint,
  "paid-search": BadgeDollarSign,
  horizon: Sunrise,

  /* ---- In the Wild / Anomalies ---- */
  "wild-cams": Cctv,
  anomalies: CircleDashed,
};

/* A key with no glyph of its own is a module with no form yet. A plain
   document is honest about it. */
const FALLBACK: LucideIcon = FileText;

export function ModuleIcon({
  moduleKey,
  className,
  size = 18,
}: {
  moduleKey: string;
  className?: string;
  size?: number;
}) {
  const Icon = ICONS[moduleKey] ?? FALLBACK;
  return <Icon size={size} strokeWidth={1.75} aria-hidden className={className} />;
}

/** Whether a key draws as itself rather than as the generic document. Only
    the tests care — a module added without a glyph should be noticed. */
export function hasModuleIcon(moduleKey: string): boolean {
  return moduleKey in ICONS;
}
