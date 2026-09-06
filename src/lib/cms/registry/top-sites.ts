import { defineModule, f } from "../spec";
import { topSites, topSitesSubtitle } from "@/data/live";

/* One tab's worth of properties. The three tabs are fixed in code — they
   are the module's own furniture, and each has its own pill. */
const group = (label: string) =>
  f.list({
    label,
    /* The card names the leading property in a sticker's headline by
       sorting and taking the first row, so a tab must not be empty. */
    min: 1,
    max: 12,
    summary: "label",
    idPrefix: "ts",
    item: f.object({
      fields: {
        id: f.id(),
        label: f.text({ label: "Property", maxLength: 40 }),
        audience: f.number({ label: "Your audience", help: "0–100 %", integer: true, min: 0, max: 100 }),
        average: f.number({ label: "US average", help: "0–100 %", integer: true, min: 0, max: 100 }),
      },
    }),
  });

export const topSitesModule = defineModule({
  key: "top-sites",
  tab: "live",
  column: "data",
  order: 4,
  label: "Top Sites",
  heading: { title: "Top Sites" },
  boardPath: "/",
  fields: {
    subtitle: f.textarea({ label: "Subtitle", help: "The line under the tabs.", rows: 2, maxLength: 200, default: topSitesSubtitle }),
    news: group("News"),
    social: group("Social"),
    searchai: group("Search / AI"),
  },
  fixture: () => ({ subtitle: topSitesSubtitle, ...topSites }),
});
