/* MI Trainer — Appendix B (screening and assessment instruments) and Appendix C (resources) of SAMHSA TIP 35.
   Hand-curated from a verbatim transcription; edit this file directly. status: "pd" = public domain (items shown),
   "restricted" = reprinted with permission / no permission line (reference card only, no item text).
   Tool ids are stable once published. pages = PDF pages, like the chapters. */
window.MI_TOOLS = [
 {
  "id": "audit",
  "urlLabel": "USAUDIT guide for primary care (online)",
  "ref": "Babor, T. F., Higgins-Biddle, J. C., & Robaina, K. (2016). USAUDIT: The Alcohol Use Disorders Identification Test, Adapted for use in the United States: A guide for primary care practitioners. Retrieved from www.ct.gov/dmhas/lib/dmhas/publications/USAUDIT-2017.pdf",
  "n": 1,
  "short": "U.S. AUDIT",
  "name": "U.S. Alcohol Use Disorders Identification Test",
  "status": "pd",
  "chapter": 2,
  "gloss": [
   "AUDIT"
  ],
  "pages": "172–173",
  "count": "10 items · past year",
  "about": [
   {
    "t": "p",
    "x": "The AUDIT is a World Health Organization instrument that assesses alcohol consumption, drinking behaviors and alcohol-related problems. TIP 35 reprints the <strong>U.S. version</strong>, in which questions 1 to 3 were modified to reflect the U.S. standard drink size and differences for men, women and older adults."
   },
   {
    "t": "p",
    "x": "Chapter 2 uses an AUDIT result as the example of giving personalized feedback (Exhibit 2.1, the Drinker’s Pyramid): show the score, explain what it means, and ask what the client makes of it."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "Alcohol can affect your health and treatment. We ask all clients these questions. Your answers will remain confidential. Circle the best answer to each question. Think about your drinking in the past year. A drink means one beer, one small glass of wine (5 oz.), or one mixed drink containing one shot (1.5 oz.) of spirits."
   }
  ],
  "items": [
   {
    "n": 1,
    "q": "How often do you have a drink containing alcohol?",
    "opts": [
     [
      "Never",
      0
     ],
     [
      "Less than monthly",
      1
     ],
     [
      "Monthly",
      2
     ],
     [
      "Weekly",
      3
     ],
     [
      "2 to 3 times a week",
      4
     ],
     [
      "4 to 6 times a week",
      5
     ],
     [
      "Daily",
      6
     ]
    ],
    "note": "If Never: skip to Questions 9 and 10."
   },
   {
    "n": 2,
    "q": "How many drinks containing alcohol do you have on a typical day when you are drinking?",
    "opts": [
     [
      "1",
      0
     ],
     [
      "2",
      1
     ],
     [
      "3",
      2
     ],
     [
      "4",
      3
     ],
     [
      "5 to 6",
      4
     ],
     [
      "7 to 9",
      5
     ],
     [
      "10 or more",
      6
     ]
    ]
   },
   {
    "n": 3,
    "q": "How often do you have X (5 for men; 4 for women and men over age 65) or more drinks on one occasion?",
    "opts": [
     [
      "Never",
      0
     ],
     [
      "Less than monthly",
      1
     ],
     [
      "Monthly",
      2
     ],
     [
      "Weekly",
      3
     ],
     [
      "2-3 times a week",
      4
     ],
     [
      "4-6 times a week",
      5
     ],
     [
      "Daily",
      6
     ]
    ],
    "note": "Skip to Questions 9 and 10 if total score for Questions 2 and 3 = 0"
   },
   {
    "n": 4,
    "q": "How often during the last year have you found that you were not able to stop drinking once you had started?",
    "opts": [
     [
      "Never",
      0
     ],
     [
      "Less than monthly",
      1
     ],
     [
      "Monthly",
      2
     ],
     [
      "Weekly",
      3
     ],
     [
      "Daily or almost daily",
      4
     ]
    ]
   },
   {
    "n": 5,
    "q": "How often during the last year have you failed to do what was normally expected from you because of drinking?",
    "opts": [
     [
      "Never",
      0
     ],
     [
      "Less than monthly",
      1
     ],
     [
      "Monthly",
      2
     ],
     [
      "Weekly",
      3
     ],
     [
      "Daily or almost daily",
      4
     ]
    ]
   },
   {
    "n": 6,
    "q": "How often during the last year have you needed an alcoholic drink first thing in the morning to get yourself going after a night of heavy drinking?",
    "opts": [
     [
      "Never",
      0
     ],
     [
      "Less than monthly",
      1
     ],
     [
      "Monthly",
      2
     ],
     [
      "Weekly",
      3
     ],
     [
      "Daily or almost daily",
      4
     ]
    ]
   },
   {
    "n": 7,
    "q": "How often during the last year have you had a feeling of guilt or remorse after drinking?",
    "opts": [
     [
      "Never",
      0
     ],
     [
      "Less than monthly",
      1
     ],
     [
      "Monthly",
      2
     ],
     [
      "Weekly",
      3
     ],
     [
      "Daily or almost daily",
      4
     ]
    ]
   },
   {
    "n": 8,
    "q": "How often during the last year have you been unable to remember what happened the night before because you had been drinking?",
    "opts": [
     [
      "Never",
      0
     ],
     [
      "Less than monthly",
      1
     ],
     [
      "Monthly",
      2
     ],
     [
      "Weekly",
      3
     ],
     [
      "Daily or almost daily",
      4
     ]
    ]
   },
   {
    "n": 9,
    "q": "Have you or someone else been injured as a result of your drinking?",
    "opts": [
     [
      "No",
      0
     ],
     [
      "Yes, but not in the last year",
      2
     ],
     [
      "Yes, during the last year",
      4
     ]
    ]
   },
   {
    "n": 10,
    "q": "Has a relative, friend, doctor, or another health professional expressed concern about your drinking or suggested you cut down?",
    "opts": [
     [
      "No",
      0
     ],
     [
      "Yes, but not in the last year",
      2
     ],
     [
      "Yes, during the last year",
      4
     ]
    ]
   }
  ],
  "scoring": [
   {
    "t": "p",
    "x": "Add the circled numbers for the 10 questions. Questions 1 to 8 score 0–4 or 0–6 as printed; questions 9 and 10 score 0, 2 or 4."
   },
   {
    "t": "table",
    "head": [
     "Risk level",
     "Intervention",
     "U.S. AUDIT score",
     "Possible AUD (DSM-5, ICD-10)"
    ],
    "rows": [
     [
      "Zone I",
      "Feedback",
      "0–6/7 (women/men)",
      "None"
     ],
     [
      "Zone II",
      "Feedback/brief intervention",
      "7/8–15 (women/men)",
      "Mild AUD, hazardous use"
     ],
     [
      "Zone III",
      "Feedback/monitoring/brief outpatient treatment",
      "16–24",
      "Moderate AUD, harmful use"
     ],
     [
      "Zone IV",
      "Referral to evaluation and treatment",
      "25+",
      "Moderate/severe AUD, alcohol dependence"
     ]
    ]
   }
  ],
  "source": "Source: Babor, Higgins-Biddle, & Robaina, 2016. Adapted from material in the public domain.",
  "url": "https://www.ct.gov/dmhas/lib/dmhas/publications/USAUDIT-2017.pdf",
  "interpret": null
 },
 {
  "id": "dast",
  "ref": "Skinner, H. A. (1982). The Drug Abuse Screening Test. Addictive Behavior, 7(4), 363–371.",
  "n": 2,
  "short": "DAST-10",
  "name": "Drug Abuse Screening Test",
  "status": "restricted",
  "chapter": null,
  "gloss": [],
  "pages": "174–175",
  "count": "10 yes/no items · past 12 months",
  "about": [
   {
    "t": "p",
    "x": "A 10-question yes/no screen about possible involvement with drugs — <strong>not including alcohol</strong> — during the past 12 months."
   },
   {
    "t": "p",
    "x": "In its questions, “drug abuse” means (1) using prescribed or over-the-counter drugs in excess of the directions and (2) any nonmedical use of drugs. The drug classes named include cannabis, solvents, tranquilizers, barbiturates, cocaine, stimulants, hallucinogens and narcotics."
   }
  ],
  "restrictedNote": "The DAST-10 is copyrighted (© 1982, 2019, Dr. Harvey Skinner and the Centre for Addiction and Mental Health, Toronto) and TIP 35 reprints it with permission, so the questions are not reproduced here.",
  "scoring": [
   {
    "t": "p",
    "x": "Score 1 point for each question answered “Yes,” except question 3, for which a “No” receives 1 point. The total runs from 0 to 10."
   }
  ],
  "interpret": [
   {
    "t": "table",
    "head": [
     "Score",
     "Degree of problems related to drug abuse",
     "Suggested action"
    ],
    "rows": [
     [
      "0",
      "No problem reported",
      "None at this time"
     ],
     [
      "1–2",
      "Low level",
      "Monitor, reassess at a later date"
     ],
     [
      "3–5",
      "Moderate level",
      "Further investigation"
     ],
     [
      "6–8",
      "Substantial level",
      "Intensive assessment"
     ],
     [
      "9–10",
      "Severe level",
      "Intensive assessment"
     ]
    ]
   }
  ],
  "source": "© Copyright 1982; 2019 by the test author Dr. Harvey Skinner, York University, Toronto, Canada, and by the Centre for Addiction and Mental Health, Toronto, Canada. Sources: Skinner, 1982. Adapted with permission. Available online at no cost (http://adai.washington.edu/instruments/pdf/Drug_Abuse_Screening_Test_105.pdf).",
  "url": "http://adai.washington.edu/instruments/pdf/Drug_Abuse_Screening_Test_105.pdf"
 },
 {
  "id": "drinc",
  "ref": "Miller, W. R., Tonigan, J. S., & Longabaugh, R. (1995). The Drinker Inventory of Consequences (DrInC): An instrument for assessing adverse consequences of alcohol abuse, Test manual (vol. 4). Project MATCH Monograph Series. Rockville, MD: National Institute on Alcohol Abuse and Alcoholism. Retrieved from https://pubs.niaaa.nih.gov/publications/projectmatch/match04.pdf",
  "n": 3,
  "short": "DrInC",
  "name": "Drinker Inventory of Consequences (Lifetime)",
  "status": "pd",
  "chapter": null,
  "gloss": [],
  "pages": "176–178",
  "count": "50 items · lifetime",
  "about": [
   {
    "t": "p",
    "x": "Asks whether each of 50 events that drinkers sometimes experience has <strong>ever</strong> happened to the person (0 = No, 1 = Yes). The total reflects the overall number of alcohol problems over the person’s lifetime, split into five problem areas plus a Control Scale."
   },
   {
    "t": "p",
    "x": "The test manual also has a drug-use version and a short version (the SIP) for alcohol and drugs."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "Here are a number of events that drinkers sometimes experience. Read each one carefully and circle the number that indicates whether this has EVER happened to you (0 = No, 1 = Yes). If an item does not apply to you, circle zero (0)."
   }
  ],
  "scale": [
   [
    "No",
    0
   ],
   [
    "Yes",
    1
   ]
  ],
  "items": [
   {
    "n": 1,
    "q": "I have had a hangover or felt bad after drinking."
   },
   {
    "n": 2,
    "q": "I have felt bad about myself because of my drinking."
   },
   {
    "n": 3,
    "q": "I have missed days of work or school because of my drinking."
   },
   {
    "n": 4,
    "q": "My family or friends have worried or complained about my drinking."
   },
   {
    "n": 5,
    "q": "I have enjoyed the taste of beer, wine, or liquor."
   },
   {
    "n": 6,
    "q": "The quality of my work has suffered because of my drinking."
   },
   {
    "n": 7,
    "q": "My ability to be a good parent has been harmed by my drinking."
   },
   {
    "n": 8,
    "q": "After drinking, I have had trouble with sleeping, staying asleep, or nightmares."
   },
   {
    "n": 9,
    "q": "I have driven a motor vehicle after having three or more drinks."
   },
   {
    "n": 10,
    "q": "My drinking has caused me to use other drugs more."
   },
   {
    "n": 11,
    "q": "I have been sick and vomited after drinking."
   },
   {
    "n": 12,
    "q": "I have been unhappy because of my drinking."
   },
   {
    "n": 13,
    "q": "Because of my drinking, I have not eaten properly."
   },
   {
    "n": 14,
    "q": "I have failed to do what is expected of me because of my drinking."
   },
   {
    "n": 15,
    "q": "Drinking has helped me to relax."
   },
   {
    "n": 16,
    "q": "I have felt guilty or ashamed because of my drinking."
   },
   {
    "n": 17,
    "q": "While drinking, I have said or done embarrassing things."
   },
   {
    "n": 18,
    "q": "When drinking, my personality has changed for the worse."
   },
   {
    "n": 19,
    "q": "I have taken foolish risks when I have been drinking."
   },
   {
    "n": 20,
    "q": "I have gotten into trouble because of drinking."
   },
   {
    "n": 21,
    "q": "While drinking or using drugs, I have said harsh or cruel things to someone."
   },
   {
    "n": 22,
    "q": "When drinking, I have done impulsive things that I regretted later."
   },
   {
    "n": 23,
    "q": "I have gotten into a physical fight while drinking."
   },
   {
    "n": 24,
    "q": "My physical health has been harmed by my drinking."
   },
   {
    "n": 25,
    "q": "Drinking has helped me to have a more positive outlook on life."
   },
   {
    "n": 26,
    "q": "I have had money problems because of my drinking."
   },
   {
    "n": 27,
    "q": "My marriage or love relationship has been harmed by my drinking."
   },
   {
    "n": 28,
    "q": "I have smoked tobacco more when I am drinking."
   },
   {
    "n": 29,
    "q": "My physical appearance has been harmed by my drinking."
   },
   {
    "n": 30,
    "q": "My family has been hurt by my drinking."
   },
   {
    "n": 31,
    "q": "A friendship or close relationship has been damaged by my drinking."
   },
   {
    "n": 32,
    "q": "I have been overweight because of my drinking."
   },
   {
    "n": 33,
    "q": "My sex life has suffered because of my drinking."
   },
   {
    "n": 34,
    "q": "I have lost interest in activities and hobbies because of my drinking."
   },
   {
    "n": 35,
    "q": "When drinking, my social life has been more enjoyable."
   },
   {
    "n": 36,
    "q": "My spiritual or moral life has been harmed by my drinking."
   },
   {
    "n": 37,
    "q": "Because of my drinking, I have not had the kind of life that I want."
   },
   {
    "n": 38,
    "q": "My drinking has gotten in the way of my growth as a person."
   },
   {
    "n": 39,
    "q": "My drinking has damaged my social life, popularity, or reputation."
   },
   {
    "n": 40,
    "q": "I have spent too much or lost a lot of money because of my drinking."
   },
   {
    "n": 41,
    "q": "I have been arrested for driving under the influence of alcohol."
   },
   {
    "n": 42,
    "q": "I have had trouble with the law (other than driving while intoxicated) because of drinking."
   },
   {
    "n": 43,
    "q": "I have lost a marriage or a close love relationship because of my drinking."
   },
   {
    "n": 44,
    "q": "I have been suspended/fired from or left a job or school because of drinking."
   },
   {
    "n": 45,
    "q": "I drank alcohol normally, without any problems."
   },
   {
    "n": 46,
    "q": "I have lost a friend because of my drinking."
   },
   {
    "n": 47,
    "q": "I have had an accident while drinking or intoxicated."
   },
   {
    "n": 48,
    "q": "While drinking or intoxicated, I have been physically hurt, injured, or burned."
   },
   {
    "n": 49,
    "q": "While drinking or intoxicated, I have injured someone else."
   },
   {
    "n": 50,
    "q": "I have broken things while drinking or intoxicated."
   }
  ],
  "scoring": [
   {
    "t": "p",
    "x": "Copy each circled number (0 or 1) next to its item number on the scoring grid, add each column for the scale totals, then add the five problem scales for the <strong>Total DrInC Score</strong>."
   },
   {
    "t": "table",
    "head": [
     "Scale",
     "Items",
     "Number of items"
    ],
    "rows": [
     [
      "Physical",
      "1, 8, 11, 13, 24, 29, 33, 48",
      "8"
     ],
     [
      "Interpersonal",
      "4, 7, 17, 21, 27, 30, 31, 39, 43, 46",
      "10"
     ],
     [
      "Intrapersonal",
      "2, 12, 16, 18, 34, 36, 37, 38",
      "8"
     ],
     [
      "Impulse Control",
      "9, 10, 19, 22, 23, 28, 32, 41, 42, 47, 49, 50",
      "12"
     ],
     [
      "Social Responsibility",
      "3, 6, 14, 20, 26, 40, 44",
      "7"
     ],
     [
      "Control Scale",
      "5, 15, 25, 35, 45",
      "5"
     ]
    ]
   },
   {
    "t": "p",
    "x": "The Control Scale is scored separately and is <strong>not</strong> part of the Total DrInC Score."
   }
  ],
  "interpret": [
   {
    "t": "ul",
    "items": [
     "<strong>Total DrInC Score</strong>: the overall number of alcohol problems that have occurred during the person’s lifetime.",
     "<strong>Control Scale</strong>: zero scores on these items may indicate careless or dishonest responses."
    ]
   },
   {
    "t": "p",
    "x": "See the test manual for more on scoring and interpreting the score."
   }
  ],
  "source": "Source: Miller, Tonigan, & Longabaugh (1995). Adapted from material in the public domain. Available online at no cost (https://pubs.niaaa.nih.gov/publications/projectmatch/match04.pdf).",
  "url": "https://pubs.niaaa.nih.gov/publications/projectmatch/match04.pdf"
 },
 {
  "id": "wiwft",
  "ref": "Miller, W. R., & Brown, J. M. (1994). What I want from treatment (2.0). Retrieved from https://casaa.unm.edu/inst/What%20I%20Want%20From%20Treatment.pdf",
  "n": 4,
  "short": "What I Want From Treatment",
  "name": "What I Want From Treatment (2.0)",
  "status": "restricted",
  "chapter": null,
  "gloss": [],
  "pages": "179–181",
  "count": "69 items rated 0–3",
  "about": [
   {
    "t": "p",
    "x": "A questionnaire that helps clients say what they want, need and expect from treatment. For each of 69 possibilities the client circles how much they want it to be part of their treatment: <strong>0 = No</strong> (definitely do not want or need it), <strong>1 = ?</strong> (unsure, maybe), <strong>2 = Yes</strong>, <strong>3 = Yes!</strong> (definitely want or need it)."
   },
   {
    "t": "p",
    "x": "The items range across detoxification and goals for alcohol, drugs and tobacco; medications; learning about substance use and skills to avoid returning to use; mutual-help groups; personal, emotional and relationship concerns; health, legal, money, housing and work needs; and preferences about the counselor and the format and length of treatment. It ends with an open question asking what else the client would like from treatment."
   }
  ],
  "restrictedNote": "TIP 35 reprints this questionnaire without a public-domain or permission statement, so the items are not reproduced here.",
  "scoring": [
   {
    "t": "p",
    "x": "TIP 35 prints no scoring key or cut-offs. Each answer stands on its own: review the items the client marked 2 or 3 (and the open question) to see what they want from treatment."
   }
  ],
  "source": "Source: Miller & Brown, 1994. Available online at no cost (https://casaa.unm.edu/inst/What%20I%20Want%20From%20Treatment.pdf).",
  "url": "https://casaa.unm.edu/assets/inst/what-i-want-from-treatment.pdf",
  "interpret": null
 },
 {
  "id": "rcq",
  "ref": "Heather, N., & Honekopp, J. (2008). A revised edition of the readiness to change questionnaire (treatment version). Addiction Research and Theory, 16(5), 421–433.",
  "n": 5,
  "short": "RCQ-TV",
  "name": "Readiness to Change Questionnaire (Treatment Version) (Revised)",
  "status": "restricted",
  "chapter": 4,
  "gloss": [
   "Readiness To Change Questionnaire"
  ],
  "pages": "182–183",
  "count": "12 items · 3 stages",
  "about": [
   {
    "t": "p",
    "x": "Asks how the person feels about their drinking right now, even if they have stopped. Chapter 4 describes the Readiness to Change Questionnaire as a tool for healthcare providers who are not addiction specialists: <strong>12 items</strong> adapted from the URICA, mapped to <strong>3 stages</strong> — Precontemplation, Contemplation and Action — each rated on a 5-point agree–disagree scale."
   }
  ],
  "restrictedNote": "TIP 35 reprints the RCQ-TV with permission (Heather & Honekopp, 2008), so the items are not reproduced here. Chapter 4 quotes one example item per stage.",
  "scoring": [
   {
    "t": "table",
    "head": [
     "Scale",
     "Items"
    ],
    "rows": [
     [
      "Precontemplation (PC)",
      "1, 3, 6, 10"
     ],
     [
      "Contemplation (C)",
      "2, 4, 7, 11"
     ],
     [
      "Action (A)",
      "5, 8, 9, 12"
     ]
    ]
   },
   {
    "t": "p",
    "x": "Score every item −2 (strongly disagree), −1 (disagree), 0 (unsure), +1 (agree) or +2 (strongly agree), and add the item scores for each scale. A negative scale score means overall disagreement with that stage’s items; a positive score means overall agreement. TIP 35 prints the range of each scale as −10 through 0 to +10."
   },
   {
    "t": "p",
    "x": "Missing items: if one item on a scale is missing, prorate that scale score (multiply by 4/3, i.e., 1.33). If two or more are missing, the scale score cannot be calculated and the Stage of Change Designation is invalid."
   }
  ],
  "interpret": [
   {
    "t": "p",
    "x": "The <strong>highest</strong> scale score is the Stage of Change Designation."
   },
   {
    "t": "p",
    "x": "If two or more scale scores are equal, the scale <strong>farther along</strong> the continuum (Precontemplation → Contemplation → Action) is the designation. Example from the scoring sheet: PC 6, C 6, A −2 → Contemplation."
   }
  ],
  "source": "Source: Heather & Honekopp, 2008. Adapted with permission. Source article and questionnaire are available online at no cost (https://ndarc.med.unsw.edu.au/sites/default/files/ndarc/resources/TR.019.pdf).",
  "url": "https://ndarc.med.unsw.edu.au/sites/default/files/ndarc/resources/TR.019.pdf"
 },
 {
  "id": "socrates8a",
  "ref": "Miller, W. R., & Tonigan, J. S. (1996). Assessing drinkers’ motivation for change: The Stages of Change Readiness and Treatment Eagerness Scale (SOCRATES). Psychology of Addictive Behaviors, 10(2), 81–89.",
  "n": 6,
  "short": "SOCRATES 8A",
  "name": "Stages of Change Readiness and Treatment Eagerness Scale–Alcohol",
  "status": "pd",
  "chapter": 4,
  "gloss": [
   "SOCRATES"
  ],
  "pages": "184–185",
  "count": "19 items · alcohol",
  "about": [
   {
    "t": "p",
    "x": "Chapter 4: the SOCRATES measures readiness to change. The original had 32 items; the <strong>19-item clinical version</strong> is self-administered and comes as <strong>8A for alcohol</strong> and <strong>8D for drugs</strong>. It assesses problem recognition, ambivalence and taking steps. Scores are fed back as a starting point for discussion, and changes over time show an intervention’s impact."
   },
   {
    "t": "p",
    "x": "The 8A and 8D forms share one scoring form and profile sheet, printed after SOCRATES 8D and repeated below."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "Please read the following statements carefully. Each one describes a way that you might (or might not) feel about your drinking. For each statement, circle one number from 1 to 5 to indicate how much you agree or disagree with it right now. Please circle one and only one number for every statement."
   }
  ],
  "scale": [
   [
    "No! Strongly Disagree",
    1
   ],
   [
    "No Disagree",
    2
   ],
   [
    "? Undecided or Unsure",
    3
   ],
   [
    "Yes Agree",
    4
   ],
   [
    "Yes! Strongly Agree",
    5
   ]
  ],
  "items": [
   {
    "n": 1,
    "q": "I really want to make changes in my drinking."
   },
   {
    "n": 2,
    "q": "Sometimes I wonder if I am an alcoholic."
   },
   {
    "n": 3,
    "q": "If I don’t change my drinking soon, my problems are going to get worse."
   },
   {
    "n": 4,
    "q": "I have already started making some changes in my drinking."
   },
   {
    "n": 5,
    "q": "I was drinking too much at one time, but I’ve managed to change my drinking."
   },
   {
    "n": 6,
    "q": "Sometimes I wonder if my drinking is hurting other people."
   },
   {
    "n": 7,
    "q": "I am a problem drinker."
   },
   {
    "n": 8,
    "q": "I’m not just thinking about changing my drinking, I’m already doing something about it."
   },
   {
    "n": 9,
    "q": "I have already changed my drinking, and I am looking for ways to keep from slipping back to my old pattern."
   },
   {
    "n": 10,
    "q": "I have serious problems with drinking."
   },
   {
    "n": 11,
    "q": "Sometimes I wonder if I am in control of my drinking."
   },
   {
    "n": 12,
    "q": "My drinking is causing a lot of harm."
   },
   {
    "n": 13,
    "q": "I am actively doing things now to cut down or stop drinking."
   },
   {
    "n": 14,
    "q": "I want help to keep from going back to the drinking problems that I had before."
   },
   {
    "n": 15,
    "q": "I know that I have a drinking problem."
   },
   {
    "n": 16,
    "q": "There are times when I wonder if I drink too much."
   },
   {
    "n": 17,
    "q": "I am an alcoholic."
   },
   {
    "n": 18,
    "q": "I am working hard to change my drinking."
   },
   {
    "n": 19,
    "q": "I have made some changes in my drinking, and I want some help to keep from going back to the way I used to drink."
   }
  ],
  "scoring": [
   {
    "t": "p",
    "x": "Transfer each answer (1–5) to its scale and add them up (the SOCRATES Scoring Form, 19-item version 8A and 8D):"
   },
   {
    "t": "table",
    "head": [
     "Scale",
     "Items",
     "Possible range"
    ],
    "rows": [
     [
      "Recognition (Re)",
      "1, 3, 7, 10, 12, 15, 17",
      "7–35"
     ],
     [
      "Ambivalence (Am)",
      "2, 6, 11, 16",
      "4–20"
     ],
     [
      "Taking Steps (Ts)",
      "4, 5, 8, 9, 13, 14, 18, 19",
      "8–40"
     ]
    ]
   },
   {
    "t": "p",
    "x": "Then find each raw score in its column on the <strong>Profile Sheet</strong> to read its decile:"
   },
   {
    "t": "table",
    "head": [
     "Decile",
     "Recognition",
     "Ambivalence",
     "Taking Steps"
    ],
    "rows": [
     [
      "90 (Very High)",
      "—",
      "19–20",
      "39–40"
     ],
     [
      "80",
      "—",
      "18",
      "37–38"
     ],
     [
      "70 (High)",
      "35",
      "17",
      "36"
     ],
     [
      "60",
      "34",
      "16",
      "34–35"
     ],
     [
      "50 (Medium)",
      "32–33",
      "15",
      "33"
     ],
     [
      "40",
      "31",
      "14",
      "31–32"
     ],
     [
      "30 (Low)",
      "29–30",
      "12–13",
      "30"
     ],
     [
      "20",
      "27–28",
      "9–11",
      "26–29"
     ],
     [
      "10 (Very Low)",
      "7–26",
      "4–8",
      "8–25"
     ]
    ]
   },
   {
    "t": "p",
    "x": "The ranges come from 1,726 adults presenting for alcohol treatment in Project MATCH, so a score is ranked low, medium or high <em>relative to people already seeking treatment</em>."
   }
  ],
  "interpret": [
   {
    "t": "p",
    "x": "Use the profile as a general guide, and also look at individual item responses. Adjust the interpretation as needed for drug problems."
   },
   {
    "t": "table",
    "head": [
     "Scale",
     "High scorers",
     "Low scorers"
    ],
    "rows": [
     [
      "Recognition",
      "Directly acknowledge problems related to their drinking, tend to express a desire for change, and see that harm will continue if they do not change.",
      "Deny that alcohol is causing serious problems, reject labels such as “problem drinker” and “alcoholic,” and do not express a desire for change."
     ],
     [
      "Ambivalence",
      "Sometimes wonder whether they are in control, drinking too much, hurting others or alcoholic — ambivalence or uncertainty, and some openness to reflection, as expected in Contemplation.",
      "Do not wonder about these things — either because they “know” drinking causes problems (high Recognition) or “know” it does not (low Recognition). Read a low Ambivalence score against the Recognition score."
     ],
     [
      "Taking Steps",
      "Already doing things to change their drinking and may have had some success; they may want help to persist or prevent backsliding. A high score has been found to predict successful change.",
      "Not currently doing things to change their drinking and have not made such changes recently."
     ]
    ]
   }
  ],
  "source": "Source: Miller & Tonigan, 1996. SOCRATES-8A and SOCRATES-8D are in the public domain and available online at no cost (https://casaa.unm.edu/inst/socratesv8.pdf).",
  "url": "https://casaa.unm.edu/assets/inst/socratesv8.pdf"
 },
 {
  "id": "socrates8d",
  "ref": "Miller, W. R., & Tonigan, J. S. (1996). Assessing drinkers’ motivation for change: The Stages of Change Readiness and Treatment Eagerness Scale (SOCRATES). Psychology of Addictive Behaviors, 10(2), 81–89.",
  "n": 7,
  "short": "SOCRATES 8D",
  "name": "Stages of Change Readiness and Treatment Eagerness Scale–Drug",
  "status": "pd",
  "chapter": 4,
  "gloss": [],
  "pages": "186–189",
  "count": "19 items · drugs",
  "about": [
   {
    "t": "p",
    "x": "Chapter 4: the SOCRATES measures readiness to change. The original had 32 items; the <strong>19-item clinical version</strong> is self-administered and comes as <strong>8A for alcohol</strong> and <strong>8D for drugs</strong>. It assesses problem recognition, ambivalence and taking steps. Scores are fed back as a starting point for discussion, and changes over time show an intervention’s impact."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "Please read the following statements carefully. Each describes a way you might (or might not) feel about your drug use. For each statement, circle one number from 1 to 5 to indicate how much you agree or disagree with it right now. Please circle one and only one number for each statement."
   }
  ],
  "scale": [
   [
    "No! Strongly Disagree",
    1
   ],
   [
    "No Disagree",
    2
   ],
   [
    "? Undecided or Unsure",
    3
   ],
   [
    "Yes Agree",
    4
   ],
   [
    "Yes! Strongly Agree",
    5
   ]
  ],
  "items": [
   {
    "n": 1,
    "q": "I really want to make changes in my use of drugs."
   },
   {
    "n": 2,
    "q": "Sometimes I wonder if I am an addict."
   },
   {
    "n": 3,
    "q": "If I don’t change my drug use soon, my problems are going to get worse."
   },
   {
    "n": 4,
    "q": "I have already started making some changes in my use of drugs."
   },
   {
    "n": 5,
    "q": "I was using drugs too much at one time, but I’ve managed to change that."
   },
   {
    "n": 6,
    "q": "Sometimes I wonder if my drug use is hurting other people."
   },
   {
    "n": 7,
    "q": "I have a drug problem."
   },
   {
    "n": 8,
    "q": "I’m not just thinking about changing my drug use, I’m already doing something about it."
   },
   {
    "n": 9,
    "q": "I have already changed my drug use, and I am looking for ways to keep from slipping back to my old pattern."
   },
   {
    "n": 10,
    "q": "I have serious problems with drugs."
   },
   {
    "n": 11,
    "q": "Sometimes I wonder if I am in control of my drug use."
   },
   {
    "n": 12,
    "q": "My drug use is causing a lot of harm."
   },
   {
    "n": 13,
    "q": "I am actively doing things now to cut down or stop my use of drugs."
   },
   {
    "n": 14,
    "q": "I want help to keep from going back to the drug problems that I had before."
   },
   {
    "n": 15,
    "q": "I know that I have a drug problem."
   },
   {
    "n": 16,
    "q": "There are times when I wonder if I use drugs too much."
   },
   {
    "n": 17,
    "q": "I am a drug addict."
   },
   {
    "n": 18,
    "q": "I am working hard to change my drug use."
   },
   {
    "n": 19,
    "q": "I have made some changes in my drug use, and I want some help to keep from going back to the way I used before."
   }
  ],
  "scoring": [
   {
    "t": "p",
    "x": "Transfer each answer (1–5) to its scale and add them up (the SOCRATES Scoring Form, 19-item version 8A and 8D):"
   },
   {
    "t": "table",
    "head": [
     "Scale",
     "Items",
     "Possible range"
    ],
    "rows": [
     [
      "Recognition (Re)",
      "1, 3, 7, 10, 12, 15, 17",
      "7–35"
     ],
     [
      "Ambivalence (Am)",
      "2, 6, 11, 16",
      "4–20"
     ],
     [
      "Taking Steps (Ts)",
      "4, 5, 8, 9, 13, 14, 18, 19",
      "8–40"
     ]
    ]
   },
   {
    "t": "p",
    "x": "Then find each raw score in its column on the <strong>Profile Sheet</strong> to read its decile:"
   },
   {
    "t": "table",
    "head": [
     "Decile",
     "Recognition",
     "Ambivalence",
     "Taking Steps"
    ],
    "rows": [
     [
      "90 (Very High)",
      "—",
      "19–20",
      "39–40"
     ],
     [
      "80",
      "—",
      "18",
      "37–38"
     ],
     [
      "70 (High)",
      "35",
      "17",
      "36"
     ],
     [
      "60",
      "34",
      "16",
      "34–35"
     ],
     [
      "50 (Medium)",
      "32–33",
      "15",
      "33"
     ],
     [
      "40",
      "31",
      "14",
      "31–32"
     ],
     [
      "30 (Low)",
      "29–30",
      "12–13",
      "30"
     ],
     [
      "20",
      "27–28",
      "9–11",
      "26–29"
     ],
     [
      "10 (Very Low)",
      "7–26",
      "4–8",
      "8–25"
     ]
    ]
   },
   {
    "t": "p",
    "x": "The ranges come from 1,726 adults presenting for alcohol treatment in Project MATCH, so a score is ranked low, medium or high <em>relative to people already seeking treatment</em>."
   }
  ],
  "interpret": [
   {
    "t": "p",
    "x": "Use the profile as a general guide, and also look at individual item responses. Adjust the interpretation as needed for drug problems."
   },
   {
    "t": "table",
    "head": [
     "Scale",
     "High scorers",
     "Low scorers"
    ],
    "rows": [
     [
      "Recognition",
      "Directly acknowledge problems related to their drinking, tend to express a desire for change, and see that harm will continue if they do not change.",
      "Deny that alcohol is causing serious problems, reject labels such as “problem drinker” and “alcoholic,” and do not express a desire for change."
     ],
     [
      "Ambivalence",
      "Sometimes wonder whether they are in control, drinking too much, hurting others or alcoholic — ambivalence or uncertainty, and some openness to reflection, as expected in Contemplation.",
      "Do not wonder about these things — either because they “know” drinking causes problems (high Recognition) or “know” it does not (low Recognition). Read a low Ambivalence score against the Recognition score."
     ],
     [
      "Taking Steps",
      "Already doing things to change their drinking and may have had some success; they may want help to persist or prevent backsliding. A high score has been found to predict successful change.",
      "Not currently doing things to change their drinking and have not made such changes recently."
     ]
    ]
   }
  ],
  "source": "Source: Miller & Tonigan, 1996. SOCRATES-8A and SOCRATES-8D are in the public domain and available online at no cost (https://casaa.unm.edu/inst/socratesv8.pdf).",
  "url": "https://casaa.unm.edu/assets/inst/socratesv8.pdf"
 },
 {
  "id": "urica",
  "ref": "McConnaughy, E. A., Prochaska, J. O., & Velicer, W. F. (1983). Stages of change in psychotherapy: Measurement and sample profiles. Psychotherapy: Theory, Research and Practice, 20, 368–375.",
  "n": 8,
  "short": "URICA",
  "name": "University of Rhode Island Change Assessment Scale",
  "status": "pd",
  "chapter": 4,
  "gloss": [
   "URICA"
  ],
  "pages": "190–192",
  "count": "32 items · 4 stages",
  "about": [
   {
    "t": "p",
    "x": "Chapter 4: developed for psychotherapy and adapted for addiction, the URICA is <strong>the most common clinical measure of stage of change</strong>. It has <strong>32 items</strong>, 8 per stage subscale, rated 1 (strongly disagree) to 5 (strongly agree). The client names a specific “problem” (e.g., cocaine use) and answers with it in mind; they may complete it more than once for several problems. Repeat it periodically to track movement through the stages."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "Each statement below describes how a person might feel when starting therapy or approaching problems in his life. Please indicate the extent to which you tend to agree or disagree with each statement. In each case, make your choice in terms of how you feel right now, not what you have felt in the past or would like to feel. For all the statements that refer to your “problem,” answer in terms of problems related to your drinking (or illicit drug use). The words “here” and “this place” refer to your treatment center.\nThere are five possible responses to each of the items in the questionnaire:\n1 = Strongly Disagree\n2 = Disagree\n3 = Undecided\n4 = Agree\n5 = Strongly Agree\nCircle the number that best describes how much you agree or disagree with each statement."
   }
  ],
  "scale": [
   [
    "Strongly Disagree",
    1
   ],
   [
    "Disagree",
    2
   ],
   [
    "Undecided",
    3
   ],
   [
    "Agree",
    4
   ],
   [
    "Strongly Agree",
    5
   ]
  ],
  "items": [
   {
    "n": 1,
    "q": "As far as I’m concerned, I don’t have any problems that need changing."
   },
   {
    "n": 2,
    "q": "I think I might be ready for some self-improvement."
   },
   {
    "n": 3,
    "q": "I am doing something about the problems that had been bothering me."
   },
   {
    "n": 4,
    "q": "It might be worthwhile to work on my problem."
   },
   {
    "n": 5,
    "q": "I’m not the problem one. It doesn’t make much sense for me to consider changing."
   },
   {
    "n": 6,
    "q": "It worries me that I might slip back on a problem I have already changed, so I am looking for help."
   },
   {
    "n": 7,
    "q": "I am finally doing some work on my problem."
   },
   {
    "n": 8,
    "q": "I’ve been thinking that I might want to change something about myself."
   },
   {
    "n": 9,
    "q": "I have been successful in working on my problem, but I’m not sure I can keep up the effort on my own."
   },
   {
    "n": 10,
    "q": "At times my problem is difficult, but I’m working on it."
   },
   {
    "n": 11,
    "q": "Trying to change is pretty much a waste of time for me because the problem doesn’t have to do with me."
   },
   {
    "n": 12,
    "q": "I’m hoping that I will be able to understand myself better."
   },
   {
    "n": 13,
    "q": "I guess I have faults, but there’s nothing that I really need to change."
   },
   {
    "n": 14,
    "q": "I am really working hard to change."
   },
   {
    "n": 15,
    "q": "I have a problem, and I really think I should work on it."
   },
   {
    "n": 16,
    "q": "I’m not following through with what I had already changed as well as I had hoped, and I want to prevent a relapse of the problem."
   },
   {
    "n": 17,
    "q": "Even though I’m not always successful in changing, I am at least working on my problem."
   },
   {
    "n": 18,
    "q": "I thought once I had resolved the problem I would be free of it, but sometimes I still find myself struggling with it."
   },
   {
    "n": 19,
    "q": "I wish I had more ideas on how to solve my problem."
   },
   {
    "n": 20,
    "q": "I have started working on my problem, but I would like help."
   },
   {
    "n": 21,
    "q": "Maybe this place will be able to help me."
   },
   {
    "n": 22,
    "q": "I may need a boost right now to help me maintain the changes I’ve already made."
   },
   {
    "n": 23,
    "q": "I may be part of the problem, but I don’t really think I am."
   },
   {
    "n": 24,
    "q": "I hope that someone will have some good advice for me."
   },
   {
    "n": 25,
    "q": "Anyone can talk about changing; I’m actually doing something about it."
   },
   {
    "n": 26,
    "q": "All this talk about psychology is boring. Why can’t people just forget about their problems?"
   },
   {
    "n": 27,
    "q": "I’m here to prevent myself from having a relapse of my problem."
   },
   {
    "n": 28,
    "q": "It is frustrating, but I feel I might be having a recurrence of a problem I thought I had resolved."
   },
   {
    "n": 29,
    "q": "I have worries, but so does the next guy. Why spend time thinking about them?"
   },
   {
    "n": 30,
    "q": "I am actively working on my problem."
   },
   {
    "n": 31,
    "q": "I would rather cope with my faults than try to change them."
   },
   {
    "n": 32,
    "q": "After all I had done to try to change my problem, every now and again it comes back to haunt me."
   }
  ],
  "scoring": [
   {
    "t": "table",
    "head": [
     "Subscale",
     "Items"
    ],
    "rows": [
     [
      "Precontemplation",
      "1, 5, 11, 13, 23, 26, 29, 31"
     ],
     [
      "Contemplation",
      "2, 4, 8, 12, 15, 19, 21, 24"
     ],
     [
      "Action",
      "3, 7, 10, 14, 17, 20, 25, 30"
     ],
     [
      "Maintenance",
      "6, 9, 16, 18, 22, 27, 28, 32"
     ]
    ]
   },
   {
    "t": "p",
    "x": "Add the item ratings for each subscale."
   }
  ],
  "interpret": [
   {
    "t": "p",
    "x": "High scores on a stage subscale indicate that the respondent is likely in that stage. The subscales are designed as a continuous measure, however: the stages are not discrete, and a respondent can score high on more than one of the four stages."
   }
  ],
  "source": "Source: McConnaghy, Prochaska, & Velcier, 1983. Reprinted from material in the public domain. Available online at no cost (https://web.uri.edu/cprc/psychotherapy-urica).",
  "url": "https://web.uri.edu/cprc/psychotherapy-urica"
 },
 {
  "id": "adcq",
  "urlLabel": "Free copy (Saint Louis University, online)",
  "urlNote": "Posted on Saint Louis University’s family medicine web pages (dated 2013), not by the authors, and not listed in TIP 35. Its instructions are worded for drinking, so the wording may differ from the version reprinted in TIP 35.",
  "refUrl": "https://doi.org/10.1037/0893-164X.11.2.107",
  "refLabel": "Original article (doi.org)",
  "ref": "Cunningham, J. A., Sobell, L. C., Gavin, D. R., Sobell, M. B., & Breslin, F. C. (1997). Assessing motivation for change: Preliminary development and evaluation of a scale measuring the costs and benefits of changing alcohol or drug use. Psychology of Addictive Behaviors, 11(2), 107–114.",
  "n": 9,
  "short": "ADCQ",
  "name": "Alcohol and Drug Consequences Questionnaire",
  "status": "restricted",
  "chapter": null,
  "gloss": [],
  "pages": "193–194",
  "count": "28 items · benefits and costs of change",
  "about": [
   {
    "t": "p",
    "x": "Asks which consequences of <strong>stopping or cutting down</strong> their primary drug (alcohol or another drug, written in by the client) are important to the client — “If I stop or cut down…”. It notes that there are no right or wrong answers."
   },
   {
    "t": "p",
    "x": "Each of 28 possible consequences is rated 1 (not important) to 5 (extremely important), or 0 if not applicable. Some items are <strong>benefits</strong> of changing and some are <strong>costs</strong>, so it works like a decisional balance (Chapter 5)."
   }
  ],
  "restrictedNote": "TIP 35 reprints the ADCQ with permission (Cunningham, Sobell, Gavin, Sobell & Breslin, 1997), so the items are not reproduced here.",
  "scoring": [
   {
    "t": "p",
    "x": "Each scale score is the sum of its items divided by the maximum possible score, times 100."
   },
   {
    "t": "table",
    "head": [
     "Scale",
     "Items",
     "Calculation"
    ],
    "rows": [
     [
      "Benefits",
      "1, 4, 6, 7, 9, 10, 11, 12, 13, 18, 19, 20, 23, 25, 27",
      "Total ÷ 75 (15 items × 5) × 100"
     ],
     [
      "Costs",
      "2, 3, 5, 8, 14, 15, 16, 17, 21, 22, 24, 26, 28",
      "Total ÷ 65 (13 items × 5) × 100"
     ]
    ]
   }
  ],
  "source": "Source: Cunningham, Sobell, Gavin, Sobell, & Breslin, 1997. Adapted with permission.",
  "url": "https://www.slu.edu/medicine/family-medicine/-pdf/researchinstruments-substancuse-alcoholanddrugconsequencesquestionnaire.pdf",
  "interpret": null
 },
 {
  "id": "alcdb",
  "ref": "Prochaska, J. O., Velicer, W. F., Rossi, J. S., Goldstein, M. G., Marcus, B. H., Rakowski, W., … Rossi, S. R. (1994). Stages of Change and decisional balance for 12 problem behaviors. Health Psychology, 13, 39–46.",
  "n": 10,
  "short": "Alcohol DB Scale",
  "name": "Alcohol Decisional Balance Scale",
  "status": "pd",
  "chapter": 5,
  "gloss": [
   "Alcohol Decisional Balance Scale"
  ],
  "pages": "195–196",
  "count": "20 items · pros and cons",
  "about": [
   {
    "t": "p",
    "x": "Chapter 5: the Alcohol and Drug Use Decisional Balance Scales are validated instruments in which clients rate, <strong>1 to 5</strong>, how important each statement is to their decision about drinking alcohol right now. Explore the high-scoring items with the client to build discrepancy."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "The following statements may play a part in making a decision about using alcohol. We would like to know how important each statement is to you at the present time in relation to making a decision about your using alcohol. Please rate the level of importance to each statement on the following 5 points:\n1 = Not important at all\n2 = Slightly important\n3 = Moderately important\n4 = Very important\n5 = Extremely important\nPlease read each statement and circle the number on the right to indicate how you rate its level of importance as it relates to your making a decision about whether to drink at the present time."
   }
  ],
  "scale": [
   [
    "Not important at all",
    1
   ],
   [
    "Slightly important",
    2
   ],
   [
    "Moderately important",
    3
   ],
   [
    "Very important",
    4
   ],
   [
    "Extremely important",
    5
   ]
  ],
  "items": [
   {
    "n": 1,
    "q": "My drinking causes problems with others."
   },
   {
    "n": 2,
    "q": "I like myself better when I am drinking."
   },
   {
    "n": 3,
    "q": "Because I continue to drink some people think I lack the character to quit."
   },
   {
    "n": 4,
    "q": "Drinking helps me deal with problems."
   },
   {
    "n": 5,
    "q": "Having to lie to others about my drinking bothers me."
   },
   {
    "n": 6,
    "q": "Some people try to avoid me when I drink."
   },
   {
    "n": 7,
    "q": "Drinking helps me to have fun and socialize."
   },
   {
    "n": 8,
    "q": "Drinking interferes with my functioning at home or/and at work."
   },
   {
    "n": 9,
    "q": "Drinking makes me more of a fun person."
   },
   {
    "n": 10,
    "q": "Some people close to me are disappointed in me because of my drinking."
   },
   {
    "n": 11,
    "q": "Drinking helps me to loosen up and express myself."
   },
   {
    "n": 12,
    "q": "I seem to get myself into trouble when drinking."
   },
   {
    "n": 13,
    "q": "I could accidentally hurt someone because of my drinking."
   },
   {
    "n": 14,
    "q": "Not drinking at a social gathering would make me feel too different."
   },
   {
    "n": 15,
    "q": "I am losing the trust and respect of my coworkers and/or spouse because of my drinking."
   },
   {
    "n": 16,
    "q": "My drinking helps give me energy and keeps me going."
   },
   {
    "n": 17,
    "q": "I am more sure of myself when I am drinking."
   },
   {
    "n": 18,
    "q": "I am setting a bad example for others with my drinking."
   },
   {
    "n": 19,
    "q": "Without alcohol, my life would be dull and boring."
   },
   {
    "n": 20,
    "q": "People seem to like me better when I am drinking."
   }
  ],
  "scoring": [
   {
    "t": "table",
    "head": [
     "Scale",
     "Items"
    ],
    "rows": [
     [
      "Pros of Drinking",
      "2, 4, 7, 9, 11, 14, 16, 17, 19, 20"
     ],
     [
      "Cons of Drinking",
      "1, 3, 5, 6, 8, 10, 12, 13, 15, 18"
     ]
    ]
   },
   {
    "t": "p",
    "x": "<strong>Pros</strong>: add the 10 Pros items and divide by 10. <strong>Cons</strong>: add the 10 Cons items and divide by 10."
   },
   {
    "t": "p",
    "x": "<strong>Difference score</strong> = Pros − Cons."
   }
  ],
  "interpret": [
   {
    "t": "ul",
    "items": [
     "Positive difference: the person endorses more Pros than Cons of drinking alcohol.",
     "Negative difference: the person endorses more Cons than Pros of drinking alcohol."
    ]
   }
  ],
  "source": "Source: Prochaska et al., 1994. Reprinted from material in the public domain. Available online at no cost (https://habitslab.umbc.edu/files/2014/07/Alcohol-Decisional-Balance-scale.pdf).",
  "url": "https://habitslab.umbc.edu/files/2014/07/Alcohol-Decisional-Balance-scale.pdf"
 },
 {
  "id": "drugdb",
  "ref": "Prochaska, J. O., Velicer, W. F., Rossi, J. S., Goldstein, M. G., Marcus, B. H., Rakowski, W., … Rossi, S. R. (1994). Stages of Change and decisional balance for 12 problem behaviors. Health Psychology, 13, 39–46.",
  "n": 11,
  "short": "Drug Use DB Scale",
  "name": "Drug Use Decisional Balance Scale",
  "status": "pd",
  "chapter": 5,
  "gloss": [],
  "pages": "197–198",
  "count": "20 items · pros and cons",
  "about": [
   {
    "t": "p",
    "x": "Chapter 5: the Alcohol and Drug Use Decisional Balance Scales are validated instruments in which clients rate, <strong>1 to 5</strong>, how important each statement is to their decision about using drugs right now. Explore the high-scoring items with the client to build discrepancy."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "The following statements may play a part in making a decision about using drugs. We would like to know how important each statement is to you at the present time in relation to making a decision about your using drugs. Please rate the level of importance to each statement on the following 5 points:\n1=Not important at all\n2=Slightly important\n3=Moderately important\n4=Very important\n5=Extremely important\nPlease read each statement and circle the number on the right to indicate how you rate its level of importance as it relates to your making a decision about whether to use drugs at the present time."
   }
  ],
  "scale": [
   [
    "Not important at all",
    1
   ],
   [
    "Slightly important",
    2
   ],
   [
    "Moderately important",
    3
   ],
   [
    "Very important",
    4
   ],
   [
    "Extremely important",
    5
   ]
  ],
  "items": [
   {
    "n": 1,
    "q": "My drug use causes problems with others."
   },
   {
    "n": 2,
    "q": "I like myself better when I am using drugs."
   },
   {
    "n": 3,
    "q": "Because I continue to use drugs some people think I lack the character to quit."
   },
   {
    "n": 4,
    "q": "Using drugs helps me deal with problems."
   },
   {
    "n": 5,
    "q": "Having to lie to others about my drug use bothers me."
   },
   {
    "n": 6,
    "q": "Some people try to avoid me when I use drugs."
   },
   {
    "n": 7,
    "q": "Drug use helps me to have fun and socialize."
   },
   {
    "n": 8,
    "q": "Drug use interferes with my functioning at home or/and at work."
   },
   {
    "n": 9,
    "q": "Drug use makes me more of a fun person."
   },
   {
    "n": 10,
    "q": "Some people close to me are disappointed in me because of my drug use."
   },
   {
    "n": 11,
    "q": "Drug use helps me to loosen up and express myself."
   },
   {
    "n": 12,
    "q": "I seem to get myself into trouble when I use drugs."
   },
   {
    "n": 13,
    "q": "I could accidentally hurt someone because of my drug use."
   },
   {
    "n": 14,
    "q": "Not using drugs at a social gathering would make me feel too different."
   },
   {
    "n": 15,
    "q": "I am losing the trust and respect of my coworkers and/or spouse because of my drug use."
   },
   {
    "n": 16,
    "q": "My drug use helps give me energy and keeps me going."
   },
   {
    "n": 17,
    "q": "I am more sure of myself when I am using drugs."
   },
   {
    "n": 18,
    "q": "I am setting a bad example for others with my drug use."
   },
   {
    "n": 19,
    "q": "Without drugs, my life would be dull and boring."
   },
   {
    "n": 20,
    "q": "People seem to like me better when I use drugs."
   }
  ],
  "scoring": [
   {
    "t": "table",
    "head": [
     "Scale",
     "Items"
    ],
    "rows": [
     [
      "Pros of Using Drugs",
      "2, 4, 7, 9, 11, 14, 16, 17, 19, 20"
     ],
     [
      "Cons of Using Drugs",
      "1, 3, 5, 6, 8, 10, 12, 13, 15, 18"
     ]
    ]
   },
   {
    "t": "p",
    "x": "<strong>Pros</strong>: add the 10 Pros items and divide by 10. <strong>Cons</strong>: add the 10 Cons items and divide by 10."
   },
   {
    "t": "p",
    "x": "<strong>Difference score</strong> = Pros − Cons."
   }
  ],
  "interpret": [
   {
    "t": "ul",
    "items": [
     "Positive difference: the person endorses more Pros than Cons of using drugs.",
     "Negative difference: the person endorses more Cons than Pros of using drugs."
    ]
   }
  ],
  "source": "Source: Prochaska et al., 1994. Reprinted from material in the public domain. Available online at no cost (https://habitslab.umbc.edu/files/2014/07/Drug-Decisional-Balance-scale20item.pdf).",
  "url": "https://habitslab.umbc.edu/files/2014/07/Drug-Decisional-Balance-scale20item.pdf"
 },
 {
  "id": "bscq",
  "ref": "Breslin, F. C., Sobell, L. C., Sobell, M. B., & Agrawal, S. (2000). A comparison of a brief and long version of the Situational Confidence Questionnaire. Behaviour Research and Therapy, 38(12), 1211–1220.",
  "n": 12,
  "short": "BSCQ",
  "name": "Brief Situational Confidence Questionnaire",
  "status": "pd",
  "chapter": 7,
  "gloss": [
   "Situational Confidence Questionnaire"
  ],
  "pages": "199–200",
  "count": "8 situations · 0–100%",
  "about": [
   {
    "t": "p",
    "x": "Chapter 7: the short form of the Situational Confidence Questionnaire (SCQ). It rates confidence to resist heavy drinking or the urge to use the primary drug in the same <strong>8 types of situations</strong>, from <strong>0%</strong> (not at all confident) to <strong>100%</strong> (totally confident). It shows the high-risk situations where self-efficacy is low, which helps set realistic goals and an individualized plan."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "Listed below are eight types of situations in which some people experience an alcohol or drug problem. Imagine yourself as you are right now in each of the following types of situations. Indicate on the scale provided how confident you are right now that you will be able to resist drinking heavily or resist the urge to use your primary drug in each situation by placing an “X” along the line, from 0% “Not at all confident” to 100% “Totally confident.”"
   },
   {
    "title": "Each item begins",
    "x": "Right now I would be able to resist the urge to drink heavily or use my primary drug in situations involving…"
   }
  ],
  "scale": [
   [
    "Not at all confident",
    0
   ],
   [
    "Totally confident",
    100
   ]
  ],
  "scaleLabel": "Mark an “X” on a line from 0% to 100%:",
  "items": [
   {
    "n": 1,
    "q": "UNPLEASANT EMOTIONS (e.g., if I were depressed about things in general; if everything were going badly for me)."
   },
   {
    "n": 2,
    "q": "PHYSICAL DISCOMFORT (e.g., if I were to have trouble sleeping; if I felt jumpy and physically tense)."
   },
   {
    "n": 3,
    "q": "PLEASANT EMOTIONS (e.g., if something good happened and I felt like celebrating; if everything were going well)."
   },
   {
    "n": 4,
    "q": "TESTING CONTROL OVER MY USE OF ALCOHOL OR DRUGS (e.g., if I were to start to believe that alcohol or drugs were no longer a problem for me; if I felt confident that I could handle drugs or several drinks)."
   },
   {
    "n": 5,
    "q": "URGES AND TEMPTATIONS (e.g., if I suddenly had an urge to drink or use drugs; if I were in a situation where I had often used drugs or drank heavily)."
   },
   {
    "n": 6,
    "q": "CONFLICT WITH OTHERS (e.g., if I had an argument with a friend; if I were not getting along well with others at work)."
   },
   {
    "n": 7,
    "q": "SOCIAL PRESSURE TO USE (e.g., if someone were to pressure me to “be a good sport” and drink or use drugs with him; if I were invited to someone’s home and he offered me a drink or drugs)."
   },
   {
    "n": 8,
    "q": "PLEASANT TIMES WITH OTHERS (e.g., if I wanted to celebrate with a friend; if I were enjoying myself at a party and wanted to feel even better)."
   }
  ],
  "scoring": [
   {
    "t": "p",
    "x": "Each of the 8 situations produces its own score from 0% to 100%. There is no total."
   },
   {
    "t": "p",
    "x": "TIP 35 lists online instructions for presenting the findings to clients and a blank self-confidence profile chart at www.nova.edu/gsc/forms/ (BSCQ Instructions.pdf and BSCQ blank.pdf)."
   }
  ],
  "interpret": [
   {
    "t": "p",
    "x": "Identify the <strong>1 to 3 situations with the lowest confidence</strong> for further discussion."
   }
  ],
  "source": "Source: Bresslin, Sobell, & Sobell, 2000. Adapted from material in the public domain.",
  "url": null
 },
 {
  "id": "aases",
  "ref": "DiClemente, C. C., Carbonari, J. P., Montgomery, R. P. G., & Hughes, S. O. (1994). The Alcohol Abstinence Self-Efficacy Scale. Journal of Studies on Alcohol, 55(2), 141–148.",
  "n": 13,
  "short": "AASES",
  "name": "Alcohol Abstinence Self-Efficacy Scale",
  "status": "pd",
  "chapter": 7,
  "gloss": [
   "AASES"
  ],
  "pages": "201–202",
  "count": "20 situations · rated 1–5",
  "about": [
   {
    "t": "p",
    "x": "Chapter 7: the AASES assesses self-efficacy to <strong>abstain</strong> from alcohol across <strong>20 situations</strong>, covering both temptation to drink and confidence to abstain. TIP 35 prints the confidence form (“how confident you are that you would not drink alcohol in each situation” during the past week). A Drug Abstinence Self-Efficacy Scale, adapted from the AASES, is available online."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "Listed below are a number of situations that lead some people to use alcohol. We would like to know how confident you are that you would not drink alcohol in each situation.\nCircle the number that best describes your feelings of confidence not to drink alcohol in each situation during the past week according to the following scale:\n1 = Not at all confident\n2 = Not very confident\n3 = Moderately confident\n4 = Very confident\n5 = Extremely confident"
   }
  ],
  "scale": [
   [
    "Not at all confident",
    1
   ],
   [
    "Not very confident",
    2
   ],
   [
    "Moderately confident",
    3
   ],
   [
    "Very confident",
    4
   ],
   [
    "Extremely confident",
    5
   ]
  ],
  "items": [
   {
    "n": 1,
    "q": "When I am in agony because of stopping or withdrawing from alcohol use."
   },
   {
    "n": 2,
    "q": "When I have a headache."
   },
   {
    "n": 3,
    "q": "When I am feeling depressed."
   },
   {
    "n": 4,
    "q": "When I am on vacation and want to relax."
   },
   {
    "n": 5,
    "q": "When I am concerned about someone."
   },
   {
    "n": 6,
    "q": "When I am worried."
   },
   {
    "n": 7,
    "q": "When I have the urge to try just one drink to see what happens."
   },
   {
    "n": 8,
    "q": "When I am being offered a drink in a social situation."
   },
   {
    "n": 9,
    "q": "When I dream about taking a drink."
   },
   {
    "n": 10,
    "q": "When I want to test my will power over drinking."
   },
   {
    "n": 11,
    "q": "When I am feeling a physical need or craving for alcohol."
   },
   {
    "n": 12,
    "q": "When I am physically tired."
   },
   {
    "n": 13,
    "q": "When I am experiencing some physical pain or injury."
   },
   {
    "n": 14,
    "q": "When I feel like blowing up because of frustration."
   },
   {
    "n": 15,
    "q": "When I see others drinking at a bar or a party."
   },
   {
    "n": 16,
    "q": "When I sense everything is going wrong for me."
   },
   {
    "n": 17,
    "q": "When people I used to drink with encourage me to drink."
   },
   {
    "n": 18,
    "q": "When I am feeling angry inside."
   },
   {
    "n": 19,
    "q": "When I experience an urge or impulse to take a drink that catches me unprepared."
   },
   {
    "n": 20,
    "q": "When I am excited or celebrating with others."
   }
  ],
  "scoring": [
   {
    "t": "table",
    "head": [
     "Subscale",
     "Item numbers (as printed)"
    ],
    "rows": [
     [
      "Negative Affect",
      "1, 3, 9"
     ],
     [
      "Social/Positive",
      "10, 11, 12"
     ],
     [
      "Physical and Other Concerns",
      "2, 7, 8"
     ],
     [
      "Cravings and Urges",
      "4, 5, 6"
     ]
    ]
   },
   {
    "t": "p",
    "x": "Overall mean Abstinence Self-Efficacy (or Temptation) score: sum all items and divide by 12. Subscale means: sum the subscale’s items and divide by the number of items (3)."
   },
   {
    "t": "note",
    "title": "Check before scoring",
    "x": "This key is reproduced exactly as printed, but it does not fit the 20-item form above: it covers only 12 item numbers and divides by 12, which matches a 12-item version. Score with the key from the official 20-item form (link below) rather than this one."
   }
  ],
  "source": "Source: DiClemente, Carbonari, Montgomery, & Hughes, 1994. Adapted from material in the public domain. AASES available online at no cost (https://habitslab.umbc.edu/files/2014/07/Alcohol-Abstinence-Self-efficacy-Scale-20item.pdf). Drug Abstinence Self-Efficacy Scale (adapted version of AASES) available online at no cost (https://habitslab.umbc.edu/files/2014/07/Drug-Abstinence-Self-efficacy-scale.pdf).",
  "url": "https://habitslab.umbc.edu/files/2014/07/Alcohol-Abstinence-Self-efficacy-Scale-20item.pdf",
  "interpret": null
 },
 {
  "id": "mikt",
  "ref": "Moyers, T. B., Martin, T., & Christopher, P. (2005). Motivational interviewing knowledge test. Albuquerque, NM: Center on Alcoholism, Substance Abuse, and Addictions, University of New Mexico. Retrieved from https://casaa.unm.edu/download/ELICIT/MI%20Knowledge%20Test.pdf",
  "n": 14,
  "short": "MI Knowledge Test",
  "name": "Motivational Interviewing Knowledge Test",
  "status": "pd",
  "chapter": null,
  "gloss": [],
  "pages": "203–207",
  "count": "22 multiple-choice items",
  "about": [
   {
    "t": "p",
    "x": "A 22-item multiple-choice test of MI knowledge, with an answer key. It dates from 2005 and draws on the 1991 and 2002 editions of Miller and Rollnick, so some items use older MI terms such as “self-motivational statements” and “rolling with resistance” (see Chapter 3, Exhibit 3.1, for how MI terms have changed)."
   },
   {
    "t": "p",
    "x": "Try the interactive <a href=\"#/tools/mikt/test\">self-test</a>: it scores your answers against the key, skips the misprinted question 18, and notes the updated MI term wherever an item uses an older one."
   }
  ],
  "instructions": [
   {
    "title": "Instructions (as printed)",
    "x": "Choose the best answer for each of the following questions. Each question has only one correct answer."
   }
  ],
  "contexts": [
   {
    "title": "Exchange A (questions 12–15): Please read this exchange between counselor and client and answer the questions that follow:",
    "lines": [
     "1-C: I know I messed up. I ruined my family, my wife hates me, I got fired from my job, and now I just feel so hopeless. I’m sad all the time, and it’s like I can’t do anything about it.",
     "2-T: Where did you work?",
     "3-C: Joe’s Auto. I just felt lost there all day, like I didn’t want to be there.",
     "4-T: Did your boss know you were drinking?",
     "5-C: Yeah, when he fired me, he told me he could smell the alcohol. God, he must really think I’m a loser.",
     "6-T: What you are is an addict.",
     "7-C: I’m not addicted, OK. I just need a few beers after work to calm down.",
     "8-T: No, you are an addict. You have to admit you are powerless over it before you can better."
    ]
   },
   {
    "title": "Exchange B (questions 16–18): For the following exchange between client and therapist, answer the questions below:",
    "lines": [
     "1-T: What would you like to discuss today?",
     "2-C: Look, the judge said I gotta come here, but I don’t think I need to be here, so don’t expect me to cooperate with you.",
     "3-T: You feel that things are fine.",
     "4-C: I’m not saying that everything is perfect, but I’m not a dope fiend.",
     "5-T: Do you feel that others see you that way?",
     "6-C: Yeah! People at work are always on my case about it, saying I’m gonna die someday from it. They just need to mind their business.",
     "7-T: Sounds like they’re concerned.",
     "8-C: Yeah, well, I guess."
    ]
   }
  ],
  "items": [
   {
    "n": 1,
    "q": "Which of the following is NOT consistent with the MI approach to counseling?",
    "choices": [
     "rolling with resistance",
     "avoiding argumentation",
     "confronting denial",
     "supporting self-efficacy"
    ],
    "answer": "c"
   },
   {
    "n": 2,
    "q": "Within the MI framework, advice may be given by a therapist to a client",
    "choices": [
     "at any time",
     "when the client requests it",
     "after the therapist receives permission to give it",
     "never",
     "both a and b",
     "both b and c"
    ],
    "answer": "f"
   },
   {
    "n": 3,
    "q": "According to Miller and Rollnick (1991), when a therapist argues that a client’s behavior needs to change, the client often responds by",
    "choices": [
     "accepting the need for change",
     "arguing against change",
     "asking for advice",
     "moving to the next stage in the process of change",
     "all of the above"
    ],
    "answer": "b"
   },
   {
    "n": 4,
    "q": "Two strategies which are usually effective for avoiding the confrontation-denial trap are",
    "choices": [
     "giving advice and reflective listening",
     "reflective listening and eliciting self-motivational statements",
     "skills training and warning",
     "aversive conditioning and supporting self-efficacy"
    ],
    "answer": "b"
   },
   {
    "n": 5,
    "q": "The MI approach is",
    "choices": [
     "completely non-directive",
     "highly authoritarian",
     "directive but client-centered",
     "primarily educational",
     "all of the above"
    ],
    "answer": "c"
   },
   {
    "n": 6,
    "q": "To develop discrepancy, therapists using the MI approach",
    "choices": [
     "inform clients about the harmful effects of their behavior",
     "direct clients to stop the problem behavior",
     "warn clients about the future consequences of their behavior",
     "point out differences between the client’s own stated goals and current behavior",
     "none of the above"
    ],
    "answer": "d"
   },
   {
    "n": 7,
    "q": "According to Miller & Rollnick (1991), resistance is best seen as",
    "choices": [
     "a trait of difficult clients",
     "a healthy assertion of independence",
     "a function of a mismatch between the client’s stage of change and the therapist’s strategies",
     "an indicator of poor prognosis which, if persistent, indicates that the client should be dropped from counseling",
     "none of the above"
    ],
    "answer": "c"
   },
   {
    "n": 8,
    "q": "Within the MI framework, ambivalence about change on the part of the client is seen as",
    "choices": [
     "normal and useful",
     "a major roadblock to change",
     "pathological",
     "irrelevant"
    ],
    "answer": "a"
   },
   {
    "n": 9,
    "q": "Which of the following therapist behaviors is NOT a roadblock to a client’s self-expression",
    "choices": [
     "interpreting or analyzing",
     "warning",
     "reflecting",
     "reassuring, sympathizing, or consoling"
    ],
    "answer": "c"
   },
   {
    "n": 10,
    "q": "Within the MI framework, individual client assessment is seen as",
    "choices": [
     "a stumbling block to change",
     "an unnecessary distraction since the only effective treatment is already known",
     "a vital part of determining a client’s needs",
     "a dehumanizing and authoritarian exercise"
    ],
    "answer": "c"
   },
   {
    "n": 11,
    "q": "Which of the following is NOT an MI-consistent strategy for handling resistance?",
    "choices": [
     "simple reflection",
     "amplified reflection",
     "argument",
     "reframe",
     "emphasizing personal control"
    ],
    "answer": "c"
   },
   {
    "n": 12,
    "q": "Therapist statement #2 represents",
    "choices": [
     "a failure to express empathy",
     "a failure to develop discrepancy",
     "a failure to explore ambivalence",
     "all of the above",
     "none of the above"
    ],
    "answer": "d",
    "note": "Refers to Exchange A above."
   },
   {
    "n": 13,
    "q": "Therapist statements #2 and #4 indicate which MI trap?",
    "choices": [
     "labeling trap",
     "Q-A trap",
     "expert trap",
     "premature focus trap",
     "blaming trap"
    ],
    "answer": "b",
    "note": "Refers to Exchange A above."
   },
   {
    "n": 14,
    "q": "Therapist statement #6 reflects which MI trap?",
    "choices": [
     "labeling trap",
     "Q-A trap",
     "expert trap",
     "premature focus trap",
     "blaming trap"
    ],
    "answer": "a",
    "note": "Refers to Exchange A above."
   },
   {
    "n": 15,
    "q": "Therapist statement #8 represents",
    "choices": [
     "a confrontation of denial",
     "an accurate reflection",
     "a failure to roll with resistance",
     "both a and b",
     "both a and c"
    ],
    "answer": "e",
    "note": "Refers to Exchange A above."
   },
   {
    "n": 16,
    "q": "Therapist statement #3 is a demonstration of",
    "choices": [
     "the MI trap of labeling",
     "the MI trap of premature focus",
     "the MI principle of rolling with resistance",
     "the MI principle of expressing empathy",
     "both c and d"
    ],
    "answer": "e",
    "note": "Refers to Exchange B above."
   },
   {
    "n": 17,
    "q": "This therapist is using which opening strategy?",
    "choices": [
     "listen reflectively",
     "affirm",
     "summarize",
     "all of the above"
    ],
    "answer": "a",
    "note": "Refers to Exchange B above."
   },
   {
    "n": 18,
    "q": "This therapist is using which opening strategy?",
    "choices": [
     "listen reflectively",
     "affirm",
     "summarize",
     "all of the above"
    ],
    "answer": "c",
    "note": "Refers to Exchange B above."
   },
   {
    "n": 19,
    "q": "The importance and confidence rulers are",
    "choices": [
     "a means of assessing client readiness",
     "an intervention that is inconsistent with MI",
     "used only with clients who are in the action stage of change",
     "a way of rolling with resistance"
    ],
    "answer": "a"
   },
   {
    "n": 20,
    "q": "According to Miller and Rollnick (2002), a therapist should respond to client change talk in all of the following ways, except by",
    "choices": [
     "elaborating on the change talk with an open question",
     "reflecting the client’s change talk",
     "asking the client to commit to a treatment plan",
     "summarizing the client’s language"
    ],
    "answer": "c"
   },
   {
    "n": 21,
    "q": "The purpose of querying extreme consequences of maintaining behavior is",
    "choices": [
     "to elicit the cons of behavior change (counter change talk)",
     "to warn the client about negative consequences of their behavior",
     "to elicit the pros of behavior change (self-motivating statements)",
     "to scare the client straight"
    ],
    "answer": "c"
   },
   {
    "n": 22,
    "q": "What would be the best therapist response to elicit change talk in the following situation?",
    "pre": [
     "T: “How confident are you on a scale of 0 to 10 that you can make this change?”",
     "C: “About a 4.”"
    ],
    "choices": [
     "So, you’re about a 4.",
     "Why are you a 4 and not a 0?",
     "You’ve got some confidence, but not a lot.",
     "Why are you not a 10?"
    ],
    "answer": "b"
   }
  ],
  "key": true,
  "keyNote": "As printed. Questions 17 and 18 have the same question and choices, and the key gives question 18 as “c) the expert trap,” which is not one of its printed choices.",
  "source": "Source: Moyers, Martin, & Christopher, 2005. Reprinted from material in the public domain. Available online at no cost (https://casaa.unm.edu/download/ELICIT/MI%20Knowledge%20Test.pdf).",
  "url": "https://casaa.unm.edu/assets/docs/mi-knowledge-test.pdf",
  "scoring": null,
  "interpret": null
 }
];

