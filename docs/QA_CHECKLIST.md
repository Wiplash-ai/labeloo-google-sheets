# Release QA checklist

## Build and permissions

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run verify` passes.
- [ ] Apps Script manifest and Google Auth Platform list the same three scopes.
- [ ] No Drive scope, analytics endpoint, or spreadsheet write method is present.
- [ ] Production account service health check returns 200.

## Source selection

- [ ] A multi-cell selection defaults to **Selected cells**.
- [ ] A single-cell selection defaults to the surrounding table when present.
- [ ] **Used sheet range** excludes unused trailing cells.
- [ ] A valid custom A1 range loads; an invalid range shows a recoverable error.
- [ ] The 2,001-row, 100-column, and 200,000-cell limits show a clear error.
- [ ] Refresh reads the current selection without uploading data.

## Mapping and preview

- [ ] Select, Map, Preview, and Continue appear as four focused stages with only one stage visible at a time.
- [ ] Back, Next, and previously unlocked progress steps preserve the current range and mapping.
- [ ] Invalid or empty mappings return the user to Map and prevent access to later stages.
- [ ] Buried headers are detected.
- [ ] **No header row** preserves the first data record.
- [ ] Rows and columns orientations both work.
- [ ] First and last record controls bound the imported labels.
- [ ] Blank records are skipped.
- [ ] Duplicate destination mappings are prevented.
- [ ] Name, address, email, custom text, and multiline address blocks preview correctly.
- [ ] No usable field mapping prevents Continue and explains the error.

## Account and handoff

- [ ] Extensions → Labeloo → Create labels from selected cells opens with the exact selected range.
- [ ] Wiplash connection requires an explicit click.
- [ ] Repeated clicks cannot start duplicate connection requests.
- [ ] The short code and connection page agree.
- [ ] The connected account persists after closing and reopening the sidebar.
- [ ] A second import does not require another sign-in.
- [ ] Continue in Labeloo opens the editor already signed in and loads the labels automatically.
- [ ] Opening a handoff URL without the approving browser's binding cookie is rejected.
- [ ] A handoff URL rejects replay and expires after two minutes.
- [ ] Disconnect revokes the connector and disables Continue.
- [ ] Expired credentials return the sidebar to a reconnect state.
- [ ] Popup blocking exposes the fallback connection or editor link.
- [ ] Receipt URLs contain no spreadsheet values or reusable credentials.
- [ ] A receipt can be consumed once, rejects replay, and expires after ten minutes.
- [ ] Imported labels are added as a new Labeloo sheet without replacing local work.
- [ ] The Continue caret defaults to a new sheet and clearly distinguishes that from filling the active Labeloo sheet's blank slots before appending.

## Listing and accessibility

- [ ] Sidebar and Marketplace artwork use the canonical Labeloo name-tag mark and spell Labeloo consistently.
- [ ] The changing action hint remains readable at normal zoom.
- [ ] The action dock remains aligned to the bottom across all four steps, with intentional breathing room on short steps.
- [ ] Labeloo and left-aligned Produced by Wiplash.ai attribution remain visible in the footer.
- [ ] Sidebar keyboard navigation, focus outlines, status messages, and disabled states work.
- [ ] Text remains readable at browser and operating-system zoom settings.
- [ ] Privacy, support, and terms links remain correct in the Marketplace listing.
- [ ] Listing screenshots show the real Sheets integration and contain no private data.
- [ ] Reviewer instructions and temporary account work from a fresh Google account.
