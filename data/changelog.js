/* What's new. Newest entry FIRST. version = semver string (also the key for the unseen badge),
   date = ISO YYYY-MM-DD. Item type: feature | update | correction | content.
   Optional per item: href (an in-app '#/...' link) shown as "Open". Add an entry for every release,
   then bump APP_META.version, VERSION in sw.js, and "Latest version" in the footer / README. */
window.APP_CHANGELOG = [
  {
    version: '1.0.0',
    date: '2026-11-08',
    title: 'First release: Chapter 1',
    summary: 'MI Trainer is built chapter by chapter from SAMHSA TIP 35. Chapter 1 is ready; the other seven chapters are listed as coming soon.',
    items: [
      { type: 'content', text: 'Chapter 1, A New Look at Motivation: study guide with the redrawn Stages of Change cycle and the Models of Addiction table, 16 high-yield points, 40 flashcards, a 20-question quiz and 30 glossary terms.', href: '#/c/1' },
      { type: 'feature', text: 'Flashcards: spaced repetition (Again, Hard, Good, Easy) per chapter, plus a Review screen that mixes due cards from every chapter with up to 20 new cards a day.', href: '#/review' },
      { type: 'feature', text: 'Quiz and Exam: chapter quizzes with explanations, a mixed exam of 10, 20 or 40 questions, and a Mistakes list you can retry until each one is cleared.', href: '#/exam' },
      { type: 'feature', text: 'Glossary: every key term in one list, and tap-to-define on highlighted terms inside the study guides.', href: '#/glossary' },
      { type: 'feature', text: 'The usual shell: search, back and forward buttons, theme and text size, What’s new, and backup of your progress on this device.' },
      { type: 'update', text: 'Offline cache: only clears its own old copies, never the other isaymotion apps’ caches, and always fetches fresh files when a new version is published.' }
    ]
  }
];
