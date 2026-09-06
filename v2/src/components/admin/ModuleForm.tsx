"use client";

/* One module, as a form.

   Nothing here knows what a newswire is. The module's FieldSpec tree — the
   same declaration that yields its zod schema and its TypeScript type —
   generates every control, so this file is only the frame around it: the
   locked heading, the state, the footer, and the escape hatch.

   There is one copy of each module, shown by every board, so there is one
   form and one save.

   Three things are load-bearing:

   • The heading is text, not an input. The client fixed each module's
     eyebrow and title in code; there is no control here to make editable by
     accident.
   • Validation runs client-side against `schemaFor(def)` before the action
     is allowed to fire, so a mistake is named where it happened instead of
     after a round trip. The server validates again — this is convenience,
     not trust.
   • The clean baseline moves on `state.savedAt`, not on `state.ok`. Two
     saves in a row both answer `ok: true`, so `ok` alone never changes and
     the second save would leave the form looking permanently dirty. */

import Link from "next/link";
import { useActionState, useCallback, useMemo, useState, type FormEvent } from "react";
import { Field } from "@/components/admin/form/Field";
import { ErrorSummary, FieldAnchors } from "@/components/admin/form/ErrorSummary";
import { useDocState } from "@/components/admin/form/useDocState";
import { card, fieldError, hint, input, primaryBtn, quietBtn } from "@/components/admin/form/tokens";
import { CONTENT_HREF } from "@/components/admin/module-groups";
import { issuesToFieldErrors, type FieldErrors } from "@/lib/cms/parse";
import { byKey } from "@/lib/cms/registry";
import { schemaFor } from "@/lib/cms/schema";
import type { RefSources } from "@/lib/cms/refs";
import type { ObjectSpec } from "@/lib/cms/spec";
import { saveContentDocAction, type ActionState } from "@/app/admin/actions";
import { Feedback } from "@/app/admin/ui";
import { usePublishDirty, useLeaveGuard } from "@/components/admin/ContentNav";

export interface ModuleFormProps {
  /** a string, never the definition: definitions carry functions and RegExps */
  moduleKey: string;
  /** what is stored, or the built-in content when nothing is */
  initialDoc: unknown;
  /** what "Reset to template" puts back: the content built into the code */
  resetDoc: unknown;
  /** true when the stored doc no longer fits its definition */
  invalid?: boolean;
  /** false when there is nowhere to save to at all */
  canSave: boolean;
  /** a standing caveat about saving here, shown before anything is typed */
  warning?: string;
  /** rows a `ref` field can point at, built on the server from the other
      modules' documents; a source with nothing to offer is absent, and the
      field falls back to a typed id */
  refSources?: RefSources;
}

const LOCK = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 1 1 8 0v4" />
  </svg>
);

export function ModuleForm({
  moduleKey,
  initialDoc,
  resetDoc,
  invalid = false,
  canSave,
  warning,
  refSources,
}: ModuleFormProps) {
  const def = byKey(moduleKey);
  const [state, action, pending] = useActionState<ActionState, FormData>(saveContentDocAction, {});
  const { doc, dirty, set, reset } = useDocState(initialDoc);
  const guard = useLeaveGuard();
  usePublishDirty(dirty);

  /* what a Discard returns to, and when it got there: the last thing the
     database confirmed */
  const [saved, setSaved] = useState<{ at?: number; doc: unknown }>({ doc: initialDoc });
  const [showErrors, setShowErrors] = useState(invalid);
  /* true while the reset is waiting to be confirmed */
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
    if (Object.keys(localErrors).length > 0 || parseError) {
      e.preventDefault();
      /* focus, not only scroll: the summary is the list of what to fix, and a
         keyboard user who never saw the page move would otherwise be left
         wherever the Save button was */
      const summary = document.getElementById("cms-errors");
      summary?.scrollIntoView({ behavior: "smooth", block: "center" });
      summary?.focus({ preventScroll: true });
      return;
    }
    /* only a submit that is actually going out may claim the server's errors
       describe this document — setting it on a blocked submit would un-stale
       the previous response and resurrect errors nothing asked for */
    setSent(docJson);
  }

  return (
    <FieldAnchors>
      <form action={action} onSubmit={onSubmit} className="flex min-w-0 flex-col gap-5">
        <input type="hidden" name="moduleKey" value={moduleKey} />
        <input type="hidden" name="doc" value={docJson} />

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{def?.label ?? moduleKey}</h1>
              <p className={hint}>
                <span className="font-mono">{moduleKey}</span> · shown on every board
              </p>
            </div>
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

          <p className="rounded-xl bg-green/10 px-4 py-3 text-sm text-ink">
            This is the one copy of this module: what you save here is what every board shows, including
            boards created later.
          </p>

          {invalid && (
            <p className="rounded-xl bg-yellow/15 px-4 py-3 text-sm text-ink">
              What is saved for this module no longer matches its fields, so the boards are showing the
              content built into the code instead. The saved document is loaded below — fix what is flagged
              and save to put it back in use.
            </p>
          )}

          {warning && <p className="rounded-xl bg-yellow/15 px-4 py-3 text-sm text-ink">{warning}</p>}
        </header>

        <div id="cms-errors" tabIndex={-1} className="outline-none">
          <ErrorSummary errors={errors} />
        </div>

        {rootSpec && (
          <div className={`${card} flex flex-col gap-5`}>
            <Field
              spec={rootSpec}
              path={[]}
              value={doc}
              onChange={replace}
              errors={errors}
              refSources={refSources}
            />
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
              <span className={hint}>Replace everything with the content built into the code?</span>
              <button
                type="button"
                onClick={() => {
                  replace(structuredClone(resetDoc));
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
              Reset to template…
            </button>
          )}

          <Link href={CONTENT_HREF} onClick={guard} className={quietBtn}>
            All content
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
