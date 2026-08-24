export const IMPORT_FIELDS = Object.freeze([
  { value: "", label: "Skip this column" },
  { value: "fullAddress", label: "Full address block" },
  { value: "type", label: "Label type" },
  { value: "name", label: "Name or organization" },
  { value: "subtitle", label: "Subtitle or role" },
  { value: "email", label: "Email address" },
  { value: "customText", label: "Custom label text" },
  { value: "address1", label: "Address line 1" },
  { value: "address2", label: "Address line 2" },
  { value: "city", label: "City" },
  { value: "state", label: "State or region" },
  { value: "postal", label: "ZIP or postal code" },
  { value: "country", label: "Country" },
]);

const aliases = Object.freeze({
  fullAddress: ["full address", "address block", "mailing address", "full mailing address"],
  type: ["type", "label type", "kind"],
  name: ["name", "recipient", "recipient name", "full name", "customer", "customer name", "contact", "contact name", "organization", "company", "company name"],
  subtitle: ["subtitle", "role", "job title", "title", "department"],
  email: ["email", "email address", "e mail"],
  customText: ["custom", "custom text", "label text", "message", "notes"],
  address1: ["address", "address 1", "address1", "street", "street address", "line 1", "address line 1"],
  address2: ["address 2", "address2", "suite", "unit", "line 2", "address line 2", "apartment"],
  city: ["city", "town", "locality"],
  state: ["state", "province", "region", "state province"],
  postal: ["zip", "zipcode", "zip code", "postal", "postal code", "postcode"],
  country: ["country", "country code"],
});

const normalize = (value) => String(value ?? "")
  .trim()
  .toLowerCase()
  .replace(/[_./-]+/g, " ")
  .replace(/\s+/g, " ");

const cellText = (value) => String(value ?? "").trim();
const rowHasValue = (row) => row.some((value) => cellText(value));

export function normalizeRows(inputRows) {
  const rows = (Array.isArray(inputRows) ? inputRows : [])
    .slice(0, 2001)
    .map((row) => (Array.isArray(row) ? row : [row]).slice(0, 100).map(cellText));
  while (rows.length && !rowHasValue(rows.at(-1))) rows.pop();
  const width = rows.reduce((maximum, row) => {
    let index = row.length - 1;
    while (index >= 0 && !cellText(row[index])) index -= 1;
    return Math.max(maximum, index + 1);
  }, 0);
  return rows.map((row) => Array.from({ length: width }, (_, index) => row[index] || ""));
}

export function transposeRows(inputRows) {
  const rows = normalizeRows(inputRows);
  const width = rows.reduce((maximum, row) => Math.max(maximum, row.length), 0);
  return normalizeRows(Array.from({ length: width }, (_, columnIndex) => rows.map((row) => row[columnIndex] || "")));
}

export function orientedRows(inputRows, orientation = "rows") {
  return orientation === "columns" ? transposeRows(inputRows) : normalizeRows(inputRows);
}

export function columnName(index) {
  let value = Number(index) + 1;
  let name = "";
  while (value > 0) {
    value -= 1;
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26);
  }
  return name;
}

export function fieldForHeader(header) {
  const value = normalize(header);
  return Object.entries(aliases).find(([, names]) => names.includes(value))?.[0] || null;
}

function headerScore(row) {
  const fields = new Set(row.map(fieldForHeader).filter(Boolean));
  return fields.size * 20 + Math.min(row.filter((value) => cellText(value)).length, 10);
}

export function detectHeaderRow(inputRows) {
  const rows = normalizeRows(inputRows).slice(0, 30);
  if (!rows.length) return -1;
  let best = rows.findIndex(rowHasValue);
  let score = best >= 0 ? headerScore(rows[best]) : -1;
  rows.forEach((row, index) => {
    const candidate = headerScore(row);
    if (candidate > score) {
      best = index;
      score = candidate;
    }
  });
  return best;
}

export function columnDescriptors(inputRows, headerRowIndex, firstDataRowIndex) {
  const rows = normalizeRows(inputRows);
  const width = rows.reduce((maximum, row) => Math.max(maximum, row.length), 0);
  return Array.from({ length: width }, (_, index) => {
    const header = headerRowIndex >= 0 ? cellText(rows[headerRowIndex]?.[index]) : "";
    const samples = [];
    for (let rowIndex = firstDataRowIndex; rowIndex < rows.length && samples.length < 2; rowIndex += 1) {
      const value = cellText(rows[rowIndex]?.[index]);
      if (value && !samples.includes(value)) samples.push(value);
    }
    return {
      index,
      reference: columnName(index),
      header,
      label: header || `Column ${columnName(index)}`,
      samples,
      suggestedField: fieldForHeader(header),
    };
  });
}

