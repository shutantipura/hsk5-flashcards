# HSK 5 Flashcards

A personal, installable flashcard web app for the **2025 HSK 3.0 exam syllabus, levels 1–5** (3,577 entries).

- **Spaced repetition:** FSRS-5, with learning steps and personal calibration. After 30+ reviews per card type, the app fits a stability multiplier to your own recall history.
- **Learns from how you answer:** grades come from whether you were right *and* how fast you were, compared with your own median speed. Wrong answers are recorded as confusion pairs and reused as answer choices.
- **Card types:** meaning (hanzi → English), listening (audio → hanzi, with homophones as distractors), tones (hanzi → pinyin), recall (English → hanzi).
- **Pacing:** sets the daily number of new words from your exam date and the words left, keeps the last 10 days for review, and slows down when the review backlog is large.
- **Placement test:** samples each level so you can skip what you already know. Skipped words are rechecked gradually.
- **Report:** recall estimate, per-level progress, retention per card type, speed, streak heatmap, forecast, best time of day, weakest areas, confused pairs, and hardest words.
- **Offline-first:** works offline; data lives in IndexedDB and syncs to Supabase (Postgres + RLS).

## Stack
Static HTML/CSS/ES modules with no build step and no external JS. Hosted on GitHub Pages. Supabase Auth + PostgREST are called directly with `fetch` (`js/api.js`).

## Files
- `js/fsrs.js` – scheduler and calibration
- `js/engine.js` – queue, pacing, distractors, auto-grading
- `js/report.js` – analytics
- `js/store.js` – local storage and sync
- `js/app.js` – UI
- `data/vocab.json` – word list built by `scripts/build_vocab.py`

## Data sources and licences
- Word list (2025 HSK syllabus) from [krmanik/HSK-3.0-words-list](https://github.com/krmanik/HSK-3.0-words-list)
- Definitions from [CC-CEDICT](https://cc-cedict.org) (CC BY-SA 4.0), via [drkameleon/complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) (MIT)
