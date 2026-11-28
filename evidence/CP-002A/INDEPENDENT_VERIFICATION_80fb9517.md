# CP-002A — Independent Verification evidence receipt

Business date: 2026-11-28. Disposition recorded from Independent Verifier: VERIFIED, isolated A-P1 arithmetic only. Project Owner subsequently ACCEPTED this scope and the disclosed limitations. This receipt is not a new execution or independent verification.

## Exact technical baseline

- Repository: hnhuynh1003-blip/so-nong-dan; branch: checkpoint/cp-002a.
- Verified and accepted runtime HEAD: `80fb95175e902e6bea3caac518a8a6b25b9c1815`.
- Runtime tree: `1bcb9ca31eebed744b3448c4c6387d9c50935405`; sole parent: `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`.
- Original Engineering evidence: `LOCAL_VERIFICATION.zip` (7715 bytes; SHA-256 `8361aca880d7d1998a5e6a66951cf11f6d8856386273addbef3d9c3b003ac2cc`; Git blob `518b735faf300b536cbf5f5cb946d967573b2dd8`); unchanged. Internal 15/15 MATCH and 16/16 CRC/length checks are the verifier's recorded results.

## Original independent archive

- File: [SND_CP002A_INDEPENDENT_VERIFICATION_80fb9517.zip](SND_CP002A_INDEPENDENT_VERIFICATION_80fb9517.zip).
- Source: original archive attached directly by Project Owner in the continuation instruction, following Master Control's hash/checksum confirmation. Prior Library raw-byte access failed; direct attachment resolves that blocker.
- Bytes: 21943; SHA-256: `8e3995ee06483b110d9bd29709873a611df6278d73c5a28504d7b7c20b977221`; Git blob: `01f25bfe5dfd207477049eb716645183a35282f9`.
- Closure assistant computed SHA-256 on attached raw bytes, verified ZIP CRC (19/19 members), uniqueness, exact manifest membership excluding the manifest itself and all 18/18 internal SHA-256 values. Archive not repacked, edited or executed. Remote blob identity matches the locally computed Git blob hash. Common secret-pattern scan on members found no matches; not a comprehensive security audit.
- Embedded `INDEPENDENT_VERIFICATION.md` and replay logs preserve the original verifier disposition (owner acceptance pending at that time), compiler and source provenance, independent comparison, extra generator, test and benchmark outputs.

## Verified outcomes (historical execution, not rerun)

Independent Verifier: 10,779 original vectors (10,289 exact results + 490 expected errors) and 1,356 additional vectors (1,288 exact + 68 expected errors), total 12,135/12,135 MATCH; arithmetic groups 7/7 PASS; synthetic benchmark 100,000 operations PASS and 3/3 result digests MATCH, guard 100001 rejects as expected. Candidate manifest coverage 174/174, continuity not full-tree rehash; Engineering archive internal checksums 15/15 MATCH. No arithmetic discrepancy or unauthorized implementation found within reviewed A-P1 scope.

The original oracle seed is 1515078706 and repeated digest is `6501578c96186b5ab2e20e7cbddb5d6dfcb70305ec9f75419c8a6ffe5b3e09eb`. Additional verifier seed is 20261128. The independent replay used connector-reconstructed matching source, Node 22.16.0/npm 10.9.2/TypeScript 5.8.3/Python 3.13.5 on Linux x86_64. Compiled output digest matched Engineering: `0ae72562d05abffd1dddf326e015f88f9e1822ddbe0ce1de818e271cef3f7338`. The verifier benchmark's three recorded digests (20/128/256 digits) are respectively `4817811862bc53aeb83a4ffd2c98afb27ae62763669bcf786b086aa2e83f9d42`, `4817811862bc53aeb83a4ffd2c98afb27ae62763669bcf786b086aa2e83f9d42`, and `0d77902297b7e46a880ca7cdb14e45f3848c85469b84bdddaea714abd67d3ced`. Three digest matches against Engineering are verifier-reported. All 64 registered IDs retained; 13 PASS for A-P1 portions only, 51 entirely NOT RUN.

## Limitations

Clean npm ci NOT RUN; independent full-checkout replay BLOCKED by DNS. Full baseline smoke, full project typecheck and contract typecheck were Engineering-reported, not independently rerun. PostgreSQL round-trip NOT RUN (AR10 pure pre-cast only). Raw JSON parsing, duplicate-key/depth/envelope checks and hostile objects are outside A-P1. Integration and A01–A12 product acceptance NOT RUN. Temporary 1024-digit guard unreachable with valid current operands; no runtime coverage of that branch. Synthetic benchmark is not production capacity/SLA or a historical-data limit. No policy activation, financial posting, production security claim or B–F implementation.

Original referenced R&D reports not independently archived. No new runtime tests, CI, source edits or expanded authorization in this closure. See [Owner Acceptance](../../checkpoints/CP-002A_OWNER_ACCEPTANCE.md).
