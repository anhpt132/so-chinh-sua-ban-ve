/**
 * Sổ chỉnh sửa bản vẽ — backend Google Sheets (Google Apps Script)
 * Dán toàn bộ file này vào Extensions → Apps Script của Google Sheet,
 * rồi Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 */

// Mã truy cập dùng chung cho cả nhóm. Để trống "" nếu không cần mã.
const ACCESS_KEY = "";

const SHEET_NAME = "revisions";
const HEADERS = ["id", "code", "name", "disc", "rev", "date", "desc", "reason",
                 "reqBy", "editor", "status", "note", "createdAt", "updatedAt"];
const TZ = "Asia/Ho_Chi_Minh";

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!checkKey_(p.key)) return out_({ ok: false, error: "bad_key" });
  try {
    return out_({ ok: true, rows: readRows_(getSheet_()) });
  } catch (err) {
    return out_({ ok: false, error: "server", message: String(err) });
  }
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || "{}"); }
  catch (err) { return out_({ ok: false, error: "bad_request" }); }
  if (!checkKey_(body.key)) return out_({ ok: false, error: "bad_key" });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = getSheet_();
    if (body.action === "upsert") return out_({ ok: true, row: upsert_(sh, body.row || {}) });
    if (body.action === "delete") { deleteRow_(sh, String(body.id || "")); return out_({ ok: true }); }
    return out_({ ok: false, error: "bad_request" });
  } catch (err) {
    return out_({ ok: false, error: "server", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- helpers ---------- */

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function readRows_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  const values = sh.getRange(1, 1, last, HEADERS.length).getValues();
  const head = values.shift().map(String);
  return values
    .filter(r => r[0] !== "" && r[0] !== null)
    .map(r => {
      const o = {};
      head.forEach((k, j) => {
        const v = r[j];
        o[k] = v instanceof Date
          ? (k === "date" ? Utilities.formatDate(v, TZ, "yyyy-MM-dd") : v.toISOString())
          : String(v == null ? "" : v);
      });
      return o;
    });
}

function findRow_(sh, id) {
  const last = sh.getLastRow();
  if (!id || last < 2) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) return i + 2;
  return -1;
}

function upsert_(sh, row) {
  const now = new Date().toISOString();
  let rowIndex = findRow_(sh, String(row.id || ""));
  const rec = {};
  HEADERS.forEach(k => rec[k] = row[k] == null ? "" : String(row[k]).slice(0, 5000));
  if (rowIndex === -1) {
    rec.id = Utilities.getUuid();
    rec.createdAt = now;
    rowIndex = sh.getLastRow() + 1;
  } else {
    const old = sh.getRange(rowIndex, HEADERS.indexOf("createdAt") + 1).getValue();
    rec.createdAt = old instanceof Date ? old.toISOString() : String(old || now);
  }
  rec.updatedAt = now;
  const range = sh.getRange(rowIndex, 1, 1, HEADERS.length);
  range.setNumberFormat("@"); // giữ dạng chữ: rev "01" không bị đổi thành 1
  range.setValues([HEADERS.map(k => rec[k])]);
  return rec;
}

function deleteRow_(sh, id) {
  const r = findRow_(sh, id);
  if (r > 0) sh.deleteRow(r);
}

function checkKey_(k) {
  return !ACCESS_KEY || String(k || "") === ACCESS_KEY;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
