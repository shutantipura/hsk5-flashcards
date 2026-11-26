import { S, key, loadVocab, loadLocal, saveCards, saveSettings, sync, scheduleSync, onChange, resetLocal } from './store.js';
import * as api from './api.js';
import { State, fmtInterval, recallProb } from './fsrs.js';
import {
  KINDS, Session, introduce, answer, options, autoGrade, previewFor, charBreakdown, numericToMarks, pacing, daysToExam,
  markKnown, sample, dueCards, factorOf, enabledKinds,
} from './engine.js';
import { buildReport, wordStatus } from './report.js';
import { APP_VERSION } from './config.js';
import { createReader, checkedLibrary, syllabusExposure } from './reader.js';
import { createFlashcards, levelDeck, RATINGS } from './flashcards.js';
import { createGrammarScreen, grammarQueue } from './grammar.js';
import { GRAMMAR } from './grammar-data.js';
import { createPracticeScreen, practiceStats } from './practice.js';
import { isGrammarOnly, learningType, learningLabel, vocabularyMeanings, grammarPatternsFor, pronunciationExample } from './learning-mode.js';

const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x, d = 0) => (x == null ? '–' : `${(x * 100).toFixed(d)}%`);
const num = (n) => Number(n).toLocaleString('en-US');
const secs = (ms) => (ms == null ? '–' : `${(ms / 1000).toFixed(1)}s`);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const meaningText = (w, n = 2) => vocabularyMeanings(w).slice(0, n).join('; ');
const shortMeaning = (w) => { const t = meaningText(w, 2); return t.length > 64 ? t.slice(0, 62) + '…' : t; };

// ---------- speech
let zhVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices().filter((v) => /^zh[-_](CN|Hans)/i.test(v.lang) || v.lang === 'zh-CN');
  zhVoice = vs.find((v) => /Tingting|Ting-Ting|Yu-shu|Li-mu/i.test(v.name)) || vs[0] || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, slow = false) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'zh-CN'; if (zhVoice) u.voice = zhVoice;
  u.rate = slow ? 0.55 : S.settings.voiceRate || 0.9; speechSynthesis.speak(u);
}

// ---------- toast / tip
let toastT;
function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.append(t); }
  t.innerHTML = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
document.addEventListener('click', (e) => { const el = e.target.closest('[data-tip]'); if (el) toast(esc(el.dataset.tip)); });

