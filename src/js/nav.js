'use strict';
// ── To change credentials: edit CREDS, re-upload to GitHub ──────
const CREDS = { user: 'admin', pass: 'v4loreal2024' };

const Auth = {
  login() {
    const u = $id('l-user')?.value.trim(), p = $id('l-pass')?.value;
    const err = $id('l-err');
    if (u === CREDS.user && p === CREDS.pass) {
      sessionStorage.setItem('v4_auth','1');
      $id('login-screen').style.display = 'none';
      $id('app').removeAttribute('hidden');
      App.init();
    } else {
      err.hidden = false;
      $id('l-pass').value = ''; $id('l-pass').focus();
      setTimeout(() => { err.hidden = true; }, 3000);
    }
  },
  logout() { sessionStorage.removeItem('v4_auth'); location.reload(); },
};

const Nav = {
  _page: 'dashboard',
  _arg:  null,

  go(page, arg) {
    this._page = page; this._arg = arg || null;
    $$('.sb-item').forEach(el => el.classList.toggle('active', el.dataset.page === page || (page==='lot' && el.dataset.page==='lots')));
    switch(page) {
      case 'dashboard': renderDashboard();          break;
      case 'lots':      Lots.render();              break;
      case 'lot':       LotDetail.render(arg);      break;
      case 'skus':      SKUPage.render();           break;
      default:          renderDashboard();
    }
    $id('main').scrollTop = 0;
    this._updateCounts();
    history.replaceState(null,'',`#${arg?page+'/'+arg:page}`);
  },

  _updateCounts() {
    const st = Store.getStats();
    const l = $id('cnt-lots'); if(l) l.textContent = st.total;
    const s = $id('cnt-skus'); if(s) s.textContent = st.skus;
  },
};

const App = {
  init() {
    const h = location.hash.slice(1);
    if (h) { const [p,a]=h.split('/'); if(['dashboard','lots','lot','skus'].includes(p)){Nav.go(p,a);return;} }
    Nav.go('dashboard');
  },
  refresh() { Nav.go(Nav._page, Nav._arg); },
};

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('v4_auth')==='1') {
    $id('login-screen').style.display='none';
    $id('app').removeAttribute('hidden');
    App.init();
  }
});
