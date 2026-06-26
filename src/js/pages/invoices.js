'use strict';
function renderInvoicesPage(type) {
  const meta = typeMeta(type);
  const invs = Store.getInvoices(type).sort((a, b) => b.id - a.id);
  const skus = Store.getSKUs();

  const rows = invs.length ? invs.map(inv => {
    const qty = totalQty(inv.lines);
    const lines = inv.lines.map(l => {
      const s = skus.find(x => x.code === l.code);
      return `<tr>
        <td class="mono">${l.code}</td>
        <td>${s ? s.name : l.code}</td>
        <td class="r num">${l.qty}</td>
      </tr>`;
    }).join('');
    const supplierNote = inv.supplierName ? `<span style="font-size:11px;color:var(--text-3);margin-left:6px">(${inv.supplierName})</span>` : '';
    return `
      <tr style="cursor:pointer" onclick="toggleInvLines(${inv.id})">
        <td style="width:36px;padding-right:0">
          <button class="inv-toggle" id="itog-${inv.id}">${Icon.chevronRight}</button>
        </td>
        <td class="p mono">${inv.num}${supplierNote}</td>
        <td>${fmtDate(inv.date)}</td>
        <td><span class="badge b-gray">${inv.lot}</span></td>
        <td class="r num">${inv.lines.length} SKU${inv.lines.length !== 1 ? 's' : ''}</td>
        <td class="r num">${qty}</td>
        <td class="r">
          <button class="btn btn-xs btn-danger" onclick="event.stopPropagation();delInv(${inv.id})">${Icon.trash}</button>
        </td>
      </tr>
      <tr class="inv-expand">
        <td colspan="7" style="padding:0">
          <div class="inv-expand-inner" id="iexp-${inv.id}">
            <table class="inv-lines-table">
              <thead><tr><th>Code</th><th>Product</th><th class="r">Qty</th></tr></thead>
              <tbody>${lines || '<tr><td colspan="3" style="color:var(--text-3);text-align:center;padding:10px">No lines</td></tr>'}</tbody>
            </table>
          </div>
        </td>
      </tr>`;
  }).join('') : `<tr><td colspan="7"><div class="empty">${Icon.pkg}<p>No invoices yet</p><span>Add one above</span></div></td></tr>`;

  const othersNameField = type === 'LOR_OTHERS' || type === 'OTHERS_V4' ? `
    <div class="form-group" style="grid-column:1/-1">
      <label>Supplier name</label>
      <input id="d-supplier" placeholder="e.g. Rajan Distributors" autocomplete="off"/>
    </div>` : '';

  setPage(`
    <div class="page-head">
      <div class="page-head-left">
        <div class="page-eyebrow">Invoices</div>
        <div class="page-title"><span class="badge ${meta.badge}" style="font-size:13px">${meta.label}</span></div>
        <div class="page-sub">${invs.length} invoice${invs.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="page-actions">
        <button class="btn" onclick="openImportInvDrawer('${type}')">${Icon.excel} Import Excel</button>
        <button class="btn btn-primary" onclick="openAddInvDrawer('${type}')">${Icon.plus} Add invoice</button>
      </div>
    </div>
    <div class="table-section" style="margin-top:24px">
      <div class="table-wrap">
        <table class="gt">
          <thead>
            <tr>
              <th style="width:36px"></th>
              <th>Invoice no.</th><th>Date</th><th>Lot</th>
              <th class="r">SKUs</th><th class="r">Total qty</th><th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`);
}

function toggleInvLines(id) {
  const exp = $(`#iexp-${id}`), tog = $(`#itog-${id}`);
  if (!exp) return;
  const open = exp.classList.toggle('open');
  tog?.classList.toggle('open', open);
}

function delInv(id) {
  if (!confirm('Delete this invoice?')) return;
  Store.deleteInvoice(id); toast('Invoice deleted'); renderCurrentPage();
}

