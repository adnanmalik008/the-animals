import type { NewsSource } from "@/data/board";

/* Text wordmarks standing in for publisher logo images.
   Swap for real logo assets exported from Figma when available. */
const styles: Record<NewsSource, string> = {
  Bloomberg: "font-sans font-extrabold tracking-tight",
  "The New York Times": "font-serif font-bold tracking-tight",
  CNN: "font-sans font-black tracking-tighter text-red",
  MSN: "font-sans font-bold italic",
  "New York Post": "font-serif font-black uppercase tracking-tight",
  CNBC: "font-sans font-bold tracking-wide",
};

export function SourceMark({ source, className = "" }: { source: NewsSource; className?: string }) {
  return <span className={`text-sm leading-none ${styles[source]} ${className}`}>{source}</span>;
}
