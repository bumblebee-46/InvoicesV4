'use strict';
function $id(id) { return document.getElementById(id); }
function $(s)    { return document.querySelector(s); }
function $$(s)   { return [...document.querySelectorAll(s)]; }
function esc(s)  { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function setPage(html) { $id('page-root').innerHTML = html; }

// Format helpers
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'});
}
function fmtNum(n)  { return typeof n === 'number' ? n.toLocaleString() : (n || '—'); }
function timeAgo(ts){ const s=Math.floor((Date.now()-ts)/1000); if(s<60)return 'just now'; if(s<3600)return Math.floor(s/60)+'m ago'; if(s<86400)return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago'; }
function totalQty(lines) { return (lines||[]).reduce((s,l)=>s+(l.qty||0),0); }

// SVG icons
const SVG = {
  check: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="4 10 8 14 16 6"/></svg>`,
  x:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>`,
  warn:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 3L18 17H2L10 3z"/><line x1="10" y1="9" x2="10" y2="12"/><circle cx="10" cy="14.5" r=".5" fill="currentColor"/></svg>`,
  info:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="8"/><line x1="10" y1="9" x2="10" y2="14"/><circle cx="10" cy="6.5" r=".5" fill="currentColor"/></svg>`,
  plus:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="3" x2="10" y2="17"/><line x1="3" y1="10" x2="17" y2="10"/></svg>`,
  upload:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13V3m-4 6l4-4 4 4"/><path d="M3 15v1a1 1 0 001 1h12a1 1 0 001-1v-1"/></svg>`,
  download:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 7v10m-4-4l4 4 4-4"/><path d="M3 15v1a1 1 0 001 1h12a1 1 0 001-1v-1"/></svg>`,
  trash: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 5 5 5 17 5"/><path d="M16 5l-1 12H5L4 5"/><path d="M8 9v5M12 9v5"/></svg>`,
  chevron:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="7 4 13 10 7 16"/></svg>`,
  lot:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6l7-3 7 3v8l-7 3-7-3V6z"/><path d="M10 3v14M3 6l7 3 7-3"/></svg>`,
};

// Toast
const Toast = {
  show(msg, type='') {
    const c=$id('toasts'), d=document.createElement('div');
    d.className=`toast${type?' '+type:''}`;
    const icon=type==='success'?SVG.check:type==='error'?SVG.x:type==='warning'?SVG.warn:SVG.info;
    d.innerHTML=`${icon}<span>${esc(msg)}</span>`;
    c.appendChild(d);
    setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),200)},3200);
  }
};

// Drawer
const Drawer = {
  open(title, sub, body, foot='') {
    $id('drawer-inner').innerHTML=`
      <div class="dw-head">
        <div><div class="dw-title">${title}</div>${sub?`<div class="dw-sub">${sub}</div>`:''}</div>
        <button class="dw-close" onclick="Drawer.close()">${SVG.x}</button>
      </div>
      <div class="dw-body">${body}</div>
      ${foot?`<div class="dw-footer">${foot}</div>`:''}`;
    $id('drawer').classList.add('open');
    $id('drawer-bg').classList.add('open');
    document.body.style.overflow='hidden';
    setTimeout(()=>{const f=$('#drawer input:not([type=file]),#drawer select');if(f)f.focus();},300);
  },
  close() {
    $id('drawer').classList.remove('open');
    $id('drawer-bg').classList.remove('open');
    document.body.style.overflow='';
  },
};

// SKU quantity entry widget
const SKUEntry = {
  build(prefix='q') {
    const cats = Store.getSKUsByCategory();
    return `
      <div class="sku-entry-box">
        <div class="sku-entry-head"><span>Product</span><span>Qty</span></div>
        ${Object.entries(cats).map(([cat,skus])=>`
          <div class="sku-entry-cat">${esc(cat)}</div>
          ${skus.map(s=>`
            <div class="sku-entry-row">
              <div>
                <div class="sku-entry-name">${esc(s.name)}</div>
                <div class="sku-entry-code">${esc(s.lorCode||s.id)}${s.ean?` · EAN ${esc(s.ean)}`:''}</div>
              </div>
              <input type="number" min="0" value="" placeholder="0"
                id="${prefix}-${s.id}"
                oninput="this.dataset.has=this.value>0?'1':'';this.toggleAttribute('data-has',this.value>0)"/>
            </div>`).join('')}`).join('')}
      </div>`;
  },
  collect(prefix='q') {
    return Store.getSKUs()
      .map(s => { const el=$id(`${prefix}-${s.id}`); const qty=parseInt(el?.value)||0; return qty>0?{skuId:s.id,qty}:null; })
      .filter(Boolean);
  },
  fill(lines, prefix='q') {
    (lines||[]).forEach(l => { const el=$id(`${prefix}-${l.skuId}`); if(el){el.value=l.qty;el.setAttribute('data-has','1');} });
  },
};

// Status badge HTML
function lotStatusBadge(status) {
  const s = LOT_STATUS[status] || LOT_STATUS.open;
  return `<span class="badge ${s.badge}">${s.label}</span>`;
}
function invTypeBadge(type) {
  const t = INV_TYPE[type];
  return t ? `<span class="badge ${t.badge}">${t.short}</span>` : `<span class="badge bg-gray">${type}</span>`;
}
function valStatusHTML(status, reasons) {
  if (status === 'ok')      return `<div class="val-status ok">${SVG.check} Valid</div>`;
  if (status === 'failed')  return `<div class="val-status fail">${SVG.x} Failed</div>${reasons.map(r=>`<div class="val-reason">${esc(r)}</div>`).join('')}`;
  if (status === 'warning') return `<div class="val-status warn">${SVG.warn} Warning</div>${reasons.map(r=>`<div class="val-reason">${esc(r)}</div>`).join('')}`;
  return '';
}

// Keyboard: ESC closes drawer
document.addEventListener('keydown', e => { if (e.key === 'Escape') Drawer.close(); });
