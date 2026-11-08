#!/usr/bin/env python3
"""MI Trainer functional tests (Playwright, phone 390x844). Usage: python3 tools/qa.py <path-to-motivational-repo>
Needs: pip install playwright && playwright install chromium. Writes screenshots to <repo>/_qa/ — delete _qa/ before committing.
Expect the last line 'FAILS: 0'. Chapter-1/2-specific checks are fixed; the per-chapter loop covers every loaded chapter."""
import asyncio, sys, json
from playwright.async_api import async_playwright
import http.server, threading, functools, os
ROOT=sys.argv[1]
os.makedirs(ROOT+'/_qa',exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8765),functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever,daemon=True).start()
B='http://127.0.0.1:8765/'
fails=[]
ANS='''(()=>{var t=document.querySelector('.q-card__q').textContent,o;window.MI_CHAPTERS.forEach(c=>c.quiz.forEach(q=>{if(q.q===t)o=q}));var want=o.choices[o.answer];var b=[...document.querySelectorAll('[data-pick]')];return b.findIndex(x=>x.textContent.slice(1)===want)})()'''
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        ctx=await br.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto(B+'#/'); await pg.wait_for_timeout(600)
        ok(await pg.locator('.home__stats .stat').count()==4,'home study strip')
        await pg.screenshot(path=ROOT+'/_qa/t-home.png',full_page=True)
        await pg.goto(B+'#/chapters'); await pg.wait_for_timeout(300)
        NCH=await pg.evaluate('window.MI_CHAPTERS.length'); ok(await pg.locator('a.row').count()==NCH and await pg.locator('.row--soon').count()==8-NCH,'chapters list %d ready + %d soon'%(NCH,8-NCH))
        await pg.goto(B+'#/c/1/guide'); await pg.wait_for_timeout(300)
        ok(await pg.locator('.guide__sec').count()==7,'guide sections')
        ok(await pg.locator('.stages svg').count()==1,'stages figure')
        n=await pg.locator('.term').count(); ok(n>10,'tap-to-define terms linked (%d)'%n)
        await pg.locator('.term').first.click(); await pg.wait_for_timeout(200)
        ok(await pg.locator('#term-sheet').is_visible(),'term sheet opens')
        await pg.screenshot(path=ROOT+'/_qa/t-term.png')
        await pg.keyboard.press('Escape')
        ok(not await pg.locator('#term-sheet').is_visible(),'term sheet closes')
        # terms must not break inside tags: check no button inside attribute
        html=await pg.inner_html('.guide')
        ok('="<button' not in html and '&lt;button' not in html,'term links do not corrupt markup')
        await pg.screenshot(path=ROOT+'/_qa/t-guide.png',full_page=True)
        await pg.goto(B+'#/c/1/hy'); await pg.wait_for_timeout(200)
        ok(await pg.locator('.hy__list li').count()==16,'high-yield 16')
        # flashcards
        await pg.goto(B+'#/c/1/cards'); await pg.wait_for_timeout(300)
        ok('Card 1 of 40' in await pg.inner_text('.card-nav__pos'),'40 cards')
        await pg.locator('#fc').click(); await pg.wait_for_timeout(600)
        ok(await pg.locator('.rate__b').count()==4,'rating buttons after flip')
        await pg.screenshot(path=ROOT+'/_qa/t-card-back.png')
        await pg.locator('[data-rate="3"]').click(); await pg.wait_for_timeout(200)
        ok('Card 2 of 40' in await pg.inner_text('.card-nav__pos'),'advances after rating')
        srs=await pg.evaluate("JSON.parse(localStorage.getItem('mt:v1:srs'))")
        ok(srs and len(srs)==1 and list(srs.values())[0]['i']==2,'SM-2 saved (Good on new = 2 days)')
        # keyboard rating
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(500); await pg.keyboard.press('1'); await pg.wait_for_timeout(200)
        srs=await pg.evaluate("JSON.parse(localStorage.getItem('mt:v1:srs'))")
        ok(len(srs)==2,'keyboard flip + rate')
        # review: "Again" card is due today
        await pg.goto(B+'#/review'); await pg.wait_for_timeout(300)
        due=await pg.inner_text('.stats .stat:first-child strong'); ok(due=='1','review shows 1 due (Again card)')
        # quiz
        await pg.goto(B+'#/c/1/quiz'); await pg.wait_for_timeout(300)
        right=0
        for i in range(20):
            ans=await pg.evaluate(ANS)
            pick = ans if i%4 else (ans+1)%4
            await pg.locator('[data-pick="%d"]'%pick).click(); await pg.wait_for_timeout(60)
            if i==0: await pg.screenshot(path=ROOT+'/_qa/t-quiz.png')
            await pg.locator('[data-qact="next"]').click(); await pg.wait_for_timeout(60)
        txt=await pg.inner_text('.result-card h2'); ok('15 of 20' in txt,'quiz score '+txt)
        mk=await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('mt:v1:mistakes'))).length"); ok(mk==5,'5 mistakes logged')
        await pg.screenshot(path=ROOT+'/_qa/t-quiz-result.png',full_page=True)
        await pg.goto(B+'#/mistakes/go'); await pg.wait_for_timeout(300)
        ans=await pg.evaluate(ANS)
        await pg.locator('[data-pick="%d"]'%ans).click(); await pg.wait_for_timeout(100)
        mk=await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('mt:v1:mistakes'))).length"); ok(mk==4,'correct retry clears a mistake')
        # exam
        await pg.goto(B+'#/exam'); await pg.wait_for_timeout(200)
        await pg.goto(B+'#/exam/go'); await pg.wait_for_timeout(300)
        ok('of 20' in (await pg.inner_text('.q-card .eyebrow')).lower(),'exam 20 questions')
        # glossary
        await pg.goto(B+'#/glossary'); await pg.wait_for_timeout(200)
        n=await pg.locator('.gloss__item').count(); NG=await pg.evaluate('window.MI_CHAPTERS.reduce((a,c)=>a+c.glossary.length,0)'); ok(n==NG,'glossary %d terms (%d)'%(NG,n))
        await pg.fill('#gq','decisional'); await pg.wait_for_timeout(200)
        n=await pg.locator('.gloss__item').count(); ok(1<=n<30,'glossary filter (%d)'%n)
        await pg.goto(B+'#/glossary/Ambivalence'); await pg.wait_for_timeout(300)
        ok(await pg.locator('details[open]').count()==1,'glossary deep link opens term')
        # search
        await pg.goto(B+'#/search/precontemplation'); await pg.wait_for_timeout(300)
        n=await pg.locator('.result').count(); ok(n>3,'search results (%d)'%n)
        # chapter 2
        await pg.goto(B+'#/c/2/guide'); await pg.wait_for_timeout(300)
        ok(await pg.locator('.guide__sec').count()==10,'ch2 guide 10 sections')
        ok(await pg.locator('.guide .table-wrap').count()==5,'ch2 tables (%d)'%await pg.locator('.guide .table-wrap').count())
        n=await pg.locator('.term').count(); ok(n>20,'ch2 terms linked (%d)'%n)
        await pg.screenshot(path=ROOT+'/_qa/t2-guide.png',full_page=True)
        await pg.goto(B+'#/c/2/cards'); await pg.wait_for_timeout(300)
        ok('of 52' in await pg.inner_text('.card-nav__pos'),'ch2 52 cards')
        await pg.goto(B+'#/c/2/quiz'); await pg.wait_for_timeout(300)
        for i in range(20):
            await pg.locator('[data-pick="%d"]'%(await pg.evaluate(ANS))).click(); await pg.wait_for_timeout(40)
            await pg.locator('[data-qact="next"]').click(); await pg.wait_for_timeout(40)
        ok('20 of 20' in await pg.inner_text('.result-card h2'),'ch2 quiz all correct with shuffled choices')
        best=await pg.evaluate("JSON.parse(localStorage.getItem('mt:v1:quizBest.2'))"); ok(best and best['score']==20,'ch2 best score saved')
        await pg.goto(B+'#/search/FRAMES'); await pg.wait_for_timeout(300)
        ok(await pg.locator('.result').count()>2,'search finds FRAMES')
        # nolink: 'action' not underlined
        await pg.goto(B+'#/c/1/guide'); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("[...document.querySelectorAll('.term')].every(b=>b.dataset.term!=='Action'&&b.dataset.term!=='Substance')"),'nolink terms stay plain')
        # every loaded chapter: guide sections, cards, quiz count, answerable with shuffled choices
        for c in await pg.evaluate("window.MI_CHAPTERS.map(c=>({id:c.id,s:c.sections.length,k:c.cards.length,q:c.quiz.length}))"):
            await pg.goto(B+'#/c/%d/guide'%c['id']); await pg.wait_for_timeout(250)
            ok(await pg.locator('.guide__sec').count()==c['s'],'ch%d guide %d sections'%(c['id'],c['s']))
            await pg.goto(B+'#/c/%d/cards/all'%c['id']); await pg.wait_for_timeout(250)
            ok(('of %d'%c['k']) in await pg.inner_text('.card-nav__pos'),'ch%d %d cards'%(c['id'],c['k']))
            await pg.goto(B+'#/c/%d/quiz'%c['id']); await pg.wait_for_timeout(250)
            for i in range(c['q']):
                await pg.locator('[data-pick="%d"]'%(await pg.evaluate(ANS))).click(); await pg.wait_for_timeout(30)
                await pg.locator('[data-qact="next"]').click(); await pg.wait_for_timeout(30)
            ok(('%d of %d'%(c['q'],c['q'])) in await pg.inner_text('.result-card h2'),'ch%d quiz answerable'%c['id'])
            for h in ['#/c/%d/guide'%c['id'],'#/c/%d/hy'%c['id'],'#/c/%d/gloss'%c['id']]:
                await pg.goto(B+h); await pg.wait_for_timeout(200)
                w=await pg.evaluate('document.documentElement.scrollWidth'); ok(w<=390,'no h-overflow '+h)
        # overflow
        for h in ['#/c/2/guide','#/c/2/cards','#/c/1/guide','#/c/1/cards','#/c/1/quiz','#/review','#/exam','#/mistakes','#/glossary','#/chapters']:
            await pg.goto(B+h); await pg.wait_for_timeout(250)
            w=await pg.evaluate('document.documentElement.scrollWidth'); ok(w<=390,'no h-overflow '+h+' (%d)'%w)
        # backup roundtrip
        data=await pg.evaluate("(()=>{var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k.indexOf('mt:v1:')===0)o[k]=localStorage.getItem(k)}return o})()")
        ok('mt:v1:srs' in data and 'mt:v1:mistakes' in data,'progress keys present for backup')
        # dark mode screenshot
        await pg.evaluate("document.documentElement.setAttribute('data-theme','dark')")
        await pg.goto(B+'#/c/1/cards'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=ROOT+'/_qa/t-cards-dark.png')
        await pg.goto(B+'#/c/1/guide'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=ROOT+'/_qa/t-guide-dark.png')
        errs=[e for e in errs if 'ERR_TUNNEL' not in e and 'fonts.g' not in e]; ok(not errs,'no JS errors '+json.dumps(errs[:3]))
        # SW cache isolation: plant a sibling cache, reload, confirm it survives
        await pg.evaluate("caches.open('stahl-companion-22.0.0').then(c=>c.put('/x',new Response('x')))")
        await pg.evaluate("caches.open('mitrainer-0.0.1').then(c=>c.put('/x',new Response('x')))")
        await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>r&&r.unregister())")
        await pg.reload(); await pg.wait_for_timeout(1500)
        keys=await pg.evaluate("caches.keys()")
        ok('stahl-companion-22.0.0' in keys and 'mitrainer-0.0.1' not in keys and 'mitrainer-'+open(ROOT+'/sw.js').read().split("PREFIX + '")[1].split("'")[0] in keys,'SW keeps sibling caches, deletes only its own old ones '+str(keys))
        await br.close()
asyncio.run(main())
print('FAILS:',len(fails)); srv.shutdown()
