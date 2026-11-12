/* What's new. Newest entry FIRST. version = semver string (also the key for the unseen badge),
   date = ISO YYYY-MM-DD. Item type: feature | update | correction | content.
   Optional per item: href (an in-app '#/...' link) shown as "Open". Add an entry for every release,
   then bump APP_META.version, VERSION in sw.js, and "Latest version" in the footer / README. */
window.APP_CHANGELOG = [
  {
    version: '1.14.0',
    date: '2026-11-13',
    title: 'Pocket cards',
    summary: 'Twenty short reference cards to glance at on duty, taken from the tables and lists in TIP 35.',
    items: [
      { type: 'feature', text: 'Pocket cards: PACE, OARS, types of reflection and summary, the 12 roadblocks, traps to avoid, DARN-CAT, questions that evoke change talk, the Importance and Confidence Rulers, responding to sustain talk, Elicit-Provide-Elicit, signs of readiness, FRAMES, counselor focus by stage, the 5 Rs, the Decisional Balance Sheet, the Change Plan Worksheet, triggers and coping, C-TRAPS and RESPECT. Pin the ones you use most.', href: '#/pocket' }
    ]
  },
  {
    version: '1.13.0',
    date: '2026-11-13',
    title: 'Progress: your weak spots first',
    summary: 'A new page shows where you are strong and what to study next, with a button to study each area.',
    items: [
      { type: 'feature', text: 'Progress: your weakest areas first, then quiz accuracy by chapter, shaky flashcards by chapter, and your skill drills and written responses. Quiz answers are counted from version 1.12.0 on.', href: '#/progress' },
      { type: 'feature', text: 'Flashcards have a new Shaky filter: cards you rated Again or Hard and have not mastered yet.' }
    ]
  },
  {
    version: '1.12.0',
    date: '2026-11-13',
    title: 'Today’s session and streak',
    summary: 'One button gives you about 10 minutes of study a day, and the app counts the days you finish in a row.',
    items: [
      { type: 'feature', text: 'Today: up to 10 flashcards (due cards first), 5 quiz questions (your past mistakes first) and one skill drill round. Finish all three and the day counts toward your streak. The last 7 days are shown as a strip.', href: '#/today' },
      { type: 'update', text: 'Home opens with Today’s session, and the results of flashcards, quizzes and drills link back to it.' },
      { type: 'correction', text: 'Saved dates (best quiz score, exams, drills) now use your local date. Before, a score saved before 8 a.m. Philippine time was stamped with the previous day.' }
    ]
  },
  {
    version: '1.11.0',
    date: '2026-11-13',
    title: 'Write a response',
    summary: 'Practice producing MI responses, not only recognizing them: type your own, then compare with the example in TIP 35.',
    items: [
      { type: 'feature', text: 'Write a response: 23 prompts in three sets (write a reflection, respond to sustain talk, turn a closed question into an open one). Type what you would say, compare it with the TIP 35 example and rate yourself. What you type is not saved; only your self-ratings are kept on this device.', href: '#/write' },
      { type: 'update', text: 'The menu is grouped into Study, Practice and Reference so the practice tools are easier to find.' }
    ]
  },
  {
    version: '1.10.0',
    date: '2026-11-13',
    title: 'Skill drills',
    summary: 'Six quick tap-to-answer drills train your ear for MI, using the examples in TIP 35.',
    items: [
      { type: 'feature', text: 'Skill drills: rounds of 10 on open or closed questions, change talk or sustain talk, DARN-CAT types, what a question evokes, naming the counselor’s response, and which stage of change. Each answer shows why, and your best score is kept on this device.', href: '#/drills' }
    ]
  },
  {
    version: '1.9.4',
    date: '2026-11-12',
    title: 'Stage by stage summary',
    summary: 'A new page puts the counseling strategies for every stage of change side by side, and the menu now highlights the right section on every page.',
    items: [
      { type: 'feature', text: 'Stage by stage: client motivation, counselor focus and counseling strategies for Precontemplation, Contemplation, Preparation, Action, Maintenance and Relapse and recycle, from Exhibits 4.1, 5.1, 6.1 and 7.1, with links back to each chapter.', href: '#/stages' },
      { type: 'correction', text: 'The menu now highlights Tools on every tool, practice and self-test page, and Chapters inside a chapter (it was highlighted only on the list pages).' }
    ]
  },
  {
    version: '1.9.3',
    date: '2026-11-09',
    title: 'ADCQ: link to a free copy',
    summary: 'The Alcohol and Drug Consequences Questionnaire page now links to a free copy of the questionnaire online.',
    items: [
      { type: 'update', text: 'ADCQ links to a free copy posted by Saint Louis University (not listed in TIP 35; its wording is for drinking and may differ from the TIP 35 version). The link to the original article stays under Source.', href: '#/tools/adcq' }
    ]
  },
  {
    version: '1.9.2',
    date: '2026-11-09',
    title: 'Full references on every tool page',
    summary: 'Each tool page now shows the full reference from TIP 35’s bibliography, and the ADCQ links to its original article.',
    items: [
      { type: 'feature', text: 'Every Appendix B tool page shows the full reference (authors, year, title, journal or publisher) from TIP 35 Appendix A under Source.', href: '#/tools' },
      { type: 'correction', text: 'Alcohol and Drug Consequences Questionnaire: TIP 35 lists no online copy, so the page now gives the full reference and a link to the original article (Cunningham et al., 1997).', href: '#/tools/adcq' },
      { type: 'update', text: 'AUDIT now links to the USAUDIT guide listed in TIP 35’s bibliography.', href: '#/tools/audit' }
    ]
  },
  {
    version: '1.9.1',
    date: '2026-11-09',
    title: 'Fixed outside links',
    summary: 'Links to official copies and resources that had moved since TIP 35 was printed now go to their current addresses.',
    items: [
      { type: 'correction', text: 'Tool links now open the current official copies: What I Want From Treatment, SOCRATES 8A and 8D, and the MI Knowledge Test (CASAA).', href: '#/tools/wiwft' },
      { type: 'correction', text: 'Resources: the MET and MISC manuals (CASAA), TIPs 63, 60, 57, 52 and 42 (SAMHSA), and the closed SAMHSA-HRSA Center for Integrated Health Solutions, whose links now go to the current SAMHSA pages on screening, MI and tobacco cessation.', href: '#/resources' },
      { type: 'update', text: 'Tool pages note when the address in the printed source line has moved.' }
    ]
  },
  {
    version: '1.9.0',
    date: '2026-11-09',
    title: 'Practice scoring and the MI Knowledge Test self-test',
    summary: 'Score the public-domain Appendix B instruments yourself, with the book’s interpretation and tips for giving the feedback, and take the MI Knowledge Test as a self-test.',
    items: [
      { type: 'feature', text: 'Practice scoring on 9 tool pages: AUDIT total and zone (women’s or men’s cut-offs), DrInC scales, total and Control Scale check, SOCRATES 8A/8D raw scores and deciles, URICA subscales, Alcohol and Drug Use Decisional Balance averages and difference, BSCQ sliders with the lowest-confidence situations, and the AASES average. Each result ends with a “Giving this feedback” note from the chapters.', href: '#/tools/audit/practice' },
      { type: 'feature', text: 'MI Knowledge Test self-test: all 22 questions with both exchanges, scored against the key, with the updated MI term from Chapter 3 (Exhibit 3.1) wherever a question uses an older one. Question 18 is not scored because of a printing error in the key.', href: '#/tools/mikt/test' },
      { type: 'feature', text: 'Practice and teaching only: there are no name or ID fields and answers are cleared when you leave the page. An optional setting (off by default, also in About > Settings) saves your own practice attempts on this device, with a history you can delete; saved attempts are included in Backup.', href: '#/about' },
      { type: 'correction', text: 'MI Knowledge Test question 22 now shows its counselor–client situation (“About a 4”), which was missing.', href: '#/tools/mikt' },
      { type: 'update', text: 'AASES: only the overall average is calculated. The printed subscale key fits a 12-item version, not the 20 items printed, so subscales are not scored.' }
    ]
  },
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
