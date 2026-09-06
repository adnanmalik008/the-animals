import type { TopicCircle } from "@/lib/insights";

/* Static class maps so Tailwind can see every color utility at build time. */

export type CircleColor = TopicCircle["color"];

export const circleTint: Record<CircleColor, string> = {
  orange: "bg-orange/10",
  yellow: "bg-yellow/10",
  blue: "bg-blue/10",
  green: "bg-green/10",
  red: "bg-red/10",
  purple: "bg-purple/15",
};

export const circleText: Record<CircleColor, string> = {
  orange: "text-orange",
  yellow: "text-yellow",
  blue: "text-blue",
  green: "text-green",
  red: "text-red",
  purple: "text-purple",
};

export const colorSolid: Record<CircleColor, string> = {
  orange: "bg-orange",
  yellow: "bg-yellow",
  blue: "bg-blue",
  green: "bg-green",
  red: "bg-red",
  purple: "bg-purple",
};

export const circleBadge: Record<CircleColor, string> = {
  orange: "bg-orange/15 text-orange",
  yellow: "bg-yellow/20 text-yellow",
  blue: "bg-blue/15 text-blue",
  green: "bg-green/15 text-green",
  red: "bg-red/15 text-red",
  purple: "bg-purple/20 text-purple",
};

export const circleBorderSoft: Record<CircleColor, string> = {
  orange: "border-orange/50",
  yellow: "border-yellow/60",
  blue: "border-blue/50",
  green: "border-green/50",
  red: "border-red/50",
  purple: "border-purple/60",
};

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-orange/70";
