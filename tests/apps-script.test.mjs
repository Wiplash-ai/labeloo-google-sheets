import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const code = await readFile(new URL("../appsscript/Code.js", import.meta.url), "utf8");

function evaluateServiceBase(configured) {
  const values = configured && typeof configured === "object"
    ? configured
    : { LABELOO_SERVICE_BASE: configured };
  const context = {
    PropertiesService: {
      getScriptProperties() {
        return {
          getProperty(key) {
            return values[key] ?? null;
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
  assert.equal(
    evaluateServiceBase({ LABELLOO_SERVICE_BASE: "https://auth.wiplash.ai/labeloo/" }),
    "https://auth.wiplash.ai/labeloo",
    "The corrected property name must retain backward compatibility with the legacy typo.",
  );
  assert.equal(
    evaluateServiceBase({
      LABELOO_SERVICE_BASE: "https://auth.wiplash.ai/labeloo",
      LABELLOO_SERVICE_BASE: "https://auth.wiplash.ai/legacy",
    }),
    "https://auth.wiplash.ai/labeloo",
    "The correctly spelled property must take precedence.",
  );
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
