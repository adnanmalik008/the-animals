/* The chrome every tab carries: the client's logo in the brand bar, the
   agency faces beside the signed-in user in the nav, and the clock. */

import { defineModule, f } from "../spec";

export const boardHeader = defineModule({
  key: "board-header",
  tab: "header",
  order: 1,
  label: "Board header",
  heading: { title: "Board header" },
  boardPath: "/",
  fields: {
    logoUrl: f.image({
      label: "Client logo",
      help: "Sits left of the brief in the brand bar. Without one the client's name prints as a lowercase wordmark.",
      optional: true,
      aspect: "16/9",
      alt: "logoAlt",
    }),
    logoAlt: f.text({
      label: "Logo alt text",
      help: "What a screen reader says in place of the logo. Defaults to the client's name.",
      optional: true,
      maxLength: 80,
    }),
    userAvatarUrl: f.image({
      label: "Signed-in user's picture",
      help: "Top right of the nav. Without one a stock headshot is used.",
      optional: true,
    }),
    moderators: f.list({
      label: "Moderators",
      help: "The agency faces shown beside the signed-in user. Up to two — the nav has room for no more.",
      max: 2,
      summary: "name",
      idPrefix: "mod",
      item: f.object({
        fields: {
          id: f.id(),
          name: f.text({ label: "Name", maxLength: 60 }),
          avatarUrl: f.image({
            label: "Picture",
            help: "Without one a stock headshot is used.",
            optional: true,
          }),
        },
      }),
    }),
    clock: f.object({
      label: "Clock",
      fields: {
        /* The default has to be a *fixed* offset, because the label beside
           it is fixed text rather than something derived from the zone.
           The clock this replaced simply added 60 minutes all year, so a
           city zone as the default — Europe/Paris is UTC+2 every summer —
           would leave the shipped board reading an hour off its own GMT+1
           label for half the year. Etc/GMT-1 never observes summer time
           and is UTC+1: the sign is inverted by the POSIX convention these
           zone names follow, so it reads backwards on purpose.

           A client who wants a city's real local time sets the zone and
           the label together — that is what an IANA field is for, and it
           stays available here. */
        timeZone: f.text({
          label: "Time zone",
          help: "An IANA zone name — Europe/Paris, America/New_York, Asia/Tokyo. The clock keeps this zone whatever the viewer's own. Change the label to match: it is not derived from the zone, and a city zone moves with summer time.",
          default: "Etc/GMT-1",
          maxLength: 60,
        }),
        label: f.text({
          label: "Label",
          help: "Printed above the time. Free text: it is not derived from the zone.",
          default: "GMT+1",
          maxLength: 12,
        }),
      },
    }),
  },
  /* `logoUrl` is deliberately absent. The fixture is what every board with
     nothing saved renders, so a logo here would hang adidas's mark over
     every new client's brief. The adidas PNG survives instead as a
     name-matched legacy branch inside BrandBar. */
  fixture: () => ({
    moderators: [
      { id: "mod-1", name: "Amara Osei" },
      { id: "mod-2", name: "Jonas Keller" },
    ],
    clock: { timeZone: "Etc/GMT-1", label: "GMT+1" },
  }),
});
