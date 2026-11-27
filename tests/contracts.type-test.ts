import type { SaleLine, AllocationTarget, SaleTiming } from '../src/modules/farm-sales/contracts.js';
import type { RoundingStep } from '../src/modules/shared/rounding-policy.js';
import type { FinancialTarget, Settlement, JournalSubject } from '../src/modules/finance/contracts.js';
const nullTiming: SaleTiming={businessDate:null,periodStart:null,periodEnd:null};
// @ts-expect-error day and period cannot both be set
const badTiming: SaleTiming={businessDate:'2026-01-01',periodStart:'2026-01-01',periodEnd:'2026-01-02'};
const goodAllocation: AllocationTarget={saleId:'synthetic-sale',expenseId:null,saleLineId:'synthetic-line'};
// @ts-expect-error expense allocation cannot carry sale line
const badAllocation: AllocationTarget={saleId:null,expenseId:'synthetic-expense',saleLineId:'synthetic-line'};
// @ts-expect-error no float price, must use rational wire
const badPrice: SaleLine['unitPrice']={basis:'kg',value:2};
// @ts-expect-error nearest requires explicit tie; no default
const badPolicy: RoundingStep={quantity:'settlement_gram',scope:'line',method:'nearest',quantum:{numerator:'1',denominator:'1'},tie:null};
// @ts-expect-error only one finance target
const badTarget: FinancialTarget={saleId:'a',expenseId:'b',assetTransactionId:null,loanTransactionId:null};
// @ts-expect-error journal cannot post settlement and sale simultaneously
const badJournal: JournalSubject={saleId:'a',expenseId:null,assetTransactionId:null,loanTransactionId:null,settlementId:'b'};
// Type test: applying a deposit never has a cash account.
const depositAccount: Extract<Settlement,{kind:'deposit_apply'}>['accountId']=null;
// @ts-expect-error noncash application cannot use account
const badDepositAccount: Extract<Settlement,{kind:'deposit_apply'}>['accountId']='cash';
void [nullTiming,badTiming,goodAllocation,badAllocation,badPrice,badPolicy,badTarget,badJournal,depositAccount,badDepositAccount];
import type { Allocation } from '../src/modules/farm-sales/contracts.js';
const base={id:'synthetic',ownerId:'synthetic',version:1,createdAt:'synthetic',updatedAt:'synthetic',landId:null,activityId:null} as const;
// @ts-expect-error an allocation must have at least one known dimension
const emptyAllocation: Allocation={...base,saleId:'a',expenseId:null,saleLineId:'line',amountVnd:null,physicalGram:null,settlementGram:null,animalCount:null};
// @ts-expect-error expense cannot allocate physical output
const invalidExpenseAllocation: Allocation={...base,saleId:null,expenseId:'a',saleLineId:null,amountVnd:'1',physicalGram:'1',settlementGram:null,animalCount:null};
// @ts-expect-error a deposit application must have no cash direction
const wrongApplyDirection: Extract<Settlement,{kind:'deposit_apply'}>['cashDirection']='out';
void [emptyAllocation,invalidExpenseAllocation,wrongApplyDirection];
