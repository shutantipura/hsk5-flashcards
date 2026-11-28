# HSK 5 Flashcards

A personal, installable flashcard web app for the **2025 HSK 3.0 exam syllabus, levels 1–5** (3,577 entries).

- **Spaced repetition:** FSRS-5, with learning steps and personal calibration. After 30+ reviews per card type, the app fits a stability multiplier to your own recall history.
- **Learns from how you answer:** grades come from whether you were right *and* how fast you were, compared with your own median speed. Wrong answers are recorded as confusion pairs and reused as answer choices.
- **Three answer choices:** every quiz uses one correct option and two distractors, with a separate “I don't know” action.
- **Example sentences:** up to three Chinese sentences selected against the app's 2025 HSK word list, with optional translations, vocabulary glosses, target-word highlighting and normal/slow speech playback. The selector prefers curated examples; harder or unrecognized vocabulary is excluded where detected. Cards with fewer than three suitable examples report the gap instead of displaying unchecked examples. Automated segmentation is conservative but is not a substitute for a human sense/grammar review. Examples appear when learning a new word, after answering, and in the word browser.
- **Grammar Practice:** a separate pattern library, three level-checked examples per pattern, contextual cloze, contrast questions, function identification and self-graded Chinese production. Each skill has its own FSRS review schedule stored in synced settings; vocabulary statistics remain separate. The library covers all previously pending function-word and word-building candidates, with search, weakest-first sorting and per-pattern due counts. Grammar-only entries with matching lessons are excluded from meaning/recall quizzes and vocabulary coverage, but existing records are retained; optional listening and tones use sentence context. Mixed entries retain independent lexical meanings; entries without matching lessons remain in vocabulary study.
- **Applied Practice:** level-checked reading passages ranked by estimated familiar vocabulary, collocations, near-synonyms, tap-to-order sentences and personalised mistake review. Independent FSRS scheduling and timestamp-merged progress in existing settings.
- **Card types:** meaning (hanzi → English), listening (audio → hanzi, with similar-sounding, distinguishable distractors), tones (hanzi → pinyin), recall (English → hanzi).
- **Pacing:** sets the daily number of new words from your exam date and the words left, keeps the last 10 days for review, and slows down when the review backlog is large.
- **Placement test:** samples each level so you can skip what you already know. Skipped words are rechecked gradually.
- **Report:** recall estimate, per-level progress, retention per card type, speed, streak heatmap, forecast, best time of day, weakest areas, confused pairs, and hardest words.
- **Offline-first, no login:** works offline; data lives in IndexedDB and syncs to Supabase under a profile id. That id is also the sync code for restoring progress on another device.

## Stack
Static HTML/CSS/ES modules with no build step and no external JS. Hosted on GitHub Pages. Supabase PostgREST is called directly with `fetch` (`js/api.js`).

## Files
- `js/fsrs.js` – scheduler and calibration
- `js/engine.js` – queue, pacing, distractors, auto-grading
- `js/report.js` – analytics
- `js/store.js` – local storage and sync
- `js/app.js` – UI
- `js/practice.js` / `js/practice-data.js` – applied practice, adaptive selection and personal error review
- `js/learning-mode.js` – reading-specific learning-type classification and review routing
- `js/grammar.js` / `js/grammar-data.js` – grammar practice and pattern content
- `js/examples.js` – level-aware example selection and curated replacements
- `data/vocab.json` – word list built by `scripts/build_vocab.py`

