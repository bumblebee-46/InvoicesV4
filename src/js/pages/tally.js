'use strict';

function calcTally(lot) {
  const invs = Store.getByLot(lot);
  const lorAara   = invs.filter(i => i.type === 'LOR_AARA');
  const lorAditi  = invs.filter(i => i.type === 'LOR_ADITI');
  const lorOthers = invs.filter(i => i.type === 'LOR_OTHERS');
  const aaraV4    = invs.filter(i => i.type === 'AARA_V4');
  const aditiV4   = invs.filter(i => i.type === 'ADITI_V4');
  const othersV4  = invs.filter(i => i.type === 'OTHERS_V4');
  const v4GW      = invs.filter(i => i.type === 'V4_GW');

  const qLA  = getQtyMap(lorAara);
  const qLAd = getQtyMap(lorAditi);
  const qLO  = getQtyMap(lorOthers);
  const qAV4 = getQtyMap(aaraV4);
  const qDV4 = getQtyMap(aditiV4);
  const qOV4 = getQtyMap(othersV4);
  const qGW  = getQtyMap(v4GW);

  const allCodes = new Set([
    ...Object.keys(qLA), ...Object.keys(qLAd), ...Object.keys(qLO),
    ...Object.keys(qAV4), ...Object.keys(qDV4), ...Object.keys(qOV4),
    ...Object.keys(qGW),
  ]);

  const rows = [...allCodes].map(code => {
    const fromAara   = qAV4[code] || 0;
    const fromAditi  = qDV4[code] || 0;
    const fromOthers = qOV4[code] || 0;

    // One distributor per SKU — whichever has qty
    const dist = fromAara > 0 ? 'Aara' : fromAditi > 0 ? 'Aditi' : fromOthers > 0 ? 'Others' : '—';
    const lorQty = dist === 'Aara' ? (qLA[code] || 0)
      : dist === 'Aditi' ? (qLAd[code] || 0)
      : dist === 'Others' ? (qLO[code] || 0)
      : (qLA[code] || 0) + (qLAd[code] || 0) + (qLO[code] || 0);

    const distV4 = fromAara + fromAditi + fromOthers;
    const gw = qGW[code] || 0;
    const balA = lorQty - distV4;   // Loreal→Dist surplus
    const balB = distV4 - gw;       // V4 stock balance

    return { code, dist, lorQty, distV4, balA, gw, balB, ok: balA >= 0 && balB >= 0 && gw > 0 };
  });

  return {
    rows,
    invCounts: { lorAara: lorAara.length, lorAditi: lorAditi.length, lorOthers: lorOthers.length, aaraV4: aaraV4.length, aditiV4: aditiV4.length, othersV4: othersV4.length, v4GW: v4GW.length },
    closed: rows.length > 0 && rows.every(r => r.balB === 0 && r.balA >= 0),
    hasIssue: rows.some(r => r.balA < 0 || r.balB < 0),
  };
}

