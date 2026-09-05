import { TopNav } from "@/components/shell/TopNav";
import { BrandBar } from "@/components/shell/BrandBar";
import { BoardDataProvider } from "@/components/board/BoardDataContext";
import { boardToMeta, getCurrentBoard } from "@/lib/server/boards";
import { getBoardDocs } from "@/lib/server/docs";

/* The client-facing board: nav, brand bar, and board data. Admin and
   login render outside this group, chrome-free — nothing about a
   protected board shows before its login. */
export default async function BoardLayout({ children }: LayoutProps<"/">) {
  const board = await getCurrentBoard();
  const { docs } = await getBoardDocs(board.id);

  return (
    <BoardDataProvider
      meta={boardToMeta(board)}
      docs={docs}
      boardId={board.id}
      isFixture={board.id === "fixture"}
    >
      <TopNav />
      <BrandBar />
      {children}
    </BoardDataProvider>
  );
}
