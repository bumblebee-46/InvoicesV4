'use strict';
const Validate = {
  run(lot) {
    const invs = lot.invoices || [];
    const lorDist = _sum(invs.filter(i=>i.type==='LOR_DIST'));
    const distV4  = _sum(invs.filter(i=>i.type==='DIST_V4'));
    const v4GW    = _sum(invs.filter(i=>i.type==='V4_GW'));
    const allIds  = new Set([...Object.keys(lorDist),...Object.keys(distV4),...Object.keys(v4GW)]);

    if (!allIds.size) return {skuLines:[],status:'open',summary:{total:0,ok:0,failed:0,warning:0}};

    const hasLoreal = invs.some(i=>i.type==='LOR_DIST');
    const hasDist   = invs.some(i=>i.type==='DIST_V4');
    const hasGW     = invs.some(i=>i.type==='V4_GW');

    const skuLines = [...allIds].map(skuId => {
      const lorQty  = lorDist[skuId] || 0;
      const distQty = distV4[skuId]  || 0;
      const gwQty   = v4GW[skuId]    || 0;
      const balA    = lorQty - distQty;
      const balB    = distQty - gwQty;
      let status = 'ok', reasons = [];

      if (hasLoreal && distQty > 0 && balA < 0) {
        status = 'failed';
        reasons.push(`L'Oréal supplied ${lorQty} but distributor invoiced ${distQty} to V4 — shortfall of ${Math.abs(balA)} units`);
      }
      if (hasGW && gwQty > 0 && balB < 0) {
        status = 'failed';
        reasons.push(`V4 shipped ${gwQty} to GW but only received ${distQty} from distributor — ${Math.abs(balB)} units overshipped`);
      }
      if (!hasLoreal && hasDist && status === 'ok') {
        status = 'warning';
        reasons.push("No L'Oréal invoice in this lot — unable to validate upstream quantity");
      }
      if (hasGW && balB > 0 && status === 'ok') {
        status = 'warning';
        reasons.push(`${balB} units received at V4 not yet dispatched to GW`);
      }

      return {skuId, lorQty, distQty, gwQty, balA, balB, status, reasons};
    });

    const summary = {
      total:   skuLines.length,
      ok:      skuLines.filter(l=>l.status==='ok').length,
      failed:  skuLines.filter(l=>l.status==='failed').length,
      warning: skuLines.filter(l=>l.status==='warning').length,
    };

    let lotStatus;
    if (!hasDist && !hasGW)         lotStatus = 'open';
    else if (summary.failed > 0)    lotStatus = 'failed';
    else if (!hasGW || !hasDist)    lotStatus = 'partial';
    else if (summary.warning > 0)   lotStatus = 'partial';
    else                            lotStatus = 'validated';

    return {skuLines, status:lotStatus, summary};
  },

  runAndSave(lotId) {
    const lot = Store.getLot(lotId); if(!lot) return null;
    const result = this.run(lot);
    Store.updateLot(lotId, {validation:result, status:result.status});
    return result;
  },
};

function _sum(invList) {
  const m = {};
  (invList||[]).forEach(inv=>(inv.lines||[]).forEach(l=>{m[l.skuId]=(m[l.skuId]||0)+(l.qty||0)}));
  return m;
}
