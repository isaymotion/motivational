# MI Trainer dev tools (dev-tools branch — not published)

Clone this branch next to the site clone (see HANDOFF.md §5). Every tool takes the site repo path as an argument; none needs a fixed location.

| File | What it does | Run |
|---|---|---|
| `extract.py` | Extracts one chapter of the TIP 35 PDF to text using the running page headers; `--pages` lists headers per page | `python3 -I tools/extract.py <pdf> <N> out.txt` |
| `check_chapters.js` | Validates `data/chNN.js` files: counts, ids, 4 choices, answer range, cross-chapter glossary duplicates, script tag and sw.js CORE registration | `node tools/check_chapters.js <repo>` |
| `qa.py` | Playwright functional tests at phone width; screenshots to `<repo>/_qa/` | `python3 tools/qa.py <repo>` → `FAILS: 0` |
| `shot.py` | One phone-width screenshot of a route, scrolled to some text; prints scrollWidth (must be 390), glossary link count, JS errors | `python3 -I tools/shot.py <repo> '#/c/8/guide' 'Exhibit 8.1' /tmp/ex.png` |
| `gloss_width.py` | Lists the widest glossary rows at min-content width (finds sideways overflow on #/glossary) | `python3 -I tools/gloss_width.py <repo>` |

Requires: `pypdf`, `playwright` + chromium, `node`, `pdftoppm` (poppler) for viewing exhibit pages.
Never commit book text, extracts or page images here.
