import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../appsscript/appsscript.json", import.meta.url), "utf8"));
const code = await readFile(new URL("../appsscript/Code.js", import.meta.url), "utf8");
const client = await readFile(new URL("../appsscript/Client.html", import.meta.url), "utf8");
const sidebar = await readFile(new URL("../appsscript/Sidebar.html", import.meta.url), "utf8");
const stylesheet = await readFile(new URL("../appsscript/Stylesheet.html", import.meta.url), "utf8");

assert.deepEqual(manifest.oauthScopes, [
  "https://www.googleapis.com/auth/spreadsheets.currentonly",
  "https://www.googleapis.com/auth/script.container.ui",
  "https://www.googleapis.com/auth/script.external_request",
]);
assert.ok(!JSON.stringify(manifest).includes("/auth/drive"), "The add-on must not request Google Drive access.");
assert.match(code, /getDisplayValues\(\)/, "The add-on should read displayed values.");
assert.doesNotMatch(code, /setValues?\(|appendRow\(|deleteRow\(/, "The add-on must not modify spreadsheet cells.");
assert.doesNotMatch(code, /connected:\s*true,\s*token:/, "The connector credential must never be returned to the sidebar.");
assert.doesNotMatch(code, /deleteAllProperties\(\)/, "Connector cleanup must not erase unrelated Apps Script user properties.");
assert.match(client, /<script>/);
assert.doesNotMatch(client, /^\s*import\s/m, "The generated Apps Script client cannot contain module imports.");
assert.match(sidebar, /Continue in Labeloo/);
assert.equal((sidebar.match(/data-step="[0-3]"/g) || []).length, 4, "The sidebar must contain four focused workflow stages.");
assert.equal((sidebar.match(/data-step-target="[0-3]"/g) || []).length, 4, "The progress rail must link to all four workflow stages.");
assert.match(sidebar, /id="mappingMessage"[^>]*role="status"/, "The Map stage must explain why it cannot continue.");
assert.match(sidebar, /M35 8h15l14 20L78 8h15L70 42H58Z/, "The sidebar must use the canonical Labeloo mark.");
assert.match(sidebar, /SHEETS → LABELOO/);
assert.doesNotMatch(sidebar, /LABELLOO|Labelloo|Labello/, "The public sidebar must spell Labeloo correctly.");
assert.match(sidebar, /https:\/\/labs\.wiplash\.ai\/labeloo\/privacy\//);
assert.match(sidebar, /https:\/\/labs\.wiplash\.ai\/labeloo\/support\//);
assert.match(sidebar, /https:\/\/wiplash\.ai\/legal\/terms/);
assert.match(code, /PropertiesService\.getUserProperties\(\)/, "The connector credential should be scoped to the Google user.");
assert.match(code, /\/v1\/auth\/connector-authorizations/);
assert.match(code, /\/v1\/import-receipts/);
assert.match(code, /MAX_SOURCE_ROWS = 2001/);
assert.match(code, /MAX_SOURCE_COLUMNS = 100/);
assert.match(code, /const LABELOO_CONNECTOR = "google-sheets"/);
assert.equal((code.match(/LABELLOO_SERVICE_BASE/g) || []).length, 1, "Only the legacy script-property fallback may retain the old typo.");
assert.doesNotMatch(client, /LABELLOO|Labelloo|Labello/, "The generated client must spell Labeloo correctly.");
assert.match(stylesheet, /\.action-dock\s*\{[^}]*position:\s*sticky/s, "The action dock should follow short content instead of leaving a fixed-page gap.");
assert.match(stylesheet, /\.dock-context small\s*\{[^}]*font-size:\s*12px/s, "The changing step hint must remain readable.");
assert.match(stylesheet, /\.product-links a\s*\{[^}]*font-size:\s*11px/s, "Footer links must remain readable.");

console.log("Verified Apps Script permissions, read-only behavior, branding, and four-stage UI bundle.");
