# MI Trainer — handoff

_Last updated 2026-11-09, after v1.7.0 (all 8 chapters done). Next: appendices (plan proposed, 3 decisions pending)._

## 1. Project and audience
- **MI Trainer**: a Motivational Interviewing study app for psychiatry residents (Dr. Ma. Isabella P. Navarro, Mariveles Mental Wellness and General Hospital). Built chapter by chapter.
- **Source (only source):** SAMHSA TIP 35, *Enhancing Motivation for Change in Substance Use Disorder Treatment* (updated 2019), 212-page PDF, 8 chapters + appendices.
- **Repo:** `isaymotion/motivational`. `main` is the site; `dev-tools` holds this doc and `tools/` (never merge into main).
- **Live URL:** https://isaymotion.github.io/motivational/. GitHub Pages must be switched on by her (Settings → Pages → main / root); the proxy blocks the Pages API. Ask whether it's on.
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
```
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
python3 /home/claude/mi-devtools/tools/qa.py .                          # → last line FAILS: 0 (56 checks at v1.1.0)
D=<isaymotion-app-design skill dir>                                     # shown when the skill loads
python3 $D/scripts/check_sw.py .                                        # → PASS
python3 $D/scripts/check_design.py . --browser                          # → PASS — design contract met
rm -rf _qa
pdftoppm -f 47 -l 47 -r 110 -png <pdf> /tmp/p47                         # view an exhibit page
```
Helpers (in tools/): `shot.py <repo> '<route>' '<scroll text>' out.png` gives one phone screenshot plus scrollWidth and JS errors; `gloss_width.py <repo>` finds glossary rows that overflow.
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
Totals at v1.7.0: 89 sections, 159 HY, 403 cards, 160 quiz items, 179 glossary terms. Appendices (screening instruments) are not planned yet; ask her.

## 7. Next step: appendices (she said yes; plan below awaits her 3 answers)
**First, ask her these three questions and wait for the answers. Build nothing until she replies:**
1. Are reference cards (no item text) OK for the 4 restricted instruments?
2. Should practice scoring keep nothing, or should there be an optional "save my own practice attempts" setting on this device?
3. Should v1.8.0 go ahead?

**What is in the appendices** (PDF pp. 159–209; printed page = PDF − 22):
- A — Bibliography (PDF 159–170). Plan: leave it out.
- B — 14 instruments (PDF 171–207): 1 AUDIT (172–173) · 2 DAST-10 (174–175) · 3 DrInC Lifetime (176–178) · 4 What I Want From Treatment 2.0 (179–181) · 5 RCQ-TV (182–183) · 6 SOCRATES 8A (184–185) · 7 SOCRATES 8D (186–187), scoring and profile (188–189) · 8 URICA (190–192) · 9 ADCQ (193–194) · 10 Alcohol DB Scale (195–196) · 11 Drug Use DB Scale (197–198) · 12 BSCQ (199–200) · 13 AASES (201–202) · 14 MI Knowledge Test, 22 items with answer key (203–207).
- C — Resources (PDF 208–209): MINT, MET manual, IRETA toolkit, UMBC HABITS lab, MIA-STEP, CASAA, MINT coding manuals, SAMHSA SBIRT, CIHS, TIPs 63/60/59/57.
- Extract with pypdf by page range (extract.py only handles chapters 1–8): `python3 -I -c "import pypdf;r=pypdf.PdfReader('<pdf>');print(''.join(r.pages[i].extract_text() for i in range(171,207)))"`. Two-column forms come out interleaved, so render pages with pdftoppm and read them.

**Permission status, from each instrument's source line:**
- Public domain (full items and interactive scoring OK): AUDIT, DrInC, SOCRATES 8A/8D, URICA, Alcohol and Drug DB scales, BSCQ, AASES, MI Knowledge Test.
- Restricted ("adapted with permission" / ©): DAST-10 (© Skinner/CAMH), RCQ-TV (Heather & Honekopp), ADCQ (Cunningham et al.). What I Want From Treatment has no permission line. Proposed: reference card only (what it measures, scoring rules and cut-offs, source line, link to the free official copy); no item text.

**Proposed build:**
- **v1.8.0:** new **Tools** section (`#/tools`, `#/tools/<id>`; add to NAV, home tiles, drawer and SEARCH_INDEX). One page per instrument with: About (measures, population, item count), "Covered in TIP 35" chapter link (URICA/SOCRATES/RCQ → Ch 4; DB scales → Ch 5; BSCQ/AASES → Ch 7; AUDIT → Ch 2), items (public-domain only), scoring and interpretation as printed, and the source line verbatim. Also a **Resources** page (Appendix C, with an "online only" note) and cross-links from chapter text and glossary entries (URICA, SOCRATES, SCQ/BSCQ, AASES, DB scale) to the tool pages. Suggested data file: `data/tools.js` → `window.MI_TOOLS = [{id, n, name, short, status:'pd'|'restricted', chapter, about, items:[{q, opts:[[label,score]]}], scoring, interpret, source}]`. Add it to index.html and sw.js CORE.
- **v1.9.0:** **Practice scoring** for the public-domain instruments. Tap answers → scale totals and the book's interpretation (SOCRATES Recognition/Ambivalence/Taking Steps with the profile sheet; URICA stage subscales; DB benefits vs costs; BSCQ 8 situations; AASES temptation and confidence; AUDIT total). Each result shows a short "giving this feedback" note from the chapters (EPE, nonjudgmental). Privacy default: no name or ID fields, nothing stored, cleared on leaving the page, and a "practice/teaching only — not a clinical record" banner. Also the **MI Knowledge Test** as a self-test. It uses 1991/2002 MI terms ("self-motivational statements", "rolling with resistance"), so add a per-item note giving the updated term from Exhibit 3.1. Up to 6 choices (a–f): the quiz engine currently assumes exactly 4, so render it with its own view, or extend the engine and check_chapters (do not break chapter quizzes).
- Version bumps follow §4 step 3 (sw VERSION, app-meta, changelog at top, README). qa.py only tests chapters: add Tools checks (pages render, no overflow at 390, scoring correct on a known answer set).

### Earlier open items
- Has she enabled GitHub Pages?
- "Latest version" month: still November 2026; update it in index.html, app-meta.js and README when the month changes.
- She was told about two content choices and may want changes: Ch 7 Exhibit 7.5 (Susan) states childhood sexual abuse by her father in one plain sentence (could become "childhood trauma"); the Ch 6 IOP glossary entry deliberately avoids outside facts.
- Later ideas: a "SOC stage → strategies" summary page from Exhibits 4.1/5.1/6.1/7.1; a Tagalog layer (usap-tayo-integration skill).

Glossary: 179 terms across 8 chapters. If tools pages add terms, run check_chapters.js — it flags any term repeating an earlier one. Never use a common English word as an alt (the linker is case-insensitive whole-word; e.g. never alt 'SO').

## 8. Pitfalls learned
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
- v1.3.0 fixed a 390px overflow on #/glossary: long term + alt rows could not wrap. `.gloss__item summary` now has `flex-wrap:wrap`.

## 9. Files to re-attach
- **TIP 35 PDF** (`Motivational_Interviewing.pdf`, 212 pages) — needed for the appendices work (Appendix B items and scoring). It is not committed to the repo.
- Icon artwork: not needed, icons are already in `icons/`.
