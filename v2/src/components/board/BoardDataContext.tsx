"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BoardMeta } from "@/data/board";
import type { ModuleDocs, ModuleKey } from "@/lib/cms/types";

/* Server-loaded content, exposed to client components.

   `docs` is complete and already validated: every registered module key
   is there, holding the agency's saved document or — when there is none,
   or the saved one no longer fits its shape — the built-in fixture. So a
   module reads its key and renders it; no casting, no per-field defaults,
   no fixture imports below this line.

   `meta` is the one thing that is still per board: its client name, brief
   and progress. Content is not.

   Types only from @/lib/cms — the registry and zod stay on the server. */

interface BoardData {
  meta: BoardMeta;
  docs: ModuleDocs;
}

const Ctx = createContext<BoardData | null>(null);

export function BoardDataProvider({
  meta,
  docs,
  children,
}: {
  meta: BoardMeta;
  docs: ModuleDocs;
  children: ReactNode;
}) {
  return <Ctx.Provider value={{ meta, docs }}>{children}</Ctx.Provider>;
}

/* Outside the (board) layout there is no board, and quietly serving
   fixtures would hide the wiring mistake until a client saw someone
   else's content. Fail where the mistake is. */
function useBoardData(): BoardData {
  const data = useContext(Ctx);
  if (!data) throw new Error("Board data is only available inside <BoardDataProvider>.");
  return data;
}

export function useBoardMeta(): BoardMeta {
  return useBoardData().meta;
}

/** The document for a module — always present, always valid. */
export function useModuleDoc<K extends ModuleKey>(key: K): ModuleDocs[K] {
  return useBoardData().docs[key];
}
