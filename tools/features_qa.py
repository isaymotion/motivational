#!/usr/bin/env python3
"""QA for the learning features added from v1.11.0 on. Usage: python3 -I features_qa.py <repo> [--shots DIR] [--only name,...]
One section per feature (write, today, progress, pocket, roleplay, prepost, tagalog); a section is skipped when the app
does not have that feature yet. Each runs at 390 and 1280 and checks overflow and JS errors. Last line: FEATURES FAILS: n"""
import sys, json, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
repo = sys.argv[1]
shots = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 8772), functools.partial(H, directory=repo))
threading.Thread(target=srv.serve_forever, daemon=True).start()
B = 'http://127.0.0.1:8772/index.html'
fails = 0
def check(ok, msg, extra=''):
    global fails
    print(('PASS ' if ok else 'FAIL ') + msg, extra if (extra and not ok) else '')
    if not ok: fails += 1
def go(pg, route, sel=None):
    pg.goto(B + route); pg.wait_for_timeout(250)
    if sel: pg.wait_for_selector(sel)
def no_overflow(pg, w, what): check(pg.evaluate("document.documentElement.scrollWidth") <= w, f'{what}: no overflow at {w}', str(pg.evaluate("document.documentElement.scrollWidth")))
def shot(pg, name, w, full=True):
    if shots: pg.screenshot(path=f'{shots}/{name}-{w}.png', full_page=full)
def ls(pg, key): return pg.evaluate("k => JSON.parse(localStorage.getItem(k))", key)
def has_view(pg, key): return pg.evaluate("k => !!document.querySelector('.sidenav a[href=\"#/' + k + '\"]')", key)
def active(pg): return pg.evaluate("[...document.querySelectorAll('.sidenav .nav-item.is-active')].map(a=>a.textContent.trim().replace(/\\d+$/,''))")

def t_write(pg, w):
    go(pg, '#/write', '.drill__list')
    W = pg.evaluate("window.MI_WRITES.map(s=>({id:s.id,n:s.items.length,items:s.items.map(i=>({x:i.x,model:i.model,hint:i.hint}))}))")
    check([s['id'] for s in W] == ['reflect', 'sustain', 'open'] and [s['n'] for s in W] == [6, 7, 10], 'write: three sets with 6, 7 and 10 prompts', str(W)[:200])
    flat = pg.evaluate("JSON.stringify(window.MI_CHAPTERS)")
    bad = [i['x'] for s in W for i in s['items'] if json.dumps(i['x'], ensure_ascii=False)[1:-1] not in flat or json.dumps(i['model'], ensure_ascii=False)[1:-1] not in flat]
    check(not bad, 'write: every prompt and example comes from the chapter data', str(bad[:2]))
    check(all(i['hint'] and i['model'] and i['x'] != i['model'] for s in W for i in s['items']), 'write: every prompt has a hint and a different example')
    no_overflow(pg, w, 'write list'); shot(pg, 'write-list', w)
    check(active(pg) == ['Write a response'], f'write: menu highlight at {w}', str(active(pg)))
    for s in W:
        go(pg, '#/write/' + s['id'], '#wr-ta')
        no_overflow(pg, w, 'write ' + s['id'])
        check(active(pg) == ['Write a response'], f"write/{s['id']}: menu highlight at {w}")
        for k in range(s['n']):
            pg.fill('#wr-ta', 'My answer <b>%d</b> with a verylongwordthatcannotwrap_%s' % (k, 'x' * 60))
            if k == 0 and s['id'] == 'reflect' and shots: shot(pg, 'write-typing', w)
            if k % 2: pg.press('#wr-ta', 'Control+Enter')
            else: pg.click('[data-wact="show"]')
            pg.wait_for_selector('.write__model')
            mine = pg.inner_text('.write__mine')
            check('<b>' in mine and pg.locator('.write__mine b').count() == 0, f"write/{s['id']} {k}: typed text shown escaped") if k == 0 else None
            no_overflow(pg, w, f"write/{s['id']} compare") if k == 0 else None
            if k == 0 and s['id'] == 'reflect': shot(pg, 'write-compare', w)
            pg.click('[data-wrate="%d"]' % (3 if k % 3 else 1))
        pg.wait_for_selector('#write .result-card')
        st = ls(pg, 'mt:v1:write')
        check(sum(1 for key in st if key.startswith(s['id'] + '/')) == s['n'], f"write/{s['id']}: one self-rating stored per prompt")
        check('My answer' not in json.dumps(pg.evaluate("Object.assign({}, localStorage)")) and 'My answer' not in json.dumps(pg.evaluate("Object.assign({}, sessionStorage)")), f"write/{s['id']}: typed text is not stored anywhere")
        if s['id'] == 'reflect': shot(pg, 'write-result', w)
        missed = len([k for k in range(s['n']) if not k % 3])
        check(pg.locator('[data-wact="redo"]').inner_text().endswith('(%d)' % missed), f"write/{s['id']}: redo offers the {missed} not rated 'Got the idea'")
        pg.click('[data-wact="redo"]'); pg.wait_for_selector('#wr-ta')
        check(pg.inner_text('#write .eyebrow').lower().endswith('of %d' % missed), f"write/{s['id']}: redo round has {missed} prompts")
        pg.fill('#wr-ta', 'SECRET-LEAVE'); go(pg, '#/write', '.drill__list'); go(pg, '#/write/' + s['id'], '#wr-ta')
        check(pg.input_value('#wr-ta') == '', f"write/{s['id']}: text cleared after leaving the page")
    go(pg, '#/write', '.drill__list')
    check(pg.locator('.card.drill strong').count() == 3, f'write: list shows progress for all sets at {w}')
    go(pg, '#/write/nope'); check('not found' in pg.inner_text('#main').lower() or pg.locator('#main .empty').count() > 0, 'write: unknown set shows not-found')
    go(pg, '#/search/write%20a%20reflection'); check(pg.locator('#main a[href="#/write/reflect"]').count() > 0, f'write: search finds it at {w}')
    data = pg.evaluate("Object.keys(localStorage).filter(k=>k.indexOf('mt:v1:')!==0 && k.indexOf('mitrainer')!==0)")
    check(not data, 'write: all keys use the app prefix', str(data))

