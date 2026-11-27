# CP-002A / A-P1 implementation contract and traceability

Status: CANDIDATE FOR INDEPENDENT VERIFICATION. Normative scope: master draft §3, arithmetic definitions in §4.3, R1 addendum §8; owner authorization record in this directory. No application integration, policy selection, registry, rice-sheet workflow, posting, persistence, UI or business default. Export path `src/modules/shared/exact-arithmetic/index.ts` is independent of existing modules and does not import or activate their draft contracts.

## Public API

- `parseInteger(unknown): bigint`, `serializeInteger(unknown): string`, `fromInteger(unknown): RationalWire`: ASCII canonical signed integers; no Number coercion; 256 magnitude digits, `-0` and extra characters rejected. Serialization of bigint is explicit, not JSON BigInt.
- `parseRational(unknown): RationalWire`: exactly two own enumerable data fields `numerator` and `denominator`, canonical strings, positive denominator, reduced gcd=1, zero 0/1. Deterministic output property order and frozen value. `normalizeRational` is a distinct adapter accepting canonical integer tokens with negative denominator or unreduced fractions (not lexical exceptions); zero denominator rejected. No mutation of input. Caller retains original observation/provenance externally.
- `add`, `subtract`, `multiply`, `divide`, `compare`: validate both inputs before computation. GCD denominator addition/subtraction; cross cancellation multiplication/division; exact cross comparison. Comparator sign (-1/0/1) is metadata, never quantity. Results reduced and bounded.
- `convertMass(value,from,to)`: explicit `g` / `kg` conversions, including identity; no implicit unit, no land/currency conversion, no rice three-digit input mode. Generic unit ratio via rational operations.
- `round(value,options)`: `{"method":"exact"}` only; `floor` or `ceil` require positive canonical rational `quantum`, no tie; `nearest` requires quantum and one of `positive`, `negative`, `toward_zero`, `away_from_zero`, `even`. No null/implicit values, no legacy registry enum inference. Exact mode returns unchanged canonical value; floor uses mathematical signed division, ceil is mathematical ceil, ties select upper/lower/nearer zero/farther zero/even index. Quantum ratio is temporary, not subject to reduced bound until final wire result. No second scope-based rounding; caller must explicitly choose operations. Rounding in tests is a synthetic fixture, not a business policy.
- `toSigned64` and `toNumeric78`: pure pre-cast integral export, denominator 1 then signed range or absolute 78-digit bound. `toNumeric78Components`: independent 78-digit numerator/denominator checks on canonical rational (exact component representation, not integer coercion). No SQL or driver. Nonintegral and out-of-range fail without partial value.

## Input boundary, resource profile and stable errors

Typed wire API only. Input is bounded plain data supplied by caller, not raw JSON, arbitrary graph, class instance, accessor or proxy; exact shape is checked using own property descriptors. JSON parse/depth/duplicate-key/UTF-8 4096-byte envelope responsibility remains outside this arithmetic core, as R1 §8 expressly permits. Do not expose these functions as direct untrusted raw JSON endpoints or assume they bound the cost of arbitrary hostile JavaScript objects/proxies; upstream must enforce bounded records and reject duplicate keys before object construction. Oracle JSONL contains trusted generator-produced envelopes (metadata nesting is not the raw rational wire format); line byte limit 4096 checked. No production raw JSON parser or JSON canonical policy hashing provided.

Profile: token 256 digits excluding optional minus; token lengths checked before BigInt; reduced components 256 digits, temporary magnitude 1024 digits. No exponent parsing, no recursive computation. Multiplication/addition of valid input magnitudes yield <=512/513 digits, rounding ratio/index <=513 and final pre-reduction product <=769; all relevant integer products/sums checked, so current public operands cannot reach a >1024-digit temporary. The guard is present but such a path is not directly reachable through valid A-P1 input. Oversized external bigint serialization rejects reduced bound. Per-call limits do not cap history, records/year or reports. Benchmark harness only has explicit 1..100000 operations; no library-wide mutable operation counter. Wide result (max64+1) allowed within reduced profile, rejected only at signed64 export.

Validation precedence (first failing phase, left-to-right within phase):

