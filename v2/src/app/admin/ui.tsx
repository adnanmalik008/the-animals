"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { BoardRecord, BoardUserRecord } from "@/lib/server/boards";
import { boardHost } from "@/lib/board-url";
import {
  addUserAction,
  createBoardAction,
  deleteBoardAction,
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
const quietBtn =
  "rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-graphite transition-colors hover:bg-bg2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70";
const card = "rounded-2xl border border-line bg-card p-6 shadow-sm";

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-lg bg-red/10 px-3 py-2 text-sm text-red">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-green">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Saved
      </p>
    );
  return null;
}

/* Step eyebrow — the three sections of a board page are a real sequence:
   identity, then content, then who gets in. */
export function StepEyebrow({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite">
      <span className="text-orange">{n}</span>
      {children}
    </p>
  );
}

/* ---------------- the publish chip ----------------
   A board's whole purpose is its URL. Everywhere a board appears, its
   live address is a first-class object: monospaced, copyable, openable. */

export function PublishChip({
  host,
  className = "",
}: {
  host: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const url = `https://${host}`;
  return (
    <span
      className={`relative z-10 inline-flex max-w-full items-stretch overflow-hidden rounded-lg border border-line bg-bg2 text-xs ${className}`}
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={`Open ${url}`}
        className="min-w-0 truncate px-2.5 py-1.5 font-mono text-ink/90 hover:bg-ink/5 hover:text-ink"
      >
        {host}
      </a>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 1600);
          });
        }}
        aria-label={`Copy ${url}`}
        className="border-l border-line px-2 text-graphite transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/70"
      >
        {copied ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-green">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        )}
      </button>
    </span>
  );
}