DAYJS = "(()=>{var d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000)})()"
def t_today(pg, w):
    go(pg, '#/today', '.today__steps')
    plan = ls(pg, 'mt:v1:plan'); day = pg.evaluate(DAYJS)
    check(plan and plan['day'] == day and plan['cards'] == 10 and plan['quiz'] == 5 and plan['drill'] == 'open', 'today: fresh plan is 10 cards, 5 questions, first drill', str(plan))
    check(pg.locator('.today__step').count() == 3 and pg.locator('.today__step.is-done').count() == 0, 'today: three steps, none done')
    check(pg.locator('.today__step .btn--solid').count() == 1 and pg.inner_text('.today__step .btn--solid') == 'Start', 'today: only the next step has the solid button')
    check(active(pg) == ['Today'], f'today: menu highlight at {w}', str(active(pg)))
    no_overflow(pg, w, 'today'); shot(pg, 'today-start', w)
    # step 1: cards
    pg.click('.today__step a[href="#/today/cards"]'); pg.wait_for_selector('#fc')
    check('of 10' in pg.inner_text('.card-nav__pos'), 'today cards: deck of 10')
    no_overflow(pg, w, 'today cards')
    for k in range(10):
        pg.click('[data-act="flip"]'); pg.click('[data-rate="%d"]' % (3 if k % 2 else 4))
    pg.wait_for_selector('#player .result-card')
    check(pg.locator('#player .result-card a[href="#/today"]').count() == 1, 'today cards: result links back to Today')
    check(ls(pg, 'mt:v1:days')[str(day)].get('c') == 10, 'today cards: 10 ratings logged', str(ls(pg, 'mt:v1:days')))
    go(pg, '#/today', '.today__steps')
    check(pg.locator('.today__step.is-done').count() == 1 and pg.inner_text('.today__step .btn--solid') == 'Start', 'today: step 1 done, step 2 is next')
    # step 2: quiz, with one seeded mistake that must come first
    pg.evaluate("localStorage.setItem('mt:v1:mistakes', JSON.stringify({'3/q05': {n: 2, t: 1}}))"); pg.reload(); pg.wait_for_selector('.today__steps')
    q5 = pg.evaluate("window.MI_CHAPTERS.find(c=>c.id===3).quiz.find(q=>q.id==='q05')")
    pg.click('.today__step a[href="#/today/quiz"]'); pg.wait_for_selector('#quiz .choice')
    check(pg.inner_text('.q-card__q').strip() == q5['q'].strip(), 'today quiz: a past mistake comes first')
    check('of 5' in pg.inner_text('#quiz .eyebrow').lower(), 'today quiz: 5 questions')
    right = pg.evaluate("a => [...document.querySelectorAll('#quiz .choice')].findIndex(b => b.textContent.slice(1).trim() === a)", q5['choices'][q5['answer']])
    pg.click('#quiz [data-pick="%d"]' % right); pg.click('[data-qact="next"]')
    for k in range(4):
        pg.click('#quiz [data-pick="0"]'); pg.click('[data-qact="next"]')
    pg.wait_for_selector('#quiz .result-card')
    check('3/q05' not in (ls(pg, 'mt:v1:mistakes') or {}), 'today quiz: the mistake answered right is cleared')
    qs = ls(pg, 'mt:v1:qstat'); d = ls(pg, 'mt:v1:days')[str(day)]
    check(len(qs) == 5 and qs['3/q05'] == [1, 0] and d.get('q') == 5 and d.get('qr', 0) >= 1, 'today quiz: answers logged in qstat and the day', str(d))
    check(pg.locator('#quiz .result-card a[href="#/today"]').count() == 1, 'today quiz: result links back to Today')
    check(not d.get('done'), 'today: not done before the drill')
    # step 3: drill
    go(pg, '#/today', '.today__steps'); pg.click('.today__step a[href="#/drills/open"]'); pg.wait_for_selector('#drill .choice')
    for k in range(10):
        pg.click('#drill [data-dpick="0"]'); pg.click('[data-dact="next"]')
    pg.wait_for_selector('#drill .result-card')
    check(pg.locator('#drill .result-card a[href="#/today"]').count() == 1, 'today drill: result links back to Today')
    d = ls(pg, 'mt:v1:days')[str(day)]
    check(d.get('d') == 1 and d.get('done') == 1, 'today: day marked done after the third step', str(d))
    go(pg, '#/today', '.today__steps')
    check(pg.locator('.today__step.is-done').count() == 3 and pg.locator('.callout--good').count() == 1, 'today: all steps done and the complete note shows')
    check(pg.inner_text('.stats .stat >> nth=0').split()[0] == '1', 'today: streak is 1')
    check(pg.locator('.week__d.is-done.is-today').count() == 1, 'today: week strip marks today done')
    shot(pg, 'today-done', w)
    go(pg, '#/', '.today-strip'); check(pg.locator('.today-strip.is-done').count() == 1 and 'done' in pg.inner_text('.hero .btn').lower(), 'home: strip and button show the session is done')
    no_overflow(pg, w, 'home'); shot(pg, 'home', w, full=False)
    # streak arithmetic with seeded history: 3 days before today done, a gap, then 5 older days done
    pg.evaluate("day => { var D = JSON.parse(localStorage.getItem('mt:v1:days')); [1,2,3,5,6,7,8,9].forEach(i => D[day-i] = {c:1, done:1}); D[day-4] = {c:2}; localStorage.setItem('mt:v1:days', JSON.stringify(D)); }", day)
    pg.reload(); go(pg, '#/today', '.today__steps')
    nums = [pg.inner_text('.stats .stat >> nth=%d' % i).split()[0] for i in range(2)]
    check(nums == ['4', '5'], 'today: streak 4 and best streak 5 from seeded history', str(nums))
    check(pg.locator('.week__d.is-done').count() == 6 and pg.locator('.week__d.is-some').count() == 1, 'today: week strip shows 6 done days and 1 partial')
    # today not finished yet: yesterday's streak still counts
    pg.evaluate("day => { var D = JSON.parse(localStorage.getItem('mt:v1:days')); D[day] = {c:1}; localStorage.setItem('mt:v1:days', JSON.stringify(D)); }", day)
    pg.reload(); go(pg, '#/today', '.today__steps')
    check(pg.inner_text('.stats .stat >> nth=0').split()[0] == '3', 'today: an unfinished today keeps the streak from yesterday')
    # a new day gets a new plan
    pg.evaluate("day => { var P = JSON.parse(localStorage.getItem('mt:v1:plan')); P.day = day - 1; P.cards = 99; localStorage.setItem('mt:v1:plan', JSON.stringify(P)); }", day)
    pg.reload(); go(pg, '#/today', '.today__steps'); plan = ls(pg, 'mt:v1:plan')
    check(plan['day'] == day and plan['cards'] == 10 and plan['drill'] == 'talk', 'today: a new day makes a new plan and rotates the drill', str(plan))
    go(pg, '#/today/nope'); check(pg.locator('.today__steps').count() == 0, 'today: unknown subroute is not the Today page')
    go(pg, '#/search/streak'); check(pg.locator('#main a[href="#/today"]').count() > 0, 'today: search finds it')
    exp = pg.evaluate("Object.keys(localStorage).filter(k=>/^mt:v1:(days|plan|qstat)$/.test(k)).length")
    check(exp == 3, 'today: days, plan and qstat use the app prefix (covered by backup)')

