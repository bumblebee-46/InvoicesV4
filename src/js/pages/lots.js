'use strict';
const Lots = {
  render() {
    const lots = Store.getLots();
    lots.forEach(l => { if(!l.validation) Validate.runAndSave(l.id); });

    const rows = lots.map(lot => {
      const v = lot.validation || {summary:{total:0,ok:0,failed:0,warning:0}};
      return `<tr class="clickable" onclick="Nav.go('lot','${lot.id}')">
        <td class="p">${esc(lot.name)}</td>
        <td>${esc(lot.dist||'—')}</td>
        <td>${lotStatusBadge(lot.status)}</td>
        <td class="r">${lot.invoices.length}</td>
        <td class="r">${v.summary.total}</td>
        <td class="r ${v.summary.failed>0?'fail':v.summary.warning>0?'warn':''}">
          ${v.summary.failed>0?`${v.summary.failed} failed`:v.summary.warning>0?`${v.summary.warning} warnings`:'—'}
        </td>
        <td style="font-size:11px;color:var(--text-3)">${fmtDate(new Date(lot.createdAt).toISOString().slice(0,10))}</td>
        <td class="r">
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();Lots.delete('${lot.id}')">${SVG.trash}</button>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="8"><div class="empty">${SVG.lot}<p>No shipment lots</p><span>Click "New lot" to create your first shipment</span></div></td></tr>`;

    setPage(`
      <div class="ph">
        <div>
          <div class="ph-title">Shipment Lots</div>
          <div class="ph-sub">${lots.length} lot${lots.length!==1?'s':''} total</div>
        </div>
        <div class="ph-actions">
          <button class="btn btn-primary" onclick="Lots.openCreate()">${SVG.plus} New lot</button>
        </div>
      </div>
      <div class="content">
        <div class="table-wrap">
          <table class="gt">
            <thead>
              <tr>
                <th>Lot</th><th>Distributor</th><th>Status</th>
                <th class="r">Invoices</th><th class="r">SKUs</th>
                <th class="r">Issues</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`);
  },

  openCreate() {
    Drawer.open('New Shipment Lot', 'Create a new shipment batch',
      `<div class="form-grid form-cols-2" style="margin-bottom:14px">
        <div class="field-group">
          <label class="field-label">Lot number *</label>
          <input class="field-input" id="cl-name" placeholder="LOT-01" autocomplete="off" style="text-transform:uppercase"/>
        </div>
        <div class="field-group">
          <label class="field-label">Distributor</label>
          <input class="field-input" id="cl-dist" placeholder="e.g. Aara, Aditi, Others" autocomplete="off"/>
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Notes (optional)</label>
        <textarea class="field-textarea" id="cl-notes" placeholder="Any notes about this shipment…"></textarea>
      </div>`,
      `<button class="btn btn-ghost" onclick="Drawer.close()">Cancel</button>
       <button class="btn btn-primary" onclick="Lots.create()">Create lot</button>`
    );
  },

  create() {
    const name  = $id('cl-name')?.value.trim();
    const dist  = $id('cl-dist')?.value.trim();
    const notes = $id('cl-notes')?.value.trim();
    try {
      const lot = Store.createLot({name, dist, notes});
      Drawer.close();
      Toast.show(`Lot ${lot.name} created`, 'success');
      Nav.go('lot', lot.id);
    } catch(e) { Toast.show(e.message, 'error'); }
  },

  delete(id) {
    const lot = Store.getLot(id); if(!lot) return;
    if(!confirm(`Delete lot ${lot.name}? This cannot be undone.`)) return;
    Store.deleteLot(id);
    Toast.show('Lot deleted');
    Nav.go('lots');
  },
};
