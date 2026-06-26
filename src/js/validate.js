'use strict';
// ═══════════════════════════════════════════════════════════════
//  VALIDATION ENGINE
//  The single purpose of this application.
//
//  Rules:
//   Loreal→Dist qty  ≥  Dist→V4 qty   (per SKU)
//   Dist→V4 qty      ≥  V4→GW qty     (per SKU)
//
//  Output per SKU:
//   { skuId, lorQty, distQty, gwQty, stageA, stageB, status, reason }
//
//  stageA = lorQty - distQty   (≥0 = ok, <0 = loreal shortfall)
//  stageB = distQty - gwQty    (≥0 = ok, <0 = overshipment to GW)
//
//  Lot status:
//   'validated'  = all SKUs pass both rules
//   'failed'     = at least one SKU has a negative balance
//   'partial'    = invoices present but V4→GW not yet added
//   'open'       = no invoices at all
// ═══════════════════════════════════════════════════════════════

const Validate = {
  run(lot) {
    const invs = lot.invoices || [];
    const lorDist = sumInvLines(invs.filter(i => i.type === 'LOR_DIST'));
    const distV4  = sumInvLines(invs.filter(i => i.type === 'DIST_V4'));
    const v4GW    = sumInvLines(invs.filter(i => i.type === 'V4_GW'));

    const allIds = new Set([
      ...Object.keys(lorDist),
      ...Object.keys(distV4),
      ...Object.keys(v4GW),
    ]);

    if (allIds.size === 0) {
      return { skuLines: [], status: 'open', summary: { total:0, ok:0, failed:0, warning:0 } };
    }

    const hasGW    = invs.some(i => i.type === 'V4_GW');
    const hasDist  = invs.some(i => i.type === 'DIST_V4');
    const hasLoreal= invs.some(i => i.type === 'LOR_DIST');

    const skuLines = [...allIds].map(skuId => {
      const lorQty  = lorDist[skuId] || 0;
      const distQty = distV4[skuId]  || 0;
      const gwQty   = v4GW[skuId]    || 0;
      const stageA  = lorQty  - distQty;  // Loreal surplus/deficit vs Dist
      const stageB  = distQty - gwQty;    // Dist surplus/deficit vs GW

      let status = 'ok', reasons = [];

      // Rule 1: Loreal must cover Dist
      if (hasLoreal && distQty > 0 && stageA < 0) {
        status = 'failed';
        reasons.push(`L'Oréal supplied ${lorQty} but distributor sent ${distQty} to V4 (${Math.abs(stageA)} unit shortfall)`);
      }
      // Rule 2: Dist must cover GW
      if (hasGW && gwQty > 0 && stageB < 0) {
        status = 'failed';
        reasons.push(`Distributor supplied ${distQty} but V4 shipped ${gwQty} to GW (${Math.abs(stageB)} units overshipped)`);
      }
      // Warning: Dist→V4 exists but no Loreal invoice
      if (hasDist && distQty > 0 && !hasLoreal) {
        if (status === 'ok') status = 'warning';
        reasons.push('No L\'Oréal invoice found for this lot');
      }
      // Warning: positive balance at V4 (not yet shipped)
      if (hasGW && stageB > 0 && status === 'ok') {
        status = 'warning';
        reasons.push(`${stageB} units received at V4 not yet shipped to GW`);
      }

      return { skuId, lorQty, distQty, gwQty, stageA, stageB, status, reasons };
    });

    const summary = {
      total:   skuLines.length,
      ok:      skuLines.filter(l => l.status === 'ok').length,
      failed:  skuLines.filter(l => l.status === 'failed').length,
      warning: skuLines.filter(l => l.status === 'warning').length,
    };

    let lotStatus;
    if (!hasGW && !hasDist) lotStatus = 'open';
    else if (summary.failed > 0) lotStatus = 'failed';
    else if (!hasGW || !hasDist) lotStatus = 'partial';
    else if (summary.warning > 0) lotStatus = 'partial';
    else lotStatus = 'validated';

    return { skuLines, status: lotStatus, summary };
  },

  // Run and persist status on a lot
  runAndSave(lotId) {
    const lot = Store.getLot(lotId);
    if (!lot) return null;
    const result = this.run(lot);
    Store.updateLot(lotId, { validation: result, status: result.status });
    return result;
  },
};

function sumInvLines(invList) {
  const m = {};
  (invList || []).forEach(inv =>
    (inv.lines || []).forEach(l => { m[l.skuId] = (m[l.skuId] || 0) + (l.qty || 0); })
  );
  return m;
}
