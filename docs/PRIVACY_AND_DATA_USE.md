# Privacy and Google API data use

This document is the release inventory for the Labeloo Google Sheets Editor
add-on. The public policy is the
[Labeloo Privacy Policy](https://labs.wiplash.ai/labeloo/privacy/).

## Data flow

1. The add-on reads displayed values from the current spreadsheet and the
   selection, surrounding table, used range, or custom A1 range the user
   chooses.
2. Header selection, row boundaries, field mapping, and preview run in the
   Apps Script sidebar. No upload occurs when the add-on is installed, opened,
   or refreshed.
3. The user connects a Wiplash.ai account. An opaque connector credential is
   stored in Apps Script user properties and is not returned to sidebar code.
4. After the user clicks **Continue in Labeloo**, the add-on sends only the
   mapped label records plus workbook, sheet, and range names over HTTPS to the
   first-party Labeloo account service.
5. The service creates an encrypted, account-bound, single-use receipt. The
   URL contains only a random receipt token. The receipt expires after ten
   minutes and is deleted after consumption or expiry.

## Data inventory

| Data | Collection | Purpose | Storage and retention |
| --- | --- | --- | --- |
| Displayed spreadsheet values from the chosen range | Google Sheets `spreadsheets.currentonly` scope | Map rows or columns into editable labels | Held by the Apps Script execution and sidebar; uploaded only after Continue |
| Workbook, sheet, and A1 range names | Current spreadsheet | Identify the imported source inside Labeloo | Included in the ten-minute receipt |
| Wiplash.ai account email and opaque account identifier | Wiplash.ai sign-in | Show the connected account and bind the receipt | Account service session retention; email is shown in the sidebar |
| Opaque connector credential | Wiplash.ai account service | Reuse the connection without signing in for every import | Apps Script user properties until expiration or disconnect |
| Mapped label records | Explicit Continue action | Open the records in the Labeloo editor | Encrypted receipt for at most ten minutes; removed on first consumption |
| Security and request metadata | Labeloo account service | Authentication, abuse prevention, and reliability | Operational logs according to Wiplash retention procedures |

## Google API scopes

| Scope | Use | Minimum-access justification |
| --- | --- | --- |
| `spreadsheets.currentonly` | Read displayed values from the current spreadsheet and chosen range | Does not allow Drive enumeration or access to another spreadsheet |
| `script.container.ui` | Add the Labeloo menu and open its sidebar in the current Sheet | Required for the visible Editor add-on entry point |
| `script.external_request` | Connect Wiplash.ai and create the one-time import receipt over HTTPS | Requests only the first-party Labeloo service allowlisted in the manifest |

## Data the add-on does not access

- Google Drive file lists or files other than the current spreadsheet.
- Spreadsheet formulas, revision history, comments, or collaborators.
- Cells outside the current spreadsheet.
- Google access tokens or refresh tokens in client-side code.
- Payment-card details, advertising identifiers, or location data.

The add-on does not write to, append to, or delete spreadsheet cells. It does
not use spreadsheet content for advertising, analytics, AI training, or sale.

## User controls

Users choose the source range, header, first and last record, and destination
field for every transferred column. They can disconnect Wiplash.ai from the
sidebar. They can request account access, correction, export, or deletion at
`support@wiplash.ai`.

## Review note

This inventory documents current technical behavior and Google Limited Use
commitments. Broader jurisdiction-specific legal-basis and international-
transfer language should be reviewed by qualified counsel before a material
expansion beyond the current product policy.
