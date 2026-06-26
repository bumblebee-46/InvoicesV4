'use strict';
const LotDetail = {
  currentId: null,

  render(lotId) {
    this.currentId = lotId;
    const lot = Store.getLot(lotId);
    if (!lot) { setPage('<div class="content"><div class="empty"><p>Lot not found</p></div></div>'); return; }

    const v = Validate.runAndSave(lotId);
    const skuMap = Store.getSKUMap();

    // Stage invoice summaries
    const lorInvs  = lot.invoices.filter(i => i.type === 'LOR_DIST');
    const distInvs = lot.invoices.filter(i => i.type === 'DIST_V4');
    const gwInvs   = lot.invoices.filter(i => i.type === 'V4_GW');

    // Status bar
    const statusConfig = {
      validated: { cls:'ok',   icon:SVG.check, title:'Fully Validated',    sub:'All quantity checks passed across all stages' },
      failed:    { cls:'fail', icon:SVG.x,     title:'Validation Failed',   sub:`${v.summary.failed} SKU${v.summary.failed!==1?'s':''} have quantity mismatches` },
      partial:   { cls:'warn', icon:SVG.warn,  title:'Validation Pending',  sub:'Some invoices may be missing' },
      open:      { cls:'info', icon:SVG.info,  title:'No Invoices Yet',     sub:'Add invoices to start validation' },
    };
    const sc = statusConfig[v.status] || statusConfig.open;
    const statusBar = `
      <div class="lot-status-bar">
        <div class="lsb-icon ${sc.cls}">${sc.icon}</div>
        <div class="lsb-text">
          <div class="lsb-title">${sc.title}</div>
          <div class="lsb-sub">${sc.sub}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          ${v.summary.total?`<span style="font-size:12px;color:var(--text-2)">${v.summary.ok}/${v.summary.total} SKUs valid</span>`:''}
          ${lotStatusBadge(v.status)}
        </div>
      </div>`;

    // Stage flow indicator
    const stageFlow = `
      <div class="stage-flow">
        <div class="stage-pill ${lorInvs.length?'has-data':''}">${lorInvs.length?`${lorInvs.length} invoice${lorInvs.length!==1?'s':''}`:''} L'Oréal → Dist</div>
        <div class="stage-arrow">→</div>
        <div class="stage-pill ${distInvs.length?'has-data':''}">${distInvs.length?`${distInvs.length} invoice${distInvs.length!==1?'s':''}`:''} Dist → V4</div>
        <div class="stage-arrow">→</div>
        <div class="stage-pill ${gwInvs.length?'has-data':''}">${gwInvs.length?`${gwInvs.length} invoice${gwInvs.length!==1?'s':''}`:''} V4 → GW</div>
      </div>`;

    // Validation table
    const valRows = v.skuLines.length ? v.skuLines.map(line => {
      const sku = skuMap[line.skuId];
      const skuName = sku ? sku.name : line.skuId;
      const statusCell =
        line.status === 'ok'      ? `<td class="ok r">✓ Valid</td>` :
        line.status === 'failed'  ? `<td class="fail r">✗ Failed</td>` :
        line.status === 'warning' ? `<td class="warn r">⚠ Warning</td>` : '<td></td>';
      const reasonCell = line.reasons.length
        ? `<td class="r" style="font-size:11px;color:var(--text-3);max-width:260px">${line.reasons.map(r=>esc(r)).join('<br>')}</td>`
        : '<td></td>';

      const stageAcls = line.stageA < 0 ? 'fail' : line.stageA === 0 ? 'ok' : 'warn';
      const stageBcls = line.stageB < 0 ? 'fail' : line.stageB === 0 ? 'ok' : 'warn';

      return `<tr>
        <td class="p" style="max-width:200px">${esc(skuName)}<br><span style="font-size:10px;font-family:var(--mono);color:var(--text-3)">${esc(line.skuId)}</span></td>
        <td class="num">${line.lorQty  || '—'}</td>
        <td class="num">${line.distQty || '—'}</td>
        <td class="num">${line.gwQty   || '—'}</td>
        <td class="${stageAcls} num">${line.lorQty||line.distQty ? (line.stageA >= 0 ? '+' : '') + line.stageA : '—'}</td>
        <td class="${stageBcls} num">${line.distQty||line.gwQty  ? (line.stageB >= 0 ? '+' : '') + line.stageB : '—'}</td>
        ${statusCell}
        ${reasonCell}
      </tr>`;
    }).join('') : `<tr><td colspan="8"><div class="empty" style="padding:28px"><p>No quantities to validate yet</p><span>Add invoices for each stage</span></div></td></tr>`;

    const valTable = `
      <div class="table-wrap val-table-wrap">
        <table class="gt">
          <thead>
            <tr>
              <th>SKU</th>
              <th class="r">L'Oréal→Dist</th>
              <th class="r">Dist→V4</th>
              <th class="r">V4→GW</th>
              <th class="r" title="Loreal minus Dist">Bal A</th>
              <th class="r" title="Dist minus GW">Bal B</th>
              <th class="r">Status</th>
              <th class="r">Detail</th>
            </tr>
          </thead>
          <tbody>${valRows}</tbody>
        </table>
      </div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-3);display:flex;gap:16px;flex-wrap:wrap">
        <span><span style="color:var(--green)">● </span>Bal A = L'Oréal qty minus Dist qty (≥0 required)</span>
        <span><span style="color:var(--green)">● </span>Bal B = Dist qty minus GW qty (=0 means lot closed)</span>
        <span><span style="color:var(--red)">● </span>Negative balance = validation failure</span>
      </div>`;

    // Invoice sections
    const invSection = (type, invList, label) => {
      const meta = INV_TYPE[type];
      const cards = invList.map(inv => {
        const qty = totalQty(inv.lines);
        const lines = inv.lines.map(l => {
          const s = skuMap[l.skuId];
          return `<tr><td>${s ? esc(s.name) : esc(l.skuId)}</td><td class="r num">${l.qty}</td></tr>`;
        }).join('');
        return `
          <div class="inv-card">
            <div class="inv-card-head" onclick="LotDetail.toggleInv('${inv.id}')">
              <div class="inv-chevron" id="ic-${inv.id}">${SVG.chevron}</div>
              <div style="flex:1">
                <span style="font-weight:600;color:var(--text-1)">${esc(inv.num)}</span>
                ${inv.supplierName?`<span style="font-size:11px;color:var(--text-3);margin-left:6px">${esc(inv.supplierName)}</span>`:''}
              </div>
              <span style="font-size:12px;color:var(--text-3)">${fmtDate(inv.date)}</span>
              <span style="font-size:12px;color:var(--text-2);margin-left:8px">${qty} units · ${inv.lines.length} SKUs</span>
              <button class="btn btn-sm btn-danger" style="margin-left:8px" onclick="event.stopPropagation();LotDetail.deleteInvoice('${inv.id}')">${SVG.trash}</button>
            </div>
            <div class="inv-card-body" id="ib-${inv.id}">
              <div style="padding:10px 14px">
                <table class="gt" style="font-size:12px">
                  <thead><tr><th>SKU</th><th class="r">Qty</th></tr></thead>
                  <tbody>${lines||'<tr><td colspan="2" style="text-align:center;color:var(--text-3);padding:10px">No lines</td></tr>'}</tbody>
                </table>
              </div>
            </div>
          </div>`;
      }).join('');

      return `
        <div style="margin-bottom:20px">
          <div class="section-div">${label} ${invList.length?`<span class="badge bg-gray" style="font-size:10px">${invList.length}</span>`:''}</div>
          ${cards}
          <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;border:1px dashed var(--border-2);margin-top:4px"
            onclick="LotDetail.openAddInvoice('${type}')">
            ${SVG.plus} Add ${meta.short} invoice
          </button>
        </div>`;
    };

    // Notes
    const noteItems = (lot.lotNotes||[]).slice().reverse().map(n=>`
      <div class="note-item">
        <div class="note-text">${esc(n.text)}</div>
        <div class="note-time">${fmtDate(new Date(n.createdAt).toISOString().slice(0,10))} · ${timeAgo(n.createdAt)}</div>
      </div>`).join('');

    setPage(`
      <div class="ph" style="padding-bottom:16px">
        <div>
          <div style="font-size:11px;color:var(--text-3);margin-bottom:4px;cursor:pointer" onclick="Nav.go('lots')">← Shipment Lots</div>
          <div class="ph-title">${esc(lot.name)}</div>
          <div class="ph-sub">${lot.dist?`Distributor: ${esc(lot.dist)} · `:''}Created ${fmtDate(new Date(lot.createdAt).toISOString().slice(0,10))}</div>
        </div>
        <div class="ph-actions">
          <button class="btn btn-sm" onclick="LotDetail.exportCSV()">${SVG.download} Export validation</button>
        </div>
      </div>

      <div class="content">
        ${statusBar}
        ${stageFlow}

        <div class="section-div" style="margin-top:8px">Quantity Validation</div>
        ${valTable}

        <div class="section-div" style="margin-top:24px">Invoices</div>
        ${invSection('LOR_DIST', lorInvs,  "L'Oréal → Distributor")}
        ${invSection('DIST_V4',  distInvs, 'Distributor → V4')}
        ${invSection('V4_GW',    gwInvs,   'V4 → GW')}

        <div class="section-div" style="margin-top:24px">Notes</div>
        <div style="margin-bottom:10px;display:flex;gap:8px">
          <input class="field-input" id="note-input" placeholder="Add a note…" style="flex:1" onkeydown="if(event.key==='Enter')LotDetail.addNote()"/>
          <button class="btn btn-sm" onclick="LotDetail.addNote()">Add</button>
        </div>
        ${noteItems ? `<div class="table-wrap"><div style="padding:4px 14px">${noteItems}</div></div>` : '<div style="font-size:12px;color:var(--text-3)">No notes yet</div>'}
      </div>`);
  },

  toggleInv(invId) {
    const body = $id('ib-' + invId);
    const chev = $id('ic-' + invId);
    if (!body) return;
    const open = body.classList.toggle('open');
    chev?.classList.toggle('open', open);
  },

  openAddInvoice(type) {
    const meta = INV_TYPE[type];
    const lots = Store.getLots();
    const lot  = Store.getLot(this.currentId);
    const supplierField = (type === 'DIST_V4' || type === 'LOR_DIST')
      ? `<div class="field-group" style="margin-top:12px">
           <label class="field-label">Supplier / Distributor name</label>
           <input class="field-input" id="ai-supplier" placeholder="e.g. Aara Pharma" autocomplete="off"/>
         </div>` : '';

    Drawer.open(
      'Add Invoice', meta.label,
      `<div class="form-grid form-cols-3" style="margin-bottom:14px">
        <div class="field-group">
          <label class="field-label">Invoice no. *</label>
          <input class="field-input" id="ai-num" placeholder="MH2414-001" autocomplete="off"/>
        </div>
        <div class="field-group">
          <label class="field-label">Date *</label>
          <input class="field-input" id="ai-date" type="date"/>
        </div>
        <div class="field-group" style="align-self:end">
          ${invTypeBadge(type)}
        </div>
      </div>
      ${supplierField}
      <div class="section-div" style="margin-top:16px">SKU Quantities</div>
      ${SKUEntry.build('ai')}
      <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
        <div class="field-group">
          <label class="field-label">Or import from Excel</label>
          <div class="upload-zone" onclick="LotDetail.triggerXL('${type}')">
            ${SVG.upload}
            <span>Click to select .xlsx file</span>
            <span style="font-size:11px;color:var(--text-3)">Columns: Invoice No | Date | SKU ID | Qty</span>
          </div>
          <input type="file" id="inv-xl" accept=".xlsx,.xls" style="display:none" onchange="LotDetail.importInvXL(event,'${type}')"/>
        </div>
      </div>`,
      `<button class="btn btn-ghost" onclick="Drawer.close()">Cancel</button>
       <button class="btn btn-primary" onclick="LotDetail.saveInvoice('${type}')">Save invoice</button>`
    );
    setTimeout(() => { const d = $id('ai-date'); if(d) d.value = new Date().toISOString().slice(0,10); }, 50);
  },

  triggerXL(type) { $id('inv-xl')?.click(); },

  importInvXL(event, type) {
    const f = event.target.files[0]; if(!f) return;
    Data.readExcel(f, wb => {
      const invs = Data.parseInvoiceXL(wb);
      let added = 0, skipped = 0;
      invs.forEach(inv => {
        try { Store.addInvoice(this.currentId, {...inv, type}); added++; } catch { skipped++; }
      });
      Validate.runAndSave(this.currentId);
      Drawer.close();
      Toast.show(`Imported ${added} invoice${added!==1?'s':''}${skipped?`, ${skipped} skipped`:''}`, added>0?'success':'error');
      this.render(this.currentId);
    });
  },

  saveInvoice(type) {
    const num  = $id('ai-num')?.value.trim();
    const date = $id('ai-date')?.value;
    const sup  = $id('ai-supplier')?.value.trim() || '';
    if (!num || !date) { Toast.show('Invoice number and date required', 'error'); return; }
    const lines = SKUEntry.collect('ai');
    try {
      Store.addInvoice(this.currentId, { num, date, type, lines, supplierName: sup });
      Validate.runAndSave(this.currentId);
      Drawer.close();
      Toast.show('Invoice saved', 'success');
      this.render(this.currentId);
    } catch(e) { Toast.show(e.message, 'error'); }
  },

  deleteInvoice(invId) {
    if (!confirm('Delete this invoice?')) return;
    Store.deleteInvoice(this.currentId, invId);
    Validate.runAndSave(this.currentId);
    Toast.show('Invoice deleted');
    this.render(this.currentId);
  },

  addNote() {
    const el = $id('note-input');
    const txt = el?.value.trim(); if (!txt) return;
    Store.addNote(this.currentId, txt);
    el.value = '';
    this.render(this.currentId);
  },

  exportCSV() {
    const lot    = Store.getLot(this.currentId);
    const v      = lot.validation || Validate.run(lot);
    const skuMap = Store.getSKUMap();
    const hdr    = ['SKU ID', 'Product Name', 'Loreal→Dist', 'Dist→V4', 'V4→GW', 'Balance A', 'Balance B', 'Status', 'Detail'];
    const rows   = v.skuLines.map(l => {
      const sku = skuMap[l.skuId];
      return [l.skuId, sku?.name||'', l.lorQty, l.distQty, l.gwQty, l.stageA, l.stageB, l.status, l.reasons.join('; ')];
    });
    Data.exportCSV(`${lot.name}-validation-${new Date().toISOString().slice(0,10)}.csv`, [hdr,...rows]);
    Toast.show('Exported', 'success');
  },
};
