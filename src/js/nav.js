'use strict';
const Nav = {
  _cur: 'dashboard',
  _arg: null,

  go(page, arg) {
    this._cur = page;
    this._arg = arg || null;

    // Update sidebar
    $$('.sb-link').forEach(l => l.classList.toggle('active', l.dataset.page === page || (page === 'lot' && l.dataset.page === 'lots')));

    // Render
    switch(page) {
      case 'dashboard': renderDashboard(); break;
      case 'lots':      Lots.render();     break;
      case 'lot':       LotDetail.render(arg); break;
      case 'skus':      SKUPage.render();  break;
      default:          renderDashboard();
    }

    $id('main').scrollTop = 0;
    this._updateCounts();
    history.replaceState(null, '', `#${arg ? page+'/'+arg : page}`);
  },
  _updateCounts() {
    const st = Store.getStats();
    const lotEl = $id('sb-lots'); if(lotEl) lotEl.textContent = st.total;
    const skuEl = $id('sb-skus'); if(skuEl) skuEl.textContent = st.skus;
  },
};

const App = {
  init() {
    const h = location.hash.slice(1);
    if (h) {
      const [page, arg] = h.split('/');
      const valid = ['dashboard','lots','lot','skus'];
      if (valid.includes(page)) { Nav.go(page, arg); return; }
    }
    Nav.go('dashboard');
  },
  refresh() { Nav.go(Nav._cur, Nav._arg); },
};

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('v4_auth') === '1') App.init();
});
