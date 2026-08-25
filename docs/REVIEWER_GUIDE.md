# Google Workspace Marketplace reviewer guide

## What Labeloo does

Labeloo turns an explicit range in the current Google Sheet into mapped,
editable labels. It does not modify the source spreadsheet or request Google
Drive access. Data is transferred only after the reviewer clicks **Continue in
Labeloo**.

## Reviewer setup

- Use the sanitized **Labeloo Sheets Add-on Reviewer Sample** spreadsheet.
- Install the submitted Labeloo Editor add-on build.
- Use a temporary Wiplash.ai reviewer account supplied in the private reviewer
  credentials field. Do not place passwords in this repository or listing copy.
- Allow popups from Google Sheets so the connection and Labeloo editor tabs can
  open. A visible fallback link is provided if a popup is blocked.

## Deterministic test path

1. Open the sample spreadsheet and select `A1:E6` on the **Fundraiser checks**
   sheet.
2. Choose **Extensions → Labeloo → Create labels from this sheet**.
3. Confirm **Selected cells**, range `A1:E6`, 6 rows, and 5 columns.
4. Confirm Labeloo detects row 3 as the field-name row and rows 4 through 6 as
   the three labels.
5. Confirm the mapping is Name, Address line 1, City, State or region, and ZIP
   or postal code.
6. Connect Wiplash.ai, confirm the displayed short code, and return to Sheets.
7. Click **Continue in Labeloo** and confirm three address labels open in a new
   Labeloo sheet.
8. Repeat with a smaller selection. The saved connection should be reused and
   no second Wiplash sign-in should be required.
9. Disconnect from the sidebar and confirm Continue is disabled until the
   account is connected again.

## Expected permission behavior

- The add-on can read the current spreadsheet only.
- The add-on cannot enumerate Google Drive or open another spreadsheet.
- The add-on never writes to source cells.
- The add-on sends only mapped label records after the explicit Continue
  action.

Support: `support@wiplash.ai` and
`https://labs.wiplash.ai/labeloo/support/`.
