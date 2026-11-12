/* Sa Tagalog (v1.17.0): links from MI Trainer into Usap Tayo, the Tagalog interview app (isaymotion.github.io/Tagalog).
   The Tagalog phrases live ONLY in Usap Tayo, so there is one place to review and correct them; nothing here is copied
   from it and none of it comes from TIP 35. To add a card: name the Usap Tayo page in `pages`, then point a chapter
   section ('chapterId/sectionId'), a pocket card id, a tool id or a practice page at it. */
window.MI_TAGALOG = {
  base: 'https://isaymotion.github.io/Tagalog/',
  pages: {
    mi: { href: '#/psych/s/mi', label: 'Motivational interviewing phrases', what: 'asking permission, open questions, reflections, the rulers, elicit-provide-elicit, a change plan and what to say when the patient is not ready' },
    sud: { href: '#/psych/sud', label: 'Substance use: screening and brief intervention', what: 'screening questions and a guided six-step motivational interview' },
    screens: { href: '#/psych/s/sud-screens', label: 'AUDIT-C and Fagerström questions', what: 'the short alcohol and tobacco screening questions' }
  },
  sections: {
    '2/feedback': ['screens'], '2/bi': ['sud'], '2/sbirt': ['sud'],
    '3/oars': ['mi'], '3/reflective': ['mi'], '3/evoking': ['mi'], '3/sustain-talk': ['mi'], '3/discrepancy': ['mi'], '3/planning': ['mi'],
    '4/assess': ['mi'], '4/door': ['mi'], '6/plan': ['mi'], '7/relapse': ['mi']
  },
  pocket: { oars: ['mi'], reflections: ['mi'], rulers: ['mi'], epe: ['mi'], sustain: ['mi'], plan: ['mi'], frames: ['sud'] },
  tools: { audit: ['screens', 'sud'] },
  practice: { write: ['mi'], roleplay: ['mi', 'sud'] }
};
