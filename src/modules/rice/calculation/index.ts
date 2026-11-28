/** CP-002B B-P1 v1.0. Pure preview only; no policy registry or posting. */
import { ArithmeticError, type ErrorCode, type RationalWire as Q, fromInteger,
  parseInteger, parseRational, add, subtract, multiply, divide, compare, convertMass, round }
  from '../../shared/exact-arithmetic/index.js';

export const B_PROFILE = Object.freeze({ name: 'B-P1 v1.0', maxSlots: 100000,
  maxSlotPosition: 1000000, maxBatches: 100000, maxSheets: 1000, maxIdLength: 128 } as const);
export type RiceErrorCode = ErrorCode | 'DUPLICATE_ID' | 'DUPLICATE_POSITION' |
  'PARENT_MISMATCH' | 'UNSUPPORTED_PROFILE' | 'EXCESS_TARE';
export class RiceError extends Error {
  constructor(public readonly code: RiceErrorCode, detail: string) { super(detail); this.name = 'RiceError'; }
}
function fail(code: RiceErrorCode, detail: string): never { throw new RiceError(code, detail); }
function boundary<T>(fn: () => T): T {
  try { return fn(); } catch (err) {
    if (err instanceof ArithmeticError) throw new RiceError(err.code, err.message);
    throw err;
  }
}
export interface BatchInput { readonly ownerId: string; readonly sheetId: string; readonly batchId: string }
export interface BagInput extends BatchInput { readonly bagId: string; readonly mode: 'three-digit'|'gram'; readonly raw: string }
export interface SlotInput { readonly position: string; readonly bag: BagInput|null|'' }
export interface SheetInput {
  readonly ownerId: string; readonly sheetId: string; readonly revisionId: string; readonly groupId: string|null;
  readonly batches: readonly BatchInput[]; readonly slots: readonly SlotInput[];
  readonly tare: null|{ readonly method:'proportional'; readonly scope:'sheet'; readonly bagsPerKg:Q };
  readonly priceVndPerKg: string|null; readonly saleScope:'whole-sheet';
}
export interface GroupInput { readonly ownerId:string; readonly groupId:string; readonly sheets:readonly SheetInput[] }
export interface Layout { readonly row:string; readonly column:string; readonly columnInBoard:string;
  readonly board:string; readonly boardInPage:string; readonly page:string }
export interface BagTrace extends BagInput { readonly grossGram:Q }
export interface SlotTrace { readonly position:string; readonly layout:Layout; readonly bag:BagTrace|null }
export interface Stats { readonly count:string; readonly grossGram:Q }
export interface Bucket extends Stats { readonly index:string }
export type SheetCompleteness = 'EMPTY'|'MISSING_TARE'|'MISSING_PRICE'|'COMPLETE';
export interface SheetPreview extends Stats {
  readonly status:'PREVIEW'; readonly profile:'B-P1 v1.0'; readonly ownerId:string;
  readonly sheetId:string; readonly revisionId:string; readonly groupId:string|null; readonly saleScope:'whole-sheet';
  readonly slotSpan:string; readonly slots:readonly SlotTrace[];
  readonly columns:readonly Bucket[]; readonly boards:readonly Bucket[]; readonly pages:readonly Bucket[];
  readonly tareRatio:Q|null; readonly tareGram:Q|null; readonly physicalNetGram:Q|null;
  readonly commercialNetGram:Q|null; readonly settlementGram:Q|null; readonly residualGram:Q|null;
  readonly priceVndPerKg:string|null; readonly amountVnd:Q|null; readonly completeness:SheetCompleteness;
}
const METRICS = ['tareGram','physicalNetGram','commercialNetGram','settlementGram','residualGram','amountVnd'] as const;
export type Metric = typeof METRICS[number];
export interface Coverage { readonly knownSubtotal:Q; readonly completeValue:Q|null;
  readonly knownSheetCount:string; readonly missingSheetCount:string;
  readonly completeness:'EMPTY'|'UNKNOWN'|'PARTIAL'|'COMPLETE' }
