"""Phone-width (390x844) screenshot of one route, optionally scrolled to some text.

Usage: python3 -I tools/shot.py <repo> <route> [scroll-text] [out.png]
  e.g. python3 -I tools/shot.py . '#/c/8/guide' 'Exhibit 8.1' /tmp/ex.png
Prints the document scrollWidth (must be 390: no sideways overflow), the number of
glossary links on the page and any JS errors. Open the PNG with the Read tool.
"""
import functools, http.server, sys, threading
from playwright.sync_api import sync_playwright

repo, route = sys.argv[1], sys.argv[2]
text = sys.argv[3] if len(sys.argv) > 3 else None
out = sys.argv[4] if len(sys.argv) > 4 else '/tmp/shot.png'

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
H = functools.partial(Quiet, directory=repo)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8799), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8799/' + route)
    pg.wait_for_timeout(1200)
    if text:
        pg.locator('text=' + text).first.scroll_into_view_if_needed()
        pg.wait_for_timeout(300)
    pg.screenshot(path=out)
    print('scrollWidth', pg.evaluate('document.documentElement.scrollWidth'))
    print('glossary links', pg.locator('#main [data-term], #main .term').count())
    print('js errors', errs)
    print('saved', out)
    b.close()
srv.shutdown()
