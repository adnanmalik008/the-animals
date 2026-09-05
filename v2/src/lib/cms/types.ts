/* Type-only view of the registry, safe to import from board components:
   nothing here reaches the client bundle. */

import type { MODULES } from "./registry";
import type { DocOf } from "./spec";

type Def = (typeof MODULES)[number];

export type ModuleKey = Def["key"];

export type ModuleDocs = { [K in ModuleKey]: DocOf<Extract<Def, { key: K }>> };

/** custom = a valid saved doc; default = no doc, fixture shown; invalid = saved doc failed validation, fixture shown */
export type ModuleStatus = "custom" | "default" | "invalid";
