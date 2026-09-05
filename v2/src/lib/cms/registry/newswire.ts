import { defineModule, f } from "../spec";
import { incomingNewsItem, newsItems } from "@/data/board";

const CATEGORY_COLORS = [
  { value: "orange", label: "Orange" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
] as const;

const article = f.object({
  fields: {
    id: f.id(),
    source: f.text({
      label: "Publisher",
      help: "A known name (CNN, The New York Times…) shows its masthead; any other prints as a bold wordmark.",
      maxLength: 40,
    }),
    category: f.text({ label: "Category pill", maxLength: 32 }),
    categoryColor: f.select({
      label: "Colour on the Anomalies card",
      help: "The pill on the wire is always orange; this colours the card a sticker files.",
      options: CATEGORY_COLORS,
      default: "orange",
    }),
    headline: f.text({ label: "Headline", help: "One line when collapsed; opens to the rest.", maxLength: 200 }),
    author: f.text({ label: "Byline", help: "Printed uppercase as typed, e.g. @ELENI COUREA", maxLength: 60 }),
    timeAgo: f.text({ label: "Time label", help: "Free text, printed as typed: 2m ago, just now", maxLength: 24 }),
    summary: f.textarea({ label: "Summary", help: "Shown when the row is opened.", rows: 3 }),
    body: f.textarea({
      label: "Full article",
      help: "Shown in the reader. A blank line starts a new paragraph. No quote marks needed.",
      rows: 10,
      optional: true,
    }),
    link: f.url({ label: "Link", help: "Adds an 'Open at <publisher>' button in the reader.", optional: true }),
  },
});

export const newswire = defineModule({
  key: "newswire",
  tab: "live",
  column: "editorial",
  order: 1,
  label: "Newswire",
  heading: { eyebrow: "Dispatch", title: "Newswire" },
  boardPath: "/",
  fields: {
    items: f.list({ label: "Articles", item: article, min: 1, max: 12, summary: "headline", idPrefix: "nw" }),
    incoming: f.object({
      fields: article.fields,
      label: "Late arrival",
      help: "Folds into the top of the wire 30 seconds after the page opens. Leave off for none.",
      collapsible: true,
      optional: true,
    }),
  },
  fixture: () => ({ items: newsItems, incoming: incomingNewsItem }),
});
