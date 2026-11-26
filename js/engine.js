// Study engine: daily pacing, queue building, distractors, auto-grading, personalisation.
import { S, key, saveCards, addLog } from './store.js';
import { isGrammarOnly, allowsCard, vocabularyMeanings, grammarStarted } from './learning-mode.js';
import { schedule, recallProb, fitFactor, State, DAY, retrievability, elapsedDays } from './fsrs.js';

export const KINDS = {
  meaning: { label: 'Meaning', hint: 'What does it mean?' },
  listen: { label: 'Listening', hint: 'Which word did you hear?' },
  tone: { label: 'Tones', hint: 'Pick the correct pinyin' },
  recall: { label: 'Recall', hint: 'Which word means this?' },
};
export const enabledKinds = () => ['meaning', ...['listen', 'tone', 'recall'].filter((k) => S.settings.kinds[k])];

// ---------- dates
export const dayKey = (t = Date.now()) => { const d = new Date(t - 4 * 3600000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const endOfDay = (t = Date.now()) => { const d = new Date(t - 4 * 3600000); d.setHours(23, 59, 59, 999); return d.getTime() + 4 * 3600000; };
export function daysToExam(now = Date.now()) {
  const ex = new Date(S.settings.examDate + 'T09:00:00');
  return Math.max(0, Math.ceil((ex - now) / DAY));
}

// ---------- personal factors (cached)
let factorCache = { n: -1, f: {} };
export function factors() {
  if (factorCache.n === S.logs.length) return factorCache.f;
  const f = {};
  for (const k of Object.keys(KINDS)) f[k] = fitFactor(S.logs.filter((l) => l.kind === k));
  factorCache = { n: S.logs.length, f }; return f;
}
export const factorOf = (kind) => factors()[kind]?.factor || 1;
export function schedOpts(kind, now = Date.now()) {
  const dte = daysToExam(now);
  // Keep intervals short enough that you see each word again before the exam.
  const maxIvl = dte > 3 ? Math.max(3, Math.min(365, dte - 2)) : 365;
  return { retention: S.settings.retention, factor: factorOf(kind), maxIvl };
}

// ---------- response-time baseline (for auto-grading)
export function medianRt(kind) {
  const xs = []; for (let i = S.logs.length - 1; i >= 0 && xs.length < 150; i--) { const l = S.logs[i]; if (l.kind === kind && l.correct && l.response_ms) xs.push(l.response_ms); }
  if (xs.length < 15) return { meaning: 4500, listen: 5000, tone: 5000, recall: 5000 }[kind];
  xs.sort((a, b) => a - b); return xs[Math.floor(xs.length / 2)];
}
export function autoGrade(kind, correct, ms) {
  if (!correct) return 1;
  const med = medianRt(kind);
  if (ms > Math.max(2 * med, 12000)) return 2;
  if (ms < 0.6 * med) return 4;
  return 3;
}

// ---------- word status
export const meaningCard = (wid) => S.cards.get(key(wid, 'meaning'));
export function introducedToday(now = Date.now()) {
  const dk = dayKey(now); let n = 0;
  for (const c of S.cards.values()) if (c.kind === 'meaning' && allowsCard(S.byId.get(c.word_id),c.kind) && c.introduced_at && dayKey(Date.parse(c.introduced_at)) === dk) n++;
  return n;
}
export function unseenWords() { return S.vocab.filter((w) => !isGrammarOnly(w) && !S.cards.has(key(w.i, 'meaning'))); }

export function dueCards(now = Date.now(), until = endOfDay(now)) {
  const kinds = new Set(enabledKinds()); const out = [];
  for (const c of S.cards.values()) if (c.state !== State.New && kinds.has(c.kind) && allowsCard(S.byId.get(c.word_id),c.kind) && Date.parse(c.due) <= until) out.push(c);
  return out;
}

export function pacing(now = Date.now()) {
  const unseen = unseenWords().length;
  const dte = daysToExam(now);
  const studyDays = Math.max(1, dte - 10); // leave the last 10 days for review only
  let target = dte > 0 ? Math.ceil(unseen / studyDays) : 0;
  const due = dueCards(now).length;
  let reason = `${unseen} words left over ${studyDays} days`;
  if (due > 250) { target = Math.ceil(target * 0.5); reason += '; halved because of a large review backlog'; }
  else if (due > 150) { target = Math.ceil(target * 0.75); reason += '; reduced for your review load'; }
  if (dte <= 10 && unseen) reason = 'Final stretch: focusing on reviews';
  target = Math.min(60, Math.max(unseen ? 5 : 0, target));
  if (S.settings.pace !== 'auto') { target = Number(S.settings.pace) || 0; reason = 'Fixed in settings'; }
  return { target, unseen, dte, due, reason, today: introducedToday(now) };
}

// ---------- session queue
export class Session {
  constructor({ extraNew = 0 } = {}) {
    this.now = Date.now(); this.done = 0; this.correct = 0; this.started = Date.now(); this.newSeen = 0; this.lastWord = null; this.introStreak = 0;
    const p = pacing(this.now);
    this.newBudget = Math.max(0, p.target - p.today) + extraNew;
    this.newQueue = unseenWords().slice(0, this.newBudget).map((w) => w.i);
    // sibling cards (listening/tones/recall) for words whose meaning card is established
    this.siblingBudget = Math.max(10, this.newBudget * 2);
    this.results = [];
  }
  siblingCandidates() {
    const out = [];
    for (const kind of enabledKinds().slice(1)) {
      for (const c of S.cards.values()) {
        if (c.kind !== 'meaning' || c.state !== State.Review || c.stability < 2) continue;
        if (allowsCard(S.byId.get(c.word_id),kind) && !S.cards.has(key(c.word_id, kind))) out.push({ word_id: c.word_id, kind });
      }
    }
    // Grammar-only words acquire optional pronunciation cards after starting their lesson.
    for(const kind of enabledKinds().filter(k=>k==='listen'||k==='tone')) {
      for(const w of S.vocab) if(isGrammarOnly(w) && grammarStarted(w,S.settings.grammarProgress) && !S.cards.has(key(w.i,kind)) && !out.some(x=>x.word_id===w.i&&x.kind===kind)) out.push({word_id:w.i,kind});
    }
    return out.sort((a, b) => a.word_id - b.word_id);
  }
  next() {
    const now = Date.now();
    const kinds = new Set(enabledKinds());
    const all = [...S.cards.values()].filter((c) => kinds.has(c.kind) && allowsCard(S.byId.get(c.word_id),c.kind) && c.state !== State.New);
    // 1) learning cards due now
    const learning = all.filter((c) => (c.state === State.Learning || c.state === State.Relearning) && Date.parse(c.due) <= now)
      .sort((a, b) => a.due.localeCompare(b.due));
    const reviews = all.filter((c) => c.state === State.Review && Date.parse(c.due) <= endOfDay(now))
      .map((c) => ({ c, r: recallProb(c, now, factorOf(c.kind)) })).sort((a, b) => a.r - b.r).map((x) => x.c);
    const avoid = (list) => list.find((c) => c.word_id !== this.lastWord) || list[0];
    // Interleave: one new item roughly every 4 reviews
    const wantNew = this.newQueue.length && (this.done % 4 === 3 || (!learning.length && !reviews.length));
    if (learning.length && !wantNew) return this.pick(avoid(learning));
    // don't stack more than 4 new words in a row: pull a learning card forward instead
    const soonLearn = () => all.filter((c) => (c.state === State.Learning || c.state === State.Relearning) && Date.parse(c.due) <= now + 10 * 60000)
      .sort((a, b) => a.due.localeCompare(b.due));
    if (wantNew && this.introStreak >= 4 && !reviews.length) { const s = soonLearn().filter((c) => c.word_id !== this.lastWord); if (s.length) return this.pick(s[0]); }
    if (wantNew) {
      const wid = this.newQueue.shift();
      if (wid && !S.cards.has(key(wid, 'meaning'))) { this.introStreak++; return this.pick({ word_id: wid, kind: 'meaning', state: State.New, intro: true }); }
    }
    if (reviews.length) return this.pick(avoid(reviews));
    if (learning.length) return this.pick(avoid(learning));
    if (this.siblingBudget > 0) {
      const sib = this.siblingCandidates().find((s) => s.word_id !== this.lastWord);
      if (sib) { this.siblingBudget--; return this.pick({ ...sib, state: State.New }); }
    }
    // learning cards due soon (wait for them in-session if within 10 minutes)
    const soon = all.filter((c) => (c.state === State.Learning || c.state === State.Relearning) && Date.parse(c.due) <= now + 10 * 60000)
      .sort((a, b) => a.due.localeCompare(b.due));
    if (soon.length) return this.pick(soon[0]);
    return null;
  }
  pick(c) { this.lastWord = c.word_id; if (!c.intro) this.introStreak = 0; return c; }
  remaining() {
    const now = Date.now(); const kinds = new Set(enabledKinds());
    let n = 0; for (const c of S.cards.values()) if (kinds.has(c.kind) && c.state !== State.New && Date.parse(c.due) <= (c.state === State.Review ? endOfDay(now) : now + 10 * 60000)) n++;
    return n + this.newQueue.length;
  }
}

/** Mark a brand-new word as introduced (after the intro screen). */
export async function introduce(wid, now = Date.now()) {
  const base = { word_id: wid, kind: 'meaning', state: State.New, reps: 0, lapses: 0, step: 0, stability: 0, difficulty: 0 };
  const { card } = schedule(base, 1, now, schedOpts('meaning', now));
  card.introduced_at = new Date(now).toISOString();
  await saveCards([card]);
  return card;
}

export async function answer(cardLike, { rating, correct, ms, chosen }) {
  const now = Date.now();
  const base = cardLike.state === State.New
    ? { word_id: cardLike.word_id, kind: cardLike.kind, state: State.New, reps: 0, lapses: 0, step: 0, stability: 0, difficulty: 0, introduced_at: new Date(now).toISOString() }
    : S.cards.get(key(cardLike.word_id, cardLike.kind));
  const { card, retrievability: R, elapsed } = schedule(base, rating, now, schedOpts(base.kind, now));
  if (base.note) card.note = base.note;
  await saveCards([card]);
  await addLog({
    client_id: crypto.randomUUID(), word_id: base.word_id, kind: base.kind, rating, correct, response_ms: Math.round(ms),
    chosen_word_id: chosen && chosen !== base.word_id ? chosen : null, state_before: base.state,
    stability_before: base.stability || 0, difficulty_before: base.difficulty || 0, elapsed_days: elapsed, retrievability: R,
    reviewed_at: new Date(now).toISOString(),
  });
  return card;
}

export function previewFor(cardLike) {
  const now = Date.now();
  const base = cardLike.state === State.New ? { word_id: cardLike.word_id, kind: cardLike.kind, state: State.New, reps: 0, lapses: 0, step: 0, stability: 0, difficulty: 0 } : S.cards.get(key(cardLike.word_id, cardLike.kind));
  const out = {};
  for (const g of [1, 2, 3, 4]) out[g] = Date.parse(schedule(base, g, now, schedOpts(base.kind, now)).card.due) - now;
  return out;
}

// ---------- confusion memory
export function confusions() {
  const m = new Map();
  for (const l of S.logs) if (!l.correct && l.chosen_word_id) {
    const [a, b] = [l.word_id, l.chosen_word_id].sort((x, y) => x - y); const k = `${a}-${b}`;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
}
function confusedWith(wid) {
  const out = [];
  for (const [k, n] of confusions()) { const [a, b] = k.split('-').map(Number); if (a === wid) out.push([b, n]); else if (b === wid) out.push([a, n]); }
  return out.sort((x, y) => y[1] - x[1]).map((x) => x[0]);
}

// ---------- distractors
const toneless = (n) => n.replace(/[0-9]/g, '').replace(/\s+/g, ' ').trim();
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sameLen = (a, b) => [...a.h].length === [...b.h].length;
const sharesPos = (a, b) => a.s.some((p) => b.s.includes(p));

export function options(cardLike) {
  const w = S.byId.get(cardLike.word_id);
  if (cardLike.kind === 'tone') return toneOptions(w);
  const chosen = new Set([w.i]); const picks = [];
  const label = (o) => { if (cardLike.kind !== 'meaning') return o.h; const t = vocabularyMeanings(o).slice(0, 2).join('; '); return t.length > 64 ? t.slice(0, 62) + '…' : t; };
  const labels = new Set([label(w)]);
  // avoid distractors whose meaning overlaps the answer (otherwise two choices could be right)
  const STOP = new Set(['to', 'a', 'an', 'the', 'of', 'and', 'or', 'sth', 'sb', 'in', 'on', 'for', 'with', 'be', 'is', 'as', 'at', 'by', 'one', 'etc', 'used', 'after', 'before', 'from', 'up', 'out', 'not']);
  const words = (ms) => new Set(ms.join(' ').toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[^a-z']+/).filter((x) => x.length > 2 && !STOP.has(x)));
  const target = words(vocabularyMeanings(w));
  const overlaps = (o) => [...words(vocabularyMeanings(o).slice(0, 2))].some((x) => target.has(x));
  const add = (id) => { if (picks.length < 2 && id && !chosen.has(id)) { const o = S.byId.get(id); if (o && allowsCard(o,cardLike.kind) && vocabularyMeanings(o)[0] !== vocabularyMeanings(w)[0] && o.h !== w.h && !labels.has(label(o)) && (cardLike.kind === 'listen' ? o.n !== w.n : !overlaps(o))) { chosen.add(id); labels.add(label(o)); picks.push(id); } } };
  // 1) words you've confused with this one before
  confusedWith(w.i).slice(0, 1).forEach(add);
  const pool = S.vocab;
  if (cardLike.kind === 'listen') {
    pool.filter((o) => toneless(o.n) === toneless(w.n)).forEach((o) => add(o.i));                 // homophones
    shuffle(pool.filter((o) => sameLen(o, w) && o.n.split(' ')[0].replace(/\d/, '') === w.n.split(' ')[0].replace(/\d/, ''))).forEach((o) => add(o.i));
  } else {
    // share a character (visually / semantically close) then same part of speech & level
    shuffle([...new Set([...w.h].flatMap((ch) => S.charIndex.get(ch) || []))]).forEach(add);
  }
  shuffle(pool.filter((o) => Math.abs(o.l - w.l) <= 1 && sharesPos(o, w) && sameLen(o, w))).slice(0, 30).forEach((o) => add(o.i));
  shuffle(pool.slice()).slice(0, 20).forEach((o) => add(o.i));
  if (picks.length < 2) shuffle(pool.slice()).forEach((o) => add(o.i));
  return shuffle([w.i, ...picks.slice(0, 2)]).map((id) => ({ id, word: S.byId.get(id) }));
}

const TONE_MARKS = { a: 'āáǎàa', e: 'ēéěèe', i: 'īíǐìi', o: 'ōóǒòo', u: 'ūúǔùu', ü: 'ǖǘǚǜü', v: 'ǖǘǚǜü' };
function markSyllable(syl) { // "hao3" -> "hǎo"
  const m = syl.match(/^([a-zü:v]+)([1-5])$/i); if (!m) return syl;
  let s = m[1].toLowerCase().replace(/u:|v/g, 'ü'); const t = +m[2]; if (t === 5) return s;
  const idx = /a|e/.test(s) ? s.search(/a|e/) : s.includes('ou') ? s.indexOf('o') : (() => { let k = -1; for (let i = 0; i < s.length; i++) if ('aeiouü'.includes(s[i])) k = i; return k; })();
  if (idx < 0) { const nasal = s.search(/[nm]/); return nasal < 0 ? s : (s.slice(0, nasal + 1) + ['', '\u0304', '\u0301', '\u030c', '\u0300'][t] + s.slice(nasal + 1)).normalize('NFC'); }
  return s.slice(0, idx) + TONE_MARKS[s[idx]][t - 1] + s.slice(idx + 1);
}
export const numericToMarks = (n) => n.split(' ').map(markSyllable).join(' ');
function toneOptions(w) {
  const syl = w.n.split(' '); const correct = numericToMarks(w.n); const set = new Set([correct]); const outs = [correct];
  let guard = 0;
  while (outs.length < 3 && guard++ < 60) {
    const v = syl.map((s) => s.replace(/[1-5]$/, (t) => (Math.random() < (syl.length === 1 ? 1 : 0.55) ? String(1 + Math.floor(Math.random() * 4)) : t)));
    const p = numericToMarks(v.join(' '));
    if (!set.has(p)) { set.add(p); outs.push(p); }
  }
  // Deterministic fallback for rare random collisions (including neutral-tone words).
  for (let i = 0; i < syl.length && outs.length < 3; i++) {
    for (let t = 1; t <= 5 && outs.length < 3; t++) {
      const v = syl.slice(); v[i] = v[i].replace(/[1-5]$/, String(t));
      const p = numericToMarks(v.join(' '));
      if (!set.has(p)) { set.add(p); outs.push(p); }
    }
  }
  return shuffle(outs).map((p, i) => ({ id: p === correct ? w.i : -i - 1, pinyin: p, word: p === correct ? w : null }));
}

// ---------- character breakdown (memory aid for hard words)
export function charBreakdown(w) {
  return [...new Set(w.h)].map((ch) => {
    const others = (S.charIndex.get(ch) || []).filter((id) => id !== w.i).map((id) => S.byId.get(id))
      .sort((a, b) => a.q - b.q).slice(0, 3);
    const single = S.byHanzi.get(ch);
    return { ch, single, others };
  });
}

// ---------- placement
export async function markKnown(wordIds, now = Date.now()) {
  const cards = wordIds.filter((id) => !isGrammarOnly(S.byId.get(id)) && !S.cards.has(key(id, 'meaning'))).map((id, i) => {
    // spread verification reviews over the coming weeks so they don't all land on one day
    const days = 2 + ((id * 7919 + i) % 38);
    return { word_id: id, kind: 'meaning', state: State.Review, stability: 20, difficulty: 4.5, reps: 1, lapses: 0, step: 0,
      last_review: new Date(now).toISOString(), due: new Date(now + days * DAY).toISOString(),
      introduced_at: new Date(now - 30 * DAY).toISOString(), updated_at: new Date(now).toISOString(), note: null };
  });
  if (cards.length) await saveCards(cards);
  return cards.length;
}
export const sample = (arr, n) => shuffle(arr.slice()).slice(0, n);
export { retrievability, elapsedDays };
