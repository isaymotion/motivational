"""QA for the Tools (Appendix B) and Resources (Appendix C) pages, added in v1.8.0.

Usage: python3 -I tools/tools_qa.py <repo>      -> last line "TOOLS FAILS: 0"
Checks at 390x844 (phone) and 1280x900: every #/tools/<id> renders its h1, public-domain tools show
exactly their item count (all <details> opened), restricted tools show no items, no sideways overflow,
no JS errors; #/tools lists every tool; #/resources renders; chapter guides link their tools;
glossary entries and the tap-to-define sheet link to tool pages; search finds tool items.
v1.9.0 adds: known-answer scoring tests for every practice scorer (window.MI_SCORE) and the MI Knowledge
Test self-test (window.MI_MIKT), every practice page at 390 and 1280 (no overflow, no JS errors), and the
privacy flow: saving off -> nothing under mt:v1:practice.*, on -> stored, in the backup export, deletable,
answers cleared on leaving the page.
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

    # ---------- v1.9.0 practice scoring ----------
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs2 = []
    pg.on('pageerror', lambda e: errs2.append(str(e)))
    pg.on('dialog', lambda d: d.accept())
    pg.goto(BASE + '#/tools'); pg.wait_for_timeout(500)
    def S(tid, ans, opts=None):
        return pg.evaluate('([t,a,o]) => window.MI_SCORE(t, a, o)', [tid, ans, opts or {}])
    def rng(a, b_, v): return {str(i): v for i in range(a, b_ + 1)}
    # AUDIT (max 46). Zones: women 0-6 I / 7-15 II, men 0-7 I / 8-15 II, 16-24 III, 25+ IV
    r = S('audit', {'1': 6, '2': 6, '3': 6, '4': 4, '5': 4, '6': 4, '7': 4, '8': 4, '9': 4, '10': 4})
    check(r['missing'] == 0 and r['scores']['total'] == 46 and r['scores']['zone'] == 'Zone IV', 'AUDIT all-max = 46, Zone IV', r)
    r = S('audit', {'1': 0, '9': 0, '10': 0})
    check(r['missing'] == 0 and r['scores']['total'] == 0 and r['scores']['zone'] == 'Zone I', 'AUDIT Never: Q2-8 skipped, total 0, Zone I', r)
    seven = {'1': 2, '2': 1, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 4, '10': 0}
    rw, rm = S('audit', seven, {'sex': 'w'}), S('audit', seven, {'sex': 'm'})
    check(rw['scores']['total'] == 7 and rw['scores']['zone'] == 'Zone II' and rm['scores']['zone'] == 'Zone I', 'AUDIT total 7: women Zone II, men Zone I', [rw, rm])
    r = S('audit', {'1': 4, '2': 2, '3': 3, '4': 1, '5': 0, '6': 0, '7': 2, '8': 1, '9': 0, '10': 2})
    check(r['scores']['total'] == 15 and r['scores']['zone'] == 'Zone II', 'AUDIT mixed = 15, Zone II', r)
    check(S('audit', {'1': 3})['missing'] == 9, 'AUDIT incomplete reports 9 missing')
    # DrInC
    r = S('drinc', rng(1, 50, 1))['scores']
    check(r['total'] == 45 and r['Physical'] == 8 and r['Interpersonal'] == 10 and r['Intrapersonal'] == 8 and r['Impulse Control'] == 12 and r['Social Responsibility'] == 7 and r['Control Scale'] == 5, 'DrInC all-yes: 8/10/8/12/7, total 45, Control 5', r)
    r = S('drinc', rng(1, 50, 0))['scores']
    check(r['total'] == 0 and r['Control Scale'] == 0, 'DrInC all-no: total 0, Control 0', r)
    a = rng(1, 50, 0); a.update(rng(1, 10, 1)); r = S('drinc', a)['scores']
    check(r['total'] == 9 and r['Physical'] == 2 and r['Interpersonal'] == 2 and r['Intrapersonal'] == 1 and r['Impulse Control'] == 2 and r['Social Responsibility'] == 2 and r['Control Scale'] == 1, 'DrInC items 1-10 yes: 2/2/1/2/2, total 9, Control 1', r)
    # SOCRATES (8A and 8D share the key)
    for tid in ('socrates8a', 'socrates8d'):
        r = S(tid, rng(1, 19, 5))['scores']
        check(r['Re'] == {'raw': 35, 'decile': '70 (High)'} and r['Am'] == {'raw': 20, 'decile': '90 (Very High)'} and r['Ts'] == {'raw': 40, 'decile': '90 (Very High)'}, f'{tid} all-5: Re 35 (70), Am 20 (90), Ts 40 (90)', r)
        r = S(tid, rng(1, 19, 1))['scores']
        check(r['Re']['raw'] == 7 and r['Am']['raw'] == 4 and r['Ts']['raw'] == 8 and all(r[k]['decile'] == '10 (Very Low)' for k in ('Re', 'Am', 'Ts')), f'{tid} all-1: 7/4/8, all decile 10', r)
        r = S(tid, rng(1, 19, 4))['scores']
        check(r['Re'] == {'raw': 28, 'decile': '20'} and r['Am'] == {'raw': 16, 'decile': '60'} and r['Ts'] == {'raw': 32, 'decile': '40'}, f'{tid} all-4: Re 28 (20), Am 16 (60), Ts 32 (40)', r)
    # URICA
    r = S('urica', rng(1, 32, 3))['scores']
    check(all(v == 24 for v in r.values()) and len(r) == 4, 'URICA all-3: each subscale 24', r)
    a = rng(1, 32, 1); a.update({str(n): 5 for n in (2, 4, 8, 12, 15, 19, 21, 24)}); r = S('urica', a)
    check(r['scores']['Contemplation'] == 40 and r['scores']['Precontemplation'] == 8 and 'highest: Contemplation' in r['summary'], 'URICA Contemplation items 5, rest 1: C 40, others 8', r)
    # Decisional balance
    pros = (2, 4, 7, 9, 11, 14, 16, 17, 19, 20)
    for tid in ('alcdb', 'drugdb'):
        a = {str(n): (5 if n in pros else 1) for n in range(1, 21)}
        check(S(tid, a)['scores'] == {'pros': 5, 'cons': 1, 'difference': 4}, f'{tid} pros 5 / cons 1: difference +4.00')
        a = {str(n): (2 if n in pros else 4) for n in range(1, 21)}
        check(S(tid, a)['scores'] == {'pros': 2, 'cons': 4, 'difference': -2}, f'{tid} pros 2 / cons 4: difference -2.00')
    # BSCQ (no total; 1-3 lowest, ties shown)
    r = S('bscq', {str(i + 1): v for i, v in enumerate([30, 80, 55, 10, 30, 90, 100, 20])})['scores']
    check(r['lowest'] == ['Testing control over my use of alcohol or drugs', 'Pleasant times with others', 'Unpleasant emotions', 'Urges and temptations'], 'BSCQ lowest: 10%, 20%, tied 30%s', r)
    r = S('bscq', {str(i + 1): v for i, v in enumerate([90, 0, 90, 90, 90, 90, 90, 90])})['scores']
    check(r['lowest'][:1] == ['Physical discomfort'], 'BSCQ single low situation listed first', r)
    # AASES: overall mean of the 20 items only (printed key fits 12 items; no subscales)
    r = S('aases', rng(1, 20, 3))['scores']
    check(r == {'mean': 3, 'lowest': list(range(1, 21))} or r['mean'] == 3, 'AASES all-3: mean 3.00', r)
    a = rng(1, 20, 4); a.update(rng(1, 10, 2)); r = S('aases', a)['scores']
    check(r['mean'] == 3 and r['lowest'] == list(range(1, 11)), 'AASES items 1-10 = 2, rest 4: mean 3.00, 10 low situations', r)
    # MI Knowledge Test: Q18 not scored, out of 21
    key = pg.evaluate("Object.fromEntries(window.MI_TOOLS.find(t=>t.id==='mikt').items.map(i=>[i.n,i.answer]))")
    allright = dict(key); allright['18'] = 'a'
    r = pg.evaluate('a => window.MI_MIKT(a)', allright)
    check(r == {'correct': 21, 'of': 21, 'unanswered': 0}, 'MIKT all key answers = 21/21 (Q18 excluded)', r)
    r = pg.evaluate('a => window.MI_MIKT(a)', {str(i): 'a' for i in range(1, 23)})
    check(r['correct'] == 4 and r['of'] == 21, 'MIKT all "a" = 4/21 (Q8, 14, 17, 19)', r)

    # Pages render at both widths
    pids = [t['id'] for t in tools if pg.evaluate('id => !!window.MI_SCORE(id, {})', t['id'])]
    check(sorted(pids) == sorted(['audit', 'drinc', 'socrates8a', 'socrates8d', 'urica', 'alcdb', 'drugdb', 'bscq', 'aases']), 'practice scorers for the 9 scorable public-domain tools', pids)
    for w, h in ((390, 844), (1280, 900)):
        pg.set_viewport_size({'width': w, 'height': h})
        for tid in pids:
            pg.goto(BASE + '#/tools/' + tid); pg.wait_for_timeout(150)
            link = pg.locator(f'#main a[href="#/tools/{tid}/practice"]').count()
            pg.goto(BASE + '#/tools/' + tid + '/practice'); pg.wait_for_timeout(200)
            n = pg.locator('#main .pr__item').count(); ni = len(pg.evaluate('id => window.MI_TOOLS.find(t=>t.id===id).items', tid))
            pg.evaluate("""document.querySelectorAll('.pr__item fieldset').forEach(function(f){var r=f.querySelectorAll('input[type=radio]'); if(r.length){var x=r[r.length-1]; x.checked=true; x.dispatchEvent(new Event('change',{bubbles:true}))}})""")
            pg.evaluate("""document.querySelectorAll('.pr__range input').forEach(function(r){r.value='40';r.dispatchEvent(new Event('input',{bubbles:true}))})""")
            pg.wait_for_timeout(100)
            res = pg.locator('#pr-result').inner_text()
            sw = pg.evaluate('document.documentElement.scrollWidth')
            check(link == 1 and n == ni and 'still to answer' not in res and 'Giving this feedback' in res and sw <= w, f'[{w}] practice {tid}: link, {n} items, result + feedback, width {sw}', res[:120])
        pg.goto(BASE + '#/tools/mikt/test'); pg.wait_for_timeout(200)
        check(pg.locator('#main .pr__item').count() == 22 and pg.locator('#main .mk__ctx').count() == 2 and pg.locator('#pr-i-22 .mk__pre').count() == 1, f'[{w}] MIKT self-test: 22 items, 2 exchanges, Q22 situation')
        pg.evaluate("""a => Object.keys(a).forEach(function(n){var x=document.querySelector('input[name=mk-'+n+'][value='+a[n]+']'); if(x){x.checked=true;x.dispatchEvent(new Event('change',{bubbles:true}))}})""", key)
        pg.locator('#mk-check').click(); pg.wait_for_timeout(300)
        txt = pg.locator('#pr-result').inner_text()
        check('21' in txt and pg.locator('#main .pr__item.is-right').count() == 21 and pg.locator('#pr-i-18.is-skipped').count() == 1 and pg.locator('#main .pr__term').count() >= 8 and pg.evaluate('document.documentElement.scrollWidth') <= w, f'[{w}] MIKT checked: 21/21, Q18 not scored, term notes shown, no overflow', txt[:100])
    pg.set_viewport_size({'width': 390, 'height': 844})

    # Privacy: saving off -> nothing stored; on -> stored, exported, deletable; answers cleared on leaving
    pg.evaluate("Object.keys(localStorage).filter(k=>k.indexOf('mt:v1:practice')===0).forEach(k=>localStorage.removeItem(k))")
    def pkeys(): return pg.evaluate("Object.keys(localStorage).filter(k=>k.indexOf('mt:v1:practice.')===0)")
    pg.goto(BASE + '#/tools/drinc/practice'); pg.wait_for_timeout(200)
    pg.evaluate("""document.querySelectorAll('.pr__item fieldset').forEach(function(f){var x=f.querySelector('input[type=radio]'); x.checked=true; x.dispatchEvent(new Event('change',{bubbles:true}))})""")
    check(pkeys() == [] and pg.evaluate("localStorage.getItem('mt:v1:practiceSave')") in (None, 'false') and pg.locator('#pr-save').is_hidden(), 'saving off (default): nothing stored, no Save button')
    pg.locator('#pr-save-on').check(); pg.wait_for_timeout(100)
    pg.locator('#pr-save').click(); pg.wait_for_timeout(150)
    saved = pg.evaluate("JSON.parse(localStorage.getItem('mt:v1:practice.drinc')||'[]')")
    check(len(saved) == 1 and saved[0]['scores']['total'] == 0 and set(saved[0]) >= {'date', 'answers', 'scores', 'summary'} and pg.locator('#pr-history li').count() == 1, 'saving on: attempt stored under mt:v1:practice.drinc and listed', saved[:1])
    with pg.expect_download() as dl:
        pg.locator('#bk-export').click()
    data = json.load(open(dl.value.path()))
    check('practice.drinc' in data['data'] and 'practiceSave' in data['data'], 'backup export includes saved attempts and the setting')
    pg.goto(BASE + '#/tools'); pg.wait_for_timeout(150); pg.goto(BASE + '#/tools/drinc/practice'); pg.wait_for_timeout(200)
    check(pg.locator('#pr-progress').inner_text().startswith('0 of 50') and pg.locator('#pr-history li').count() == 1, 'leaving the page clears answers; saved attempt still listed')
    pg.locator('[data-pr-del="0"]').click(); pg.wait_for_timeout(150)
    check(pkeys() == [], 'delete-one removes the attempt')
    pg.goto(BASE + '#/about'); pg.wait_for_timeout(200)
    pg.locator('input[name="practiceSave"][value="off"]').check(); pg.wait_for_timeout(100)
    check(pg.evaluate("localStorage.getItem('mt:v1:practiceSave')") == 'false', 'About setting turns saving off')
    pg.goto(BASE + '#/tools/audit/practice'); pg.wait_for_timeout(200)
    pg.evaluate("""document.querySelectorAll('.pr__item fieldset').forEach(function(f){var x=f.querySelector('input[type=radio]'); x.checked=true; x.dispatchEvent(new Event('change',{bubbles:true}))})""")
    check(pkeys() == [] and pg.locator('#pr-save').is_hidden(), 'saving off again: nothing stored')
    pg.goto(BASE + '#/search/practice%20scoring'); pg.wait_for_timeout(300)
    check(pg.locator('#main a[href="#/tools/audit/practice"]').count() >= 1, 'search "practice scoring" finds the practice pages')
    check(not real_errors(errs2), 'practice: no JS errors', real_errors(errs2))
    pg.close()
    b.close()
srv.shutdown()
print(f'TOOLS FAILS: {len(fails)}')
