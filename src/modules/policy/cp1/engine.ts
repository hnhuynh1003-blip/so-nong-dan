/** Trusted, fixed Node ESM build adapter. Never accepts paths, manifests or callbacks from caller. */
import {createHash} from 'node:crypto';
import {readFileSync,statSync} from 'node:fs';
import {version} from 'node:process';
import {fail,freezeDeep,sameJson,copyJson,record,array,C_LIMITS} from './canonical.js';
import {id,digest} from './fixtures.js';
import type {SheetPreview} from '../../rice/calculation/index.js';
const artifacts=Object.freeze([
  Object.freeze({path:'modules/rice/calculation/index.js',sha256:'fa296ccd7af27201d8e1fad8a0eddf88d2ac28a9719d16acbbcb800ac12d3979',relative:'../../rice/calculation/index.js'}),
  Object.freeze({path:'modules/shared/exact-arithmetic/index.js',sha256:'0ae72562d05abffd1dddf326e015f88f9e1822ddbe0ce1de818e271cef3f7338',relative:'../../shared/exact-arithmetic/index.js'}),
  Object.freeze({path:'modules/policy/cp1/static-adapter.js',sha256:'190449ca8562b6397a75c22d07173a713019859d32617a88ee6a128adf210044',relative:'./static-adapter.js'})
]);
const identity=freezeDeep({
  bindingVersion:'C-P1-NODE-ESM-1',apiContractVersion:'B-P1-v1.0-B-IV-01',
  sourceCommit:'b4f94a3fe24c02be292247184aeaca33b2375a4a',arithmeticSourceCommit:'80fb95175e902e6bea3caac518a8a6b25b9c1815',
  sourceFiles:[
    {path:'src/modules/rice/calculation/index.ts',sha256:'330cc2001269f37469c57fcc3cd652d9b73e14442c4203b3597397da1d8b178a'},
    {path:'src/modules/shared/exact-arithmetic/index.ts',sha256:'e3031c59ed667082a3bd17f94a2afa45612d0282dbf615aea9d7e287b43e68bf'},
    {path:'src/modules/policy/cp1/static-adapter.ts',sha256:'2d436086c873ac8ef8bb9835653c2a588c3b1702b5c9f5c345be121ef7d879f0'}],
  artifacts:artifacts.map(({path,sha256})=>({path,sha256})),
  dependencyLocks:[{path:'package-lock.json',sha256:'154568f6dab08e55c61fc6b8362fb4d6b020ceafa60cbbc1c86a3e6c8a94aaa2'},{path:'react-shell/package-lock.json',sha256:'f622b1c42b4189a8ca9b4b6196289dd165c31050f35e9d0ec6f12de7c13ffc09'}],
  compiler:'TypeScript 5.8.3',runtime:'Node v22.16.0',packageManager:'npm 10.9.2',
  buildConfig:{path:'tsconfig.json',sha256:'6f00854f56ff293a4f3cc3ebdfc0dfde2899b87afff25d92b7c52942b8b6193c'},
  buildInstructions:'node node_modules/typescript/lib/tsc.js --outDir <isolated-dist>; package.json type module; scripts/verify_cp002c.py verifies sources, compiler, locks and artifact pins before use',
  oracleFixtures:[
    {path:'tests/cp002a/oracle.py',sha256:'26a8727617dd1eea172e78907b91ae65545db1a834e54ff889b235ba06d38310',seed:'1515078706',vectorsSha256:'6501578c96186b5ab2e20e7cbddb5d6dfcb70305ec9f75419c8a6ffe5b3e09eb'},
    {path:'tests/cp002b/oracle.py',sha256:'ae36e531bfe994159af88e74061c9def04d3580dbde4a16257bc5566265edb10',seed:'2026112802',vectorsSha256:'5c54c778b9f9e34db4aeea03a51325c271e91b4aec0d53a23795d00ea816050f'}],
  resultDigests:[
    {bags:'1000',sha256:'7c472b000c6b233d0c3b9b34c3d2df55d28f3e68c789cc57dd1f2ca95e67a145'},
    {bags:'10000',sha256:'83a250670bb2c6c5ed9aa244450949509e6cad860e10cc697fbf6ea1c6015d14'},
    {bags:'100000',sha256:'295507e3f6276d423c967f45531731e55495e51dbc79830d39e64da7fab28f31'}]
});
export type EngineIdentity=typeof identity;
export function engineIdentity():EngineIdentity{return identity;}
function fileMatches(x:typeof artifacts[number]):boolean {if(version!=='v22.16.0')return false;try{const url=new URL(x.relative,import.meta.url);const stat=statSync(url);if(!stat.isFile()||stat.size>65536)return false;return createHash('sha256').update(readFileSync(url)).digest('hex')===x.sha256;}catch{return false;}}
function filesMatch():boolean{return artifacts.every(fileMatches);}
// Literal fixed imports only, gated on bytes; adapter itself statically reexports B.
// No external archived module or caller-supplied adapter is ever loaded.
async function establish(){if(!filesMatch())return null;try{const wrapper=await import('./static-adapter.js');const actual=await import('../../rice/calculation/index.js');return wrapper.preview===actual.previewRiceSheetBP1&&typeof wrapper.preview==='function'?wrapper.preview:null;}catch{return null;}}
const bound=await establish();
export function engineAvailable():boolean{return bound!==null&&filesMatch();}
/** Validate *all* supplied historical manifest fields before availability classification.
 * Unknown well-formed identities are never loaded. Only the fixed identity below is executable. */
