"""Regression tests for runner mechanics using synthetic files and mocked commands.
No npm download, browser, PostgreSQL server or real SQL execution occurs here.
"""
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import runpy
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import MagicMock, patch

SOURCE = Path(__file__).resolve().with_name('local_r1.py')


class RunnerRegression(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='snd-runner-regression-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.runner = self.root / 'scripts' / 'local_r1.py'
        self.runner.parent.mkdir()
        shutil.copy2(SOURCE, self.runner)

    def invoke(self, mode, args, fake_run, **patches):
        with contextlib.ExitStack() as stack:
            stack.enter_context(patch.object(sys, 'argv', [str(self.runner), mode, *args]))
            stack.enter_context(patch('subprocess.run', side_effect=fake_run))
            stack.enter_context(contextlib.redirect_stdout(io.StringIO()))
            for name, value in patches.items():
                stack.enter_context(patch(name, value))
            with self.assertRaises(SystemExit) as exit_info:
                runpy.run_path(str(self.runner), run_name='__main__')
        folders = list((self.root / 'evidence').glob('local-r1-*'))
        self.assertEqual(len(folders), 1)
        return exit_info.exception.code, folders[0]

    def assert_manifest(self, folder):
        manifest = folder / 'SHA256SUMS.txt'
        records = dict(line.split('  ', 1)[::-1] for line in manifest.read_text().splitlines())
        actual = {p.relative_to(folder).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in folder.rglob('*') if p.is_file() and p != manifest}
        self.assertEqual(records, actual)
        self.assertFalse(any(part.startswith('.') for name in actual for part in Path(name).parts))

    def test_browser_evidence_excludes_hidden_and_keeps_visible(self):
        shell = self.root / 'react-shell'
        shell.mkdir()
        (shell / 'package-lock.json').write_text(json.dumps({'lockfileVersion': 3, 'packages': {'': {}}}))
        output = shell / 'test-results'
        for name, payload in [('results.json', b'{}'), ('desktop/desktop.png', b'synthetic desktop'),
                              ('mobile/mobile.png', b'synthetic mobile'), ('.last-run.json', b'{}'),
                              ('.env', b'SYNTHETIC_ONLY'), ('mobile/.hidden/token', b'SYNTHETIC_ONLY')]:
            f = output / name
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_bytes(payload)
        if os.name != 'nt':
            (output / 'visible-link').symlink_to(output / '.env')

        def fake_run(cmd, **kwargs):
            if cmd == ['node', '--version']:
                kwargs['stdout'].write(b'v22.16.0\n')
            elif cmd[-1] == '--version':
                kwargs['stdout'].write(b'10.9.2\n')
            return subprocess.CompletedProcess(cmd, 0)

        code, evidence = self.invoke('react', ['--install-browser'], fake_run,
                                     **{'shutil.which': lambda _: 'mock-npm'})
        self.assertEqual(code, 0)
        copied = evidence / 'react-test-results'
        actual = {p.relative_to(copied).as_posix(): p.read_bytes() for p in copied.rglob('*') if p.is_file()}
        self.assertEqual(actual, {'results.json': b'{}', 'desktop/desktop.png': b'synthetic desktop',
                                  'mobile/mobile.png': b'synthetic mobile'})
        self.assert_manifest(evidence)

    def postgres_case(self, identity_matches):
        bindir = self.root / 'mock-pg-bin'
        bindir.mkdir()
        for name in ('initdb', 'pg_ctl', 'psql', 'postgres'):
            (bindir / (name + ('.exe' if os.name == 'nt' else ''))).touch()
        commands, clusters = [], []
        mock_socket = MagicMock()
        mock_socket.__enter__.return_value.getsockname.return_value = ('127.0.0.1', 54321)

        def fake_run(cmd, **kwargs):
            name = Path(cmd[0]).stem
            commands.append(list(cmd))
            env = kwargs['env']
            if cmd[-1] == '--version':
                return subprocess.CompletedProcess(cmd, 0)
            self.assertFalse(any(k.upper().startswith('PG') and k not in ('PGPASSWORD', 'PGCONNECT_TIMEOUT') for k in env))
            self.assertTrue(env['PGPASSWORD'])
            if name == 'initdb':
                self.assertIn('--auth=scram-sha-256', cmd)
                data = Path(cmd[cmd.index('-D') + 1]); clusters.append(data.parent)
                self.assertTrue(Path(cmd[cmd.index('--pwfile') + 1]).is_file())
                data.mkdir(); (data / 'postgresql.conf').write_text('# synthetic configuration\n')
            elif name == 'pg_ctl' and cmd[-1] == 'start':
                data = Path(cmd[cmd.index('-D') + 1])
                self.assertIn("unix_socket_directories = ''", (data / 'postgresql.conf').read_text().splitlines())
                self.assertEqual(cmd[cmd.index('-o') + 1], '-h 127.0.0.1 -p 54321')
                self.assertFalse((data.parent / 'pw').exists())
                (data / 'postmaster.pid').write_text('synthetic only')
            elif name == 'psql':
                self.assertEqual(cmd[cmd.index('-h') + 1], '127.0.0.1')
                self.assertEqual(cmd[cmd.index('-p') + 1], '54321')
                self.assertIn('ON_ERROR_STOP=1', cmd)
                if 'SHOW data_directory' in cmd:
                    actual = clusters[0] / ('data' if identity_matches else 'wrong-data')
                    kwargs['stdout'].write((str(actual) + '\n').encode())
            elif name == 'pg_ctl' and cmd[-1] == 'stop':
                (Path(cmd[cmd.index('-D') + 1]) / 'postmaster.pid').unlink()
            return subprocess.CompletedProcess(cmd, 0)

        with patch.dict(os.environ, {'PGHOST': 'synthetic-inherited-host', 'PGDATABASE': 'synthetic-inherited-db'}):
            code, evidence = self.invoke('postgres', ['--pg-bin', str(bindir)], fake_run,
                                         **{'socket.socket': lambda: mock_socket})
        sql_commands = [c for c in commands if Path(c[0]).stem == 'psql' and '-f' in c]
        self.assertEqual(len(sql_commands), 2 if identity_matches else 0)
        self.assertEqual(code, 0 if identity_matches else 1)
        self.assertEqual(len(clusters), 1)
        self.assertFalse(clusters[0].exists())
        self.assert_manifest(evidence)

    def test_disposable_tcp_config_and_cleanup(self):
        self.postgres_case(True)

    def test_wrong_identity_stops_before_sql_and_cleans_up(self):
        self.postgres_case(False)


if __name__ == '__main__':
    unittest.main(verbosity=2)
