#!/usr/bin/env python3
"""Extract one chapter of SAMHSA TIP 35 from the PDF into plain text, using each page's running header.
Usage: python3 -I tools/extract.py <TIP35.pdf> <chapter-number> [out.txt]
Prints the PDF page range found. Also: --pages lists every page's header (for Appendix work).
Requires: pip install pypdf. To view a figure/exhibit page: pdftoppm -f N -l N -r 110 -png <pdf> /tmp/pN
"""
import sys, re, pypdf
pdf = sys.argv[1]
r = pypdf.PdfReader(pdf)
heads = []
for i, p in enumerate(r.pages):
    t = p.extract_text() or ''
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    m = next((re.match(r'Chapter (\d+)\s*—', l) for l in lines[:4] if re.match(r'Chapter (\d+)\s*—', l)), None)
    heads.append((i + 1, int(m.group(1)) if m and i >= 20 else None, t))   # pages <= 20 are front matter/TOC
if sys.argv[2] == '--pages':
    for n, ch, t in heads: print(n, ch, (t.strip().splitlines() or [''])[0][:70]); sys.exit()
ch = int(sys.argv[2])
hit = [h[0] for h in heads if h[1] == ch]   # headers sit on alternate pages: take the full span
if not hit: sys.exit('chapter %d not found' % ch)
nxt = [h[0] for h in heads if h[1] is not None and h[1] > ch]
last = (min(nxt) - 1) if nxt else hit[-1] + 1
pages = [h for h in heads if hit[0] <= h[0] <= last]
print('chapter %d: PDF pages %d-%d (%d pages)' % (ch, pages[0][0], pages[-1][0], len(pages)), file=sys.stderr)
out = '\n'.join('=== PDF PAGE %d ===\n%s' % (n, '\n'.join(l for l in t.splitlines() if l.strip())) for n, _, t in pages)
open(sys.argv[3], 'w').write(out) if len(sys.argv) > 3 else print(out)
