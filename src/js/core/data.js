'use strict';
const Data = {
  exportBackup() {
    _dl(`v4-backup-${_iso()}.json`, new Blob([Store.toJSON()], {type:'application/json'}));
    Toast.show('Backup exported', 'JSON file saved to your downloads', 'success');
  },
  importBackup(event) {
    const f = event.target.files[0]; if(!f) return;
    new FileReader().onload = ev => {
      try { Store.fromJSON(ev.target.result); Toast.show('Data imported','success'); App.refresh(); }
      catch { Toast.show('Import failed', 'Invalid backup file', 'error'); }
    }, (new FileReader()).readAsText(f);
  },
  exportCSV(name, rows) {
    const csv = rows.map(r => r.map(c => `"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    _dl(name, new Blob([csv], {type:'text/csv'}));
  },
  readExcel(file, cb) {
    const r = new FileReader();
    r.onload = e => { cb(XLSX.read(new Uint8Array(e.target.result), {type:'array'})); };
    r.readAsArrayBuffer(file);
  },
  parseInvoiceXL(wb) {
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
    const map = {};
    rows.forEach(c => {
      if (!c[0] || !c[2]) return;
      const num = String(c[0]).trim();
      let date = c[1];
      if (typeof date === 'number') { const d=XLSX.SSF.parse_date_code(date); date=`${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`; }
      date = String(date).trim();
      const skuId = String(c[2]).trim().toUpperCase();
      const qty   = parseInt(c[3]) || 0;
      const key   = `${num}|${date}`;
      if (!map[key]) map[key] = {num, date, lines:[]};
      if (qty > 0) map[key].lines.push({skuId, qty});
    });
    return Object.values(map);
  },
  parseSKUXL(wb) {
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
    return rows.map(c => ({
      id:      String(c[0]||'').trim().toUpperCase(),
      lorCode: String(c[1]||'').trim(),
      ean:     String(c[2]||'').trim(),
      name:    String(c[3]||'').trim(),
      cat:     String(c[4]||'Other').trim(),
    })).filter(r => r.id && r.name);
  },
};

function _dl(name, blob) {
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u);
}
function _iso() { return new Date().toISOString().slice(0,10); }

// FileReader helper (fix closure issue above)
Data.importBackup = function(event) {
  const f = event.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try { Store.fromJSON(ev.target.result); Toast.show('Data imported','All records restored','success'); App.refresh(); }
    catch { Toast.show('Import failed','Invalid backup file','error'); }
  };
  r.readAsText(f); event.target.value = '';
};
