import test from "node:test";
import assert from "node:assert/strict";
import {
  createImportPlan,
  labelsFromTable,
  orientedRows,
} from "../src/import-core.js";

const fundraiserRows = [
  ["Fundraiser Checks — Mailing List", "", "", "", ""],
  ["", "", "", "", ""],
  ["Name", "Address", "City", "State", "ZIP"],
  ["Alex Rivera", "123 Splash Lane", "Fort Worth", "TX", "76102"],
  ["Wiplash Labs", "44 Signal Street", "Austin", "TX", "78701"],
  ["Sample Recipient", "18 Paper Trail", "Denver", "CO", "80202"],
];

test("Sheets mapping detects a buried header and produces Labeloo address records", () => {
  const plan = createImportPlan(fundraiserRows);
  assert.equal(plan.headerRowIndex, 2);
  assert.equal(plan.firstDataRowIndex, 3);
  assert.deepEqual(plan.mapping, { 0: "name", 1: "address1", 2: "city", 3: "state", 4: "postal" });
  const labels = labelsFromTable(fundraiserRows, plan);
  assert.deepEqual(labels.map((label) => label.name), ["Alex Rivera", "Wiplash Labs", "Sample Recipient"]);
  assert.equal(labels[1].type, "address");
  assert.equal(labels[1].postal, "78701");
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
