/* Type-only view of the registry, safe to import from board components:
   nothing here reaches the client bundle. */

import type { MODULES } from "./registry";
import type { DocOf } from "./spec";

type Def = (typeof MODULES)[number];

export type ModuleKey = Def["key"];

export type ModuleDocs = { [K in ModuleKey]: DocOf<Extract<Def, { key: K }>> };

/** What every board is showing for one module, in read-chain order:
    custom  = the agency's saved doc, valid;
    default = nothing saved, so the built-in fixture;
    invalid = the saved doc failed validation, so the fixture is on screen
              and the saved doc needs an editor. */
export type ModuleStatus = "custom" | "default" | "invalid";
