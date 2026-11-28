# Field Ledger design archive — proposed GitHub layout

Design owner selected Field Ledger, approved UI-002–008; UI-009 RC1 awaiting final design freeze approval. This package is not a commit.

Proposed target: `hnhuynh1003-blip/so-nong-dan`, branch `design/field-ledger`, based on accepted CP-001 record HEAD `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`. CP-002A current decision reference: `80fb95175e902e6bea3caac518a8a6b25b9c1815`. Before write: obtain owner permission, recheck branch/base, verify all hashes. Commit only `design/field-ledger/` (release candidate + approval log + archive or inventory, depending on owner permission). Do not touch `src/`, SQL, locks, docs/status, workflows or historical branches. No merge, no CI dispatch, no deployment. Public repo: all sample data only.

`v1.0-rc1/So_Nong_Dan_UI009.html` is the standalone design prototype, not production code. `v1.0-rc1/UI-009_Design_Freeze.md` contains design spec and review limits. `v1.0-rc1/SHA256SUMS.txt` is release manifest. `history/` includes original prior packages byte-for-byte for handoff; can be kept as archive separate from curated Git branch if owner prefers.

Reproduction: run `python polish_ui009.py` in v1.0-rc1 with included baseline and rice_polish.py. Existing Playwright/Chromium only; no dependency installation required for viewing. The three preview scripts document local test environments.
