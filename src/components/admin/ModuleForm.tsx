"use client";

/* One module, as a form.

   Nothing here knows what a newswire is. The module's FieldSpec tree — the
   same declaration that yields its zod schema and its TypeScript type —
   generates every control, so this file is only the frame around it: the
   locked heading, the state and the footer. There is no raw-JSON escape
   hatch — the fields are the only way in, so nothing can be saved that the
   module's own shape does not describe.

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
     the second save would leave the form looking permanently dirty.
   • The form answers `reset`. React 19 resets a form after its action
     resolves, and a Radix control answers that reset by restoring the value
     it had when it first mounted — a checkbox does so through `onCheckedChange`,
     which writes that stale value straight back into the document. So a save
     was followed by an invisible edit that undid it. `onReset` runs after the
     controls' own listeners, so this is where the document is put back to what
     the database actually confirmed. */

import Link from "next/link";
import { useActionState, useCallback, useMemo, useState, type FormEvent } from "react";
import { Loader2, Lock, RotateCcw, Undo2 } from "lucide-react";
import { Field } from "@/components/admin/form/Field";
import { ErrorSummary, FieldAnchors } from "@/components/admin/form/ErrorSummary";
import { useDocState } from "@/components/admin/form/useDocState";
import { CONTENT_HREF } from "@/components/admin/module-groups";
import { issuesToFieldErrors, type FieldErrors } from "@/lib/cms/parse";
import { byKey } from "@/lib/cms/registry";
import { schemaFor } from "@/lib/cms/schema";
import type { RefSources, WidgetColumns } from "@/lib/cms/refs";
import type { ObjectSpec } from "@/lib/cms/spec";
import { saveContentDocAction, type ActionState } from "@/app/admin/actions";
import { Feedback } from "@/app/admin/ui";
import { usePublishDirty, useLeaveGuard } from "@/components/admin/dirty-guard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  /** column headers for widgets that have them, by path */
  widgetColumns?: WidgetColumns;
}

export function ModuleForm({
  moduleKey,
  initialDoc,
  resetDoc,
  invalid = false,
  canSave,
  warning,
  refSources,
  widgetColumns,
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
  /* the document the last Save actually sent */
  const [sent, setSent] = useState("");

  const docJson = useMemo(() => JSON.stringify(doc) ?? "", [doc]);

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
    setShowErrors(false);
  }

  const replace = useCallback((next: unknown) => set([], next), [set]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    setShowErrors(true);
    if (Object.keys(localErrors).length > 0) {
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
      <form
        action={action}
        onSubmit={onSubmit}
        /* React 19 resets the form once the action resolves. Radix controls
           answer that by writing their first-mount value back through their
           change handler, which lands in the document as an edit nobody made.
           This runs after them and restores what was actually saved. */
        onReset={() => reset(saved.doc)}
        className="flex min-w-0 flex-col gap-5"
      >
        <input type="hidden" name="moduleKey" value={moduleKey} />
        <input type="hidden" name="doc" value={docJson} />

        <header className="flex flex-col gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{def?.label ?? moduleKey}</h1>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono">{moduleKey}</span> · shown on every board
            </p>
          </div>

          {def ? (
            /* fixed in code at the client's request — rendered, never bound */
            <div className="flex flex-col gap-1 rounded-lg border border-dashed bg-muted/50 px-4 py-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Lock className="size-3" /> Fixed in code
              </span>
              {def.heading.eyebrow && (
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {def.heading.eyebrow}
                </span>
              )}
              <span className="text-lg font-semibold">{def.heading.title}</span>
              <p className="text-xs text-muted-foreground">
                This module&apos;s eyebrow and title are part of the design. Everything below is yours.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 rounded-lg border border-dashed bg-muted/50 px-4 py-3">
              <span className="text-sm font-semibold">No form for this module yet</span>
              <p className="text-xs text-muted-foreground">
                This module has no editable fields — its content is still the version built into the
                code.
              </p>
            </div>
          )}

          {def?.intro && <p className="text-sm text-muted-foreground">{def.intro}</p>}

          <Alert>
            <AlertDescription>
              This is the one copy of this module: what you save here is what every board shows,
              including boards created later.
            </AlertDescription>
          </Alert>

          {invalid && (
            <Alert>
              <AlertTitle>What is saved no longer matches this module&apos;s fields</AlertTitle>
              <AlertDescription>
                The boards are showing the content built into the code instead. The saved document is
                loaded below — fix what is flagged and save to put it back in use.
              </AlertDescription>
            </Alert>
          )}

          {warning && (
            <Alert>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}
        </header>

        <div id="cms-errors" tabIndex={-1} className="outline-none">
          <ErrorSummary errors={errors} />
        </div>

        {rootSpec && (
          <Card>
            <CardContent className="flex flex-col gap-5">
              <Field
                spec={rootSpec}
                path={[]}
                value={doc}
                onChange={replace}
                errors={errors}
                refSources={refSources}
                widgetColumns={widgetColumns}
              />
            </CardContent>
          </Card>
        )}


        <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur">
          <Button type="submit" disabled={pending || !canSave}>
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Saving…" : "Save"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={!dirty}>
                <Undo2 />
                Discard changes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Throw away every change since the last save?</AlertDialogTitle>
                <AlertDialogDescription>
                  The fields go back to the document the database last confirmed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    reset(saved.doc);
                    setShowErrors(false);
                  }}
                >
                  Discard changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <RotateCcw />
                Reset to template
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Replace everything with the built-in content?</AlertDialogTitle>
                <AlertDialogDescription>
                  Every field is overwritten with the content this module ships with. Nothing is saved
                  until you press Save.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep mine</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    replace(structuredClone(resetDoc));
                  }}
                >
                  Reset to template
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href={CONTENT_HREF} onClick={guard}>
              All content
            </Link>
          </Button>

          <span className="ml-auto flex items-center gap-3">
            {showErrors && errorCount > 0 && (
              <span className="text-xs font-medium text-destructive">
                {errorCount === 1 ? "1 field needs attention" : `${errorCount} fields need attention`}
              </span>
            )}
            {dirty && errorCount === 0 && (
              <span className="text-xs text-muted-foreground">Unsaved changes</span>
            )}
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
