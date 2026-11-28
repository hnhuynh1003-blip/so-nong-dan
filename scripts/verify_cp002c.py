#!/usr/bin/env python3
"""C-P1 isolated verification. No install, network, database, CI or tracked dist writes."""
import argparse,contextlib,datetime,hashlib,json,os,platform,shutil,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PARENT='e21b0b5583ebd0da222e62aaa5553cfe7122bea8';PARENT_TREE='856d6b51dd7f9edc54a000f1e35a67cf5442a3cf'
A='80fb95175e902e6bea3caac518a8a6b25b9c1815'; B='b4f94a3fe24c02be292247184aeaca33b2375a4a'
A_ORACLE='6501578c96186b5ab2e20e7cbddb5d6dfcb70305ec9f75419c8a6ffe5b3e09eb'; B_ORACLE='5c54c778b9f9e34db4aeea03a51325c271e91b4aec0d53a23795d00ea816050f'; B_LEGACY='62bec71a9f4e8a2bd0afbc5b24b7b387e087fcdd15b0ac09c956080213b3825a'
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--evidence-dir',required=True)
for name in ['expected-sources','expected-compiled','baseline-receipt','historical-engine']:
    parser.add_argument('--'+name,required=True);parser.add_argument('--'+name+'-sha256',required=True)
parser.add_argument('--checkout-head');parser.add_argument('--checkout-tree')
args=parser.parse_args();out=Path(args.evidence_dir).resolve()
if out.is_relative_to(ROOT):parser.error('evidence dir must be external')
out.mkdir(parents=True,exist_ok=False);results=[]
env={k:v for k,v in os.environ.items() if k not in ('NODE_OPTIONS','NODE_PATH','NODE_DEBUG','PYTHONPATH')};env['PYTHONDONTWRITEBYTECODE']='1';env['LC_ALL']='C.UTF-8'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def manifest(p):
    d={}
    for l in p.read_text().splitlines():
        h,k=l.split('  ',1)
        if k in d or len(h)!=64 or not all(c in '0123456789abcdef' for c in h) or Path(k).is_absolute() or '..' in Path(k).parts:raise RuntimeError('Manifest syntax')
        d[k]=h
    return d
def require(name,ok,detail):
    results.append(dict(step=name,status='PASS' if ok else 'FAIL',exit_code=None,detail=detail));print(name,results[-1]['status'],flush=True)
    if not ok:raise RuntimeError(name)
def run(name,cmd,cwd=ROOT,extra=None,stdout_file=None,expected=0,timeout=240):
    cmd=list(map(str,cmd));log=out/(name+'.log');code=None;reason='';ee=dict(env,**(extra or {}))
    try:
        with log.open('wb') as f:
            if stdout_file is None:r=subprocess.run(cmd,cwd=cwd,env=ee,stdout=f,stderr=subprocess.STDOUT,timeout=timeout)
            else:
                with stdout_file.open('wb') as o:r=subprocess.run(cmd,cwd=cwd,env=ee,stdout=o,stderr=f,timeout=timeout)
        code=r.returncode;status='PASS' if code==expected else 'FAIL'
    except (OSError,subprocess.TimeoutExpired) as e:reason=str(e);log.write_text(reason+'\n');status='BLOCKED'
    results.append(dict(step=name,command=cmd,cwd=str(cwd),environment_overrides=extra or {},exit_code=code,expected_exit_code=expected,status=status,reason=reason));print(name,status,code,flush=True)
    if status!='PASS':raise RuntimeError(name)
    return log
accepted=manifest(ROOT/'tests/cp002c/accepted-inputs.sha256');accepted_compiled=manifest(ROOT/'tests/cp002c/accepted-compiled.sha256')
paths=sorted({ROOT/p for p in accepted}|{p for p in (ROOT/'src/modules/policy/cp1').glob('*') if p.is_file()}|{p for p in (ROOT/'tests/cp002c').glob('*') if p.is_file()}|{ROOT/'scripts/verify_cp002c.py',ROOT/'docs/cp002/CP-002C_C-P1_CONTRACT.md',ROOT/'docs/cp002/CP-002C_AUTHORIZATION.md',ROOT/'docs/cp002/CP-002C_REMEDIATION_TRACEABILITY.md'})
def source_hashes():return {p.relative_to(ROOT).as_posix():sha(p) for p in paths}
def external(name):
    attr=name.replace('-','_');path=Path(getattr(args,attr)).resolve();pin=getattr(args,attr+'_sha256')
    require('external-'+name,not path.is_relative_to(ROOT) and path.is_file() and sha(path)==pin,{'path':str(path),'expectedSha256':pin,'origin':'separately supplied trusted prerequisite, never generated from candidate by runner'})
    shutil.copy2(path,out/(name+'.received'))
    return path
