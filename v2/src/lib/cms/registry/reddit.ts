import { defineModule, f } from "../spec";
import { redditInsightStates, redditors, subreddits } from "@/data/live";

/* One insight, per consumer state. Each carries an id because a sticker
   dropped on it files against that id; keying by position would move
   another insight's sticker the moment a row is reordered. */
const insight = f.list({
  label: "Insights",
  min: 1,
  max: 8,
  summary: "text",
  idPrefix: "ri",
  item: f.object({
    fields: {
      id: f.id(),
      text: f.textarea({ label: "Insight", rows: 3, maxLength: 400 }),
    },
  }),
});

const withIds = (prefix: string, lines: string[]) => lines.map((text, i) => ({ id: `${prefix}-${i + 1}`, text }));

export const reddit = defineModule({
  key: "reddit",
  tab: "live",
  column: "data",
  order: 6,
  label: "Reddit",
  heading: { title: "Reddit" },
  boardPath: "/",
  fields: {
    subreddits: f.list({
      label: "Subreddits",
      min: 1,
      max: 10,
      summary: "name",
      idPrefix: "rd-s",
      item: f.object({
        fields: {
          id: f.id(),
          name: f.text({ label: "Subreddit", help: "With its r/ prefix", maxLength: 40 }),
          members: f.text({ label: "Members", help: "As printed: 412K, 3.9M", maxLength: 12 }),
          activity: f.number({ label: "Activity", help: "0–100; the bar is this wide", integer: true, min: 0, max: 100 }),
        },
      }),
    }),
    influencers: f.list({
      label: "Influencers",
      min: 1,
      max: 10,
      summary: "name",
      idPrefix: "rd-i",
      item: f.object({
        fields: {
          id: f.id(),
          name: f.text({ label: "Redditor", help: "With its u/ prefix", maxLength: 40 }),
          karma: f.text({ label: "Karma", help: "With the word: 184K karma", maxLength: 20 }),
          /* Not derivable here: karma is a rounded string with its unit in
             it, so nothing in this document holds the number a share would
             be taken of. The editor sets the bar directly, longest first. */
          pct: f.number({ label: "Bar length", help: "0–100, relative to the top influencer", integer: true, min: 0, max: 100 }),
        },
      }),
    }),
    insights: f.object({
      label: "Insights",
      help: "One set per state; the board's three pills switch between them.",
      fields: {
        drivers: insight,
        problems: insight,
        solutions: insight,
      },
    }),
  },
  fixture: () => ({
    subreddits,
    influencers: redditors,
    insights: {
      drivers: withIds("ri-d", redditInsightStates.drivers),
      problems: withIds("ri-p", redditInsightStates.problems),
      solutions: withIds("ri-s", redditInsightStates.solutions),
    },
  }),
});
