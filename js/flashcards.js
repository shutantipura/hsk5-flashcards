// Self-assessed flashcards. No multiple choice, response-time grading or quiz logs.
import { schedule, State, recallProb, fmtInterval } from './fsrs.js';
export const RATINGS=[['unknown','I don’t know'],['unsure','I’m unsure'],['think','Think I know'],['known','Known']];
const GRADE={unknown:1,unsure:2,think:3,known:4};
export function levelDeck(vocab,level){
  const groups=new Map();
  for(const w of vocab)if(w.l===level){
    if(!groups.has(w.h))groups.set(w.h,{id:level+':'+w.h,h:w.h,level,entries:[]});
    groups.get(w.h).entries.push(w);
  }
  return [...groups.values()];
}
// Prefer a different reading/sense for the second example when a card groups entries.
export function flashExamples(card,examples,limit=2){
  const out=[],seen=new Set();
  const pools=card.entries.map(entry=>({entry,items:examples.get(entry.i)||[]}));
  for(let i=0;i<3&&out.length<limit;i++)for(const {entry,items} of pools){
    const e=items[i];if(!e||seen.has(e.zh))continue;
    out.push({entry,example:e});seen.add(e.zh);
    if(out.length>=limit)break;
  }
  return out;
}
export function searchVocab(vocab,level=0,query=''){
  const normalize=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ü|u:|v/g,'u').replace(/\s+/g,'');
  const q=String(query).trim().toLowerCase(),p=normalize(q);
  return vocab.filter(w=>(!level||w.l===level)&&(!q||w.h.includes(q)||normalize(w.p).includes(p)||normalize(w.n).includes(p)||(w.m||[]).some(m=>m.toLowerCase().includes(q))));
}
export function selectDeck(deck,ratings={},filter='smart'){
  return deck.filter(w=>filter==='all'||(filter==='unrated'?!ratings[w.id]:filter==='review'?!!ratings[w.id]&&ratings[w.id].rating!=='known':ratings[w.id]?.rating===filter));
}
// Reading is exposure, not evidence of recall. Only a confidence rating updates FSRS.
export function readingExposure(library,visits={}){
  const out=new Map();
  for(const p of library){
    if(!visits[p.id])continue;
    const target=new Set(p.targets),time=visits[p.id].updated_at||'';
    for(const h of new Set(p.tokens)){
      if(!out.has(h))out.set(h,[]);
      out.get(h).push({id:p.id,title:p.title,level:p.level,target:target.has(h),time});
    }
  }
  return out;
}
export function rateFlashcard(w,old,rating,now,retention=.9){
  const base=old?.reps&&Number.isFinite(old.stability)&&old.stability>0?old:{word_id:w.entries[0].i,state:State.New,reps:0,lapses:0,step:0,stability:0,difficulty:0};
  return {...schedule(base,GRADE[rating],now,{retention}).card,rating};
}
export function savedSchedule(w,saved,retention=.9){
  if(!saved||!GRADE[saved.rating])return null;
  if(saved.reps&&saved.due&&Number.isFinite(saved.stability)&&saved.stability>0)return saved;
  const time=Date.parse(saved.updated_at);
  return Number.isFinite(time)?rateFlashcard(w,null,saved.rating,time,retention):null;
}
export function smartQueue(deck,settings,exposure,now=Date.now(),forms=new Map()){
  const rated=settings.flashcardRatings||{},reader=settings.readerWords||{},retention=settings.retention||.9;
  return deck.map(w=>{
    const passages=(exposure.get(w.h)||[]).filter(p=>p.level>=w.level).sort((a,b)=>Number(b.target)-Number(a.target)||b.time.localeCompare(a.time));
    const old=savedSchedule(w,rated[w.id],retention),mark=reader[w.h];
    const newer=mark&&Date.parse(mark.updated_at||'')>=(old?Date.parse(old.updated_at):0);
    const ambiguous=(forms.get(w.h)?.size||1)>1;
    // A generic familiar mark cannot certify a different level's reading/sense.
    const manualKnown=newer&&mark.status==='known'&&!ambiguous;
    const manualWeak=newer&&mark.status==='learning';
    const card=manualKnown?rateFlashcard(w,old,'known',Date.parse(mark.updated_at),retention):old;
    const due=!!card&&Date.parse(card.due)<=now;
    const saved=!!manualWeak;
    const eligible=saved||due||(!card&&passages.length>0);
    const reason=saved?'Saved from reading':due?'Review due':passages.some(p=>p.target)?'Target word from a completed passage':passages.length?'Seen in a completed passage':'Vocabulary deck';
    const priority=saved?0:due?1:passages.some(p=>p.target)?2:passages.length?3:4;
    return {...w,card,passages,eligible,due,saved,reason,priority,recall:card?recallProb(card,now):0};
  }).sort((a,b)=>a.priority-b.priority||(a.priority===1?a.recall-b.recall:0)||Number(b.passages.some(p=>p.target))-Number(a.passages.some(p=>p.target))||b.passages.length-a.passages.length||((b.passages[0]?.time||'').localeCompare(a.passages[0]?.time||''))||a.entries[0].i-b.entries[0].i);
}
// Conservative form-level familiarity for a passage: all eligible rated levels must be known.
// Explicit reading marks take precedence only when more recent than the corresponding ratings.
export function flashFamiliarity(vocab,ratings={},reader={},level=5){
  const grouped=new Map(),out=new Map();
  for(const w of vocab){if(w.l>level)continue;if(!grouped.has(w.h))grouped.set(w.h,new Set());grouped.get(w.h).add(w.l);}
  for(const [h,levels] of grouped){
    const marks=[...levels].map(l=>ratings[l+':'+h]).filter(Boolean),manual=reader[h];
    const latest=marks.reduce((s,m)=>Math.max(s,Date.parse(m.updated_at)||0),0);
    if(manual&&(!marks.length||(Date.parse(manual.updated_at)||0)>=latest)){out.set(h,manual.status);continue;}
    if(marks.some(m=>m.rating!=='known'))out.set(h,'learning');
    else if(marks.length===levels.size)out.set(h,'known');
  }
  return out;
}

