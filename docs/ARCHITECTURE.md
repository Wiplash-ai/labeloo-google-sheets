# Spreadsheet connector architecture

## Decision

Use a classic Apps Script Editor add-on for Google Sheets. It provides the HTML
sidebar Labeloo needs for source selection, row boundaries, column mapping, and
preview while remaining installable as an unpublished test deployment. The
fixed-width sidebar presents those controls as four focused stages: Select,
Map, Preview, and Continue. Only one stage is visible at a time so dense table
controls remain legible inside Google Sheets' 300-pixel sidebar.

Apps Script does not expose Sheets' native right-click context menu. The
supported add-on menu therefore leads with **Create labels from selected
cells**, which opens the same sidebar with the current selection forced as the
source. The regular **Open Labeloo label maker** action retains automatic
selection/table detection.

The connector is deliberately thin:

```text
explicit Sheet range
  -> local sidebar mapping and preview
  -> scoped Wiplash connector session
  -> encrypted ten-minute receipt + two-minute browser handoff
  -> auth service verifies the approving browser's HttpOnly binding cookie
  -> ordinary Labeloo web session is established without another sign-in
  -> hosted Labeloo editor consumes once
```

## Permissions

- `spreadsheets.currentonly`: read the spreadsheet in which the add-on runs.
- `script.container.ui`: add the Labeloo menu and sidebar.
- `script.external_request`: create the Wiplash connection and import receipt.

There is no `drive`, `drive.readonly`, or `drive.file` scope. The add-on reads
displayed values, not formulas, and never writes to the source spreadsheet.

## Shared marketplace contract

Future Excel, LibreOffice, Airtable, ONLYOFFICE, and OpenOffice connectors can
reuse the same account and receipt endpoints:

1. Start a connector authorization for a known connector identifier.
2. Ask the user to confirm the short code in Wiplash.ai once.
3. Store the opaque, revocable connector credential in platform-private user
   storage. It has only `connector:import` access.
4. Map and preview the explicit table selection inside the host application.
5. Upload mapped label records only after a user action.
6. Include the bounded destination intent: create a new Labeloo sheet by
   default, or fill the currently active local Labeloo sheet.
7. Receive an opaque handoff URL whose token expires in two minutes.
8. Open the first-party account service, which verifies the signed, HttpOnly
   browser binding created during connector approval and establishes the normal
   Labeloo web session.
9. Redirect to Labeloo with the separate ten-minute receipt; the editor consumes
   it once under the same Wiplash account and applies the selected destination
   without replacing unrelated local work.

Spreadsheet values, names, addresses, provider tokens, and connector
credentials never appear in handoff URLs.

## Release boundary

Development uses an Apps Script Editor add-on test deployment attached to a
specific spreadsheet. The add-on's dedicated standard Cloud project is
`labeloo` (`354807729903`), branded as **Labeloo**, with the declared scopes
mirrored in Google Auth Platform. The audience is in Production and its OAuth
branding is verified and published.

Release state as of August 26, 2026:

1. The Marketplace listing uses the same Labeloo name, icon, product, privacy,
   terms, and support identity.
2. Apps Script version 5 is pinned in the Marketplace configuration.
3. The Marketplace listing was submitted for review.
4. The remaining gate is the unlisted verification demo and sensitive-scope
   OAuth submission for `script.container.ui` and `script.external_request`.

Marketplace review and OAuth sensitive-scope verification are separate. Do not
interpret a Marketplace approval as permission to ship an unverified OAuth
flow; both approvals are required for the production release.
