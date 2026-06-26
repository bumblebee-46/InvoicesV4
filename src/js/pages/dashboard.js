'use strict';
function renderDashboard() {
  const st  = Store.getStats();
  const lots = Store.getLots();
  // Re-validate all lots for up-to-date counts
  lots.forEach(l => { if(!l.validation) Validate.runAndSave(l.id); });
  const validated = lots.filter(l=>l.status==='validated').length;
  const failed    = lots.filter(l=>l.status==='failed').length;
  const partial   = lots.filter(l=>l.status==='partial').length;
  const open      = lots.filter(l=>l.status==='open').length;
  const total     = lots.length;
  const rate      = total ? Math.round(validated/total*100) : 0;

  const kpis = [
    {label:'Total Shipments',      value:total,     sub:'all time',                cls:'',            vcls:''},
    {label:'Validated',            value:validated,  sub:'quantity checks passed',  cls:'accent-green',vcls:'c-green'},
    {label:'Failed Validation',    value:failed,     sub:'quantity mismatches found',cls:failed?'accent-red':'', vcls:failed?'c-red':''},
    {label:'Awaiting Completion',  value:partial+open,sub:'partial or not started', cls:'',            vcls:'c-amber'},
    {label:'Validation Rate',      value:total?rate+'%':'—', sub:'shipments fully validated', cls:rate===100&&total>0?'accent-green':'',vcls:rate===100&&total>0?'c-green':rate<70&&total>0?'c-amber':''},
    {label:'SKUs Tracked',         value:st.skus,   sub:'in master list',           cls:'accent-indigo',vcls:'c-indigo'},
  ];

  const kpiHTML = kpis.map(k=>`
    <div class="kpi-card ${k.cls}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${k.vcls}">${fmtNum(k.value)}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join('');

  const recentRows = lots.slice(0,12).map(lot=>{
    const v = lot.validation || Validate.run(lot);
    const invCount = lot.invoices.length;
    return `<tr class="clickable" onclick="Nav.go('lot','${lot.id}')">
      <td class="p">${esc(lot.name)}</td>
      <td>${esc(lot.dist||'—')}</td>
      <td>${lotStatusBadge(lot.status)}</td>
      <td class="r">${invCount}</td>
      <td class="r">${v.summary?.total||0} SKUs</td>
      <td class="r ${v.summary?.failed>0?'fail':v.summary?.warning>0?'warn':'ok'}">
        ${v.summary?.failed>0?`${v.summary.failed} failed`:v.summary?.warning>0?`${v.summary.warning} warnings`:'—'}
      </td>
      <td class="r" style="font-size:11px;color:var(--text-3)">${timeAgo(lot.updatedAt)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="7"><div class="empty">${SVG.lot}<p>No shipment lots yet</p><span>Create your first lot to get started</span></div></td></tr>`;

  setPage(`
    <div class="ph">
      <div>
        <div class="ph-title">Dashboard</div>
        <div class="ph-sub">L'Oréal → Distributor → V4 India → GW UK · Quantity Validation</div>
      </div>
      <div class="ph-actions">
        <button class="btn btn-primary" onclick="Lots.openCreate()">${SVG.plus} New shipment lot</button>
      </div>
    </div>

    <div class="content">
      <div class="kpi-grid" style="margin-bottom:24px">${kpiHTML}</div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:13px;font-weight:600;color:var(--text-1)">Recent shipments</div>
        <button class="btn btn-ghost btn-sm" onclick="Nav.go('lots')">View all →</button>
      </div>
      <div class="table-wrap">
        <table class="gt">
          <thead>
            <tr>
              <th>Lot</th><th>Distributor</th><th>Status</th>
              <th class="r">Invoices</th><th class="r">SKUs</th>
              <th class="r">Issues</th><th class="r">Updated</th>
            </tr>
          </thead>
          <tbody>${recentRows}</tbody>
        </table>
      </div>
    </div>`);
}
