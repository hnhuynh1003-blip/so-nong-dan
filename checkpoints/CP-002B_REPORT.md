# CP-002B — B-P1 v1.0 rice calculation candidate

**Status: CANDIDATE FOR INDEPENDENT VERIFICATION.** CP-001 ACCEPTED AND CLOSED; CP-002A ACCEPTED AND CLOSED. CP-002B only IMPLEMENTATION AUTHORIZED; CP-002C–F NOT AUTHORIZED. D06 and D08.1–D08.6 CONFIRMED; D09–D12 OPEN; D05/D07 PROPOSED. Business date 2026-11-28. Engineering: ChatGPT Chat. Return to Chat 01 — Master Control. No independent verdict or Owner Acceptance asserted.

## Preflight / authority

Required parent `a5d0521ada0309f2cd69356ee1f6c5948f5607eb`, tree `440ac1bf447326acf9f5364cfadfd1c8cceaaf30`, sole parent accepted A runtime `80fb95175e902e6bea3caac518a8a6b25b9c1815`, runtime tree `1bcb9ca31eebed744b3448c4c6387d9c50935405`. GitHub connector readback: 178 tracked files, 177 parent manifest paths, exact closure ancestry, eight runtime-to-closure evidence/docs changes only. Created separate `checkpoint/cp-002b` from required parent. E17 records explicit authorization in `docs/cp002/CP-002B_AUTHORIZATION.md` with accepted source refs; read exact specifications, A contract, acceptance, register, Decision Log and Project Status. Original master/R1 local hashes match accepted bytes. Read-only design reference `1d186c2dad025a96bfdc629d351e377173cd4006`, UI-009 Freeze, prototype rice sections, rice-profile QA/test; absent archived screenshots/historical ZIPs nonblocking as instructed. No visual/UI verification performed. See preflight evidence.

Terminal read-only `git ls-remote ... refs/heads/checkpoint/cp-002a` exit 128, Could not resolve host: github.com. No security/network bypass. Connector access and ancestry verified. Local verification reconstructed relevant sources from original CP-001-R1 archive, genuine bootstrap locks, exact package manifest and exact A source from accepted independent ZIP (outer digest matched); 25/25 relevant baseline Git blobs match accepted parent, including all pre-existing TS sources, root configs, both locks, baseline smoke/fixture/public/build scripts. Not full local checkout. Compiler TypeScript 5.8.3 copied from preinstalled exact version into package-local node_modules, invoked explicitly; no clean npm ci, no independent tarball integrity. Environment Node 22.16.0, npm 10.9.2, TS 5.8.3, Python 3.13.5, Git 2.47.3, Linux 6.18.57 x86_64/glibc2.41. A source SHA and compiled A JS digest unchanged from accepted A (`0ae72562d05abffd1dddf326e015f88f9e1822ddbe0ce1de818e271cef3f7338`). No A defect observed within exercised B use; no claim of A re-verification.

## Deliverable / traceability

`src/modules/rice/calculation/index.ts`: `previewRiceSheetBP1`, `previewRiceGroupBP1`, B_PROFILE, typed input/output and stable RiceError. Imports accepted A-P1 only for quantity math. Structural layout indices bounded BigInt, explicit 1-based position; normalized slots sparse and sorted; column/board/page counts and gross sums, sheet/group totals. Empty slot null or empty string, absent position empty, explicit empty trace null; no automatic compaction. Only `three-digit` (443=>44300g,015=>1500g) and explicit `gram` canonical positive integer input. Batch/owner/sheet/group membership and identity validation; duplicate declared positions including empties rejected. Whole-sheet T=1000*N/R, P=G-T, C=P, nearest quantum 1000g tie positive, residual S-P, A=exact kg*integer price. No hardcoded ratio, monetary rounding, group second rounding, impurity/extra deductions or partial sale. PREVIEW only; no receipt, finalization, registry or financial posting. Empty sheet gross 0, downstream unknown; unknown tare and price independent; known zero retained; group coverage per metric. B-P1 API, field shapes, error precedence, resource choices and traceability defined before code in `docs/cp002/CP-002B_B-P1_CONTRACT.md`. No default business rules introduced beyond explicit B-P1 scope; gram mode and input/ID shapes are candidate technical adapters.

