'use strict';
const Store = (() => {
  const K = { skus: 'v4_skus_v5', lots: 'v4_lots_v5' };
  const DEFAULTS = [
    {id:'SH-METALDX',   lorCode:'',ean:'',name:'Metal DX Shampoo 300ml',             cat:'Shampoo 300ml'},
    {id:'SH-ADISC',     lorCode:'',ean:'',name:'A-Disc Shampoo 300ml',               cat:'Shampoo 300ml'},
    {id:'SH-LISSUNL',   lorCode:'',ean:'',name:'Liss Unlimited Shampoo 300ml',       cat:'Shampoo 300ml'},
    {id:'SH-AOILY',     lorCode:'',ean:'',name:'A-Oily Shampoo 300ml',               cat:'Shampoo 300ml'},
    {id:'SH-VITAMINO',  lorCode:'',ean:'',name:'Vitamino Shampoo 300ml',             cat:'Shampoo 300ml'},
    {id:'SH-ABSREP',    lorCode:'',ean:'',name:'Abs Rep Shampoo 300ml',              cat:'Shampoo 300ml'},
    {id:'SH-ANTIDAND',  lorCode:'',ean:'',name:'Anti-Dandruff Shampoo 300ml',        cat:'Shampoo 300ml'},
    {id:'SH-SILVER',    lorCode:'',ean:'',name:'Silver Shampoo 300ml',               cat:'Shampoo 300ml'},
    {id:'SH-PROLONGER', lorCode:'',ean:'',name:'Prolonger Shampoo 300ml',            cat:'Shampoo 300ml'},
    {id:'SH-INFORCER',  lorCode:'',ean:'',name:'Inforcer Shampoo 300ml',             cat:'Shampoo 300ml'},
    {id:'SH-ABSREPMOL', lorCode:'',ean:'',name:'Abs Rep Molecular Shampoo 300ml',    cat:'Shampoo 300ml'},
    {id:'SH-XTENSO250', lorCode:'',ean:'',name:'Xtensо Care Shampoo 250ml',          cat:'Shampoo 300ml'},
    {id:'SH-VITSPECOL', lorCode:'',ean:'',name:'Vit Spec Col Shampoo 300ml',         cat:'Shampoo 300ml'},
    {id:'MK-METALDX250',lorCode:'',ean:'',name:'Metal DX Mask 250ml',                cat:'Mask 250ml'},
    {id:'MK-PROLONGER', lorCode:'',ean:'',name:'Prolonger Mask 250ml',               cat:'Mask 250ml'},
    {id:'MK-AOILY250',  lorCode:'',ean:'',name:'A-Oily Mask 250ml',                  cat:'Mask 250ml'},
    {id:'MK-VITAMINO',  lorCode:'',ean:'',name:'Vitamino Mask 250ml',                cat:'Mask 250ml'},
    {id:'MK-INFORCER',  lorCode:'',ean:'',name:'Inforcer Mask 250ml',                cat:'Mask 250ml'},
    {id:'MK-ABSREP250', lorCode:'',ean:'',name:'Abs Rep Mask 250ml',                 cat:'Mask 250ml'},
    {id:'MK-LISSUNL250',lorCode:'',ean:'',name:'Liss Unlimited Mask 250ml',          cat:'Mask 250ml'},
    {id:'MK-XTENSO196', lorCode:'',ean:'',name:'Xtensо Care Mask 196gm',             cat:'Mask 250ml'},
    {id:'MK-ARMRINSE',  lorCode:'',ean:'',name:'ARM Rinse Off Mask 250ml',           cat:'Mask 250ml'},
    {id:'MK-CURLEXP',   lorCode:'',ean:'',name:'Curl Expression Intense Mask 250ml', cat:'Mask 250ml'},
    {id:'MK-VITSPECOL', lorCode:'',ean:'',name:'Vit Spec Col Mask 250ml',            cat:'Mask 250ml'},
    {id:'MK-METALDX500',lorCode:'',ean:'',name:'Metal DX Mask 500ml',                cat:'Mask 500ml & Serums'},
    {id:'MK-ABSREP490', lorCode:'',ean:'',name:'Abs Rep Mask 490ml',                 cat:'Mask 500ml & Serums'},
    {id:'SR-LISSUNL125',lorCode:'',ean:'',name:'Liss Unlimited Serum 125ml',         cat:'Mask 500ml & Serums'},
    {id:'OL-50ML',      lorCode:'',ean:'',name:'Oil 50ml',                           cat:'Mask 500ml & Serums'},
    {id:'OL-90ML',      lorCode:'',ean:'',name:'Oil 90ml',                           cat:'Mask 500ml & Serums'},
    {id:'OL-RENOCONST', lorCode:'',ean:'',name:'Reno Const Oil 150ml',               cat:'Mask 500ml & Serums'},
    {id:'TR-LIQTREAT',  lorCode:'',ean:'',name:'Liq Treat 250ml',                    cat:'Mask 500ml & Serums'},
    {id:'TR-HOMMEMAT',  lorCode:'',ean:'',name:'Homme Mat 80ml',                     cat:'Mask 500ml & Serums'},
    {id:'TR-TNABEACH',  lorCode:'',ean:'',name:'TNA Beach Waves 150ml',              cat:'Mask 500ml & Serums'},
    {id:'TR-SIRENWAV',  lorCode:'',ean:'',name:'Siren Waves',                        cat:'Mask 500ml & Serums'},
    {id:'TR-RENODNS',   lorCode:'',ean:'',name:'Reno Density 100ml',                 cat:'Mask 500ml & Serums'},
    {id:'TR-HOMECLAY',  lorCode:'',ean:'',name:'Home Clay 50ml',                     cat:'Mask 500ml & Serums'},
    {id:'TR-HOMMESCL',  lorCode:'',ean:'',name:'Homme Sculpt 150ml',                 cat:'Mask 500ml & Serums'},
    {id:'TR-TNARENO',   lorCode:'',ean:'',name:'TNA Reno Liss Control 150ml',        cat:'Mask 500ml & Serums'},
    {id:'SR-XTENSO50',  lorCode:'',ean:'',name:'Xtensо Reno Serum 50ml',             cat:'Mask 500ml & Serums'},
    {id:'TR-ADISCF',    lorCode:'',ean:'',name:'A-Discf Treat 200ml',                cat:'Mask 500ml & Serums'},
    {id:'HC-MAJ3',      lorCode:'',ean:'',name:'Majirel 3 100ml',                    cat:'Hair Color'},
    {id:'HC-MAJ4',      lorCode:'',ean:'',name:'Majirel 4 100ml',                    cat:'Hair Color'},
    {id:'HC-MAJ5',      lorCode:'',ean:'',name:'Majirel 5 100ml',                    cat:'Hair Color'},
    {id:'HC-MAJ6',      lorCode:'',ean:'',name:'Majirel 6 100ml',                    cat:'Hair Color'},
    {id:'HC-MAJ63',     lorCode:'',ean:'',name:'Majirel 6.3 100ml',                  cat:'Hair Color'},
    {id:'HC-MAJ7',      lorCode:'',ean:'',name:'Majirel 7 100ml',                    cat:'Hair Color'},
    {id:'HC-MAJ74',     lorCode:'',ean:'',name:'Majirel 7.4 100ml',                  cat:'Hair Color'},
    {id:'HC-MAJ8',      lorCode:'',ean:'',name:'Majirel 8 100ml',                    cat:'Hair Color'},
    {id:'HC-MAJ834',    lorCode:'',ean:'',name:'Majirel 8.34 100ml',                 cat:'Hair Color'},
    {id:'HC-INOA10V',   lorCode:'',ean:'',name:'Inoa Oxydant 10 Vol 1L',             cat:'Hair Color'},
    {id:'HC-OREOR30',   lorCode:'',ean:'',name:'Oreor 30 Vol Creme Developer 1L',    cat:'Hair Color'},
  ];

  let skus = [], lots = [];

  function _load() {
    try { const s=localStorage.getItem(K.skus); skus=s?JSON.parse(s):DEFAULTS.map(x=>({...x})); } catch { skus=DEFAULTS.map(x=>({...x})); }
    try { const l=localStorage.getItem(K.lots); lots=l?JSON.parse(l):[]; } catch { lots=[]; }
  }
  function _save() {
    localStorage.setItem(K.skus, JSON.stringify(skus));
    localStorage.setItem(K.lots, JSON.stringify(lots));
  }

  // SKUs
  function getSKUs() { return [...skus]; }
  function getSKUMap() { const m={}; skus.forEach(s=>m[s.id]=s); return m; }
  function getSKUsByCategory() { const c={}; skus.forEach(s=>{ const k=s.cat||'Other'; if(!c[k])c[k]=[]; c[k].push(s); }); return c; }
  function getSKU(id) { return skus.find(s=>s.id===id); }
  function addSKU(d) {
    d.id=(d.id||'').trim().toUpperCase();
    if(!d.id||!d.name) throw new Error('ID and name required');
    if(skus.find(s=>s.id===d.id)) throw new Error('SKU ID already exists');
    skus.push({id:d.id,lorCode:d.lorCode||'',ean:d.ean||'',name:d.name.trim(),cat:d.cat||'Other'});
    _save();
  }
  function updateSKU(id, patch) {
    const i=skus.findIndex(s=>s.id===id); if(i<0) throw new Error('Not found');
    skus[i]={...skus[i],...patch}; _save();
  }
  function deleteSKU(id) { skus=skus.filter(s=>s.id!==id); _save(); }
  function importSKUs(rows) {
    let n=0;
    rows.forEach(r=>{
      const id=(r.id||r.code||'').trim().toUpperCase(),name=(r.name||'').trim();
      if(!id||!name) return;
      const i=skus.findIndex(s=>s.id===id);
      if(i>=0){skus[i]={...skus[i],...r,id};}
      else{skus.push({id,lorCode:r.lorCode||'',ean:r.ean||'',name,cat:r.cat||'Other'});n++;}
    });
    _save(); return n;
  }

  // LOTs
  function getLots() { return [...lots].sort((a,b)=>b.createdAt-a.createdAt); }
  function getLot(id) { return lots.find(l=>l.id===id); }
  function createLot({name,dist,notes}={}) {
    name=(name||'').trim().toUpperCase();
    if(!name) throw new Error('Lot name required');
    if(lots.find(l=>l.name===name)) throw new Error(`Lot ${name} already exists`);
    const lot={id:'lot_'+Date.now(),name,dist:dist||'',notes:notes||'',
      status:'open',createdAt:Date.now(),updatedAt:Date.now(),
      invoices:[],lotNotes:[],validation:null};
    lots.push(lot); _save(); return lot;
  }
  function updateLot(id,patch) {
    const i=lots.findIndex(l=>l.id===id); if(i<0) return;
    lots[i]={...lots[i],...patch,updatedAt:Date.now()}; _save(); return lots[i];
  }
  function deleteLot(id) { lots=lots.filter(l=>l.id!==id); _save(); }
  function addInvoice(lotId,inv) {
    const lot=getLot(lotId); if(!lot) throw new Error('Lot not found');
    if(!inv.num||!inv.date||!inv.type) throw new Error('Number, date and type required');
    inv.num=inv.num.trim();
    if(lot.invoices.find(i=>i.num===inv.num&&i.type===inv.type)) throw new Error(`Invoice ${inv.num} already exists in this lot`);
    const entry={id:'inv_'+Date.now(),num:inv.num,date:inv.date,type:inv.type,
      lines:(inv.lines||[]).filter(l=>l.qty>0),supplierName:inv.supplierName||'',createdAt:Date.now()};
    lot.invoices.push(entry); lot.updatedAt=Date.now(); _save(); return entry;
  }
  function deleteInvoice(lotId,invId) {
    const lot=getLot(lotId); if(!lot) return;
    lot.invoices=lot.invoices.filter(i=>i.id!==invId); lot.updatedAt=Date.now(); _save();
  }
  function addNote(lotId,text) {
    const lot=getLot(lotId); if(!lot) return;
    const note={id:'n_'+Date.now(),text:text.trim(),createdAt:Date.now()};
    lot.lotNotes.push(note); lot.updatedAt=Date.now(); _save(); return note;
  }
  function getStats() {
    return {total:lots.length,
      validated:lots.filter(l=>l.status==='validated').length,
      failed:lots.filter(l=>l.status==='failed').length,
      open:lots.filter(l=>['open','partial'].includes(l.status)).length,
      skus:skus.length};
  }
  function getRunningStock() {
    const dv={},gw={};
    lots.forEach(lot=>{
      lot.invoices.filter(i=>i.type==='DIST_V4').forEach(inv=>inv.lines.forEach(l=>{dv[l.skuId]=(dv[l.skuId]||0)+l.qty}));
      lot.invoices.filter(i=>i.type==='V4_GW').forEach(inv=>inv.lines.forEach(l=>{gw[l.skuId]=(gw[l.skuId]||0)+l.qty}));
    });
    const all=new Set([...Object.keys(dv),...Object.keys(gw)]);
    return [...all].map(skuId=>({skuId,recv:dv[skuId]||0,sent:gw[skuId]||0,balance:(dv[skuId]||0)-(gw[skuId]||0)}));
  }
  function toJSON() { return JSON.stringify({v:3,skus,lots},null,2); }
  function fromJSON(str) { const d=JSON.parse(str); if(d.skus)skus=d.skus; if(d.lots)lots=d.lots; _save(); }

  _load();
  return {getSKUs,getSKUMap,getSKUsByCategory,getSKU,addSKU,updateSKU,deleteSKU,importSKUs,
    getLots,getLot,createLot,updateLot,deleteLot,addInvoice,deleteInvoice,addNote,
    getStats,getRunningStock,toJSON,fromJSON};
})();

const INV_TYPE = {
  LOR_DIST:{ label:"L'Oréal → Distributor", short:"L'Oréal→Dist", badge:'badge-brand',   dot:'--primitive-indigo-400' },
  DIST_V4: { label:'Distributor → V4',       short:'Dist→V4',      badge:'badge-info',    dot:'--primitive-blue-400'   },
  V4_GW:   { label:'V4 → GW',               short:'V4→GW',        badge:'badge-success', dot:'--primitive-green-400'  },
};
const LOT_STATUS_META = {
  open:      { label:'Open',        badge:'badge-neutral', dotCls:'dot-neutral' },
  partial:   { label:'In Progress', badge:'badge-warning', dotCls:'dot-warning' },
  validated: { label:'Validated',   badge:'badge-success', dotCls:'dot-success' },
  failed:    { label:'Failed',      badge:'badge-error',   dotCls:'dot-error'   },
};
