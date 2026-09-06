"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { BoardUserRecord } from "@/lib/server/boards";
import { card, input, label, primaryBtn, quietBtn } from "@/components/admin/form/tokens";
import { Feedback } from "./ui";
import { addTeamLoginAction, removeTeamLoginAction, type ActionState } from "./actions";

/* ---------------- team logins ----------------
   The same shape as `UsersManager`, one floor up: a client login opens one
   board, a team login opens the admin and belongs to nobody's board. That is
   the whole point — an admin's access must not disappear because a colleague
   deleted a client.

   Removal is two-step, like `DeleteBoardButton`: this is the list that can
   lock the agency out of its own CMS, so a stray click must not be enough. */

export function TeamLogins({ users }: { users: BoardUserRecord[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addTeamLoginAction, {});
  const formRef = useRef<HTMLFormElement | null>(null);
  const [draft, setDraft] = useState({ username: "", password: "" });
  const [invite, setInvite] = useState<{ username: string; password: string; adminUrl: string } | null>(
    null
  );
  const [inviteCopied, setInviteCopied] = useState(false);

  /* when a login lands, keep its credentials on screen once for the
     invite — the password is hashed after this and cannot be shown again */
  const lastOk = useRef(false);
  useEffect(() => {
    if (state.ok && !lastOk.current && draft.username) {
      /* The admin answers on every board host, so the invite quotes the
         address this admin actually used rather than a guessed one. Captured
         here, with the credentials, because it is part of what was minted. */
      setInvite({ ...draft, adminUrl: `${window.location.origin}/admin` });
      setInviteCopied(false);
      setDraft({ username: "", password: "" });
      formRef.current?.reset();
    }
    lastOk.current = !!state.ok;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const inviteText = invite
    ? `Your Animals admin login is live.\n\nAdmin: ${invite.adminUrl}\nUsername: ${invite.username}\nPassword: ${invite.password}\n\nIt opens /admin on any board address, and no board deletion can take it away.`
    : "";

  return (
    <div className={`${card} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-bold">Team logins</h2>
        <p className="mt-1 text-sm text-graphite">
          Each login opens <span className="font-mono text-ink">/admin</span> on any board host — it
          belongs to the agency, not to a board, so deleting a client never takes it away.
        </p>
      </div>

      {users.length > 0 ? (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="font-medium">{u.username}</span>
              <span className="ml-auto text-xs text-graphite">admin</span>
              <RemoveTeamLogin userId={u.id} username={u.username} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-bg2 px-4 py-3 text-sm text-graphite">
          No team logins yet — the agency shares the ADMIN_PASSWORD from the environment until one
          exists.
        </p>
      )}

      {invite && (
        <div className="flex flex-col gap-2 rounded-xl border border-green/40 bg-green/5 p-4">
          <p className="text-sm font-semibold text-ink">
            Login created — copy the invite now. The password can&apos;t be shown again.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-card px-3.5 py-3 font-mono text-xs leading-relaxed text-ink/90">
            {inviteText}
          </pre>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                navigator.clipboard?.writeText(inviteText).then(() => setInviteCopied(true))
              }
              className={primaryBtn}
            >
              {inviteCopied ? "Copied" : "Copy invite"}
            </button>
            <button type="button" onClick={() => setInvite(null)} className={quietBtn}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <form
        ref={formRef}
        action={action}
        className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end"
      >
        <label className={`${label} flex-1`}>
          Username
          <input
            name="username"
            required
            autoComplete="off"
            /* the dash is escaped, as in the slug field: HTML compiles
               `pattern` with the `v` flag, under which a bare `-` inside a
               class is a syntax error — the browser then logs it and ignores
               the attribute. The server applies the same rule either way;
               this only saves a round trip. */
            pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{1,39}"
            title="2–40 characters: letters, numbers, dot, dash or underscore"
            value={draft.username}
            onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))}
            className={input}
          />
        </label>
        <label className={`${label} flex-1`}>
          Password (min 8 chars)
          <input
            name="password"
            type="text"
            required
            minLength={8}
            autoComplete="off"
            value={draft.password}
            onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
            className={input}
          />
        </label>
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "Adding…" : "Add team login"}
        </button>
      </form>
      {state.error && <Feedback state={state} />}
    </div>
  );
}

function RemoveTeamLogin({ userId, username }: { userId: number; username: string }) {
  const [arming, setArming] = useState(false);
  useEffect(() => {
    if (!arming) return;
    const t = setTimeout(() => setArming(false), 4000);
    return () => clearTimeout(t);
  }, [arming]);

  if (!arming) {
    return (
      <button type="button" onClick={() => setArming(true)} className={quietBtn}>
        Remove…
      </button>
    );
  }
  return (
    <form action={removeTeamLoginAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <span className="text-xs text-graphite">Revokes {username}&apos;s admin access.</span>
      <button
        type="submit"
        className="rounded-full bg-red px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60"
      >
        Confirm remove
      </button>
      <button type="button" onClick={() => setArming(false)} className={quietBtn}>
        Keep it
      </button>
    </form>
  );
}