def t_progress(pg, w):
    go(pg, '#/progress', '.progress')
    check('nothing to show yet' in pg.inner_text('.progress .empty').lower(), 'progress: empty state on a fresh device')
    check(pg.locator('.topic').count() == 8 + 8 + 6 + 3, 'progress: a row for every chapter quiz, chapter deck, drill and write set', str(pg.locator('.topic').count()))
    check(active(pg) == ['Progress'], f'progress: menu highlight at {w}', str(active(pg)))
    no_overflow(pg, w, 'progress empty')
    day = pg.evaluate(DAYJS)
    pg.evaluate("""day => {
      var c3 = window.MI_CHAPTERS.find(c => c.id === 3).cards, srs = {};
      c3.slice(0, 5).forEach((k, i) => srs['3/' + k.id] = i < 2 ? {i: 1, e: 2.3, r: 1, l: 1, d: day + 1} : {i: 5, e: 2.5, r: 2, l: 0, d: day + 5});
      srs['3/' + c3[5].id] = {i: 30, e: 2.1, r: 6, l: 2, d: day + 30};
      var S = (k, v) => localStorage.setItem('mt:v1:' + k, JSON.stringify(v));
      S('srs', srs);
      S('qstat', {'4/q01': [1, 2], '4/q02': [0, 1], '5/q01': [2, 0], '5/q02': [2, 0], '6/q01': [1, 0]});
      S('drills', {talk: {n: 2, last: {score: 4, total: 10, date: '2026-11-12'}, best: {score: 9, total: 10, date: '2026-11-11'}}, open: {n: 1, last: {score: 10, total: 10, date: '2026-11-12'}, best: {score: 10, total: 10, date: '2026-11-12'}}});
      S('write', {'reflect/0': {n: 1, r: 3, d: '2026-11-12'}, 'reflect/1': {n: 1, r: 1, d: '2026-11-12'}, 'open/0': {n: 1, r: 1, d: '2026-11-12'}});
    }""", day)
    pg.reload(); go(pg, '#/progress', '.topics--weak')
    weak = pg.evaluate("[...document.querySelectorAll('.topics--weak .topic')].map(li => [li.querySelector('.topic__label').textContent.split(' · ')[0].trim(), li.querySelector('.meter__n').textContent, li.querySelector('a.btn').getAttribute('href')])")
    exp = [['Chapter 4 quiz', '25%', '#/c/4/quiz'], ['Change talk or sustain talk?', '40%', '#/drills/talk'], ['Write a reflection', '50%', '#/write/reflect'], ['Chapter 3 flashcards', '67%', '#/c/3/cards/shaky']]
    check(weak == exp, 'progress: weakest areas ranked with the right percent and link', str(weak))
    T = {x['label']: x for x in pg.evaluate("window.MI_PROGRESS().map(x=>({label:x.label,pct:x.pct,n:x.n,detail:x.detail}))")}
    check(T['Chapter 5 quiz']['pct'] == 100 and T['Chapter 6 quiz']['pct'] is None and T['Open it up']['pct'] is None and T['Open or closed question?']['pct'] == 100, 'progress: strong areas at 100%, thin evidence left unrated')
    check('2 shaky cards of 6 seen' in T['Chapter 3 flashcards']['detail'], 'progress: shaky cards counted (a mastered card with old lapses is not shaky)', T['Chapter 3 flashcards']['detail'])
    stats = [pg.inner_text('.progress .stats .stat >> nth=%d' % i).split('\n')[0] for i in range(3)]
    check(stats[0].startswith('6 /') and stats[1] == '1' and stats[2] == '67%', 'progress: summary numbers', str(stats))
    no_overflow(pg, w, 'progress'); shot(pg, 'progress', w)
    pg.click('.topics--weak a[href="#/c/3/cards/shaky"]'); pg.wait_for_selector('#fc')
    check('of 2' in pg.inner_text('.card-nav__pos') and pg.locator('.filter[aria-pressed="true"]').inner_text().startswith('Shaky'), 'progress: Study shaky cards opens a deck of the 2 shaky cards')
    no_overflow(pg, w, 'shaky filter')
    go(pg, '#/search/weak%20spots'); check(pg.locator('#main a[href="#/progress"]').count() > 0, 'progress: search finds it')

