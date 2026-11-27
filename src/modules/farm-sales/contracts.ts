import type { BusinessDate, EntityMeta, IntegerString, RationalWire, SourceRef, UUID } from '../shared/contracts.js';
/** Transport shapes only. No calculation, posting or runtime validation in CP-001-R1. */
export type SaleKind = 'rice' | 'aquaculture' | 'unknown';
export type ProductKind = 'rice' | 'shrimp' | 'crab';
export type PriceBasis = 'kg' | 'animal' | 'lot';
export type SaleTiming = {businessDate: BusinessDate; periodStart: null; periodEnd: null}
 | {businessDate: null; periodStart: BusinessDate; periodEnd: BusinessDate}
 | {businessDate: null; periodStart: null; periodEnd: null};
export type SaleHeader = EntityMeta & SourceRef & SaleTiming & {
 kind: SaleKind; sheetId: UUID | null; activityId: UUID | null; productionYearId: UUID | null;
 amountVnd: IntegerString | null; roundingPolicyId: UUID | null;
};
export interface SaleLine extends EntityMeta {
 saleId: UUID; ordinal: number; productKind: ProductKind | null; gradeLabel: string | null;
 sizeLabel: string | null; sizeAnimalsPerKg: RationalWire | null; animalCount: IntegerString | null;
 physicalGram: IntegerString | null; settlementGram: IntegerString | null;
 unitPrice: {basis: PriceBasis; value: RationalWire} | null; amountVnd: IntegerString | null;
}
export type AllocationTarget = {saleId: UUID; expenseId: null; saleLineId: UUID | null}
 | {saleId: null; expenseId: UUID; saleLineId: null};
type AllocationDimensions = {amountVnd: IntegerString | null; physicalGram: IntegerString | null; settlementGram: IntegerString | null; animalCount: IntegerString | null};
type KnownDimension = AllocationDimensions & ({amountVnd: IntegerString} | {physicalGram: IntegerString} | {settlementGram: IntegerString} | {animalCount: IntegerString});
type MoneyOnly = {amountVnd: IntegerString; physicalGram: null; settlementGram: null; animalCount: null};
export type Allocation = EntityMeta & {landId: UUID | null; activityId: UUID | null} & (
 ({saleId: UUID; expenseId: null; saleLineId: UUID} & KnownDimension) |
 ({saleId: UUID; expenseId: null; saleLineId: null} & MoneyOnly) |
 ({saleId: null; expenseId: UUID; saleLineId: null} & MoneyOnly));
