import {
  IMPORT_FIELDS,
  autoMapping,
  columnDescriptors,
  createImportPlan,
  labelLines,
  labelsFromTable,
  orientedRows,
} from "./import-core.js";

const elements = Object.fromEntries([
  "app", "sourceMode", "customRangeWrap", "customRange", "loadCustomRange", "sourceSheet", "sourceRange",
  "sourceDimensions", "refreshSource", "headerRow", "firstRow", "lastRow", "mappingList", "mappingCount",
  "previewList", "previewCount", "previewMessage", "connectionMessage", "connectionActions", "connectionCode",
  "statusMessage", "fallbackLink", "continueButton", "stepHeading", "stepStatus", "stepHint", "backButton",
  "nextButton", "handoffCount", "handoffSource", "mappingMessage",
].map((id) => [id, document.getElementById(id)]));

const stepButtons = [...document.querySelectorAll("[data-step-target]")];
const stepPanels = [...document.querySelectorAll("[data-step]")];
const WORKFLOW_STEPS = Object.freeze([
  { heading: "Choose your rows.", hint: "Choose the range and record shape.", next: "Map fields" },
  { heading: "Match the fields.", hint: "Place each spreadsheet column.", next: "Preview labels" },
  { heading: "Check the labels.", hint: "Review exactly what will be sent.", next: "Connect & continue" },
  { heading: "Send to Labeloo.", hint: "Connect once, then open the editor.", next: "" },
]);

const state = {
  sources: [],
  source: null,
  plan: null,
  labels: [],
  connection: { connected: false },
  connectionBusy: false,
  busy: false,
  step: 0,
  maxStep: 0,
};

function callServer(method, payload) {
  return new Promise((resolve, reject) => {
    const runner = google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler((error) => reject(new Error(error?.message || String(error || "Google Apps Script could not complete that request."))));
    if (payload === undefined) runner[method]();
    else runner[method](payload);
  });
}

function setStatus(message, isError = false) {
  elements.statusMessage.textContent = message || "";
  elements.statusMessage.style.color = isError ? "#ffb8b3" : "";
}

function stepReady(step) {
  if (step === 0) return Boolean(state.source && state.plan);
  if (step === 1 || step === 2) return state.labels.length > 0;
  return true;
}

function renderWorkflow(focusHeading = false) {
  const active = WORKFLOW_STEPS[state.step];
  elements.stepHeading.textContent = active.heading;
  elements.stepStatus.textContent = `Step ${state.step + 1} of ${WORKFLOW_STEPS.length}`;
  elements.stepHint.textContent = active.hint;

  stepPanels.forEach((panel) => {
    panel.hidden = Number(panel.dataset.step) !== state.step;
  });
  stepButtons.forEach((button) => {
    const step = Number(button.dataset.stepTarget);
    const current = step === state.step;
    button.disabled = step > state.maxStep;
    button.classList.toggle("active", current);
    button.classList.toggle("complete", step < state.step);
    if (current) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });

  elements.backButton.disabled = state.step === 0;
  elements.nextButton.classList.toggle("hidden", state.step === WORKFLOW_STEPS.length - 1);
  elements.continueButton.classList.toggle("hidden", state.step !== WORKFLOW_STEPS.length - 1);
  if (state.step < WORKFLOW_STEPS.length - 1) {
    elements.nextButton.querySelector("span").textContent = active.next;
    elements.nextButton.disabled = !stepReady(state.step);
  }

  if (focusHeading) {
    document.scrollingElement?.scrollTo({ top: 0, behavior: "auto" });
    const heading = stepPanels[state.step]?.querySelector("h2");
    requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
  }
}

function setStep(nextStep, { unlock = false, focus = true } = {}) {
  const next = Math.max(0, Math.min(WORKFLOW_STEPS.length - 1, Number(nextStep) || 0));
  if (unlock) state.maxStep = Math.max(state.maxStep, next);
  if (next > state.maxStep) return;
  state.step = next;
  renderWorkflow(focus);
}

function advanceStep() {
  if (!stepReady(state.step)) {
    const message = state.step === 1
      ? elements.mappingMessage.textContent || "Map at least one usable label field before previewing."
      : "Finish this step before continuing.";
    setStatus(message, true);
    return;
  }
  setStatus("");
  setStep(state.step + 1, { unlock: true });
}

function option(value, label) {
  const item = document.createElement("option");
  item.value = String(value);
  item.textContent = label;
  return item;
}

