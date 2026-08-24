import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../appsscript/appsscript.json", import.meta.url), "utf8"));
const code = await readFile(new URL("../appsscript/Code.js", import.meta.url), "utf8");
const client = await readFile(new URL("../appsscript/Client.html", import.meta.url), "utf8");
const sidebar = await readFile(new URL("../appsscript/Sidebar.html", import.meta.url), "utf8");

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

console.log("Verified Apps Script permissions, read-only behavior, and generated UI bundle.");
