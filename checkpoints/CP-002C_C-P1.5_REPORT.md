# CP-002C — C-P1.5 consolidated remediation local handoff

Business date: 2026-11-28. **C-P1.5 COMPLETE — READY FOR CANDIDATE REVIEW.** Engineering local verification only; no candidate commit, no independent C verification or owner acceptance. F01–F12 locally remediated with local regression PASS; retain independent confirmation as pending. F10 independent C source/build provenance remains a prerequisite, not an attestation. All runtime and authority outputs remain fixture-only or PREVIEW_EVIDENCE.

## Authority and baseline

Explicit C-P1.5 consolidated remediation order following C-P1.4. Repository hnhuynh1003-blip/so-nong-dan, branch checkpoint/cp-002c. Required and final observed HEAD `e21b0b5583ebd0da222e62aaa5553cfe7122bea8`, tree `856d6b51dd7f9edc54a000f1e35a67cf5442a3cf`, sole parent `b4f94a3fe24c02be292247184aeaca33b2375a4a`. Accepted A runtime `80fb95175e902e6bea3caac518a8a6b25b9c1815`. Live final readback: all eight branch refs unchanged, 194 tracked blobs, zero C paths in remote tree, three historical CI runs only. Register Git blob `e596d3ebbd6d0dd766c6b6911425ecc846bbe23b`, 64 rows unchanged. Release/early-v0.1 untouched. See `evidence-stage/E/final-repository-readback.json` in new ZIP.

## Preservation and exact inventory

Original workspace `/mnt/data/cp002c-work/so-nong-dan` retained; 177/177 non-dependency files match the pre-remediation fingerprint. Original 18 files, two transfer payloads and original logs/manifests preserved. Original contract SHA-256 `168db1f38ab4ed028d62679a7e7b756409936099b71a061d9dcc2c514f026952`; original evidence ZIP SHA-256 `06d3748922907901da940713ca76f33a0fcfffd284acc5f93d869b209b9e175b`, 95 members CRC PASS, 94/94 internal checksums. Separate working copy `/mnt/data/cp002c-remediation/so-nong-dan`; 166/177 original non-dependency files unchanged, 11 C files modified, 3 C files added before handoff; 7/18 original C paths unchanged. This report and the new evidence ZIP are two additional C-only handoff files, 23 C paths total. `BEFORE_AFTER.tsv` covers the 21 pre-handoff paths, final external handoff inventory covers all 23. No deletion. Do not copy the whole reconstructed workspace into Git. Four stale local files excluded from any overwrite: `README.md`, `docs/09_DECISION_LOG.md`, `docs/10_PROJECT_STATUS.md`, `checkpoints/CP-002B-R1_REPORT.md`. All four unchanged. Original accepted A/B source, contracts, numeric rules, locks, SQL, UI/design and workflow untouched. Updated contract SHA-256 `45e99a0e56f70e03219c759f0ea9e002082b270b0f36f595124517dac3a372ac`.

## Finding remediation and traceability

Exact source lines, minimal inputs, expected outcomes, regression locations and existing registered-ID mapping: `docs/cp002/CP-002C_REMEDIATION_TRACEABILITY.md`. Findings F01–F12 are not the similarly named registered finance IDs. No change to the 64 IDs/dispositions. No authoritative replay, PG18, database or product PASS.

| Finding | Local remediation | Local disposition |
|---|---|---|
| F01 | Structural key/index path separation; nested/escaped cases | PASS |
| F02 | Fatal UTF-8 before BOM classification after byte bound | PASS |
| F03 | Full supplied snapshot integrity before missing-reference classification | PASS |
| F04 | Registry consistency and overlap before requested policy selection | PASS |
| F05 | Explicit trusted decision time for creation; separate as-of simulation and replay | PASS |
| F06 | Independently supplied per-record fixture anchors; replacement records rejected | PASS within trust boundary |
| F07 | Validate nested engine schema before availability | PASS |
| F08 | Unified typed/raw missing, malformed, contradiction and availability contract; known B wire shape gate | PASS |
| F09 | Mutable/frozen 100k rejection exact non-mutation, no partial output; phase-isolated measurements | PASS (expected RESOURCE_LIMIT) |
| F10 | External expected source/build manifest pins, baseline and compiler checks, fixed adapter; negative substitution gate | Local PASS; independent candidate provenance pending |
| F11 | Compare available contradictory references before unrelated missing resource | PASS |
| F12 | Independently anchored correction-specific evidence; all policy changes remain BLOCKED | PASS |

