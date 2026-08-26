# Security policy

Report a Labeloo security concern privately to `security@wiplash.ai`. Do not
include real names, addresses, spreadsheet contents, credentials, or other
sensitive personal data in the initial report.

The Google Sheets add-on reads displayed values only from the current
spreadsheet and range the user chooses. It does not request Google Drive
access, enumerate files, modify cells, read formulas, or upload values in the
background. Mapped labels leave Google Sheets only after the user clicks
**Continue in Labeloo**.

The add-on stores an opaque, revocable Wiplash.ai connector credential in
Apps Script user properties. Spreadsheet values and credentials are never
placed in handoff URLs. Label data is carried in an encrypted, account-bound,
single-use receipt that expires after ten minutes and is removed when consumed.
The separate session-handoff token expires after two minutes and also requires
the signed, HttpOnly browser-binding cookie created when that browser approved
the connector. Forwarding or intercepting the URL alone cannot create a
Labeloo session.

See the [Labeloo privacy policy](https://labs.wiplash.ai/labeloo/privacy/) for
the complete data-handling disclosure.
