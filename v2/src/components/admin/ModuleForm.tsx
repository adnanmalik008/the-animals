"use client";

/* One module, as a form — for either scope.

   Nothing here knows what a newswire is. The module's FieldSpec tree — the
   same declaration that yields its zod schema and its TypeScript type —
   generates every control, so this file is only the frame around it: the
   locked heading, the state, the footer, and the escape hatch.

   Nor does it much care whether it is editing a client's board or the
   agency's shared content. Those differ in the table a save lands in, one
   link, and one sentence; everything else — the fields, the errors, the JSON
   panel, the dirty guard — is the same surface, so it is the same component
   handed a different `scope`.

   Four things are load-bearing:

   • The heading is text, not an input. The client fixed each module's
     eyebrow and title in code; there is no control here to make editable by
     accident.
   • Validation runs client-side against `schemaFor(def)` before the action
     is allowed to fire, so a mistake is named where it happened instead of
     after a round trip. The server validates again — this is convenience,
     not trust.
   • The clean baseline moves on `state.savedAt`, not on `state.ok`. Two
     saves in a row both answer `ok: true`, so `ok` alone never changes and
     the second save would leave the form looking permanently dirty.
   • A board showing the shared copy says so, and its Reset goes back to that
     copy rather than to the built-in content — "start again" should mean the
     thing the board would show with nothing saved, which is what the shared
     default is. */

import Link from "next/link";
import { useActionState, useCallback, useMemo, useState, type FormEvent } from "react";
import { Field } from "@/components/admin/form/Field";
import { ErrorSummary, FieldAnchors } from "@/components/admin/form/ErrorSummary";
import { useDocState } from "@/components/admin/form/useDocState";
import { card, fieldError, hint, input, primaryBtn, quietBtn } from "@/components/admin/form/tokens";
import {
  directoryHref,
  directoryLabel,
  moduleHref,
  scopeSubtitle,
  type EditScope,
} from "@/components/admin/scope";
import { issuesToFieldErrors, type FieldErrors } from "@/lib/cms/parse";
import { byKey } from "@/lib/cms/registry";
import { schemaFor } from "@/lib/cms/schema";
import type { ObjectSpec } from "@/lib/cms/spec";
import { saveDefaultDocAction, saveModuleDocAction, type ActionState } from "@/app/admin/actions";
import { Feedback } from "@/app/admin/ui";
import { usePublishDirty, useLeaveGuard } from "@/components/admin/ContentNav";

/** What "Reset" puts back, and which of the two it is. */
export interface ResetTarget {
  kind: "template" | "shared";
  doc: unknown;
}

export interface ModuleFormProps {
  /** the board being edited, or the agency-wide shared content */
  scope: EditScope;
  /** a string, never the definition: definitions carry functions and RegExps */
  moduleKey: string;
  /** what is stored, or what this scope is currently showing */
  initialDoc: unknown;
  reset: ResetTarget;
  /** true when the stored doc no longer fits its definition */
  invalid?: boolean;
  /** board scope: this module has no doc of its own and is showing the shared one */
  showingShared?: boolean;
  /** false when there is nowhere to save to at all */
  canSave: boolean;
  /** a standing caveat about saving here, shown before anything is typed */
  warning?: string;
}

const LOCK = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 1 1 8 0v4" />
  </svg>
);

const RESET_LABEL: Record<ResetTarget["kind"], string> = {
  template: "Reset to template…",
  shared: "Reset to shared default…",
};

const RESET_ASK: Record<ResetTarget["kind"], string> = {
  template: "Replace everything with the built-in content?",
  shared: "Replace everything with the agency's shared content?",
};

