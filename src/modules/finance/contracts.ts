import type { BusinessDate, EntityMeta, IntegerString, SourceRef, UUID } from '../shared/contracts.js';
export interface BusinessRecord extends EntityMeta, SourceRef {
 businessDate: BusinessDate | null; productionYearId: UUID | null;
}
export interface AssetRecord extends EntityMeta, SourceRef {label: string; acquiredOn: BusinessDate | null; accountId: UUID | null}
export interface LoanRecord extends BusinessRecord {label: string; principalVnd: IntegerString | null; liabilityAccountId: UUID | null}
export interface AssetTransaction extends BusinessRecord {
 assetId: UUID; kind: 'acquire' | 'dispose'; amountVnd: IntegerString | null;
}
export interface LoanTransaction extends BusinessRecord {
 loanId: UUID; kind: 'drawdown' | 'principal_repayment' | 'interest_charge'; amountVnd: IntegerString | null;
}
// A single target at most; no polymorphic FK for core financial targets.
export type FinancialTarget =
 | {saleId: UUID; expenseId: null; assetTransactionId: null; loanTransactionId: null}
 | {saleId: null; expenseId: UUID; assetTransactionId: null; loanTransactionId: null}
 | {saleId: null; expenseId: null; assetTransactionId: UUID; loanTransactionId: null}
 | {saleId: null; expenseId: null; assetTransactionId: null; loanTransactionId: UUID};
export type NoTarget = {saleId: null; expenseId: null; assetTransactionId: null; loanTransactionId: null};
export type Settlement = BusinessRecord & {amountVnd: IntegerString} & (
 (FinancialTarget & {accountId: UUID; depositSettlementId: null} & ({kind: 'receipt'; cashDirection: 'in'} | {kind: 'payment'; cashDirection: 'out'} | {kind: 'refund'; cashDirection: 'in' | 'out'})) |
 ((FinancialTarget | NoTarget) & {kind: 'deposit'; accountId: UUID; depositSettlementId: null; cashDirection: 'in' | 'out'}) |
 (Extract<FinancialTarget, {saleId: UUID} | {expenseId: UUID}> & {kind: 'deposit_apply'; accountId: null; depositSettlementId: UUID; cashDirection: null}));
export type JournalSubject = ((FinancialTarget | NoTarget) & {settlementId: null}) | (NoTarget & {settlementId: UUID});
export type JournalEvent = BusinessRecord & JournalSubject & {
 verification: 'confirmed'; eventKind: string; sourceRevision: number; idempotencyKey: UUID; reversesEventId: UUID | null;
};
