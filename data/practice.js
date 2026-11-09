/* Practice scoring and the MI Knowledge Test self-test (v1.9.0).
   Content only: the "giving this feedback" notes (drawn from the TIP 35 chapters) and the
   updated-MI-term notes for the MI Knowledge Test (Chapter 3, Exhibit 3.1).
   The scoring keys themselves live in data/tools.js; the scoring code is in js/app.js ("PRACTICE SCORING"). */

window.MI_PRACTICE = {
  /* Shown at the end of each tool's practice result. blocks use the chapter block format. */
  feedback: {
    audit: { ch: 2, sec: 'Chapter 2: Personalized feedback (FRAMES) and Exhibit 2.1', blocks: [
      { t: 'ul', items: [
        'Establish rapport first, then show the score and explain what it means — Exhibit 2.1 (the Drinker’s Pyramid) is the sample AUDIT handout; use a handout or visual in the client’s first language.',
        'Don’t pressure the client to accept a diagnosis or offer unsolicited opinions. Preface neutrally — “I don’t know whether this will concern you, but …” — and invite the client’s own reading: “What do you make of this?”',
        'Be neutral, nonjudgmental and respectful; give small chunks; use open questions and reflections to explore the client’s understanding and readiness.',
        'Summarize results, risks, reactions and any change talk, ask the client to add to or correct the summary, and provide a written summary.'
      ] }
    ] },
    drinc: { ch: 4, sec: 'Chapter 4: Assessment feedback', blocks: [
      { t: 'ul', items: [
        'Make sure the client values the information and believes it will help; review findings in a way that raises awareness and develops discrepancy with the client’s values.',
        'Divide extensive feedback into small chunks with <strong>Elicit-Provide-Elicit (EPE)</strong>. One or two pieces of feedback may be enough to move a client toward Contemplation.',
        'Stay neutral and nonjudgmental, and ask what the client makes of each piece (Chapter 2).'
      ] }
    ] },
    socrates: { ch: 4, sec: 'Chapter 4: Assessment feedback', blocks: [
      { t: 'ul', items: [
        'Remember the norms: the deciles rank a score against adults <em>already presenting for alcohol treatment</em> (Project MATCH), so “low” means low for people seeking treatment.',
        'Use the profile as a general guide and also look at individual item responses.',
        'Give feedback in small chunks with <strong>EPE</strong>, neutrally, and ask what the client makes of it. Explore, don’t label.'
      ] }
    ] },
    urica: { ch: 4, sec: 'Chapter 4: Assessing readiness and giving feedback', blocks: [
      { t: 'ul', items: [
        'The subscales are continuous: a person can score high on more than one stage, so treat the highest subscale as a starting point for conversation, not a fixed stage label.',
        'Match your strategies to what the client says in session, and reassess — readiness changes.',
        'Share results in small chunks with <strong>EPE</strong> and invite the client’s own interpretation.'
      ] }
    ] },
    db: { ch: 5, sec: 'Chapter 5: Help tip the decisional balance toward change', blocks: [
      { t: 'ul', items: [
        'Explore the high-scoring Cons items (e.g., “Some people close to me are disappointed in me…”) to build discrepancy and evoke change talk.',
        'When using decisional balance, <strong>briefly reflect</strong> the reasons for continuing use (sustain talk) but <strong>emphasize</strong> the reasons for change (change talk).',
        'The weight of each reason matters more than the number of reasons (Chapter 2).',
        'Updated MI (Exhibit 3.1): decisional balancing can <strong>increase ambivalence</strong> in clients who are contemplating change. If a client has already stopped or is acting, keep pace — move to a change plan instead (Exhibit 5.4).'
      ] }
    ] },
    bscq: { ch: 7, sec: 'Chapter 7: Coping plans and self-efficacy', blocks: [
      { t: 'ul', items: [
        'The lowest-confidence situations are the client’s high-risk situations: use them to set realistic goals and build an individualized coping plan.',
        'Self-efficacy is behavior specific (Chapter 5): a client can be confident in some situations and not others.',
        'Enhance self-efficacy: express confidence in the client, review past successes and current strengths, use the <strong>Confidence Ruler</strong> for coping strategies, and offer a menu of coping strategies with a high likelihood of success.'
      ] }
    ] },
    aases: { ch: 7, sec: 'Chapter 7: Coping plans and self-efficacy', blocks: [
      { t: 'ul', items: [
        'The lowest-rated situations show where confidence to abstain is low — the high-risk situations to plan for.',
        'Clients with many high-risk situations may need new coping strategies; use them to set realistic goals.',
        'Enhance self-efficacy: express confidence, review past successes and strengths, use the <strong>Confidence Ruler</strong>, and offer a menu of coping strategies.'
      ] }
    ] }
  },

  /* MI Knowledge Test: older (1991/2002) terms → updated MI (Chapter 3, Exhibit 3.1). Keyed by item number. */
  miktTerms: {
    1: '“Rolling with resistance” is the 1991/2002 term. Updated MI (Exhibit 3.1) responds instead with strategies to lessen sustain talk and counselor–client discord.',
    3: 'Arguing against change is what updated MI calls <strong>sustain talk</strong> — statements that favor not changing.',
    4: '“Self-motivational statements” are now called <strong>change talk</strong> (Exhibit 3.1).',
    6: '“Develop discrepancy” is one of the four original principles. Updated MI uses four processes — engaging, focusing, evoking and planning — and folds the old principles in as reflective listening or strategic responses.',
    7: 'Updated MI no longer treats resistance as a client characteristic: it is an expression of <strong>sustain talk</strong> and the status quo side of ambivalence, arising out of counselor–client <strong>discord</strong>.',
    11: '“Handling resistance” in today’s terms: responding to <strong>sustain talk</strong> and <strong>discord</strong> (Exhibit 3.1).',
    15: '“Rolling with resistance” is the older term; updated MI lessens sustain talk and discord instead (Exhibit 3.1).',
    16: '“Rolling with resistance” and “expressing empathy” are two of the four original principles; updated MI is organized around four processes (engaging, focusing, evoking, planning).',
    21: '“Self-motivating statements” = <strong>change talk</strong>; “counter change talk” = <strong>sustain talk</strong> (Exhibit 3.1; Chapter 3).'
  },
  /* Items not scored in the self-test, with the reason shown. */
  miktNotScored: {
    18: 'Not scored — printing error. Questions 17 and 18 are printed with the same question and choices, and the key gives 18 as “c) the expert trap,” which is not one of its choices.'
  }
};
