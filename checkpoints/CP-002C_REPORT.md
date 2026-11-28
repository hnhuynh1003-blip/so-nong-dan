# CP-002C C-P1 v1.0 — Engineering candidate verification

Status: CANDIDATE FOR INDEPENDENT VERIFICATION, NOT ACCEPTED. 2026-11-28. Owner explicitly authorized C-P1 only. Required parent e21b0b5583ebd0da222e62aaa5553cfe7122bea8, tree 856d6b51dd7f9edc54a000f1e35a67cf5442a3cf; branch checkpoint/cp-002c. Accepted B-R1 runtime b4f94a3fe24c02be292247184aeaca33b2375a4a; accepted A runtime 80fb95175e902e6bea3caac518a8a6b25b9c1815. Parent ancestry and all 193 manifest paths verified via connector. CP-001/A/B-R1 ACCEPTED AND CLOSED; B-IV-01 RESOLVED; C-P2/D-F NOT AUTHORIZED; D06/D08.1-6 CONFIRMED; D09-D12 OPEN. Field Ledger v1.0 archive complete per owner declaration. No design change.

## Contract and implementation

See docs/cp002/CP-002C_AUTHORIZATION.md and CP-002C_C-P1_CONTRACT.md. Contract documented before implementation. SND-JCS-RESTRICTED-1: restricted RFC 8785-compatible canonical UTF-8, UTF-16 key order, arrays ordered, no normalization, bounded raw parser and typed data-descriptor checks, decoded duplicate keys rejected before merge. Only declared integer metadata JSON numbers; A-P1 exact string/rational quantities. SHA-256 of canonical definition envelope, domain-separated input/result/snapshot hashes. Full snapshot body binds complete original B-R1 input, complete actual B result, authority, owner/sheet/revision, policy/version/hash, approval/effectivity, evaluation time and business date, engine manifest, version and both digests. Only snapshotSha256 excluded from its own digest. Pure fixture registry and explicit-time half-open selection, retirement, historical replay, correction plan and unknown observation; no production activation, no caller totals, arbitrary interpreter or archived JS execution. All authority FIXTURE_ONLY, result PREVIEW_EVIDENCE. Raw convenience APIs apply parser and schema. Policy change separately authorized fixture only, never activated. No official calculation or posting.

## Fixed engine binding evidence

- Accepted A source SHA-256 e3031c59ed667082a3bd17f94a2afa45612d0282dbf615aea9d7e287b43e68bf; compiled 0ae72562d05abffd1dddf326e015f88f9e1822ddbe0ce1de818e271cef3f7338.
- Accepted B source SHA-256 330cc2001269f37469c57fcc3cd652d9b73e14442c4203b3597397da1d8b178a; compiled fa296ccd7af27201d8e1fad8a0eddf88d2ac28a9719d16acbbcb800ac12d3979.
- C static adapter source 2d436086c873ac8ef8bb9835653c2a588c3b1702b5c9f5c345be121ef7d879f0; compiled 190449ca8562b6397a75c22d07173a713019859d32617a88ee6a128adf210044.
- Actual isolated compiler output matched all 14 prior compiled files; 35/35 accepted local source/lock/config/fixture/contract inputs matched. Static adapter reexports accepted B function. Gate hashes fixed actual files before literal import, compares actual export identity, rechecks bytes before calls. No caller manifest/callback/path defines trust root. Runner verifies source/locks/tsconfig/oracle pins, exact toolchain and compiled hashes. C-10 deliberately alters each compiled file, substitutes self-consistent wrong adapter/forged pin, tests missing artifact and late mutation. No untrusted artifact executed; bad binding unavailable or mismatch. Identity metadata in final-run/engine-binding.log, hashes in compiled_SHA256.txt and TESTED_SOURCE_SHA256.txt.
- Supported environment: trusted fresh local Node ESM, no hostile loader/preload/cache injection or concurrent file writes. External expected snapshot hash anchor and trusted fixture set mandatory. Hash is not signature/authorization; if caller controls external anchor and fixture trust set authenticity cannot be established. Node-only, not production UI. No cryptographic build attestation or arbitrary historical engine selection.

