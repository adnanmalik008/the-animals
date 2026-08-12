import Link from "next/link";
import { listBoards } from "@/lib/server/boards";
import { NewBoardForm } from "./ui";

export default async function AdminHome() {
  const boards = await listBoards();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Boards</h1>
        <p className="mt-1 text-sm text-graphite">
          One board per client. The slug becomes the client&apos;s subdomain and login scope.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((b) => (
          <li key={b.id}>
            <Link
              href={`/admin/${b.slug}`}
              className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-lg font-bold">{b.clientName}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    b.isProtected ? "bg-green/10 text-green" : "bg-bg2 text-graphite"
                  }`}
                >
                  {b.isProtected ? "Protected" : "Open"}
                </span>
              </div>
              <span className="text-sm text-graphite">{b.slug}.yourdomain.com</span>
              <span className="mt-auto line-clamp-2 text-xs text-graphite/80">{b.briefQuestion || "No brief question yet."}</span>
            </Link>
          </li>
        ))}
      </ul>

      <NewBoardForm />
    </div>
  );
}