// ---------- layout
const TABS = [['home','Today','M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z'],['explore','Explore','M4 3h7v17H4zm9 0h7v17h-7z'],['flashcards','Flashcards','M5 3h14v14H5z M3 7H1v13h14v-2H3z'],['review','Review','M12 3a9 9 0 1 0 9 9h-3a6 6 0 1 1-2-4.5L12 12h9V3l-3 3a9 9 0 0 0-6-3z'],['report','Progress','M4 20V10h3v10zm6.5 0V4h3v16zM17 20v-7h3v7z'],['settings','Settings','M12 2l2 4 4-1 2 4-2 3 2 3-2 4-4-1-2 4-2-4-4 1-2-4 2-3-2-3 2-4 4 1z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z']];
function shell(route, body) {
  const syncDot = { ok: 'ok', syncing: 'busy', error: 'err', offline: 'off', idle: '' }[S.sync.status] || '';
  app.innerHTML = `<main class="screen">${body}</main>
  <nav class="tabbar">${TABS.map(([r, l, d]) => `<a href="#/${r}" class="${route === r ? 'on' : ''}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg><span>${l}</span></a>`).join('')}</nav>
  <i class="syncdot ${syncDot}" data-tip="${esc(syncLabel())}"></i>`;
}
function syncLabel() {
  const s = S.sync; if (s.status === 'error') return `Sync error: ${s.error}`; if (s.status === 'offline') return 'Offline – your progress is saved on this phone and will sync later';
  if (s.status === 'syncing') return 'Syncing…'; return s.last ? `Synced ${new Date(s.last).toLocaleTimeString()}` : 'Not synced yet';
}

// ---------- router
const grammar = createGrammarScreen({S,shell,saveSettings,esc});
const practice = createPracticeScreen({S,shell,saveSettings,esc});
const reader = createReader({S,shell,saveSettings,esc});
const flashcards = createFlashcards({S,shell,saveSettings,esc,getLibrary:()=>checkedLibrary(S.vocab)});
const routes = { flashcards:flashcards.open, login, placement:reader.today, home:reader.today, explore:reader.explore, review:reader.review, study:flashcards.open, report:readerReport, words, settings, grammar:reader.review, practice:reader.explore };
function go(r) { location.hash = `#/${r}`; }
let ready=false;
function route() {
  if(!ready)return;
  const r = (location.hash.replace('#/', '') || 'home').split('?')[0];
  if (!api.getSession() && r !== 'login') { go('login'); return login(); }
  if(api.getSession()&&r==='login'){location.reload();return;}
  (routes[r] || reader.today)();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
onChange(() => { const d = $('.syncdot'); if (d) { d.className = `syncdot ${{ ok: 'ok', syncing: 'busy', error: 'err', offline: 'off' }[S.sync.status] || ''}`; d.dataset.tip = syncLabel(); } });

// ================= WELCOME
function login() {
  const map=api.namedProfiles();
  app.innerHTML = `<main class="screen login profile-welcome">
    <div class="seal">词</div><h1>Chinese Reading Room</h1><p class="muted">学中文，一起进步</p>
    <h2>Who's studying today?</h2>
    <div class="profile-choices">${api.PROFILE_NAMES.map((n,i)=>`<button class="profile-choice ${i?'girlfriend':'boyfriend'}" data-profile="${n}"><span class="profile-avatar" aria-hidden="true">${i?'🌸':'🌿'}</span><strong>${n}</strong><span class="muted small">${map[n]?'Continue learning':'Start learning'}</span></button>`).join('')}</div>
    <p class="muted small">No password needed. Your progress is separate.</p>
    <p id="profile-msg" role="status" class="muted small"></p>
    <details class="card profile-restore" id="profile-restore" ${api.PROFILE_NAMES.every(n=>map[n])?'hidden':''}><summary>Restore existing progress (optional)</summary>
    <form id="restore-form"><label>Profile<select name="profile">${api.PROFILE_NAMES.filter(n=>!map[n]).map(n=>`<option>${n}</option>`).join('')}</select></label>
    <label>Sync code<input name="code" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your existing sync code" required></label>
    <button class="btn">Restore progress</button></form><button class="btn" id="restore-legacy" hidden>Use previous progress on this device</button>
    <p class="muted small">Only needed once to use the same progress on another device.</p></details></main>`;
  let busy=false;
  const msg=$('#profile-msg');
  const select=async(n,opts={})=>{
    if(busy)return;busy=true;app.querySelectorAll('button').forEach(b=>b.disabled=true);msg.textContent='Opening '+n+'…';
    try{await api.chooseProfile(n,opts);location.reload();}
    catch(err){msg.textContent=err.message;busy=false;app.querySelectorAll('button').forEach(b=>b.disabled=false);}
  };
  app.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>select(b.dataset.profile));
  const form=$('#restore-form');form.onsubmit=e=>{e.preventDefault();select(form.profile.value,{code:form.code.value});};
  const legacy=$('#restore-legacy');legacy.onclick=()=>select(form.profile.value,{legacy:true});
  api.legacyProfile().then(id=>{if(id&&!Object.values(map).includes(id)&&api.PROFILE_NAMES.some(n=>!map[n]))legacy.hidden=false;}).catch(()=>{});
}

// ================= PLACEMENT
let P = null;
function placement() {
  if (!P) P = { phase: 'intro', level: 1, items: [], idx: 0, known: [], unknown: [] };
  app.innerHTML = `<main class="screen placement" id="pl"></main>`;
  renderPlacement();
}
function renderPlacement() {
  const el = $('#pl'); if (!el) return;
  const lvWords = (l) => S.vocab.filter((w) => w.l === l && !isGrammarOnly(w) && !S.cards.has(key(w.i, 'meaning')));
  if (P.phase === 'intro') {
    el.innerHTML = `<h1>Let's find what you already know</h1>
      <p>We'll show you 15 random words from each HSK level. Tap <b>Know it</b> only if you can recall the meaning right away.</p>
      <p class="muted">If you know most of a level, you can mark the whole level as known. You'll still be tested on those words now and then over the coming weeks, so anything you've forgotten comes back automatically.</p>
      <button class="btn primary" id="go">Start with HSK 1</button>
      <button class="btn ghost" id="skip">Skip – I'm starting from zero</button>`;
    $('#go').onclick = () => startLevel(1);
    $('#skip').onclick = finishPlacement;
  } else if (P.phase === 'test' || P.phase === 'sweep') {
    const w = P.items[P.idx];
    const label = P.phase === 'test' ? `HSK ${P.level} · sample ${P.idx + 1}/${P.items.length}` : `HSK ${P.level} · word ${P.idx + 1}/${P.items.length}`;
    el.innerHTML = `<div class="ptop"><span class="tag">${label}</span>${P.phase === 'sweep' ? '<button class="link" id="stop">Stop here</button>' : ''}</div>
      <div class="prog"><i style="width:${(P.idx / P.items.length) * 100}%"></i></div>
      <div class="bigword" id="bw">${esc(w.h)}</div>
      <button class="link center" id="peek">Show meaning</button>
      <div class="peek hidden" id="pk"><div class="pinyin">${esc(w.p)}</div><div>${esc(meaningText(w, 3))}</div>${examplesBlock(w)}</div>
      <div class="row2"><button class="btn bad" id="no">Don't know</button><button class="btn good" id="yes">Know it</button></div>`;
    $('#peek').onclick = () => { $('#pk').classList.remove('hidden'); $('#peek').remove(); speak(w.h); };
    const ans = (k) => { (k ? P.known : P.unknown).push(w.i); P.idx++; if (P.idx >= P.items.length) levelDone(); else renderPlacement(); };
    $('#yes').onclick = () => ans(true); $('#no').onclick = () => ans(false);
    if ($('#stop')) $('#stop').onclick = levelDone;
  } else if (P.phase === 'result') {
    const n = P.sampleKnown, t = P.sampleTotal, rate = t ? n / t : 0, rest = lvWords(P.level).filter((w) => !P.known.includes(w.i)).length;
    const advice = rate >= 0.85 ? `You know most of HSK ${P.level}. Marking it as known is the fastest option.` : rate >= 0.4 ? `You know some of HSK ${P.level}. Going through the list word by word takes a few minutes and saves you a lot of study time.` : `HSK ${P.level} is mostly new to you, so these words will be taught from scratch.`;
    el.innerHTML = `<h1>HSK ${P.level}: you knew ${n} of ${t}</h1><p>${advice}</p>
      <div class="stack">
      <button class="btn ${rate >= 0.85 ? 'primary' : ''}" id="all">Mark the other ${rest} HSK ${P.level} words as known</button>
      <button class="btn ${rate >= 0.4 && rate < 0.85 ? 'primary' : ''}" id="sweep">Go through HSK ${P.level} word by word</button>
      <button class="btn ${rate < 0.4 ? 'primary' : ''}" id="new">Learn the rest of HSK ${P.level} as new words</button>
      </div>`;
    const next = async () => { await markKnown(P.known); P.known = []; P.unknown = [];
      if (P.level >= 5 || rate < 0.3) return finishPlacement(); startLevel(P.level + 1); };
    $('#all').onclick = async () => { await markKnown(lvWords(P.level).map((w) => w.i)); next(); };
    $('#sweep').onclick = async () => { await markKnown(P.known); P.known = []; P.phase = 'sweep'; P.items = lvWords(P.level).filter((w) => !P.unknown.includes(w.i)); P.idx = 0; renderPlacement(); };
    $('#new').onclick = next;
  }
}
function startLevel(l) {
  const ws = S.vocab.filter((w) => w.l === l && !isGrammarOnly(w) && !S.cards.has(key(w.i, 'meaning')));
  if (!ws.length) { if (l < 5) return startLevel(l + 1); return finishPlacement(); }
  P = { ...P, phase: 'test', level: l, items: sample(ws, 15), idx: 0, known: [], unknown: [] };
  renderPlacement();
}
async function levelDone() {
  if (P.phase === 'sweep') { await markKnown(P.known); P.known = []; if (P.level >= 5) return finishPlacement(); return startLevel(P.level + 1); }
  P.sampleKnown = P.known.length; P.sampleTotal = P.items.length; P.phase = 'result'; renderPlacement();
}
async function finishPlacement() {
  await markKnown(P?.known || []); P = null;
  await saveSettings({ placementDone: true }); scheduleSync(500); go('home');
}

// ================= HOME
function home() {
  const p = pacing(); const r = buildReport(); const dueN = dueCards().length;
  const newLeft = Math.max(0, p.target - p.today);
  const doneToday = !dueN && !newLeft;
  const grammarStats = grammarQueue(S.settings.grammarProgress || {}); const grammarDue=grammarStats.due.length;
  const applied = practiceStats(S);
  shell('home', `
    <header class="hdr"><div class="seal sm">词</div><div><h1>Today</h1><p class="muted">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div></header>
    <section class="card exam"><div class="big">${p.dte}</div><div><b>days to HSK 5</b><div class="muted">${fmtDate(S.settings.examDate + 'T09:00:00')}</div></div></section>
    <section class="card today">
      <div class="tiles">
        <div><b>${num(dueN)}</b><span>reviews due</span></div>
        <div><b>${newLeft}</b><span>new words left</span></div>
        <div><b>${r.today.n}</b><span>done today</span></div>
      </div>
      ${doneToday ? `<p class="center">All done for today. Nice work.</p><button class="btn" id="extra">Learn 10 extra words</button>`
        : `<button class="btn primary big" id="start">Start studying</button>`}
      <p class="muted small" data-tip="${esc(p.reason)}">Daily target: ${p.target} new words · ${esc(p.reason)}</p>
    </section>
    <section class="card"><div class="kv"><span>Grammar Practice</span><b>${grammarDue} due</b></div><p class="muted small">Learn formal connectors and sentence patterns, then practise using them.</p><a class="link" href="#/grammar">Practise grammar →</a></section>
    <section class="card"><div class="kv"><span>Applied Practice</span><b>${applied.due} due</b></div><p class="muted small">Reading, collocations, near-synonyms, sentence order and personal mistake review.</p><a class="link" href="#/practice">Practise using Chinese →</a></section>
    <section class="card">
      <div class="kv"><span>Words started</span><b>${num(r.seen)} / ${num(r.total)}</b></div>
      <div class="bar"><i style="width:${(r.seen / r.total) * 100}%"></i><i class="exp" style="width:${(r.expected / r.total) * 100}%"></i></div>
      <div class="kv"><span>You'd recall today</span><b>~${num(Math.round(r.expected))} words (${pct(r.expected / r.total)})</b></div>
      <div class="kv"><span>Streak</span><b>${r.streak} day${r.streak === 1 ? '' : 's'}</b></div>
      <a class="link" href="#/report">Full report →</a>
    </section>`);
  if ($('#start')) $('#start').onclick = () => startStudy();
  if ($('#extra')) $('#extra').onclick = () => startStudy(10);
}

// ================= STUDY
let SES = null, CUR = null;
function startStudy(extraNew = 0) { SES = new Session({ extraNew }); CUR = null; go('study'); }
function study() {
  if (!SES) SES = new Session();
  app.innerHTML = `<main class="screen study"><div class="stop"><button class="link" id="quit">✕ End</button><span id="cnt" class="muted small"></span></div>
    <div class="prog"><i id="pg"></i></div><div id="stage"></div></main>`;
  $('#quit').onclick = endSession;
  nextCard();
}
function updateCount() {
  const rem = SES.remaining(); const total = SES.done + rem;
  $('#cnt').textContent = `${SES.done} done · ${rem} left`; $('#pg').style.width = `${total ? (SES.done / total) * 100 : 100}%`;
}
function nextCard() {
  const c = SES.next();
  if (!c) return endSession();
  CUR = { card: c, w: S.byId.get(c.word_id) };
  updateCount();
  if (c.intro) renderIntro(); else renderQuiz();
}
function wordBlock(w, { big = true } = {}) {
  const pos = { n: 'noun', v: 'verb', a: 'adjective', d: 'adverb', c: 'conjunction', p: 'preposition', m: 'measure word', q: 'measure word', r: 'pronoun', u: 'particle', e: 'interjection', vn: 'verb/noun', an: 'adj/noun', ad: 'adj/adverb', t: 'time word', f: 'locative', s: 'place word', i: 'idiom', l: 'phrase', nr: 'name', ns: 'place name', y: 'particle', o: 'onomatopoeia', b: 'attributive', z: 'descriptive' };
  return `<div class="word ${big ? 'big' : ''}"><div class="hz">${esc(w.h)}</div>
    <div class="py">${esc(w.p)}${w.a ? ` <span class="muted small">also ${esc(w.a.join(', '))}</span>` : ''}
      <button class="spk" data-say="${esc(w.h)}" aria-label="Play">🔊</button><button class="spk slow" data-say="${esc(w.h)}" data-slow="1" aria-label="Play slowly">🐢</button></div>
    <ul class="mn">${(isGrammarOnly(w) ? w.m : vocabularyMeanings(w)).map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
    <div class="meta"><span class="tag">HSK ${w.l}</span><span class="tag">${esc(learningLabel(w))}</span>${[...new Set(w.s.map((s) => pos[s] || s))].slice(0, 3).map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div></div>`;
}
function examplesBlock(w) {
  const examples = S.examples.get(w.i) || [];
  // Hide English until requested, so each example is also a reading exercise.
  const highlight = (e) => {
    let out = '', offset = 0;
    for (const token of e.tokens || []) {
      const at = e.zh.indexOf(token, offset);
      if (at < 0) return esc(e.zh);
      out += esc(e.zh.slice(offset, at)) + (token === w.h ? '<mark class="example-target">' + esc(token) + '</mark>' : token === e.targetComponent ? token.split(w.h).map(esc).join('<mark class="example-target">' + esc(w.h) + '</mark>') : esc(token));
      offset = at + token.length;
    }
    return out + esc(e.zh.slice(offset));
  };
  const glossary = (e) => [...new Set(e.tokens || [])].filter(t => t !== w.h).map(t => {
    const matches = S.vocab.filter(v => v.h === t && v.l <= w.l);
    const v = matches.sort((a,b) => a.l-b.l)[0];
    return v ? `<span><b lang="zh-CN">${esc(t)}</b> ${esc(v.p)} · ${esc(shortMeaning(v))}</span>` : '';
  }).filter(Boolean).join('');
  const hasGrammar = grammarPatternsFor(w).length > 0;
  return `<section class="examples" aria-label="Example sentences"><h3>Example sentences <span class="muted small">· HSK ${w.l} or below</span></h3>
    ${examples.map((e) => `<div class="example"><div class="example-body"><div class="example-zh" lang="zh-CN">${highlight(e)}</div>
      <details class="example-help"><summary>Translation &amp; vocabulary</summary><div class="example-en">${esc(e.en)}</div><div class="example-glossary muted small">${glossary(e)}</div></details></div>
      <div class="example-audio"><button type="button" class="spk" data-say="${esc(e.zh)}" aria-label="Play example sentence">🔊</button><button type="button" class="spk slow" data-say="${esc(e.zh)}" data-slow="1" aria-label="Play example slowly">🐢</button></div></div>`).join('')}
    ${hasGrammar ? `<p><a class="link" href="#/grammar?q=${encodeURIComponent(w.h)}">Learn grammar patterns →</a></p>` : ''}
    ${examples.length < 3 ? `<p class="muted small">${examples.length ? examples.length + ' of 3 examples pass' : 'No example currently passes'} the vocabulary check. Harder or unrecognized words are not shown.</p>` : ''}
  </section>`;
}
function breakdownBlock(w) {
  const parts = charBreakdown(w); if ([...w.h].length < 2 && !parts[0]?.others.length) return '';
  return `<div class="bd"><h3>Characters</h3>${parts.map((p) => `<div class="bdrow"><span class="ch">${esc(p.ch)}</span><div>${p.single && p.single.i !== w.i ? `<b>${esc(p.single.p)}</b> ${esc(shortMeaning(p.single))}<br>` : ''}${p.others.length ? `<span class="muted small">also in ${p.others.map((o) => `${esc(o.h)} (${esc(o.m[0])})`).join(', ')}</span>` : ''}</div></div>`).join('')}</div>`;
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-say]'); if (b) { e.preventDefault(); speak(b.dataset.say, !!b.dataset.slow); } });

function renderIntro() {
  const { w } = CUR;
  $('#stage').innerHTML = `<div class="kindtag new">New word</div>${wordBlock(w)}${examplesBlock(w)}${breakdownBlock(w)}
    <button class="btn primary big" id="ok">Got it</button><p class="muted small center">You'll be tested on it in a minute.</p>`;
  speak(w.h);
  $('#ok').onclick = async () => { await introduce(w.i); SES.newSeen++; SES.done++; nextCard(); };
}

function renderQuiz() {
  const { card, w } = CUR; const kind = card.kind; const opts = options(card);
  CUR.opts = opts; CUR.t0 = performance.now(); CUR.answered = false;
  let prompt = '';
  const twin = S.vocab.some((o) => o.h === w.h && o.i !== w.i);
  const context = isGrammarOnly(w) ? pronunciationExample(w) : null; const audioText = context?.zh || w.h;
  if (kind === 'meaning') prompt = `<div class="prompt hz">${esc(w.h)}</div>${twin ? `<p class="muted center">${esc(w.p)}</p>` : ''}`;
  if (kind === 'tone') prompt = `<div class="prompt hz">${esc(w.h)}</div><p class="muted center small">${esc(context?.zh || shortMeaning(w))}</p>`;
  if (kind === 'recall') prompt = `<div class="prompt en">${esc(meaningText(w, 3))}</div><p class="muted center small">${[...w.h].length} character${[...w.h].length > 1 ? 's' : ''}</p>`;
  if (kind === 'listen') prompt = `<button class="prompt listen" data-say="${esc(audioText)}">🔊<span>Tap to replay</span></button><button class="link center" data-say="${esc(audioText)}" data-slow="1">Play slowly</button>${context ? '<p class="center">'+esc(context.zh.replace(w.h,'＿＿'))+'</p>' : ''}`;
  const label = (o) => kind === 'meaning' ? esc(shortMeaning(o.word)) : kind === 'tone' ? esc(o.pinyin) : esc(o.word.h);
  const isNewCard = card.state === State.New;
  $('#stage').innerHTML = `<div class="kindtag ${kind}">${KINDS[kind].label}${isNewCard ? ' · first time' : ''}${card.lapses >= 4 ? ' · <span data-tip="You keep forgetting this one. Check the character breakdown and add your own note.">hard word</span>' : ''}</div>
    ${prompt}<p class="q muted center">${KINDS[kind].hint}</p>
    <div class="opts ${kind === 'meaning' ? 'en' : 'zh'}${kind !== 'meaning' && opts.some((o) => (o.pinyin || o.word.h).length > 6) ? ' long' : ''}">${opts.map((o, i) => `<button class="opt" data-i="${i}">${label(o)}</button>`).join('')}</div>
    <button class="link center" id="idk">I don't know</button>`;
  if (kind === 'listen') setTimeout(() => speak(audioText), 50);
  app.querySelectorAll('.opt').forEach((b) => (b.onclick = () => choose(+b.dataset.i)));
  $('#idk').onclick = () => choose(-1);
}

function choose(i) {
  if (CUR.answered) return; CUR.answered = true;
  const ms = performance.now() - CUR.t0; const { card, w, opts } = CUR; const kind = card.kind;
  const picked = opts[i]; const correct = !!picked && picked.id === w.i;
  const rating = i < 0 ? 1 : autoGrade(kind, correct, ms);
  CUR.result = { correct, ms, chosen: picked && picked.id > 0 ? picked.id : null, auto: rating };
  app.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (opts[j].id === w.i) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); });
  if (kind !== 'listen') speak((isGrammarOnly(w) && pronunciationExample(w)?.zh) || w.h);
  const prev = previewFor(card);
  const wrongWord = !correct && picked?.word && picked.word.i !== w.i ? picked.word : null;
  const showAid = !correct || (card.lapses || 0) >= 3;
  const cardRec = S.cards.get(key(w.i, 'meaning'));
  const names = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };
  const why = !correct ? (i < 0 ? 'Marked as not known' : 'Not quite') : rating === 2 ? `Correct, but slow (${secs(ms)})` : rating === 4 ? `Correct and fast (${secs(ms)})` : `Correct (${secs(ms)})`;
  const reveal = document.createElement('div'); reveal.className = 'reveal';
  reveal.innerHTML = `<div class="verdict ${correct ? 'ok' : 'no'}">${correct ? '✓' : '✗'} ${why}</div>
    ${wordBlock(w, { big: false })}${examplesBlock(w)}
    ${wrongWord ? `<div class="confuse">You picked <b>${esc(wrongWord.h)}</b> ${esc(wrongWord.p)} – ${esc(shortMeaning(wrongWord))}<button class="spk" data-say="${esc(wrongWord.h)}">🔊</button></div>` : ''}
    ${showAid ? breakdownBlock(w) : ''}
    ${showAid && cardRec ? `<label class="note">Your memory hook<textarea id="note" rows="2" placeholder="e.g. a story or picture that links the characters to the meaning">${esc(cardRec.note || '')}</textarea></label>` : ''}
    <div class="grades">${[1, 2, 3, 4].map((g) => `<button class="g g${g} ${g === rating ? 'sel' : ''}" data-g="${g}"><b>${names[g]}</b><span>${fmtInterval(prev[g])}</span></button>`).join('')}</div>
    <button class="btn primary big" id="cont">Continue · ${names[rating]}</button>
    <p class="muted small center">The app picked a grade from your answer and speed. Tap a different one to change it.</p>`;
  $('#idk')?.remove();
  $('#stage').append(reveal);
  reveal.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const commit = async (g) => {
    const note = $('#note')?.value?.trim();
    if (note != null && cardRec && note !== (cardRec.note || '')) await saveCards([{ ...cardRec, note, updated_at: new Date().toISOString() }]);
    await answer(card, { rating: g, correct, ms, chosen: CUR.result.chosen });
    SES.done++; if (correct) SES.correct++; SES.results.push({ w, kind, correct, g });
    scheduleSync(); nextCard();
  };
  reveal.querySelectorAll('.g').forEach((b) => (b.onclick = () => commit(+b.dataset.g)));
  $('#cont').onclick = () => commit(rating);
}

