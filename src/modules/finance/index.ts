import type { ModuleBoundary } from "../shared/contracts.js";
export const boundary = {"route": "quyet-toan", "label": "Quyết toán", "description": "Lợi nhuận, thu chi, tài sản và công nợ.", "checkpoint": "CP-005 / CP-007"} as const satisfies ModuleBoundary;

export type * from "./contracts.js";
