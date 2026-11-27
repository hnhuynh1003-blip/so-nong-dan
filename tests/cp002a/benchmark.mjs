// Synthetic isolated library microbenchmark; not a historical data/production limit.
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
const A = await import(process.env.SND_ARITHMETIC_MODULE ?? new URL('../../dist/modules/shared/exact-arithmetic/index.js',import.meta.url).href);
const raw=process.argv[2];
if(typeof raw!=='string'||!/^[1-9][0-9]{0,5}$/.test(raw)||BigInt(raw)>100000n)throw Error('operation count must be explicit 1..100000');
const count=parseInt(raw,10); // harness metadata only, never a quantity
const make=(n,d)=>({numerator:n.toString(),denominator:d.toString()});
let completed=0;
for(const [i,digits] of [20,128,256].entries()){
 const n=10n**BigInt(digits-1)+1n,d=n-1n,a=make(n,d),b=make(d,n),neg=make(-n,d),one=make(1n,1n);
 const ops=[()=>A.multiply(a,b),()=>A.divide(a,a),()=>A.add(a,neg),()=>A.compare(a,b),()=>A.round(a,{method:'nearest',quantum:one,tie:'even'}),()=>A.subtract(a,a)];
 const size=i===2?count-completed:Math.floor(count/3); const hash=createHash('sha256');
 const before=process.memoryUsage().rss,start=performance.now();
 for(let j=0;j<size;j++)hash.update(JSON.stringify(ops[j%ops.length]())+'\n');
 const ms=performance.now()-start;completed+=size;
 console.log(JSON.stringify({componentDigits:digits,operations:size,elapsedMs:ms,opsPerSecond:size/(ms/1000),rssBeforeBytes:before,rssAfterBytes:process.memoryUsage().rss,processPeakRSSKiB:process.resourceUsage().maxRSS,resultSha256:hash.digest('hex')}));
}
console.log(JSON.stringify({totalOperations:completed,limit:100000,node:process.version,platform:process.platform,arch:process.arch}));
