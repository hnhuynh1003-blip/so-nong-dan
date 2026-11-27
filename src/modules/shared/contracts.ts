/** Transport contracts only; validation/arithmetic are future checkpoint work. */
export type IntegerString = string; // canonical signed decimal integer; validate at trust boundary
export type UUID = string;
export type BusinessDate = string; // YYYY-MM-DD in Asia/Ho_Chi_Minh
export type Verification = 'unverified' | 'confirmed' | 'estimated';
export type Coverage = 'unknown' | 'partial' | 'complete' | 'confirmed_zero';
export interface EntityMeta { id: UUID; ownerId: UUID; version: number; createdAt: string; updatedAt: string }
export interface RationalWire { numerator: IntegerString; denominator: IntegerString }
export interface SourceRef { sourceId: UUID; verification: Verification }
export interface SyncEnvelope { ownerId: UUID; entityId: UUID; mutationId: UUID; baseVersion: number; operation: 'upsert' | 'void'; payload: unknown }
export interface ModuleBoundary { route: string; label: string; description: string; checkpoint: string }
