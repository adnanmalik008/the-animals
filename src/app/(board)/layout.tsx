import { TopNav } from "@/components/shell/TopNav";
import { BrandBar } from "@/components/shell/BrandBar";
import { AnomaliesStore } from "@/components/board/AnomaliesStore";
import { BoardDataProvider } from "@/components/board/BoardDataContext";
import { EMPTY_DOC } from "@/lib/anomalies/types";
import { readBoard } from "@/lib/server/anomalies";
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

  /* The Anomalies board, read here rather than on /anomalies: the Live tab
     needs it too, because a card filed by a sticker is what draws that
     sticker. One read, both tabs. The fixture board — Supabase unconfigured,
     or a slug with no row — has no id to read against, and comes back as the
     empty, unbacked board the store keeps in the browser instead. */
  const anomalies = board.id === "fixture" ? EMPTY_DOC : await readBoard(board.id);

  return (
    <BoardDataProvider meta={boardToMeta(board)} docs={docs}>
      <AnomaliesStore doc={anomalies} />
      <TopNav />
      <BrandBar />
      {children}
    </BoardDataProvider>
  );
}
