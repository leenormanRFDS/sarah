import { researcherPrior } from '../data/privatePrior';
import { weights, type Vec } from '../data/weights';

const zero: Vec = [0,0,0,0,0,0];
const add=(a:Vec,b:Vec):Vec=>a.map((v,i)=>v+b[i]) as Vec;
const scale=(a:Vec,s:number):Vec=>a.map(v=>v*s) as Vec;
const norm=(a:Vec)=>{const m=Math.sqrt(a.reduce((x,v)=>x+v*v,0));return m?scale(a,1/m):zero};
const cosine=(a:Vec,b:Vec)=>{const na=Math.sqrt(a.reduce((x,v)=>x+v*v,0));const nb=Math.sqrt(b.reduce((x,v)=>x+v*v,0));return na&&nb?a.reduce((x,v,i)=>x+v*b[i],0)/(na*nb):0};

function confidenceWeight(c:1|2|3|null){return c===1?1:c===2?.65:c===3?.35:0}

export function buildModelVector(responses: Record<number,string>): Vec {
  const observedPairs = Object.entries(responses).map(([qid,opt])=>weights[Number(qid)]?.[opt] ?? zero);
  const observed = observedPairs.length ? observedPairs.reduce((a,b)=>add(a,b),zero).map(v=>v/observedPairs.length) as Vec : zero;

  let priorSum: Vec = zero; let priorWeightCount=0;
  for (const [qid, opt] of Object.entries(responses)) {
    const p=researcherPrior[Number(qid)];
    const w=confidenceWeight(p?.confidence ?? null);
    if(!p || !p.predictedOption.length || !w) continue;
    const share=1/p.predictedOption.length;
    for(const predicted of p.predictedOption){
      const v=weights[Number(qid)]?.[predicted] ?? zero;
      priorSum=add(priorSum,scale(v,w*share));
      priorWeightCount += w*share;
    }
  }
  const prior = priorWeightCount ? scale(priorSum,1/priorWeightCount) : zero;
  return norm(add(scale(observed,.85),scale(prior,.15)));
}

export type TestQuestion={id:string;question:string;options:{id:string;label:string;vector:Vec}[];note:string};
// The supplied build brief gives the test questions and purposes but does not supply option vectors.
// These vectors are therefore an implementation authoring decision, kept playful and deterministic.
export const testQuestions: TestQuestion[]=[
 {id:'TEST-01',question:'A friend cancels plans at the last minute. What does Sarah most likely do?',note:'Tests flexibility versus autonomy.',options:[
  {id:'A',label:'Immediately make a new plan',vector:[1,1,1,1,0,0]},
  {id:'B',label:'Quietly enjoy having the night back',vector:[1,-1,0,-1,2,2]},
  {id:'C',label:'Ask what happened, then decide',vector:[0,0,1,0,1,2]},
  {id:'D',label:'Be annoyed but go with it',vector:[0,-1,0,0,1,-1]},
 ]},
 {id:'TEST-02',question:"Sarah receives $1,000 she wasn't expecting. What is she most likely to do?",note:'Tests value orientation and planning.',options:[
  {id:'A',label:'Save it',vector:[2,-1,0,-1,2,1]},
  {id:'B',label:'Buy something she has wanted for ages',vector:[0,1,1,0,1,-1]},
  {id:'C',label:'Spend it on an experience',vector:[-1,2,1,1,-1,1]},
  {id:'D',label:'Split it between saving and spending',vector:[1,0,0,0,2,2]},
 ]},
 {id:'TEST-03',question:'Sarah suddenly has a completely free Saturday with nothing booked. What happens?',note:'Tests planning, novelty, autonomy, and social pull.',options:[
  {id:'A',label:'She makes a plan',vector:[2,-1,1,0,2,0]},
  {id:'B',label:'She finds something spontaneous to do',vector:[-1,2,1,2,-1,1]},
  {id:'C',label:'She stays home and enjoys the lack of obligation',vector:[1,-1,0,-1,2,2]},
  {id:'D',label:'She waits to see what everyone else is doing',vector:[-1,1,-1,1,0,2]},
 ]},
];

export function predict(test:TestQuestion, model:Vec){
  const scored=test.options.map(o=>({id:o.id,score:cosine(model,o.vector)}));
  scored.sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
  return scored[0].id;
}

export function modelSummary(model:Vec){return {structure:model[0],novelty:model[1],agency:model[2],socialEnergy:model[3],practicality:model[4],tolerance:model[5]}}
