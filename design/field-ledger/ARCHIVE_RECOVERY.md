# SND — Field Ledger v1.0 archive recovery

Date: 2026-11-28.
Design Freeze: **OWNER APPROVED**. GitHub archive: **PARTIAL**.

Authority: Project Owner approved UI-009 and Field Ledger v1.0 and explicitly authorized the design-only branch/commit. Master Control confirmed this approval in the archive recovery order. The approved RC1 bytes are the frozen v1.0 reference; the directory name and the original historical candidate/pending-approval statements are preserved, not rewritten. This record supersedes those historical approval-status statements only.

- Repository: hnhuynh1003-blip/so-nong-dan
- Branch: design/field-ledger
- Authorized parent: 3ae5e2be06e401adaca044aad6f9376e9b15e5c5
- Parent tree: 882797db5f3d1c0f1a1ccfc81776657c49f03b68
- Original package: UI-009_Field_Ledger_Design_Freeze_GitHub_Package.zip
- Package SHA-256: d22eeebba0da920ff9afb7928186b436c2bdef7c696f5c965a6259fd1361412f
- Original package CRC PASS; original release manifest 34/34 and historical ZIP inventory 10/10 matched in the local archive.
- Original frozen prototype SHA-256: 37e691739d7198e83e194c57a4a0d91c6f92fd344eccec077cf614024c3ab3a5
- This recovery archives 17/17 original text paths, including the original unaltered manifest and history inventory. Each was read back from its Git blob and independently SHA-256 matched against the original package inventory before tree creation.
- 29/46 original paths remain missing: 19 PNG screenshots and 10 historical ZIP packages. Direct Git network/DNS was unavailable in the working container and the available connector does not ingest those local binary bytes. No placeholder, reconstructed image, re-encoded binary or fabricated hash was committed.
- ARCHIVE_INVENTORY.tsv lists all 46 original paths relative to this directory, expected SHA-256 and recovery status. v1.0-rc1/SHA256SUMS.txt remains the complete original release manifest; checking all its entries at this partial archive must report missing PNGs. SHA256SUMS.archived.txt checks the actually archived original text assets plus these two recovery records; excludes itself.
- Recovery: extract the 29 missing original binary paths from the preserved package (not regenerated screenshots); validate each against ARCHIVE_INVENTORY.tsv, transfer exact bytes, verify via GitHub readback, then record a new recovery commit under this directory and close archive only after all 46 original paths match. Preserve the original manifest, records and history.

This is design documentation and a synthetic isolated prototype only, not production code. No redesign, no product source, SQL, lockfile, workflow or technical status document changes; no CI dispatch, merge, deployment, dependency installation or Codex. Historical QA is preserved, not rerun. Master Control's current instruction states CP-001 and CP-002A remain ACCEPTED, CP-002B–F remain NOT AUTHORIZED. This record does not assert independent technical acceptance evidence or change those states.

Return to Master Control for archive readback and remaining binary recovery. No further design changes authorized.
