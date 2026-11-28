/** Single sheet preview evidence and historical fixture replay. No authoritative writes. */
import {CANONICALIZATION_VERSION as CV,CError,fail,record,array,copyJson,freezeDeep,canonicalDigest,snapshotBodyDigest,sameJson} from './canonical.js';
import {AUTHORITY,fixture,id,digest,time,businessDate,selectForCreation,validateFixtureSet,validatePolicy,validateApproval,validateEffectivity,inspectFixtureSet,inspectTrustedContext,verifyFixtureAnchors,checkRecordAnchor,checkMissingDependencies,eligibleAt,selectAt,type Policy,type Approval,type Interval} from './fixtures.js';
import {engineIdentity,engineAvailable,engineMatches,validateEngineIdentity,invokeVerifiedB,validateVerifiedRational,type EngineIdentity} from './engine.js';
import type {SheetInput,SheetPreview} from '../../rice/calculation/index.js';
export interface SnapshotBody {
  readonly authority:typeof AUTHORITY; readonly kind:'PREVIEW_EVIDENCE'; readonly snapshotSchemaVersion:1;readonly canonicalizationVersion:typeof CV;
  readonly ownerId:string;readonly sheetId:string;readonly revisionId:string;readonly input:SheetInput;readonly inputSha256:string;
  readonly policy:Policy;readonly approval:Approval;readonly effectivity:Interval;readonly evaluationTime:string;readonly businessDate:string;
  readonly engine:EngineIdentity;readonly result:SheetPreview;readonly resultSha256:string;
}
export interface Snapshot extends SnapshotBody {readonly snapshotSha256:string}
const SHEET_KEYS=['ownerId','sheetId','revisionId','groupId','batches','slots','tare','priceVndPerKg','saleScope'] as const;
const BODY_KEYS=['authority','kind','snapshotSchemaVersion','canonicalizationVersion','ownerId','sheetId','revisionId','input','inputSha256','policy','approval','effectivity','evaluationTime','businessDate','engine','result','resultSha256'] as const;
const SNAP_KEYS=[...BODY_KEYS,'snapshotSha256'] as const;
function sheetIds(input:unknown){const r=record(input,SHEET_KEYS);const ownerId=id(r.ownerId),sheetId=id(r.sheetId),revisionId=id(r.revisionId),groupId=r.groupId===null?null:id(r.groupId);if(r.saleScope!=='whole-sheet')fail('WRONG_SCOPE','Single whole-sheet only');return {ownerId,sheetId,revisionId,groupId};}
// B-P1 wire shape remains known even if executable artifacts are absent. Numeric semantics
// and complete result equality still require the actual accepted adapter; no reimplemented arithmetic.
function wireString(v:unknown):void{if(typeof v!=='string')fail('INVALID_TYPE','Expected B-P1 string field');}
function wireRational(v:unknown,nullable=false):void{if(nullable&&v===null)return;const r=record(v,['numerator','denominator']);wireString(r.numerator);wireString(r.denominator);}
function wireList(v:unknown,visit:(x:unknown)=>void):void{for(const x of array(v,100000))visit(x);}
function wireBag(v:unknown,trace:boolean):void{
  const r=record(v,trace?['ownerId','sheetId','batchId','bagId','mode','raw','grossGram']:['ownerId','sheetId','batchId','bagId','mode','raw']);
  for(const k of ['ownerId','sheetId','batchId','bagId','raw'])wireString(r[k]);if(r.mode!=='three-digit'&&r.mode!=='gram')fail('DOMAIN','B-P1 bag mode');if(trace)wireRational(r.grossGram);
}
function verifyWireShapes(input:unknown,result:Record<string,unknown>):void{
  const r=record(input,SHEET_KEYS);
  wireList(r.batches,x=>{const b=record(x,['ownerId','sheetId','batchId']);for(const k of ['ownerId','sheetId','batchId'])wireString(b[k]);});
  wireList(r.slots,x=>{const sl=record(x,['position','bag']);wireString(sl.position);if(sl.bag!==null&&sl.bag!=='')wireBag(sl.bag,false);});
  if(r.tare!==null){const t=record(r.tare,['method','scope','bagsPerKg']);if(t.method!=='proportional'||t.scope!=='sheet')fail('WRONG_SCOPE','B-P1 tare shape');wireRational(t.bagsPerKg);}
  if(r.priceVndPerKg!==null)wireString(r.priceVndPerKg);
  for(const k of ['count','slotSpan'])wireString(result[k]);wireRational(result.grossGram);
  for(const k of ['tareRatio','tareGram','physicalNetGram','commercialNetGram','settlementGram','residualGram','amountVnd'])wireRational(result[k],true);
  if(result.priceVndPerKg!==null)wireString(result.priceVndPerKg);
  if(!['EMPTY','MISSING_TARE','MISSING_PRICE','COMPLETE'].includes(result.completeness as string))fail('DOMAIN','B-P1 completeness');
  wireList(result.slots,x=>{const sl=record(x,['position','layout','bag']);wireString(sl.position);const l=record(sl.layout,['row','column','columnInBoard','board','boardInPage','page']);for(const v of Object.values(l))wireString(v);if(sl.bag!==null)wireBag(sl.bag,true);});
  for(const k of ['columns','boards','pages'])wireList(result[k],x=>{const b=record(x,['index','count','grossGram']);wireString(b.index);wireString(b.count);wireRational(b.grossGram);});
}
function equalIds(a:{ownerId:string;sheetId:string;revisionId:string},b:{ownerId:string;sheetId:string;revisionId:string}):boolean{return a.ownerId===b.ownerId&&a.sheetId===b.sheetId&&a.revisionId===b.revisionId;}
export function createSnapshot(set:unknown,request:unknown,trusted?:unknown):Snapshot {
  const q=record(request,['authority','input','evaluationTime','businessDate','requestedPolicyId']);fixture(q.authority);const at=time(q.evaluationTime),date=businessDate(q.businessDate);
  const input=copyJson(q.input,'snapshot') as unknown as SheetInput;const {ownerId,sheetId,revisionId}=sheetIds(input);
  const chosen=selectForCreation(set,{authority:AUTHORITY,ownerId,evaluationTime:at,requestedPolicyId:q.requestedPolicyId},trusted);if(chosen.status!=='ELIGIBLE_FIXTURE')fail(chosen.status,chosen.reason);
  if(!engineAvailable())fail('ENGINE_UNAVAILABLE','No verified fixed adapter');
  const inputSha256=canonicalDigest(input,'snapshot','input').sha256;
  const result=invokeVerifiedB(input);if(!equalIds(result,{ownerId,sheetId,revisionId})||result.status!=='PREVIEW')throw Error('Accepted adapter invariant');
  const resultSha256=canonicalDigest(result,'snapshot','result').sha256;
  const body:SnapshotBody={authority:AUTHORITY,kind:'PREVIEW_EVIDENCE',snapshotSchemaVersion:1,canonicalizationVersion:CV,ownerId,sheetId,revisionId,input,inputSha256,policy:chosen.policy,approval:chosen.approval,effectivity:chosen.effectivity,evaluationTime:at,businessDate:date,engine:engineIdentity(),result,resultSha256};
  const snapshotSha256=snapshotBodyDigest(body).sha256;
  return freezeDeep({...body,snapshotSha256});
}
export type ReplayOutcome={readonly authority:typeof AUTHORITY;readonly status:'VERIFIED';readonly snapshotSha256:string}|{readonly authority:typeof AUTHORITY;readonly status:'MISMATCH'|'UNAVAILABLE';readonly reason:string};
const mismatch=(reason:string):ReplayOutcome=>({authority:AUTHORITY,status:'MISMATCH',reason});
const unavailable=(reason:string):ReplayOutcome=>({authority:AUTHORITY,status:'UNAVAILABLE',reason});
function knownCalcError(e:unknown):e is Error&{code:string}{return e instanceof Error&&(e.name==='RiceError'||e.name==='ArithmeticError')&&typeof (e as Error&{code?:unknown}).code==='string';}
/** Absent transport is unavailable; malformed supplied complete snapshot is a mismatch.
 * Within bounded validation, known contradictions win before unrelated absent evidence. */