export interface GroupPreview extends Stats { readonly status:'PREVIEW'; readonly profile:'B-P1 v1.0';
  readonly ownerId:string; readonly groupId:string; readonly sheets:readonly SheetPreview[];
  readonly coverage:Readonly<Record<Metric,Coverage>> }

type RecordData = Record<string,unknown>;
function rec(v:unknown, keys:readonly string[]):RecordData {
  if (typeof v !== 'object'||v===null||Array.isArray(v)) fail('INVALID_TYPE','Expected record');
  const proto:unknown = Object.getPrototypeOf(v);
  if(proto!==Object.prototype && proto!==null) fail('INVALID_SHAPE','Expected plain record');
  const actual=Reflect.ownKeys(v); if(actual.length!==keys.length) fail('INVALID_SHAPE','Wrong field count');
  const out:RecordData=Object.create(null) as RecordData;
  for(const k of keys){const d=Object.getOwnPropertyDescriptor(v,k);
    if(!d||!d.enumerable||!('value' in d)) fail('INVALID_SHAPE','Missing or non-data field: '+k);
    out[k]=d.value;
  } return out;
}
function list(v:unknown,max:number):readonly unknown[] {
  if(!Array.isArray(v)) fail('INVALID_TYPE','Expected array');
  if(v.length>max) fail('RESOURCE_LIMIT','Array exceeds B-P1 record limit');
  if(Object.getPrototypeOf(v)!==Array.prototype || Reflect.ownKeys(v).length!==v.length+1)
    fail('INVALID_SHAPE','Expected dense plain data array');
  const a:unknown[]=[]; for(let i=0;i<v.length;i++){
    const d=Object.getOwnPropertyDescriptor(v,String(i));
    if(!d||!d.enumerable||!('value' in d)) fail('INVALID_SHAPE','Sparse or accessor array');
    a.push(d.value);
  } return a;
}
function str(v:unknown):string {if(typeof v!=='string') fail('INVALID_TYPE','Expected string');return v;}
function id(v:unknown):string {const s=str(v);if(s.length>B_PROFILE.maxIdLength) fail('RESOURCE_LIMIT','ID too long');
  if(!/^[A-Za-z0-9][A-Za-z0-9._:-]*(?![\s\S])/.test(s)) fail('NONCANONICAL','Invalid ID token');return s;}
function claim(set:Set<string>,key:string,code:'DUPLICATE_ID'|'DUPLICATE_POSITION'):void {
  if(set.has(key)) fail(code,'Duplicate '+key);set.add(key);
}
const ZERO=fromInteger('0'),ONE=fromInteger('1'),HUNDRED=fromInteger('100'),KG=fromInteger('1000');
function positive(q:Q):Q {if(compare(q,ZERO)<=0) fail('DOMAIN','Expected positive quantity');return q;}
function exactPositiveInteger(v:unknown):Q {return positive(fromInteger(v));}
function requireProfile(v:unknown,expected:string):void {if(str(v)!==expected) fail('UNSUPPORTED_PROFILE','Unsupported B-P1 option');}
interface Inspected {ownerId:string;sheetId:string;revisionId:string;groupId:string|null;batches:readonly unknown[];
  slots:readonly unknown[];tare:unknown;price:unknown}
function inspect(v:unknown):Inspected {
  const r=rec(v,['ownerId','sheetId','revisionId','groupId','batches','slots','tare','priceVndPerKg','saleScope']);
  const batches=list(r.batches,B_PROFILE.maxBatches), slots=list(r.slots,B_PROFILE.maxSlots);
  const ownerId=id(r.ownerId),sheetId=id(r.sheetId),revisionId=id(r.revisionId),groupId=r.groupId===null?null:id(r.groupId);
  requireProfile(r.saleScope,'whole-sheet');return {ownerId,sheetId,revisionId,groupId,batches,slots,tare:r.tare,price:r.priceVndPerKg};
}
function position(v:unknown):bigint {const p=parseInteger(v);if(p<=0n) fail('DOMAIN','Position must be positive');
  if(p>BigInt(B_PROFILE.maxSlotPosition)) fail('RESOURCE_LIMIT','Slot span exceeds B-P1 bound');return p;}
