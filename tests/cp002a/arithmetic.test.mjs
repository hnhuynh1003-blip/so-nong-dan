import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const A = await import(process.env.SND_ARITHMETIC_MODULE ?? new URL('../../dist/modules/shared/exact-arithmetic/index.js',import.meta.url).href);
const r=(n,d='1')=>({numerator:String(n),denominator:String(d)});
const eq=(actual,n,d='1')=>assert.deepEqual(actual,r(n,d));
const err=(fn,code)=>assert.throws(fn,e=>e instanceof A.ArithmeticError && e.code===code);
const q=(method,quantum=r('1'),tie)=>method==='nearest'?{method,quantum,tie}:{method,quantum};
const nearest=(v,quantum,tie)=>A.round(v,q('nearest',quantum,tie));
const ties=['positive','negative','toward_zero','away_from_zero','even'];

test('T01/AR01/CAL11: canonical integer grammar, types, length, exact serialization',()=>{
 for (const s of ['0','1','-1','9007199254740993','9'.repeat(256),'-'+'9'.repeat(256)])
   assert.equal(A.serializeInteger(A.parseInteger(s)),s);
 for (const s of ['','-0','00','01','-01','+1','1\n','1\r','1\r\n','1\u2028',' 1','1 ','1e2','1.0','1,000','１２','١','\u00001','--1'])
   err(()=>A.parseInteger(s),'NONCANONICAL');
 for (const s of [null,undefined,1,1n,NaN,Infinity,{},[],new String('1')]) err(()=>A.parseInteger(s),'INVALID_TYPE');
 for (const s of ['9'.repeat(257),'-'+'9'.repeat(257),'x'.repeat(257)]) err(()=>A.parseInteger(s),'RESOURCE_LIMIT');
 err(()=>A.serializeInteger(10n**256n),'RESOURCE_LIMIT'); err(()=>A.serializeInteger(1),'INVALID_TYPE');
});
test('AR01/CAL11: strict rational shape, normalization adapter, error precedence',()=>{
 const raw=r('-2','-4'); eq(A.normalizeRational(raw),'1','2'); assert.deepEqual(raw,r('-2','-4'));
 eq(A.normalizeRational(r('0','-4')),'0','1'); eq(A.parseRational(r('0')),'0');
 for (const f of [r('2','4'),r('0','2'),r('-0','1'),r('1','01')]) err(()=>A.parseRational(f),'NONCANONICAL');
 err(()=>A.parseRational(r('1','-2')),'DOMAIN'); err(()=>A.parseRational(r('0','0')),'DIV_ZERO');
 err(()=>A.normalizeRational(r('1','0')),'DIV_ZERO');
 for (const f of [{numerator:'1'},{...r('1'),extra:'0'},{...r('1'),[Symbol('extra')]:0},Object.create(r('1')),Object.defineProperty(r('1'),'hidden',{value:1}),Object.defineProperty({},'numerator',{get(){throw Error('getter must not run')},enumerable:true})]) err(()=>A.parseRational(f),'INVALID_SHAPE');
 for (const f of [null,[],1,{numerator:1,denominator:'1'},{numerator:'1',denominator:null}]) err(()=>A.parseRational(f),'INVALID_TYPE');
 err(()=>A.add(r('x'),r('9'.repeat(257))),'RESOURCE_LIMIT'); // resource before lexical, across operands
 err(()=>A.add(r('9'.repeat(257)),null),'INVALID_TYPE'); // types before resource
 err(()=>A.add(r('2','4'),r('1','0')),'DIV_ZERO'); // denominator before canonical gcd
 err(()=>A.add(r('1','-2'),r('x')),'NONCANONICAL'); // lexical before sign
 err(()=>A.divide(r('2','4'),r('0')),'NONCANONICAL'); // wire before operation
 err(()=>A.divide(r('1'),r('0')),'DIV_ZERO');
 assert(Object.isFrozen(A.parseRational(r('1','3'))));
 assert.equal(JSON.stringify(A.parseRational({denominator:'3',numerator:'1'})),'{"numerator":"1","denominator":"3"}');
});
test('CAL08/T02/AR03: independent hand arithmetic and exact conversion anchors',()=>{
 eq(A.add(r('1','3'),r('1','6')),'1','2');
 eq(A.multiply(r('-2','3'),r('9','4')),'-3','2');
 eq(A.divide(r('2','3'),r('4','5')),'5','6');
 eq(A.divide(r('2','3'),r('-4','5')),'-5','6');
 eq(A.divide(r('0'),r('-4','5')),'0');
 eq(A.subtract(r('1','3'),r('1','3')),'0');
 eq(A.divide(r('1'),r('3')),'1','3'); eq(A.fromInteger('9007199254740993'),'9007199254740993');
 eq(A.divide(r('11'),r('10')),'11','10'); // ratio arithmetic only
 const tare=A.divide(r('1000'),r('3')); eq(tare,'1000','3');
 const physical=A.subtract(r('50000'),tare); eq(physical,'149000','3');
 const commercial=A.subtract(physical,r('100')); eq(commercial,'148700','3'); // generic fixture, not current rice impurity policy
 eq(A.round(commercial,q('floor')),'49566'); err(()=>A.toSigned64(commercial),'NON_INTEGRAL');
 eq(A.convertMass(r('1','3'),'kg','g'),'1000','3');
 eq(A.convertMass(r('1000','3'),'g','kg'),'1','3');
 eq(A.convertMass(r('-5','2'),'g','g'),'-5','2');
 err(()=>A.convertMass(r('1'),'lb','g'),'DOMAIN'); err(()=>A.convertMass(r('1'),null,'g'),'INVALID_TYPE');
 eq(A.subtract(r('2'),r('3')),'-1'); // arithmetic; deduction eligibility deferred
});
test('CAL05/CAL06/AR07/AR06: explicit signed floor/ceil/nearest, scope fixtures',()=>{
 eq(A.round(r('-5','2'),q('floor')),'-3'); eq(A.round(r('-5','2'),q('ceil')),'-2');
 eq(A.round(r('-2'),q('ceil')),'-2'); eq(A.round(r('-2'),q('floor')),'-2');
 eq(A.round(r('503','5'),q('floor')),'100'); eq(nearest(r('503','5'),r('1'),'positive'),'101');
 eq(nearest(r('201','2'),r('1'),'positive'),'101');
 const neg=['-2','-3','-2','-3','-2'],pos=['3','2','2','3','2'];
 ties.forEach((tie,i)=>{eq(nearest(r('-5','2'),r('1'),tie),neg[i]);eq(nearest(r('5','2'),r('1'),tie),pos[i]);});
 eq(nearest(r('-7','2'),r('1'),'even'),'-4'); eq(nearest(r('7','2'),r('1'),'even'),'4');
 for (const [n,out] of [['100499','100000'],['100500','101000'],['100501','101000']]) eq(nearest(r(n),r('1000'),'positive'),out);
 const a=r('3','5'),sum=A.add(a,a); eq(sum,'6','5');
 eq(A.add(nearest(a,r('1'),'positive'),nearest(a,r('1'),'positive')),'2');
 const total=nearest(sum,r('1'),'positive'); eq(total,'1');eq(A.subtract(total,sum),'-1','5');
 eq(A.round(sum,{method:'exact'}),'6','5');err(()=>A.toSigned64(sum),'NON_INTEGRAL');
 eq(A.subtract(r('0'),r('9')),'-9'); // exact reversal arithmetic, no posting or recomputation
 eq(A.round(r('-5','6'),q('floor',r('1','3'))),'-1');
 eq(A.round(r('-5','6'),q('ceil',r('1','3'))),'-2','3');
 eq(nearest(r('-5','6'),r('1','3'),'even'),'-2','3');
});
test('CAL11/AR01: rounding parameters mandatory; errors stable and no defaults',()=>{
 for (const o of [{},{method:'nearest',quantum:r('1')},{method:'floor'},{method:'exact',quantum:null},{method:'exact',tie:null},{method:'ceil',quantum:r('1'),tie:'positive'},{method:'nearest',quantum:r('1'),tie:'even',scope:'sheet'}]) err(()=>A.round(r('1'),o),'INVALID_SHAPE');
 err(()=>A.round(r('1'),{method:'nearest',quantum:r('1'),tie:null}),'INVALID_TYPE');
 err(()=>A.round(r('1'),{method:'floor',quantum:r('0')}),'DOMAIN');
 err(()=>A.round(r('1'),{method:'nearest',quantum:r('-1'),tie:'positive'}),'DOMAIN');
 err(()=>A.round(r('1'),{method:'nearest',quantum:r('1'),tie:'half_up'}),'DOMAIN');
 err(()=>A.round(r('1'),{method:'unapproved'}),'DOMAIN');
 err(()=>A.round(r('x'),{method:'nearest',quantum:r('9'.repeat(257)),tie:'wrong'}),'RESOURCE_LIMIT');
 err(()=>A.round(r('2','4'),{method:'nearest',quantum:r('0'),tie:'wrong'}),'NONCANONICAL');
});
test('T01/AR02/AR10: pre-cast only, wide results, resource and exact field bounds',()=>{
 const max='9223372036854775807',min='-9223372036854775808',wide='9223372036854775808';
 assert.equal(A.toSigned64(r(max)),max); assert.equal(A.toSigned64(r(min)),min);
 eq(A.add(r(max),r('1')),wide); err(()=>A.toSigned64(r(wide)),'OUT_OF_RANGE');
 err(()=>A.toSigned64(r('-9223372036854775809')),'OUT_OF_RANGE');
 err(()=>A.toSigned64(r('2','3')),'NON_INTEGRAL'); err(()=>A.toNumeric78(r('3','2')),'NON_INTEGRAL');
 for (const s of ['9'.repeat(78),'-'+'9'.repeat(78),'0']) assert.equal(A.toNumeric78(r(s)),s);
 for (const s of ['9'.repeat(79),'-'+'9'.repeat(79)]) err(()=>A.toNumeric78(r(s)),'OUT_OF_RANGE');
 eq(A.toNumeric78Components(r('9'.repeat(78),'1')),'9'.repeat(78));
 err(()=>A.toNumeric78Components(r('1','9'.repeat(79))),'OUT_OF_RANGE');
 err(()=>A.toNumeric78Components(r('9'.repeat(79))),'OUT_OF_RANGE');
 err(()=>A.toNumeric78(r('9'.repeat(79),'2')),'NON_INTEGRAL');
 err(()=>A.toNumeric78(r('2','4')),'NONCANONICAL');
 const n='1'+'0'.repeat(254)+'1',m='1'+'0'.repeat(255);
 err(()=>A.multiply(r(n),r(n)),'RESOURCE_LIMIT'); err(()=>A.multiply(r('1',n),r('1',n)),'RESOURCE_LIMIT');
 err(()=>A.add(r('9'.repeat(256)),r('1')),'RESOURCE_LIMIT');
 err(()=>A.convertMass(r('9'.repeat(256)),'kg','g'),'RESOURCE_LIMIT');
 eq(A.multiply(r(n,m),r(m,n)),'1'); eq(A.divide(r(n,m),r(n,m)),'1');
 eq(A.round(r(n),q('floor',r('1',n))),n); // 511-digit index, bounded output
 assert.equal(A.compare(r(n,m),r(m,n)),1);
 assert.equal(A.compare(r('-1','3'),r('-1','2')),1);assert.equal(A.compare(r('1'),r('1')),0);
});