Technical choices: trusted fixture context is separately supplied FIXTURE_ONLY with explicit decisionTime, bounded record-kind/owner/ID/digest entries and optional independent change-evidence digest. New creation must use trusted decisionTime; simulation does not grant retrospective creation; replay uses pinned time. New FIXTURE/v1 and CHANGE/v1 domain hashes do not alter the original definition/input/result/snapshot envelopes. No system-clock activation or genuine approval. Supplied complete payload and anchors are validated before missing external resources; malformed JSON null differs from absent transport. Full engine identity checked before unavailable; known B wire structural shape checked without available engine, full numeric/domain validation and result equality require engine. Correction-specific evidence binds original digest, identities, revisions, policy hashes, purpose, approval, decision time and evidence ref; even valid change evidence only BLOCKED/POLICY_CHANGE_DEFERRED. Without independently supplied trusted context and snapshot anchor, internal consistency is not authenticity. No signatures, persistent trust registry or production authorization.

## Staged and integrated verification (actual local execution)

| Stage | Actual result |
|---|---|
| C-P1.5A | 5/5 focused groups PASS |
| C-P1.5B | 6/6 focused groups PASS |
| C-P1.5C | Initial 9/10 due to incorrect duplicate-key fixture expectation; corrected fixture, 10/10 PASS; 134 independent snapshots/hash sets MATCH |
| C-P1.5D | 6/6 focused groups PASS, separate benchmark processes and non-mutation |
| C-P1.5E preliminary | 12/12 groups PASS after bounded known-wire schema gate; additional 317 oracle cases |
| C-P1.5E integrated | 66/66 recorded gates PASS; 32/32 subprocess exits 0, runner exit 0 |

Final: full local typecheck, contract typecheck, isolated compile PASS; baseline smoke 9/9; accepted A 7/7 and 10,779 vectors (10,289 exact +490 expected errors); accepted B 12/12 and 624 vectors (488 exact +136 errors). C groups 28/28: 15 retained original groups, 12 F groups, one independent remediation oracle group. C 646 original vectors (512 canonical +134 Fraction snapshots) and 317 additional independent cases (97 numeric path, 6 raw, 172 selection, 35 replay, 7 correction) MATCH. 134/134 independently computed definition/input/result/snapshot hashes MATCH; original 134 serialized snapshots byte-identical (1,180,343 bytes, SHA-256 `671a5b098f6266a95b19328cecc03dda72882058d87e81b87a1939a72ef1796a`). All generated vector sets repeat byte-identically. Original canonical seed 2026112803; additional seed 202611280315. New oracle independent Python stdlib implementation, not candidate-derived expectations. Original 37/37 gates/24 commands and C 15/15 PASS are preserved historical evidence, not counted again. Focused reruns not added to integrated unique counts.

| Oracle | Count | SHA-256 |
|---|---:|---|
| a | 10779 | `6501578c96186b5ab2e20e7cbddb5d6dfcb70305ec9f75419c8a6ffe5b3e09eb` |
| b | 624 | `5c54c778b9f9e34db4aeea03a51325c271e91b4aec0d53a23795d00ea816050f` |
| c | 646 | `3347e152d6893e028323e2ccde9f462f7700e59a4bec2bff854cbfaf4c15c645` |
| remediation | 317 | `adb5656bd88acd2abca822e9bc1cd2573559a7ccf8f2cde7447fb5fc068627eb` |

B legacy projection SHA-256 `62bec71a9f4e8a2bd0afbc5b24b7b387e087fcdd15b0ac09c956080213b3825a` unchanged. All three benchmark accepted B output digests match. Original 134 C fixtures unchanged, no calculation or historical digest version change.

## Resource evidence

Fresh process for each size and phase. Elapsed ms covers named phase; RSS high-water includes process setup/verification and may include inherited launcher high-water. Full process peak is not phase-isolated allocation or production SLA. See all phase raw logs, stage D direct-shell measurements and final integrated benchmarks.json. No limit raised.

| Bags | Phase | Result | ms | Canonical bytes | Nodes | Peak at phase end MiB | Full process peak MiB |
|---:|---|---|---:|---:|---:|---:|---:|
| 1000 | create | PASS | 154.504 | 447070 | 57169 | 216.72 | 216.72 |
| 1000 | digest | PASS | 19.082 | 447070 | 57169 | 216.72 | 216.72 |
| 1000 | replay | PASS | 117.700 | 447070 | 57169 | 216.72 | 216.72 |
| 10000 | create | PASS | 863.898 | 4491684 | 568249 | 216.72 | 216.72 |
| 10000 | digest | PASS | 174.043 | 4491684 | 568249 | 216.72 | 216.72 |
| 10000 | replay | PASS | 915.616 | 4491684 | 568249 | 216.72 | 216.72 |
| 100000 | create | RESOURCE_LIMIT | 7705.100 | n/a | n/a | 313.41 | 369.09 |
| 100000 | create-frozen | RESOURCE_LIMIT | 8698.907 | n/a | n/a | 640.20 | 689.23 |
| 100000 | reference | PASS | 3190.344 | n/a | n/a | 216.72 | 320.47 |

