const LABELOO_CONNECTOR = "google-sheets";
const LABELOO_SERVICE_DEFAULT = "https://auth.wiplash.ai/labeloo";
const MAX_SOURCE_ROWS = 2001;
const MAX_SOURCE_COLUMNS = 100;
const MAX_SOURCE_CELLS = 200000;
const CONNECTOR_TOKEN_KEY = "labelooConnectorTokenV1";
const CONNECTOR_EXPIRES_KEY = "labelooConnectorExpiresV1";
const CONNECTOR_ACCOUNT_KEY = "labelooConnectorAccountV1";
const INITIAL_SOURCE_MODE_CACHE_KEY = "labelooInitialSourceModeV1";

function onOpen() {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem("Create labels from selected cells", "showLabelooSelectionSidebar")
    .addSeparator()
    .addItem("Open Labeloo label maker", "showLabelooSidebar")
    .addToUi();
}

function onInstall() {
  onOpen();
}

function showLabelooSidebar() {
  showLabelooSidebar_("");
}

function showLabelooSelectionSidebar() {
  showLabelooSidebar_("selection");
}

function showLabelooSidebar_(initialSourceMode) {
  const cache = CacheService.getUserCache();
  if (initialSourceMode) cache.put(INITIAL_SOURCE_MODE_CACHE_KEY, initialSourceMode, 60);
  else cache.remove(INITIAL_SOURCE_MODE_CACHE_KEY);
  const template = HtmlService.createTemplateFromFile("Sidebar");
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle("Labeloo"));
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getInitialContext() {
  const ranges = sourceRanges_();
  const selected = ranges.selection;
  const table = ranges.table;
  const cache = CacheService.getUserCache();
  const requestedMode = cache.get(INITIAL_SOURCE_MODE_CACHE_KEY) || "";
  cache.remove(INITIAL_SOURCE_MODE_CACHE_KEY);
  const defaultMode = requestedMode === "selection"
    ? "selection"
    : selected.getNumRows() * selected.getNumColumns() > 1
      ? "selection"
      : table.getNumRows() * table.getNumColumns() > 1 ? "table" : "sheet";
  return {
    connection: connectorState_(),
    sources: sourceOptions_(ranges),
    source: snapshotRange_(ranges[defaultMode], defaultMode),
  };
}

function loadSource(request) {
  const mode = String(request && request.mode || "selection");
  const ranges = sourceRanges_();
  let range = ranges[mode];
  if (mode === "custom") {
    const a1 = String(request && request.a1 || "").trim().toUpperCase();
    if (!/^[A-Z]+[1-9][0-9]*(?::[A-Z]+[1-9][0-9]*)?$/.test(a1)) {
      throw new Error("Enter a range such as A1:F50.");
    }
    range = SpreadsheetApp.getActiveSheet().getRange(a1);
  }
  if (!range) throw new Error("Choose a valid source range.");
  return {
    sources: sourceOptions_(ranges),
    source: snapshotRange_(range, mode),
  };
}

function sourceRanges_() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const selection = sheet.getActiveRange() || sheet.getRange("A1");
  let table = selection;
  try { table = selection.getCell(1, 1).getDataRegion(); } catch (_error) { /* Keep the selection. */ }
  return {
    selection: selection,
    table: table,
    sheet: sheet.getDataRange(),
  };
}

function sourceOptions_(ranges) {
  return [
    sourceOption_("selection", "Selected cells", ranges.selection),
    sourceOption_("table", "Surrounding table", ranges.table),
    sourceOption_("sheet", "Used sheet range", ranges.sheet),
    { mode: "custom", label: "Custom A1 range", range: "", rows: 0, columns: 0 },
  ];
}

function sourceOption_(mode, label, range) {
  return {
    mode: mode,
    label: label,
    range: range.getA1Notation(),
    rows: range.getNumRows(),
    columns: range.getNumColumns(),
  };
}

function snapshotRange_(range, mode) {
  const rows = range.getNumRows();
  const columns = range.getNumColumns();
  if (rows > MAX_SOURCE_ROWS || columns > MAX_SOURCE_COLUMNS || rows * columns > MAX_SOURCE_CELLS) {
    throw new Error("That range is too large to preview. Select at most 2,001 rows, 100 columns, and 200,000 cells.");
  }
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = range.getSheet();
  return {
    mode: mode,
    workbookName: spreadsheet.getName(),
    sheetName: sheet.getName(),
    range: range.getA1Notation(),
    rowCount: rows,
    columnCount: columns,
    rows: range.getDisplayValues(),
  };
}

