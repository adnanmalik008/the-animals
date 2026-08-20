import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in — The Animals",
};

/* The Sighting — a magazine cover split in two: the orange slab
   announces the issue, the white page asks one thing. */

function Ticker({ items }: { items: string[] }) {
  const line = items.join("   ·   ") + "   ·   ";
  return (
    <div
      aria-hidden
      className="overflow-hidden bg-ink py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85"
    >
      <div className="marquee-track">
        <span className="pr-4">{line}</span>
        <span className="pr-4">{line}</span>
      </div>
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const adminHint = params.admin === "1";

  return (
    <main className="grid min-h-screen bg-card lg:grid-cols-[44%_1fr]">
      {/* orange slab */}
      <section className="relative flex min-w-0 flex-col justify-between overflow-hidden bg-orange px-7 py-8 text-white lg:px-12 lg:py-10">
        {/* oversized issue number bleeding off the slab */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-6 select-none font-serif text-[16rem] font-bold leading-none text-white/15 lg:text-[22rem]"
        >
          01
        </span>

        <div className="flex items-center justify-between gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo/animals-logo-white.png"
            alt="The Animals"
            width={73}
            height={40}
            className="h-10 w-auto"
          />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">
            Field access · Vol I
          </span>
        </div>

        <blockquote className="relative max-w-md py-14 lg:py-0">
          <span aria-hidden className="font-serif text-7xl leading-none text-white/40">
            «
          </span>
          <p className="-mt-4 font-serif text-3xl font-semibold italic leading-tight lg:text-4xl">
            Culture doesn&apos;t announce itself. Someone has to be in the room.
          </p>
          <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
            The Animals · field notes
          </p>
        </blockquote>

        <div className="hidden lg:block" />
      </section>

      {/* the page */}
      <section className="relative flex min-w-0 flex-col">
        <Ticker
          items={[
            "The Animals",
            "private wire",
            "authorized eyes only",
            "Dispatch No. 00",
          ]}
        />
        <div className="flex flex-1 items-center justify-center px-6 py-14 lg:px-16">
          <div className="relative w-full max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/stickers/sticker-red.png"
              alt=""
              aria-hidden
              className="absolute -right-2 -top-8 h-10 w-10 rotate-12 drop-shadow-sm"
            />
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-graphite">
              {adminHint ? "Team access · The Animals" : "The Animals · private board"}
            </p>
            <h1 className="mt-3 font-serif text-5xl font-semibold leading-[0.95] tracking-tight lg:text-6xl">
              Step into the room.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-graphite">
              {adminHint
                ? "Sign in to run the boards."
                : "Everything the field has seen this week is behind this page."}
            </p>

            <LoginForm next={next} />
          </div>
        </div>
      </section>
    </main>
  );
}
