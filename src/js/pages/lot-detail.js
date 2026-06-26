'use strict';
const LotDetail = {
  id: null,
  tab: 'validation',

  render(lotId, tab) {
    this.id  = lotId;
    this.tab = tab || this.tab || 'validation';
    const lot = Store.getLot(lotId);
    if (!lot) { setPage('<div class="content"><div class="empty-state">'+I.lot+'<div class="empty-title">Lot not found</div></div></div>'); return; }

    const v      = Validate.runAndSave(lotId);
    const skuMap = Store.getSKUMap();

    // ── Status banner ─────────────────────────
    const bannerCfg = {
      validated:{ cls:'alert-success', icon:I.check,   title:'Fully Validated',   detail:`All ${v.summary.total} SKUs pass quantity checks across all three stages.` },
      failed:   { cls:'alert-error',   icon:I.x,       title:'Validation Failed',  detail:`${v.summary.failed} SKU${v.summary.failed!==1?'s':''} have quantity mismatches. Review the Validation tab for details.` },
      partial:  { cls:'alert-warning', icon:I.warning,  title:'Incomplete Data',    detail:`Some invoices may be missing. Add all three stage invoices to complete validation.` },
      open:     { cls:'alert-info',    icon:I.info,    title:'No Data Yet',        detail:`Add invoices for each stage to begin quantity validation.` },
    };
    const b = bannerCfg[v.status] || bannerCfg.open;
    const banner = `
      <div class="alert ${b.cls}" style="margin-bottom:var(--sp-4)">
        ${b.icon}
        <div class="alert-body">
          <div class="alert-title">${b.title}</div>
          <div class="alert-detail">${b.detail}</div>
        </div>
        <div style="flex-shrink:0">${lotBadge(v.status)}</div>
      </div>`;

    // ── Pipeline ──────────────────────────────
    const lorInvs  = lot.invoices.filter(i=>i.type==='LOR_DIST');
    const distInvs = lot.invoices.filter(i=>i.type==='DIST_V4');
    const gwInvs   = lot.invoices.filter(i=>i.type==='V4_GW');
    const pipeline = `
      <div class="pipeline" style="margin-bottom:var(--sp-5)">
        <div class="pipeline-stage ${lorInvs.length?'complete':''}">
          ${lorInvs.length ? I.check : ''} L'Oréal → Dist${lorInvs.length?` (${lorInvs.length})`:''}
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-stage ${distInvs.length?'complete':''}">
          ${distInvs.length ? I.check : ''} Dist → V4${distInvs.length?` (${distInvs.length})`:''}
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-stage ${gwInvs.length?'complete':''}">
          ${gwInvs.length ? I.check : ''} V4 → GW${gwInvs.length?` (${gwInvs.length})`:''}
        </div>
      </div>`;

    // ── Tabs ──────────────────────────────────
    const tabs = [
      {id:'validation', label:`Validation ${v.summary.failed?`<span class="badge badge-error" style="margin-left:4px">${v.summary.failed}</span>`:''}`},
      {id:'invoices',   label:`Invoices <span class="badge badge-neutral" style="margin-left:4px">${lot.invoices.length}</span>`},
      {id:'notes',      label:`Notes ${lot.lotNotes.length?`<span class="badge badge-neutral" style="margin-left:4px">${lot.lotNotes.length}</span>`:''}`},
    ];
    const tabBar = `
      <div class="tabs" style="margin:0 0 var(--sp-5)">
        ${tabs.map(t=>`<div class="tab-btn ${this.tab===t.id?'active':''}" onclick="LotDetail.tab='${t.id}';LotDetail.render('${lotId}','${t.id}')">${t.label}</div>`).join('')}
      </div>`;

    // ── Tab: Validation ───────────────────────
    let tabContent = '';
    if (this.tab === 'validation') {
      const valRows = v.skuLines.length ? v.skuLines.map(line => {
        const sku  = skuMap[line.skuId];
        const name = sku ? sku.name : line.skuId;
        const bA   = line.balA < 0 ? 'error' : line.balA === 0 ? 'success' : 'warning';
        const bB   = line.balB < 0 ? 'error' : line.balB === 0 ? 'success' : 'warning';
        const stCls= line.status === 'ok' ? 'success' : line.status === 'failed' ? 'error' : 'warning';
        const stTxt= line.status === 'ok' ? '✓ Valid' : line.status === 'failed' ? '✗ Failed' : '⚠ Warning';
        return `<tr>
          <td class="primary" style="max-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${esc(name)}<br>
            <span class="t-tertiary" style="font-family:var(--font-mono);font-size:var(--text-xs)">${esc(line.skuId)}</span>
          </td>
          <td class="num">${line.lorQty  || '—'}</td>
          <td class="num">${line.distQty || '—'}</td>
          <td class="num">${line.gwQty   || '—'}</td>
          <td class="${bA} num">${(line.lorQty||line.distQty) ? (line.balA>=0?'+':'')+line.balA : '—'}</td>
          <td class="${bB} num">${(line.distQty||line.gwQty)  ? (line.balB>=0?'+':'')+line.balB : '—'}</td>
          <td class="${stCls}" style="text-align:right;white-space:nowrap">${stTxt}</td>
          <td class="t-tertiary" style="font-size:var(--text-xs);max-width:200px">${line.reasons.map(r=>esc(r)).join('<br>')}</td>
        </tr>`;
      }).join('') : `<tr><td colspan="8"><div class="empty-state" style="padding:var(--sp-8)">
        <div class="empty-title">No quantity data yet</div>
        <div class="empty-body">Add invoices for all three stages to run quantity validation</div>
        <div class="empty-action"><button class="btn" onclick="LotDetail.tab='invoices';LotDetail.render('${lotId}','invoices')">Go to Invoices →</button></div>
      </div></td></tr>`;

      tabContent = `
        <div class="table-container scrollable">
          <table class="data-table">
            <thead>
              <tr>
                <th style="min-width:180px">SKU</th>
                <th class="r">L'Oréal→Dist</th>
                <th class="r">Dist→V4</th>
                <th class="r">V4→GW</th>
                <th class="r" title="L'Oréal qty minus Dist qty. Must be ≥ 0.">Bal A</th>
                <th class="r" title="Dist qty minus GW qty. Must be ≥ 0. Zero means lot closed.">Bal B</th>
                <th class="r">Status</th>
                <th style="min-width:180px">Detail</th>
              </tr>
            </thead>
            <tbody>${valRows}</tbody>
          </table>
        </div>
        <div style="margin-top:var(--sp-3);display:flex;gap:var(--sp-5);flex-wrap:wrap">
          <span class="t-xs"><span class="t-success">Bal A</span> = L'Oréal qty − Dist qty &nbsp;(must be ≥ 0)</span>
          <span class="t-xs"><span class="t-success">Bal B</span> = Dist qty − GW qty &nbsp;(0 = lot closed, &gt;0 = stock at V4)</span>
          <span class="t-xs"><span class="t-error">Negative</span> = validation failure requiring investigation</span>
        </div>
        <div style="margin-top:var(--sp-4);display:flex;gap:var(--sp-2)">
          <button class="btn btn-sm" onclick="LotDetail.exportCSV()">${I.download} Export validation CSV</button>
        </div>`;
    }

    // ── Tab: Invoices ─────────────────────────
    else if (this.tab === 'invoices') {
      const invSection = (type, invList) => {
        const meta  = INV_TYPE[type];
        const cards = invList.map(inv => {
          const qty = totalQty(inv.lines);
          const lineRows = inv.lines.map(l => {
            const s = skuMap[l.skuId];
            return `<tr><td class="primary">${s?esc(s.name):esc(l.skuId)}</td><td class="num">${l.qty}</td></tr>`;
          }).join('');
          return `
            <div class="inv-card">
              <div class="inv-card-head" onclick="LotDetail._toggleInv('${inv.id}')">
                <div class="inv-chevron" id="chv-${inv.id}">${I.chevronR}</div>
                <div style="flex:1;min-width:0">
                  <span class="t-body" style="font-weight:var(--weight-medium)">${esc(inv.num)}</span>
                  ${inv.supplierName?`<span class="t-tertiary" style="margin-left:var(--sp-2);font-size:var(--text-xs)">${esc(inv.supplierName)}</span>`:''}
                </div>
                <span class="t-secondary" style="font-size:var(--text-xs);flex-shrink:0">${fmtDate(inv.date)}</span>
                <span class="t-tertiary" style="font-size:var(--text-xs);margin-left:var(--sp-3);flex-shrink:0">${qty.toLocaleString()} units · ${inv.lines.length} SKUs</span>
                <button class="btn btn-ghost btn-icon btn-sm" style="margin-left:var(--sp-2);flex-shrink:0" onclick="event.stopPropagation();LotDetail.deleteInvoice('${inv.id}')" title="Delete">${I.trash}</button>
              </div>
              <div class="inv-card-body" id="body-${inv.id}">
                <div style="padding:var(--sp-3) var(--sp-4)">
                  <table class="data-table" style="font-size:var(--text-sm)">
                    <thead><tr><th>Product</th><th class="r">Qty</th></tr></thead>
                    <tbody>${lineRows||'<tr><td colspan="2" class="t-tertiary" style="text-align:center;padding:var(--sp-3)">No lines</td></tr>'}</tbody>
                  </table>
                </div>
              </div>
            </div>`;
        }).join('');

        return `
          <div style="margin-bottom:var(--sp-5)">
            <div class="section-label" style="margin-bottom:var(--sp-3)">${meta.label}</div>
            ${cards}
            <button class="btn btn-ghost btn-sm" style="width:100%;border:1px dashed var(--color-border-default);justify-content:center;margin-top:var(--sp-1)"
              onclick="LotDetail.openAddInvoice('${type}')">
              ${I.plus} Add ${esc(meta.short)} invoice
            </button>
          </div>`;
      };

      tabContent = `
        ${invSection('LOR_DIST', lorInvs)}
        ${invSection('DIST_V4',  distInvs)}
        ${invSection('V4_GW',    gwInvs)}`;
    }

    // ── Tab: Notes ────────────────────────────
    else if (this.tab === 'notes') {
      const noteItems = (lot.lotNotes||[]).slice().reverse().map(n => `
        <div class="note-item">
          <div class="note-text">${esc(n.text)}</div>
          <div class="note-time">${fmtDate(new Date(n.createdAt).toISOString().slice(0,10))} · ${timeAgo(n.createdAt)}</div>
        </div>`).join('');

      tabContent = `
        <div style="display:flex;gap:var(--sp-2);margin-bottom:var(--sp-4)">
          <input class="input" id="note-in" placeholder="Add a note about this shipment…" style="flex:1"
            onkeydown="if(event.key==='Enter')LotDetail.addNote()"/>
          <button class="btn" onclick="LotDetail.addNote()">Add note</button>
        </div>
        ${noteItems ? `<div class="card card-sm">${noteItems}</div>` : `<div class="empty-state">
          <div class="empty-title">No notes yet</div>
          <div class="empty-body">Add notes to track context, issues, or follow-ups for this shipment</div>
        </div>`}`;
    }

    setPage(`
      <div class="page-header">
        <div class="ph-left">
          <div class="ph-eyebrow" onclick="Nav.go('lots')">← Shipment Lots</div>
          <div class="ph-title">${esc(lot.name)}</div>
          <div class="ph-subtitle">${lot.dist?`Distributor: ${esc(lot.dist)} &nbsp;·&nbsp; `:''} Created ${fmtDate(new Date(lot.createdAt).toISOString().slice(0,10))}</div>
        </div>
        <div class="ph-actions">
          <button class="btn btn-sm" onclick="LotDetail.exportCSV()">${I.download} Export</button>
        </div>
      </div>

      <div class="content">
        ${banner}
        ${pipeline}
        ${tabBar}
        ${tabContent}
      </div>`);
  },

  _toggleInv(id) {
    const body = $id('body-' + id), chv = $id('chv-' + id);
    if (!body) return;
    const open = body.classList.toggle('open');
    if (chv) chv.classList.toggle('open', open);
  },

  openAddInvoice(type) {
    const meta = INV_TYPE[type];
    const showSupplier = type !== 'V4_GW';
    Drawer.open('Add Invoice', meta.label,
      `<div class="form-grid cols-2" style="margin-bottom:var(--sp-4)">
        <div class="field">
          <label class="field-label">Invoice number *</label>
          <input class="input" id="ai-num" placeholder="MH-2414-001" autocomplete="off"/>
        </div>
        <div class="field">
          <label class="field-label">Date *</label>
          <input class="input" id="ai-date" type="date"/>
        </div>
      </div>
      ${showSupplier?`<div class="field" style="margin-bottom:var(--sp-4)">
        <label class="field-label">Supplier / Distributor name</label>
        <input class="input" id="ai-sup" placeholder="e.g. Aara Pharma Ltd" autocomplete="off"/>
      </div>`:''}
      <div class="section-label" style="margin-bottom:var(--sp-3)">SKU Quantities</div>
      ${SKUEntry.build('ai')}
      <div style="margin-top:var(--sp-4)">
        <div class="section-label" style="margin-bottom:var(--sp-3)">Or import from Excel</div>
        <div class="upload-zone" onclick="$id('inv-xl-in').click()">
          ${I.upload}
          <span>Click to select .xlsx file</span>
          <span class="t-xs">Columns: Invoice No · Date · SKU ID · Qty</span>
        </div>
        <input type="file" id="inv-xl-in" accept=".xlsx,.xls" style="display:none" onchange="LotDetail.importXL(event,'${type}')"/>
      </div>`,
      `<button class="btn btn-ghost" onclick="Drawer.close()">Cancel</button>
       <button class="btn btn-primary" onclick="LotDetail.saveInvoice('${type}')">${I.plus} Save invoice</button>`
    );
    setTimeout(() => { const d=$id('ai-date'); if(d) d.value=new Date().toISOString().slice(0,10); }, 50);
  },

  saveInvoice(type) {
    const num = $id('ai-num')?.value.trim();
    const date= $id('ai-date')?.value;
    const sup = $id('ai-sup')?.value.trim() || '';
    if (!num || !date) { Toast.show('Required fields missing','Invoice number and date are required','error'); return; }
    const lines = SKUEntry.collect('ai');
    try {
      Store.addInvoice(this.id, {num, date, type, lines, supplierName:sup});
      Validate.runAndSave(this.id);
      Drawer.close();
      Toast.show('Invoice saved', `${lines.length} SKU line${lines.length!==1?'s':''} recorded`, 'success');
      this.render(this.id, 'invoices');
    } catch(e) { Toast.show('Could not save invoice', e.message, 'error'); }
  },

  importXL(event, type) {
    const f = event.target.files[0]; if(!f) return;
    Data.readExcel(f, wb => {
      const invs = Data.parseInvoiceXL(wb);
      let added=0, skipped=0;
      invs.forEach(inv => { try { Store.addInvoice(this.id,{...inv,type}); added++; } catch { skipped++; } });
      Validate.runAndSave(this.id);
      Drawer.close();
      Toast.show(`Imported ${added} invoice${added!==1?'s':''}`, skipped?`${skipped} skipped (duplicates)`:'', added>0?'success':'warning');
      this.render(this.id, 'invoices');
    });
  },

  deleteInvoice(invId) {
    if (!confirm('Delete this invoice and its quantity lines?')) return;
    Store.deleteInvoice(this.id, invId);
    Validate.runAndSave(this.id);
    Toast.show('Invoice deleted');
    this.render(this.id, this.tab);
  },

  addNote() {
    const el  = $id('note-in');
    const txt = el?.value.trim(); if(!txt) return;
    Store.addNote(this.id, txt);
    el.value = '';
    this.render(this.id, 'notes');
  },

  exportCSV() {
    const lot    = Store.getLot(this.id);
    const v      = lot.validation || Validate.run(lot);
    const skuMap = Store.getSKUMap();
    const hdr    = ['SKU ID','Product Name','L\'Oréal→Dist','Dist→V4','V4→GW','Balance A','Balance B','Status','Detail'];
    const rows   = v.skuLines.map(l => {
      const s = skuMap[l.skuId];
      return [l.skuId, s?.name||'', l.lorQty, l.distQty, l.gwQty, l.balA, l.balB, l.status, l.reasons.join('; ')];
    });
    Data.exportCSV(`${lot.name}-validation-${new Date().toISOString().slice(0,10)}.csv`, [hdr,...rows]);
    Toast.show('Exported', `${rows.length} SKU validation rows`, 'success');
  },
};
