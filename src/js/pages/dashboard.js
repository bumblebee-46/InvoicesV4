'use strict';
function renderDashboard() {
  const st = Store.getStats();
  const lots = Store.getLots();
  const recent = Store.getInvoices().sort((a, b) => b.id - a.id).slice(0, 10);

  let clean = 0, issues = 0, inprog = 0;
  lots.forEach(lot => {
    const r = calcTally(lot);
    if (r.hasIssue) issues++;
    else if (r.closed) clean++;
    else if (r.rows.length > 0) inprog++;
  });

  const kpis = [
    { label: 'Total invoices', value: st.total, sub: `across ${st.lots} lot${st.lots !== 1 ? 's' : ''}`, cls: 'accent', vcls: 'accent' },
    { label: 'Lots closed', value: clean, sub: 'fully reconciled', cls: 'green', vcls: 'green' },
    { label: 'In progress', value: inprog, sub: 'partially shipped to GW', cls: '', vcls: 'amber' },
    { label: 'Issues', value: issues, sub: 'qty shortfalls found', cls: issues > 0 ? 'red' : '', vcls: issues > 0 ? 'red' : '' },
  ];

  const kpiHTML = kpis.map(k => `
    <div class="kpi-card ${k.cls}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${k.vcls}">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join('');

  const typeRows = Object.entries(INV_META).map(([k, v]) => `
    <tr onclick="navigate('inv-${k}')" style="cursor:pointer">
      <td class="p"><span class="badge ${v.badge}">${v.label}</span></td>
      <td class="r num">${st.byType[k] || 0}</td>
    </tr>`).join('');

  const lotRows = lots.length ? lots.map(lot => {
    const invs = Store.getByLot(lot);
    const r = calcTally(lot);
    const badge = r.rows.length === 0 ? '<span class="badge b-gray">no lines</span>'
      : r.hasIssue ? '<span class="badge b-red">issues</span>'
      : r.closed ? '<span class="badge b-green">closed</span>'
      : '<span class="badge b-amber">in progress</span>';
    return `<tr onclick="navigate('tally','${lot}')" style="cursor:pointer">
      <td class="p mono">${lot}</td>
      <td class="num r">${invs.length}</td>
      <td class="r">${badge}</td>
    </tr>`;
  }).join('') : `<tr><td colspan="3"><div class="empty"><p>No lots yet</p><span>Add invoices to get started</span></div></td></tr>`;

  const recentRows = recent.length ? recent.map(inv => `
    <tr onclick="navigate('inv-${inv.type}')" style="cursor:pointer">
      <td class="p mono">${inv.num}</td>
      <td><span class="badge ${typeBadge(inv.type)}">${typeLabel(inv.type)}</span></td>
      <td><span class="badge b-gray">${inv.lot}</span></td>
      <td class="r">${fmtDate(inv.date)}</td>
      <td class="r num">${totalQty(inv.lines)}</td>
    </tr>`).join('') : `<tr><td colspan="5"><div class="empty"><p>No invoices yet</p></div></td></tr>`;

  setPage(`
    <div class="page-head">
      <div class="page-head-left">
        <div class="page-eyebrow">Overview</div>
        <div class="page-title">Dashboard</div>
        <div class="page-sub">Loreal Professional · India → UK supply chain</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="navigate('inv-LOR_AARA')">${Icon.plus} New invoice</button>
      </div>
    </div>
    <div class="kpi-grid">${kpiHTML}</div>
    <div class="table-section">
      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:16px;margin-bottom:20px">
        <div>
          <div class="table-header"><div class="table-title">Invoices by flow</div></div>
          <div class="table-wrap">
            <table class="gt"><thead><tr><th>Flow</th><th class="r">Count</th></tr></thead>
            <tbody>${typeRows}</tbody></table>
          </div>
        </div>
        <div>
          <div class="table-header">
            <div class="table-title">Lots</div>
            <button class="btn btn-sm btn-ghost" onclick="navigate('tally')">View tally →</button>
          </div>
          <div class="table-wrap">
            <table class="gt"><thead><tr><th>Lot</th><th class="r">Invoices</th><th class="r">Status</th></tr></thead>
            <tbody>${lotRows}</tbody></table>
          </div>
        </div>
      </div>
      <div class="table-header"><div class="table-title">Recent invoices</div></div>
      <div class="table-wrap">
        <table class="gt">
          <thead><tr><th>Invoice no.</th><th>Flow</th><th>Lot</th><th class="r">Date</th><th class="r">Total qty</th></tr></thead>
          <tbody>${recentRows}</tbody>
        </table>
      </div>
    </div>`);
}
