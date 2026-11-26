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
