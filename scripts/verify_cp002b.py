#!/usr/bin/env python3
"""Offline B-P1 verification, exact pinned compiler, isolated build/evidence.
No installs, network, database, CI, posting, or writes to tracked files.
"""
import argparse, datetime, hashlib, json, os, platform, shutil, subprocess, sys, tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PARENT='04a839f94da58ab6842445b00626077704775b6d'
LEGACY_ORACLE_SHA='62bec71a9f4e8a2bd0afbc5b24b7b387e087fcdd15b0ac09c956080213b3825a'
A_BLOB='c5d4c206d39e2190f44b58c9c4c67f7596e232b0'
A_SHA='e3031c59ed667082a3bd17f94a2afa45612d0282dbf615aea9d7e287b43e68bf'
LOCK_SHA='154568f6dab08e55c61fc6b8362fb4d6b020ceafa60cbbc1c86a3e6c8a94aaa2'
REACT_LOCK_SHA='f622b1c42b4189a8ca9b4b6196289dd165c31050f35e9d0ec6f12de7c13ffc09'
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--evidence-dir',required=True);args=parser.parse_args()
out=Path(args.evidence_dir).resolve()
if out.is_relative_to(ROOT):parser.error('evidence directory must be outside source tree')
out.mkdir(parents=True,exist_ok=False);results=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(name,cmd,cwd=ROOT,env=None,expect=0,stdout_file=None,timeout=180):
    cmd=list(map(str,cmd));log=out/(name+'.log');status='FAIL';code=None;reason=''
    try:
        if stdout_file is None:
            with log.open('wb') as f:r=subprocess.run(cmd,cwd=cwd,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=timeout)
        else:
            with stdout_file.open('wb') as f,log.open('wb') as e:r=subprocess.run(cmd,cwd=cwd,env=env,stdout=f,stderr=e,timeout=timeout)
        code=r.returncode;status='PASS' if code==expect else 'FAIL'
    except (OSError,subprocess.TimeoutExpired) as e:reason=str(e);log.write_text(reason+'\n');status='BLOCKED'
    results.append(dict(step=name,command=cmd,cwd=str(cwd),environment_overrides={k:env[k] for k in ('SND_B_BUILD','SND_B_VECTORS') if env and k in env},exit_code=code,expected_exit_code=expect,status=status,reason=reason));print(name,status,code,flush=True)
    if status!='PASS':raise RuntimeError(name+' failed')
    return log

def require(name,condition,detail):
    results.append(dict(step=name,status='PASS' if condition else 'FAIL',exit_code=None,detail=detail));print(name,results[-1]['status'],flush=True)
    if not condition:raise RuntimeError(name+' failed')

