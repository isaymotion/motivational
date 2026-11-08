#!/usr/bin/env node
/* Validate MI Trainer chapter data. Usage: node tools/check_chapters.js <path-to-motivational-repo>
   Loads data/chapters.js + every data/chNN.js; reports counts and fails on: duplicate card/quiz ids within a
   chapter, answer index out of range, quiz without exactly 4 choices, glossary term repeated across chapters,
   chapter missing from MI_TOC, unknown block type. Exit code 1 on any problem. */
const fs = require('fs'), path = require('path');
const root = process.argv[2] || '.';
global.window = {};
eval(fs.readFileSync(path.join(root, 'data/chapters.js'), 'utf8'));
const files = fs.readdirSync(path.join(root, 'data')).filter(f => /^ch\d\d\.js$/.test(f)).sort();
files.forEach(f => eval(fs.readFileSync(path.join(root, 'data', f), 'utf8')));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
let bad = 0; const err = m => { bad++; console.log('PROBLEM ' + m); };
const terms = {}, TYPES = ['p', 'h3', 'ul', 'ol', 'note', 'table', 'stages'];
files.forEach(f => { if (!html.includes('data/' + f)) err(f + ' has no <script> tag in index.html'); if (!sw.includes('./data/' + f)) err(f + ' missing from CORE in sw.js'); });
window.MI_CHAPTERS.forEach(c => {
  if (!window.MI_TOC.some(t => t.id === c.id)) err('ch' + c.id + ' not in MI_TOC');
  const ids = new Set(), spread = [0, 0, 0, 0];
  c.cards.concat(c.quiz).forEach(x => { if (ids.has(x.id)) err('ch' + c.id + ' duplicate id ' + x.id); ids.add(x.id); });
  c.quiz.forEach(q => { if (q.choices.length !== 4) err('ch' + c.id + ' ' + q.id + ' has ' + q.choices.length + ' choices'); if (!(q.answer >= 0 && q.answer < q.choices.length)) err('ch' + c.id + ' ' + q.id + ' answer out of range'); else spread[q.answer]++; if (!q.why) err('ch' + c.id + ' ' + q.id + ' has no why'); });
  c.sections.forEach(s => s.blocks.forEach(b => { if (!TYPES.includes(b.t)) err('ch' + c.id + ' section ' + s.id + ' unknown block ' + b.t); }));
  c.glossary.forEach(g => { const k = g.term.toLowerCase(); if (terms[k]) err('glossary term "' + g.term + '" in ch' + terms[k] + ' and ch' + c.id); terms[k] = c.id; });
  console.log('ch' + c.id + ': sections ' + c.sections.length + ', high-yield ' + c.highYield.length + ', cards ' + c.cards.length + ', quiz ' + c.quiz.length + ' (answer spread A-D ' + spread.join('/') + '), glossary ' + c.glossary.length);
});
console.log(bad ? bad + ' problem(s)' : 'OK — ' + window.MI_CHAPTERS.length + ' chapters, ' + Object.keys(terms).length + ' glossary terms');
process.exit(bad ? 1 : 0);
