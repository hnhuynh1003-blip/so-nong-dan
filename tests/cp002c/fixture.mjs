// Synthetic explicit records only; no production approval. No caller-supplied engine.
export const AUTH='FIXTURE_ONLY', SCOPE='rice-sheet-whole', T0='2026-01-01T00:00:00.000Z', T1='2026-02-01T00:00:00.000Z', T2='2026-03-01T00:00:00.000Z', T3='2026-04-01T00:00:00.000Z';
export const q=(n,d='1')=>({numerator:String(n),denominator:String(d)});
export const normal=x=>JSON.parse(JSON.stringify(x));
export function setOf(C,{owner='o',pid='p1',ver=1,aid='a1',eid='e1',start=T0,end=null}={}){
  const p={authority:AUTH,ownerId:owner,policyId:pid,policyKey:C.POLICY_KEY,policyVersion:ver,definitionSchemaVersion:1,definition:normal(C.B_DEFINITION),definitionSha256:'e6a77f8c8385cf2064dcac17987e92bdd3013048826d14cf6002602f96b11c63',canonicalizationVersion:C.CANONICALIZATION_VERSION,sourceRef:`fixture:${pid}`};
  const a={authority:AUTH,ownerId:owner,approvalId:aid,policyId:pid,definitionSha256:p.definitionSha256,scope:SCOPE,decisionTime:T0,evidenceRef:`fixture:${aid}`};
  const e={authority:AUTH,kind:'INTERVAL',ownerId:owner,effectivityId:eid,policyId:pid,approvalId:aid,definitionSha256:p.definitionSha256,scope:SCOPE,start,end,evidenceRef:`fixture:${eid}`};return {authority:AUTH,policies:[p],approvals:[a],effectivities:[e]};
}
export function merge(a,b){return {authority:AUTH,policies:[...a.policies,...b.policies],approvals:[...a.approvals,...b.approvals],effectivities:[...a.effectivities,...b.effectivities]};}
export function retire(set,at=T2){const s=normal(set),e=s.effectivities[0];const {start,end,...base}=e;s.effectivities.push({...base,kind:'RETIREMENT',effectivityId:'retire-p1',retiredAt:at,evidenceRef:'fixture:retire'});return s;}
export function input({owner='o',sid='s',rev='r1',raws=['1500'],ratio=q(1),price='7351',mode='gram',positions=raws.map((_,i)=>String(i+1)),groupId=null}={}){
  const b={ownerId:owner,sheetId:sid,batchId:'b'};return {ownerId:owner,sheetId:sid,revisionId:rev,groupId,batches:[b],slots:raws.map((raw,i)=>({position:String(positions[i]),bag:raw===null||raw===''?raw:{...b,bagId:`bag-${i+1}`,mode,raw}})),tare:ratio===null?null:{method:'proportional',scope:'sheet',bagsPerKg:ratio},priceVndPerKg:price,saleScope:'whole-sheet'};
}
export const request=(input,requestedPolicyId=null,evaluationTime=T1)=>({authority:AUTH,input,evaluationTime,businessDate:'2026-01-31',requestedPolicyId});
export const select=(C,set,owner='o',at=T1,pid=null)=>C.evaluateFixture(set,{authority:AUTH,ownerId:owner,evaluationTime:at,requestedPolicyId:pid},trustedFixture(set,at));

// Synthetic independent fixture authority. Never use a candidate hash to create an expected anchor.
// Production hosts must supply trusted anchors separately; this helper exists only in test fixtures.
import {createHash} from 'node:crypto';
export function referenceCanonical(x){
 if(x===null||typeof x!=='object')return JSON.stringify(x);
 if(Array.isArray(x))return '['+x.map(referenceCanonical).join(',')+']';
 return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+referenceCanonical(x[k])).join(',')+'}';
}
export const referenceDigest=(x,domain)=>createHash('sha256').update(domain==='definition'?'':`SND/C-P1/${domain.toUpperCase()}/v1\0`).update(referenceCanonical(x)).digest('hex');
export function trustedFixture(set,decisionTime=T1,changeEvidence=null){
 const records=[];for(const [kind,field,key] of [['POLICY','policies','policyId'],['APPROVAL','approvals','approvalId'],['EFFECTIVITY','effectivities','effectivityId']])for(const r of set[field])records.push({kind,ownerId:r.ownerId,recordId:r[key],sha256:referenceDigest(r,'fixture')});
 return {authority:AUTH,decisionTime,records,changeEvidenceSha256:changeEvidence===null?null:referenceDigest(changeEvidence,'change')};
}
