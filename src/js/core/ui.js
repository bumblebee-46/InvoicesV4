'use strict';

// DOM
function $id(id) { return document.getElementById(id); }
function $(s)    { return document.querySelector(s); }
function $$(s)   { return [...document.querySelectorAll(s)]; }
function esc(s)  { return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function setPage(html) { $id('page-root').innerHTML = html; }

// Format
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'});
}
function timeAgo(ts) {
  const s = Math.floor((Date.now()-ts)/1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60)+'m ago';
  if (s < 86400) return Math.floor(s/3600)+'h ago';
  return Math.floor(s/86400)+'d ago';
}
function totalQty(lines) { return (lines||[]).reduce((s,l)=>s+(l.qty||0),0); }
function fmtNum(n) { return typeof n === 'number' ? n.toLocaleString() : '—'; }

// Icons (Lucide-style SVG)
const I = {
  check:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  warning:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  plus:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  upload:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29"/></svg>`,
  trash:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  chevronR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  lot:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  grid:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  sku:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  search:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  logout:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  export:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  import_:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  edit:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
};

// ── Toast ────────────────────────────────────
const Toast = {
  show(title, sub='', type='') {
    const root = $id('toast-root');
    const d = document.createElement('div');
    const icon = type==='success' ? I.check : type==='error' ? I.x : type==='warning' ? I.warning : I.info;
    d.className = `toast toast-${type||'info'} toast-enter`;
    d.innerHTML = `${icon}<div class="toast-body"><div class="toast-title">${esc(title)}</div>${sub?`<div class="toast-sub">${esc(sub)}</div>`:''}</div>`;
    root.appendChild(d);
    setTimeout(() => {
      d.classList.remove('toast-enter');
      d.classList.add('toast-leave');
      setTimeout(() => d.remove(), 200);
    }, 3400);
  },
};

// ── Drawer ───────────────────────────────────
const Drawer = {
  open(title, subtitle='', bodyHTML='', footHTML='') {
    $id('drawer-inner').innerHTML = `
      <div class="drawer-header">
        <div>
          <div class="drawer-title">${esc(title)}</div>
          ${subtitle ? `<div class="drawer-subtitle">${esc(subtitle)}</div>` : ''}
        </div>
        <button class="drawer-close" onclick="Drawer.close()" aria-label="Close">
          ${I.x}
        </button>
      </div>
      <div class="drawer-body">${bodyHTML}</div>
      ${footHTML ? `<div class="drawer-footer">${footHTML}</div>` : ''}`;
    $id('drawer').classList.add('open');
    $id('drawer-scrim').classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      const first = $('#drawer input:not([type=file]):not([type=hidden]), #drawer select');
      if (first) first.focus();
    });
  },
  close() {
    $id('drawer').classList.remove('open');
    $id('drawer-scrim').classList.remove('open');
    document.body.style.overflow = '';
  },
};

// ── SKU Entry Widget ─────────────────────────
const SKUEntry = {
  build(prefix = 'q') {
    const cats = Store.getSKUsByCategory();
    const rows = Object.entries(cats).map(([cat, skus]) => `
      <div class="sku-entry-cat">${esc(cat)}</div>
      ${skus.map(s => `
        <div class="sku-entry-row">
          <div>
            <div class="sku-name">${esc(s.name)}</div>
            <div class="sku-meta">${esc(s.lorCode || s.id)}${s.ean ? ` · EAN ${esc(s.ean)}` : ''}</div>
          </div>
          <input
            type="number" min="0" placeholder="0"
            id="${prefix}-${esc(s.id)}"
            class="sku-entry-input"
            oninput="this.classList.toggle('has-value', this.value > 0)"
          />
        </div>`).join('')}`).join('');
    return `
      <div class="sku-entry">
        <div class="sku-entry-head"><span>Product</span><span>Qty</span></div>
        ${rows}
      </div>`;
  },
  collect(prefix = 'q') {
    return Store.getSKUs()
      .map(s => { const el = $id(`${prefix}-${s.id}`); const qty = parseInt(el?.value)||0; return qty>0?{skuId:s.id,qty}:null; })
      .filter(Boolean);
  },
  fill(lines = [], prefix = 'q') {
    (lines || []).forEach(l => {
      const el = $id(`${prefix}-${l.skuId}`);
      if (el) { el.value = l.qty; el.classList.toggle('has-value', l.qty > 0); }
    });
  },
};

// ── Badge helpers ────────────────────────────
function lotBadge(status) {
  const m = LOT_STATUS_META[status] || LOT_STATUS_META.open;
  return `<span class="badge ${m.badge}"><span class="status-dot ${m.dotCls}"></span>${m.label}</span>`;
}
function invBadge(type) {
  const t = INV_TYPE[type];
  return t ? `<span class="badge ${t.badge}">${esc(t.short)}</span>` : `<span class="badge badge-neutral">${esc(type)}</span>`;
}

// ── Keyboard ─────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { Drawer.close(); }
});