rc=1
try:
    receipt_path=external('baseline-receipt');receipt=json.loads(receipt_path.read_text());expected_source=manifest(external('expected-sources'));expected_compiled=manifest(external('expected-compiled'));historical=external('historical-engine');expected_engine=json.loads(historical.read_text())
    require('trusted-baseline-receipt',receipt.get('baselineHead')==PARENT and receipt.get('baselineTree')==PARENT_TREE and receipt.get('runtimeA')==A and receipt.get('runtimeB')==B and receipt.get('remoteManifestBlob')=='2189c96a1bbc9d30fdf8627777600f30046aba54' and receipt.get('acceptedSourcePins')==accepted and receipt.get('registeredIds')==64 and receipt.get('historicalEngineManifestSha256')==sha(historical),'Exact GitHub parent/tree and remote accepted pins; independent accepted runtime identities; 64-ID register readback')
    require('expected-source-inventory',set(expected_source)=={p.relative_to(ROOT).as_posix() for p in paths} and {p.relative_to(ROOT).as_posix() for p in (ROOT/'src').rglob('*.ts')}=={p for p in expected_source if p.startswith('src/')},'Every compiled TS source and tested input is pinned, no extra TS source')
    before=source_hashes();(out/'TESTED_SOURCE_SHA256.txt').write_text(''.join(f'{h}  {p}\n' for p,h in before.items()))
    require('accepted-source-integrity',all(before.get(p)==h for p,h in accepted.items()),f'{len(accepted)}/{len(accepted)} accepted source/fixture/lock/config/read-only SQL and contract SHA-256')
    require('trusted-C-source-integrity',before==expected_source,f'{len(before)}/{len(expected_source)} actual tested bytes match separately pinned expected-source manifest; C provenance is Engineering-local until independent candidate verification')
    require('compiler-byte-pins',all(sha(ROOT/p)==h for p,h in receipt['compilerPins'].items()),receipt['compilerOrigin'])
    compiler=ROOT/'node_modules/typescript/lib/tsc.js';npm='npm.cmd' if os.name=='nt' else 'npm'
    info=dict(utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),platform=platform.platform(),machine=platform.machine(),python=sys.version,expected_parent=PARENT,parent_tree=PARENT_TREE,accepted_A=A,accepted_B=B,compiler_path=str(compiler),compiler_package_sha256=sha(ROOT/'node_modules/typescript/package.json'),compiler_impl_sha256=sha(ROOT/'node_modules/typescript/lib/_tsc.js'),profile='C-P1 v1.0',canonicalization='SND-JCS-RESTRICTED-1',oracle_seed=2026112803,remediation_seed=202611280315,expected_source_manifest_sha256=args.expected_sources_sha256,expected_compiled_manifest_sha256=args.expected_compiled_sha256,baseline_receipt_sha256=args.baseline_receipt_sha256,historical_engine_sha256=args.historical_engine_sha256,node_executable_sha256=sha(Path(shutil.which('node')).resolve()),local_git_checkout=(ROOT/'.git').exists(),dependency_install='NOT RUN',trust_boundary='Fresh Node process; fixed local compiled modules; no loader/preload; trusted filesystem, no concurrent writes. Source/locks verified here.')
    (out/'environment.json').write_text(json.dumps(info,indent=2)+'\n')
    n=run('node-version',['node','--version']).read_text().strip();m=run('npm-version',[npm,'--version']).read_text().strip();t=run('ts-version',['node',compiler,'--version']).read_text().strip();run('python-version',[sys.executable,'--version']);run('git-version',['git','--version'])
    require('toolchain-pins',(n,m,t)==('v22.16.0','10.9.2','Version 5.8.3'),f'{n}, {m}, {t}; clean npm ci NOT RUN')
    if info['local_git_checkout']:
        gh=run('git-head',['git','rev-parse','HEAD']).read_text().strip();gt=run('git-tree',['git','rev-parse','HEAD^{tree}']).read_text().strip();require('git-exact-checkout',args.checkout_head==gh and args.checkout_tree==gt and ((gh==PARENT and gt==PARENT_TREE) or run('git-candidate-parent',['git','rev-parse','HEAD^']).read_text().strip()==PARENT),'Exact externally expected checkout HEAD/tree and baseline or direct parent');run('git-status-before',['git','status','--porcelain'])
    else:require('checkout-disclosure',True,'Hash-matched reconstruction, not full Git checkout; connector checks recorded separately')
    run('typecheck',['node',compiler,'--noEmit']);run('contract-typecheck',['node',compiler,'-p','tsconfig.contract-tests.json'])
    with contextlib.nullcontext(str(out/'isolated-build')) as tmp:
        scratch=Path(tmp);scratch.mkdir();dist=scratch/'dist';run('compile',['node',compiler,'--outDir',dist]);(scratch/'package.json').write_text('{"type":"module"}\n')
        actual={p.relative_to(dist).as_posix():sha(p) for p in sorted(dist.rglob('*.js'))};(out/'compiled_SHA256.txt').write_text(''.join(f'{h}  {p}\n' for p,h in actual.items()))
        require('accepted-compiled-continuity',all(actual.get(p)==h for p,h in accepted_compiled.items()),f'{len(accepted_compiled)}/{len(accepted_compiled)} prior compiled files match; A/B unchanged')
        require('trusted-compiled-continuity',actual==expected_compiled,f'{len(actual)}/{len(expected_compiled)} all compiled A/B/C JS match separately retained expected build')
        engine_uri=(dist/'modules/policy/cp1/index.js').as_uri();probe=run('engine-binding',['node','--input-type=module','-e',f'const C=await import({json.dumps(engine_uri)});if(!C.engineAvailable())throw Error("engine unavailable");console.log(JSON.stringify(C.engineIdentity()));']);ei=json.loads(probe.read_text())
        require('historical-engine-identity',ei==expected_engine,'Actual engine identity byte-equivalent fields to independently supplied preserved historical manifest; cannot substitute caller manifest')
        require('engine-identity-pins',ei['sourceCommit']==B and ei['arithmeticSourceCommit']==A and all(sha(ROOT/x['path'])==x['sha256'] for x in ei['sourceFiles']+ei['dependencyLocks']+ei['oracleFixtures']+[ei['buildConfig']]) and all(actual.get(x['path'])==x['sha256'] for x in ei['artifacts']),'Pinned source/lock/config/oracle files and all three actual compiled artifact hashes; fixed adapter identity asserted in C-10/C-14')
        shutil.copytree(ROOT/'public',dist,dirs_exist_ok=True);(scratch/'tests').mkdir();shutil.copy2(ROOT/'tests/routes.test.mjs',scratch/'tests/routes.test.mjs');shutil.copytree(ROOT/'fixtures',scratch/'fixtures');run('baseline-node-smoke',['node','--test',scratch/'tests/routes.test.mjs'],cwd=scratch)
        digests={}
        for label,script,expected in [('a','tests/cp002a/oracle.py',A_ORACLE),('b','tests/cp002b/oracle.py',B_ORACLE),('c','tests/cp002c/oracle.py','3347e152d6893e028323e2ccde9f462f7700e59a4bec2bff854cbfaf4c15c645')]:
            v=scratch/(label+'.jsonl');v2=scratch/(label+'-repeat.jsonl')
            if label=='a':
                run(label+'-oracle-generate',[sys.executable,script,'--output',v]);run(label+'-oracle-repeat',[sys.executable,script,'--output',v2])
            else:
                run(label+'-oracle-generate',[sys.executable,script],stdout_file=v);run(label+'-oracle-repeat',[sys.executable,script],stdout_file=v2)
            h=sha(v);count=sum(1 for _ in v.open('rb'));require(label+'-oracle-continuity',h==sha(v2) and (expected is None or h==expected),f'{count} vectors; SHA-256 {h}; repeat byte-identical');digests[label]=dict(vectors=count,sha256=h,repeat=sha(v2),bytes=v.stat().st_size)
        legacy=scratch/'b-legacy.jsonl';run('b-oracle-legacy',[sys.executable,'tests/cp002b/oracle.py','--legacy-projection'],stdout_file=legacy);require('b-legacy-continuity',sha(legacy)==B_LEGACY,sha(legacy));digests['b']['legacyProjection']=sha(legacy)
        rem=scratch/'remediation.jsonl';rem2=scratch/'remediation-repeat.jsonl';run('remediation-oracle-generate',[sys.executable,'tests/cp002c/remediation_oracle.py',historical],stdout_file=rem);run('remediation-oracle-repeat',[sys.executable,'tests/cp002c/remediation_oracle.py',historical],stdout_file=rem2)
        count=sum(1 for _ in rem.open('rb'));h=sha(rem);require('remediation-oracle-continuity',count==317 and h==sha(rem2)=='adb5656bd88acd2abca822e9bc1cd2573559a7ccf8f2cde7447fb5fc068627eb',f'{count} independent generated cases; repeat and pinned reference digest match');digests['remediation']=dict(vectors=count,sha256=h,repeat=sha(rem2),bytes=rem.stat().st_size)
        (out/'oracle-digests.json').write_text(json.dumps(digests,indent=2)+'\n')
        run('accepted-a-regression',['node','--test','tests/cp002a/arithmetic.test.mjs'],extra={'SND_ARITHMETIC_MODULE':(dist/'modules/shared/exact-arithmetic/index.js').as_uri(),'SND_ORACLE_VECTORS':str(scratch/'a.jsonl')})
        run('accepted-b-regression',['node','--test','tests/cp002b/rice.test.mjs'],extra={'SND_B_BUILD':str(dist),'SND_B_VECTORS':str(scratch/'b.jsonl')})
        snapshots=scratch/'snapshots.jsonl';ce={'SND_C_BUILD':str(dist),'SND_C_VECTORS':str(scratch/'c.jsonl'),'SND_C_SNAPSHOTS':str(snapshots),'SND_C_REMEDIATION_VECTORS':str(rem)}
        run('c-tests',['node','--test','tests/cp002c/cp1.test.mjs','tests/cp002c/remediation.test.mjs'],extra=ce);run('c-independent-snapshot-hashes',[sys.executable,'tests/cp002c/oracle.py','--verify-snapshots',snapshots]);(out/'snapshot-fixtures-digest.json').write_text(json.dumps(dict(bytes=snapshots.stat().st_size,sha256=sha(snapshots),records=sum(1 for _ in snapshots.open('rb'))),indent=2)+'\n');require('historical-snapshot-digest-continuity',sha(snapshots)=='671a5b098f6266a95b19328cecc03dda72882058d87e81b87a1939a72ef1796a','All original 134 snapshot serialized bytes unchanged; trusted context is separate input')
        benches=[]
        for size,phase in [(1000,'create'),(1000,'digest'),(1000,'replay'),(10000,'create'),(10000,'digest'),(10000,'replay'),(100000,'create'),(100000,'create-frozen'),(100000,'reference')]:
            label=f'benchmark-{size}-{phase}';log=run(label,['node','tests/cp002c/benchmark.mjs',size,phase],extra={'SND_C_BUILD':str(dist)});data=json.loads(log.read_text());expected='RESOURCE_LIMIT' if size==100000 and phase.startswith('create') else 'PASS';nonmutation=data['nonMutation'];require('benchmark-result-'+str(size)+'-'+phase,data['status']==expected and data['bags']==size and data['phase']==phase and nonmutation['bytesEqual'] and nonmutation['ownKeyOrderAndDescriptorsEqual'] and (expected!='RESOURCE_LIMIT' or (data['rejection']['code']=='RESOURCE_LIMIT' and nonmutation['noPartialSnapshot'] and data['snapshotSha256'] is None)),'Isolated size/phase, exact non-mutation; bounded rejection or verified reference');benches.append(data)
        for size in [1000,10000]:
            subset=[x for x in benches if x['bags']==size];require('benchmark-digest-continuity-'+str(size),len({(x['snapshotSha256'],x['inputSha256'],x['resultSha256'],x['acceptedBOutputDigest']) for x in subset})==1,'Separate create/digest/replay process exact hashes match')
        rejected=[x for x in benches if x['status']=='RESOURCE_LIMIT'];require('maximum-rejection-continuity',len(rejected)==2 and rejected[0]['rejection']==rejected[1]['rejection'] and rejected[0]['nonMutation']['beforeSha256']==rejected[1]['nonMutation']['beforeSha256'] and rejected[0]['nonMutation']['sourceFrozen'] is False and rejected[1]['nonMutation']['sourceFrozen'] is True,'Mutable/frozen 100k same typed rejection and exact before/after bytes, no partial result')
        (out/'benchmarks.json').write_text(json.dumps(benches,indent=2)+'\n')
    require('source-no-drift',source_hashes()==before,'All tested source/lock/fixture/contract bytes unchanged')
    if info['local_git_checkout']:run('git-status-after',['git','status','--porcelain'])
    rc=0
except Exception as e:
    (out/'runner-error.log').write_text(type(e).__name__+': '+str(e)+'\n');print(str(e),file=sys.stderr)
finally:
    (out/'results.json').write_text(json.dumps(results,indent=2)+'\n');(out/'exit-codes.tsv').write_text('step\tstatus\texit_code\n'+''.join(f"{r['step']}\t{r['status']}\t{'' if r.get('exit_code') is None else r['exit_code']}\n" for r in results));(out/'SHA256SUMS.txt').write_text(''.join(f'{sha(p)}  {p.relative_to(out).as_posix()}\n' for p in sorted(out.rglob('*')) if p.is_file() and p!=out/'SHA256SUMS.txt'))
sys.exit(rc)
