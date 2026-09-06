import { TopNav } from "@/components/shell/TopNav";
import { BrandBar } from "@/components/shell/BrandBar";
import { BoardDataProvider } from "@/components/board/BoardDataContext";
import { boardToMeta } from "@/lib/server/boards";
import { getContentDocs } from "@/lib/server/docs";
import { requireBoardAccess } from "@/lib/server/guard";

/* The client-facing board: nav, brand bar, and board data. Admin and
   login render outside this group, chrome-free — nothing about a
   protected board shows before its login. */
export default async function BoardLayout({ children }: LayoutProps<"/">) {
  /* Guarded here as well as in each page: this layout is what reads the
     board and the content, so the check has to stand in front of the read,
     not beside it. See requireBoardAccess. */
  const board = await requireBoardAccess();
  const { docs } = await getContentDocs();

  return (
    <BoardDataProvider meta={boardToMeta(board)} docs={docs}>
      <TopNav />
      <BrandBar />
      {children}
    </BoardDataProvider>
  );
}
