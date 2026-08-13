import type { NewsSource } from "@/data/board";

/* Publisher marks for the wire. Real logo assets where we have them,
   typographic wordmarks (drawn to each masthead's style) otherwise. */

const icons: Partial<Record<NewsSource, string>> = {
  "The New York Times": "/assets/source-logos/nytimes.png",
  "New York Post": "/assets/source-logos/ny-post.png",
};

const wordmark: Record<NewsSource, string> = {
  Bloomberg: "font-sans text-[15px] font-extrabold tracking-[-0.02em] text-ink",
  "The New York Times": "font-serif text-sm font-bold tracking-tight",
  CNN: "font-sans text-[17px] font-black italic tracking-[-0.06em] text-red",
  MSN: "font-sans text-[15px] font-bold lowercase tracking-tight text-blue",
  "New York Post": "font-serif text-sm font-black uppercase italic tracking-tight",
  CNBC: "font-sans text-[15px] font-bold uppercase tracking-[0.08em] text-ink",
};

export function SourceMark({ source, className = "" }: { source: NewsSource; className?: string }) {
  const icon = icons[source];
  return (
    <span className={`inline-flex items-center gap-1.5 leading-none ${className}`}>
      {icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" aria-hidden className="h-4 w-4 shrink-0 rounded-[3px]" />
      )}
      <span className={wordmark[source]}>{source}</span>
    </span>
  );
}