function endSession() {
  const s = SES; SES = null; scheduleSync(300);
  if (!s || !s.done) return go('home');
  const mins = Math.max(1, Math.round((Date.now() - s.started) / 60000));
  const quizzes = s.results.length; const missed = s.results.filter((r) => !r.correct);
  app.innerHTML = `<main class="screen"><h1>Session complete</h1>
    <section class="card"><div class="tiles"><div><b>${quizzes}</b><span>cards</span></div><div><b>${pct(quizzes ? s.correct / quizzes : null)}</b><span>correct</span></div><div><b>${s.newSeen}</b><span>new words</span></div><div><b>${mins}m</b><span>time</span></div></div></section>
    ${missed.length ? `<section class="card"><h3>To look at again</h3>${[...new Map(missed.map((r) => [r.w.i, r])).values()].slice(0, 15).map((r) => `<div class="li"><span class="hz s">${esc(r.w.h)}</span><span>${esc(r.w.p)}</span><span class="muted">${esc(shortMeaning(r.w))}</span></div>`).join('')}</section>` : ''}
    <button class="btn primary big" id="h">Done</button><button class="btn" id="more">Keep going (10 extra words)</button></main>`;
  $('#h').onclick = () => go('home'); $('#more').onclick = () => startStudy(10);
}