function beginConnectorAuthorization() {
  return api_("/v1/auth/connector-authorizations", {
    method: "post",
    body: { connector: LABELOO_CONNECTOR },
  });
}

function pollConnectorAuthorization(request) {
  const payload = api_(`/v1/auth/connector-authorizations/${encodeURIComponent(request.authorizationId)}/exchange`, {
    method: "post",
    body: { connectorSecret: request.connectorSecret },
  });
  if (payload.status !== "connected") return payload;
  const properties = PropertiesService.getUserProperties();
  properties.setProperties({
    [CONNECTOR_TOKEN_KEY]: payload.credential.accessToken,
    [CONNECTOR_EXPIRES_KEY]: payload.credential.expiresAt,
    [CONNECTOR_ACCOUNT_KEY]: JSON.stringify(payload.account),
  });
  return connectorState_();
}

function createImportReceipt(request) {
  const credential = connectorCredential_();
  if (!credential) throw new Error("Connect Wiplash.ai before continuing to Labeloo.");
  try {
    return api_("/v1/import-receipts", {
      method: "post",
      token: credential.token,
      body: {
        source: request.source,
        labels: request.labels,
        destination: request.destination,
      },
    });
  } catch (error) {
    if (/reconnect|sign in|unauthorized/i.test(String(error && error.message))) clearConnector_();
    throw error;
  }
}

function disconnectConnector() {
  const credential = connectorCredential_();
  try {
    if (credential) api_("/v1/auth/connector-logout", { method: "post", token: credential.token, body: {} });
  } finally {
    clearConnector_();
  }
  return connectorState_();
}

function connectorCredential_() {
  const properties = PropertiesService.getUserProperties();
  const token = properties.getProperty(CONNECTOR_TOKEN_KEY) || "";
  const expiresAt = properties.getProperty(CONNECTOR_EXPIRES_KEY) || "";
  if (!/^loo_connector_[A-Za-z0-9_-]{43}$/.test(token) || Date.parse(expiresAt) <= Date.now()) {
    clearConnector_();
    return null;
  }
  let account = null;
  try { account = JSON.parse(properties.getProperty(CONNECTOR_ACCOUNT_KEY) || "null"); } catch (_error) { account = null; }
  return { token: token, expiresAt: expiresAt, account: account };
}

function connectorState_() {
  const credential = connectorCredential_();
  return credential
    ? { connected: true, expiresAt: credential.expiresAt, account: credential.account }
    : { connected: false };
}

function clearConnector_() {
  const properties = PropertiesService.getUserProperties();
  properties.deleteProperty(CONNECTOR_TOKEN_KEY);
  properties.deleteProperty(CONNECTOR_EXPIRES_KEY);
  properties.deleteProperty(CONNECTOR_ACCOUNT_KEY);
}

function serviceBase_() {
  const configured = String(
    PropertiesService.getScriptProperties().getProperty("LABELOO_SERVICE_BASE")
      || PropertiesService.getScriptProperties().getProperty("LABELLOO_SERVICE_BASE")
      || LABELOO_SERVICE_DEFAULT
  ).trim();
  const match = configured.match(/^https:\/\/([a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::([0-9]{1,5}))?(\/[^\s?#]*)?$/i);
  const port = match && match[2] ? Number(match[2]) : null;
  if (!match || match[1].includes("..") || (port !== null && (port < 1 || port > 65535))) {
    throw new Error("The Labeloo account service is not configured safely.");
  }
  return configured.replace(/\/+$/, "");
}

function api_(path, options) {
  const response = UrlFetchApp.fetch(`${serviceBase_()}${path}`, {
    method: options.method || "get",
    contentType: "application/json",
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : {},
    payload: options.body === undefined ? undefined : JSON.stringify(options.body),
    muteHttpExceptions: true,
  });
  const status = response.getResponseCode();
  let payload = {};
  try { payload = JSON.parse(response.getContentText() || "{}"); } catch (_error) { payload = {}; }
  if (status < 200 || status >= 300) {
    throw new Error(payload.message || `Labeloo returned ${status}.`);
  }
  return payload;
}
