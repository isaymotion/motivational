# MI Trainer — handoff

_Last updated 2026-11-12, after v1.9.4 (v1.9.4 Stage by stage page + nav subroute highlight; v1.9.0 practice scoring + MI Knowledge Test self-test; v1.9.1 fixed moved outside links; v1.9.2 full references; v1.9.3 ADCQ free-copy link). All planned content is done; see §7 for open questions and ideas._

## 1. Project and audience
- **MI Trainer**: a Motivational Interviewing study app for psychiatry residents (Dr. Ma. Isabella P. Navarro, Mariveles Mental Wellness and General Hospital). Built chapter by chapter.
- **Source (only source):** SAMHSA TIP 35, *Enhancing Motivation for Change in Substance Use Disorder Treatment* (updated 2019), 212-page PDF, 8 chapters + appendices.
- **Repo:** `isaymotion/motivational`. `main` is the site; `dev-tools` holds this doc and `tools/` (never merge into main).
- **Live URL:** https://isaymotion.github.io/motivational/. GitHub Pages is ON (she confirmed 2026-11-09; main / root). Every push to main goes live; the proxy blocks the Pages API, so you can't check it from here.
- Plain HTML/CSS/JS, no build step. Pair with the skills **isaymotion-app-design** (shell, design and QA scripts) and **isaymotion-study-app** (features and rules). Load both at the start.

## 2. Fixed rules
- Attribution, exact: `App created by Isabella Navarro, MD. Latest version <Month YYYY>. isaymotion@gmail.com`. Change only the month.
- Storage prefix `mt:v1:`, cache prefix `mitrainer-`. Never change them; the apps share the isaymotion.github.io origin.
- `sw.js` deletes only caches starting with `mitrainer-` (this is "the service cache bug" fix; verified). It also uses `cache:'reload'` on install, and registration uses `updateViaCache:'none'`. Run `check_sw.py` before every push.
- Content strictly from TIP 35. No outside facts. Exhibits that are graphics: render the page and read it (see Commands).
- Card, quiz and section **ids are stable once published**, because SRS progress is keyed `chapterId/cardId`. Add new ids; never renumber.
- Her preference: use subagents for simple tasks to save tokens. Keep design, clinical content decisions and final review yourself.
- Commit as `git -c user.name=isaymotion -c user.email=isaymotion@gmail.com commit …` with the session's attribution trailer.
- Her name in formal text: "Ma. Isabella P. Navarro".

