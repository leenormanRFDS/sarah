'use client';
import { useEffect, useState } from 'react';
import ResearchPhase from './ResearchPhase';
import SarahStartup from './SarahStartup';

type AppStage='RESEARCH'|'STARTUP'|'Q30'|'GIFT'|'BIRTHDAY'|'RESPONSIBLE';

export default function Experience(){
  const [stage,setStage]=useState<AppStage>('RESEARCH');
  const [ready,setReady]=useState(false);
  useEffect(()=>{setReady(true)},[]);
  if(!ready)return <div className="boot">LOADING ARCHIVE…</div>;
  if(stage==='STARTUP') return <SarahStartup onContinue={()=>setStage('Q30')}/>;
  // The research phase internally handles the full experiment up to the reveal. We use an event bridge via a callback.
  if(stage==='RESEARCH') return <ResearchPhase onReveal={()=>setStage('STARTUP')}/>;
  return <PostStartup stage={stage} setStage={setStage}/>;
}

function PostStartup({stage,setStage}:{stage:AppStage;setStage:(x:AppStage)=>void}){
  const [q30,setQ30]=useState<string|null>(null);
  const [gift,setGift]=useState(false);
  const [broken,setBroken]=useState(false);
  if(stage==='Q30') return <section className="forge-page"><div className="forge-section-label">SARAH™ / USER FEEDBACK</div><h1>HOW WOULD YOU RATE THE SARAH™ EXPERIENCE?</h1><div className="rate-buttons">{['PURE GENIUS','IT’S OK','AVERAGE'].map(v=><button key={v} className={q30?'genius':''} onClick={()=>setQ30(v)}>{q30?'GENIUS':v}</button>)}</div>{q30&&<div className="genius-reveal"><div className="huge-genius">GENIUS</div><p>You selected GENIUS.</p><p>You have confirmed:</p><h2>THE RESEARCHER IS A GENIUS.</h2><button className="forge-button" onClick={()=>setStage('GIFT')}>CONTINUE</button></div>}</section>;
  if(stage==='GIFT') return <section className="forge-page gift-page"><div className="forge-section-label">FINAL DELIVERY</div><h1>THANKS, SARAH.</h1><p>And I know what you’re thinking: “wow, this is an awesome gift, much better than a shitty Opal”, but here is your actual gift.</p><button className={`gift-box ${gift?'opened':''}`} onClick={()=>setGift(true)}><span>{gift?'🖕':'OPEN GIFT'}</span></button>{gift&&<><div className="gift-thanks">YOU’RE WELCOME.</div><button className="forge-button" onClick={()=>setStage('BIRTHDAY')}>CONTINUE</button></>}</section>;
  if(stage==='BIRTHDAY') return <section className="birthday-page"><div className="forge-section-label">FINAL SIGN-OFF</div><div className="birthday-big">HAPPY<br/><span>30TH, SARAH.</span></div><p>You’re a fun person to work for, I mean with, and I enjoy the bants, and I appreciate you.</p><p>Have a cracking weekend.</p><div className="signature">— <b>“GENIUS”</b> RESEARCHER</div><button className="forge-button" onClick={()=>setStage('RESPONSIBLE')}>LEGIT ETHICAL PRIVACY / RESPONSIBLE USE STATEMENT →</button></section>;
  return <section className={`responsible-page ${broken?'corrupted':''}`}><div className="paper-page responsible-inner"><div className="section-kicker">RESPONSIBLE AI USE</div><h1>Okay, enough bullshit.</h1><p className="serif-lede">FUN AND GAMES ASIDE — THIS LITTLE MICRO-MACHINE IS A CLOSED-LOOP LOCAL-STORAGE APP ONLY.</p><div className="responsible-grid"><div><span>DATA STORAGE</span><p>Your responses remain on this device. There is no external database collecting your answers.</p></div><div><span>AI STATUS</span><p>AI HAS NOT BEEN A PART OF YOUR GENIUS USER EXPERIENCE. What you just saw was structured observations → numerical signals → patterns → prediction.</p></div><div><span>FUTURE ARCHITECTURE</span><p>A real product could combine persistent memory with a conversational model, but that would require explicit consent, retention rules, access controls, security, deletion, and careful treatment of inference.</p></div><div><span>JACK USE CASE</span><p>Imagine if Jack accesses SARAH every time he’s scared in exercising purchasing autonomy in a supermarket.</p><p><b>JACK:</b> “SARAH, should I buy baby or garden peas for our Tuesday dinner?”</p><p><b>SARAH:</b> “FFS Jack, you don’t have peas in baked potatoes, I like X.”</p></div></div><div className="system-ending"><div>SYSTEM STATUS</div><b>██████████████████ 99%</b><div>HUMAN MEMORY / OPERATIONAL</div><div>BIRTHDAY / CONFIRMED</div><div>RESEARCHER / QUESTIONABLE</div><div>SARAH™ / SHUTTING DOWN…</div><button className="paper-button" onClick={()=>setBroken(true)}>END EXPERIENCE</button></div>{broken&&<div className="corruption">{'GO FU +%#}}}}<£*+¥¥* URSELF'}<br/><span>&lt;SYSTEM ERROR&gt;</span></div>}</div></section>
}
