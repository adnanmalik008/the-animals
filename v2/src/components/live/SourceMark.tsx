import type { NewsSource } from "@/data/board";

/* Publisher marks for the wire — the real mastheads, captured from the
   design source. Bloomberg is styled text there too, so it stays text. */

const marks: Partial<Record<NewsSource, { src: string; h: string; w: number; hPx: number }>> = {
  "The New York Times": { src: "/assets/source-logos/nyt-masthead.png", h: "h-[21px]", w: 129, hPx: 21 },
  CNN: { src: "/assets/source-logos/cnn.png", h: "h-[19px]", w: 39, hPx: 19 },
  MSN: { src: "/assets/source-logos/msn.png", h: "h-[19px]", w: 51, hPx: 19 },
  "Fox News": { src: "/assets/source-logos/fox-news.png", h: "h-[23px]", w: 24, hPx: 23 },
  "New York Post": { src: "/assets/source-logos/ny-post-wordmark.png", h: "h-[17px]", w: 115, hPx: 17 },
  CNBC: { src: "/assets/source-logos/cnbc.png", h: "h-[23px]", w: 31, hPx: 23 },
};

export function SourceMark({ source, className = "" }: { source: NewsSource; className?: string }) {
  const mark = marks[source];
  return (
    <span className={`inline-flex items-center leading-none ${className}`}>
      {mark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mark.src}
          alt={source}
          width={mark.w}
          height={mark.hPx}
          className={`w-auto ${mark.h}`}
        />
      ) : (
        <span className="font-sans text-[15px] font-extrabold tracking-[-0.02em] text-ink">
          {source}
        </span>
      )}
    </span>
  );
}
