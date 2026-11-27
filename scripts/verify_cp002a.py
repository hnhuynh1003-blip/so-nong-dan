#!/usr/bin/env python3
"""Reproduce isolated A-P1 checks with existing exact compiler; no network/CI/DB.
Requires existing node_modules/typescript (use reviewed lock and npm ci separately).
Output must be a new directory outside the source checkout.
"""
import argparse, hashlib, json, os, platform, subprocess, sys, tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--evidence-dir',type=Path,required=True)
p.add_argument('--operations',type=int,required=True)
a=p.parse_args()
if not 1<=a.operations<=100000:p.error('operations must be 1..100000')
OUT=a.evidence_dir.resolve()
if OUT.is_relative_to(ROOT):p.error('evidence directory must be outside checkout')
OUT.mkdir(parents=True,exist_ok=False)
rows=[]
metadata={'platform':platform.platform(),'machine':platform.machine(),'python':sys.version,'processor':platform.processor(),'operations':a.operations,'scope':'pure CP-002A; no network/SQL/CI; no clean install by this script'}
compiler=ROOT/'node_modules/typescript/lib/tsc.js'
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def run(name,cmd,env=None,expected=0):
    cmd=[str(x) for x in cmd]
    try:
        result=subprocess.run(cmd,cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=180)
        (OUT/(name+'.log')).write_bytes(result.stdout)
        ok=result.returncode==expected
        rows.append(dict(step=name,command=cmd,exit_code=result.returncode,expected_exit_code=expected,status='PASS' if ok else 'FAIL'))
    except (OSError,subprocess.TimeoutExpired) as exc:
        (OUT/(name+'.log')).write_text(str(exc)+'\n')
        rows.append(dict(step=name,command=cmd,exit_code=None,status='BLOCKED',reason=type(exc).__name__))
        ok=False
    print(name,rows[-1]['status'],rows[-1]['exit_code'],flush=True);return ok
try:
    tool=run('node-version',['node','--version'])
    tool=run('npm-version',['npm.cmd' if os.name=='nt' else 'npm','--version']) and tool
    tool=run('typescript-version',['node',compiler,'--version']) and tool
    tool=tool and [(OUT/(x+'.log')).read_text().strip() for x in ('node-version','npm-version','typescript-version')]==['v22.16.0','10.9.2','Version 5.8.3']
    if not tool:raise RuntimeError('Exact toolchain not available')
    metadata['compiler_entry_sha256']=digest(compiler)
    if (compiler.parent/'_tsc.js').exists():metadata['compiler_impl_sha256']=digest(compiler.parent/'_tsc.js')
    metadata['lock_sha256']=digest(ROOT/'package-lock.json')
    metadata['source_sha256']={x:digest(ROOT/x) for x in ['src/modules/shared/exact-arithmetic/index.ts','tests/cp002a/arithmetic.test.mjs','tests/cp002a/oracle.py','tests/cp002a/benchmark.mjs','scripts/verify_cp002a.py']}
    type_ok=run('typecheck',['node',compiler,'--noEmit'])
    contracts_ok=run('contract-typecheck',['node',compiler,'-p','tsconfig.contract-tests.json'])
    with tempfile.TemporaryDirectory(prefix='snd-cp002a-build-') as temp:
        build=Path(temp)/'build'; vectors=Path(temp)/'oracle.jsonl'; vectors2=Path(temp)/'oracle-repeat.jsonl'
        if not run('build',['node',compiler,'--outDir',build]):raise RuntimeError('Compilation failed')
        (build/'package.json').write_text('{"type":"module"}\n',encoding='utf-8')
        module=build/'modules/shared/exact-arithmetic/index.js';metadata['compiled_module_sha256']=digest(module)
        if not run('oracle-generate',[sys.executable,'tests/cp002a/oracle.py','--output',vectors]):raise RuntimeError('Oracle generation failed')
        if not run('oracle-repeat',[sys.executable,'tests/cp002a/oracle.py','--output',vectors2]):raise RuntimeError('Oracle repeat failed')
        metadata['oracle_vectors_sha256']=digest(vectors);metadata['oracle_repeat_sha256']=digest(vectors2)
        metadata['oracle_vectors_count']=sum(1 for _ in vectors.open('rb'))
        if metadata['oracle_vectors_sha256']!=metadata['oracle_repeat_sha256']:raise RuntimeError('Oracle not reproducible')
        env=dict(os.environ,SND_ORACLE_VECTORS=str(vectors),SND_ARITHMETIC_MODULE=module.as_uri())
        metadata['test_environment']={'SND_ORACLE_VECTORS':str(vectors),'SND_ARITHMETIC_MODULE':module.as_uri()}
        tests_ok=run('arithmetic-tests',['node','--test','tests/cp002a/arithmetic.test.mjs'],env)
        if tests_ok:run('benchmark',['node','tests/cp002a/benchmark.mjs',str(a.operations)],env)
        else:rows.append(dict(step='benchmark',status='NOT RUN',exit_code=None,reason='tests failed'))
        if not type_ok or not contracts_ok:raise RuntimeError('Typecheck failed')
except Exception as exc:
    rows.append(dict(step='runner',status='FAIL',exit_code=None,reason=str(exc)))
finally:
    (OUT/'environment.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')
    (OUT/'results.json').write_text(json.dumps(rows,indent=2)+'\n',encoding='utf-8')
    (OUT/'SHA256SUMS.txt').write_text(''.join(digest(x)+'  '+x.name+'\n' for x in sorted(OUT.iterdir()) if x.is_file() and x.name!='SHA256SUMS.txt'),encoding='utf-8')
sys.exit(1 if any(x['status'] in ('FAIL','BLOCKED') for x in rows) else 0)