window.MI_RESOURCES = [
 {
  "group": "Motivational Interviewing and Motivational Enhancement Therapy",
  "items": [
   {
    "name": "Motivational Interviewing Network of Trainers (MINT)",
    "desc": "Links to publications, MI assessment and coding resources, and training resources and events.",
    "links": [
     [
      "motivationalinterviewing.org",
      "https://www.motivationalinterviewing.org"
     ]
    ]
   },
   {
    "name": "Motivational Enhancement Therapy Manual",
    "desc": "The history of MET and its use in Project MATCH: an overview of MET, its relationship to the stages of change, the structure of MET sessions, and a thorough review of the assessment and personalized feedback process.",
    "links": [
     [
      "MET manual (PDF)",
      "https://casaa.unm.edu/tools/met.pdf"
     ]
    ]
   },
   {
    "name": "IRETA Motivational Interviewing Toolkit",
    "desc": "From the Institute for Research, Education & Training in Addictions: educational materials about MI and links to no-cost MI resources.",
    "links": [
     [
      "ireta.org MI toolkit",
      "https://ireta.org/resources/motivational-interviewing-toolkit"
     ]
    ]
   }
  ]
 },
 {
  "group": "Stages of Change",
  "items": [
   {
    "name": "HABITS Lab, University of Maryland, Baltimore County",
    "desc": "Health and Addictive Behaviors: Investigating Transtheoretical Solutions Lab — an overview of the Transtheoretical Model, printable assessments and scoring information, publications and learning tools.",
    "links": [
     [
      "habitslab.umbc.edu",
      "https://habitslab.umbc.edu"
     ]
    ]
   }
  ]
 },
 {
  "group": "Training and Supervision",
  "items": [
   {
    "name": "MIA-STEP: Motivational Interviewing Assessment — Supervisory Tools for Enhancing Proficiency",
    "desc": "Tools for mentoring counselors in the MI skills used in engagement and assessment of people with SUDs: teaching tools, counselor self-assessment skill summaries, MI rating guides and forms, transcripts and ratings of sample interviews, and trainer instructions.",
    "links": [
     [
      "MIA-STEP manual (PDF)",
      "https://www.motivationalinterviewing.org/sites/default/files/mia-step.pdf"
     ]
    ]
   },
   {
    "name": "Center on Alcoholism, Substance Abuse, and Addictions (CASAA)",
    "desc": "University of New Mexico research center with alcohol and drug assessment tools, MI coding tools and therapist manuals, and audio files and uncoded transcripts of counselor role plays for training.",
    "links": [
     [
      "casaa.unm.edu",
      "https://casaa.unm.edu"
     ]
    ]
   },
   {
    "name": "MINT Motivational Interviewing Resources",
    "desc": "Downloadable coding manuals for assessing counselor fidelity to the MI spirit and skills: the MISC, MISC 2.5, MITI 4.2.1 and the AMIGOS group observer scale.",
    "links": [
     [
      "MINT resources page",
      "https://motivationalinterviewing.org/motivational-interviewing-resources"
     ],
     [
      "MISC (PDF)",
      "https://casaa.unm.edu/assets/docs/misc4.pdf"
     ],
     [
      "MISC 2.5 (PDF)",
      "https://casaa.unm.edu/download/misc25.pdf"
     ],
     [
      "MITI 4.2.1 (PDF)",
      "https://motivationalinterviewing.org/sites/default/files/miti4_2.pdf"
     ],
     [
      "AMIGOS v1.2 (PDF)",
      "https://motivationalinterviewing.org/sites/default/files/amigos_rating_form_v1.2.pdf"
     ]
    ]
   }
  ]
 },
 {
  "group": "Substance Abuse and Mental Health Services Administration (SAMHSA)",
  "items": [
   {
    "name": "Screening, Brief Intervention, and Referral to Treatment (SBIRT)",
    "desc": "Information on disseminating and implementing SBIRT, and more resources.",
    "links": [
     [
      "samhsa.gov/sbirt",
      "https://www.samhsa.gov/sbirt"
     ]
    ]
   },
   {
    "name": "SAMHSA-HRSA Center for Integrated Health Solutions",
    "desc": "Promotes integrated primary and behavioral health care for people with mental disorders and SUDs; resources on screening tools, motivational interviewing and tobacco cessation. The center’s website has since closed, so these links go to the current SAMHSA pages on the same topics.",
    "links": [
     [
      "Screening (SAMHSA brief screener)",
      "https://www.samhsa.gov/resource/ebp/brief-screener-alcohol-tobacco-other-drugs"
     ],
     [
      "Motivational interviewing (SAMHSA Advisory based on TIP 35)",
      "https://library.samhsa.gov/product/advisory-using-motivational-interviewing-substance-use-disorder-treatment-based-tip-35"
     ],
     [
      "Tobacco cessation (SAMHSA Advisory)",
      "https://library.samhsa.gov/product/tobacco-use-cessation-during-substance-abuse-treatment-counseling/sma11-4636clin"
     ]
    ]
   }
  ]
 },
 {
  "group": "Related Treatment Improvement Protocols (TIPs)",
  "items": [
   {
    "name": "TIP 63: Medications for Opioid Use Disorder",
    "desc": "The three FDA-approved medications for opioid use disorder — methadone, naltrexone and buprenorphine — and other strategies and services that support recovery.",
    "links": [
     [
      "SAMHSA store",
      "https://library.samhsa.gov/product/tip-63-medications-opioid-use-disorder/pep21-02-01-002"
     ]
    ]
   },
   {
    "name": "TIP 60: Using Technology-Based Therapeutic Tools in Behavioral Health Services",
    "desc": "Implementing technology-assisted care, and technology-based assessments and interventions in behavioral health services.",
    "links": [
     [
      "SAMHSA store",
      "https://library.samhsa.gov/product/tip-60-using-technology-based-therapeutic-tools-behavioral-health-services/sma15-4924"
     ]
    ]
   },
   {
    "name": "TIP 59: Improving Cultural Competence",
    "desc": "The role of culture in delivering mental health and substance use services; cultural competence and racial, ethnic and cultural considerations.",
    "links": [
     [
      "SAMHSA store",
      "https://store.samhsa.gov/product/TIP-59-Improving-Cultural-Competence/SMA15-4849"
     ]
    ]
   },
   {
    "name": "TIP 57: Trauma-Informed Care in Behavioral Health Services",
    "desc": "The impact of trauma on clients, assessment and treatment planning strategies, and building a trauma-informed workforce.",
    "links": [
     [
      "SAMHSA store",
      "https://www.samhsa.gov/resource/dbhis/tip-57-trauma-informed-care-behavioral-health-services"
     ]
    ]
   },
   {
    "name": "TIP 52: Clinical Supervision and Professional Development of the Substance Abuse Counselor",
    "desc": "Guidelines for clinical supervision in SUD treatment: methods and models, cultural competence, ethical and legal issues, performance monitoring, and an implementation guide for administrators.",
    "links": [
     [
      "SAMHSA store",
      "https://www.samhsa.gov/resource/ebp/tip-52-clinical-supervision-professional-development-substance-abuse-counselor"
     ]
    ]
   },
   {
    "name": "TIP 42: Substance Abuse Treatment for Persons With Co-Occurring Disorders",
    "desc": "Terminology, assessment, and treatment strategies and models for co-occurring mental and substance use disorders.",
    "links": [
     [
      "SAMHSA store",
      "https://library.samhsa.gov/product/tip-42-substance-use-treatment-persons-co-occurring-disorders/pep20-02-01-004"
     ]
    ]
   },
   {
    "name": "TIP 39: Substance Abuse Treatment and Family Therapy",
    "desc": "Integrating family counseling approaches into SUD treatment, with cultural competence, specific populations, policy and program issues, and guidelines for assessing violence.",
    "links": [
     [
      "SAMHSA store",
      "https://store.samhsa.gov/product/TIP-39-Substance-Abuse-Treatment-and-Family-Therapy/SMA15-4219"
     ]
    ]
   }
  ]
 }
];
