/**
 * Receives bid requests from the landing page and adds one row per lead to the
 * "Leads" tab of the spreadsheet this script is attached to.
 *
 * Setup (once):
 *   1. Extensions → Apps Script in the Google Sheet, paste this file in, save.
 *   2. Project Settings → Script properties:
 *        TOKEN         – a long random string; the same value goes in Vercel as LEADS_SHEET_TOKEN
 *        NOTIFY_EMAIL  – (optional) comma-separated addresses to email for each new lead
 *   3. Run `setup` once from the editor and approve the permissions. It creates
 *      the Leads tab with headers.
 *   4. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 *      Copy the web app URL into Vercel as LEADS_SHEET_URL.
 *
 * After editing this script, Deploy → Manage deployments → edit → New version,
 * or the live URL keeps running the old code.
 */

const SHEET_NAME = 'Leads';

// Order matters: each lead is written in this column order. `key` is the field
// the website sends; Status is left blank for you to fill in.
const COLUMNS = [
  { header: 'Submitted', key: 'submittedAt' },
  { header: 'Status', key: null },
  { header: 'Project', key: 'project' },
  { header: 'First name', key: 'firstName' },
  { header: 'Last name', key: 'lastName' },
  { header: 'Phone', key: 'phone' },
  { header: 'Email', key: 'email' },
  { header: 'Address', key: 'address' },
  { header: 'Zip', key: 'zip' },
  { header: 'Has plans', key: 'plans' },
  { header: 'Details', key: 'details' },
];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const headers = COLUMNS.map((c) => c.header);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  const col = (header) => headers.indexOf(header) + 1;
  // Keep phone and zip as text so leading zeros and formatting survive.
  sheet.getRange(2, col('Phone'), sheet.getMaxRows() - 1).setNumberFormat('@');
  sheet.getRange(2, col('Zip'), sheet.getMaxRows() - 1).setNumberFormat('@');
  sheet.getRange(2, col('Submitted'), sheet.getMaxRows() - 1).setNumberFormat('yyyy-mm-dd h:mm am/pm');
  sheet.getRange(2, col('Details'), sheet.getMaxRows() - 1).setWrap(true);
  sheet.setColumnWidth(col('Details'), 420);

  const status = SpreadsheetApp.newDataValidation()
    .requireValueInList(['New', 'Contacted', 'Bid scheduled', 'Bid sent', 'Won', 'Lost'], true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, col('Status'), sheet.getMaxRows() - 1).setDataValidation(status);
}

function doPost(e) {
  let lead;
  try {
    lead = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'Bad request' });
  }

  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token || lead.token !== token) {
    return json({ ok: false, error: 'Unauthorized' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const row = COLUMNS.map((c) => {
      if (c.key === null) return 'New';
      if (c.key === 'submittedAt') return new Date(lead.submittedAt || Date.now());
      return safe(lead[c.key]);
    });
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  notify(lead);
  return json({ ok: true });
}

function notify(lead) {
  const to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
  const body = [
    `${name} requested a bid for: ${lead.project}`,
    '',
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Address: ${lead.address}`,
    `Zip: ${lead.zip}`,
    `Has plans: ${lead.plans}`,
    '',
    lead.details,
    '',
    SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  ].join('\n');
  MailApp.sendEmail({ to, subject: `New bid request: ${lead.project} – ${name}`, body, replyTo: lead.email });
}

// Text typed into the form must never run as a spreadsheet formula.
function safe(value) {
  const text = value == null ? '' : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