// Independent invariants using direct exact cross products; no candidate arithmetic for expected bounds.
const abs=n=>n<0n?-n:n;
const gcd=(a,b)=>{a=abs(a);b=abs(b);while(b){[a,b]=[b,a%b]}return a};
const cmp=(a,b)=>{const t=BigInt(a.numerator)*BigInt(b.denominator)-BigInt(b.numerator)*BigInt(a.denominator);return t<0n?-1:t>0n?1:0};
function distanceAtMostHalf(a,b,q){
 const an=BigInt(a.numerator),ad=BigInt(a.denominator),bn=BigInt(b.numerator),bd=BigInt(b.denominator);
 return 2n*abs(an*bd-bn*ad)*BigInt(q.denominator)<=BigInt(q.numerator)*ad*bd;
}
function canonical(v){const n=BigInt(v.numerator),d=BigInt(v.denominator); assert(d>0n);assert.equal(gcd(n,d),1n);assert.equal(n.toString(),v.numerator);assert.equal(d.toString(),v.denominator);}

test('AR09: independent Python Fraction oracle, exact errors/results, seeded properties',()=>{
 const path=process.env.SND_ORACLE_VECTORS; assert(path,'set SND_ORACLE_VECTORS to generated oracle JSONL');
 const rows=readFileSync(path,'utf8').trimEnd().split('\n'); assert(rows.length>9000);
 let passed=0,rejected=0,roundProps=0,conservation=0,monotonic=0; const lower=new Map();
 for (const [index,line] of rows.entries()){
  assert(Buffer.byteLength(line,'utf8')<=4096);
  const v=JSON.parse(line),f=A[v.op]; assert.equal(typeof f,'function');
  try {
   if(v.error){err(()=>f(...v.args),v.error);rejected++;continue;}
   const a=f(...v.args); assert.deepEqual(a,v.value); assert.equal(JSON.stringify(f(...v.args)),JSON.stringify(a));
   if(a && typeof a==='object') {canonical(a); assert.deepEqual(A.normalizeRational(a),a);}
   if(v.op==='round'){
    const [x,opts]=v.args; assert.deepEqual(A.round(a,opts),a);
    if(opts.method==='floor')assert(cmp(a,x)<=0);
    if(opts.method==='ceil')assert(cmp(a,x)>=0);
    if(opts.method==='nearest')assert(distanceAtMostHalf(a,x,opts.quantum));
    if(v.monotonicGroup){
     if(v.side==='lower')lower.set(v.monotonicGroup,a);
     else {assert(lower.has(v.monotonicGroup));assert(cmp(lower.get(v.monotonicGroup),a)<=0);lower.delete(v.monotonicGroup);monotonic++;}
    }
    roundProps++;
   }
   if(v.op==='add'||v.op==='subtract'){
    const [x,y]=v.args; // independently verify conservation using cross products
    const xn=BigInt(x.numerator),xd=BigInt(x.denominator),yn=BigInt(y.numerator),yd=BigInt(y.denominator);
    assert.equal(BigInt(a.numerator)*xd*yd,(xn*yd+(v.op==='add'?1n:-1n)*yn*xd)*BigInt(a.denominator));conservation++;
   }
   passed++;
  }catch(e){throw Error(`oracle row ${index+1} ${v.variant} ${v.op}: ${line}`,{cause:e});}
 }
 assert.equal(lower.size,0); assert.equal(monotonic,240);
 console.log(JSON.stringify({monotonicChecks:monotonic,oracleVectors:rows.length,exactResults:passed,expectedErrors:rejected,roundProperties:roundProps,conservationChecks:conservation}));
});
