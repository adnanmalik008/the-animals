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
        /* A real zone, not a fixed offset, so the clock follows the
           client's summer time instead of drifting an hour every spring.
           Europe/Paris is therefore GMT+2 for half the year while the
           label below still reads GMT+1 — the label is free text on
           purpose, so an agency that wants the offset frozen can pin the
           zone to Etc/GMT-1 instead. */
        timeZone: f.text({
          label: "Time zone",
          help: "An IANA zone name — Europe/Paris, America/New_York, Asia/Tokyo. The clock keeps this zone whatever the viewer's own.",
          default: "Europe/Paris",
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
    clock: { timeZone: "Europe/Paris", label: "GMT+1" },
  }),
});