def t_pocket(pg, w):
    go(pg, '#/pocket', '.pcards')
    P = pg.evaluate("window.MI_POCKET.map(c=>({id:c.id,title:c.title,src:c.src,types:c.blocks.map(b=>b.t),rows:c.blocks.map(b=>b.rows?b.rows.length:(b.items?b.items.length:1)),cols:c.blocks.map(b=>b.head?b.head.length:0)}))")
    g = {c['id']: c for c in P}
    check(len(P) == 20 and pg.locator('.pcard').count() == 20, 'pocket: 20 cards, all found in the chapter data', str(len(P)))
    exp = {'spirit': (['table', 'h3', 'ul'], [4, 1, 4]), 'oars': (['p', 'ul', 'note'], [1, 3, 1]), 'reflections': (['table'], [6]), 'roadblocks': (['table'], [12]), 'traps': (['table'], [5]),
           'darncat': (['table'], [7]), 'evoke': (['table'], [4]), 'rulers': (['h3', 'ul', 'ul'], [1, 3, 1]), 'sustain': (['table'], [7]), 'epe': (['table'], [3]), 'readiness': (['table'], [6]),
           'frames': (['table'], [6]), 'stages': (['table'], [6]), 'five-rs': (['table'], [5]), 'balance': (['table'], [2]), 'plan': (['ol'], [7]), 'triggers': (['table'], [4]), 'ctraps': (['table'], [5]), 'respect': (['table'], [7]), 'summaries': (['table'], [5])}
    bad = [k for k, v in exp.items() if (g[k]['types'], g[k]['rows']) != v]
    check(not bad, 'pocket: each card has the expected blocks and row counts', str([(k, g[k]['types'], g[k]['rows']) for k in bad]))
    check(g['reflections']['cols'] == [3] and g['traps']['cols'] == [2] and g['sustain']['cols'] == [2], 'pocket: trimmed tables keep only the chosen columns')
    check(active(pg) == ['Pocket cards'], f'pocket: menu highlight at {w}', str(active(pg)))
    no_overflow(pg, w, 'pocket list'); shot(pg, 'pocket-list', w)
    for c in P:
        go(pg, '#/pocket/' + c['id'], '.pocket__body')
        no_overflow(pg, w, 'pocket ' + c['id'])
        check(pg.inner_text('h1') == c['title'] and len(pg.inner_text('.pocket__body')) > 80, f"pocket/{c['id']}: renders with content")
    go(pg, '#/pocket/oars', '.pocket__body'); shot(pg, 'pocket-oars', w)
    go(pg, '#/pocket/reflections', '.pocket__body'); shot(pg, 'pocket-reflections', w)
    check(active(pg) == ['Pocket cards'], 'pocket card: menu highlight')
    # pin, order and prev/next
    go(pg, '#/pocket/frames', '[data-pin]'); pg.click('[data-pin]'); pg.wait_for_selector('[data-pin][aria-pressed="true"]')
    go(pg, '#/pocket/darncat', '[data-pin]'); pg.click('[data-pin]'); pg.wait_for_selector('[data-pin][aria-pressed="true"]')
    check(ls(pg, 'mt:v1:pocket') == ['frames', 'darncat'], 'pocket: pins stored under the app prefix', str(ls(pg, 'mt:v1:pocket')))
    go(pg, '#/pocket', '.pcards')
    first = pg.evaluate("[...document.querySelectorAll('.pcards')][0].querySelectorAll('.pcard__t').length")
    check(pg.inner_text('#main h2 >> nth=0') == 'Pinned' and first == 2 and pg.locator('.pcard').count() == 22, 'pocket: Pinned group lists the two pinned cards')
    go(pg, '#/pocket/frames', '.pocket__nav')
    nav = pg.evaluate("[...document.querySelectorAll('.pocket__nav a')].map(a=>a.getAttribute('href'))")
    check(nav[1] == '#/pocket/darncat', 'pocket: Next from a pinned card goes to the next pinned card', str(nav))
    pg.click('[data-pin]'); pg.wait_for_selector('[data-pin][aria-pressed="false"]')
    check(ls(pg, 'mt:v1:pocket') == ['darncat'], 'pocket: unpin removes the card')
    go(pg, '#/pocket/nope'); check(pg.locator('.pocket__body').count() == 0, 'pocket: unknown card shows not-found')
    go(pg, '#/search/roadblocks%20pocket'); check(pg.locator('#main a[href="#/pocket/roadblocks"]').count() > 0, 'pocket: search finds a card')