export function ModuleForm({
  scope,
  moduleKey,
  initialDoc,
  reset: resetTarget,
  invalid = false,
  showingShared = false,
  canSave,
  warning,
}: ModuleFormProps) {
  const def = byKey(moduleKey);
  const saveAction = scope.kind === "board" ? saveModuleDocAction : saveDefaultDocAction;
  const [state, action, pending] = useActionState<ActionState, FormData>(saveAction, {});
  const { doc, dirty, set, reset } = useDocState(initialDoc);
  const guard = useLeaveGuard();
  usePublishDirty(dirty);

  /* what a Discard returns to, and when it got there: the last thing the
     database confirmed */
  const [saved, setSaved] = useState<{ at?: number; doc: unknown }>({ doc: initialDoc });
  const [showErrors, setShowErrors] = useState(invalid);
  const [arming, setArming] = useState(false);
  /* The JSON panel's own text, and the document it was typed against. Keeping
     the base is what lets the panel be live-bound without fighting the form:
     while they agree the textarea keeps its exact characters (so the caret
     does not jump and half-typed JSON survives), and the moment a field above
     moves the document on, the panel re-derives from it. */
  const [draft, setDraft] = useState<{ text: string; base: string } | null>(null);
  /* the document the last Save actually sent */
  const [sent, setSent] = useState("");

  const docJson = useMemo(() => JSON.stringify(doc) ?? "", [doc]);
  const pretty = useMemo(() => JSON.stringify(doc, null, 2) ?? "", [doc]);

  /* one object spec for the whole document, so the root gets ObjectField's
     behaviour — optional groups, and an image field rendering its sibling
     alt text beside the preview */
  const rootSpec = useMemo<ObjectSpec | null>(
    () => (def ? { kind: "object", fields: def.fields } : null),
    [def]
  );

  const localErrors = useMemo<FieldErrors>(() => {
    if (!def) return {};
    const res = schemaFor(def).safeParse(doc);
    return res.success ? {} : issuesToFieldErrors(res.error.issues);
  }, [def, doc]);

  /* the server's field errors only describe the document that was sent; once
     it has been edited they are answers to a question nobody asked any more */
  const stale = docJson !== sent;
  const errors = showErrors ? { ...(stale ? {} : (state.fieldErrors ?? {})), ...localErrors } : {};
  const errorCount = Object.keys(errors).length;

  /* The last saved response becomes the new clean baseline — the server's
     normalised doc, so the form shows what was actually stored. Updated
     during render rather than in an effect: an effect would paint one frame
     of a form that says "unsaved changes" about a save that just landed. */
  if (state.savedAt && state.savedAt !== saved.at) {
    setSaved({ at: state.savedAt, doc: state.doc });
    reset(state.doc);
    setDraft(null);
    setShowErrors(false);
  }

  const replace = useCallback((next: unknown) => set([], next), [set]);

  const showingDraft = draft !== null && draft.base === docJson;
  const jsonText = showingDraft ? draft.text : pretty;

  const parseError = useMemo(() => {
    if (!showingDraft) return null;
    try {
      JSON.parse(jsonText);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid JSON";
    }
  }, [showingDraft, jsonText]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    setShowErrors(true);
    setSent(docJson);
    if (Object.keys(localErrors).length > 0 || parseError) {
      e.preventDefault();
      document.getElementById("cms-errors")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <FieldAnchors>
      <form action={action} onSubmit={onSubmit} className="flex min-w-0 flex-col gap-5">
        {scope.kind === "board" && <input type="hidden" name="slug" value={scope.slug} />}
        <input type="hidden" name="moduleKey" value={moduleKey} />
        <input type="hidden" name="doc" value={docJson} />

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{def?.label ?? moduleKey}</h1>
              <p className={hint}>
                <span className="font-mono">{moduleKey}</span> · {scopeSubtitle(scope)}
              </p>
            </div>
            {scope.kind === "board" && (
              <a
                href={`https://${scope.host}${def?.boardPath ?? "/"}`}
                target="_blank"
                rel="noreferrer"
                className={quietBtn}
              >
                Open board ↗
              </a>
            )}
          </div>

          {def ? (
            /* fixed in code at the client's request — rendered, never bound */
            <div className="flex flex-col gap-1 rounded-xl border border-dashed border-line bg-bg2 px-4 py-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite">
                {LOCK} Fixed in code
              </span>
              {def.heading.eyebrow && (
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange">
                  {def.heading.eyebrow}
                </span>
              )}
              <span className="text-lg font-bold text-ink">{def.heading.title}</span>
              <p className={hint}>
                This module&apos;s eyebrow and title are part of the design. Everything below is yours.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 rounded-xl border border-dashed border-line bg-bg2 px-4 py-3">
              <span className="text-sm font-semibold text-ink">No form for this module yet</span>
              <p className={hint}>
                Edit it as JSON below. It saves exactly what you type — nothing checks the shape.
              </p>
            </div>
          )}

          {def?.intro && <p className="text-sm text-graphite">{def.intro}</p>}

          {scope.kind === "defaults" && (
            <p className="rounded-xl bg-green/10 px-4 py-3 text-sm text-ink">
              This is the agency&apos;s shared copy of this module. Every board that has no content of its
              own for it shows what you save here — including boards created later. A board that has its own
              content is not touched.
            </p>
          )}

          {scope.kind === "board" && showingShared && (
            <p className="rounded-xl bg-green/10 px-4 py-3 text-sm text-ink">
              This board has no content of its own here — it is showing the agency&apos;s{" "}
              <Link
                href={moduleHref({ kind: "defaults" }, moduleKey)}
                onClick={guard}
                className="font-semibold underline underline-offset-2 hover:text-orange"
              >
                shared content
              </Link>
              , loaded below. Saving gives this board its own copy and it stops following the shared one;
              the shared content itself is untouched.
            </p>
          )}

          {invalid && (
            <p className="rounded-xl bg-yellow/15 px-4 py-3 text-sm text-ink">
              What is saved for this module no longer matches its fields, so the board is showing other
              content instead. The saved document is loaded below — fix what is flagged and save to put it
              back in use.
            </p>
          )}

          {warning && <p className="rounded-xl bg-yellow/15 px-4 py-3 text-sm text-ink">{warning}</p>}
        </header>

        <div id="cms-errors">
          <ErrorSummary errors={errors} />
        </div>

        {rootSpec && (
          <div className={`${card} flex flex-col gap-5`}>
            <Field spec={rootSpec} path={[]} value={doc} onChange={replace} errors={errors} />
          </div>
        )}

        {/* The same document, as text. Bound to the same state, so anything
            typed here appears in the fields above and is what Save sends. */}
        <details onToggle={() => setDraft(null)} className={`${card} !p-0`}>
          <summary className="cursor-pointer list-none px-5 py-3 text-sm font-semibold hover:bg-bg2 [&::-webkit-details-marker]:hidden">
            Advanced — edit as JSON
          </summary>
          <div className="flex flex-col gap-2 border-t border-line px-5 py-4">
            <label className="flex flex-col gap-1.5">
              <span className="sr-only">Document (JSON)</span>
              <textarea
                value={jsonText}
                onChange={(e) => {
                  const text = e.target.value;
                  try {
                    const parsed: unknown = JSON.parse(text);
                    setDraft({ text, base: JSON.stringify(parsed) ?? "" });
                    replace(parsed);
                  } catch {
                    /* keep the characters; the message below says why the
                       fields above did not move */
                    setDraft({ text, base: docJson });
                  }
                }}
                rows={20}
                spellCheck={false}
                aria-invalid={!!parseError}
                className={`${input} font-mono text-xs leading-relaxed ${
                  parseError ? "border-red/60 focus-visible:ring-red/50" : ""
                }`}
              />
            </label>
            <p className={parseError ? fieldError : hint} aria-live="polite">
              {parseError
                ? `Invalid JSON — ${parseError}. The fields above still hold the last version that parsed.`
                : "Valid JSON. The fields above follow every keystroke that parses."}
            </p>
          </div>
        </details>

        <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-2 border-t border-line bg-bg/95 px-1 py-3 backdrop-blur">
          <button type="submit" disabled={pending || !canSave} className={primaryBtn}>
            {pending ? "Saving…" : "Save"}
          </button>

          <button
            type="button"
            disabled={!dirty}
            onClick={() => {
              if (!window.confirm("Throw away every change since the last save?")) return;
              reset(saved.doc);
              setDraft(null);
              setShowErrors(false);
            }}
            className={`${quietBtn} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Discard changes
          </button>

          {arming ? (
            <span className="flex items-center gap-2">
              <span className={hint}>{RESET_ASK[resetTarget.kind]}</span>
              <button
                type="button"
                onClick={() => {
                  replace(structuredClone(resetTarget.doc));
                  setDraft(null);
                  setArming(false);
                }}
                className="rounded-full bg-red px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60"
              >
                Yes, reset
              </button>
              <button type="button" onClick={() => setArming(false)} className={quietBtn}>
                Keep mine
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setArming(true)} className={quietBtn}>
              {RESET_LABEL[resetTarget.kind]}
            </button>
          )}

          <Link href={directoryHref(scope)} onClick={guard} className={quietBtn}>
            {directoryLabel(scope)}
          </Link>

          <span className="ml-auto flex items-center gap-3">
            {showErrors && errorCount > 0 && (
              <span className={fieldError}>
                {errorCount === 1 ? "1 field needs attention" : `${errorCount} fields need attention`}
              </span>
            )}
            {dirty && errorCount === 0 && <span className={hint}>Unsaved changes</span>}
            {/* "Saved" describes the document that was stored, so it stops
                being true the moment this one differs from it — an error
                still shows, because a rejected save is news either way */}
            <Feedback state={dirty ? { error: state.error } : state} />
          </span>
        </div>
      </form>
    </FieldAnchors>
  );
}
