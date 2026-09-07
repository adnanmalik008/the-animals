"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BoardUserRecord } from "@/lib/server/boards";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Feedback } from "./ui";
import { addTeamLoginAction, removeTeamLoginAction, type ActionState } from "./actions";

/* ---------------- team logins ----------------
   The same shape as `UsersManager`, one floor up: a client login opens one
   board, a team login opens the admin and belongs to nobody's board. That is
   the whole point — an admin's access must not disappear because a colleague
   deleted a client.

   Removal asks first, like `DeleteBoardButton`: this is the list that can
   lock the agency out of its own CMS, so a stray click must not be enough. */

export function TeamLogins({ users, readOk }: { users: BoardUserRecord[]; readOk: boolean }) {
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
    <Card>
      <CardHeader>
        <CardTitle>Team logins</CardTitle>
        <CardDescription>
          Each login opens <span className="font-mono text-foreground">/admin</span> on any board host —
          it belongs to the agency, not to a board, so deleting a client never takes it away.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        {users.length > 0 ? (
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-24 text-right">Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell className="text-muted-foreground">admin</TableCell>
                    <TableCell className="text-right">
                      <RemoveTeamLogin userId={u.id} username={u.username} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : readOk ? (
          <Alert>
            <AlertTitle>No team logins yet</AlertTitle>
            <AlertDescription>
              The agency shares the ADMIN_PASSWORD from the environment until one exists.
            </AlertDescription>
          </Alert>
        ) : (
          /* An empty list and a list that could not be read look identical, and
             on this screen the difference is who can get into the CMS. Say which
             one it is rather than letting a database hiccup read as "nobody has
             admin". */
          <Alert variant="destructive">
            <AlertTitle>The team logins couldn&apos;t be read</AlertTitle>
            <AlertDescription>
              This isn&apos;t an answer — there may well be logins it isn&apos;t showing. Reload; if it
              persists, check Supabase before adding or removing anything here.
            </AlertDescription>
          </Alert>
        )}

        {invite && (
          <div className="grid gap-2 rounded-md border border-[var(--green)]/40 bg-[var(--green)]/5 p-4">
            <p className="text-sm font-semibold">
              Login created — copy the invite now. The password can&apos;t be shown again.
            </p>
            <pre className="overflow-x-auto rounded-md bg-card px-3 py-3 font-mono text-xs leading-relaxed">
              {inviteText}
            </pre>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  navigator.clipboard?.writeText(inviteText).then(() => {
                    setInviteCopied(true);
                    toast.success("Invite copied");
                  })
                }
              >
                {inviteCopied ? <Check /> : <Copy />}
                {inviteCopied ? "Copied" : "Copy invite"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setInvite(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <form
          ref={formRef}
          action={action}
          className="grid gap-3 border-t pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div className="grid gap-2">
            <Label htmlFor="team-username">Username</Label>
            <Input
              id="team-username"
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
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="team-password">Password (min 8 chars)</Label>
            <Input
              id="team-password"
              name="password"
              type="text"
              required
              minLength={8}
              autoComplete="off"
              value={draft.password}
              onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Adding…" : "Add team login"}
          </Button>
        </form>
        {state.error && <Feedback state={state} />}
      </CardContent>
    </Card>
  );
}

function RemoveTeamLogin({ userId, username }: { userId: number; username: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="xs">
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke {username}&apos;s admin access?</AlertDialogTitle>
          <AlertDialogDescription>
            This login stops opening /admin. Make sure another team login still works before removing
            the last one.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <form action={removeTeamLoginAction}>
            <input type="hidden" name="userId" value={userId} />
            <AlertDialogAction type="submit">Remove login</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