export function replaySnapshot(snapshot:unknown,set:unknown,expectedSnapshotSha256:unknown,trusted?:unknown):ReplayOutcome {
  if(snapshot===null||snapshot===undefined)return unavailable('SNAPSHOT_UNAVAILABLE');
  try{
    const r=record(snapshot,SNAP_KEYS);fixture(r.authority);
    if(r.kind!=='PREVIEW_EVIDENCE'||r.snapshotSchemaVersion!==1||r.canonicalizationVersion!==CV)return mismatch('SNAPSHOT_SCHEMA');
    // Body budget reserves the entire digest field; validate every nested supplied value before reads.
    const ownDigest=digest(r.snapshotSha256),body:Record<string,unknown>=Object.create(null);for(const k of BODY_KEYS)body[k]=r[k];
    if(snapshotBodyDigest(body).sha256!==ownDigest)return mismatch('SNAPSHOT_HASH');
    const anchor=expectedSnapshotSha256===null||expectedSnapshotSha256===undefined?null:digest(expectedSnapshotSha256);
    if(anchor!==null&&anchor!==ownDigest)return mismatch('SNAPSHOT_HASH');
    const ownerId=id(r.ownerId),sheetId=id(r.sheetId),revisionId=id(r.revisionId),at=time(r.evaluationTime);businessDate(r.businessDate);
    const inputIds=sheetIds(r.input);if(!equalIds(inputIds,{ownerId,sheetId,revisionId}))return mismatch('INPUT_IDENTITY');
    if(canonicalDigest(r.input,'snapshot','input').sha256!==digest(r.inputSha256))return mismatch('INPUT_HASH');
    if(canonicalDigest(r.result,'snapshot','result').sha256!==digest(r.resultSha256))return mismatch('RESULT_HASH');
    const result=record(r.result,['status','profile','ownerId','sheetId','revisionId','groupId','saleScope','count','grossGram','slotSpan','slots','columns','boards','pages','tareRatio','tareGram','physicalNetGram','commercialNetGram','settlementGram','residualGram','priceVndPerKg','amountVnd','completeness']);
    if(result.status!=='PREVIEW'||result.profile!=='B-P1 v1.0'||result.ownerId!==ownerId||result.sheetId!==sheetId||result.revisionId!==revisionId||result.groupId!==inputIds.groupId||result.saleScope!=='whole-sheet')return mismatch('ENGINE_RESULT_IDENTITY');
    verifyWireShapes(r.input,result);
    // Supplied pinned records must be fully valid and internally bound even when external resources are absent.
    const policy=validatePolicy(r.policy),approval=validateApproval(r.approval),effect=validateEffectivity(r.effectivity);
    if(effect.kind!=='INTERVAL')return mismatch('PINNED_EFFECTIVITY');
    const policyId=policy.policyId,approvalId=approval.approvalId,effectivityId=effect.effectivityId;
    if(policy.ownerId!==ownerId||approval.ownerId!==ownerId||effect.ownerId!==ownerId)return mismatch('REFERENCE_OWNER');
    if(approval.policyId!==policyId||effect.policyId!==policyId||effect.approvalId!==approvalId||approval.definitionSha256!==policy.definitionSha256||effect.definitionSha256!==policy.definitionSha256||effect.scope!==approval.scope)return mismatch('PINNED_REFERENCE');
    if(approval.decisionTime>effect.start||at<effect.start||(effect.end!==null&&at>=effect.end))return mismatch('PINNED_EFFECTIVITY');
    const pinned=validateEngineIdentity(r.engine),matches=engineMatches(pinned);
    if(!matches&&pinned.sourceCommit===engineIdentity().sourceCommit)return mismatch('ENGINE_IDENTITY');
    const trust=inspectTrustedContext(trusted),i=set===null||set===undefined?null:inspectFixtureSet(set,true);
    if(trust&&at>trust.context.decisionTime)return mismatch('PINNED_EFFECTIVITY');
    const p=i?.set.policies.find(x=>x.ownerId===ownerId&&x.policyId===policyId),a=i?.set.approvals.find(x=>x.ownerId===ownerId&&x.approvalId===approvalId),e=i?.set.effectivities.find(x=>x.ownerId===ownerId&&x.effectivityId===effectivityId);
    // Available contradicting records are compared before any absent resource return.
    if((p&&!sameJson(p,policy))||(a&&!sameJson(a,approval))||(e&&!sameJson(e,effect)))return mismatch('PINNED_REFERENCE');
    let anchoredPolicy=false,anchoredApproval=false,anchoredEffect=false,complete=false;
    if(trust){
      anchoredPolicy=checkRecordAnchor(trust,'POLICY',ownerId,policyId,policy);
      anchoredApproval=checkRecordAnchor(trust,'APPROVAL',ownerId,approvalId,approval);
      anchoredEffect=checkRecordAnchor(trust,'EFFECTIVITY',ownerId,effectivityId,effect);
      if(i){complete=verifyFixtureAnchors(i,trust);checkMissingDependencies(i,trust);if(complete)validateFixtureSet(i.set);}
    }
    if(i){
      const eligible=eligibleAt(i,ownerId,at),retired=i.set.effectivities.some(x=>x.kind==='RETIREMENT'&&x.ownerId===ownerId&&x.policyId===policyId&&x.retiredAt<=at);
      if(retired||eligible.length>1||eligible.some(x=>x.effectivityId!==effectivityId))return mismatch('PINNED_EFFECTIVITY');
      if(p&&a&&e&&complete){const chosen=selectAt(i,ownerId,at,policyId);if(chosen.status!=='ELIGIBLE_FIXTURE'||chosen.approval.approvalId!==approvalId||chosen.effectivity.effectivityId!==effectivityId)return mismatch('PINNED_EFFECTIVITY');}
    }
    // Only the known verified engine may run (pure preview). This catches available input/result contradictions
    // even if an unrelated anchor or reference is missing. Never substitute a newer/different engine.
    const available=matches&&engineAvailable();
    if(available){const calculated=invokeVerifiedB(r.input);if(!equalIds(calculated,{ownerId,sheetId,revisionId})||calculated.status!=='PREVIEW')return mismatch('ENGINE_RESULT_IDENTITY');if(!sameJson(calculated,r.result,'snapshot'))return mismatch('RESULT_FIELDS');}
    if(anchor===null)return unavailable('ANCHOR_UNAVAILABLE');
    if(!trust)return unavailable('FIXTURE_ANCHOR_UNAVAILABLE');
    if(!i)return unavailable('EVIDENCE_SET_UNAVAILABLE');
    if(!p||!anchoredPolicy)return unavailable('UNKNOWN_POLICY');
    if(!a||!anchoredApproval)return unavailable('APPROVAL_UNAVAILABLE');
    if(!e||!anchoredEffect)return unavailable('EFFECTIVITY_UNAVAILABLE');
    if(!complete)return unavailable('FIXTURE_EVIDENCE_UNAVAILABLE');
    if(!available)return unavailable('ENGINE_UNAVAILABLE');
    return {authority:AUTHORITY,status:'VERIFIED',snapshotSha256:ownDigest};
  }catch(e){if(e instanceof CError)return e.code==='ENGINE_UNAVAILABLE'?unavailable(e.code):mismatch(e.code);if(knownCalcError(e))return mismatch(e.code);throw e;}
}
export function historicalUnknown(input:unknown){
  const c=copyJson(input,'policy');const r=record(c,['authority','ownerId','observationId','policy','observedAmount','unit','sourceRef','verificationStatus']);fixture(r.authority);id(r.ownerId);id(r.observationId);id(r.sourceRef);if(r.policy!=='UNKNOWN')fail('DOMAIN','Unknown historical policy required');
  if(r.unit!=='VND'&&r.unit!=='g'&&r.unit!=='kg')fail('DOMAIN','Observation unit');if(r.verificationStatus!=='UNVERIFIED'&&r.verificationStatus!=='VERIFIED'&&r.verificationStatus!=='DISPUTED')fail('DOMAIN','Observation verification status');
  if(r.observedAmount!==null)validateVerifiedRational(r.observedAmount);return c;
}
export type CorrectionOutcome={readonly authority:typeof AUTHORITY;readonly status:'BLOCKED';readonly reason:string}|{readonly authority:typeof AUTHORITY;readonly status:'PLANNED_FIXTURE';readonly originalSnapshotSha256:string;readonly ownerId:string;readonly sheetId:string;readonly originalRevisionId:string;readonly newRevisionId:string;readonly policy:Policy;readonly approval:Approval;readonly effectivity:Interval;readonly engine:EngineIdentity;readonly newInput:SheetInput;readonly newPreview:SheetPreview};
const blocked=(reason:string):CorrectionOutcome=>({authority:AUTHORITY,status:'BLOCKED',reason});
export function planCorrection(snapshot:unknown,set:unknown,expectedSnapshotSha256:unknown,request:unknown,trusted?:unknown):CorrectionOutcome{
  try{
    const q=record(request,['authority','newInput','policyChange']);fixture(q.authority);
    const verified=replaySnapshot(snapshot,set,expectedSnapshotSha256,trusted);if(verified.status!=='VERIFIED')return blocked(verified.reason);
    const old=snapshot as Snapshot;const next=copyJson(q.newInput,'snapshot') as unknown as SheetInput;const ids=sheetIds(next);
    if(ids.ownerId!==old.ownerId||ids.sheetId!==old.sheetId||ids.groupId!==old.input.groupId)return blocked('UNSUPPORTED_SCOPE_CHANGE');
    if(ids.revisionId===old.revisionId)return blocked('DISTINCT_REVISION_REQUIRED');
    if(q.policyChange!==null){
      // A separate fixture authorization is required, but C-P1 never executes a changed policy.
      const ch=record(copyJson(q.policyChange,'policy'),['authority','purpose','originalSnapshotSha256','ownerId','sheetId','fromRevisionId','toRevisionId','fromPolicyId','fromDefinitionSha256','toPolicyId','toDefinitionSha256','approvalId','decisionTime','evidenceRef']);fixture(ch.authority);
      for(const v of [ch.ownerId,ch.sheetId,ch.fromRevisionId,ch.toRevisionId,ch.fromPolicyId,ch.toPolicyId,ch.approvalId,ch.evidenceRef])id(v);digest(ch.fromDefinitionSha256);digest(ch.toDefinitionSha256);digest(ch.originalSnapshotSha256);const when=time(ch.decisionTime);const trust=inspectTrustedContext(trusted)!;
      if(ch.purpose!=='RULE_CHANGE_PLAN_ONLY'||ch.originalSnapshotSha256!==verified.snapshotSha256||ch.fromDefinitionSha256!==old.policy.definitionSha256||when>trust.context.decisionTime||trust.context.changeEvidenceSha256===null||canonicalDigest(ch,'policy','change').sha256!==trust.context.changeEvidenceSha256)return blocked('POLICY_CHANGE_APPROVAL_REQUIRED');
      if(ch.ownerId!==old.ownerId||ch.sheetId!==old.sheetId||ch.fromRevisionId!==old.revisionId||ch.toRevisionId!==ids.revisionId||ch.fromPolicyId!==old.policy.policyId||ch.toPolicyId===old.policy.policyId)return blocked('POLICY_CHANGE_APPROVAL_REQUIRED');
      const s=validateFixtureSet(set),p=s.policies.find(x=>x.ownerId===old.ownerId&&x.policyId===ch.toPolicyId),a=s.approvals.find(x=>x.ownerId===old.ownerId&&x.approvalId===ch.approvalId);
      if(!p||!a||a.policyId!==p.policyId||a.definitionSha256!==p.definitionSha256||p.definitionSha256!==ch.toDefinitionSha256||a.decisionTime>when||old.evaluationTime>when)return blocked('POLICY_CHANGE_APPROVAL_REQUIRED');
      return blocked('POLICY_CHANGE_DEFERRED');
    }
    const newPreview=invokeVerifiedB(next);
    const plan:CorrectionOutcome={authority:AUTHORITY,status:'PLANNED_FIXTURE',originalSnapshotSha256:verified.snapshotSha256,ownerId:old.ownerId,sheetId:old.sheetId,originalRevisionId:old.revisionId,newRevisionId:ids.revisionId,policy:copyJson(old.policy,'policy') as unknown as Policy,approval:copyJson(old.approval,'policy') as unknown as Approval,effectivity:copyJson(old.effectivity,'policy') as unknown as Interval,engine:engineIdentity(),newInput:next,newPreview};
    // The planned response is also bounded, and no input/old snapshot is frozen or mutated.
    canonicalDigest(plan,'snapshot','definition');return freezeDeep(plan);
  }catch(e){if(e instanceof CError)return blocked(e.code);if(knownCalcError(e))return blocked(e.code);throw e;}
}
