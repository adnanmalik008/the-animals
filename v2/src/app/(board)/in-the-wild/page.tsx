import { WildCamCard } from "@/components/wild/WildCamCard";
import { requireBoardAccess } from "@/lib/server/guard";
import { getBoardDocs } from "@/lib/server/docs";

export default async function InTheWildPage() {
  const board = await requireBoardAccess("/in-the-wild");
  const { docs } = await getBoardDocs(board.id);
  const { cams, volume } = docs["wild-cams"];

  return (
    <main className="watermark-bg mx-auto min-h-full w-full max-w-[1560px] flex-1 px-4 py-8 sm:px-8">
      {/* Editorial header */}
      <header className="border-b border-line pb-6">
        <p className="flex items-center gap-3 font-serif text-sm text-graphite">
          <span className="inline-block h-px w-8 bg-graphite/50" aria-hidden />
          № 01 · Live Feeds
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 className="font-sans text-5xl font-black uppercase tracking-tight sm:text-6xl">
            In the Wild
          </h1>
          <p className="font-serif text-base text-graphite">{volume}</p>
        </div>
      </header>

      {/* Mobile keeps reading order; desktop uses two independent editorial columns. */}
      <div className="flex flex-col gap-8 pt-8 lg:hidden">
        {cams.map((cam, i) => (
          <WildCamCard key={cam.id} cam={cam} index={i} />
        ))}
      </div>
      <div className="hidden grid-cols-2 gap-8 pt-8 lg:grid">
        <div className="flex flex-col gap-8">
          {cams.map((cam, i) =>
            i % 2 === 0 ? <WildCamCard key={cam.id} cam={cam} index={i} /> : null
          )}
        </div>
        <div className="flex flex-col gap-8">
          {cams.map((cam, i) =>
            i % 2 === 1 ? <WildCamCard key={cam.id} cam={cam} index={i} /> : null
          )}
        </div>
      </div>
    </main>
  );
}
