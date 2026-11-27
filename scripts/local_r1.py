"""CP-001-R1 local runner (Windows/Linux). No external database DSN or deployment.
Each run creates separate evidence; never writes evidence/CP-001 or evidence/CP-001-R1.
"""
import argparse,datetime,hashlib,json,os,secrets,shutil,socket,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('mode',choices=['fallback','react','postgres'])
parser.add_argument('--resolve-react-lock',action='store_true',help='explicitly permit resolving public npm registry lockfile if missing')
parser.add_argument('--install-browser',action='store_true',help='explicitly permit downloading Playwright Chromium')
parser.add_argument('--pg-bin',type=Path,help='local PostgreSQL bin directory; no DSN accepted')
args=parser.parse_args()
if args.mode!='react' and (args.resolve_react_lock or args.install_browser):parser.error('React switches require react mode')
if args.mode!='postgres' and args.pg_bin:parser.error('--pg-bin requires postgres mode')
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
OUT=ROOT/'evidence'/f'local-r1-{args.mode}-{stamp}'
OUT.mkdir(parents=True,exist_ok=False)
rows=[]
def record(name,state,code=None,reason='',command=None):
 rows.append(dict(step=name,status=state,exit_code=code,reason=reason,command=command))
 (OUT/'results.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 (OUT/'exit-codes.tsv').write_text('step\tstatus\texit_code\treason\n'+''.join(f"{r['step']}\t{r['status']}\t{'' if r['exit_code'] is None else r['exit_code']}\t{r['reason']}\n" for r in rows),encoding='utf-8')
 print(f'{name}: {state} ({code}) {reason}',flush=True)
def run(name,cmd,cwd=ROOT,env=None,timeout=300,blocked_codes=False):
 cmd=[str(c) for c in cmd]; log=OUT/f'{name}.log'
 try:
  with log.open('wb') as f:
   result=subprocess.run(cmd,cwd=cwd,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=timeout)
  text=log.read_text(encoding='utf-8',errors='replace') if result.returncode else ''
  external=blocked_codes and any(x in text for x in ('EAI_AGAIN','ENOTCACHED','ENETUNREACH','ECONNREFUSED','ETIMEDOUT','ENOTFOUND','ERR_BLOCKED_BY_ADMINISTRATOR','Failed to download','ECONNRESET'))
  record(name,'PASS' if result.returncode==0 else ('BLOCKED' if external else 'FAIL'),result.returncode,command=cmd)
  return result.returncode==0
 except (OSError,subprocess.TimeoutExpired) as e:
  with log.open('ab') as f:f.write((str(e)+'\n').encode())
  record(name,'BLOCKED',reason=type(e).__name__,command=cmd);return False
def notrun(*names,reason):
 for name in names:record(name,'NOT RUN',reason=reason)
def npm_exe():return shutil.which('npm.cmd' if os.name=='nt' else 'npm')
def output(name):return (OUT/f'{name}.log').read_text(encoding='utf-8',errors='replace').strip()
def exact_toolchain(npm):
 ok=run('node-version',['node','--version'])
 ok=run('npm-version',[npm,'--version']) and ok
 if not ok:return False
 if output('node-version')!='v22.16.0' or output('npm-version')!='10.9.2':
  record('toolchain-pin','BLOCKED',reason='Expected Node 22.16.0 and npm 10.9.2 for this reproduction; propose/version-review alternatives separately');return False
 record('toolchain-pin','PASS',reason='exact version strings match');return True
def fallback():
 # R2 supersedes the historical PATH compiler runner. No uncontrolled global tsc.
 record('fallback-runner','BLOCKED',reason='Use scripts/ci_r2.py verify with reviewed committed locks; R1 fallback is historical')
def react():
 npm=npm_exe(); shell=ROOT/'react-shell'; lock=shell/'package-lock.json'
 steps=('react-ci','react-typecheck','react-production-build','react-browser-install','react-browser-smoke','react-dependency-tree','react-license-inventory','react-audit')
 if not npm:record('npm','BLOCKED',reason='npm missing');notrun(*steps,reason='npm absent');return
 if not exact_toolchain(npm):notrun(*steps,reason='toolchain pin mismatch');return
 # Explicit registry only, no private sources, no automatic audit fix; lock generated on local machine must be reviewed.
 registry=['--registry=https://registry.npmjs.org','--fetch-retries=0','--fetch-timeout=30000']
 if not lock.exists():
  if not args.resolve_react_lock:record('react-lock','BLOCKED',reason='no lockfile; rerun with --resolve-react-lock after review');notrun(*steps,reason='missing lock');return
  if not run('react-lock',[npm,'install','--package-lock-only','--ignore-scripts','--no-audit','--no-fund',*registry],shell,blocked_codes=True):notrun(*steps,reason='lock resolution failed');return
 else:record('react-lock','NOT RUN',reason='existing lockfile preserved; npm ci validates manifest consistency')
 shutil.copy2(lock,OUT/'react-package-lock.json')
 # Reject lockfile paths and URL sources before npm ci.
 try:
  data=json.loads(lock.read_text(encoding='utf-8'))
  if data['lockfileVersion']!=3:raise ValueError('lockfile version')
  for path,meta in data['packages'].items():
   if not path:continue
   if not ((shell/path).resolve().is_relative_to(shell.resolve()) and path.startswith('node_modules/')):raise ValueError('unsafe path')
   if not (meta.get('integrity') and meta.get('resolved','').startswith('https://registry.npmjs.org/')):raise ValueError('unsafe package resolution')
 except Exception as e:record('react-lock-source-check','FAIL',reason=f'Unexpected lock source or structure: {type(e).__name__}');notrun(*steps,reason='unsafe lock metadata');return
 record('react-lock-source-check','PASS',reason='public registry URLs and integrity present; not cryptographic audit')
 if not run('react-ci',[npm,'ci','--ignore-scripts','--no-audit','--no-fund',*registry],shell,blocked_codes=True):notrun(*steps[1:],reason='dependency install failed');return
 run('react-dependency-tree',[npm,'ls','--all','--json'],shell)
 run('react-license-inventory',['node',str(ROOT/'scripts/dependency_inventory.mjs'),str(shell)],shell)
 run('react-audit',[npm,'audit','--json',*registry],shell,blocked_codes=True)
 run('react-typecheck',[npm,'run','typecheck'],shell)
 if not run('react-production-build',[npm,'run','build'],shell):notrun('react-browser-install','react-browser-smoke',reason='React build not successful');return
 cli=shell/'node_modules'/'@playwright'/'test'/'cli.js'
 if args.install_browser:
  if not run('react-browser-install',['node',cli,'install','chromium'],shell,blocked_codes=True):notrun('react-browser-smoke',reason='browser download failed');return
 else:record('react-browser-install','NOT RUN',reason='use existing Playwright browser or pass --install-browser')
 run('react-browser-smoke',[npm,'run','test:browser'],shell)
 # Artifact uploader excludes hidden paths. Exclude them at collection too,
 # before either evidence manifest is generated; do not upload .last-run.json
 # or unrelated hidden files. The JSON report and PNGs remain evidence.
 if (shell/'test-results').exists():
  shutil.copytree(shell/'test-results',OUT/'react-test-results',
                  ignore=lambda directory,names:[n for n in names if n.startswith('.') or (Path(directory)/n).is_symlink()])
 if (shell/'dist').exists():
  (OUT/'react-dist-sha256.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(shell).as_posix()}\n' for p in sorted((shell/'dist').rglob('*')) if p.is_file()),encoding='utf-8')
