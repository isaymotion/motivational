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
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    pocket: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h6M7 14h10"/>',
    chart: '<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    today: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4M9 15l2 2 4-4"/>',
    cycle: '<path d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6"/><path d="M18 2.5v4.3h-4.3M6 21.5v-4.3h4.3"/>',
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
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || 'nav-ico') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.star) + '</svg>';
  }

  /* ===== NAV: one entry per screen. Builds the sidenav (grouped by `group`) and the home tiles.
     {label, href, icon, group}  Optional: tile:false (keep off the home grid), badge:'news' (unseen What's new count),
     tkey:'nav.x' (label comes from data/strings.js). The "Other apps" group is added after these from window.APP_LINKS. ===== */
  var NAV = [
    { label: 'Home', tkey: 'nav.home', href: '#/', icon: 'home', group: 'Start', tile: false },
    { label: 'Today', href: '#/today', icon: 'today', group: 'Study' },
    { label: 'Chapters', href: '#/chapters', icon: 'book', group: 'Study', match: ['#/c/'] },
    { label: 'Review', href: '#/review', icon: 'cards', group: 'Study', badge: 'due' },
    { label: 'Exam', href: '#/exam', icon: 'check', group: 'Study' },
    { label: 'Mistakes', href: '#/mistakes', icon: 'flag', group: 'Study', badge: 'mistakes' },
    { label: 'Progress', href: '#/progress', icon: 'chart', group: 'Study' },
    { label: 'Skill drills', href: '#/drills', icon: 'target', group: 'Practice' },
    { label: 'Write a response', href: '#/write', icon: 'pencil', group: 'Practice' },
    { label: 'Pocket cards', href: '#/pocket', icon: 'pocket', group: 'Reference' },
    { label: 'Stages', href: '#/stages', icon: 'cycle', group: 'Reference' },
    { label: 'Glossary', href: '#/glossary', icon: 'list', group: 'Reference' },
    { label: 'Tools', href: '#/tools', icon: 'clipboard', group: 'Appendices' },
    { label: 'Resources', href: '#/resources', icon: 'link', group: 'Appendices' },
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
  /* A nav item is active on its own route and on any subroute under it (e.g. Tools on #/tools/audit/practice);
     n.match adds extra route prefixes (Chapters is also active inside a chapter, #/c/...). */
  function navMatches(n, cur) {
    if (n.href === cur) return true;
    if (n.href === '#/') return false;
    var pre = [n.href + '/'].concat(n.match || []);
    for (var i = 0; i < pre.length; i++) if (cur.indexOf(pre[i]) === 0) return true;
    return false;
  }
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
        var active = navMatches(n, cur);
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
      var tk = tabs[i].getAttribute('data-tab'), on = tk === key || (tk === 'chapters' && key === 'c');
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
        '<p class="hero__lead">Learn Motivational Interviewing chapter by chapter — the spirit, OARS, the four processes and the stages of change — with flashcards, quizzes, a glossary and the Appendix B screening tools, all built from SAMHSA TIP 35.</p>' +
        '<p><a class="btn btn--solid" href="#/today">' + (todayState().done ? 'Today’s session: done' : 'Start today’s session') + '</a></p>' +
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
    return todayStrip() + '<div class="stats home__stats"><a class="card stat" href="#/review"><strong>' + d + '</strong><span>cards due today</span></a>' +
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
        segGroup('practiceSave', 'Tools: my own practice attempts', [['off', 'Don’t save'], ['on', 'Save on this device']], practiceOn() ? 'on' : 'off') +
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
  CHAPTERS.forEach(function (c) { (c.glossary || []).forEach(function (g) { GLOSS.push({ term: g.term, def: g.def, alt: g.alt || [], ch: c.id, nolink: !!g.nolink }); }); });
  GLOSS.sort(function (a, b) { return a.term.localeCompare(b.term); });
  var TERM_RE = (function () {
    var names = [];
    GLOSS.forEach(function (g) { if (g.nolink) return; names.push(g.term); g.alt.forEach(function (a) { names.push(a); }); });   // nolink: everyday words (e.g. “action”) stay plain text
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
    el.innerHTML = '<div class="sheet__back"></div><div class="sheet__panel"><div class="sheet__head"><h2 id="term-title"></h2><button type="button" class="icon-btn sheet__close" aria-label="Close">✕</button></div><p class="sheet__body" id="term-def"></p><p class="sheet__foot"><a id="term-link" href="#/glossary">Open the glossary</a> <a id="term-tool" href="#/tools" hidden></a></p></div>';
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
    var tl = toolForTerm(g.term), ta = el.querySelector('#term-tool');
    ta.hidden = !tl;
    if (tl) { ta.setAttribute('href', '#/tools/' + tl.id); ta.textContent = 'Open the ' + tl.short + ' tool'; }
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
  function isShaky(key) { var s = SRS[key]; return !!s && s.i < 21 && ((s.l || 0) > 0 || s.e < 2.5); }   // rated Again or Hard at some point and not yet mastered
  var NEW_PER_DAY = 20;
  function newSeenToday() { var n = store.get('newToday', null); return n && n.day === today() ? n.n : 0; }
  function bumpNewSeen() { store.set('newToday', { day: today(), n: newSeenToday() + 1 }); }
  function rateCard(key, g) {
    var wasNew = !SRS[key];
    SRS[key] = srsNext(SRS[key], g);
    saveSRS();
    logAct('c');
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
        case 'table':   // 3+ columns stack into labelled cards on phones (.rtable) so no column hides off-screen
          var stack = b.head.length >= 3;
          return '<div class="table-wrap' + (stack ? ' table-wrap--stack' : '') + '"><table' + (stack ? ' class="rtable"' : '') + '><thead><tr>' + b.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + b.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return (i === 0 ? '<th scope="row">' : '<td data-label="' + esc(b.head[i] || '') + '">') + linkTerms(c) + (i === 0 ? '</th>' : '</td>'); }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
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
      chapterToolsNote(c) +
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
      return '<details class="gloss__item"' + (open ? ' open id="g-open"' : '') + '><summary>' + esc(g.term) + (g.alt && g.alt.length ? ' <span class="muted">(' + esc(g.alt.join(', ')) + ')</span>' : '') + (g.ch ? '<span class="gloss__ch">Ch ' + g.ch + '</span>' : '') + '</summary><p>' + esc(g.def) + '</p>' + toolLinkFor(g.term) + '</details>';
    }).join('') + '</div>';
  }

  /* --- Flashcard player --- */
  var player = null;   // { key: route key, deck: [{ch, card, key}], i, flipped, known, learn }
  function buildDeck(c, filter) {
    var all = c ? c.cards.map(function (k) { return { ch: c, card: k, key: cardKey(c, k) }; }) : allCards();
    if (filter === 'due') all = all.filter(function (x) { return isDue(x.key); });
    else if (filter === 'new') all = all.filter(function (x) { return !SRS[x.key]; });
    else if (filter === 'shaky') all = all.filter(function (x) { return isShaky(x.key); });
    else if (filter === 'review') {
      var due = all.filter(function (x) { return isDue(x.key); });
      var fresh = all.filter(function (x) { return !SRS[x.key]; }).slice(0, Math.max(0, NEW_PER_DAY - newSeenToday()));
      all = shuffle(due).concat(fresh);
    }
    return all;
  }
  function cardsView(c, filter) {
    filter = filter === 'due' || filter === 'new' || filter === 'shaky' ? filter : 'all';
    var pkey = 'c' + c.id + ':' + filter;
    if (!player || player.key !== pkey) player = { key: pkey, deck: buildDeck(c, filter), i: 0, flipped: false, known: 0, learn: 0 };
    var pr = chapterProgress(c);
    return '<div class="cards-mode"><div class="filters" role="group" aria-label="Which cards">' + [['all', 'All cards'], ['due', 'Due today'], ['new', 'New'], ['shaky', 'Shaky']].map(function (f) {
      var n = buildDeck(c, f[0]).length;
      return '<a class="filter" href="#/c/' + c.id + '/cards/' + f[0] + '" aria-pressed="' + (filter === f[0]) + '">' + f[1] + ' <span class="filter__n">' + n + '</span></a>';
    }).join('') + '</div>' +
      '<div class="tally"><span>' + pr.mastered + ' mastered</span><span class="tally__bar"><span class="tally__known" style="width:' + pr.pct + '%"></span><span class="tally__learn" style="width:' + (pr.total ? Math.round(100 * pr.learning / pr.total) : 0) + '%"></span></span><span>' + pr.learning + ' learning</span></div>' +
      '<div id="player">' + playerHTML() + '</div></div>';
  }
  function playerHTML() {
    var p = player;
    if (!p.deck.length) return '<div class="empty"><h2>Nothing here right now</h2><p>No cards match this filter. Try “All cards”, or come back when cards are due.</p></div>';
    if (p.i >= p.deck.length) return '<div class="result-card"><p class="eyebrow">Session complete</p><h2>' + plural(p.deck.length, 'card', 'cards') + ' reviewed</h2><p>' + p.known + ' rated Good or Easy · ' + p.learn + ' rated Again or Hard. Ratings set when each card comes back.</p><p><button type="button" class="btn btn--solid" data-act="restart">Go again</button> ' + (p.key === 'today' ? '<a class="btn" href="#/today">Today’s session</a>' : '<a class="btn" href="#/chapters">Chapters</a>') + '</p></div>';
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
    if (act === 'restart') { p.i = 0; p.flipped = false; p.known = 0; p.learn = 0; if (p.key === 'review') p.deck = buildDeck(null, 'review'); if (p.key === 'today') p.deck = todayDeck(); paintPlayer(); return; }
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
  function shuffleChoices(x) {   // fresh choice order every attempt so answer position never gives it away
    var order = shuffle(x.q.choices.map(function (_, i) { return i; }));
    var q = {}; for (var k in x.q) q[k] = x.q[k];
    q.choices = order.map(function (i) { return x.q.choices[i]; });
    q.answer = order.indexOf(x.q.answer);
    return { ch: x.ch, q: q, key: x.key };
  }
  function startQuiz(key, qs) { quiz = { key: key, qs: qs.map(shuffleChoices), i: 0, picked: null, right: 0, answers: [] }; }
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
        '<p><button type="button" class="btn btn--solid" data-qact="restart">Try again</button> ' + (z.key === 'today' ? '<a class="btn" href="#/today">Today’s session</a> ' : '') + (mistakeCount() ? '<a class="btn" href="#/mistakes">Review mistakes (' + mistakeCount() + ')</a>' : '') + '</p></div>';
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
    if (ok) { z.right++; if (z.key === 'mistakes' || z.key === 'today') clearMistake(x.key); } else addMistake(x.key);
    logQuiz(x.key, ok);
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
    var rec = { score: z.right, total: z.qs.length, date: isoToday() };
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

  /* --- Appendix B tools and Appendix C resources (data/tools.js) --- */
  var TOOLS = (window.MI_TOOLS || []).slice().sort(function (a, b) { return a.n - b.n; });
  var RESOURCES = window.MI_RESOURCES || [];
  var TOOL_BY_ID = {};
  TOOLS.forEach(function (x) { TOOL_BY_ID[x.id] = x; });
  function toolForTerm(term) {
    var low = String(term).toLowerCase();
    for (var i = 0; i < TOOLS.length; i++) {
      var g = TOOLS[i].gloss || [];
      for (var j = 0; j < g.length; j++) if (g[j].toLowerCase() === low) return TOOLS[i];
    }
    return null;
  }
  function toolLinkFor(term) {
    var x = toolForTerm(term);
    return x ? '<p class="gloss__tool"><a href="#/tools/' + esc(x.id) + '">Open the ' + esc(x.short) + ' tool page →</a></p>' : '';
  }
  function chapterToolsNote(c) {
    var list = TOOLS.filter(function (x) { return x.chapter === c.id; });
    if (!list.length) return '';
    return '<div class="callout callout--note"><p class="callout__title">Instruments from this chapter (Appendix B)</p><ul>' + list.map(function (x) {
      return '<li><a href="#/tools/' + esc(x.id) + '">' + esc(x.short) + '</a> — ' + esc(x.name) + '</li>';
    }).join('') + '</ul></div>';
  }
  function extLink(url, label) { return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label || url) + '<span class="sr-only"> (opens in a new tab)</span></a>'; }
  function toolBadge(x) { return x.status === 'pd' ? '<span class="tbadge tbadge--pd">Public domain</span>' : '<span class="tbadge tbadge--rx">Reference card</span>'; }
  var STUDY_ONLY = '<div class="callout callout--caution"><p class="callout__title">Study aid, not a clinical record</p><p>These pages are for learning the instruments. To assess a client, use the official form and its manual.</p></div>';

  TITLES.tools = 'Tools';
  VIEWS.tools = function (id, mode) {
    if (id && mode) {
      var tx = TOOL_BY_ID[id];
      if (tx && mode === 'practice' && SCORERS[id]) return practiceView(tx);
      if (tx && mode === 'test' && id === 'mikt') return miktView(tx);
      return missingView();
    }
    if (id) return toolView(id);
    TITLES.tools = 'Tools';
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Tools' }]) +
      '<header class="page__head"><p class="eyebrow">Appendix B</p><h1>Screening and assessment tools</h1><p>TIP 35 reprints ' + TOOLS.length + ' instruments in Appendix B. Public-domain tools show every item and the scoring as printed, with <strong>practice scoring</strong> (and a self-test for the MI Knowledge Test). Tools reprinted with permission get a reference card — what the tool measures, how it is scored, its source and where to find the official copy — without the item text.</p></header>' +
      STUDY_ONLY +
      '<div class="tool__rows">' + TOOLS.map(function (x) {
        return '<a class="row" href="#/tools/' + esc(x.id) + '"><span class="row__num">' + x.n + '</span><span><h3>' + esc(x.short) + '</h3><p>' + esc(x.name) + '</p><span class="row__meta">' + toolBadge(x) + '<span class="muted">' + esc(x.count) + (x.chapter ? ' · Chapter ' + x.chapter : '') + '</span>' + (SCORERS[x.id] ? '<span class="tbadge tbadge--try">Practice scoring</span>' : x.id === 'mikt' ? '<span class="tbadge tbadge--try">Self-test</span>' : '') + '</span></span></a>';
      }).join('') + '</div>' +
      '<div class="next"><a class="btn" href="#/resources">Appendix C: Resources →</a></div></div>';
  };
  function scaleChips(scale) {
    return '<p class="tool__scale">' + scale.map(function (o) { return '<span class="chip"><b>' + esc(String(o[1])) + '</b> ' + esc(o[0]) + '</span>'; }).join('') + '</p>';
  }
  function toolItems(x) {
    var out = '<section class="guide__sec" id="t-items"><h2>Items</h2>';
    (x.instructions || []).forEach(function (ins) {
      out += '<div class="callout callout--key"><p class="callout__title">' + esc(ins.title || 'Instructions (as printed)') + '</p><p>' + esc(ins.x) + '</p></div>';
    });
    if (x.scale) out += '<p class="muted">' + esc(x.scaleLabel || 'Response scale for every item:') + '</p>' + scaleChips(x.scale);
    (x.contexts || []).forEach(function (cx) {
      out += '<div class="callout callout--note"><p class="callout__title">' + esc(cx.title) + '</p>' + cx.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>';
    });
    out += '<details class="tool__items"' + (x.items.length <= 12 ? ' open' : '') + '><summary>Show all ' + x.items.length + ' items</summary><ol class="tool__list">' + x.items.map(function (it) {
      var h = '<li value="' + it.n + '"><p class="tool__q">' + esc(it.q) + '</p>' + (it.pre ? '<div class="mk__pre">' + it.pre.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>' : '');
      if (it.opts) h += '<ul class="tool__opts">' + it.opts.map(function (o) { return '<li><span class="tool__score">' + esc(String(o[1])) + '</span>' + esc(o[0]) + '</li>'; }).join('') + '</ul>';
      if (it.choices) h += '<ol class="tool__choices" type="a">' + it.choices.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol>';
      if (it.note) h += '<p class="tool__note">' + esc(it.note) + '</p>';
      return h + '</li>';
    }).join('') + '</ol></details>';
    if (x.key) out += '<details class="tool__items"><summary>Show the answer key</summary><p class="tool__key">' + x.items.map(function (it) { return '<span class="chip"><b>' + it.n + '</b> ' + esc(it.answer) + '</span>'; }).join('') + '</p>' + (x.keyNote ? '<p class="tool__note">' + esc(x.keyNote) + '</p>' : '') + '</details>';
    return out + '</section>';
  }
  function toolView(id) {
    var x = TOOL_BY_ID[id];
    if (!x) return missingView();
    TITLES.tools = x.short;
    var ch = x.chapter ? chapter(x.chapter) : null, i = TOOLS.indexOf(x), prev = TOOLS[i - 1], next = TOOLS[i + 1];
    var h = '<div class="wrap page tool">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Tools', href: '#/tools' }, { label: x.short }]) +
      '<header class="page__head"><p class="eyebrow">Appendix B · Tool ' + x.n + ' · pp. ' + esc(x.pages) + '</p><h1>' + esc(x.name) + '</h1><p class="row__meta">' + toolBadge(x) + '<span class="muted">' + esc(x.count) + '</span></p></header>';
    h += '<section class="guide__sec"><h2>About</h2>' + renderBlocks(x.about) +
      (ch ? '<p><a class="btn" href="#/c/' + ch.id + '">Covered in Chapter ' + ch.id + ': ' + esc(ch.title) + ' →</a></p>' : '') + '</section>';
    if (SCORERS[x.id]) h += '<div class="callout callout--key tool__try"><p class="callout__title">Practice scoring</p><p>Answer the items yourself to practice scoring: totals, the book’s interpretation and tips for giving the feedback. Nothing is stored unless you choose to save your own attempts.</p><p><a class="btn btn--solid" href="#/tools/' + esc(x.id) + '/practice">Practice scoring →</a></p></div>';
    if (x.id === 'mikt') h += '<div class="callout callout--key tool__try"><p class="callout__title">Self-test</p><p>Take the ' + x.items.length + ' questions and check your answers against the key, with the updated MI terms from Chapter 3.</p><p><a class="btn btn--solid" href="#/tools/mikt/test">Take the self-test →</a></p></div>';
    if (x.status === 'pd') h += toolItems(x);
    else h += '<div class="callout callout--note"><p class="callout__title">Items not shown</p><p>' + esc(x.restrictedNote) + '</p>' +
      (x.url ? '<p>' + extLink(x.url, x.urlLabel || 'Free official copy (online)') + '</p>' + (x.urlNote ? '<p class="tool__note">' + esc(x.urlNote) + '</p>' : '') : '<p>TIP 35 does not list a free online copy of this questionnaire. The full reference to the original article is under Source below.</p>' + (x.refUrl ? '<p>' + extLink(x.refUrl, x.refLabel || 'Original article (online)') + '</p>' : '')) + '</div>';
    if (x.scoring) h += '<section class="guide__sec"><h2>Scoring</h2>' + renderBlocks(x.scoring) + '</section>';
    if (x.interpret) h += '<section class="guide__sec"><h2>Interpreting the score</h2>' + renderBlocks(x.interpret) + '</section>';
    var moved = x.url && /https?:\/\//.test(x.source) && x.source.indexOf(x.url) < 0;
    h += '<section class="guide__sec"><h2>Source</h2><p class="tool__source">' + esc(x.source) + '</p>' +
      (moved ? '<p class="tool__note">The web address above is as printed in 2019 and has since moved; the link below goes to its current location.</p>' : '') +
      (x.ref ? '<p class="tool__ref"><span class="tool__reflab">Full reference (TIP 35, Appendix A)</span>' + esc(x.ref) + '</p>' : '') +
      (x.url && x.status === 'pd' ? '<p>' + extLink(x.url, x.urlLabel || 'Free official copy (online)') + '</p>' : '') +
      (x.refUrl ? '<p>' + extLink(x.refUrl, x.refLabel || 'Original article (online)') + '</p>' : '') + '</section>';
    h += STUDY_ONLY + '<div class="next">' + (prev ? '<a class="btn" href="#/tools/' + esc(prev.id) + '">← ' + esc(prev.short) + '</a> ' : '') +
      '<a class="btn" href="#/tools">All tools</a>' + (next ? ' <a class="btn btn--solid" href="#/tools/' + esc(next.id) + '">' + esc(next.short) + ' →</a>' : '') + '</div>';
    return h + '</div>';
  }

  /* ===== PRACTICE SCORING (v1.9.0): public-domain tool pages + the MI Knowledge Test self-test =====
     Keys come from data/tools.js (scoring tables are parsed, not retyped); notes from data/practice.js.
     Privacy: answers live only in PR (memory) and are dropped when the route leaves a practice page.
     Nothing is stored unless the "Save my own practice attempts on this device" setting is on
     (store key practiceSave); saved attempts go under mt:v1:practice.<toolId> = [{date, answers, scores, summary}],
     newest first, so the backup panel (everything under PREFIX) exports and imports them. */
  var PRACTICE = window.MI_PRACTICE || {};
  var PR_FEEDBACK = PRACTICE.feedback || {}, MIKT_TERMS = PRACTICE.miktTerms || {}, MIKT_SKIP = PRACTICE.miktNotScored || {};
  var PR = null;          // { id, ans: { itemNumber: score | letter }, sex: 'w' | 'm', checked: bool, msg: '' }
  var PR_MAX = 50;        // saved attempts kept per tool
  var PR_ROUTE = /^#\/tools\/[^\/]+\/(practice|test)\/?$/;
  function practiceOn() { return store.get('practiceSave', false) === true; }
  function prKey(id) { return 'practice.' + id; }
  function prHistory(id) { var h = store.get(prKey(id), []); return Array.isArray(h) ? h : []; }
  function numList(s) { return String(s).split(/[^0-9]+/).filter(Boolean).map(Number); }
  function scoringTables(x) { return (x.scoring || []).filter(function (b) { return b.t === 'table'; }); }
  function scaleRows(x) { return scoringTables(x)[0].rows.map(function (r) { return { name: stripTags(r[0]), items: numList(r[1]) }; }); }
  function sumOf(a, items) { return items.reduce(function (s, n) { return s + (+a[n] || 0); }, 0); }
  function fix2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
  function shortSituation(q) {   // "UNPLEASANT EMOTIONS (e.g., ...)" -> "Unpleasant emotions"
    var s = String(q).split(' (')[0].replace(/\.$/, '');
    return s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s;
  }
  function inRange(spec, v) {   // "32–33" | "35" | "—"
    var m = numList(spec);
    if (!m.length) return false;
    return v >= m[0] && v <= (m.length > 1 ? m[1] : m[0]);
  }
  function prTable(head, rows) {
    return '<div class="table-wrap"><table class="pr__table"><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function prLead(big, small) { return '<p class="pr__lead"><span class="pr__big">' + big + '</span>' + (small ? ' <span class="pr__small">' + small + '</span>' : '') + '</p>'; }

  /* Each scorer: (tool, answers, opts) -> { need: [item numbers that must be answered], scores, summary, html } */
  var SCORERS = {
    audit: function (x, a, o) {
      var never = a[1] === 0, men = o.sex === 'm';
      var need = x.items.filter(function (it) { return !(never && it.n >= 2 && it.n <= 8); }).map(function (it) { return it.n; });
      var total = sumOf(a, need);
      var zi = total >= 25 ? 3 : total >= 16 ? 2 : total >= (men ? 8 : 7) ? 1 : 0;
      var z = scoringTables(x)[0].rows[zi];
      var html = prLead(total + ' <span class="pr__of">/ 46</span>', 'U.S. AUDIT total') +
        prTable(['Result', ''], [['Risk level', esc(z[0]) + ' <span class="muted">(' + (men ? 'men' : 'women') + '’s cut-offs: ' + esc(z[2]) + ')</span>'], ['Intervention', esc(z[1])], ['Possible AUD (DSM-5, ICD-10)', esc(z[3])]]) +
        (never ? '<p class="muted">Question 1 was “Never,” so questions 2 to 8 were skipped and count as 0, as the form directs.</p>' : '');
      return { need: need, scores: { total: total, zone: z[0], cutoffs: men ? 'men' : 'women' }, summary: 'Total ' + total + ' · ' + z[0] + ' (' + (men ? 'men' : 'women') + '’s cut-offs)', html: html };
    },
    drinc: function (x, a) {
      var rows = scaleRows(x), sc = {}, total = 0, out = [];
      rows.forEach(function (r) {
        var v = sumOf(a, r.items), ctl = /^Control/.test(r.name);
        sc[r.name] = v; if (!ctl) total += v;
        out.push([esc(r.name) + (ctl ? ' <span class="muted">(not in total)</span>' : ''), v + ' <span class="muted">/ ' + r.items.length + '</span>']);
      });
      var ctlV = sc['Control Scale'];
      sc.total = total;
      var html = prLead(total + ' <span class="pr__of">/ 45</span>', 'Total DrInC Score (lifetime alcohol problems)') + prTable(['Scale', 'Score'], out) +
        (ctlV === 0 ? '<div class="callout callout--caution"><p class="callout__title">Control Scale = 0</p><p>Zero scores on the Control Scale items may indicate careless or dishonest responses. Read the other scales with that in mind.</p></div>' :
          '<p class="muted">Control Scale: ' + ctlV + ' / 5. It is scored separately; zero scores would suggest careless or dishonest responding.</p>');
      return { need: x.items.map(function (it) { return it.n; }), scores: sc, summary: 'Total ' + total + ' · Control ' + ctlV, html: html };
    },
    socrates: function (x, a) {
      var rows = scaleRows(x), prof = scoringTables(x)[1], hi = scoringTables(x).length ? (x.interpret || []).filter(function (b) { return b.t === 'table'; })[0] : null;
      var sc = {}, out = [], sum = [];
      rows.forEach(function (r, i) {
        var v = sumOf(a, r.items), dec = null;
        prof.rows.forEach(function (pr) { if (dec == null && inRange(pr[i + 1], v)) dec = pr[0]; });
        var num = dec ? parseInt(dec, 10) : null, band = num == null ? '' : num >= 70 ? 'High scorers' : num <= 30 ? 'Low scorers' : '';
        var desc = band && hi ? hi.rows[i][band === 'High scorers' ? 1 : 2] : '';
        var abbr = (/\((\w+)\)/.exec(r.name) || [])[1] || r.name;
        sc[abbr] = { raw: v, decile: dec };
        sum.push(abbr + ' ' + v + (dec ? ' (' + num + ')' : ''));
        out.push([esc(r.name), '<strong>' + v + '</strong>', dec ? esc(dec) : '<span class="muted">not on the profile</span>', desc ? '<span class="pr__desc"><strong>' + band + ':</strong> ' + esc(desc) + '</span>' : '<span class="muted">Medium range — read the item responses.</span>']);
      });
      var html = '<p class="pr__small">Raw scores and deciles from the SOCRATES Profile Sheet</p>' +
        '<div class="table-wrap table-wrap--stack"><table class="rtable pr__table"><thead><tr><th>Scale</th><th>Raw</th><th>Decile</th><th>Reading (as printed)</th></tr></thead><tbody>' +
        out.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td data-label="Raw">' + r[1] + '</td><td data-label="Decile">' + r[2] + '</td><td data-label="Reading">' + r[3] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<p class="muted">Deciles rank the score against 1,726 adults presenting for alcohol treatment (Project MATCH). Read a low Ambivalence score against the Recognition score.</p>';
      return { need: x.items.map(function (it) { return it.n; }), scores: sc, summary: sum.join(' · '), html: html };
    },
    urica: function (x, a) {
      var rows = scaleRows(x), sc = {}, best = -1;
      rows.forEach(function (r) { sc[r.name] = sumOf(a, r.items); best = Math.max(best, sc[r.name]); });
      var top = rows.filter(function (r) { return sc[r.name] === best; }).map(function (r) { return r.name; });
      var html = prTable(['Subscale', 'Sum (8–40)'], rows.map(function (r) { return [esc(r.name), (sc[r.name] === best ? '<strong>' + sc[r.name] + '</strong> <span class="tbadge tbadge--pd">highest</span>' : String(sc[r.name]))]; })) +
        '<p>High scores on a stage subscale indicate the respondent is likely in that stage. The stages are not discrete: a respondent can score high on more than one.</p>';
      return { need: x.items.map(function (it) { return it.n; }), scores: sc, summary: rows.map(function (r) { return r.name + ' ' + sc[r.name]; }).join(' · ') + ' · highest: ' + top.join(', '), html: html };
    },
    db: function (x, a) {
      var rows = scaleRows(x), pros = rows[0], cons = rows[1];
      var p = sumOf(a, pros.items) / pros.items.length, c = sumOf(a, cons.items) / cons.items.length, d = p - c;
      var dTxt = (d > 0 ? '+' : '') + fix2(d);
      var meaning = d > 0 ? 'Positive: endorses more Pros than Cons of ' + (x.id === 'alcdb' ? 'drinking alcohol.' : 'using drugs.') : d < 0 ? 'Negative: endorses more Cons than Pros of ' + (x.id === 'alcdb' ? 'drinking alcohol.' : 'using drugs.') : 'Zero: Pros and Cons are rated equally.';
      var highCons = cons.items.filter(function (n) { return a[n] >= 4; });
      var html = prLead(dTxt, 'Difference score (Pros − Cons)') + prTable(['Scale', 'Average (1–5)'], [[esc(pros.name), fix2(p)], [esc(cons.name), fix2(c)]]) + '<p>' + esc(meaning) + '</p>' +
        (highCons.length ? '<p><strong>Cons rated 4 or 5</strong> (worth exploring to build discrepancy):</p><ul>' + highCons.map(function (n) { return '<li>' + n + '. ' + esc(x.items[n - 1].q) + '</li>'; }).join('') + '</ul>' : '');
      return { need: x.items.map(function (it) { return it.n; }), scores: { pros: +fix2(p), cons: +fix2(c), difference: +fix2(d) }, summary: 'Pros ' + fix2(p) + ' · Cons ' + fix2(c) + ' · Difference ' + dTxt, html: html };
    },
    bscq: function (x, a) {
      var list = x.items.map(function (it) { return { n: it.n, name: shortSituation(it.q), v: +a[it.n] }; });
      var sorted = list.slice().sort(function (p, q) { return p.v - q.v || p.n - q.n; }), cut = sorted[Math.min(2, sorted.length - 1)].v;
      var low = sorted.filter(function (s) { return s.v <= cut; });
      var html = '<p><strong>Lowest confidence</strong> — the 1 to 3 situations to discuss further' + (low.length > 3 ? ' (tied ratings are all shown)' : '') + ':</p><ol class="pr__low">' +
        low.map(function (s) { return '<li><strong>' + esc(s.name) + '</strong> — ' + s.v + '%</li>'; }).join('') + '</ol>' +
        '<div class="pr__bars">' + list.map(function (s) { return '<div class="pr__bar' + (s.v <= cut ? ' is-low' : '') + '"><span class="pr__barlab">' + esc(s.name) + '</span><span class="pr__bartrack"><span style="width:' + s.v + '%"></span></span><span class="pr__barv">' + s.v + '%</span></div>'; }).join('') + '</div>' +
        '<p class="muted">Each situation has its own score; the BSCQ has no total.</p>';
      var sc = {}; list.forEach(function (s) { sc[s.name] = s.v; });
      return { need: x.items.map(function (it) { return it.n; }), scores: { ratings: sc, lowest: low.map(function (s) { return s.name; }) }, summary: 'Lowest: ' + low.map(function (s) { return s.name + ' ' + s.v + '%'; }).join(', '), html: html };
    },
    aases: function (x, a) {
      var n = x.items.length, mean = sumOf(a, x.items.map(function (it) { return it.n; })) / n;
      var min = Math.min.apply(null, x.items.map(function (it) { return +a[it.n]; }));
      var low = x.items.filter(function (it) { return +a[it.n] <= Math.max(2, min); });
      var html = prLead(fix2(mean), 'Average confidence across the ' + n + ' situations (1–5)') +
        '<div class="callout callout--caution"><p class="callout__title">No subscale scores</p><p>The printed key (subscales from 12 item numbers, “divide by 12”) fits a 12-item version, not the 20 items printed, so subscales are not calculated here. This is only the plain average of your 20 ratings. Use the official 20-item key to score subscales.</p></div>' +
        '<p><strong>Lowest-confidence situations</strong> (' + (min <= 2 ? 'rated 1 or 2' : 'your lowest rating, ' + min) + ') — the high-risk situations to plan for:</p><ul>' +
        low.map(function (it) { return '<li>' + it.n + '. ' + esc(it.q) + ' <span class="muted">(' + a[it.n] + ')</span></li>'; }).join('') + '</ul>';
      return { need: x.items.map(function (it) { return it.n; }), scores: { mean: +fix2(mean), lowest: low.map(function (it) { return it.n; }) }, summary: 'Average ' + fix2(mean) + ' · ' + low.length + ' low-confidence situation' + (low.length === 1 ? '' : 's'), html: html };
    }
  };
  SCORERS.socrates8a = SCORERS.socrates8d = SCORERS.socrates;
  SCORERS.alcdb = SCORERS.drugdb = SCORERS.db;
  delete SCORERS.socrates; delete SCORERS.db;
  var FEEDBACK_FOR = { socrates8a: 'socrates', socrates8d: 'socrates', alcdb: 'db', drugdb: 'db' };
  function prScore(id, ans, opts) {
    var x = TOOL_BY_ID[id], f = SCORERS[id];
    if (!x || !f) return null;
    var r = f(x, ans || {}, opts || {});
    r.missing = r.need.filter(function (n) { return ans[n] == null; }).length;
    return r;
  }
  window.MI_SCORE = function (id, ans, opts) { var r = prScore(id, ans || {}, opts); return r && { missing: r.missing, scores: r.scores, summary: r.summary }; };   // for QA

  var PR_BANNER = '<div class="callout callout--caution"><p class="callout__title">Practice and teaching only — not a clinical record</p><p>Use this to learn how the instrument is scored. There are no name or ID fields, and your answers are cleared when you leave this page unless you choose to save your own practice attempt. To assess a client, use the official form and its manual.</p></div>';
  function prSaveSetting() {
    return '<div class="card pr__setting"><label class="pr__toggle"><input type="checkbox" id="pr-save-on"' + (practiceOn() ? ' checked' : '') + '><span>Save my own practice attempts on this device</span></label>' +
      '<p class="muted">Off by default. When on, a <strong>Save this attempt</strong> button keeps your own practice attempts in this browser only (included in Backup export). These are your practice runs, not client data — never enter a client’s answers.</p></div>';
  }
  function prItemHead(it) { return '<p class="pr__q"><span class="pr__n">' + it.n + '</span><span>' + esc(it.q) + '</span></p>'; }
  function prOptions(x, it) {
    var cur = PR.ans[it.n], name = 'pr-' + it.n;
    if (x.id === 'bscq') {
      var has = cur != null;
      return '<div class="pr__range"><input type="range" min="0" max="100" step="5" value="' + (has ? cur : 50) + '" data-n="' + it.n + '" aria-label="Confidence for situation ' + it.n + ', 0 to 100 percent"' + (has ? '' : ' data-unset="1"') + '><output id="pr-o-' + it.n + '">' + (has ? cur + '%' : 'Not rated') + '</output></div>';
    }
    var opts = it.opts || x.scale, numeric = !it.opts && opts.some(function (o) { return o[0].length > 12; });
    return '<div class="seg' + (numeric ? ' seg--num' : '') + '">' + opts.map(function (o) {
      return '<label><input type="radio" name="' + name + '" value="' + o[1] + '" data-n="' + it.n + '"' + (cur === o[1] ? ' checked' : '') + (numeric ? ' aria-label="' + esc(o[1] + ' = ' + o[0]) + '"' : '') + '><span>' + (numeric ? esc(String(o[1])) : esc(o[0]) + (it.opts ? ' <small>' + o[1] + '</small>' : '')) + '</span></label>';
    }).join('') + '</div>';
  }
  function practiceView(x) {
    if (!PR || PR.id !== x.id) PR = { id: x.id, ans: {}, sex: 'w', msg: '' };
    TITLES.tools = x.short + ' practice';
    var numeric = x.scale && x.scale.some(function (o) { return o[0].length > 12; });
    var h = '<div class="wrap page tool practice" data-tool="' + esc(x.id) + '">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Tools', href: '#/tools' }, { label: x.short, href: '#/tools/' + x.id }, { label: 'Practice' }]) +
      '<header class="page__head"><p class="eyebrow">Practice scoring · Appendix B · Tool ' + x.n + '</p><h1>' + esc(x.short) + ': practice scoring</h1><p>' + (x.id === 'bscq' ? 'Move each slider' : 'Tap an answer for each item') + '. The scores and the book’s interpretation appear when every item is answered.</p></header>' +
      PR_BANNER + prSaveSetting();
    (x.instructions || []).forEach(function (ins) { h += '<details class="tool__items"><summary>' + esc(ins.title || 'Instructions (as printed)') + '</summary><p class="pr__ins">' + esc(ins.x) + '</p></details>'; });
    if (x.id === 'audit') h += segGroup('prsex', 'Zone cut-offs', [['w', 'Women'], ['m', 'Men']], PR.sex);
    if (numeric) h += '<p class="muted">' + esc(x.scaleLabel || 'Response scale:') + '</p>' + scaleChips(x.scale);
    if (x.id === 'bscq') h += '<p class="muted">Each item begins: “Right now I would be able to resist the urge to drink heavily or use my primary drug in situations involving…” · 0% = Not at all confident, 100% = Totally confident.</p>';
    h += '<p class="pr__progress" id="pr-progress" aria-live="polite"></p><ol class="pr__items">' + x.items.map(function (it) {
      return '<li class="pr__item" id="pr-i-' + it.n + '"><fieldset><legend class="sr-only">Item ' + it.n + '</legend>' + prItemHead(it) + prOptions(x, it) + (it.note ? '<p class="tool__note">' + esc(it.note) + '</p>' : '') + '</fieldset></li>';
    }).join('') + '</ol>' +
      '<section class="card pr__result" id="pr-result" aria-live="polite"></section>' +
      '<div class="pr__actions"><button type="button" class="btn" id="pr-clear">Clear answers</button> <button type="button" class="btn btn--solid" id="pr-save">Save this attempt</button></div><p class="pr__msg" id="pr-msg" role="status"></p>' +
      '<section id="pr-history"></section>' +
      '<div class="next"><a class="btn" href="#/tools/' + esc(x.id) + '">← ' + esc(x.short) + ' tool page</a> <a class="btn" href="#/tools">All tools</a></div></div>';
    return h;
  }
  function prPaint() {
    if (!PR || !document.getElementById('pr-progress')) return;
    var x = TOOL_BY_ID[PR.id];
    if (PR.id === 'mikt') { prHistoryPaint(); return; }
    var r = prScore(PR.id, PR.ans, { sex: PR.sex }), total = r.need.length, done = total - r.missing;
    if (PR.id === 'audit') x.items.forEach(function (it) {
      var li = document.getElementById('pr-i-' + it.n), skip = r.need.indexOf(it.n) < 0;
      if (li) { li.classList.toggle('is-skipped', skip); li.querySelector('fieldset').disabled = skip; }
    });
    document.getElementById('pr-progress').textContent = done + ' of ' + total + ' answered';
    var box = document.getElementById('pr-result'), fb = PR_FEEDBACK[FEEDBACK_FOR[PR.id] || PR.id];
    box.innerHTML = r.missing ? '<h2>Result</h2><p class="muted">' + r.missing + ' item' + (r.missing === 1 ? '' : 's') + ' still to answer.</p>' :
      '<h2>Result</h2>' + r.html + (fb ? '<div class="callout callout--key"><p class="callout__title">Giving this feedback · ' + esc(fb.sec) + '</p>' + renderBlocks(fb.blocks) + '<p><a href="#/c/' + fb.ch + '">Open Chapter ' + fb.ch + ' →</a></p></div>' : '');
    var sv = document.getElementById('pr-save');
    if (sv) { sv.hidden = !practiceOn(); sv.disabled = !!r.missing; }
    prHistoryPaint();
  }
  function prHistoryPaint() {
    var el = document.getElementById('pr-history'); if (!el) return;
    var list = prHistory(PR.id), msg = document.getElementById('pr-msg');
    if (msg) msg.textContent = PR.msg || '';
    el.innerHTML = !list.length ? '' : '<h2>Your saved practice attempts (' + list.length + ')</h2><p class="muted">Stored in this browser only' + (practiceOn() ? '' : ' (saving is now off; these stay until you delete them)') + '.</p><ul class="pr__hist">' + list.map(function (e, i) {
      return '<li><span><strong>' + esc(bkDate(e.date)) + '</strong><br><span class="muted">' + esc(e.summary || '') + '</span></span><button type="button" class="btn" data-pr-del="' + i + '" aria-label="Delete the attempt from ' + esc(bkDate(e.date)) + '">Delete</button></li>';
    }).join('') + '</ul><p><button type="button" class="btn" id="pr-clear-all">Delete all ' + esc(TOOL_BY_ID[PR.id].short) + ' attempts</button></p>';
  }
  function prSave(entry) {
    if (!practiceOn()) return;
    var list = prHistory(PR.id);
    list.unshift(entry);
    store.set(prKey(PR.id), list.slice(0, PR_MAX));
    PR.msg = 'Saved on this device.';
  }

  /* --- MI Knowledge Test self-test (own view: up to 6 choices, two dialogues; the chapter quiz engine stays 4-choice) --- */
  var LETTERS = 'abcdef';
  function miktScored(x) { return x.items.filter(function (it) { return !MIKT_SKIP[it.n]; }); }
  function miktResult(x, ans) {
    var items = miktScored(x), right = items.filter(function (it) { return ans[it.n] === it.answer; }).length;
    return { correct: right, of: items.length, unanswered: items.filter(function (it) { return !ans[it.n]; }).length };
  }
  window.MI_MIKT = function (ans) { return miktResult(TOOL_BY_ID.mikt, ans || {}); };   // for QA
  function miktView(x) {
    if (!PR || PR.id !== x.id) PR = { id: x.id, ans: {}, checked: false, msg: '' };
    TITLES.tools = 'MI Knowledge Test self-test';
    var res = PR.checked ? miktResult(x, PR.ans) : null;
    var h = '<div class="wrap page tool practice mikt" data-tool="mikt">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Tools', href: '#/tools' }, { label: x.short, href: '#/tools/mikt' }, { label: 'Self-test' }]) +
      '<header class="page__head"><p class="eyebrow">Self-test · Appendix B · Tool ' + x.n + '</p><h1>MI Knowledge Test</h1><p>' + x.items.length + ' questions as printed (Moyers, Martin, & Christopher, 2005). Choose one answer each, then check. Choices stay in printed order because some refer to others (“both a and b”).</p></header>' +
      '<div class="callout callout--note"><p class="callout__title">Older MI terms</p><p>The test uses the 1991 and 2002 editions of MI. After you check, items that use an older term show the updated term from Chapter 3, Exhibit 3.1. Question 18 is not scored (printing error), so the score is out of ' + miktScored(x).length + '.</p></div>' +
      prSaveSetting();
    if (res) h += '<section class="card pr__result" id="pr-result" tabindex="-1"><h2>Your score</h2>' + prLead(res.correct + ' <span class="pr__of">/ ' + res.of + '</span>', Math.round(100 * res.correct / res.of) + '% correct' + (res.unanswered ? ' · ' + res.unanswered + ' unanswered' : '')) +
      '<p class="muted">Each question below now shows the key and, where relevant, the updated MI term.</p><div class="pr__actions"><button type="button" class="btn" id="mk-retry">Try again</button>' + (practiceOn() ? ' <button type="button" class="btn btn--solid" id="mk-save">Save this attempt</button>' : '') + '</div><p class="pr__msg" id="pr-msg" role="status"></p></section>';
    else h += '<p class="pr__progress" id="pr-progress" aria-live="polite"></p>';
    var ctx = x.contexts || [];
    h += '<ol class="pr__items">' + x.items.map(function (it) {
      var out = '';
      if (it.n === 12 && ctx[0]) out += miktContext(ctx[0]);
      if (it.n === 16 && ctx[1]) out += miktContext(ctx[1]);
      var skip = MIKT_SKIP[it.n], chosen = PR.ans[it.n], ok = chosen === it.answer;
      out += '<li class="pr__item' + (res && !skip ? (ok ? ' is-right' : ' is-wrong') : '') + (skip ? ' is-skipped' : '') + '" id="pr-i-' + it.n + '"><fieldset' + (res || skip ? ' disabled' : '') + '><legend class="sr-only">Question ' + it.n + '</legend>' + prItemHead(it) +
        (it.pre ? '<div class="mk__pre">' + it.pre.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>' : '') +
        (it.note ? '<p class="tool__note">' + esc(it.note) + '</p>' : '') +
        '<div class="choices">' + it.choices.map(function (c, i) {
          var L = LETTERS[i], cls = '';
          if (res && !skip) cls = L === it.answer ? ' is-correct' : L === chosen ? ' is-wrong' : ' is-dim';
          return '<label class="choice' + cls + '"><input type="radio" name="mk-' + it.n + '" value="' + L + '" data-n="' + it.n + '"' + (chosen === L ? ' checked' : '') + '><span class="choice__key">' + L + ')</span><span>' + esc(c) + '</span></label>';
        }).join('') + '</div>';
      if (skip) out += '<p class="pr__fb">' + esc(skip) + '</p>';
      else if (res) out += '<p class="pr__fb"><strong>' + (ok ? 'Correct.' : chosen ? 'Not quite.' : 'Not answered.') + '</strong> Key: ' + it.answer + ') ' + esc(it.choices[LETTERS.indexOf(it.answer)]) + '</p>' +
        (MIKT_TERMS[it.n] ? '<p class="pr__term"><span class="tbadge tbadge--rx">Updated term</span> ' + MIKT_TERMS[it.n] + '</p>' : '');
      return out + '</fieldset></li>';
    }).join('') + '</ol>';
    if (!res) h += '<div class="pr__actions"><button type="button" class="btn btn--solid" id="mk-check">Check my answers</button></div>';
    h += '<section id="pr-history"></section><div class="next"><a class="btn" href="#/tools/mikt">← MI Knowledge Test page</a> <a class="btn" href="#/tools">All tools</a></div></div>';
    return h;
  }
  function miktContext(cx) { return '<li class="mk__ctx" aria-hidden="false"><div class="callout callout--note"><p class="callout__title">' + esc(cx.title) + '</p>' + cx.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div></li>'; }
  function miktProgress() {
    var el = document.getElementById('pr-progress'); if (!el) return;
    var x = TOOL_BY_ID.mikt, n = miktScored(x).filter(function (it) { return PR.ans[it.n]; }).length;
    el.textContent = n + ' of ' + miktScored(x).length + ' answered';
  }

  /* --- Practice events (delegated on main) --- */
  function prRerender() { route({ keepScroll: true }); }
  main.addEventListener('change', function (e) {
    var el = e.target; if (!PR || !el || !el.closest || !el.closest('.practice')) return;
    if (el.id === 'pr-save-on') { store.set('practiceSave', !!el.checked); PR.msg = el.checked ? 'Saving is on for your own practice attempts.' : 'Saving is off. Nothing new will be stored.'; if (PR.id === 'mikt') prRerender(); else prPaint(); return; }
    if (el.name === 'prsex') { PR.sex = el.value === 'm' ? 'm' : 'w'; prPaint(); return; }
    var n = +el.getAttribute('data-n'); if (!n) return;
    if (PR.id === 'mikt') { PR.ans[n] = el.value; miktProgress(); return; }
    if (el.type === 'radio') {
      PR.ans[n] = +el.value;
      if (PR.id === 'audit' && n === 1 && PR.ans[1] === 0) for (var k = 2; k <= 8; k++) delete PR.ans[k];
      PR.msg = ''; prPaint();
    }
  });
  main.addEventListener('input', function (e) {
    var el = e.target; if (!PR || !el || el.type !== 'range' || !el.closest('.practice')) return;
    var n = +el.getAttribute('data-n'); PR.ans[n] = +el.value; el.removeAttribute('data-unset');
    var o = document.getElementById('pr-o-' + n); if (o) o.textContent = el.value + '%';
    PR.msg = ''; prPaint();
  });
  main.addEventListener('click', function (e) {
    if (!PR || !e.target.closest) return;
    var b = e.target.closest('button'); if (!b || !b.closest('.practice')) return;
    var x = TOOL_BY_ID[PR.id];
    if (b.id === 'pr-clear') { PR.ans = {}; PR.msg = ''; prRerender(); }
    else if (b.id === 'pr-save') {
      var r = prScore(PR.id, PR.ans, { sex: PR.sex }); if (!r || r.missing) return;
      prSave({ date: new Date().toISOString(), answers: JSON.parse(JSON.stringify(PR.ans)), scores: r.scores, summary: r.summary }); prPaint();
    }
    else if (b.id === 'mk-check') {
      var un = miktScored(x).filter(function (it) { return !PR.ans[it.n]; }).length;
      if (un && !window.confirm(un + ' question' + (un === 1 ? ' is' : 's are') + ' unanswered and will count as wrong. Check anyway?')) return;
      PR.checked = true; PR.msg = ''; prRerender();
      var box = document.getElementById('pr-result'); if (box) { box.scrollIntoView({ block: 'start' }); box.focus({ preventScroll: true }); }
    }
    else if (b.id === 'mk-retry') { PR.ans = {}; PR.checked = false; PR.msg = ''; prRerender(); window.scrollTo(0, 0); }
    else if (b.id === 'mk-save') {
      var m = miktResult(x, PR.ans);
      prSave({ date: new Date().toISOString(), answers: JSON.parse(JSON.stringify(PR.ans)), scores: m, summary: m.correct + ' / ' + m.of + ' correct' }); b.disabled = true; prHistoryPaint();
    }
    else if (b.hasAttribute('data-pr-del')) {
      var list = prHistory(PR.id), i = +b.getAttribute('data-pr-del');
      if (!window.confirm('Delete this saved practice attempt?')) return;
      list.splice(i, 1); if (list.length) store.set(prKey(PR.id), list); else store.del(prKey(PR.id)); PR.msg = 'Attempt deleted.'; prHistoryPaint();
    }
    else if (b.id === 'pr-clear-all') {
      if (!window.confirm('Delete all your saved ' + x.short + ' practice attempts on this device?')) return;
      store.del(prKey(PR.id)); PR.msg = 'All saved attempts deleted.'; prHistoryPaint();
    }
  });

  AFTER.tools = function (id, mode) {
    if (!PR || !mode) return;
    if (PR.id === 'mikt') { miktProgress(); prHistoryPaint(); } else prPaint();
  };
  TITLES.resources = 'Resources';
  /* --- Stage by stage: SOC stage -> strategies, read at runtime from Exhibits 4.1, 5.1, 6.1 and 7.1 in the chapter data --- */
  function stageRows() {
    var out = [];
    [[4, '4.1', 'Precontemplation'], [5, '5.1', 'Contemplation'], [6, '6.1', null], [7, '7.1', null]].forEach(function (spec) {
      var c = chapter(spec[0]); if (!c) return;
      var tbl = null;
      c.sections.forEach(function (sec) {
        for (var i = 0; i < sec.blocks.length && !tbl; i++) {
          var b = sec.blocks[i];
          if (b.t === 'h3' && b.x.indexOf('Exhibit ' + spec[1] + ' ') === 0) {
            for (var j = i + 1; j < sec.blocks.length; j++) if (sec.blocks[j].t === 'table') { tbl = sec.blocks[j]; break; }
          }
        }
      });
      if (!tbl) return;
      if (tbl.head.length === 2) {   // Area | Content: one stage per exhibit (4.1, 5.1)
        var m = {}; tbl.rows.forEach(function (r) { m[r[0]] = r[1]; });
        out.push({ stage: spec[2], ch: c, ex: spec[1], motivation: m['Client motivation'] || '', focus: m['Counselor focus'] || '', strategies: m['Counseling strategies'] || '' });
      } else {                       // Stage | Client motivation | Counselor focus | Counseling strategies (6.1, 7.1)
        tbl.rows.forEach(function (r) { out.push({ stage: r[0], ch: c, ex: spec[1], motivation: r[1], focus: r[2], strategies: r[3] }); });
      }
    });
    return out;
  }
  function sentences(x) { return String(x).split(/\.\s+(?=[A-Z])/).map(function (t) { return t.replace(/\.\s*$/, ''); }).filter(Boolean); }
  function stageId(name) { return 'st-' + String(name).toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''); }
  TITLES.stages = 'Stage by stage';
  VIEWS.stages = function () {
    var rows = stageRows();
    return '<div class="wrap page stages-page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Stage by stage' }]) +
      '<header class="page__head"><p class="eyebrow">Exhibits 4.1 · 5.1 · 6.1 · 7.1</p><h1>Stage by stage</h1><p>What the client is like, what to focus on and which strategies to use at each stage of change, side by side from the four strategy exhibits in Chapters 4 to 7. Match your approach to the client’s stage; if a client is further along, move to later-stage strategies.</p></header>' +
      stagesSVG() +
      '<nav class="toc" aria-label="Stages"><span class="toc__label">Jump to a stage</span>' + rows.map(function (r) { return '<a class="filter" href="#/stages" data-jump="' + stageId(r.stage) + '">' + esc(r.stage) + '</a>'; }).join('') + '</nav>' +
      '<section class="guide__sec"><h2>At a glance</h2>' + renderBlocks([{ t: 'table', head: ['Stage', 'Counselor focus'], rows: rows.map(function (r) { return [r.stage, r.focus]; }) }]) + '</section>' +
      rows.map(function (r, i) {
        return '<section class="guide__sec stage" id="' + stageId(r.stage) + '"><p class="eyebrow">Stage ' + (i + 1) + ' of ' + rows.length + ' · Exhibit ' + esc(r.ex) + '</p><h2>' + esc(r.stage) + '</h2>' +
          '<h3>Client motivation</h3><p>' + linkTerms(r.motivation) + '</p>' +
          '<h3>Counselor focus</h3><ul>' + sentences(r.focus).map(function (x) { return '<li>' + linkTerms(x) + '</li>'; }).join('') + '</ul>' +
          '<h3>Counseling strategies</h3><ul class="stage__list">' + sentences(r.strategies).map(function (x) { return '<li>' + linkTerms(x) + '</li>'; }).join('') + '</ul>' +
          '<p class="stage__more"><a class="btn" href="#/c/' + r.ch.id + '/guide">Chapter ' + r.ch.id + ' study guide →</a></p></section>';
      }).join('') + '</div>';
  };

  /* --- SKILL DRILLS (v1.10.0): quick tap-to-answer practice. Every item is read at runtime from the chapter tables
     (Ch 3 open/closed questions, DARN-CAT, Exhibits 3.3, 3.6, 3.8, the sustain talk strategies; Exhibits 4.1-7.1 via stageRows),
     so no book text is copied and edits to those tables flow through. A drill whose table is missing is simply left out. --- */
  function quotes(x) { return String(x).match(/“[^”]*”/g) || []; }
  function tableAfter(chId, start) {   // the first table under the h3 whose text starts with `start`
    var c = chapter(chId), tbl = null; if (!c) return null;
    c.sections.forEach(function (sec) {
      for (var i = 0; i < sec.blocks.length && !tbl; i++) {
        var b = sec.blocks[i];
        if (b.t === 'h3' && b.x.indexOf(start) === 0) {
          for (var j = i + 1; j < sec.blocks.length; j++) { if (sec.blocks[j].t === 'h3') break; if (sec.blocks[j].t === 'table') { tbl = sec.blocks[j]; break; } }
        }
      }
    });
    return tbl;
  }
  function tableIn(chId, secId, head0) {   // the table in a section whose first column heading is `head0`
    var c = chapter(chId), tbl = null; if (!c) return null;
    c.sections.forEach(function (sec) { if (sec.id === secId) sec.blocks.forEach(function (b) { if (!tbl && b.t === 'table' && b.head[0] === head0) tbl = b; }); });
    return tbl;
  }
  function lcFirst(s) { s = stripTags(s); return s.charAt(0).toLowerCase() + s.slice(1); }
  function buildDrills() {
    var out = [];
    var oq = tableAfter(3, 'Asking open questions'), darn = tableAfter(3, 'DARN-CAT'), ex33 = tableAfter(3, 'Exhibit 3.3'),
        ex36 = tableAfter(3, 'Exhibit 3.6'), ex38 = tableAfter(3, 'Exhibit 3.8'), sus = tableIn(3, 'sustain-talk', 'Strategy');
    var types = darn ? darn.rows.map(function (r) { return r[0]; }) : [], def = {};
    if (darn) darn.rows.forEach(function (r) { def[r[0]] = '<strong>' + esc(r[0]) + '</strong>: ' + lcFirst(r[1]) + '.'; });

    if (oq) {
      var a1 = [];
      oq.rows.forEach(function (r) {
        a1.push({ x: r[0], a: 1, why: 'Closed: it can be answered with yes, no or a few words. An open version: ' + r[1] });
        a1.push({ x: r[1], a: 0, why: 'Open: it invites the client to reflect and elaborate. The closed version: ' + r[0] });
      });
      out.push({ id: 'open', title: 'Open or closed question?', blurb: 'Tell open questions from closed ones at a glance.', prompt: 'Is this an open or a closed question?',
        src: 'Chapter 3 · Asking open questions', href: '#/c/3/guide', choices: ['Open question', 'Closed question'], items: a1 });
    }
    if (ex33) {
      var a2 = [];
      ex33.rows.forEach(function (r) {
        a2.push({ x: r[1], a: 0, why: 'Change talk (' + esc(r[0]) + '). The sustain talk version: ' + r[2] });
        a2.push({ x: r[2], a: 1, why: 'Sustain talk (' + esc(r[0]) + '). The change talk version: ' + r[1] });
      });
      out.push({ id: 'talk', title: 'Change talk or sustain talk?', blurb: 'Hear which way a client statement leans.', prompt: 'Is the client voicing change talk or sustain talk?',
        src: 'Chapter 3 · Exhibit 3.3', href: '#/c/3/guide', choices: ['Change talk', 'Sustain talk'], items: a2 });
    }
    if (darn && types.length) {
      var a3 = [];
      darn.rows.forEach(function (r, i) { quotes(r[2]).forEach(function (q) { a3.push({ x: q, a: i, why: def[r[0]] + ' This is change talk.' }); }); });
      if (ex33) ex33.rows.forEach(function (r) {
        var i = types.indexOf(r[0]); if (i < 0) return;
        a3.push({ x: r[1], a: i, why: def[r[0]] + ' This is change talk.' });
        a3.push({ x: r[2], a: i, why: def[r[0]] + ' Here it is sustain talk: the same kind of statement, in favor of not changing.' });
      });
      out.push({ id: 'darncat', title: 'Which DARN-CAT type?', blurb: 'Sort client statements into Desire, Ability, Reasons, Need, Commitment, Activation and Taking steps.', prompt: 'Which DARN-CAT type is this client statement?',
        src: 'Chapter 3 · DARN-CAT and Exhibit 3.3', href: '#/c/3/guide', choices: types, items: a3 });
    }
    if (ex38) {
      var a4 = [], t4 = ex38.rows.map(function (r) { return r[0]; });
      ex38.rows.forEach(function (r, i) { quotes(r[1]).forEach(function (q) { a4.push({ x: q, a: i, why: (def[r[0]] || '<strong>' + esc(r[0]) + '</strong>.') + ' The question invites that kind of change talk.' }); }); });
      out.push({ id: 'evoke', title: 'What does this question evoke?', blurb: 'Match each evoking question to the DARN change talk it invites.', prompt: 'Which kind of change talk is the counselor inviting?',
        src: 'Chapter 3 · Exhibit 3.8', href: '#/c/3/guide', choices: t4, items: a4 });
    }
    if (ex36 || sus) {
      var a5 = [];
      if (ex36) { var t36 = ex36.rows.map(function (r) { return r[0]; }); ex36.rows.forEach(function (r, i) { a5.push({ pre: 'Client: ' + r[1], x: 'Counselor: ' + r[2], a: i, choices: t36, why: r[3] + ' ' + r[4] }); }); }
      if (sus) { var ts = sus.rows.map(function (r) { return r[0]; }); sus.rows.forEach(function (r, i) { var q = quotes(r[2]); if (q.length === 2) a5.push({ pre: 'Client: ' + q[0], x: 'Counselor: ' + q[1], a: i, choices: ts, why: r[1] }); }); }
      out.push({ id: 'respond', title: 'Name the response', blurb: 'Name the reflection or the strategy the counselor uses to answer sustain talk.', prompt: 'What kind of response is the counselor giving?',
        src: 'Chapter 3 · Exhibit 3.6 and Responding to sustain talk', href: '#/c/3/guide', items: a5 });
    }
    var rows = stageRows();
    if (rows.length) {
      var a6 = [], st = rows.map(function (r) { return r.stage; });
      rows.forEach(function (r, i) {
        var tail = 'Exhibit ' + esc(r.ex) + ', Chapter ' + r.ch.id + '.';
        a6.push({ pre: 'Client motivation', x: r.motivation, a: i, link: true, why: tail });
        sentences(r.focus).forEach(function (x) { a6.push({ pre: 'Counselor focus', x: x + '.', a: i, link: true, why: tail + ' The client at this stage: ' + lcFirst(r.motivation) }); });
        sentences(r.strategies).forEach(function (x) { a6.push({ pre: 'Counseling strategy', x: x + '.', a: i, link: true, why: tail + ' The client at this stage: ' + lcFirst(r.motivation) }); });
      });
      out.push({ id: 'stage', title: 'Which stage of change?', blurb: 'Match client motivation, counselor focus and strategies to the right stage.', prompt: 'Which stage of change does this belong to?',
        src: 'Chapters 4 to 7 · Exhibits 4.1, 5.1, 6.1 and 7.1', href: '#/stages', hrefLabel: 'Stage by stage', choices: st, items: a6 });
    }
    return out.filter(function (d) { return d.items.length; });
  }
  var DRILLS = buildDrills(), DRILL_BY_ID = {}, DRILL_N = 10, drill = null;   // drill = { id, items, i, picked, right, answers:[bool] }
  DRILLS.forEach(function (d) { DRILL_BY_ID[d.id] = d; });
  window.MI_DRILLS = DRILLS;   // for QA
  function startDrill(d, items) { drill = { id: d.id, items: items || shuffle(d.items).slice(0, DRILL_N), i: 0, picked: null, right: 0, answers: [] }; }
  function drillStats() { return store.get('drills', {}) || {}; }
  TITLES.drills = 'Skill drills';
  VIEWS.drills = function (id) {
    if (!id) {
      var s = drillStats();
      return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Skill drills' }]) +
        '<header class="page__head"><p class="eyebrow">Practice</p><h1>Skill drills</h1><p>Short rounds of ' + DRILL_N + ' that train your ear for MI: read a statement, tap what it is, and see why straight away. Every statement is an example from TIP 35, so the drills practice recognition; they do not replace role-play and supervised practice.</p></header>' +
        '<div class="drill__list">' + DRILLS.map(function (d) {
          var r = s[d.id];
          return '<a class="card drill" href="#/drills/' + d.id + '"><h3>' + esc(d.title) + '</h3><p>' + esc(d.blurb) + '</p><p class="drill__meta">' + plural(d.items.length, 'item', 'items') + ' · ' + esc(d.src) +
            (r && r.best ? '<br><strong>Best ' + r.best.score + '/' + r.best.total + '</strong> · ' + plural(r.n, 'round', 'rounds') + ' · last ' + esc(fmtDate(r.last.date)) : '<br>Not tried yet') + '</p></a>';
        }).join('') + '</div></div>';
    }
    var d = DRILL_BY_ID[id];
    if (!d) return missingView();
    if (!drill || drill.id !== d.id || drill.i >= drill.items.length) startDrill(d);
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Skill drills', href: '#/drills' }, { label: d.title }]) +
      '<header class="page__head"><h1>' + esc(d.title) + '</h1><p class="muted">' + esc(d.src) + '</p></header><div id="drill">' + drillHTML() + '</div></div>';
  };
  function drillHTML() {
    var z = drill, d = DRILL_BY_ID[z.id], n = z.items.length;
    if (z.i >= n) {
      var missed = z.items.filter(function (_, i) { return !z.answers[i]; });
      return '<div class="result-card"><p class="eyebrow">Result</p><h2>' + z.right + ' of ' + n + ' correct (' + Math.round(100 * z.right / n) + '%)</h2>' +
        '<ul class="review-list">' + z.items.map(function (it, i) {
          var ch = it.choices || d.choices;
          return '<li class="' + (z.answers[i] ? 'is-right' : 'is-wrong') + '"><span>' + (i + 1) + '.</span><span>' + esc(stripTags(it.x)) + '<br><small>' + esc(ch[it.a]) + '</small></span></li>';
        }).join('') + '</ul>' +
        '<p class="drill__acts"><button type="button" class="btn btn--solid" data-dact="again">New round</button> ' +
        (missed.length ? '<button type="button" class="btn" data-dact="missed">Retry missed (' + missed.length + ')</button> ' : '') +
        '<a class="btn" href="#/drills">All drills</a> <a class="btn" href="#/today">Today’s session</a> <a class="btn" href="' + esc(d.href) + '">' + esc(d.hrefLabel || 'Chapter 3 study guide') + ' →</a></p></div>';
    }
    var it = z.items[z.i], ch = it.choices || d.choices, picked = z.picked;
    return '<div class="q-card"><div class="q-card__top"><span class="eyebrow">' + (z.i + 1) + ' of ' + n + '</span><span class="muted">' + z.right + ' correct</span></div>' +
      '<p class="drill__prompt">' + esc(d.prompt) + '</p>' + (it.pre ? '<p class="drill__pre">' + it.pre + '</p>' : '') +
      '<p class="q-card__q">' + (it.link ? linkTerms(it.x) : it.x) + '</p>' +
      '<ul class="choices' + (ch.length === 2 ? ' choices--two' : '') + '">' + ch.map(function (c, i) {
        var cls = 'choice' + (picked !== null ? (i === it.a ? ' is-correct' : i === picked ? ' is-wrong' : ' is-dim') : '');
        return '<li><button type="button" class="' + cls + '" data-dpick="' + i + '"' + (picked !== null ? ' disabled' : '') + '><span class="choice__key">' + 'ABCDEFG'[i] + '</span><span>' + esc(c) + '</span></button></li>';
      }).join('') + '</ul>' +
      (picked !== null ? '<div class="verdict ' + (picked === it.a ? 'is-right' : 'is-wrong') + '">' + (picked === it.a ? 'Correct.' : 'Not quite: ' + esc(ch[it.a]) + '.') + '</div><p class="why">' + it.why + '</p><p class="q-card__next"><button type="button" class="btn btn--solid" data-dact="next">' + (z.i + 1 < n ? 'Next' : 'See result') + '</button></p>'
        : '<p class="kbd-help"><kbd>A</kbd>–<kbd>' + 'ABCDEFG'[ch.length - 1] + '</kbd> choose · <kbd>Enter</kbd> next</p>') + '</div>';
  }
  function paintDrill() {
    var el = document.getElementById('drill'); if (!el) return;
    el.innerHTML = drillHTML();
    var nb = el.querySelector('[data-dact="next"]'); if (nb) { nb.focus({ preventScroll: true }); if (nb.scrollIntoView) nb.scrollIntoView({ block: 'nearest' }); }
  }
  function drillPick(i) {
    var z = drill; if (!z || z.picked !== null || z.i >= z.items.length) return;
    var ok = i === z.items[z.i].a;
    z.picked = i; z.answers.push(ok); if (ok) z.right++;
    paintDrill();
  }
  function drillNext() {
    var z = drill; if (!z || z.picked === null) return;
    z.i++; z.picked = null;
    if (z.i >= z.items.length) {   // keep best, last and the number of rounds; covered by backup
      var s = drillStats(), r = s[z.id] || { n: 0 }, rec = { score: z.right, total: z.items.length, date: isoToday() };
      r.n++; r.last = rec; if (!r.best || rec.score / rec.total >= r.best.score / r.best.total) r.best = rec;
      s[z.id] = r; store.set('drills', s);
      logAct('d');
    }
    paintDrill(); window.scrollTo(0, 0);
  }
  main.addEventListener('click', function (e) {
    if (!e.target.closest || !drill || !e.target.closest('#drill')) return;
    var p = e.target.closest('[data-dpick]'); if (p && !p.disabled) { drillPick(+p.getAttribute('data-dpick')); return; }
    var a = e.target.closest('[data-dact]'); if (!a) return;
    var act = a.getAttribute('data-dact'), d = DRILL_BY_ID[drill.id];
    if (act === 'next') drillNext();
    else if (act === 'again') { startDrill(d); paintDrill(); }
    else if (act === 'missed') { var z = drill; startDrill(d, shuffle(z.items.filter(function (_, i) { return !z.answers[i]; }))); paintDrill(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!drill || !document.getElementById('drill') || drill.i >= drill.items.length) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    var k = e.key.toLowerCase(), it = drill.items[drill.i], n = (it.choices || DRILL_BY_ID[drill.id].choices).length;
    if (/^[a-g]$/.test(k) && drill.picked === null) { var i = 'abcdefg'.indexOf(k); if (i < n) drillPick(i); }
    else if (e.key === 'Enter' && drill.picked !== null && !(e.target.closest && e.target.closest('a'))) { e.preventDefault(); drillNext(); }
  });

  /* --- WRITE A RESPONSE (v1.11.0): type your own reflection, response or open question, then compare it with the TIP 35 example
     and rate yourself. Items are read at runtime from the Chapter 3 tables (Exhibit 3.6, Responding to sustain talk, Asking open
     questions). What is typed lives only in `wr` and is dropped in route(); only the self-ratings are stored (mt:v1:write). --- */
  function buildWrites() {
    var out = [], ex36 = tableAfter(3, 'Exhibit 3.6'), sus = tableIn(3, 'sustain-talk', 'Strategy'), oq = tableAfter(3, 'Asking open questions');
    if (ex36) out.push({ id: 'reflect', title: 'Write a reflection', blurb: 'Read what the client says and write the kind of reflection asked for.', src: 'Chapter 3 · Exhibit 3.6', label: 'Your reflection',
      items: ex36.rows.map(function (r, i) { return { k: i, task: 'Write this kind of reflection: <strong>' + esc(r[0]) + '</strong>', who: 'Client', x: r[1], model: r[2], modelLabel: 'Counselor', hint: r[3], notes: [['Purpose', r[3]], ['Keep in mind', r[4]]] }; }) });
    if (sus) {
      var a = [];
      sus.rows.forEach(function (r, i) { var q = quotes(r[2]); if (q.length === 2) a.push({ k: i, task: 'Respond to this sustain talk with: <strong>' + esc(r[0]) + '</strong>', who: 'Client', x: q[0], model: q[1], modelLabel: 'Counselor', hint: r[1], notes: [['How', r[1]]] }); });
      out.push({ id: 'sustain', title: 'Respond to sustain talk', blurb: 'Answer sustain talk with the strategy asked for, without arguing.', src: 'Chapter 3 · Responding to change talk and sustain talk', label: 'Your response', items: a });
    }
    if (oq) out.push({ id: 'open', title: 'Open it up', blurb: 'Rewrite a closed question as an open one.', src: 'Chapter 3 · Asking open questions', label: 'Your open question',
      items: oq.rows.map(function (r, i) { return { k: i, task: 'Rewrite this closed question as an <strong>open question</strong>.', who: 'Closed question', x: r[0], model: r[1], modelLabel: 'Open question', hint: 'An open question invites the client to reflect and elaborate. A statement that begins “Tell me about…” also works as an open question.', notes: [] }; }) });
    return out.filter(function (w) { return w.items.length; });
  }
  var WRITES = buildWrites(), WRITE_BY_ID = {}, wr = null;   // wr = { id, items, i, text, shown, rates: [1|2|3] }
  WRITES.forEach(function (w) { WRITE_BY_ID[w.id] = w; });
  window.MI_WRITES = WRITES;   // for QA
  var WR_RATES = [[1, 'Missed the idea'], [2, 'Close'], [3, 'Got the idea']];
  function writeStats() { return store.get('write', {}) || {}; }
  function writeSummary(w) {   // { tried, got } over the items of one set, from the last self-rating of each
    var s = writeStats(), tried = 0, got = 0;
    w.items.forEach(function (it) { var r = s[w.id + '/' + it.k]; if (r) { tried++; if (r.r === 3) got++; } });
    return { tried: tried, got: got, total: w.items.length };
  }
  function startWrite(w, items) { wr = { id: w.id, items: items || shuffle(w.items), i: 0, text: '', shown: false, rates: [] }; }
  TITLES.write = 'Write a response';
  VIEWS.write = function (id) {
    if (!id) {
      return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Write a response' }]) +
        '<header class="page__head"><p class="eyebrow">Practice</p><h1>Write a response</h1><p>The drills train you to recognize MI skills; here you produce them. Read the prompt, type what you would say, then compare it with the example in TIP 35 and rate yourself. The example is one way to say it, so compare the idea, not the exact words.</p></header>' +
        '<div class="callout callout--note"><p class="callout__title">What you type is not saved</p><p>Your text stays on the screen only and is cleared when you leave the page. Only your self-ratings are kept on this device. Do not type patient details.</p></div>' +
        '<div class="drill__list">' + WRITES.map(function (w) {
          var m = writeSummary(w);
          return '<a class="card drill" href="#/write/' + w.id + '"><h3>' + esc(w.title) + '</h3><p>' + esc(w.blurb) + '</p><p class="drill__meta">' + plural(w.items.length, 'prompt', 'prompts') + ' · ' + esc(w.src) +
            (m.tried ? '<br><strong>Got the idea on ' + m.got + ' of ' + m.total + '</strong> · ' + m.tried + ' tried' : '<br>Not tried yet') + '</p></a>';
        }).join('') + '</div></div>';
    }
    var w = WRITE_BY_ID[id];
    if (!w) return missingView();
    if (!wr || wr.id !== w.id) startWrite(w);
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Write a response', href: '#/write' }, { label: w.title }]) +
      '<header class="page__head"><h1>' + esc(w.title) + '</h1><p class="muted">' + esc(w.src) + '</p></header><div id="write">' + writeHTML() + '</div></div>';
  };
  function writeHTML() {
    var z = wr, w = WRITE_BY_ID[z.id], n = z.items.length;
    if (z.i >= n) {
      var got = z.rates.filter(function (r) { return r === 3; }).length, redo = z.items.filter(function (_, i) { return z.rates[i] < 3; });
      return '<div class="result-card"><p class="eyebrow">Round complete</p><h2>Got the idea on ' + got + ' of ' + n + '</h2>' +
        '<ul class="review-list">' + z.items.map(function (it, i) {
          return '<li class="' + (z.rates[i] === 3 ? 'is-right' : 'is-wrong') + '"><span>' + (i + 1) + '.</span><span>' + esc(stripTags(it.x)) + '<br><small>' + esc(WR_RATES[z.rates[i] - 1][1]) + '</small></span></li>';
        }).join('') + '</ul>' +
        '<p class="drill__acts"><button type="button" class="btn btn--solid" data-wact="again">Go again</button> ' +
        (redo.length ? '<button type="button" class="btn" data-wact="redo">Redo the ones I missed (' + redo.length + ')</button> ' : '') +
        '<a class="btn" href="#/write">All sets</a> <a class="btn" href="#/c/3/guide">Chapter 3 study guide →</a></p></div>';
    }
    var it = z.items[z.i];
    var head = '<div class="q-card"><div class="q-card__top"><span class="eyebrow">' + (z.i + 1) + ' of ' + n + '</span></div>' +
      '<p class="drill__prompt">' + it.task + '</p><p class="drill__pre">' + esc(it.who) + '</p><p class="q-card__q">' + it.x + '</p>';
    if (!z.shown) {
      return head + '<details class="write__hint"><summary>Hint</summary><p>' + it.hint + '</p></details>' +
        '<label class="write__label" for="wr-ta">' + esc(w.label) + '</label><textarea id="wr-ta" class="write__ta" rows="4" autocomplete="off" autocapitalize="sentences" placeholder="Type what you would say…">' + esc(z.text) + '</textarea>' +
        '<p class="q-card__next"><button type="button" class="btn btn--solid" data-wact="show">Compare with TIP 35</button></p></div>';
    }
    return head + '<div class="write__cmp"><div class="write__mine"><p class="eyebrow">You wrote</p><p>' + (z.text.trim() ? esc(z.text.trim()) : '<span class="muted">(nothing typed)</span>') + '</p></div>' +
      '<div class="write__model"><p class="eyebrow">TIP 35 example · ' + esc(it.modelLabel) + '</p><p>' + it.model + '</p></div></div>' +
      (it.notes.length ? '<dl class="write__notes">' + it.notes.map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl>' : '') +
      '<p class="write__ask" id="wr-ask">How close was yours to the idea?</p><div class="write__rate" role="group" aria-labelledby="wr-ask">' + WR_RATES.map(function (r) {
        return '<button type="button" class="btn rate__b rate__b--' + (r[0] === 1 ? 1 : r[0] === 2 ? 2 : 3) + '" data-wrate="' + r[0] + '">' + esc(r[1]) + '</button>';
      }).join('') + '</div></div>';
  }
  function paintWrite(focus) {
    var el = document.getElementById('write'); if (!el) return;
    el.innerHTML = writeHTML();
    var f = el.querySelector(focus === 'ta' ? '#wr-ta' : '[data-wrate="3"]'); if (f && focus) f.focus({ preventScroll: true });
  }
  function writeShow() { if (wr && !wr.shown && wr.i < wr.items.length) { wr.shown = true; paintWrite('rate'); } }
  function writeRate(r) {
    var z = wr; if (!z || !z.shown || z.i >= z.items.length) return;
    var s = writeStats(), key = z.id + '/' + z.items[z.i].k, old = s[key] || { n: 0 };
    s[key] = { n: old.n + 1, r: r, d: isoToday() }; store.set('write', s);
    logAct('w');
    z.rates.push(r); z.i++; z.text = ''; z.shown = false;
    paintWrite('ta'); window.scrollTo(0, 0);
  }
  main.addEventListener('input', function (e) { if (wr && e.target && e.target.id === 'wr-ta') wr.text = e.target.value; });
  main.addEventListener('keydown', function (e) { if (wr && e.target && e.target.id === 'wr-ta' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); writeShow(); } });
  main.addEventListener('click', function (e) {
    if (!e.target.closest || !wr || !e.target.closest('#write')) return;
    var r = e.target.closest('[data-wrate]'); if (r) { writeRate(+r.getAttribute('data-wrate')); return; }
    var a = e.target.closest('[data-wact]'); if (!a) return;
    var act = a.getAttribute('data-wact'), w = WRITE_BY_ID[wr.id];
    if (act === 'show') writeShow();
    else if (act === 'again') { startWrite(w); paintWrite('ta'); }
    else if (act === 'redo') { var z = wr; startWrite(w, shuffle(z.items.filter(function (_, i) { return z.rates[i] < 3; }))); paintWrite('ta'); }
  });

  /* --- TODAY (v1.12.0): one short daily session (cards, quiz questions, one drill round) and a streak.
     mt:v1:days  = { dayNumber: { c: cards rated, q: quiz questions answered, qr: answered right, d: drill rounds, w: written responses, done: 1 } }
     mt:v1:plan  = { day, cards, quiz, drill } — today's targets, fixed the first time the app is opened that day
     mt:v1:qstat = { 'ch/qid': [right, wrong] } — every quiz answer, for the Progress page. All covered by backup. --- */
  var DAYS = store.get('days', {}) || {}, QSTAT = store.get('qstat', {}) || {}, PLAN = store.get('plan', null);
  var TODAY_CARDS = 10, TODAY_QUIZ = 5, DAYS_KEPT = 400;
  function dayAct(d) { var a = DAYS[d] || {}; return { c: a.c || 0, q: a.q || 0, qr: a.qr || 0, d: a.d || 0, w: a.w || 0, done: !!a.done }; }
  function quizPool() { var pool = []; CHAPTERS.forEach(function (c) { c.quiz.forEach(function (q) { pool.push({ ch: c, q: q, key: quizKey(c, q) }); }); }); return pool; }
  function nextDrillId() {   // the drill practiced least so far
    var s = drillStats(), best = null;
    DRILLS.forEach(function (d) { var n = s[d.id] ? s[d.id].n : 0; if (!best || n < best.n) best = { id: d.id, n: n }; });
    return best ? best.id : null;
  }
  function ensurePlan() {
    var d = today();
    if (PLAN && PLAN.day === d) return PLAN;
    var all = allCards(), due = all.filter(function (x) { return isDue(x.key); }).length, fresh = all.filter(function (x) { return !SRS[x.key]; }).length;
    PLAN = { day: d, cards: Math.min(TODAY_CARDS, due + Math.min(fresh, Math.max(0, NEW_PER_DAY - newSeenToday()))), quiz: Math.min(TODAY_QUIZ, quizPool().length), drill: nextDrillId() };
    store.set('plan', PLAN);
    return PLAN;
  }
  function todayState() {
    var p = ensurePlan(), a = dayAct(p.day);
    var steps = [
      { id: 'cards', title: 'Flashcards', have: a.c, need: p.cards, href: '#/today/cards', what: p.cards ? 'Cards that are due, then new ones.' : 'No cards are due and none are new today.' },
      { id: 'quiz', title: 'Quiz questions', have: a.q, need: p.quiz, href: '#/today/quiz', what: 'Your past mistakes first, then questions from any chapter.' },
      { id: 'drill', title: 'One skill drill round', have: a.d, need: p.drill ? 1 : 0, href: '#/drills/' + (p.drill || ''), what: p.drill && DRILL_BY_ID[p.drill] ? DRILL_BY_ID[p.drill].title : '' }
    ];
    steps.forEach(function (s) { s.done = s.have >= s.need; });
    return { steps: steps, done: steps.every(function (s) { return s.done; }), left: steps.filter(function (s) { return !s.done; }).length, act: a };
  }
  function saveDays() {
    var keys = Object.keys(DAYS).map(Number).sort(function (a, b) { return a - b; });
    while (keys.length > DAYS_KEPT) delete DAYS[keys.shift()];
    store.set('days', DAYS);
  }
  function logAct(kind) {
    var p = ensurePlan(), a = DAYS[p.day] || (DAYS[p.day] = {});
    a[kind] = (a[kind] || 0) + 1;
    if (!a.done && todayState().done) a.done = 1;
    saveDays();
  }
  function logQuiz(key, ok) {
    var r = QSTAT[key] || (QSTAT[key] = [0, 0]); r[ok ? 0 : 1]++; store.set('qstat', QSTAT);
    logAct('q'); if (ok) logAct('qr');
  }
  function streak() {   // days in a row with a finished session, counting today only once it is finished
    var d = today(), n = 0;
    if (!(DAYS[d] && DAYS[d].done)) d--;
    while (DAYS[d] && DAYS[d].done) { n++; d--; }
    return n;
  }
  function bestStreak() {
    var keys = Object.keys(DAYS).map(Number).filter(function (k) { return DAYS[k].done; }).sort(function (a, b) { return a - b; }), best = 0, run = 0, prev = null;
    keys.forEach(function (k) { run = prev !== null && k === prev + 1 ? run + 1 : 1; if (run > best) best = run; prev = k; });
    return best;
  }
  function dayDate(d) { return new Date(d * 86400000).toISOString().slice(0, 10); }
  function isoToday() { return dayDate(today()); }   // the LOCAL calendar date (toISOString alone gives the UTC date, a day behind before 8 a.m. in Manila)
  function todayDeck() {
    var p = ensurePlan(), left = p.cards - dayAct(p.day).c, n = left > 0 ? left : TODAY_CARDS, all = allCards();
    var due = shuffle(all.filter(function (x) { return isDue(x.key); })), fresh = all.filter(function (x) { return !SRS[x.key]; });
    return due.concat(fresh).slice(0, n);
  }
  function todayQuiz() {
    var p = ensurePlan(), left = p.quiz - dayAct(p.day).q, n = left > 0 ? left : TODAY_QUIZ;
    var missed = shuffle(Object.keys(MISTAKES).map(findQuestion).filter(Boolean)), rest = shuffle(quizPool().filter(function (x) { return !MISTAKES[x.key]; }));
    return missed.concat(rest).slice(0, n);
  }
  function weekStrip() {
    var d = today(), out = '';
    for (var i = 6; i >= 0; i--) {
      var k = d - i, a = dayAct(k), any = a.c + a.q + a.d + a.w > 0, wd = new Date(k * 86400000).toLocaleDateString(locale(), { weekday: 'short', timeZone: 'UTC' });
      out += '<li class="week__d' + (a.done ? ' is-done' : any ? ' is-some' : '') + (i === 0 ? ' is-today' : '') + '"><span class="week__dot" aria-hidden="true">' + (a.done ? '✓' : '') + '</span><span>' + esc(wd) + '</span><span class="sr-only">: ' + (a.done ? 'session finished' : any ? 'some study' : 'no study') + '</span></li>';
    }
    return '<ul class="week" aria-label="The last 7 days">' + out + '</ul>';
  }
  function todayStrip() {   // on Home
    var st = todayState(), n = streak();
    return '<a class="card today-strip' + (st.done ? ' is-done' : '') + '" href="#/today">' + icon('today', 'today-strip__ico') + '<span><strong>' + (st.done ? 'Today’s session is done' : 'Today’s session: ' + plural(st.left, 'step', 'steps') + ' left') + '</strong>' +
      '<span class="muted">' + (n ? plural(n, 'day', 'days') + ' in a row' : 'About 10 minutes: cards, quiz questions and one drill') + '</span></span></a>';
  }
  TITLES.today = 'Today';
  VIEWS.today = function (arg) {
    var back = '<p class="today__back"><a class="btn" href="#/today">← Today’s session</a></p>';
    if (arg === 'cards') {
      if (!player || player.key !== 'today' || player.i >= player.deck.length) player = { key: 'today', deck: todayDeck(), i: 0, flipped: false, known: 0, learn: 0 };
      return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Today', href: '#/today' }, { label: 'Flashcards' }]) + '<header class="page__head"><h1>Today’s flashcards</h1><p class="muted">Rate each card; it comes back when you are about to forget it.</p></header><div id="player">' + playerHTML() + '</div>' + back + '</div>';
    }
    if (arg === 'quiz') {
      if (!quiz || quiz.key !== 'today' || quiz.i >= quiz.qs.length) startQuiz('today', todayQuiz());
      return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Today', href: '#/today' }, { label: 'Quiz questions' }]) + '<header class="page__head"><h1>Today’s quiz questions</h1><p class="muted">A past mistake answered correctly drops off your Mistakes list.</p></header><div id="quiz">' + quizHTML() + '</div>' + back + '</div>';
    }
    if (arg) return missingView();
    var st = todayState(), n = streak(), best = bestStreak(), next = null;
    st.steps.forEach(function (s) { if (!next && !s.done) next = s; });
    return '<div class="wrap page today">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Today' }]) +
      '<header class="page__head"><p class="eyebrow">' + esc(fmtDate(isoToday())) + '</p><h1>Today’s session</h1><p>About 10 minutes a day: a few flashcards, a few quiz questions and one skill drill round. Finish all three steps and the day counts toward your streak.</p></header>' +
      '<div class="stats"><div class="card stat"><strong>' + n + '</strong><span>' + (n === 1 ? 'day' : 'days') + ' in a row</span></div><div class="card stat"><strong>' + best + '</strong><span>best streak</span></div><div class="card stat"><strong>' + (st.steps.length - st.left) + ' / ' + st.steps.length + '</strong><span>steps done today</span></div></div>' +
      weekStrip() +
      (st.done ? '<div class="callout callout--good"><p class="callout__title">Session complete</p><p>All three steps are done for today. Come back tomorrow to keep the streak going, or keep practicing below.</p></div>' : '') +
      '<ol class="today__steps">' + st.steps.map(function (s, i) {
        var skip = !s.need;
        return '<li class="card today__step' + (s.done ? ' is-done' : '') + '"><span class="today__n" aria-hidden="true">' + (s.done ? '✓' : i + 1) + '</span><div class="today__body"><h2>' + esc(s.title) + '</h2><p>' + esc(s.what) + '</p>' +
          '<p class="today__prog">' + (skip ? 'Nothing to do' : Math.min(s.have, s.need) + ' of ' + s.need + (s.done ? ' · done' : '')) + '</p></div>' +
          (skip ? '' : '<a class="btn' + (next === s ? ' btn--solid' : '') + '" href="' + esc(s.href) + '">' + (s.done ? 'Do more' : s.have ? 'Continue' : 'Start') + '</a>') + '</li>';
      }).join('') + '</ol>' +
      '<h2>Extra, if you have time</h2><p class="drill__acts"><a class="btn" href="#/write">Write a response' + (st.act.w ? ' (' + st.act.w + ' today)' : '') + '</a> <a class="btn" href="#/review">More flashcards</a> <a class="btn" href="#/exam">Exam</a></p></div>';
  };
  AFTER.today = function (arg) { if (arg === 'cards') wirePlayer(); else if (arg === 'quiz') wireQuiz(); };

  /* --- PROGRESS (v1.13.0): weak spots first. Reads what the app already saves: SRS (cards), qstat (quiz answers, logged from
     v1.12.0), drills and write. Nothing new is stored. A topic needs a little evidence before it is ranked (PG_MIN). --- */
  var PG_MIN = { quiz: 3, cards: 3, write: 2 }, PG_WEAK = 80;
  function shortTitle(c) { return c.title.split(':')[0]; }
  function progressTopics() {
    var out = [];
    CHAPTERS.forEach(function (c) {
      var r = 0, w = 0;
      c.quiz.forEach(function (q) { var s = QSTAT[quizKey(c, q)]; if (s) { r += s[0]; w += s[1]; } });
      out.push({ kind: 'quiz', ch: c, label: 'Chapter ' + c.id + ' quiz', sub: shortTitle(c), n: r + w, pct: r + w >= PG_MIN.quiz ? Math.round(100 * r / (r + w)) : null,
        detail: r + w ? r + ' of ' + (r + w) + ' answers right' : 'No answers yet', href: '#/c/' + c.id + '/quiz', go: 'Take the quiz' });
      var seen = 0, shaky = 0, tags = {};
      c.cards.forEach(function (k) { var key = cardKey(c, k); if (SRS[key]) { seen++; if (isShaky(key)) { shaky++; if (k.tag) tags[k.tag] = (tags[k.tag] || 0) + 1; } } });
      var tl = Object.keys(tags).sort(function (a, b) { return tags[b] - tags[a]; }).slice(0, 4);
      out.push({ kind: 'cards', ch: c, label: 'Chapter ' + c.id + ' flashcards', sub: shortTitle(c), n: seen, shaky: shaky, pct: seen >= PG_MIN.cards ? Math.round(100 * (seen - shaky) / seen) : null,
        detail: seen ? (shaky ? plural(shaky, 'shaky card', 'shaky cards') + ' of ' + seen + ' seen' + (tl.length ? ': ' + tl.join(', ') : '') : 'No shaky cards among ' + seen + ' seen') : 'No cards rated yet',
        href: shaky ? '#/c/' + c.id + '/cards/shaky' : '#/c/' + c.id + '/cards', go: shaky ? 'Study shaky cards' : 'Open flashcards' });
    });
    var ds = drillStats();
    DRILLS.forEach(function (d) {
      var s = ds[d.id];
      out.push({ kind: 'drill', label: d.title, sub: 'Skill drill', n: s ? s.n : 0, pct: s ? Math.round(100 * s.last.score / s.last.total) : null,
        detail: s ? 'Last round ' + s.last.score + '/' + s.last.total + ' · best ' + s.best.score + '/' + s.best.total : 'Not tried yet', href: '#/drills/' + d.id, go: 'Do a round' });
    });
    WRITES.forEach(function (w) {
      var m = writeSummary(w);
      out.push({ kind: 'write', label: w.title, sub: 'Write a response', n: m.tried, pct: m.tried >= PG_MIN.write ? Math.round(100 * m.got / m.tried) : null,
        detail: m.tried ? 'Got the idea on ' + m.got + ' of ' + m.tried + ' tried (your own rating)' : 'Not tried yet', href: '#/write/' + w.id, go: 'Practice' });
    });
    return out;
  }
  window.MI_PROGRESS = progressTopics;   // for QA
  function meter(pct) { return pct === null ? '<span class="meter meter--none"><span class="meter__n">—</span></span>' : '<span class="meter"><span class="meter__track"><span style="width:' + pct + '%"></span></span><span class="meter__n">' + pct + '%</span></span>'; }
  function topicRow(x, withSub) {
    return '<li class="card topic"><div class="topic__body"><p class="topic__label">' + esc(x.label) + (withSub ? ' <span class="muted">· ' + esc(x.sub) + '</span>' : '') + '</p><p class="topic__detail">' + esc(x.detail) + '</p></div>' + meter(x.pct) + '<a class="btn" href="' + esc(x.href) + '">' + esc(x.go) + '</a></li>';
  }
  TITLES.progress = 'Progress';
  VIEWS.progress = function () {
    var T = progressTopics(), ranked = T.filter(function (x) { return x.pct !== null && x.pct < PG_WEAK; }).sort(function (a, b) { return a.pct - b.pct || b.n - a.n; });
    var all = allCards(), seen = all.filter(function (x) { return SRS[x.key]; }).length, mastered = all.filter(function (x) { return cardStatus(x.key) === 'Mastered'; }).length, r = 0, w = 0;
    Object.keys(QSTAT).forEach(function (k) { r += QSTAT[k][0]; w += QSTAT[k][1]; });
    var any = T.some(function (x) { return x.n > 0; });
    var group = function (title, kinds, sub, note) {
      var rows = T.filter(function (x) { return kinds.indexOf(x.kind) >= 0; });
      return '<h2>' + title + '</h2>' + (note ? '<p class="muted">' + note + '</p>' : '') + '<ul class="topics">' + rows.map(function (x) { return topicRow(x, sub); }).join('') + '</ul>';
    };
    return '<div class="wrap page progress">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Progress' }]) +
      '<header class="page__head"><h1>Progress</h1><p>Where you are strong and where to study next, from the flashcard ratings, quiz answers, drill rounds and self-ratings saved on this device.</p></header>' +
      '<div class="stats"><div class="card stat"><strong>' + seen + ' / ' + all.length + '</strong><span>cards seen</span></div><div class="card stat"><strong>' + mastered + '</strong><span>cards mastered</span></div>' +
        '<div class="card stat"><strong>' + (r + w ? Math.round(100 * r / (r + w)) + '%' : '—') + '</strong><span>quiz answers right (' + (r + w) + ')</span></div><div class="card stat"><strong>' + streak() + '</strong><span>days in a row</span></div></div>' +
      '<h2>Study these next</h2>' +
      (ranked.length ? '<p class="muted">Your weakest areas first (below ' + PG_WEAK + '%).</p><ul class="topics topics--weak">' + ranked.slice(0, 5).map(function (x) { return topicRow(x, true); }).join('') + '</ul>'
        : '<div class="empty"><h2>' + (any ? 'No weak spots right now' : 'Nothing to show yet') + '</h2><p>' + (any ? 'Every area with enough answers is at ' + PG_WEAK + '% or better. Keep going with today’s session.' : 'Do today’s session and this page will start to fill in.') + '</p><p><a class="btn btn--solid" href="#/today">Today’s session</a></p></div>') +
      group('Quizzes by chapter', ['quiz'], true, 'Quiz answers are counted from version 1.12.0 on. A chapter is rated after ' + PG_MIN.quiz + ' answers.') +
      group('Flashcards by chapter', ['cards'], true, 'A card is shaky if you rated it Again or Hard and have not mastered it yet. The percent is the share of seen cards that are not shaky.') +
      group('Skills', ['drill', 'write'], true, 'Drills show your last round. Write a response uses your own ratings.') + '</div>';
  };

  /* --- POCKET CARDS (v1.14.0): one-screen summaries for use on duty. Each card names where its blocks live in the chapter data
     (no text is copied): part = { ch, sec, h3: 'heading starts with' (optional: only the blocks under that h3), types: [block types],
     n: how many to take, cols: [table columns to keep], items: [list items to keep] }. A part that is not found is left out, and a
     card with no parts is not shown. Pins are kept in mt:v1:pocket (array of ids). --- */
  var POCKET_SPEC = [
    { id: 'spirit', group: 'Core skills', title: 'Spirit of MI (PACE)', parts: [{ ch: 3, sec: 'spirit', types: ['table'], n: 1 }, { ch: 3, sec: 'spirit', h3: 'The four components of acceptance', types: ['h3', 'ul'], n: 2 }] },
    { id: 'oars', group: 'Core skills', title: 'OARS', parts: [{ ch: 3, sec: 'oars', types: ['p'], n: 1 }, { ch: 3, sec: 'oars', h3: 'Affirming', types: ['ul'], n: 1, items: [0, 1, 2] }, { ch: 3, sec: 'reflective', h3: 'Forming a complex reflection', types: ['note'], n: 1 }] },
    { id: 'reflections', group: 'Core skills', title: 'Types of reflection', parts: [{ ch: 3, sec: 'reflective', h3: 'Exhibit 3.6', types: ['table'], n: 1, cols: [0, 1, 2] }] },
    { id: 'summaries', group: 'Core skills', title: 'Types of summary', parts: [{ ch: 3, sec: 'summarizing', types: ['table'], n: 1 }] },
    { id: 'roadblocks', group: 'Core skills', title: 'Gordon’s 12 roadblocks', parts: [{ ch: 3, sec: 'reflective', h3: 'Exhibit 3.5', types: ['table'], n: 1 }] },
    { id: 'traps', group: 'Core skills', title: 'Traps to avoid', parts: [{ ch: 3, sec: 'engaging', h3: 'Avoiding traps', types: ['table'], n: 1, cols: [0, 2] }] },
    { id: 'darncat', group: 'Change talk', title: 'DARN-CAT', parts: [{ ch: 3, sec: 'ambivalence', h3: 'DARN-CAT', types: ['table'], n: 1 }] },
    { id: 'evoke', group: 'Change talk', title: 'Questions that evoke change talk', parts: [{ ch: 3, sec: 'evoking', h3: 'Exhibit 3.8', types: ['table'], n: 1 }] },
    { id: 'rulers', group: 'Change talk', title: 'Importance and Confidence Rulers', parts: [{ ch: 3, sec: 'evoking', h3: 'Exhibit 3.9', types: ['h3', 'ul'], n: 2 }, { ch: 3, sec: 'confidence', h3: 'Evoking confidence talk', types: ['ul'], n: 1, items: [0] }] },
    { id: 'sustain', group: 'Change talk', title: 'Responding to sustain talk', parts: [{ ch: 3, sec: 'sustain-talk', types: ['table'], n: 1, cols: [0, 1] }] },
    { id: 'epe', group: 'Change talk', title: 'Elicit-Provide-Elicit', parts: [{ ch: 3, sec: 'discrepancy', types: ['table'], n: 1 }] },
    { id: 'readiness', group: 'Change talk', title: 'Signs of readiness to change', parts: [{ ch: 3, sec: 'confidence', h3: 'Recognizing signs of readiness', types: ['table'], n: 1 }] },
    { id: 'frames', group: 'Stages and brief intervention', title: 'FRAMES', parts: [{ ch: 2, sec: 'elements', h3: 'FRAMES', types: ['table'], n: 1 }] },
    { id: 'stages', group: 'Stages and brief intervention', title: 'Counselor focus at each stage', stages: true },
    { id: 'five-rs', group: 'Stages and brief intervention', title: 'Precontemplation: the 5 Rs', parts: [{ ch: 4, sec: 'assess', h3: 'Exhibit 4.2', types: ['table'], n: 1 }] },
    { id: 'balance', group: 'Stages and brief intervention', title: 'Decisional Balance Sheet', parts: [{ ch: 5, sec: 'db', h3: 'Exhibit 5.3', types: ['table'], n: 1 }] },
    { id: 'plan', group: 'Stages and brief intervention', title: 'Change Plan Worksheet', parts: [{ ch: 6, sec: 'plan', h3: 'Exhibit 6.3', types: ['ol'], n: 1 }] },
    { id: 'triggers', group: 'Stages and brief intervention', title: 'Triggers and coping strategies', parts: [{ ch: 7, sec: 'triggers', h3: 'Exhibit 7.3', types: ['table'], n: 1 }] },
    { id: 'ctraps', group: 'Stages and brief intervention', title: 'C-TRAPS (relapse prevention)', parts: [{ ch: 7, sec: 'ctraps', types: ['table'], n: 1 }] },
    { id: 'respect', group: 'Stages and brief intervention', title: 'RESPECT (cultural responsiveness)', parts: [{ ch: 2, sec: 'culture', h3: 'Exhibit 2.4', types: ['table'], n: 1 }] }
  ];
  function pocketPart(pt) {
    var c = chapter(pt.ch), sec = null, out = [];
    if (c) c.sections.forEach(function (s) { if (s.id === pt.sec) sec = s; });
    if (!sec) return out;
    var on = !pt.h3;
    for (var i = 0; i < sec.blocks.length && out.length < pt.n; i++) {
      var b = sec.blocks[i];
      if (b.t === 'h3') { var hit = !!pt.h3 && b.x.indexOf(pt.h3) === 0; if (pt.h3 && on && !hit) break; if (hit) on = true; }
      if (!on || pt.types.indexOf(b.t) < 0) continue;
      if (b.t === 'table' && pt.cols) b = { t: 'table', head: pt.cols.map(function (k) { return b.head[k]; }), rows: b.rows.map(function (r) { return pt.cols.map(function (k) { return r[k]; }); }) };
      else if (b.items && pt.items) b = { t: b.t, items: pt.items.map(function (k) { return b.items[k]; }).filter(Boolean) };
      out.push(b);
    }
    return out;
  }
  function buildPocket() {
    return POCKET_SPEC.map(function (s) {
      var blocks = [], src = [];
      if (s.stages) {
        var rows = stageRows();
        if (rows.length) { blocks.push({ t: 'table', head: ['Stage', 'Counselor focus'], rows: rows.map(function (r) { return [r.stage, r.focus]; }) }); src = ['Chapters 4 to 7']; }
      } else s.parts.forEach(function (pt) {
        var got = pocketPart(pt); blocks = blocks.concat(got);
        if (got.length && src.indexOf('Chapter ' + pt.ch) < 0) src.push('Chapter ' + pt.ch);
      });
      return { id: s.id, group: s.group, title: s.title, blocks: blocks, src: src.join(' and '), href: s.stages ? '#/stages' : '#/c/' + s.parts[0].ch + '/guide', hrefLabel: s.stages ? 'Stage by stage' : 'Chapter ' + s.parts[0].ch + ' study guide' };
    }).filter(function (c) { return c.blocks.length; });
  }
  var POCKET = buildPocket(), POCKET_BY_ID = {};
  POCKET.forEach(function (c) { POCKET_BY_ID[c.id] = c; });
  window.MI_POCKET = POCKET;   // for QA
  function pocketPins() { var p = store.get('pocket', []); return Array.isArray(p) ? p.filter(function (id) { return POCKET_BY_ID[id]; }) : []; }
  function pocketOrder() {   // pinned first (in pin order), then the rest in their groups
    var pins = pocketPins();
    return pins.map(function (id) { return POCKET_BY_ID[id]; }).concat(POCKET.filter(function (c) { return pins.indexOf(c.id) < 0; }));
  }
  TITLES.pocket = 'Pocket cards';
  VIEWS.pocket = function (id) {
    var pins = pocketPins();
    if (!id) {
      var groups = [], seen = {};
      POCKET.forEach(function (c) { if (!seen[c.group]) { seen[c.group] = true; groups.push(c.group); } });
      var link = function (c) { return '<li><a class="card pcard" href="#/pocket/' + c.id + '"><span class="pcard__t">' + esc(c.title) + '</span><span class="pcard__s">' + esc(c.src) + (pins.indexOf(c.id) >= 0 ? ' · pinned' : '') + '</span></a></li>'; };
      return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Pocket cards' }]) +
        '<header class="page__head"><p class="eyebrow">Reference</p><h1>Pocket cards</h1><p>Short summaries to glance at on duty: the tables and lists from TIP 35 you reach for most. Pin the ones you use so they stay on top.</p></header>' +
        (pins.length ? '<h2>Pinned</h2><ul class="pcards">' + pins.map(function (p) { return link(POCKET_BY_ID[p]); }).join('') + '</ul>' : '') +
        groups.map(function (g) { return '<h2>' + esc(g) + '</h2><ul class="pcards">' + POCKET.filter(function (c) { return c.group === g; }).map(link).join('') + '</ul>'; }).join('') + '</div>';
    }
    var c = POCKET_BY_ID[id];
    if (!c) return missingView();
    var order = pocketOrder(), i = order.indexOf(c), prev = order[(i + order.length - 1) % order.length], next = order[(i + 1) % order.length], pinned = pins.indexOf(c.id) >= 0;
    return '<div class="wrap page pocket">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Pocket cards', href: '#/pocket' }, { label: c.title }]) +
      '<header class="page__head"><p class="eyebrow">' + esc(c.group) + ' · ' + esc(c.src) + '</p><h1>' + esc(c.title) + '</h1></header>' +
      '<div class="pocket__body prose">' + renderBlocks(c.blocks) + '</div>' +
      '<p class="drill__acts"><button type="button" class="btn' + (pinned ? '' : ' btn--solid') + '" data-pin="' + c.id + '" aria-pressed="' + pinned + '">' + (pinned ? 'Unpin' : 'Pin this card') + '</button> <a class="btn" href="' + esc(c.href) + '">' + esc(c.hrefLabel) + ' →</a></p>' +
      '<nav class="pocket__nav" aria-label="Other pocket cards"><a class="btn" href="#/pocket/' + prev.id + '">← ' + esc(prev.title) + '</a><a class="btn" href="#/pocket/' + next.id + '">' + esc(next.title) + ' →</a></nav></div>';
  };
  main.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-pin]') : null; if (!b) return;
    var id = b.getAttribute('data-pin'), pins = pocketPins(), k = pins.indexOf(id);
    if (k >= 0) pins.splice(k, 1); else pins.push(id);
    store.set('pocket', pins); route({ keepScroll: true });
    var again = main.querySelector('[data-pin]'); if (again) again.focus({ preventScroll: true });
  });

  VIEWS.resources = function () {
    return '<div class="wrap page">' + crumb([{ label: 'Home', href: '#/' }, { label: 'Resources' }]) +
      '<header class="page__head"><p class="eyebrow">Appendix C</p><h1>Resources</h1><p>Websites, manuals and related TIPs that TIP 35 lists for learning, practicing and supervising MI.</p></header>' +
      '<div class="callout callout--note"><p class="callout__title">Online only</p><p>These links open outside websites and need an internet connection. TIP 35 printed them in 2019; addresses that had moved were updated to the current official page in November 2026.</p></div>' +
      RESOURCES.map(function (g) {
        return '<section class="guide__sec"><h2>' + esc(g.group) + '</h2><div class="res__list">' + g.items.map(function (r) {
          return '<div class="card res"><h3>' + esc(r.name) + '</h3><p>' + esc(r.desc) + '</p><p class="res__links">' + r.links.map(function (l) { return extLink(l[1], l[0]); }).join('') + '</p></div>';
        }).join('') + '</div></section>';
      }).join('') + '</div>';
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
  TOOLS.forEach(function (x) {
    var text = x.name + ' ' + x.about.map(function (b) { return b.x ? stripTags(b.x) : b.items ? b.items.map(stripTags).join(' ') : ''; }).join(' ') + ' ' + (x.status === 'pd' ? x.items.map(function (it) { return it.q; }).join(' ') : '');
    SEARCH_INDEX.push({ title: x.short + ' — ' + x.name, text: text, href: '#/tools/' + x.id, kind: 'Tool' });
    if (SCORERS[x.id]) SEARCH_INDEX.push({ title: x.short + ' — practice scoring', text: 'practice scoring score total interpretation feedback ' + x.name, href: '#/tools/' + x.id + '/practice', kind: 'Tool' });
    if (x.id === 'mikt') SEARCH_INDEX.push({ title: 'MI Knowledge Test — self-test', text: 'self-test quiz MI knowledge test answer key score', href: '#/tools/mikt/test', kind: 'Tool' });
  });
  stageRows().forEach(function (r) { SEARCH_INDEX.push({ title: r.stage + ' — stage by stage', text: 'stages of change strategies ' + stripTags(r.motivation + ' ' + r.focus + ' ' + r.strategies), href: '#/stages', kind: 'Stages' }); });
  DRILLS.forEach(function (d) { SEARCH_INDEX.push({ title: d.title + ' — skill drill', text: 'skill drills practice ' + d.blurb + ' ' + d.src + ' ' + (d.choices || []).join(' '), href: '#/drills/' + d.id, kind: 'Drill' }); });
  WRITES.forEach(function (w) { SEARCH_INDEX.push({ title: w.title + ' — write a response', text: 'write your own response practice typing ' + w.blurb + ' ' + w.src, href: '#/write/' + w.id, kind: 'Practice' }); });
  SEARCH_INDEX.push({ title: 'Today’s session', text: 'daily session streak days in a row flashcards quiz questions skill drill 10 minutes', href: '#/today', kind: 'Practice' });
  SEARCH_INDEX.push({ title: 'Progress', text: 'progress weak spots weakest areas accuracy by topic shaky cards study these next', href: '#/progress', kind: 'Practice' });
  POCKET.forEach(function (c) { SEARCH_INDEX.push({ title: c.title + ' — pocket card', text: 'pocket card quick reference summary ' + c.group + ' ' + c.src, href: '#/pocket/' + c.id, kind: 'Pocket card' }); });
  RESOURCES.forEach(function (g) { g.items.forEach(function (r) { SEARCH_INDEX.push({ title: r.name, text: r.desc, href: '#/resources', kind: 'Resource' }); }); });
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
    if (!PR_ROUTE.test(location.hash)) PR = null;   // practice answers are dropped when you leave the page
    if (location.hash.indexOf('#/write/') !== 0) wr = null;   // typed responses are never stored and are dropped when you leave
    ensurePlan();
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
    else if (n === 'practiceSave') store.set('practiceSave', v === 'on');
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
