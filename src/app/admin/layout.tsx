import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/guard";
import { listBoards } from "@/lib/server/boards";
import { isCmsConfigured } from "@/lib/server/supabase";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DirtyGuard } from "@/components/admin/dirty-guard";
import { moduleGroups } from "@/components/admin/module-groups";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Admin — The Animals",
};

/* The CMS shell: a sidebar that reaches every board and every module, and a
   header that says where you are. Both are rendered beside an open form, so
   both sit inside the dirty guard — their links are the ones that can walk
   away from unsaved work. */

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  const configured = isCmsConfigured();
  const boards = await listBoards();
  const groups = moduleGroups();

  const boardNames = Object.fromEntries(boards.map((b) => [b.slug, b.clientName]));
  const moduleNames = Object.fromEntries(
    groups.flatMap((g) => g.entries.map((e) => [e.key, e.label] as const))
  );

  return (
    <DirtyGuard>
      <TooltipProvider>
        <SidebarProvider className="min-h-0 flex-1">
          <AdminSidebar
            boards={boards.map((b) => ({ slug: b.slug, clientName: b.clientName }))}
            groups={groups}
            configured={configured}
            username={session.username}
            role={session.role}
          />
          <SidebarInset className="min-w-0">
            <AdminHeader boardNames={boardNames} moduleNames={moduleNames} />
            <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</div>
          </SidebarInset>
          <Toaster position="bottom-right" />
        </SidebarProvider>
      </TooltipProvider>
    </DirtyGuard>
  );
}