function replaceOptions(select, options, selected) {
  select.replaceChildren(...options.map((entry) => option(entry.value, entry.label)));
  select.value = String(selected);
}

function rowSummary(row) {
  const summary = (row || []).filter(Boolean).slice(0, 2).join(" · ");
  return summary.length > 34 ? `${summary.slice(0, 31)}…` : summary;
}

function sourceLabel(source) {
  if (source.mode === "custom") return source.label;
  return `${source.label} · ${source.range} · ${source.rows}×${source.columns}`;
}

function renderSources() {
  replaceOptions(elements.sourceMode, state.sources.map((source) => ({ value: source.mode, label: sourceLabel(source) })), state.source.mode);
  elements.customRangeWrap.classList.toggle("hidden", state.source.mode !== "custom" && elements.sourceMode.value !== "custom");
  elements.sourceSheet.textContent = `${state.source.workbookName} / ${state.source.sheetName}`;
  elements.sourceRange.textContent = state.source.range;
  elements.sourceDimensions.textContent = `${state.source.rowCount} rows · ${state.source.columnCount} columns · displayed values only`;
  elements.handoffSource.textContent = `${state.source.workbookName} / ${state.source.sheetName} · ${state.source.range}`;
}

function axisRows() {
  return orientedRows(state.source.rows, state.plan.orientation);
}

function structureOptions(rows) {
  const axis = state.plan.orientation === "columns" ? "Column" : "Row";
  return rows.map((row, index) => ({ value: index, label: `${axis} ${index + 1}${rowSummary(row) ? ` · ${rowSummary(row)}` : " · empty"}` }));
}

function renderStructure() {
  const rows = axisRows();
  const options = structureOptions(rows);
  const axis = state.plan.orientation === "columns" ? "column" : "row";
  replaceOptions(elements.headerRow, [{ value: -1, label: `No header ${axis}` }, ...options], state.plan.headerRowIndex);
  replaceOptions(elements.firstRow, options, state.plan.firstDataRowIndex);
  replaceOptions(elements.lastRow, options.filter((entry) => Number(entry.value) >= state.plan.firstDataRowIndex), state.plan.lastDataRowIndex);
  document.querySelectorAll("[data-orientation]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.orientation === state.plan.orientation);
  });
}

function renderMapping() {
  const rows = axisRows();
  const columns = columnDescriptors(rows, state.plan.headerRowIndex, state.plan.firstDataRowIndex)
    .filter((column) => column.header || column.samples.length || state.plan.mapping[column.index]);
  elements.mappingList.replaceChildren();
  columns.forEach((column) => {
    const record = document.createElement("article");
    record.className = "mapping-row";

    const source = document.createElement("div");
    source.className = "mapping-source";
    const reference = document.createElement("span");
    reference.className = "column-reference";
    reference.textContent = column.reference;
    const copy = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = column.label;
    const sample = document.createElement("small");
    sample.textContent = column.samples.length ? column.samples.join(" · ") : "No sample values";
    copy.append(heading, sample);
    source.append(reference, copy);

    const select = document.createElement("select");
    select.setAttribute("aria-label", `Place ${column.label} in Labeloo`);
    select.replaceChildren(...IMPORT_FIELDS.map((field) => option(field.value, field.label)));
    select.value = state.plan.mapping[column.index] || "";
    select.addEventListener("change", () => {
      const field = select.value;
      if (field) {
        Object.keys(state.plan.mapping).forEach((sourceIndex) => {
          if (sourceIndex !== String(column.index) && state.plan.mapping[sourceIndex] === field) state.plan.mapping[sourceIndex] = "";
        });
      }
      state.plan.mapping[column.index] = field;
      renderMappingAndPreview();
    });
    record.append(source, select);
    elements.mappingList.append(record);
  });
  const count = Object.values(state.plan.mapping).filter(Boolean).length;
  elements.mappingCount.textContent = `${count} mapped`;
}

