import { GRAMMAR } from './grammar-data.js';
import { State, schedule, fmtInterval } from './fsrs.js';

export const SKILLS = ['cloze', 'contrast', 'function', 'produce'];
export const skillNames = {cloze:'Fill the blank',contrast:'Distinguish',function:'Identify function',produce:'Make a sentence'};
export const grammarKey = (p, skill) => p.id + ':' + skill;
export function grammarCard(progress, p, skill, now=Date.now()) {
  return progress[grammarKey(p,skill)] || {word_id:GRAMMAR.indexOf(p)+1,state:State.New,due:new Date(now).toISOString(),reps:0,lapses:0,step:0,stability:0,difficulty:0,last_review:null};
}
export function grammarQueue(progress, level=0, now=Date.now()) {
  const items=GRAMMAR.filter(p=>!level || p.level===level).sort((a,b)=>a.level-b.level).flatMap(p=>SKILLS.map(skill=>({p,skill,c:grammarCard(progress,p,skill,now)})));
  const due=items.filter(x=>x.c.reps && Date.parse(x.c.due)<=now).sort((a,b)=>Date.parse(a.c.due)-Date.parse(b.c.due));
  const fresh=items.filter(x=>!x.c.reps);
  return {items,due,fresh};
}
export function gradeGrammar(progress,p,skill,rating,now,retention) {
  const {card}=schedule(grammarCard(progress,p,skill,now),rating,now,{retention});
  return {...progress,[grammarKey(p,skill)]:card};
}
// Locate the target using the checked token boundaries, not the first matching character.
export function targetSpan(p,e) {
  let offset=0;
  const target=e.component||p.word;
  for(const token of e.tokens) {
    const at=e.zh.indexOf(token,offset);
    if(at<0)break;
    if(token===target) {const inner=token.indexOf(p.word);if(inner>=0)return [at+inner,at+inner+p.word.length];}
    offset=at+token.length;
  }
  const at=e.zh.indexOf(p.word);
  return at>=0?[at,at+p.word.length]:null;
}
export function grammarPrompt(p,skill,reps=0) {
  const example=p.examples[(reps+(skill==='produce'?2:0))%p.examples.length];
  if(skill==='cloze') {const span=targetSpan(p,example);return {prompt:span?example.zh.slice(0,span[0])+'＿＿'+example.zh.slice(span[1]):example.zh,hint:example.en,answer:p.word,example};}
  if(skill==='contrast') return {prompt:p.contrast,answer:p.word,example};
  if(skill==='function') {
    const label=x=>x.meaning.split(' · ').slice(1).join(' · ')||x.meaning;
    const answer=label(p);
    const candidates=[...GRAMMAR.filter(x=>x.word===p.word&&x.id!==p.id),...GRAMMAR.filter(x=>x.word!==p.word&&x.level<=p.level)];
    const alternatives=[...new Set(candidates.map(label).filter(x=>x!==answer))].slice(0,2);
    return {prompt:example.zh,subprompt:'What does '+p.word+' do in this sentence?',answer,choices:[answer,...alternatives],example};
  }
  return {prompt:example.en,example};
}
function shuffle(a) { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }
export function createGrammarScreen({S,shell,saveSettings,esc}) {
  let level=0, current=null, pending=[], count=0, correct=0, busy=false, query='';
  const $=s=>document.querySelector(s);
  const progress=()=>S.settings.grammarProgress||{};
  const examples=p=>p.examples.map(e=>'<div class="grammar-example"><div class="grammar-zh">'+esc(e.zh)+' <button class="link" data-say="'+esc(e.zh)+'" aria-label="Listen">🔊</button></div><div class="muted small">'+esc(e.en)+'</div></div>').join('');
  function dashboard() {
    current=null;pending=[];busy=false;
    const {items,due,fresh}=grammarQueue(progress(),level);
    const learned=items.filter(x=>x.c.reps).length;
    const ps=GRAMMAR.filter(p=>(!level||p.level===level)&&(!query||[p.word,p.pattern,p.meaning,p.explain].some(x=>x.toLowerCase().includes(query.toLowerCase())))).sort((a,b)=>a.level-b.level);
    shell('grammar','<header class="hdr"><div><h1>Grammar Practice</h1><p class="muted">Learn patterns, then use them.</p></div></header>'+
      '<section class="card"><label>Level<select id="grammar-level">'+[0,1,2,3,4,5].map(l=>'<option value="'+l+'" '+(l===level?'selected':'')+'>'+(l?'HSK '+l:'All levels')+'</option>').join('')+'</select></label>'+
      '<div class="grammar-stats"><div><b>'+due.length+'</b><span>Due</span></div><div><b>'+fresh.length+'</b><span>New skills</span></div><div><b>'+learned+'/'+items.length+'</b><span>Practised</span></div></div>'+
      '<button class="btn primary" id="grammar-start" '+(!due.length&&!fresh.length?'disabled':'')+'>'+(due.length?'Review due skills':fresh.length?'Learn a new pattern':'All caught up')+'</button>'+
      '<p class="small muted">Each pattern has four independently scheduled skills: fill the blank, distinguish, identify function, and produce. Grammar-only meanings are practised here; listening and tones remain available in vocabulary study.</p></section>'+
      '<h3>Pattern library · '+ps.length+'</h3><input id="grammar-search" type="search" placeholder="Search word, pinyin or pattern" value="'+esc(query)+'">'+ps.map(p=>{const n=SKILLS.filter(k=>grammarCard(progress(),p,k).reps).length;return '<button class="btn grammar-pattern" data-pattern="'+esc(p.id)+'"><span><b>'+esc(p.pattern)+'</b><small>'+esc(p.meaning)+' · HSK '+p.level+(p.morphology?' · Word building':'')+'</small></span><span class="muted">'+n+'/'+SKILLS.length+' ›</span></button>';}).join(''));
    $('#grammar-search').onchange=e=>{query=e.target.value.trim();dashboard();};
    $('#grammar-level').onchange=e=>{level=+e.target.value;dashboard();};
    $('#grammar-start').onclick=()=>{if(due.length){count=0;correct=0;pending=due.slice(0,20);next();}else if(fresh.length)lesson(fresh[0].p,true);};
    document.querySelectorAll('[data-pattern]').forEach(b=>b.onclick=()=>lesson(GRAMMAR.find(p=>p.id===b.dataset.pattern),false));
  }
  function lesson(p,automatic) {
    current=null;
    shell('grammar','<button class="link" id="grammar-back">‹ Grammar</button><section class="card"><span class="tag">HSK '+p.level+'</span><h1>'+esc(p.pattern)+'</h1><p>'+esc(p.meaning)+'</p><p>'+esc(p.explain)+'</p>'+examples(p)+'</section><button class="btn primary" id="grammar-go">Practise this pattern</button>');
    $('#grammar-back').onclick=dashboard;
    $('#grammar-go').onclick=()=>{count=0;correct=0;const now=Date.now();let skills=SKILLS.filter(k=>{const c=grammarCard(progress(),p,k,now);return !c.reps||Date.parse(c.due)<=now;});if(!automatic||!skills.length)skills=SKILLS;pending=skills.map(skill=>({p,skill}));next();};
  }
  function next() {
    current=pending.shift()||null;
    if(!current){shell('grammar','<section class="card center"><h1>Practice complete</h1><p>'+correct+' / '+count+' correct or self-rated good</p><p class="muted">Your next review dates are saved.</p><button class="btn primary" id="grammar-back">Back to Grammar</button></section>');$('#grammar-back').onclick=dashboard;return;}
    renderQuestion();
  }
  function renderQuestion() {
    const {p,skill}=current, c=grammarCard(progress(),p,skill), q=grammarPrompt(p,skill,c.reps||0);
    const options=skill==='produce'?[]:shuffle(q.choices||[p.word,...p.distractors]);
    const body='<button class="link" id="grammar-back">‹ Grammar</button><div class="ptop"><span class="tag">HSK '+p.level+' · '+skillNames[skill]+'</span><span class="muted small">'+(count+1)+' / '+(count+1+pending.length)+'</span></div><section class="card"><h2 class="grammar-question">'+(skill==='function'&&targetSpan(p,q.example)?(()=>{const [a,b]=targetSpan(p,q.example);return esc(q.prompt.slice(0,a))+'<mark class="example-target">'+esc(q.prompt.slice(a,b))+'</mark>'+esc(q.prompt.slice(b));})():esc(q.prompt))+'</h2>'+(q.subprompt?'<p class="muted">'+esc(q.subprompt)+'</p>':'')+(q.hint?'<p class="muted">'+esc(q.hint)+'</p>':'')+(skill==='produce'?'<p class="muted">Use '+esc(p.pattern)+'. Write your own translation before revealing the sample.</p><textarea id="grammar-writing" rows="3" lang="zh-CN" placeholder="用中文写一句话"></textarea><button class="btn primary" id="grammar-reveal">Compare with sample</button><button class="btn ghost" id="grammar-skip">I don’t know</button>':options.map((o,i)=>'<button class="btn grammar-option" data-choice="'+i+'">'+esc(o)+'</button>').join('')+'<button class="btn ghost" id="grammar-unknown">I don’t know</button>')+'<div id="grammar-feedback" aria-live="polite"></div></section>';
    shell('grammar',body);$('#grammar-back').onclick=dashboard;
    if(skill==='produce'){ $('#grammar-skip').onclick=()=>{ $('#grammar-writing').readOnly=true;$('#grammar-reveal').disabled=true;$('#grammar-skip').disabled=true;feedback(false,q); }; $('#grammar-reveal').onclick=()=>{const value=$('#grammar-writing').value.trim();if(!value){$('#grammar-writing').focus();return;}$('#grammar-writing').readOnly=true;$('#grammar-reveal').disabled=true;$('#grammar-skip').disabled=true;feedback(null,q,value);}; }
    else {document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const ok=options[+b.dataset.choice]===q.answer;document.querySelectorAll('[data-choice]').forEach((x,i)=>{x.disabled=true;if(options[i]===q.answer)x.classList.add('good');else if(x===b)x.classList.add('bad');});$('#grammar-unknown').disabled=true;feedback(ok,q);});$('#grammar-unknown').onclick=()=>{document.querySelectorAll('[data-choice]').forEach((x,i)=>{x.disabled=true;if(options[i]===q.answer)x.classList.add('good');});$('#grammar-unknown').disabled=true;feedback(false,q);};}
  }
  function feedback(ok,q,writing='') {
    const {p,skill}=current;
    $('#grammar-feedback').innerHTML='<hr><h3>'+(ok===null?'Compare your sentence':ok?'Correct':'Review the pattern')+'</h3><p><b>'+esc(p.pattern)+'</b> · '+esc(p.meaning)+'</p><p>'+esc(p.explain)+'</p><div class="grammar-example"><div class="grammar-zh">'+esc(q.example.zh)+' <button class="link" data-say="'+esc(q.example.zh)+'">🔊</button></div><p class="muted small">'+esc(q.example.en)+'</p></div>'+
      (ok===null?'<p class="small muted">Your sentence: '+esc(writing)+'</p><p class="small muted">Other natural answers are possible. Check the intended meaning, word order and target structure yourself. '+(!writing.includes(p.word)?'Your answer does not contain the target word.':'')+'</p><div class="row2"><button class="btn bad" data-grade="1">Again</button><button class="btn good" data-grade="3">Got it</button></div>':'<button class="btn primary" data-grade="'+(ok?3:1)+'">Continue</button>');
    document.querySelectorAll('[data-grade]').forEach(b=>b.onclick=async()=>{if(busy)return;busy=true;document.querySelectorAll('[data-grade]').forEach(x=>x.disabled=true);const rating=+b.dataset.grade;const updated=gradeGrammar(progress(),p,skill,rating,Date.now(),S.settings.retention);try{await saveSettings({grammarProgress:updated});count++;if(rating>=3)correct++;busy=false;if(location.hash.split('?')[0]==='#/grammar'&&$('#grammar-feedback'))next();}catch(e){busy=false;document.querySelectorAll('[data-grade]').forEach(x=>x.disabled=false);$('#grammar-feedback')?.insertAdjacentHTML('beforeend','<p class="small muted">Could not save. Try again.</p>');}});
  }
  return function openGrammar() { const params=new URLSearchParams(location.hash.split('?')[1]||'');if(params.has('q')){query=params.get('q');level=0;}dashboard(); };
}
