// Run: node scripts/audit_reading.mjs [--gaps]
import fs from 'node:fs';
const vocab=JSON.parse(fs.readFileSync(new URL('../data/vocab.json',import.meta.url),'utf8'));
const raw=fs.readFileSync(new URL('../js/practice-data.js',import.meta.url),'utf8');
const extra=fs.readFileSync(new URL('../js/coverage-practice-data.js',import.meta.url),'utf8');
const syllabus=fs.readFileSync(new URL('../js/syllabus-practice-data.js',import.meta.url),'utf8');
const parse=s=>JSON.parse(s.slice(s.indexOf('['),s.lastIndexOf(']')+1));
const questions=[...parse(raw),...parse(extra),...parse(syllabus)].filter(q=>q.kind==='reading');
const levels=new Map();for(const w of vocab)levels.set(w.h,Math.min(w.l,levels.get(w.h)??Infinity));
const clean=s=>String(s??'').replace(/[\p{P}\p{Z}\s]/gu,'');
const groups=new Map(),ids=new Set(),errors=[];
for(const q of questions){if(ids.has(q.id))errors.push(q.id+': duplicate question');ids.add(q.id);
const l=q.passageLevel||q.level;const good=(ts,s)=>Array.isArray(ts)&&ts.length>0&&ts.every(t=>t&&levels.get(t)<=l)&&ts.join('')===clean(s);
if(!q.passageId||!good(q.passageTokens,q.passage)||!good(q.tokens,q.passage+q.prompt+q.choices.join(''))||q.choices.length!==3||new Set(q.choices).size!==3||!q.choices.includes(q.answer))errors.push(q.id+': invalid tokens or options');
if((String(q.explain||'').match(/\p{Script=Han}+/gu)||[]).some(s=>!clean(q.passage+q.prompt+q.choices.join('')).includes(s)))errors.push(q.id+': unchecked Chinese explanation');
if(groups.has(q.passageId)&&groups.get(q.passageId).passage!==q.passage)errors.push(q.id+': inconsistent text');
groups.set(q.passageId,q);}
const targetGroups=new Map();for(const q of questions){if(!targetGroups.has(q.passageId))targetGroups.set(q.passageId,new Set());for(const t of q.words||[])targetGroups.get(q.passageId).add(t);}
for(const p of groups.values()){const targets=[...(targetGroups.get(p.passageId)||[])];if(p.passageTokens.length<80||p.passageTokens.length>120)errors.push(p.passageId+': outside 80–120 word token range');if(targets.length!==10)errors.push(p.passageId+': expected exactly ten target words');if(targets.some(t=>!p.passageTokens.includes(t)||!(levels.get(t)<=(p.passageLevel||p.level))))errors.push(p.passageId+': invalid target word');}
const freq=new Map();for(const p of groups.values()){if(p.next&&!groups.has(p.next))errors.push(p.passageId+': dangling chapter');for(const t of new Set(p.passageTokens))freq.set(t,(freq.get(t)||0)+1);}
const forms=[...new Set(vocab.map(w=>w.h))],gaps=forms.filter(t=>!freq.has(t));
const targeted=new Set([...targetGroups.values()].flatMap(s=>[...s]));
const targetGaps=forms.filter(t=>!targeted.has(t));console.log(JSON.stringify({passages:groups.size,questions:questions.length,minPassageWords:Math.min(...[...groups.values()].map(p=>p.passageTokens.length)),meanPassageWords:[...groups.values()].reduce((n,p)=>n+p.passageTokens.length,0)/groups.size,maxPassageWords:Math.max(...[...groups.values()].map(p=>p.passageTokens.length)),minTargetWords:Math.min(...[...targetGroups.values()].map(t=>t.size)),maxTargetWords:Math.max(...[...targetGroups.values()].map(t=>t.size)),distinctForms:forms.length,targeted:targeted.size,targetGaps:targetGaps.length,targetCoverageByLevel:[1,2,3,4,5].map(level=>{const words=forms.filter(t=>levels.get(t)===level);return {level,total:words.length,targeted:words.filter(t=>targeted.has(t)).length,remaining:words.filter(t=>!targeted.has(t)).length};}),exposed:forms.length-gaps.length,repeated:[...freq.values()].filter(n=>n>=3).length,errors,levels:[1,2,3,4,5].map(level=>{const terms=[...new Set(vocab.filter(w=>w.l===level).map(w=>w.h))];return {level,total:terms.length,seen:terms.filter(t=>freq.has(t)).length,repeated:terms.filter(t=>freq.get(t)>=3).length};}),...(process.argv.includes('--gaps')?{targetGapWords:targetGaps,targetGapsByLevel:[1,2,3,4,5].map(level=>({level,words:targetGaps.filter(t=>levels.get(t)===level)})),gaps,gapsByLevel:[1,2,3,4,5].map(level=>({level,words:[...new Set(vocab.filter(w=>w.l===level).map(w=>w.h))].filter(t=>!freq.has(t))}))}:{} )},null,2));if(errors.length||(process.argv.includes('--require-full-targets')&&targetGaps.length))process.exitCode=1;