| Required variant | Actual check |
|---|---|
| B-01 | 443/463/454 -> 136000g, 015 ->1500g; positions 1..6 top-to-bottom, fifth row then next column; raw/id/mode retained |
| B-02 | Actual arrays 25/26,75/76,356; 15 boards / 5 pages / last board 6 |
| B-03 | Sparse positions 1,6,75,76,1000000 with null/empty; deletion never moves surviving IDs/positions |
| B-04 | Exact prototype 63-bag raw array, 2803100g gross, ratio10, tare6300, net2796800, settle2797000, residual200, price7350, amount20557950 |
| B-05 | 2 sheets each net500g round separately to 1000g; prices9000/10000 -> total19000, settlement2000 not rounded group net1000; reject multi-price; pure generic T03/AR05 and CAL03/04 anchors retained |
| B-06 | empty/missing tare/missing price/zero/mixed group coverage; known subtotal 7351, missing count3, complete amount null |
| B-07 | 015, ratio1, net500g, settle1000g, price7351, exact7351 |
| B-08 | actual bag weights gross101499/101500/101501, ratio1 => net100499/100500/100501, settle100000/101000/101000 |
| B-09 | slot count/span, batch/sheet/group resource limits, A-P1 token and reduced overflow, wide integer exact; synthetic 1k/10k/100k arrays |
| B-10 | independent full-field seeded oracle, input freeze, repeat and permute, exact conservation, preview/no posting fields |

Additional anchors: CAL-02 six real 16800g bags gross100800, tare600, net100200; one 50000g bag ratio3 => tare1000/3, P149000/3, residual1000/3; eleven bags at10 =>1100g tare; ratio3/2=>2000/3g tare. Zero net from 1000g ratio1 retained; price missing unknown. 36 deterministic invalid-field mutations plus group/overlap/accessor/shape/resource tests. T04/AR04 parent and partial-scope checks only, no source consumption. CAL-03/04 alternative floor/exact pure synthetic A fixtures rechecked (900000/901800), not activated; T03 generic alternative arithmetic 961400/950000/959000/960000 rechecked, no multi-price allocation. AR03 original impurity fixture remains in accepted A evidence, current B rejects impurity. AR11-a/c pure preview only. No deferred portion marked PASS. All 64 registered IDs preserved; 14 with B-P1 portion PASS, 13 historical accepted A portion dispositions unchanged. CAL03/04 fixture-only recheck not counted as B profile PASS. See updated test register.

## Actual local results

| Step | Exit | Result |
|---|---:|---|
| Read-only terminal git ls-remote | 128 | BLOCKED DNS; connector used instead |
| Node/npm/TS/Python/Git version checks | 0 each | PASS |
| Pin and A/lock checks | n/a | PASS |
| Full local reconstructed TS typecheck | 0 | PASS |
| Accepted contract typecheck | 0 | PASS |
| Isolated TS compile | 0 | PASS |
| Baseline Node route/fixture smoke | 0 | PASS 9/9 |
| Independent oracle generation / repeat | 0 each | PASS, exact same SHA-256 |
| B-P1 Node tests | 0 | PASS 10/10 groups |
| Benchmark 1,000 / 10,000 / 100,000 bags | 0 each | PASS |
| Source drift check | n/a | PASS for locally used paths |
| Clean npm ci / full Git checkout / React browser / DB / C-F / integration / A01-A12 / remote CI | — | NOT RUN; checkout BLOCKED DNS |

Independent oracle `tests/cp002b/oracle.py` uses Python stdlib Fraction, integer divmod, explicit nonnegative half-up by floor(x/q+1/2); no candidate imports. Seed **2026112802**. 320 valid sheets + 160 groups + 120 controlled invalid variants = 600 total. Full canonical output field comparisons 480/480 and expected-error code matches 120/120. 480 repeat/permutation matches, 639 tare/net/residual conservation checks, exact layout bucket sum/count and deep frozen input check for all valid sheet traces. Generated JSONL 9,824,722 bytes, digest `62bec71a9f4e8a2bd0afbc5b24b7b387e087fcdd15b0ac09c956080213b3825a` identical on two generations. Not committed; regenerate using supplied source. Compiled B JS SHA-256 `d5070b8b1fe012d589d2b770fd7f11823ddecde4a9e7eedea0aba0c54ecd583f`. Oracle vectors, test groups and registered IDs are distinct counts. Test-only reference implements valid domain and controlled invalid variants, not a second full parser or independent verifier approval.

