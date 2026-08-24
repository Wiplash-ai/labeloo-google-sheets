# Spreadsheet connector architecture

## Decision

Use a classic Apps Script Editor add-on for Google Sheets. It provides the HTML
sidebar Labeloo needs for source selection, row boundaries, column mapping, and
preview while remaining installable as an unpublished test deployment.

The connector is deliberately thin:

```text
explicit Sheet range
  -> local sidebar mapping and preview
  -> scoped Wiplash connector session
  -> encrypted ten-minute import receipt
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
6. Receive a random receipt token that expires in ten minutes.
7. Open Labeloo with the token; the signed-in editor consumes it once under the
   same Wiplash account and adds a new sheet without replacing local work.

Spreadsheet values, names, addresses, provider tokens, and connector
credentials never appear in handoff URLs.

## Release boundary

Development uses an Apps Script Editor add-on test deployment attached to a
specific spreadsheet. Marketplace configuration, OAuth review, screenshots,
pricing, and public installation remain separate future release work.
