// Self-assessed flashcards. No multiple choice, response-time grading or quiz logs.
export const RATINGS=[['known','Known'],['think','Think I know'],['unsure','I’m unsure'],['unknown','I don’t know']];
export function levelDeck(vocab,level){
  const groups=new Map();
  for(const w of vocab)if(w.l===level){
    if(!groups.has(w.h))groups.set(w.h,{id:level+':'+w.h,h:w.h,level,entries:[]});
    groups.get(w.h).entries.push(w);
  }
  return [...groups.values()];
}
export function selectDeck(deck,ratings={},filter='all'){
  return deck.filter(w=>filter==='all'||(filter==='unrated'?!ratings[w.id]:filter==='review'?!!ratings[w.id]&&ratings[w.id].rating!=='known':ratings[w.id]?.rating===filter));
}
export function createFlashcards({S,shell,saveSettings,esc}){
  let level=5,filter='all',size=30,queue=[],index=0,phase='menu',selected=null,saving=false,counts={},generation=0;
  const $=s=>document.querySelector(s), ratings=()=>S.settings.flashcardRatings||{};
  const deck=()=>levelDeck(S.vocab,level);
  function menu(){
    generation++;phase='menu';saving=false;
    const d=deck(),r=ratings(),eligible=selectDeck(d,r,filter);
    const levels=[1,2,3,4,5].map(l=>{const words=levelDeck(S.vocab,l);return '<button class="level-tab '+(l===level?'on':'')+'" data-flash-level="'+l+'" aria-pressed="'+(l===level)+'">HSK '+l+'<small>'+words.length+'</small></button>';}).join('');
    const stats=[...RATINGS,['unrated','Not marked']].map(([k,label])=>'<div class="kv"><span>'+label+'</span><b>'+d.filter(w=>k==='unrated'?!r[w.id]:r[w.id]?.rating===k).length+'</b></div>').join('');
    shell('flashcards','<header class="hdr"><div><p class="read-eyebrow">VOCABULARY FAMILIARITY</p><h1>Flashcards</h1><p class="muted">No tests. Just decide how familiar each word feels.</p></div></header><div class="flash-levels">'+levels+'</div><section class="card"><h3>HSK '+level+' vocabulary</h3>'+stats+'</section><section class="card"><label>Words to study<select id="flash-filter">'+[['all','All words'],['unrated','Not marked yet'],['review','All non-known words'],...RATINGS].map(([k,label])=>'<option value="'+k+'" '+(k===filter?'selected':'')+'>'+label+'</option>').join('')+'</select></label><label>Session length<select id="flash-size">'+[15,30,50,100,0].map(n=>'<option value="'+n+'" '+(n===size?'selected':'')+'>'+(n?n+' words':'All matching words')+'</option>').join('')+'</select></label><p class="muted small">'+eligible.length+' matching words · previously rated words retain their last rating.</p><button class="btn primary" id="flash-start" '+(!eligible.length?'disabled':'')+'>Start flashcards</button></section><p class="muted small">Self-ratings are saved separately from your previous quiz scores. Words with multiple readings in this level show their listed meanings together.</p>');
    document.querySelectorAll('[data-flash-level]').forEach(b=>b.onclick=()=>{level=+b.dataset.flashLevel;menu();});
    $('#flash-filter').onchange=e=>{filter=e.target.value;menu();};$('#flash-size').onchange=e=>{size=+e.target.value;menu();};
    $('#flash-start').onclick=()=>start(eligible);
  }
  function start(words){
    // Unmarked words first, then least recently rated. No immediate repeats.
    queue=[...words].sort((a,b)=>{const aa=ratings()[a.id],bb=ratings()[b.id];return Number(!!aa)-Number(!!bb)||(aa?.updated_at||'').localeCompare(bb?.updated_at||'');});
    if(size)queue=queue.slice(0,size);
    index=0;counts={known:0,think:0,unsure:0,unknown:0};selected=null;phase='card';render();
  }
  function render(){
    if(index>=queue.length)return finish();
    const w=queue[index],revealed=phase==='revealed';
    shell('flashcards','<button class="link" id="flash-back">‹ HSK '+level+' decks</button><div class="flash-counter"><span>HSK '+level+'</span><span>'+(index+1)+' / '+queue.length+'</span></div><div class="flash-track"><div style="width:'+((index+(revealed?1:0))/queue.length*100)+'%"></div></div><section class="card flash-face"><div class="flash-hanzi" lang="zh-CN">'+esc(w.h)+'</div>'+(revealed?'<div class="flash-definition">'+w.entries.map(e=>'<div><b class="flash-pinyin">'+esc(e.p)+'</b><p>'+esc((e.m||[]).join('; '))+'</p></div>').join('')+'<button class="btn" data-say="'+esc(w.h)+'">🔊 Pronunciation</button></div>':'<p class="muted small">How well do you know this word?</p>')+'</section>'+(revealed?'<p class="flash-mark muted">Marked: '+esc(RATINGS.find(([k])=>k===selected)[1])+'</p><button class="btn primary big" id="flash-next">'+(index+1===queue.length?'Finish session':'Next word →')+'</button>':'<div class="flash-ratings">'+RATINGS.map(([k,label])=>'<button class="btn flash-rate flash-'+k+'" data-flash-rating="'+k+'">'+label+'</button>').join('')+'</div>')+'<p class="muted small" id="flash-error" role="status"></p>');
    $('#flash-back').onclick=menu;
    if(revealed){$('#flash-next').onclick=advance;return;}
    document.querySelectorAll('[data-flash-rating]').forEach(b=>b.onclick=()=>mark(b.dataset.flashRating));
  }
  async function mark(rating){
    if(saving||phase!=='card'||!RATINGS.some(([k])=>k===rating))return;
    saving=true;const w=queue[index],g=generation;
    document.querySelectorAll('[data-flash-rating]').forEach(b=>b.disabled=true);
    try{await saveSettings({flashcardRatings:{...ratings(),[w.id]:{rating,updated_at:new Date().toISOString()}}});}
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