function layout(p:bigint):Layout {const k=p-1n;return {row:String(k%5n+1n),column:String(k/5n+1n),
  columnInBoard:String(k/5n%5n+1n),board:String(k/25n+1n),boardInPage:String(k/25n%3n+1n),page:String(k/75n+1n)};}
function bagWeight(mode:string,raw:string):Q {
  if(mode==='three-digit'){
    if(raw.length>3) fail('NONCANONICAL','Expected exactly three digits');
    if(!/^[0-9]{3}(?![\s\S])/.test(raw)) fail('NONCANONICAL','Expected exactly three digits');
    // Explicit lexical adapter only; A-P1 performs all weight arithmetic.
    return positive(multiply(fromInteger(raw.replace(/^0+(?=[0-9])/,'') ),HUNDRED));
  }
  if(mode==='gram') return exactPositiveInteger(raw);
  return fail('UNSUPPORTED_PROFILE','Unsupported input mode');
}
interface Acc { count:Q; gross:Q }
function acc():Acc {return {count:ZERO,gross:ZERO};}
function plus(a:Acc,b:Acc):void {a.count=add(a.count,b.count);a.gross=add(a.gross,b.gross);}
function bucket(m:Map<string,Acc>,key:string):Acc {let x=m.get(key);if(!x){x=acc();m.set(key,x);}return x;}
function stats(a:Acc):Stats {return {count:a.count.numerator,grossGram:a.gross};}
function buckets(m:Map<string,Acc>):Bucket[] {return Array.from(m,([index,a])=>({index,...stats(a)}));}
function sheet(s:Inspected,bagIds:Set<string>,batchIds:Set<string>):SheetPreview {
  let ratio:Q|null=null,price:Q|null=null;
  if(s.tare!==null){const t=rec(s.tare,['method','scope','bagsPerKg']);requireProfile(t.method,'proportional');
    requireProfile(t.scope,'sheet');ratio=positive(parseRational(t.bagsPerKg));}
  if(s.price!==null) price=exactPositiveInteger(s.price);
  const localBatches=new Set<string>();
  for(const v of s.batches){const b=rec(v,['ownerId','sheetId','batchId']);const o=id(b.ownerId),sid=id(b.sheetId),bid=id(b.batchId);
    if(o!==s.ownerId||sid!==s.sheetId) fail('PARENT_MISMATCH','Batch parent mismatch');
    claim(batchIds,bid,'DUPLICATE_ID');localBatches.add(bid);}
  const occupied=new Set<string>(),temp:{p:bigint;trace:SlotTrace}[]=[];
  for(const v of s.slots){const r=rec(v,['position','bag']);const p=position(r.position),key=String(p);
    claim(occupied,key,'DUPLICATE_POSITION');let bag:BagTrace|null=null;
    if(r.bag!==null&&r.bag!==''){
      const b=rec(r.bag,['ownerId','sheetId','batchId','bagId','mode','raw']);
      const ownerId=id(b.ownerId),sheetId=id(b.sheetId),batchId=id(b.batchId),bagId=id(b.bagId);
      if(ownerId!==s.ownerId||sheetId!==s.sheetId||!localBatches.has(batchId)) fail('PARENT_MISMATCH','Bag parent mismatch');
      claim(bagIds,bagId,'DUPLICATE_ID');const mode=str(b.mode),raw=str(b.raw);
      if(mode!=='three-digit'&&mode!=='gram') fail('UNSUPPORTED_PROFILE','Unsupported input mode');
      bag={ownerId,sheetId,batchId,bagId,mode,raw,grossGram:bagWeight(mode,raw)};
    }
    temp.push({p,trace:{position:key,layout:layout(p),bag}});
  }
  temp.sort((a,b)=>a.p<b.p?-1:a.p>b.p?1:0);
  const cm=new Map<string,Acc>(),bm=new Map<string,Acc>(),pm=new Map<string,Acc>(),total=acc();
  // Sorted input yields ordered buckets. Quantities accumulated via A-P1 at every level.
  for(const {trace:t} of temp) if(t.bag){const item={count:ONE,gross:t.bag.grossGram};
    plus(bucket(cm,t.layout.column),item);plus(bucket(bm,t.layout.board),item);plus(bucket(pm,t.layout.page),item);plus(total,item);}
  let tareGram:Q|null=null,physicalNetGram:Q|null=null,settlementGram:Q|null=null,residualGram:Q|null=null,amountVnd:Q|null=null;
  let completeness:SheetCompleteness='EMPTY';
  if(compare(total.count,ZERO)>0){completeness='MISSING_TARE';if(ratio!==null){
    tareGram=divide(multiply(KG,total.count),ratio);
    if(compare(tareGram,total.gross)>0) fail('EXCESS_TARE','Tare exceeds gross');
    physicalNetGram=subtract(total.gross,tareGram);
    settlementGram=round(physicalNetGram,{method:'nearest',quantum:KG,tie:'positive'});
    residualGram=subtract(settlementGram,physicalNetGram);completeness='MISSING_PRICE';
    if(price!==null){amountVnd=multiply(convertMass(settlementGram,'g','kg'),price);completeness='COMPLETE';}
  }}
  return {status:'PREVIEW',profile:B_PROFILE.name,ownerId:s.ownerId,sheetId:s.sheetId,revisionId:s.revisionId,groupId:s.groupId,saleScope:'whole-sheet',
    slotSpan:String(temp.at(-1)?.p??0n),slots:temp.map(x=>x.trace),columns:buckets(cm),boards:buckets(bm),pages:buckets(pm),...stats(total),
    tareRatio:ratio,tareGram,physicalNetGram,commercialNetGram:physicalNetGram,settlementGram,residualGram,
    priceVndPerKg:price?.numerator??null,amountVnd,completeness};
}
export function previewRiceSheetBP1(input:unknown):SheetPreview {
  return boundary(()=>sheet(inspect(input),new Set(),new Set()));
}
function coverage(sheets:readonly SheetPreview[],metric:Metric):Coverage {
  let knownSubtotal=ZERO,known=ZERO,missing=ZERO;
  for(const s of sheets){const v=s[metric];if(v===null) missing=add(missing,ONE);
    else {knownSubtotal=add(knownSubtotal,v);known=add(known,ONE);}}
  const complete=sheets.length>0&&missing.numerator==='0';
  return {knownSubtotal,completeValue:complete?knownSubtotal:null,knownSheetCount:known.numerator,missingSheetCount:missing.numerator,
    completeness:sheets.length===0?'EMPTY':complete?'COMPLETE':known.numerator==='0'?'UNKNOWN':'PARTIAL'};
}
export function previewRiceGroupBP1(input:unknown):GroupPreview {return boundary(()=>{
  const r=rec(input,['ownerId','groupId','sheets']),vs=list(r.sheets,B_PROFILE.maxSheets),ownerId=id(r.ownerId),groupId=id(r.groupId);
  const inspected:Inspected[]=[],ids=new Set<string>();let slots=0,batches=0;
  for(const v of vs){const s=inspect(v);if(s.ownerId!==ownerId||s.groupId!==groupId) fail('PARENT_MISMATCH','Group membership mismatch');
    claim(ids,s.sheetId,'DUPLICATE_ID');slots+=s.slots.length;batches+=s.batches.length;
    if(slots>B_PROFILE.maxSlots||batches>B_PROFILE.maxBatches) fail('RESOURCE_LIMIT','Group record limit exceeded');inspected.push(s);}
  inspected.sort((a,b)=>a.sheetId<b.sheetId?-1:a.sheetId>b.sheetId?1:0);
  const seenBags=new Set<string>(),seenBatches=new Set<string>(),sheets=inspected.map(s=>sheet(s,seenBags,seenBatches));
  const total=acc();for(const s of sheets) plus(total,{count:fromInteger(s.count),gross:s.grossGram});
  const cov=Object.fromEntries(METRICS.map(m=>[m,coverage(sheets,m)])) as Record<Metric,Coverage>;
  return {status:'PREVIEW',profile:B_PROFILE.name,ownerId,groupId,sheets,...stats(total),coverage:cov};
});}