function renderPreview() {
  elements.previewList.replaceChildren();
  elements.previewMessage.textContent = "";
  elements.mappingMessage.textContent = "";
  try {
    state.labels = labelsFromTable(state.source.rows, state.plan);
    state.labels.slice(0, 3).forEach((label, index) => {
      const card = document.createElement("article");
      card.className = "preview-label";
      card.dataset.index = String(index + 1).padStart(2, "0");
      labelLines(label).slice(0, 5).forEach((line, lineIndex) => {
        const text = document.createElement(lineIndex === 0 ? "strong" : "span");
        text.textContent = line;
        card.append(text);
      });
      elements.previewList.append(card);
    });
    if (state.labels.length > 3) {
      const more = document.createElement("p");
      more.className = "preview-more";
      more.textContent = `+ ${state.labels.length - 3} more ready for Labeloo`;
      elements.previewList.append(more);
    }
    elements.previewCount.textContent = `${state.labels.length} ready`;
    elements.handoffCount.textContent = `${state.labels.length} label${state.labels.length === 1 ? "" : "s"}`;
  } catch (error) {
    state.labels = [];
    elements.previewCount.textContent = "0 ready";
    elements.handoffCount.textContent = "0 labels";
    elements.previewMessage.textContent = error.message;
    elements.mappingMessage.textContent = error.message;
    if (state.maxStep > 1) state.maxStep = 1;
    if (state.step > 1) state.step = 1;
  }
  updateContinue();
  renderWorkflow();
}

function renderMappingAndPreview() {
  renderMapping();
  renderPreview();
}

function useSource(result) {
  state.sources = result.sources;
  state.source = result.source;
  state.plan = createImportPlan(state.source.rows);
  state.step = 0;
  state.maxStep = 0;
  renderSources();
  renderStructure();
  renderMappingAndPreview();
  renderWorkflow();
}

async function loadSource(mode, a1 = "") {
  setStatus("Reading the selected cells…");
  elements.refreshSource.disabled = true;
  try {
    useSource(await callServer("loadSource", { mode, a1 }));
    setStatus("");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    elements.refreshSource.disabled = false;
  }
}

function renderConnection() {
  elements.connectionActions.replaceChildren();
  elements.connectionCode.classList.add("hidden");
  if (state.connection.connected) {
    const account = document.createElement("p");
    account.className = "connection-account";
    account.textContent = `Connected as ${state.connection.account?.email || "your Wiplash.ai account"}`;
    const disconnect = document.createElement("button");
    disconnect.className = "button button--quiet button--small";
    disconnect.type = "button";
    disconnect.disabled = state.connectionBusy;
    disconnect.textContent = state.connectionBusy ? "Disconnecting…" : "Disconnect";
    disconnect.addEventListener("click", disconnectConnection);
    elements.connectionActions.append(account, disconnect);
    elements.connectionMessage.textContent = "Saved for this Google account until it expires or you disconnect. Only mapped labels can be sent; this connector cannot read your Labeloo projects or Google Drive.";
  } else {
    const connect = document.createElement("button");
    connect.className = "button button--primary";
    connect.type = "button";
    connect.disabled = state.connectionBusy;
    connect.textContent = state.connectionBusy ? "Connecting…" : "Connect Wiplash.ai";
    connect.addEventListener("click", startConnection);
    elements.connectionActions.append(connect);
    elements.connectionMessage.textContent = state.connectionBusy
      ? "Confirm the short code in the Wiplash.ai tab. You can return here when it says connected."
      : "Connect once on this Google account, then reuse the saved connection for future imports.";
  }
  updateContinue();
  renderWorkflow();
}

function showConnectionCode(pending) {
  elements.connectionCode.replaceChildren();
  elements.connectionCode.classList.remove("hidden");
  const copy = document.createTextNode("Confirm this code in Wiplash.ai");
  const code = document.createElement("strong");
  code.textContent = pending.userCode;
  const link = document.createElement("a");
  link.href = pending.verificationUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Open the connection page";
  elements.connectionCode.append(copy, code, link);
}

async function startConnection() {
  if (state.connectionBusy) return;
  const prepared = window.open("about:blank", "labeloo-connect");
  state.connectionBusy = true;
  renderConnection();
  setStatus("Starting the secure Wiplash.ai connection…");
  try {
    const pending = await callServer("beginConnectorAuthorization");
    showConnectionCode(pending);
    if (prepared && !prepared.closed) prepared.location.href = pending.verificationUrl;
    const expiresAt = Date.parse(pending.expiresAt);
    while (Date.now() < expiresAt) {
      await new Promise((resolve) => setTimeout(resolve, Math.max(1000, Number(pending.pollIntervalMs || 2000))));
      const result = await callServer("pollConnectorAuthorization", {
        authorizationId: pending.authorizationId,
        connectorSecret: pending.connectorSecret,
      });
      if (!result.connected) continue;
      state.connection = result;
      setStatus("Wiplash.ai connected.");
      return;
    }
    throw new Error("That connection expired. Try again.");
  } catch (error) {
    if (prepared && !prepared.closed) prepared.close();
    state.connection = { connected: false };
    setStatus(error.message, true);
  } finally {
    state.connectionBusy = false;
    renderConnection();
  }
}

