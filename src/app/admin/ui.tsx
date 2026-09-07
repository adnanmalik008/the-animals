"use client";

/* The board half of the CMS, in shadcn/ui.

   A board is three things and no more: a name, an address, and who can log
   in. Content is not per board and lives on its own screens. */

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BoardRecord, BoardUserRecord } from "@/lib/server/boards";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  addUserAction,
  createBoardAction,
  deleteBoardAction,
  removeUserAction,
  updateBoardAction,
  type ActionState,
} from "./actions";

/* The one save-result line every admin form shows. Exported: the generated
   module form is a second surface that has to report a save the same way. */
export function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p role="alert" className="text-sm font-medium text-destructive">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--green)]">
        <Check className="size-3.5" />
        Saved
      </p>
    );
  return null;
}

/** The chip every board wears: its live address, openable and copyable. */
export function PublishChip({ host, className }: { host: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const url = `https://${host}`;
  return (
    <span
      className={`relative z-10 inline-flex max-w-full items-stretch overflow-hidden rounded-md border bg-muted/40 text-xs ${className ?? ""}`}
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={`Open ${url}`}
        className="inline-flex min-w-0 items-center gap-1.5 truncate px-2.5 py-1.5 font-mono text-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="truncate">{host}</span>
        <ExternalLink className="size-3 shrink-0 opacity-60" />
      </a>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            toast.success("Address copied", { description: url });
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 1600);
          });
        }}
        aria-label={`Copy ${url}`}
        className="border-l px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {copied ? (
          <Check className="size-3 text-[var(--green)]" />
        ) : (
          <Copy className="size-3" />
        )}
      </button>
    </span>
  );
}

