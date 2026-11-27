import type { EntityMeta, RationalWire, SourceRef, UUID } from './contracts.js';
/** Registry definition is immutable once inserted. No default or approved policy is supplied. */
export type RoundingMethod = 'exact' | 'floor' | 'nearest' | 'ceil';
export type RoundingTie = 'half_up' | 'half_down' | 'half_even' | 'half_away_from_zero' | 'half_toward_zero';
export type RoundingScope = 'batch' | 'line' | 'sheet' | 'sale';
export type RoundingStep = {quantity: 'settlement_gram' | 'revenue_vnd'; scope: RoundingScope} & (
 {method: 'exact'; quantum: null; tie: null} |
 {method: 'floor' | 'ceil'; quantum: RationalWire; tie: null} |
 {method: 'nearest'; quantum: RationalWire; tie: RoundingTie});
export interface RoundingDefinition { steps: readonly RoundingStep[] }
export interface RoundingPolicyVersion extends EntityMeta, SourceRef {
 policyKey: string; policyVersion: number; definitionSchemaVersion: number;
 definition: RoundingDefinition; definitionSha256: string;
}
export interface RoundingPolicyApproval extends EntityMeta {
 policyId: UUID; approvedAt: string; sourceId: UUID;
}
