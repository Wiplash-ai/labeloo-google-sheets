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
6. In Sheets, open **Extensions → Labeloo → Create labels from selected cells**
   or **Open Labeloo label maker**.

This installs only a development test. It does not create a Google Workspace
Marketplace listing or release the add-on to other users.

## Google production identity

The Apps Script project is named **Labeloo** and is attached to its own standard
Google Cloud project:

- Project name: `Labeloo`
- Project ID: `labeloo`
- Project number: `354807729903`
- Apps Script ID: `11vwFybJg1_0l_MxWREucltT-Txvhbajnu_tVnd7Qog8khJAY3iclymbw`

The OAuth consent configuration uses the Labeloo name and logo, the Labeloo
product and privacy pages, Wiplash.ai terms, and the authorized `wiplash.ai`
domain. The audience is in Production, OAuth branding is verified and
published, and the Google Workspace Marketplace listing was submitted for
review on August 26, 2026.

Google's **unverified app** warning can remain until sensitive-scope
verification is complete. The OAuth verification request was submitted on
August 26, 2026 with an unlisted reviewer video showing the consent screen and
the live `script.container.ui` and `script.external_request` flows. All seven
Verification Center review areas are now in progress. The public listing must
not be considered release-ready until that separate verification is approved.

Keep this project separate from `labeloo-production`, which serves the existing
Labeloo Drive/account integration. A public Marketplace add-on needs its own
standard Cloud project, and this separation prevents new add-on scopes or review
work from disrupting current Labeloo users.

See [Architecture](docs/ARCHITECTURE.md) for the reusable connector contract.

## Release preparation

Apps Script version 5 is the submitted public-release candidate. Release and
review materials live alongside the code:

- [Marketplace listing copy](store-assets/LISTING.md)
- [OAuth verification packet](docs/OAUTH_VERIFICATION.md)
- [Marketplace reviewer guide](docs/REVIEWER_GUIDE.md)
- [End-to-end QA checklist](docs/QA_CHECKLIST.md)
- [Privacy and data-use inventory](docs/PRIVACY_AND_DATA_USE.md)

The production account and receipt service is deployed at
`https://auth.wiplash.ai/labeloo`. The Apps Script project is in Google Auth
Platform Production, the verified OAuth branding is published, and the
Marketplace listing and sensitive-scope verification are both in review.
Public release remains gated on sensitive-scope OAuth approval.

Release candidate 1.0.0 is frozen as Apps Script version `5` and deployment
`AKfycbxLznNHzKFkRIXOX96EPwg5QUYSgYexqJ3-AbIMldEeC0Eg0Vwy8UVA7TEYHlFnYGq1qA`.
Versions `1` through `4` remain available as earlier release-candidate snapshots.
The separate `@HEAD` test deployment remains available for unpublished QA.

## Security and license

Report security concerns privately as described in [SECURITY.md](SECURITY.md).
Labeloo for Google Sheets is released under the [MIT License](LICENSE).
