// Conservative learning-mode audit. Never hide a word until a matching lesson exists.
// Vocabulary IDs remain immutable; existing cards/logs are not deleted.
import { GRAMMAR } from './grammar-data.js';
const FUNCTION_POS=new Set(['particle','preposition','conjunction','prefix','suffix']);
const PURE_IDS=new Set([1,2,6,10,19,29,57,63,68,76,108,301,302,304,307,311,319,320,326,330,339,499,502,503,512,536,541,543,594,603,609,622,743,815,996,998,1001,1010,1012,1028,1043,1047,1100,1128,1140,1148,1206,1207,1219,1227,1245,1249,1270,1301,1302,1397,1447,1474,1532,1982,1990,1995,2066,2237,2378,2601,152,185,306,309,581,596,1398,2057,515,548,589,820,986,1000,1023,1040,1151,1258,1281,1573,1644,1874,1996,2004,2012,2086,2291,2591,2645,2816,2823,2834,2848,3017,3100,3103,3391,3572]);
// Keep independent lexical senses of mixed entries; grammar meanings are taught in context.
const LEXICAL={
  3:['to be located; to be present'],17:['right; correct','pair (classifier)','to check against; to match'],35:['to give; to hand over'],
  312:['to yield; to give way','to allow; to let'],313:['to cross; to pass','to spend (time)'],322:['to compare','ratio'],
  504:['handle','classifier for objects with handles'],518:['talent; ability'],561:['basis; grounds; evidence'],
  586:['to exceed; to surpass'],995:['to touch; to catch fire','to feel (cold, heat, etc.)'],
  1004:['to combine; to merge'],1017:['to pass through','to pass (an exam or proposal)'],1076:['to join; to connect'],
  1400:['to be inferior to; not as good as'],1994:['place; location','classifier for institutions or buildings'],
  697:['one side; one hand'],332:['heel','to follow closely'],384:['to go; to head towards'],509:['to face; to turn toward'],994:['to act as; to serve as'],47:['that (demonstrative pronoun)'],49:['small; tiny','young'],56:['home; family','classifier for families or businesses'],97:['to call; to shout','to be called; to be named'],146:['side; edge; border'],303:['to wait; to wait for','class; rank; grade'],335:['like that; in that way'],350:['face; side; surface','aspect; noodles'],508:['can; may; be able to'],529:['to grow; to develop'],540:['to be related to; to concern'],551:['old (of people); aged','experienced'],554:['to compare; to contrast'],997:['to take; to use (formal)'],1021:['to act as; to serve as','to be in charge of'],1036:['conduct; deeds; accomplishments'],1042:['outcome; result'],1051:['self; oneself'],1106:['to press; to push'],1152:['additional; another; separate'],1199:['nature; character; quality','sex'],1213:['to feel; to be moved'],1344:['to add; to put in'],1602:['casual; careless; random'],1619:['to say again; to discuss later'],1647:['opposite; contrary'],2003:['to resemble; to be like'],2006:['same; similar'],2036:['power; force; strength'],2041:['degree (unit); measure','to spend (time)'],2202:['beginning; initial'],2322:['dynasty; royal court','to face'],2339:['to taste; to sample','grade; quality'],2405:['to change; to transform'],2452:['to follow; to continue along'],2532:['basis; foundation; grounds'],2602:['ethnic group; clan'],2610:['helpless; to have no alternative'],2614:['to obey; to follow','smooth; favorable'],2648:['to lean against; to rely on'],2703:['visible; able to be seen'],2710:['to replace; to substitute for']
};
const normalize=s=>String(s||'').normalize('NFC').trim().replace(/\s+/g,' ');
const PATTERNS=new Map();
for(const p of GRAMMAR) {
  const k=p.word+':'+normalize(p.meaning.split(' · ')[0].split(' … ')[0]);
  if(!PATTERNS.has(k))PATTERNS.set(k,[]);
  PATTERNS.get(k).push(p);
}
export function grammarPatternsFor(w) {
  return w ? PATTERNS.get(w.h+':'+normalize(w.p))||[] : [];
}
export function learningType(w) {
  if(!w)return 'vocabulary';
  const covered=grammarPatternsFor(w).length>0;
  if(covered&&PURE_IDS.has(w.i))return 'grammar';
  if(covered)return 'mixed';
  if(w.s?.some(p=>FUNCTION_POS.has(p)))return 'pending';
  return 'vocabulary';
}
export const isGrammarOnly=w=>learningType(w)==='grammar';
export const vocabularyMeanings=w=>learningType(w)==='mixed'&&LEXICAL[w.i]?LEXICAL[w.i]:w.m;
export const learningLabel=w=>({grammar:'Grammar only',mixed:'Vocabulary + grammar',pending:'Vocabulary · grammar lesson pending',vocabulary:'Vocabulary'}[learningType(w)]);
export function allowsCard(w,kind){return !!w&&(!isGrammarOnly(w)||kind==='listen'||kind==='tone');}
export function grammarStarted(w,progress={}){return grammarPatternsFor(w).some(p=>['cloze','contrast','produce','function'].some(k=>progress[p.id+':'+k]?.reps));}
export function pronunciationExample(w) {return grammarPatternsFor(w).find(p=>p.examples.length)?.examples[0]||null;}
