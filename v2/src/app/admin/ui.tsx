"use client";

import { useActionState, useMemo, useState } from "react";
import type { BoardRecord, BoardUserRecord } from "@/lib/server/boards";
import {
  addUserAction,
  createBoardAction,
  removeUserAction,
  saveModuleAction,
  updateBoardAction,
  type ActionState,
} from "./actions";

const input =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-graphite/60 outline-none focus-visible:ring-2 focus-visible:ring-orange/70";
const label = "flex flex-col gap-1.5 text-sm font-medium";
const primaryBtn =
  "rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70";
const card = "rounded-2xl border border-line bg-card p-6 shadow-sm";

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-lg bg-red/10 px-3 py-2 text-sm text-red">
        {state.error}
      </p>
    );
  if (state.ok) return <p className="text-sm text-green">Saved.</p>;
  return null;
}

/* ---------------- new board ---------------- */

export function NewBoardForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createBoardAction, {});
  return (
    <form action={action} className={`${card} flex max-w-xl flex-col gap-3`}>
      <h2 className="text-lg font-bold">New board</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={label}>
          Client name
          <input name="clientName" required placeholder="adidas" className={input} />
        </label>
        <label className={label}>
          Slug (subdomain)
          <input
            name="slug"
            required
            placeholder="adidas"
            pattern="[a-z0-9]([a-z0-9-]{0,46}[a-z0-9])?"
            className={input}
          />
        </label>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={`${primaryBtn} self-start`}>
        {pending ? "Creating…" : "Create board"}
      </button>
    </form>
  );
}

/* ---------------- board meta ---------------- */

export function BoardMetaForm({ board }: { board: BoardRecord }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateBoardAction, {});
  return (
    <form action={action} className={`${card} flex flex-col gap-3`}>
      <input type="hidden" name="slug" value={board.slug} />
      <h2 className="text-lg font-bold">Board settings</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={label}>
          Client name
          <input name="clientName" defaultValue={board.clientName} className={input} />
        </label>
        <label className={label}>
          Brief date
          <input name="briefDate" defaultValue={board.briefDate} placeholder="9th June 2026" className={input} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Brief question (scrolls in the header)
          <textarea name="briefQuestion" defaultValue={board.briefQuestion} rows={2} className={input} />
        </label>
        <label className={label}>
          Progress %
          <input
            name="progressPct"
            type="number"
            min={0}
            max={100}
            defaultValue={board.progressPct}
            className={input}
          />
        </label>
        <label className={label}>
          Displayed user name
          <input name="userDisplayName" defaultValue={board.userDisplayName} placeholder="R Basckin" className={input} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isProtected"
          defaultChecked={board.isProtected}
          className="h-4 w-4 accent-[var(--orange)]"
        />
        Password-protect this board
      </label>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={`${primaryBtn} self-start`}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

/* ---------------- module content (JSON with templates) ---------------- */

export function ModuleEditor({
  board,
  moduleKeys,
  existing,
  templates,
}: {
  board: BoardRecord;
  moduleKeys: string[];
  existing: Record<string, unknown>;
  templates: Record<string, unknown>;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveModuleAction, {});
  const [key, setKey] = useState(moduleKeys[0] ?? "newswire");

  const currentJson = useMemo(() => {
    const value = existing[key] ?? templates[key] ?? {};
    return JSON.stringify(value, null, 2);
  }, [key, existing, templates]);

  return (
    <form action={action} className={`${card} flex flex-col gap-3`}>
      <input type="hidden" name="slug" value={board.slug} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Module content</h2>
        <span className="text-xs text-graphite">
          {existing[key] !== undefined ? "Custom content saved for this board" : "Showing default template"}
        </span>
      </div>
      <label className={label}>
        Module
        <select
          name="moduleKey"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className={input}
        >
          {moduleKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Content (JSON)
        <textarea
          key={key}
          name="json"
          defaultValue={currentJson}
          rows={16}
          spellCheck={false}
          className={`${input} font-mono text-xs leading-relaxed`}
        />
      </label>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={`${primaryBtn} self-start`}>
        {pending ? "Saving…" : "Save module"}
      </button>
    </form>
  );
}

/* ---------------- credentials ---------------- */

export function UsersManager({
  board,
  users,
}: {
  board: BoardRecord;
  users: BoardUserRecord[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addUserAction, {});
  return (
    <div className={`${card} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-bold">Client logins</h2>
        <p className="mt-1 text-sm text-graphite">
          Up to three credential sets to start — each unlocks only this board.
        </p>
      </div>

      {users.length > 0 ? (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="font-medium">{u.username}</span>
              <span className="ml-auto text-xs text-graphite">{u.role}</span>
              <form action={removeUserAction}>
                <input type="hidden" name="userId" value={u.id} />
                <input type="hidden" name="slug" value={board.slug} />
                <button
                  type="submit"
                  className="rounded-full border border-line px-3 py-1 text-xs text-graphite transition-colors hover:bg-red/10 hover:text-red"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-bg2 px-4 py-3 text-sm text-graphite">No client logins yet.</p>
      )}

      <form action={action} className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end">
        <input type="hidden" name="slug" value={board.slug} />
        <label className={`${label} flex-1`}>
          Username
          <input name="username" required className={input} />
        </label>
        <label className={`${label} flex-1`}>
          Password (min 8 chars)
          <input name="password" type="text" required minLength={8} className={input} />
        </label>
        <button type="submit" disabled={pending || users.length >= 10} className={primaryBtn}>
          {pending ? "Adding…" : "Add login"}
        </button>
      </form>
      <Feedback state={state} />
    </div>
  );
}
