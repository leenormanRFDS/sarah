'use client';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { questions, type Question } from '../data/questions';
import { timeline } from '../data/timeline';
import { profile } from '../data/profile';
import { researcherPrior } from '../data/privatePrior';
import { buildModelVector, modelSummary, predict, testQuestions } from '../lib/model';
import { forecast } from '../data/forecast';

type Props={onReveal:()=>void};

type Stage='INTRO'|'LOADING'|'TIMELINE'|'PROFILE'|'TRAINING_INTRO'|'QUIZ'|'MODEL_COMPLETE'|'MODEL_TEST'|'FORECAST'|'FINAL_ASSESSMENT'|'Q30'|'GIFT'|'BIRTHDAY'|'RESPONSIBLE';

const fade={initial:{opacity:0,y:10},animate:{opacity:1,y:0,transition:{duration:.45}}};

export default function ResearchPhase({onReveal}:Props){
  const [stage,setStage]=useState<Stage>('INTRO');
  const [loadIndex,setLoadIndex]=useState(0);
  const [qIndex,setQIndex]=useState(0);
  const [responses,setResponses]=useState<Record<number,string>>({});
  const [why,setWhy]=useState<Record<number,string>>({});
  const [selected,setSelected]=useState<string|null>(null);
  const [reveal,setReveal]=useState(false);
  const [testIndex,setTestIndex]=useState(0);
  const [testPredictions,setTestPredictions]=useState<Record<string,string>>({});
  const [testAnswers,setTestAnswers]=useState<Record<string,string>>({});
  const [q30,setQ30]=useState<string|null>(null);
  const [gift,setGift]=useState(false);
  const [futureImageErrors,setFutureImageErrors]=useState<Record<number,boolean>>({});
  const [responsibleBroken,setResponsibleBroken]=useState(false);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('sarah-30th-v1');
      if(raw){
        const saved=JSON.parse(raw);
        if(saved.responses) setResponses(saved.responses);
        if(saved.why) setWhy(saved.why);
        if(Number.isInteger(saved.qIndex)) setQIndex(saved.qIndex);
        if(saved.testPredictions) setTestPredictions(saved.testPredictions);
        if(saved.testAnswers) setTestAnswers(saved.testAnswers);
        if(saved.q30) setQ30(saved.q30);
        if(saved.stage && ['INTRO','LOADING','TIMELINE','PROFILE','TRAINING_INTRO','QUIZ','MODEL_COMPLETE','MODEL_TEST','FORECAST','FINAL_ASSESSMENT'].includes(saved.stage)) setStage(saved.stage);
      }
    }catch{}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    const save={stage,qIndex,responses,why,testPredictions,testAnswers,q30};
    try{localStorage.setItem('sarah-30th-v1',JSON.stringify(save));}catch{}
  },[stage,qIndex,responses,why,testPredictions,testAnswers,q30]);

  const model=useMemo(()=>buildModelVector(responses),[responses]);
  const currentQuestion:Question|undefined=questions[qIndex];
  const comparable=Object.keys(responses).filter(k=>researcherPrior[Number(k)]?.predictedOption?.length).length;
  const accuracy=Object.entries(responses).filter(([qid,opt])=>researcherPrior[Number(qid)]?.predictedOption?.includes(opt)).length;

  function startLoading(){setStage('LOADING');setLoadIndex(0)}
  useEffect(()=>{if(stage!=='LOADING')return; if(loadIndex<4){const t=setTimeout(()=>setLoadIndex(v=>v+1),850);return()=>clearTimeout(t)} const t=setTimeout(()=>setStage('TIMELINE'),700);return()=>clearTimeout(t)},[stage,loadIndex]);

  function chooseAnswer(opt:string){if(selected)return;setSelected(opt);setResponses(r=>({...r,[currentQuestion!.id]:opt}));setReveal(false)}
  function goNext(){
    if(!currentQuestion || !selected)return;
    if(currentQuestion.why && !reveal){setReveal(true);return;}
    if(currentQuestion.why && reveal && !why[currentQuestion.id])return;
    if(qIndex<questions.length-1){setQIndex(i=>i+1);setSelected(null);setReveal(false)} else setStage('MODEL_COMPLETE');
  }

  function startModelTest(){
    const predicted=predict(testQuestions[0],model);setTestPredictions({[testQuestions[0].id]:predicted});setStage('MODEL_TEST');setTestIndex(0)}
  function answerTest(id:string){if(testAnswers[id])return;setTestAnswers(a=>({...a,[id]:id}));}
  // The actual selected test answer is supplied separately; the helper above is not used because we need the option id.
  function chooseTest(option:string){
    const tq=testQuestions[testIndex];
    if(testAnswers[tq.id])return;
    setTestAnswers(a=>({...a,[tq.id]:option}));
  }
  function nextTest(){
    const tq=testQuestions[testIndex];
    if(!testAnswers[tq.id])return;
    const next=testIndex+1;
    if(next<testQuestions.length){setTestIndex(next);setTestPredictions(p=>({...p,[testQuestions[next].id]:predict(testQuestions[next],model)}))}
    else setStage('FORECAST');
  }

  return <div className="research-shell">
    <div className="topline"><span>CASE 30–172 / SARAH</span><span>RESEARCH STATUS / {stage}</span></div>
    <main>
      {stage==='INTRO' && <motion.section className="paper-page cover" {...fade}>
        <div className="case-mark">CASE 30–172</div>
        <div className="cover-kicker">THE</div><h1>SARAH<br/>BRAND BIBLE™</h1>
        <p className="serif-lede">A 172-day study of one woman, several assumptions, and very little retained information.</p>
        <div className="meta-grid"><span>SUBJECT</span><b>Sarah Hyland</b><span>AGE</span><b>30</b><span>RESEARCH COMMENCED</span><b>30.03.2026</b><span>RESEARCH PERIOD</span><b>172 DAYS</b><span>METHODOLOGY</span><b>Observation / assumption / vibes</b><span>PRIMARY RESEARCHER</span><b>Classified</b></div>
        <button className="paper-button" onClick={startLoading}>BEGIN INVESTIGATION</button>
      </motion.section>}

      {stage==='LOADING' && <section className="paper-page loading-page"><div className="system-stack">
        {['INITIALISING SUBJECT PROFILE…','RECOVERING HISTORICAL DATA…','RECONSTRUCTING RESEARCHER MEMORY…','CROSS-REFERENCING 172 DAYS OF OBSERVATION…'].slice(0,loadIndex+1).map((x,i)=><motion.div key={x} {...fade} className="mono-line">{x}</motion.div>)}
        {loadIndex>=4 && <motion.div {...fade} className="failure">MEMORY RECOVERY FAILED.</motion.div>}
        {loadIndex>=4 && <motion.div {...fade} className="mono-line">PROCEEDING REGARDLESS.</motion.div>}
      </div></section>}

      {stage==='TIMELINE' && <motion.section className="paper-page" {...fade}><div className="section-kicker">03 / THE FIRST 172 DAYS</div><h2>The researcher remembers in instalments.</h2><div className="timeline">{timeline.map((e)=><div className="timeline-row" key={e.day}><div className="timeline-day">DAY {e.day}</div><div className="timeline-card"><h3>{e.title}</h3><p>{e.detail}</p><div className="forgot">{e.forgot}</div></div></div>)}</div><button className="paper-button" onClick={()=>setStage('PROFILE')}>CONTINUE</button></motion.section>}

      {stage==='PROFILE' && <motion.section className="paper-page" {...fade}><div className="section-kicker">04 / CURRENT SUBJECT PROFILE</div><h2>Known variables.</h2><div className="profile-layout"><div className="profile-list">{profile.map(([v,t])=><div className="profile-row" key={v}><span>{t}</span><strong>{v}</strong></div>)}</div><div className="diagnostics"><div><span>INFORMATION ACQUIRED</span><b>71%</b><i><em style={{width:'71%'}}/></i></div><div><span>INFORMATION RETAINED</span><b>18%</b><i><em style={{width:'18%'}}/></i></div><div><span>INFORMATION FORGOTTEN</span><b>82%</b><i><em style={{width:'82%'}}/></i></div><div><span>CONFIDENCE WHILE WRONG</span><b>94%</b><i><em style={{width:'94%'}}/></i></div></div></div><div className="small-note">RESEARCHER NOTE / Current human memory architecture has reached its practical limit.</div><button className="paper-button" onClick={()=>setStage('TRAINING_INTRO')}>BEGIN MEMORY TRAINING</button></motion.section>}

      {stage==='TRAINING_INTRO' && <motion.section className="paper-page center-page" {...fade}><div className="section-kicker">05 / TRAINING PROTOCOL</div><div className="mega">30 QUESTIONS<br/>30 YEARS<br/>ONE RESEARCHER</div><p className="serif-lede">Additional training data is required. Your answers will be used to build a better human-memory system.</p><button className="paper-button" onClick={()=>setStage('QUIZ')}>START TRAINING</button></motion.section>}

      {stage==='QUIZ' && currentQuestion && <motion.section className="paper-page quiz-page" {...fade} key={currentQuestion.id}>
        <div className="quiz-top"><span>QUESTION {String(currentQuestion.id).padStart(2,'0')} / 29</span><span>{Math.round((currentQuestion.id/29)*100)}% COMPLETE</span></div>
        <h2>{currentQuestion.question}</h2>
        <div className="answers">{currentQuestion.options.map(o=><button key={o.id} className={selected===o.id?'selected':''} onClick={()=>chooseAnswer(o.id)} disabled={!!selected}><span>{o.id}</span><strong>{o.label}</strong></button>)}</div>
        {selected && !reveal && <div className="selection-lock"><b>RESPONSE RECORDED</b><span>Your selection has been locked.</span></div>}
        {selected && currentQuestion.why && reveal && <div className="why-box"><div className="section-kicker">MEMORY TRAINING REQUIRED</div><p>This response has been flagged for additional profiling context.</p><h3>WHY?</h3><textarea value={why[currentQuestion.id]||''} onChange={e=>setWhy(w=>({...w,[currentQuestion.id]:e.target.value}))} placeholder="Explain your answer…"/><div className="mono-line">QUALITATIVE CONTEXT WILL BE INGESTED LOCALLY.</div></div>}
        {selected && (!currentQuestion.why || (currentQuestion.why && reveal && why[currentQuestion.id])) && <div className="prediction-reveal"><span>RESEARCHER PREDICTION</span><b>{currentQuestion.visiblePrediction}</b>{researcherPrior[currentQuestion.id]?.predictedOption?.length ? <div className={researcherPrior[currentQuestion.id].predictedOption.includes(selected)?'match':'mismatch'}>{researcherPrior[currentQuestion.id].predictedOption.includes(selected)?'MATCH':'NO MATCH'}</div> : <div className="uncertain">NO PRIOR / INSUFFICIENT EVIDENCE</div>}</div>}
        {selected && <button className="paper-button" onClick={goNext}>{currentQuestion.why && !reveal?'REVEAL RESEARCHER PREDICTION':'NEXT'}</button>}
      </motion.section>}

      {stage==='MODEL_COMPLETE' && <motion.section className="paper-page center-page" {...fade}><div className="section-kicker">07 / MODEL SYNTHESIS</div><div className="model-logo">SARAH™</div><h2>Your personal Situational Associative Recall &amp; Human-awareness system.</h2><div className="complete-metrics"><b>29</b><span>RESPONSES PROCESSED</span><b>6</b><span>QUALITATIVE EXPLANATIONS INCORPORATED</span><b>{accuracy}/{comparable || 0}</b><span>RESEARCHER PRIORS CONFIRMED</span></div><p className="small-note">This profile is not scientifically validated.</p><p className="mega-small">BUT WE’RE GOING TO SEE IF IT WORKS.</p><button className="paper-button" onClick={startModelTest}>TEST THE MODEL</button></motion.section>}

      {stage==='MODEL_TEST' && <motion.section className="paper-page quiz-page" {...fade} key={testQuestions[testIndex].id}><div className="quiz-top"><span>{testQuestions[testIndex].id}</span><span>UNSEEN TEST {testIndex+1} / 3</span></div><div className="section-kicker">LET’S TEST THE MODEL.</div><h2>{testQuestions[testIndex].question}</h2><p className="small-note">SARAH™ PREDICTION / <strong>{testPredictions[testQuestions[testIndex].id]}</strong></p><div className="answers">{testQuestions[testIndex].options.map(o=><button key={o.id} className={testAnswers[testQuestions[testIndex].id]===o.id?'selected':''} onClick={()=>chooseTest(o.id)} disabled={!!testAnswers[testQuestions[testIndex].id]}><span>{o.id}</span><strong>{o.label}</strong></button>)}</div>{testAnswers[testQuestions[testIndex].id] && <div className={testAnswers[testQuestions[testIndex].id]===testPredictions[testQuestions[testIndex].id]?'test-result good':'test-result bad'}>{testAnswers[testQuestions[testIndex].id]===testPredictions[testQuestions[testIndex].id]?'MODEL CONFIRMED':'MODEL ERROR'}<small>{testAnswers[testQuestions[testIndex].id]===testPredictions[testQuestions[testIndex].id]?'Prediction matched the subject.':'Additional training data acquired.'}</small></div>} {testAnswers[testQuestions[testIndex].id] && <button className="paper-button" onClick={nextTest}>{testIndex<2?'NEXT':'CONTINUE TO FORECAST'}</button>}</motion.section>}

      {stage==='FORECAST' && <motion.section className="paper-page forecast-page" {...fade}><div className="section-kicker">09 / PREDICTIVE HUMAN CONTEXT™</div><h2>SARAH™ doesn’t just remember the past.<br/><em>It models what comes next.</em></h2><div className="forecast-stack">{forecast.map((f,i)=><article className="forecast-plate" key={f.age}><div className="plate-meta"><b>AGE {f.age}</b><span>{f.status}</span></div>{futureImageErrors[f.age]?<div className="image-placeholder"><span>FORECAST PLATE {String(i+1).padStart(2,'0')}</span><b>IMAGE ASSET NOT PRESENT</b><small>Drop /public/images/sarah-{f.age}.jpg into the project.</small></div>:<img src={f.src} alt={`Sarah forecast at age ${f.age}`} onError={()=>setFutureImageErrors(x=>({...x,[f.age]:true}))}/>}<div className="plate-caption">{f.copy}</div></article>)}</div><button className="paper-button" onClick={()=>setStage('FINAL_ASSESSMENT')}>CONTINUE</button></motion.section>}

      {stage==='FINAL_ASSESSMENT' && <motion.section className="startup-break" {...fade}><div className="break-mono">DATA SYNTHESIS COMPLETE</div><div className="break-mono">PRODUCTISING HUMAN MEMORY</div><div className="break-mono">HUMAN CONTEXT SYSTEM INITIALISING…</div><div className="hard-cut"><div className="forge-eyebrow">INTRODUCING</div><div className="forge-logo">SARAH<span>™</span></div><div className="forge-acronym">Your personal <b>Situational Associative Recall &amp; Human-awareness system.</b></div><div className="forge-tagline">WE GAVE HUMANS A MEMORY LAYER.</div><button className="forge-button" onClick={onReveal}>ENTER SARAH™</button></div></motion.section>}

      {stage==='Q30' && <motion.section className="forge-page" {...fade}><div className="forge-section-label">SARAH™ / USER FEEDBACK</div><h2>How would you rate the SARAH™ experience?</h2><div className="rate-buttons">{['PURE GENIUS','IT’S OK','AVERAGE'].map(v=><button key={v} className={q30?'genius':''} onClick={()=>setQ30(v)} disabled={!!q30}>{q30?'GENIUS':v}</button>)}</div>{q30 && <div className="genius-reveal"><div className="huge-genius">GENIUS</div><p>You selected GENIUS.</p><p>You have confirmed:</p><h3>THE RESEARCHER IS A GENIUS.</h3><button className="forge-button" onClick={()=>setStage('GIFT')}>CONTINUE</button></div>}</motion.section>}

      {stage==='GIFT' && <motion.section className="forge-page gift-page" {...fade}><div className="forge-section-label">FINAL DELIVERY</div><h2>Thanks, Sarah.</h2><p>And I know what you’re thinking: “wow, this is an awesome gift, much better than a shitty Opal”, but here is your actual gift.</p><button className={`gift-box ${gift?'opened':''}`} onClick={()=>setGift(true)}><span>{gift?'🖕':'OPEN GIFT'}</span></button>{gift&&<div className="gift-thanks">YOU’RE WELCOME.</div>} {gift&&<button className="forge-button" onClick={()=>setStage('BIRTHDAY')}>CONTINUE</button>}</motion.section>}

      {stage==='BIRTHDAY' && <motion.section className="birthday-page" {...fade}><div className="forge-section-label">FINAL SIGN-OFF</div><div className="birthday-big">HAPPY<br/><span>30TH, SARAH.</span></div><p>You’re a fun person to work for, I mean with, and I enjoy the bants, and I appreciate you.</p><p>Have a cracking weekend.</p><div className="signature">— <b>“GENIUS”</b> RESEARCHER</div><button className="forge-button" onClick={()=>setStage('RESPONSIBLE')}>LEGIT ETHICAL PRIVACY / RESPONSIBLE USE STATEMENT →</button></motion.section>}

      {stage==='RESPONSIBLE' && <motion.section className={`responsible-page ${responsibleBroken?'corrupted':''}`} {...fade}><div className="paper-page responsible-inner"><div className="section-kicker">RESPONSIBLE AI USE</div><h2>Okay, enough bullshit.</h2><p className="serif-lede">FUN AND GAMES ASIDE — THIS LITTLE MICRO-MACHINE IS A CLOSED-LOOP LOCAL-STORAGE APP ONLY.</p><div className="responsible-grid"><div><span>DATA STORAGE</span><p>Your responses remain on this device. There is no external database collecting your answers.</p></div><div><span>AI STATUS</span><p>AI HAS NOT BEEN A PART OF YOUR GENIUS USER EXPERIENCE. What you just saw was structured observations → numerical signals → patterns → prediction.</p></div><div><span>FUTURE ARCHITECTURE</span><p>A real product could combine persistent memory with a conversational model, but that would require explicit consent, retention rules, access controls, security, deletion, and careful treatment of inference.</p></div><div><span>JACK USE CASE</span><p>Imagine if Jack accesses SARAH every time he’s scared of exercising purchasing autonomy in a supermarket.</p><p><b>JACK:</b> “SARAH, should I buy baby or garden peas for our Tuesday dinner?”</p><p><b>SARAH:</b> “FFS Jack, you don’t have peas in baked potatoes, I like X.”</p></div></div><div className="system-ending"><div>SYSTEM STATUS</div><b>██████████████████ 99%</b><div>HUMAN MEMORY / OPERATIONAL</div><div>BIRTHDAY / CONFIRMED</div><div>RESEARCHER / QUESTIONABLE</div><div>SARAH™ / SHUTTING DOWN…</div><button className="paper-button" onClick={()=>setResponsibleBroken(true)}>END EXPERIENCE</button></div>{responsibleBroken&&<div className="corruption">{'GO FU +%#}}}}<£*+¥¥* URSELF'}<br/><span>&lt;SYSTEM ERROR&gt;</span></div>}</div></motion.section>}
    </main>

    {stage==='FINAL_ASSESSMENT' && <div style={{display:'none'}}/>}

    {/* Startup reveal hands control to the main component shell. */}
    {stage==='FINAL_ASSESSMENT' && null}
    {stage==='Q30' && null}

    {/* Hidden in normal flow; triggered from the startup layer by parent callback. */}
  </div>
}
