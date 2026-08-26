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

## Submitted demo video

Reviewer URL: https://youtu.be/D18pu9MeVbE

The privacy-reviewed, English-language demonstration uses synthetic spreadsheet
data and the production candidate. It shows:

1. Google's unverified-app warning for **Labeloo**.
2. The complete three-service consent summary for the current spreadsheet,
   sidebar UI, and first-party external request.
3. **Extensions → Labeloo → Create labels from selected cells** in Google
   Sheets.
4. Used-range selection, column mapping, preview, and the explicit
   **Continue in Labeloo** action.
5. The first-party Wiplash.ai handoff and four synthetic labels arriving in the
   hosted editor.

The uploaded copy is unlisted, 1920×1080, and 2:35 long. Browser chrome was
removed so the single-use handoff URL cannot appear. The only account identifier
shown is the OAuth developer email required by Google's consent screen; no real
addresses, credentials, or private spreadsheet data appear.

The sensitive-scope verification request was submitted on August 26, 2026.
Google's Verification Center currently reports all seven review areas as in
progress: homepage, privacy policy, app functionality, branding, appropriate
data access, minimum scopes, and additional requirements.

## Submission gates

- [x] Production audience enabled in Google Auth Platform.
- [x] Marketplace SDK includes the three requested add-on scopes plus the two
      Google-managed `userinfo` scopes shown for the Apps Script integration.
- [x] Authorized domain ownership and OAuth branding are verified.
- [x] Homepage, privacy, terms, and support URLs are public and branded.
- [x] Demo video shows the full consent screen and every requested
      scope-dependent flow.
- [x] Project contact email is configured as `support@wiplash.ai`.
- [x] Marketplace listing submitted for review on August 26, 2026.
- [x] Sensitive-scope verification submitted with the unlisted video URL on
      August 26, 2026.
