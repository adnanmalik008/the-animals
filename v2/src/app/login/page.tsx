import type { Metadata } from "next";
import { getCurrentBoard } from "@/lib/server/boards";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in — The Animals",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const board = await getCurrentBoard();
  const next = typeof params.next === "string" ? params.next : "/";
  const adminHint = params.admin === "1";

  return (
    <main className="flex flex-1 items-center justify-center bg-bg px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-card p-8 shadow-xl">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-graphite">
          {adminHint ? "The Animals — team access" : `${board.clientName} board`}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
          {adminHint ? "Admin login" : "Client access"}
        </h1>
        <p className="mt-2 text-sm text-graphite">
          {adminHint
            ? "Sign in to manage boards and content."
            : "Enter the credentials The Animals shared with you."}
        </p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
