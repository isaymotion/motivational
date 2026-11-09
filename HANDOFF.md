# MI Trainer — handoff

_Last updated 2026-11-09 (handoff), after v1.8.0 (all 8 chapters + Appendix B Tools + Appendix C Resources). Next: v1.9.0 practice scoring and the MI Knowledge Test self-test (approved; see §7)._

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
```
Tools code lives in `js/app.js` under "Appendix B tools and Appendix C resources" (routes `#/tools`, `#/tools/<id>`, `#/resources`; NAV group "Appendices"). Tool object:
```js
{ id, n, short, name, status:'pd'|'restricted', chapter (or null), gloss:['URICA'] /* glossary terms that link here */,
  pages:'190–192' /* PDF pages */, count:'32 items · 4 stages', about:[blocks], instructions:[{title,x}],
  scale:[[label,score]] /* shared */, scaleLabel?, contexts?:[{title,lines}],
  items:[{n,q,opts?:[[label,score]],choices?:[...],answer?,note?}] /* pd only */, key?:true, keyNote?,
  restrictedNote? /* restricted only */, scoring:[blocks]|null, interpret:[blocks]|null, source:'verbatim line', url }
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
python3 /home/claude/mi-devtools/tools/qa.py .                          # → last line FAILS: 0 (56 checks at v1.1.0)
D=<isaymotion-app-design skill dir>                                     # shown when the skill loads
python3 $D/scripts/check_sw.py .                                        # → PASS
python3 $D/scripts/check_design.py . --browser                          # → PASS — design contract met
rm -rf _qa
pdftoppm -f 47 -l 47 -r 110 -png <pdf> /tmp/p47                         # view an exhibit page
```
`python3 -I /home/claude/mi-devtools/tools/tools_qa.py .` → last line `TOOLS FAILS: 0` (every tool page at 390 and 1280, item counts, restricted = no items, overflow, JS errors, chapter/glossary/sheet links, search).
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
| App. B | Tools — 14 instruments | 172–207 | ✅ v1.8.0 — 10 public domain with all items (220 items), 4 reference cards (DAST-10, RCQ-TV, ADCQ, What I Want From Treatment) |
| App. C | Resources | 208–209 | ✅ v1.8.0 — 5 groups, 16 entries, external links with an "online only" note |
| App. A | Bibliography | — | Left out (by plan) |

Chapter totals (v1.7.0): 89 sections, 159 HY, 403 cards, 160 quiz items, 179 glossary terms.

## 7. Next step: v1.9.0 practice scoring (approved)
**Her answers (2026-11-09):** (1) reference cards with no item text for the 4 restricted instruments — yes (done in v1.8.0); (2) practice scoring: **an optional "save my own practice attempts on this device" setting**, not keep-nothing; (3) v1.8.0 go ahead — done and pushed.

**v1.9.0 plan:**
- **Practice scoring** on the public-domain tool pages: tap answers → totals and the book's interpretation, already in `data/tools.js`: AUDIT total + zone (women/men cut-off toggle); DrInC 5 scales + total + Control Scale caveat (grid = the scoring table); SOCRATES Re/Am/Ts + decile from the profile table (8A and 8D share it); URICA 4 subscales; Alcohol/Drug DB Pros avg, Cons avg, difference; BSCQ 8 sliders 0–100 and the 1–3 lowest situations. Each result gets a short "giving this feedback" note drawn from the chapters (EPE, nonjudgmental; Ch 2 Exhibit 2.1 for AUDIT).
- **Privacy, per her answer:** default = nothing stored, cleared on leaving the page, "practice/teaching only — not a clinical record" banner, no name or ID fields ever. Add a setting (off by default) "Save my own practice attempts on this device": when on, store attempts under `mt:v1:practice.<toolId>` (list of {date, answers, scores}), show a small history with delete-one and clear-all, and make sure the backup panel export/import includes them (it covers the `mt:v1:` prefix). Wording should make clear these are her own practice attempts, not client data.
- **MI Knowledge Test self-test** (`#/tools/mikt/test` or a mode on the page): up to 6 choices (a–f) and context dialogues, so give it its own view; do not change the chapter quiz engine (exactly 4 choices). Add a per-item note giving the updated MI term from Ch 3 Exhibit 3.1 where an item uses 1991/2002 terms ("self-motivational statements" → change talk, "rolling with resistance", "resistance" → sustain talk/discord). Results may also be saved under the same opt-in setting.
- **Two source problems to handle (tell her, decide with her):**
  - **AASES:** the printed key (Negative Affect 1,3,9; Social/Positive 10,11,12; Physical 2,7,8; Cravings 4,5,6; "divide by 12") fits the 12-item version, not the 20 items printed. The tool page shows it verbatim with a "Check before scoring" note. Do NOT build AASES subscale scoring from it; offer only the overall mean of the 20 items (or nothing) unless she supplies the official 20-item key.
  - **MI Knowledge Test Q18:** Q17 and Q18 have identical stems and choices, and the key gives Q18 as "c) the expert trap", not one of its choices. Shown as printed with a key note. In the self-test, exclude Q18 from scoring (or show it as "not scored — printing error"), unless she says otherwise.
  - RCQ-TV prints each scale's range as −10…+10 and "one of the five items" though each scale has 4 items scored −2…+2 (reachable −8…+8). The reference card states the printed range and proration rule. RCQ is restricted, so no interactive scoring anyway.
- Extend `tools_qa.py` with known-answer scoring tests per tool (e.g. all-max and all-min answer sets and one mixed set computed by hand from the key), save-setting off → nothing in localStorage, on → stored and in export.
- Bump to 1.9.0 per §4 step 3 (sw VERSION, app-meta, changelog at top, README).

### Earlier open items
- "Latest version" month: still November 2026; update it in index.html, app-meta.js and README when the month changes.
- She was told about two content choices and may want changes: Ch 7 Exhibit 7.5 (Susan) states childhood sexual abuse by her father in one plain sentence (could become "childhood trauma"); the Ch 6 IOP glossary entry deliberately avoids outside facts.
- Reported to her at v1.8.0: the AASES key mismatch and MIKT Q18 key error (see §7); she may want them handled differently.
- Later ideas: a "SOC stage → strategies" summary page from Exhibits 4.1/5.1/6.1/7.1; a Tagalog layer (usap-tayo-integration skill).

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
- v1.3.0 fixed a 390px overflow on #/glossary: long term + alt rows could not wrap. `.gloss__item summary` now has `flex-wrap:wrap`.

## 9. Files to re-attach
- **TIP 35 PDF** (`Motivational_Interviewing.pdf`, 212 pages) — useful for v1.9.0 to double-check scoring keys (Appendix B, PDF 172–207). Everything needed is already in `data/tools.js`. It is not committed to the repo.
- Icon artwork: not needed, icons are already in `icons/`.