// ================= REPORT
function readerReport() {
  const p=S.settings.practiceProgress||{}, words=S.settings.readerWords||{}, visits=S.settings.readerVisits||{};
  const library=checkedLibrary(S.vocab), exposure=syllabusExposure(library,S.vocab), personal=syllabusExposure(library.filter(p=>visits[p.id]),S.vocab);
  const coverageBlock='<section class="card"><h3>Reading vocabulary exposure</h3><div class="kv"><span>Library words covered</span><b>'+exposure.seen+' / '+exposure.total+'</b></div><div class="kv"><span>In 3 or more different stories</span><b>'+exposure.repeated+'</b></div><div class="kv"><span>Words in stories you finished</span><b>'+personal.seen+'</b></div>'+exposure.levels.map(l=>'<div class="kv"><span>HSK '+l.level+'</span><b>'+l.seen+' / '+l.total+'</b></div>').join('')+'<p class="muted small">Counts distinct written word forms in checked passage tokens, not meanings, pronunciation, or mastery. A word appearing in multiple HSK levels can be counted in each level.</p></section>';
  const self=S.settings.flashcardRatings||{}, allWords=[1,2,3,4,5].flatMap(l=>levelDeck(S.vocab,l));
  const flashBlock='<section class="card"><h3>Flashcard familiarity</h3>'+RATINGS.map(([k,label])=>'<div class="kv"><span>'+label+'</span><b>'+allWords.filter(w=>self[w.id]?.rating===k).length+'</b></div>').join('')+'<div class="kv"><span>Not marked</span><b>'+allWords.filter(w=>!self[w.id]).length+'</b></div><a class="link" href="#/flashcards">Open flashcards →</a></section>';
  const summary=(prefix)=>{const rows=Object.entries(p).filter(([k])=>k.startsWith(prefix)).map(([,v])=>v);const correct=rows.reduce((n,x)=>n+(x.correctCount||0),0),wrong=rows.reduce((n,x)=>n+(x.wrongCount||0),0);return correct+wrong?Math.round(100*correct/(correct+wrong))+'% ('+(correct+wrong)+' answers)':'—';};
  shell('report','<header class="hdr"><div><h1>Your reading journey</h1><p class="muted">Understanding matters more than card counts.</p></div></header><section class="card"><div class="kv"><span>Stories completed</span><b>'+Object.keys(visits).length+'</b></div><div class="kv"><span>Reading accuracy</span><b>'+summary('r-')+'</b></div><div class="kv"><span>Listening accuracy</span><b>'+summary('listen:')+'</b></div><div class="kv"><span>Context recall accuracy</span><b>'+summary('reader:')+'</b></div><div class="kv"><span>Self-marked familiar words</span><b>'+Object.values(words).filter(x=>x.status==='known').length+'</b></div><div class="kv"><span>Saved review words</span><b>'+Object.values(words).filter(x=>x.status==='learning').length+'</b></div></section><p class="muted small">Old flashcard and grammar records are retained. Reading accuracy and self-reported familiarity are not official HSK scores.</p>'+coverageBlock+flashBlock+'<button class="btn" id="legacy-report">Previous vocabulary statistics</button><a class="btn" href="#/words">Dictionary &amp; saved examples</a>');
  $('#legacy-report').onclick=report;
}

