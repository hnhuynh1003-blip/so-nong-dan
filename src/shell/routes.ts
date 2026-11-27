import { boundary as m0 } from "../modules/rice/index.js";
import { boundary as m1 } from "../modules/farm-sales/index.js";
import { boundary as m2 } from "../modules/expenses/index.js";
import { boundary as m3 } from "../modules/land/index.js";
import { boundary as m4 } from "../modules/finance/index.js";
import { boundary as m5 } from "../modules/import/index.js";
export const routes = [m0, m1, m2, m3, m4, m5] as const;
export function resolveRoute(hash: string) {
  const path = hash.replace(/^#\/?/, "");
  if (!path) return { kind: "home" } as const;
  const route = routes.find(r => r.route === path);
  return route ? { kind: "module", route } as const : { kind: "missing" } as const;
}
