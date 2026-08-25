import test from "node:test";
import assert from "node:assert/strict";
import {
  autoMapping,
  createImportPlan,
  labelsFromTable,
  normalizeRows,
  orientedRows,
} from "../src/import-core.js";

const fundraiserRows = [
  ["Fundraiser Checks — Mailing List", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["Name", "Address", "City", "State", "ZIP", "Email"],
  ["Alex Rivera", "123 Splash Lane", "Fort Worth", "TX", "76102", "alex@example.com"],
  ["Wiplash Labs", "44 Signal Street", "Austin", "TX", "78701", "hello@wiplash.ai"],
  ["Sample Recipient", "18 Paper Trail", "Denver", "CO", "80202", "sample@example.com"],
];

test("Sheets mapping detects a buried header and produces Labeloo address records", () => {
  const plan = createImportPlan(fundraiserRows);
  assert.equal(plan.headerRowIndex, 2);
  assert.equal(plan.firstDataRowIndex, 3);
  assert.deepEqual(plan.mapping, { 0: "name", 1: "address1", 2: "city", 3: "state", 4: "postal", 5: "email" });
  const labels = labelsFromTable(fundraiserRows, plan);
  assert.deepEqual(labels.map((label) => label.name), ["Alex Rivera", "Wiplash Labs", "Sample Recipient"]);
  assert.equal(labels[1].type, "address");
  assert.equal(labels[1].postal, "78701");
  assert.equal(labels[1].email, "hello@wiplash.ai");
});

test("first and last row controls bound the records transferred to Labeloo", () => {
  const plan = createImportPlan(fundraiserRows);
  plan.firstDataRowIndex = 4;
  plan.lastDataRowIndex = 4;
  const labels = labelsFromTable(fundraiserRows, plan);
  assert.deepEqual(labels.map((label) => label.name), ["Wiplash Labs"]);
});

test("column-oriented tables transpose before mapping", () => {
  const columns = [
    ["Name", "Alex Rivera", "Wiplash Labs"],
    ["Email", "alex@example.com", "hello@wiplash.ai"],
  ];
  const plan = createImportPlan(columns, "columns");
  const rows = orientedRows(columns, "columns");
  assert.deepEqual(rows[0], ["Name", "Email"]);
  assert.deepEqual(labelsFromTable(columns, plan).map((label) => label.email), ["alex@example.com", "hello@wiplash.ai"]);
});

test("a headerless table can be mapped explicitly without dropping the first label", () => {
  const rows = [
    ["Alex Rivera", "123 Splash Lane", "Fort Worth", "TX", "76102"],
    ["Wiplash Labs", "44 Signal Street", "Austin", "TX", "78701"],
  ];
  const plan = {
    orientation: "rows",
    headerRowIndex: -1,
    firstDataRowIndex: 0,
    lastDataRowIndex: 1,
    mapping: { 0: "name", 1: "address1", 2: "city", 3: "state", 4: "postal" },
  };
  assert.deepEqual(labelsFromTable(rows, plan).map((label) => label.name), ["Alex Rivera", "Wiplash Labs"]);
});

test("blank rows are ignored inside a selected data range", () => {
  const rows = [
    ["Name", "Email"],
    ["Alex Rivera", "alex@example.com"],
    ["", ""],
    ["Wiplash Labs", "hello@wiplash.ai"],
  ];
  const plan = createImportPlan(rows);
  assert.deepEqual(labelsFromTable(rows, plan).map((label) => label.email), ["alex@example.com", "hello@wiplash.ai"]);
});

test("a multiline full address block is split into Labeloo address fields", () => {
  const rows = [
    ["Mailing Address"],
    ["Alex Rivera\n123 Splash Lane\nFort Worth, TX 76102"],
  ];
  const plan = createImportPlan(rows);
  const [label] = labelsFromTable(rows, plan);
  assert.deepEqual(label, {
    type: "address",
    name: "Alex Rivera",
    address1: "123 Splash Lane",
    address2: "",
    city: "Fort Worth",
    state: "TX",
    postal: "76102",
    country: "",
  });
});

test("automatic mapping never assigns the same destination field twice", () => {
  const rows = [
    ["Name", "Recipient Name", "Address", "City"],
    ["Alex Rivera", "Backup Name", "123 Splash Lane", "Fort Worth"],
  ];
  const mapping = Object.values(autoMapping(rows, 0, 1)).filter(Boolean);
  assert.equal(new Set(mapping).size, mapping.length);
  assert.deepEqual(mapping, ["name", "address1", "city"]);
});

test("an import must map at least one usable Labeloo field", () => {
  const rows = [["Internal ID"], ["FR-001"]];
  const plan = createImportPlan(rows);
  assert.throws(() => labelsFromTable(rows, plan), /Map at least one/);
});

test("normalization bounds a source to the documented Apps Script limits", () => {
  const oversized = Array.from({ length: 2050 }, (_, row) => Array.from({ length: 110 }, (_, column) => `${row}:${column}`));
  const normalized = normalizeRows(oversized);
  assert.equal(normalized.length, 2001);
  assert.equal(normalized[0].length, 100);
});
