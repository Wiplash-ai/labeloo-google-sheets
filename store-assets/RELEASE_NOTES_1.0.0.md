# Labeloo for Google Sheets 1.0.0

First public-release candidate:

- Frozen as Apps Script version 5 with a separate versioned release-candidate
  deployment; the existing latest-code test deployment remains unchanged.

- Reads the selected cells, surrounding table, used range, or a custom A1 range.
- Supports row-oriented and column-oriented tables.
- Detects headers and lets users choose the first and last records.
- Maps unfamiliar spreadsheet columns into Labeloo fields with a live preview.
- Presents Select, Map, Preview, and Continue as focused stages designed for
  Google Sheets' compact sidebar.
- Keeps the action dock stable at the bottom of every step with readable
  guidance and a compact Produced by Wiplash.ai footer.
- Reuses a revocable Wiplash.ai connection without requesting Google Drive access.
- Transfers mapped labels through an encrypted, account-bound, ten-minute,
  single-use receipt only after the user clicks Continue.
- Opens imported records as a new Labeloo sheet by default, or fills blank
  positions in the active Labeloo sheet before appending the remainder.
- Includes explicit loading, retry, and disconnect states; privacy, support,
  and terms remain available from the Marketplace listing.

The add-on does not read formulas, enumerate Drive, modify spreadsheet cells,
or upload data in the background.
