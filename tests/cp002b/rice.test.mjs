import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
const build=process.env.SND_B_BUILD;
if(!build||!process.env.SND_B_VECTORS) throw Error('Use isolated runner');
const {previewRiceSheetBP1:sheet,previewRiceGroupBP1:group,RiceError,B_PROFILE}=await import(pathToFileURL(join(build,'modules/rice/calculation/index.js')));
const A=await import(pathToFileURL(join(build,'modules/shared/exact-arithmetic/index.js')));
const q=(n,d='1')=>({numerator:String(n),denominator:String(d)});
function make(sid,raws=[],opts={}){
  const {ratio=q(10),price='7350',positions=raws.map((_,i)=>String(i+1)),mode='gram',groupId='g'}=opts;
  const b={ownerId:'o',sheetId:sid,batchId:`batch-${sid}`};
  return {ownerId:'o',sheetId:sid,groupId,batches:[b],slots:raws.map((raw,i)=>({position:String(positions[i]),bag:raw===null||raw===''?raw:{...b,bagId:`${sid}-bag-${i+1}`,mode,raw:String(raw)}})),tare:ratio===null?null:{method:'proportional',scope:'sheet',bagsPerKg:ratio},priceVndPerKg:price,saleScope:'whole-sheet'};
}
const grp=(...sheets)=>({ownerId:'o',groupId:'g',sheets});
function error(fn,code){assert.throws(fn,e=>e instanceof RiceError&&e.code===code);}
function frozen(x){if(x&&typeof x==='object'){for(const v of Object.values(x))frozen(v);Object.freeze(x);}return x;}
function changed(s,mut){const x=structuredClone(s);mut(x);return x;}
function assertQuantity(s,fields){for(const [k,v] of Object.entries(fields))assert.deepEqual(s[k],v,k);}