## Actual local verification

Final runner exit 0, 37 steps PASS, 24 subprocesses exit 0 (other gates are in-process assertions). Node 22.16.0, npm 10.9.2, TS 5.8.3, Python 3.13.5, Linux x86_64. Compiler package SHA-256 ebb0ce176c85ac13ce82f5be7e6f15114732ba0f064ccc893fd9051426d35d3a; compiler implementation 1f62c69e832fbbbd05a6dac950f152937f594a4d0b88087be5406ace348efcb5. Existing exact installed compiler copied from prior environment; not clean npm ci. Full terminal checkout DNS blocked (exit 128), local hash-matched reconstruction, exact parent/branch connector readback. No production dependencies added. Full local TS typecheck and contract typecheck, isolated compile PASS, baseline Node smoke 9/9, accepted A groups 7/7 and B groups 12/12 PASS; C groups 15/15 PASS. A/B sources and expected digests unchanged, not claiming a new independent acceptance. Final source-no-drift PASS.

| Oracle | Count | SHA-256 (repeat byte-identical) |
|---|---:|---|
| A (accepted seed 1515078706) | 10779 | `6501578c96186b5ab2e20e7cbddb5d6dfcb70305ec9f75419c8a6ffe5b3e09eb` |
| B-R1 (accepted seed 2026112802) | 624 | `5c54c778b9f9e34db4aeea03a51325c271e91b4aec0d53a23795d00ea816050f` |
| C (seed 2026112803) | 646 | `3347e152d6893e028323e2ccde9f462f7700e59a4bec2bff854cbfaf4c15c645` |

B legacy projection SHA-256 `62bec71a9f4e8a2bd0afbc5b24b7b387e087fcdd15b0ac09c956080213b3825a` MATCH. C oracle independently implemented in Python: UTF-16BE sort, exact UTF-8 JSON escapes, hashlib SHA-256, accepted B Python Fraction reference; 512 canonical byte+digest vectors and 134 real sheet complete-field snapshots MATCH. Independent Python checks 134/134 each of snapshot/input/result/definition digests. Snapshot JSONL SHA-256 `671a5b098f6266a95b19328cecc03dda72882058d87e81b87a1939a72ef1796a` (1180343 bytes, 134 records); reproducible generated data not stored as large duplicate fixture files. Definition anchor e6a77f8c8385cf2064dcac17987e92bdd3013048826d14cf6002602f96b11c63. Raw logs/commands/environment/exit codes in ZIP.

| Variant | Registered IDs (authorized pure portions only) | Actual outcome |
|---|---|---|
| C-01 | AR08/09 | PASS independent bytes and hashes, UTF-16, whitespace/order |
| C-02 | AR08/CAL11 | PASS decoded duplicate, UTF-8/surrogates, numeric grammar, depth/bytes/nodes, accessors/proxy/cycle |
| C-03 | AR08 | PASS definition anchor, ordered steps tamper |
| C-04 | CAL12/AR08 | PASS uniqueness and immutable fixture copy |
| C-05 | T05/AR08 | PASS owner/policy/hash/scope/authority mismatch |
| C-06 | CAL12/T05 | PASS half-open boundaries, explicit selection, overlap, retirement |
| C-07 | CAL01/02/06/08/11/AR03 | PASS complete exact preview and source arrays, 134 Fraction cases |
| C-08 | AR08 | PASS input/result/ref tampering incl recomputed internal hashes, external anchor |
| C-09 | T05/CAL12 | PASS pinned old policy/newer version/retirement |
| C-10 | AR08 | PASS trusted actual artifact and adversarial binding |
| C-11 | CAL12/T05 | PASS distinct revision, original policy and engine, policy change deferred |
| C-12 | T05 | PASS UNKNOWN historical observation only |
| C-13 | AR11-a/c | PASS fixture-only authority and no posting/receipt |
| C-14 | T01/T02/AR03/AR09 | PASS accepted artifact and A/B regression continuity |
| C-15 | CAL11/AR08 | PASS processing bounds including deterministic 100k rejection |