function report() {
  const r = buildReport();
  const lvl = Object.entries(r.levels);
  const seg = (L, k) => (L[k] / L.total) * 100;
  const kindsWithData = Object.keys(KINDS).filter((k) => r.retention[k].d30.n || enabledKinds().includes(k));
  const maxF = Math.max(1, ...r.forecast.map((f) => f.n));
  const maxD = Math.max(1, ...r.days.map((d) => d.n));
  const heat = (n) => (n === 0 ? 'h0' : n < maxD * 0.25 ? 'h1' : n < maxD * 0.5 ? 'h2' : n < maxD * 0.75 ? 'h3' : 'h4');
  const target = S.settings.retention;
  const proj = r.unseen === 0 ? 'You have started every word. Now it is about keeping them.' : r.pace > 0
    ? (r.finishDays <= r.dte ? `At your pace of ${r.pace.toFixed(1)} new words a day, you'll have started every word by <b>${fmtDate(Date.now() + r.finishDays * 864e5)}</b>, ${r.dte - r.finishDays} days before the exam.`
      : `At ${r.pace.toFixed(1)} new words a day you'd reach about <b>${num(r.projectedSeen)}</b> of ${num(r.total)} words by exam day. You need about <b>${Math.ceil(r.unseen / Math.max(1, r.dte - 10))}</b> a day to finish in time.`)
    : 'Start learning new words to get a projection.';
  shell('report', `
    <header class="hdr"><h1>Report</h1></header>
    <section class="card hero"><div class="muted small">Vocabulary words you'd recall if tested today</div>
      <div class="heronum">${num(Math.round(r.expected))}<span> / ${num(r.total)}</span></div>
      <div class="bar"><i style="width:${(r.seen / r.total) * 100}%"></i><i class="exp" style="width:${(r.expected / r.total) * 100}%"></i></div>
      <div class="legend"><span><i class="sw exp"></i>Expected recall (${pct(r.expected / r.total)})</span><span><i class="sw seen"></i>Started (${num(r.seen)})</span></div>
      <p>${proj}</p></section>

    <section class="card"><h3>Applied Practice</h3><div class="kv"><span>Questions practised</span><b>${practiceStats(S).seen}</b></div><div class="kv"><span>Accuracy</span><b>${pct((practiceStats(S).correct+practiceStats(S).wrong)?practiceStats(S).correct/(practiceStats(S).correct+practiceStats(S).wrong):null)}</b></div><a class="link" href="#/practice">Applied Practice →</a></section><section class="card"><h3>Grammar progress</h3><div class="kv"><span>Skills practised</span><b>${grammarQueue(S.settings.grammarProgress||{}).items.filter(x=>x.c.reps).length} / ${grammarQueue(S.settings.grammarProgress||{}).items.length}</b></div><div class="kv"><span>Grammar-only entries</span><b>${S.vocab.filter(isGrammarOnly).length}</b></div><a class="link" href="#/grammar">Grammar practice →</a></section><section class="card"><h3>By HSK level · vocabulary</h3>
      <div class="legend"><span><i class="sw s-new"></i>New</span><span><i class="sw s-learning"></i>Learning</span><span><i class="sw s-young"></i>Young</span><span><i class="sw s-mature"></i>Mature (3+ weeks)</span></div>
      ${lvl.map(([l, L]) => `<div class="lvl"><span class="lv">HSK ${l}</span><div class="stk">${['new', 'learning', 'young', 'mature'].map((k) => L[k] ? `<i class="s-${k}" style="width:${seg(L, k)}%" data-tip="HSK ${l} · ${k}: ${L[k]} of ${L.total} words"></i>` : '').join('')}</div><span class="muted small">${pct(L.expected / L.total)}</span></div>`).join('')}
      <p class="muted small">Right-hand number: share of that level you'd recall today.</p></section>

    <section class="card"><h3>Retention on reviews</h3><p class="muted small">How often you remembered a card that was due for review. Your target is ${pct(target)}.</p>
      ${kindsWithData.map((k) => { const d = r.retention[k]; const v = d.d30.rate; return `<div class="row"><span class="lv">${KINDS[k].label}</span><div class="meter">${v != null ? `<i style="width:${v * 100}%"></i>` : ''}<b class="tgt" style="left:${target * 100}%"></b></div><span class="val">${pct(v)}<small>${d.d30.n ? ` · ${d.d30.n}` : ''}</small></span></div>`; }).join('')}
      <p class="muted small">Last 30 days; last 7 days: ${kindsWithData.map((k) => `${KINDS[k].label} ${pct(r.retention[k].d7.rate)}`).join(' · ')}</p></section>

    <section class="card"><h3>Answer speed</h3><table class="tbl"><tr><th></th><th>This week</th><th>Last week</th></tr>
      ${kindsWithData.map((k) => { const s = r.speed[k]; const better = s.now && s.prev ? (s.now < s.prev ? '↓ faster' : s.now > s.prev ? '↑ slower' : '') : ''; return `<tr><td>${KINDS[k].label}</td><td>${secs(s.now)} <small class="muted">${better}</small></td><td>${secs(s.prev)}</td></tr>`; }).join('')}</table>
      <p class="muted small">Median time for correct answers. Faster answers mean the word is getting automatic, which matters for the timed exam.</p></section>

    <section class="card"><h3>Activity · ${r.streak}-day streak</h3>
      <div class="heat">${r.days.map((d) => `<i class="${heat(d.n)}" data-tip="${d.d}: ${d.n} reviews"></i>`).join('')}</div>
      <div class="legend"><span>Less</span>${['h0', 'h1', 'h2', 'h3', 'h4'].map((h) => `<i class="sw ${h}"></i>`).join('')}<span>More</span></div></section>

    <section class="card"><h3>Reviews coming up</h3>
      <div class="fc">${r.forecast.map((f) => `<div data-tip="${f.i === 0 ? 'Today' : new Date(Date.now() + f.i * 864e5).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: ${f.n} reviews"><i style="height:${(f.n / maxF) * 100}%"></i><span>${f.i === 0 ? 'T' : new Date(Date.now() + f.i * 864e5).toLocaleDateString('en-GB', { weekday: 'narrow' })}</span></div>`).join('')}</div>
      <p class="muted small">Today: ${r.forecast[0].n} · next 7 days: ${num(r.forecast.slice(0, 7).reduce((a, f) => a + f.n, 0))}. New words add to this.</p></section>

    <section class="card"><h3>When you study best</h3>
      ${r.tod.map((t) => `<div class="row"><span class="lv">${t.name}</span><div class="meter">${t.rate != null ? `<i style="width:${t.rate * 100}%"></i>` : ''}</div><span class="val">${pct(t.rate)}<small>${t.n ? ` · ${t.n}` : ''}</small></span></div>`).join('')}
      <p class="muted small">Share correct, last 30 days, all cards.</p></section>

    ${r.weakest.length ? `<section class="card"><h3>Weakest areas</h3>${r.weakest.map((x) => `<div class="kv"><span>${esc(x.g)}</span><b>${pct(x.rate)}</b></div>`).join('')}</section>` : ''}

    <section class="card"><h3>Words you mix up</h3>${r.pairs.length ? r.pairs.map((p) => `<div class="pair"><span class="hz s">${esc(p.a.h)}</span><span class="muted small">${esc(p.a.m[0])}</span><span class="vs">↔</span><span class="hz s">${esc(p.b.h)}</span><span class="muted small">${esc(p.b.m[0])}</span><b>${p.n}×</b></div>`).join('') + '<p class="muted small">These pairs are shown together as answer choices, so you learn to tell them apart.</p>' : '<p class="muted small">Nothing yet. When you pick a wrong answer, the pair is tracked here.</p>'}</section>

    <section class="card"><h3>Hardest words</h3>${r.hard.length ? r.hard.map((h) => `<div class="li"><span class="hz s">${esc(h.w.h)}</span><span>${esc(h.w.p)}</span><span class="muted">${esc(KINDS[h.kind].label)} · forgotten ${h.lapses}×</span></div>`).join('') : '<p class="muted small">No repeat offenders yet.</p>'}</section>

    <section class="card"><h3>Your memory profile</h3>
      ${Object.keys(KINDS).filter((k) => r.factors[k]).map((k) => { const f = r.factors[k]; return `<div class="kv"><span>${KINDS[k].label}</span><b>${f.n < 30 ? `<span class="muted">learning (${f.n}/30 reviews)</span>` : `${f.factor.toFixed(2)}×`}</b></div>`; }).join('')}
      <p class="muted small">After 30+ reviews, the app compares how often you actually remember against what the model predicted, then adjusts. Above 1× means you remember better than average, so reviews are spaced further apart. Below 1× means reviews come sooner.</p>
      <div class="kv"><span>Total reviews</span><b>${num(r.totalReviews)}</b></div></section>`);
}

