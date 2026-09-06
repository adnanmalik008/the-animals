"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

/* Poster-style form: typed lines on the page, ink slab to submit. */
const labelClass =
  "flex flex-col gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-graphite";
const inputClass =
  "w-full border-0 border-b-2 border-ink bg-transparent px-0 py-2.5 font-serif text-xl text-ink placeholder:text-ink/25 outline-none focus-visible:border-orange autofill:[-webkit-box-shadow:inset_0_0_0_1000px_#ffffff] autofill:[-webkit-text-fill-color:#000]";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className={labelClass}>
        Username
        <input
          name="username"
          autoComplete="username"
          required
          placeholder="username"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
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
        <p role="alert" className="rounded-lg bg-red/15 px-3 py-2 text-sm text-red">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 self-start bg-ink px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
