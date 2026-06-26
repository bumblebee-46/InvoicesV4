'use strict';
const Lots = {
  render() {
    const lots = Store.getLots();
    lots.forEach(l => { if(!l.validation) Validate.runAndSave(l.id); });

    const rows = lots.map(lot => {
      const v = lot.validation || {summary:{total:0,ok:0,failed:0,warning:0}};
      const valCell = v.summary.failed > 0
        ? `<span class="t-error">${v.summary.failed} failed</span>`
        : v.summary.warning > 0
        ? `<span class="t-warning">${v.summary.warning} warnings</span>`
        : v.summary.ok > 0
        ? `<span class="t-success">${v.summary.ok} valid</span>`
        : '<span class="t-tertiary">—</span>';

      return `<tr class="clickable" onclick="Nav.go('lot','${lot.id}')">
        <td class="primary">${esc(lot.name)}</td>
        <td class="t-secondary">${esc(lot.dist || '—')}</td>
        <td>${lotBadge(lot.status)}</td>
        <td class="num">${lot.invoices.length}</td>
        <td class="num">${v.summary.total || '—'}</td>
        <td class="r">${valCell}</td>
        <td class="t-tertiary" style="font-size:var(--text-xs)">${fmtDate(new Date(lot.createdAt).toISOString().slice(0,10))}</td>
        <td class="r">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="event.stopPropagation();Lots.delete('${lot.id}')" title="Delete lot">
            ${I.trash}
          </button>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="8"><div class="empty-state">
      ${I.lot}
      <div class="empty-title">No shipment lots</div>
      <div class="empty-body">Create your first lot to start tracking L'Oréal → GW quantity validation</div>
      <div class="empty-action"><button class="btn btn-primary" onclick="Lots.openCreate()">${I.plus} Create first lot</button></div>
    </div></td></tr>`;

    setPage(`
      <div class="page-header">
        <div class="ph-left">
          <div class="ph-title">Shipment Lots</div>
          <div class="ph-subtitle">${lots.length} lot${lots.length!==1?'s':''} · click any row to open</div>
        </div>
        <div class="ph-actions">
          <button class="btn btn-primary" onclick="Lots.openCreate()">${I.plus} New lot</button>
        </div>
      </div>
      <div class="content">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lot</th><th>Distributor</th><th>Status</th>
                <th class="r">Invoices</th><th class="r">SKUs</th>
                <th class="r">Validation</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`);
  },

  openCreate() {
    Drawer.open("New Shipment Lot", "Create a new shipment batch to track",
      `<div class="form-grid cols-2" style="margin-bottom:var(--sp-4)">
        <div class="field">
          <label class="field-label">Lot number *</label>
          <input class="input" id="cl-name" placeholder="LOT-01" autocomplete="off" style="text-transform:uppercase"
            onkeydown="if(event.key==='Enter')Lots.create()"/>
        </div>
        <div class="field">
          <label class="field-label">Distributor</label>
          <input class="input" id="cl-dist" placeholder="e.g. Aara, Aditi" autocomplete="off"/>
        </div>
      </div>
      <div class="field">
        <label class="field-label">Notes (optional)</label>
        <textarea class="textarea" id="cl-notes" placeholder="Any notes about this shipment…"></textarea>
      </div>`,
      `<button class="btn btn-ghost" onclick="Drawer.close()">Cancel</button>
       <button class="btn btn-primary" onclick="Lots.create()">${I.plus} Create lot</button>`
    );
  },

  create() {
    const name  = $id('cl-name')?.value.trim();
    const dist  = $id('cl-dist')?.value.trim();
    const notes = $id('cl-notes')?.value.trim();
    try {
      const lot = Store.createLot({name, dist, notes});
      Drawer.close();
      Toast.show(`Lot ${lot.name} created`, 'Click to open and add invoices', 'success');
      Nav.go('lot', lot.id);
    } catch(e) { Toast.show('Could not create lot', e.message, 'error'); }
  },

  delete(id) {
    const lot = Store.getLot(id); if(!lot) return;
    if (!confirm(`Delete "${lot.name}"? This cannot be undone.`)) return;
    Store.deleteLot(id);
    Toast.show('Lot deleted');
    this.render();
  },
};