async function disconnectConnection() {
  if (state.connectionBusy) return;
  state.connectionBusy = true;
  renderConnection();
  setStatus("Disconnecting…");
  try {
    state.connection = await callServer("disconnectConnector");
    setStatus("Connector disconnected.");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    state.connectionBusy = false;
    renderConnection();
  }
}

function updateContinue() {
  elements.continueButton.disabled = state.busy || state.connectionBusy || !state.labels.length || !state.connection.connected;
}

async function createHandoff() {
  if (!state.labels.length || !state.connection.connected || state.busy) return;
  const prepared = window.open("about:blank", "labeloo-editor");
  state.busy = true;
  updateContinue();
  elements.fallbackLink.classList.add("hidden");
  setStatus(`Preparing ${state.labels.length} label${state.labels.length === 1 ? "" : "s"}…`);
  try {
    const receipt = await callServer("createImportReceipt", {
      source: {
        workbookName: state.source.workbookName,
        sheetName: state.source.sheetName,
        range: state.source.range,
      },
      labels: state.labels,
    });
    elements.fallbackLink.href = receipt.importUrl;
    elements.fallbackLink.classList.remove("hidden");
    if (prepared && !prepared.closed) prepared.location.href = receipt.importUrl;
    setStatus("Labeloo is opening in a new tab.");
  } catch (error) {
    if (prepared && !prepared.closed) prepared.close();
    setStatus(error.message, true);
    if (/connect|sign in/i.test(error.message)) {
      state.connection = { connected: false };
      renderConnection();
    }
  } finally {
    state.busy = false;
    updateContinue();
  }
}

elements.sourceMode.addEventListener("change", () => {
  const mode = elements.sourceMode.value;
  elements.customRangeWrap.classList.toggle("hidden", mode !== "custom");
  if (mode !== "custom") void loadSource(mode);
});
elements.loadCustomRange.addEventListener("click", () => loadSource("custom", elements.customRange.value));
elements.customRange.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    void loadSource("custom", elements.customRange.value);
  }
});
elements.refreshSource.addEventListener("click", () => loadSource(elements.sourceMode.value, elements.customRange.value));
document.querySelectorAll("[data-orientation]").forEach((button) => button.addEventListener("click", () => {
  state.plan = createImportPlan(state.source.rows, button.dataset.orientation);
  renderStructure();
  renderMappingAndPreview();
}));
elements.headerRow.addEventListener("change", () => {
  const rows = axisRows();
  state.plan.headerRowIndex = Number(elements.headerRow.value);
  if (state.plan.headerRowIndex >= state.plan.firstDataRowIndex) {
    state.plan.firstDataRowIndex = Math.min(rows.length - 1, state.plan.headerRowIndex + 1);
  }
  state.plan.lastDataRowIndex = Math.max(state.plan.firstDataRowIndex, state.plan.lastDataRowIndex);
  state.plan.mapping = autoMapping(rows, state.plan.headerRowIndex, state.plan.firstDataRowIndex);
  renderStructure();
  renderMappingAndPreview();
});
elements.firstRow.addEventListener("change", () => {
  state.plan.firstDataRowIndex = Number(elements.firstRow.value) || 0;
  state.plan.lastDataRowIndex = Math.max(state.plan.firstDataRowIndex, state.plan.lastDataRowIndex);
  renderStructure();
  renderMappingAndPreview();
});
elements.lastRow.addEventListener("change", () => {
  state.plan.lastDataRowIndex = Number(elements.lastRow.value);
  renderPreview();
});
stepButtons.forEach((button) => button.addEventListener("click", () => {
  setStep(Number(button.dataset.stepTarget));
}));
elements.backButton.addEventListener("click", () => setStep(state.step - 1));
elements.nextButton.addEventListener("click", advanceStep);
elements.continueButton.addEventListener("click", createHandoff);

async function initialize() {
  try {
    const initial = await callServer("getInitialContext");
    state.connection = initial.connection || { connected: false };
    useSource(initial);
    renderConnection();
    elements.app.setAttribute("aria-busy", "false");
    renderWorkflow();
    setStatus("");
  } catch (error) {
    elements.app.setAttribute("aria-busy", "false");
    setStatus(error.message, true);
  }
}

void initialize();
