"""CP-001-R2 verification. No deployment, DSN, secret, push or automatic lock commit."""
import argparse, datetime, hashlib, json, os, platform, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
R1 = 'eb21b0089a7ecd55d69c9b0dbf6d8ad9aba677e7'
BASE = '5de563967343e878835921b5dd6c3af581ac2505'
REGISTRY = ['--registry=https://registry.npmjs.org', '--fetch-retries=0', '--fetch-timeout=60000']
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('mode', choices=['bootstrap', 'verify'])
args = parser.parse_args()
OUT = ROOT / 'evidence' / ('local-r2-' + datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'))
OUT.mkdir(parents=True, exist_ok=False)
rows = []
npm = 'npm.cmd' if os.name == 'nt' else 'npm'

def record(step, status, code=None, command=None, reason=''):
    rows.append(dict(step=step, status=status, exit_code=code, command=command, reason=reason))
    print(step, status, code, reason, flush=True)

def run(step, cmd, cwd=ROOT, timeout=600):
    cmd = [str(x) for x in cmd]
    try:
        with (OUT / (step + '.log')).open('wb') as log:
            result = subprocess.run(cmd, cwd=cwd, stdout=log, stderr=subprocess.STDOUT, timeout=timeout)
        record(step, 'PASS' if result.returncode == 0 else 'FAIL', result.returncode, cmd)
        return result.returncode == 0
    except (OSError, subprocess.TimeoutExpired) as exc:
        (OUT / (step + '.log')).write_text(str(exc) + '\n')
        record(step, 'BLOCKED', command=cmd, reason=type(exc).__name__)
        return False

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

def paths(ref):
    return {p.decode('utf-8') for p in git('ls-tree', '-r', '--name-only', '-z', ref).split(b'\0') if p}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def integrity():
    head = git('rev-parse', 'HEAD').decode().strip()
    expected = os.getenv('SND_EXPECTED_HEAD')
    if expected and head != expected:
        raise ValueError('HEAD mismatch')
    if git('status', '--porcelain'):
        raise ValueError('dirty source before verification')
    if subprocess.run(['git', 'merge-base', '--is-ancestor', R1, head], cwd=ROOT).returncode != 0:
        raise ValueError('R1 is not an ancestor')
    manifest_path = 'evidence/CP-001-R1/SHA256SUMS.txt'
    manifest = git('show', R1 + ':' + manifest_path)
    entries = {}
    for row in manifest.decode().splitlines():
        checksum, path = row.split('  ', 1)
        if path in entries or not re.fullmatch('[0-9a-f]{64}', checksum):
            raise ValueError('invalid R1 manifest entry')
        entries[path] = checksum
    if len(entries) != 141 or set(entries) != paths(R1) - {manifest_path}:
        raise ValueError('incomplete R1 manifest')
    for path, checksum in entries.items():
        if digest(git('show', R1 + ':' + path)) != checksum:
            raise ValueError('R1 hash mismatch: ' + path)
    protected = {p for p in paths(R1) if p.startswith(('evidence/CP-001/', 'evidence/CP-001-R1/'))}
    protected |= {'docs/01_MASTER_SPECIFICATION.md', 'docs/WORK_CP001_HANDOFF.md'}
    for path in protected:
        if git('show', R1 + ':' + path) != git('show', head + ':' + path):
            raise ValueError('protected R1 path changed: ' + path)
    old = {p for p in paths(BASE) if p.startswith('evidence/CP-001/')}
    if len(old) != 17:
        raise ValueError('unexpected CP-001 evidence count')
    for path in old | {'docs/01_MASTER_SPECIFICATION.md', 'docs/WORK_CP001_HANDOFF.md'}:
        if git('show', BASE + ':' + path) != git('show', head + ':' + path):
            raise ValueError('CP-001 baseline changed: ' + path)
    current = []
    for path in sorted(paths(head)):
        data = (ROOT / path).read_bytes()
        if data != git('show', head + ':' + path):
            raise ValueError('working tree bytes differ: ' + path)
        current.append(digest(data) + '  ' + path)
    (OUT / 'SOURCE_SHA256.txt').write_text('\n'.join(current) + '\n', encoding='utf-8')
    (OUT / 'FILE_TREE.txt').write_text('\n'.join(sorted(paths(head))) + '\n', encoding='utf-8')
    (OUT / 'CHANGED_FILES.txt').write_bytes(git('diff', '--name-status', R1, head))
    (OUT / 'integrity.log').write_text(f'HEAD {head}\nR1 manifest 141/141\nCP-001 evidence 17/17\nCP-000 documents 2/2\nProtected R1 paths {len(protected)}\nCurrent tracked files {len(current)}/{len(current)}\n')
    record('integrity', 'PASS', reason='all tracked bytes and historical manifests checked')

def lock_check(folder):
    lock = folder / 'package-lock.json'
    package = json.loads((folder / 'package.json').read_text())
    data = json.loads(lock.read_text())
    packages = data['packages']
    if data['lockfileVersion'] != 3:
        raise ValueError('expected lockfile v3')
    for kind in ('dependencies', 'devDependencies'):
        if packages[''].get(kind, {}) != package.get(kind, {}):
            raise ValueError('lock manifest mismatch: ' + kind)
    for name, meta in packages.items():
        if not name:
            continue
        if not name.startswith('node_modules/') or not (folder / name).resolve().is_relative_to(folder.resolve()):
            raise ValueError('unsafe dependency path: ' + name)
        if not meta.get('integrity') or not meta.get('resolved', '').startswith('https://registry.npmjs.org/'):
            raise ValueError('non-registry or unverified resolution: ' + name)
    for name, version in (package.get('dependencies', {}) | package.get('devDependencies', {})).items():
        if packages['node_modules/' + name]['version'] != version:
            raise ValueError('top-level dependency is not exact: ' + name)

def toolchain():
    ok = run('node-version', ['node', '--version'])
    ok = run('npm-version', [npm, '--version']) and ok
    if not ok or (OUT / 'node-version.log').read_text().strip() != 'v22.16.0' or (OUT / 'npm-version.log').read_text().strip() != '10.9.2':
        record('toolchain-pin', 'BLOCKED', reason='expected Node 22.16.0 / npm 10.9.2')
        return False
    record('toolchain-pin', 'PASS', reason='exact reproduction pins')
    return True

def bootstrap(name, folder):
    if (folder / 'package-lock.json').exists():
        record(name + '-resolve', 'NOT RUN', reason='existing lock preserved')
    elif not run(name + '-resolve', [npm, 'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund', *REGISTRY], folder):
        return
    try:
        lock_check(folder)
        shutil.copy2(folder / 'package-lock.json', OUT / (name + '-package-lock.json'))
        record(name + '-lock-check', 'PASS', reason='registry/integrity metadata and exact direct pins; review artifact before commit')
    except (OSError, KeyError, ValueError) as exc:
        record(name + '-lock-check', 'FAIL', reason=str(exc))

def verify_package(name, folder):
    if not (folder / 'package-lock.json').is_file():
        record(name + '-lock', 'BLOCKED', reason='missing committed lock; bootstrap and review first')
        return False
    try:
        lock_check(folder)
        if not git('ls-files', str((folder / 'package-lock.json').relative_to(ROOT))).strip():
            raise ValueError('lock not tracked')
    except (OSError, KeyError, ValueError) as exc:
        record(name + '-lock', 'FAIL', reason=str(exc))
        return False
    record(name + '-lock', 'PASS', reason='tracked exact public registry lock')
    return True

def fallback():
    if not verify_package('fallback', ROOT):
        return
    if not run('fallback-ci', [npm, 'ci', '--ignore-scripts', '--no-audit', '--no-fund', *REGISTRY]):
        return
    run('fallback-ts-version', ['node', 'node_modules/typescript/lib/tsc.js', '--version'])
    if not (OUT / 'fallback-ts-version.log').read_text().strip() == 'Version 5.8.3':
        record('fallback-ts-pin', 'FAIL', reason='local TypeScript mismatch'); return
    for step, script in [('fallback-typecheck', 'typecheck:fallback'), ('contract-typecheck', 'typecheck:contracts'), ('fallback-build', 'build:fallback'), ('fallback-tests', 'test:fallback')]:
        run(step, [npm, 'run', script])
    run('fallback-dependency-tree', [npm, 'ls', '--all', '--json'])
    run('fallback-license-inventory', ['node', 'scripts/dependency_inventory.mjs', '.'])
    run('fallback-audit', [npm, 'audit', '--json', *REGISTRY])

def subrunner(name, extra):
    before = set((ROOT / 'evidence').glob('local-r1-*'))
    run(name + '-runner', [sys.executable, 'scripts/local_r1.py', name, *extra], timeout=1200)
    created = set((ROOT / 'evidence').glob('local-r1-*')) - before
    for path in created:
        shutil.copytree(path, OUT / (name + '-detail'))
    if len(created) != 1:
        record(name + '-evidence', 'FAIL', reason='expected one new R1 runner evidence directory')

try:
    (OUT / 'platform.json').write_text(json.dumps(dict(platform=platform.platform(), python=sys.version, runner_image=os.getenv('ImageOS'), image_version=os.getenv('ImageVersion'), run_id=os.getenv('GITHUB_RUN_ID'), run_attempt=os.getenv('GITHUB_RUN_ATTEMPT'), event=os.getenv('GITHUB_EVENT_NAME'), head=git('rev-parse', 'HEAD').decode().strip()), indent=2) + '\n')
    run('git-version', ['git', '--version'])
    run('git-status-before', ['git', 'status', '--porcelain'])
    integrity()
    if args.mode == 'bootstrap':
        if toolchain():
            bootstrap('fallback', ROOT)
            bootstrap('react', ROOT / 'react-shell')
    else:
        run('schema-static', [sys.executable, 'scripts/check_schema_r1.py'])
        if toolchain():
            fallback()
            if verify_package('react', ROOT / 'react-shell'):
                subrunner('react', ['--install-browser'])
        pg = shutil.which('pg_config')
        if pg and run('postgres-bindir', [pg, '--bindir']):
            bindir = (OUT / 'postgres-bindir.log').read_text().strip()
            subrunner('postgres', ['--pg-bin', bindir])
        else:
            record('postgres', 'BLOCKED', reason='pg_config missing or failed; no database connected')
        if git('status', '--porcelain'):
            record('source-drift', 'FAIL', reason='verification modified tracked or unignored source')
        else:
            record('source-drift', 'PASS', reason='working tree clean after verification')
except Exception as exc:
    record('runner-error', 'FAIL', reason=type(exc).__name__ + ': ' + str(exc))
finally:
    run('git-status-after', ['git', 'status', '--porcelain'])
    (OUT / 'results.json').write_text(json.dumps(rows, indent=2) + '\n')
    (OUT / 'exit-codes.tsv').write_text('step\tstatus\texit_code\n' + ''.join(f'{r["step"]}\t{r["status"]}\t{r["exit_code"] if r["exit_code"] is not None else ""}\n' for r in rows))
    (OUT / 'SHA256SUMS.txt').write_text(''.join(digest(p.read_bytes()) + '  ' + p.relative_to(OUT).as_posix() + '\n' for p in sorted(OUT.rglob('*')) if p.is_file() and p != OUT / 'SHA256SUMS.txt'))
    print('Evidence:', OUT)
sys.exit(1 if any(r['status'] in ('FAIL', 'BLOCKED') for r in rows) else 0)