paths=sorted({p for p in (ROOT/'src').rglob('*.ts')}|{p for p in (ROOT/'tests/cp002b').glob('*') if p.is_file()}|{ROOT/p for p in ['package.json','package-lock.json','react-shell/package-lock.json','tsconfig.json','tsconfig.contract-tests.json','tests/contracts.type-test.ts','tests/routes.test.mjs','fixtures/synthetic.json','public/index.html','public/style.css','scripts/verify_cp002b.py','docs/cp002/CP-002B_B-P1_CONTRACT.md']})
def source_hashes():return {p.relative_to(ROOT).as_posix():sha(p) for p in paths}
before={};rc=1
try:
    before=source_hashes();(out/'TESTED_SOURCE_SHA256.txt').write_text(''.join(f'{h}  {p}\n' for p,h in before.items()))
    toolchain=ROOT/'node_modules/typescript/lib/tsc.js';npm='npm.cmd' if os.name=='nt' else 'npm'
    envinfo=dict(utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),platform=platform.platform(),machine=platform.machine(),python=sys.version,expected_parent=PARENT,compiler_path=str(toolchain),compiler_package_sha256=sha(ROOT/'node_modules/typescript/package.json'),compiler_entry_sha256=sha(toolchain),compiler_impl_sha256=sha(ROOT/'node_modules/typescript/lib/_tsc.js'),profile='B-P1 v1.0',remediation='B-IV-01',oracle_seed=2026112802,local_checkout=(ROOT/'.git').exists())
    (out/'environment.json').write_text(json.dumps(envinfo,indent=2)+'\n')
    n=run('node-version',['node','--version']).read_text().strip();m=run('npm-version',[npm,'--version']).read_text().strip();t=run('ts-version',['node',toolchain,'--version']).read_text().strip();run('python-version',[sys.executable,'--version']);run('git-version',['git','--version'])
    require('toolchain-pins',(n,m,t)==('v22.16.0','10.9.2','Version 5.8.3'),f'{n}, {m}, {t}; no install performed')
    ab=(ROOT/'src/modules/shared/exact-arithmetic/index.ts').read_bytes();gitblob=hashlib.sha1(f'blob {len(ab)}\0'.encode()+ab).hexdigest()
    require('accepted-A-and-locks',gitblob==A_BLOB and hashlib.sha256(ab).hexdigest()==A_SHA and sha(ROOT/'package-lock.json')==LOCK_SHA and sha(ROOT/'react-shell/package-lock.json')==REACT_LOCK_SHA,'Exact A source and both accepted lock hashes')
    if envinfo['local_checkout']:
        run('git-head',['git','rev-parse','HEAD']);run('git-status-before',['git','status','--porcelain'])
    else:require('checkout-disclosure',True,'No full Git checkout; connector ancestry/tree checked separately. Local reconstruction only.')
    run('typecheck',['node',toolchain,'--noEmit']);run('contract-typecheck',['node',toolchain,'-p','tsconfig.contract-tests.json'])
    with tempfile.TemporaryDirectory(prefix='snd-bp1-') as tmp:
        scratch=Path(tmp);dist=scratch/'dist';run('compile',['node',toolchain,'--outDir',dist]);(scratch/'package.json').write_text('{"type":"module"}\n')
        (out/'compiled_SHA256.txt').write_text(''.join(f'{sha(p)}  {p.relative_to(dist).as_posix()}\n' for p in sorted(dist.rglob('*.js'))))
        shutil.copytree(ROOT/'public',dist,dirs_exist_ok=True);(scratch/'tests').mkdir();shutil.copy2(ROOT/'tests/routes.test.mjs',scratch/'tests/routes.test.mjs');shutil.copytree(ROOT/'fixtures',scratch/'fixtures')
        run('baseline-node-smoke',['node','--test',scratch/'tests/routes.test.mjs'],cwd=scratch)
        v1=scratch/'vectors.jsonl';v2=scratch/'vectors-repeat.jsonl'
        run('oracle-generate',[sys.executable,'tests/cp002b/oracle.py'],stdout_file=v1);run('oracle-repeat',[sys.executable,'tests/cp002b/oracle.py'],stdout_file=v2)
        h1=sha(v1);h2=sha(v2);require('oracle-deterministic',h1==h2,'Seed 2026112802, '+h1)
        legacy=scratch/'legacy-projection.jsonl';run('oracle-legacy-projection',[sys.executable,'tests/cp002b/oracle.py','--legacy-projection'],stdout_file=legacy)
        lh=sha(legacy);require('oracle-legacy-continuity',lh==LEGACY_ORACLE_SHA,'Original 600 vectors with only revision metadata removed: '+lh)
        (out/'oracle-digests.json').write_text(json.dumps(dict(seed=2026112802,first=h1,repeat=h2,bytes=v1.stat().st_size,vectors=624,legacyProjection=lh,legacyExpected=LEGACY_ORACLE_SHA),indent=2)+'\n')
        env=dict(os.environ,SND_B_BUILD=str(dist),SND_B_VECTORS=str(v1))
        run('rice-tests',['node','--test','tests/cp002b/rice.test.mjs'],env=env)
        benches=[]
        for count in (1000,10000,100000):
            log=run('benchmark-'+str(count),['node','tests/cp002b/benchmark.mjs',count],env=env);benches.append(json.loads(log.read_text()))
        (out/'benchmarks.json').write_text(json.dumps(benches,indent=2)+'\n')
    require('source-no-drift',source_hashes()==before,'All locally used source/fixture/lock bytes unchanged by runner')
    if envinfo['local_checkout']:run('git-status-after',['git','status','--porcelain'])
    rc=0
except Exception as e:
    (out/'runner-error.log').write_text(type(e).__name__+': '+str(e)+'\n');print(str(e),file=sys.stderr)
finally:
    (out/'results.json').write_text(json.dumps(results,indent=2)+'\n');(out/'exit-codes.tsv').write_text('step\tstatus\texit_code\n'+''.join(f"{r['step']}\t{r['status']}\t{'' if r.get('exit_code') is None else r['exit_code']}\n" for r in results))
    (out/'SHA256SUMS.txt').write_text(''.join(f'{sha(p)}  {p.name}\n' for p in sorted(out.iterdir()) if p.is_file() and p.name!='SHA256SUMS.txt'))
sys.exit(rc)
