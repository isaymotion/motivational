"""QA for the Tools (Appendix B) and Resources (Appendix C) pages, added in v1.8.0.

Usage: python3 -I tools/tools_qa.py <repo>      -> last line "TOOLS FAILS: 0"
Checks at 390x844 (phone) and 1280x900: every #/tools/<id> renders its h1, public-domain tools show
exactly their item count (all <details> opened), restricted tools show no items, no sideways overflow,
no JS errors; #/tools lists every tool; #/resources renders; chapter guides link their tools;
glossary entries and the tap-to-define sheet link to tool pages; search finds tool items.
"""
import functools, http.server, json, sys, threading
from playwright.sync_api import sync_playwright

repo = sys.argv[1]
fails = []
def check(ok, label, extra=''):
    print(('PASS ' if ok else 'FAIL ') + label + (' ' + str(extra) if extra and not ok else ''))
    if not ok: fails.append(label)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8766), functools.partial(Quiet, directory=repo))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8766/'

def real_errors(errs):
    return [e for e in errs if 'fonts.g' not in e and 'ERR_TUNNEL' not in e]

with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((390, 844), (1280, 900)):
        pg = b.new_page(viewport={'width': w, 'height': h})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(BASE + '#/tools'); pg.wait_for_timeout(800)
        tools = pg.evaluate('window.MI_TOOLS.map(function(t){return {id:t.id,status:t.status,n:(t.items||[]).length,name:t.name}})')
        check(len(tools) == 14, f'[{w}] 14 tools in data', len(tools))
        check(pg.locator('#main a.row[href^="#/tools/"]').count() == len(tools), f'[{w}] #/tools lists every tool')
        check(pg.evaluate('document.documentElement.scrollWidth') <= w, f'[{w}] #/tools no overflow')
        for t in tools:
            pg.goto(BASE + '#/tools/' + t['id']); pg.wait_for_timeout(250)
            pg.evaluate("document.querySelectorAll('#main details').forEach(function(d){d.open=true})")
            h1 = pg.locator('#main h1').first.inner_text()
            n = pg.locator('#main .tool__list > li').count()
            sw = pg.evaluate('document.documentElement.scrollWidth')
            ok_items = (n == t['n']) if t['status'] == 'pd' else (n == 0)
            check(h1.strip() == t['name'] and ok_items and sw <= w, f"[{w}] tool {t['id']} ({t['status']}, {n} items, width {sw})", h1)
        pg.goto(BASE + '#/resources'); pg.wait_for_timeout(300)
        check(pg.locator('#main .res').count() >= 10 and pg.evaluate('document.documentElement.scrollWidth') <= w, f'[{w}] #/resources renders, no overflow')
        check(not real_errors(errs), f'[{w}] no JS errors', real_errors(errs))
        pg.close()

    pg = b.new_page(viewport={'width': 390, 'height': 844})
    for ch, tid in ((2, 'audit'), (4, 'urica'), (5, 'alcdb'), (7, 'aases')):
        pg.goto(BASE + f'#/c/{ch}/guide'); pg.wait_for_timeout(300)
        check(pg.locator(f'#main a[href="#/tools/{tid}"]').count() >= 1, f'chapter {ch} guide links #/tools/{tid}')
    pg.goto(BASE + '#/glossary/URICA'); pg.wait_for_timeout(300)
    check(pg.locator('#g-open a[href="#/tools/urica"]').count() == 1, 'glossary URICA links its tool page')
    pg.evaluate("location.hash='#/c/4/guide'"); pg.wait_for_timeout(300)
    btn = pg.locator('#main button.term[data-term="URICA"]').first
    if btn.count():
        btn.scroll_into_view_if_needed(); btn.click(); pg.wait_for_timeout(200)
        a = pg.locator('#term-tool')
        check(a.is_visible() and a.get_attribute('href') == '#/tools/urica', 'tap-to-define sheet links the URICA tool')
    else:
        check(False, 'URICA term button found in Chapter 4')
    pg.goto(BASE + '#/search/hangover'); pg.wait_for_timeout(400)
    check(pg.locator('#main a[href="#/tools/drinc"]').count() >= 1, 'search "hangover" finds DrInC')
    b.close()
srv.shutdown()
print(f'TOOLS FAILS: {len(fails)}')
