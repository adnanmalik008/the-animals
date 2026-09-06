import { defineModule, f } from "../spec";
import { newsletterItems } from "@/data/live-extra";

/* The open send prints the quote inside its own quote marks. */
const NOT_QUOTED = /^[^"'“«][\s\S]*[^"'”»]$/;
const NOT_QUOTED_HINT = "Without quote marks — the send adds them";

export const inTheirInbox = defineModule({
  key: "in-their-inbox",
  tab: "live",
  column: "editorial",
  order: 5,
  label: "In Their Inbox",
  heading: { eyebrow: "Bulletin", title: "In Their Inbox" },
  boardPath: "/",
  fields: {
    sends: f.list({
      label: "Sends",
      help: "The first is open when the board loads.",
      min: 1,
      max: 12,
      summary: "name",
      idPrefix: "nl",
      item: f.object({
        fields: {
          id: f.id(),
          name: f.text({ label: "Newsletter", maxLength: 60 }),
          authors: f.text({ label: "Written by", maxLength: 80 }),
          /* Both carry their own unit because the design prints them bare,
             on either side of one line. */
          subs: f.text({ label: "Subscribers", help: "With the word: 78K subs", maxLength: 20 }),
          openRate: f.text({ label: "Open rate", help: "With the word: 58% open", maxLength: 20 }),
          subject: f.text({ label: "Subject line", help: "The 'Subject:' label is printed for you.", maxLength: 160 }),
          timeAgo: f.text({ label: "Time label", help: "Free text, printed as typed: 4d ago", maxLength: 24 }),
          quote: f.textarea({
            label: "The line worth reading",
            help: "Shown when the send is opened.",
            rows: 3,
            maxLength: 400,
            pattern: NOT_QUOTED,
            patternHint: NOT_QUOTED_HINT,
          }),
          tag: f.text({ label: "Framing tag", help: "The orange line under the quote, e.g. Brand as media", maxLength: 40 }),
        },
      }),
    }),
  },
  fixture: () => ({ sends: newsletterItems }),
});
