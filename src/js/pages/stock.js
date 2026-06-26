'use strict';
function renderStockPage() {
  const pos = Store.getRunningStock();
  const skus = Store.getSKUs();
  const totalRecv = pos.reduce((s, p) => s + p.recv, 0);
  const totalSent = pos.reduce((s, p) => s + p.sent, 0);
  const totalBal = totalRecv - totalSent;
  const negCount = pos.filter(p => p.balance < 0).length;

  const kpiHTML = `<div class="kpi-grid">
    <div class="kpi-card accent"><div class="kpi-label">Total received at V4</div>
      <div class="kpi-value accent">${totalRecv.toLocaleString()}</div>
      <div class="kpi-sub">units from all distributors</div></div>
    <div class="kpi-card"><div class="kpi-label">Total shipped to GW</div>
      <div class="kpi-value">${totalSent.toLocaleString()}</div>
      <div class="kpi-sub">units sent to UK warehouse</div></div>
    <div class="kpi-card ${totalBal < 0 ? 'red' : totalBal === 0 ? 'green' : ''}">
      <div class="kpi-label">Net V4 position</div>
      <div class="kpi-value ${totalBal < 0 ? 'red' : totalBal === 0 ? 'green' : 'amber'}">${totalBal >= 0 ? '+' : ''}${totalBal.toLocaleString()}</div>
      <div class="kpi-sub">cumulative across all lots</div></div>
    <div class="kpi-card ${negCount > 0 ? 'red' : 'green'}">
      <div class="kpi-label">Overshipped SKUs</div>
      <div class="kpi-value ${negCount > 0 ? 'red' : 'green'}">${negCount}</div>
      <div class="kpi-sub">negative balance — investigate</div></div>
  </div>`;

  const tableRows = pos.length ? pos.map(p => {
    const sku = skus.find(s => s.code === p.code);
    const vcls = p.balance < 0 ? 'bal-neg' : p.balance === 0 ? 'bal-zero' : 'bal-pos';
    return `<tr>
      <td class="p">${sku ? sku.name : p.code}<br><span style="font-size:10px;font-family:monospace;color:var(--text-3)">${p.code}</span></td>
      <td class="r num">${p.recv.toLocaleString()}</td>
      <td class="r num">${p.sent.toLocaleString()}</td>
      <td class="r num ${vcls}">${p.balance >= 0 ? '+' : ''}${p.balance.toLocaleString()}</td>
    </tr>`;
  }).join('') : `<tr><td colspan="4"><div class="empty">${Icon.truck}<p>No stock data yet</p><span>Add Dist→V4 and V4→GW invoices</span></div></td></tr>`;

  setPage(`
    <div class="page-head">
      <div class="page-head-left">
        <div class="page-eyebrow">Stock</div>
        <div class="page-title">Running Stock Position</div>
        <div class="page-sub">Cumulative V4 balance — units received from distributors minus units shipped to GW</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-sm" onclick="exportStock()">${Icon.download} Export CSV</button>
      </div>
    </div>
    ${kpiHTML}
    <div class="table-section">
      <div class="table-header"><div class="table-title">Position by SKU</div></div>
      <div class="table-wrap">
        <table class="gt">
          <thead><tr><th>SKU</th><th class="r">Received (Dist→V4)</th><th class="r">Shipped (V4→GW)</th><th class="r">V4 Balance</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <div style="margin-top:10px;font-size:11px;color:var(--text-3);display:flex;gap:18px;flex-wrap:wrap">
        <span><span style="color:var(--green)">●</span> Zero — all received qty shipped</span>
        <span><span style="color:var(--amber)">●</span> Positive — stock held at V4</span>
        <span><span style="color:var(--red)">●</span> Negative — overshipped (investigate)</span>
      </div>
    </div>`);
}

function exportStock() {
  const pos = Store.getRunningStock();
  const skus = Store.getSKUs();
  const hdr = ['SKU Code', 'Product', 'Received at V4', 'Shipped to GW', 'V4 Balance'];
  const data = pos.map(p => { const s = skus.find(k => k.code === p.code); return [p.code, s?.name || '', p.recv, p.sent, p.balance]; });
  downloadCSV(`stock-${new Date().toISOString().slice(0, 10)}.csv`, [hdr, ...data]);
  toast('Exported', 'success');
}
