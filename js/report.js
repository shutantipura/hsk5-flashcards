// Performance analytics computed from local cards + review logs.
import { S, key } from './store.js';
import { isGrammarOnly, allowsCard } from './learning-mode.js';
import { State, DAY, recallProb } from './fsrs.js';
import { factors, factorOf, daysToExam, dayKey, endOfDay, KINDS, enabledKinds, confusions, pacing } from './engine.js';

export function wordStatus(w, now = Date.now()) {
  const c = S.cards.get(key(w.i, 'meaning'));
  if (!c || c.state === State.New) return 'new';
  if (c.state !== State.Review) return 'learning';
  return c.stability * factorOf('meaning') >= 21 ? 'mature' : 'young';
}

export function buildReport(now = Date.now()) {
  const fm = factorOf('meaning');
  // --- vocabulary coverage: expected number of words you'd recognise right now
  let expected = 0, seen = 0;
  const levels = {};
  for (let l = 1; l <= 5; l++) levels[l] = { new: 0, learning: 0, young: 0, mature: 0, total: 0, expected: 0 };
  for (const w of S.vocab.filter(w=>!isGrammarOnly(w))) {
    const c = S.cards.get(key(w.i, 'meaning'));
    const st = wordStatus(w, now); const L = levels[w.l];
    L[st]++; L.total++;
    if (c && c.state !== State.New) { seen++; const r = recallProb(c, now, fm); expected += r; L.expected += r; }
  }
  const total = S.vocab.filter(w=>!isGrammarOnly(w)).length;

  // --- pace and projection
  const intro7 = [...S.cards.values()].filter((c) => c.kind === 'meaning' && allowsCard(S.byId.get(c.word_id),c.kind) && c.introduced_at && now - Date.parse(c.introduced_at) < 7 * DAY).length;
  const pace = intro7 / 7; const dte = daysToExam(now); const unseen = total - seen;
  const finishDays = pace > 0 ? Math.ceil(unseen / pace) : null;
  const projectedSeen = Math.min(total, seen + Math.round(pace * dte));

  // --- retention on review cards (true retention), by kind, last 7 / 30 days
  const since = (d) => now - d * DAY;
  const logs30 = S.logs.filter((l) => Date.parse(l.reviewed_at) >= since(30));
  const retention = {};
  for (const k of Object.keys(KINDS)) {
    const r = (days) => {
      const xs = logs30.filter((l) => l.kind === k && l.state_before === State.Review && Date.parse(l.reviewed_at) >= since(days));
      return { n: xs.length, rate: xs.length ? xs.filter((l) => l.correct).length / xs.length : null };
    };
    retention[k] = { d7: r(7), d30: r(30) };
  }
  const acc = (xs) => (xs.length ? xs.filter((l) => l.correct).length / xs.length : null);

  // --- speed (median correct response time) this week vs last week
  const med = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const speed = {};
  for (const k of Object.keys(KINDS)) {
    const wk = (a, b) => med(S.logs.filter((l) => l.kind === k && l.correct && l.response_ms && Date.parse(l.reviewed_at) >= since(b) && Date.parse(l.reviewed_at) < since(a)).map((l) => l.response_ms));
    speed[k] = { now: wk(0, 7), prev: wk(7, 14) };
  }

  // --- activity heatmap (12 weeks) and streak
  const perDay = new Map();
  for (const l of S.logs) { const d = dayKey(Date.parse(l.reviewed_at)); perDay.set(d, (perDay.get(d) || 0) + 1); }
  const days = []; for (let i = 83; i >= 0; i--) { const t = now - i * DAY; const d = dayKey(t); days.push({ d, n: perDay.get(d) || 0, dow: new Date(t - 4 * 3600000).getDay() }); }
  let streak = 0; for (let i = 0; ; i++) { const d = dayKey(now - i * DAY); if (perDay.get(d)) streak++; else if (i === 0) continue; else break; if (i > 2000) break; }

  // --- forecast next 14 days
  const kinds = new Set(enabledKinds()); const forecast = Array.from({ length: 14 }, (_, i) => ({ i, n: 0 }));
  const eod0 = endOfDay(now);
  for (const c of S.cards.values()) {
    if (!kinds.has(c.kind) || !allowsCard(S.byId.get(c.word_id),c.kind) || c.state === State.New) continue;
    const t = Date.parse(c.due); const idx = t <= eod0 ? 0 : Math.ceil((t - eod0) / DAY);
    if (idx < 14) forecast[idx].n++;
  }

  // --- time of day
  const buckets = [['Morning', 5, 12], ['Afternoon', 12, 17], ['Evening', 17, 22], ['Night', 22, 29]];
  const tod = buckets.map(([name, a, b]) => {
    const xs = logs30.filter((l) => { let h = new Date(l.reviewed_at).getHours(); if (h < 5) h += 24; return h >= a && h < b; });
    return { name, n: xs.length, rate: acc(xs) };
  });

  // --- hardest words & confused pairs
  const hard = [...S.cards.values()].filter((c) => c.lapses >= 2 && allowsCard(S.byId.get(c.word_id),c.kind))
    .sort((a, b) => b.lapses - a.lapses || b.difficulty - a.difficulty).slice(0, 12)
    .map((c) => ({ w: S.byId.get(c.word_id), kind: c.kind, lapses: c.lapses }));
  const pairs = [...confusions()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([k, n]) => { const [a, b] = k.split('-').map(Number); return { a: S.byId.get(a), b: S.byId.get(b), n }; });

  // --- weakest area: by part of speech / word length, last 30 days
  const groups = new Map();
  for (const l of logs30) {
    if (l.state_before !== State.Review) continue; const w = S.byId.get(l.word_id); if (!w) continue;
    const g = `${KINDS[l.kind].label} · ${[...w.h].length}-character words`;
    const e = groups.get(g) || { n: 0, ok: 0 }; e.n++; if (l.correct) e.ok++; groups.set(g, e);
  }
  const weakest = [...groups].filter(([, e]) => e.n >= 15).map(([g, e]) => ({ g, rate: e.ok / e.n, n: e.n })).sort((a, b) => a.rate - b.rate).slice(0, 3);

  const f = factors();
  const today = S.logs.filter((l) => dayKey(Date.parse(l.reviewed_at)) === dayKey(now));
  return {
    total, seen, expected, levels, pace, dte, unseen, finishDays, projectedSeen, retention, speed, days, streak, forecast,
    tod, hard, pairs, weakest, factors: f, today: { n: today.length, acc: acc(today) }, totalReviews: S.logs.length, plan: pacing(now),
  };
}
