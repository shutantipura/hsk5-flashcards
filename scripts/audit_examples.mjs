// Run from any directory: node scripts/audit_examples.mjs [--require-three]
// Uses the actual browser selection code, all five source files, and the app syllabus.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = p => readFileSync(new URL('../'+p, import.meta.url), 'utf8');
const source = read('js/examples.js');
const { buildLevelExamples, curatedExamples } = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const vocab=JSON.parse(read('data/vocab.json'));
const data=[1,2,3,4,5].map(l=>JSON.parse(read('data/examples-'+l+'.json')));
const levels=new Map();
for(const w of vocab) levels.set(w.h,Math.min(w.l,levels.get(w.h)??Infinity));
const result=buildLevelExamples(vocab,data,curatedExamples);
const stats={};
const missing=[];
let total=0;
for(const w of vocab){
  const es=result.get(w.i);
  assert(Array.isArray(es) && es.length<=3,'invalid example count for '+w.i);
  assert.equal(new Set(es.map(e=>e.zh)).size,es.length,'duplicate examples for '+w.i);
  for(const e of es){
    assert(e.tokens.includes(w.h) || (e.source==='original' && ({589:['桌子','杯子','椅子'],778:['季节','四季'],994:['成为','认为','以为','作为','分为']}[w.i]||[]).includes(e.targetComponent) && e.targetComponent.includes(w.h) && e.tokens.includes(e.targetComponent)),'missing target '+w.h+': '+e.zh);
    assert(e.tokens.every(t=>levels.has(t)&&levels.get(t)<=w.l),'out-of-level token: '+e.zh);
    assert.equal(e.tokens.join(''),e.zh.replace(/[\p{P}\p{Z}\p{N}\s]/gu,''),'unaccounted sentence text: '+e.zh);
    assert(e.maxLevel<=w.l,'out-of-level example: '+e.zh);
    total++;
  }
  (stats[w.l]??={zero:0,one:0,two:0,three:0})[['zero','one','two','three'][es.length]]++;
  if(es.length<3) missing.push({id:w.i,word:w.h,level:w.l,count:es.length});
}
console.table(stats);
console.log('Validated '+total+' displayed examples across '+vocab.length+' entries. '+missing.length+' entries still need examples.');
if(process.argv.includes('--list-missing')) console.log(JSON.stringify(missing,null,2));
if(process.argv.includes('--require-three') && missing.length) process.exitCode=1;
