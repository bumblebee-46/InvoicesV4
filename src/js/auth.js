'use strict';
// ── Change credentials here, then re-upload to GitHub ──────────
const CREDS = { user: 'admin', pass: 'v4loreal2024' };

const Auth = {
  login() {
    const u = $id('l-user')?.value.trim();
    const p = $id('l-pass')?.value;
    const err = $id('login-err');
    if (u === CREDS.user && p === CREDS.pass) {
      sessionStorage.setItem('v4_auth','1');
      $id('login-screen').style.display = 'none';
      $id('app').removeAttribute('hidden');
      App.init();
    } else {
      err.hidden = false;
      $id('l-pass').value = '';
      $id('l-pass').focus();
      setTimeout(() => { err.hidden = true; }, 3000);
    }
  },
  logout() { sessionStorage.removeItem('v4_auth'); location.reload(); },
};

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('v4_auth') === '1') {
    $id('login-screen').style.display = 'none';
    $id('app').removeAttribute('hidden');
  }
});
