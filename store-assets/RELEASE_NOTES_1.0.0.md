# Labeloo for Google Sheets 1.0.0

First public-release candidate:

- Frozen as Apps Script version 1 with a separate versioned release-candidate
  deployment; the existing latest-code test deployment remains unchanged.

- Reads the selected cells, surrounding table, used range, or a custom A1 range.
- Supports row-oriented and column-oriented tables.
- Detects headers and lets users choose the first and last records.
- Maps unfamiliar spreadsheet columns into Labeloo fields with a live preview.
- Reuses a revocable Wiplash.ai connection without requesting Google Drive access.
- Transfers mapped labels through an encrypted, account-bound, ten-minute,
  single-use receipt only after the user clicks Continue.
- Opens imported records as a new Labeloo sheet without replacing local work.
- Includes explicit privacy, support, terms, loading, retry, and disconnect states.

The add-on does not read formulas, enumerate Drive, modify spreadsheet cells,
or upload data in the background.