64 registered IDs and prior dispositions preserved; variants not new register IDs. No full-scope PASS inferred. PG18 concurrency, PG/driver round-trips, authoritative replay/correction/posting, integration and product acceptance NOT RUN. No full independent rerun claimed of previous independent 12,135 A or 871 B vectors, only the original accepted local oracle sources (10,779 A and 624 B).

## Synthetic benchmark (final run)

Actual arrays of 44300 g gross bags, ratio 10, 7350 VND/kg; memory peak is per process maxRSS KiB, includes test harness. Single trial at each size, synthetic and not production latency/storage SLA. B full output digest 3/3 matches accepted B-R1 result digest. Full snapshot digests for successful sizes checked by replay; 100k result components measured separately after repeat exact rejection.

| Bags | Snapshot status | Canonical bytes | Nodes | Create/reject ms | Digest ms | Replay ms | Peak RSS KiB |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1000 | PASS | 447070 | 57169 | 161.099 | 17.410 | 129.757 | 110432 |
| 10000 | PASS | 4491684 | 568249 | 949.942 | 227.816 | 1514.192 | 124540 |
| 100000 | RESOURCE_LIMIT | no snapshot | no snapshot | 7723.233 | NOT RUN | NOT RUN | 521560 |

100k rejected twice with RESOURCE_LIMIT: Object keys exceed node budget. Repeat rejection 8120.914 ms. Input canonical 13978097 bytes / 1700036 nodes, digest 548.775 ms; result 31607029 bytes / 3978753 nodes, digest 1263.975 ms. Minimum combined 45585126 bytes and 5678789 nodes, before envelope. This exceeds 4,000,000 node budget even though component bytes sum below 64 MiB. No partial snapshot, no full digest/replay, no truncation. 10k demonstrated, 100k unsupported for this fixture; exact max varies by input/trace/IDs, not determined. B limit unchanged. Candidate per-op 64KiB policy record, 64MiB snapshot, depth32, 4m nodes including keys, 1000 fixture records total, 128 ASCII identity. Do not treat as annual/historical data cap. See benchmarks.json for full digests and memory.

## Evidence and limitations

Evidence ZIP `evidence/CP-002C/LOCAL_VERIFICATION.zip`: 54533 bytes, 95 members, CRC 95/95 PASS, internal SHA-256 94/94 MATCH. SHA-256 `06d3748922907901da940713ca76f33a0fcfffd284acc5f93d869b209b9e175b`. Original A/B evidence unchanged. Final run manifest and outer manifest preserved separately. Early C test harness syntax failure fixed (only C); first runner attempt A oracle required --output, corrected only C runner; second runner attempt interrupted by outer execution timeout at 100k, partial logs preserved; separate 100k probe and final full runner exit 0. No source drift. Container streaming unavailable, ordinary commands used. Full checkout blocked DNS; exact copied compiler only; clean npm ci NOT RUN. Independent verification pending.

Known limits: typed data caller preallocations/own-key enumeration and B bounded output can consume memory before snapshot aggregate rejection; no hostile in-process/loader/filesystem security guarantee. Raw parser required for duplicates before merge; already parsed objects cannot reveal original duplicate keys. Snapshot digest is not signature; trusted external anchor and reference set required. Single sheet, fixed engine only; mixed-policy/engine groups, C-P2, persistence, DB registry/revision/history, production approval, activation/retirement, concurrency, source consumption, authoritative replay/correction, settlement, journal and UI integration not implemented. No A/B defect identified in exercised local scope. No production capacity claim. No SQL, lockfile, workflow, UI or accepted A/B source/contract changes. No new dependencies, real data, CI, merge, deployment, Codex or charges. Return to Master Control; C-P1 candidate only.

Reproduce from exact candidate checkout with existing verified toolchain (dependency install separate): `python3 scripts/verify_cp002c.py --evidence-dir /tmp/snd-cp1-independent`. No network/DB/install or tracked dist writes. Evidence ZIP does not include giant regenerated vectors; seeds and hashes enable reproducible comparison. Aggregate source manifest inherits hashes only for unchanged parent blobs, plus new/updated files and parent manifest. It is not a full independent baseline rehash.
