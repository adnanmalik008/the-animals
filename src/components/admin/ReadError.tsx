import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* The one thing this admin must never do.

   "The database did not answer" and "nothing is saved here" arrive as the
   same empty result, and mean opposite things. Presenting the built-in
   content as though it were what is stored puts an editor one Save away from
   replacing a client's real document with a template, so a failed read shows
   this instead: no badges, no Edit links, no form. */

function Explanation({ error }: { error: string }) {
  return (
    <>
      <p>
        The database did not answer, so there is no way to say what is saved here. Reload in a moment.
        Nothing can be edited until the read succeeds — opening the built-in content and saving it would
        replace whatever is actually stored.
      </p>
      <p className="mt-2 font-mono text-xs opacity-80">{error}</p>
    </>
  );
}

/** Inside a screen that would otherwise list modules. */
export function ReadErrorNotice({ what, error }: { what: string; error: string }) {
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>Couldn&apos;t read {what}</AlertTitle>
      <AlertDescription>
        <Explanation error={error} />
      </AlertDescription>
    </Alert>
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
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Couldn&apos;t read {what}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm text-muted-foreground">
        <Explanation error={error} />
        <Button asChild variant="outline" size="sm" className="justify-self-start">
          <Link href={backHref}>
            <ArrowLeft />
            {backLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
