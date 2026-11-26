// Conservative learning-mode audit. Never hide a word until a matching lesson exists.
// Vocabulary IDs remain immutable; existing cards/logs are not deleted.
import { GRAMMAR } from './grammar-data.js';
const FUNCTION_POS=new Set(['particle','preposition','conjunction','prefix','suffix']);
const PURE_IDS=new Set([1,2,6,10,19,29,57,63,68,76,108,301,302,304,307,311,319,320,326,330,339,499,502,503,512,536,541,543,594,603,609,622,743,815,996,998,1001,1010,1012,1028,1043,1047,1100,1128,1140,1148,1206,1207,1219,1227,1245,1249,1270,1301,1302,1397,1447,1474,1532,1982,1990,1995,2066,2237,2378,2601]);
// Keep independent lexical senses of mixed entries; grammar meanings are taught in context.
const LEXICAL={
  3:['to be located; to be present'],17:['right; correct','pair (classifier)','to check against; to match'],35:['to give; to hand over'],
  312:['to yield; to give way','to allow; to let'],313:['to cross; to pass','to spend (time)'],322:['to compare','ratio'],
  504:['handle','classifier for objects with handles'],518:['talent; ability'],561:['basis; grounds; evidence'],
  586:['to exceed; to surpass'],995:['to touch; to catch fire','to feel (cold, heat, etc.)'],
  1004:['to combine; to merge'],1017:['to pass through','to pass (an exam or proposal)'],1076:['to join; to connect'],
  1400:['to be inferior to; not as good as'],1994:['place; location','classifier for institutions or buildings'],
  697:['one side; one hand']
};
const normalize=s=>String(s||'').normalize('NFC').trim().replace(/\s+/g,' ');
export function grammarPatternsFor(w) {
  if(!w)return [];
  return GRAMMAR.filter(p=>p.word===w.h && normalize(p.meaning.split(' · ')[0].split(' … ')[0])===normalize(w.p));
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