export function createFlashcards({S,shell,saveSettings,esc,getLibrary=()=>[]}){
  let level=5,filter='all',size=30,queue=[],index=0,phase='menu',selected=null,saving=false,counts={},generation=0;
  const $=s=>document.querySelector(s), ratings=()=>S.settings.flashcardRatings||{};
  const deck=()=>levelDeck(S.vocab,level);
  let vocabLevel=0,vocabQuery='',vocabPage=0;
  const PAGE_SIZE=100;
  function subnav(current){
    return '<div class="flash-subnav" aria-label="Vocabulary menu"><button type="button" class="btn '+(current==='study'?'primary':'')+'" id="flash-study-tab" aria-pressed="'+(current==='study')+'">Flashcards</button><button type="button" class="btn '+(current==='list'?'primary':'')+'" id="flash-list-tab" aria-pressed="'+(current==='list')+'">Vocab list</button></div>';
  }
  function bindSubnav(){
    $('#flash-study-tab').onclick=()=>menu();
    $('#flash-list-tab').onclick=()=>vocabList();
  }
  function vocabList(){
    generation++;phase='list';saving=false;
    const levels=[0,1,2,3,4,5].map(l=>'<button type="button" class="level-tab '+(l===vocabLevel?'on':'')+'" data-list-level="'+l+'" aria-pressed="'+(l===vocabLevel)+'">'+(l?'HSK '+l:'All')+'</button>').join('');
    shell('flashcards','<header class="hdr"><div><p class="read-eyebrow">VOCABULARY</p><h1>Vocab list</h1><p class="muted">Browse every word, pronunciation and definition.</p></div></header>'+subnav('list')+'<div class="flash-levels vocab-levels">'+levels+'</div><label class="vocab-search">Search<input id="vocab-query" type="search" placeholder="Chinese, pinyin or English" value="'+esc(vocabQuery)+'" autocomplete="off"></label><div id="vocab-list-results"></div>');
    bindSubnav();
    document.querySelectorAll('[data-list-level]').forEach(b=>b.onclick=()=>{vocabLevel=+b.dataset.listLevel;vocabPage=0;vocabList();});
    $('#vocab-query').oninput=e=>{vocabQuery=e.target.value;vocabPage=0;renderVocabResults();};
    renderVocabResults();
  }
  function renderVocabResults(){
    const list=searchVocab(S.vocab,vocabLevel,vocabQuery),pages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));
    vocabPage=Math.max(0,Math.min(vocabPage,pages-1));
    const start=vocabPage*PAGE_SIZE,shown=list.slice(start,start+PAGE_SIZE);
    const paging='<div class="vocab-paging"><button type="button" class="btn" data-vocab-page="-1" '+(!vocabPage?'disabled':'')+'>‹ Previous</button><span class="muted small">Page '+(vocabPage+1)+' / '+pages+'</span><button type="button" class="btn" data-vocab-page="1" '+(vocabPage+1>=pages?'disabled':'')+'>Next ›</button></div>';
    $('#vocab-list-results').innerHTML='<p class="muted small" role="status">'+list.length+' entries'+(shown.length?' · '+(start+1)+'–'+(start+shown.length):'')+'</p>'+(shown.length?'<div class="vocab-list-table"><div class="vocab-list-head"><span>Word</span><span>Pinyin</span><span>Definition</span></div>'+shown.map(w=>'<div class="vocab-list-row"><div><b lang="zh-CN">'+esc(w.h)+'</b><small class="muted">HSK '+w.l+'</small></div><span class="vocab-list-pinyin">'+esc(w.p)+'</span><span class="vocab-list-meaning">'+esc((w.m||[]).join('; '))+'</span></div>').join('')+'</div>'+paging:'<p>No matching words.</p>');
    document.querySelectorAll('[data-vocab-page]').forEach(b=>b.onclick=()=>{vocabPage+=+b.dataset.vocabPage;renderVocabResults();$('#vocab-list-results').scrollIntoView({block:'start'});});
  }
  function examplesMarkup(w,revealed){
    const rows=flashExamples(w,S.examples||new Map());
    const highlight=(e,entry)=>{
      let out='',offset=0;
      for(const token of e.tokens||[]){
        const at=e.zh.indexOf(token,offset);if(at<0)return esc(e.zh);
        const rendered=token===entry.h?'<mark class="example-target">'+esc(token)+'</mark>':token===e.targetComponent?token.split(entry.h).map(esc).join('<mark class="example-target">'+esc(entry.h)+'</mark>'):esc(token);
        out+=esc(e.zh.slice(offset,at))+rendered;offset=at+token.length;
      }
      return out+esc(e.zh.slice(offset));
    };
    const content=rows.map(({entry,example:e})=>'<div class="example flash-example"><div class="example-body">'+(revealed&&w.entries.length>1?'<p class="muted small">'+esc(entry.p)+'</p>':'')+'<div class="example-zh" lang="zh-CN">'+highlight(e,entry)+'</div>'+(revealed?'<details class="example-help"><summary>English meaning</summary><div class="example-en">'+esc(e.en)+'</div></details>':'')+'</div><button type="button" class="spk" data-say="'+esc(e.zh)+'" aria-label="Play example sentence">🔊</button></div>').join('')+(rows.length<2?'<p class="muted small">'+rows.length+' of 2 level-checked examples available.</p>':'');
    return revealed?'<section class="examples flash-examples"><h3>Example sentences</h3>'+content+'</section>':'<details class="examples flash-examples"><summary>Example sentences · '+rows.length+'</summary>'+content+'</details>';
  }
  function menu(){
    generation++;phase='menu';saving=false;
    const d=deck(),r=ratings(),forms=new Map();for(const w of S.vocab){if(!forms.has(w.h))forms.set(w.h,new Set());forms.get(w.h).add(w.l);}
    const ranked=smartQueue(d,S.settings,readingExposure(getLibrary(),S.settings.readerVisits),Date.now(),forms);
    const smart=ranked.filter(w=>w.eligible),eligible=filter==='smart'?smart:ranked.filter(w=>selectDeck([w],r,filter).length);
    const due=smart.filter(w=>w.due||w.saved).length,newSeen=smart.length-due;
    const summary='<div class="kv"><span>Ready to review</span><b>'+due+'</b></div><div class="kv"><span>New words from your passages</span><b>'+newSeen+'</b></div>';
    const levels=[1,2,3,4,5].map(l=>{const words=levelDeck(S.vocab,l);return '<button class="level-tab '+(l===level?'on':'')+'" data-flash-level="'+l+'" aria-pressed="'+(l===level)+'">HSK '+l+'<small>'+words.length+'</small></button>';}).join('');
    const stats=[...RATINGS,['unrated','Not marked']].map(([k,label])=>'<div class="kv"><span>'+label+'</span><b>'+d.filter(w=>k==='unrated'?!r[w.id]:r[w.id]?.rating===k).length+'</b></div>').join('');
    shell('flashcards','<header class="hdr"><div><p class="read-eyebrow">VOCABULARY FAMILIARITY</p><h1>Flashcards</h1><p class="muted">No tests. Just decide how familiar each word feels.</p></div></header>'+subnav('study')+'<div class="flash-levels">'+levels+'</div><section class="card"><h3>HSK '+level+' vocabulary</h3>'+summary+'<details class="flash-stats"><summary>All familiarity ratings</summary>'+stats+'</details>'+'</section><section class="card"><label>Words to study<select id="flash-filter">'+[['smart','Smart review · recommended'],['all','All words (manual)'],['unrated','Not marked yet'],['review','All non-known words'],...RATINGS].map(([k,label])=>'<option value="'+k+'" '+(k===filter?'selected':'')+'>'+label+'</option>').join('')+'</select></label><label>Session length<select id="flash-size">'+[15,30,50,100,0].map(n=>'<option value="'+n+'" '+(n===size?'selected':'')+'>'+(n?n+' words':'All matching words')+'</option>').join('')+'</select></label><p class="muted small">'+eligible.length+' matching words'+(filter==='smart'&&!eligible.length?' · You’re caught up. Read or listen to a story, save words, or choose All words.':' · Due reviews and saved words first.')+'</p><button class="btn primary" id="flash-start" '+(!eligible.length?'disabled':'')+'>Start flashcards</button></section><p class="muted small">Smart review uses completed passages, saved words and FSRS due times. Reading alone never marks a word as known. Other filters allow manual practice ahead of schedule.</p>');
    bindSubnav();
    document.querySelectorAll('[data-flash-level]').forEach(b=>b.onclick=()=>{level=+b.dataset.flashLevel;menu();});
    $('#flash-filter').onchange=e=>{filter=e.target.value;menu();};$('#flash-size').onchange=e=>{size=+e.target.value;menu();};
    $('#flash-start').onclick=()=>start(eligible);
  }
  function start(words){
    queue=[...words];
    if(size)queue=queue.slice(0,size);
    index=0;counts={known:0,think:0,unsure:0,unknown:0};selected=null;phase='card';render();
  }
  function render(){
    if(index>=queue.length)return finish();
    const w=queue[index],revealed=phase==='revealed';
    shell('flashcards','<button class="link" id="flash-back">‹ HSK '+level+' decks</button><div class="flash-counter"><span>HSK '+level+'</span><span>'+(index+1)+' / '+queue.length+'</span></div><div class="flash-track"><div style="width:'+((index+(revealed?1:0))/queue.length*100)+'%"></div></div><p class="muted small flash-reason">'+esc(w.reason)+(w.passages[0]?' · '+esc(w.passages[0].title):'')+'</p><section class="card flash-face"><div class="flash-hanzi" lang="zh-CN">'+esc(w.h)+'</div>'+(revealed?'<div class="flash-definition">'+w.entries.map(e=>'<div><b class="flash-pinyin">'+esc(e.p)+'</b><p>'+esc((e.m||[]).join('; '))+'</p></div>').join('')+'<button class="btn" data-say="'+esc(w.h)+'">🔊 Pronunciation</button></div>':'<p class="muted small">How well do you know this word?</p>')+'</section>'+examplesMarkup(w,revealed)+(revealed?'<p class="flash-mark muted">Marked: '+esc(RATINGS.find(([k])=>k===selected)[1])+' · Next review '+fmtInterval(Date.parse(ratings()[w.id].due)-Date.now())+'</p><button class="btn primary big" id="flash-next">'+(index+1===queue.length?'Finish session':'Next word →')+'</button>':'<div class="flash-ratings">'+RATINGS.map(([k,label])=>'<button class="btn flash-rate flash-'+k+'" data-flash-rating="'+k+'"><span>'+label+'</span><small>'+fmtInterval(Date.parse(rateFlashcard(w,w.card,k,Date.now(),S.settings.retention||.9).due)-Date.now())+'</small></button>').join('')+'</div>')+'<p class="muted small" id="flash-error" role="status"></p>');
    $('#flash-back').onclick=menu;
    if(revealed){$('#flash-next').onclick=advance;return;}
    document.querySelectorAll('[data-flash-rating]').forEach(b=>b.onclick=()=>mark(b.dataset.flashRating));
  }
  async function mark(rating){
    if(saving||phase!=='card'||!RATINGS.some(([k])=>k===rating))return;
    saving=true;const w=queue[index],g=generation,now=Date.now();
    document.querySelectorAll('[data-flash-rating]').forEach(b=>b.disabled=true);
    try{await saveSettings({flashcardRatings:{...ratings(),[w.id]:rateFlashcard(w,w.card,rating,now,S.settings.retention||.9)}});}
    catch(e){if(g===generation&&$('#flash-error')){$('#flash-error').textContent='Could not save. Please try again.';document.querySelectorAll('[data-flash-rating]').forEach(b=>b.disabled=false);}return;}
    finally{if(g===generation)saving=false;}
    if(g!==generation||!$('#flash-error'))return;
    counts[rating]++;selected=rating;
    if(rating==='known')advance();else{phase='revealed';render();}
  }
  function advance(){index++;selected=null;phase='card';render();}
  function finish(){
    phase='finished';shell('flashcards','<header class="hdr"><div><h1>Session complete</h1><p class="muted">HSK '+level+' · '+queue.length+' words rated</p></div></header><section class="card">'+RATINGS.map(([k,label])=>'<div class="kv"><span>'+label+'</span><b>'+counts[k]+'</b></div>').join('')+'</section><button class="btn primary" id="flash-menu">Choose another session</button>');$('#flash-menu').onclick=menu;
  }
  return {open:menu};
}