Reproduce from clean candidate with exact existing package-local compiler, no installs performed by runner:

```sh
python3 scripts/verify_cp002b.py --evidence-dir /tmp/snd-cp002b-independent
```

Runner creates external evidence dir (must not exist) and isolated temporary build, runs typechecks, smoke, reference generation twice, B tests and three benchmarks. Logs command/exit, environment, tested source and compiled hashes. No network, CI, DB, writes to tracked generated dist or dependency changes. Original A evidence and test source unchanged, no A test rerun claimed. Local evidence produced before commit; tested source hash list binds actual runtime bytes to candidate, not a false claim of Git execution on candidate SHA.

## Synthetic benchmarks

Each benchmark creates actual dense arrays of synthetic bag records with 443 input, one batch, ratio10, price7350; timed `previewRiceSheetBP1` only (validation, sort, layout, accumulation, calculation and trace construction; input construction and JSON serialization/digest outside timed interval). Single fresh Node invocation per size, no warmup/percentile or production workload. Result checked against direct integer reference; serialized full result SHA-256 recorded. Process high-water RSS reported by Node includes process overhead and serialization; not incremental heap or per-operation allocation.

| Bags | Time ms | Bags/s | Reported max RSS KiB | Serialized bytes | Gross gram | Amount VND |
|---:|---:|---:|---:|---:|---:|---:|
| 1000 | 75.653 | 13218 | 106016 | 306547 | 44300000 | 324870000 |
| 10000 | 317.323 | 31514 | 106016 | 3109159 | 443000000 | 3248700000 |
| 100000 | 2807.497 | 35619 | 222800 | 31607011 | 4430000000 | 32487000000 |

Result digests (size order): `2aa5bde1fbe7c7cae077348c7db9d76acdeda9f04fcb8fbb533ebfea181b9662`, `2e1a459111144d4a652956df3380338eb09ca6220852e25afdecc41bf10f6ced`, `99101e3f6ceb594baa6db6676c02492701f7cadfab4b09f52fb596659233fca7`. Limits candidate per-calculation only: 100000 slot records per sheet/group (including explicit empties); max slot position 1000000 per sheet, sparse output no allocation by span; max 100000 batch records per sheet/group, 1000 sheets/group, 128-char IDs and accepted A-P1 bounds. Large trace ~31.6 MB at 100k bags; production pagination/transport/persistence and worst-case large-digit, sparse, group workload benchmarks not established. No annual/history cap or D07 claim.

## Evidence and remaining gates

`evidence/CP-002B/LOCAL_VERIFICATION.zip` original local evidence (16218 bytes, SHA-256 `b1db92fc610de27447689943ba7f6e10823e9e938150513636b851fd330bea73`, 30 ZIP members CRC PASS, 29/29 internal checksums MATCH). Includes runner raw logs, tested source/compiled digests, benchmark outputs, exit codes, original runner manifest, local/connector preflight and DNS failure. Aggregate `evidence/CP-002B/SHA256SUMS.txt` covers candidate tree except itself: inherit prior manifest hashes for unchanged Git blobs, include prior manifest own digest, rehash new/modified documents/source/evidence. Parent A manifest and all Engineering/Independent Verifier archives and acceptance records untouched. No full-tree byte rehash claimed; independent verifier should replay exact candidate from full checkout where available and verify aggregate.

No unresolved arithmetic discrepancy in executed local tests; no A-P1 defect observed within exercised use. Known limitations: clean npm ci NOT RUN; full local checkout blocked DNS; exact version compiler copy provenance as A; full checkout independent replay pending. Typed data boundary only, no raw JSON/duplicate-key/hostile proxy validation. Sparse positions explicit, no mutation API, editing/history/consumption/actual source revision/receipt/registry or persistence implemented. Group sums may fail deterministic resource bounds if rational components grow; no implicit reduction/truncation or partial result. Missing/zero previews not official amounts; no AR10 actual PostgreSQL round-trip, no DB concurrency or financial posting, no integrated product/production UI/browser verification, no A01–A12 product acceptance. Design screenshots/history ZIPs absent, accepted nonblocker. No changes to accepted SQL, locks, workflows, A source/test/archive or prior raw evidence; no new runtime dependencies, remote CI, Codex, merge, deployment, policy activation, real family data or charges. Stop and return candidate to Master Control, no CP-002C–F implementation.
