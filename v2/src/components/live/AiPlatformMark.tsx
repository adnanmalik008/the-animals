/* Platform marks for the AI Search Visibility table.
   Drawn as inline SVG so they stay crisp and need no network fetch. */

export type AiPlatformId = "chatgpt" | "grok" | "claude" | "gemini";

export function AiPlatformMark({ id, size = 22 }: { id: AiPlatformId; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true } as const;

  switch (id) {
    case "chatgpt":
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="7" fill="#0FA47F" />
          <path
            d="M17.6 11.05a3.35 3.35 0 0 0-.29-2.76 3.4 3.4 0 0 0-3.66-1.62A3.36 3.36 0 0 0 8.1 7.79a3.36 3.36 0 0 0-2.24 1.63 3.38 3.38 0 0 0 .42 3.96 3.35 3.35 0 0 0 .29 2.76 3.4 3.4 0 0 0 3.66 1.62 3.36 3.36 0 0 0 5.55-1.12 3.36 3.36 0 0 0 2.24-1.63 3.38 3.38 0 0 0-.42-3.96Zm-5.06 7.03a2.5 2.5 0 0 1-1.6-.58l.08-.05 2.66-1.53a.43.43 0 0 0 .22-.38v-3.74l1.12.65a.04.04 0 0 1 .02.03v3.1a2.51 2.51 0 0 1-2.5 2.5Zm-5.37-2.29a2.49 2.49 0 0 1-.3-1.67l.08.05 2.66 1.53c.14.08.3.08.44 0l3.25-1.87v1.29a.04.04 0 0 1-.02.04l-2.69 1.55a2.51 2.51 0 0 1-3.42-.92Zm-.7-5.78a2.5 2.5 0 0 1 1.3-1.1v3.16c0 .16.08.3.22.38l3.24 1.87-1.12.65a.04.04 0 0 1-.04 0l-2.69-1.55a2.51 2.51 0 0 1-.91-3.41Zm9.24 2.15-3.25-1.88 1.12-.64a.04.04 0 0 1 .04 0l2.69 1.55a2.5 2.5 0 0 1-.39 4.51v-3.16a.43.43 0 0 0-.21-.38Zm1.11-1.68-.08-.05-2.65-1.54a.43.43 0 0 0-.44 0L10.4 10.76V9.47a.04.04 0 0 1 .02-.04l2.69-1.55a2.5 2.5 0 0 1 3.71 2.59ZM9.79 12.6l-1.12-.65a.04.04 0 0 1-.02-.03v-3.1a2.5 2.5 0 0 1 4.1-1.92l-.08.05-2.66 1.53a.43.43 0 0 0-.22.38v3.74Zm.61-1.31L11.85 10.45l1.45.84v1.67l-1.45.84-1.45-.84v-1.67Z"
            fill="#fff"
          />
        </svg>
      );

    case "grok":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6.6 17.4 17.4 6.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case "claude":
      return (
        <svg {...common} fill="none" stroke="#D97757" strokeWidth="1.9" strokeLinecap="round">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            const r1 = 2.4;
            const r2 = 8.4;
            return (
              <line
                key={i}
                x1={12 + Math.cos(a) * r1}
                y1={12 + Math.sin(a) * r1}
                x2={12 + Math.cos(a) * r2}
                y2={12 + Math.sin(a) * r2}
              />
            );
          })}
        </svg>
      );

    case "gemini":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="gemini-mark" x1="3" y1="20" x2="21" y2="4" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1C7DFF" />
              <stop offset="0.52" stopColor="#8A5CF6" />
              <stop offset="1" stopColor="#F0567A" />
            </linearGradient>
          </defs>
          <path
            d="M12 2.5c.3 4.2 3.3 7.3 7.5 7.5v4c-4.2.3-7.2 3.3-7.5 7.5h-4c-.3-4.2-3.3-7.2-7.5-7.5v-4c4.2-.2 7.2-3.3 7.5-7.5h4Z"
            transform="translate(2 0) scale(0.83)"
            fill="url(#gemini-mark)"
          />
        </svg>
      );
  }
}
