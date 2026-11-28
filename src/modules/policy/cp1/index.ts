/** C-P1 fixture-only API. Not imported by production UI or existing A/B. */
export {CANONICALIZATION_VERSION,C_LIMITS,CError,canonicalBytes,canonicalDigest,parseRestrictedJson,snapshotBodyDigest} from './canonical.js';
export type {CCode,Json,Envelope,DigestDomain,Metrics} from './canonical.js';
export {AUTHORITY,SCOPE,POLICY_KEY,B_DEFINITION,definitionDigest,validatePolicy,validateFixtureSet,evaluateFixture} from './fixtures.js';
export type {Policy,Approval,Effectivity,Interval,Retirement,FixtureSet,Selection,TrustedFixtureContext,FixtureAnchor,AnchorKind} from './fixtures.js';
export {engineIdentity,engineAvailable} from './engine.js';
export type {EngineIdentity} from './engine.js';
export {createSnapshot,replaySnapshot,historicalUnknown,planCorrection} from './snapshot.js';
export type {SnapshotBody,Snapshot,ReplayOutcome,CorrectionOutcome} from './snapshot.js';

// Raw-byte entry points: syntax and duplicate detection precede schema validation.
import {parseRestrictedJson as decode,CError as DecodeError} from './canonical.js';
import {validatePolicy as policy,validateFixtureSet as fixtures} from './fixtures.js';
import {createSnapshot as create,replaySnapshot as replay,type ReplayOutcome} from './snapshot.js';
export function parsePolicyRecord(bytes:unknown){return policy(decode(bytes,'policy'));}
export function parseFixtureSet(bytes:unknown){return fixtures(decode(bytes,'snapshot'));}
export function createSnapshotFromBytes(set:unknown,requestBytes:unknown,trusted?:unknown){return create(set,decode(requestBytes,'snapshot'),trusted);}
export function replaySnapshotBytes(bytes:unknown,set:unknown,expectedSnapshotSha256:unknown,trusted?:unknown):ReplayOutcome{
  if(bytes===null||bytes===undefined)return replay(null,set,expectedSnapshotSha256,trusted);
  try{const parsed=decode(bytes,'snapshot');if(parsed===null)return {authority:'FIXTURE_ONLY',status:'MISMATCH',reason:'INVALID_SHAPE'};return replay(parsed,set,expectedSnapshotSha256,trusted);}catch(e){if(e instanceof DecodeError)return {authority:'FIXTURE_ONLY',status:'MISMATCH',reason:e.code};throw e;}
}
