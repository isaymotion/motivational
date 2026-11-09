/* What's new. Newest entry FIRST. version = semver string (also the key for the unseen badge),
   date = ISO YYYY-MM-DD. Item type: feature | update | correction | content.
   Optional per item: href (an in-app '#/...' link) shown as "Open". Add an entry for every release,
   then bump APP_META.version, VERSION in sw.js, and "Latest version" in the footer / README. */
window.APP_CHANGELOG = [
  {
    version: '1.8.0',
    date: '2026-11-09',
    title: 'Appendices: Tools and Resources',
    summary: 'A new Tools section with all 14 screening and assessment instruments from Appendix B, and a Resources page for Appendix C.',
    items: [
      { type: 'feature', text: 'Tools: one page per Appendix B instrument, with what it measures, the chapter that covers it, the items, scoring and interpretation as printed, and its source. The 10 public-domain tools show every item (AUDIT, DrInC, SOCRATES 8A and 8D, URICA, the Alcohol and Drug Use Decisional Balance Scales, BSCQ, AASES and the MI Knowledge Test with its answer key).', href: '#/tools' },
      { type: 'feature', text: 'DAST-10, RCQ-TV, ADCQ and What I Want From Treatment get reference cards (what they measure, scoring and cut-offs, source, and a link to the official copy) without the item text, because TIP 35 reprints them with permission.', href: '#/tools/dast' },
      { type: 'feature', text: 'Resources: the websites, manuals and related TIPs listed in Appendix C. These links need an internet connection.', href: '#/resources' },
      { type: 'update', text: 'Chapters 2, 4, 5 and 7 now end with links to their instruments, and the glossary entries for AUDIT, URICA, SOCRATES, the Readiness To Change Questionnaire, the decisional balance scales, the SCQ/BSCQ and the AASES link to the tool pages. Search covers the tools and resources.' }
    ]
  },
  {
    version: '1.7.0',
    date: '2026-11-09',
    title: 'Chapter 8: Integrating Motivational Approaches — all 8 chapters ready',
    summary: 'The final chapter: MI in groups, technology and blended approaches (MIA, CBT, recovery management checkup), and training and supervision. All eight chapters of TIP 35 are now in the app.',
    items: [
      { type: 'content', text: 'Chapter 8: 9-section study guide (group MI and AMIGOS, telephone and computer MI, motivational interviewing assessment, blending MI with CBT and Jordan’s case in Exhibit 8.1, recovery management checkup, training, the VHA MET initiative, competency-based supervision, MITI and MISC), 20 high-yield points, 48 flashcards, a 20-question quiz and 13 glossary terms.', href: '#/c/8' },
      { type: 'update', text: 'Review, Exam and the Glossary now draw from all 8 chapters.' }
    ]
  },
  {
    version: '1.6.0',
    date: '2026-11-09',
    title: 'Chapter 7: From Action to Maintenance',
    summary: 'Stabilizing change: retention, coping plans, recovery capital, social support, relapse prevention counseling (Marlatt model and C-TRAPS), relapse management and reentering the cycle.',
    items: [
      { type: 'content', text: 'Chapter 7: 12-section study guide (Exhibit 7.1 strategies, missed-appointment options, the SCQ, BSCQ and AASES, the triggers table and coping menu, recovery capital, Susan’s story, Marlatt’s RPC process described step by step, C-TRAPS and relapse management), 22 high-yield points, 51 flashcards, a 20-question quiz and 20 glossary terms.', href: '#/c/7' },
      { type: 'update', text: 'Review, Exam and the Glossary now draw from Chapters 1 to 7.' }
    ]
  },
  {
    version: '1.5.0',
    date: '2026-11-09',
    title: 'Chapter 6: From Preparation to Action',
    summary: 'Initiating change: clarifying goals, when goals differ, sampling goals, building and revising a change plan, behavioral contracts, barriers, referral and social support.',
    items: [
      { type: 'content', text: 'Chapter 6: 11-section study guide (Exhibit 6.1 strategies, When Treatment Goals Differ, sobriety sampling and trial moderation, the Change Plan Worksheet, the menu of options and Exhibit 6.4, behavioral contracts, active referral, and flexible revisiting), 17 high-yield points, 49 flashcards, a 20-question quiz and 13 glossary terms.', href: '#/c/6' },
      { type: 'update', text: 'Review, Exam and the Glossary now draw from Chapters 1 to 6.' }
    ]
  },
  {
    version: '1.4.0',
    date: '2026-11-09',
    title: 'Chapter 5: From Contemplation to Preparation',
    summary: 'Increasing commitment: the MI Hill of Ambivalence, intrinsic motivation, decisional balance, the five kinds of self-efficacy, and strategies that strengthen commitment.',
    items: [
      { type: 'content', text: 'Chapter 5: 11-section study guide (the Hill of Ambivalence, the Decisional Balance Sheet, Other Issues in Decisional Balance, the recapitulation summary, going public and envisioning), 17 high-yield points, 48 flashcards, a 20-question quiz and 14 glossary terms.', href: '#/c/5' },
      { type: 'update', text: 'Review, Exam and the Glossary now draw from Chapters 1 to 5. “DB” in the text now links to Decisional balance.' }
    ]
  },
  {
    version: '1.3.0',
    date: '2026-11-09',
    title: 'Chapter 4: From Precontemplation to Contemplation',
    summary: 'Building readiness: rapport, the 5 Rs, readiness instruments, raising doubt and concern, involving significant others, and clients mandated to treatment.',
    items: [
      { type: 'content', text: 'Chapter 4: 12-section study guide (Exhibit 4.1 strategies, the 5 Rs, URICA, SOCRATES and the Readiness To Change Questionnaire, personalized feedback, the typical-day interview, involving SOs, and the mandated-client dialog of Exhibit 4.3), 20 high-yield points, 51 flashcards, a 20-question quiz and 16 glossary terms.', href: '#/c/4' },
      { type: 'update', text: 'Review, Exam and the Glossary now draw from Chapters 1 to 4.' },
      { type: 'correction', text: 'Long glossary entries now wrap on phones instead of making the Glossary page scroll sideways.' }
    ]
  },
  {
    version: '1.2.0',
    date: '2026-11-09',
    title: 'Chapter 3: Motivational Interviewing as a Counseling Style',
    summary: 'The core MI chapter: the spirit of MI, change talk and sustain talk, OARS, the four processes, and responding to sustain talk.',
    items: [
      { type: 'content', text: 'Chapter 3: 17-section study guide (PACE, what is new in MI, DARN-CAT, Gordon’s 12 roadblocks, types of reflections, summaries, traps, agenda mapping, the Importance and Confidence Rulers, the Columbo approach, EPE and planning), 25 high-yield points, 64 flashcards, a 20-question quiz and 42 glossary terms.', href: '#/c/3' },
      { type: 'update', text: 'Review, Exam and the Glossary now draw from Chapters 1 to 3.' }
    ]
  },
  {
    version: '1.1.0',
    date: '2026-11-09',
    title: 'Chapter 2: Motivational Counseling and Brief Intervention',
    summary: 'FRAMES, catalysts for change, counselor focus by stage, cultural responsiveness, co-occurring disorders, brief interventions and SBIRT.',
    items: [
      { type: 'content', text: 'Chapter 2: 10-section study guide (FRAMES, the AUDIT feedback handout, PIES, Catalysts for Change, Counselor Focus in the SOC, RESPECT, DDMI, BI, BT and SBIRT), 22 high-yield points, 52 flashcards, a 20-question quiz and 31 glossary terms.', href: '#/c/2' },
      { type: 'update', text: 'Review, Exam and the Glossary now draw from Chapters 1 and 2.' },
      { type: 'update', text: 'Quiz answer choices are reshuffled on every attempt, so the position of the right answer is never a clue.' },
      { type: 'update', text: 'On phones, tables with three or more columns become stacked cards so no column hides off-screen, and the “In this chapter” list is a single swipeable row.' },
      { type: 'update', text: 'Everyday words such as “action” and “substance” are no longer underlined as glossary terms in the text.' }
    ]
  },
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