test('B-01 CAL-01: explicit input modes, 5 bags per column and raw provenance',()=>{
  const s=sheet(make('s',['443','463','454','015','001','002'],{mode:'three-digit'}));
  assert.deepEqual(s.slots.map(x=>x.bag.raw),['443','463','454','015','001','002']);
  assert.deepEqual(s.slots.map(x=>x.bag.grossGram),[44300,46300,45400,1500,100,200].map(n=>q(n)));
  assert.equal(s.slots[4].layout.row,'5');assert.equal(s.slots[5].layout.row,'1');assert.equal(s.slots[5].layout.column,'2');
  assert.equal(s.columns[0].count,'5');assert.equal(s.columns[1].count,'1');assert.deepEqual(s.columns[0].grossGram,q(137600));
  const base=sheet(make('cal01',['443','463','454'],{mode:'three-digit'}));assertQuantity(base,{count:'3',grossGram:q(136000)});
  assert.equal(s.slots[3].bag.mode,'three-digit');assert.equal(s.slots[3].bag.bagId,'s-bag-4');
  const empty=sheet(make('blank',[null,''],{mode:'three-digit'}));assertQuantity(empty,{count:'0',grossGram:q(0),completeness:'EMPTY',amountVnd:null});
});
test('B-02 CAL-07: board/page boundaries and 356 actual bags',()=>{
  for(const [n,boards,pages,lastBoard,lastPage] of [[25,1,1,25,25],[26,2,1,1,26],[75,3,1,25,75],[76,4,2,1,1],[356,15,5,6,56]]){
    const s=sheet(make('s',Array(n).fill('443'),{mode:'three-digit'}));assert.equal(s.boards.length,boards);assert.equal(s.pages.length,pages);assert.equal(s.boards.at(-1).count,String(lastBoard));assert.equal(s.pages.at(-1).count,String(lastPage));assert.equal(s.count,String(n));assert.deepEqual(s.grossGram,q(BigInt(n)*44300n));
  }
  const s=sheet(make('x',Array(76).fill('443'),{mode:'three-digit'}));assertQuantity(s.slots[24].layout,{row:'5',columnInBoard:'5',board:'1',boardInPage:'1',page:'1'});assertQuantity(s.slots[25].layout,{row:'1',columnInBoard:'1',board:'2',boardInPage:'2',page:'1'});assertQuantity(s.slots[75].layout,{row:'1',columnInBoard:'1',board:'4',boardInPage:'1',page:'2'});
});
test('B-03: sparse positions and deletion without compaction',()=>{
  const source=make('s',['443','015','441',null,''],{mode:'three-digit',positions:['1','6','76','1000000','75']});const before=sheet(source);
  const after=sheet(changed(source,x=>x.slots[0].bag=null));assert.equal(before.slotSpan,'1000000');assert.equal(after.slotSpan,'1000000');assert.equal(after.count,'2');assert.deepEqual(after.slots.find(x=>x.position==='6'),before.slots.find(x=>x.position==='6'));assert.deepEqual(after.slots.find(x=>x.position==='76'),before.slots.find(x=>x.position==='76'));assert.deepEqual(after.columns.map(x=>x.index),['2','16']);assert.deepEqual(after.pages.map(x=>x.index),['1','2']);assert.equal(after.slots.length,5);
  const removed=sheet(changed(source,x=>x.slots.shift()));assert.deepEqual(removed.slots.find(x=>x.position==='76'),before.slots.find(x=>x.position==='76'));
});
test('B-04 UI-009 exact 63-bag fixture; CAL-02, CAL-08, AR03',()=>{
  // Exact nums/shift arrays from UI-009 prototype at design SHA 1d186c2d, not an externally supplied gross.
  const nums=[443,446,439,451,444,438,452,447,441,449,445,450,437,442,448,451,444,446,440,447,452,438,445,441,449];
  const raws=[[25,0],[25,8],[13,17]].flatMap(([n,shift])=>Array.from({length:n},(_,i)=>String(nums[(i+shift)%25])));
  const s=sheet(make('ui009',raws,{mode:'three-digit'}));assertQuantity(s,{count:'63',grossGram:q(2803100),tareGram:q(6300),physicalNetGram:q(2796800),commercialNetGram:q(2796800),settlementGram:q(2797000),residualGram:q(200),priceVndPerKg:'7350',amountVnd:q(20557950),completeness:'COMPLETE',status:'PREVIEW'});
  const cal02=sheet(make('cal02',Array(6).fill('168'),{mode:'three-digit'}));assertQuantity(cal02,{grossGram:q(100800),tareGram:q(600),physicalNetGram:q(100200),settlementGram:q(100000),residualGram:q(-200)});
  const fraction=sheet(make('fraction',['50000'],{ratio:q(3)}));assertQuantity(fraction,{tareGram:q(1000,3),physicalNetGram:q(149000,3),commercialNetGram:q(149000,3),settlementGram:q(50000),residualGram:q(1000,3),amountVnd:q(367500)});
  const eleven=sheet(make('eleven',Array(11).fill('443'),{mode:'three-digit'}));assert.deepEqual(eleven.tareGram,q(1100));
  const nonintegerRatio=sheet(make('ratio',['5000'],{ratio:q(3,2)}));assert.deepEqual(nonintegerRatio.tareGram,q(2000,3));
});
test('B-05 T03 AR05: different sheet prices, no group re-round, reject multi-price',()=>{
  const a=make('a',['1500'],{ratio:q(1),price:'9000'}),b=make('b',['1500'],{ratio:q(1),price:'10000'});const g=group(grp(b,a));assert.deepEqual(g.sheets.map(s=>s.sheetId),['a','b']);assertQuantity(g.coverage.physicalNetGram,{completeValue:q(1000)});assertQuantity(g.coverage.settlementGram,{completeValue:q(2000)});assertQuantity(g.coverage.amountVnd,{completeValue:q(19000),knownSubtotal:q(19000),missingSheetCount:'0',completeness:'COMPLETE'});
  error(()=>sheet(changed(a,x=>x.priceVndPerKg=['9000','10000'])),'INVALID_TYPE');error(()=>sheet(changed(a,x=>x.prices=['9000','10000'])),'INVALID_SHAPE');
  // Historical generic alternatives are pure A-P1 fixtures, not B-P1 policy activation.
  const kg=A.fromInteger('1'),w=q(506,10);const canonical=A.normalizeRational(w);
  const exact=A.add(A.multiply(canonical,q(9000)),A.multiply(canonical,q(10000)));assert.deepEqual(exact,q(961400));
  const fl=A.round(canonical,{method:'floor',quantum:kg});assert.deepEqual(A.add(A.multiply(fl,q(9000)),A.multiply(fl,q(10000))),q(950000));assert.deepEqual(A.add(A.multiply(q(51),q(9000)),A.multiply(q(50),q(10000))),q(959000));assert.deepEqual(A.add(A.multiply(q(50),q(9000)),A.multiply(q(51),q(10000))),q(960000));
  // CAL-03/04 baseline alternatives retained, not accepted B-P1 behavior.
  assert.deepEqual(A.multiply(A.round(q(501,5),{method:'floor',quantum:kg}),q(9000)),q(900000));assert.deepEqual(A.multiply(q(501,5),q(9000)),q(901800));
});
test('B-06 CAL-11: missing, zero and partial coverage are distinct',()=>{
  const complete=make('a',['1500'],{ratio:q(1),price:'7351'}),empty=make('b',[]),missingTare=make('c',['44300'],{ratio:null}),missingPrice=make('d',['1500'],{ratio:q(1),price:null}),zero=make('e',['1000'],{ratio:q(1),price:'7351'});
  assertQuantity(sheet(empty),{count:'0',grossGram:q(0),tareGram:null,physicalNetGram:null,amountVnd:null,completeness:'EMPTY'});
  assertQuantity(sheet(missingTare),{grossGram:q(44300),tareGram:null,physicalNetGram:null,settlementGram:null,amountVnd:null,completeness:'MISSING_TARE'});
  assertQuantity(sheet(missingPrice),{physicalNetGram:q(500),settlementGram:q(1000),amountVnd:null,completeness:'MISSING_PRICE'});
  assertQuantity(sheet(zero),{physicalNetGram:q(0),settlementGram:q(0),residualGram:q(0),amountVnd:q(0),completeness:'COMPLETE',status:'PREVIEW'});
  const g=group(grp(complete,empty,missingTare,missingPrice,zero));assertQuantity(g.coverage.amountVnd,{knownSubtotal:q(7351),completeValue:null,knownSheetCount:'2',missingSheetCount:'3',completeness:'PARTIAL'});assertQuantity(g.coverage.settlementGram,{knownSubtotal:q(2000),completeValue:null,knownSheetCount:'3',missingSheetCount:'2',completeness:'PARTIAL'});
  assertQuantity(group(grp(empty,missingTare)).coverage.amountVnd,{knownSubtotal:q(0),completeValue:null,knownSheetCount:'0',missingSheetCount:'2',completeness:'UNKNOWN'});assertQuantity(group(grp()).coverage.amountVnd,{completeValue:null,completeness:'EMPTY',knownSubtotal:q(0)});assertQuantity(group(grp(zero)).coverage.amountVnd,{completeValue:q(0),completeness:'COMPLETE'});
});
test('B-07/B-08 CAL-05/06 AR11-c: ties and exact amount',()=>{
  assertQuantity(sheet(make('half',['015'],{mode:'three-digit',ratio:q(1),price:'7351'})),{grossGram:q(1500),tareGram:q(1000),physicalNetGram:q(500),settlementGram:q(1000),residualGram:q(500),amountVnd:q(7351)});
  for(const [net,settle] of [[100499,100000],[100500,101000],[100501,101000],[100600,101000]]){const s=sheet(make('s',[String(net+1000)],{ratio:q(1),price:'7351'}));assertQuantity(s,{physicalNetGram:q(net),settlementGram:q(settle),residualGram:q(settle-net),amountVnd:q(BigInt(settle)/1000n*7351n)});}
});
test('CAL-11 T04 AR04: stable typed validation; no partial results',()=>{
  const a=make('a',['443','015'],{mode:'three-digit'});const cases=[
    [x=>x.slots[0].bag.raw='000','DOMAIN'],[x=>x.slots[0].bag.raw='44','NONCANONICAL'],[x=>x.slots[0].bag.raw='443\n','NONCANONICAL'],[x=>x.slots[0].bag.raw='４４３','NONCANONICAL'],[x=>x.slots[0].bag.raw='-15','NONCANONICAL'],[x=>x.slots[0].bag.raw=443,'INVALID_TYPE'],[x=>x.slots[0].bag.raw='','NONCANONICAL'],[x=>{x.slots[0].bag.mode='gram';x.slots[0].bag.raw='-1'},'DOMAIN'],[x=>x.slots[0].bag.mode='kg','UNSUPPORTED_PROFILE'],[x=>x.slots[0].position='0','DOMAIN'],[x=>x.slots[0].position='01','NONCANONICAL'],[x=>x.slots[1].position='1','DUPLICATE_POSITION'],[x=>{x.slots[0].bag=null;x.slots[1].position='1'},'DUPLICATE_POSITION'],[x=>x.slots[1].bag.bagId=x.slots[0].bag.bagId,'DUPLICATE_ID'],[x=>x.slots[0].bag.sheetId='wrong','PARENT_MISMATCH'],[x=>x.slots[0].bag.ownerId='wrong','PARENT_MISMATCH'],[x=>x.slots[0].bag.batchId='wrong','PARENT_MISMATCH'],[x=>x.batches[0].sheetId='wrong','PARENT_MISMATCH'],[x=>x.batches.push(x.batches[0]),'DUPLICATE_ID'],[x=>x.tare.method='fixed','UNSUPPORTED_PROFILE'],[x=>x.tare.scope='batch','UNSUPPORTED_PROFILE'],[x=>x.tare.impurity=q(1),'INVALID_SHAPE'],[x=>x.tare.bagsPerKg=q(0),'DOMAIN'],[x=>x.tare.bagsPerKg=q(-1),'DOMAIN'],[x=>x.tare.bagsPerKg=q(1,0),'DIV_ZERO'],[x=>x.tare.bagsPerKg=q(2,4),'NONCANONICAL'],[x=>x.tare.bagsPerKg=q(1,1000),'EXCESS_TARE'],[x=>x.priceVndPerKg='0','DOMAIN'],[x=>x.priceVndPerKg='-1','DOMAIN'],[x=>x.priceVndPerKg='1.5','NONCANONICAL'],[x=>delete x.priceVndPerKg,'INVALID_SHAPE'],[x=>x.saleScope='partial','UNSUPPORTED_PROFILE'],[x=>x.impurityGram='100','INVALID_SHAPE'],[x=>x.extra='x','INVALID_SHAPE'],[x=>x.slots[0].bag.bagId='x'.repeat(129),'RESOURCE_LIMIT'],[x=>x.slots[0].position='1000001','RESOURCE_LIMIT']];
  for(const [mut,code] of cases)error(()=>sheet(changed(a,mut)),code);
  const b=make('b',['44300']);error(()=>group(grp(a,a)),'DUPLICATE_ID');error(()=>group(grp(a,changed(b,x=>x.groupId='else'))),'PARENT_MISMATCH');error(()=>group(grp(a,changed(b,x=>x.ownerId='else'))),'PARENT_MISMATCH');error(()=>group(grp(a,changed(b,x=>x.slots[0].bag.bagId=a.slots[0].bag.bagId))),'DUPLICATE_ID');
  // Extra fields precede numeric validation; ratio before bad price; duplicate position before bad bag.
  error(()=>sheet(changed(a,x=>{x.extra='x';x.priceVndPerKg='bad'})),'INVALID_SHAPE');error(()=>sheet(changed(a,x=>{x.tare.scope='batch';x.priceVndPerKg='bad'})),'UNSUPPORTED_PROFILE');error(()=>sheet(changed(a,x=>{x.slots[1].position='1';x.slots[1].bag.raw='000'})),'DUPLICATE_POSITION');
  const bad=structuredClone(a);Object.defineProperty(bad,'priceVndPerKg',{enumerable:true,get(){throw Error('accessor executed')}});error(()=>sheet(bad),'INVALID_SHAPE');error(()=>sheet(null),'INVALID_TYPE');error(()=>sheet(changed(a,x=>delete x.slots[0])),'INVALID_SHAPE');
});
test('B-09: record limits, span, exact magnitude and group aggregate resource errors',()=>{
  const a=make('a',['44300']);error(()=>sheet({...a,slots:Array(B_PROFILE.maxSlots+1)}),'RESOURCE_LIMIT');error(()=>sheet({...a,batches:Array(B_PROFILE.maxBatches+1)}),'RESOURCE_LIMIT');error(()=>group(grp(...Array(B_PROFILE.maxSheets+1).fill(a))),'RESOURCE_LIMIT');
  const s=make('s',['44300'],{positions:[String(B_PROFILE.maxSlotPosition)]});assert.equal(sheet(s).slotSpan,'1000000');assert.equal(sheet(s).columns.length,1);
  const many=Array.from({length:50001},(_,i)=>({position:String(i+1),bag:null}));error(()=>group(grp({...a,slots:many},{...make('b'),slots:many})),'RESOURCE_LIMIT');
  error(()=>sheet(make('long',['1'.repeat(257)])),'RESOURCE_LIMIT');error(()=>sheet(make('overflow',['9'.repeat(256),'1'])),'RESOURCE_LIMIT');
  const big=make('big',['9'.repeat(256)],{ratio:q(1),price:'999999999999999999999'});error(()=>sheet(big),'RESOURCE_LIMIT');
  const wide=sheet(make('wide',['9007199254740993'],{ratio:null}));assert.deepEqual(wide.grossGram,q('9007199254740993'));
  const p=make('p',['5'+'0'.repeat(255)],{ratio:null}),r=make('r',['5'+'0'.repeat(255)],{ratio:null});error(()=>group(grp(p,r)),'RESOURCE_LIMIT');
});
test('B-10 AR09 AR11-a: independent seeded full-field oracle, determinism and conservation',()=>{
  const cases=readFileSync(process.env.SND_B_VECTORS,'utf8').trimEnd().split('\n').map(JSON.parse);let success=0,errors=0,permutations=0,conservation=0;
  for(const c of cases){const run=c.op==='sheet'?sheet:group;const before=JSON.stringify(c.input);frozen(c.input);
    if(c.error){error(()=>run(c.input),c.error);errors++;}
    else {const actual=run(c.input);assert.deepEqual(actual,c.expected,c.id);assert.equal(JSON.stringify(run(c.input)),JSON.stringify(actual),c.id);success++;
      const flip=s=>({...s,slots:[...s.slots].reverse(),batches:[...s.batches].reverse()});const perm=c.op==='sheet'?flip(c.input):{...c.input,sheets:[...c.input.sheets].reverse().map(flip)};assert.equal(JSON.stringify(run(perm)),JSON.stringify(actual),c.id);permutations++;
      for(const s of c.op==='sheet'?[actual]:actual.sheets){const sum=arr=>arr.reduce((x,b)=>A.add(x,b.grossGram),q(0));for(const buckets of [s.columns,s.boards,s.pages]){assert.deepEqual(sum(buckets),s.grossGram);assert.equal(buckets.reduce((x,b)=>x+BigInt(b.count),0n).toString(),s.count);}
        if(s.tareGram!==null){assert.deepEqual(A.add(s.tareGram,s.physicalNetGram),s.grossGram);assert.deepEqual(A.add(s.physicalNetGram,s.residualGram),s.settlementGram);assert.deepEqual(s.commercialNetGram,s.physicalNetGram);assert.ok(A.compare(s.residualGram,q(-500))>=0&&A.compare(s.residualGram,q(500))<=0);conservation++;}
        assert.equal(s.status,'PREVIEW');assert.ok(!('journal' in s)&&!('receipt' in s));}
    }assert.equal(JSON.stringify(c.input),before,c.id);
  }
  assert.equal(cases.length,600);assert.equal(success,480);assert.equal(errors,120);console.log(JSON.stringify({oracleVectors:cases.length,exactFullFieldMatches:success,expectedErrorMatches:errors,permutations,conservation}));
});
