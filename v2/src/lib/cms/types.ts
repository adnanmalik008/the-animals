/* Type-only view of the registry, safe to import from board components:
   nothing here reaches the client bundle. */

import type { MODULES } from "./registry";
import type { DocOf } from "./spec";

type Def = (typeof MODULES)[number];

export type ModuleKey = Def["key"];

export type ModuleDocs = { [K in ModuleKey]: DocOf<Extract<Def, { key: K }>> };

/** What a board is actually showing for one module, in read-chain order:
    custom  = this board's own saved doc, valid;
    shared  = no doc of its own, so the agency-wide default;
    default = neither, so the built-in fixture;
    invalid = this board's saved doc failed validation, so whatever came next
              is on screen and the saved doc needs an editor. */
export type ModuleStatus = "custom" | "shared" | "default" | "invalid";
