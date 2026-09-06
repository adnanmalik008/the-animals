/* Platform marks for the AI Search Visibility table — the real logo
   assets exported from the design source. */

import type { ModuleDocs } from "@/lib/cms/types";

/* Derived from the module's own `platforms` options, so a platform added
   to the CMS without a mark and a name here stops compiling. The import is
   type-only — `@/lib/cms/types` carries no runtime code, and the registry
   (with its zod) stays out of the board's bundle. */
export type AiPlatformId = ModuleDocs["ai-visibility"]["platforms"][number]["id"];

/* The name printed beside the mark. It lives here rather than in the
   document for the same reason the logo does: it is a brand's own
   spelling, not a value the client owns. `ai-visibility`'s platform
   options are the tie — a value added to one without the other stops
   compiling. */
export const AI_PLATFORM_NAME: Record<AiPlatformId, string> = {
  chatgpt: "ChatGPT",
  grok: "Grok",
  claude: "Claude",
  gemini: "Gemini",
};

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
