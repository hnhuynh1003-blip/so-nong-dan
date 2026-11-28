/** Bounded restricted JCS; independent of policy definitions and arithmetic. Node only. */
import { createHash } from 'node:crypto';
import { types } from 'node:util';
export const CANONICALIZATION_VERSION = 'SND-JCS-RESTRICTED-1' as const;
export const C_LIMITS = Object.freeze({policyBytes:65536,snapshotBytes:67108864,depth:32,nodes:4000000,records:1000,idLength:128,metadataMax:1000000});
export type CCode='INVALID_TYPE'|'INVALID_SHAPE'|'INVALID_UTF8'|'INVALID_UNICODE'|'INVALID_JSON'|'INVALID_NUMBER'|'DUPLICATE_KEY'|'RESOURCE_LIMIT'|'NONCANONICAL'|'DOMAIN'|'DUPLICATE_ID'|'UNSUPPORTED_POLICY'|'HASH_MISMATCH'|'PARENT_MISMATCH'|'WRONG_SCOPE'|'FIXTURE_ONLY_REQUIRED'|'INVALID_EFFECTIVITY'|'BLOCKED'|'AMBIGUOUS'|'REJECTED'|'ENGINE_UNAVAILABLE';
export class CError extends Error { constructor(public readonly code:CCode,detail:string){super(detail);this.name='CError';} }
export function fail(code:CCode,detail:string):never {throw new CError(code,detail);}
export type Json = null|boolean|string|number|Json[]|{[key:string]:Json};
export type Envelope = 'policy'|'snapshot';
export type DigestDomain = 'definition'|'input'|'result'|'snapshot'|'fixture'|'change';
export interface Metrics {readonly bytes:number;readonly nodes:number;readonly sha256:string}
const PREFIX:Readonly<Record<DigestDomain,string>>=Object.freeze({definition:'',input:'SND/C-P1/INPUT/v1\0',result:'SND/C-P1/RESULT/v1\0',snapshot:'SND/C-P1/SNAPSHOT/v1\0',fixture:'SND/C-P1/FIXTURE/v1\0',change:'SND/C-P1/CHANGE/v1\0'});
const encoder=new TextEncoder();
function limit(kind:Envelope):number{if(kind==='policy')return C_LIMITS.policyBytes;if(kind==='snapshot')return C_LIMITS.snapshotBytes;return fail('DOMAIN','Unknown envelope');}
function numericPath(path:readonly (string|number)[]):boolean {
  const last=path[path.length-1];if(last!=='definitionSchemaVersion'&&last!=='policyVersion'&&last!=='snapshotSchemaVersion')return false;
  if(path.length===1)return true;
  if(last==='snapshotSchemaVersion')return false;
  return path.length===2&&path[0]==='policy'||path.length===3&&path[0]==='policies'&&typeof path[1]==='number';
}
function metadata(v:number,path:readonly (string|number)[]):number {
  if(!numericPath(path)||!Number.isInteger(v)||Object.is(v,-0)||v<0||v>C_LIMITS.metadataMax)fail('INVALID_NUMBER','Only declared bounded unsigned integer metadata');return v;
}
/** Counts UTF-8 bytes of a valid string or its canonical quoted form without allocating escapes. */
function stringSize(s:string,quoted:boolean,max:number):number {
  if(s.length>max)fail('RESOURCE_LIMIT','String exceeds byte budget');let n=quoted?2:0;
  for(let i=0;i<s.length;i++){
    const c=s.charCodeAt(i);
    if(c>=0xd800&&c<=0xdbff){const d=s.charCodeAt(++i);if(!(d>=0xdc00&&d<=0xdfff))fail('INVALID_UNICODE','Unpaired high surrogate');n+=4;}
    else if(c>=0xdc00&&c<=0xdfff)fail('INVALID_UNICODE','Unpaired low surrogate');
    else if(quoted&&(c===34||c===92||c===8||c===9||c===10||c===12||c===13))n+=2;
    else if(quoted&&c<32)n+=6;
    else n+=c<128?1:c<2048?2:3;
    if(n>max)fail('RESOURCE_LIMIT','String exceeds byte budget');
  }if(n>max)fail('RESOURCE_LIMIT','String exceeds byte budget');return n;
}
class Budget {
  nodes=0;
  constructor(readonly maxNodes:number){}
  add(depth:number,n=1):void{if(depth>C_LIMITS.depth||n>this.maxNodes-this.nodes)fail('RESOURCE_LIMIT','JSON depth/node bound');this.nodes+=n;}
}
class Writer {
  bytes=0;private pending:string[]=[];private pendingLength=0;
  private chunks:Uint8Array[]=[];private readonly hash=createHash('sha256');
  constructor(readonly maxBytes:number,readonly collect:boolean,domain:DigestDomain){if(!Object.hasOwn(PREFIX,domain))fail('DOMAIN','Unknown digest domain');this.hash.update(PREFIX[domain]);}
  emit(s:string,n=s.length):void{if(n>this.maxBytes-this.bytes)fail('RESOURCE_LIMIT','Canonical byte bound');this.bytes+=n;this.pending.push(s);this.pendingLength+=s.length;if(this.pendingLength>=32768||this.pending.length>=1024)this.flush();}
  quote(s:string):void{const n=stringSize(s,true,this.maxBytes-this.bytes);this.emit(JSON.stringify(s),n);}
  private flush():void{if(!this.pending.length)return;const s=this.pending.join('');this.pending=[];this.pendingLength=0;this.hash.update(s);if(this.collect)this.chunks.push(encoder.encode(s));}
  finish(nodes:number):{metrics:Metrics;bytes:Uint8Array|null}{this.flush();const metrics={bytes:this.bytes,nodes,sha256:this.hash.digest('hex')};if(!this.collect)return {metrics,bytes:null};const result=new Uint8Array(this.bytes);let offset=0;for(const c of this.chunks){result.set(c,offset);offset+=c.length;}if(offset!==this.bytes)throw Error('Canonical byte count invariant');return {metrics,bytes:result};}
}
function plain(v:unknown):v is Record<string,unknown>{if(typeof v!=='object'||v===null||types.isProxy(v)||Array.isArray(v))return false;const p=Object.getPrototypeOf(v);return p===Object.prototype||p===null;}
export function record(v:unknown,keys:readonly string[]):Record<string,unknown>{
  if(!plain(v))fail('INVALID_SHAPE','Expected plain data object');const actual=Reflect.ownKeys(v);if(actual.length!==keys.length)fail('INVALID_SHAPE','Wrong field count');const out:Record<string,unknown>=Object.create(null);
  for(const k of keys){const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!d.enumerable||!('value' in d))fail('INVALID_SHAPE','Missing or non-data field '+k);out[k]=d.value;}return out;
}
export function array(v:unknown,max:number):readonly unknown[]{if(typeof v!=='object'||v===null||types.isProxy(v)||!Array.isArray(v))fail('INVALID_TYPE','Expected data array');if(v.length>max)fail('RESOURCE_LIMIT','Array length');if(Object.getPrototypeOf(v)!==Array.prototype||Reflect.ownKeys(v).length!==v.length+1)fail('INVALID_SHAPE','Expected dense data array');const a:unknown[]=[];for(let i=0;i<v.length;i++){const d=Object.getOwnPropertyDescriptor(v,String(i));if(!d||!d.enumerable||!('value'in d))fail('INVALID_SHAPE','Sparse or accessor array');a.push(d.value);}return a;}
function serialize(value:unknown,kind:Envelope,domain:DigestDomain,collect:boolean,reserveBytes=0,reserveNodes=0){
  const b=new Budget(C_LIMITS.nodes-reserveNodes),w=new Writer(limit(kind)-reserveBytes,collect,domain);const active=new Set<object>();const path:(string|number)[]=[];
  function visit(v:unknown,depth:number):void{
    b.add(depth);if(v===null){w.emit('null');return;}
    if(typeof v==='boolean'){w.emit(v?'true':'false');return;}
    if(typeof v==='string'){w.quote(v);return;}
    if(typeof v==='number'){w.emit(String(metadata(v,path)));return;}
    if(typeof v!=='object')fail('INVALID_TYPE','Unsupported JSON value');
    if(types.isProxy(v))fail('INVALID_SHAPE','Proxy not supported');if(active.has(v))fail('INVALID_SHAPE','Cyclic value');active.add(v);
    if(Array.isArray(v)){
      if(v.length>b.maxNodes-b.nodes)fail('RESOURCE_LIMIT','Array length exceeds node budget');
      if(Object.getPrototypeOf(v)!==Array.prototype||Reflect.ownKeys(v).length!==v.length+1)fail('INVALID_SHAPE','Expected dense plain array');w.emit('[');
      for(let i=0;i<v.length;i++){const d=Object.getOwnPropertyDescriptor(v,String(i));if(!d||!d.enumerable||!('value'in d))fail('INVALID_SHAPE','Sparse or accessor array');if(i)w.emit(',');path.push(i);visit(d.value,depth+1);path.pop();}w.emit(']');
    }else{
      if(!plain(v))fail('INVALID_SHAPE','Expected plain record');const keys=Reflect.ownKeys(v);if(keys.length>(b.maxNodes-b.nodes)/2)fail('RESOURCE_LIMIT','Object keys exceed node budget');if(keys.some(k=>typeof k!=='string'))fail('INVALID_SHAPE','Symbol keys');const ordered=(keys as string[]).sort();w.emit('{');
      for(let i=0;i<ordered.length;i++){const k=ordered[i]!;const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!d.enumerable||!('value'in d))fail('INVALID_SHAPE','Non-data property');b.add(depth+1);if(i)w.emit(',');w.quote(k);w.emit(':');path.push(k);visit(d.value,depth+1);path.pop();}w.emit('}');
    }active.delete(v);
  }visit(value,1);return w.finish(b.nodes);
}
export function canonicalBytes(value:unknown,kind:Envelope='policy'):Uint8Array{return serialize(value,kind,'definition',true).bytes!;}
export function canonicalDigest(value:unknown,kind:Envelope,domain:DigestDomain):Metrics{return serialize(value,kind,domain,false).metrics;}
/** Body hash with exact allowance for digest field and its key/value nodes. */
export function snapshotBodyDigest(value:unknown):Metrics{return serialize(value,'snapshot','snapshot',false,',"snapshotSha256":""'.length+64,2).metrics;}
export function parseRestrictedJson(bytes:unknown,kind:Envelope='policy'):Json{
  if(typeof bytes!=='object'||bytes===null||types.isProxy(bytes)||!(bytes instanceof Uint8Array))fail('INVALID_TYPE','Expected UTF-8 bytes');
  const byteLength=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype),'byteLength')!.get!.call(bytes) as number;
  if(byteLength>limit(kind))fail('RESOURCE_LIMIT','Raw byte bound');
  let s:string;try{s=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}catch{fail('INVALID_UTF8','Malformed UTF-8');}
  if(s.charCodeAt(0)===0xfeff)fail('INVALID_JSON','BOM forbidden');
  let i=0;const b=new Budget(C_LIMITS.nodes),path:(string|number)[]=[];
  const ws=()=>{while(s[i]===' '||s[i]==='\n'||s[i]==='\r'||s[i]==='\t')i++;};
  const syntax=():never=>fail('INVALID_JSON','Malformed JSON at offset '+i);
  const take=(ch:string)=>{if(s[i]!==ch)syntax();i++;};
  function tokenString():string{
    const start=i;take('"');let closed=false;while(i<s.length){const c=s.charCodeAt(i++);if(c===34){closed=true;break;}if(c<32)syntax();if(c===92){const esc=s[i++];if(esc==='u'){for(let j=0;j<4;j++)if(!/[0-9a-fA-F]/.test(s[i++]??''))syntax();}else if(!esc||!['"','\\','/','b','f','n','r','t'].includes(esc))syntax();}}
    if(!closed)syntax();let v:string;try{v=JSON.parse(s.slice(start,i)) as string;}catch{return syntax();}stringSize(v,false,limit(kind));return v;
  }
  function val(depth:number):Json{
    ws();b.add(depth);const ch=s[i];if(ch==='"')return tokenString();
    if(ch==='{'){
      i++;const out:{[key:string]:Json}=Object.create(null);const keys=new Set<string>();ws();if(s[i]==='}'){i++;return out;}
      for(;;){ws();b.add(depth+1);const key=tokenString();if(keys.has(key))fail('DUPLICATE_KEY','Duplicate decoded key');keys.add(key);ws();take(':');path.push(key);const v=val(depth+1);path.pop();out[key]=v;ws();if(s[i]==='}'){i++;return out;}take(',');}
    }
    if(ch==='['){i++;const out:Json[]=[];ws();if(s[i]===']'){i++;return out;}for(;;){path.push(out.length);out.push(val(depth+1));path.pop();ws();if(s[i]===']'){i++;return out;}take(',');}}
    for(const [literal,v] of [['null',null],['true',true],['false',false]] as const){if(s.startsWith(literal,i)){i+=literal.length;return v;}}
    if(ch==='-'||(ch!==undefined&&ch>='0'&&ch<='9')){
      const start=i;while(i<s.length&&/[0-9eE+.-]/.test(s[i]!))i++;const len=i-start;if(len>7)fail('INVALID_NUMBER','Numeric token outside restricted profile');const token=s.slice(start,i);if(!/^(0|[1-9][0-9]*)$/.test(token))fail('INVALID_NUMBER','Unsupported numeric grammar');return metadata(Number(token),path);
    }return syntax();
  }
  const value=val(1);ws();if(i!==s.length)syntax();return value;
}
export function freezeDeep<T>(v:T):T {if(typeof v==='object'&&v!==null&&!Object.isFrozen(v)){for(const x of Object.values(v))freezeDeep(x);Object.freeze(v);}return v;}
export function copyJson(value:unknown,kind:Envelope):Json{return freezeDeep(parseRestrictedJson(canonicalBytes(value,kind),kind));}
export function sameJson(a:unknown,b:unknown,kind:Envelope='policy'):boolean{
  const x=canonicalBytes(a,kind),y=canonicalBytes(b,kind);if(x.byteLength!==y.byteLength)return false;for(let i=0;i<x.byteLength;i++)if(x[i]!==y[i])return false;return true;
}
