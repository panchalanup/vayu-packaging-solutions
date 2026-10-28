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
 *
 * 3D Box Designer enquiries (tab "DesignerEnquiries", created automatically):
 * - api/quote.ts posts { action: "designerLead", entity: "DesignerEnquiries", indexNo, data } for every
 *   "Send my design to Vayu" enquiry. The row is stored like the other entities (IndexNo + JSON), the owner gets a
 *   notification email (with the preview image) and the customer, if they gave an email, gets a thank-you.
 * - sendDesignerFollowUps() runs daily (install once with installDesignerFollowUpTrigger) and emails customers whose
 *   enquiry is still "new" after FOLLOW_UP_AFTER_HOURS, once.
 * - Owner steps are in docs/3D-Model-page/BOX_DESIGNER_IMPLEMENTATION_PLAN.md section 4.B.
 */

const CRM_SHEETS = ["Customers", "Quotations", "Invoices", "DesignerEnquiries"];
const SHARED_TOKEN = "CHANGE_ME_ADMIN_TOKEN";
// Inbox that receives designer enquiry notifications (CONTACT_INFO.email in src/constants)
const OWNER_EMAIL = "vayu.packagingsolutions@gmail.com";
const COMPANY_NAME = "Vayu Packaging Solutions";
// WhatsApp number used in customer emails (CONTACT_INFO.phone, digits only)
const WHATSAPP_NUMBER = "918511658600";
const FOLLOW_UP_AFTER_HOURS = 48;

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

    if (action === "designerLead") {
      if (entity !== "DesignerEnquiries" || !payload.indexNo || typeof payload.data !== "string") {
        return jsonResponse({ success: false, message: "indexNo and data are required" });
      }
      upsertRow(entity, String(payload.indexNo), payload.data);
      notifyDesignerLead(payload.data);
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

/* ========================================
 * 3D Box Designer enquiries
 * ======================================== */

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function enquirySummary(lead) {
  const s = lead.spec || {};
  return [
    "Style: " + s.style,
    "Inside size: " + s.l + " x " + s.w + " x " + s.h + " mm",
    "Board: " + s.ply + ", " + s.flutes + " flute",
    "Colour: " + s.colour + " (" + s.finish + ")",
    "Artwork: " + s.images + " image(s), " + s.texts + " text(s)",
    "Quantity: " + lead.quantity,
    "Delivery to: " + (lead.place || "not given"),
    "Sample requested: " + (lead.sample ? "yes" : "no"),
    lead.estimate ? "Indicative estimate: Rs " + lead.estimate.low + " - " + lead.estimate.high + " per box" : "",
    lead.note ? "Notes: " + lead.note : "",
  ].filter(Boolean);
}

function previewBlob(lead) {
  const match = /^data:image\/(png|jpeg);base64,(.+)$/.exec(lead.preview || "");
  if (!match) return null;
  return Utilities.newBlob(Utilities.base64Decode(match[2]), "image/" + match[1], "box-preview." + (match[1] === "png" ? "png" : "jpg"));
}

function notifyDesignerLead(json) {
  let lead;
  try {
    lead = JSON.parse(json);
  } catch (e) {
    return;
  }
  const lines = enquirySummary(lead);
  const blob = previewBlob(lead);
  const attachments = blob ? [blob] : [];

  try {
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: "New 3D designer enquiry " + lead.id + " - " + lead.name,
      htmlBody:
        "<p><b>" + escapeHtml(lead.name) + "</b> · " + escapeHtml(lead.phone) + (lead.email ? " · " + escapeHtml(lead.email) : "") + "</p>" +
        "<p>" + lines.map(escapeHtml).join("<br>") + "</p>" +
        (lead.shareUrl ? '<p><a href="' + escapeHtml(lead.shareUrl) + '">Open the design</a></p>' : "") +
        "<p>Status and follow-up: Admin portal &gt; Designer enquiries.</p>",
      attachments: attachments,
    });
  } catch (e) {
    Logger.log("Owner email failed: " + e);
  }

  if (lead.email) {
    try {
      MailApp.sendEmail({
        to: lead.email,
        replyTo: OWNER_EMAIL,
        name: COMPANY_NAME,
        subject: "We have your box design - " + COMPANY_NAME,
        htmlBody:
          "<p>Hi " + escapeHtml(String(lead.name).split(" ")[0]) + ",</p>" +
          "<p>Thanks for sending your box design. We will check the size, board and print and send you a firm quote shortly.</p>" +
          "<p>" + lines.map(escapeHtml).join("<br>") + "</p>" +
          (lead.shareUrl ? '<p><a href="' + escapeHtml(lead.shareUrl) + '">Open your design</a></p>' : "") +
          "<p>Prices shown in the designer are indicative. Questions? Reply to this email or WhatsApp us: " +
          '<a href="https://wa.me/' + WHATSAPP_NUMBER + '">wa.me/' + WHATSAPP_NUMBER + "</a></p>" +
          "<p>" + COMPANY_NAME + "</p>",
        attachments: attachments,
      });
    } catch (e) {
      Logger.log("Customer email failed: " + e);
    }
  }
}

/** Daily: one friendly follow-up for enquiries still "new" after FOLLOW_UP_AFTER_HOURS */
function sendDesignerFollowUps() {
  const sheet = getSheet("DesignerEnquiries");
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const now = new Date();

  for (let i = 0; i < values.length; i++) {
    let lead;
    try {
      lead = JSON.parse(values[i][1]);
    } catch (e) {
      continue;
    }
    if (!lead || !lead.email || lead.status !== "new" || lead.followUpSentAt) continue;
    const ageHours = (now.getTime() - new Date(lead.createdAt).getTime()) / 36e5;
    if (!(ageHours >= FOLLOW_UP_AFTER_HOURS)) continue;

    try {
      MailApp.sendEmail({
        to: lead.email,
        replyTo: OWNER_EMAIL,
        name: COMPANY_NAME,
        subject: "Your box design - anything we can help with?",
        htmlBody:
          "<p>Hi " + escapeHtml(String(lead.name).split(" ")[0]) + ",</p>" +
          "<p>Following up on the box you designed with us (" + escapeHtml(lead.spec.l + " x " + lead.spec.w + " x " + lead.spec.h) +
          " mm, " + escapeHtml(lead.spec.ply) + ", " + escapeHtml(lead.quantity) + " boxes).</p>" +
          "<p>If you would like a sample, a change to the size or board, or a call back, just reply to this email or WhatsApp us: " +
          '<a href="https://wa.me/' + WHATSAPP_NUMBER + '">wa.me/' + WHATSAPP_NUMBER + "</a>.</p>" +
          (lead.shareUrl ? '<p><a href="' + escapeHtml(lead.shareUrl) + '">Open your design</a></p>' : "") +
          "<p>" + COMPANY_NAME + "</p>",
      });
      lead.followUpSentAt = now.toISOString();
      sheet.getRange(i + 2, 2).setValue(JSON.stringify(lead));
    } catch (e) {
      Logger.log("Follow-up failed for " + lead.id + ": " + e);
    }
  }
}

/** Run once from the editor: installs the daily follow-up trigger (removes old copies first) */
function installDesignerFollowUpTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "sendDesignerFollowUps")
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("sendDesignerFollowUps").timeBased().everyDays(1).atHour(10).create();
}
