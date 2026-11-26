// App state: vocab, cards, review logs, settings. Local-first (IndexedDB) with Supabase sync.
import * as idb from './idb.js';
import { buildLevelExamples, curatedExamples } from './examples.js';
import * as api from './api.js';
import { DEFAULT_SETTINGS } from './config.js';

export const S = {
  vocab: [], examples: new Map(), byId: new Map(), byHanzi: new Map(), charIndex: new Map(),
  cards: new Map(),   // "wordId:kind" -> card
  logs: [],           // review logs, oldest first
  settings: { ...DEFAULT_SETTINGS },
  outbox: { cards: new Set(), logs: new Set(), settings: false },
  sync: { status: 'idle', last: null, error: null },
};
export const key = (wordId, kind) => `${wordId}:${kind}`;
const listeners = new Set();
export const onChange = (fn) => listeners.add(fn);
const emit = () => listeners.forEach((f) => f());

export async function loadVocab() {
  const [r, ...exampleFiles] = await Promise.all([
    fetch('data/vocab.json'),
    ...[1, 2, 3, 4, 5].map(async (level) => {
      try {
        const res = await fetch('data/examples-' + level + '.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
      } catch (err) { console.warn('Examples unavailable for HSK ' + level, err); return {}; }
    }),
  ]);
  S.vocab = await r.json();
  S.examples = buildLevelExamples(S.vocab, exampleFiles, curatedExamples);
  for (const w of S.vocab) {
    S.byId.set(w.i, w); S.byHanzi.set(w.h, w);
    for (const ch of new Set(w.h)) { if (!S.charIndex.has(ch)) S.charIndex.set(ch, []); S.charIndex.get(ch).push(w.i); }
  }
}

export async function loadLocal() {
  const [cards, logs, settings, outbox, sync] = await Promise.all([
    idb.all('cards'), idb.all('logs'), idb.get('kv', 'settings'), idb.get('kv', 'outbox'), idb.get('kv', 'syncMeta')]);
  S.cards = new Map(cards);
  S.logs = logs.map(([, v]) => v).sort((a, b) => a.reviewed_at.localeCompare(b.reviewed_at));
  S.settings = { ...DEFAULT_SETTINGS, ...(settings || {}), kinds: { ...DEFAULT_SETTINGS.kinds, ...(settings?.kinds || {}) } };
  if (outbox) S.outbox = { cards: new Set(outbox.cards), logs: new Set(outbox.logs), settings: !!outbox.settings };
  if (sync) S.sync.last = sync.last;
}

const saveOutbox = () => idb.put('kv', 'outbox', { cards: [...S.outbox.cards], logs: [...S.outbox.logs], settings: S.outbox.settings });

export async function saveCards(cards) {
  const entries = cards.map((c) => [key(c.word_id, c.kind), c]);
  for (const [k, c] of entries) { S.cards.set(k, c); S.outbox.cards.add(k); }
  await idb.putMany('cards', entries); await saveOutbox();
}
export async function addLog(log) {
  S.logs.push(log); S.outbox.logs.add(log.client_id);
  await idb.put('logs', log.client_id, log); await saveOutbox();
}
let settingsRevision = 0;
export async function saveSettings(patch) {
  settingsRevision++;
  S.settings = { ...S.settings, ...patch };
  S.outbox.settings = true;
  await idb.put('kv', 'settings', S.settings); await saveOutbox(); emit();
  scheduleSync();
}

const CARD_COLS = ['word_id', 'kind', 'state', 'due', 'stability', 'difficulty', 'reps', 'lapses', 'step', 'last_review', 'note', 'introduced_at', 'updated_at'];
const LOG_COLS = ['client_id', 'word_id', 'kind', 'rating', 'correct', 'response_ms', 'chosen_word_id', 'state_before',
  'stability_before', 'difficulty_before', 'elapsed_days', 'retrievability', 'reviewed_at'];
const pick = (o, cols) => Object.fromEntries(cols.map((c) => [c, o[c] ?? null]));

// Merge independently reviewed grammar skills by their FSRS update timestamp.
export function mergeGrammarProgress(local={},remote={}) {
  const merged={...remote};
  for(const [k,c] of Object.entries(local)) {
    if(!merged[k] || Date.parse(c.updated_at||0)>=Date.parse(merged[k].updated_at||0)) merged[k]=c;
  }
  return merged;
}
let syncTimer = null, syncing = null;
export function scheduleSync(delay = 4000) { clearTimeout(syncTimer); syncTimer = setTimeout(() => sync(), delay); }

export function sync() {
  if (syncing) return syncing;
  syncing = doSync().finally(() => { syncing = null; });
  return syncing;
}
async function doSync() {
  if (!api.getSession() || !navigator.onLine) { S.sync.status = navigator.onLine ? 'idle' : 'offline'; emit(); return; }
  const uid = api.userId();
  S.sync.status = 'syncing'; emit();
  try {
    // ---- push
    const ck = [...S.outbox.cards];
    for (let i = 0; i < ck.length; i += 500) {
      const batch = ck.slice(i, i + 500).map((k) => S.cards.get(k)).filter(Boolean).map((c) => ({ user_id: uid, ...pick(c, CARD_COLS) }));
      if (batch.length) await api.rest('cards?on_conflict=user_id,word_id,kind', { method: 'POST', body: batch, prefer: 'resolution=merge-duplicates,return=minimal' });
      ck.slice(i, i + 500).forEach((k) => S.outbox.cards.delete(k));
    }
    const logMap = new Map(S.logs.slice(-5000).map((l) => [l.client_id, l]));
    const lk = [...S.outbox.logs];
    for (let i = 0; i < lk.length; i += 500) {
      const batch = lk.slice(i, i + 500).map((k) => logMap.get(k)).filter(Boolean).map((l) => ({ user_id: uid, ...pick(l, LOG_COLS) }));
      if (batch.length) await api.rest('review_logs?on_conflict=client_id', { method: 'POST', body: batch, prefer: 'resolution=ignore-duplicates,return=minimal' });
      lk.slice(i, i + 500).forEach((k) => S.outbox.logs.delete(k));
    }
    if (S.outbox.settings) {
      const remoteSettings = await api.rest(`settings?select=data&user_id=eq.${uid}`);
      S.settings = {...S.settings, grammarProgress:mergeGrammarProgress(S.settings.grammarProgress,remoteSettings?.[0]?.data?.grammarProgress), practiceProgress:mergeGrammarProgress(S.settings.practiceProgress,remoteSettings?.[0]?.data?.practiceProgress), readerWords:mergeGrammarProgress(S.settings.readerWords,remoteSettings?.[0]?.data?.readerWords), readerVisits:mergeGrammarProgress(S.settings.readerVisits,remoteSettings?.[0]?.data?.readerVisits)};
      await idb.put('kv','settings',S.settings);
      const sentRevision=settingsRevision;
      await api.rest('settings?on_conflict=user_id', { method: 'POST', body: [{ user_id: uid, data: S.settings, updated_at: new Date().toISOString() }], prefer: 'resolution=merge-duplicates,return=minimal' });
      if(settingsRevision===sentRevision) S.outbox.settings = false;
    }
    await saveOutbox();

    // ---- pull (changes from other devices)
    const meta = (await idb.get('kv', 'syncMeta')) || { cardsSince: '1970-01-01T00:00:00Z', logId: 0, uid };
    if (meta.uid && meta.uid !== uid) { meta.cardsSince = '1970-01-01T00:00:00Z'; meta.logId = 0; }
    let changed = [];
    for (let off = 0; ; off += 1000) {
      const rows = await api.rest(`cards?select=${CARD_COLS.join(',')}&user_id=eq.${uid}&updated_at=gt.${encodeURIComponent(meta.cardsSince)}&order=updated_at.asc&limit=1000&offset=${off}`);
      for (const r of rows) {
        const k = key(r.word_id, r.kind); const local = S.cards.get(k);
        if (!local || Date.parse(r.updated_at) > Date.parse(local.updated_at || 0)) { S.cards.set(k, r); changed.push([k, r]); }
      }
      if (rows.length) meta.cardsSince = rows[rows.length - 1].updated_at;
      if (rows.length < 1000) break;
    }
    if (changed.length) await idb.putMany('cards', changed);
    const have = new Set(S.logs.map((l) => l.client_id)); const newLogs = [];
    for (;;) {
      const rows = await api.rest(`review_logs?select=id,${LOG_COLS.join(',')}&user_id=eq.${uid}&id=gt.${meta.logId}&order=id.asc&limit=1000`);
      for (const r of rows) { meta.logId = Math.max(meta.logId, r.id); if (!have.has(r.client_id)) { delete r.id; newLogs.push([r.client_id, r]); } }
      if (rows.length < 1000) break;
    }
    if (newLogs.length) {
      await idb.putMany('logs', newLogs);
      S.logs.push(...newLogs.map(([, v]) => v)); S.logs.sort((a, b) => a.reviewed_at.localeCompare(b.reviewed_at));
    }
    const st = await api.rest(`settings?select=data,updated_at&user_id=eq.${uid}`);
    if (st?.[0]?.data && !S.outbox.settings) {
      S.settings = { ...DEFAULT_SETTINGS, ...st[0].data, grammarProgress: mergeGrammarProgress(S.settings.grammarProgress,st[0].data.grammarProgress), practiceProgress: mergeGrammarProgress(S.settings.practiceProgress,st[0].data.practiceProgress), readerWords:mergeGrammarProgress(S.settings.readerWords,st[0].data.readerWords), readerVisits:mergeGrammarProgress(S.settings.readerVisits,st[0].data.readerVisits), kinds: { ...DEFAULT_SETTINGS.kinds, ...(st[0].data.kinds || {}) } };
      await idb.put('kv', 'settings', S.settings);
    }
    meta.uid = uid; meta.last = new Date().toISOString();
    await idb.put('kv', 'syncMeta', meta);
    S.sync = { status: 'ok', last: meta.last, error: null, pulled: changed.length + newLogs.length };
    if(S.outbox.settings) scheduleSync(1000);
  } catch (e) {
    S.sync = { ...S.sync, status: navigator.onLine ? 'error' : 'offline', error: String(e.message || e) };
    console.warn('sync failed', e);
  }
  emit();
}

export async function resetLocal() {
  await Promise.all([idb.clear('cards'), idb.clear('logs'), idb.clear('kv')]);
  S.cards = new Map(); S.logs = []; S.settings = { ...DEFAULT_SETTINGS };
  S.outbox = { cards: new Set(), logs: new Set(), settings: false };
}
