'use strict';
// ── Credentials — change these to update login ──────────────────
// To change: edit the values below and re-upload to GitHub
const AUTH = { user: 'admin', pass: 'v4loreal2024' };

function doLogin() {
  const u = document.getElementById('l-user')?.value.trim();
  const p = document.getElementById('l-pass')?.value;
  if (u === AUTH.user && p === AUTH.pass) {
    sessionStorage.setItem('v4_auth', '1');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    if (typeof initApp === 'function') initApp();
  } else {
    const err = document.getElementById('login-err');
    err.style.display = 'block';
    document.getElementById('l-pass').value = '';
    document.getElementById('l-pass').focus();
    setTimeout(() => { err.style.display = 'none'; }, 3000);
  }
}

function doLogout() {
  sessionStorage.removeItem('v4_auth');
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
}

// Check session on load
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('v4_auth') === '1') {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
  }
});
