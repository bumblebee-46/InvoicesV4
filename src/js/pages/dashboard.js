'use strict';
function renderDashboard() {
  const st   = Store.getStats();
  const lots = Store.getLots();
  lots.forEach(l => { if (!l.validation) Validate.runAndSave(l.id); });

  const validated = lots.filter(l=>l.status==='validated').length;
  const failed    = lots.filter(l=>l.status==='failed').length;
  const pending   = lots.filter(l=>['open','partial'].includes(l.status)).length;
  const rate      = st.total ? Math.round(validated / st.total * 100) : 0;

  const kpis = [
    { label:'Total Shipments',       value:st.total,    sub:'all time',                        cls:'',            vc:'' },
    { label:'Validated',             value:validated,   sub:'quantity checks passed',           cls:'kpi-success', vc:'t-success' },
    { label:'Failed Validation',     value:failed,      sub:'quantity mismatches found',        cls:failed?'kpi-error':'', vc:failed?'t-error':'' },
    { label:'Awaiting Completion',   value:pending,     sub:'open or partially invoiced',       cls:'',            vc:'t-warning' },
    { label:'Validation Rate',       value:st.total?rate+'%':'—', sub:'shipments fully validated', cls:rate===100&&st.total?'kpi-success':'', vc:rate===100&&st.total?'t-success':rate<70&&st.total?'t-warning':'' },
    { label:'Products Tracked',      value:st.skus,     sub:'in SKU master',                   cls:'kpi-brand',   vc:'t-link' },
  ];

  const kpiHTML = kpis.map(k => `
    <div class="kpi-card ${k.cls}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${k.vc}">${fmtNum(k.value)}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join('');

  // Failed lots needing attention
  const failedLots = lots.filter(l => l.status === 'failed').slice(0, 5);
  const attentionHTML = failedLots.length ? failedLots.map(lot => {
    const v = lot.validation;
    const count = v?.summary?.failed || 0;
    return `<tr class="clickable" onclick="Nav.go('lot','${lot.id}')">
      <td class="primary">${esc(lot.name)}</td>
      <td>${esc(lot.dist || '—')}</td>
      <td><span class="badge badge-error"><span class="status-dot dot-error"></span>${count} SKU${count!==1?'s':''} failed</span></td>
      <td class="t-tertiary" style="font-size:var(--text-xs)">${timeAgo(lot.updatedAt)}</td>
    </tr>`;
  }).join('') : `<tr><td colspan="4"><div class="empty-state" style="padding:var(--sp-6) var(--sp-4)">
    <div class="empty-title">No issues found</div>
    <div class="empty-body">All shipments are either validated or pending data entry</div>
  </div></td></tr>`;

  // Recent rows
  const recentHTML = lots.slice(0,8).map(lot => {
    const v = lot.validation || {summary:{total:0,ok:0,failed:0,warning:0}};
    return `<tr class="clickable" onclick="Nav.go('lot','${lot.id}')">
      <td class="primary">${esc(lot.name)}</td>
      <td class="t-secondary">${esc(lot.dist || '—')}</td>
      <td>${lotBadge(lot.status)}</td>
      <td class="num">${v.summary.total}</td>
      <td class="${v.summary.failed>0?'error':v.summary.warning>0?'warning':'success'} num">
        ${v.summary.failed>0 ? `${v.summary.failed} failed` : v.summary.warning>0 ? `${v.summary.warning} warnings` : v.summary.ok > 0 ? `${v.summary.ok} ok` : '—'}
      </td>
      <td class="t-tertiary" style="font-size:var(--text-xs)">${timeAgo(lot.updatedAt)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6"><div class="empty-state">
    ${I.lot}
    <div class="empty-title">No shipment lots yet</div>
    <div class="empty-body">Create your first shipment lot to start tracking quantity validation</div>
    <div class="empty-action"><button class="btn btn-primary" onclick="Nav.go('lots')">${I.plus} Create first lot</button></div>
  </div></td></tr>`;

  setPage(`
    <div class="page-header">
      <div class="ph-left">
        <div class="ph-title">Dashboard</div>
        <div class="ph-subtitle">Supply chain quantity validation · L'Oréal → Distributor → V4 India → GW UK</div>
      </div>
      <div class="ph-actions">
        <button class="btn btn-primary" onclick="Lots.openCreate()">${I.plus} New shipment lot</button>
      </div>
    </div>

    <div class="content">
      <div class="kpi-grid" style="margin-bottom:var(--sp-8)">${kpiHTML}</div>

      ${failedLots.length ? `
        <div style="margin-bottom:var(--sp-6)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3)">
            <div class="t-title" style="display:flex;align-items:center;gap:var(--sp-2);color:var(--color-error-text)">
              ${I.warning} Requires Attention
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Lot</th><th>Distributor</th><th>Issue</th><th>Updated</th></tr></thead>
              <tbody>${attentionHTML}</tbody>
            </table>
          </div>
        </div>` : ''}

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3)">
        <div class="t-title">Recent Shipments</div>
        <button class="btn btn-ghost btn-sm" onclick="Nav.go('lots')">View all →</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Lot</th><th>Distributor</th><th>Status</th>
              <th class="r">SKUs</th><th class="r">Validation</th><th>Updated</th>
            </tr>
          </thead>
          <tbody>${recentHTML}</tbody>
        </table>
      </div>
    </div>`);
}
