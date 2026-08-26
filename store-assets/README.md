# Store assets

Google Workspace Marketplace requires 32×32 and 128×128 application icons, a
220×140 application card banner, and at least one full-bleed screenshot showing
the real Google Sheets integration. The preferred screenshot size is 1280×800.

Source artwork and sanitized live captures live in `source/`. Generated PNG
files are deterministic release artifacts. Screenshots must use the sanitized
reviewer spreadsheet and must not contain real addresses, account identifiers,
credentials, or personal profile imagery.

- `labeloo-sheets-select-1280x800.png` shows the live source-selection step.
- `labeloo-sheets-map-1280x800.png` shows field mapping in Google Sheets.
- `labeloo-sheets-preview-1280x800.png` shows the private pre-handoff preview.
- `labeloo-editor-result-1280x800.png` shows the imported rows as editable,
  print-ready labels in the production Labeloo editor.
