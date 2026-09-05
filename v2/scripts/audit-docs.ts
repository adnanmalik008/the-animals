/* Read-only dry run against the real Supabase project: for every saved
   module_data row, reports whether the new CMS validation would accept it.
   Never writes — selects only. Runs outside Next.js (via `tsx`), so it
   loads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY by parsing v2/.env.local
   itself rather than relying on Next's env loading. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { byKey } from "@/lib/cms/registry";
import { parseDoc } from "@/lib/cms/parse";

function loadEnvLocal(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    const quoted =
      value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")));
    if (quoted) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

interface BoardRow {
  id: string;
  slug: string;
}

interface ModuleRow {
  board_id: string;
  module_key: string;
  data: unknown;
  updated_at: string;
}

async function main() {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "../.env.local");
  const env = loadEnvLocal(envPath);
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(`Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in ${envPath}`);
    process.exitCode = 1;
    return;
  }

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const [boardsRes, rowsRes] = await Promise.all([
    db.from("boards").select("id, slug"),
    db.from("module_data").select("board_id, module_key, data, updated_at"),
  ]);

  if (boardsRes.error) {
    console.error(`Failed to read boards: ${boardsRes.error.message}`);
    process.exitCode = 1;
    return;
  }
  if (rowsRes.error) {
    console.error(`Failed to read module_data: ${rowsRes.error.message}`);
    process.exitCode = 1;
    return;
  }

  const boards = boardsRes.data as BoardRow[];
  const rows = rowsRes.data as ModuleRow[];
  const slugById = new Map(boards.map((b) => [b.id, b.slug]));

  const sorted = [...rows].sort((a, b) => {
    const slugA = slugById.get(a.board_id) ?? a.board_id;
    const slugB = slugById.get(b.board_id) ?? b.board_id;
    return slugA === slugB ? a.module_key.localeCompare(b.module_key) : slugA.localeCompare(slugB);
  });

  let ok = 0;
  let invalid = 0;
  let unmanaged = 0;

  for (const row of sorted) {
    const slug = slugById.get(row.board_id) ?? row.board_id;
    const def = byKey(row.module_key);
    if (!def) {
      unmanaged++;
      console.log(`${slug}  ${row.module_key}  unmanaged`);
      continue;
    }
    const res = parseDoc(def, row.data);
    if (res.ok) {
      ok++;
      console.log(`${slug}  ${row.module_key}  ok`);
    } else {
      invalid++;
      const detail = Object.entries(res.fieldErrors)
        .slice(0, 3)
        .map(([path, message]) => `${path}: ${message}`)
        .join("; ");
      console.log(`${slug}  ${row.module_key}  INVALID  ${detail}`);
    }
  }

  console.log(`\n${sorted.length} rows — ${ok} ok, ${invalid} INVALID, ${unmanaged} unmanaged`);
  process.exitCode = invalid > 0 ? 1 : 0;
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
