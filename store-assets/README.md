# Store assets

Google Workspace Marketplace requires 32×32 and 128×128 application icons, a
220×140 application card banner, and at least one full-bleed screenshot showing
the real Google Sheets integration. The preferred screenshot size is 1280×800.

Source SVG artwork lives in `source/`. Generated PNG files are deterministic
release artifacts. Screenshots must use the sanitized reviewer spreadsheet and
must not contain real addresses, account identifiers, or credentials.

- `labeloo-sheets-mapping-1280x800.png` shows source selection and field mapping
  in the live Google Sheets add-on.
- `labeloo-import-result-1280x800.png` shows the same three sanitized rows as
  address labels in the production Labeloo editor.
