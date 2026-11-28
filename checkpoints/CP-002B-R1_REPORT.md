# CP-002B-R1 — B-IV-01 revision identity remediation

**Status: CANDIDATE FOR INDEPENDENT VERIFICATION. NOT ACCEPTED.** Business date 2026-11-28; Engineering execution in ChatGPT Chat. CP-001 and CP-002A ACCEPTED AND CLOSED; B-R1 REMEDIATION AUTHORIZED only; CP-002C–F NOT AUTHORIZED. D06 and D08.1–D08.6 CONFIRMED; D09–D12 OPEN; D05/D07 PROPOSED unchanged. Return control to Chat 01 — Master Control.

## Authority and preflight

Project Owner direct order **SND — CP-002B-R1 REMEDIATION ORDER**; E18. Required parent `04a839f94da58ab6842445b00626077704775b6d`, parent tree `5d28cfd4219aa9c95442fa987446a890853ab5a0`, branch `checkpoint/cp-002b`, sole parent CP-002A closure `a5d0521ada0309f2cd69356ee1f6c5948f5607eb`. Read-back confirms 188 tracked files, manifest 187/187 paths, 174 A closure paths unchanged. Independent Verifier reported 847/847 vectors MATCH at original candidate with no arithmetic formula defect; revisionId rejected as INVALID_SHAPE. The independent vector source/archive was not supplied in this order; historical result is recorded as reported, not rerun or combined with new totals. Master draft §4 requires inputs pinned to an immutable sheet revision; R1 addendum distinguishes actual replay/correction from arithmetic. Owner order authorizes identity metadata only. Source specs and original B evidence/manifest/report retained. The original design reference remains historical; live design head observed `67905a606e6fccb17bc90c6382496ded9d587d07`, read-only, no design merge or modification.

Terminal read-only git ls-remote exact branch exit 128, DNS resolution failure. Connector verified exact tree and ancestry; local reconstruction from previous B working copy, 34/34 relevant parent Git blobs matched. Exact Node 22.16.0, npm 10.9.2, TS 5.8.3, Python 3.13.5, Git 2.47.3, Linux x86_64/glibc 2.41. Existing exact package-local compiler reused (copied from installed version in B); not clean npm ci or independent lock-tarball install. Accepted A source blob `c5d4c206d39e2190f44b58c9c4c67f7596e232b0`, SHA-256 `e3031c59ed667082a3bd17f94a2afa45612d0282dbf615aea9d7e287b43e68bf`; both accepted locks checked. Before patch actual parent compile and minimal revision input reproduced INVALID_SHAPE. Original B Engineering ZIP unchanged; SHA-256 `b1db92fc610de27447689943ba7f6e10823e9e938150513636b851fd330bea73`, 30/30 CRC and 29/29 internal hashes checked again.

## Minimal implementation and contract

`src/modules/rice/calculation/index.ts` only runtime file changed: seven revision-only edits (required `SheetInput.revisionId`, `SheetPreview.revisionId`, internal inspected field, required keys, `id(r.revisionId)`, inspected return and sheet preview return). The group already returns ordered sheet previews; group dedup still `claim(ids,s.sheetId,'DUPLICATE_ID')`. No change to arithmetic, parent relationships, sorting, resources, PREVIEW status or other validation. Exact context-specific reverse comparison restores byte-identical parent source, and 13/14 compiled output hashes match original B (only B calculation JS changed; A compiled JS digest `0ae72562d05abffd1dddf326e015f88f9e1822ddbe0ce1de818e271cef3f7338`). Explicit revisionId required, case-sensitive bounded ASCII canonical id, same grammar and 128-character limit; missing/descriptor INVALID_SHAPE, nonstring INVALID_TYPE, malformed NONCANONICAL, too long RESOURCE_LIMIT. Root check after sheetId before groupId. No implicit default/identity generation in runtime; only synthetic fixture helpers supply explicit revision tags. The same stable sheet can be previewed independently for r1 and r2. A group cannot contain two versions of same stable sheet; distinct sheets may use same revision label. No revision existence/authenticity guarantee or authoritative immutable snapshot. Existing limits and all numeric formulas unchanged. Contract and authorization updated, original parent versions remain accessible. Existing B callers without revisionId intentionally fail; no UI/caller integration in scope.

