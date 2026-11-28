/** Immutable supplied fixtures, not a persistent registry. */
import {CANONICALIZATION_VERSION as CV,C_LIMITS,CError,fail,record,array,copyJson,freezeDeep,canonicalDigest,sameJson,type Json} from './canonical.js';
export const AUTHORITY='FIXTURE_ONLY' as const;
export const SCOPE='rice-sheet-whole' as const;
export const POLICY_KEY='rice-sheet-single-price-v1' as const;
export const B_DEFINITION=freezeDeep({profile:'B-P1 v1.0',saleScope:'whole-sheet',price:'positive-integral-vnd-per-kg-sheet-input',groupRounding:'none',moneyRounding:'none',steps:[
  {op:'gross-sum',unit:'g'}, {op:'proportional-tare',scope:'sheet',ratio:'sheet-input-bags-per-kg',unit:'g'},
  {op:'physical-net',unit:'g'}, {op:'commercial-net',impurity:'none',additionalDeduction:'none',unit:'g'},
  {op:'settlement',method:'nearest',quantum:{numerator:'1000',denominator:'1'},tie:'positive',unit:'g',scope:'sheet'},
  {op:'exact-amount',unit:'VND'}]});
export interface Policy {readonly authority:typeof AUTHORITY;readonly ownerId:string;readonly policyId:string;readonly policyKey:string;readonly policyVersion:number;readonly definitionSchemaVersion:number;readonly definition:Json;readonly definitionSha256:string;readonly canonicalizationVersion:typeof CV;readonly sourceRef:string}
export interface Approval {readonly authority:typeof AUTHORITY;readonly ownerId:string;readonly approvalId:string;readonly policyId:string;readonly definitionSha256:string;readonly scope:typeof SCOPE;readonly decisionTime:string;readonly evidenceRef:string}
interface EffectBase {readonly authority:typeof AUTHORITY;readonly ownerId:string;readonly effectivityId:string;readonly policyId:string;readonly approvalId:string;readonly definitionSha256:string;readonly scope:typeof SCOPE;readonly evidenceRef:string}
export interface Interval extends EffectBase {readonly kind:'INTERVAL';readonly start:string;readonly end:string|null}
export interface Retirement extends EffectBase {readonly kind:'RETIREMENT';readonly retiredAt:string}
export type Effectivity=Interval|Retirement;
export interface FixtureSet {readonly authority:typeof AUTHORITY;readonly policies:readonly Policy[];readonly approvals:readonly Approval[];readonly effectivities:readonly Effectivity[]}
export type Selection={readonly authority:typeof AUTHORITY;readonly status:'ELIGIBLE_FIXTURE';readonly policy:Policy;readonly approval:Approval;readonly effectivity:Interval;readonly evaluationTime:string}|{readonly authority:typeof AUTHORITY;readonly status:'BLOCKED'|'AMBIGUOUS'|'REJECTED';readonly reason:string};
export const POLICY_KEYS=['authority','ownerId','policyId','policyKey','policyVersion','definitionSchemaVersion','definition','definitionSha256','canonicalizationVersion','sourceRef'] as const;
export const APPROVAL_KEYS=['authority','ownerId','approvalId','policyId','definitionSha256','scope','decisionTime','evidenceRef'] as const;
const EFFECT_KEYS=['authority','kind','ownerId','effectivityId','policyId','approvalId','definitionSha256','scope','evidenceRef'] as const;
export const INTERVAL_KEYS=[...EFFECT_KEYS,'start','end'] as const;
const RETIREMENT_KEYS=[...EFFECT_KEYS,'retiredAt'] as const;
export function fixture(v:unknown):void{if(v!==AUTHORITY)fail('FIXTURE_ONLY_REQUIRED','Fixture authority required');}
export function id(v:unknown):string{if(typeof v!=='string')fail('INVALID_TYPE','ID string required');if(v.length>C_LIMITS.idLength)fail('RESOURCE_LIMIT','ID too long');if(!/^[A-Za-z0-9][A-Za-z0-9._:-]*(?![\s\S])/.test(v))fail('NONCANONICAL','Invalid identity');return v;}
export function digest(v:unknown):string{if(typeof v!=='string'||!/^[a-f0-9]{64}(?![\s\S])/.test(v))fail('NONCANONICAL','SHA-256 lowercase hex required');return v;}
export function time(v:unknown):string{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z(?![\s\S])/.test(v))fail('NONCANONICAL','UTC millisecond timestamp required');const ms=Date.parse(v);if(!Number.isFinite(ms)||new Date(ms).toISOString()!==v)fail('DOMAIN','Invalid UTC timestamp');return v;}
export function businessDate(v:unknown):string{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}(?![\s\S])/.test(v))fail('NONCANONICAL','Business date required');time(v+'T00:00:00.000Z');return v;}
function scope(v:unknown):void{if(v!==SCOPE)fail('WRONG_SCOPE','Only rice-sheet-whole');}
function metadataVersion(v:unknown):number{if(typeof v!=='number'||!Number.isInteger(v)||v<1||v>C_LIMITS.metadataMax)fail('DOMAIN','Positive metadata version required');return v;}
export function definitionDigest(definitionSchemaVersion:unknown,definition:unknown):string{return canonicalDigest({definitionSchemaVersion,definition},'policy','definition').sha256;}
export function validatePolicy(v:unknown):Policy{
  const c=copyJson(v,'policy'),p=record(c,POLICY_KEYS);fixture(p.authority);id(p.ownerId);id(p.policyId);id(p.policyKey);metadataVersion(p.policyVersion);metadataVersion(p.definitionSchemaVersion);id(p.sourceRef);digest(p.definitionSha256);
  if(p.canonicalizationVersion!==CV)fail('UNSUPPORTED_POLICY','Unsupported canonicalization version');
  if(definitionDigest(p.definitionSchemaVersion,p.definition)!==p.definitionSha256)fail('HASH_MISMATCH','Policy definition hash');
  if(p.definitionSchemaVersion!==1||p.policyKey!==POLICY_KEY||!sameJson(p.definition,B_DEFINITION))fail('UNSUPPORTED_POLICY','Only accepted B-P1 definition executable');
  return c as unknown as Policy;
}
export function validateApproval(v:unknown):Approval{const c=copyJson(v,'policy'),p=record(c,APPROVAL_KEYS);fixture(p.authority);id(p.ownerId);id(p.approvalId);id(p.policyId);digest(p.definitionSha256);scope(p.scope);time(p.decisionTime);id(p.evidenceRef);return c as unknown as Approval;}
export function validateEffectivity(v:unknown):Effectivity{
  const c=copyJson(v,'policy');if(typeof c!=='object'||c===null||Array.isArray(c))fail('INVALID_SHAPE','Effectivity record');const kind=c.kind;
  if(kind!=='INTERVAL'&&kind!=='RETIREMENT')fail('INVALID_SHAPE','Effectivity kind');const e=record(c,kind==='INTERVAL'?INTERVAL_KEYS:RETIREMENT_KEYS);fixture(e.authority);id(e.ownerId);id(e.effectivityId);id(e.policyId);id(e.approvalId);digest(e.definitionSha256);scope(e.scope);id(e.evidenceRef);
  if(kind==='INTERVAL'){const start=time(e.start),end=e.end===null?null:time(e.end);if(end!==null&&end<=start)fail('INVALID_EFFECTIVITY','Invalid half-open interval');}else time(e.retiredAt);
  return c as unknown as Effectivity;
}
const key=(owner:string,identity:string)=>owner+'\0'+identity;
function put<T>(m:Map<string,T>,k:string,v:T):void{if(m.has(k))fail('DUPLICATE_ID','Duplicate identity/version');m.set(k,v);}
export interface Indexed {set:FixtureSet;policies:Map<string,Policy>;approvals:Map<string,Approval>;effects:Map<string,Effectivity>;intervals:Interval[];retirements:Map<string,Retirement>}
export function inspectFixtureSet(input:unknown,partial=false):Indexed{
  const r=record(input,['authority','policies','approvals','effectivities']);fixture(r.authority);const ps=array(r.policies,C_LIMITS.records),as=array(r.approvals,C_LIMITS.records),es=array(r.effectivities,C_LIMITS.records);if(ps.length+as.length+es.length>C_LIMITS.records)fail('RESOURCE_LIMIT','Fixture set exceeds total record limit');
  const policies=new Map<string,Policy>(),versions=new Map<string,Policy>(),approvals=new Map<string,Approval>(),effects=new Map<string,Effectivity>(),retirements=new Map<string,Retirement>(),intervals:Interval[]=[];
  for(const raw of ps){const p=validatePolicy(raw);put(policies,key(p.ownerId,p.policyId),p);put(versions,key(p.ownerId,p.policyKey)+'\0'+p.policyVersion,p);}
  for(const raw of as){const a=validateApproval(raw),p=policies.get(key(a.ownerId,a.policyId));if(!p&&!partial)fail('PARENT_MISMATCH','Approval policy owner or identity');if(p&&a.definitionSha256!==p.definitionSha256)fail('HASH_MISMATCH','Approval definition hash');put(approvals,key(a.ownerId,a.approvalId),a);}
  for(const raw of es){const e=validateEffectivity(raw),p=policies.get(key(e.ownerId,e.policyId)),a=approvals.get(key(e.ownerId,e.approvalId));if((!partial&&(!p||!a))||(a&&a.policyId!==e.policyId))fail('PARENT_MISMATCH','Effectivity policy/approval owner or identity');if((p&&e.definitionSha256!==p.definitionSha256)||(a&&e.definitionSha256!==a.definitionSha256))fail('HASH_MISMATCH','Effectivity definition hash');if(a&&e.scope!==a.scope)fail('WRONG_SCOPE','Effectivity approval scope');if(a&&a.decisionTime>(e.kind==='INTERVAL'?e.start:e.retiredAt))fail('INVALID_EFFECTIVITY','Effectivity before approval');put(effects,key(e.ownerId,e.effectivityId),e);if(e.kind==='RETIREMENT')put(retirements,key(e.ownerId,e.policyId),e);else intervals.push(e);}
  const histories=new Map<string,Interval[]>();for(const e of intervals){const k=key(e.ownerId,e.policyId),rt=retirements.get(k);if(rt&&e.start>=rt.retiredAt)fail('INVALID_EFFECTIVITY','Interval starts at/after retirement');const list=histories.get(k)??[];list.push(e);histories.set(k,list);}
  for(const k of retirements.keys())if(!partial&&!histories.has(k))fail('INVALID_EFFECTIVITY','Retirement without interval');
  for(const [k,list] of histories){list.sort((a,b)=>a.start<b.start?-1:a.start>b.start?1:0);const rt=retirements.get(k);for(let i=1;i<list.length;i++){const prev=list[i-1]!;let end=prev.end;if(rt&&(end===null||rt.retiredAt<end))end=rt.retiredAt;if(end===null||list[i]!.start<end)fail('INVALID_EFFECTIVITY','Overlapping history for one policy');}}
  const set=freezeDeep({authority:AUTHORITY,policies:[...policies.values()],approvals:[...approvals.values()],effectivities:[...effects.values()]});return {set,policies,approvals,effects,intervals,retirements};
}
export function validateFixtureSet(input:unknown):FixtureSet{return inspectFixtureSet(input).set;}

