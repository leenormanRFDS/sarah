'use client';
import { motion } from 'framer-motion';

export default function SarahStartup({onContinue}:{onContinue:()=>void}){
  return <motion.div className="startup-overlay" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.45}}>
    <div className="forge-noise"/>
    <div className="startup-inner">
      <div className="forge-section-label">SYSTEM REVEAL / PRODUCT LAYER</div>
      <div className="startup-display">WE GAVE HUMANS<br/><em>A MEMORY LAYER.</em></div>
      <div className="startup-wordmark">SARAH<span>™</span></div>
      <p className="startup-acronym">Your personal <b>Situational Associative Recall &amp; Human-awareness system.</b></p>
      <p className="startup-sub">Built from 172 days of research. Trained on 29 responses. Ready for deployment.</p>
      <div className="startup-architecture">
        <div><small>INPUT</small><b>HUMAN CONTEXT</b></div><i>→</i><div><small>PROCESSING</small><b>ASSOCIATIVE RECALL</b></div><i>→</i><div><small>OUTPUT</small><b>LESS AWKWARDNESS</b></div>
      </div>
      <div className="startup-chips"><span>NAME RECALL™</span><span>CONVERSATION HISTORY™</span><span>AWKWARDNESS PREVENTION™</span><span>CORRIDOR RECOGNITION™</span></div>
      <button className="forge-button huge" onClick={onContinue}>MEET SARAH™</button>
    </div>
  </motion.div>
}