/* ---------------- new board ---------------- */

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function NewBoardForm({ rootDomain }: { rootDomain?: string | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createBoardAction, {});
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(name);

  return (
    <form action={action} className={`${card} flex max-w-2xl flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-bold">Publish a new board</h2>
        <p className="mt-1 text-sm text-graphite">
          The slug becomes the client&apos;s address — live the moment the board is created.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={label}>
          Client name
          <input
            name="clientName"
            required
            placeholder="Nike"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
        </label>
        <label className={label}>
          Slug
          <input
            name="slug"
            required
            placeholder="nike"
            pattern="[a-z0-9]([a-z0-9-]{0,46}[a-z0-9])?"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
            className={`${input} font-mono`}
          />
        </label>
      </div>

      <p className="flex flex-wrap items-center gap-2 rounded-xl bg-bg2 px-3.5 py-2.5 text-sm text-graphite">
        <span className="shrink-0">Publishes at</span>
        <span className="font-mono text-ink">
          https://{effectiveSlug || "…"}.{(rootDomain ?? "").trim() || "theanimals.live"}
        </span>
      </p>

      <Feedback state={state} />
      <button type="submit" disabled={pending || !effectiveSlug} className={`${primaryBtn} self-start`}>
        {pending ? "Creating…" : "Create board"}
      </button>
    </form>
  );
}

/* ---------------- delete (two-step confirm) ---------------- */

export function DeleteBoardButton({ slug, clientName }: { slug: string; clientName: string }) {
  const [arming, setArming] = useState(false);
  useEffect(() => {
    if (!arming) return;
    const t = setTimeout(() => setArming(false), 4000);
    return () => clearTimeout(t);
  }, [arming]);

  if (!arming) {
    return (
      <button type="button" onClick={() => setArming(true)} className={quietBtn}>
        Delete board…
      </button>
    );
  }
  return (
    <form action={deleteBoardAction} className="flex items-center gap-2">
      <input type="hidden" name="slug" value={slug} />
      <span className="text-xs text-graphite">Deletes {clientName} and its logins.</span>
      <button
        type="submit"
        className="rounded-full bg-red px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60"
      >
        Confirm delete
      </button>
      <button type="button" onClick={() => setArming(false)} className={quietBtn}>
        Keep it
      </button>
    </form>
  );
}

/* ---------------- board meta ---------------- */

export function BoardMetaForm({ board }: { board: BoardRecord }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateBoardAction, {});
  return (
    <form action={action} className={`${card} flex flex-col gap-4`}>
      <input type="hidden" name="slug" value={board.slug} />
      <div>
        <StepEyebrow n="01">Identity</StepEyebrow>
        <h2 className="mt-1 text-lg font-bold">Board settings</h2>
        <p className="mt-0.5 text-sm text-graphite">What the client sees in the header.</p>
      </div>
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
          Brief question
          <textarea
            name="briefQuestion"
            defaultValue={board.briefQuestion}
            rows={2}
            placeholder="The question this board answers — scrolls in the header."
            className={input}
          />
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
        Require a client login to view this board
      </label>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

/* ---------------- module content (JSON with templates) ---------------- */

function describeJson(value: unknown): string {
  if (Array.isArray(value)) return `list of ${value.length}`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      Array.isArray(v) ? `${k} (${v.length})` : k
    );
    return entries.slice(0, 6).join(", ") + (entries.length > 6 ? ", …" : "");
  }
  return typeof value;
}

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
  const [text, setText] = useState(() =>
    JSON.stringify(existing[key] ?? templates[key] ?? {}, null, 2)
  );

  const loadFor = (k: string, source: Record<string, unknown>, fallback?: Record<string, unknown>) =>
    JSON.stringify(source[k] ?? fallback?.[k] ?? {}, null, 2);

  /* validated on every keystroke — the save button never sends bad JSON */
  const parse = useMemo(() => {
    try {
      return { value: JSON.parse(text) as unknown, error: null };
    } catch (e) {
      return { value: null, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [text]);

  const isCustom = existing[key] !== undefined;

  return (
    <form action={action} className={`${card} flex flex-col gap-4`}>
      <input type="hidden" name="slug" value={board.slug} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <StepEyebrow n="02">Content</StepEyebrow>
          <h2 className="mt-1 text-lg font-bold">Module content</h2>
          <p className="mt-0.5 text-sm text-graphite">
            Each module reads one JSON document. Start from the template and replace the copy.
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isCustom ? "bg-orange/10 text-orange" : "bg-bg2 text-graphite"
          }`}
        >
          {isCustom ? "Custom content for this board" : "Default template"}
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className={`${label} min-w-56 flex-1`}>
          Module
          <select
            name="moduleKey"
            value={key}
            onChange={(e) => {
              const k = e.target.value;
              setKey(k);
              setText(loadFor(k, existing, templates));
            }}
            className={input}
          >
            {moduleKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 pb-0.5">
          <button
            type="button"
            disabled={!!parse.error}
            onClick={() => setText(JSON.stringify(parse.value, null, 2))}
            className={quietBtn}
          >
            Format
          </button>
          <button
            type="button"
            onClick={() => setText(loadFor(key, templates))}
            className={quietBtn}
          >
            Load template
          </button>
        </div>
      </div>

      <label className={label}>
        <span className="sr-only">Content (JSON)</span>
        <textarea
          name="json"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={18}
          spellCheck={false}
          aria-invalid={!!parse.error}
          className={`${input} font-mono text-xs leading-relaxed ${
            parse.error ? "border-red/60 focus-visible:ring-red/50" : ""
          }`}
        />
      </label>

      <p className={`text-xs ${parse.error ? "text-red" : "text-graphite"}`} aria-live="polite">
        {parse.error ? `Invalid JSON — ${parse.error}` : `Valid JSON · ${describeJson(parse.value)}`}
      </p>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending || !!parse.error} className={primaryBtn}>
          {pending ? "Saving…" : "Save module"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

/* ---------------- credentials ---------------- */

export function UsersManager({
  board,
  users,
  host,
}: {
  board: BoardRecord;
  users: BoardUserRecord[];
  host: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addUserAction, {});
  const formRef = useRef<HTMLFormElement | null>(null);
  const [draft, setDraft] = useState({ username: "", password: "" });
  const [invite, setInvite] = useState<{ username: string; password: string } | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  /* when a login lands, keep its credentials on screen once for the
     invite — the password is hashed after this and cannot be shown again */
  const lastOk = useRef(false);
  useEffect(() => {
    if (state.ok && !lastOk.current && draft.username) {
      setInvite({ ...draft });
      setInviteCopied(false);
      setDraft({ username: "", password: "" });
      formRef.current?.reset();
    }
    lastOk.current = !!state.ok;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const inviteText = invite
    ? `Your Animals board is live.\n\nBoard: https://${host}\nUsername: ${invite.username}\nPassword: ${invite.password}`
    : "";

  return (
    <div className={`${card} flex flex-col gap-4`}>
      <div>
        <StepEyebrow n="03">Access</StepEyebrow>
        <h2 className="mt-1 text-lg font-bold">Client logins</h2>
        <p className="mt-0.5 text-sm text-graphite">
          Each login opens <span className="font-mono text-ink">{host}</span> only.
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
        <p className="rounded-xl bg-bg2 px-4 py-3 text-sm text-graphite">
          No logins yet — the board asks for credentials, so add one before sharing the link.
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
        <input type="hidden" name="slug" value={board.slug} />
        <label className={`${label} flex-1`}>
          Username
          <input
            name="username"
            required
            autoComplete="off"
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
        <button type="submit" disabled={pending || users.length >= 10} className={primaryBtn}>
          {pending ? "Adding…" : "Add login"}
        </button>
      </form>
      {state.error && <Feedback state={state} />}
    </div>
  );
}
