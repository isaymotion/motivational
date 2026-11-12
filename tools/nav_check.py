"""nav_check.py <repo> — prints which sidebar item is highlighted on key routes (desktop), the tab-bar highlight on phone, scrollWidth, the #/stages jump chip, and JS errors. Added v1.9.4."""
import sys, threading, functools, http.server
from playwright.sync_api import sync_playwright
root=sys.argv[1]
H=functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
H.log_message=lambda *a: None
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8797),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
routes=['#/','#/tools','#/tools/audit','#/tools/audit/practice','#/tools/mikt/test','#/c/4/guide','#/chapters','#/glossary/Change%20talk','#/stages','#/resources','#/review']
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':900}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    for r in routes:
        pg.goto('http://127.0.0.1:8797/'+r); pg.wait_for_timeout(250)
        act=pg.eval_on_selector_all('#sidenav-body .nav-item.is-active','els=>els.map(e=>e.textContent.trim())')
        print(f'{r:28} {act}')
    pg.goto('http://127.0.0.1:8797/#/stages'); pg.wait_for_timeout(300)
    print('scrollW', pg.evaluate('document.documentElement.scrollWidth'))
    pg.screenshot(path='/tmp/desk.png')
    m=b.new_page(viewport={'width':390,'height':844})
    for r in ['#/c/3/quiz','#/stages']:
        m.goto('http://127.0.0.1:8797/'+r); m.wait_for_timeout(250)
        print('tab',r, m.eval_on_selector_all('.tabbar .is-active','els=>els.map(e=>e.textContent.trim())'), 'sw', m.evaluate('document.documentElement.scrollWidth'))
    # jump chip
    m.goto('http://127.0.0.1:8797/#/stages'); m.wait_for_timeout(300)
    m.click('.toc [data-jump="st-relapse-and-recycle"]'); m.wait_for_timeout(800)
    print('jump top', m.evaluate('document.getElementById("st-relapse-and-recycle").getBoundingClientRect().top'), m.evaluate('location.hash'))
    m.screenshot(path='/tmp/jump.png')
    print('errors',[e for e in errs])
