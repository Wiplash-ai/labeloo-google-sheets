# Google OAuth verification packet

## App identity

- App name: **Labeloo**
- Cloud project: `labeloo` (`354807729903`)
- Apps Script project ID: `11vwFybJg1_0l_MxWREucltT-Txvhbajnu_tVnd7Qog8khJAY3iclymbw`
- Homepage: `https://labs.wiplash.ai/labeloo/`
- Privacy: `https://labs.wiplash.ai/labeloo/privacy/`
- Terms: `https://wiplash.ai/legal/terms`
- Support: `https://labs.wiplash.ai/labeloo/support/`
- Support email: `support@wiplash.ai`
- Authorized domain: `wiplash.ai`

The OAuth app name, logo, URLs, and Marketplace listing must use this same
identity. Do not use the developer email address as the public app identity.

## Scope justifications

### `https://www.googleapis.com/auth/spreadsheets.currentonly`

Labeloo runs as an Editor add-on inside the spreadsheet the user currently has
open. It reads displayed values only from the selection, surrounding table,
used range, or custom A1 range the user explicitly chooses. The sidebar needs
those values to detect headers, let the user map columns, and preview the label
records. Labeloo does not read formulas, access another spreadsheet, enumerate
Google Drive, or write to cells. A broader Sheets or Drive scope is not needed.

### `https://www.googleapis.com/auth/script.container.ui`

Labeloo adds **Create labels from this sheet** to the spreadsheet's Extensions
menu and opens the Labeloo mapping sidebar in the current Sheet. The add-on
does not use this scope for background processing or hidden UI.

### `https://www.googleapis.com/auth/script.external_request`

After a user action, Labeloo calls the first-party service at
`https://auth.wiplash.ai/labeloo/` to establish a revocable Wiplash.ai
connector and create an encrypted, account-bound, single-use import receipt.
Mapped labels are sent only after the user clicks **Continue in Labeloo**. The
manifest allowlists that service and no third-party analytics or advertising
endpoint.

## Demo video requirements and shot list

Record one unedited, English-language demonstration using the production
candidate and the sanitized reviewer spreadsheet:

1. Show the Google Auth consent screen with the app name **Labeloo**, logo, and
   the complete requested scope list.
2. Open the reviewer spreadsheet and choose **Extensions → Labeloo → Create
   labels from this sheet**.
3. Show that the sidebar identifies the current workbook, sheet, and range.
4. Switch among selected cells, surrounding table, used sheet range, and a
   custom A1 range.
5. Show row/column orientation, header row, first/last record, field mapping,
   and preview.
6. Connect Wiplash.ai and confirm the short code. Explain that the opaque
   credential is saved in Apps Script user properties and does not grant Drive
   access.
7. Click **Continue in Labeloo**, show the hosted editor consuming the receipt,
   and confirm that imported labels are added without replacing existing work.
8. Return to the sidebar, run a second import without signing in again, and
   disconnect the account.
9. Show the public homepage, privacy policy, support page, and terms page.

The final verification form should use an unlisted video URL and repeat the
scope justifications above. Do not include real names, addresses, credentials,
or private spreadsheet data in the recording.

## Submission gates

- [ ] Production audience enabled in Google Auth Platform.
- [ ] Marketplace SDK draft uses the exact same three scopes as the manifest.
- [ ] Authorized domain ownership is verified.
- [ ] Homepage, privacy, terms, and support URLs are public and branded.
- [ ] Demo video shows the full consent screen and every scope-dependent flow.
- [ ] Project contact email is monitored.
- [ ] Marketplace listing remains a draft until OAuth verification is approved.
