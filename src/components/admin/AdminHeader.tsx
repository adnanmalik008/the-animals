"use client";

/* The bar across the top of every admin screen: where you are. The trail is
   derived from the path rather than passed down per page, so a new screen is
   named the moment it exists. Who you are signed in as is at the foot of the
   sidebar instead. */

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLeaveGuard } from "@/components/admin/dirty-guard";
import { CONTENT_HREF } from "@/components/admin/module-groups";

interface Crumb {
  label: string;
  href?: string;
}

function trailFor(
  pathname: string,
  names: { boards: Record<string, string>; modules: Record<string, string> }
): Crumb[] {
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop "admin"
  const trail: Crumb[] = [{ label: "Board CMS", href: "/admin" }];

  if (segments.length === 0) return [{ label: "Board CMS" }];

  if (segments[0] === "content") {
    const key = segments[1];
    trail.push(key ? { label: "Content", href: CONTENT_HREF } : { label: "Content" });
    if (key) trail.push({ label: names.modules[key] ?? key });
    return trail;
  }

  trail.push({ label: names.boards[segments[0]] ?? segments[0] });
  return trail;
}

export function AdminHeader({
  boardNames,
  moduleNames,
}: {
  /** slug → client name, so a board's crumb reads as the client */
  boardNames: Record<string, string>;
  /** module key → label */
  moduleNames: Record<string, string>;
}) {
  const pathname = usePathname();
  const guard = useLeaveGuard();
  const trail = trailFor(pathname, { boards: boardNames, modules: moduleNames });

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />

      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          {trail.map((crumb, i) => (
            <Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {crumb.href && i < trail.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} onClick={guard} className="truncate">
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* The account menu is at the foot of the sidebar, where a dashboard
          keeps it. All the header owes you is the way back out to the board. */}
      <Button variant="ghost" size="sm" asChild className="ml-auto">
        <a href="/" target="_blank" rel="noreferrer">
          View board
          <ExternalLink data-icon="inline-end" />
        </a>
      </Button>
    </header>
  );
}
