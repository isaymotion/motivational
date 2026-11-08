/* MI Trainer - app shell: router, menu, search, theme, text size, language, backup, What's new.
   Plain ES5 in one IIFE, no build step. To add a screen: add one entry to VIEWS and one to NAV
   (see "APP VIEWS" below). Patterns come from the isaymotion Companion apps (Stahl / DSMVapp),
   MSEtrainer and sheatrainer. */
(function () {
  'use strict';

  /* ===== Storage (try/catch so the app works with storage blocked) ===== */
  var PREFIX = 'mt:v1:';
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(PREFIX + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
    },
    del: function (k) { try { localStorage.removeItem(PREFIX + k); } catch (e) {} }
  };

  /* ===== Key migration (for restyled apps whose storage PREFIX changed, so saved progress survives).
     map = { 'old:prefix:': 'sub-prefix' | function (rest, oldKey) { return 'new-suffix'; } }.
     Every localStorage key starting with an old prefix is copied under PREFIX, then the old key is removed.
     A string value is put in front of the rest of the key ('' just swaps the prefix); a function returns the new
     suffix (a falsy result skips that key). An existing key under PREFIX is never overwritten. ===== */
  function migrateKeys(map) {
    try {
      if (!map || typeof map !== 'object') return;
      var keys = [], i;
      for (i = 0; i < localStorage.length; i++) { var k0 = localStorage.key(i); if (k0) keys.push(k0); }
      Object.keys(map).forEach(function (oldP) {
        if (!oldP) return;
        var to = map[oldP], growing = PREFIX.indexOf(oldP) === 0;   // new prefix extends the old one: do not re-migrate
        keys.forEach(function (k) {
          if (k.indexOf(oldP) !== 0) return;
          if (growing && k.indexOf(PREFIX) === 0) return;
          var rest = k.slice(oldP.length), suffix = typeof to === 'function' ? to(rest, k) : (typeof to === 'string' ? to + rest : null);
          if (typeof suffix !== 'string' || !suffix) return;
          var nk = PREFIX + suffix;
          if (nk === k) return;
          try {
            if (localStorage.getItem(nk) == null) localStorage.setItem(nk, localStorage.getItem(k));
            localStorage.removeItem(k);
          } catch (e) { /* leave the old key in place */ }
        });
      });
    } catch (e) { /* storage unavailable */ }
  }
  if (window.MIGRATE_KEYS) migrateKeys(window.MIGRATE_KEYS);

  var META = window.APP_META || {};
  var CHANGELOG = window.APP_CHANGELOG || [];
  var ATTRIBUTION = META.attribution || '';
  var APP_NAME = META.name || document.title;
  var APP_LINKS = window.APP_LINKS || [];

  /* ===== Language: 'en' (default) or 'tl' (Tagalog). Shell UI strings live in data/strings.js. ===== */
  var STRINGS = window.STRINGS || {};
  var lang = store.get('lang', 'en') === 'tl' ? 'tl' : 'en';
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function t(key) {
    var s = STRINGS[lang] && has(STRINGS[lang], key) ? STRINGS[lang][key] : null;
    if (typeof s !== 'string' || !s) s = STRINGS.en && has(STRINGS.en, key) ? STRINGS.en[key] : null;
    return typeof s === 'string' && s ? s : key;
  }
  function tf(key, vars) { return t(key).replace(/\{(\w+)\}/g, function (m, k) { return vars && has(vars, k) ? String(vars[k]) : m; }); }
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[\[(.+?)\]\]/g, '<kbd>$1</kbd>'); }   // **bold** and [[key]] in strings
  function locale() { return lang === 'tl' ? 'fil' : undefined; }

  /* ===== Helpers ===== */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
    if (!m) return String(iso);
    return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString(locale(), { month: 'long', day: 'numeric', year: 'numeric' });
  }

  var main = document.getElementById('main');
  var sidenav = document.getElementById('sidenav');
  var backdrop = document.getElementById('nav-backdrop');
  var menuBtn = document.getElementById('menu-btn');
  var tabMenu = document.getElementById('tab-menu');
  var qInput = document.getElementById('q');
  var suggestBox = document.getElementById('suggest');

  /* ===== Icons (inline SVG, 24x24, stroke = currentColor). NAV items refer to these by key. ===== */
  var ICONS = {
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    news: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h6M9 16h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    cards: '<rect x="3" y="6" width="14" height="14" rx="2.5"/><path d="M7 3h11a3 3 0 0 1 3 3v11"/>',
    check: '<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || 'nav-ico') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.star) + '</svg>';
  }

  /* ===== NAV: one entry per screen. Builds the sidenav (grouped by `group`) and the home tiles.
     {label, href, icon, group}  Optional: tile:false (keep off the home grid), badge:'news' (unseen What's new count),
     tkey:'nav.x' (label comes from data/strings.js). The "Other apps" group is added after these from window.APP_LINKS. ===== */
  var NAV = [
    { label: 'Home', tkey: 'nav.home', href: '#/', icon: 'home', group: 'Start', tile: false },
    { label: 'Chapters', href: '#/chapters', icon: 'book', group: 'Study' },
    { label: 'Review', href: '#/review', icon: 'cards', group: 'Study', badge: 'due' },
    { label: 'Exam', href: '#/exam', icon: 'check', group: 'Study' },
    { label: 'Mistakes', href: '#/mistakes', icon: 'flag', group: 'Study', badge: 'mistakes' },
    { label: 'Glossary', href: '#/glossary', icon: 'list', group: 'Study' },
    { label: 'What’s new', tkey: 'nav.whatsNew', href: '#/whats-new', icon: 'news', group: 'App', tile: false, badge: 'news' },
    { label: 'About', tkey: 'nav.about', href: '#/about', icon: 'info', group: 'App', tile: false }
  ];
  var NAV_GROUPS = { Start: 'nav.start', Screens: 'nav.screens', App: 'nav.app' };   // group name -> strings key
  function navLabel(n) { return n.tkey ? t(n.tkey) : n.label; }

  /* ===== Search index: fill with {title, text, href, kind}. Rebuild it from your own data if you like.
     The shell's own entries (What's new, About) are added by shellIndex() so they follow the language. ===== */
  var SEARCH_INDEX = [
    /* { title: 'Example', text: 'Words people might search for.', href: '#/example', kind: 'Screen' } */
  ];
  function shellIndex() {
    return [
      { title: t('nav.whatsNew'), text: t('search.newsText'), href: '#/whats-new', kind: t('nav.app') },
      { title: t('nav.about'), text: t('search.aboutText'), href: '#/about', kind: t('nav.app') }
    ];
  }

  /* ===== Theme: auto (match device) / light / dark. No data-theme attribute = match device. ===== */
  var THEME_ICONS = {
    auto: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
    dark: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    light: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  var darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function getTheme() {
    var cur = store.get('theme', 'auto');
    return cur === 'light' || cur === 'dark' ? cur : 'auto';
  }
  function applyTheme(mode) {
    var root = document.documentElement;
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode); else root.removeAttribute('data-theme');
    var dark = mode === 'dark' || (mode !== 'light' && darkMQ && darkMQ.matches);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0E1F20' : '#1C676E');
    var btn = document.getElementById('theme-btn');
    if (btn) {
      var label = tf('theme.label', { name: t('theme.' + mode) });
      btn.innerHTML = THEME_ICONS[mode];
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
    var opts = document.querySelectorAll('[data-theme-opt]');
    for (var i = 0; i < opts.length; i++) opts[i].setAttribute('aria-pressed', opts[i].getAttribute('data-theme-opt') === mode ? 'true' : 'false');
    var radios = document.querySelectorAll('input[name="theme"]');   // the Theme segment on the About page
    for (var j = 0; j < radios.length; j++) radios[j].checked = radios[j].value === mode;
  }
  function setTheme(mode) {
    if (mode !== 'light' && mode !== 'dark') mode = 'auto';
    if (mode === 'auto') store.del('theme'); else store.set('theme', mode);
    applyTheme(mode);
  }
  applyTheme(getTheme());
  (function () {
    var btn = document.getElementById('theme-btn');
    if (btn) btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'auto';
      setTheme({ auto: 'light', light: 'dark', dark: 'auto' }[cur]);
    });
    function onDeviceChange() { applyTheme(document.documentElement.getAttribute('data-theme') || 'auto'); }
    if (darkMQ) { if (darkMQ.addEventListener) darkMQ.addEventListener('change', onDeviceChange); else if (darkMQ.addListener) darkMQ.addListener(onDeviceChange); }
  })();

  /* ===== Header height -> --top ===== */
  function headerH() { var t = document.querySelector('.topbar'); return t ? t.offsetHeight : 64; }
  function setTopVar() { document.documentElement.style.setProperty('--top', headerH() + 'px'); }
  window.addEventListener('resize', setTopVar);
  setTopVar();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setTopVar);

  /* ===== Text size (Aa panel) ===== */
  var TEXT_SIZES = [['90', 'textsize.smaller'], ['100', 'textsize.default'], ['112.5', 'textsize.larger'], ['125', 'textsize.largest']];   // [value, strings key]
  function syncSizeRadios(v) {   // the text-size segment on the About page
    var radios = document.querySelectorAll('input[name="aboutTextSize"]');
    for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === v;
  }
  function applyTextSize(v) {
    var ok = TEXT_SIZES.some(function (z) { return z[0] === v; });
    document.documentElement.style.fontSize = ok && v !== '100' ? v + '%' : '';
    setTopVar();
  }
  (function () {
    var btn = document.getElementById('textSizeBtn');
    if (!btn) return;
    var panel = document.createElement('div');
    panel.className = 'text-size-panel'; panel.id = 'textSizePanel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', t('textsize.title'));
    document.body.appendChild(panel);
    function build() {
      var cur = String(store.get('textSize', '100'));
      panel.setAttribute('aria-label', t('textsize.title'));
      panel.innerHTML = '<p class="text-size-panel__title">' + esc(t('textsize.title')) + '</p><div class="seg">' + TEXT_SIZES.map(function (z, i) {
        return '<label><input type="radio" name="textSize" value="' + z[0] + '"' + (cur === z[0] ? ' checked' : '') + '><span style="font-size:' + (0.82 + i * 0.1).toFixed(2) + 'rem">' + esc(t(z[1])) + '</span></label>';
      }).join('') + '</div>';
    }
    function open() { build(); panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); var f = panel.querySelector('input:checked'); if (f) f.focus(); }
    function close() { if (panel.hidden) return; panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); if (panel.hidden) open(); else close(); });
    panel.addEventListener('change', function (e) {
      if (e.target.name === 'textSize') { store.set('textSize', e.target.value); applyTextSize(e.target.value); syncSizeRadios(e.target.value); }
    });
    document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus(); } });
    window.addEventListener('hashchange', close);
  })();

  /* ===== In-app back/forward buttons (index-stamped history) ===== */
  var HIST_KEY = PREFIX + 'hist';
  var hist = (function () { try { return JSON.parse(sessionStorage.getItem(HIST_KEY)) || { cur: 0, max: 0 }; } catch (e) { return { cur: 0, max: 0 }; } })();
  function saveHist() { try { sessionStorage.setItem(HIST_KEY, JSON.stringify(hist)); } catch (e) {} }
  function stamp(i) { try { history.replaceState({ spIdx: i }, ''); } catch (e) {} }
  function syncHist() {
    var st = history.state;
    if (st && typeof st.spIdx === 'number') {
      hist.cur = st.spIdx;
      if (hist.cur > hist.max) hist.max = hist.cur;
    } else {
      hist.cur = hist.cur + 1;     // a new page: anything that was ahead is discarded
      hist.max = hist.cur;
      stamp(hist.cur);
    }
    saveHist(); paintHist();
  }
  function paintHist() {
    var b = document.getElementById('nav-back'), f = document.getElementById('nav-fwd');
    if (b) b.disabled = hist.cur <= 0;
    if (f) f.disabled = hist.cur >= hist.max;
  }
  (function initHist() {
    var st = history.state;
    if (st && typeof st.spIdx === 'number') { hist.cur = st.spIdx; if (hist.max < hist.cur) hist.max = hist.cur; }
    else { hist = { cur: 0, max: 0 }; stamp(0); }
    saveHist(); paintHist();
    var b = document.getElementById('nav-back'), f = document.getElementById('nav-fwd');
    if (b) b.addEventListener('click', function () { if (!b.disabled) history.back(); });
    if (f) f.addEventListener('click', function () { if (!f.disabled) history.forward(); });
  })();

  /* Alt+Left / Alt+Right (ignores typing in fields and other modifiers) */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if (e.altKey && !typing && !e.ctrlKey && !e.metaKey && !e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      if (e.key === 'ArrowLeft') history.back(); else history.forward();
    }
  });

  /* ===== Scroll restoration (only on back/forward, not on ordinary link clicks) ===== */
  var scrollMemo = {}, scrollKey = location.hash || '#/', fromHistory = false, scrollPending = false;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('scroll', function () {
    if (scrollPending) return;
    scrollPending = true;
    setTimeout(function () { scrollPending = false; scrollMemo[scrollKey] = window.scrollY; }, 120);
  }, { passive: true });
  window.addEventListener('popstate', function (e) { fromHistory = !!(e.state && typeof e.state.spIdx === 'number'); });

  /* ===== Menu: docked sidebar on desktop, drawer on phones/tablets ===== */
  function isDrawerMode() { return window.matchMedia('(max-width: 1099px)').matches; }
  function setMenuExpanded(v) { [menuBtn, tabMenu].forEach(function (b) { if (b) b.setAttribute('aria-expanded', v ? 'true' : 'false'); }); }
  function openDrawer() {
    if (!isDrawerMode()) return;
    document.body.classList.add('drawer-open');
    backdrop.hidden = false;
    setMenuExpanded(true);
    var target = sidenav.querySelector('.sidenav__close');
    setTimeout(function () { if (target) target.focus(); }, 60);
  }
  function closeDrawer() {
    if (!document.body.classList.contains('drawer-open')) return;
    document.body.classList.remove('drawer-open');
    backdrop.hidden = true;
    setMenuExpanded(false);
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { openDrawer(); });
  if (tabMenu) tabMenu.addEventListener('click', function () { if (document.body.classList.contains('drawer-open')) closeDrawer(); else openDrawer(); });
  document.getElementById('nav-close').addEventListener('click', function () { closeDrawer(); if (menuBtn) menuBtn.focus(); });
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) { closeDrawer(); if (menuBtn) menuBtn.focus(); } });
  sidenav.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && a.getAttribute('href') === location.hash) closeDrawer(); });
  var collapseBtn = document.getElementById('collapse-btn');   // desktop: hide/show the docked sidebar
  function labelCollapse() {
    var c = document.documentElement.classList.contains('nav-collapsed');
    collapseBtn.setAttribute('aria-label', t(c ? 'sidebar.show' : 'sidebar.hide'));
    collapseBtn.setAttribute('title', t(c ? 'sidebar.show' : 'sidebar.hide'));
  }
  collapseBtn.addEventListener('click', function () {
    var c = !document.documentElement.classList.contains('nav-collapsed');
    document.documentElement.classList.toggle('nav-collapsed', c);
    store.set('navCollapsed', c); labelCollapse(); setTopVar();
  });
  labelCollapse();

  /* APP_LINKS minus this app's own entry (matched on the repo slug at the end of the URL). Menu only: never tiles, search or tabs. */
  function otherApps() {
    if (!window.SHOW_OTHER_APPS) return [];   // off until she is ready to interlink the apps (data/app-meta.js)
    var me = String(META.repo || '').toLowerCase();
    return APP_LINKS.filter(function (a) {
      if (!a || !a.name || !/^https?:\/\//i.test(String(a.href || ''))) return false;
      var slug = String(a.href).replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop().toLowerCase();
      return !me || slug !== me;
    });
  }
  function currentKey() { var p = parts(); return p.length ? p[0] : 'home'; }
  function buildNav() {
    var cur = location.hash || '#/';
    if (cur === '#') cur = '#/';
    var groups = [], byName = {};
    NAV.forEach(function (n) {
      var g = n.group || 'Menu';
      if (!byName[g]) { byName[g] = { label: g, items: [] }; groups.push(byName[g]); }
      byName[g].items.push(n);
    });
    var html = groups.map(function (g) {
      return '<div class="nav-group"><div class="nav-label">' + esc(NAV_GROUPS[g.label] ? t(NAV_GROUPS[g.label]) : g.label) + '</div><ul>' + g.items.map(function (n) {
        var active = n.href === cur;
        return '<li><a class="nav-item' + (active ? ' is-active' : '') + '" href="' + esc(n.href) + '"' + (active ? ' aria-current="page"' : '') + '>' + icon(n.icon) + '<span>' + esc(navLabel(n)) + '</span>' +
          (n.badge ? '<span class="badge" data-badge="' + esc(n.badge) + '" hidden></span>' : '') + '</a></li>';
      }).join('') + '</ul></div>';
    }).join('');
    var others = otherApps();
    if (others.length) {
      html += '<div class="nav-group"><div class="nav-label">' + esc(t('nav.otherApps')) + '</div><ul>' + others.map(function (a) {
        return '<li><a class="nav-item" href="' + esc(a.href) + '" target="_blank" rel="noopener">' + icon('external') + '<span>' + esc(a.name) + '</span><span class="sr-only"> ' + esc(t('nav.newTab')) + '</span></a></li>';
      }).join('') + '</ul></div>';
    }
    document.getElementById('sidenav-body').innerHTML = html;
    var tabs = document.querySelectorAll('.tabbar [data-tab]');
    var key = currentKey();
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-tab') === key;
      if (tabs[i].tagName === 'A') { tabs[i].classList.toggle('is-active', on); if (on) tabs[i].setAttribute('aria-current', 'page'); else tabs[i].removeAttribute('aria-current'); }
    }
  }

  /* ===== What's new: unseen badge keyed on the version string ===== */
  function latestNewsVersion() { return CHANGELOG.length ? String(CHANGELOG[0].version) : ''; }
  function seenNewsVersion() {
    var s = store.get('seenNews', null);
    if (s == null) { s = latestNewsVersion(); store.set('seenNews', s); }   // brand-new visitors start up to date
    return s;
  }
  function unseenNews() {
    var seen = seenNewsVersion(), out = [];
    for (var i = 0; i < CHANGELOG.length; i++) {
      if (String(CHANGELOG[i].version) === seen) return out;
      out.push(CHANGELOG[i]);
    }
    return out;
  }
  var updateNavBadges = function () {
    var n = unseenNews().length;
    var els = document.querySelectorAll('[data-badge="news"]');
    for (var i = 0; i < els.length; i++) { els[i].textContent = n; els[i].hidden = !n; }
  }

  /* ===== Search ===== */
  var sugIndex = -1, sugTimer = null, searchKind = '';
  function terms(q) { return String(q).toLowerCase().replace(/[^\p{L}\p{N}\-\s.]/gu, ' ').split(/\s+/).filter(function (t) { return t.length > 0; }); }
  function runSearch(q) {
    var ts = terms(q);
    if (!ts.length) return [];
    var out = [];
    shellIndex().concat(SEARCH_INDEX).forEach(function (e) {
      var t = String(e.title || '').toLowerCase(), x = String(e.text || '').toLowerCase(), score = 0, ok = true;
      ts.forEach(function (w) {
        var iT = t.indexOf(w), iX = x.indexOf(w);
        if (iT < 0 && iX < 0) { ok = false; return; }
        if (iT >= 0) score += iT === 0 ? 6 : 4;
        if (iX >= 0) score += 1;
      });
      if (ok) out.push({ e: e, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.map(function (r) { return r.e; });
  }
  function highlight(text, ts) {
    text = String(text == null ? '' : text);
    if (!ts.length) return esc(text);
    var re = new RegExp('(' + ts.map(escRe).join('|') + ')', 'gi');
    return text.split(re).map(function (seg, i) { return i % 2 ? '<mark>' + esc(seg) + '</mark>' : esc(seg); }).join('');
  }
  function snippet(text, ts, len) {
    text = String(text || '');
    if (text.length <= len) return text;
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < ts.length && at < 0; i++) at = low.indexOf(ts[i]);
    var start = Math.max(0, (at < 0 ? 0 : at) - 40);
    return (start > 0 ? '…' : '') + text.slice(start, start + len) + (start + len < text.length ? '…' : '');
  }
  function openSuggest(q) {
    q = String(q || '').trim();
    if (!q) { closeSuggest(); return; }
    var ts = terms(q), res = runSearch(q), shown = res.slice(0, 6);
    sugIndex = -1;
    qInput.removeAttribute('aria-activedescendant');
    if (!shown.length) {
      suggestBox.innerHTML = '<div class="suggest__empty">' + esc(tf('search.noMatches', { q: q })) + '</div>';
    } else {
      suggestBox.innerHTML = shown.map(function (e, i) {
        return '<a class="suggest__item" role="option" id="sug-' + i + '" href="' + esc(e.href) + '" aria-selected="false"><span class="suggest__meta"><span class="kind">' + esc(e.kind || '') + '</span><span>' + highlight(e.title, ts) + '</span></span><span class="suggest__text">' + highlight(snippet(e.text, ts, 140), ts) + '</span></a>';
      }).join('') + '<a class="suggest__item suggest__all" role="option" id="sug-all" href="#/search/' + encodeURIComponent(q) + '" aria-selected="false">' + esc(tf(res.length === 1 ? 'search.seeAll1' : 'search.seeAllN', { n: res.length })) + '</a>';
    }
    suggestBox.hidden = false;
    qInput.setAttribute('aria-expanded', 'true');
  }
  function closeSuggest() {
    if (!suggestBox) return;
    suggestBox.hidden = true; sugIndex = -1;
    qInput.setAttribute('aria-expanded', 'false');
    qInput.removeAttribute('aria-activedescendant');
  }
  function moveSug(d) {
    var items = suggestBox.querySelectorAll('.suggest__item');
    if (!items.length) return;
    sugIndex = (sugIndex + d + items.length) % items.length;
    items.forEach(function (it, i) { it.setAttribute('aria-selected', String(i === sugIndex)); });
    qInput.setAttribute('aria-activedescendant', items[sugIndex].id);
    items[sugIndex].scrollIntoView({ block: 'nearest' });
  }
  qInput.addEventListener('input', function () {
    clearTimeout(sugTimer);
    sugTimer = setTimeout(function () { openSuggest(qInput.value); }, 110);
  });
  qInput.addEventListener('focus', function () { if (qInput.value.trim()) openSuggest(qInput.value); });
  qInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (suggestBox.hidden) openSuggest(qInput.value); moveSug(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSug(-1); }
    else if (e.key === 'Escape') { closeSuggest(); qInput.blur(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      var items = suggestBox.querySelectorAll('.suggest__item');
      var target = sugIndex > -1 && items[sugIndex] ? items[sugIndex].getAttribute('href') : (qInput.value.trim() ? '#/search/' + encodeURIComponent(qInput.value.trim()) : null);
      closeSuggest();
      if (target) { if (location.hash === target) route(); else location.hash = target; qInput.blur(); }
    }
  });
  suggestBox.addEventListener('mousedown', function (e) { e.preventDefault(); });
  qInput.addEventListener('blur', function () { setTimeout(closeSuggest, 120); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target.matches && e.target.matches('input, textarea, select'))) { e.preventDefault(); qInput.focus(); qInput.select(); }
  });

  /* ===== Views ===== */
  var VIEWS = {};
  var AFTER = {};      // optional: AFTER.myScreen = function (arg) { ...wire events after render... }
  var TITLES = { home: '' };   // key -> page title (the shell's own titles come from SHELL_TITLES)
  var SHELL_TITLES = { 'whats-new': 'nav.whatsNew', about: 'nav.about', search: 'search.title' };

  VIEWS.home = function () {
    var tiles = NAV.filter(function (n) { return n.tile !== false && n.href !== '#/'; });
    var first = tiles[0];
    var latest = CHANGELOG[0];
    return '<section class="hero"><div class="wrap hero__inner">' +
        '<h1>' + esc(APP_NAME) + '</h1>' +
        '<p class="hero__lead">Learn Motivational Interviewing chapter by chapter — the spirit, OARS, the four processes and the stages of change — with flashcards, quizzes and a glossary built from SAMHSA TIP 35.</p>' +
        (first ? '<p><a class="btn btn--solid" href="' + esc(first.href) + '">' + esc(navLabel(first)) + '</a></p>' : '') +
      '</div></section>' +
      '<div class="wrap home">' + homeToday() +
        (tiles.length
          ? '<h2 class="home__h">' + esc(t('home.explore')) + '</h2><div class="cards">' + tiles.map(function (n) {
              return '<a class="card tile" href="' + esc(n.href) + '">' + icon(n.icon, 'tile__ico') + '<h3>' + esc(navLabel(n)) + '</h3></a>';
            }).join('') + '</div>'
          : '<div class="empty"><h2>' + esc(t('home.emptyTitle')) + '</h2><p>' + esc(t('home.emptyText')) + '</p></div>') +
        '<a class="card news-strip" href="#/whats-new"><span class="badge" data-badge="news" hidden></span><strong>' + esc(t('nav.whatsNew')) + '</strong>' +
          (latest ? '<span class="muted">' + esc(tf('home.latest', { title: latest.title, version: latest.version })) + '</span>' : '') + '</a>' +
      '</div>';
  };

  function homeToday() {   // study status strip: cards due, chapters loaded, mistakes
    var d = dueCount(), m = mistakeCount(), all = allCards(), fresh = all.filter(function (x) { return !SRS[x.key]; }).length;
    return '<div class="stats home__stats"><a class="card stat" href="#/review"><strong>' + d + '</strong><span>cards due today</span></a>' +
      '<a class="card stat" href="#/review"><strong>' + fresh + '</strong><span>new cards</span></a>' +
      '<a class="card stat" href="#/chapters"><strong>' + CHAPTERS.length + ' / ' + TOC.length + '</strong><span>chapters ready</span></a>' +
      '<a class="card stat" href="#/mistakes"><strong>' + m + '</strong><span>mistakes to retry</span></a></div>';
  }
  VIEWS['whats-new'] = function () {
    var unseen = {};
    unseenNews().forEach(function (e) { unseen[String(e.version)] = true; });
    var html = '<div class="wrap page news"><header class="page__head"><h1>' + esc(t('nav.whatsNew')) + '</h1><p>' + esc(t('news.intro1')) + '<span class="news__new">' + esc(t('news.new')) + '</span>' + esc(t('news.intro2')) + '</p></header>' +
      CHANGELOG.map(function (e) {
        var isNew = !!unseen[String(e.version)];
        return '<article class="news__entry' + (isNew ? ' is-new' : '') + '"><div class="news__date"><time datetime="' + esc(e.date) + '">' + esc(fmtDate(e.date)) + '</time><span class="news__ver">' + esc(tf('news.version', { v: e.version })) + '</span>' + (isNew ? '<span class="news__new">' + esc(t('news.new')) + '</span>' : '') + '</div>' +
          '<div class="news__body"><h2>' + esc(e.title) + '</h2>' + (e.summary ? '<p>' + esc(e.summary) + '</p>' : '') + '<ul>' +
          (e.items || []).map(function (it) {
            var ty = String(it.type || 'feature'), tyLabel = t('news.type.' + ty);
            if (tyLabel === 'news.type.' + ty) tyLabel = ty.charAt(0).toUpperCase() + ty.slice(1);
            return '<li><span class="news__type news__type--' + esc(ty) + '">' + esc(tyLabel) + '</span><span class="news__text">' + esc(it.text) + (it.href ? ' <a href="' + esc(it.href) + '">' + esc(t('news.open')) + '</a>' : '') + '</span></li>';
          }).join('') + '</ul></div></article>';
      }).join('') +
      '<p class="news__note">' + esc(t('news.note')) + '<a href="mailto:isaymotion@gmail.com">isaymotion@gmail.com</a>.</p></div>';
    store.set('seenNews', latestNewsVersion());   // opening the page marks everything as seen
    return html;
  };

  function segGroup(name, label, opts, cur) {   // opts: [[value, label], ...]; radios inside the shared .seg control
    return '<fieldset class="setting"><legend>' + esc(label) + '</legend><div class="seg">' + opts.map(function (o) {
      return '<label><input type="radio" name="' + esc(name) + '" value="' + esc(o[0]) + '"' + (cur === o[0] ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>';
    }).join('') + '</div></fieldset>';
  }
  VIEWS.about = function () {
    var sizes = TEXT_SIZES.map(function (z) { return [z[0], t(z[1])]; });
    return '<div class="wrap page"><header class="page__head"><h1>' + esc(t('nav.about')) + '</h1><p>' + esc(META.tagline || '') + '</p></header>' +
      '<div class="prose"><p><strong>' + esc(APP_NAME) + '</strong> · ' + esc(t('about.version')) + ' ' + esc(META.version || '') + '</p><p>' + esc(ATTRIBUTION) + '</p></div>' +
      '<h2>' + esc(t('about.settings')) + '</h2><div class="card">' +
        segGroup('lang', t('about.language'), [['en', t('about.langEn')], ['tl', t('about.langTl')]], lang) +
        segGroup('theme', t('theme.title'), [['auto', t('theme.auto')], ['light', t('theme.light')], ['dark', t('theme.dark')]], getTheme()) +
        segGroup('aboutTextSize', t('textsize.title'), sizes, String(store.get('textSize', '100'))) +
      '</div>' +
      '<h2>' + esc(t('about.tips')) + '</h2><div class="card"><ul class="prose" style="margin:0;padding-left:1.2em">' +
        [1, 2, 3, 4, 5].map(function (i) { return '<li>' + rich(t('about.tip' + i)) + '</li>'; }).join('') +
      '</ul></div></div>';
  };

  VIEWS.search = function (q) {
    q = String(q || '');
    var ts = terms(q), res = runSearch(q);
    var kinds = [];
    res.forEach(function (e) { var k = e.kind || ''; if (k && kinds.indexOf(k) < 0) kinds.push(k); });
    if (searchKind && kinds.indexOf(searchKind) < 0) searchKind = '';
    var shown = searchKind ? res.filter(function (e) { return e.kind === searchKind; }) : res;
    return '<div class="wrap page search-page"><header class="page__head"><h1>' + esc(t('search.title')) + '</h1><p>' +
        esc(q ? tf(shown.length === 1 ? 'search.count1' : 'search.countN', { n: shown.length, q: q }) : t('search.prompt')) + '</p></header>' +
      (kinds.length > 1 ? '<div class="filters" role="group" aria-label="' + esc(t('search.filterBy')) + '"><button type="button" class="filter" data-kind="" aria-pressed="' + (!searchKind) + '">' + esc(t('search.all')) + '</button>' +
        kinds.map(function (k) { return '<button type="button" class="filter" data-kind="' + esc(k) + '" aria-pressed="' + (searchKind === k) + '">' + esc(k) + '</button>'; }).join('') + '</div>' : '') +
      (shown.length
        ? '<div class="results">' + shown.map(function (e) {
            return '<div class="result"><a href="' + esc(e.href) + '"><span class="result__meta"><span class="kind">' + esc(e.kind || '') + '</span></span><span class="result__title">' + highlight(e.title, ts) + '</span><span class="result__text">' + highlight(snippet(e.text, ts, 220), ts) + '</span></a></div>';
          }).join('') + '</div>'
        : (q ? '<div class="empty"><h2>' + esc(t('search.noneTitle')) + '</h2><p>' + esc(t('search.noneText')) + '</p></div>' : ''))
      + '</div>';
  };
  AFTER.search = function (q) { if (qInput && document.activeElement !== qInput) qInput.value = q || ''; };

  function missingView() {
    return '<div class="wrap page"><div class="empty"><h2>' + esc(t('notfound.title')) + '</h2><p>' + esc(t('notfound.text')) + '</p><p><a class="btn btn--solid" href="#/">' + esc(t('notfound.home')) + '</a></p></div></div>';
  }

  /* ===== APP VIEWS: add your screens here =====
     1. Add a function to VIEWS that returns an HTML string:   VIEWS.birthdays = function (arg) { return '<div class="wrap page">...</div>'; };
        (arg = the part of the hash after the screen name, e.g. #/birthdays/march -> 'march'.) Use esc() on all data.
     2. Add one entry to NAV above (label, href '#/birthdays', icon key from ICONS, group).
     3. Optional: add rows to SEARCH_INDEX, an entry to TITLES, and AFTER.birthdays = function () { ... } to wire events.
     The Example screen below shows the reusable classes from css/app.css. Delete it when you no longer need it. */

  /* ===== STUDY ENGINE: chapters, study guide, high-yield, flashcards (SM-2), quiz, glossary, review, exam, mistakes ===== */
  var CHAPTERS = (window.MI_CHAPTERS || []).slice().sort(function (a, b) { return a.id - b.id; });
  var TOC = window.MI_TOC || CHAPTERS.map(function (c) { return { id: c.id, title: c.title, pages: c.pages }; });
  var BY_ID = {};
  CHAPTERS.forEach(function (c) { BY_ID[String(c.id)] = c; });
  function chapter(id) { return BY_ID[String(id)] || null; }
  function cardKey(ch, card) { return ch.id + '/' + card.id; }
  function quizKey(ch, q) { return ch.id + '/' + q.id; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  var MODES = [
    { key: 'guide', label: 'Study guide', short: 'Guide', cls: 'c-guide', count: function (c) { return c.sections.length; } },
    { key: 'hy', label: 'High-yield', cls: 'c-hy', count: function (c) { return c.highYield.length; } },
    { key: 'cards', label: 'Flashcards', short: 'Cards', cls: 'c-cards', count: function (c) { return c.cards.length; } },
    { key: 'quiz', label: 'Quiz', cls: 'c-quiz', count: function (c) { return c.quiz.length; } },
    { key: 'gloss', label: 'Glossary', cls: 'c-gloss', count: function (c) { return c.glossary.length; } }
  ];

  /* --- Glossary index + tap-to-define --- */
  var GLOSS = [];     // {term, def, alt[], ch}
  CHAPTERS.forEach(function (c) { (c.glossary || []).forEach(function (g) { GLOSS.push({ term: g.term, def: g.def, alt: g.alt || [], ch: c.id }); }); });
  GLOSS.sort(function (a, b) { return a.term.localeCompare(b.term); });
  var TERM_RE = (function () {
    var names = [];
    GLOSS.forEach(function (g) { names.push(g.term); g.alt.forEach(function (a) { names.push(a); }); });
    names.sort(function (a, b) { return b.length - a.length; });
    return names.length ? new RegExp('(^|[^\\w>])(' + names.map(escRe).join('|') + ')(?![\\w<])(?=[^<]*(?:<|$))', 'gi') : null;
  })();
  function findTerm(name) {
    var low = String(name).toLowerCase();
    for (var i = 0; i < GLOSS.length; i++) {
      if (GLOSS[i].term.toLowerCase() === low) return GLOSS[i];
      for (var j = 0; j < GLOSS[i].alt.length; j++) if (GLOSS[i].alt[j].toLowerCase() === low) return GLOSS[i];
    }
    return null;
  }
  function linkTerms(html) {   // html is trusted content from data/*.js; wrap first mention of each term per block
    if (!TERM_RE) return html;
    var seen = {};
    return String(html).replace(TERM_RE, function (m, pre, name) {
      var g = findTerm(name);
      if (!g || seen[g.term]) return m;
      seen[g.term] = true;
      return pre + '<button type="button" class="term" data-term="' + esc(g.term) + '">' + name + '</button>';
    });
  }
  function termSheet() {
    var el = document.getElementById('term-sheet');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'term-sheet'; el.className = 'sheet'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="sheet__back"></div><div class="sheet__panel"><div class="sheet__head"><h2 id="term-title"></h2><button type="button" class="icon-btn sheet__close" aria-label="Close">✕</button></div><p class="sheet__body" id="term-def"></p><p class="sheet__foot"><a id="term-link" href="#/glossary">Open the glossary</a></p></div>';
    document.body.appendChild(el);
    function close() { el.hidden = true; }
    el.querySelector('.sheet__back').addEventListener('click', close);
    el.querySelector('.sheet__close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !el.hidden) close(); });
    window.addEventListener('hashchange', close);
    return el;
  }
  function showTerm(name) {
    var g = findTerm(name); if (!g) return;
    var el = termSheet();
    el.querySelector('#term-title').textContent = g.term;
    el.querySelector('#term-def').textContent = g.def;
    el.querySelector('#term-link').setAttribute('href', '#/glossary/' + encodeURIComponent(g.term));
    el.hidden = false;
    el.querySelector('.sheet__close').focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.term[data-term]') : null;
    if (b) { e.preventDefault(); showTerm(b.getAttribute('data-term')); }
  });

  /* --- Spaced repetition (SM-2, as in Stahl / DSM) --- */
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
  var SRS = store.get('srs', {}) || {};
  function saveSRS() { store.set('srs', SRS); }
  function srsNext(s, g) {
    s = s || { i: 0, e: 2.5, r: 0, l: 0 };
    var e = s.e, i, r = s.r, l = s.l || 0;
    if (g === 1) { e = Math.max(1.3, e - 0.2); i = 0; r = 0; l++; }
    else if (g === 2) { e = Math.max(1.3, e - 0.15); i = r === 0 ? 1 : Math.max(s.i + 1, Math.round(s.i * 1.2)); r++; }
    else if (g === 3) { i = r === 0 ? 2 : r === 1 ? 5 : Math.max(s.i + 1, Math.round(s.i * e)); r++; }
    else { e = e + 0.15; i = r === 0 ? 4 : Math.max(s.i + 2, Math.round(s.i * e * 1.3)); r++; }
    return { i: i, e: Math.round(e * 100) / 100, r: r, l: l, d: today() + i };
  }
  function ivLabel(i) { return i === 0 ? 'Today' : i === 1 ? '1 day' : i < 30 ? i + ' days' : i < 365 ? Math.round(i / 30) + ' mo' : (i / 365).toFixed(1) + ' yr'; }
  function cardStatus(key) { var s = SRS[key]; if (!s) return 'New'; if (s.d <= today()) return 'Due'; return s.i >= 21 ? 'Mastered' : 'Learning'; }
  function isDue(key) { var s = SRS[key]; return !!s && s.d <= today(); }
  var NEW_PER_DAY = 20;
  function newSeenToday() { var n = store.get('newToday', null); return n && n.day === today() ? n.n : 0; }
  function bumpNewSeen() { store.set('newToday', { day: today(), n: newSeenToday() + 1 }); }
  function rateCard(key, g) {
    var wasNew = !SRS[key];
    SRS[key] = srsNext(SRS[key], g);
    saveSRS();
    if (wasNew) bumpNewSeen();
    updateNavBadges();
  }
  function allCards() {
    var out = [];
    CHAPTERS.forEach(function (c) { c.cards.forEach(function (k) { out.push({ ch: c, card: k, key: cardKey(c, k) }); }); });
    return out;
  }
  function dueCount() { return allCards().filter(function (x) { return isDue(x.key); }).length; }
  function chapterProgress(c) {
    var n = c.cards.length, m = 0, l = 0;
    c.cards.forEach(function (k) { var s = cardStatus(cardKey(c, k)); if (s === 'Mastered') m++; else if (s !== 'New') l++; });
    return { total: n, mastered: m, learning: l, pct: n ? Math.round(100 * m / n) : 0 };
  }

  /* --- Mistakes (missed quiz questions) --- */
  var MISTAKES = store.get('mistakes', {}) || {};
  function saveMistakes() { store.set('mistakes', MISTAKES); updateNavBadges(); }
  function addMistake(key) { MISTAKES[key] = { n: (MISTAKES[key] ? MISTAKES[key].n : 0) + 1, t: Date.now() }; saveMistakes(); }
  function clearMistake(key) { delete MISTAKES[key]; saveMistakes(); }
  function mistakeCount() { return Object.keys(MISTAKES).length; }
  function findQuestion(key) {
    var p = key.split('/'), c = chapter(p[0]); if (!c) return null;
    for (var i = 0; i < c.quiz.length; i++) if (c.quiz[i].id === p[1]) return { ch: c, q: c.quiz[i], key: key };
    return null;
  }
  var _updateNavBadges = updateNavBadges;
  updateNavBadges = function () {
    _updateNavBadges();
    var pairs = [['due', dueCount()], ['mistakes', mistakeCount()]];
    pairs.forEach(function (p) {
      var els = document.querySelectorAll('[data-badge="' + p[0] + '"]');
      for (var i = 0; i < els.length; i++) { els[i].textContent = p[1]; els[i].hidden = !p[1]; }
    });
  };

  /* --- Rendering helpers --- */
  function crumb(parts) { return '<p class="crumb">' + parts.map(function (p) { return p.href ? '<a href="' + esc(p.href) + '">' + esc(p.label) + '</a>' : esc(p.label); }).join(' / ') + '</p>'; }
  function stagesSVG() {
    var names = ['Precontemplation', 'Contemplation', 'Preparation', 'Action', 'Maintenance'];
    var cx = 180, cy = 150, R = 105, out = '';
    names.forEach(function (n, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      var a2 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / 5, x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
      var mx = cx + (R + 8) * Math.cos((a + a2) / 2), my = cy + (R + 8) * Math.sin((a + a2) / 2);
      out += '<path d="M' + (x + (x2 - x) * 0.3).toFixed(1) + ' ' + (y + (y2 - y) * 0.3).toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + (x + (x2 - x) * 0.7).toFixed(1) + ' ' + (y + (y2 - y) * 0.7).toFixed(1) + '" class="stages__arc" marker-end="url(#arr)" marker-start="url(#arr0)"/>';
    });
    names.forEach(function (n, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      out += '<g class="stages__node"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="34"/><text x="' + x.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="middle">' + esc(n.length > 11 ? n.slice(0, 7) + '-' : n) + '</text>' + (n.length > 11 ? '<text x="' + x.toFixed(1) + '" y="' + (y + 16).toFixed(1) + '" text-anchor="middle">' + esc(n.slice(7)) + '</text>' : '') + '</g>';
    });
    out += '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" class="stages__mid">Relapse &amp;</text><text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" class="stages__mid">Recycle</text>';
    return '<figure class="stages"><svg viewBox="0 0 360 300" role="img" aria-label="The five stages of change arranged in a cycle with bidirectional arrows and Relapse and Recycle at the centre"><defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z"/></marker><marker id="arr0" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M10 0L0 5L10 10z"/></marker></defs>' + out + '</svg><figcaption>Exhibit 1.3 (redrawn): the five stages in the SOC. Movement is spiral and bidirectional; recurrence re-enters the cycle.</figcaption></figure>';
  }
  function renderBlocks(blocks) {
    return blocks.map(function (b) {
      switch (b.t) {
        case 'p': return '<p>' + linkTerms(b.x) + '</p>';
        case 'h3': return '<h3>' + esc(b.x) + '</h3>';
        case 'ul': return '<ul>' + b.items.map(function (x) { return '<li>' + linkTerms(x) + '</li>'; }).join('') + '</ul>';
        case 'ol': return '<ol>' + b.items.map(function (x) { return '<li>' + linkTerms(x) + '</li>'; }).join('') + '</ol>';
        case 'note': return '<div class="callout callout--note"><p class="callout__title">' + esc(b.title || 'Note') + '</p>' + linkTerms(b.x) + '</div>';
        case 'table': return '<div class="table-wrap"><table><thead><tr>' + b.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + b.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return (i === 0 ? '<th scope="row">' : '<td>') + linkTerms(c) + (i === 0 ? '</th>' : '</td>'); }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
        case 'stages': return stagesSVG();
        default: return '';
      }
    }).join('');
  }
  function modeTabs(c, cur) {
    return '<div class="modes" role="tablist">' + MODES.map(function (m) {
      return '<a class="mode ' + m.cls + (m.key === cur ? ' is-active' : '') + '" href="#/c/' + c.id + '/' + m.key + '"' + (m.key === cur ? ' aria-current="page"' : '') + '>' + (m.short ? '<span class="mode__full">' + esc(m.label) + '</span><span class="mode__short" aria-hidden="true">' + esc(m.short) + '</span>' : esc(m.label)) + '<span class="mode__count">' + m.count(c) + '</span></a>';
    }).join('') + '</div>';
  }

  /* --- Chapters list --- */
  TITLES.chapters = 'Chapters';
  VIEWS.chapters = function () {
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Chapters' }]) +
      '<header class="page__head"><h1>Chapters</h1><p>SAMHSA TIP 35, <em>Enhancing Motivation for Change in Substance Use Disorder Treatment</em>. Each chapter has a study guide, high-yield points, flashcards, a quiz and a glossary.</p></header>' +
      TOC.map(function (tc) {
        var c = chapter(tc.id), pr = c ? chapterProgress(c) : null, best = c ? store.get('quizBest.' + c.id, null) : null;
        if (!c) return '<div class="row row--soon" aria-disabled="true"><span class="row__num">' + tc.id + '</span><span><h3>' + esc(tc.title) + '</h3><p>' + esc(tc.sub || '') + '</p></span><span class="badge badge--soon">Soon</span></div>';
        return '<a class="row" href="#/c/' + c.id + '"><span class="row__num">' + c.id + '</span><span><h3>' + esc(c.title) + '</h3><p>' + esc(tc.sub || '') + ' · pp. ' + esc(c.pages) + '</p>' +
          '<span class="row__meta"><span class="meter__bar meter__bar--sm"><span style="width:' + pr.pct + '%"></span></span><span class="muted">' + pr.mastered + '/' + pr.total + ' cards mastered' + (best ? ' · quiz best ' + best.score + '/' + best.total : '') + '</span></span></span></a>';
      }).join('') + '</div>';
  };

  /* --- Chapter page with modes --- */
  TITLES.c = 'Chapter';
  VIEWS.c = function (id, mode, arg) {
    var c = chapter(id);
    if (!c) return missingView();
    mode = MODES.some(function (m) { return m.key === mode; }) ? mode : 'guide';
    TITLES.c = 'Chapter ' + c.id + ' — ' + c.title;
    var head = '<div class="wrap page chapter">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Chapters', href: '#/chapters' }, { label: 'Chapter ' + c.id }]) +
      '<header class="page__head"><p class="eyebrow">Chapter ' + c.id + ' · pp. ' + esc(c.pages) + '</p><h1>' + esc(c.title) + '</h1></header>' + modeTabs(c, mode);
    var body = mode === 'guide' ? guideView(c) : mode === 'hy' ? hyView(c) : mode === 'cards' ? cardsView(c, arg) : mode === 'quiz' ? quizView(c) : glossView(c);
    return head + body + '</div>';
  };
  AFTER.c = function (id, mode) {
    var act = main.querySelector('.mode.is-active'), bar = main.querySelector('.modes');
    if (act && bar && bar.scrollWidth > bar.clientWidth) bar.scrollLeft = act.offsetLeft - (bar.clientWidth - act.offsetWidth) / 2;
    if (mode === 'cards') wirePlayer();
    if (mode === 'quiz') wireQuiz();
  };
  function guideView(c) {
    return '<div class="guide">' +
      (c.quote ? '<blockquote class="quote"><p>“' + esc(c.quote.text) + '”</p><footer>— ' + esc(c.quote.by) + '</footer></blockquote>' : '') +
      '<div class="callout callout--key"><p class="callout__title">Key messages</p><ul>' + c.keyMessages.map(function (k) { return '<li>' + linkTerms(k) + '</li>'; }).join('') + '</ul></div>' +
      '<nav class="toc" aria-label="In this chapter"><span class="toc__label">In this chapter</span>' + c.sections.map(function (s) { return '<a class="filter" href="#/c/' + c.id + '/guide" data-jump="s-' + esc(s.id) + '">' + esc(s.h) + '</a>'; }).join('') + '</nav>' +
      c.sections.map(function (s) { return '<section class="guide__sec" id="s-' + esc(s.id) + '"><h2>' + esc(s.h) + '</h2>' + renderBlocks(s.blocks) + '</section>'; }).join('') +
      '<div class="next"><a class="btn btn--solid" href="#/c/' + c.id + '/hy">High-yield points →</a> <a class="btn" href="#/c/' + c.id + '/cards">Flashcards</a></div></div>';
  }
  main.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-jump]') : null;
    if (!a) return;
    var el = document.getElementById(a.getAttribute('data-jump'));
    if (el) { e.preventDefault(); var y = el.getBoundingClientRect().top + window.scrollY - headerH() - 12; window.scrollTo({ top: y, behavior: 'smooth' }); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
  });
  function hyView(c) {
    return '<div class="hy"><p class="muted">' + plural(c.highYield.length, 'point', 'points') + ' worth knowing cold. Tap a highlighted term for its definition.</p><ol class="hy__list">' +
      c.highYield.map(function (x) { return '<li>' + linkTerms(x) + '</li>'; }).join('') + '</ol>' +
      '<div class="next"><a class="btn btn--solid" href="#/c/' + c.id + '/cards">Flashcards →</a> <a class="btn" href="#/c/' + c.id + '/quiz">Quiz</a></div></div>';
  }
  function glossView(c) {
    return '<div class="gloss"><p class="muted">' + plural(c.glossary.length, 'term', 'terms') + ' from this chapter. Tap a term to show its definition.</p>' + glossList(c.glossary.slice().sort(function (a, b) { return a.term.localeCompare(b.term); }), null) + '</div>';
  }
  function glossList(items, openTerm) {
    return '<div class="gloss__list">' + items.map(function (g) {
      var open = openTerm && g.term.toLowerCase() === openTerm.toLowerCase();
      return '<details class="gloss__item"' + (open ? ' open id="g-open"' : '') + '><summary>' + esc(g.term) + (g.alt && g.alt.length ? ' <span class="muted">(' + esc(g.alt.join(', ')) + ')</span>' : '') + (g.ch ? '<span class="gloss__ch">Ch ' + g.ch + '</span>' : '') + '</summary><p>' + esc(g.def) + '</p></details>';
    }).join('') + '</div>';
  }

  /* --- Flashcard player --- */
  var player = null;   // { key: route key, deck: [{ch, card, key}], i, flipped, known, learn }
  function buildDeck(c, filter) {
    var all = c ? c.cards.map(function (k) { return { ch: c, card: k, key: cardKey(c, k) }; }) : allCards();
    if (filter === 'due') all = all.filter(function (x) { return isDue(x.key); });
    else if (filter === 'new') all = all.filter(function (x) { return !SRS[x.key]; });
    else if (filter === 'review') {
      var due = all.filter(function (x) { return isDue(x.key); });
      var fresh = all.filter(function (x) { return !SRS[x.key]; }).slice(0, Math.max(0, NEW_PER_DAY - newSeenToday()));
      all = shuffle(due).concat(fresh);
    }
    return all;
  }
  function cardsView(c, filter) {
    filter = filter === 'due' || filter === 'new' ? filter : 'all';
    var pkey = 'c' + c.id + ':' + filter;
    if (!player || player.key !== pkey) player = { key: pkey, deck: buildDeck(c, filter), i: 0, flipped: false, known: 0, learn: 0 };
    var pr = chapterProgress(c);
    return '<div class="cards-mode"><div class="filters" role="group" aria-label="Which cards">' + [['all', 'All cards'], ['due', 'Due today'], ['new', 'New']].map(function (f) {
      var n = buildDeck(c, f[0]).length;
      return '<a class="filter" href="#/c/' + c.id + '/cards/' + f[0] + '" aria-pressed="' + (filter === f[0]) + '">' + f[1] + ' <span class="filter__n">' + n + '</span></a>';
    }).join('') + '</div>' +
      '<div class="tally"><span>' + pr.mastered + ' mastered</span><span class="tally__bar"><span class="tally__known" style="width:' + pr.pct + '%"></span><span class="tally__learn" style="width:' + (pr.total ? Math.round(100 * pr.learning / pr.total) : 0) + '%"></span></span><span>' + pr.learning + ' learning</span></div>' +
      '<div id="player">' + playerHTML() + '</div></div>';
  }
  function playerHTML() {
    var p = player;
    if (!p.deck.length) return '<div class="empty"><h2>Nothing here right now</h2><p>No cards match this filter. Try “All cards”, or come back when cards are due.</p></div>';
    if (p.i >= p.deck.length) return '<div class="result-card"><p class="eyebrow">Session complete</p><h2>' + plural(p.deck.length, 'card', 'cards') + ' reviewed</h2><p>' + p.known + ' rated Good or Easy · ' + p.learn + ' rated Again or Hard. Ratings set when each card comes back.</p><p><button type="button" class="btn btn--solid" data-act="restart">Go again</button> <a class="btn" href="#/chapters">Chapters</a></p></div>';
    var x = p.deck[p.i], k = x.card, st = cardStatus(x.key), s = SRS[x.key];
    var face = function (front) {
      return '<div class="face face--' + (front ? 'front' : 'back') + '"' + (front ? '' : ' aria-hidden="true"') + '><div class="face__top"><span class="face__tag">' + esc(k.tag || ('Chapter ' + x.ch.id)) + '</span><span class="face__status face__status--' + st.toLowerCase() + '">' + st + (s && !front ? ' · ' + ivLabel(s.i) : '') + '</span></div>' +
        (front ? '<p class="face__q">' + esc(k.q) + '</p><p class="face__hint">Tap the card or press Space to see the answer.</p>'
               : '<p class="face__a">' + k.a + '</p>' + (k.why ? '<p class="face__why">' + k.why + '</p>' : '') + '<p class="face__hint">Ch ' + x.ch.id + ' · ' + esc(x.ch.title) + '</p>') + '</div>';
    };
    var preview = function (g) { return ivLabel(srsNext(SRS[x.key], g).i); };
    return '<div class="stage"><div class="flashcard' + (p.flipped ? ' is-flipped' : '') + '" id="fc" tabindex="0" role="group" aria-roledescription="flashcard" aria-label="Card ' + (p.i + 1) + ' of ' + p.deck.length + ', ' + (p.flipped ? 'answer' : 'question') + ' side">' + face(true) + face(false) + '</div></div>' +
      '<div class="card-nav"><button class="btn" type="button" data-act="prev"' + (p.i === 0 ? ' disabled' : '') + '>Previous</button><span class="card-nav__pos">Card ' + (p.i + 1) + ' of ' + p.deck.length + '</span>' +
      (p.flipped
        ? '<div class="rate" role="group" aria-label="How well did you know this?">' + [[1, 'Again'], [2, 'Hard'], [3, 'Good'], [4, 'Easy']].map(function (r) { return '<button class="btn rate__b rate__b--' + r[0] + '" type="button" data-rate="' + r[0] + '"><span>' + r[1] + '</span><small>' + preview(r[0]) + '</small></button>'; }).join('') + '</div>'
        : '<div class="card-nav__main"><button class="btn btn--solid" type="button" data-act="flip">Show answer</button></div>') +
      '<button class="btn" type="button" data-act="next">Skip</button></div>' +
      '<p class="kbd-help"><kbd>Space</kbd> flip · <kbd>1</kbd>–<kbd>4</kbd> rate · <kbd>←</kbd> <kbd>→</kbd> move</p>';
  }
  function paintPlayer() { var el = document.getElementById('player'); if (el) { el.innerHTML = playerHTML(); var fc = document.getElementById('fc'); if (fc && player.flipped === false && document.activeElement && document.activeElement.tagName !== 'INPUT') fc.focus({ preventScroll: true }); } }
  function playerAct(act) {
    var p = player; if (!p) return;
    if (act === 'flip') { p.flipped = !p.flipped; paintPlayer(); return; }
    if (act === 'next') { if (p.i < p.deck.length) { p.i++; p.flipped = false; paintPlayer(); } return; }
    if (act === 'prev') { if (p.i > 0) { p.i--; p.flipped = false; paintPlayer(); } return; }
    if (act === 'restart') { p.i = 0; p.flipped = false; p.known = 0; p.learn = 0; if (p.key === 'review') p.deck = buildDeck(null, 'review'); paintPlayer(); return; }
  }
  function playerRate(g) {
    var p = player; if (!p || !p.flipped || p.i >= p.deck.length) return;
    rateCard(p.deck[p.i].key, g);
    if (g >= 3) p.known++; else p.learn++;
    p.i++; p.flipped = false; paintPlayer();
  }
  function wirePlayer() {
    var el = document.getElementById('player'); if (!el || el.__wired) return; el.__wired = true;
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (b) { playerAct(b.getAttribute('data-act')); return; }
      var r = e.target.closest('[data-rate]'); if (r) { playerRate(+r.getAttribute('data-rate')); return; }
      if (e.target.closest('#fc')) playerAct('flip');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!player || !document.getElementById('player')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === ' ' || e.key === 'Enter') { if (e.target.closest && e.target.closest('button, a') && e.key === 'Enter') return; e.preventDefault(); playerAct('flip'); }
    else if (e.key === 'ArrowRight') { playerAct('next'); }
    else if (e.key === 'ArrowLeft') { playerAct('prev'); }
    else if (/^[1-4]$/.test(e.key)) { playerRate(+e.key); }
  });

  /* --- Review (all chapters, due + new) --- */
  TITLES.review = 'Review';
  VIEWS.review = function () {
    if (!player || player.key !== 'review') player = { key: 'review', deck: buildDeck(null, 'review'), i: 0, flipped: false, known: 0, learn: 0 };
    var all = allCards(), due = all.filter(function (x) { return isDue(x.key); }).length, fresh = all.filter(function (x) { return !SRS[x.key]; }).length, mastered = all.filter(function (x) { return cardStatus(x.key) === 'Mastered'; }).length;
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Review' }]) +
      '<header class="page__head"><h1>Review</h1><p>Spaced repetition across every chapter: cards due today plus up to ' + NEW_PER_DAY + ' new cards a day. Rate each card and it comes back when you are about to forget it.</p></header>' +
      '<div class="stats"><div class="card stat"><strong>' + due + '</strong><span>due today</span></div><div class="card stat"><strong>' + fresh + '</strong><span>new</span></div><div class="card stat"><strong>' + mastered + '</strong><span>mastered</span></div><div class="card stat"><strong>' + all.length + '</strong><span>cards total</span></div></div>' +
      '<div id="player">' + playerHTML() + '</div></div>';
  };
  AFTER.review = wirePlayer;

  /* --- Quiz --- */
  var quiz = null;   // { key, qs: [{ch,q,key}], i, picked, right, answers: [] }
  function startQuiz(key, qs) { quiz = { key: key, qs: qs, i: 0, picked: null, right: 0, answers: [] }; }
  function quizView(c) {
    var key = 'c' + c.id;
    if (!quiz || quiz.key !== key) startQuiz(key, shuffle(c.quiz.map(function (q) { return { ch: c, q: q, key: quizKey(c, q) }; })));
    var best = store.get('quizBest.' + c.id, null);
    return '<div class="quiz-mode">' + (best ? '<p class="muted">Best so far: ' + best.score + '/' + best.total + ' on ' + esc(fmtDate(best.date)) + '</p>' : '<p class="muted">' + plural(c.quiz.length, 'question', 'questions') + ' from this chapter, shuffled. Missed questions go to your Mistakes list.</p>') +
      '<div id="quiz">' + quizHTML() + '</div></div>';
  }
  function quizHTML() {
    var z = quiz;
    if (!z.qs.length) return '<div class="empty"><h2>No questions yet</h2></div>';
    if (z.i >= z.qs.length) {
      var pct = Math.round(100 * z.right / z.qs.length);
      return '<div class="result-card"><p class="eyebrow">Result</p><h2>' + z.right + ' of ' + z.qs.length + ' correct (' + pct + '%)</h2>' +
        '<ul class="review-list">' + z.answers.map(function (a, i) { return '<li class="' + (a.ok ? 'is-right' : 'is-wrong') + '"><span>' + (i + 1) + '.</span><span>' + esc(z.qs[i].q.q) + (a.ok ? '' : '<br><small>Correct: ' + esc(z.qs[i].q.choices[z.qs[i].q.answer]) + '</small>') + '</span></li>'; }).join('') + '</ul>' +
        '<p><button type="button" class="btn btn--solid" data-qact="restart">Try again</button> ' + (mistakeCount() ? '<a class="btn" href="#/mistakes">Review mistakes (' + mistakeCount() + ')</a>' : '') + '</p></div>';
    }
    var x = z.qs[z.i], q = x.q, picked = z.picked;
    return '<div class="q-card"><div class="q-card__top"><span class="eyebrow">Question ' + (z.i + 1) + ' of ' + z.qs.length + '</span><span class="muted">Ch ' + x.ch.id + '</span></div><p class="q-card__q">' + esc(q.q) + '</p>' +
      '<ul class="choices">' + q.choices.map(function (ch, i) {
        var cls = 'choice' + (picked !== null ? (i === q.answer ? ' is-correct' : i === picked ? ' is-wrong' : ' is-dim') : '');
        return '<li><button type="button" class="' + cls + '" data-pick="' + i + '"' + (picked !== null ? ' disabled' : '') + '><span class="choice__key">' + 'ABCDE'[i] + '</span><span>' + esc(ch) + '</span></button></li>';
      }).join('') + '</ul>' +
      (picked !== null ? '<div class="verdict ' + (picked === q.answer ? 'is-right' : 'is-wrong') + '">' + (picked === q.answer ? 'Correct.' : 'Not quite — the answer is ' + 'ABCDE'[q.answer] + '.') + '</div><p class="why">' + linkTerms(q.why || '') + '</p><p class="q-card__next"><button type="button" class="btn btn--solid" data-qact="next">' + (z.i + 1 < z.qs.length ? 'Next question' : 'See result') + '</button></p>' : '<p class="kbd-help"><kbd>A</kbd>–<kbd>D</kbd> choose · <kbd>Enter</kbd> next</p>') + '</div>';
  }
  function paintQuiz() { var el = document.getElementById('quiz'); if (el) { el.innerHTML = quizHTML(); var nb = el.querySelector('[data-qact="next"]'); if (nb) nb.focus({ preventScroll: true }); } }
  function quizPick(i) {
    var z = quiz; if (!z || z.picked !== null || z.i >= z.qs.length) return;
    var x = z.qs[z.i], ok = i === x.q.answer;
    z.picked = i; z.answers.push({ ok: ok, picked: i });
    if (ok) { z.right++; if (z.key === 'mistakes') clearMistake(x.key); } else addMistake(x.key);
    paintQuiz();
  }
  function quizNext() {
    var z = quiz; if (!z || z.picked === null) return;
    z.i++; z.picked = null;
    if (z.i >= z.qs.length) finishQuiz();
    paintQuiz();
  }
  function finishQuiz() {
    var z = quiz, m = /^c(\d+)$/.exec(z.key);
    var rec = { score: z.right, total: z.qs.length, date: new Date().toISOString().slice(0, 10) };
    if (m) { var best = store.get('quizBest.' + m[1], null); if (!best || rec.score / rec.total >= best.score / best.total) store.set('quizBest.' + m[1], rec); }
    if (z.key === 'exam') { var h = store.get('examHistory', []) || []; h.unshift(rec); store.set('examHistory', h.slice(0, 20)); }
  }
  function wireQuiz() {
    var el = document.getElementById('quiz'); if (!el || el.__wired) return; el.__wired = true;
    el.addEventListener('click', function (e) {
      var p = e.target.closest('[data-pick]'); if (p && !p.disabled) { quizPick(+p.getAttribute('data-pick')); return; }
      var a = e.target.closest('[data-qact]'); if (!a) return;
      var act = a.getAttribute('data-qact');
      if (act === 'next') quizNext();
      else if (act === 'restart') { var z = quiz; startQuiz(z.key, shuffle(z.qs)); paintQuiz(); }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!quiz || !document.getElementById('quiz')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    var k = e.key.toLowerCase();
    if (/^[a-e]$/.test(k) && quiz.picked === null) { var i = 'abcde'.indexOf(k); if (quiz.i < quiz.qs.length && i < quiz.qs[quiz.i].q.choices.length) quizPick(i); }
    else if (e.key === 'Enter' && quiz.picked !== null && !(e.target.closest && e.target.closest('a'))) { e.preventDefault(); quizNext(); }
  });

  /* --- Exam (mixed, all available chapters) --- */
  TITLES.exam = 'Exam';
  VIEWS.exam = function (arg) {
    var pool = [];
    CHAPTERS.forEach(function (c) { c.quiz.forEach(function (q) { pool.push({ ch: c, q: q, key: quizKey(c, q) }); }); });
    var hist = store.get('examHistory', []) || [];
    if (arg === 'go') {
      var n = +(store.get('examN', 20)) || 20;
      if (!quiz || quiz.key !== 'exam' || quiz.i >= quiz.qs.length) startQuiz('exam', shuffle(pool).slice(0, Math.min(n, pool.length)));
      return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Exam', href: '#/exam' }, { label: 'In progress' }]) + '<header class="page__head"><h1>Exam</h1></header><div id="quiz">' + quizHTML() + '</div></div>';
    }
    var cur = +(store.get('examN', 20)) || 20;
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Exam' }]) +
      '<header class="page__head"><h1>Exam</h1><p>A mixed quiz drawn from every chapter loaded so far (' + plural(pool.length, 'question', 'questions') + ' across ' + plural(CHAPTERS.length, 'chapter', 'chapters') + '). Missed questions go to Mistakes.</p></header>' +
      '<div class="card"><fieldset class="setting"><legend>How many questions</legend><div class="seg">' + [10, 20, 40].map(function (n) { return '<label><input type="radio" name="examN" value="' + n + '"' + (cur === n ? ' checked' : '') + '><span>' + n + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<p><a class="btn btn--solid" href="#/exam/go">Start exam</a></p></div>' +
      (hist.length ? '<h2>Recent exams</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th>Score</th></tr></thead><tbody>' + hist.map(function (h) { return '<tr><td>' + esc(fmtDate(h.date)) + '</td><td>' + h.score + ' / ' + h.total + ' (' + Math.round(100 * h.score / h.total) + '%)</td></tr>'; }).join('') + '</tbody></table></div>' : '') + '</div>';
  };
  AFTER.exam = function (arg) { if (arg === 'go') wireQuiz(); };
  main.addEventListener('change', function (e) { if (e.target && e.target.name === 'examN') store.set('examN', +e.target.value); });

  /* --- Mistakes --- */
  TITLES.mistakes = 'Mistakes';
  VIEWS.mistakes = function (arg) {
    var items = Object.keys(MISTAKES).map(findQuestion).filter(Boolean);
    if (arg === 'go' && items.length) {
      if (!quiz || quiz.key !== 'mistakes' || quiz.i >= quiz.qs.length) startQuiz('mistakes', shuffle(items));
      return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Mistakes', href: '#/mistakes' }, { label: 'Retry' }]) + '<header class="page__head"><h1>Retry mistakes</h1><p>Answer correctly to clear a question from the list.</p></header><div id="quiz">' + quizHTML() + '</div></div>';
    }
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Mistakes' }]) +
      '<header class="page__head"><h1>Mistakes</h1><p>Quiz and exam questions you have missed. Get one right in a retry and it drops off the list.</p></header>' +
      (items.length ? '<p><a class="btn btn--solid" href="#/mistakes/go">Retry all (' + items.length + ')</a> <button type="button" class="link-btn" data-clear-mistakes>Clear list</button></p>' +
        items.map(function (x) { return '<div class="card mistake"><p class="eyebrow">Ch ' + x.ch.id + ' · missed ' + plural(MISTAKES[x.key].n, 'time', 'times') + '</p><p><strong>' + esc(x.q.q) + '</strong></p><p class="muted">Answer: ' + esc(x.q.choices[x.q.answer]) + '</p></div>'; }).join('')
        : '<div class="empty"><h2>No mistakes logged</h2><p>Take a chapter quiz or an exam; anything you miss lands here.</p><p><a class="btn btn--solid" href="#/chapters">Chapters</a></p></div>') + '</div>';
  };
  AFTER.mistakes = function (arg) { if (arg === 'go') wireQuiz(); };
  main.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-clear-mistakes]')) { if (window.confirm('Clear the whole mistakes list?')) { MISTAKES = {}; saveMistakes(); route({ keepScroll: true }); } }
  });

  /* --- Glossary (all chapters) --- */
  TITLES.glossary = 'Glossary';
  var glossQ = '';
  VIEWS.glossary = function (term) {
    if (term) glossQ = '';   // a deep link (tap-to-define → Open the glossary) must show the term, not a stale filter
    var q = glossQ.toLowerCase(), items = q ? GLOSS.filter(function (g) { return (g.term + ' ' + g.alt.join(' ') + ' ' + g.def).toLowerCase().indexOf(q) >= 0; }) : GLOSS;
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Glossary' }]) +
      '<header class="page__head"><h1>Glossary</h1><p>' + plural(GLOSS.length, 'term', 'terms') + ' from the chapters loaded so far. Terms are also highlighted inside the study guides — tap one to see its definition in place.</p></header>' +
      '<p><label class="sr-only" for="gq">Filter terms</label><input id="gq" class="input" type="search" placeholder="Filter terms…" value="' + esc(glossQ) + '" autocomplete="off"></p>' +
      (items.length ? glossList(items, term || null) : '<div class="empty"><h2>No matching terms</h2></div>') + '</div>';
  };
  AFTER.glossary = function (term) {
    var inp = document.getElementById('gq'); if (!inp) return;
    inp.addEventListener('input', function () { glossQ = inp.value; var list = main.querySelector('.gloss__list, .empty'); var q = glossQ.toLowerCase(); var items = q ? GLOSS.filter(function (g) { return (g.term + ' ' + g.alt.join(' ') + ' ' + g.def).toLowerCase().indexOf(q) >= 0; }) : GLOSS; if (list) list.outerHTML = items.length ? glossList(items, null) : '<div class="empty"><h2>No matching terms</h2></div>'; });
    var open = document.getElementById('g-open'); if (open) setTimeout(function () { open.scrollIntoView({ block: 'center' }); }, 30);
  };

  /* --- Search index from content --- */
  function stripTags(s) { return String(s).replace(/<[^>]+>/g, ''); }
  CHAPTERS.forEach(function (c) {
    var kind = 'Chapter ' + c.id;
    c.sections.forEach(function (s) {
      var text = s.blocks.map(function (b) { return b.x ? stripTags(b.x) : b.items ? b.items.map(stripTags).join(' ') : b.rows ? b.rows.map(function (r) { return r.map(stripTags).join(' '); }).join(' ') : ''; }).join(' ');
      SEARCH_INDEX.push({ title: s.h, text: text, href: '#/c/' + c.id + '/guide', kind: kind });
    });
    c.highYield.forEach(function (h) { SEARCH_INDEX.push({ title: 'High-yield · Ch ' + c.id, text: stripTags(h), href: '#/c/' + c.id + '/hy', kind: 'High-yield' }); });
    c.cards.forEach(function (k) { SEARCH_INDEX.push({ title: stripTags(k.q), text: stripTags(k.a), href: '#/c/' + c.id + '/cards', kind: 'Flashcard' }); });
  });
  GLOSS.forEach(function (g) { SEARCH_INDEX.push({ title: g.term, text: g.def + (g.alt.length ? ' (' + g.alt.join(', ') + ')' : ''), href: '#/glossary/' + encodeURIComponent(g.term), kind: 'Glossary' }); });


  /* ===== Router ===== */
  function parts() {
    var h = location.hash.replace(/^#\/?/, '');
    return h.split('/').filter(Boolean).map(function (p) { try { return decodeURIComponent(p); } catch (e) { return p; } });
  }
  function titleFor(key) {
    if (has(TITLES, key)) return TITLES[key];
    if (has(SHELL_TITLES, key)) return t(SHELL_TITLES[key]);
    for (var i = 0; i < NAV.length; i++) if (NAV[i].href === '#/' + key) return navLabel(NAV[i]);
    return key;
  }
  function setView(key, html, title) {
    main.innerHTML = html;
    document.title = title ? title + ' — ' + APP_NAME : APP_NAME;
    buildNav();
    updateNavBadges();
  }
  function route(opts) {
    opts = opts || {};
    closeSuggest(); closeDrawer();
    var p = parts(), key = p.length ? p[0] : 'home', restoreY = null;
    if (!opts.keepScroll) {
      scrollMemo[scrollKey] = window.scrollY;                 // the page we are leaving
      scrollKey = location.hash || '#/';
      restoreY = fromHistory && scrollMemo.hasOwnProperty(scrollKey) ? scrollMemo[scrollKey] : null;
      fromHistory = false;
    }
    var html, title, args = p.slice(1);
    if (key !== 'missing' && Object.prototype.hasOwnProperty.call(VIEWS, key) && typeof VIEWS[key] === 'function') {
      html = VIEWS[key].apply(null, args); title = titleFor(key);
    } else {
      key = 'missing'; html = missingView(); title = t('notfound.title');
    }
    setView(key, html, title);
    if (AFTER[key]) AFTER[key].apply(null, args);
    if (opts.focus) main.focus({ preventScroll: true });
    if (opts.keepScroll) return;
    if (restoreY !== null) { window.requestAnimationFrame(function () { window.scrollTo(0, restoreY); }); return; }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () { syncHist(); route({ focus: true }); });
  main.addEventListener('change', function (e) {   // About > Settings
    var n = e.target && e.target.name, v = e.target && e.target.value;
    if (n === 'lang') { setLang(v); var again = main.querySelector('input[name="lang"]:checked'); if (again) again.focus(); }
    else if (n === 'theme') setTheme(v);
    else if (n === 'aboutTextSize') { store.set('textSize', v); applyTextSize(v); }
  });
  main.addEventListener('click', function (e) {
    var f = e.target.closest ? e.target.closest('.search-page .filter[data-kind]') : null;
    if (f) { searchKind = f.getAttribute('data-kind'); route({ keepScroll: true }); }
  });

  /* ===== Mobile tab bar: hides on scroll down, shows on scroll up ===== */
  (function initTabbar() {
    var lastY = window.scrollY, hold = 0, ticking = false;
    // Guard both: classList.add/remove rewrite the attribute even when nothing changes,
    // which would re-fire the MutationObserver below forever.
    function show() { if (document.body.classList.contains('tabbar-hidden')) document.body.classList.remove('tabbar-hidden'); }
    function hide() { if (!document.body.classList.contains('tabbar-hidden')) document.body.classList.add('tabbar-hidden'); }
    function update() {
      ticking = false;
      var y = window.scrollY, dy = y - lastY, max = document.documentElement.scrollHeight - window.innerHeight;
      var a = document.activeElement;
      var typing = !!(a && a.matches && a.matches('input, textarea, select'));
      if (Date.now() < hold || document.body.classList.contains('drawer-open') || typing || y < 80 || y > max - 80) { show(); lastY = y; }
      else if (dy > 10) { hide(); lastY = y; }
      else if (dy < -6) { show(); lastY = y; }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('hashchange', function () { hold = Date.now() + 700; show(); });
    document.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('input, textarea, select')) show(); });
    new MutationObserver(function () { if (document.body.classList.contains('drawer-open')) show(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  })();

  /* ===== Backup: export / import / undo (everything stored under PREFIX) ===== */
  var BK_APP = 'mitrainer', BK_UNDO = BK_APP + ':undo-import';
  function bkCollect() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) data[k.slice(PREFIX.length)] = localStorage.getItem(k);
      }
    } catch (e) {}
    return data;
  }
  function bkReplace(data) {
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PREFIX) === 0) keys.push(k); }
    keys.forEach(function (k) { localStorage.removeItem(k); });
    Object.keys(data).forEach(function (k) { localStorage.setItem(PREFIX + k, data[k]); });
  }
  function bkSummary(data) {
    var n = Object.keys(data || {}).filter(function (k) { return k !== 'lastBackup'; }).length;
    return n ? tf(n === 1 ? 'backup.item1' : 'backup.itemN', { n: n }) : t('backup.nothing');
  }
  function bkDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(locale(), { year: 'numeric', month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' });
  }
  function bkStatus(msg, isErr) {
    var el = document.getElementById('bk-status');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('is-error', !!isErr);
  }
  function bkPaint() {
    var meta = document.getElementById('bk-meta'), un = document.getElementById('bk-undo');
    var last = store.get('lastBackup', null);
    if (meta) meta.textContent = tf('backup.onDevice', { summary: bkSummary(bkCollect()) }) + ' ' + (last && bkDate(last) ? tf('backup.lastExported', { date: bkDate(last) }) : t('backup.notExported'));
    var has = false;
    try { has = !!localStorage.getItem(BK_UNDO); } catch (e) {}
    if (un) un.hidden = !has;
  }
  function bkExport() {
    var now = new Date();
    store.set('lastBackup', now.toISOString());
    var data = bkCollect();
    var payload = { app: BK_APP, format: 1, exported: now.toISOString(), attribution: ATTRIBUTION, summary: bkSummary(data), data: data };
    var name = BK_APP + '-backup-' + now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()) + '.json';
    var json = JSON.stringify(payload, null, 1);
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    var file = null;
    try { file = new File([json], name, { type: 'application/json' }); } catch (e) {}
    if (standalone && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      // Installed apps on phones cannot always download files; the share sheet can save to Files or send it on.
      navigator.share({ files: [file], title: tf('backup.shareTitle', { app: APP_NAME }) }).then(function () {
        bkStatus(t('backup.shared')); bkPaint();
      }).catch(function () { bkStatus(t('backup.exportCancelled')); });
      return;
    }
    var url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    var a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    bkStatus(tf('backup.saved', { name: name }));
    bkPaint();
  }
  function bkImport(file) {
    if (!file) return;
    var reader = new FileReader();
    var bad = tf('backup.notBackup', { app: APP_NAME });
    reader.onerror = function () { bkStatus(t('backup.unreadable'), true); };
    reader.onload = function () {
      var p;
      try { p = JSON.parse(reader.result); } catch (e) { bkStatus(bad, true); return; }
      var ok = p && p.app === BK_APP && p.data && typeof p.data === 'object' &&
        Object.keys(p.data).every(function (k) { return typeof p.data[k] === 'string' && k.length < 80; });
      if (ok) Object.keys(p.data).forEach(function (k) { try { JSON.parse(p.data[k]); } catch (e) { ok = false; } });
      if (!ok) { bkStatus(bad, true); return; }
      var msg = tf('backup.confirmImport', { date: bkDate(p.exported) || t('backup.unknownDate'), backup: bkSummary(p.data), device: bkSummary(bkCollect()) });
      if (!window.confirm(msg)) { bkStatus(t('backup.importCancelled')); return; }
      try {
        localStorage.setItem(BK_UNDO, JSON.stringify({ saved: new Date().toISOString(), data: bkCollect() }));
        bkReplace(p.data);
      } catch (e) { bkStatus(t('backup.importFailed'), true); return; }
      bkStatus(t('backup.imported'));
      setTimeout(function () { location.reload(); }, 700);
    };
    reader.readAsText(file);
  }
  function bkUndo() {
    var snap; try { snap = JSON.parse(localStorage.getItem(BK_UNDO)); } catch (e) {}
    if (!snap || !snap.data) { bkPaint(); return; }
    if (!window.confirm(tf('backup.confirmUndo', { summary: bkSummary(snap.data) }))) return;
    try { bkReplace(snap.data); localStorage.removeItem(BK_UNDO); } catch (e) { bkStatus(t('backup.undoFailed'), true); return; }
    bkStatus(t('backup.restored'));
    setTimeout(function () { location.reload(); }, 700);
  }
  (function initBackup() {
    var ex = document.getElementById('bk-export'), fi = document.getElementById('bk-file'), un = document.getElementById('bk-undo');
    if (!ex || !fi) return;
    ex.addEventListener('click', bkExport);
    fi.addEventListener('change', function () { bkImport(fi.files && fi.files[0]); fi.value = ''; });
    if (un) un.addEventListener('click', bkUndo);
    bkPaint();
  })();

  /* ===== Language switching: static markup (data-i18n / data-i18n-attr in index.html), then re-render ===== */
  function applyStatic() {
    document.documentElement.setAttribute('lang', lang);
    var els = document.querySelectorAll('[data-i18n]'), i, v;
    for (i = 0; i < els.length; i++) { v = t(els[i].getAttribute('data-i18n')); if (v !== els[i].getAttribute('data-i18n')) els[i].textContent = v; }
    els = document.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < els.length; i++) {
      var pairs = els[i].getAttribute('data-i18n-attr').split(';');
      for (var j = 0; j < pairs.length; j++) {
        var at = pairs[j].indexOf(':'), key = pairs[j].slice(at + 1);
        if (at > 0 && t(key) !== key) els[i].setAttribute(pairs[j].slice(0, at), t(key));
      }
    }
    var brand = document.querySelector('.brand');
    if (brand) brand.setAttribute('aria-label', tf('brand.home', { name: APP_NAME }));
    var panel = document.getElementById('textSizePanel');
    if (panel) panel.setAttribute('aria-label', t('textsize.title'));
    labelCollapse();
    applyTheme(getTheme());
  }
  function setLang(l) {
    lang = l === 'tl' ? 'tl' : 'en';
    store.set('lang', lang);
    applyStatic();
    bkPaint();
    var panel = document.getElementById('textSizePanel');
    if (panel && !panel.hidden) { panel.hidden = true; var tb = document.getElementById('textSizeBtn'); if (tb) tb.setAttribute('aria-expanded', 'false'); }
    route({ keepScroll: true });   // re-render the current view and the menu in the new language
  }

  /* ===== Start ===== */
  applyStatic();
  route();

  /* ===== Service worker (https or localhost only) ===== */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    // updateViaCache:'none' = always fetch a fresh sw.js, so a bumped VERSION is seen on the next visit
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) { if (reg && reg.update) reg.update(); }).catch(function () {}); });
  }
})();
