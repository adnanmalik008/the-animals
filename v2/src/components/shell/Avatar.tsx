/* Profile pictures. Drawn as SVG portraits so every board ships with
   real faces without depending on remote image hosts; a board can
   override any of them with a photo URL from the CMS later. */

export type AvatarTone = "ember" | "ocean" | "moss" | "violet" | "sun" | "slate";

const TONES: Record<AvatarTone, { bg: string; skin: string; hair: string; shirt: string }> = {
  ember: { bg: "#FFE2D3", skin: "#C98460", hair: "#3A2016", shirt: "#FF4500" },
  ocean: { bg: "#D8E8FB", skin: "#E8B999", hair: "#22333F", shirt: "#258CED" },
  moss: { bg: "#DCEFE1", skin: "#8D5A3B", hair: "#171310", shirt: "#00B67A" },
  violet: { bg: "#E6E1F5", skin: "#F0C9AE", hair: "#5B3A6B", shirt: "#988BAC" },
  sun: { bg: "#FDEBC8", skin: "#A9673F", hair: "#2B1B12", shirt: "#FABD05" },
  slate: { bg: "#E4E6EA", skin: "#DFA981", hair: "#4D4D4D", shirt: "#4D4D4D" },
};

/** Deterministic tone from a name, so the same person keeps the same face. */
export function toneFor(name: string): AvatarTone {
  const keys = Object.keys(TONES) as AvatarTone[];
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return keys[sum % keys.length];
}

export function Avatar({
  name,
  tone,
  size = 36,
  className = "",
}: {
  name: string;
  tone?: AvatarTone;
  size?: number;
  className?: string;
}) {
  const t = TONES[tone ?? toneFor(name)];
  const id = name.replace(/\W+/g, "-").toLowerCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={name}
      className={`shrink-0 rounded-full ${className}`}
    >
      <defs>
        <clipPath id={`clip-${id}`}>
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <rect width="40" height="40" fill={t.bg} />
        {/* shoulders */}
        <path d="M4 40c0-7.6 7.2-11.4 16-11.4S36 32.4 36 40Z" fill={t.shirt} />
        {/* neck + head */}
        <rect x="17" y="21" width="6" height="7" rx="3" fill={t.skin} />
        <circle cx="20" cy="16.5" r="7.4" fill={t.skin} />
        {/* hair */}
        <path
          d="M12.6 16.2c0-4.6 3.3-7.7 7.4-7.7s7.4 3.1 7.4 7.7c0 .8-.1 1.5-.3 2.2-.5-2.6-1.6-3.9-3.1-4.4-1.4-.5-3-.4-4.7-.2-1.9.2-3.4.9-4.2 2.6-.3.6-.4 1.3-.5 2-.1-.7-.2-1.4 0-2.2Z"
          fill={t.hair}
        />
      </g>
    </svg>
  );
}
