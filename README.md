# MI Trainer

Learn Motivational Interviewing chapter by chapter — the spirit, OARS, the four processes and the stages of change — with flashcards, quizzes and a glossary built from SAMHSA TIP 35. It runs entirely in the browser, works offline after the first visit, and can be installed on phones and desktops.

**Live site:** https://isaymotion.github.io/motivational/ (after GitHub Pages is switched on; see below)

## Content

Built strictly from SAMHSA TIP 35, *Enhancing Motivation for Change in Substance Use Disorder Treatment* (updated 2019), one chapter at a time.

| Chapter | Title | Status |
|---|---|---|
| 1 | A New Look at Motivation | Ready (v1.0.0) |
| 2 | Motivational Counseling and Brief Intervention | Ready (v1.1.0) |
| 3 | Motivational Interviewing as a Counseling Style | Ready (v1.2.0) |
| 4 | From Precontemplation to Contemplation | Ready (v1.3.0) |
| 5 | From Contemplation to Preparation | Ready (v1.4.0) |
| 6 | From Preparation to Action | Ready (v1.5.0) |
| 7 | From Action to Maintenance | Ready (v1.6.0) |
| 8 | Integrating Motivational Approaches in SUD Treatment Settings | Ready (v1.7.0) |
| App. B | Screening and assessment instruments (Tools) | Ready (v1.8.0; practice scoring and MI Knowledge Test self-test v1.9.0) — 14 tools |
| App. C | Resources | Ready (v1.8.0) |

Each chapter has five modes: **Study guide**, **High-yield**, **Flashcards** (SM-2 spaced repetition), **Quiz**, **Glossary**. Across chapters: **Review** (due + new cards), **Exam** (mixed quiz), **Mistakes**, **Glossary**.

To add a chapter: create `data/chNN.js` with the same shape as `data/ch01.js` (sections, highYield, cards, quiz, glossary; ids must stay stable once published), add its `<script>` tag in `index.html` after `ch01.js`, add it to `CORE` in `sw.js`, bump the version, and add a What's new entry.

## Features

- Home screen with a hero, tiles for every screen, and a What's new strip.
- Menu: docked sidebar on desktop (with a hide/show button), slide-in drawer on phones, plus a bottom tab bar (Home, Chapters, Review, Exam, Menu).
- Search from the top bar (press `/`), with suggestions and a full results page at `#/search/<query>`.
- Back and forward buttons in the top bar, `Alt+Left` / `Alt+Right`, and scroll position restored when you go back.
- Light, dark or match-device theme, a text-size control (Aa), and an English / Tagalog language setting. All are remembered on the device and can be changed in **About > Settings**.
- An "Other apps" group at the end of the menu linking to the other isaymotion apps (opens in a new tab).
- What's new page with a "new" badge for entries you have not seen.
- Stage by stage (`#/stages`): the counseling strategies for each stage of change side by side, from Exhibits 4.1, 5.1, 6.1 and 7.1 (read from the chapter data, so it stays in step with the chapters).
- Today (`#/today`): one short daily session (up to 10 flashcards, 5 quiz questions with past mistakes first, one skill drill round), a 7-day strip and a streak of finished days. Activity is kept under `mt:v1:days`, the day's targets under `mt:v1:plan` and every quiz answer under `mt:v1:qstat`.
- Progress (`#/progress`): weakest areas first, then quiz accuracy and shaky flashcards by chapter and the skill drills and write sets, each with a button to study it. Reads the data the app already saves; flashcards gain a **Shaky** filter (`#/c/<id>/cards/shaky`).
- Pocket cards (`#/pocket`): 20 short reference cards (PACE, OARS, reflections, DARN-CAT, rulers, FRAMES, the 5 Rs, C-TRAPS and more), each assembled at runtime from the chapter tables and lists named in `POCKET_SPEC` in `js/app.js`. Pinned cards (`mt:v1:pocket`) show first.
- Role-play (`#/roleplay`): 19 scenario cards for two or three residents (client, counselor, observer) read from Exhibits 4.2, 3.6 and 7.4 and the sustain talk table, with an observer tally sheet (questions, reflections, affirmations, summaries, roadblocks, change and sustain talk) and a 3/5/10-minute timer. Nothing is stored.
- Skill drills (`#/drills`): six tap-to-answer drills (open or closed question, change or sustain talk, DARN-CAT type, what a question evokes, name the response, which stage), built at runtime from the Chapter 3 tables and Exhibits 4.1 to 7.1. Best score, last score and rounds are kept under `mt:v1:drills`.
- Write a response (`#/write`): type your own reflection, response to sustain talk or open question, compare it with the TIP 35 example and rate yourself (23 prompts from Exhibit 3.6 and the Chapter 3 tables). What is typed is never stored; only the self-ratings are kept under `mt:v1:write`.
- Tools: practice scoring on the public-domain instruments (AUDIT, DrInC, SOCRATES 8A/8D, URICA, the decisional balance scales, BSCQ, AASES) and an MI Knowledge Test self-test. Practice/teaching only: nothing is stored unless **Save my own practice attempts on this device** is turned on (off by default; also in About > Settings). Saved attempts stay in the browser under `mt:v1:practice.<toolId>` and are included in Backup.
- Backup: export everything the app saves on this device to a file, import it elsewhere, and undo the last import.
- Accessible by default: skip link, visible focus, reduced-motion support, safe-area padding for notched phones.
- No build step and no dependencies. Progress and settings are saved in the browser on each device.

## Files to upload

Upload everything in this folder to the root of the repository, keeping the folder structure:

```
.nojekyll               (empty file; tells GitHub Pages not to run Jekyll)
README.md
index.html              App shell (top bar, sidebar menu, footer, bottom tabs)
css/app.css             Styles (light and dark themes)
js/app.js               Router, menu, views (VIEWS), navigation (NAV), search, theme, backup
data/app-meta.js        App name, version, attribution (window.APP_META), menu links (window.APP_LINKS)
                        and the commented MIGRATE_KEYS example
data/changelog.js       What's new entries (window.APP_CHANGELOG)
data/hospital.js        Hospital, program, posts and year levels (window.HOSPITAL), shared across apps
data/strings.js         Shell UI strings in English and Tagalog (window.STRINGS)
data/chapters.js        Chapter list (window.MI_TOC) and the MI_CHAPTERS registry
data/ch01.js            Chapter 1 content (study guide, high-yield, flashcards, quiz, glossary)
data/ch02.js            Chapter 2 content
data/ch03.js            Chapter 3 content
data/ch04.js            Chapter 4 content
data/ch05.js            Chapter 5 content
data/ch06.js            Chapter 6 content
data/ch07.js            Chapter 7 content
data/ch08.js            Chapter 8 content
data/tools.js           Appendix B instruments (window.MI_TOOLS) and Appendix C resources (window.MI_RESOURCES)
data/practice.js        Practice-scoring feedback notes and MI Knowledge Test term notes (window.MI_PRACTICE)
icons/                  icon-192.png, icon-512.png, icon-maskable-512.png (required),
                        favicon-32.png, favicon-64.png, apple-touch-icon.png (recommended)
manifest.webmanifest    Install metadata
sw.js                   Offline cache
```

The icons are generated from Dr. Navarro's pixel-art artwork; the header logo uses `icons/icon-192.png`.

## Publish on GitHub Pages

1. Create a new repository named `motivational` on GitHub and upload all files in this folder, keeping the folder structure.
2. In the repository, open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://isaymotion.github.io/motivational/`.
5. On a phone, open that link, then use **Add to Home Screen** (iPhone Safari) or **Install app** (Android Chrome).

There is no build step and no dependencies. To preview locally, run `python3 -m http.server` in this folder and visit `http://localhost:8000`.

## Adding a screen

1. In `js/app.js`, inside the `APP VIEWS` section, add `VIEWS.myscreen = function (arg) { return '<div class="wrap page">...</div>'; };` (use `esc()` on any data).
2. Add one entry to the `NAV` array: `{ label: 'My screen', href: '#/myscreen', icon: 'star', group: 'Screens' }`. That adds it to the sidebar, the drawer and the home tiles.
3. Optional: add rows to `SEARCH_INDEX` (`{title, text, href, kind}`) so the screen shows up in search.
4. Add an entry to the top of `data/changelog.js` and bump the version (below).

Reusable CSS classes are in `css/app.css`: `btn`, `btn--solid`, `link-btn`, `filters`/`filter`, `seg`, `card`, `row`, `callout`, `table-wrap`, `page`/`page__head`, `crumb`, `empty`, `badge`, `meter`. Study components (`modes`, `flashcard`, `rate`, `q-card`, `choice`, `gloss__item`, `term`, `sheet`) are at the end of `css/app.css`.

## Shared data, languages and other apps

- `data/hospital.js` defines `window.HOSPITAL` (hospital name, program, province, posts, year levels, form prefix). It is shared across the apps: edit it in one place and copy the file to the others instead of hardcoding these values.
- `data/strings.js` defines `window.STRINGS = { en, tl }` for the shell's own UI text. Use `t('key')` in `js/app.js`; it falls back to English, then to the key. The Tagalog values are a draft until Dr. Navarro reviews them. Add the same key to both languages when you add shell text.
- `window.APP_LINKS` (in `data/app-meta.js`) feeds the "Other apps" menu group. The entry matching this app's own repo slug is skipped, so the same list works in every app. These links never appear in the home tiles, search or tab bar.
- `window.MIGRATE_KEYS` (optional; a commented example is in `data/app-meta.js`) is for a restyled app whose storage prefix changed: at startup each saved key under an old prefix is copied under the new prefix and the old key removed, so saved progress survives.

## Version and What's new

- The app version is a semantic version string (for example `1.0.0`). It lives in `data/app-meta.js` (`version`), in the first entry of `data/changelog.js`, and in `sw.js` (`VERSION`).
- `data/changelog.js` is newest first. Each entry is `{version, date, title, items:[{type, text}]}` where `date` is ISO `YYYY-MM-DD` and `type` is `feature`, `update`, `correction` or `content`. Write plain sentences, sentence-case titles, no emoji, and start an item with the feature name and a colon.
- For every release: add the changelog entry at the top, update `version` in `data/app-meta.js`, set `VERSION` in `sw.js` to the same version (this makes returning users get the new files), and update "Latest version November 2026" in `index.html`, `data/app-meta.js` and this README.
- The unseen badge is keyed on the version string: visitors see a count of entries newer than the last version they opened on the What's new page.
- Storage keys start with `mt:v1:`, and cache names start with `mitrainer-`. All isaymotion apps share one origin (`isaymotion.github.io`), so keep both unique per app. Do not change them after release, or saved data will be lost. `sw.js` deletes only caches whose names start with `mitrainer-`, so publishing an update never wipes another app's offline copy.

## Attribution

App created by Isabella Navarro, MD. Latest version November 2026. isaymotion@gmail.com

An independent study aid for psychiatry residents built from SAMHSA TIP 35: Enhancing Motivation for Change in Substance Use Disorder Treatment. Not affiliated with or endorsed by the author or publisher. Not a substitute for the source book or for clinical judgment.
