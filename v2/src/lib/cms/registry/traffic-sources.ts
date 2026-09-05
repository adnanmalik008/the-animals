import { defineModule, f } from "../spec";
import { trafficChannels } from "@/data/live";

export const trafficSources = defineModule({
  key: "traffic-sources",
  tab: "live",
  column: "data",
  order: 8,
  label: "Sources of Traffic",
  heading: { title: "Sources of Traffic" },
  boardPath: "/",
  fields: {
    period: f.text({ label: "Period chip", default: "Jan 2026", maxLength: 24 }),
    region: f.text({ label: "Region chip", default: "Worldwide", maxLength: 24 }),
    scope: f.text({ label: "Traffic type chip", default: "All Traffic", maxLength: 24 }),
    channels: f.list({
      label: "Channels",
      help: "One bar each; the leading channel names the sticker.",
      min: 1,
      max: 8,
      summary: "label",
      idPrefix: "tc",
      item: f.object({
        fields: {
          id: f.id(),
          label: f.text({ label: "Channel", help: "Short — it sits under a bar", maxLength: 10 }),
          value: f.number({ label: "Traffic index", help: "0–100", min: 0, max: 100 }),
        },
      }),
    }),
  },
  fixture: () => ({ period: "Jan 2026", region: "Worldwide", scope: "All Traffic", channels: trafficChannels }),
});