## Regression coverage

| Variant (existing IDs) | Local outcome |
|---|---|
| AR09, AR11-a/c: valid r1/r2 exact preservation, independent previews; changing only revision leaves complete non-revision output unchanged | PASS |
| AR09, AR11-a/c: changed r2 bag 1500 -> 2500 g, ratio 1, price 7351; gross 2500, tare 1000, net 1500, settlement 2000, residual 500, amount 14702; old r1 7351 unchanged | PASS |
| CAL-11, T04, AR04: required, malformed, nonstring, empty, whitespace, non-ASCII, descriptor and 128/129 length boundaries; root error precedence | PASS |
| T04, AR04: same sheet r1+r2 in both group orders and empty sheet versions rejected DUPLICATE_ID | PASS |
| AR09: group selected revision per distinct sheet, same token on distinct sheets, permutation, deep-frozen input/no mutation | PASS |
| AR11-a/c: pure PREVIEW, no journal/receipt/snapshot/persistence result | PASS (pure output only; no transaction or database integration) |
| Original B-01..10 tests including UI-009 63-bag amount 20557950, half tie amount 7351, generic arithmetic alternative fixtures and resource limits | PASS |

All 64 registered IDs retained. New B-IV-01 variants only under CAL-11, T04, AR04, AR09, AR11-a/c. Original 13 A-P1/14 B-P1 portion dispositions remain historical, not expanded into full-scope PASS. Re-executed full local B suite. Database/source-consumption/concurrency/replay/finalization/posting/AR11-b,d NOT RUN. No A-P1 full oracle rerun claimed.

## Actual local execution

| Step | Exit | Result |
|---|---:|---|
| Terminal git ls-remote | 128 | BLOCKED DNS; connector readback used |
| Parent minimal revision reproduction | 0 | PASS (expected INVALID_SHAPE reproduced) |
| Node/npm/TS/Python/Git version checks | 0 | PASS |
| Toolchain, accepted A and locks | n/a | PASS |
| Full local reconstructed TS and contract typecheck | 0 | PASS |
| Isolated compile | 0 | PASS |
| Baseline Node smoke | 0 | 9/9 PASS |
| Oracle generation, repeat, legacy projection | 0 each | PASS |
| Rice tests | 0 | 12/12 PASS |
| Synthetic benchmark 1000 / 10000 / 100000 bags | 0 each | PASS |
| Runner overall | 0 | PASS; no local tested-source drift |
| Auxiliary integrity check | 0 | PASS after correcting an overly broad token reversal helper (initial helper exit 1 preserved; no change to runtime code/test results) |
| Clean npm ci, full Git checkout, UI/browser/DB/integration/product acceptance, remote CI | — | NOT RUN; checkout blocked DNS |

Reference oracle uses Python stdlib Fraction and original deterministic seed 2026112802. 600 original vectors + 24 new targeted B-IV-01 vectors (8 full-field valid, 16 expected errors) = **624/624 MATCH (488 full-field +136 expected errors)**. 488 repeat/permutation checks, 647 exact conservation checks. Original 600 vector projection removes only revisionId; regenerated output is byte-identical to original pre-patch JSONL with SHA-256 `62bec71a9f4e8a2bd0afbc5b24b7b387e087fcdd15b0ac09c956080213b3825a`. All original numeric expectations and controlled error codes unchanged. New full-field oracle JSONL 9,883,235 bytes, SHA-256 `5c54c778b9f9e34db4aeea03a51325c271e91b4aec0d53a23795d00ea816050f`, repeated generation identical. Compiled B JS SHA-256 `fa296ccd7af27201d8e1fad8a0eddf88d2ac28a9719d16acbbcb800ac12d3979`. Generated JSONL not committed, reproducible. Oracle handles valid and controlled-fault domain, not arbitrary parser. New metadata changes full serialization but not the previous result projection.