export function validateEngineIdentity(input:unknown):EngineIdentity{
  const c=copyJson(input,'policy'),r=record(c,Object.keys(identity));
  const commit=(v:unknown)=>{if(typeof v!=='string'||!/^[a-f0-9]{40}(?![\s\S])/.test(v))fail('INVALID_SHAPE','Engine commit');};
  const text=(v:unknown,max=4096)=>{if(typeof v!=='string'||v.length===0||v.length>max)fail('INVALID_SHAPE','Engine text field');};
  const path=(v:unknown)=>{if(typeof v!=='string'||v.length>512||!/^[A-Za-z0-9._/\-]+(?![\s\S])/.test(v)||v.split('/').some(x=>x===''||x==='.'||x==='..'))fail('INVALID_SHAPE','Engine relative path');return v;};
  const integer=(v:unknown,positive=false)=>{if(typeof v!=='string'||v.length>256||!/^(0|[1-9][0-9]*)(?![\s\S])/.test(v)||(positive&&v==='0'))fail('INVALID_SHAPE','Engine integer token');return v;};
  id(r.bindingVersion);id(r.apiContractVersion);commit(r.sourceCommit);commit(r.arithmeticSourceCommit);
  text(r.compiler,128);text(r.runtime,128);text(r.packageManager,128);text(r.buildInstructions);
  const config=record(r.buildConfig,['path','sha256']);path(config.path);digest(config.sha256);
  function entries(value:unknown,keys:readonly string[],read:(r:Record<string,unknown>)=>string){
    const list=array(value,C_LIMITS.records);if(list.length===0)fail('INVALID_SHAPE','Empty engine inventory');const seen=new Set<string>();
    for(const raw of list){const entry=record(raw,keys),k=read(entry);if(seen.has(k))fail('DUPLICATE_ID','Duplicate engine inventory identity');seen.add(k);}
  }
  for(const value of [r.sourceFiles,r.artifacts,r.dependencyLocks])entries(value,['path','sha256'],e=>{digest(e.sha256);return path(e.path);});
  entries(r.oracleFixtures,['path','sha256','seed','vectorsSha256'],e=>{digest(e.sha256);digest(e.vectorsSha256);integer(e.seed);return path(e.path);});
  entries(r.resultDigests,['bags','sha256'],e=>{digest(e.sha256);return integer(e.bags,true);});
  return c as unknown as EngineIdentity;
}
export function engineMatches(pinned:unknown):boolean{return sameJson(pinned,identity);}
export function invokeVerifiedB(input:unknown):SheetPreview{if(bound===null||!filesMatch())fail('ENGINE_UNAVAILABLE','Fixed accepted artifact unavailable');return bound(input);}

const arithmeticArtifact=artifacts[1]!;
async function establishArithmetic(){if(!fileMatches(arithmeticArtifact))return null;try{return (await import('../../shared/exact-arithmetic/index.js')).parseRational;}catch{return null;}}
const arithmeticBound=await establishArithmetic();
export function validateVerifiedRational(input:unknown){if(arithmeticBound===null||!fileMatches(arithmeticArtifact))fail('ENGINE_UNAVAILABLE','Accepted arithmetic artifact unavailable');return arithmeticBound(input);}
