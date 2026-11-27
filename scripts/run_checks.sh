#!/bin/sh
# Run from project root. Log each actual exit code, keep independent checks running.
set -u
out=evidence/CP-001
mkdir -p "$out"
: > "$out/exit-codes.tsv"
run() { name=$1; shift; "$@" > "$out/$name.log" 2>&1; code=$?; printf '%s\t%s\n' "$name" "$code" >> "$out/exit-codes.tsv"; }
run typecheck npm run typecheck
run build npm run build
run test npm test
run browser python tests/browser_smoke.py
cat "$out/exit-codes.tsv"
if grep -qv "$(printf '\t')0$" "$out/exit-codes.tsv"; then exit 1; fi
