# Labeloo for Google Sheets

An unpublished Google Sheets Editor add-on that turns an explicit selection,
surrounding table, used sheet range, or custom A1 range into editable Labeloo
labels.

The add-on previews and maps values inside Google Sheets. It sends only the
mapped labels after the user clicks **Continue in Labeloo**, receives an opaque
single-use receipt, and opens the full Labeloo editor. It does not request
Google Drive access, enumerate files, modify spreadsheet cells, or place sheet
values in a URL.

## Local development

Requirements: Node.js 20+, npm, and a Google account with Apps Script enabled.

```bash
npm install
npm run verify
```

The Apps Script upload directory is `appsscript/`. `npm run build` bundles the
sidebar client and generates the HTML fragments consumed by Apps Script.

## Unpublished testing

1. Authenticate clasp with the Google account that owns the test sheet.
2. Create or clone the standalone Apps Script project.
3. Run `npm run build` and `npm run clasp -- push`.
4. In Apps Script, choose **Deploy → Test deployments → Editor add-on**.
5. Select the test spreadsheet and **Latest code**, save, then execute the test.
6. In Sheets, open **Extensions → Labeloo → Create labels from this sheet**.

This installs only a development test. It does not create a Google Workspace
Marketplace listing or release the add-on to other users.

See [Architecture](docs/ARCHITECTURE.md) for the reusable connector contract.
