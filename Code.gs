/** @OnlyCurrentDoc */
/**
 * Grade 4 Practice Tests: saves progress to this Google Sheet.
 * Setup: change FAMILY_CODE below, then Deploy > New deployment > Web app
 *        (Execute as: Me, Who has access: Anyone).
 * Forgot a student PIN? Clear that student's "pin" cell on the Students tab.
 */
const FAMILY_CODE = 'CHANGE-ME';   // pick a code only your family knows

const PROGRESS_HEADER = ['key', 'student', 'test', 'updated', 'status', 'reading', 'answered', 'total', 'writing', 'minutes', 'data'];
const STUDENT_HEADER = ['id', 'name', 'created', 'pin'];

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); }
  else if (sh.getLastColumn() < header.length) sh.getRange(1, 1, 1, header.length).setValues([header]);
  return sh;
}
function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function clean_(v) {           // stop text from being treated as a formula
  v = String(v == null ? '' : v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function safeId_(v) { return /^[A-Za-z0-9_-]{1,40}$/.test(String(v)) ? String(v) : null; }
function okPin_(p) { return /^\d{4}$/.test(String(p)); }
function hash_(id, pin) {
  return 'h' + Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'g4:' + id + ':' + pin)
    .map(x => ((x + 256) % 256).toString(16).padStart(2, '0')).join('');
}
function findStudent_(sh, id) {
  const v = sh.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(id)) return { row: i + 1, pin: String(v[i][3] || '') };
  return null;
}
function tooMany_(id) {        // at most 10 wrong PINs per student every 10 minutes
  return Number(CacheService.getScriptCache().get('pinfail_' + id) || 0) >= 10;
}
function fail_(id) {
  const c = CacheService.getScriptCache(), k = 'pinfail_' + id;
  c.put(k, String(Number(c.get(k) || 0) + 1), 600);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.code !== FAMILY_CODE) return out_({ ok: false, error: 'bad_code' });
  const students = sheet_('Students', STUDENT_HEADER).getDataRange().getValues().slice(1)
    .filter(r => r[0]).map(r => ({ id: String(r[0]), name: String(r[1]), created: Number(r[2]) || 0, hasPin: !!r[3] }));
  const progress = sheet_('Progress', PROGRESS_HEADER).getDataRange().getValues().slice(1)
    .filter(r => r[0]).map(r => {
      let data = {};
      try { data = JSON.parse(r[10]); } catch (err) {}
      return { sid: String(r[0]).split('__')[0], tid: String(r[2]), updated: Number(r[3]) || 0, data: data };
    });
  return out_({ ok: true, pins: true, students: students, progress: progress });
}

function doPost(e) {
  let b = {};
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad_json' }); }
  if (b.code !== FAMILY_CODE) return out_({ ok: false, error: 'bad_code' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (b.action === 'save') {
      const sid = safeId_(b.sid), tid = safeId_(b.tid);
      if (!sid || !tid || typeof b.data !== 'object') return out_({ ok: false, error: 'bad_data' });
      const json = JSON.stringify(b.data);
      if (json.length > 45000) return out_({ ok: false, error: 'too_big' });
      const sh = sheet_('Progress', PROGRESS_HEADER), key = sid + '__' + tid, s = b.summary || {};
      const updated = Number(b.data.updated) || Date.now();
      const row = [key, clean_(s.student), tid, updated, clean_(s.status), clean_(s.reading), Number(s.answered) || 0,
                   Number(s.total) || 0, clean_(s.writing), Number(s.minutes) || 0, json];
      const keys = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues() : [];
      const i = keys.findIndex(k => k[0] === key);
      if (i >= 0) {
        const cur = Number(sh.getRange(i + 2, 4).getValue()) || 0;
        if (cur > updated) return out_({ ok: true, skipped: true });   // a newer save already arrived
        sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
      } else sh.appendRow(row);
      return out_({ ok: true });
    }
    if (b.action === 'student') {
      const id = safeId_(b.id);
      if (!id) return out_({ ok: false, error: 'bad_data' });
      const pin = okPin_(b.pin) ? hash_(id, b.pin) : '';
      sheet_('Students', STUDENT_HEADER).appendRow([id, clean_(String(b.name).slice(0, 40)), Date.now(), pin]);
      return out_({ ok: true });
    }
    if (b.action === 'login') {
      const id = safeId_(b.id), sh = sheet_('Students', STUDENT_HEADER), st = id && findStudent_(sh, id);
      if (!st) return out_({ ok: false, error: 'no_student' });
      if (!st.pin) return out_({ ok: true, needPin: true });
      if (tooMany_(id)) return out_({ ok: false, error: 'locked' });
      if (okPin_(b.pin) && hash_(id, b.pin) === st.pin) return out_({ ok: true });
      fail_(id);
      return out_({ ok: false, error: 'bad_pin' });
    }
    if (b.action === 'setPin') {          // only for a student with no PIN yet (new, or cleared by a parent)
      const id = safeId_(b.id), sh = sheet_('Students', STUDENT_HEADER), st = id && findStudent_(sh, id);
      if (!st || !okPin_(b.pin)) return out_({ ok: false, error: 'bad_data' });
      if (st.pin) return out_({ ok: false, error: 'has_pin' });
      sh.getRange(st.row, 4).setValue(hash_(id, b.pin));
      return out_({ ok: true });
    }
    if (b.action === 'removeStudent') {
      const sh = sheet_('Students', STUDENT_HEADER), v = sh.getDataRange().getValues();
      for (let i = v.length - 1; i >= 1; i--) if (String(v[i][0]) === String(b.id)) sh.deleteRow(i + 1);
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'bad_action' });
  } finally {
    lock.releaseLock();
  }
}
