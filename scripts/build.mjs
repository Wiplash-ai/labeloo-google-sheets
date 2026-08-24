import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");
const output = path.join(root, "appsscript");

await mkdir(output, { recursive: true });
const client = await build({
  entryPoints: [path.join(source, "client.js")],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: false,
  logLevel: "warning",
});

const clientCode = client.outputFiles[0].text;
const styles = await readFile(path.join(source, "styles.css"), "utf8");
const sidebar = await readFile(path.join(source, "sidebar.html"), "utf8");

await Promise.all([
  writeFile(path.join(output, "Client.html"), `<script>\n${clientCode}</script>\n`),
  writeFile(path.join(output, "Stylesheet.html"), `<style>\n${styles}</style>\n`),
  writeFile(path.join(output, "Sidebar.html"), sidebar),
]);

console.log("Built the Labeloo Google Sheets Apps Script bundle.");
