# CP-001 test evidence

Executed in ChatGPT Chat sandbox, 2026-11-27. All inputs synthetic. Exact outputs in adjacent logs. No browser screenshots: navigation never reached app.

| Command | Exit | Observed result | Log |
|---|---:|---|---|
| `npm ping --fetch-retries=0 --fetch-timeout=5000` | 1 | BLOCKED EAI_AGAIN | npm-ping.log |
| `cd react-shell && npm install --offline --ignore-scripts --no-audit --no-fund` | 1 | BLOCKED ENOTCACHED | react-install.log |
| `npm install --package-lock-only --offline --ignore-scripts --no-audit --no-fund` | 0 | root lockfile generated | lockfile.log |
| `npm ci --offline --ignore-scripts --no-audit --no-fund` | 0 | dependency-free root | npm-ci.log |
| `npm run typecheck` | 0 | PASS fallback | typecheck.log |
| `npm run build` | 0 | PASS fallback | build.log |
| `npm test` | 0 | PASS 9 tests, 0 fail, 0 skipped | test.log |
| `python tests/browser_smoke.py` | 1 | 4 attempted, 0 pass, 4 errors (ERR_BLOCKED_BY_ADMINISTRATOR); browser assertions not reached | browser.log (duplicate preserved as browser-loopback-blocked.log) |
| `python tests/browser_mocked.py` | 1 | 4 attempted, 0 pass, 4 errors (ERR_BLOCKED_BY_ADMINISTRATOR); reserved fixture URL, no real network resource | browser-mocked.log |
| Python baseline byte comparison | 0 | both original files exact | baseline-integrity.log |
| Python static draft regeneration / inventory | 0 | deterministic output, 42 unique table names, referenced names defined, enable+force RLS statements | schema-static-check.log |
| React typecheck/build | — | NOT RUN (dependency missing) | react-install.log |
| PostgreSQL migration | — | NOT RUN (no psql/postgres/pg_ctl) | preflight.log |
| Lint | — | NOT CONFIGURED | package.json |
| A01–A12 product acceptance | — | NOT RUN, all 12; no CAL engine tests | baseline §10 |

Node smoke tests: six individual route resolutions, unique routes, home/unknown, synthetic null/serialization shape. No claims of actual calculations, data persistence, backend security, PWA, restore, load performance or browser UI. Browser attempts are environment errors, not demonstrated app defects or successful UI execution. Static SQL checks do not parse SQL or test constraints.