def t_roleplay(pg, w):
    go(pg, '#/roleplay', '.pcards')
    R = pg.evaluate("window.MI_ROLEPLAY.map(s=>({id:s.id,set:s.set,title:s.title,c:s.client.length,k:s.counselor.map(b=>b.t)}))")
    ids = [s['id'] for s in R]
    check(ids == ['pre-%d' % i for i in range(1, 6)] + ['sus-%d' % i for i in range(1, 8)] + ['ref-%d' % i for i in range(1, 5)] + ['cope-%d' % i for i in range(1, 4)], 'roleplay: 19 scenarios in four sets', str(ids))
    g = {s['id']: s for s in R}
    check(g['sus-1']['k'] == ['p', 'p', 'table'] and g['ref-1']['k'] == ['p', 'h3', 'ol', 'note'] and g['cope-1']['k'] == ['p', 'ul', 'note', 'p'] and g['pre-1']['k'] == ['p', 'p'], 'roleplay: counselor cards carry the book blocks', str([g[k]['k'] for k in ('sus-1', 'ref-1', 'cope-1', 'pre-1')]))
    check(pg.locator('.pcard').count() == 19 and active(pg) == ['Role-play'], f'roleplay: list and menu highlight at {w}')
    no_overflow(pg, w, 'roleplay list'); shot(pg, 'rp-list', w)
    for s in R:
        go(pg, '#/roleplay/' + s['id'], '#rp .rp__panel')
        no_overflow(pg, w, 'roleplay ' + s['id'])
        for tab in ('counselor', 'observer'):
            pg.check('input[name="rpTab"][value="%s"]' % tab, force=True); pg.wait_for_timeout(40)
            if pg.evaluate("document.documentElement.scrollWidth") > w: check(False, f"roleplay/{s['id']} {tab}: no overflow at {w}")
    go(pg, '#/roleplay/pre-3', '#rp .rp__panel')
    check('Rebellion' in pg.inner_text('h1') and 'losing control' in pg.inner_text('#rp'), 'roleplay: client card shows the client presentation')
    shot(pg, 'rp-client', w)
    pg.check('input[name="rpTab"][value="counselor"]', force=True)
    check('personal choice and responsibility' in pg.inner_text('#rp'), 'roleplay: counselor card shows the counseling approach')
    pg.check('input[name="rpTab"][value="observer"]', force=True); pg.wait_for_selector('.rp__tally')
    check(pg.locator('.rp__tally li').count() == 9, 'roleplay: observer sheet has 9 counters')
    for key, n in (('oq', 2), ('cq', 1), ('sr', 3), ('cr', 2), ('ct', 4), ('st', 1), ('rb', 2)):
        for _ in range(n): pg.click('[data-rp-inc="%s"]' % key)
    pg.click('[data-rp-dec="rb"]'); pg.click('[data-rp-dec="af"]')
    s = pg.inner_text('#rp-sum')
    check('5 reflections for 3 questions (2 open)' in s and '4 change talk and 1 sustain talk' in s and '1 roadblock' in s and pg.inner_text('#rp-n-af') == '0', 'roleplay: tallies add up and never go below zero', s)
    pg.click('[data-rp="toggle"]'); pg.wait_for_timeout(2300)
    c = pg.inner_text('#rp-clock'); check(c in ('4:58', '4:57'), 'roleplay: timer counts down', c)
    pg.click('[data-rp="toggle"]'); pg.wait_for_timeout(1200); check(pg.inner_text('#rp-clock') == c and pg.inner_text('[data-rp="toggle"]') == 'Resume', 'roleplay: timer pauses')
    no_overflow(pg, w, 'roleplay observer'); shot(pg, 'rp-observer', w)
    pg.click('.rp__what >> nth=2'); pg.wait_for_selector('.pocket__body'); pg.go_back(); pg.wait_for_selector('#rp')
    pg.check('input[name="rpTab"][value="observer"]', force=True); pg.wait_for_selector('.rp__tally')
    check(pg.inner_text('#rp-n-sr') == '3', 'roleplay: tallies survive a look at a pocket card')
    pg.check('input[name="rpMins"][value="3"]', force=True); check(pg.inner_text('#rp-clock') == '3:00', 'roleplay: choosing minutes resets the clock')
    pg.click('[data-rp="clear"]'); check(pg.inner_text('#rp-n-sr') == '0', 'roleplay: Clear the tallies works')
    pg.click('[data-rp-inc="ct"]'); go(pg, '#/roleplay', '.pcards'); go(pg, '#/roleplay/pre-3', '#rp')
    pg.check('input[name="rpTab"][value="observer"]', force=True)
    check(pg.inner_text('#rp-n-ct') == '0', 'roleplay: tallies are cleared after leaving')
    keys = pg.evaluate("Object.keys(localStorage).concat(Object.keys(sessionStorage)).filter(k=>!/hist$/.test(k))")
    check(not [k for k in keys if 'rp' in k.lower() or 'role' in k.lower()], 'roleplay: nothing is stored', str(keys))
    go(pg, '#/roleplay/nope'); check(pg.locator('#rp').count() == 0, 'roleplay: unknown scenario shows not-found')
    go(pg, '#/search/role-play%20observer'); check(pg.locator('#main a[href="#/roleplay"]').count() > 0, 'roleplay: search finds it')

