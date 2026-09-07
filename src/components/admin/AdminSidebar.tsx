"use client";

/* The admin's one navigation surface.

   Everything the CMS can reach is here: the boards (a name, an address and
   its logins) and the content (one set of modules, shown by every board).
   The module list used to be a rail on the form page alone, which meant the
   thirty modules were only reachable once you were already inside one of
   them; in the sidebar they are reachable from anywhere, and the rail is
   gone.

   Every link is wrapped in the leave guard: the sidebar renders beside an
   open form, so its links are exactly the ones that can throw an edit away. */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronsUpDown, ExternalLink, LayoutGrid, LogOut, Plus, SquareStack } from "lucide-react";
import { logout } from "@/app/login/actions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useDirty, useLeaveGuard } from "@/components/admin/dirty-guard";
import { ModuleIcon } from "@/components/admin/module-icons";
import { CONTENT_HREF, moduleHref, type ModuleGroup } from "@/components/admin/module-groups";

export interface SidebarBoard {
  slug: string;
  clientName: string;
}

export function AdminSidebar({
  boards,
  groups,
  configured,
  username,
  role,
}: {
  boards: SidebarBoard[];
  groups: ModuleGroup[];
  /** false when there is no Supabase behind the CMS at all */
  configured: boolean;
  username: string;
  role: string;
}) {
  const pathname = usePathname();
  const guard = useLeaveGuard();
  const dirty = useDirty();

  const onContent = pathname === CONTENT_HREF || pathname.startsWith(`${CONTENT_HREF}/`);
  const currentKey = onContent ? pathname.slice(CONTENT_HREF.length + 1) : "";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2 border-b p-3">
        {/* The agency's own mark, from the Figma export the board uses — the
            black lockup, on the sidebar's white ground. */}
        <Link href="/admin" onClick={guard} className="flex items-center gap-2 px-1">
          <span className="flex w-14 shrink-0 items-center justify-center group-data-[collapsible=icon]:w-7">
            <Image
              src="/assets/logo/animals-logo.png"
              alt="The Animals"
              width={682}
              height={372}
              priority
              className="h-auto w-full"
            />
          </span>
          {/* the agency's name is in the mark; printing it again is the same
              word twice */}
          <span className="truncate text-lg font-semibold leading-tight group-data-[collapsible=icon]:hidden">
            Board CMS
          </span>
        </Link>
        {!configured && (
          <Badge variant="destructive" className="group-data-[collapsible=icon]:hidden">
            Read-only preview
          </Badge>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"} tooltip="Dashboard">
                  <Link href="/admin" onClick={guard}>
                    <LayoutGrid />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ---- boards: a name, an address, its logins ---- */}
        <SidebarGroup>
          <SidebarGroupLabel>Boards</SidebarGroupLabel>
          <SidebarGroupAction asChild title="Publish a new board">
            <Link href="/admin#new-board" onClick={guard}>
              <Plus />
              <span className="sr-only">Publish a new board</span>
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {boards.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                  No boards yet.
                </p>
              )}
              {boards.map((board) => (
                <SidebarMenuItem key={board.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/admin/${board.slug}`}
                    tooltip={board.clientName}
                  >
                    <Link href={`/admin/${board.slug}`} onClick={guard}>
                      <span
                        aria-hidden
                        className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-muted text-[10px] font-semibold uppercase text-muted-foreground"
                      >
                        {board.clientName.trim().charAt(0) || "?"}
                      </span>
                      <span className="truncate">{board.clientName}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ---- content: one set of modules for every board ---- */}
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === CONTENT_HREF} tooltip="All content">
                  <Link href={CONTENT_HREF} onClick={guard}>
                    <SquareStack />
                    <span>All content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {groups.map((group) => {
                const inGroup = group.entries.some((e) => e.key === currentKey);
                return (
                  <Collapsible
                    key={group.id}
                    asChild
                    defaultOpen={inGroup}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={group.title}>
                          <ModuleIcon moduleKey={group.entries[0]?.key ?? ""} size={16} />
                          <span className="truncate">{group.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.entries.map((entry) => {
                            const current = entry.key === currentKey;
                            return (
                              <SidebarMenuSubItem key={entry.key}>
                                <SidebarMenuSubButton asChild isActive={current}>
                                  <Link href={moduleHref(entry.key)} onClick={guard}>
                                    <ModuleIcon moduleKey={entry.key} size={14} />
                                    <span className="truncate">{entry.label}</span>
                                    {current && dirty && (
                                      <span
                                        title="Unsaved changes"
                                        aria-label="unsaved changes"
                                        className="ml-auto size-1.5 shrink-0 rounded-full bg-primary"
                                      />
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Who you are signed in as, and the two things you can do about it.
          It sits at the foot of the rail — the place a dashboard puts an
          account, and out of the way of the work. */}
      <SidebarFooter className="border-t p-2">
        {/* The form sits out here, not inside the menu. A <form> used as the
            menu item itself only submits on a real click: Radix activates an
            item on Enter by clicking it, and clicking a form does nothing. The
            button below claims this one by id, which works across the menu's
            portal, so Log out answers the keyboard as well as the mouse. */}
        <form id="admin-logout" action={logout} className="hidden" />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={username}
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-3)] text-sm font-semibold uppercase text-white"
                  >
                    {username.trim().charAt(0) || "?"}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                    <span className="truncate text-sm font-medium">{username}</span>
                    <span className="truncate text-xs text-muted-foreground">Signed in as {role}</span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-sm font-medium">{username}</span>
                  <span className="block text-xs text-muted-foreground">Signed in as {role}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/" target="_blank" rel="noreferrer">
                    <ExternalLink />
                    View board
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild variant="destructive">
                  <button type="submit" form="admin-logout">
                    <LogOut />
                    Log out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
