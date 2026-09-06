/* Custom widgets: values the generic field renderer cannot express. Each
   owns its zod schema here and its editor under components/admin/form. */

import { z } from "zod";

export const CIRCLE_IDS = [
  "news",
  "social",
  "key-influencers",
  "culture",
  "customer-opinion",
  "media-hotspots",
  "breakout-themes",
] as const;
export const CIRCLE_COLORS = ["orange", "yellow", "blue", "green", "red", "purple"] as const;
export const CIRCLE_ICONS = ["news", "chat", "signal", "globe", "scale", "coin", "stack", "folder", "box", "none"] as const;
export const CIRCLE_SIZES = ["sm", "md", "lg"] as const;

const circle = z.object({
  name: z.string().trim().min(1, "Required").max(24, "At most 24 characters"),
  color: z.enum(CIRCLE_COLORS),
  icon: z.enum(CIRCLE_ICONS),
  size: z.enum(CIRCLE_SIZES),
});

export const WIDGET_SCHEMAS = {
  /** 12 weekly points, each 0–100, for the Search Velocity sparkline */
  points12: z.array(z.number().min(0).max(100)).length(12, "Exactly 12 points"),
  /** presence per competitor column in Media Overlap */
  presence3: z.array(z.boolean()).length(3, "Exactly 3 columns"),
  /** the seven built-in Anomalies circles, keyed by their fixed ids */
  circles7: z.object({
    news: circle,
    social: circle,
    "key-influencers": circle,
    culture: circle,
    "customer-opinion": circle,
    "media-hotspots": circle,
    "breakout-themes": circle,
  }),
};

export type WidgetId = keyof typeof WIDGET_SCHEMAS;
export type WidgetValue<W extends WidgetId> = z.infer<(typeof WIDGET_SCHEMAS)[W]>;

export const WIDGET_DEFAULTS: { [W in WidgetId]: () => WidgetValue<W> } = {
  points12: () => Array.from({ length: 12 }, () => 0),
  presence3: () => [false, false, false],
  circles7: () => ({
    news: { name: "News", color: "orange", icon: "news", size: "md" },
    social: { name: "Social", color: "blue", icon: "chat", size: "md" },
    "key-influencers": { name: "Key Influencers", color: "purple", icon: "chat", size: "sm" },
    culture: { name: "Culture", color: "green", icon: "globe", size: "md" },
    "customer-opinion": { name: "Customer Opinion", color: "red", icon: "chat", size: "sm" },
    "media-hotspots": { name: "Media Hotspots", color: "yellow", icon: "signal", size: "md" },
    "breakout-themes": { name: "Breakout Themes", color: "blue", icon: "stack", size: "sm" },
  }),
};