def t_prepost(pg, w):
    pg.on('dialog', lambda d: d.accept())
    go(pg, '#/tools/mikt/test', '#pp')
    check('before' in pg.inner_text('#pp').lower() and pg.locator('#pp [data-pp]').count() == 0, 'prepost: intro card with nothing saved')
    items = pg.evaluate("window.MI_TOOLS.find(t=>t.id==='mikt').items.map(i=>({n:i.n,answer:i.answer,k:i.choices.length}))")
    def take(n_right):
        got = 0
        for it in items:
            if it['n'] == 18: continue
            right = got < n_right
            letter = it['answer'] if right else [l for l in 'abcdef'[:it['k']] if l != it['answer']][0]
            pg.evaluate("s => document.querySelector(s).click()", 'input[name="mk-%d"][value="%s"]' % (it['n'], letter)); got += 1
        pg.evaluate("document.getElementById('mk-check').click()"); pg.wait_for_selector('#pr-result')
    take(10)
    check(pg.locator('[data-pp="before"]').count() == 1 and pg.locator('[data-pp="after"]').count() == 0, 'prepost: only "Save as my Before score" is offered first')
    pg.click('[data-pp="before"]'); pg.wait_for_selector('.pp__rows')
    pp = ls(pg, 'mt:v1:miktPrePost')
    check(pp['before']['correct'] == 10 and pp['before']['of'] == 21 and set(pp['before']) == {'date', 'correct', 'of'} and 'after' not in pp, 'prepost: Before saved as score and date only', str(pp))
    check(ls(pg, 'mt:v1:practice.mikt') is None, 'prepost: no answers are stored (practice saving is off)')
    check('10 / 21' in pg.inner_text('#pp') and 'Saved as your Before score' in pg.inner_text('#pp'), 'prepost: card shows the Before score and a confirmation')
    no_overflow(pg, w, 'prepost before')
    pg.click('#mk-retry'); pg.wait_for_selector('#mk-check'); take(21)
    pg.click('[data-pp="after"]'); pg.wait_for_selector('.pp__delta')
    pp = ls(pg, 'mt:v1:miktPrePost')
    check(pp['after']['correct'] == 21 and pp['before']['correct'] == 10 and '+11' in pg.inner_text('.pp__delta'), 'prepost: After saved and the gain is +11', pg.inner_text('.pp__delta'))
    shot(pg, 'prepost', w, full=False)
    go(pg, '#/progress', '#pp')
    check(pg.locator('#pp .pp__rows li').count() == 2 and pg.locator('#pp a[href="#/tools/mikt/test"]').count() == 1, 'prepost: Progress shows both scores and a link to the test')
    no_overflow(pg, w, 'progress with prepost')
    pg.click('#pp [data-pp="clear"]'); pg.wait_for_timeout(200)
    check(ls(pg, 'mt:v1:miktPrePost') == {} and pg.locator('#pp .pp__rows').count() == 0, 'prepost: Remove these scores clears them')
    # replacing Before starts a new comparison
    pg.evaluate("localStorage.setItem('mt:v1:miktPrePost', JSON.stringify({before:{date:'2026-11-01',correct:5,of:21},after:{date:'2026-11-10',correct:9,of:21}}))")
    pg.reload(); go(pg, '#/tools/mikt/test', '#pp'); take(12)
    pg.click('[data-pp="before"]'); pg.wait_for_timeout(200); pp = ls(pg, 'mt:v1:miktPrePost')
    check(pp['before']['correct'] == 12 and 'after' not in pp, 'prepost: a new Before replaces the old pair', str(pp))
    go(pg, '#/search/pretest'); check(pg.locator('#main a[href="#/tools/mikt/test"]').count() > 0, 'prepost: search finds it')

