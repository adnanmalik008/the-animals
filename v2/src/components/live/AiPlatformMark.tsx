/* Platform marks for the AI Search Visibility table — the real logo
   assets exported from the design source. */

export type AiPlatformId = "chatgpt" | "grok" | "claude" | "gemini";

const MARKS: Record<AiPlatformId, { src: string; rounded?: boolean }> = {
  chatgpt: { src: "/assets/ai/chatgpt.png", rounded: true },
  /* the Grok mark ships on a white plate, so keep the corner radius */
  grok: { src: "/assets/ai/grok.png", rounded: true },
  claude: { src: "/assets/ai/claude.png" },
  gemini: { src: "/assets/ai/gemini.png" },
};

export function AiPlatformMark({ id, size = 22 }: { id: AiPlatformId; size?: number }) {
  const mark = MARKS[id];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mark.src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 object-contain ${mark.rounded ? "rounded-[6px]" : ""}`}
      style={{ width: size, height: size }}
    />
  );
}
