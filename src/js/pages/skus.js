'use strict';
const SKUPage = {
  render() {
    const cats  = Store.getSKUsByCategory();
    const total = Store.getSKUs().length;

    const rows = Object.entries(cats).flatMap(([cat, skus]) => [
      `<tr class="row-group"><td colspan="5">${esc(cat)}</td></tr>`,
      ...skus.map(s => `<tr>
        <td class="primary">${esc(s.name)}</td>
        <td class="mono ${s.lorCode?'':'t-tertiary'}">${esc(s.lorCode||'—')}</td>
        <td class="mono ${s.ean?'':'t-tertiary'}">${esc(s.ean||'—')}</td>
        <td class="mono t-tertiary">${esc(s.id)}</td>
        <td class="r">
          <button class="btn btn-ghost btn-sm" style="margin-right:var(--sp-1)" onclick="SKUPage.openEdit('${s.id}')">${I.edit}</button>
          <button class="btn btn-ghost btn-sm t-error" onclick="SKUPage.delete('${s.id}')">${I.trash}</button>
        </td>
      </tr>`)
    ]).join('');

    setPage(`
      <div class="page-header">
        <div class="ph-left">
          <div class="ph-title">SKU Master</div>
          <div class="ph-subtitle">${total} L'Oréal Professional products · L'Oréal Code and EAN fields ready to fill in</div>
        </div>
        <div class="ph-actions">
          <button class="btn" onclick="SKUPage.openImport()">${I.upload} Import Excel</button>
          <button class="btn" onclick="SKUPage.exportCSV()">${I.download} Export</button>
          <button class="btn btn-primary" onclick="SKUPage.openAdd()">${I.plus} Add SKU</button>
        </div>
      </div>
      <div class="content">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>L'Oréal Code</th>
                <th>EAN</th>
                <th>System ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="5"><div class="empty-state"><div class="empty-title">No SKUs</div></div></td></tr>'}</tbody>
          </table>
        </div>
        <div style="margin-top:var(--sp-3)">
          <span class="t-xs">Excel import columns: System ID · L'Oréal Code · EAN · Product Name · Category</span>
        </div>
      </div>`);
  },

  openAdd() {
    const catList = Object.keys(Store.getSKUsByCategory()).map(c=>`<option value="${esc(c)}">`).join('');
    Drawer.open('Add SKU', '',
      `<div class="field" style="margin-bottom:var(--sp-3)">
        <label class="field-label">System ID *</label>
        <input class="input" id="as-id" placeholder="SH-ABSREP" autocomplete="off" style="text-transform:uppercase"/>
        <div class="field-hint">Internal identifier used in invoice imports</div>
      </div>
      <div class="field" style="margin-bottom:var(--sp-3)">
        <label class="field-label">Product name *</label>
        <input class="input" id="as-name" placeholder="Abs Rep Shampoo 300ml" autocomplete="off"/>
      </div>
      <div class="form-grid cols-2" style="margin-bottom:var(--sp-3)">
        <div class="field">
          <label class="field-label">L'Oréal Code</label>
          <input class="input" id="as-lor" placeholder="Add later"/>
          <div class="field-hint">Used on L'Oréal invoices</div>
        </div>
        <div class="field">
          <label class="field-label">EAN</label>
          <input class="input" id="as-ean" placeholder="Add later"/>
          <div class="field-hint">Barcode for V4 → GW</div>
        </div>
      </div>
      <div class="field">
        <label class="field-label">Category</label>
        <input class="input" id="as-cat" placeholder="Shampoo 300ml" list="cat-dl" autocomplete="off"/>
        <datalist id="cat-dl">${catList}</datalist>
      </div>`,
      `<button class="btn btn-ghost" onclick="Drawer.close()">Cancel</button>
       <button class="btn btn-primary" onclick="SKUPage.save()">Add SKU</button>`
    );
  },

  openEdit(id) {
    const s = Store.getSKU(id); if(!s) return;
    const catList = Object.keys(Store.getSKUsByCategory()).map(c=>`<option value="${esc(c)}">`).join('');
    Drawer.open('Edit SKU', esc(s.name),
      `<div class="field" style="margin-bottom:var(--sp-3)">
        <label class="field-label">Product name *</label>
        <input class="input" id="es-name" value="${esc(s.name)}"/>
      </div>
      <div class="form-grid cols-2" style="margin-bottom:var(--sp-3)">
        <div class="field">
          <label class="field-label">L'Oréal Code</label>
          <input class="input" id="es-lor" value="${esc(s.lorCode||'')}" placeholder="Add now"/>
          <div class="field-hint">Used on L'Oréal invoices</div>
        </div>
        <div class="field">
          <label class="field-label">EAN</label>
          <input class="input" id="es-ean" value="${esc(s.ean||'')}" placeholder="Add now"/>
          <div class="field-hint">Barcode for V4 → GW</div>
        </div>
      </div>
      <div class="field">
        <label class="field-label">Category</label>
        <input class="input" id="es-cat" value="${esc(s.cat||'')}" list="cat-dl2"/>
        <datalist id="cat-dl2">${catList}</datalist>
      </div>`,
      `<button class="btn btn-ghost" onclick="Drawer.close()">Cancel</button>
       <button class="btn btn-primary" onclick="SKUPage.saveEdit('${id}')">Save changes</button>`
    );
  },

  save() {
    try {
      Store.addSKU({
        id:      $id('as-id')?.value,
        name:    $id('as-name')?.value,
        lorCode: $id('as-lor')?.value,
        ean:     $id('as-ean')?.value,
        cat:     $id('as-cat')?.value || 'Other',
      });
      Drawer.close(); Toast.show('SKU added','success'); this.render();
    } catch(e) { Toast.show('Could not add SKU', e.message, 'error'); }
  },

  saveEdit(id) {
    try {
      Store.updateSKU(id, {
        name:    $id('es-name')?.value?.trim(),
        lorCode: $id('es-lor')?.value?.trim(),
        ean:     $id('es-ean')?.value?.trim(),
        cat:     $id('es-cat')?.value?.trim() || 'Other',
      });
      Drawer.close(); Toast.show('SKU updated','success'); this.render();
    } catch(e) { Toast.show('Could not update', e.message, 'error'); }
  },

  delete(id) {
    const s = Store.getSKU(id); if(!s) return;
    if (!confirm(`Remove "${s.name}" from master list?`)) return;
    Store.deleteSKU(id); Toast.show('SKU removed'); this.render();
  },

  openImport() {
    Drawer.open('Import SKUs from Excel', '',
      `<p class="t-secondary" style="margin-bottom:var(--sp-4);line-height:var(--leading-relaxed)">
        Upload an .xlsx file. Existing System IDs will be updated; new ones added. L'Oréal Code and EAN columns are optional.
      </p>
      <div class="card card-sm t-mono" style="margin-bottom:var(--sp-4);font-size:var(--text-xs);color:var(--color-text-secondary)">
        System ID &nbsp;|&nbsp; L'Oréal Code &nbsp;|&nbsp; EAN &nbsp;|&nbsp; Product Name &nbsp;|&nbsp; Category
      </div>
      <div class="upload-zone" onclick="$id('sku-xl').click()">
        ${I.upload}
        <span>Click to select .xlsx file</span>
      </div>
      <input type="file" id="sku-xl" accept=".xlsx,.xls" style="display:none" onchange="SKUPage.doImport(event)"/>`, ''
    );
  },

  doImport(e) {
    const f = e.target.files[0]; if(!f) return;
    Data.readExcel(f, wb => {
      const rows = Data.parseSKUXL(wb);
      const n    = Store.importSKUs(rows);
      Drawer.close(); Toast.show(`${n} SKUs imported`,'Existing records updated','success'); this.render();
    });
  },

  exportCSV() {
    Data.exportCSV('skus.csv', [
      ['System ID','L\'Oréal Code','EAN','Product Name','Category'],
      ...Store.getSKUs().map(s=>[s.id,s.lorCode||'',s.ean||'',s.name,s.cat||''])
    ]);
    Toast.show('SKU list exported','success');
  },
};
