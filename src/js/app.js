'use strict';
const PAGES = {
  'dashboard':     () => renderDashboard(),
  'stock':         () => renderStockPage(),
  'tally':         (a) => renderTallyPage(a),
  'skus':          () => renderSKUsPage(),
  'inv-LOR_AARA':  () => renderInvoicesPage('LOR_AARA'),
  'inv-LOR_ADITI': () => renderInvoicesPage('LOR_ADITI'),
  'inv-LOR_OTHERS':() => renderInvoicesPage('LOR_OTHERS'),
  'inv-AARA_V4':   () => renderInvoicesPage('AARA_V4'),
  'inv-ADITI_V4':  () => renderInvoicesPage('ADITI_V4'),
  'inv-OTHERS_V4': () => renderInvoicesPage('OTHERS_V4'),
  'inv-V4_GW':     () => renderInvoicesPage('V4_GW'),
};

let _cur = 'dashboard', _currentArg = null;

function navigate(page, arg) {
  _cur = page; _currentArg = arg || null;
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  (PAGES[page] || PAGES['dashboard'])(_currentArg);
  $('#main').scrollTop = 0;
  history.replaceState(null, '', `#${arg ? page + '/' + arg : page}`);
}

function renderCurrentPage() { navigate(_cur, _currentArg); }

function initApp() {
  const h = location.hash.slice(1);
  if (h) { const [p, a] = h.split('/'); if (PAGES[p]) { navigate(p, a); return; } }
  navigate('dashboard');
}

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('v4_auth') === '1') initApp();
});
