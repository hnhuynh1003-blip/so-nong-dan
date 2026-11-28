import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {readFileSync} from 'node:fs';
import {AUTH,T0,T1,T2,T3,q,normal,setOf,merge,retire,input,request,select,trustedFixture,referenceDigest} from './fixture.mjs';
const C=await import(pathToFileURL(join(process.env.SND_C_BUILD,'modules/policy/cp1/index.js')));
const enc=s=>new TextEncoder().encode(s), err=(f,c)=>assert.throws(f,e=>e.code===c), eq=(a,b)=>assert.deepEqual(normal(a),normal(b));
const sha=b=>createHash('sha256').update(b).digest('hex');
test('F01 C-02: structural numeric paths',()=>{
 const valid={policies:[{policyVersion:1,definitionSchemaVersion:2}],policy:{policyVersion:3},snapshotSchemaVersion:1};
 eq(C.parseRestrictedJson(enc(JSON.stringify(valid))),valid);C.canonicalBytes(valid);
 for(const v of [{policies:{'0':{policyVersion:1}}},{policies:[[{policyVersion:1}]]},{policies:[{policyVersion:{policyVersion:1}}]},{policies:[{nested:{policyVersion:1}}]},{policy:[{policyVersion:1}]},{policies:[{snapshotSchemaVersion:1}]}]){
  err(()=>C.canonicalBytes(v),'INVALID_NUMBER');err(()=>C.parseRestrictedJson(enc(JSON.stringify(v))),'INVALID_NUMBER');
 }
 err(()=>C.parseRestrictedJson(enc('{"policies":{"\\u0030":{"policyVersion":1}}}')),'INVALID_NUMBER');
 eq(C.parseRestrictedJson(enc('{"poli\\u0063ies":[{"policy\\u0056ersion":1}]}')),{policies:[{policyVersion:1}]});
});
test('F02 C-02: fatal UTF8 before BOM',()=>{
 err(()=>C.parseRestrictedJson(Uint8Array.from([0xef,0xbb,0xbf,0xff])),'INVALID_UTF8');
 err(()=>C.parseRestrictedJson(Uint8Array.from([0xef,0xbb,0xbf,0xed,0xa0,0x80])),'INVALID_UTF8');
 err(()=>C.parseRestrictedJson(enc('\ufeff{}')),'INVALID_JSON');
 err(()=>C.parseRestrictedJson(Uint8Array.of(0xff)),'INVALID_UTF8');
 err(()=>C.parseRestrictedJson(enc(' '.repeat(65536)+'\ufeff')),'RESOURCE_LIMIT');
});
test('F04 C-06: ambiguity precedes explicit selection',()=>{
 const both=merge(setOf(C),setOf(C,{pid:'p2',ver:2,aid:'a2',eid:'e2'}));const anchor=trustedFixture(both,T1);
 for(const pid of [null,'p1','p2','missing'])assert.equal(C.evaluateFixture(both,{authority:AUTH,ownerId:'o',evaluationTime:T1,requestedPolicyId:pid},anchor).status,'AMBIGUOUS');
 const invalid=normal(both);invalid.approvals[0].ownerId='bad';assert.equal(C.evaluateFixture(invalid,{authority:AUTH,ownerId:'o',evaluationTime:T1,requestedPolicyId:'missing'},anchor).reason,'PARENT_MISMATCH');
});
test('F05 C-06/09: trusted decision time distinct from historical simulation',()=>{
 const history=merge(retire(setOf(C)),setOf(C,{pid:'p2',ver:2,aid:'a2',eid:'e2',start:T2})),ctx=trustedFixture(history,T3);
 const old={authority:AUTH,ownerId:'o',evaluationTime:T1,requestedPolicyId:'p1'};
 assert.equal(C.evaluateFixture(history,old,ctx).policy.policyId,'p1');
 err(()=>C.createSnapshot(history,request(input(),'p1',T1),ctx),'BLOCKED');
 assert.equal(C.createSnapshot(history,request(input(),null,T3),ctx).policy.policyId,'p2');
 err(()=>C.createSnapshot(history,request(input(),'p1',T3),ctx),'REJECTED');
});
test('F06 C-08/13: original external fixture anchors, no replacement trust',()=>{
 const s=setOf(C),ctx=trustedFixture(s,T1),q={authority:AUTH,ownerId:'o',evaluationTime:T1,requestedPolicyId:'p1'};
 assert.equal(C.evaluateFixture(s,q).reason,'FIXTURE_ANCHOR_UNAVAILABLE');
 assert.equal(C.evaluateFixture(s,q,ctx).status,'ELIGIBLE_FIXTURE');
 for(const [field,key] of [['policies','sourceRef'],['approvals','evidenceRef'],['effectivities','evidenceRef']]){const t=normal(s);t[field][0][key]='fixture:replacement';assert.equal(C.evaluateFixture(t,q,ctx).reason,'HASH_MISMATCH');err(()=>C.createSnapshot(t,request(input()),ctx),'REJECTED');}
 const t=normal(ctx);t.records.push(t.records[0]);assert.equal(C.evaluateFixture(s,q,t).reason,'DUPLICATE_ID');
 const extra=merge(s,setOf(C,{owner:'other'}));assert.equal(C.evaluateFixture(extra,q,ctx).reason,'HASH_MISMATCH');
 err(()=>C.createSnapshot(s,request(input())),'BLOCKED');
});
function trustedSnapshot(set=setOf(C),source=input(),at=T1){const context=trustedFixture(set,at),s=C.createSnapshot(set,request(source,null,at),context);const {snapshotSha256,...body}=s,anchor=referenceDigest(body,'snapshot');assert.equal(anchor,snapshotSha256);return {s,set,context,anchor};}
function rehash(x){const {snapshotSha256,...body}=x;x.snapshotSha256=referenceDigest(body,'snapshot');return x;}
function outcome(r,status,reason){assert.equal(r.status,status,JSON.stringify(r));assert.equal(r.authority,AUTH);if(reason)assert.equal(r.reason,reason);}
test('F03 C-08: integrity before missing pinned fields',()=>{
 const {s,set,context,anchor}=trustedSnapshot();for(const k of ['input','policy','approval','effectivity','engine','result']){const x=normal(s);x[k]=null;outcome(C.replaySnapshot(x,set,anchor,context),'MISMATCH','SNAPSHOT_HASH');rehash(x);outcome(C.replaySnapshot(x,set,anchor,context),'MISMATCH','SNAPSHOT_HASH');outcome(C.replaySnapshot(x,set,x.snapshotSha256,context),'MISMATCH');}
 const x=normal(s),replacement=normal(set);x.policy.sourceRef=replacement.policies[0].sourceRef='fixture:replacement';rehash(x);outcome(C.replaySnapshot(x,replacement,anchor,context),'MISMATCH','SNAPSHOT_HASH');outcome(C.replaySnapshot(x,replacement,x.snapshotSha256,context),'MISMATCH','HASH_MISMATCH');outcome(C.replaySnapshot(s,set,anchor),'UNAVAILABLE','FIXTURE_ANCHOR_UNAVAILABLE');
});
test('F07 C-10: complete nested engine schema before availability',()=>{
 const {s,set,context,anchor}=trustedSnapshot();const changes=[x=>x.artifacts=null,x=>x.artifacts=[],x=>x.artifacts[0].sha256='bad',x=>x.artifacts[0].path='../bad.js',x=>x.sourceFiles.push(x.sourceFiles[0]),x=>x.dependencyLocks[0].path='a//b',x=>x.oracleFixtures[0].seed='01',x=>x.oracleFixtures[0].vectorsSha256=null,x=>x.resultDigests[0].bags='0',x=>x.buildConfig.extra='bad',x=>x.compiler=null,x=>x.arithmeticSourceCommit='bad'];
 for(const mutate of changes){const x=normal(s);x.engine.sourceCommit='f'.repeat(40);mutate(x.engine);rehash(x);outcome(C.replaySnapshot(x,set,x.snapshotSha256,context),'MISMATCH');}
 const x=normal(s);x.engine.sourceCommit='f'.repeat(40);rehash(x);outcome(C.replaySnapshot(x,set,x.snapshotSha256,context),'UNAVAILABLE','ENGINE_UNAVAILABLE');outcome(C.replaySnapshot(x,set,anchor,context),'MISMATCH','SNAPSHOT_HASH');
});
test('F08 C-08: raw and typed absence, supplied malformed, contradiction precedence',()=>{
 const {s,set,context,anchor}=trustedSnapshot();const pairs=[[null,null,'UNAVAILABLE','SNAPSHOT_UNAVAILABLE'],[{},enc('{}'),'MISMATCH','INVALID_SHAPE'],[s,enc(JSON.stringify(s)),'UNAVAILABLE','ANCHOR_UNAVAILABLE']];
 for(const [typed,raw,status,reason] of pairs){outcome(C.replaySnapshot(typed,set,null,context),status,reason);outcome(C.replaySnapshotBytes(raw,set,null,context),status,reason);}
 outcome(C.replaySnapshotBytes(enc('null'),set,null,context),'MISMATCH','INVALID_SHAPE');outcome(C.replaySnapshotBytes(Uint8Array.of(255),set,null,context),'MISMATCH','INVALID_UTF8');outcome(C.replaySnapshotBytes(enc('{"a":"1","a":"2"}'),set,null,context),'MISMATCH','DUPLICATE_KEY');outcome(C.replaySnapshotBytes(enc('{"a":1,"a":2}'),set,null,context),'MISMATCH','INVALID_NUMBER');
 const x=normal(s);x.input.slots[0].bag.raw='2500';rehash(x);outcome(C.replaySnapshot(x,null,null,null),'MISMATCH','INPUT_HASH');
 const bad=normal(s);bad.result.amountVnd=q(1);bad.resultSha256=referenceDigest(bad.result,'result');rehash(bad);outcome(C.replaySnapshot(bad,null,null,null),'MISMATCH','RESULT_FIELDS');
 outcome(C.replaySnapshot(s,set,'bad',context),'MISMATCH','NONCANONICAL');outcome(C.replaySnapshot(s,null,anchor,context),'UNAVAILABLE','EVIDENCE_SET_UNAVAILABLE');outcome(C.replaySnapshotBytes(enc(JSON.stringify(s)),set,anchor,context),'VERIFIED');
 const unavailable=normal(s);unavailable.engine.sourceCommit='f'.repeat(40);unavailable.result.slots=null;unavailable.resultSha256=referenceDigest(unavailable.result,'result');rehash(unavailable);outcome(C.replaySnapshot(unavailable,set,unavailable.snapshotSha256,context),'MISMATCH','INVALID_TYPE');
});
test('F10 C-10/14: fixed adapter, no caller engine or callback',()=>{
 const {set,context}=trustedSnapshot();let called=0;for(const injection of [{engine:C.engineIdentity()},{adapter:()=>{called++;return {}; }},{engineManifest:{}}])err(()=>C.createSnapshot(set,{...request(input()),...injection},context),'INVALID_SHAPE');assert.equal(called,0);
 assert.equal(C.engineAvailable(),true);const engine=C.engineIdentity();assert.equal(engine.sourceCommit,'b4f94a3fe24c02be292247184aeaca33b2375a4a');for(const a of engine.artifacts)assert.equal(sha(readFileSync(join(process.env.SND_C_BUILD,a.path))),a.sha256);
});
test('F11 C-08/09: available contradiction precedes absent resources',()=>{
 const {s,set,context,anchor}=trustedSnapshot();const specs=[['policies','sourceRef','approvals','effectivities'],['approvals','evidenceRef','policies','effectivities'],['effectivities','evidenceRef','policies','approvals']];
 for(const [present,field,miss1,miss2] of specs){const t=normal(set);t[present][0][field]='fixture:changed';t[miss1]=[];t[miss2]=[];outcome(C.replaySnapshot(s,t,anchor,context),'MISMATCH','PINNED_REFERENCE');}
 for(const [f,why] of [['policies','UNKNOWN_POLICY'],['approvals','APPROVAL_UNAVAILABLE'],['effectivities','EFFECTIVITY_UNAVAILABLE']]){const t=normal(set);t[f]=[];outcome(C.replaySnapshot(s,t,anchor,context),'UNAVAILABLE',why);}
 const t=normal(set);t.approvals[0].definitionSha256='f'.repeat(64);t.effectivities=[];outcome(C.replaySnapshot(s,t,anchor,context),'MISMATCH','HASH_MISMATCH');
 const x=normal(s);x.policy.definition=null;rehash(x);outcome(C.replaySnapshot(x,{authority:AUTH,policies:[],approvals:[],effectivities:[]},x.snapshotSha256,context),'MISMATCH');
 const hist=merge(retire(set),setOf(C,{pid:'p2',ver:2,aid:'a2',eid:'e2',start:T2}));outcome(C.replaySnapshot(s,hist,anchor,trustedFixture(hist,T3)),'VERIFIED');outcome(C.replaySnapshot(s,hist,anchor,context),'MISMATCH');
 const unrelated=merge(set,setOf(C,{owner:'other'})),ctx=trustedFixture(unrelated,T3);outcome(C.replaySnapshot(s,set,anchor,ctx),'UNAVAILABLE','FIXTURE_EVIDENCE_UNAVAILABLE');
});
test('F12 C-11/13: correction-specific independently anchored evidence, never execute change',()=>{
 const {s,set,anchor}=trustedSnapshot(),history=merge(retire(set),setOf(C,{pid:'p2',ver:2,aid:'a2',eid:'e2',start:T2}));const next=input({rev:'r2',raws:['2500']}),before=JSON.stringify(s),newBefore=JSON.stringify(next);
 const change={authority:AUTH,purpose:'RULE_CHANGE_PLAN_ONLY',originalSnapshotSha256:anchor,ownerId:'o',sheetId:'s',fromRevisionId:'r1',toRevisionId:'r2',fromPolicyId:'p1',fromDefinitionSha256:s.policy.definitionSha256,toPolicyId:'p2',toDefinitionSha256:history.policies[1].definitionSha256,approvalId:'a2',decisionTime:T3,evidenceRef:'fixture:independent-change'};
 const plan=(pc,context=trustedFixture(history,T3))=>C.planCorrection(s,history,anchor,{authority:AUTH,newInput:next,policyChange:pc},context);
 assert.equal(plan(change).reason,'POLICY_CHANGE_APPROVAL_REQUIRED');const trusted=trustedFixture(history,T3,change);assert.equal(plan(change,trusted).reason,'POLICY_CHANGE_DEFERRED');
 for(const [k,v] of [['evidenceRef','fixture:invented'],['purpose','APPLY'],['ownerId','other'],['sheetId','other'],['fromRevisionId','r0'],['toRevisionId','r3'],['fromPolicyId','p3'],['toPolicyId','p1'],['fromDefinitionSha256','f'.repeat(64)],['toDefinitionSha256','f'.repeat(64)],['originalSnapshotSha256','f'.repeat(64)],['approvalId','missing'],['decisionTime','2026-05-01T00:00:00.000Z']])assert.equal(plan({...change,[k]:v},trusted).reason,'POLICY_CHANGE_APPROVAL_REQUIRED');
 for(const bad of [{...change,purpose:'APPLY'},{...change,fromDefinitionSha256:'f'.repeat(64)},{...change,decisionTime:'2026-05-01T00:00:00.000Z'}])assert.equal(plan(bad,trustedFixture(history,T3,bad)).reason,'POLICY_CHANGE_APPROVAL_REQUIRED');
 const originalRule=plan(null);assert.equal(originalRule.status,'PLANNED_FIXTURE');assert.equal(originalRule.policy.policyId,'p1');eq(originalRule.newPreview.amountVnd,q(14702));assert.equal(JSON.stringify(s),before);assert.equal(JSON.stringify(next),newBefore);assert.equal(Object.isFrozen(next),false);assert.equal(Object.hasOwn(originalRule,'journal'),false);
});
test('F09 C-15: bounded rejection preserves mutable and frozen input',()=>{
 const set=setOf(C),ctx=trustedFixture(set,T1),source={...input(),slots:Array.from({length:100001},()=>({position:'1',bag:null}))};
 const before=JSON.stringify(source),setBefore=JSON.stringify(set),ctxBefore=JSON.stringify(ctx);
 for(const freeze of [false,true]){if(freeze){for(const sl of source.slots)Object.freeze(sl);Object.freeze(source.slots);Object.freeze(source);}
  err(()=>C.createSnapshot(set,request(source),ctx),'RESOURCE_LIMIT');assert.equal(JSON.stringify(source),before);assert.equal(JSON.stringify(set),setBefore);assert.equal(JSON.stringify(ctx),ctxBefore);assert.equal(Object.isFrozen(source),freeze);assert.equal(Object.isFrozen(source.slots[0]),freeze);}
});
// Independent Python cases supplied by the verification runner; no candidate-generated expected hashes.
if(process.env.SND_C_REMEDIATION_VECTORS)test('F01-F12 independent remediation oracle and Fraction comparisons',()=>{
 const vectors=readFileSync(process.env.SND_C_REMEDIATION_VECTORS,'utf8').trimEnd().split('\n').map(JSON.parse),counts={};
 for(const v of vectors){counts[v.kind]=(counts[v.kind]??0)+1;
  try{
   if(v.kind==='canonical_path'){if(v.expected==='PASS'){assert.equal(Buffer.from(C.canonicalBytes(v.value)).toString('hex'),v.canonicalHex);assert.equal(C.canonicalDigest(v.value,'policy','definition').sha256,v.sha256);eq(C.parseRestrictedJson(enc(v.raw)),v.value);}else{err(()=>C.canonicalBytes(v.value),v.expected);err(()=>C.parseRestrictedJson(enc(v.raw)),v.expected);}}
   else if(v.kind==='raw')err(()=>C.parseRestrictedJson(Uint8Array.from(Buffer.from(v.hex,'hex'))),v.expected);
   else if(v.kind==='selection'){const r=C.evaluateFixture(v.fixtures,v.request,v.trusted);outcome(r,v.status,v.reason);if(v.policyId!==null)assert.equal(r.policy.policyId,v.policyId);}
   else if(v.kind==='replay'){const r=C.replaySnapshot(v.snapshot,v.fixtures,v.anchor,v.trusted);outcome(r,v.status,v.reason);outcome(C.replaySnapshotBytes(v.snapshot===null?null:enc(JSON.stringify(v.snapshot)),v.fixtures,v.anchor,v.trusted),v.status,v.reason);}
   else if(v.kind==='correction'){const r=C.planCorrection(v.snapshot,v.fixtures,v.anchor,v.request,v.trusted);outcome(r,v.status,v.reason);if(v.preview)eq(r.newPreview,v.preview);}
   else throw Error('unknown reference vector');
  }catch(e){throw Error(`independent case ${v.kind}/${v.case}: ${e.message}`,{cause:e});}
 }
 console.log('independent-remediation-oracle',JSON.stringify(counts),'total',vectors.length);assert.ok(vectors.length>=300);
});