function renderTallyPage(preselected) {
  const lots = Store.getLots();
  const sel = preselected || lots[0] || '';
  const lotOpts = lots.map(l => `<option value="${l}" ${l === sel ? 'selected' : ''}>${l}</option>`).join('');

  let kpiHTML = '', tableHTML = '';

  if (sel) {
    const r = calcTally(sel);
    const skus = Store.getSKUs();
    const total = r.rows.length;
    const okCount = r.rows.filter(x => x.ok).length;
    const negB = r.rows.filter(x => x.balB < 0).length;
    const negA = r.rows.filter(x => x.balA < 0).length;
    const v4Stock = r.rows.reduce((s, x) => s + (x.balB > 0 ? x.balB : 0), 0);
    const pct = total ? Math.round(okCount / total * 100) : 0;
    const statusBadge = r.closed ? '<span class="badge b-green">Closed ✓</span>'
      : r.hasIssue ? '<span class="badge b-red">Issues found</span>'
      : '<span class="badge b-amber">In progress</span>';

    kpiHTML = `<div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Lot status</div><div style="margin-top:10px">${statusBadge}</div>
        <div class="kpi-sub">${r.invCounts.v4GW} GW shipment${r.invCounts.v4GW !== 1 ? 's' : ''} · ${r.invCounts.aaraV4 + r.invCounts.aditiV4 + r.invCounts.othersV4} dist invoices</div>
      </div>
      <div class="kpi-card ${negA > 0 ? 'red' : ''}">
        <div class="kpi-label">Bal A issues</div>
        <div class="kpi-value ${negA > 0 ? 'red' : 'green'}">${negA}</div>
        <div class="kpi-sub">Loreal shortfall vs dist</div>
      </div>
      <div class="kpi-card ${negB > 0 ? 'red' : r.closed ? 'green' : ''}">
        <div class="kpi-label">V4 stock held</div>
        <div class="kpi-value ${negB > 0 ? 'red' : 'amber'}">${negB > 0 ? negB + ' neg' : '+' + v4Stock}</div>
        <div class="kpi-sub">${negB > 0 ? 'units overshipped' : 'units pending GW'}</div>
      </div>
      <div class="kpi-card ${pct === 100 ? 'green' : ''}">
        <div class="kpi-label">SKUs reconciled</div>
        <div class="kpi-value ${pct === 100 ? 'green' : pct > 50 ? 'amber' : 'red'}">${pct}%</div>
        <div class="kpi-sub">${okCount} of ${total} SKUs fully matched</div>
      </div>
    </div>`;

    if (r.rows.length) {
      const distBadge = d => d === 'Aara' ? '<span class="badge b-cyan" style="font-size:10px">Aara</span>'
        : d === 'Aditi' ? '<span class="badge b-purple" style="font-size:10px">Aditi</span>'
        : d === 'Others' ? '<span class="badge b-orange" style="font-size:10px">Others</span>'
        : '<span class="badge b-gray" style="font-size:10px">—</span>';

      const tRows = r.rows.map(row => {
        const sku = skus.find(s => s.code === row.code);
        const bAcls = row.balA < 0 ? 'bal-neg' : row.balA === 0 ? 'bal-zero' : 'bal-pos';
        const bBcls = row.balB < 0 ? 'bal-neg' : row.balB === 0 ? 'bal-zero' : 'bal-pos';
        const hasData = row.lorQty || row.distV4 || row.gw;
        return `<tr>
          <td class="p">${sku ? sku.name : row.code}<br><span style="font-size:10px;font-family:monospace;color:var(--text-3)">${row.code}</span></td>
          <td>${distBadge(row.dist)}</td>
          <td class="r num">${row.lorQty || '—'}</td>
          <td class="r num">${row.distV4 || '—'}</td>
          <td class="r num ${hasData ? bAcls : ''}">${hasData ? balStr(row.balA) : '—'}</td>
          <td class="r num">${row.gw || '—'}</td>
          <td class="r num ${hasData ? bBcls : ''}">${hasData ? balStr(row.balB) : '—'}</td>
          <td class="r ${row.ok ? 'chk-ok' : 'chk-bad'}">${hasData ? (row.ok ? '✓' : '✗') : '—'}</td>
        </tr>`;
      }).join('');

      tableHTML = `
        <div class="table-section">
          <div class="table-header">
            <div class="table-title">SKU reconciliation — ${sel}</div>
            <button class="btn btn-sm" onclick="exportTally('${sel}')">${Icon.download} Export CSV</button>
          </div>
          <div class="table-wrap">
            <table class="gt">
              <thead>
                <tr>
                  <th>SKU</th><th>Distributor</th>
                  <th class="r">Loreal→Dist</th><th class="r">Dist→V4</th><th class="r">Bal A</th>
                  <th class="r">V4→GW</th><th class="r">Bal B</th><th class="r">Status</th>
                </tr>
              </thead>
              <tbody>${tRows}</tbody>
            </table>
          </div>
          <div style="margin-top:10px;font-size:11px;color:var(--text-3);display:flex;gap:18px;flex-wrap:wrap">
            <span><span style="color:var(--green)">●</span> 0 = reconciled</span>
            <span><span style="color:var(--amber)">●</span> +N = surplus (OK)</span>
            <span><span style="color:var(--red)">●</span> -N = shortfall (action needed)</span>
          </div>
        </div>`;
    } else {
      tableHTML = `<div class="table-section"><div class="empty">${Icon.pkg}<p>No lines in lot ${sel}</p><span>Add invoices first</span></div></div>`;
    }
  }

  setPage(`
    <div class="page-head">
      <div class="page-head-left">
        <div class="page-eyebrow">Reconciliation</div>
        <div class="page-title">Lot Tally</div>
        <div class="page-sub">Loreal → Distributor → V4 → GW quantity verification</div>
      </div>
    </div>
    <div class="lot-bar">
      <label>Lot</label>
      <select onchange="switchTallyLot(this.value)">
        ${lots.length ? lotOpts : '<option value="">No lots yet</option>'}
      </select>
    </div>
    ${kpiHTML}${tableHTML}`);
}

function switchTallyLot(lot) {
  _currentArg = lot;
  renderTallyPage(lot);
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  $('[data-page="tally"]')?.classList.add('active');
}

function exportTally(lot) {
  const r = calcTally(lot);
  const skus = Store.getSKUs();
  const hdr = ['SKU Code', 'Product', 'Distributor', 'Loreal→Dist', 'Dist→V4', 'Bal A', 'V4→GW', 'Bal B', 'Status'];
  const data = r.rows.map(x => {
    const s = skus.find(k => k.code === x.code);
    return [x.code, s?.name || '', x.dist, x.lorQty, x.distV4, x.balA, x.gw, x.balB, x.ok ? 'OK' : 'ISSUE'];
  });
  downloadCSV(`tally-${lot}-${new Date().toISOString().slice(0, 10)}.csv`, [hdr, ...data]);
  toast('Tally exported', 'success');
}