## 3. Architecture and data formats
```
index.html  css/app.css  js/app.js  sw.js  manifest.webmanifest  icons/ (from her pixel-art image)
data/app-meta.js   APP_META.version (semver)        data/changelog.js  APP_CHANGELOG, newest first
data/chapters.js   MI_TOC (all 8 chapters) + MI_CHAPTERS = []
data/ch01.js … ch08.js  each does window.MI_CHAPTERS.push({...})
data/tools.js      window.MI_TOOLS (14 Appendix B instruments) + window.MI_RESOURCES (Appendix C)   [v1.8.0]
(v1.9.4) #/stages has no data file: stageRows() in js/app.js reads the Exhibit 4.1/5.1/6.1/7.1 tables from MI_CHAPTERS at runtime (finds the h3 starting 'Exhibit N.1 ' and the next table).
data/practice.js   window.MI_PRACTICE {feedback:{audit,drinc,socrates,urica,db,bscq,aases}, miktTerms:{n:html}, miktNotScored:{18:…}}   [v1.9.0]
```
**Practice scoring (v1.9.0)** lives in `js/app.js` under "PRACTICE SCORING", just after `toolView`. Routes `#/tools/<id>/practice` (the 9 ids in `SCORERS`: audit, drinc, socrates8a/8d, urica, alcdb/drugdb, bscq, aases) and `#/tools/mikt/test`. Scorers parse the scoring tables in `data/tools.js` (no retyped keys); SOCRATES deciles come from the Profile Sheet table. `window.MI_SCORE(id, answers, {sex})` and `window.MI_MIKT(answers)` exist for QA. Answers live only in the in-memory `PR` and are dropped in `route()` whenever the hash leaves a practice page. Setting `mt:v1:practiceSave` (off by default; toggle on each practice page and in About > Settings); saved attempts `mt:v1:practice.<id>` = [{date, answers, scores, summary}] newest first, max 50, covered by backup. MIKT items may carry `pre: [lines]` (Q22's situation). AASES = overall mean of 20 items only (no subscales). MIKT Q18 not scored (score out of 21). MIKT choices are never shuffled ("both a and b").
Tools code lives in `js/app.js` under "Appendix B tools and Appendix C resources" (routes `#/tools`, `#/tools/<id>`, `#/resources`; NAV group "Appendices"). Tool object:
```js
{ id, n, short, name, status:'pd'|'restricted', chapter (or null), gloss:['URICA'] /* glossary terms that link here */,
  pages:'190–192' /* PDF pages */, count:'32 items · 4 stages', about:[blocks], instructions:[{title,x}],
  scale:[[label,score]] /* shared */, scaleLabel?, contexts?:[{title,lines}],
  items:[{n,q,opts?:[[label,score]],choices?:[...],answer?,note?}] /* pd only */, key?:true, keyNote?,
  restrictedNote? /* restricted only */, scoring:[blocks]|null, interpret:[blocks]|null, source:'verbatim line', url, urlLabel?,
  ref:'full Appendix A reference (ligatures fixed)', refUrl?, refLabel? /* v1.9.2; ADCQ has refUrl = article DOI */ }
```
Ids (stable): audit, dast, drinc, wiwft, rcq, socrates8a, socrates8d, urica, adcq, alcdb, drugdb, bscq, aases, mikt. `data/tools.js` is the source of truth: edit it directly (the one-off generator and transcription were not kept, since dev-tools never holds book text).
The study engine lives in `js/app.js` (search for "STUDY ENGINE"). Routes: `#/chapters`, `#/c/<id>/<guide|hy|cards|quiz|gloss>`, `#/c/<id>/cards/<all|due|new>`, `#/review`, `#/exam`, `#/exam/go`, `#/mistakes`, `#/mistakes/go`, `#/glossary/<term>`. Quiz choices reshuffle on every attempt. Glossary terms are auto-linked (first mention per block) for tap-to-define. Tables with 3+ columns become stacked cards on phones.

Chapter object:
```js
{ id: 3, title: '…', pages: '35–64',
  quote: { text: '…', by: 'Miller & Rollnick, 2013, p. 12' },
  keyMessages: ['…'],                              // the chapter's KEY MESSAGES box
  sections: [ { id: 'spirit', h: 'The Spirit of MI', blocks: [
      { t: 'p', x: 'HTML allowed: <strong>, <em>' },
      { t: 'h3', x: 'plain text' },
      { t: 'ul', items: ['…'] }, { t: 'ol', items: ['…'] },
      { t: 'note', title: 'Counselor note: …', x: '…' },   // also used for "Expert comment (Name): …"
      { t: 'table', head: ['A','B','C'], rows: [['…','…','…']] },  // first cell = row header
      { t: 'stages' } ] } ],                       // the redrawn SOC cycle SVG
  highYield: ['…'],                                // ~15–25
  cards: [ { id: 'c01', tag: 'OARS', q: '…', a: 'HTML ok', why: 'optional' } ],   // ~40–55
  quiz:  [ { id: 'q01', q: '…', choices: ['a','b','c','d'], answer: 1, why: '…' } ],  // 20, exactly 4 choices
  glossary: [ { term: 'Change talk', def: '…', alt: ['CT'], nolink: false } ] }      // no term may repeat an earlier chapter's
```
`nolink: true` keeps everyday words (e.g. Action, Substance) from being underlined.

## 4. Per-chapter recipe
1. `python3 -I tools/extract.py <pdf> N /home/claude/mi-src/chN.txt`. Read it all. Render graphic exhibits with `pdftoppm`.
2. Write `data/chNN.js` yourself (clinical content). Mirror the book's headings in about 8–12 sections. Include every exhibit as a table or list, key messages, the opening quote, counselor notes and expert comments. Make cards and quiz items vignette-based where possible.
3. Register it:
   - `index.html`: add `<script src="data/chNN.js"></script>` after the last chNN tag.
   - `sw.js`: add `'./data/chNN.js',` to CORE and bump `VERSION` (`PREFIX + 'x.y.0'`).
   - `data/app-meta.js`: bump `version` to match.
   - `data/changelog.js`: add a new entry at the TOP with version, date, title, summary and items (content with `href: '#/c/N'`, plus any updates).
   - `README.md`: set that chapter's row in the Content table to "Ready (vx.y.0)". Update the "Latest version" month if the month changed.
4. `node tools/check_chapters.js .` must print OK.
5. Tests (section 5), look at screenshots, `rm -rf _qa`, commit, push.
6. Update this doc's status and next steps; push dev-tools.

## 5. Commands
```bash
# new chat: attach the repo (add_repo isaymotion/motivational, push), then:
git clone --depth 1 https://github.com/isaymotion/motivational /home/claude/motivational
git clone --depth 1 -b dev-tools https://github.com/isaymotion/motivational /home/claude/mi-devtools   # run after the first clone finishes, not in parallel
pip install --break-system-packages pypdf playwright && playwright install chromium   # if missing
cd /home/claude/motivational
node /home/claude/mi-devtools/tools/check_chapters.js .                 # → OK — N chapters …
python3 /home/claude/mi-devtools/tools/qa.py .                          # → last line FAILS: 0 (92 PASS at v1.9.4)
D=<isaymotion-app-design skill dir>                                     # shown when the skill loads
python3 $D/scripts/check_sw.py .                                        # → PASS
python3 $D/scripts/check_design.py . --browser                          # → PASS — design contract met
rm -rf _qa
pdftoppm -f 47 -l 47 -r 110 -png <pdf> /tmp/p47                         # view an exhibit page
```
`python3 -I /home/claude/mi-devtools/tools/tools_qa.py .` → last line `TOOLS FAILS: 0` (every tool page at 390 and 1280, item counts, restricted = no items, overflow, JS errors, chapter/glossary/sheet links, search; since v1.9.0 also known-answer scoring tests for every scorer and the MIKT, every practice page at both widths, and the privacy flow: off → nothing stored, on → stored + in export + deletable, answers cleared on leaving).
Helpers (in tools/): `nav_check.py <repo>` prints the highlighted sidebar item per route (one each; Tools on all #/tools/... routes, Chapters on #/c/...), tab-bar highlight, the #/stages jump and JS errors; `shot.py <repo> '<route>' '<scroll text>' out.png` gives one phone screenshot plus scrollWidth and JS errors; `gloss_width.py <repo>` finds glossary rows that overflow.
`qa.py` starts its own server on port 8765. It covers home, chapters list, guide, tap-to-define, flashcards and SM-2, quiz, mistakes, exam, glossary, search, overflow at 390px, no JS errors, and SW cache isolation. Its per-chapter loop picks up new chapters automatically.

## 6. Status
| Ch | Title | PDF pages | Status |
|---|---|---|---|
| 1 | A New Look at Motivation | 23–38 | ✅ v1.0.0 — 7 sections, 16 HY, 40 cards, 20 quiz, 30 terms |
| 2 | Motivational Counseling and Brief Intervention | 39–56 | ✅ v1.1.0 — 10 sections, 22 HY, 52 cards, 20 quiz, 31 terms |
| 3 | Motivational Interviewing as a Counseling Style | 57–86 | ✅ v1.2.0 — 17 sections, 25 HY, 64 cards, 20 quiz (5/5/5/5), 42 terms |
| 4 | From Precontemplation to Contemplation | 87–104 | ✅ v1.3.0 — 12 sections, 20 HY, 51 cards, 20 quiz (5/5/5/5), 16 terms |
| 5 | From Contemplation to Preparation | 105–116 | ✅ v1.4.0 — 11 sections, 17 HY, 48 cards, 20 quiz (5/5/5/5), 14 terms |
| 6 | From Preparation to Action | 117–130 | ✅ v1.5.0 — 11 sections, 17 HY, 49 cards, 20 quiz (5/5/5/5), 13 terms |
| 7 | From Action to Maintenance | 131–146 | ✅ v1.6.0 — 12 sections, 22 HY, 51 cards, 20 quiz (5/5/5/5), 20 terms |
| 8 | Integrating Motivational Approaches in SUD Treatment Settings | 147–158 | ✅ v1.7.0 — 9 sections, 20 HY, 48 cards, 20 quiz (5/5/5/5), 13 terms |
| App. B | Tools — 14 instruments | 172–207 | ✅ v1.8.0 — 10 public domain with all items (220 items), 4 reference cards (DAST-10, RCQ-TV, ADCQ, What I Want From Treatment) |
| App. C | Resources | 208–209 | ✅ v1.8.0 — 5 groups, 16 entries, external links with an "online only" note |
| Practice | Practice scoring + MIKT self-test | — | ✅ v1.9.0 — 9 scorers, MIKT self-test (21 scored), opt-in save setting |
| Stages | Stage by stage summary (Ex. 4.1/5.1/6.1/7.1) | — | ✅ v1.9.4 — 6 stages, read from chapter data |
| App. A | Bibliography | — | Left out (by plan) |

Chapter totals (v1.7.0): 89 sections, 159 HY, 403 cards, 160 quiz items, 179 glossary terms.

## 7. Status after v1.9.4 and next steps
**Next step: none chosen yet.** Ask her which of the still-open items below to do (offer them as choices). Next version: v1.9.5 for small fixes, v1.10.0 for a new feature (e.g. Tagalog layer). Latest version month: if it is December 2026 or later, update the month in index.html, data/app-meta.js and README.

**v1.9.0 done (2026-11-09)**, per her answers: practice scoring with the optional, off-by-default "Save my own practice attempts on this device" setting; MI Knowledge Test self-test with Exhibit 3.1 term notes (items 1, 3, 4, 6, 7, 11, 15, 16, 21). Each practice result ends with a "Giving this feedback" note (Ch 2 for AUDIT; Ch 4 for DrInC, SOCRATES, URICA; Ch 5 for DB; Ch 7 for BSCQ/AASES). Also fixed: MIKT Q22's situation (T: confidence 0–10 / C: "About a 4") had been missing.

**v1.9.4 done (2026-11-12, main 7bb39cd)**, per her choice:
- **Stage by stage** page `#/stages` (NAV Study group, icon `cycle`, home tile, search entries kind "Stages"): redrawn SOC cycle, jump chips, an "At a glance" Stage | Counselor focus table, then one section per stage (Precontemplation, Contemplation, Preparation, Action, Maintenance, Relapse and recycle) with Client motivation, Counselor focus and Counseling strategies split into bullet lists, and a "Chapter N study guide →" button. Text comes from the chapter data (no copy), so edits to those exhibit tables flow through. Section ids `st-<stage-slug>`.
- **Nav fix:** `navMatches()` makes a nav item active on its own route and any subroute (`href + '/'`), plus optional `match` prefixes (Chapters has `match: ['#/c/']`). The tab bar's Chapters tab is also active inside a chapter.
- **She decided:** AUDIT toggle stays on Women (no change).
- Checks at v1.9.4: check_chapters OK; qa.py FAILS: 0 (92 PASS); tools_qa.py TOOLS FAILS: 0; check_sw PASS; check_design --browser PASS. Screens checked: phone light, desktop dark, jump chips, highlights on 11 routes.

**Defaults taken without her decision — tell her, change if she wants:**
- **AASES:** only the plain average of the 20 ratings, plus the lowest-rated situations (rated 1–2, or her lowest rating). No subscales, with a caution callout. If she supplies the official 20-item key, add subscale scoring.
- **MIKT Q18:** shown with choices disabled and "Not scored — printing error"; score is out of 21.
- AUDIT zone cut-off toggle defaults to Women — **she confirmed this on 2026-11-12; keep it.**

**Ideas / possible next releases:**
- ~~SOC stage → strategies summary page~~ — done in v1.9.4.
- A Tagalog layer (usap-tayo-integration skill).
- ~~Sidebar Tools highlight on subroutes~~ — fixed in v1.9.4.
- Still open: AASES subscales (need the official key from her); MIKT Q18 handling; Ch 7 Susan sentence (she did not choose to change it on 2026-11-12); the 4 links to check in a browser (below).

**v1.9.1 links (2026-11-09):** she reported a dead WIWFT link. Every tool/resource URL was checked; moved ones now point to the current official copy (CASAA `/assets/inst/` and `/assets/docs/` paths, `casaa.unm.edu/tools/met.pdf`, MISC → `assets/docs/misc4.pdf` = MISC 2.1, TIPs 63/60/42 on library.samhsa.gov, TIPs 57/52 on samhsa.gov/resource). The closed SAMHSA-HRSA CIHS site (integration.samhsa.gov) now links to current SAMHSA pages on screening, the MI Advisory based on TIP 35, and the tobacco cessation Advisory. Tool `source` lines stay verbatim; the page adds a note when the printed address has moved. **Not verifiable from the sandbox (check in a browser):** DrInC `pubs.niaaa.nih.gov/.../match04.pdf`, RCQ `ndarc...TR.019.pdf`, TIP 59 and TIP 39 store.samhsa.gov links (store.samhsa.gov now tends to redirect to library.samhsa.gov). WebFetch is the only way to test links here (the shell can't reach outside sites).

**v1.9.2 references (2026-11-09):** she noted the ADCQ had no source link or reference. Every tool now carries `ref` (full Appendix A entry), shown under Source. ADCQ has no free official copy (TIP 35 lists none); it links the article DOI 10.1037/0893-164X.11.2.107 and, at her request (v1.9.3), the free SLU copy as `url` with `urlLabel` and a `urlNote` (third-party, dated 2013, drinking wording). `urlNote` renders under the link in the restricted callout. AUDIT `url` = the USAUDIT guide PDF printed in Appendix A (ct.gov; served a PDF to WebFetch but the title couldn't be read). BSCQ has no link (none printed).

### Earlier open items
- "Latest version" month: still November 2026; update it in index.html, app-meta.js and README when the month changes.
- She was told about two content choices and may want changes: Ch 7 Exhibit 7.5 (Susan) states childhood sexual abuse by her father in one plain sentence (could become "childhood trauma"); the Ch 6 IOP glossary entry deliberately avoids outside facts.
- AASES key mismatch and MIKT Q18 key error: handled with the defaults in §7 (v1.9.0); she may want them handled differently.
- Later ideas: a Tagalog layer (usap-tayo-integration skill). (The stage summary page shipped in v1.9.4.)

Glossary: 179 terms across 8 chapters. If tools pages add terms, run check_chapters.js — it flags any term repeating an earlier one. Never use a common English word as an alt (the linker is case-insensitive whole-word; e.g. never alt 'SO').

## 8. Pitfalls learned
- Appendix B: `pdftotext -layout -f 172 -l 209` gives clean single-column text for most instruments; the PDF drops fi/fl ligatures ("frst", "Effcacy", even inside URLs: "fles" → files). The AUDIT and the DrInC scoring grid are two-column/positional — render them (PDF 172–173, 178).
- Inserting `// comment` at the end of a one-line statement with a Python replace swallowed `});`. Put comments on their own line, and always `node -e "require('vm').createScript(...)"` syntax-check `js/app.js`.
- Playwright `inner_text` applies CSS `text-transform` (eyebrows come back UPPERCASE); compare lowercase.
- Google Fonts are blocked in the sandbox and log ERR_TUNNEL console errors. qa.py filters these; they are not app errors.
- Quiz answers tended to cluster on B. Choices are now shuffled at runtime, but still spread `answer` across 0–3 in the data.
- Glossary filter state persisted across deep links (fixed). Module-level view state needs resetting on route args.
- The `gh api` Pages endpoint is blocked by the proxy, so she must enable Pages herself.
- `python -m http.server` handlers need `functools.partial(Handler, directory=…)`.
- Chapter page headers appear on alternate pages; `extract.py` handles the span.
- Two-column exhibits come out of `extract.py` with the columns interleaved (e.g. Exhibit 3.1, 3.2, 3.6). Reconstruct them carefully, or render the page with `pdftoppm` if the order is unclear.
- Quiz answers are now spread evenly (Ch 3–8: 5/5/5/5); keep doing that.
- Glossary alt names are matched case-insensitively as whole words; never use an alt that is a common English word.
- Python `str.replace` edits on js/app.js: build `old` from the file exactly (check quotes around `'Chapter '` etc.) and `assert s.count(old)==1` — mismatches fail loudly, which is what you want.
- Long chapter titles inside `.btn` wrap badly on phones; use short labels ("Chapter N study guide →").
- In-page jumps: use `data-jump="<element id>"` on a link whose href is the current route (the delegated handler on `main` scrolls); never use `#id` hashes, the router owns the hash.
- v1.3.0 fixed a 390px overflow on #/glossary: long term + alt rows could not wrap. `.gloss__item summary` now has `flex-wrap:wrap`.

## 9. Files to re-attach
- **TIP 35 PDF** (`Motivational_Interviewing.pdf`, 212 pages) — only needed for new content or to re-check a key (Appendix B, PDF 172–207). It is not committed to the repo.
- Icon artwork: not needed, icons are already in `icons/`.
