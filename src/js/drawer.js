'use strict';
function openDrawer(title, sub, bodyHTML, footHTML = '') {
  $('#drawer-inner').innerHTML = `
    <div class="drawer-head">
      <div><div class="drawer-title">${title}</div>${sub ? `<div class="drawer-sub">${sub}</div>` : ''}</div>
      <button class="drawer-close" onclick="closeDrawer()">${Icon.x}</button>
    </div>
    <div class="drawer-body">${bodyHTML}</div>
    ${footHTML ? `<div class="drawer-foot">${footHTML}</div>` : ''}`;
  $('#drawer').classList.add('open');
  $('#drawer-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const f = $('#drawer input,#drawer select'); if (f) f.focus(); }, 300);
}
function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#drawer-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