100k input 13,978,097 canonical bytes/1,700,036 nodes; B result 31,607,029 bytes/3,978,753 nodes. Minimum combined 45,585,126 bytes/5,678,789 nodes before envelope; exceeds 4,000,000-node budget, rejection before complete snapshot. Mutable and deep-frozen rejected deterministically with RESOURCE_LIMIT and byte equality, key/array order and property descriptor fingerprint equality (including freeze/seal/extensibility), no partial snapshot, no truncation. Separate B reference process verifies accepted B digest, exact amount 32,487,000,000 VND. At stage D, direct-shell 100k process peaks approximately 311/317 MiB mutable/frozen; integrated final peaks 369.09/689.23 MiB (phase-end 313.41/640.20). Variation and harness cost retained, not an assertion of improvement or a production memory bound. 64 KiB policy, 64 MiB snapshot, depth 32, 4,000,000 nodes, 1,000 fixture records, 128-char IDs and all A/B bounds unchanged. No claim of max supported bag count, only tested data shapes.

## Trusted build and environment (F10)

Live parent and accepted manifest comparison, 35/35 baseline source/lock hashes. Accepted independent A and B-R1 ZIPs validated outer SHA and internal hashes, original archive bytes included for provenance. Node 22.16.0, npm 10.9.2, TypeScript 5.8.3, Python 3.13.5, Git 2.47.3, Linux x86_64. Existing compiler copied locally: `tsc.js` and `_tsc.js` byte digests anchored in accepted A evidence, package JSON historical pin, exact Node executable digest recorded. Not a complete compiler-tree or clean lock-resolved installation attestation. Terminal DNS blocked git ls-remote (128), local reconstruction not full checkout, clean npm ci NOT RUN. External expected source and compiled manifests are separately pinned local Engineering prerequisites; C source origin is reviewed working copy, compiled expected from separate preliminary compile, not independent C candidate attestation. Expected sources 54/54, compiled 20/20, accepted compiled 14/14, three pinned engine artifacts match, exact function identity and fixed adapter invocation verified. Altered artifact, missing artifact, callback injection and caller-manifest negative tests included. Replacing expected-source manifest while retaining trusted SHA fails before compile (expected exit 1). `engineAvailable` alone not build attestation.

| Trusted input | SHA-256 |
|---|---|
| Expected sources | `8466a68f7c9046b284eefeb97998e30a3490df005efb7d80678c5b48a8126ce2` |
| Expected compiled | `189c4f9f6f81de18909c2899a7529c062cb772428e0478c4b2e1ef23a8798458` |
| Baseline receipt | `e8daff4ab33a34111ca119d68246027803f90c09867073590908d421bb36a2e5` |
| Historical engine | `5e73f8a7ccc54cb2913acb9b5046ce326b959f27f5fc331cea860d60ab11d1c8` |

Actual reproducible commands in `evidence-stage/STAGED_COMMANDS.md` and `evidence-stage/E/run-command.sh`; `integrated-run/results.json` includes commands/status, `exit-codes.tsv`, `environment.json`, source/compiled manifests, isolated build and raw logs. Runner manifest 79/79 verified, SHA-256 `f0194499e910bc655aebe8674d0683c5dd6f5085716b58bdb27f8faa964fd8fd`. Future verifier must independently pin exact candidate HEAD/tree, approved A/B baselines, C sources/compiler/build and fixture anchors, then rerun in trusted fresh Node ESM process. Supported only trusted host/filesystem, no hostile loader/preload, module cache injection or concurrent artifact writes. No arbitrary historical JS execution. No silent fallback.

## Limitations and incident disclosure

Initial C focused test expected duplicate-key error although numeric token already invalid; corrected test to strings and added combined INVALID_NUMBER precedence; initial exit1/log preserved. A remote hash transcription error corrected against exact connector result; final 35/35 match. First attempted streaming command unsupported and not executed; actual non-streaming commands executed and logged. Deliberately forged manifest negative run failed as expected, not a failed final gate. Intermediate builds/focused logs preserved, not every intermediate version of all changed source files separately snapshotted; original and final versions retained. Local independent mathematical/canonical oracle not Independent Verifier verdict. Full checkout DNS blocked, clean npm ci NOT RUN, no production memory SLA, no production trust/signature claims. Independent candidate verification pending, particularly F10; no F01–F12 final closure assertion. All PG/database, authoritative replay, persistence/concurrency, C-P2/D–F, posting, UI/integration/product acceptance deferred. No source changes to accepted A/B. No real data, charges, Codex, remote CI, merge/deploy, or GitHub writes.

## Handoff

All staged A–E completed locally. The new evidence archive contains original 18-file implementation, transfers, prior evidence, final implementation, exact traceability, stage and integrated logs, original and new oracle vectors, build artifacts and external pin provenance. Outer manifest excludes itself; original nested ZIP unchanged. Candidate HEAD does not exist; branch remains exact required parent. C-P1.6 explicitly not authorized yet. CP-001, CP-002A, CP-002B-R1 accepted and closed. C-P1.5 COMPLETE — READY FOR CANDIDATE REVIEW. C-P2 and CP-002D–F NOT AUTHORIZED. D06 and D08.1–D08.6 CONFIRMED; D09–D12 OPEN. Stop and return control to Master Control.
