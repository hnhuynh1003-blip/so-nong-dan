# CP-002 verification register — 64 original IDs preserved

Source: master draft §10 (62 original IDs) plus R1 addendum §6 (PG18/PG19). No renamed or new registered numeric IDs. CAL-xx preserves baseline spelling (R1 uses CALxx shorthand). Results below refer to local A-P1 candidate only; PASS (A-P1) means executed authorized arithmetic variants, not all original full-scope requirements. All B–F, driver round trip, policy, finance/integration and product A01–A12 are NOT RUN. Test group count and generated vector count are not registered ID count. Original detailed oracle expectations preserved in both byte-identical source specs.

| ID | Local A-P1 status | Scope / disposition |
|---|---|---|
| CAL-01 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| CAL-02 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| CAL-03 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| CAL-04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| CAL-05 | PASS (A-P1 portion) | Arithmetic floor vs nearest 100.6; workflow/other scope not run. |
| CAL-06 | PASS (A-P1 portion) | Arithmetic positive half 100.5 and gram quantum anchors; workflow not run. |
| CAL-07 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| CAL-08 | PASS (A-P1 portion) | Exact 1/3 and 11/10, tare fraction arithmetic; sheet scope/ownership not run. |
| CAL-09 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| CAL-10 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| CAL-11 | PASS (A-P1 portion) | Wire type/shape, lexical, zero denominator, bounds, signed exact arithmetic; field positivity, null/missing business semantics and invalid-deduction eligibility NOT RUN. |
| CAL-12 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T01 | PASS (A-P1 portion) | Integer wire, exact 9007199254740993, signed64 min/max/outside; no driver. |
| T02 | PASS (A-P1 portion) | 50000 minus 1000/3 then minus 100 generic fixture; no rice policy or source handling. |
| T03 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T05 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T06 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T07 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T08 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T09 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T10 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T11 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| T12 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F01 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F02 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F03 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F05 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F06 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F07 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F08 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F09 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| F10 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG01 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG02 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG03 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG05 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG06 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG07 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG08 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG09 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG10 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG11 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG12 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG13 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG14 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG15 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG16 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG17 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG18 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| PG19 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| AR01 | PASS (A-P1 portion) | Canonical wire, invalid types/shapes, length and lexical/domain/normalized precedence. |
| AR02 | PASS (A-P1 portion) | 64/78/79 bounds, reduced overflow, wide max64+1, wide intermediate, cancellation; >1024 temporary unreachable from valid operands; no report implementation. |
| AR03 | PASS (A-P1 portion) | Fractional tare/net, floor 49566, nonintegral pre-cast rejection. |
| AR04 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| AR05 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| AR06 | PASS (A-P1 portion) | Two 3/5 lines exact 6/5, explicit fixture per-line 2 vs total 1, residual -1/5; no monetary rounding policy. |
| AR07 | PASS (A-P1 portion) | Signed floor/ceil, five tie modes, even index and exact reversal arithmetic -9; financial reversal NOT RUN. |
| AR08 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |
| AR09 | PASS (A-P1 portion) | Independent Fraction oracle, fixed seed, normalization/round idempotence, order/monotonicity/distance/conservation and exact deterministic result checks. |
| AR10 | PASS (A-P1 portion) | PURE pre-cast validation only: integral export, signed64/78-digit and component bounds, fractional rejection. ACTUAL PostgreSQL driver/JSONB round trip and numeric(78,0) control NOT RUN. |
| AR11 | NOT RUN | Outside authorized A-P1 subset; original requirements preserved in source specifications. |

Totals: 64 registered identifiers; 13 with PASS for authorized A-P1 portions; 51 NOT RUN in their entirety. No full-scope PASS inferred for any deferred portion. Seven executed Node test groups include 10,779 seeded/reference vectors (10,289 exact results + 490 expected-error matches), hand anchors, and property assertions. See raw evidence and report for command exits.
