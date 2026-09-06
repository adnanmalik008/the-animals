import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/guard";
import { isCmsConfigured } from "@/lib/server/supabase";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Admin — The Animals",
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  const configured = isCmsConfigured();

  return (
    <div className="flex-1 bg-bg">
      <div className="border-b border-line bg-bg3 text-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-bold tracking-tight hover:text-orange">
              Board CMS
            </Link>
            {!configured && (
              <span className="rounded-full bg-yellow/20 px-2.5 py-0.5 text-xs text-yellow">
                Supabase not configured — read-only preview
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <span>
              {session.username} · {session.role}
            </span>
            <Link href="/" className="hover:text-white">
              View board ↗
            </Link>
            <form action={logout}>
              <button type="submit" className="rounded-full border border-white/25 px-3 py-1 hover:bg-white/10">
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