Run from exact candidate checkout with existing compiler (no installs, external nonexistent evidence directory):

```sh
python3 scripts/verify_cp002b.py --evidence-dir /tmp/snd-cp002br1-independent
```

Runner logs actual commands, exits, version/env, tested source and compiled digests, both oracle runs and projection, original 10+2 test groups and three benchmarks, no network, DB, CI, or tracked dist writes. Local evidence was collected precommit, not asserted to be a full candidate checkout.

## Synthetic benchmarks

Timed sheet preview only, actual bag arrays 443, ratio 10, price 7350, explicit r1; serialization/hash outside timed interval. Single fresh invocation per size, not production SLA. Each benchmark checked original direct integer expectations, exact revision preservation and original full result digest by removing only revisionId (3/3 legacy digest MATCH). Full serialized output increases exactly 18 bytes, the field `,"revisionId":"r1"` in canonical object order. New hashes expected to differ. Process high-water RSS includes overhead and serialization, not incremental heap.

| Bags | Elapsed ms | Bags/s | Max RSS KiB | Serialized bytes | Gross g | Amount VND |
|---:|---:|---:|---:|---:|---:|---:|
| 1000 | 63.540 | 15738 | 106032 | 306565 | 44300000 | 324870000 |
| 10000 | 336.919 | 29681 | 106032 | 3109177 | 443000000 | 3248700000 |
| 100000 | 2968.474 | 33687 | 251220 | 31607029 | 4430000000 | 32487000000 |

| Bags | New full-result SHA-256 | Legacy projection SHA-256 (MATCH) |
|---:|---|---|
| 1000 | `7c472b000c6b233d0c3b9b34c3d2df55d28f3e68c789cc57dd1f2ca95e67a145` | `2aa5bde1fbe7c7cae077348c7db9d76acdeda9f04fcb8fbb533ebfea181b9662` |
| 10000 | `83a250670bb2c6c5ed9aa244450949509e6cad860e10cc697fbf6ea1c6015d14` | `2e1a459111144d4a652956df3380338eb09ca6220852e25afdecc41bf10f6ced` |
| 100000 | `295507e3f6276d423c967f45531731e55495e51dbc79830d39e64da7fab28f31` | `99101e3f6ceb594baa6db6676c02492701f7cadfab4b09f52fb596659233fca7` |

## Evidence and remaining limitations

Original B Engineering evidence unchanged; new `evidence/CP-002B-R1/LOCAL_VERIFICATION.zip` 18830 bytes, SHA-256 `7b1bef74e5499c6e42b575f240104ddf3238098b30df43e0ecec778929f2a250`, 39 members CRC PASS and 38/38 internal SHA-256 entries MATCH. Original runner manifest preserved inside ZIP; outer manifest, raw logs, exit codes, preflight, minimal source diff, baseline reproduction and actual benchmark digests included. Original parent report and aggregate manifest remain unchanged as historical evidence. New R1 aggregate manifest covers all tracked paths except itself, inheriting prior validated hashes only for byte-identical Git blobs plus prior manifest digest and new/changed entries; not a full independent tree rehash. Candidate SHA/tree returned via GitHub readback (no self-referential manifest).

No unresolved arithmetic discrepancy detected in executed scope. B-IV-01 repair candidate only, independent verification/acceptance pending. DNS blocks full local checkout; exact compiler reused, clean npm ci NOT RUN; independent 847-vector set not supplied or rerun. 34 relevant parent blobs checked, not full checkout. Raw JSON parser, hostile objects, revision persistence/history/ownership authentication/active-version policy, correction/replay/source-consumption/concurrency, PostgreSQL round-trip, policy registry, posting, official receipt, UI integration and product acceptance NOT RUN/outside scope. Benchmark trace at 100k remains ~31.6 MB; no production performance/storage/historical cap or D07 claim. No A-P1 defect found in exercised use; accepted A source and locks unchanged. No SQL, UI, dependencies, workflow, real data, CI, merge, deployment, Codex, policy activation, C–F or charges. Stop at CANDIDATE FOR INDEPENDENT VERIFICATION.
