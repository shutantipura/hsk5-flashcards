import { schedule, State, recallProb, fitFactor, fmtInterval, DAY } from '/home/claude/app/js/fsrs.js';
let c = { word_id: 5, kind: 'meaning', state: 0, reps: 0, lapses: 0, step: 0, stability: 0, difficulty: 0 };
let t = Date.parse('2026-11-26T05:00:00Z');
const step = (g, dt) => { t += dt; const r = schedule(c, g, t); c = r.card; console.log(g, ['New','Learn','Review','Relearn'][c.state], 'S=', c.stability.toFixed(2), 'D=', c.difficulty.toFixed(2), 'next', fmtInterval(Date.parse(c.due) - t)); };
step(1, 0); step(3, 60e3); step(3, 600e3); step(3, 1*DAY); step(3, 3*DAY); step(1, 9*DAY); step(3, 600e3); step(4, 3*DAY);
console.log('R now', recallProb(c, t).toFixed(3), 'R in 10d', recallProb(c, t + 10*DAY).toFixed(3));
// calibration: simulate a learner who remembers WORSE than model (true S = 0.5*S)
const logs=[]; for (let i=0;i<400;i++){ const S=1+Math.random()*30, e=Math.random()*30; const p=Math.pow(1+19/81*e/(S*0.5),-0.5); logs.push({state_before:2,elapsed_days:e,stability_before:S,correct:Math.random()<p}); }
console.log('fitted factor (expect ~0.5 shrunk toward 1):', fitFactor(logs).factor.toFixed(2));
