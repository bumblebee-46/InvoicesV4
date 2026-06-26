'use strict';
function renderSKUsPage() {
  const cats = Store.getSKUsByCategory();
  const total = Store.getSKUs().length;

  const rows = Object.entries(cats).map(([cat, skus]) => `
    <tr class="group-row"><td colspan="3">${cat}</td></tr>
    ${skus.map(s => `
      <tr>
        <td class="p mono">${s.code}</td>
        <td class="p">${s.name}</td>
        <td class="r"><button class="btn btn-xs btn-danger" onclick="delSKU('${s.code}')">${Icon.trash}</button></td>
      </tr>`).join('')}`).join('');

  setPage(`
    <div class="page-head">
      <div class="page-head-left">
        <div class="page-eyebrow">Config</div>
        <div class="page-title">SKU Master</div>
        <div class="page-sub">${total} product${total !== 1 ? 's' : ''} across ${Object.keys(cats).length} categories</div>
      </div>
      <div class="page-actions">
        <button class="btn" onclick="openSKUImportDrawer()">${Icon.excel} Import Excel</button>
        <button class="btn" onclick="exportSKUs()">${Icon.download} Export</button>
        <button class="btn btn-primary" onclick="openAddSKUDrawer()">${Icon.plus} Add SKU</button>
      </div>
    </div>
    <div class="table-section" style="margin-top:24px">
      <div class="table-wrap">
        <table class="gt">
          <thead><tr><th>SKU code</th><th>Product name</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3"><div class="empty"><p>No SKUs</p></div></td></tr>'}</tbody>
        </table>
      </div>
      <div style="margin-top:12px;font-size:12px;color:var(--text-3)">
        Excel import format: <span style="font-family:monospace;background:var(--glass-2);padding:2px 8px;border-radius:4px">Code | Product Name | Category</span> — one row per product
      </div>
    </div>`);
}

function openAddSKUDrawer() {
  const cats = Object.keys(Store.getSKUsByCategory());
  const catOpts = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  openDrawer('Add SKU', '',
    `<div class="form-row"><div class="form-group"><label>SKU code</label><input id="ds-code" placeholder="SH-ABSREP" autocomplete="off"/></div></div>
     <div class="form-row"><div class="form-group"><label>Product name</label><input id="ds-name" placeholder="Abs Rep Shampoo 300ml" autocomplete="off"/></div></div>
     <div class="form-row"><div class="form-group"><label>Category</label>
       <input id="ds-cat" placeholder="Shampoo 300ml" list="cat-dl" autocomplete="off"/>
       <datalist id="cat-dl">${catOpts}</datalist>
     </div></div>`,
    `<button class="btn" onclick="closeDrawer()">Cancel</button>
     <button class="btn btn-primary" onclick="submitAddSKU()">Add SKU</button>`
  );
}

function submitAddSKU() {
  const code = $('#ds-code')?.value || '';
  const name = $('#ds-name')?.value || '';
  const cat  = $('#ds-cat')?.value || 'Other';
  try { Store.addSKU(code, name, cat); closeDrawer(); toast('SKU added', 'success'); renderCurrentPage(); }
  catch (e) { toast(e.message, 'error'); }
}

function delSKU(code) {
  if (!confirm(`Remove ${code}?`)) return;
  Store.deleteSKU(code); toast(`${code} removed`); renderCurrentPage();
}

function openSKUImportDrawer() {
  openDrawer('Import SKUs from Excel', '',
    `<p style="font-size:13px;color:var(--text-2);margin-bottom:16px;line-height:1.7">
      Upload an <strong>.xlsx</strong> file with one product per row.
    </p>
    <div style="background:var(--glass-2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px;font-family:monospace;font-size:12px;color:var(--text-2)">
      SKU Code &nbsp;|&nbsp; Product Name &nbsp;|&nbsp; Category
    </div>
    <div class="upload-zone" onclick="$('#sku-xl-in').click()">
      ${Icon.excel}<span>Click to select .xlsx file</span>
    </div>
    <input type="file" id="sku-xl-in" accept=".xlsx,.xls" style="display:none" onchange="processSKUExcelFile(event)"/>`, ''
  );
}

function processSKUExcelFile(event) {
  const file = event.target.files[0]; if (!file) return;
  readExcelFile(file, wb => {
    const rows = parseSKUExcel(wb);
    const n = Store.importSKUs(rows);
    closeDrawer(); toast(`Imported ${n} SKU${n !== 1 ? 's' : ''}`, n > 0 ? 'success' : 'error'); renderCurrentPage();
  });
}

function exportSKUs() {
  const skus = Store.getSKUs();
  downloadCSV('skus.csv', [['Code', 'Name', 'Category'], ...skus.map(s => [s.code, s.name, s.cat || ''])]);
  toast('Exported', 'success');
}
