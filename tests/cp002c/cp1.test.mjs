import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync,writeFileSync,appendFileSync,mkdtempSync,cpSync,rmSync,unlinkSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {pathToFileURL} from 'node:url';import {spawnSync} from 'node:child_process';
import {AUTH,SCOPE,T0,T1,T2,T3,q,normal,setOf,merge,retire,input,request,select,trustedFixture} from './fixture.mjs';
const build=process.env.SND_C_BUILD,vectorPath=process.env.SND_C_VECTORS,out=process.env.SND_C_SNAPSHOTS;if(!build||!vectorPath||!out)throw Error('Use verification runner');
const C=await import(pathToFileURL(join(build,'modules/policy/cp1/index.js')));const enc=s=>new TextEncoder().encode(s),dec=b=>new TextDecoder().decode(b),sha=x=>createHash('sha256').update(x).digest('hex');
// Synthetic expected context comes from independently constructed fixture records.
const create=(set,req)=>C.createSnapshot(set,req,trustedFixture(set,req.evaluationTime));
const createBytes=(set,bytes)=>C.createSnapshotFromBytes(set,bytes,trustedFixture(set,T1));
const replay=(s,set,anchor)=>C.replaySnapshot(s,set,anchor,trustedFixture(set,T3));
const replayBytes=(bytes,set,anchor)=>C.replaySnapshotBytes(bytes,set,anchor,trustedFixture(set,T3));
const err=(fn,code)=>assert.throws(fn,e=>e&&e.code===code);const eq=(a,b)=>assert.deepEqual(normal(a),normal(b));const snap=(s=setOf(C),x=input())=>create(s,request(x));
const check=(s,set=setOf(C),anchor=s.snapshotSha256,status='VERIFIED',reason)=>{const r=replay(s,set,anchor);assert.equal(r.status,status,JSON.stringify(r));assert.equal(r.authority,AUTH);if(reason)assert.equal(r.reason,reason);return r;};
function rehash(s){const {snapshotSha256,...body}=s;s.snapshotSha256=C.snapshotBodyDigest(body).sha256;return s;}
function changed(s,mut){const x=normal(s);mut(x);return x;}
function frozen(x){if(x&&typeof x==='object'){for(const v of Object.values(x))frozen(v);Object.freeze(x);}return x;}
const vectors=readFileSync(vectorPath,'utf8').trimEnd().split('\n').map(JSON.parse);