/** Independently supplied, complete fixture inventory. Structural validity alone is not authority.
 * The host must obtain this context from a trusted fixture source, never from the records being checked. */
export type AnchorKind='POLICY'|'APPROVAL'|'EFFECTIVITY';
export interface FixtureAnchor {readonly kind:AnchorKind;readonly ownerId:string;readonly recordId:string;readonly sha256:string}
export interface TrustedFixtureContext {readonly authority:typeof AUTHORITY;readonly decisionTime:string;readonly records:readonly FixtureAnchor[];readonly changeEvidenceSha256:string|null}
interface TrustedIndex {readonly context:TrustedFixtureContext;readonly anchors:ReadonlyMap<string,string>}
const anchorKey=(kind:AnchorKind,owner:string,identity:string)=>kind+'\0'+key(owner,identity);
export function inspectTrustedContext(input:unknown):TrustedIndex|null{
  if(input===null||input===undefined)return null;
  const r=record(input,['authority','decisionTime','records','changeEvidenceSha256']);fixture(r.authority);const at=time(r.decisionTime),change=r.changeEvidenceSha256===null?null:digest(r.changeEvidenceSha256);
  const records:FixtureAnchor[]=[],anchors=new Map<string,string>();for(const raw of array(r.records,C_LIMITS.records)){
    const a=record(raw,['kind','ownerId','recordId','sha256']);if(a.kind!=='POLICY'&&a.kind!=='APPROVAL'&&a.kind!=='EFFECTIVITY')fail('INVALID_SHAPE','Fixture anchor kind');
    const entry:FixtureAnchor={kind:a.kind,ownerId:id(a.ownerId),recordId:id(a.recordId),sha256:digest(a.sha256)};put(anchors,anchorKey(entry.kind,entry.ownerId,entry.recordId),entry.sha256);records.push(entry);
  }
  const context:TrustedFixtureContext=freezeDeep({authority:AUTHORITY,decisionTime:at,records,changeEvidenceSha256:change});return {context,anchors};
}
export function hasRecordAnchor(trust:TrustedIndex,kind:AnchorKind,owner:string,identity:string):boolean{return trust.anchors.has(anchorKey(kind,owner,identity));}
export function checkRecordAnchor(trust:TrustedIndex,kind:AnchorKind,owner:string,identity:string,value:unknown):boolean{
  const expected=trust.anchors.get(anchorKey(kind,owner,identity));if(expected===undefined)return false;
  if(canonicalDigest(value,'policy','fixture').sha256!==expected)fail('HASH_MISMATCH','Trusted fixture record differs');return true;
}
/** Verify every available record before reporting incomplete evidence. */
export function verifyFixtureAnchors(i:Indexed,trust:TrustedIndex):boolean{
  for(const p of i.set.policies)if(!checkRecordAnchor(trust,'POLICY',p.ownerId,p.policyId,p))fail('HASH_MISMATCH','Unanchored policy');
  for(const a of i.set.approvals)if(!checkRecordAnchor(trust,'APPROVAL',a.ownerId,a.approvalId,a))fail('HASH_MISMATCH','Unanchored approval');
  for(const e of i.set.effectivities)if(!checkRecordAnchor(trust,'EFFECTIVITY',e.ownerId,e.effectivityId,e))fail('HASH_MISMATCH','Unanchored effectivity');
  return i.policies.size+i.approvals.size+i.effects.size===trust.anchors.size;
}
/** In a partial replay set, a missing dependency must itself be expected by the trusted inventory. */
export function checkMissingDependencies(i:Indexed,trust:TrustedIndex):void{
  for(const a of i.set.approvals)if(!i.policies.has(key(a.ownerId,a.policyId))&&!hasRecordAnchor(trust,'POLICY',a.ownerId,a.policyId))fail('PARENT_MISMATCH','Unanchored missing policy');
  for(const e of i.set.effectivities){
    if(!i.policies.has(key(e.ownerId,e.policyId))&&!hasRecordAnchor(trust,'POLICY',e.ownerId,e.policyId))fail('PARENT_MISMATCH','Unanchored missing policy');
    if(!i.approvals.has(key(e.ownerId,e.approvalId))&&!hasRecordAnchor(trust,'APPROVAL',e.ownerId,e.approvalId))fail('PARENT_MISMATCH','Unanchored missing approval');
  }
}
export function eligibleAt(i:Indexed,owner:string,at:string):Interval[]{return i.intervals.filter(e=>e.ownerId===owner&&e.start<=at&&(e.end===null||at<e.end)&&(!i.retirements.has(key(owner,e.policyId))||at<i.retirements.get(key(owner,e.policyId))!.retiredAt));}
export function selectAt(i:Indexed,owner:string,at:string,requested:string|null):Selection{
  const eligible=eligibleAt(i,owner,at);
  if(eligible.length>1)return {authority:AUTHORITY,status:'AMBIGUOUS',reason:'OVERLAPPING_APPLICABLE_POLICIES'};
  if(requested!==null&&!i.policies.has(key(owner,requested)))return {authority:AUTHORITY,status:'REJECTED',reason:'UNKNOWN_POLICY'};
  if(eligible.length===0)return {authority:AUTHORITY,status:'BLOCKED',reason:'NO_ELIGIBLE_POLICY'};
  const e=eligible[0]!;if(requested!==null&&requested!==e.policyId)return {authority:AUTHORITY,status:'REJECTED',reason:'REQUESTED_POLICY_INELIGIBLE'};
  return freezeDeep({authority:AUTHORITY,status:'ELIGIBLE_FIXTURE',policy:i.policies.get(key(owner,e.policyId))!,approval:i.approvals.get(key(owner,e.approvalId))!,effectivity:e,evaluationTime:at});
}
/** As-of simulation only; cannot authorize creation at a backdated time. */
export function evaluateFixture(input:unknown,request:unknown,trusted?:unknown):Selection{
  try{
    const q=record(request,['authority','ownerId','evaluationTime','requestedPolicyId']);fixture(q.authority);const owner=id(q.ownerId),at=time(q.evaluationTime),requested=q.requestedPolicyId===null?null:id(q.requestedPolicyId);const i=inspectFixtureSet(input);const trust=inspectTrustedContext(trusted);
    if(!trust||!verifyFixtureAnchors(i,trust))return {authority:AUTHORITY,status:'BLOCKED',reason:'FIXTURE_ANCHOR_UNAVAILABLE'};
    return selectAt(i,owner,at,requested);
  }catch(e){if(e instanceof CError)return {authority:AUTHORITY,status:'REJECTED',reason:e.code};throw e;}
}
/** New snapshot uses only the explicit trusted fixture decision time. */
export function selectForCreation(input:unknown,request:unknown,trusted:unknown):Selection{
  const chosen=evaluateFixture(input,request,trusted);if(chosen.status!=='ELIGIBLE_FIXTURE')return chosen;
  const trust=inspectTrustedContext(trusted)!;
  if(chosen.evaluationTime!==trust.context.decisionTime)return {authority:AUTHORITY,status:'BLOCKED',reason:'CREATION_TIME_MISMATCH'};
  return chosen;
}
