import { TopNav } from "@/components/shell/TopNav";
import { BrandBar } from "@/components/shell/BrandBar";
import { BoardDataProvider } from "@/components/board/BoardDataContext";
import { boardToMeta, getCurrentBoard, getModuleData } from "@/lib/server/boards";

/* The client-facing board: nav, brand bar, and board data. Admin and
   login render outside this group, chrome-free — nothing about a
   protected board shows before its login. */
export default async function BoardLayout({ children }: LayoutProps<"/">) {
  const board = await getCurrentBoard();
  const modules = await getModuleData(board.id);

  return (
    <BoardDataProvider meta={boardToMeta(board)} modules={modules}>
      <TopNav />
      <BrandBar />
      {children}
    </BoardDataProvider>
  );
}
