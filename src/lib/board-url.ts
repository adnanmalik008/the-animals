/* The published address for a board. BOARD_ROOT_DOMAIN drives subdomain
   routing in production; the fallback matches the live deployment so the
   admin UI never shows a placeholder domain. */
export function boardHost(slug: string, root?: string | null): string {
  const domain = (root ?? "").trim() || "theanimals.live";
  return `${slug}.${domain}`;
}
