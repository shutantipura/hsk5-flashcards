// Shared Learner / Challenge passage rules.
export function vocabularyIndex(vocab){
 const min=new Map(),byLevel=new Map();
 for(const w of vocab){min.set(w.h,Math.min(w.l,min.get(w.h)??Infinity));if(!byLevel.has(w.l))byLevel.set(w.l,new Set());byLevel.get(w.l).add(w.h);}
 return {min,byLevel};
}
export function passageTiers(qs,index){
 const p=qs[0],level=p.passageLevel||p.level,{min,byLevel}=index,own=byLevel.get(level)||new Set(),tokens=p.passageTokens||[],present=[...new Set(tokens)],old=[...new Set(qs.flatMap(q=>q.words||[]))];
 if(!tokens.length||!tokens.every(t=>min.get(t)<=level)||old.some(t=>!present.includes(t)||!(min.get(t)<=level))||!qs.every(q=>(q.sublevel||'legacy')===(p.sublevel||'legacy')))return null;
 const strict=targets=>targets.length===10&&targets.every(t=>own.has(t)&&present.includes(t))&&present.every(t=>targets.includes(t)||min.get(t)<level);
 const required=present.filter(t=>min.get(t)===level),optional=present.filter(t=>own.has(t)&&min.get(t)<level);
 const derived=[...required,...optional.slice(0,Math.max(0,10-required.length))];
 const learnerTargets=strict(old)?old:strict(derived)?derived:null;
 const standard=tokens.length>=80&&tokens.length<=120,learnerLength=standard||(level===1&&tokens.length>=10&&tokens.length<=120);
 if(p.sublevel==='learner')return learnerLength&&strict(old)?{tracks:['learner'],targets:old,learnerTargets:old,challengeTargets:[]}:null;
 if((p.sublevel&&p.sublevel!=='challenge')||!standard)return null;
 const ownWords=present.filter(t=>own.has(t)),challengeTargets=ownWords.length?ownWords:old;
 // Two near-identical legacy pharmacy stories contain higher-level 好好 / 好多 when linguistically segmented; keep them in Challenge only.
 const legacyExcluded=new Set(['r-foundation-2-17','r-foundation-2-18']);
 const eligible=!p.sublevel&&!legacyExcluded.has(p.passageId)&&learnerTargets&&learnerLength;
 return {tracks:eligible?['learner','challenge']:['challenge'],targets:eligible?learnerTargets:challengeTargets,learnerTargets:eligible?learnerTargets:[],challengeTargets};
}
export function tierCoverage(library,vocab){
 const {byLevel}=vocabularyIndex(vocab);
 return [1,2,3,4,5].map(level=>{
  const words=[...(byLevel.get(level)||[])],rows=library.filter(p=>p.level===level),result={level,total:words.length};
  for(const [track,goal] of [['learner',3],['challenge',1]]){
   const ps=rows.filter(p=>p.tracks.includes(track)),freq=new Map(),seenBodies=new Set();
   for(const p of ps){const key=p.body.replace(/[\p{P}\p{Z}\s]/gu,'');if(seenBodies.has(key))continue;seenBodies.add(key);for(const t of new Set(track==='learner'?p.learnerTargets:p.tokens))freq.set(t,(freq.get(t)||0)+1);}
   const gaps=words.filter(w=>(freq.get(w)||0)<goal).map(word=>({word,contexts:freq.get(word)||0})).sort((a,b)=>a.contexts-b.contexts);
   result[track]={passages:ps.length,goal,covered:words.length-gaps.length,remaining:gaps.length,additionalContextsNeeded:gaps.reduce((n,x)=>n+goal-x.contexts,0),gaps};
  }
  return result;
 });
}
