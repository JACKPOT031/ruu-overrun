/* RUU//OVERRUN v1.36.0 — CYBER IMPACT / LIVE MIXER
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
// t: tone, n: filtered noise, b: resonator, i: harmonic impact body,
// c: gritty FM/ring energy, r: rising anticipation. Synthesis runs once per cue.
const T=(f,end,d,a,at=0,color=.25,attack=.004)=>({k:'t',f,end,d,a,at,color,attack});
const N=(lo,hi,d,a,at=0,attack=.002)=>({k:'n',lo,hi,d,a,at,attack});
const B=(f,d,a,at=0,color=.5)=>({k:'b',f,d,a,at,color,attack:.002});
const I=(f,end,d,a,at=0,grit=.5)=>({k:'i',f,end,d,a,at,grit,attack:.0018});
const C=(f,end,d,a,at=0,color=.7,gate=0)=>({k:'c',f,end,d,a,at,color,gate,attack:.002});
const R=(f,end,d,a,at=0,color=.7)=>({k:'r',f,end,d,a,at,color,attack:.012});
const notes=(fs,step,d,a,at=0)=>fs.flatMap((f,i)=>[T(f,f*1.002,d,a,at+i*step,.16,.004),B(f*2,d*.55,a*.18,at+i*step,.25)]);
const slam=(f=100,d=.3,a=.85,at=0)=>[
 I(f*2.6,f,d,a,at,.62),I(f*1.2,f*.58,d*.88,a*.48,at+.007,.18),
 N(170,2200,d*.62,a*.46,at),N(1800,6500,.035,a*.23,at)
];
const specs=Object.create(null);
function add(key,p,g,tail,layers,jitter=.035,drive=1.2){specs[key]={p,g,tail,layers,jitter,drive};}
// Core combat: a dry electrical crack plus a midbass body that translates to small speakers.
add('shoot',0,.38,.025,[I(320,145,.145,.88,0,.62),C(1850,360,.072,.43,0,.85),N(2000,6400,.022,.28),I(160,95,.09,.16,.012,.22)],.055,1.55);
add('hit',0,.37,.022,[I(270,116,.14,.93,0,.76),N(750,4300,.047,.43),B(465,.065,.19,.004,.88)],.07,1.7);
add('kill',0,.46,.055,[...slam(112,.22,.95),C(760,130,.13,.34,.01,.84),N(1100,4900,.11,.33,.027)],.055,1.6);
add('gem',0,.14,.025,[T(1050,1580,.052,.53,0,.12),B(2110,.06,.16,.017,.15),N(2700,5400,.013,.08)],.03,.8);
add('dash',1,.49,.075,[I(280,105,.17,.48),N(220,3600,.24,.79,0,.009),C(480,110,.22,.52,.015,.82),N(2700,6800,.078,.24,.03)],.035,1.25);
add('hurt',3,.64,.07,[...slam(98,.30,1),C(330,93,.19,.42,.01,.91),T(330,235,.17,.22,.07,.2)],.015,1.55);
add('shield',2,.47,.08,[I(355,160,.17,.55),B(590,.17,.54,0,.67),C(1270,490,.10,.34,0,.55),N(1300,4200,.04,.25)],.025,1.1);
add('heartbeat',2,.32,.03,[I(105,65,.15,.79,0,.16),I(91,53,.18,.58,.19,.17),N(55,300,.095,.15)],0,.8);
// Weapon families use different materials and rhythms instead of one pitch-shifted beep.
add('bolt',1,.53,.055,[C(2400,360,.15,.75,0,.95,47),N(1500,7200,.075,.61),I(360,132,.19,.73,.008,.8)],.035,1.55);
add('nova',1,.58,.09,[...slam(95,.38,1),C(470,78,.24,.46,0,.8),N(210,1800,.25,.33,.025)],.025,1.65);
add('sonic',1,.56,.07,[I(175,89,.41,1,0,.9),C(220,103,.28,.45,.018,.86,23),N(100,1300,.24,.43,.025)],.02,1.75);
add('prism',1,.46,.11,[I(295,148,.19,.53),...notes([660,990,1485],.025,.14,.32),C(2100,620,.16,.39,.018,.45)],.025,1.0);
add('shard',1,.42,.045,[I(330,172,.12,.68),B(1900,.12,.38,0,.95),B(980,.09,.25,.01,.78),N(2700,6500,.035,.31)],.05,1.3);
add('meteor',1,.63,.13,[R(170,740,.16,.38,0,.52),N(300,2900,.17,.35,0,.018),...slam(80,.43,1,.125),N(150,1800,.29,.41,.16)],.025,1.7);
add('rail',1,.63,.09,[R(370,1710,.1,.37,0,.77),C(2200,180,.19,.82,.085,.94),N(1600,6800,.067,.49,.085),I(340,119,.32,1,.085,.86),I(150,65,.28,.51,.095,.3)],.02,1.7);
add('frost',1,.44,.075,[I(260,139,.16,.55),B(1670,.16,.46,0,.94),B(2510,.11,.24,.03,.7),N(2500,6800,.08,.33,.01),C(930,410,.09,.18,.01,.6)],.035,1.1);
add('well',1,.55,.13,[R(86,190,.2,.61,0,.9),C(230,61,.42,.69,.14,.9,13),I(178,83,.36,.82,.12,.68),N(130,1150,.35,.36,.08,.025)],.02,1.6);
add('missile',1,.43,.035,[I(260,122,.16,.71),C(180,610,.13,.39,0,.82),N(450,3500,.105,.5,0,.006)],.045,1.35);
add('explosion',1,.63,.11,[...slam(86,.38,1),N(150,2100,.30,.61,.018),I(160,72,.34,.39,.025,.7)],.05,1.75);
add('satellite',1,.59,.11,[R(500,1800,.14,.37,0,.7),C(2100,260,.23,.61,.12,.93),...slam(103,.33,.91,.12)],.02,1.55);
add('rift',1,.53,.085,[C(970,127,.22,.77,0,.98,39),N(600,5200,.135,.46),I(280,98,.25,.86,.014,.73)],.035,1.6);
add('fireworks',1,.53,.1,[C(500,1410,.1,.32,0,.64),...slam(139,.23,.81,.075),B(1420,.14,.31,.12,.8),B(2010,.12,.23,.165,.85)],.035,1.3);
add('cross',1,.54,.095,[C(1370,230,.20,.69,0,.84),C(670,1320,.15,.29,.033,.68),I(310,120,.27,.84,.015,.69),N(1200,4900,.075,.3)],.025,1.45);
add('ultimatePulse',1,.48,.045,[I(260,108,.19,.89,0,.7),C(910,360,.09,.43,.007,.85),N(800,4100,.045,.26)],.025,1.45);
add('elite',2,.57,.15,[...slam(107,.34,.8),C(270,161,.37,.48,.06,.81,12),B(625,.27,.26,.14,.87)],.01,1.35);
add('drive',2,.59,.17,[R(100,490,.25,.5,0,.85),...notes([220,330,440,660],.06,.20,.34,.05),...slam(122,.28,.66,.22)],0,1.2);
add('chest',2,.46,.12,[I(350,170,.13,.5),N(950,3700,.025,.22),...notes([523,659,784,1047],.054,.18,.44,.035)],0,1.0);
add('combo',2,.32,.055,[C(420,880,.075,.37,0,.35),...notes([740,1110],.04,.1,.36)],.015,.9);
add('comboBig',2,.49,.12,[...notes([392,587,784,1175],.06,.18,.39),I(260,128,.24,.58,.14,.47)],0,1.1);
add('reroll',1,.29,.04,[C(510,210,.07,.37,0,.8,61),...notes([650,490,825],.035,.073,.29)],.02,1.1);
add('rare',2,.47,.13,notes([622,784,932,1244],.052,.19,.48),0,.9);
add('mythic',3,.63,.22,[R(130,920,.22,.33,0,.65),...notes([440,554,659,880,1108,1320],.056,.23,.39),...slam(110,.33,.63,.27),B(1760,.34,.21,.34,.5)],0,1.05);
add('select',1,.29,.018,[C(530,790,.055,.53,0,.22),I(330,170,.07,.28,0,.25),B(1080,.055,.15,.025,.22)],.015,.9);
add('menu',1,.24,.018,[C(460,660,.044,.45,0,.27),I(300,168,.062,.24,0,.26),N(1800,5100,.012,.10)],.015,.9);
add('start',2,.58,.16,[...notes([220,330,440,659],.06,.18,.40),...slam(127,.25,.71,.18),C(990,330,.13,.21,.19,.6)],0,1.15);
add('levelup',3,.61,.19,[...notes([440,554,659,880],.066,.23,.46),B(1760,.29,.20,.20,.4),I(280,132,.27,.64,.18,.43)],0,1.05);
add('evolve',3,.65,.24,[R(120,980,.3,.54,0,.82),N(250,4200,.29,.34,0,.032),...notes([330,440,660,880,1320],.048,.23,.36,.20),...slam(112,.36,.86,.29)],0,1.3);
add('styleUnlock',3,.55,.22,[B(530,.17,.4),...notes([659,784,988,1318,1568],.054,.21,.43,.045),I(230,120,.21,.38,.24,.28)],0,.9);
add('pilotArrival',2,.53,.15,[R(210,510,.19,.33,0,.57),...notes([310,465,698],.064,.20,.40,.06),I(240,135,.23,.58,.13,.44)],0,1.1);
add('pilotElio',1,.35,.09,[I(215,120,.19,.36,0,.28),B(510,.19,.48,0,.4),C(1020,620,.17,.27,.04,.35)],.015,1.0);
add('pilotOz',1,.47,.055,[C(1700,180,.14,.71,0,.97),N(1800,6200,.055,.35),I(300,105,.21,.77,.025,.7)],.025,1.5);
add('pilotKai',1,.43,.04,[0,.06,.12].flatMap((at,i)=>[C(710+i*100,235,.073,.43,at,.8),I(245,125,.09,.55,at,.57),N(1900,5500,.025,.2,at)]),.02,1.4);
add('pilotSera',1,.36,.14,[T(740,890,.23,.43,0,.14,.012),B(1108,.25,.32,.065),I(220,130,.18,.27,.04,.2)],.015,.9);
add('pilotMina',1,.33,.09,[...notes([715,1025,1335],.047,.1,.39),C(230,660,.13,.23,0,.5,28)],.02,1.0);
// Boss warnings keep their own silhouettes: threat pulse / machinery / formations / eclipse.
add('boss',3,.67,.22,[...slam(95,.42,.95),C(164,85,.68,.55,0,.88,8),C(270,158,.24,.48,.27,.83),C(270,145,.24,.48,.58,.83)],0,1.55);
add('devora',3,.68,.25,[I(180,80,.75,.97,0,.81),C(152,66,.7,.71,0,.96,9),N(140,1700,.57,.36,0,.022),I(250,125,.26,.59,.23,.8),I(240,112,.27,.57,.59,.8)],0,1.65);
add('nullEmperor',3,.71,.27,[I(135,67,.94,.8,0,.87),C(218,93,.87,.65,0,.96,6),C(340,159,.25,.46,.13,.89),C(340,143,.25,.46,.47,.89),...slam(92,.41,.91,.70)],0,1.7);
add('trueTrinity',3,.69,.24,[C(130,65,.95,.43,0,.83,12),...[0,.20,.40].flatMap((at,i)=>[...slam(128-i*13,.25,.76,at),C(620-i*110,150,.19,.43,at,.91)]),...slam(88,.37,.83,.62)],0,1.65);
add('trueQuintet',3,.72,.27,[C(120,51,1.14,.5,0,.96,17),...[0,.13,.26,.39,.52].flatMap((at,i)=>[I(320-i*24,128-i*9,.22,.79,at,.88),C(810-i*100,135,.18,.48,at,.95)]),...slam(83,.46,1,.73)],0,1.8);
add('eclipse',3,.70,.29,[C(152,78,.91,.59,0,.94,11),I(160,71,.85,.8,0,.68),B(415,.45,.31,.06,.95),B(587,.42,.28,.21,.95),R(300,1400,.42,.29,.17,.9),...slam(84,.43,.93,.59)],0,1.6);
add('eclipseReinforce',3,.65,.18,[...slam(119,.26,.84),...slam(108,.26,.74,.15),...slam(92,.34,.89,.32),C(450,137,.39,.33,.12,.94,25)],0,1.65);
add('eclipsePhase',3,.65,.17,[R(160,970,.24,.54,0,.95),N(450,4300,.22,.33,0,.015),...slam(109,.36,.95,.20)],0,1.55);
add('eclipseLast',3,.71,.25,[R(90,420,.28,.69,0,.87),C(810,260,.23,.57,.23,.96,21),...slam(88,.47,1,.39),C(230,73,.44,.42,.39,.94)],0,1.8);
add('astraea',3,.65,.21,[R(150,780,.36,.50,0,.65),R(225,1040,.35,.32,.025,.5),B(880,.25,.26,.25,.5),...slam(120,.34,.89,.33)],0,1.35);
add('bossPhase3',3,.67,.19,[R(145,1100,.26,.59,0,.91),N(260,3700,.22,.37,0,.018),...slam(92,.42,1,.23)],0,1.7);
add('bossDown',2,.65,.18,[...slam(93,.39,.96),N(700,4800,.25,.41,.02),C(530,102,.25,.38,.04,.85),...notes([440,330,220],.06,.15,.18,.08)],.01,1.6);
add('bossBreak',3,.70,.25,[C(570,72,.39,.73,0,.94),...slam(89,.50,1,.028),N(400,5400,.31,.51,.02),B(390,.38,.22,.12,.95)],0,1.8);
add('victory',3,.62,.28,[...notes([392,494,587,784,988,1175],.085,.25,.44),I(225,120,.36,.48,.35,.35),B(1568,.36,.22,.45,.4)],0,1.0);
add('defeat',3,.52,.22,[...notes([330,262,196,131],.11,.24,.38),I(175,78,.47,.61,.20,.5)],0,1.1);
add('death',3,.69,.29,[I(125,72,.15,.66),I(109,58,.19,.61,.19),C(360,56,.68,.69,.25,.94),N(250,4800,.29,.66,.34),...slam(88,.45,.86,.37),B(790,.39,.23,.43,.95)],0,1.65);
add('deathEcho',3,.39,.28,[C(650,90,.57,.44,0,.86),B(1120,.49,.28,0,.8),N(220,2800,.36,.24,.04,.02)],0,1.05);
add('jackpotDuo',3,.69,.23,[...notes([392,587,784,988,1175],.062,.21,.42),C(170,920,.28,.36,0,.78,19),...slam(126,.34,.86,.28),...notes([587,784,1175],.055,.16,.26,.31)],0,1.3);
add('jackpotWhite',3,.66,.26,[...notes([523,659,784,1047,1318,1568],.052,.23,.42),R(290,1540,.22,.24,0,.4),B(2093,.32,.27,.27,.35),I(270,145,.30,.72,.27,.32)],0,1.0);
add('jackpotBlack',3,.73,.24,[C(139,58,.73,.66,0,.98,13),I(180,81,.65,.91,0,.85),R(230,1050,.25,.42,.12,.89),...slam(94,.43,1,.36),C(800,140,.29,.44,.38,.96,33)],0,1.8);
// Named finishers have distinct attack patterns, not just nine pitches of one sound.
const finishers=[
 // NEON CITY: double plasma cannon and a citywide shockwave.
 [R(160,840,.18,.46),C(1600,280,.12,.52,.16,.87),C(2000,260,.14,.51,.24,.9),...slam(112,.41,.98,.28),C(660,127,.26,.30,.31,.84)],
 // GOLDEN VERDICT: two metallic gavel impacts with a harmonic verdict.
 [B(440,.18,.34),R(220,660,.14,.28),...slam(141,.29,.85,.15),B(880,.25,.32,.15,.8),...slam(115,.41,1,.39),...notes([440,554,659],.038,.19,.29,.4)],
 // NEON PANDEMONIUM: accelerating digital salvo into one release.
 [...[0,.085,.155,.215,.26].flatMap((at,i)=>[C(610+i*240,190,.085,.46,at,.97),I(260,144,.09,.36,at,.7)]),...slam(105,.43,1,.31),C(1370,160,.26,.54,.31,.95,43)],
 // INK REQUIEM: inhalation, silence-sized separation, then a dark pressure drop.
 [R(86,370,.23,.63,0,.82),N(180,1800,.21,.34,0,.025),...slam(87,.50,1,.27),C(190,68,.47,.49,.27,.96,9),B(293,.34,.24,.30,.93)],
 // SPIRAL PARADOX: rising FM whirl and crystalline release.
 [R(430,2280,.29,.57,0,.82),C(650,2040,.24,.32,.025,.91,29),...slam(136,.32,.81,.28),C(2210,490,.26,.48,.28,.85),B(990,.27,.31,.31,.74),B(1485,.24,.24,.36,.75)],
 // BLOOD VEIL: paired heartbeats under a saturated tear.
 [I(150,83,.12,.62,0,.4),I(137,72,.14,.63,.13,.45),R(160,720,.18,.35,.15,.9),...slam(96,.43,1,.32),C(1040,113,.31,.62,.32,.98)],
 // PATTERN BREAKER: four clocked gates, ending in a fractured block.
 [...[0,.09,.18,.27].flatMap((at,i)=>[C([450,900,675,1350][i],230,.077,.44,at,.86,26),I(310,150,.09,.47,at,.6)]),...slam(117,.39,.98,.36),N(700,4600,.19,.38,.37)],
 // NO SYNC OVERDRIVE: uneven glitch cuts and a crushed bass discharge.
 [...[0,.044,.132,.195,.267].flatMap((at,i)=>[C([1800,510,2200,770,1350][i],160,.055,.46,at,.98,67),N(1000,5800,.022,.19,at)]),...slam(99,.43,1,.32),C(310,93,.35,.64,.32,.99,51)],
 // LUNAR CLAW DIVE: vacuum rush and three descending claw strikes.
 [R(190,1140,.23,.47,0,.7),N(350,3200,.23,.35,0,.023),...[.23,.31,.39].flatMap((at,i)=>[C(1550-i*250,220-i*25,.13,.55,at,.88),I(300-i*25,147-i*12,.19,.60,at,.7)]),...slam(107,.35,.78,.40)]
];
finishers.forEach((layers,i)=>add('finisher'+i,3,.69,[.22,.26,.19,.28,.25,.23,.18,.19,.22][i],layers,0,[1.55,1.35,1.7,1.8,1.25,1.75,1.6,1.8,1.55][i]));
function resolve(name,opt={}){
 if(opt.cue&&Object.hasOwn(specs,opt.cue))return opt.cue;
 if(name==='jackpot')return ['jackpotDuo','jackpotWhite','jackpotBlack'][clamp(M.floor(finite(opt.jackpotType,0)),0,2)];
 if(name==='signature')return 'finisher'+clamp(M.floor(finite(opt.finisherType,0)),0,8);
 return Object.hasOwn(specs,name)?name:null;
}
function seedFor(s){let n=2166136261;for(const c of s)n=M.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
let randomState=0x6c31e2d5;
function random(){randomState=(M.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;}
function* buildSteps(ac,key){
 const spec=specs[key],duration=M.max(...spec.layers.map(l=>l.at+l.d)),dry=new Float32Array(M.ceil(duration*RATE)+1);
 for(const [index,l] of spec.layers.entries()){
  const offset=M.round(l.at*RATE),len=M.min(dry.length-offset,M.ceil(l.d*RATE));
  let phase=0,mod=0,detune=0,lo=0,hi=0,seed=seedFor(key+index);
  const cLo=l.k==='n'?1-M.exp(-TAU*l.lo/RATE):0,cHi=l.k==='n'?1-M.exp(-TAU*l.hi/RATE):0;
  const sweep=['t','c','r'].includes(l.k)?M.pow(l.end/l.f,1/M.max(1,len-1)):1;
  let f=l.f||0,impactPitch=(l.f||0)-(l.end||0),impactEnv=1;
  const settle=M.exp(-1/(RATE*.018)),bodyDecay=M.exp(-1/(RATE*l.d*.48));
  for(let i=0;i<len;i++){
   const u=i/M.max(1,len-1),t=i/RATE,edge=M.min(1,t/l.attack);
   // Impacts hold their body after a short transient; risers build into the release.
   // All other layers decay independently, so a bright crack cannot erase the body.
   const env=l.k==='i'?edge*impactEnv*M.min(1,(l.d-t)/.024):
    l.k==='r'?M.pow(M.sin(u*M.PI*.5),1.3)*M.min(1,(l.d-t)/.007):
    edge*M.pow(1-u,l.k==='b'?1.35:1.05)*M.exp(-u*(l.k==='b'?2.1:l.k==='n'?2.0:1.45));
   let x;
   if(l.k==='n'){
    seed=(M.imul(seed,1664525)+1013904223)>>>0;
    const w=seed/2147483648-1;hi+=cHi*(w-hi);lo+=cLo*(w-lo);x=(hi-lo)*1.8;
   }else if(l.k==='i'){
    // Pitch settles in 18 ms: weight is carried by a stable 90–180 Hz body.
    const hz=l.end+impactPitch;impactPitch*=settle;impactEnv*=bodyDecay;phase+=TAU*hz/RATE;
    const body=M.sin(phase)+.32*M.sin(2*phase)+.12*M.sin(3*phase);
    x=M.tanh(body*(1+l.grit*1.7))*.84;
   }else if(l.k==='b'){
    phase+=TAU*l.f/RATE;
    x=M.sin(phase)*.66+M.sin(phase*2.37)*.23*M.exp(-u*3.7)+M.sin(phase*3.91)*.11*l.color*M.exp(-u*6);
   }else if(l.k==='c'||l.k==='r'){
    phase+=TAU*f/RATE;mod+=TAU*f*1.49/RATE;detune+=TAU*f*1.012/RATE;f*=sweep;
    const fm=M.sin(phase+M.sin(mod)*l.color*(2.8-1.6*u));
    const ring=.77+.23*M.sin(mod*.51);
    const gate=l.gate ? .28+.72*(.5+.5*M.cos(TAU*l.gate*t)):1;
    x=M.tanh((fm*ring+.16*M.sin(detune)+.12*M.sin(phase*2))*(1+l.color*.8))*.83*gate;
   }else{
    phase+=TAU*f/RATE;mod+=TAU*f*1.73/RATE;f*=sweep;
    x=.84*M.sin(phase+M.sin(mod)*l.color*(1-u)*1.6)+.12*l.color*M.sin(phase*2)+.04*M.sin(phase*.5);
   }
   dry[offset+i]+=x*env*l.a;
   if((i&511)===511)yield;
  }
  yield;
 }
 // Gentle offline saturation increases density, while a DC blocker and short
 // edge fades keep the cached PCM bounded and click-free. No per-frame DSP.
 let dc=0,low=0;
 const reflection=new Float32Array(dry.length),dcCoef=1-M.exp(-TAU*24/RATE),lowCoef=1-M.exp(-TAU*320/RATE);
 for(let i=0;i<dry.length;i++){
  const v=M.tanh(dry[i]*spec.drive);dc+=dcCoef*(v-dc);
  dry[i]=(v-dc)*M.min(1,i/(RATE*.0015),(dry.length-1-i)/(RATE*.006));
  low+=lowCoef*(dry[i]-low);reflection[i]=dry[i]-low;
  if((i&511)===511)yield;
 }
 yield;
 const frames=dry.length+M.ceil(spec.tail*RATE),buffer=ac.createBuffer(2,frames,RATE);
 const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
 // Low frequencies stay centered; only upper detail enters the stereo reflections.
 const taps=[[.011,.065,.025],[.019,.025,.065],[.037,.045,.02],[.061,.02,.04],[.103,.025,.012],[.159,.01,.02],[.229,.009,.004]].filter(t=>t[0]<spec.tail);
 const delays=taps.map(([d,l,r])=>[M.round(d*RATE),l,r]);let peak=0;
 for(let i=0;i<frames;i++){
  const v=i<dry.length?dry[i]:0;let l=v,r=v;
  for(const [d,a,b] of delays){const j=i-d;if(j>=0&&j<dry.length){l+=reflection[j]*a;r+=reflection[j]*b;}}
  const fade=M.min(1,(frames-1-i)/M.round(.008*RATE));
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