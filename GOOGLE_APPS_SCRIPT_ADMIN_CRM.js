/**
 * Admin CRM Storage API for Google Sheets
 *
 * Tabs required in sheet:
 * 1) Customers
 * 2) Quotations
 * 3) Invoices
 *
 * Columns in each tab:
 * A: IndexNo
 * B: Data (JSON string)
 *
 * Deploy:
 * - Extensions > Apps Script
 * - Paste this file
 * - Deploy > New Deployment > Web App
 * - Execute as: Me
 * - Access: Anyone
 * - Copy URL and set in VITE_ADMIN_CRM_SHEETS_ENDPOINT
 */

const CRM_SHEETS = ["Customers", "Quotations", "Invoices"];
const SHARED_TOKEN = "CHANGE_ME_ADMIN_TOKEN";

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    if (!isAuthorized(payload)) {
      return jsonResponse({ success: false, message: "Unauthorized" });
    }

    const action = payload.action;
    const entity = payload.entity;

    if (!CRM_SHEETS.includes(entity)) {
      return jsonResponse({ success: false, message: "Invalid entity" });
    }

    ensureSheetHeaders(entity);

    if (action === "getAll") {
      return jsonResponse({ success: true, rows: getAllRows(entity) });
    }

    if (action === "upsert") {
      if (!payload.indexNo || typeof payload.data !== "string") {
        return jsonResponse({ success: false, message: "indexNo and data are required" });
      }

      upsertRow(entity, String(payload.indexNo), payload.data);
      return jsonResponse({ success: true });
    }

    if (action === "delete") {
      if (!payload.indexNo) {
        return jsonResponse({ success: false, message: "indexNo is required" });
      }

      deleteRow(entity, String(payload.indexNo));
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, message: "Unsupported action" });
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

function doGet() {
  return jsonResponse({ success: true, message: "Admin CRM API is running" });
}

function isAuthorized(payload) {
  if (!SHARED_TOKEN) {
    return true;
  }

  return payload && payload.token === SHARED_TOKEN;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  return sheet;
}

function ensureSheetHeaders(sheetName) {
  const sheet = getSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["IndexNo", "Data"]);
    sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function getAllRows(sheetName) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();

  return values
    .filter((row) => row[0] && row[1])
    .map((row) => ({
      indexNo: String(row[0]),
      data: String(row[1]),
    }));
}

function upsertRow(sheetName, indexNo, data) {
  const sheet = getSheet(sheetName);
  const rowNumber = findRowByIndexNo(sheet, indexNo);

  if (rowNumber > 0) {
    sheet.getRange(rowNumber, 2).setValue(data);
    return;
  }

  sheet.appendRow([indexNo, data]);
}

function deleteRow(sheetName, indexNo) {
  const sheet = getSheet(sheetName);
  const rowNumber = findRowByIndexNo(sheet, indexNo);

  if (rowNumber > 0) {
    sheet.deleteRow(rowNumber);
  }
}

function findRowByIndexNo(sheet, indexNo) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return -1;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === indexNo) {
      return i + 2;
    }
  }

  return -1;
}
