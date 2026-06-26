'use strict';
const INV_META = {
  LOR_AARA:   { label: 'Loreal → Aara',   badge: 'b-indigo', color: '#6366f1', dist: 'Aara'   },
  LOR_ADITI:  { label: 'Loreal → Aditi',  badge: 'b-violet', color: '#8b5cf6', dist: 'Aditi'  },
  LOR_OTHERS: { label: 'Loreal → Others', badge: 'b-amber',  color: '#f59e0b', dist: 'Others' },
  AARA_V4:    { label: 'Aara → V4',       badge: 'b-cyan',   color: '#06b6d4', dist: 'Aara'   },
  ADITI_V4:   { label: 'Aditi → V4',      badge: 'b-purple', color: '#a78bfa', dist: 'Aditi'  },
  OTHERS_V4:  { label: 'Others → V4',     badge: 'b-orange', color: '#fb923c', dist: 'Others' },
  V4_GW:      { label: 'V4 → GW',         badge: 'b-green',  color: '#10b981', dist: null      },
};

function typeMeta(t) { return INV_META[t] || { label: t, badge: 'b-gray', color: '#888', dist: null }; }
function typeLabel(t) { return typeMeta(t).label; }
function typeBadge(t) { return typeMeta(t).badge; }

function $(s) { return document.querySelector(s); }
function $$(s) { return [...document.querySelectorAll(s)]; }
function setPage(html) { $('#page-root').innerHTML = html; }

// Toast
function toast(msg, type = '') {
  const c = $('#toast-container');
  const d = document.createElement('div');
  d.className = 'toast' + (type ? ' ' + type : '');
  d.innerHTML = (type === 'success' ? Icon.check : type === 'error' ? Icon.x : '') + `<span>${msg}</span>`;
  c.appendChild(d);
  setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 220); }, 3200);
}

// Format
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function totalQty(lines) { return (lines || []).reduce((s, l) => s + (l.qty || 0), 0); }
function getQtyMap(invList) {
  const m = {};
  (invList || []).forEach(inv => (inv.lines || []).forEach(l => { m[l.code] = (m[l.code] || 0) + (l.qty || 0); }));
  return m;
}
function balStr(n) { return n > 0 ? '+' + n : String(n); }

// ── Excel helpers (SheetJS) ───────────────────────────────────────────────
function readExcelFile(file, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: 'array' });
    callback(wb);
  };
  reader.readAsArrayBuffer(file);
}

// Parse invoice Excel: expects columns Invoice No | Date | Lot | SKU Code | Qty
function parseInvoiceExcel(wb) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const map = {};
  rows.forEach(cols => {
    const [num, date, lot, code, qtyRaw] = cols;
    if (!num || !code) return;
    // Handle Excel date serial numbers
    let dateStr = date;
    if (typeof date === 'number') {
      const d = XLSX.SSF.parse_date_code(date);
      dateStr = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
    }
    const key = `${num}|${dateStr}|${lot}`;
    if (!map[key]) map[key] = { num: String(num).trim(), date: String(dateStr).trim(), lot: String(lot).trim().toUpperCase(), lines: [] };
    const qty = parseInt(qtyRaw) || 0;
    if (qty > 0 && code) map[key].lines.push({ code: String(code).trim().toUpperCase(), qty });
  });
  return Object.values(map);
}

// Parse SKU Excel: expects columns Code | Name | Category
function parseSKUExcel(wb) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  return rows.map(cols => ({
    code: String(cols[0] || '').trim().toUpperCase(),
    name: String(cols[1] || '').trim(),
    cat:  String(cols[2] || 'Other').trim(),
  })).filter(r => r.code && r.name);
}

// Export/Import JSON backup
function exportAll() {
  const str = Store.toJSON();
  const blob = new Blob([str], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `v4-supply-${new Date().toISOString().slice(0,10)}.json`; a.click();
  URL.revokeObjectURL(url);
  toast('Data exported', 'success');
}
function triggerImport() { $('#import-file').click(); }
function handleImport(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try { Store.fromJSON(ev.target.result); toast('Data imported', 'success'); renderCurrentPage(); }
    catch { toast('Invalid file', 'error'); }
  };
  r.readAsText(f); e.target.value = '';
}

function downloadCSV(name, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