// ================= WORDS
let WQ = { q: '', l: 0, type: 'all' };
function words() {
  shell('words', `<header class="hdr"><h1>Words</h1></header>
    <input id="q" class="search" placeholder="Search hanzi, pinyin or English" value="${esc(WQ.q)}">
    <div class="chips">${[0, 1, 2, 3, 4, 5].map((l) => `<button class="chip ${WQ.l === l ? 'on' : ''}" data-l="${l}">${l ? `HSK ${l}` : 'All'}</button>`).join('')}</div>
    <label class="small">Learning type<select id="learning-type">${[["all","All words"],["vocabulary","Vocabulary"],["grammar","Grammar only"],["mixed","Vocabulary + grammar"],["pending","Grammar lesson pending"]].map(([k,n])=>`<option value="${k}" ${WQ.type===k?"selected":""}>${n}</option>`).join("")}</select></label><div id="wl"></div>`);
  $('#learning-type').onchange=e=>{WQ.type=e.target.value;renderList();};
  $('#q').oninput = (e) => { WQ.q = e.target.value; renderList(); };
  app.querySelectorAll('.chip').forEach((b) => (b.onclick = () => { WQ.l = +b.dataset.l; words(); }));
  renderList();
}
const stripTones = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s/g, '').toLowerCase();
function renderList() {
  const q = WQ.q.trim().toLowerCase(); const qs = stripTones(q);
  let list = S.vocab.filter((w) => (!WQ.l || w.l === WQ.l) && (WQ.type==='all'||learningType(w)===WQ.type));
  if (q) {
    const re = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const score = (w) => (w.h.includes(q) ? 0 : stripTones(w.p).startsWith(qs) ? 1 : stripTones(w.p).includes(qs) ? 2 : w.m.some((m) => re.test(m)) ? 3 : 9);
    list = list.map((w) => [score(w), w]).filter(([sc]) => sc < 9).sort((a, b) => a[0] - b[0]).map(([, w]) => w);
  }
  const shown = list.slice(0, 200);
  $('#wl').innerHTML = `<p class="muted small">${num(list.length)} words${list.length > 200 ? ' · showing first 200' : ''}</p>` +
    shown.map((w) => `<button class="li wbtn" data-w="${w.i}"><i class="dot st-${wordStatus(w)}"></i><span class="hz s">${esc(w.h)}</span><span>${esc(w.p)}</span><span class="muted">${isGrammarOnly(w) ? "Grammar · "+esc(shortMeaning(w)) : esc(shortMeaning(w))}</span></button>`).join('');
  app.querySelectorAll('.wbtn').forEach((b) => (b.onclick = () => wordSheet(+b.dataset.w)));
}
function wordSheet(id) {
  const w = S.byId.get(id); const now = Date.now();
  const rows = Object.keys(KINDS).map((k) => { const c = S.cards.get(key(id, k)); if (!c) return ''; return `<div class="kv"><span>${KINDS[k].label}</span><b>${c.state === State.Review ? `next ${fmtInterval(Math.max(0, Date.parse(c.due) - now))} · ${pct(recallProb(c, now, factorOf(k)))} recall` : ['new', 'learning', '', 'relearning'][c.state]}${c.lapses ? ` · forgot ${c.lapses}×` : ''}</b></div>`; }).join('');
  const sheet = document.createElement('div'); sheet.className = 'sheet';
  const mc = S.cards.get(key(id, 'meaning')); const grammarOnly=isGrammarOnly(w);
  sheet.innerHTML = `<div class="sheetin">${wordBlock(w)}${examplesBlock(w)}${breakdownBlock(w)}${grammarOnly ? '<p class="muted small">Meaning and recall cards are paused; your historical progress is retained. Learn usage in Grammar.</p>' : ''}${rows || '<p class="muted">Not started yet.</p>'}
    ${mc ? `<label class="note">Your memory hook<textarea id="wnote" rows="2">${esc(mc.note || '')}</textarea></label>` : ''}
    <div class="${!mc && !grammarOnly ? 'row2' : ''}">${!mc && !grammarOnly ? '<button class="btn" id="known">I know this</button>' : ''}<button class="btn primary" id="close">Close</button></div></div>`;
  document.body.append(sheet);
  const close = async () => { const n = $('#wnote')?.value?.trim(); if (mc && n !== (mc.note || '')) { await saveCards([{ ...mc, note: n, updated_at: new Date().toISOString() }]); scheduleSync(); } sheet.remove(); };
  sheet.querySelector('a[href^="#/grammar"]')?.addEventListener('click',e=>{e.preventDefault();const href=e.currentTarget.getAttribute('href');close().then(()=>{location.hash=href;});});
  $('#close', sheet).onclick = close; sheet.onclick = (e) => { if (e.target === sheet) close(); };
  if ($('#known', sheet)) $('#known', sheet).onclick = async () => { await markKnown([id]); scheduleSync(); sheet.remove(); renderList(); toast('Marked as known – it will come up for a check later.'); };
}

