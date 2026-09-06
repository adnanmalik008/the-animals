import Link from "next/link";
import { card, hint, quietBtn } from "@/components/admin/form/tokens";

/* The one thing this admin must never do.

   "The database did not answer" and "nothing is saved here" arrive as the
   same empty result, and mean opposite things. Presenting the built-in
   content as though it were what is stored puts an editor one Save away from
   replacing a client's real document with a template, so a failed read shows
   this instead: no badges, no Edit links, no form. */

function Explanation({ error }: { error: string }) {
  return (
    <>
      <p className="text-sm text-graphite">
        The database did not answer, so there is no way to say what is saved here. Reload in a moment.
        Nothing can be edited until the read succeeds — opening the built-in content and saving it would
        replace whatever is actually stored.
      </p>
      <p className={`${hint} font-mono`}>{error}</p>
    </>
  );
}

/** Inside a card that would otherwise list modules. */
export function ReadErrorNotice({ what, error }: { what: string; error: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-red/40 bg-red/5 px-4 py-3">
      <p className="text-sm font-semibold text-red">Couldn&apos;t read {what}</p>
      <Explanation error={error} />
    </div>
  );
}

/** Instead of a form page. */
export function ReadErrorPage({
  what,
  error,
  backHref,
  backLabel,
}: {
  what: string;
  error: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className={`${card} flex max-w-2xl flex-col gap-3`}>
      <h1 className="text-lg font-bold">Couldn&apos;t read {what}</h1>
      <Explanation error={error} />
      <Link href={backHref} className={`${quietBtn} self-start`}>
        ← {backLabel}
      </Link>
    </div>
  );
}
