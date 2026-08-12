import type { NewsSource } from "@/data/board";

/* Publisher marks: real icon assets where we have them (from the
   theanimals.live asset library), styled text wordmarks otherwise. */
const styles: Record<NewsSource, string> = {
  Bloomberg: "font-sans font-extrabold tracking-tight",
  "The New York Times": "font-serif font-bold tracking-tight",
  CNN: "font-sans font-black tracking-tighter text-red",
  MSN: "font-sans font-bold italic",
  "New York Post": "font-serif font-black uppercase tracking-tight",
  CNBC: "font-sans font-bold tracking-wide",
};

const icons: Partial<Record<NewsSource, string>> = {
  "The New York Times": "/assets/source-logos/nytimes.png",
  "New York Post": "/assets/source-logos/ny-post.png",
};

export function SourceMark({ source, className = "" }: { source: NewsSource; className?: string }) {
  const icon = icons[source];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm leading-none ${styles[source]} ${className}`}>
      {icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" aria-hidden className="h-4 w-4 rounded-[3px]" />
      )}
      {source}
    </span>
  );
}
