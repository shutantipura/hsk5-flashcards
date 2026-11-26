// Passage-first reader. Existing cards and question IDs are preserved.
import { PRACTICE } from './practice-data.js';
import { buildKnowledge, gradePractice, practiceCard, READING_TYPES } from './practice.js';
import { grammarPatternsFor } from './learning-mode.js';

const clean=s=>String(s??'').replace(/[\p{P}\p{Z}\s]/gu,'');
const uniq=a=>[...new Set(a)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function checkedLibrary(vocab, questions=PRACTICE){
  const levels=new Map();
  for(const w of vocab) levels.set(w.h,Math.min(w.l,levels.get(w.h)??Infinity));
  const groups=new Map();
  for(const q of questions.filter(q=>q.kind==='reading')){
    const id=q.passageId;
    if(!groups.has(id))groups.set(id,[]);
    groups.get(id).push(q);
  }
  return [...groups.entries()].flatMap(([id,qs])=>{
    const p=qs[0],level=p.passageLevel||p.level;
    const validTokens=(ts,s)=>Array.isArray(ts)&&ts.length>0&&ts.every(t=>t&&levels.get(t)<=level)&&ts.join('')===clean(s);
    if(!id||!qs.every(q=>q.passage===p.passage&&(q.passageLevel||q.level)===level&&q.level<=level&&
      validTokens(q.passageTokens,q.passage)&&Array.isArray(q.choices)&&q.choices.length===3&&new Set(q.choices).size===3&&q.choices.includes(q.answer)&&
      validTokens(q.tokens,q.passage+q.prompt+q.choices.join(''))&&(String(q.explain||'').match(/\p{Script=Han}+/gu)||[]).every(s=>clean(q.passage+q.prompt+q.choices.join('')).includes(s))&&!/\p{Script=Han}/u.test(q.title||'') // titles currently English; Chinese titles need authored tokens
    ))return [];
    return [{id,level,title:p.title,body:p.passage,translation:p.translation,tokens:p.passageTokens,targets:uniq(qs.flatMap(q=>q.words||[])),questions:qs,next:p.next}];
  });
}
export function tokenSpans(text,tokens){
  let pos=0;const out=[];
  for(const t of tokens){const at=text.indexOf(t,pos);if(at<0)return null;if(at>pos)out.push({text:text.slice(pos,at)});out.push({text:t,word:true});pos=at+t.length;}
  if(pos<text.length)out.push({text:text.slice(pos)});return out;
}
export function syllabusExposure(library,vocab){
  const frequencies=new Map();for(const p of library)for(const t of new Set(p.tokens))frequencies.set(t,(frequencies.get(t)||0)+1);
  const forms=[...new Set(vocab.map(w=>w.h))];
  return {total:forms.length,seen:forms.filter(t=>frequencies.has(t)).length,repeated:forms.filter(t=>frequencies.get(t)>=3).length,levels:[1,2,3,4,5].map(level=>{const terms=[...new Set(vocab.filter(w=>w.l===level).map(w=>w.h))];return {level,total:terms.length,seen:terms.filter(t=>frequencies.has(t)).length,repeated:terms.filter(t=>frequencies.get(t)>=3).length};})};
}
export function coverage(p,known){return p.tokens.filter(t=>known.has(t)).length/p.tokens.length;}
export function rankPassages(library,S,level,goal=.95,now=Date.now()){
  const known=buildKnowledge(S,now), words=S.settings.readerWords||{}, visits=S.settings.readerVisits||{}, progress=S.settings.practiceProgress||{};
  for(const w of S.vocab)if(w.l<=(S.settings.readerBaseline||0))known.add(w.h);
  for(const [w,c] of Object.entries(words)){if(c.status==='known')known.add(w);else if(c.status==='learning')known.delete(w);}
  const weak=new Map();
  for(const l of S.logs){const w=S.byId.get(l.word_id);if(!w)continue;const age=Math.max(0,(now-Date.parse(l.reviewed_at))/86400000);if(age<30)weak.set(w.h,(weak.get(w.h)||0)+(l.correct?-.2:1)*Math.exp(-age/14));}
  for(const w of S.vocab){const patterns=grammarPatternsFor(w);if(patterns.some(p=>['cloze','function','contrast','produce'].some(k=>S.settings.grammarProgress?.[p.id+':'+k]?.lastRating===1)))weak.set(w.h,(weak.get(w.h)||0)+1);}
  return library.filter(p=>p.level<=level).map(p=>{
    const familiar=coverage(p,known),ts=uniq(p.tokens),due=p.questions.filter(q=>{const c=progress[q.id];return c?.reps&&Date.parse(c.due)<=now;}).length;
    const recycle=ts.filter(t=>words[t]?.status==='learning'&&(!words[t].due||Date.parse(words[t].due)<=now)).length;
    const weakness=ts.reduce((n,t)=>n+Math.max(0,weak.get(t)||0),0);
    const visited=visits[p.id],recent=visited?Math.max(0,1-(now-Date.parse(visited.updated_at))/86400000):0;
    const score=4*(1-Math.abs(goal-familiar))+.65* Math.min(recycle,4)+.3*Math.min(weakness,4)+.3*Math.min(due,3)+.55*Number(!visited)-2*recent;
    return {...p,familiar,recycle,due,score,known};
  }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
const categories=[
  ['Mystery & stories',/^Mystery/i],
  ['Science & psychology',/^Science/i],
  ['Relationships',/^Relationships/i],
  ['Culture & history',/^Culture/i],
  ['Business & work',/^Business|work|team|stock|customer|staff|market|meeting|position|decision|information|quality|price|tool|trust|supply|feedback|career|complaint|delivery/i],
  ['Learning & growth',/learn|school|exam|study|conversation|reading|language|mistake/i],
  ['Travel & daily life',/^Everyday life|travel|hotel|commut|bus|appointment|shop|fruit|restaurant|gift|meal|breakfast|morning|routine|rain|weekend/i],
  ['People & wellbeing',/family|friend|birthday|health|exercise|home|park|environment|waste|room|phone/i]
];
const category=p=>categories.find(([,r])=>r.test(p.title))?.[0]||'More stories';
export function createReader({S,shell,saveSettings,esc}){
  let level=5,goal=.95,topic='All',search='',exact=false,current=null,mode='read',quiz=[],answers=[],index=0,showTranslation=false,highlight=true,activeWord=null,activeIndex=null,route='home',busy=false;
  const $=s=>document.querySelector(s), library=()=>checkedLibrary(S.vocab), prefs=()=>S.settings.readerWords||{};
  const stamp=()=>new Date().toISOString();
  const rank=()=>rankPassages(library(),S,level,goal);
  const card=(p,featured=false)=>'<button class="read-card '+(featured?'read-feature':'')+'" data-open="'+esc(p.id)+'"><span class="read-meta">HSK '+p.level+' · '+p.tokens.length+' words · '+esc(category(p))+'</span><strong>'+esc(p.title)+'</strong><span class="read-preview" lang="zh-CN">'+esc(p.body.split(/[。！？]/u)[0])+'…</span><span class="read-meta">'+Math.round(p.familiar*100)+'% estimated familiar'+(p.recycle?' · '+p.recycle+' review words':'')+' · '+(S.settings.readerVisits?.[p.id]?'Read again':'Read story')+' →</span></button>';
  function bindCards(){document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const p=rank().find(x=>x.id===b.dataset.open);if(p)open(p);});}
  function dashboard(where='home'){
    route=where;current=null;activeWord=null;activeIndex=null;level=S.settings.readerLevel||5;goal=S.settings.readerGoal||.95;const ranked=rank(),words=prefs(),visits=S.settings.readerVisits||{},all=ranked.filter(p=>!ranked.some(prev=>prev.next===p.id&&!visits[prev.id]));
    const filters='<div class="read-filters"><label>Maximum level<select id="read-level">'+[1,2,3,4,5].map(n=>'<option value="'+n+'" '+(n===level?'selected':'')+'>HSK '+n+'</option>').join('')+'</select></label><label>Reading style<select id="read-goal">'+[[.98,'Relaxed'],[.95,'Daily learning'],[.9,'Challenge']].map(([v,n])=>'<option value="'+v+'" '+(v===goal?'selected':'')+'>'+n+'</option>').join('')+'</select></label></div>';
    let body='';
    if(where==='home')body='<header class="hdr"><div><p class="read-eyebrow">YOUR CHINESE READING ROOM</p><h1 lang="zh-CN">今天想读什么？</h1><p class="muted">A little Chinese, a new discovery.</p></div></header>'+filters+'<div class="read-tally"><span><b>'+Object.keys(visits).length+'</b> stories read</span><span><b>'+Object.values(words).filter(x=>x.status==='learning').length+'</b> words to revisit</span></div><h3>For you today</h3>'+(all[0]?card(all[0],true):'<p>No checked passages available.</p>')+'<h3>More to discover</h3>'+all.slice(1,5).map(p=>card(p)).join('')+'<a class="btn" href="#/explore">Explore the full library →</a>';
    else if(where==='explore'){
      const matches=all.filter(p=>(!exact||p.level===level)&&(topic==='All'||category(p)===topic)&&(!search||[p.title,p.body,category(p)].some(x=>x.toLowerCase().includes(search.toLowerCase()))));
      body='<header class="hdr"><div><h1>Explore</h1><p class="muted">Choose what interests you, not what is due.</p></div></header>'+filters+'<label class="pr-check"><input type="checkbox" id="read-exact" '+(exact?'checked':'')+'> Selected level only</label><label>Topic<select id="read-topic">'+['All',...categories.map(c=>c[0]),'More stories'].map(n=>'<option '+(n===topic?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label><form id="read-search"><label>Search stories<input name="q" value="'+esc(search)+'" placeholder="Business, history, 中文…"></label><button class="btn">Search</button></form><p class="muted small">'+matches.length+' checked stories</p>'+matches.map(p=>card(p)).join('')+(matches.length?'':'<p>No matching stories. Try a different filter.</p>');
    }else{
      const saved=Object.entries(words).filter(([,x])=>x.status==='learning'),due=saved.filter(([,x])=>!x.due||Date.parse(x.due)<=Date.now()),matches=all.filter(p=>p.recycle||p.due);
      body='<header class="hdr"><div><h1>Review in context</h1><p class="muted">Meet familiar words in another story.</p></div></header>'+filters+'<section class="card"><h3>'+due.length+' saved words ready to revisit</h3><div class="read-tags">'+saved.map(([w])=>'<span>'+esc(w)+'</span>').join('')+'</div><p class="muted small">Reading a word is not automatically counted as mastery. Practise recalling it in its original sentence.</p></section><h3>Stories to revisit</h3>'+ (matches.length?matches:all.slice(0,5)).map(p=>card(p)).join('');
    }
    shell(where,body);bindCards();
    $('#read-level').onchange=async e=>{await saveSettings({readerLevel:+e.target.value});dashboard(where);};$('#read-goal').onchange=async e=>{await saveSettings({readerGoal:+e.target.value});dashboard(where);};
    if(where==='explore'){$('#read-exact').onchange=e=>{exact=e.target.checked;dashboard(where);};$('#read-topic').onchange=e=>{topic=e.target.value;dashboard(where);};$('#read-search').onsubmit=e=>{e.preventDefault();search=e.target.q.value.trim();dashboard(where);};}
  }
  function open(p){current=p;mode='read';showTranslation=false;activeWord=null;activeIndex=null;render();window.scrollTo(0,0);}
  function wordMarkup(p){
    const spans=tokenSpans(p.body,p.tokens);if(!spans)return esc(p.body);
    return spans.map((s,i)=>{
      if(!s.word)return esc(s.text);
      const state=prefs()[s.text]?.status,unknown=state==='learning'||(state!=='known'&&p.targets.includes(s.text)&&!p.known.has(s.text));
      return '<button class="read-word '+(highlight&&unknown?'read-new ':'')+(activeIndex===String(i)?'read-active':'')+'" data-word="'+esc(s.text)+'" data-word-index="'+i+'" aria-expanded="'+(activeIndex===String(i))+'" aria-controls="read-gloss">'+esc(s.text)+'</button>';
    }).join('');
  }
  function wordPanel(){
    if(!activeWord)return '';
    const ws=S.vocab.filter(w=>w.h===activeWord&&w.l<=current.level);
    const w=activeWord,state=prefs()[w]?.status;const contextual=current.questions.filter(q=>q.focus===w).map(q=>'<p><b>In this story:</b> '+esc(q.explain)+'</p>').join('');
    return '<section class="read-gloss"><div class="read-gloss-head"><b lang="zh-CN">'+esc(w)+'</b><button class="link" data-say="'+esc(w)+'">🔊</button><button class="link" id="read-close" aria-label="Close definition">×</button></div>'+ws.map(x=>'<p><b>'+esc(x.p)+'</b> · HSK '+x.l+'<br>'+esc((x.m||[]).slice(0,3).join('; '))+'</p>').join('')+'<p class="muted small">Dictionary senses — use the passage to decide which fits.</p>'+contextual+ws.flatMap(grammarPatternsFor).filter(p=>p.level<=current.level).slice(0,3).map(p=>'<details><summary>'+esc(p.meaning)+'</summary><p>'+esc(p.explain)+'</p></details>').join('')+'<div class="read-actions"><button class="btn" id="read-save">'+(state==='learning'?'Saved for review ✓':'Save to review')+'</button><button class="btn" id="read-known">'+(state==='known'?'Marked familiar ✓':'I know this')+'</button></div></section>';
  }
  async function setWord(w,status){const old=prefs()[w]||{};await saveSettings({readerWords:{...prefs(),[w]:{...old,status,updated_at:stamp(),due:status==='learning'?stamp():old.due||stamp()}}});}
  function render(){
    const p=current;if(!p)return dashboard(route);
    shell(route,'<button class="link" id="read-back">‹ '+(route==='home'?'Today':route==='explore'?'Explore':'Review')+'</button><header class="hdr"><div><p class="read-eyebrow">HSK '+p.level+' · '+esc(category(p))+'</p><h1>'+esc(p.title)+'</h1><p class="muted">'+p.tokens.length+' words · '+Math.round(p.familiar*100)+'% estimated familiar</p></div></header><section class="card read-paper"><div class="read-actions"><button class="btn" data-say="'+esc(p.body)+'">▶ Listen</button><button class="btn" data-say="'+esc(p.body)+'" data-slow="1">Slow audio</button><button class="btn" id="read-highlight">'+(highlight?'Hide highlights':'Highlight new words')+'</button></div><div class="read-text" lang="zh-CN">'+wordMarkup(p)+'</div><p class="muted small read-tip">Tap a word for pinyin and meaning. Tap it again to hide.</p><div id="read-gloss" class="read-popup" role="region" aria-label="Word definition" hidden></div><button class="link" id="read-translate">'+(showTranslation?'Hide translation':'Show translation')+'</button>'+(showTranslation?'<p class="read-translation">'+esc(p.translation||'No translation available.')+'</p>':'')+'</section><h3>Keep exploring this passage</h3><button class="btn primary" id="read-quiz">Reading questions · '+p.questions.length+'</button><button class="btn" id="read-listen">Listening challenge</button><button class="btn" id="read-recall">Recall a word in this story</button><button class="btn" id="read-retell">Retell the story</button><button class="btn ghost" id="read-done">Finish reading — no quiz</button>'+(p.next?'<button class="btn primary" id="read-next-chapter">Next chapter →</button>':''));
    $('#read-back').onclick=()=>dashboard(route);$('#read-highlight').onclick=()=>{highlight=!highlight;render();};$('#read-translate').onclick=()=>{showTranslation=!showTranslation;render();};
    document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{if(activeIndex===b.dataset.wordIndex){closeGloss();return;}activeIndex=b.dataset.wordIndex;activeWord=b.dataset.word;refreshGloss();});refreshGloss();
    $('#read-quiz').onclick=()=>startQuiz(false);$('#read-listen').onclick=()=>startQuiz(true);$('#read-recall').onclick=recall;$('#read-retell').onclick=retell;$('#read-done').onclick=async()=>{await markRead();dashboard(route);};if($('#read-next-chapter'))$('#read-next-chapter').onclick=async()=>{await markRead();const next=rank().find(x=>x.id===p.next);if(next)open(next);};
  }
  function positionGloss(){
    const pop=$('#read-gloss'),anchor=$('.read-word.read-active');if(!pop||pop.hidden||!anchor)return;
    const a=anchor.getBoundingClientRect(),nav=$('.tabbar'),bottom=Math.min(window.innerHeight,nav?nav.getBoundingClientRect().top:window.innerHeight)-8;
    if(a.bottom<8||a.top>bottom){closeGloss();return;}
    const gap=9,below=Math.max(0,bottom-a.bottom-gap),above=Math.max(0,a.top-gap-8),useBelow=below>=Math.min(170,above);
    pop.style.maxHeight=Math.max(0,useBelow?below:above)+'px';
    const rect=pop.getBoundingClientRect();
    pop.style.left=Math.max(8,Math.min(a.left+(a.width-rect.width)/2,window.innerWidth-rect.width-8))+'px';
    pop.style.top=(useBelow?a.bottom+gap:a.top-gap-rect.height)+'px';
  }
  function closeGloss(){
    activeWord=null;activeIndex=null;refreshGloss();
  }
  function refreshGloss(){
    const pop=$('#read-gloss');if(!pop)return;
    document.querySelectorAll('[data-word]').forEach(b=>{const selected=activeIndex===b.dataset.wordIndex; b.classList.toggle('read-active',selected);b.setAttribute('aria-expanded',String(selected));});
    pop.hidden=!activeWord;
    pop.innerHTML=activeWord?wordPanel():'';
    if(!activeWord)return;
    bindGloss();positionGloss();
  }
  function bindGloss(){
    $('#read-close').onclick=closeGloss;
    const update=async status=>{const w=activeWord,i=activeIndex,p=current;await setWord(w,status);if(current!==p||activeWord!==w||activeIndex!==i||!$('#read-gloss'))return;
      document.querySelectorAll('[data-word]').forEach(b=>{if(b.dataset.word===w)b.classList.toggle('read-new',highlight&&status==='learning');});refreshGloss();};
    $('#read-save').onclick=()=>update('learning');
    $('#read-known').onclick=()=>update('known');
    $('#read-gloss').querySelectorAll('details').forEach(d=>d.addEventListener('toggle',positionGloss));
  }
  document.addEventListener('click',e=>{if(activeWord&&$('#read-gloss')&&!e.target.closest('[data-word],#read-gloss'))closeGloss();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&activeWord&&$('#read-gloss'))closeGloss();});
  window.addEventListener('scroll',positionGloss,{passive:true});
  window.addEventListener('resize',positionGloss);
  async function markRead(){const id=current.id,old=S.settings.readerVisits?.[id]||{};await saveSettings({readerVisits:{...S.settings.readerVisits,[id]:{...old,updated_at:stamp()}}});}
  function startQuiz(listen){activeWord=null;activeIndex=null;mode=listen?'listen':'quiz';quiz=current.questions;answers=[];index=0;busy=false;renderQuiz();}
  function renderQuiz(){
    const p=current,q=quiz[index],opts=shuffle(q.choices);
    shell(route,'<button class="link" id="read-return">‹ Back to story</button><p class="read-eyebrow">'+(mode==='listen'?'Listening':'Reading')+' · '+(index+1)+' / '+quiz.length+'</p><h1>'+esc(p.title)+'</h1><section class="card">'+(mode==='listen'?'<button class="btn" data-say="'+esc(p.body)+'">▶ Listen to the story</button><button class="btn" data-say="'+esc(p.body)+'" data-slow="1">Slow audio</button>':'<p class="read-text" lang="zh-CN">'+esc(p.body)+'</p>')+'</section><section class="card"><p class="muted small">'+esc(READING_TYPES[q.questionType]||'Comprehension')+'</p><h2 lang="zh-CN">'+esc(q.prompt)+'</h2>'+opts.map((o,i)=>'<button class="btn" data-choice="'+i+'">'+esc(o)+'</button>').join('')+'<button class="btn ghost" data-choice="-1">I don’t know</button><div id="read-feedback" aria-live="polite"></div></section>');
    $('#read-return').onclick=render;
    document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=async()=>{
      if(busy)return;busy=true;const chosen=opts[+b.dataset.choice],ok=chosen===q.answer;
      document.querySelectorAll('[data-choice]').forEach(x=>x.disabled=true);
      try{await saveSettings({practiceProgress:gradePractice(S.settings.practiceProgress||{},mode==='listen'?'listen:'+q.id:q.id,ok,Date.now(),S.settings.retention)});
        if(!$('#read-feedback')||current!==p){busy=false;return;}
        answers.push({q,chosen,ok});$('#read-feedback').innerHTML='<p>Answer recorded.</p><button class="btn primary" id="read-next">'+(index+1===quiz.length?'See results':'Next question')+'</button>';
        $('#read-next').onclick=()=>{busy=false;index++;if(index===quiz.length)results();else renderQuiz();};
      }catch(e){busy=false;document.querySelectorAll('[data-choice]').forEach(x=>x.disabled=false);$('#read-feedback').textContent='Could not save. Try again.';}
    });
  }
  function results(){
    const p=current;markRead().catch(()=>{});
    shell(route,'<h1>'+answers.filter(a=>a.ok).length+' / '+answers.length+' correct</h1><p class="muted">'+esc(p.title)+'</p><section class="card"><p class="read-text">'+esc(p.body)+'</p><details><summary>Translation</summary><p>'+esc(p.translation)+'</p></details></section>'+answers.map(a=>'<section class="card"><p class="'+(a.ok?'good':'bad')+'">'+(a.ok?'Correct':'Review')+'</p><b>'+esc(a.q.prompt)+'</b><p>Your answer: '+esc(a.chosen||'I don’t know')+'</p><p>Answer: '+esc(a.q.answer)+'</p><p>'+esc(a.q.explain)+'</p></section>').join('')+'<button class="btn" id="read-return">Back to story</button><button class="btn primary" id="read-finish">Find another story</button>');
    $('#read-return').onclick=render;$('#read-finish').onclick=()=>dashboard(route);
  }
  function recall(override=null){activeWord=null;activeIndex=null;
    const p=current,spans=tokenSpans(p.body,p.tokens);if(!spans)return render();
    const saved=prefs(), candidates=uniq(p.tokens).filter(t=>saved[t]?.status==='learning'||p.targets.includes(t));
    candidates.sort((a,b)=>Number(saved[b]?.status==='learning')-Number(saved[a]?.status==='learning')||Number(Date.parse(saved[a]?.due||0)>Date.now())-Number(Date.parse(saved[b]?.due||0)>Date.now()));
    const target=(typeof override==='string'&&p.tokens.includes(override)?override:null)||candidates.find(t=>saved[t]?.status==='learning'&&Date.parse(saved[t].due||0)<=Date.now())||candidates.find(t=>!saved[t])||candidates[0]||p.tokens.find(t=>t.length>1)||p.tokens[0];
    const sentences=[];let sentence=[];for(const span of spans){sentence.push(span);if(!span.word&&/[。！？]/u.test(span.text)){sentences.push(sentence);sentence=[];}}if(sentence.length)sentences.push(sentence);
    const source=sentences.find(s=>s.some(x=>x.word&&x.text===target));if(!source)return render();
    let blanked=false;const prompt=source.map(s=>{if(s.word&&s.text===target&&!blanked){blanked=true;return '＿＿';}return s.text;}).join('');
    shell(route,'<button class="link" id="read-return">‹ Back to story</button><h1>Recall in context</h1><p class="muted">Restore the exact word from the story. Other natural answers may exist.</p><section class="card"><p class="read-text">'+esc(prompt)+'</p><form id="read-cloze"><label>Your answer<input name="answer" lang="zh-CN" autocomplete="off"></label><button class="btn primary">Check</button></form><button class="btn ghost" id="read-reveal">Reveal answer</button><div id="read-feedback" aria-live="polite"></div></section>');
    $('#read-return').onclick=render;
    let answered=false;
    async function check(value){if(answered)return;answered=true;const ok=value.trim()===target;const old=prefs()[target]||{};const id='reader:'+target;const next=gradePractice(S.settings.practiceProgress||{},id,ok,Date.now(),S.settings.retention);
      try{await saveSettings({practiceProgress:next,readerWords:{...prefs(),[target]:{...old,status:'learning',due:next[id].due,updated_at:stamp()}}});}catch(e){answered=false;$('#read-feedback').textContent='Could not save. Try again.';return;}
      if(!$('#read-feedback')||current!==p)return;
      $('#read-cloze').querySelector('button').disabled=true;$('#read-reveal').disabled=true;$('#read-feedback').innerHTML='<p><b>'+esc(target)+'</b> · '+(ok?'Correct':'Original word')+'</p><p>'+esc(source.map(s=>s.text).join(''))+'</p><button class="btn" id="read-return2">Return to story</button><button class="btn" id="read-another">Try another word in this story</button>';$('#read-return2').onclick=render;$('#read-another').onclick=()=>recall(candidates.find(t=>t!==target&&!S.settings.practiceProgress?.['reader:'+t]?.reps)||candidates.find(t=>t!==target)||p.tokens.find(t=>t!==target));
    }
    $('#read-cloze').onsubmit=e=>{e.preventDefault();check(e.target.answer.value);};$('#read-reveal').onclick=()=>check('');
  }
  function retell(){activeWord=null;activeIndex=null;
    const p=current;shell(route,'<button class="link" id="read-return">‹ Back to story</button><h1>Retell the story</h1><p>Write or say what happened in your own Chinese. Try not to look at the original first.</p><section class="card"><textarea id="read-writing" rows="6" placeholder="用自己的话说一说…"></textarea><button class="btn" id="read-compare">Compare with original</button><div id="read-feedback"></div></section>');
    $('#read-return').onclick=render;$('#read-compare').onclick=()=>{$('#read-feedback').innerHTML='<p class="read-text">'+esc(p.body)+'</p><p class="muted small">Self-check: Did you capture the main idea? Did you use the new words naturally? No automated grammar grade is claimed.</p>';};
  }
  return {today:()=>dashboard('home'),explore:()=>dashboard('explore'),review:()=>dashboard('review')};
}
