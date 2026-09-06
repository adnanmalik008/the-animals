/* The board's clock, exercised through the same helper the component uses.

   Every assertion pins a fixed UTC instant against a fixed expected string,
   so none of them can pass by coincidence on a machine that happens to sit
   at UTC+1 — which is exactly the machine this repo is developed on. */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { byKey } from "@/lib/cms/registry";
import { FALLBACK_TIME_ZONE, LiveClock, formatClock } from "@/components/shell/LiveClock";

const JAN_NOON_UTC = new Date("2026-01-15T12:00:00Z");
const JUL_NOON_UTC = new Date("2026-07-15T12:00:00Z");

describe("formatClock", () => {
  it("prints a 24-hour clock in the zone it is given, not the viewer's", () => {
    expect(formatClock("Etc/GMT-1", JAN_NOON_UTC)).toBe("13:00:00");
    expect(formatClock("Asia/Tokyo", JAN_NOON_UTC)).toBe("21:00:00");
    expect(formatClock("UTC", JAN_NOON_UTC)).toBe("12:00:00");
    /* `hour12: false` has to mean h23, not h24: midnight prints 00, never 24 */
    expect(formatClock("UTC", new Date("2026-01-15T00:00:00Z"))).toBe("00:00:00");
  });

  /* The zone is a free-text field — an IANA name cannot be checked by a
     regex, so "Europe/Pars" saves cleanly and only fails here. Falling back
     to the viewer's own zone would put a Tokyo client and a Berlin editor
     on different times under one fixed GMT+1 label: the same label/time
     divergence the fixed default zone was chosen to eliminate, only silent
     and data-triggered instead of seasonal. */
  it("falls back to the shipped zone, never the viewer's, when the zone is unusable", () => {
    for (const bad of ["Europe/Pars", "Mars/Phobos", "GMT+1", ""]) {
      expect(formatClock(bad, JAN_NOON_UTC)).toBe(formatClock(FALLBACK_TIME_ZONE, JAN_NOON_UTC));
      expect(formatClock(bad, JAN_NOON_UTC)).toBe("13:00:00");
      expect(formatClock(bad, JUL_NOON_UTC)).toBe("13:00:00");
    }
  });

  /* The label beside the clock is fixed text, so a shipped zone that moved
     with summer time would read an hour off its own GMT+1 label for half
     of every year. Same UTC instant in January and July, same wall clock. */
  it("the shipped zone does not move with summer time", () => {
    const { timeZone } = byKey("board-header").fixture().clock;
    expect(formatClock(timeZone, JAN_NOON_UTC)).toBe("13:00:00");
    expect(formatClock(timeZone, JUL_NOON_UTC)).toBe("13:00:00");
  });

  /* LiveClock cannot import the registry — that reaches zod, which stays
     out of the board bundle — so the default is written twice. This is what
     stops the copies drifting. */
  it("uses the same zone the board-header field defaults to", () => {
    expect(byKey("board-header").fields.clock.fields.timeZone.default).toBe(FALLBACK_TIME_ZONE);
    expect(byKey("board-header").fixture().clock.timeZone).toBe(FALLBACK_TIME_ZONE);
  });
});

describe("LiveClock", () => {
  /* No jsdom here, but the server render still runs the component: effects
     do not fire, which is the pre-hydration frame the markup has to match. */
  it("renders the label as given and holds the box with a placeholder", () => {
    const html = renderToStaticMarkup(
      createElement(LiveClock, { timeZone: "Asia/Tokyo", label: "JST" })
    );
    expect(html).toContain("JST");
    expect(html).toContain("--:--:--");
    expect(html).not.toContain("GMT+1");
  });
});
