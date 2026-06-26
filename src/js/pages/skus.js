'use strict';
const SKUPage = {
  render() {
    const cats = Store.getSKUsByCategory();
    const total = Store.getSKUs().length;

    const rows = Object.entries(cats).map(([cat, skus]) => `
      <tr class="cat-row"><td colspan="5">${esc(cat)}</td></tr>
      ${skus.map(s => `
        <tr>
          <td class="p">${esc(s.name)}</td>
          <td class="mono">${esc(s.lorCode||'—')}</td>
          <td class="mono">${esc(s.ean||'—')}</td>
          <td class="mono" style="color:var(--text-3)">${esc(s.id)}</td>
          <td class="r">
            <button class="btn btn-sm btn-ghost" onclick="SKUPage.openEdit('${s.id}')" style="margin-right:4px">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="SKUPage.delete('${s.id}')">${SVG.trash}</button>
          </td>
        </tr>`).join('')}`).join('');

    setPage(`
      <div class="ph">
        <div>
          <div class="ph-title">SKU Master</div>
          <div class="ph-sub">${total} products · L'Oréal Professional</div>
        </div>
        <div class="ph-actions">
          <button class="btn" onclick="SKUPage.openImportXL()">${SVG.upload} Import Excel</button>
          <button class="btn" onclick="SKUPage.exportCSV()">${SVG.download} Export</button>
          <button class="btn btn-primary" onclick="SKUPage.openAdd()">${SVG.plus} Add SKU</button>
        </div>
      </div>
      <div class="content">
        <div class="table-wrap">
          <table class="gt">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>L'Oréal Code</th>
                <th>EAN</th>
                <th>System ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows||'<tr><td colspan="5"><div class="empty"><p>No SKUs</p></div></td></tr>'}</tbody>
          </table>
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--text-3)">
          Excel import format: <span style="font-family:var(--mono);background:var(--surface-2);padding:2px 7px;border-radius:4px">System ID | L'Oréal Code | EAN | Product Name | Category</span>
        </div>
      </div>`);
  },

  openAdd() {
    Drawer.open('Add SKU', '',
      `<div class="field-group" style="margin-bottom:12px">
        <label class="field-label">System ID *</label>
        <input class="field-input" id="as-id" placeholder="SH-ABSREP" autocomplete="off" style="text-transform:uppercase"/>
      </div>
      <div class="field-group" style="margin-bottom:12px">
        <label class="field-label">Product name *</label>
        <input class="field-input" id="as-name" placeholder="Abs Rep Shampoo 300ml" autocomplete="off"/>
      </div>
      <div class="form-grid form-cols-2" style="margin-bottom:12px">
        <div class="field-group">
          <label class="field-label">L'Oréal Code</label>
          <input class="field-input" id="as-lor" placeholder="Leave blank for now"/>
        </div>
        <div class="field-group">
          <label class="field-label">EAN</label>
          <input class="field-input" id="as-ean" placeholder="Leave blank for now"/>
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Category</label>
        <input class="field-input" id="as-cat" placeholder="e.g. Shampoo 300ml" list="cat-list" autocomplete="off"/>
        <datalist id="cat-list">
          ${Object.keys(Store.getSKUsByCategory()).map(c=>`<option value="${esc(c)}">`).join('')}
        </datalist>
      </div>`,
      `<button class="btn btn-ghost" onclick="Drawer.close()">Cancel</button>
       <button class="btn btn-primary" onclick="SKUPage.save()">Add SKU</button>`
    );
  },

  openEdit(id) {
    const s = Store.getSKU(id); if(!s) return;
    Drawer.open('Edit SKU', esc(s.name),
      `<div class="field-group" style="margin-bottom:12px">
        <label class="field-label">Product name *</label>
        <input class="field-input" id="es-name" value="${esc(s.name)}"/>
      </div>
      <div class="form-grid form-cols-2" style="margin-bottom:12px">
        <div class="field-group">
          <label class="field-label">L'Oréal Code</label>
          <input class="field-input" id="es-lor" value="${esc(s.lorCode||'')}"/>
        </div>
        <div class="field-group">
          <label class="field-label">EAN</label>
          <input class="field-input" id="es-ean" value="${esc(s.ean||'')}"/>
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Category</label>
        <input class="field-input" id="es-cat" value="${esc(s.cat||'')}" list="cat-list2"/>
        <datalist id="cat-list2">
          ${Object.keys(Store.getSKUsByCategory()).map(c=>`<option value="${esc(c)}">`).join('')}
        </datalist>
      </div>`,
      `<button class="btn btn-ghost" onclick="Drawer.close()">Cancel</button>
       <button class="btn btn-primary" onclick="SKUPage.saveEdit('${id}')">Save</button>`
    );
  },

  save() {
    const id   = $id('as-id')?.value.trim().toUpperCase();
    const name = $id('as-name')?.value.trim();
    const lor  = $id('as-lor')?.value.trim();
    const ean  = $id('as-ean')?.value.trim();
    const cat  = $id('as-cat')?.value.trim() || 'Other';
    try { Store.addSKU({id,name,lorCode:lor,ean,cat}); Drawer.close(); Toast.show('SKU added','success'); this.render(); }
    catch(e) { Toast.show(e.message,'error'); }
  },

  saveEdit(id) {
    const name = $id('es-name')?.value.trim();
    const lor  = $id('es-lor')?.value.trim();
    const ean  = $id('es-ean')?.value.trim();
    const cat  = $id('es-cat')?.value.trim() || 'Other';
    try { Store.updateSKU(id,{name,lorCode:lor,ean,cat}); Drawer.close(); Toast.show('Saved','success'); this.render(); }
    catch(e) { Toast.show(e.message,'error'); }
  },

  delete(id) {
    const s = Store.getSKU(id); if(!s) return;
    if(!confirm(`Remove ${s.name}?`)) return;
    Store.deleteSKU(id); Toast.show('Removed'); this.render();
  },

  openImportXL() {
    Drawer.open('Import SKUs from Excel', '',
      `<p style="font-size:13px;color:var(--text-2);margin-bottom:14px;line-height:1.7">
        One row per SKU. Existing System IDs will be updated, new ones added.
      </p>
      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 13px;margin-bottom:14px;font-family:var(--mono);font-size:12px;color:var(--text-2)">
        System ID | L'Oréal Code | EAN | Product Name | Category
      </div>
      <div class="upload-zone" onclick="$id('sku-xl').click()">
        ${SVG.upload}<span>Click to select .xlsx file</span>
      </div>
      <input type="file" id="sku-xl" accept=".xlsx,.xls" style="display:none" onchange="SKUPage.doImportXL(event)"/>`, ''
    );
  },

  doImportXL(e) {
    const f = e.target.files[0]; if(!f) return;
    Data.readExcel(f, wb => {
      const rows = Data.parseSKUXL(wb);
      const n = Store.importSKUs(rows);
      Drawer.close(); Toast.show(`${n} SKUs imported/updated`,'success'); this.render();
    });
  },

  exportCSV() {
    const skus = Store.getSKUs();
    Data.exportCSV('skus.csv', [
      ['System ID','Loreal Code','EAN','Product Name','Category'],
      ...skus.map(s=>[s.id,s.lorCode||'',s.ean||'',s.name,s.cat||''])
    ]);
    Toast.show('Exported','success');
  },
};
