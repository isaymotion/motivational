# MI Trainer — handoff

_Last updated 2026-11-09, after v1.3.0 (Chapters 1–4 done)._

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
data/ch01.js … ch04.js  each does window.MI_CHAPTERS.push({...})
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
`qa.py` starts its own server on port 8765. It covers home, chapters list, guide, tap-to-define, flashcards and SM-2, quiz, mistakes, exam, glossary, search, overflow at 390px, no JS errors, and SW cache isolation. Its per-chapter loop picks up new chapters automatically.

## 6. Status
| Ch | Title | PDF pages | Status |
|---|---|---|---|
| 1 | A New Look at Motivation | 23–38 | ✅ v1.0.0 — 7 sections, 16 HY, 40 cards, 20 quiz, 30 terms |
| 2 | Motivational Counseling and Brief Intervention | 39–56 | ✅ v1.1.0 — 10 sections, 22 HY, 52 cards, 20 quiz, 31 terms |
| 3 | Motivational Interviewing as a Counseling Style | 57–86 | ✅ v1.2.0 — 17 sections, 25 HY, 64 cards, 20 quiz (5/5/5/5), 42 terms |
| 4 | From Precontemplation to Contemplation | 87–104 | ✅ v1.3.0 — 12 sections, 20 HY, 51 cards, 20 quiz (5/5/5/5), 16 terms |
| 5 | From Contemplation to Preparation | 105–116 | next |
| 6 | From Preparation to Action | 117–130 | todo |
| 7 | From Action to Maintenance | 131–146 | todo |
| 8 | Integrating Motivational Approaches in SUD Treatment Settings | 147–158 | todo |
Appendices (screening instruments) are not planned yet; ask her.

## 7. Next step
Chapter 5 → `data/ch05.js`, id 5, version **1.4.0** (sw VERSION `mitrainer-1.4.0`). PDF pages 105–116; printed pages = PDF − 22 (Ch 4 was '65–81' because its last PDF page is blank), so likely '83–94' — confirm from the footers. Expect about 8–10 sections; it should cover decisional balance and working with ambivalence in more depth (reuse the Ch 1 term Decisional balance).
Glossary terms already taken — Ch 4: 5 Rs, Reveling, Reluctance/Rebellion/Resignation/Rationalization (nolink), URICA, SOCRATES, Readiness To Change Questionnaire, Significant other (alt SOs — never add alt 'SO', the linker is case-insensitive and would underline every "so"), Mandated treatment, Decontaminating the referral, Typical day (nolink), Self-diagnosis, Balanced reflective listening, Release of information. Ch 3: Spirit of MI (PACE), Change talk (DARN-CAT), Sustain talk, Discord, OARS, Open/Closed question, Affirming, Reflective listening, Simple/Complex/Double-sided reflection, Roadblocks to listening, Recapitulation and Ambivalence summary, Four processes, Engaging/Focusing/Evoking/Planning (nolink), Righting reflex, the five traps, Agenda mapping, Target behavior, Importance and Confidence Rulers, Agreement with a twist, Reframing, Columbo approach, Values Card Sort, Elicit-Provide-Elicit (EPE), Confidence talk, Key questions, Change plan. Ch 1–2: Ambivalence, Discrepancy, Amplified reflection, Decisional balance, Self-efficacy, Personalized feedback, MET, SBIRT, FRAMES, Precontemplation/Contemplation/Preparation/Action/Maintenance…

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
- Quiz answers are now spread evenly (Ch 3–4: 5/5/5/5); keep doing that.
- Glossary alt names are matched case-insensitively as whole words; never use an alt that is a common English word.
- v1.3.0 fixed a 390px overflow on #/glossary: long term + alt rows could not wrap. `.gloss__item summary` now has `flex-wrap:wrap`.

## 9. Files to re-attach
- **TIP 35 PDF** (`Motivational_Interviewing.pdf`, 212 pages) — needed for every new chapter. It is not committed to the repo.
- Icon artwork: not needed, icons are already in `icons/`.
