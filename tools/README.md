# MI Trainer dev tools (dev-tools branch — not published)

Clone this branch next to the site clone (see HANDOFF.md §5). Every tool takes the site repo path as an argument; none needs a fixed location.

| File | What it does | Run |
|---|---|---|
| `extract.py` | Extracts one chapter of the TIP 35 PDF to text using the running page headers; `--pages` lists headers per page | `python3 -I tools/extract.py <pdf> <N> out.txt` |
| `check_chapters.js` | Validates `data/chNN.js` files: counts, ids, 4 choices, answer range, cross-chapter glossary duplicates, script tag and sw.js CORE registration | `node tools/check_chapters.js <repo>` |
| `qa.py` | Playwright functional tests at phone width; screenshots to `<repo>/_qa/` | `python3 tools/qa.py <repo>` → `FAILS: 0` |
| `shot.py` | One phone-width screenshot of a route, scrolled to some text; prints scrollWidth (must be 390), glossary link count, JS errors | `python3 -I tools/shot.py <repo> '#/c/8/guide' 'Exhibit 8.1' /tmp/ex.png` |
| `tools_qa.py` | Tools/Resources pages (v1.8.0+): every tool at 390 and 1280, item counts, restricted tools show no items, overflow, JS errors, cross-links, search | `python3 -I tools/tools_qa.py <repo>` → `TOOLS FAILS: 0` |
| `nav_check.py` | Which sidebar item / tab-bar tab is highlighted on key routes, #/stages jump chip, scrollWidth, JS errors (v1.9.4) | `python3 -I tools/nav_check.py <repo>` → each route shows exactly one item, `errors []` |
| `drills_qa.py` | Skill drills (v1.10.0): item counts, answers, text found in the chapter data, full rounds by click and keyboard, storage, search | `python3 -I tools/drills_qa.py <repo>` → `DRILLS FAILS: 0` |
| `features_qa.py` | Write a response, Today, Progress, Pocket cards, Role-play, Before/after, Sa Tagalog (v1.11.0+), at 390 and 1280 | `python3 -I tools/features_qa.py <repo> [--only name,…] [--shots DIR]` → `FEATURES FAILS: 0` |
| `all_checks.sh` | Runs every check and prints one line each | `tools/all_checks.sh <repo> <design-skill-dir>` |
| `bump.py` | Sets the version in app-meta.js and sw.js and adds the What's new entry | `python3 -I tools/bump.py <repo> <x.y.z> entry.js` |
| `ship.sh` | Commits as isaymotion with the session trailer and pushes main | `tools/ship.sh <repo> "<message>" <session-url>` |
| `gloss_width.py` | Lists the widest glossary rows at min-content width (finds sideways overflow on #/glossary) | `python3 -I tools/gloss_width.py <repo>` |

Requires: `pypdf`, `playwright` + chromium, `node`, `pdftoppm` (poppler) for viewing exhibit pages.
Never commit book text, extracts or page images here.