export function autoMapping(inputRows, headerRowIndex, firstDataRowIndex) {
  const used = new Set();
  return Object.fromEntries(columnDescriptors(inputRows, headerRowIndex, firstDataRowIndex).map((column) => {
    const field = column.suggestedField && !used.has(column.suggestedField) ? column.suggestedField : "";
    if (field) used.add(field);
    return [column.index, field];
  }));
}

export function createImportPlan(inputRows, orientation = "rows") {
  const rows = orientedRows(inputRows, orientation);
  const headerRowIndex = detectHeaderRow(rows);
  const firstDataRowIndex = Math.min(Math.max(0, headerRowIndex + 1), Math.max(0, rows.length - 1));
  return {
    orientation: orientation === "columns" ? "columns" : "rows",
    headerRowIndex,
    firstDataRowIndex,
    lastDataRowIndex: Math.max(firstDataRowIndex, rows.length - 1),
    mapping: autoMapping(rows, headerRowIndex, firstDataRowIndex),
  };
}

function normalizeType(value) {
  const type = normalize(value);
  if (["name", "name tag", "badge", "name badge"].includes(type)) return "name";
  if (["email", "email label"].includes(type)) return "email";
  if (["custom", "custom label", "text"].includes(type)) return "custom";
  if (["address", "shipping", "mailing", "postal"].includes(type)) return "address";
  return "";
}

function parseAddressBlock(value) {
  const lines = String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return {};
  const locality = lines.at(-1)?.match(/^(.+?),\s*([A-Za-z]{2,})\s+(\d{5}(?:-\d{4})?)$/);
  return {
    name: lines[0] || "",
    address1: lines[1] || "",
    address2: lines.length > 3 ? lines.slice(2, -1).join(", ") : "",
    city: locality?.[1] || "",
    state: locality?.[2] || "",
    postal: locality?.[3] || "",
  };
}

function labelFromValues(values) {
  const merged = { ...values };
  if (merged.fullAddress) {
    const block = parseAddressBlock(merged.fullAddress);
    ["name", "address1", "address2", "city", "state", "postal", "country"].forEach((field) => {
      if (!merged[field]) merged[field] = block[field] || "";
    });
  }
  delete merged.fullAddress;
  const type = normalizeType(merged.type)
    || (merged.email ? "email" : merged.customText ? "custom" : merged.address1 ? "address" : "name");
  delete merged.type;
  return { type, ...merged };
}

export function labelsFromTable(inputRows, plan) {
  const rows = orientedRows(inputRows, plan?.orientation);
  const mappedFields = Object.values(plan?.mapping || {}).filter(Boolean);
  if (!["fullAddress", "address1", "email", "name", "customText"].some((field) => mappedFields.includes(field))) {
    throw new Error("Map at least one name, address, email, full address, or custom text field.");
  }
  const labels = [];
  const first = Math.max(0, Number(plan.firstDataRowIndex) || 0);
  const last = Math.min(rows.length - 1, Math.max(first, Number(plan.lastDataRowIndex)));
  for (let rowIndex = first; rowIndex <= last && labels.length < 2000; rowIndex += 1) {
    const values = {};
    Object.entries(plan.mapping || {}).forEach(([columnIndex, field]) => {
      if (field && !values[field]) values[field] = cellText(rows[rowIndex]?.[Number(columnIndex)]);
    });
    const label = labelFromValues(values);
    if (label.name || label.address1 || label.city || label.postal || label.email || label.customText) labels.push(label);
  }
  if (!labels.length) throw new Error("No usable labels were found in those rows.");
  return labels;
}

export function labelLines(label) {
  if (label.type === "name") return [label.name, label.subtitle].filter(Boolean);
  if (label.type === "email") return [label.name, label.email].filter(Boolean);
  if (label.type === "custom") return String(label.customText || "").split(/\r?\n/).filter(Boolean).slice(0, 5);
  const locality = [label.city, label.state].filter(Boolean).join(", ");
  return [label.name, label.address1, label.address2, [locality, label.postal].filter(Boolean).join(" "), label.country].filter(Boolean);
}
