// FSRS-5 scheduler (Free Spaced Repetition Scheduler), compact implementation.
// Default weights from the FSRS-5 reference implementation.
export const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575,
  0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
const DECAY = -0.5, FACTOR = 19 / 81;
export const DAY = 86400000, MIN = 60000;
export const State = { New: 0, Learning: 1, Review: 2, Relearning: 3 };
export const Rating = { Again: 1, Hard: 2, Good: 3, Easy: 4 };
const LEARN_STEPS = [1, 10];   // minutes
const RELEARN_STEPS = [10];    // minutes

export const retrievability = (days, S) => (S > 0 ? Math.pow(1 + FACTOR * Math.max(0, days) / S, DECAY) : 0);
export const intervalFor = (S, r) => (S / FACTOR) * (Math.pow(r, 1 / DECAY) - 1);
const clampD = (d) => Math.min(10, Math.max(1, d));
const initS = (g) => Math.max(0.1, W[g - 1]);
const initD = (g) => clampD(W[4] - Math.exp(W[5] * (g - 1)) + 1);
const nextD = (D, g) => {
  const d1 = D + (-W[6] * (g - 3)) * (10 - D) / 9;
  return clampD(W[7] * initD(4) + (1 - W[7]) * d1);
};
const sRecall = (D, S, R, g) => S * (1 + Math.exp(W[8]) * (11 - D) * Math.pow(S, -W[9]) *
  (Math.exp(W[10] * (1 - R)) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1));
const sForget = (D, S, R) => Math.min(S,
  W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)));
const sShort = (S, g) => S * Math.exp(W[17] * (g - 3 + W[18]));

export function elapsedDays(card, now) {
  return card.last_review ? (now - Date.parse(card.last_review)) / DAY : 0;
}

/** Predicted probability of recall right now. factor = personal memory multiplier. */
export function recallProb(card, now, factor = 1) {
  if (!card || card.state === State.New) return 0;
  return retrievability(elapsedDays(card, now), card.stability * factor);
}

function fuzz(days, seed) {
  if (days < 2.5) return days;
  const x = Math.sin(seed * 9301 + 49297) * 233280; const r = x - Math.floor(x);
  return days * (0.95 + 0.1 * r);
}

/**
 * Apply a rating to a card. Returns a new card object (does not mutate).
 * opts: retention (desired), factor (personal stability multiplier), maxIvl (days)
 */
export function schedule(card, g, now, opts = {}) {
  const { retention = 0.9, factor = 1, maxIvl = 365 } = opts;
  const c = { ...card };
  const elapsed = elapsedDays(card, now);
  const R = card.state === State.New ? 0 : retrievability(elapsed, card.stability);
  c.reps = (card.reps || 0) + 1;
  c.last_review = new Date(now).toISOString();

  const graduate = (bonusEasy) => {
    let days = intervalFor(c.stability * factor, retention);
    days = Math.max(1, fuzz(days, card.word_id + c.reps));
    if (bonusEasy) days = Math.max(days, 2);
    days = Math.min(days, Math.max(1, maxIvl));
    c.state = State.Review; c.step = 0;
    c.due = new Date(now + Math.round(days) * DAY - 2 * 3600000).toISOString(); // due early morning-ish
  };
  const inSteps = (steps) => {
    if (g === 1) { c.step = 0; c.due = new Date(now + steps[0] * MIN).toISOString(); }
    else if (g === 2) {
      const m = c.step === 0 && steps.length > 1 ? (steps[0] + steps[1]) / 2 : steps[c.step] || steps[0];
      c.due = new Date(now + m * MIN).toISOString();
    } else if (g === 3) {
      const next = (c.step || 0) + 1;
      if (next >= steps.length) graduate(false);
      else { c.step = next; c.due = new Date(now + steps[next] * MIN).toISOString(); }
    } else graduate(true);
  };

  if (card.state === State.New) {
    c.stability = initS(g); c.difficulty = initD(g); c.step = 0; c.state = State.Learning;
    inSteps(LEARN_STEPS);
  } else if (card.state === State.Learning || card.state === State.Relearning) {
    c.stability = sShort(card.stability, g); c.difficulty = nextD(card.difficulty, g);
    inSteps(card.state === State.Learning ? LEARN_STEPS : RELEARN_STEPS);
  } else { // Review
    c.difficulty = nextD(card.difficulty, g);
    if (g === 1) {
      c.stability = elapsed < 1 ? sShort(card.stability, g) : sForget(card.difficulty, card.stability, R);
      c.lapses = (card.lapses || 0) + 1; c.state = State.Relearning; c.step = 0;
      c.due = new Date(now + RELEARN_STEPS[0] * MIN).toISOString();
    } else {
      c.stability = elapsed < 1 ? sShort(card.stability, g) : sRecall(card.difficulty, card.stability, R, g);
      graduate(g === 4);
    }
  }
  c.stability = Math.max(0.05, c.stability);
  c.updated_at = new Date(now).toISOString();
  return { card: c, retrievability: R, elapsed };
}

/** Human-readable preview of what each rating would do. */
export function preview(card, now, opts) {
  const out = {};
  for (const g of [1, 2, 3, 4]) {
    const { card: c } = schedule(card, g, now, opts);
    out[g] = fmtInterval(Date.parse(c.due) - now);
  }
  return out;
}

export function fmtInterval(ms) {
  const m = ms / MIN;
  if (m < 60) return `${Math.max(1, Math.round(m))}m`;
  const h = m / 60; if (h < 22) return `${Math.round(h)}h`;
  const d = ms / DAY; if (d < 30) return `${Math.round(d)}d`;
  if (d < 365) return `${(d / 30).toFixed(d < 90 ? 1 : 0)}mo`;
  return `${(d / 365).toFixed(1)}y`;
}

/**
 * Personalisation: fit a single stability multiplier k from review history so that
 * predicted recall R(t, k*S) best matches what actually happened (min log-loss).
 * logs: [{elapsed_days, stability_before, correct}] from Review-state cards.
 * Shrinks toward 1 when there is little data.
 */
export function fitFactor(logs) {
  const pts = logs.filter((l) => l.state_before === State.Review && l.elapsed_days >= 0.5 && l.stability_before > 0);
  const n = pts.length;
  if (n < 30) return { factor: 1, n };
  const loss = (lk) => {
    const k = Math.exp(lk); let s = 0;
    for (const p of pts) {
      const r = Math.min(0.9999, Math.max(0.0001, retrievability(p.elapsed_days, p.stability_before * k)));
      s -= p.correct ? Math.log(r) : Math.log(1 - r);
    }
    return s;
  };
  let a = Math.log(0.25), b = Math.log(4); const gr = (Math.sqrt(5) - 1) / 2;
  let c = b - gr * (b - a), d = a + gr * (b - a);
  for (let i = 0; i < 40; i++) {
    if (loss(c) < loss(d)) b = d; else a = c;
    c = b - gr * (b - a); d = a + gr * (b - a);
  }
  const lk = (a + b) / 2; const w = n / (n + 150);
  return { factor: Math.exp(lk * w), n };
}
