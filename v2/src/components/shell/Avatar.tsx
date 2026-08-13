/* Profile pictures — real portrait photography from the design source,
   served from /assets/headshots. A name maps deterministically onto a
   headshot so the same person keeps the same face everywhere; `tone`
   (kept from the old SVG avatars) pins a specific portrait when a
   module wants a stable, curated pick. */

const HEADSHOTS = [
  "h01.jpg", "h02.jpg", "h03.jpg", "h04.jpg", "h05.jpg",
  "h06.jpg", "h07.jpg", "h08.jpg", "h09.jpg", "h10.jpg",
  "h11.jpg", "h12.jpg", "h13.jpg", "h14.jpg", "h15.jpg",
  "h16.jpg", "h17.jpg", "h18.jpg", "h19.jpg", "h20.jpg",
];

export type AvatarTone = "ember" | "ocean" | "moss" | "violet" | "sun" | "slate";

/* each tone pins a distinct portrait, so curated rows never collide */
const TONE_PICK: Record<AvatarTone, number> = {
  ember: 2,
  ocean: 6,
  moss: 7,
  violet: 10,
  sun: 18,
  slate: 14,
};

function indexFor(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum = (sum * 31 + name.charCodeAt(i)) >>> 0;
  return sum % HEADSHOTS.length;
}

/** Deterministic tone from a name — kept for callers that branch on it. */
export function toneFor(name: string): AvatarTone {
  const keys = Object.keys(TONE_PICK) as AvatarTone[];
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return keys[sum % keys.length];
}

export function Avatar({
  name,
  tone,
  pick,
  size = 36,
  className = "",
}: {
  name: string;
  tone?: AvatarTone;
  /** explicit portrait index, for rows curated to exact faces */
  pick?: number;
  size?: number;
  className?: string;
}) {
  const file =
    HEADSHOTS[pick !== undefined ? pick % HEADSHOTS.length : tone ? TONE_PICK[tone] : indexFor(name)];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/assets/headshots/${file}`}
      alt={name}
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 rounded-full bg-bg2 object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