1. `INVALID_TYPE` (wrong primitive/record kind/exact token type), `INVALID_SHAPE` (missing/extra/symbol/non-enumerable/accessor field or nonplain object). Known rounding method determines exact option shape; missing method/quantum/tie or forbidden extras is shape failure. Units/method/tie must be strings. Shape/type checks across all operands before token checks.
2. `RESOURCE_LIMIT` token length (excluding initial minus even for malformed tokens); typed API has no raw JSON byte gate.
3. `NONCANONICAL` lexical full ASCII grammar, including final LF, signs, leading zero, exponent, grouping and whitespace.
4. `DIV_ZERO` zero denominator; `DOMAIN` negative denominator for strict wire (adapter may normalize sign). Check all denominator sign/zero conditions before gcd.
5. `NONCANONICAL` non-reduced/zero noncanonical wire. Adapter instead reduces.
6. Operation preconditions: `DIV_ZERO` zero divisor; `DOMAIN` unsupported unit/method/tie or nonpositive quantum. Unknown string enum is domain failure after wire validation; option shape is validated against known allowed fields before enum check.
7. `RESOURCE_LIMIT` temporary/reduced bounds; no truncation or partial result.
8. Explicit persistence adapter: `NON_INTEGRAL` before `OUT_OF_RANGE` for integral export; component export checks bounds independently. No rounding-to-fit.

The library throws `ArithmeticError.code` from the stable union. Messages are diagnostic, not an external compatibility contract. `null`/missing is not zero. Generic signed arithmetic accepts negative and zero values; field/domain eligibility for positive bag weight, missing price, invalid deductions and journal mapping is B–F, not this library.

## Traceability

| Requirement | Implementation | Local evidence / registered IDs |
|---|---|---|
| Draft §3, R1 §8 canonical integer/rational and precedence | `parseInteger`, `serializeInteger`, `parseRational`, `normalizeRational`, phase validation | T01, CAL-11 arithmetic portion, AR01; hand invalid grammar/shape/overlap anchors |
| Draft §3/4.1, R1 §8 exact rational and units | `add/subtract/multiply/divide/compare`, `convertMass` | CAL-08, T02, AR03; hand anchors and independent Fraction vectors |
| Draft §4.3, R1 §8 signed floor/ceil/5 ties and explicit quantum | `round`/`floorParts`, cross-cancel quotient/index | CAL-05/06, AR06/07/09; all sign/parity/quantum ties, scope contrast and exact reversal arithmetic only |
| R1 §8 resource and wide intermediate | `PROFILE`, temporary/reduced guards, gcd/cross-cancel | AR02/09; token/reduced boundary, wide quantum index, cancellation, resource errors |
| Draft §3, R1 §5/8 pre-cast exact storage | `toSigned64`, `toNumeric78`, `toNumeric78Components` | T01, AR02, AR10 PURE pre-cast only, AR03 nonintegral; no DB round trip |
| R1 §8 oracle and deterministic exact wire | `tests/cp002a/oracle.py`, `arithmetic.test.mjs`, isolated runner | AR09 plus listed hand variants, reproducible seed/digest, cross-product conservation, gcd/idempotence, monotonicity and nearest distance |
| R1 §8 benchmark | `tests/cp002a/benchmark.mjs` | AR02/09 technical microbenchmark only; no production performance gate |

Full 64-ID disposition: `CP-002_TEST_REGISTER.md`. No new registered numeric ID, no implicit PASS of deferred variants. See `checkpoints/CP-002A_REPORT.md` and `evidence/CP-002A/LOCAL_VERIFICATION.zip`.

## Reproduction

Use exact baseline Node 22.16.0, npm 10.9.2 and package-local TypeScript 5.8.3 installed from the reviewed lock (installation is separate, not performed by this script); Python 3.13.5 for matching oracle environment. From a clean candidate checkout, run with an external, nonexistent evidence directory:

```sh
python3 scripts/verify_cp002a.py --evidence-dir /tmp/snd-cp002a-independent --operations 100000
```

Runner uses existing compiler, baseline `tsconfig`, isolated build directory, independently generates JSONL twice, compares SHA-256, runs Node tests and benchmark. Commands, process exit codes, compiler/build/oracle/source hashes and environment are captured. No network, CI, DB or tracked generated dist writes by runner. In disposable checkout only, `npm run test:fallback` is an optional baseline smoke; it rebuilds tracked dist in that checkout; do not commit dist. No changes to the accepted package scripts or CI. Local verification used exact version existing compiler copied to `node_modules`; clean lock-resolved install and independent rerun on full Git checkout remain pending. Do not treat fixture result as posting or product acceptance.