def postgres():
 if not args.pg_bin:record('postgres-preflight','BLOCKED',reason='explicit --pg-bin local install path required');notrun('postgres-migration','postgres-constraints',reason='no local toolchain');return
 bindir=args.pg_bin.resolve(); exe=lambda name:bindir/(name+('.exe' if os.name=='nt' else ''))
 for name in ('initdb','pg_ctl','psql','postgres'):
  if not exe(name).is_file():record('postgres-preflight','BLOCKED',reason=f'missing local {name} executable');notrun('postgres-migration','postgres-constraints',reason='no local toolchain');return
  if not run(name+'-version',[exe(name),'--version']):return
 # Discard inherited PG* env; never accept a database URL, host or existing cluster path.
 env={k:v for k,v in os.environ.items() if not k.upper().startswith('PG')}
 env['PGPASSWORD']=secrets.token_urlsafe(32);env['PGCONNECT_TIMEOUT']='5'
 # Loopback ephemeral port. In case of collision, pg_ctl fails; never proceed to migration.
 with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
 tmp=Path(tempfile.mkdtemp(prefix='snd-r1-disposable-')); data=tmp/'data'; pw=tmp/'pw'; pw.write_text(env['PGPASSWORD']+'\n',encoding='ascii')
 initialized=False;started=False; stopped=True
 try:
  initialized=run('postgres-initdb',[exe('initdb'),'-D',data,'-U','snd_test_admin','--auth=scram-sha-256','--pwfile',pw,'--encoding=UTF8','--no-locale'],env=env)
  pw.unlink(missing_ok=True)
  if not initialized:notrun('postgres-migration','postgres-constraints',reason='disposable initdb failed');return
  # Use TCP loopback only: never create a Unix socket/lock in a shared
  # system directory. This configuration is inside our disposable cluster.
  with (data/'postgresql.conf').open('a',encoding='utf-8') as config:
   config.write("\nunix_socket_directories = ''\n")
  started=run('postgres-start',[exe('pg_ctl'),'-D',data,'-l',OUT/'postgres-server.log','-o',f'-h 127.0.0.1 -p {port}','-w','-t','30','start'],env=env,timeout=50)
  if not started:notrun('postgres-migration','postgres-constraints',reason='disposable cluster did not start');return
  psql=[exe('psql'),'-X','--no-password','-h','127.0.0.1','-p',str(port),'-U','snd_test_admin','-d','postgres','-v','ON_ERROR_STOP=1']
  if not run('postgres-cluster-identity',[*psql,'-Atc','SHOW data_directory'],env=env) or Path(output('postgres-cluster-identity')).resolve()!=data.resolve():
   record('postgres-identity-gate','FAIL',reason='server data_directory did not match newly created cluster');notrun('postgres-migration','postgres-constraints',reason='identity gate failed');return
  record('postgres-identity-gate','PASS',reason='server data_directory is exact disposable path')
  if not run('postgres-migration',[*psql,'-f',ROOT/'migrations/0001_schema_draft.sql'],env=env):notrun('postgres-constraints',reason='migration failed');return
  run('postgres-constraints',[*psql,'-f',ROOT/'tests/postgres_disposable.sql'],env=env)
 finally:
  pw.unlink(missing_ok=True)
  if initialized:
   # Even if start timed out, stop only this exact temp directory if postmaster.pid exists.
   if (data/'postmaster.pid').exists():stopped=run('postgres-stop',[exe('pg_ctl'),'-D',data,'-m','fast','-w','-t','30','stop'],env=env,timeout=50)
   else:record('postgres-stop','NOT RUN',reason='no postmaster.pid in disposable cluster')
  if stopped:shutil.rmtree(tmp);record('postgres-cleanup','PASS',reason='removed only created disposable directory')
  else:record('postgres-cleanup','BLOCKED',reason='server stop failed; inspect disposable path locally, do not delete running cluster')
try:
 {'fallback':fallback,'react':react,'postgres':postgres}[args.mode]()
except Exception as e:
 record('runner-exception','FAIL',reason=type(e).__name__+': '+str(e))
finally:
 (OUT/'SHA256SUMS.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(OUT).as_posix()}\n' for p in sorted(OUT.rglob('*')) if p.is_file() and p.name!='SHA256SUMS.txt'),encoding='utf-8')
 print('Evidence:',OUT)
sys.exit(1 if any(r['status'] in ('FAIL','BLOCKED') for r in rows) else 0)
