(function () {
  'use strict';
  var data = window.articleData;
  if (!data) return;
  var $ = function (id) { return document.getElementById(id); };
  var toastTimer;
  function notify(message) {
    $('toast').textContent = message;
    $('toast').hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { $('toast').hidden = true; }, 3200);
  }
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function makeLink(url, className, text) {
    var parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Invalid article URL');
    var a = element('a', className, text);
    a.href = url;
    if (parsed.hostname !== 'www.odaily.news' && parsed.hostname !== 'm.odaily.news') {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }
  function timeNode(value) {
    var node = element('time', '', value);
    node.dateTime = value.replace(' ', 'T') + ':00+08:00';
    return node;
  }
  // The same complete content is present in index.html for direct file opening.
  $('article-title').textContent = data.title;
  $('article-date').textContent = data.publishedAt;
  $('article-date').dateTime = data.publishedAtISO;
  $('article-content').replaceChildren();
  data.content.forEach(function (paragraph, index) {
    var p = element('p');
    var inline = data.inlineLinks.find(function (item) { return item.paragraph === index; });
    if (inline && paragraph.includes(inline.text)) {
      var start = paragraph.indexOf(inline.text);
      p.append(document.createTextNode(paragraph.slice(0, start)), makeLink(inline.url, '', inline.text), document.createTextNode(paragraph.slice(start + inline.text.length)));
    } else p.textContent = paragraph;
    $('article-content').append(p);
  });
  var sourceSlot = $('source-slot');
  sourceSlot.replaceChildren();
  if (data.sourceUrl && /^https?:\/\//.test(data.sourceUrl)) {
    var sourceAnchor = makeLink(data.sourceUrl, 'source-link');
    sourceAnchor.id = 'source-link';
    var sourceIcon = element('img');
    sourceIcon.src = './assets/icons/source-link.svg';
    sourceIcon.alt = '';
    sourceIcon.width = 30;
    sourceIcon.height = 30;
    sourceAnchor.append(sourceIcon, element('span', '', '原文链接'));
    sourceSlot.append(sourceAnchor);
  }
  var group = element('span', 'market-group');
  data.market.forEach(function (item) {
    var negative = item.change.charAt(0) === '-';
    var row = element('span', 'market-item');
    var price = element('b', 'price' + (negative ? ' negative' : ''), item.price);
    if (item.symbol === 'HTX' && /^0\.00000\d+$/.test(item.price)) {
      price.textContent = '';
      var compact = element('span', 'price-compact', '0.0');
      compact.append(element('sub', '', '5'), document.createTextNode(item.price.slice(7)));
      price.append(element('span', 'price-wide', item.price), compact);
    }
    row.append(element('span', '', item.symbol), price);
    var trend = element('span', 'market-trend' + (negative ? ' negative' : ''));
    trend.setAttribute('aria-label', negative ? '下跌' : '上涨');
    var image = element('img');
    image.src = './assets/icons/market-' + (negative ? 'down' : 'up') + '.svg';
    image.alt = ''; image.width = 6; image.height = 5;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 18 12');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', negative ? 'M1 3 6 7 10 4 16 10M12 10h4V6' : 'M1 9 6 5 10 8 16 2M12 2h4v4');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '1.3');
    svg.append(path); trend.append(image, svg); row.append(trend); group.append(row);
  });
  var track = element('span', 'market-track');
  var duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  track.append(group, duplicate);
  $('market-list').replaceChildren(track);
  $('recommendation-list').replaceChildren();
  data.recommendations.forEach(function (item) {
    var a = makeLink(item.url, 'recommendation-card');
    a.title = item.title; a.append(element('h3', '', item.title));
    $('recommendation-list').append(a);
  });
  $('news-list').replaceChildren();
  data.news24h.forEach(function (item) {
    var row = element('li', 'news-item');
    row.append(timeNode(item.publishedAt), makeLink(item.url, '', item.title));
    $('news-list').append(row);
  });
  $('mobile-hot-list').replaceChildren();
  data.hotNews.forEach(function (item) {
    var row = element('li', 'hot-item');
    var marker = element('span', 'hot-marker'); marker.setAttribute('aria-hidden', 'true');
    var fire = element('img'); fire.src = './assets/icons/fire.svg'; fire.alt = ''; fire.width = 10; fire.height = 10; marker.append(fire);
    var body = element('div', 'hot-content');
    var title = element('h3'); title.append(makeLink(item.url, '', item.title));
    body.append(timeNode(item.publishedAt), title, element('p', '', item.summary));
    row.append(marker, body); $('mobile-hot-list').append(row);
  });
  // The original desktop search component uses /search?keywords=… .
  $('search-form').addEventListener('submit', function (event) {
    var input = $('search-input');
    if (!input.value.trim()) {
      event.preventDefault();
      window.location.assign('https://www.odaily.news/search');
    } else input.value = input.value.trim();
  });
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $('theme-toggle').setAttribute('aria-pressed', String(theme === 'dark'));
    $('theme-toggle').setAttribute('aria-label', theme === 'dark' ? '切换浅色主题' : '切换深色主题');
    $('theme-icon').setAttribute('href', theme === 'dark' ? '#i-sun' : '#i-moon');
    try { localStorage.setItem('odaily-static-theme', theme); } catch (e) { /* Storage is optional for file://. */ }
  }
  function toggleTheme() { applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); }
  try { if (localStorage.getItem('odaily-static-theme') === 'dark') applyTheme('dark'); } catch (e) { /* The page remains usable without storage. */ }
  $('theme-toggle').addEventListener('click', toggleTheme);
  $('settings-theme').addEventListener('click', toggleTheme);
  var popovers = [
    {button: 'language-toggle', panel: 'language-menu'},
    {button: 'mobile-language-toggle', panel: 'mobile-language-menu'},
    {button: 'settings-toggle', panel: 'settings-menu'},
    {button: 'more-toggle', panel: 'more-menu'}
  ];
  function closePopovers(except) {
    popovers.forEach(function (item) {
      if (item.panel !== except) { $(item.panel).hidden = true; $(item.button).setAttribute('aria-expanded', 'false'); }
    });
  }
  popovers.forEach(function (item) {
    $(item.button).addEventListener('click', function () {
      var open = $(item.panel).hidden;
      closePopovers();
      $(item.panel).hidden = !open;
      this.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (event) {
    popovers.forEach(function (item) {
      if (!$(item.button).contains(event.target) && !$(item.panel).contains(event.target)) {
        $(item.panel).hidden = true; $(item.button).setAttribute('aria-expanded', 'false');
      }
    });
  });
  function setMenu(open, restoreFocus) {
    $('mobile-menu').hidden = !open; $('menu-overlay').hidden = !open;
    document.body.classList.toggle('menu-open', open);
    $('mobile-menu-toggle').setAttribute('aria-expanded', String(open));
    closePopovers();
    if (open) $('menu-close').focus();
    else if (restoreFocus) $('mobile-menu-toggle').focus();
  }
  $('mobile-menu-toggle').addEventListener('click', function () { setMenu($('mobile-menu').hidden, true); });
  $('menu-close').addEventListener('click', function () { setMenu(false, true); });
  $('menu-overlay').addEventListener('click', function () { setMenu(false, true); });
  $('mobile-navigation').addEventListener('click', function (event) { if (event.target.closest('a')) setMenu(false, false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false, false); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { if (!$('mobile-menu').hidden) setMenu(false, true); closePopovers(); }
    if (event.key === 'Tab' && !$('mobile-menu').hidden) {
      var items = $('mobile-menu').querySelectorAll('a, button');
      var first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  function showLogin() {
    if (typeof $('login-dialog').showModal === 'function') $('login-dialog').showModal();
    else window.location.assign('https://www.odaily.news/zh-CN');
  }
  ['login-button', 'like-button', 'collect-button'].forEach(function (id) { $(id).addEventListener('click', showLogin); });
  $('login-close').addEventListener('click', function () { $('login-dialog').close(); });
  function publicUrl() {
    if (/^https?:\/\//.test(data.publicUrl)) return data.publicUrl;
    if (/^https?:\/\//.test(data.sourcePageUrl || '')) return data.sourcePageUrl;
    return window.location.href;
  }
  function updateShareLinks() {
    var url = encodeURIComponent(publicUrl());
    var title = encodeURIComponent(data.title);
    $('share-x').href = 'https://twitter.com/intent/tweet?text=' + title + '&url=' + url;
    $('share-telegram').href = 'https://t.me/share/url?url=' + url + '&text=' + title;
  }
  updateShareLinks();
  function fallbackCopy(value) {
    var field = element('textarea', 'sr-only'); field.value = value;
    document.body.append(field); field.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { /* Show manual copy guidance. */ }
    field.remove(); return ok;
  }
  document.querySelectorAll('.copy-link').forEach(function (button) {
    button.addEventListener('click', async function () {
      var ok = false;
      try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(publicUrl()); ok = true; } } catch (e) { /* Use the file-compatible fallback. */ }
      if (!ok) ok = fallbackCopy(publicUrl());
      notify(ok ? '文章链接已复制' : '请手动复制文章链接：' + publicUrl());
    });
  });
  $('cover-button').addEventListener('click', function () {
    if (typeof $('cover-dialog').showModal === 'function') $('cover-dialog').showModal();
    else window.open('./assets/og-cover.png', '_blank', 'noopener');
  });
  $('cover-close').addEventListener('click', function () { $('cover-dialog').close(); });
  ['cover-dialog', 'login-dialog'].forEach(function (id) {
    $(id).addEventListener('click', function (event) {
      if (event.target !== this) return;
      var rect = this.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.close();
    });
  });
  $('back-to-top').addEventListener('click', function () { window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); });
}());
