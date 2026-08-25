import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const code = await readFile(new URL("../appsscript/Code.js", import.meta.url), "utf8");

function evaluateServiceBase(configured) {
  const context = {
    PropertiesService: {
      getScriptProperties() {
        return {
          getProperty() {
            return configured ?? null;
          },
        };
      },
    },
  };
  return vm.runInNewContext(`${code}\nserviceBase_()`, context);
}

test("Apps Script service URL validation works without the browser URL global", () => {
  assert.equal(evaluateServiceBase(null), "https://auth.wiplash.ai/labeloo");
  assert.equal(evaluateServiceBase("https://auth.wiplash.ai/labeloo/"), "https://auth.wiplash.ai/labeloo");
});

test("Apps Script service URL validation rejects unsafe endpoints", () => {
  for (const endpoint of [
    "http://auth.wiplash.ai/labeloo",
    "https://user:secret@auth.wiplash.ai/labeloo",
    "https://auth.wiplash.ai/labeloo?debug=true",
    "https://auth.wiplash.ai/labeloo#debug",
    "https://auth..wiplash.ai/labeloo",
    "https://auth.wiplash.ai:70000/labeloo",
  ]) {
    assert.throws(() => evaluateServiceBase(endpoint), /not configured safely/);
  }
});
