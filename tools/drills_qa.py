#!/usr/bin/env python3
"""Skill drills QA (v1.10.0). Usage: python3 -I drills_qa.py <repo> [--dump] [--shots DIR]
Checks: every drill has items with a valid answer index and a why; item text comes from the chapter data;
list + each drill page at 390 and 1280 (no overflow, no JS errors); a full round by click and by keyboard;
result saved under mt:v1:drills and present in the list; retry missed; nav highlight; search finds drills."""
import sys, json, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
repo = sys.argv[1]; dump = '--dump' in sys.argv
shots = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 8771), functools.partial(H, directory=repo))
threading.Thread(target=srv.serve_forever, daemon=True).start()
B = 'http://127.0.0.1:8771/index.html'
fails = 0
def check(ok, msg, extra=''):
    global fails
    print(('PASS ' if ok else 'FAIL ') + msg, extra if (extra and not ok) else '')
    if not ok: fails += 1
EXPECT = {'open': 20, 'talk': 14, 'darncat': 23, 'evoke': 14, 'respond': 13, 'stage': 40}
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((390, 800), (1280, 900)):
        ctx = b.new_context(viewport={'width': w, 'height': h}, service_workers='block')
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(B + '#/drills'); pg.wait_for_selector('.drill__list')
        D = pg.evaluate("window.MI_DRILLS.map(d=>({id:d.id,title:d.title,choices:d.choices||null,items:d.items.map(i=>({pre:i.pre||'',x:i.x,a:i.a,ch:(i.choices||d.choices),why:i.why}))}))")
        if w == 390:
            if dump: print(json.dumps(D, ensure_ascii=False, indent=1))
            check([d['id'] for d in D] == list(EXPECT), 'six drills in order', str([d['id'] for d in D]))
            src = pg.evaluate("JSON.stringify(window.MI_CHAPTERS)")
            src = json.loads(src); flat = json.dumps(src, ensure_ascii=False)
            for d in D:
                n = len(d['items'])
                check(n >= EXPECT[d['id']], f"{d['id']}: {n} items (expect >= {EXPECT[d['id']]})")
                check(all(0 <= i['a'] < len(i['ch']) and i['why'] and i['x'] for i in d['items']), f"{d['id']}: every item has text, a valid answer and a why")
                check(len({(i['pre'], i['x']) for i in d['items']}) == n, f"{d['id']}: no duplicate items")
                bad = [i['x'] for i in d['items'] if json.dumps(i['x'].replace('Counselor: ', '').rstrip('.'), ensure_ascii=False)[1:-1] not in flat]
                check(not bad, f"{d['id']}: item text found in chapter data", str(bad[:3]))
            # spot checks against the book's labels
            g = {d['id']: d for d in D}
            def ans(did, frag):
                it = [i for i in g[did]['items'] if frag in i['x']]; return it[0]['ch'][it[0]['a']] if it else None
            check(ans('open', 'Tell me about your family') == 'Open question', 'known answer: open question')
            check(ans('open', 'How many children') == 'Closed question', 'known answer: closed question')
            check(ans('talk', 'I love how cocaine') == 'Sustain talk', 'known answer: sustain talk')
            check(ans('darncat', 'I swear I will go') == 'Commitment', 'known answer: commitment')
            check(ans('darncat', 'I went to an AA meeting') == 'Taking steps', 'known answer: taking steps')
            check(ans('evoke', 'three best reasons') == 'Reasons', 'known answer: reasons question')
            check(ans('respond', 'Labels aren') == 'Shift in focus', 'known answer: shift in focus')
            check(ans('respond', 'absolutely no negative') == 'Complex: Amplified', 'known answer: amplified reflection')
            check(ans('stage', 'Negotiate a behavioral contract') == 'Preparation', 'known answer: preparation strategy')
            check(ans('stage', 'Create a coping plan') == 'Maintenance', 'known answer: maintenance strategy')
        check(pg.evaluate("document.documentElement.scrollWidth") <= w, f'list: no overflow at {w}')
        check(pg.locator('.card.drill').count() == 6, f'list shows 6 drills at {w}')
        if shots: pg.screenshot(path=f'{shots}/list-{w}.png', full_page=True)
        for d in D:
            pg.goto(B + '#/drills/' + d['id']); pg.wait_for_selector('#drill .choice')
            check(pg.evaluate("document.documentElement.scrollWidth") <= w, f"{d['id']}: no overflow at {w}")
            # play the round: answer first one wrong on purpose, the rest right
            total = pg.evaluate("document.querySelector('#drill .eyebrow').textContent.match(/of (\\d+)/)[1]|0")
            for k in range(total):
                a = pg.evaluate("(()=>{const z=window.MI_DRILLS;return null})()")
                cur = pg.evaluate("""(()=>{const q=document.querySelector('#drill .q-card__q').innerText.trim();return q})()""")
                # find answer from data by rendered text
                idx = pg.evaluate("""(id)=>{const d=window.MI_DRILLS.find(x=>x.id===id);const q=document.querySelector('#drill .q-card__q');const tmp=document.createElement('div');
                  const it=d.items.find(i=>{tmp.innerHTML=i.x;return tmp.textContent.trim()===q.textContent.trim()});return it?it.a:-1}""", d['id'])
                if idx < 0: check(False, f"{d['id']}: could not match shown item", cur); break
                nch = pg.locator('#drill .choice').count()
                pick = (idx + 1) % nch if k == 0 else idx
                if w == 1280 and k % 2:
                    pg.keyboard.press('abcdefg'[pick])
                else:
                    pg.locator('#drill .choice').nth(pick).click()
                pg.wait_for_selector('#drill .verdict')
                v = pg.locator('#drill .verdict').inner_text()
                if (k == 0) != v.startswith('Not quite'): check(False, f"{d['id']}: verdict wrong on item {k}", v); break
                if k == 0:
                    check(pg.locator('#drill .choice.is-correct').count() == 1 and pg.locator('#drill .choice.is-wrong').count() == 1 and len(pg.locator('#drill .why').inner_text()) > 10, f"{d['id']}: feedback shows the right answer and why at {w}")
                    check(pg.evaluate("document.documentElement.scrollWidth") <= w, f"{d['id']}: feedback no overflow at {w}")
                    if shots: pg.screenshot(path=f"{shots}/{d['id']}-{w}.png", full_page=True)
                if w == 1280 and k % 2: pg.keyboard.press('Enter')
                else: pg.locator('#drill [data-dact=next]').click()
            else:
                pg.wait_for_selector('#drill .result-card')
                head = pg.locator('#drill .result-card h2').inner_text()
                check(head.startswith(f'{total - 1} of {total} correct'), f"{d['id']}: result {head!r} at {w}")
                st = json.loads(pg.evaluate("localStorage.getItem('mt:v1:drills')") or '{}')
                check(st.get(d['id'], {}).get('best', {}).get('score') == total - 1 and st[d['id']]['n'] >= 1, f"{d['id']}: result saved under mt:v1:drills at {w}")
                check(pg.evaluate("document.documentElement.scrollWidth") <= w, f"{d['id']}: result no overflow at {w}")
                if shots and d['id'] == 'respond': pg.screenshot(path=f"{shots}/result-{w}.png", full_page=True)
                pg.locator('#drill [data-dact=missed]').click(); pg.wait_for_selector('#drill .choice')
                check('1 of 1' in pg.locator('#drill .eyebrow').first.inner_text().lower(), f"{d['id']}: retry missed gives 1 item at {w}")
        pg.goto(B + '#/drills'); pg.wait_for_selector('.drill__list')
        check(pg.locator('.drill__meta strong').count() == 6, f'list shows a best score for all 6 at {w}')
        check(pg.evaluate("[...document.querySelectorAll('.sidenav a[aria-current], .sidenav a.is-active')].map(a=>a.textContent.trim()).join('|')").startswith('Skill drills'), f'menu highlights Skill drills at {w}')
        pg.goto(B + '#/drills/open'); pg.wait_for_selector('#drill .choice')
        check(pg.evaluate("[...document.querySelectorAll('.sidenav a[aria-current], .sidenav a.is-active')].map(a=>a.textContent.trim()).join('|')").startswith('Skill drills'), f'menu highlights Skill drills on a drill page at {w}')
        pg.goto(B + '#/drills/nope'); pg.wait_for_timeout(200)
        check('drill__list' not in pg.content() and pg.locator('#drill').count() == 0, f'unknown drill id shows the not-found page at {w}')
        pg.goto(B + '#/search/' + 'skill%20drill'); pg.wait_for_timeout(300)
        check('#/drills/' in pg.content(), f'search finds the drills at {w}')
        exp = pg.evaluate("(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('mt:v1:'))o[k]=1}return Object.keys(o)})()")
        check('mt:v1:drills' in exp, f'drill progress uses the app prefix (covered by backup) at {w}')
        check(not errs, f'no JS errors at {w}', str(errs))
        ctx.close()
    b.close()
print('DRILLS FAILS:', fails)
srv.shutdown()
sys.exit(1 if fails else 0)