test('C-01 AR08: canonical equivalence, UTF16 order, independent bytes and SHA256',()=>{
 const a=C.parseRestrictedJson(enc(' { "z": [true, null, "0"], "a" : "x" } '));const b=C.parseRestrictedJson(enc('{"a":"x","z":[true,null,"0"]}'));assert.equal(dec(C.canonicalBytes(a)),'{"a":"x","z":[true,null,"0"]}');assert.deepEqual(C.canonicalBytes(a),C.canonicalBytes(b));
 assert.equal(dec(C.canonicalBytes({'\ue000':'x','😀':'y','é':'a','e\u0301':'b'})),'{"é":"b","é":"a","😀":"y","":"x"}');
 assert.equal(dec(C.canonicalBytes({a:'\b\t\n\f\r\u0000/\\"'})),'{"a":"\\b\\t\\n\\f\\r\\u0000/\\\\\\\""}');
 assert.notEqual(sha(C.canonicalBytes('é')),sha(C.canonicalBytes('e\u0301')));let n=0;
 for(const v of vectors.filter(x=>x.kind==='canonical')){assert.equal(Buffer.from(C.canonicalBytes(v.value)).toString('hex'),v.canonicalHex);assert.equal(C.canonicalDigest(v.value,'policy','definition').sha256,v.sha256);assert.equal(C.canonicalDigest(C.parseRestrictedJson(enc(JSON.stringify(v.value))),'policy','definition').sha256,v.sha256);n++;}assert.equal(n,512);console.log('canonical-oracle',n);
});
test('C-02 AR08/CAL11: raw parser adversarial and typed boundary',()=>{
 for(const s of ['{"a":"1","a":"2"}','{"a":"1","\\u0061":"2"}','{"😀":null,"\\ud83d\\ude00":true}','{"__proto__":null,"__proto__":true}'])err(()=>C.parseRestrictedJson(enc(s)),'DUPLICATE_KEY');
 for(const bytes of [Uint8Array.from([0xc0,0xaf]),Uint8Array.from([0xed,0xa0,0x80]),Uint8Array.from([0xf0,0x9f]),Uint8Array.from([0xff])])err(()=>C.parseRestrictedJson(bytes),'INVALID_UTF8');
 for(const s of ['"\\ud800"','"\\udc00"','{"\\ud800":null}'])err(()=>C.parseRestrictedJson(enc(s)),'INVALID_UNICODE');
 for(const s of ['{','[1,]','{"a":true,}','{"a" true}','"\\x00"','"\\u12zz"','true false','\ufeff{}'])assert.throws(()=>C.parseRestrictedJson(enc(s)),e=>['INVALID_JSON','INVALID_NUMBER'].includes(e.code));
 for(const s of ['{"definitionSchemaVersion":-0}','{"definitionSchemaVersion":1.0}','{"definitionSchemaVersion":1e0}','{"definitionSchemaVersion":01}','{"definitionSchemaVersion":1000001}','{"raw":443}','{"definition":{"policyVersion":1}}','[1]'])err(()=>C.parseRestrictedJson(enc(s)),'INVALID_NUMBER');
 eq(C.parseRestrictedJson(enc('{"definitionSchemaVersion":1000000}')),{definitionSchemaVersion:1000000});
 for(const n of [-0,1.5,NaN,Infinity,-1,1000001])err(()=>C.canonicalBytes({definitionSchemaVersion:n}),'INVALID_NUMBER');
 err(()=>C.canonicalBytes({raw:1}),'INVALID_NUMBER');err(()=>C.canonicalBytes('\ud800'),'INVALID_UNICODE');err(()=>C.canonicalBytes({['\udc00']:null}),'INVALID_UNICODE');
 const cyc={};cyc.self=cyc;err(()=>C.canonicalBytes(cyc),'INVALID_SHAPE');let called=0;const acc={get x(){called++;return 'x';}};err(()=>C.canonicalBytes(acc),'INVALID_SHAPE');assert.equal(called,0);
 const proxy=new Proxy({},{ownKeys(){called++;throw Error('trap');}});err(()=>C.canonicalBytes(proxy),'INVALID_SHAPE');assert.equal(called,0);err(()=>C.canonicalBytes(new Date()),'INVALID_SHAPE');err(()=>C.canonicalBytes([,]),'INVALID_SHAPE');err(()=>C.canonicalBytes({[Symbol('x')]:true}),'INVALID_SHAPE');err(()=>C.canonicalBytes(Object.defineProperty({},'x',{value:true})),'INVALID_SHAPE');err(()=>C.canonicalBytes({x:undefined}),'INVALID_TYPE');
 const safe=C.parseRestrictedJson(enc('{"__proto__":{"polluted":true}}'));assert.equal(Object.getPrototypeOf(safe),null);assert.equal({}.polluted,undefined);assert.equal(safe.__proto__.polluted,true);
 const depth=n=>'['.repeat(n)+'null'+']'.repeat(n);C.parseRestrictedJson(enc(depth(31)));err(()=>C.parseRestrictedJson(enc(depth(32))),'RESOURCE_LIMIT');
 C.parseRestrictedJson(enc(' '.repeat(65534)+'{}'));err(()=>C.parseRestrictedJson(enc(' '.repeat(65535)+'{}')),'RESOURCE_LIMIT');
 C.canonicalBytes('a'.repeat(65534));err(()=>C.canonicalBytes('a'.repeat(65535)),'RESOURCE_LIMIT');err(()=>C.canonicalBytes('\u0000'.repeat(11000)),'RESOURCE_LIMIT');
 // Actual node-bound parser and serializer exercise, within byte limit; root counts as node.
 const tooMany=enc('['+'null,'.repeat(3999999)+'null]');err(()=>C.parseRestrictedJson(tooMany,'snapshot'),'RESOURCE_LIMIT');err(()=>C.canonicalBytes(Array(4000000).fill(null),'snapshot'),'RESOURCE_LIMIT');
});
test('C-03 AR08: exact definition hash anchor and ordered tampering',()=>{
 const set=setOf(C),p=set.policies[0];assert.equal(C.definitionDigest(1,p.definition),'e6a77f8c8385cf2064dcac17987e92bdd3013048826d14cf6002602f96b11c63');
 const changedDef=normal(p.definition);changedDef.steps.reverse();assert.notEqual(C.definitionDigest(1,changedDef),p.definitionSha256);
 err(()=>C.validatePolicy({...p,definition:changedDef}),'HASH_MISMATCH');err(()=>C.validatePolicy({...p,definition:changedDef,definitionSha256:C.definitionDigest(1,changedDef)}),'UNSUPPORTED_POLICY');
 const imp=normal(p.definition);imp.steps[3].impurity='extra';err(()=>C.validatePolicy({...p,definition:imp,definitionSha256:C.definitionDigest(1,imp)}),'UNSUPPORTED_POLICY');
 err(()=>C.validatePolicy({...p,definitionSchemaVersion:2,definitionSha256:C.definitionDigest(2,p.definition)}),'UNSUPPORTED_POLICY');err(()=>C.validatePolicy({...p,extra:true}),'INVALID_SHAPE');eq(C.parsePolicyRecord(enc(JSON.stringify(p))),p);err(()=>C.parsePolicyRecord(enc('{"authority":"FIXTURE_ONLY","authority":"FIXTURE_ONLY"}')),'DUPLICATE_KEY');err(()=>C.parsePolicyRecord(enc('{}')),'INVALID_SHAPE');eq(C.parseFixtureSet(enc(JSON.stringify(set))),C.validateFixtureSet(set));
});
test('C-04 CAL12/AR08: immutable fixture records and version uniqueness',()=>{
 const s=setOf(C),v=C.validateFixtureSet(s);assert.ok(Object.isFrozen(v.policies[0].definition.steps));const original=JSON.stringify(v);s.policies[0].definition.steps.reverse();assert.equal(JSON.stringify(v),original);assert.throws(()=>{v.policies[0].sourceRef='other';});
 const a=setOf(C);err(()=>C.validateFixtureSet({...a,policies:[...a.policies,...a.policies]}),'DUPLICATE_ID');const b=setOf(C,{pid:'p2',aid:'a2',eid:'e2'});err(()=>C.validateFixtureSet(merge(a,b)),'DUPLICATE_ID');
 const c=setOf(C,{owner:'other'});assert.equal(C.validateFixtureSet(merge(a,c)).policies.length,2);
});
test('C-05 T05/AR08: approval/effectivity wrong owner, policy, hash, scope and fixture marker',()=>{
 const s=setOf(C);for(const [k,v,code] of [['ownerId','other','PARENT_MISMATCH'],['policyId','p2','PARENT_MISMATCH'],['definitionSha256','0'.repeat(64),'HASH_MISMATCH'],['scope','batch','WRONG_SCOPE'],['authority','PRODUCTION','FIXTURE_ONLY_REQUIRED']]){
  const t=changed(s,x=>x.approvals[0][k]=v);assert.equal(select(C,t).status,'REJECTED');assert.equal(select(C,t).reason,code);
 }for(const [k,v,code] of [['ownerId','other','PARENT_MISMATCH'],['approvalId','a2','PARENT_MISMATCH'],['definitionSha256','0'.repeat(64),'HASH_MISMATCH'],['scope','batch','WRONG_SCOPE'],['authority','PRODUCTION','FIXTURE_ONLY_REQUIRED']])assert.equal(select(C,changed(s,x=>x.effectivities[0][k]=v)).reason,code);
 assert.equal(select(C,changed(s,x=>x.approvals[0].decisionTime=T2)).reason,'INVALID_EFFECTIVITY');assert.equal(select(C,s,'other',T1,'p1').status,'REJECTED');
});
test('C-06 CAL12/T05: explicit time, half-open boundaries, overlap and retirement',()=>{
 const s=setOf(C,{end:T2});assert.equal(select(C,s,'o','2025-12-31T23:59:59.999Z').status,'BLOCKED');assert.equal(select(C,s,'o',T0).status,'ELIGIBLE_FIXTURE');assert.equal(select(C,s,'o',T2).status,'BLOCKED');
 const b=setOf(C,{pid:'p2',ver:2,aid:'a2',eid:'e2',start:T1});const overlap=merge(s,b);assert.equal(select(C,overlap,'o',T1).status,'AMBIGUOUS');assert.equal(select(C,overlap,'o',T1,'p1').status,'AMBIGUOUS');assert.equal(select(C,overlap,'o',T2,'p1').status,'REJECTED');assert.equal(select(C,overlap,'o',T2,'p2').status,'ELIGIBLE_FIXTURE');
 const r=retire(setOf(C));assert.equal(select(C,r,'o',T1,'p1').status,'ELIGIBLE_FIXTURE');assert.equal(select(C,r,'o',T2,'p1').status,'BLOCKED');assert.equal(select(C,r,'o',T3).status,'BLOCKED');
 assert.equal(select(C,changed(s,x=>x.effectivities[0].end=T0)).reason,'INVALID_EFFECTIVITY');const duplicate=changed(s,x=>x.effectivities.push({...x.effectivities[0],effectivityId:'e2'}));assert.equal(select(C,duplicate).reason,'INVALID_EFFECTIVITY');
 assert.equal(select(C,changed(r,x=>x.effectivities.push({...x.effectivities[0],effectivityId:'e2',start:T3}))).reason,'INVALID_EFFECTIVITY');assert.equal(select(C,s,'o','2026-02-30T00:00:00.000Z').status,'REJECTED');
});
test('C-07 CAL01/02/06/08/11/AR03: full snapshot fields, independent Fraction and domain hashes',()=>{
 assert.equal(C.engineAvailable(),true);let n=0;writeFileSync(out,'');
 for(const v of vectors.filter(x=>x.kind==='snapshot')){
   const set=frozen(v.fixtures),source=frozen(v.input),before=JSON.stringify(source);const s=create(set,{authority:AUTH,input:source,evaluationTime:v.evaluationTime,businessDate:v.businessDate,requestedPolicyId:'p1'});
   eq(s.input,source);eq(s.result,v.result);eq(s.policy,set.policies[0]);eq(s.approval,set.approvals[0]);eq(s.effectivity,set.effectivities[0]);assert.equal(s.inputSha256,v.inputSha256);assert.equal(s.resultSha256,v.resultSha256);assert.equal(s.ownerId,source.ownerId);assert.equal(s.sheetId,source.sheetId);assert.equal(s.revisionId,source.revisionId);assert.equal(s.kind,'PREVIEW_EVIDENCE');assert.equal(s.authority,AUTH);assert.equal(s.result.status,'PREVIEW');assert.equal(s.businessDate,v.businessDate);assert.equal(s.evaluationTime,v.evaluationTime);assert.equal(s.canonicalizationVersion,C.CANONICALIZATION_VERSION);eq(s.engine,C.engineIdentity());assert.equal(JSON.stringify(source),before);assert.ok(Object.isFrozen(s));assert.ok(Object.isFrozen(s.input.slots));assert.ok(Object.isFrozen(s.result.slots));check(s,set);appendFileSync(out,JSON.stringify(s)+'\n');n++;
 }assert.equal(n,134);console.log('fraction-snapshots',n);
 const x=input({raws:['44300','1500',''],positions:['6','1','75'],ratio:q(3)}),s=snap(setOf(C),x);assert.deepEqual(s.input.slots.map(x=>x.position),['6','1','75']);assert.deepEqual(s.result.slots.map(x=>x.position),['1','6','75']);assert.notEqual(s.inputSha256,s.resultSha256);const copied=C.parseRestrictedJson(C.canonicalBytes(s,'snapshot'),'snapshot');check(copied,setOf(C),s.snapshotSha256);const raw=createBytes(setOf(C),enc(JSON.stringify(request(x))));assert.equal(raw.snapshotSha256,s.snapshotSha256);assert.equal(replayBytes(C.canonicalBytes(s,'snapshot'),setOf(C),s.snapshotSha256).status,'VERIFIED');assert.equal(replayBytes(enc('{"a":1,"a":2}'),setOf(C),s.snapshotSha256).status,'MISMATCH');
});
test('C-08 AR08: tamper input, result, refs and recomputed internal hashes',()=>{
 const set=setOf(C),s=snap(set);const original=JSON.stringify(s);assert.equal(s.result.amountVnd.numerator,'7351');
 for(const mutate of [x=>x.input.slots[0].bag.raw='2500',x=>x.result.residualGram.numerator='0',x=>x.revisionId='r2',x=>x.businessDate='2026-02-01',x=>x.policy.sourceRef='fixture:forged',x=>x.approval.evidenceRef='fixture:forged',x=>x.effectivity.evidenceRef='fixture:forged',x=>x.engine.artifacts[0].sha256='0'.repeat(64)]){
   const t=changed(s,mutate);check(t,set,s.snapshotSha256,'MISMATCH');rehash(t);check(t,set,s.snapshotSha256,'MISMATCH');
 }
 // Even a supplied anchor for a forged internal digest cannot replace trusted external refs or actual B output.
 const p=rehash(changed(s,x=>x.policy.sourceRef='fixture:forged'));check(p,set,p.snapshotSha256,'MISMATCH','PINNED_REFERENCE');
 const a=rehash(changed(s,x=>x.approval.evidenceRef='fixture:forged'));check(a,set,a.snapshotSha256,'MISMATCH','PINNED_REFERENCE');const ef=rehash(changed(s,x=>x.effectivity.evidenceRef='fixture:forged'));check(ef,set,ef.snapshotSha256,'MISMATCH','PINNED_REFERENCE');
 const r=changed(s,x=>x.result.physicalNetGram=q(501));r.resultSha256=C.canonicalDigest(r.result,'snapshot','result').sha256;rehash(r);check(r,set,r.snapshotSha256,'MISMATCH','RESULT_FIELDS');
 const e=rehash(changed(s,x=>x.engine.artifacts[0].sha256='f'.repeat(64)));check(e,set,e.snapshotSha256,'MISMATCH','ENGINE_IDENTITY');
 const d=changed(s,x=>{x.input.slots[0].bag.raw='2500';x.inputSha256=C.canonicalDigest(x.input,'snapshot','input').sha256;});rehash(d);check(d,set,d.snapshotSha256,'MISMATCH','RESULT_FIELDS');
 assert.equal(JSON.stringify(s),original);assert.equal(replay(s,set,null).reason,'ANCHOR_UNAVAILABLE');assert.equal(replay(null,set,s.snapshotSha256).reason,'SNAPSHOT_UNAVAILABLE');
});
test('C-09 T05/CAL12: old policy after new version and retirement',()=>{
 const old=setOf(C),s=snap(old),newer=setOf(C,{pid:'p2',ver:2,aid:'a2',eid:'e2',start:T2}),history=merge(retire(old),newer);
 check(s,history);const next=create(history,request(input(),null,T3));assert.equal(next.policy.policyId,'p2');assert.equal(s.policy.policyId,'p1');err(()=>create(history,request(input(),'p1',T3)),'REJECTED');
 check(s,newer,s.snapshotSha256,'UNAVAILABLE','UNKNOWN_POLICY');check(s,{authority:AUTH,policies:old.policies,approvals:[],effectivities:[]},s.snapshotSha256,'UNAVAILABLE','APPROVAL_UNAVAILABLE');check(s,{authority:AUTH,policies:old.policies,approvals:old.approvals,effectivities:[]},s.snapshotSha256,'UNAVAILABLE','EFFECTIVITY_UNAVAILABLE');
 const retro=merge(setOf(C),setOf(C,{pid:'p2',ver:2,aid:'a2',eid:'e2',start:T0}));check(s,retro,s.snapshotSha256,'MISMATCH','PINNED_EFFECTIVITY');
});
test('C-10 AR08: fixed actual artifact binding and untrusted engine replacement',async()=>{
 const s=snap();const altered=rehash(changed(s,x=>{x.engine.sourceCommit='f'.repeat(40);x.engine.artifacts[0].sha256='a'.repeat(64);}));check(altered,setOf(C),s.snapshotSha256,'MISMATCH');check(altered,setOf(C),altered.snapshotSha256,'UNAVAILABLE','ENGINE_UNAVAILABLE');
 const scratch=mkdtempSync(join(tmpdir(),'snd-c-binding-'));try{
  writeFileSync(join(scratch,'package.json'),' {"type":"module"}\n');const artifacts=['modules/rice/calculation/index.js','modules/shared/exact-arithmetic/index.js','modules/policy/cp1/static-adapter.js'];
  for(const [i,path] of artifacts.entries()){
   const dist=join(scratch,'dist'+i);cpSync(build,dist,{recursive:true});const target=join(dist,path);writeFileSync(target,"console.log('UNTRUSTED_ARTIFACT_EXECUTED'); throw new Error('wrong artifact');\n");
   const url=pathToFileURL(join(dist,'modules/policy/cp1/index.js')).href;const script=`const C=await import(${JSON.stringify(url)});if(C.engineAvailable())throw Error('bad binding');console.log(JSON.stringify(C.replaySnapshot(${JSON.stringify(s)},${JSON.stringify(setOf(C))},${JSON.stringify(s.snapshotSha256)},${JSON.stringify(trustedFixture(setOf(C),T3))})));`;
   const r=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.includes('UNTRUSTED_ARTIFACT_EXECUTED'),false);assert.equal(JSON.parse(r.stdout).reason,'ENGINE_UNAVAILABLE');
  }
  const forgedDist=join(scratch,'forged');cpSync(build,forgedDist,{recursive:true});const wrong="export { previewRiceGroupBP1 as preview } from '../../rice/calculation/index.js';\n";writeFileSync(join(forgedDist,artifacts[2]),wrong);const forged=rehash(changed(s,x=>x.engine.artifacts[2].sha256=sha(wrong)));const forgedURL=pathToFileURL(join(forgedDist,'modules/policy/cp1/index.js')).href;const f=spawnSync(process.execPath,['--input-type=module','-e',`const C=await import(${JSON.stringify(forgedURL)});if(C.engineAvailable())throw Error('bad adapter');console.log(JSON.stringify(C.replaySnapshot(${JSON.stringify(forged)},${JSON.stringify(setOf(C))},${JSON.stringify(forged.snapshotSha256)},${JSON.stringify(trustedFixture(setOf(C),T3))})));`],{encoding:'utf8'});assert.equal(f.status,0,f.stderr);assert.equal(JSON.parse(f.stdout).reason,'ENGINE_IDENTITY');
  const dist=join(scratch,'missing');cpSync(build,dist,{recursive:true});unlinkSync(join(dist,artifacts[0]));const url=pathToFileURL(join(dist,'modules/policy/cp1/index.js')).href;const r=spawnSync(process.execPath,['--input-type=module','-e',`const C=await import(${JSON.stringify(url)});console.log(C.engineAvailable())`],{encoding:'utf8'});assert.equal(r.status,0);assert.equal(r.stdout.trim(),'false');
  const late=join(scratch,'late');cpSync(build,late,{recursive:true});const lateURL=pathToFileURL(join(late,'modules/policy/cp1/index.js')).href;const L=await import(lateURL);assert.equal(L.engineAvailable(),true);writeFileSync(join(late,artifacts[2]),'export function preview(){}');assert.equal(L.engineAvailable(),false);assert.equal(L.replaySnapshot(s,setOf(C),s.snapshotSha256,trustedFixture(setOf(C),T3)).reason,'ENGINE_UNAVAILABLE');
 console.log('engine-binding: 3 altered artifacts, forged manifest/wrong adapter, missing artifact, late mutation rejected; no untrusted artifact executed');
 }finally{rmSync(scratch,{recursive:true,force:true});}
});
test('C-11 CAL12/T05: correction plan original policy/engine, distinct revision, no change activation',()=>{
 const set=setOf(C),s=snap(set),before=JSON.stringify(s),history=merge(retire(set),setOf(C,{pid:'p2',ver:2,aid:'a2',eid:'e2',start:T2}));const next=input({rev:'r2',raws:['2500']});const r=C.planCorrection(s,history,s.snapshotSha256,{authority:AUTH,newInput:next,policyChange:null},trustedFixture(history,T3));assert.equal(r.status,'PLANNED_FIXTURE');assert.equal(r.authority,AUTH);assert.equal(r.policy.policyId,'p1');eq(r.engine,s.engine);assert.equal(r.newRevisionId,'r2');eq(r.newPreview.amountVnd,q(14702));assert.equal(JSON.stringify(s),before);assert.equal(Object.isFrozen(next),false);
 const plan=(x,pc=null,approved=null)=>C.planCorrection(s,history,s.snapshotSha256,{authority:AUTH,newInput:x,policyChange:pc},trustedFixture(history,T3,approved));assert.equal(plan(input()).reason,'DISTINCT_REVISION_REQUIRED');assert.equal(plan(input({sid:'other',rev:'r2'})).reason,'UNSUPPORTED_SCOPE_CHANGE');assert.equal(plan(input({groupId:'g',rev:'r2'})).reason,'UNSUPPORTED_SCOPE_CHANGE');
 const change={authority:AUTH,purpose:'RULE_CHANGE_PLAN_ONLY',originalSnapshotSha256:s.snapshotSha256,ownerId:'o',sheetId:'s',fromRevisionId:'r1',toRevisionId:'r2',fromPolicyId:'p1',fromDefinitionSha256:s.policy.definitionSha256,toPolicyId:'p2',toDefinitionSha256:history.policies[1].definitionSha256,approvalId:'a2',decisionTime:T3,evidenceRef:'fixture:separate-change'};assert.equal(plan(next,change,change).reason,'POLICY_CHANGE_DEFERRED');assert.equal(plan(next,{...change,approvalId:'missing'},change).reason,'POLICY_CHANGE_APPROVAL_REQUIRED');assert.equal(plan(next,{...change,authority:'PRODUCTION'}).status,'BLOCKED');assert.equal(C.planCorrection(s,{authority:AUTH,policies:[],approvals:[],effectivities:[]},s.snapshotSha256,{authority:AUTH,newInput:next,policyChange:null},trustedFixture(history,T3)).reason,'UNKNOWN_POLICY');
});
test('C-12 T05: historical UNKNOWN observed amount and provenance preserved',()=>{
 const obs={authority:AUTH,ownerId:'o',observationId:'old',policy:'UNKNOWN',observedAmount:q(10123450),unit:'VND',sourceRef:'fixture:paper',verificationStatus:'UNVERIFIED'};eq(C.historicalUnknown(obs),obs);eq(C.historicalUnknown({...obs,observedAmount:q(0)}),{...obs,observedAmount:q(0)});eq(C.historicalUnknown({...obs,observedAmount:null}),{...obs,observedAmount:null});eq(C.historicalUnknown({...obs,observedAmount:q(1,3),unit:'kg'}),{...obs,observedAmount:q(1,3),unit:'kg'});err(()=>C.historicalUnknown({...obs,observedAmount:q(2,4)}),'NONCANONICAL');err(()=>C.historicalUnknown({...obs,policy:'p1'}),'DOMAIN');
});
test('C-13 AR11 fixture-only, exact shape and no posting/receipt bypass',()=>{
 const s=setOf(C);assert.equal(C.validateFixtureSet(s).authority,AUTH);assert.equal(select(C,{...s,authority:'PRODUCTION'}).reason,'FIXTURE_ONLY_REQUIRED');err(()=>create(s,{...request(input()),authority:'PRODUCTION'}),'FIXTURE_ONLY_REQUIRED');err(()=>create(s,{...request(input()),result:{amountVnd:q(0)}}),'INVALID_SHAPE');err(()=>create(s,{...request(input()),engine:C.engineIdentity()}),'INVALID_SHAPE');
 const p=snap(s);assert.equal(p.authority,AUTH);assert.equal(p.result.status,'PREVIEW');for(const k of ['journal','receipt','posted','transaction','finalized','cashReceipt','debt'])assert.equal(Object.hasOwn(p,k),false);const t=rehash(changed(p,x=>x.authority='PRODUCTION'));check(t,s,t.snapshotSha256,'MISMATCH');
 err(()=>C.historicalUnknown({authority:'PRODUCTION',ownerId:'o',observationId:'old',policy:'UNKNOWN',observedAmount:q(0),unit:'VND',sourceRef:'fixture:paper',verificationStatus:'UNVERIFIED'}),'FIXTURE_ONLY_REQUIRED');
});
test('C-14 A/B immutable artifact pins and accepted hand anchor continuity',()=>{
 const id=C.engineIdentity();assert.equal(id.sourceCommit,'b4f94a3fe24c02be292247184aeaca33b2375a4a');assert.equal(id.arithmeticSourceCommit,'80fb95175e902e6bea3caac518a8a6b25b9c1815');for(const x of id.artifacts)assert.equal(sha(readFileSync(join(build,x.path))),x.sha256);assert.ok(Object.isFrozen(id.artifacts[0]));
 const x=input({raws:['443','463','454'],mode:'three-digit',ratio:q(10),price:'7350'}),s=snap(setOf(C),x);eq(s.result.grossGram,q(136000));eq(s.result.tareGram,q(300));eq(s.result.physicalNetGram,q(135700));eq(s.result.settlementGram,q(136000));eq(s.result.amountVnd,q(999600));
});
test('C-15 CAL11/AR08: limits, bounded snapshots and no partial output',()=>{
 const s=setOf(C);err(()=>C.validateFixtureSet({...s,policies:Array(999).fill(s.policies[0])}),'RESOURCE_LIMIT');const tooLong=changed(s,x=>x.policies[0].policyId='x'.repeat(129));err(()=>C.validateFixtureSet(tooLong),'RESOURCE_LIMIT');
 err(()=>create(s,request({...input(),slots:Array(100001).fill({position:'1',bag:null})})),'RESOURCE_LIMIT');err(()=>create(s,request({...input(),saleScope:'partial'})),'WRONG_SCOPE');
 const p=snap();const {snapshotSha256,...body}=p;const full=C.canonicalDigest(p,'snapshot','definition'),b=C.snapshotBodyDigest(body);assert.equal(full.bytes,b.bytes+(',"snapshotSha256":""'.length+64));assert.equal(full.nodes,b.nodes+2);
 const oversized=enc(' '.repeat(67108865));err(()=>C.parseRestrictedJson(oversized,'snapshot'),'RESOURCE_LIMIT');
});