/** Login required, or open to anyone — said the same way everywhere. */
export function ProtectionBadge({ isProtected }: { isProtected: boolean }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${
        isProtected
          ? "bg-[var(--green)]/10 text-[var(--green)]"
          : "bg-[var(--yellow)]/15 text-[var(--olive)]"
      }`}
    >
      {isProtected ? "Login required" : "Open to anyone"}
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
    <Card id="new-board" className="scroll-mt-20">
      <form action={action}>
        <CardHeader>
          <CardTitle>Publish a new board</CardTitle>
          <CardDescription>
            The slug becomes the client&apos;s address — live the moment the board is created.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="new-board-name">Client name</Label>
            <Input
              id="new-board-name"
              name="clientName"
              required
              placeholder="Nike"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-board-slug">Slug</Label>
            <Input
              id="new-board-slug"
              name="slug"
              required
              placeholder="nike"
              /* the dash is escaped: HTML compiles `pattern` with the `v` flag,
                 under which a bare `-` inside a class is a syntax error and the
                 whole attribute is silently ignored */
              pattern="[a-z0-9]([a-z0-9\-]{0,46}[a-z0-9])?"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              className="font-mono"
            />
          </div>
          <p className="flex flex-wrap items-center gap-2 rounded-md bg-muted px-3 py-2.5 text-sm text-muted-foreground sm:col-span-2">
            <span className="shrink-0">Publishes at</span>
            <span className="font-mono text-foreground">
              https://{effectiveSlug || "…"}.{(rootDomain ?? "").trim() || "theanimals.live"}
            </span>
          </p>
        </CardContent>
        <CardFooter className="gap-4">
          <Button type="submit" disabled={pending || !effectiveSlug}>
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Creating…" : "Create board"}
          </Button>
          <Feedback state={state} />
        </CardFooter>
      </form>
    </Card>
  );
}

/* ---------------- delete ---------------- */

export function DeleteBoardButton({ slug, clientName }: { slug: string; clientName: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 />
          Delete board
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {clientName}?</AlertDialogTitle>
          <AlertDialogDescription>
            The board stops answering at its address and its client logins go with it. Content is not
            touched — it belongs to every board, not this one.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <form action={deleteBoardAction}>
            <input type="hidden" name="slug" value={slug} />
            <AlertDialogAction type="submit">Delete board</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------------- board meta ---------------- */

export function BoardMetaForm({ board }: { board: BoardRecord }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateBoardAction, {});
  return (
    <Card>
      <form action={action}>
        <input type="hidden" name="slug" value={board.slug} />
        <CardHeader>
          <CardTitle>Board settings</CardTitle>
          <CardDescription>What the client sees in the header.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="board-client-name">Client name</Label>
            <Input id="board-client-name" name="clientName" defaultValue={board.clientName} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="board-brief-date">Brief date</Label>
            <Input
              id="board-brief-date"
              name="briefDate"
              defaultValue={board.briefDate}
              placeholder="9th June 2026"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="board-brief-question">Brief question</Label>
            <Textarea
              id="board-brief-question"
              name="briefQuestion"
              defaultValue={board.briefQuestion}
              rows={2}
              placeholder="The question this board answers — scrolls in the header."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="board-progress">Progress %</Label>
            <Input
              id="board-progress"
              name="progressPct"
              type="number"
              min={0}
              max={100}
              defaultValue={board.progressPct}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="board-user-name">Displayed user name</Label>
            <Input
              id="board-user-name"
              name="userDisplayName"
              defaultValue={board.userDisplayName}
              placeholder="R Basckin"
            />
          </div>

          <div className="flex items-start gap-3 rounded-md border p-3 sm:col-span-2">
            <Switch id="board-protected" name="isProtected" defaultChecked={board.isProtected} />
            <div className="grid gap-0.5">
              <Label htmlFor="board-protected">Require a client login to view this board</Label>
              <p className="text-xs text-muted-foreground">
                Off, and anyone with the address can read it.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-4">
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Saving…" : "Save settings"}
          </Button>
          <Feedback state={state} />
        </CardFooter>
      </form>
    </Card>
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

  /* Board logins only. A team login belongs to the agency, has no board_id and
     is managed on the admin home — it must never appear here, because a Remove
     button rendered for one would offer to delete it from the board screen.
     `listBoardUsers` already filters by board_id; this is the second lock, and
     the one that holds if a row ever arrives from somewhere else. */
  const boardUsers = users.filter((u) => u.role === "client");

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
    <Card>
      <CardHeader>
        <CardTitle>Client logins</CardTitle>
        <CardDescription>
          Each login opens <span className="font-mono text-foreground">{host}</span> only.
        </CardDescription>
        <CardAction>
          <span className="text-xs text-muted-foreground">{boardUsers.length} of 10</span>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-4">
        {boardUsers.length > 0 ? (
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
                {boardUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell className="text-muted-foreground">{u.role}</TableCell>
                    <TableCell className="text-right">
                      <RemoveLogin userId={u.id} username={u.username} slug={board.slug} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Alert>
            <AlertTitle>No logins yet</AlertTitle>
            <AlertDescription>
              The board asks for credentials, so add one before sharing the link.
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
          <input type="hidden" name="slug" value={board.slug} />
          <div className="grid gap-2">
            <Label htmlFor="client-username">Username</Label>
            <Input
              id="client-username"
              name="username"
              required
              autoComplete="off"
              value={draft.username}
              onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client-password">Password (min 8 chars)</Label>
            <Input
              id="client-password"
              name="password"
              type="text"
              required
              minLength={8}
              autoComplete="off"
              value={draft.password}
              onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={pending || boardUsers.length >= 10}>
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Adding…" : "Add login"}
          </Button>
        </form>
        {state.error && <Feedback state={state} />}
      </CardContent>
    </Card>
  );
}

function RemoveLogin({
  userId,
  username,
  slug,
}: {
  userId: number;
  username: string;
  slug: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="xs">
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {username}?</AlertDialogTitle>
          <AlertDialogDescription>
            This login stops opening the board. Anyone using it is signed out at their next request.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <form action={removeUserAction}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="slug" value={slug} />
            <AlertDialogAction type="submit">Remove login</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
