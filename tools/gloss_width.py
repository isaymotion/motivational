"""Find the glossary rows that are widest at their narrowest (min-content) width.

Usage: python3 -I tools/gloss_width.py <repo>
Lists the 4 widest .gloss__item rows on #/glossary. Anything near or above ~358px
would push the page wider than a 390px phone. Used to find the v1.3.0 overflow
(a long term + alt that could not wrap).
"""
import functools, http.server, sys, threading
from playwright.sync_api import sync_playwright

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
H = functools.partial(Quiet, directory=sys.argv[1])
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8798), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()

JS = """() => {
  const r = [...document.querySelectorAll('.gloss__item')].map(e => {
    e.style.width = 'min-content'; const w = e.getBoundingClientRect().width; e.style.width = '';
    return [Math.round(w), e.textContent.slice(0, 50)];
  });
  r.sort((a, b) => b[0] - a[0]); return r.slice(0, 4);
}"""

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.goto('http://127.0.0.1:8798/#/glossary')
    pg.wait_for_timeout(1200)
    for w, t in pg.evaluate(JS):
        print(w, t)
    print('scrollWidth', pg.evaluate('document.documentElement.scrollWidth'))
    b.close()
srv.shutdown()
