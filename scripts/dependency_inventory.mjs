import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]??'react-shell');
const lock=JSON.parse(readFileSync(join(root,'package-lock.json'),'utf8'));
if(lock.lockfileVersion!==3 || !lock.packages) throw Error('Expected npm lockfile v3');
const inventory=[]; const issues=[];
for(const [path,meta] of Object.entries(lock.packages)){
 if(!path)continue;
 const full=resolve(root,path);
 if(!full.startsWith(root+ (process.platform==='win32'?'\\':'/')))throw Error('Unsafe lock path');
 const file=join(full,'package.json');
 if(!meta.integrity || !meta.resolved?.startsWith('https://registry.npmjs.org/'))issues.push(`${path}: missing integrity or non-public-registry resolution`);
 if(!existsSync(file)){
  inventory.push({path,version:meta.version,lockLicense:meta.license??null,installed:false,optional:!!meta.optional});
  if(!meta.optional)issues.push(`${path}: required package not installed`);
  continue;
 }
 const pkg=JSON.parse(readFileSync(file,'utf8'));
 if(pkg.version!==meta.version)issues.push(`${path}: installed version differs from lock`);
 if(!pkg.license)issues.push(`${path}: license metadata missing`);
 inventory.push({path,name:pkg.name,version:pkg.version,license:pkg.license??null,lockLicense:meta.license??null,engines:pkg.engines??null,installed:true});
}
console.log(JSON.stringify({lockfileVersion:lock.lockfileVersion,packageCount:inventory.length,inventory,issues,scope:'metadata only; review actual LICENSE/NOTICE, optional platforms and security separately'},null,2));
if(issues.length)process.exitCode=1;
