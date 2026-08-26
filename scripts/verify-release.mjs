import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

async function pngSize(path) {
  const bytes = await readFile(new URL(path, root));
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG", `${path} must be a PNG file.`);
  assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR", `${path} must contain a PNG IHDR chunk.`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const expectedAssets = {
  "store-assets/icons/icon-32.png": [32, 32],
  "store-assets/icons/icon-48.png": [48, 48],
  "store-assets/icons/icon-96.png": [96, 96],
  "store-assets/icons/icon-128.png": [128, 128],
  "store-assets/banners/card-220x140.png": [220, 140],
  "store-assets/screenshots/labeloo-sheets-select-1280x800.png": [1280, 800],
  "store-assets/screenshots/labeloo-sheets-map-1280x800.png": [1280, 800],
  "store-assets/screenshots/labeloo-sheets-preview-1280x800.png": [1280, 800],
  "store-assets/screenshots/labeloo-editor-result-1280x800.png": [1280, 800],
};

for (const [path, [width, height]] of Object.entries(expectedAssets)) {
  assert.deepEqual(await pngSize(path), { width, height }, `${path} has the wrong dimensions.`);
}

const listing = await text("store-assets/LISTING.md");
const iconSource = await text("store-assets/source/icon-master.svg");
const bannerSource = await text("store-assets/source/card-banner.svg");
const shortDescription = listing.match(/## Short description\s+([^\n]+)/)?.[1]?.trim() || "";
assert.ok(shortDescription.length > 0 && shortDescription.length <= 200, "Marketplace short description must be 1-200 characters.");
assert.match(listing, /Application name: \*\*Labeloo\*\*/);
assert.match(listing, /Visibility: Public/);
assert.match(listing, /Extensions → Labeloo → Create labels from this sheet/);
assert.match(listing, /submitted for review on August 26, 2026/i);
for (const artwork of [iconSource, bannerSource]) {
  assert.match(artwork, /M35 8h15l14 20L78 8h15L70 42H58Z/, "Marketplace artwork must use the canonical Labeloo mark.");
  assert.doesNotMatch(artwork, /LABELLOO|Labelloo|Labello/, "Marketplace artwork must spell Labeloo correctly.");
}
assert.match(bannerSource, /SHEETS → LABELS/);

const oauth = await text("docs/OAUTH_VERIFICATION.md");
const privacy = await text("docs/PRIVACY_AND_DATA_USE.md");
const reviewer = await text("docs/REVIEWER_GUIDE.md");
for (const scope of ["spreadsheets.currentonly", "script.container.ui", "script.external_request"]) {
  assert.match(oauth, new RegExp(scope.replaceAll(".", "\\.")));
  assert.match(privacy, new RegExp(scope.replaceAll(".", "\\.")));
}
assert.match(reviewer, /Continue in Labeloo/);
assert.doesNotMatch(reviewer, /password\s*[:=]/i, "Reviewer credentials must not be committed.");

console.log("Verified Marketplace copy, release documents, and graphic asset dimensions.");
