/* Every route that can render on its own guards itself.

   A React Server Component request renders the segments the router asks
   for, which is not always a layout together with its page. A guard placed
   at only one of the two levels therefore leaves the other reachable:

   • The board's guard lived only in the pages, while the layout was what
     fetched the board and every content document — so
     `curl -H 'RSC: 1' <board>/anomalies?_rsc` returned 200 with the
     client's brief and ~50KB of content and no cookie.
   • The admin's guard lived only in the layout, so /admin, /admin/content,
     /admin/content/[key] and /admin/[slug] each rendered alone, serving the
     client roster, the briefs and the login usernames to anyone.

   Both were live before this test existed. A plain browser GET redirects
   correctly in both cases, which is exactly why neither was noticed. These
   assertions are textual because there is no request pipeline to drive
   here; they fail the moment a guard is deleted from a file that reads
   client data. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = (rel: string) => readFileSync(fileURLToPath(new URL(`../../${rel}`, import.meta.url)), "utf8");

/** Every file that renders client-facing board data. */
const BOARD_SEGMENTS = [
  "src/app/(board)/layout.tsx",
  "src/app/(board)/page.tsx",
  "src/app/(board)/anomalies/page.tsx",
  "src/app/(board)/competition/page.tsx",
  "src/app/(board)/in-the-wild/page.tsx",
];

/** Every file under the admin, layout and pages alike. */
const ADMIN_SEGMENTS = [
  "src/app/admin/layout.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/[slug]/page.tsx",
  "src/app/admin/content/page.tsx",
  "src/app/admin/content/[key]/page.tsx",
];

describe("board segments", () => {
  it.each(BOARD_SEGMENTS)("%s calls requireBoardAccess", (rel) => {
    expect(source(rel)).toMatch(/requireBoardAccess\(/);
  });

  /* The layout is the one that reads the content, so the guard must stand
     in front of the read rather than beside it. */
  it("the layout guards before it fetches anything", () => {
    const text = source("src/app/(board)/layout.tsx");
    const guard = text.indexOf("requireBoardAccess(");
    const read = text.indexOf("getContentDocs(");
    expect(guard).toBeGreaterThan(-1);
    expect(read).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(read);
  });
});

describe("admin segments", () => {
  it.each(ADMIN_SEGMENTS)("%s calls requireAdmin", (rel) => {
    expect(source(rel)).toMatch(/requireAdmin\(/);
  });
});
