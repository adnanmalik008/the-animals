import { Module } from "@/components/modules/ModuleColumn";
import {
  horizon,
  horizonLegend,
  type HorizonColumn,
  type HorizonEvent,
  type HorizonKind,
  type HorizonStatus,
} from "@/data/competition";
import { BrandMark } from "./BrandMark";
import { AnimalView } from "./AnimalView";
import { Subtitle, bigTitle } from "./ui";

/* "On the Horizon" — forward signals per competitor, built to the design's
   column: the brand on a 48px plate over "Forward Thesis", the thesis in
   italic serif on a white/5 well, then one white/5 card per signal with a
   kind chip, its date, a status dot, the headline, the detail, the source
   and an orange-ruled "Implies". Static. */

/* the legend's colours: hot in orange, warm in the second blue, watch in purple */
const statusDot: Record<HorizonStatus, string> = {
  hot: "bg-orange",
  warm: "bg-blue2",
  watch: "bg-purple",
};

const kindChip: Record<HorizonKind, string> = {
  Investment: "bg-blue/10 text-blue",
  "R&D": "bg-green/10 text-green",
  Hiring: "bg-yellow/10 text-yellow",
};

function EventCard({ event }: { event: HorizonEvent }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl bg-white/5 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2 py-1 font-display text-sm ${kindChip[event.kind]}`}>{event.kind}</span>
            <span className="font-display text-sm text-white/70">{event.date}</span>
          </div>
          <span
            role="img"
            aria-label={`Status: ${event.status}`}
            className={`size-2 shrink-0 rounded-full ${statusDot[event.status]}`}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <h5 className="font-display text-xl text-white">{event.headline}</h5>
            <p className="font-display text-base leading-[1.4] text-white/70">{event.detail}</p>
          </div>
          <p className="font-display text-sm text-white/50">Source: {event.source}</p>
        </div>
      </div>
      {event.implies && (
        <div className="flex flex-col gap-[3px] rounded-xl border-l border-orange px-3 py-2">
          <p className="font-display text-base text-orange">Implies</p>
          <p className="font-display text-sm leading-[1.4] text-white">{event.implies}</p>
        </div>
      )}
    </article>
  );
}

function BrandColumn({ column }: { column: HorizonColumn }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-bg3">
      <div className="flex items-center gap-4 border-b border-white/5 p-5">
        <BrandMark id={column.id} size={48} rounded="rounded-xl" plate />
        <div className="flex flex-col gap-1">
          <h4 className="font-display text-xl font-medium text-white">{column.name}</h4>
          <p className="font-display text-base text-white/70">Forward Thesis</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
          <p className="font-serif text-sm italic leading-[1.4] text-white">{column.thesis}</p>
        </div>
        {column.events.map((event) => (
          <EventCard key={event.headline} event={event} />
        ))}
      </div>
    </div>
  );
}

export function Horizon({ id }: { id: string }) {
  return (
    <Module id={id} variant="panel" title="On the Horizon" titleClassName={bigTitle}>
      <Subtitle>
        What the competition is about to do — investments, patents, hires and deals that
        reveal the next move before the launch.
      </Subtitle>

      {/* the legend reads across in white at 18, 16px in like the design */}
      <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 font-display text-lg leading-[1.1] text-white">
        {horizonLegend.map((item, i) => (
          <span key={item.status} className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${statusDot[item.status]}`} aria-hidden />
              {item.label}
            </span>
            {i < horizonLegend.length - 1 && (
              <span aria-hidden className="text-base text-silver">
                /
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {horizon.map((column) => (
          <BrandColumn key={column.id} column={column} />
        ))}
      </div>
      <AnimalView section={id} className="mt-12" />
    </Module>
  );
}
