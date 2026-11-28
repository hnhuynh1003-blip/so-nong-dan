# CP-002 verification register — 64 original IDs preserved

Source: master draft §10 (62 original IDs) plus R1 addendum §6 (PG18/PG19). No renamed or new registered numeric IDs. CAL-xx preserves baseline spelling (R1 uses CALxx shorthand). The A-P1 columns preserve original Engineering dispositions, subsequently independently verified and accepted under E16. PASS (A-P1 portion) covers only authorized arithmetic variants. The B-P1 column records local B candidate results under E17 only. C–F, driver round trip, policy, finance/integration and product A01–A12 are NOT RUN. Test group count and generated vector count are not registered ID count. Original detailed oracle expectations preserved in both byte-identical source specs.

| ID | Historical A-P1 status | Historical A-P1 scope / disposition | Local B-P1 status / scope |
|---|---|---|---|
| CAL-01 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | PASS (B-P1 portion) — B-01: actual 443/463/454 bags, canonical g and layout; no UI. |
| CAL-02 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | PASS (B-P1 portion) — B-04: six actual 16800g bags, ratio10, exact tare/net and settlement; no finalization. |
| CAL-03 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN as B profile — generic pure A fixture rechecked only, alternative inactive. |
| CAL-04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN as B profile — generic pure A fixture rechecked only, alternative inactive. |
| CAL-05 | PASS (A-P1 portion) | Arithmetic floor vs nearest 100.6; workflow/other scope not run. | PASS (B-P1 portion) — B-08: current nearest 100.6=>101; floor remains generic historical fixture, not active B policy. |
| CAL-06 | PASS (A-P1 portion) | Arithmetic positive half 100.5 and gram quantum anchors; workflow not run. | PASS (B-P1 portion) — B-07/08: half-positive tie, 100499/500/501g boundaries. |
| CAL-07 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | PASS (B-P1 portion) — B-02/03: 25/26,75/76,356 bag layout and stable holes. |
| CAL-08 | PASS (A-P1 portion) | Exact 1/3 and 11/10, tare fraction arithmetic; sheet scope/ownership not run. | PASS (B-P1 portion) — B-04: exact 1000/3, 11/10 kg and fractional ratio; sheet preview only. |
| CAL-09 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| CAL-10 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| CAL-11 | PASS (A-P1 portion) | Wire type/shape, lexical, zero denominator, bounds, signed exact arithmetic; field positivity, null/missing business semantics and invalid-deduction eligibility NOT RUN. | PASS (B-P1 portion) — B-06/09 and typed validation: null/empty/zero/negative/bounds/invalid deductions; no finalization. |
| CAL-12 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| T01 | PASS (A-P1 portion) | Integer wire, exact 9007199254740993, signed64 min/max/outside; no driver. | NOT RUN in B; original requirements retained. |
| T02 | PASS (A-P1 portion) | 50000 minus 1000/3 then minus 100 generic fixture; no rice policy or source handling. | NOT RUN in B; original requirements retained. |
| T03 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | PASS (B-P1 portion) — B-05: different single-price sheets, no second rounding; reject multi-price sheet. Generic 961400/950000/959000/960000 pure fixtures rechecked, no allocation. |
| T04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | PASS (B-P1 portion) — Parent/duplicate/partial-scope rejection; source consumption/concurrent sales NOT RUN. |
| T05 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| T06 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| T07 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| T08 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| T09 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| T10 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| T11 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| T12 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F01 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F02 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F03 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F05 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F06 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F07 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F08 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F09 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| F10 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG01 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG02 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG03 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG05 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG06 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG07 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG08 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG09 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG10 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG11 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG12 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG13 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG14 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG15 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG16 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG17 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG18 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| PG19 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| AR01 | PASS (A-P1 portion) | Canonical wire, invalid types/shapes, length and lexical/domain/normalized precedence. | NOT RUN in B; original requirements retained. |
| AR02 | PASS (A-P1 portion) | 64/78/79 bounds, reduced overflow, wide max64+1, wide intermediate, cancellation; >1024 temporary unreachable from valid operands; no report implementation. | NOT RUN in B; original requirements retained. |
| AR03 | PASS (A-P1 portion) | Fractional tare/net, floor 49566, nonintegral pre-cast rejection. | PASS (B-P1 portion) — B-04 exact fractional tare/net, no impurity current profile; A generic fixture retained; persistence NOT RUN. |
| AR04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | PASS (B-P1 portion) — Parent/scope/excessive tare/unsupported impurity checks; overlapping source deduction and allocation concurrency NOT RUN. |
| AR05 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | PASS (B-P1 portion) — B-05 single-price rejection and different prices per sheet; generic fixture rechecked, no stable source consumption. |
| AR06 | PASS (A-P1 portion) | Two 3/5 lines exact 6/5, explicit fixture per-line 2 vs total 1, residual -1/5; no monetary rounding policy. | NOT RUN in B; original requirements retained. |
| AR07 | PASS (A-P1 portion) | Signed floor/ceil, five tie modes, even index and exact reversal arithmetic -9; financial reversal NOT RUN. | NOT RUN in B; original requirements retained. |
| AR08 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | NOT RUN in B; original requirements retained. |
| AR09 | PASS (A-P1 portion) | Independent Fraction oracle, fixed seed, normalization/round idempotence, order/monotonicity/distance/conservation and exact deterministic result checks. | PASS (B-P1 portion) — B-10 independent Fraction full-field, repeat/permutation and conservation, frozen input; pure preview. |
| AR10 | PASS (A-P1 portion) | PURE pre-cast validation only: integral export, signed64/78-digit and component bounds, fractional rejection. ACTUAL PostgreSQL driver/JSONB round trip and numeric(78,0) control NOT RUN. | NOT RUN in B; original requirements retained. |
| AR11 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. | PASS (B-P1 portion) — AR11-a/c exact deterministic preview and exact VND, no journal/receipt; AR11-b/d integration/financial/posting NOT RUN. |

Totals: 64 registered identifiers; 13 with PASS for authorized A-P1 portions; 51 NOT RUN in their entirety. No full-scope PASS inferred for any deferred portion. Seven executed Node test groups include 10,779 seeded/reference vectors (10,289 exact results + 490 expected-error matches), hand anchors, and property assertions. See raw evidence and report for command exits.

## B-P1 candidate disposition (2026-11-28)

All 64 original IDs retained; B-01..10 are variant labels only. Historical 13 A-P1 portion PASS entries unchanged. Local B-P1 portions PASS for 14 IDs (CAL-01/02/05/06/07/08/11, T03/T04, AR03/04/05/09/11-a/c); 50 do not have a B-P1 PASS. CAL-03/04 generic pure fixture-only recheck recorded without activation. No deferred portion or product acceptance marked PASS. 10 Node test groups, 600 oracle vectors (480 full-field matches +120 expected-error matches), 480 repeated/permuted successes and 639 conservation checks are execution counts, not ID counts. Benchmarks 1000/10000/100000 actual synthetic bags PASS. Independent verifier and owner acceptance pending. See `checkpoints/CP-002B_REPORT.md`. Parent register preserved in immutable A closure commit.
