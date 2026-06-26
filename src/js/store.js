'use strict';
const Store = (() => {
  const K = { skus: 'v4_skus_v3', invoices: 'v4_invoices_v3' };

  // ── Real SKUs from your tracking file ─────────────────────────
  const DEFAULTS = [
    // Shampoo 300ml
    { code: 'SH-METALDX',    name: 'Metal DX Shampoo 300ml',             cat: 'Shampoo 300ml' },
    { code: 'SH-ADISC',      name: 'A-Disc Shampoo 300ml',               cat: 'Shampoo 300ml' },
    { code: 'SH-LISSUNL',    name: 'Liss Unlimited Shampoo 300ml',       cat: 'Shampoo 300ml' },
    { code: 'SH-AOILY',      name: 'A-Oily Shampoo 300ml',               cat: 'Shampoo 300ml' },
    { code: 'SH-VITAMINO',   name: 'Vitamino Shampoo 300ml',             cat: 'Shampoo 300ml' },
    { code: 'SH-ABSREP',     name: 'Abs Rep Shampoo 300ml',              cat: 'Shampoo 300ml' },
    { code: 'SH-ANTIDAND',   name: 'Anti-Dandruff Shampoo 300ml',        cat: 'Shampoo 300ml' },
    { code: 'SH-SILVER',     name: 'Silver Shampoo 300ml',               cat: 'Shampoo 300ml' },
    { code: 'SH-PROLONGER',  name: 'Prolonger Shampoo 300ml',            cat: 'Shampoo 300ml' },
    { code: 'SH-INFORCER',   name: 'Inforcer Shampoo 300ml',             cat: 'Shampoo 300ml' },
    { code: 'SH-ABSREPMOL',  name: 'Abs Rep Molecular Shampoo 300ml',    cat: 'Shampoo 300ml' },
    { code: 'SH-XTENSO250',  name: 'Xtensо Care Shampoo 250ml',          cat: 'Shampoo 300ml' },
    { code: 'SH-VITSPECOL',  name: 'Vit Spec Col Shampoo 300ml',         cat: 'Shampoo 300ml' },
    // Mask 250ml
    { code: 'MK-METALDX250', name: 'Metal DX Mask 250ml',                cat: 'Mask 250ml' },
    { code: 'MK-PROLONGER',  name: 'Prolonger Mask 250ml',               cat: 'Mask 250ml' },
    { code: 'MK-AOILY250',   name: 'A-Oily Mask 250ml',                  cat: 'Mask 250ml' },
    { code: 'MK-VITAMINO',   name: 'Vitamino Mask 250ml',                cat: 'Mask 250ml' },
    { code: 'MK-INFORCER',   name: 'Inforcer Mask 250ml',                cat: 'Mask 250ml' },
    { code: 'MK-ABSREP250',  name: 'Abs Rep Mask 250ml',                 cat: 'Mask 250ml' },
    { code: 'MK-LISSUNL250', name: 'Liss Unlimited Mask 250ml',          cat: 'Mask 250ml' },
    { code: 'MK-XTENSO196',  name: 'Xtensо Care Mask 196gm',             cat: 'Mask 250ml' },
    { code: 'MK-ARMRINSE',   name: 'ARM Rinse Off Mask 250ml',           cat: 'Mask 250ml' },
    { code: 'MK-CURLEXP',    name: 'Curl Expression Intense Mask 250ml', cat: 'Mask 250ml' },
    { code: 'MK-VITSPECOL',  name: 'Vit Spec Col Mask 250ml',            cat: 'Mask 250ml' },
    // Mask 500ml / Serums / Oils
    { code: 'MK-METALDX500', name: 'Metal DX Mask 500ml',                cat: 'Mask 500ml & Serums' },
    { code: 'MK-ABSREP490',  name: 'Abs Rep Mask 490ml',                 cat: 'Mask 500ml & Serums' },
    { code: 'SR-LISSUNL125', name: 'Liss Unlimited Serum 125ml',         cat: 'Mask 500ml & Serums' },
    { code: 'OL-50ML',       name: 'Oil 50ml',                           cat: 'Mask 500ml & Serums' },
    { code: 'OL-90ML',       name: 'Oil 90ml',                           cat: 'Mask 500ml & Serums' },
    { code: 'OL-RENOCONST',  name: 'Reno Const Oil 150ml',               cat: 'Mask 500ml & Serums' },
    { code: 'TR-LIQTREAT',   name: 'Liq Treat 250ml',                    cat: 'Mask 500ml & Serums' },
    { code: 'TR-HOMMEMAT',   name: 'Homme Mat 80ml',                     cat: 'Mask 500ml & Serums' },
    { code: 'TR-TNABEACH',   name: 'TNA Beach Waves 150ml',              cat: 'Mask 500ml & Serums' },
    { code: 'TR-SIRENWAV',   name: 'Siren Waves',                        cat: 'Mask 500ml & Serums' },
    { code: 'TR-RENODNS',    name: 'Reno Density 100ml',                 cat: 'Mask 500ml & Serums' },
    { code: 'TR-HOMECLAY',   name: 'Home Clay 50ml',                     cat: 'Mask 500ml & Serums' },
    { code: 'TR-HOMMESCL',   name: 'Homme Sculpt 150ml',                 cat: 'Mask 500ml & Serums' },
    { code: 'TR-TNARENO',    name: 'TNA Reno Liss Control 150ml',        cat: 'Mask 500ml & Serums' },
    { code: 'SR-XTENSO50',   name: 'Xtensо Reno Serum 50ml',             cat: 'Mask 500ml & Serums' },
    { code: 'TR-ADISCF',     name: 'A-Discf Treat 200ml',                cat: 'Mask 500ml & Serums' },
    // Hair Color
    { code: 'HC-MAJ3',       name: 'Majirel 3 100ml',                    cat: 'Hair Color' },
    { code: 'HC-MAJ4',       name: 'Majirel 4 100ml',                    cat: 'Hair Color' },
    { code: 'HC-MAJ5',       name: 'Majirel 5 100ml',                    cat: 'Hair Color' },
    { code: 'HC-MAJ6',       name: 'Majirel 6 100ml',                    cat: 'Hair Color' },
    { code: 'HC-MAJ63',      name: 'Majirel 6.3 100ml',                  cat: 'Hair Color' },
    { code: 'HC-MAJ7',       name: 'Majirel 7 100ml',                    cat: 'Hair Color' },
    { code: 'HC-MAJ74',      name: 'Majirel 7.4 100ml',                  cat: 'Hair Color' },
    { code: 'HC-MAJ8',       name: 'Majirel 8 100ml',                    cat: 'Hair Color' },
    { code: 'HC-MAJ834',     name: 'Majirel 8.34 100ml',                 cat: 'Hair Color' },
    { code: 'HC-INOA10V',    name: 'Inoa Oxydant 10 Vol 1L',             cat: 'Hair Color' },
    { code: 'HC-OREOR30',    name: 'Oreor 30 Vol Creme Developer 1L',    cat: 'Hair Color' },
  ];

  let skus = [], invoices = [];

  function load() {
    try { const s = localStorage.getItem(K.skus); skus = s ? JSON.parse(s) : [...DEFAULTS]; } catch { skus = [...DEFAULTS]; }
    try { const i = localStorage.getItem(K.invoices); invoices = i ? JSON.parse(i) : []; } catch { invoices = []; }
  }

  function save() {
    localStorage.setItem(K.skus, JSON.stringify(skus));
    localStorage.setItem(K.invoices, JSON.stringify(invoices));
  }

  // ── SKUs ──────────────────────────────────────────────────────
  function getSKUs() { return [...skus]; }
  function getSKUsByCategory() {
    const cats = {};
    skus.forEach(s => {
      const c = s.cat || 'Other';
      if (!cats[c]) cats[c] = [];
      cats[c].push(s);
    });
    return cats;
  }
  function addSKU(code, name, cat) {
    code = code.trim().toUpperCase(); name = name.trim(); cat = (cat || 'Other').trim();
    if (!code || !name) throw new Error('Code and name required');
    if (skus.find(s => s.code === code)) throw new Error('SKU code already exists');
    skus.push({ code, name, cat }); save();
  }
  function deleteSKU(code) { skus = skus.filter(s => s.code !== code); save(); }
  function importSKUs(rows) {
    let n = 0;
    rows.forEach(({ code, name, cat }) => {
      code = (code || '').trim().toUpperCase(); name = (name || '').trim();
      if (code && name && !skus.find(s => s.code === code)) { skus.push({ code, name, cat: cat || 'Other' }); n++; }
    });
    save(); return n;
  }

  // ── Invoices ──────────────────────────────────────────────────
  function getInvoices(type) { return type ? invoices.filter(i => i.type === type) : [...invoices]; }
  function getByLot(lot) { return invoices.filter(i => i.lot === lot); }
  function getLots() { return [...new Set(invoices.map(i => i.lot).filter(Boolean))].sort(); }
  function addInvoice({ num, date, type, lot, lines, supplierName }) {
    num = num.trim(); lot = (lot || '').trim().toUpperCase();
    if (!num || !date || !type || !lot) throw new Error('Invoice no., date, type and lot required');
    if (invoices.find(i => i.num === num && i.type === type)) throw new Error(`Invoice ${num} already exists for this flow`);
    const inv = { id: Date.now(), num, date, type, lot, lines: lines || [], supplierName: supplierName || null, createdAt: new Date().toISOString() };
    invoices.push(inv); save(); return inv;
  }
  function deleteInvoice(id) { invoices = invoices.filter(i => i.id !== id); save(); }

  function getStats() {
    return {
      total: invoices.length, lots: getLots().length, skus: skus.length,
      byType: {
        LOR_AARA: invoices.filter(i => i.type === 'LOR_AARA').length,
        LOR_ADITI: invoices.filter(i => i.type === 'LOR_ADITI').length,
        LOR_OTHERS: invoices.filter(i => i.type === 'LOR_OTHERS').length,
        AARA_V4: invoices.filter(i => i.type === 'AARA_V4').length,
        ADITI_V4: invoices.filter(i => i.type === 'ADITI_V4').length,
        OTHERS_V4: invoices.filter(i => i.type === 'OTHERS_V4').length,
        V4_GW: invoices.filter(i => i.type === 'V4_GW').length,
      }
    };
  }

  // Running stock: cumulative Dist→V4 minus V4→GW per SKU across all lots
  function getRunningStock() {
    const distV4 = {}, v4GW = {};
    invoices.filter(i => ['AARA_V4', 'ADITI_V4', 'OTHERS_V4'].includes(i.type))
      .forEach(inv => (inv.lines || []).forEach(l => { distV4[l.code] = (distV4[l.code] || 0) + (l.qty || 0); }));
    invoices.filter(i => i.type === 'V4_GW')
      .forEach(inv => (inv.lines || []).forEach(l => { v4GW[l.code] = (v4GW[l.code] || 0) + (l.qty || 0); }));
    const all = new Set([...Object.keys(distV4), ...Object.keys(v4GW)]);
    return [...all].map(code => {
      const recv = distV4[code] || 0, sent = v4GW[code] || 0;
      return { code, recv, sent, balance: recv - sent };
    });
  }

  function toJSON() { return JSON.stringify({ skus, invoices }, null, 2); }
  function fromJSON(str) {
    const d = JSON.parse(str);
    if (d.skus) skus = d.skus;
    if (d.invoices) invoices = d.invoices;
    save();
  }

  load();
  return { getSKUs, getSKUsByCategory, addSKU, deleteSKU, importSKUs, getInvoices, getByLot, getLots, addInvoice, deleteInvoice, getStats, getRunningStock, toJSON, fromJSON };
})();
