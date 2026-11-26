// Applied practice. All practice reviews are separate from vocabulary and grammar FSRS.
import { PRACTICE as BASE_PRACTICE } from './practice-data.js';
import { COVERAGE_PRACTICE } from './coverage-practice-data.js';
const PRACTICE = [...BASE_PRACTICE, ...COVERAGE_PRACTICE];
import { GRAMMAR } from './grammar-data.js';
import { grammarPrompt } from './grammar.js';
import { grammarPatternsFor, isGrammarOnly, vocabularyMeanings } from './learning-mode.js';
import { State, schedule, recallProb, fmtInterval } from './fsrs.js';

export const READING_TYPES={detail:'Detail',inference:'Inference',main:'Main idea',vocabulary:'Vocabulary in context'};
export const MODES={reading:'Reading',collocation:'Collocations',synonym:'Near-synonyms',order:'Sentence order',mistakes:'Mistake review'};
const day=86400000;
const clean=s=>String(s||'').replace(/[\p{P}\p{Z}\s]/gu,'');
const unique=a=>[...new Set(a)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function stableNumber(s){let n=0;for(const c of s)n=(n*31+c.charCodeAt(0))>>>0;return n%1000000+1;}
export function practiceCard(progress,id,now=Date.now()){
  return progress[id]||{word_id:stableNumber(id),state:State.New,due:new Date(now).toISOString(),reps:0,lapses:0,step:0,stability:0,difficulty:0,last_review:null};
}
export function gradePractice(progress,id,correct,now=Date.now(),retention=.9){
  const old=practiceCard(progress,id,now);
  const {card}=schedule(old,correct?3:1,now,{retention});
  return {...progress,[id]:{...card,lastRating:correct?3:1,correctCount:(old.correctCount||0)+Number(correct),wrongCount:(old.wrongCount||0)+Number(!correct)}};
}
export function buildKnowledge(S,now=Date.now()){
  const known=new Set(),gp=S.settings.grammarProgress||{};
  for(const w of S.vocab){
    const c=S.cards.get(w.i+':meaning');
    if(c?.reps&&c.state!==State.New&&recallProb(c,now)>=.75&&!isGrammarOnly(w))known.add(w.h);
    if(grammarPatternsFor(w).some(p=>['cloze','function','contrast','produce'].some(k=>{const x=gp[p.id+':'+k];return x?.reps&&x.lastRating!==1&&recallProb(x,now)>=.75;})))known.add(w.h);
  }
  return known;
}
export function readingCoverage(q,known){
  const ts=unique(q.passageTokens||q.tokens||[]);
  const unfamiliar=ts.filter(t=>!known.has(t));
  return {ratio:ts.length?(ts.length-unfamiliar.length)/ts.length:0,unfamiliar,total:ts.length};
}
function mistakeWeights(S,now){
  const words=new Map(),grammar=new Map();
  for(const l of S.logs){
    const age=(now-Date.parse(l.reviewed_at))/day;
    if(age<0||age>30||!Number.isFinite(age))continue;
    const score=(l.correct?-.25:1)*Math.exp(-age/14);
    words.set(l.word_id,(words.get(l.word_id)||0)+score);
  }
  for(const c of S.cards.values())if(c.lapses>0)words.set(c.word_id,(words.get(c.word_id)||0)+Math.min(c.lapses,5)*.2);
  const gp=S.settings.grammarProgress||{};
  for(const p of GRAMMAR){
    let score=0;
    for(const k of ['cloze','contrast','function','produce']){
      const c=gp[p.id+':'+k];if(c?.reps)score+=Math.min(c.lapses||0,5)*.4+(c.lastRating===1?2:0)+(c.state===State.Relearning?1:0);
    }
    if(score>0)grammar.set(p.id,score);
  }
  return {words,grammar};
}
function targetSpan(w,e){
  let offset=0;const target=e.targetComponent||w.h;
  for(const token of e.tokens||[]){const at=e.zh.indexOf(token,offset);if(at<0)return null;if(token===target){const inner=token.indexOf(w.h);if(inner>=0)return [at+inner,at+inner+w.h.length];}offset=at+token.length;}
  return null;
}
function wordMistake(S,w,weight,now){
  const es=(S.examples.get(w.i)||[]).filter(e=>e.tokens?.includes(w.h)&&targetSpan(w,e));
  if(!es.length)return null;
  const id='mw-'+w.i, c=practiceCard(S.settings.practiceProgress||{},id,now),e=es[c.reps%es.length],span=targetSpan(w,e);
  const rejected=new Set([w.h]);const options=[w.h],targetWords=new Set(vocabularyMeanings(w).join(' ').toLowerCase().match(/[a-z]{4,}/g)||[]);
  const add=(o,confused=false)=>{if(!o||options.length>=3||rejected.has(o.h)||o.l>w.l||isGrammarOnly(o))return;rejected.add(o.h);if(!confused&&vocabularyMeanings(o).join(' ').toLowerCase().match(/[a-z]{4,}/g)?.some(t=>targetWords.has(t)))return;options.push(o.h);};
  for(const l of [...S.logs].reverse())if(!l.correct&&l.word_id===w.i&&l.chosen_word_id)add(S.byId.get(l.chosen_word_id),true);
  for(const o of shuffle(S.vocab.filter(o=>o.l<=w.l&&o.s.some(x=>w.s.includes(x))&&o.h.length===w.h.length)))add(o);
  for(const o of shuffle(S.vocab.filter(o=>o.l<=w.l)))add(o);
  if(options.length!==3)return null;
  return {id,kind:'mistakes',level:w.l,prompt:e.zh.slice(0,span[0])+'＿＿'+e.zh.slice(span[1]),hint:e.en,answer:w.h,choices:options,explain:'Original sentence: '+e.zh+' — '+e.en,words:[w.h],tokens:e.tokens,weight,source:'Vocabulary mistake · Reconstruct the original sentence'};
}
export function mistakeQuestions(S,level=5,now=Date.now()){
  const weights=mistakeWeights(S,now),out=[];
  for(const [id,c] of Object.entries(S.settings.practiceProgress||{})){if(!c.reps)continue;if(id.startsWith('mw-')){const wid=+id.slice(3);weights.words.set(wid,Math.max(.1,weights.words.get(wid)||0));}else if(id.startsWith('mg-')){const pid=id.slice(3);weights.grammar.set(pid,Math.max(.1,weights.grammar.get(pid)||0));}}
  for(const [id,weight] of [...weights.words].sort((a,b)=>b[1]-a[1]).slice(0,150)){
    if(weight<=0)continue;const w=S.byId.get(id);if(!w||w.l>level)continue;
    if(isGrammarOnly(w)){for(const p of grammarPatternsFor(w))weights.grammar.set(p.id,Math.max(weights.grammar.get(p.id)||0,weight));continue;}
    const q=wordMistake(S,w,weight,now);if(q)out.push(q);
  }
  for(const p of GRAMMAR){const weight=weights.grammar.get(p.id);if(!weight||p.level>level)continue;
    const id='mg-'+p.id,c=practiceCard(S.settings.practiceProgress||{},id,now),q=grammarPrompt(p,'cloze',c.reps);
    out.push({id,kind:'mistakes',level:p.level,prompt:q.prompt,hint:q.hint,answer:q.answer,choices:[p.word,...p.distractors],explain:p.explain+' '+q.example.zh+' — '+q.example.en,words:[p.word],tokens:q.example.tokens,weight,source:'Grammar mistake'});
  }
  // A wrong applied-practice answer is also eligible for this review.
  for(const q of PRACTICE){const c=S.settings.practiceProgress?.[q.id];if(q.level<=level&&c?.lastRating===1)out.push({...q,weight:2+Math.min(c.wrongCount||0,5)*.2,source:'Applied practice mistake'});}
  return out.sort((a,b)=>b.weight-a.weight);
}
export function readingQuestions(level=5,{exact=false,type='all'}={}){
  return PRACTICE.filter(q=>q.kind==='reading'&&(exact?(q.passageLevel||q.level)===level:(q.passageLevel||q.level)<=level)&&(type==='all'||q.questionType===type));
}
export function readingStats(S,level=5,exact=false){
  const progress=S.settings.practiceProgress||{};
  return Object.entries(READING_TYPES).map(([type,label])=>{
    const qs=readingQuestions(level,{exact,type});
    let correct=0,wrong=0;
    for(const q of qs){correct+=progress[q.id]?.correctCount||0;wrong+=progress[q.id]?.wrongCount||0;}
    return {type,label,total:qs.length,correct,wrong,accuracy:correct+wrong?correct/(correct+wrong):null};
  });
}
export function groupReadingRows(rows,limit,adaptive){
  const groups=new Map();
  for(const row of rows){const id=row.q.passageId||row.q.passage;const group=groups.get(id)||[];group.push(row);groups.set(id,group);}
  const groupsSorted=[...groups.values()].map(all=>{
    // Preserve each question's own schedule. Practise due and new questions together;
    // if a passage has none, allow early review only when the learner has no ready passages.
    const ready=all.filter(r=>r.due||!r.c.reps);
    const active=ready.length?ready:all;
    return {rows:active,ready:ready.length>0,due:active.some(r=>r.due),coverage:active[0].coverage?.ratio||0,level:active[0].q.passageLevel||active[0].q.level,oldest:Math.min(...active.map(r=>Date.parse(r.c.due)))};
  });
  const fitness=x=>x.coverage>=.85?1-Math.abs(x.coverage-.93):x.coverage;
  groupsSorted.sort((a,b)=>Number(b.due)-Number(a.due)||Number(b.ready)-Number(a.ready)||(a.due&&b.due?a.oldest-b.oldest:0)||(adaptive?fitness(b)-fitness(a):0)||a.level-b.level||a.oldest-b.oldest);
  const available=groupsSorted.some(x=>x.ready)?groupsSorted.filter(x=>x.ready):groupsSorted;
  const selected=[];
  for(const group of available){
    if(selected.length+group.rows.length>limit)continue;
    selected.push(...group.rows.sort((a,b)=>a.q.id.localeCompare(b.q.id,undefined,{numeric:true})));
  }
  return selected.length?selected:(available[0]?.rows.slice(0,limit)||[]);
}
export function practiceQueue(S,mode,level=5,limit=10,now=Date.now(),adaptive=true,readingOptions={}){
  const progress=S.settings.practiceProgress||{},known=buildKnowledge(S,now);
  const qs=(mode==='mistakes'?mistakeQuestions(S,level,now):mode==='reading'?readingQuestions(level,readingOptions):PRACTICE.filter(q=>q.kind===mode&&q.level<=level)).filter(q=>!readingOptions.exact||(q.passageLevel||q.level)===level);
  const rows=qs.map(q=>{const c=practiceCard(progress,q.id,now);const due=!!c.reps&&Date.parse(c.due)<=now;const coverage=q.passage?readingCoverage(q,known):null;return {q,c,due,coverage};});
  const sort=(a,b)=>{
    if(mode==='mistakes')return Number(b.due)-Number(a.due)||(b.q.weight||0)-(a.q.weight||0)||Date.parse(a.c.due)-Date.parse(b.c.due);
    if(a.due!==b.due)return Number(b.due)-Number(a.due);
    if(!!a.c.reps!==!!b.c.reps)return Number(!!a.c.reps)-Number(!!b.c.reps);
    if(mode==='reading'&&adaptive){const ac=a.coverage?.ratio||0,bc=b.coverage?.ratio||0;const aFit=ac>=.85?1:0,bFit=bc>=.85?1:0;if(aFit!==bFit)return bFit-aFit;if(ac!==bc)return bc-ac;}
    if(a.c.reps&&b.c.reps)return Date.parse(a.c.due)-Date.parse(b.c.due);
    return a.q.level-b.q.level||a.q.id.localeCompare(b.q.id);
  };
  rows.sort(sort);
  return {rows,selected:mode==='reading'?groupReadingRows(rows,limit,adaptive):rows.slice(0,limit),due:rows.filter(x=>x.due).length,fresh:rows.filter(x=>!x.c.reps).length};
}
export function practiceStats(S,now=Date.now()){
  const p=S.settings.practiceProgress||{},cards=Object.values(p);
  return {due:cards.filter(c=>c.reps&&Date.parse(c.due)<=now).length,seen:cards.filter(c=>c.reps).length,correct:cards.reduce((n,c)=>n+(c.correctCount||0),0),wrong:cards.reduce((n,c)=>n+(c.wrongCount||0),0)};
}
export function orderCorrect(q,parts){return clean(parts.join(''))===clean(q.answer);}
export function createPracticeScreen({S,shell,saveSettings,esc}){
  let level=5,mode='reading',adaptive=true,exact=true,readingType='all',limit=10,queue=[],idx=0,correct=0,busy=false,answerState=null,chosen=[],tiles=[],readingAnswers=[];
  const $=s=>document.querySelector(s),progress=()=>S.settings.practiceProgress||{};
  function dashboard(){
    queue=[];idx=0;busy=false;readingAnswers=[];
    const stats=practiceStats(S),known=buildKnowledge(S);
    const counts=Object.fromEntries(Object.keys(MODES).map(k=>[k,k==='mistakes'?mistakeQuestions(S,level).filter(q=>(q.passageLevel||q.level)===level).length:k==='reading'?readingQuestions(level,{exact,type:readingType}).length:PRACTICE.filter(q=>q.kind===k&&q.level===level).length]));
    shell('practice','<header class="hdr"><div><h1>Applied Practice</h1><p class="muted">Use what you know in context.</p></div></header>'+
      '<section class="card"><div class="grammar-stats"><div><b>'+stats.due+'</b><span>Due</span></div><div><b>'+stats.seen+'</b><span>Practised</span></div><div><b>'+(stats.correct+stats.wrong?Math.round(100*stats.correct/(stats.correct+stats.wrong))+'%':'—')+'</b><span>Accuracy</span></div></div>'+
      '<label>HSK level<select id="pr-level">'+[1,2,3,4,5].map(l=>'<option value="'+l+'" '+(l===level?'selected':'')+'>HSK '+l+'</option>').join('')+'</select></label>'+
      '<label>Questions per session<select id="pr-limit">'+[5,10,20].map(n=>'<option '+(n===limit?'selected':'')+' value="'+n+'">'+n+'</option>').join('')+'</select></label>'+
      '<label>Reading question type<select id="pr-reading-type">'+[['all','All types'],...Object.entries(READING_TYPES)].map(([k,n])=>'<option value="'+k+'" '+(k===readingType?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
      '<label class="pr-check"><input id="pr-adaptive" type="checkbox" '+(adaptive?'checked':'')+'> Match reading to my studied vocabulary</label><p class="muted small">'+known.size+' words estimated familiar. Reading uses checked passages ranked for a manageable challenge. Answers, translations and unfamiliar words appear after the passage questions.</p></section>'+
      Object.entries(MODES).map(([k,name])=>'<button class="btn grammar-pattern" data-mode="'+k+'" '+(!counts[k]?'disabled':'')+'><span><b>'+name+'</b><small>'+({reading:'Short passages and Chinese questions',collocation:'Natural word combinations',synonym:'Choose the best fit in context',order:'Arrange the sentence chunks',mistakes:'From your vocabulary, grammar and practice history'}[k])+'</small></span><span class="muted">'+counts[k]+' ›</span></button>').join('')+
      '<section class="card"><h3>Reading accuracy by skill</h3>'+readingStats(S,level,exact).map(x=>'<div class="kv"><span>'+esc(x.label)+' <small class="muted">('+x.total+' questions)</small></span><b>'+(x.accuracy===null?'—':Math.round(x.accuracy*100)+'%')+'</b></div>').join('')+'</section><p class="muted small">These reviews have their own schedule and do not change your vocabulary or grammar mastery.</p>');
    $('#pr-level').onchange=e=>{level=+e.target.value;dashboard();};$('#pr-limit').onchange=e=>{limit=+e.target.value;};$('#pr-adaptive').onchange=e=>{adaptive=e.target.checked;};$('#pr-reading-type').onchange=e=>{readingType=e.target.value;dashboard();};
    document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;queue=practiceQueue(S,mode,level,limit,Date.now(),adaptive,{exact,type:readingType}).selected;idx=0;correct=0;readingAnswers=[];next();});
  }
  function next(){
    if(idx>=queue.length){shell('practice','<section class="card center"><h1>Practice complete</h1><p class="pr-score">'+correct+' / '+queue.length+'</p><p class="muted">Your next practice review dates have been saved.</p><button class="btn primary" id="pr-home">Back to Practice</button></section>');$('#pr-home').onclick=dashboard;return;}
    answerState=null;chosen=[];busy=false;const q=queue[idx].q;tiles=q.kind==='order'?shuffle(q.chunks.map((text,i)=>({text,i}))):[];
    if(tiles.length>1&&tiles.map(t=>t.text).join('')===q.answer)tiles.push(tiles.shift());
    render();
  }
  function render(){
    const {q,coverage}=queue[idx];const order=q.kind==='order';const opts=order?[]:shuffle(q.choices);
    const passageRows=q.passage?queue.filter(x=>x.q.passage===q.passage):[];
    const passageNumber=q.passage?passageRows.findIndex(x=>x.q.id===q.id)+1:0;
    const passage=q.passage?'<section class="card"><div class="kv"><b>'+esc(q.title||'阅读')+'</b><span class="muted small">'+passageNumber+' / '+passageRows.length+'</span><button class="link" data-say="'+esc(q.passage)+'" aria-label="Listen">🔊</button></div><p class="pr-passage" lang="zh-CN">'+esc(q.passage)+'</p>'+(coverage?'<p class="small muted">Estimated familiar vocabulary: '+Math.round(coverage.ratio*100)+'% of distinct words</p>':'')+'</section>':'';
    shell('practice','<button class="link" id="pr-home">‹ Practice</button><div class="ptop"><span class="tag">HSK '+q.level+' · '+esc(MODES[q.kind]||'Mistake review')+(q.questionType?' · '+esc(READING_TYPES[q.questionType]||q.questionType):'')+'</span><span class="muted small">'+(idx+1)+' / '+queue.length+'</span></div>'+passage+
      '<section class="card"><h2 class="grammar-question">'+esc(q.prompt)+'</h2>'+(q.hint?'<p class="muted">'+esc(q.hint)+'</p>':'')+(q.source?'<p class="muted small">'+esc(q.source)+'</p>':'')+
      (order?'<p class="muted small">Tap chunks to assemble the model sentence. Tap an assembled chunk to remove it.</p><div id="pr-built" class="pr-built"></div><div id="pr-tiles" class="pr-tiles"></div><button class="btn primary" id="pr-check">Check sentence</button>':opts.map((o,i)=>'<button class="btn grammar-option" data-pr-choice="'+i+'">'+esc(o)+'</button>').join(''))+
      '<button class="btn ghost" id="pr-unknown">I don’t know</button><div id="pr-feedback" aria-live="polite"></div></section>');
    $('#pr-home').onclick=dashboard;$('#pr-unknown').onclick=()=>feedback(false,q,opts);
    if(order){drawTiles();$('#pr-check').onclick=()=>feedback(orderCorrect(q,chosen.map(i=>tiles[i].text)),q,opts);}
    else document.querySelectorAll('[data-pr-choice]').forEach(b=>b.onclick=()=>feedback(opts[+b.dataset.prChoice]===q.answer,q,opts,+b.dataset.prChoice));
  }
  function drawTiles(){
    $('#pr-built').innerHTML=chosen.length?chosen.map(i=>'<button class="pr-tile" data-remove="'+i+'">'+esc(tiles[i].text)+'</button>').join(''):'<span class="muted small">Your sentence</span>';
    $('#pr-tiles').innerHTML=tiles.map((t,i)=>'<button class="pr-tile" data-tile="'+i+'" '+(chosen.includes(i)?'disabled':'')+'>'+esc(t.text)+'</button>').join('');
    $('#pr-check').disabled=chosen.length!==tiles.length;
    document.querySelectorAll('[data-tile]').forEach(b=>b.onclick=()=>{chosen.push(+b.dataset.tile);drawTiles();});
    document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{chosen=chosen.filter(i=>i!==+b.dataset.remove);drawTiles();});
  }
  async function commitReading(q,ok,advance){
    if(busy)return;
    busy=true;const token=queue[idx],button=$('#pr-next');if(button)button.disabled=true;
    try{
      await saveSettings({practiceProgress:gradePractice(progress(),q.id,ok,Date.now(),S.settings.retention)});
      if(location.hash.split('?')[0]!=='#/practice'||queue[idx]!==token)return;
      correct+=Number(ok);advance();
    }catch(e){busy=false;if(button&&button.isConnected)button.disabled=false;$('#pr-feedback')?.insertAdjacentHTML('beforeend','<p class="muted small">Could not save. Try again.</p>');}
  }
  function readingFeedback(ok,q,opts,picked){
    document.querySelectorAll('[data-pr-choice]').forEach((b,i)=>{b.disabled=true;if(i===picked)b.classList.add('pr-selected');});$('#pr-unknown').disabled=true;
    const last=queue[idx+1]?.q.passage!==q.passage;
    const entry={q,ok,chosen:picked<0?'I don’t know':opts[picked]};
    if(!last){
      $('#pr-feedback').innerHTML='<p class="muted small">Answer recorded. Results will appear after the passage.</p><button class="btn primary" id="pr-next">Next question</button>';
      $('#pr-next').onclick=()=>commitReading(q,ok,()=>{readingAnswers.push(entry);idx++;next();});
      return;
    }
    $('#pr-feedback').innerHTML='<button class="btn primary" id="pr-next">Finish passage &amp; see results</button>';
    $('#pr-next').onclick=()=>commitReading(q,ok,()=>{readingAnswers.push(entry);showReadingResults(q);});
  }
  function showReadingResults(q){
    const coverage=queue[idx]?.coverage;
    const n=readingAnswers.filter(a=>a.ok).length;
    const gloss=(coverage?.unfamiliar||[]).map(t=>{const w=S.byHanzi.get(t);return w?'<div class="pr-gloss"><b>'+esc(t)+'</b> · '+esc(w.p)+'<br>'+esc(vocabularyMeanings(w).slice(0,2).join('; '))+'</div>':'';}).join('');
    shell('practice','<button class="link" id="pr-home">‹ Practice</button><header class="hdr"><div><h1>Passage review</h1><p class="muted">'+n+' / '+readingAnswers.length+' correct</p></div></header><section class="card"><div class="kv"><b>'+esc(q.title||'阅读')+'</b><button class="link" data-say="'+esc(q.passage)+'" aria-label="Listen">🔊</button></div><p class="pr-passage" lang="zh-CN">'+esc(q.passage)+'</p>'+(q.translation?'<details><summary>English translation</summary><p>'+esc(q.translation)+'</p></details>':'')+(gloss?'<details><summary>Unfamiliar vocabulary ('+coverage.unfamiliar.length+')</summary><div class="small">'+gloss+'</div></details>':'')+'</section>'+
      readingAnswers.map(a=>'<section class="card"><span class="tag">'+esc(READING_TYPES[a.q.questionType]||'Reading')+'</span><h3>'+esc(a.q.prompt)+'</h3><p class="'+(a.ok?'good':'bad')+'">'+(a.ok?'✓ Correct':'✗ Review')+'</p>'+(!a.ok?'<p class="muted small">Your answer: '+esc(a.chosen)+'</p>':'')+'<p><b>'+esc(a.q.answer)+'</b></p><p>'+esc(a.q.explain)+'</p></section>').join('')+
      '<button class="btn primary" id="pr-next">'+(idx+1<queue.length?'Continue to next passage':'Finish session')+'</button>');
    $('#pr-home').onclick=dashboard;$('#pr-next').onclick=()=>{readingAnswers=[];idx++;next();};
  }
  function feedback(ok,q,opts,picked=-1){
    if(answerState!==null)return;answerState=ok;
    if(q.passage&&mode==='reading'){readingFeedback(ok,q,opts,picked);return;}
    document.querySelectorAll('[data-pr-choice]').forEach((b,i)=>{b.disabled=true;if(opts[i]===q.answer)b.classList.add('good');else if(i===picked)b.classList.add('bad');});
    document.querySelectorAll('[data-tile],[data-remove],#pr-check,#pr-unknown').forEach(b=>b.disabled=true);
    const coverage=queue[idx]?.coverage;
    const gloss=coverage?.unfamiliar.map(t=>{const w=S.byHanzi.get(t);return w?'<div><b>'+esc(t)+'</b> · '+esc(w.p)+' · '+esc(vocabularyMeanings(w).slice(0,2).join('; '))+'</div>':'';}).join('');
    $('#pr-feedback').innerHTML='<hr><h3>'+(ok?'Correct':q.kind==='order'?'Compare with the model':'Review the answer')+'</h3><p class="pr-passage"><b>'+esc(q.answer)+'</b> <button class="link" data-say="'+esc(q.kind==='order'?q.answer:q.prompt.includes('＿＿')?q.prompt.replace('＿＿',q.answer):q.answer)+'">🔊</button></p><p>'+esc(q.explain)+'</p>'+(gloss?'<details><summary>Unfamiliar vocabulary ('+coverage.unfamiliar.length+')</summary><div class="small">'+gloss+'</div></details>':'')+
      (q.kind==='order'&&!ok&&chosen.length===tiles.length?'<p class="small muted">Chinese can allow more than one natural word order. If your sentence is equally natural and preserves the meaning, you may self-grade it correct.</p><button class="btn" id="pr-alternate">My alternative is correct</button>':'')+'<button class="btn primary" id="pr-next">Continue</button>';
    const commit=async result=>{if(busy)return;busy=true;const token=queue[idx];$('#pr-next').disabled=true;if($('#pr-alternate'))$('#pr-alternate').disabled=true;try{await saveSettings({practiceProgress:gradePractice(progress(),q.id,result,Date.now(),S.settings.retention)});if(location.hash.split('?')[0]!=='#/practice'||queue[idx]!==token)return;correct+=Number(result);idx++;next();}catch(e){busy=false;if($('#pr-next'))$('#pr-next').disabled=false;if($('#pr-alternate'))$('#pr-alternate').disabled=false;$('#pr-feedback')?.insertAdjacentHTML('beforeend','<p class="muted small">Could not save. Try again.</p>');}};
    $('#pr-next').onclick=()=>commit(ok);if($('#pr-alternate'))$('#pr-alternate').onclick=()=>commit(true);
  }
  return dashboard;
}
