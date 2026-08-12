"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-graphite/60 outline-none focus-visible:ring-2 focus-visible:ring-orange/70";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Username
        <input
          name="username"
          autoComplete="username"
          required
          placeholder="username"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red/10 px-3 py-2 text-sm text-red">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
