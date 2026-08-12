"use client";

import { createContext, useContext, type ReactNode } from "react";
import { boardMeta as fixtureMeta, type BoardMeta } from "@/data/board";

/* Server-loaded board content, exposed to client components.
   Modules is a bag of CMS documents keyed by module id;
   components fall back to their built-in fixtures when a key
   is absent, so the app runs fully without the CMS. */

interface BoardData {
  meta: BoardMeta;
  modules: Record<string, unknown>;
}

const Ctx = createContext<BoardData>({ meta: fixtureMeta, modules: {} });

export function BoardDataProvider({
  meta,
  modules,
  children,
}: {
  meta: BoardMeta;
  modules: Record<string, unknown>;
  children: ReactNode;
}) {
  return <Ctx.Provider value={{ meta, modules }}>{children}</Ctx.Provider>;
}

export function useBoardMeta(): BoardMeta {
  return useContext(Ctx).meta;
}

/** CMS document for a module, or undefined when not (yet) managed. */
export function useModuleData<T>(key: string): T | undefined {
  const { modules } = useContext(Ctx);
  return modules[key] as T | undefined;
}