## Data sources and licences
- Word list (2025 HSK syllabus) from [krmanik/HSK-3.0-words-list](https://github.com/krmanik/HSK-3.0-words-list)
- Definitions from [CC-CEDICT](https://cc-cedict.org) (CC BY-SA 4.0), via [drkameleon/complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) (MIT)

- Example sentences: adapted from [Zhongdex by SayMei](https://github.com/saymei/zhongdex), data licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). We selected, re-keyed and reformatted sentences against this app's existing syllabus, with original examples for gaps and duplicate readings. Source IDs and metadata are retained. See [example data attribution](data/EXAMPLES-NOTICE.md).

## Example sentence coverage audit

The full syllabus currently has three selected examples per entry (10,731 sentences across 3,577 entries). Grammar has a separate 179-pattern library (537 examples); compound lessons use explicit component boundaries. These checks validate vocabulary levels and target inclusion, not exhaustive linguistic correctness.

Run `node scripts/audit_examples.mjs` to validate all five levels and report how many entries have zero, one, two, or three displayed examples. Add `--list-missing` for a backlog of entries, or `--require-three` to make incomplete coverage fail the audit. The audit checks declared token levels and target inclusion, not grammar or pronunciation; authored examples can include explicit vocabulary boundaries to avoid false rejections by automated segmentation.

### Reading practice (v1.12)
50 curated passages and 123 reading questions, with HSK-level and question-type filters, grouped passage sessions, deferred answers, English translations, vocabulary review, and accuracy by reading skill. Adaptive ordering prioritises due questions and aims for a manageable challenge using estimated familiar vocabulary. No external AI service is required.

### Passage-first redesign (v2.0)
Today, Explore, Review and Progress now centre on reading. The checked library groups existing reading questions into stories, validates their authored token boundaries against the 2025 vocabulary and fails closed when a passage or question is not valid. All reading words are tappable; learner-marked familiarity and saved words affect estimated coverage and future story recommendations. Listening (device TTS), contextual reconstruction, optional comprehension and self-assessed retelling use the same story. Existing vocabulary/grammar records remain intact. Reader word/visit state merges by timestamp in the existing synced settings JSON. The vocabulary validator is not a guarantee of grammar-level or word-sense correctness.

The reader also checks that Chinese fragments in question explanations are drawn from the checked passage or question text. New original stories introduce business, relationships, science and mystery topics, with linked chapters where available.

### v2.1 reading expansion
103 checked passages, including longer original case studies and linked mystery chapters. Vocabulary exposure is tracked separately from mastery; run `node scripts/audit_reading.mjs --gaps` to see missing written forms and repetition coverage. Automated checks verify declared token levels and text reconstruction, not semantic or grammar-level accuracy.

### v2.2 audio-first study
Every checked passage has an audio-only mode, using the browser/device's Mandarin text-to-speech engine. The library can be browsed without Chinese previews, playback has play/pause/replay/stop and adjustable speed, transcripts and comprehension questions are optional, and chapter sequences can continue in listening mode. Audio quality and voice availability depend on the device; no recorded or server-generated audio is stored. Listening-question progress retains the existing `listen:` question IDs.

### v2.4 self-assessment flashcards
Separate exact-level decks group readings of the same written word within that level. Four confidence ratings are saved in `settings.flashcardRatings` with per-word timestamps, separate from historic quiz cards/logs. Known advances immediately; all other ratings reveal dictionary pinyin and definitions before Next. Session filters include unmarked and non-known vocabulary. No quiz scores are generated.

### v2.5 smart flashcards
Default smart queue includes saved reading words, due FSRS reviews, and unassessed words from completed passages (target words first). Exact HSK decks remain, with manual filters to study other words. FSRS uses the four confidence grades (Again/Hard/Good/Easy), preserving v2.4 ratings by scheduling from their original timestamp. Reading exposure alone never changes mastery. Cross-level homographs are tracked separately; generic reading familiarity is conservative. The reader uses flashcard confidence for highlighting and recommendations.

### v2.6 short passages
Every reading/listening passage must contain at most 100 syllabus word tokens (not Chinese characters) and at least five distinct target words occurring in the passage. The runtime checker and audit script enforce these limits. Existing story IDs, chapter links and question IDs are retained; some older passages target useful lower-level words as well as their declared level.

### v2.7 extended passages
The 100-word maximum from v2.6 has been replaced with a target of approximately 150 Chinese syllabus tokens per reading/listening passage (accepted range 125–175). All 103 stories are expanded, with existing target words, questions, and chapter links retained. English translations remain concise summaries, updated to cover added material. The runtime checker and audit enforce the new range and at least five distinct targets. Token checks do not guarantee linguistic segmentation or native-speaker naturalness.

### v2.8 gap-focused reading
Reading and listening recommendations and Applied Practice use an exact HSK level selection. Explore retains its All tab and chapter links are preserved. Additional independently authored stories live in `js/coverage-practice-data.js`, included in the checked library, practice and offline cache. The coverage audit now reports missing vocabulary grouped by level (`--gaps`). Coverage is measured by distinct written vocabulary forms, not individual senses; complete syllabus coverage is not yet achieved.

### v2.9 two study profiles and target highlighting
The welcome screen offers Boyfriend and Girlfriend without a password. Each named slot maps to a separate randomly generated sync ID and isolated IndexedDB database on the current device. Optional sync-code restoration links the same progress on a different device; existing unnamed progress can be explicitly assigned to an unused slot. Settings includes Switch profile; switching reloads the app so no in-memory study session can leak across profiles. This is a convenience selector, not authenticated access control. The pre-existing cloud sync security model is unchanged. Every target occurrence is highlighted regardless of familiarity, including the listening transcript, and static question/review passage text. Marking a target known no longer removes its highlight.

### v2.10 shorter passages
All reading and listening passages are again approximately 100 syllabus word tokens (accepted range 80–120). The original short story cores and question IDs are retained, with selected complete sentences from the expanded versions where useful. Newer coverage stories are condensed with their explicit target lists retained. English summaries describe the core story rather than translating each sentence. Shortening removes some incidental vocabulary exposure, which the coverage audit reports separately from explicit targets. Profile selection and target highlighting are unchanged.

### v2.11 expanded HSK 4 and 5 reading library
HSK 4 and HSK 5 now each contain 101 passages (216 total across HSK 1–5). This adds 88 level-four and 11 level-five original stories without changing any prior question or passage ID. The 99 additions contain 94–120 syllabus word tokens and at least five same-level targets, prioritizing vocabulary missing from earlier passages. Each includes an English summary and a three-choice comprehension question, and works with the existing listening, highlighting and flashcard exposure features. Automated validation checks segmentation against the bundled vocabulary, target presence, word count, question options and unique IDs; it is not a native-speaker review.

### v2.12 spoken comprehension questions
Reading and listening quizzes now support Mandarin playback for the question, each visible answer option, and the entire question with options A–C in displayed order. Separate audio and answer buttons prevent accidental grading. Playback uses device speech synthesis, shares the story speed preference, and stops when submitting or navigating to another question. No answer is identified during playback.

### v2.13 flashcard context and vocab list
The self-assessment flashcards now offer two level-checked example sentences per written-word card, collapsed before rating and expanded after a non-known rating. Each has target highlighting and Mandarin playback; English meanings are optional after the definition is revealed. Known still advances immediately and FSRS scheduling is unchanged. The Vocab list submenu is a read-only reference for all 3,577 syllabus entries, including separate readings, with full dictionary definitions, HSK filters, tone-insensitive pinyin/Chinese/English search and 100-entry pages.

### v2.14 foundation reading expansion
HSK 1, 2 and 3 now each contain exactly 50 checked passages; HSK 4 and 5 remain at 101 each (352 total, 495 reading questions). The 136 new passages are short scenario-based readings, including related variants for beginner reinforcement. All have 80–109 syllabus tokens, at least five same-level target words, an English summary and a three-choice comprehension question. They use the existing listening, spoken question, target highlighting and flashcard exposure features. Data validation checks token reconstruction, vocabulary levels, target occurrence, unique IDs and answer options, not native-speaker quality or complete syllabus exposure.

### v2.15 passage target flashcards
A Go to flashcards button beneath the target vocabulary in every reading passage and the optional listening target list opens a session containing all distinct target written forms in their listed order, including already-known words. Each card uses the highest eligible syllabus level at or below the passage level, retaining the existing confidence ratings, example sentences, pronunciation and FSRS schedules. The session does not inherit general deck filters or size limits. Return to the originating passage and reading/listening mode after finishing or leaving early; no passage completion is recorded by flashcard study alone. All 352 passage target decks were checked for complete target mapping and a simulated session verified ratings and return controls.

### v2.16 ten target words per passage
Each of the 352 existing passages now has exactly ten distinct, level-eligible target words, in order of first appearance. Selection prioritizes level vocabulary, existing targets, question focus words and vocabulary diversity across the library. Passage text, question IDs, answers and study history are unchanged. The reader and audit enforce ten targets; passage flashcards automatically use the new ten-word lists. Other words remain available for lookup. Some stories use lower-level vocabulary when necessary. Explicit target coverage is now 1,827 distinct written forms, retaining 1,671 of 1,699 previously targeted forms; all original passage text remains available.

### v2.17 syllabus expansion (partial coverage)
Added 103 new checked reading and listening passages across all five levels. The existing library now contains 455 passages and 598 comprehension questions. Every passage has exactly ten distinct target words, with existing texts, question IDs and study history preserved. Rebalanced target selections to increase distinct written-form coverage from 1,827 to 2,883 of 3,557 syllabus forms; 2,999 forms occur in passage tokens. Full syllabus target coverage is not yet achieved (674 written forms remain). Automated validation checks token reconstruction, level eligibility, word count, question options, and ten-target mapping; it does not guarantee natural segmentation or native-speaker review. Coverage is measured across the whole library rather than separately within each passage level.

### v2.18 further syllabus coverage
Added 47 original reading/listening passages and comprehension questions, for 502 passages and 645 questions total. All passages have exactly ten distinct eligible target words and 80–120 syllabus tokens (mean 100.2). Explicit target coverage is 3,257 of 3,557 distinct written forms (91.6%), with 3,281 forms appearing in passage tokens. Using each written form's earliest syllabus level, HSK 1–3 now have complete target coverage; 25 HSK 4 and 275 HSK 5 forms remain. Existing story and question IDs, content and target lists are unchanged. The audit reports explicit target coverage and gaps separately from incidental exposure. Checks cover token reconstruction, levels, targets, lengths, IDs and answer options; automatic segmentation does not guarantee linguistic accuracy or native-speaker review.

### v2.19 continued vocabulary coverage
The library contains 535 reading/listening passages and 678 comprehension questions, with exactly ten distinct eligible target words per passage. All passages contain 80–120 syllabus tokens (mean 100.9). Explicit target coverage is 3370 of 3557 distinct written forms (94.7%); 3382 appear in passage tokens. Using each form's earliest syllabus level, HSK 1–3 have complete target coverage; 16 HSK 4 and 171 HSK 5 forms remain. Existing passages and IDs were retained. Full data checks found no structural or syllabus-level errors; the automatic segmentation and comprehension questions have not received independent native-speaker review. The offline cache version is refreshed.