// ── Add invoice drawer ────────────────────────────────────────────
function openAddInvDrawer(type) {
  const meta = typeMeta(type);
  const cats = Store.getSKUsByCategory();
  const lots = Store.getLots();
  const datalist = lots.length ? `<datalist id="lot-dl">${lots.map(l => `<option value="${l}">`).join('')}</datalist>` : '';

  // Build SKU rows grouped by category
  const skuHTML = Object.entries(cats).map(([cat, skus]) => `
    <div class="sku-cat-header">${cat}</div>
    ${skus.map(s => `
      <div class="sku-qty-row">
        <div><div class="sku-name">${s.name}</div><div class="sku-code">${s.code}</div></div>
        <input type="number" min="0" placeholder="0" id="dqty-${s.code}"/>
      </div>`).join('')}`).join('');

  const othersField = (type === 'LOR_OTHERS' || type === 'OTHERS_V4') ? `
    <div class="form-group" style="margin-bottom:14px">
      <label>Supplier name</label>
      <input id="d-supplier" placeholder="e.g. Rajan Distributors" autocomplete="off"/>
    </div>` : '';

  openDrawer(
    `Add invoice`, meta.label,
    `<div class="form-row cols-3" style="margin-bottom:14px">
      <div class="form-group">
        <label>Invoice no.</label>
        <input id="d-num" placeholder="e.g. MH24-001" autocomplete="off"/>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input id="d-date" type="date"/>
      </div>
      <div class="form-group">
        <label>Lot</label>
        <input id="d-lot" placeholder="LOT-01" list="lot-dl" autocomplete="off" style="text-transform:uppercase"/>
        ${datalist}
      </div>
    </div>
    ${othersField}
    <div class="section-sep">SKU quantities — enter 0 or leave blank to skip</div>
    <div class="sku-qty-wrap">
      <div class="sku-qty-head"><span>Product</span><span style="text-align:right">Qty</span><span></span></div>
      ${skuHTML || '<div style="padding:20px;text-align:center;color:var(--text-3)">No SKUs in master list</div>'}
    </div>`,
    `<button class="btn" onclick="closeDrawer()">Cancel</button>
     <button class="btn btn-primary" onclick="submitAddInv('${type}')">Save invoice</button>`
  );
  setTimeout(() => { const d = $('#d-date'); if (d) d.value = new Date().toISOString().slice(0, 10); }, 50);
}

function submitAddInv(type) {
  const num = $('#d-num')?.value.trim();
  const date = $('#d-date')?.value;
  const lot = $('#d-lot')?.value.trim().toUpperCase();
  const supplierName = $('#d-supplier')?.value.trim() || null;
  if (!num || !date || !lot) { toast('Invoice no., date and lot required', 'error'); return; }
  const skus = Store.getSKUs();
  const lines = [];
  skus.forEach(s => {
    const el = $(`#dqty-${s.code}`);
    const qty = parseInt(el?.value) || 0;
    if (qty > 0) lines.push({ code: s.code, qty });
  });
  try {
    Store.addInvoice({ num, date, type, lot, lines, supplierName });
    closeDrawer(); toast('Invoice saved', 'success'); renderCurrentPage();
  } catch (e) { toast(e.message, 'error'); }
}

// ── Excel import drawer ───────────────────────────────────────────
function openImportInvDrawer(type) {
  const meta = typeMeta(type);
  openDrawer(
    'Import from Excel', meta.label,
    `<p style="font-size:13px;color:var(--text-2);margin-bottom:16px;line-height:1.7">
      Upload an <strong>.xlsx</strong> file. One row per SKU line — rows with the same invoice number are grouped automatically.
    </p>
    <div style="background:var(--glass-2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px;font-family:monospace;font-size:12px;color:var(--text-2)">
      Invoice No &nbsp;|&nbsp; Date &nbsp;|&nbsp; Lot &nbsp;|&nbsp; SKU Code &nbsp;|&nbsp; Qty
    </div>
    <div class="upload-zone" onclick="$('#inv-xl-in').click()">
      ${Icon.excel}
      <span>Click to select .xlsx file</span>
    </div>
    <input type="file" id="inv-xl-in" accept=".xlsx,.xls" style="display:none" onchange="processInvExcel(event,'${type}')"/>
    <div id="xl-preview" style="margin-top:12px;font-size:12px;color:var(--text-2)"></div>`, ''
  );
}

function processInvExcel(event, type) {
  const file = event.target.files[0]; if (!file) return;
  $('#xl-preview').textContent = 'Reading file…';
  readExcelFile(file, wb => {
    const invs = parseInvoiceExcel(wb);
    let added = 0, skipped = 0;
    invs.forEach(inv => {
      try { Store.addInvoice({ ...inv, type }); added++; } catch { skipped++; }
    });
    closeDrawer();
    toast(`Imported ${added} invoice${added !== 1 ? 's' : ''}${skipped ? `, ${skipped} skipped` : ''}`, added > 0 ? 'success' : 'error');
    renderCurrentPage();
  });
}
