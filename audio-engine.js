/* RUU//OVERRUN v1.37.0 — SIGNAL EDGE / DISCHARGE & CUT
   Original procedural one-shot SFX. No audio downloads, no external libraries.
   Audio randomness is independent of combat RNG. Cached, bounded stereo playback. */
(()=>{
'use strict';
const M=Math;
const KEY='RUU_AUDIO_MIX_V1', RATE=24000, TAU=2*M.PI, LIMIT=24, ROUTINE=16;
const clamp=(n,a,b)=>M.max(a,M.min(b,n));
const finite=(n,d)=>Number.isFinite(n)?n:d;
const levels={bgm:.8,sfx:.8};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved)for(const k of ['bgm','sfx'])levels[k]=clamp(finite(saved[k],levels[k]),0,1);}catch{}
function volume(k){return levels[k]??.8;}
function setVolume(k,n){if(!Object.hasOwn(levels,k)||!Number.isFinite(n))return false;levels[k]=clamp(n,0,1);try{localStorage.setItem(KEY,JSON.stringify(levels));}catch{}return true;}
// e: electrical emission, s: noise-band cut, c: charging field,
// n: air/static detail, m: very short metal trace. No low resonant impact layer.
const E=(f,end,d,a,at=0,color=.48)=>({k:'e',f,end,d,a,at,color,attack:.0013});
const S=(f,end,d,a,at=0,color=.6)=>({k:'s',f,end,d,a,at,color,attack:.002});
const C=(f,end,d,a,at=0,color=.4)=>({k:'c',f,end,d,a,at,color,attack:.006});
const N=(lo,hi,d,a,at=0,attack=.0015)=>({k:'n',lo,hi,d,a,at,attack});
const MTrace=(f,d,a,at=0)=>({k:'m',f,end:f*.91,d,a,at,color:.25,attack:.0008});
const arc=(f=1800,d=.13,a=.8,at=0)=>[
 E(f*1.24,f*.62,d,a*.73,at,.48),S(4600,1050,d*.78,a*.52,at+.003),N(1400,5300,.024,a*.17,at)
];
const cut=(f=2600,d=.12,a=.8,at=0)=>[
 S(f*1.35,760,d,a*.83,at,.85),E(f,980,d*.6,a*.31,at+.006,.31),MTrace(3100,.036,a*.14,at+.009)
];
const release=(f=1900,d=.24,a=.9,at=0)=>[
 E(f*1.42,f*.68,d,a*.64,at,.65),S(5400,850,d*.87,a*.76,at+.003,.72),
 N(800,4800,d*.56,a*.23,at+.011),MTrace(2800,.043,a*.15,at+.005)
];
const signal=(f=1200,d=.075,a=.5,at=0)=>[E(f,f*1.37,d,a,at,.18),N(2300,4700,.016,a*.1,at)];
const specs=Object.create(null);
function add(key,p,g,tail,layers,jitter=.025,drive=1.05){specs[key]={p,g,tail,layers,jitter,drive};}
// Frequent actions are short discharges and cuts. Their force comes from the
// spectral edge, rather than a kick-like pitch drop into a bass resonance.
add('shoot',0,.37,.022,[E(2450,1050,.088,.86,0,.42),S(3900,1350,.064,.42,.004),N(1800,5200,.016,.13)],.035,1.08);
add('hit',0,.32,.018,[S(4300,1250,.072,.92,0,.8),MTrace(2300,.036,.24),E(1380,1060,.041,.14,.006,.22)],.04,1.05);
add('kill',0,.43,.036,[...cut(2850,.135,.84),S(1700,3800,.085,.31,.032,.7),N(900,4300,.074,.22,.04)],.035,1.08);
add('gem',0,.12,.015,[E(1750,2450,.035,.6,0,.12),N(3000,5700,.014,.11)],.018,.9);
add('dash',1,.43,.038,[S(900,4600,.14,.71,0,.45),S(5300,1500,.12,.64,.047,.62),E(1850,940,.07,.20,.025,.18)],.02,1.0);
add('hurt',3,.57,.045,[E(1320,770,.13,.63,0,.72),S(5100,1050,.115,.85),N(950,3600,.11,.38,.015)],.015,1.1);
add('shield',2,.41,.035,[S(1700,4200,.105,.7,0,.55),MTrace(1550,.056,.25,.012),E(1480,2350,.077,.37,.005,.26)],.025,1.0);
// Existing low-health event name; the new cue is one broken electrical warning.
add('heartbeat',2,.25,.018,[E(1170,1570,.085,.45,0,.28),N(1400,3800,.024,.31,.055),S(2600,1250,.042,.32,.073)],0,.95);
// Weapon families: current arcs, expanding fields, interference, crystal cuts,
// ignition, sustained beams and ruptures each have their own movement.
add('bolt',1,.47,.035,[E(3100,980,.103,.8,0,.71),N(1700,6300,.047,.36),S(4700,1700,.071,.39,.023)],.027,1.08);
add('nova',1,.52,.065,[C(950,2400,.09,.37,0,.27),S(950,5200,.19,.76,.073,.45),E(2200,920,.175,.55,.081,.65),N(800,4500,.13,.28,.095)],.02,1.1);
add('sonic',1,.45,.04,[S(4200,680,.18,.84,0,.52),S(1300,3800,.135,.32,.018,.4),E(1100,1780,.10,.22,.032,.32)],.02,1.0);
add('prism',1,.43,.055,[E(1800,3200,.075,.40),E(2950,1350,.09,.53,.041,.3),MTrace(3400,.049,.24,.064),S(4200,1800,.103,.42,.038)],.02,.98);
add('shard',1,.35,.027,[...cut(3400,.075,.72),MTrace(3900,.028,.29,.021)],.03,1.0);
add('meteor',1,.56,.065,[C(800,2100,.15,.45,0,.46),S(1400,5300,.16,.4,0,.35),...release(1600,.22,.87,.134)],.018,1.1);
add('rail',1,.58,.055,[C(1000,3300,.112,.46,0,.32),E(3750,1320,.19,.92,.113,.43),S(5700,1100,.165,.72,.114,.8),N(1900,6100,.029,.22,.114)],.015,1.08);
add('frost',1,.37,.042,[S(4300,1600,.085,.68,0,.85),MTrace(3150,.05,.25),MTrace(4100,.029,.18,.032),E(2250,3350,.052,.2,.025,.24)],.025,.95);
add('well',1,.46,.055,[C(1650,760,.18,.46,0,.7),S(3800,800,.26,.73,.035,.55),E(1450,780,.17,.32,.128,.65),N(750,3000,.13,.21,.22)],.015,1.05);
add('missile',1,.39,.028,[S(950,4600,.105,.73,0,.45),E(920,2400,.081,.45,.008,.3),N(1800,4900,.042,.18,.025)],.025,1.0);
add('explosion',1,.56,.065,[S(5500,780,.22,.92,0,.65),E(1750,720,.14,.42,.004,.76),N(800,3900,.15,.39,.018),MTrace(2400,.042,.15,.023)],.025,1.12);
add('satellite',1,.52,.055,[C(1350,3400,.12,.37),E(3250,1100,.17,.72,.117,.46),S(5200,1600,.18,.64,.12)],.015,1.06);
add('rift',1,.48,.04,[S(5200,850,.165,.86,0,.8),E(1650,820,.12,.46,.01,.78),S(1200,3900,.095,.29,.06,.5)],.025,1.08);
add('fireworks',1,.44,.05,[C(1100,2600,.075,.29),...arc(2400,.11,.62,.071),MTrace(3600,.04,.27,.126),S(5300,2200,.063,.35,.142)],.025,1.0);
add('cross',1,.49,.045,[...cut(2800,.13,.76),S(1100,4300,.14,.54,.028,.8),E(1950,910,.115,.29,.025,.45)],.02,1.04);
add('ultimatePulse',1,.42,.027,[E(2150,970,.085,.71,0,.55),S(4200,1150,.08,.49,.003),N(1700,4900,.018,.17)],.02,1.04);
add('elite',2,.47,.07,[C(850,2700,.17,.41,0,.55),...release(1600,.22,.73,.147)],0,1.05);
add('drive',2,.51,.065,[C(850,3200,.22,.56,0,.4),E(2100,3300,.13,.32,.145,.26),...arc(2600,.12,.47,.229)],0,1.0);
add('chest',2,.39,.045,[MTrace(1650,.045,.3),...signal(1300,.063,.41,.025),...signal(1980,.075,.31,.101)],0,.95);
add('combo',2,.27,.026,[E(1200,2250,.069,.55,0,.22),S(3400,1700,.042,.22,.019)],.015,.95);
add('comboBig',2,.42,.047,[C(1200,2800,.12,.42,0,.22),...arc(2550,.115,.51,.11),MTrace(3700,.036,.16,.155)],0,.97);
add('reroll',1,.25,.021,[E(2200,1050,.044,.43,0,.6),S(1600,3900,.057,.51,.035,.75)],.015,1.0);
add('rare',2,.4,.065,[...signal(1430,.085,.45),E(2450,3100,.11,.25,.075,.16),S(4200,2200,.075,.16,.084)],0,.95);
add('mythic',3,.55,.085,[C(920,3200,.21,.4,0,.28),E(2550,3900,.13,.26,.12,.25),...release(2600,.20,.63,.219),MTrace(4000,.056,.2,.26)],0,1.0);
add('select',1,.24,.015,[...signal(1270,.044,.54),S(3100,1800,.028,.19,.013)],.012,.92);
add('menu',1,.19,.015,[E(1180,1680,.034,.41,0,.14),N(2100,4700,.018,.20)],.012,.92);
add('start',2,.48,.057,[C(950,2450,.14,.44,0,.26),...arc(2550,.13,.61,.141),E(2300,3500,.06,.19,.205,.17)],0,1.0);
add('levelup',3,.52,.069,[C(1050,2600,.15,.47,0,.23),E(1800,2900,.11,.4,.12,.17),...arc(2950,.12,.46,.212)],0,.98);
add('evolve',3,.57,.08,[C(750,3600,.27,.58,0,.4),S(1300,5200,.2,.37,.06,.4),...release(2600,.225,.76,.271)],0,1.05);
add('styleUnlock',3,.46,.075,[C(1400,3000,.17,.37,0,.18),E(2400,3700,.14,.31,.128,.12),MTrace(3500,.05,.2,.17),...signal(1950,.09,.25,.25)],0,.93);
add('pilotArrival',2,.45,.06,[E(1030,1870,.08,.33,0,.26),C(1400,2850,.14,.36,.079,.24),...arc(2200,.12,.49,.212)],0,.98);
add('pilotElio',1,.30,.041,[S(1150,2800,.12,.49,0,.4),E(1580,2250,.098,.35,.009,.19)],.015,.95);
add('pilotOz',1,.43,.035,[...cut(3300,.105,.75),E(2700,960,.099,.36,.021,.7)],.025,1.06);
add('pilotKai',1,.37,.029,[0,.058,.109].flatMap((at,i)=>[E(2200+i*230,1140,.058,.46,at,.48),S(4300,1650,.051,.28,at+.003)]),.02,1.02);
add('pilotSera',1,.30,.052,[C(1050,2750,.14,.38,0,.18),E(2750,1700,.09,.27,.111,.16),N(2200,4600,.067,.13,.09)],.015,.94);
add('pilotMina',1,.29,.04,[E(2100,3200,.061,.34,0,.35),S(4400,1600,.081,.45,.035,.7)],.02,.98);
// Threat cues use moving electrical fields and tears, never low paired beats.
add('boss',3,.59,.085,[C(760,2200,.25,.49,0,.65),S(4100,900,.29,.53,.06,.65),...release(1450,.29,.8,.28)],0,1.08);
add('devora',3,.60,.09,[C(2100,750,.22,.38,0,.8),S(1250,3900,.28,.56,.03,.48),E(1950,780,.32,.49,.24,.85),S(5300,820,.3,.72,.265,.75)],0,1.12);
add('nullEmperor',3,.63,.10,[C(740,3400,.37,.47,0,.7),S(3000,1000,.27,.38,.11,.5),...release(2000,.34,.85,.38),E(1650,2950,.17,.27,.48,.5)],0,1.1);
add('trueTrinity',3,.61,.085,[C(850,2400,.27,.40,0,.52),...[.18,.265,.35].flatMap((at,i)=>[S(4800-i*430,1100,.12,.42,at,.78),E(2450-i*310,1250,.11,.28,at,.5)]),...release(1800,.24,.66,.45)],0,1.07);
add('trueQuintet',3,.64,.095,[C(780,3100,.34,.49,0,.72),...[.15,.205,.26,.315,.37].flatMap((at,i)=>[E(2900-i*240,1200,.083,.35,at,.68),S(5100-i*330,1700,.071,.28,at,.65)]),...release(1650,.28,.83,.46)],0,1.12);
add('eclipse',3,.61,.09,[C(2600,800,.30,.42,0,.64),S(980,4800,.28,.52,.12,.65),E(1950,780,.21,.29,.23,.8),...cut(3300,.24,.81,.41)],0,1.07);
add('eclipseReinforce',3,.56,.06,[S(4300,900,.14,.46),S(1500,4200,.14,.41,.103,.7),...release(2100,.2,.66,.226)],0,1.05);
add('eclipsePhase',3,.56,.06,[C(950,3400,.19,.47,0,.58),...cut(3500,.2,.78,.193)],0,1.03);
add('eclipseLast',3,.64,.095,[C(2300,760,.23,.48,0,.78),S(1300,5300,.25,.47,.115,.6),...release(1550,.29,.89,.337),S(4700,1000,.13,.29,.48,.8)],0,1.12);
add('astraea',3,.57,.08,[C(950,3600,.26,.49,0,.28),E(3400,1200,.24,.75,.263,.37),S(5700,1600,.22,.55,.265,.7)],0,1.03);
add('bossPhase3',3,.59,.075,[C(760,3300,.23,.54,0,.65),S(1400,5000,.2,.36,.05),...release(1700,.23,.81,.237)],0,1.09);
add('bossDown',2,.55,.065,[S(5300,830,.23,.84,0,.8),E(2400,950,.16,.44,.015,.66),S(3700,1400,.13,.31,.12,.6)],.01,1.08);
add('bossBreak',3,.63,.085,[E(3100,900,.20,.63,0,.81),S(5900,780,.30,.95,.009,.75),N(950,4600,.17,.36,.045),MTrace(2700,.049,.2,.08)],0,1.12);
add('victory',3,.52,.085,[C(1100,2900,.21,.43,0,.18),E(1700,3100,.17,.38,.16,.16),...signal(2600,.11,.32,.36),S(4500,2200,.13,.18,.35)],0,.95);
add('defeat',3,.43,.07,[E(2700,1550,.15,.43,0,.4),S(3900,750,.24,.51,.103,.65),E(1400,770,.11,.23,.267,.5)],0,1.0);
add('death',3,.59,.09,[S(1200,5100,.11,.39),E(2600,870,.26,.62,.08,.8),S(5500,750,.32,.83,.087,.8),N(850,3800,.12,.31,.29),E(1900,940,.089,.18,.39,.62)],0,1.1);
add('deathEcho',3,.30,.095,[S(3900,1000,.19,.53,0,.52),E(1550,810,.20,.25,.019,.42),N(1300,3800,.13,.21,.055)],0,.96);
add('jackpotDuo',3,.61,.08,[C(1100,3000,.19,.40,0,.3),E(2850,1200,.16,.51,.19,.35),E(1550,3000,.15,.35,.235,.32),...cut(3100,.16,.57,.365)],0,1.03);
add('jackpotWhite',3,.57,.08,[C(1600,3900,.23,.39,0,.15),E(3250,1800,.17,.43,.229,.18),S(4900,2300,.18,.32,.22,.45),MTrace(3900,.055,.17,.28)],0,.95);
add('jackpotBlack',3,.65,.09,[C(2400,800,.21,.46,0,.73),S(1100,4700,.20,.43,.08,.7),...release(1550,.28,.89,.287),S(4100,950,.13,.32,.39,.8)],0,1.12);
// Nine energy gestures: beam, precision cut, cascade, erasure, helix, crossing
// shear, segmented cut, broken signal and three claw arcs. No bass-strike motif.
const finishers=[
 [C(950,3500,.17,.48,0,.32),E(3700,1250,.24,.82,.175,.4),S(5700,1300,.22,.68,.176,.75),S(1700,4200,.12,.22,.24)],
 [C(1300,3000,.19,.37,0,.25),MTrace(3800,.04,.24,.188),...cut(3500,.23,.93,.197),E(2600,1650,.10,.25,.27,.22)],
 [C(1050,3300,.18,.34,0,.45),...[.09,.145,.19].flatMap((at,i)=>arc(2300+i*280,.075,.36,at)),...release(2400,.24,.85,.278)],
 [C(2300,780,.22,.50,0,.68),S(3100,900,.20,.40,0,.5),...release(1500,.29,.91,.252),S(4600,850,.16,.32,.35,.78)],
 [C(950,4000,.27,.45,0,.25),S(1300,5200,.24,.43,.018,.55),E(3750,1250,.23,.70,.274,.46),S(5500,1700,.17,.47,.294,.8)],
 [C(1000,2700,.23,.45,0,.58),S(1700,4300,.19,.37,.04,.64),S(5300,760,.25,.9,.241,.83),E(2200,870,.18,.57,.247,.72),S(1100,3800,.12,.30,.32,.7)],
 [...[0,.077,.143,.194].flatMap((at,i)=>[S(4500-i*420,1200,.055,.43,at,.8),E(1600+i*260,1150,.051,.22,at,.4)]),C(1050,3100,.15,.28,.14,.4),...cut(3400,.22,.91,.305)],
 [...[0,.039,.124,.201].flatMap((at,i)=>[E([2800,1400,3350,1900][i],1100,.039,.41,at,.74),S(4900,1900,.025,.18,at,.75)]),C(1700,3500,.115,.27,.18,.6),...release(2200,.25,.88,.312)],
 [C(1000,2900,.17,.43,0,.33),...[.177,.255,.339].flatMap((at,i)=>[S(5700-i*500,850,.12,.66,at,.85),E(2750-i*260,1120,.07,.29,at+.004,.35)]),S(1600,4500,.13,.26,.36,.52)]
];
finishers.forEach((layers,i)=>add('finisher'+i,3,.61,[.06,.065,.06,.08,.075,.07,.055,.065,.06][i],layers,0,1.06));
function resolve(name,opt={}){
 if(opt.cue&&Object.hasOwn(specs,opt.cue))return opt.cue;
 if(name==='jackpot')return ['jackpotDuo','jackpotWhite','jackpotBlack'][clamp(M.floor(finite(opt.jackpotType,0)),0,2)];
 if(name==='signature')return 'finisher'+clamp(M.floor(finite(opt.finisherType,0)),0,8);
 return Object.hasOwn(specs,name)?name:null;
}
function seedFor(s){let n=2166136261;for(const c of s)n=M.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
let randomState=0x6c31e2d5;
function random(){randomState=(M.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;}
// Direct-form biquads keep nonlinear difference frequencies and air hiss out
// of the finished sample. Filters run only while a sample is being cached.
function filter(kind,f,q){
 const w=TAU*f/RATE,c=M.cos(w),alpha=M.sin(w)/(2*q),a0=1+alpha;
 const high=kind==='high',b0=(high?1+c:1-c)*.5;
 return {b0:b0/a0,b1:(high?-(1+c):1-c)/a0,b2:b0/a0,a1:-2*c/a0,a2:(1-alpha)/a0,z1:0,z2:0};
}
function filtered(f,x){const y=f.b0*x+f.z1;f.z1=f.b1*x-f.a1*y+f.z2;f.z2=f.b2*x-f.a2*y;return y;}
function* buildSteps(ac,key){
 const spec=specs[key],duration=M.max(...spec.layers.map(l=>l.at+l.d)),dry=new Float32Array(M.ceil(duration*RATE)+1);
 for(const [index,l] of spec.layers.entries()){
  const offset=M.round(l.at*RATE),len=M.min(dry.length-offset,M.ceil(l.d*RATE));
  let phase=0,mod=0,phase2=0,lo=0,hi=0,seed=seedFor(key+index),f=l.f||0;
  let band1=0,band2=0,n1=0,n2=0,b0=0,b2=0,a1=0,a2=0;
  const cLo=1-M.exp(-TAU*(l.lo||700)/RATE),cHi=1-M.exp(-TAU*(l.hi||5800)/RATE);
  const sweep=l.f?M.pow(l.end/l.f,1/M.max(1,len-1)):1;
  for(let i=0;i<len;i++){
   const u=i/M.max(1,len-1),t=i/RATE,edge=M.min(1,t/l.attack);
   seed=(M.imul(seed,1664525)+1013904223)>>>0;
   const noise=seed/2147483648-1;hi+=cHi*(noise-hi);lo+=cLo*(noise-lo);const air=(hi-lo)*1.65;
   // All pitched fields move continuously; none settles into a low oscillator.
   const env=l.k==='c'?M.pow(M.sin(u*M.PI*.5),1.5)*M.min(1,(l.d-t)/.004):
    l.k==='s'?edge*M.pow(1-u,1.1)*M.exp(-u*1.7):
    l.k==='m'?edge*M.pow(1-u,1.2)*M.exp(-u*7):
    edge*M.pow(1-u,1.1)*M.exp(-u*(l.k==='n'?3.2:2.8));
   let x;
   if(l.k==='n')x=air;
   else if(l.k==='s'){
    // Broad moving bandpass produces a cut rather than a pitched resonator.
    if((i&31)===0){const w=TAU*f/RATE,alpha=M.sin(w)/(2*(.65+l.color*.5)),a0=1+alpha;b0=alpha/a0;b2=-b0;a1=-2*M.cos(w)/a0;a2=(1-alpha)/a0;}
    x=b0*noise+b2*n2-a1*band1-a2*band2;n2=n1;n1=noise;band2=band1;band1=x;x*=2.4;f*=sweep;
   }else{
    phase+=TAU*f/RATE;mod+=TAU*f*1.73/RATE;phase2+=TAU*f*1.307/RATE;f*=sweep;
    if(l.k==='m')x=.35*M.sin(phase)+.25*M.sin(phase2)+air*.55;
    else{
     const grit=l.color,field=M.sin(phase+M.sin(mod)*grit*1.65+air*grit*.34);
     x=field*(l.k==='c'?.39:.58)+M.sin(phase2+air*.2)*.12+air*(l.k==='c'?.52:.35);
    }
   }
   dry[offset+i]+=x*env*l.a;
   if((i&511)===511)yield;
  }
  yield;
 }
 const cutoff=spec.p<2?520:440,hp1=filter('high',cutoff,.5411961),hp2=filter('high',cutoff,1.306563),lp=filter('low',6200,.7071);
 let low=0;
 const reflection=new Float32Array(dry.length),lowCoef=1-M.exp(-TAU*1700/RATE);
 for(let i=0;i<dry.length;i++){
  // High-pass AFTER saturation: distortion cannot reintroduce a bass drum body.
  const v=filtered(lp,filtered(hp2,filtered(hp1,M.tanh(dry[i]*spec.drive))));
  dry[i]=v*M.min(1,i/(RATE*.0008),(dry.length-1-i)/(RATE*.004));
  low+=lowCoef*(dry[i]-low);reflection[i]=dry[i]-low;
  if((i&511)===511)yield;
 }
 yield;
 const frames=dry.length+M.ceil(spec.tail*RATE),buffer=ac.createBuffer(2,frames,RATE);
 const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
 const taps=[[.009,.045,.016],[.017,.014,.043],[.031,.029,.012],[.049,.01,.025],[.073,.01,.006]].filter(t=>t[0]<spec.tail);
 const delays=taps.map(([d,l,r])=>[M.round(d*RATE),l,r]);let peak=0;
 for(let i=0;i<frames;i++){
  const v=i<dry.length?dry[i]:0;let l=v,r=v;
  for(const [d,a,b] of delays){const j=i-d;if(j>=0&&j<dry.length){l+=reflection[j]*a;r+=reflection[j]*b;}}
  const fade=M.min(1,(frames-1-i)/M.round(.004*RATE));
  left[i]=l*fade;right[i]=r*fade;peak=M.max(peak,M.abs(left[i]),M.abs(right[i]));
  if((i&511)===511)yield;
 }
 yield;
 const gain=.82/M.max(.1,peak);
 for(let i=0;i<frames;i++){left[i]*=gain;right[i]*=gain;if((i&511)===511)yield;}
 return buffer;
}
const engines=new WeakMap();
function bank(engine){
 let b=engines.get(engine);if(!b){b={cache:new Map(),building:new Map(),voices:new Set(),peakVoices:0,dropped:0,warm:false,muted:false};engines.set(engine,b);}return b;
}
function sample(engine,key){
 const b=bank(engine);
 if(!b.cache.has(key)){
  const task=b.building.get(key)||buildSteps(engine.ac,key);
  try{let step;do{step=task.next();}while(!step.done);b.cache.set(key,step.value);}
  finally{b.building.delete(key);}
 }
 return b.cache.get(key);
}
function remove(b,v,stop=false){
 if(!b.voices.delete(v))return;
 if(stop)try{v.src.stop();}catch{}
 for(const n of v.nodes)try{n.disconnect();}catch{}
}
function stopAll(engine){if(!engine)return;const b=engines.get(engine);if(b)for(const v of [...b.voices])remove(b,v,true);}
function masterGain(on=true){return on ? .58*volume('sfx'):0;}
function syncMaster(engine,on=true){
 if(!engine?.gain?.gain)return;bank(engine).muted=!on;const p=engine.gain.gain,v=masterGain(on);
 try{p.cancelScheduledValues(engine.ac.currentTime);p.setTargetAtTime(v,engine.ac.currentTime,.015);}catch{try{p.value=v;}catch{}}
 if(!on||v===0)stopAll(engine);
}
function play(name,engine,opt={}){
 const key=resolve(name,opt);if(!key||!engine?.ac||!engine.gain||engine.ac.state!=='running')return false;
 if(volume('sfx')===0)return true;
 const spec=specs[key],b=bank(engine),ac=engine.ac;
 if(b.muted)return true;
 // Keep slots free for boss warnings, danger, and milestone rewards.
 if(spec.p<2&&b.voices.size>=ROUTINE){b.dropped++;return true;}
 if(b.voices.size>=LIMIT){
  let victim=null;for(const v of b.voices)if(v.priority<spec.p&&(!victim||v.priority<victim.priority))victim=v;
  if(victim)remove(b,victim,true);else{b.dropped++;return true;}
 }
 let voice=null;
 try{
  const src=ac.createBufferSource(),amp=ac.createGain();
  voice={src,nodes:[src,amp],priority:spec.p};src.buffer=sample(engine,key);
  src.playbackRate.value=1+(random()*2-1)*spec.jitter;
  const distance=clamp(finite(opt.distance,0),0,1800),position=clamp(finite(opt.pan,0),-.85,.85);
  const attenuation=spec.p>=2?1:1/(1+distance/1400);
  amp.gain.value=spec.g*attenuation*(spec.jitter?(.93+.10*random()):1);
  src.connect(amp);
  if(typeof ac.createStereoPanner==='function'){const pan=ac.createStereoPanner();pan.pan.value=position;voice.nodes.push(pan);amp.connect(pan);pan.connect(engine.gain);}else amp.connect(engine.gain);
  b.voices.add(voice);b.peakVoices=M.max(b.peakVoices,b.voices.size);
  src.onended=()=>remove(b,voice);src.start();return true;
 }catch(e){if(voice){if(b.voices.has(voice))remove(b,voice,true);else for(const n of voice.nodes)try{n.disconnect();}catch{}}return false;}
}
function prime(engine){
 if(!engine?.ac)return;const b=bank(engine);if(b.warm)return;b.warm=true;
 const first=['shoot','hit','kill','gem','dash','select','menu','hurt','levelup','start','shield'];
 const queue=[...first,...Object.keys(specs).filter(k=>!first.includes(k))];
 let key=null;
 const clock=typeof performance!=='undefined'&&typeof performance.now==='function'?()=>performance.now():()=>Date.now();
 const schedule=fn=>typeof requestIdleCallback==='function'?requestIdleCallback(fn,{timeout:600}):typeof setTimeout==='function'?setTimeout(fn,16):null;
 function next(deadline){
  if(engine.ac.state==='closed'){b.building.clear();queue.length=0;key=null;return;}
  const begin=clock();let chunks=0;
  // Each iterator step covers at most 512 samples (or one short layer). Leave
  // room for rendering; a timed-out callback still advances just one tiny step.
  while(key||queue.length){
   if(chunks&&(clock()-begin>=3||chunks>=64))break;
   if(typeof deadline?.timeRemaining==='function'&&deadline.timeRemaining()<1&&(!deadline.didTimeout||chunks))break;
   if(!key)key=queue.shift();
   // Immediate playback may have completed this same iterator between callbacks.
   if(b.cache.has(key)){b.building.delete(key);key=null;continue;}
   let task=b.building.get(key);
   if(!task){task=buildSteps(engine.ac,key);b.building.set(key,task);}
   try{
    const step=task.next();chunks++;
    if(step.done){if(!b.cache.has(key))b.cache.set(key,step.value);b.building.delete(key);key=null;}
   }catch{b.building.delete(key);key=null;chunks++;}
  }
  if(key||queue.length)schedule(next);
 }
 schedule(next);
}
function stats(engine){const b=engines.get(engine);return {active:b?.voices.size||0,peak:b?.peakVoices||0,cache:b?.cache.size||0,dropped:b?.dropped||0};}
function settingsMarkup(){
 return '<div class="kv-audio-grid">'+['bgm','sfx'].map(k=>'<label class="kv-setting kv-volume"><span>'+ (k==='bgm'?'BGM VOLUME / 楽曲音量':'SFX VOLUME / 効果音量')+' <output id="mix-'+k+'-value">'+M.round(volume(k)*100)+'%</output></span><input type="range" min="0" max="100" step="1" value="'+M.round(volume(k)*100)+'" data-audio-volume="'+k+'" aria-label="'+(k==='bgm'?'BGM音量':'効果音音量')+'"></label>').join('')+'<button type="button" class="kv-button" id="audioPreview"><span>♫ SFX PREVIEW</span><small>効果音の試聴</small></button><p class="kv-detail">BGM・SFXのON/OFFとは別に音量を保存します。</p></div>';
}
function bindSettings(doc,onChange,onPreview){
 const find=id=>typeof doc.getElementById==='function'?doc.getElementById(id):doc.querySelector?.('#'+id);
 for(const input of doc.querySelectorAll('[data-audio-volume]')){
  const k=input.dataset.audioVolume;if(!Object.hasOwn(levels,k))continue;
  input.value=String(M.round(volume(k)*100));
  const output=find('mix-'+k+'-value');if(output)output.textContent=input.value+'%';
  input.oninput=()=>{if(!setVolume(k,Number(input.value)/100))return;const o=find('mix-'+k+'-value');if(o)o.textContent=M.round(volume(k)*100)+'%';onChange?.(k,volume(k));};
 }
 const button=find('audioPreview');if(button)button.onclick=()=>onPreview?.();
}
window.RUU_AUDIO={volume,setVolume,masterGain,resolve,play,prime,stopAll,syncMaster,settingsMarkup,bindSettings,stats};
})();
