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
import { DarkPanel, Subtitle, bigTitle } from "./ui";

/* "On the Horizon" — forward signals per competitor. Static. */

const statusDot: Record<HorizonStatus, string> = {
  hot: "bg-red",
  warm: "bg-blue",
  watch: "bg-green",
};

const kindChip: Record<HorizonKind, string> = {
  Investment: "bg-orange/15 text-orange",
  "R&D": "bg-green/15 text-green",
  Hiring: "bg-blue/15 text-blue",
};

function EventCard({ event }: { event: HorizonEvent }) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${kindChip[event.kind]}`}
        >
          {event.kind}
        </span>
        <span className="text-[11px] text-white/45">{event.date}</span>
        <span
          role="img"
          aria-label={`Status: ${event.status}`}
          className={`ml-auto h-2 w-2 rounded-full ${statusDot[event.status]}`}
        />
      </div>
      <h5 className="mt-2.5 text-sm font-bold leading-snug text-white">{event.headline}</h5>
      <p className="mt-1 text-xs leading-relaxed text-white/60">{event.detail}</p>
      <p className="mt-1.5 text-[11px] text-white/35">Source: {event.source}</p>
      {event.implies && (
        <div className="mt-3 border-l-2 border-orange pl-3">
          <p className="text-[11px] font-semibold text-orange">Implies</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/70">{event.implies}</p>
        </div>
      )}
    </article>
  );
}

function BrandColumn({ column }: { column: HorizonColumn }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-3 p-4">
        <BrandMark id={column.id} size={34} />
        <div>
          <h4 className="text-sm font-semibold text-white">{column.name}</h4>
          <p className="text-[11px] text-white/45">Forward Thesis</p>
        </div>
      </div>
      <div className="mx-4 rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <p className="font-serif text-xs italic leading-relaxed text-white/75">
          {column.thesis}
        </p>
      </div>
      <div className="space-y-3 p-4">
        {column.events.map((event) => (
          <EventCard key={event.headline} event={event} />
        ))}
      </div>
    </div>
  );
}

export function Horizon({ id }: { id: string }) {
  return (
    <Module id={id} title="On the Horizon" titleClassName={bigTitle}>
      <Subtitle>
        What the competition is about to do — investments, patents, hires and deals that
        reveal the next move before the launch.
      </Subtitle>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-white/60">
        {horizonLegend.map((item, i) => (
          <span key={item.status} className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[item.status]}`} aria-hidden />
              {item.label}
            </span>
            {i < horizonLegend.length - 1 && (
              <span aria-hidden className="text-white/25">
                /
              </span>
            )}
          </span>
        ))}
      </div>

      <DarkPanel className="mt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {horizon.map((column) => (
            <BrandColumn key={column.id} column={column} />
          ))}
        </div>
      </DarkPanel>
    </Module>
  );
}