// ================= SETTINGS
function settings() {
  const st = S.settings;
  shell('settings', `<header class="hdr"><h1>Settings</h1></header>
    <section class="card form">
      <label>Exam date<input type="date" id="exam" value="${esc(st.examDate)}"></label>
      <label>Target recall<select id="ret">${[0.85, 0.88, 0.9, 0.92, 0.95].map((v) => `<option value="${v}" ${v === st.retention ? 'selected' : ''}>${pct(v)}${v === 0.9 ? ' (recommended)' : v > 0.9 ? ' (more reviews)' : ' (fewer reviews)'}</option>`).join('')}</select></label>
      <label>Assume familiar through (optional)<select id="reader-baseline">${[0,1,2,3,4].map(n=>`<option value="${n}" ${n===(st.readerBaseline||0)?'selected':''}>${n?'HSK '+n:'No assumption'}</option>`).join('')}</select></label>
      <p class="muted small">Only used for reading difficulty estimates. Marking individual words overrides this assumption; it does not certify vocabulary mastery.</p>
    </section>
    <section class="card form"><h3>Voice</h3>
      <label>Speed<select id="rate">${[0.7, 0.8, 0.9, 1].map((v) => `<option value="${v}" ${v === st.voiceRate ? 'selected' : ''}>${v === 1 ? 'Normal' : `${Math.round(v * 100)}%`}</option>`).join('')}</select></label>
      <button class="btn" id="test">Test voice · 你好，欢迎学习</button>
    </section>
    <section class="card form"><h3>Profile</h3><div class="kv"><span>Studying as</span><b>${esc(api.profileName()||"")}</b></div><button class="btn" id="switch-profile">Switch profile</button></section>
    <section class="card form"><h3>Data</h3>
      <label>Sync code<input id="code" readonly value="${esc(api.userId() || '')}"></label>
      <button class="btn" id="copy">Copy sync code</button>
      <p class="muted small">Save this somewhere safe, for example in Notes. It restores your progress on a new phone or after reinstalling the app.</p>
      <div class="kv"><span>Sync</span><b>${esc(syncLabel())}</b></div>
      <button class="btn" id="sync">Sync now</button>
      <button class="btn" id="exp">Export my data (JSON)</button>
      <button class="btn bad" id="out">Remove progress from this phone</button>
      <p class="muted small center">Version ${APP_VERSION}</p>
    </section>`);
  $('#switch-profile').onclick=()=>{location.hash='#/login';};
  $('#exam').onchange = (e) => e.target.value && saveSettings({ examDate: e.target.value });
  $('#ret').onchange = (e) => saveSettings({ retention: +e.target.value });
  $('#reader-baseline').onchange = e => saveSettings({readerBaseline:+e.target.value});
  $('#rate').onchange = (e) => saveSettings({ voiceRate: +e.target.value });
  $('#test').onclick = () => speak('你好，欢迎学习');
  $('#sync').onclick = async () => { await sync(); settings(); toast(esc(syncLabel())); };
  $('#exp').onclick = () => {
    const blob = new Blob([JSON.stringify({ settings: S.settings, cards: [...S.cards.values()], logs: S.logs }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hsk5-export-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  };
  $('#copy').onclick = async () => { try { await navigator.clipboard.writeText(api.userId()); toast('Sync code copied'); } catch { $('#code').select(); toast('Select and copy the code'); } };
  $('#out').onclick = async () => {
    await sync();
    const unsynced = S.outbox.cards.size || S.outbox.logs.size || S.outbox.settings;
    if (!confirm(unsynced ? 'Some progress has not synced yet and will be lost. Remove anyway?' : 'Your progress stays saved online. You can bring it back with your sync code. Remove it from this phone?')) return;
    await resetLocal(); await api.forgetProfile(); location.hash='#/login'; location.reload();
  };
}

// ================= BOOT
async function boot() {
  app.innerHTML = '<main class="screen center"><div class="seal">词</div><p class="muted">Loading…</p></main>';
  await api.loadSession();
  if(api.getSession()){
    await Promise.all([loadVocab(),loadLocal()]);
    if(api.isFreshProfile())await saveSettings({});
    history.replaceState(null,'','#/home');
  }else history.replaceState(null,'','#/login');
  ready=true;route();
  if(api.getSession()){sync().then(()=>{if(api.getSession()&&location.hash==='#/home'&&$('#read-level'))route();});}
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sync(); else if (api.getSession()) scheduleSync(500); });
  window.addEventListener('online', () => scheduleSync(500));
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js');
}
boot();

// Expose for debugging / tests
window.__hsk = { S, api };