def t_tagalog(pg, w):
    go(pg, '#/c/3/guide', '.guide')
    T = pg.evaluate("window.MI_TAGALOG")
    if not T: print('SKIP tagalog (not in this version)'); return
    ch = pg.evaluate("window.MI_CHAPTERS.map(c=>c.sections.map(s=>c.id+'/'+s.id)).flat()")
    pocket = pg.evaluate("window.MI_POCKET.map(c=>c.id)"); tools = pg.evaluate("window.MI_TOOLS.map(t=>t.id)")
    bad = [k for k in T['sections'] if k not in ch] + [k for k in T['pocket'] if k not in pocket] + [k for k in T['tools'] if k not in tools]
    bad += [p for m in ('sections', 'pocket', 'tools', 'practice') for v in T[m].values() for p in v if p not in T['pages']]
    check(not bad, 'tagalog: every card points at a real section, pocket card, tool and Usap Tayo page', str(bad))
    n3 = len([k for k in T['sections'] if k.startswith('3/')])
    check(pg.locator('.tl-card').count() == n3, f'tagalog: Chapter 3 guide shows {n3} cards', str(pg.locator('.tl-card').count()))
    a = pg.locator('#s-oars .tl-card a').first
    check(a.get_attribute('href') == 'https://isaymotion.github.io/Tagalog/#/psych/s/mi' and a.get_attribute('target') == '_blank' and 'noopener' in a.get_attribute('rel'), 'tagalog: card links to the Usap Tayo MI section in a new tab')
    no_overflow(pg, w, 'tagalog guide')
    pg.locator('#s-oars .tl-card').scroll_into_view_if_needed(); shot(pg, 'tagalog', w, full=False)
    go(pg, '#/c/1/guide', '.guide'); check(pg.locator('.tl-card').count() == 0, 'tagalog: no card where nothing maps (Chapter 1)')
    for route, n in (('#/pocket/rulers', 1), ('#/pocket/darncat', 0), ('#/tools/audit', 1), ('#/tools/urica', 0), ('#/write', 1), ('#/roleplay', 1), ('#/c/2/guide', 3)):
        go(pg, route); pg.wait_for_timeout(150)
        check(pg.locator('.tl-card').count() == n, f'tagalog: {route} shows {n} card(s)', str(pg.locator('.tl-card').count()))
        no_overflow(pg, w, 'tagalog ' + route)
    go(pg, '#/tools/audit'); check(pg.locator('.tl-card a').count() == 2, 'tagalog: AUDIT page links to two Usap Tayo pages')
    txt = pg.evaluate("fetch('data/tagalog.js').then(r=>r.text())")
    check(not any(wd in txt.lower() for wd in (' po ', 'opo', 'kumusta', 'ninyo', 'alak')), 'tagalog: the data file holds links only, no Tagalog phrases')

SECTIONS = [('write', t_write), ('today', t_today), ('progress', t_progress), ('pocket', t_pocket), ('roleplay', t_roleplay), ('prepost', t_prepost), ('tagalog', t_tagalog)]
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((390, 800), (1280, 900)):
        for name, fn in SECTIONS:
            if only and name not in only: continue
            ctx = b.new_context(viewport={'width': w, 'height': h}, service_workers='block')
            pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e, errs=errs: errs.append(str(e)))
            go(pg, '#/')
            if not has_view(pg, name) and name not in ('prepost', 'tagalog'):
                print(f'SKIP {name} (not in this version)'); ctx.close(); continue
            fn(pg, w)
            check(not errs, f'{name}: no JS errors at {w}', str(errs[:2]))
            ctx.close()
    b.close()
srv.shutdown()
print('FEATURES FAILS:', fails)
