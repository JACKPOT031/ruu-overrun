/* RUU//OVERRUN v1.39.0 — SPELL RESONANCE
   Original harmonic arcade shots, spell bells and concise gameplay feedback.
   PCM is cached in small idle slices; playback never consumes combat randomness. */
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
// Original arcade/danmaku palette. A rounded harmonic pulse and a soft bell
// carry each action; air is only a quiet accent. There are no imported samples.
const T=(f,end,d,a,at=0,color=.32)=>({k:'t',f,end,d,a,at,color,attack:.0016});
const L=(f,d,a,at=0,color=.30)=>({k:'l',f,end:f,d,a,at,color,attack:.0014});
const V=(f,d,a,at=0)=>({k:'v',f,end:f*1.004,d,a,at,color:.18,attack:.014});
const C=(f,end,d,a,at=0)=>({k:'c',f,end,d,a,at,color:.26,attack:.006});
const A=(f,end,d,a,at=0)=>({k:'a',f,end,d,a,at,color:.2,attack:.004});
const N=(lo,hi,d,a,at=0)=>({k:'n',lo,hi,d,a,at,attack:.0008});
const dart=(f=1320,d=.10,a=.7,at=0)=>[
 T(f,f*.82,d,a*.76,at,.37),T(f*.5,f*.52,d*.63,a*.12,at,.15),N(1600,4700,.009,a*.045,at)
];
const petal=(f=1320,d=.22,a=.6,at=0)=>[
 L(f,d,a*.60,at,.27),L(f*1.5,d*.76,a*.22,at+.008,.19),V(f*.5,d*.9,a*.12,at+.012)
];
const sweep=(f=1980,d=.18,a=.7,at=0)=>[
 T(f,f*.56,d,a*.67,at,.48),A(2900,1100,d*.65,a*.18,at),L(f*.75,d*.5,a*.13,at+.016,.13)
];
const bloom=(f=880,d=.35,a=.7,at=0)=>[
 T(f,f*1.025,d*.55,a*.39,at,.32),L(f*2,d,a*.34,at+.009,.32),V(f*1.5,d*1.1,a*.21,at+.014),A(1500,3300,d*.42,a*.13,at)
];
const pop=(f=990,d=.14,a=.7,at=0)=>[
 T(f,f*.62,d,a*.76,at,.52),L(f*1.76,d*.74,a*.15,at+.012,.17),A(2400,900,d*.64,a*.13,at)
];
const chime=(f=1320,d=.15,a=.5,at=0)=>[L(f,d,a*.76,at,.25),T(f*.5,f*.5,d*.45,a*.12,at,.10)];
const specs=Object.create(null);
function add(key,p,g,tail,layers,opt={}){specs[key]={p,g,tail,layers,jitter:.006,drive:.78,hp:145,lp:6200,wet:.10,variants:1,focus:0,...opt};}
// One compact pitched gesture per repeated action. Variants change articulation
// and quiet details while keeping the pitch stable against the user's songs.
add('shoot',0,.34,.022,[T(1420,1180,.074,.71,0,.38),T(710,670,.044,.10,0,.12),N(1800,4700,.009,.035)],{variants:3,jitter:.003,hp:180,wet:.045});
add('hit',0,.22,.018,[T(1960,1680,.038,.69,0,.18),T(980,840,.026,.09,0,.10),N(2200,4900,.010,.044)],{variants:3,jitter:.004,hp:240,wet:.035});
add('kill',0,.38,.028,[...pop(1060,.105,.76),L(1860,.082,.10,.018,.16)],{variants:3,jitter:.004,hp:180,wet:.075});
add('gem',0,.10,.016,[L(2280,.044,.51,0,.16),T(1520,1540,.026,.09,0,.06)],{variants:3,jitter:.0015,hp:320,lp:5900,wet:.06});
add('dash',1,.36,.045,[T(720,1850,.127,.45,0,.20),A(1700,3600,.11,.18),T(1440,2080,.07,.10,.02,.08)],{hp:180,wet:.13});
add('hurt',3,.53,.045,[T(880,520,.115,.65,0,.60),T(1320,780,.072,.16,.005,.22),A(2600,900,.063,.09)],{jitter:0,hp:180,lp:4800,wet:.06,focus:.78});
add('shield',2,.36,.095,[...petal(1320,.18,.60),T(660,990,.055,.13)],{hp:220,wet:.20});
// Keep the existing event ID: one quiet warning, never a heartbeat drum pattern.
add('heartbeat',2,.20,.020,[L(880,.065,.42,0,.12),T(440,440,.043,.06,0,.08)],{jitter:0,hp:250,lp:4200,wet:.04});
add('bolt',1,.40,.035,[T(1960,980,.094,.64,0,.62),T(980,740,.064,.12,0,.19),N(2400,5800,.018,.065)],{variants:3,jitter:.004,hp:190,wet:.075});
add('nova',1,.46,.12,[L(880,.115,.18),C(660,1320,.07,.18),...bloom(990,.28,.64,.045)],{jitter:.003,hp:160,wet:.22});
add('sonic',1,.36,.07,[T(820,670,.14,.53,0,.22),V(1640,.17,.13),A(1900,650,.12,.10)],{hp:160,lp:5400,wet:.15});
add('prism',1,.36,.08,[...petal(1320,.19,.62),T(1980,1760,.07,.12,.018,.12)],{variants:3,jitter:.002,hp:250,wet:.22});
add('shard',1,.29,.026,[L(1760,.085,.61,0,.22),T(2640,1980,.043,.10,.006,.18)],{variants:3,jitter:.002,hp:300,wet:.11});
add('meteor',1,.47,.09,[T(660,990,.045,.14),...pop(960,.20,.81,.016),L(1920,.18,.12,.035)],{hp:145,lp:5600,wet:.17});
add('rail',1,.48,.11,[T(1320,1760,.032,.22),...dart(1760,.21,.73,.021),L(2640,.25,.18,.025),V(880,.25,.13,.029)],{jitter:.003,hp:180,wet:.22});
add('frost',1,.31,.075,[L(1760,.17,.45,0,.20),L(2640,.12,.16,.011,.14),T(1320,1760,.054,.11)],{variants:3,jitter:.002,hp:280,wet:.21});
add('well',1,.39,.12,[T(660,530,.24,.38,0,.43),V(990,.29,.24),A(1650,480,.20,.12),L(1320,.14,.13,.06,.16)],{hp:135,lp:4900,wet:.23});
add('missile',1,.32,.028,[T(880,1760,.082,.55,0,.28),A(1000,3100,.067,.10),L(1760,.055,.08,.018)],{variants:3,jitter:.003,hp:185,wet:.075});
add('explosion',1,.43,.055,[...pop(880,.17,.83),N(1500,5000,.032,.09)],{variants:3,jitter:.004,hp:150,lp:5500,wet:.12});
add('satellite',1,.46,.14,[L(1320,.09,.16),...dart(1540,.24,.65,.027),V(770,.31,.18,.035),L(2310,.24,.14,.045)],{hp:175,wet:.23});
add('rift',1,.41,.085,[...sweep(1760,.19,.75),T(660,880,.14,.12,.014,.32)],{hp:160,lp:5600,wet:.17});
add('fireworks',1,.36,.12,[...pop(1320,.12,.54),L(2640,.20,.20,.046),V(1760,.20,.10,.058)],{hp:220,wet:.22});
add('cross',1,.41,.08,[T(1980,1320,.16,.48,0,.43),T(990,1320,.12,.18,.018,.23),L(2640,.18,.12,.024)],{hp:190,wet:.18});
add('ultimatePulse',1,.31,.03,[...dart(1320,.078,.66),L(1980,.065,.09,.006)],{variants:3,jitter:.002,hp:210,wet:.07});
add('elite',2,.43,.16,[L(660,.10,.24),C(660,1320,.13,.23),...bloom(990,.30,.63,.145)],{jitter:0,hp:160,wet:.23,focus:.80});
add('drive',2,.44,.18,[L(880,.10,.21),C(660,1760,.18,.29),...bloom(1320,.31,.61,.19)],{jitter:0,hp:180,wet:.25,focus:.73});
add('chest',2,.34,.13,[...chime(880,.10,.29),...chime(1320,.14,.35,.065),...chime(1760,.21,.30,.13)],{jitter:0,hp:220,wet:.22});
add('combo',2,.22,.04,[L(1320,.086,.53,0,.18),T(660,880,.037,.09)],{jitter:.002,hp:260,wet:.10});
add('comboBig',2,.35,.13,[...chime(1320,.14,.36),...petal(1760,.23,.45,.078)],{jitter:0,hp:220,wet:.22});
add('reroll',1,.21,.03,[T(1320,990,.045,.35,0,.15),L(1760,.070,.30,.043,.16)],{jitter:.002,hp:260,wet:.08});
add('rare',2,.34,.18,[...chime(1320,.18,.37),...petal(1980,.28,.37,.082)],{jitter:0,hp:250,wet:.26});
add('mythic',3,.49,.24,[L(880,.14,.19),C(660,1760,.17,.25),...bloom(1320,.36,.64,.18),L(2640,.32,.16,.27)],{jitter:0,hp:180,wet:.29,focus:.62});
add('select',1,.20,.025,[L(1320,.060,.53,0,.16),T(660,880,.028,.07)],{variants:3,jitter:.0015,hp:280,wet:.08});
add('menu',1,.16,.02,[T(990,1050,.040,.48,0,.14),L(1980,.029,.08)],{variants:3,jitter:.0015,hp:300,lp:5300,wet:.06});
add('start',2,.41,.17,[...chime(880,.12,.30),...chime(1320,.17,.35,.075),...bloom(1760,.27,.42,.16)],{jitter:0,hp:190,wet:.23,focus:.73});
add('levelup',3,.44,.19,[...chime(880,.12,.28),...chime(1320,.18,.32,.08),...petal(1760,.28,.52,.16)],{jitter:0,hp:220,wet:.26,focus:.70});
add('evolve',3,.51,.27,[L(880,.12,.23),C(660,1760,.20,.31),...bloom(1320,.42,.72,.21),L(2640,.35,.16,.30)],{jitter:0,hp:170,wet:.28,focus:.58});
add('styleUnlock',3,.40,.22,[...chime(1320,.19,.29),...chime(1760,.26,.30,.09),V(880,.41,.14,.12),L(2640,.32,.15,.18)],{jitter:0,hp:230,wet:.28,focus:.73});
add('pilotArrival',2,.39,.17,[...chime(880,.10,.26),...chime(1320,.13,.26,.085),...bloom(1760,.27,.43,.17)],{jitter:0,hp:210,wet:.23});
add('pilotElio',1,.26,.08,[...petal(1320,.17,.47),T(660,990,.074,.12)],{hp:240,wet:.17});
add('pilotOz',1,.35,.05,[...sweep(2200,.13,.67),L(1100,.08,.11,.012)],{hp:200,wet:.12});
add('pilotKai',1,.29,.03,[0,.055,.11].flatMap(at=>dart(1320,.053,.36,at)),{jitter:.002,hp:220,wet:.075});
add('pilotSera',1,.25,.14,[...chime(1320,.18,.30),V(660,.25,.17),L(1980,.21,.18,.055)],{hp:240,wet:.24});
add('pilotMina',1,.25,.075,[T(1320,1760,.077,.32,0,.20),L(2640,.12,.21,.029)],{hp:250,wet:.16});
// Threats use compact falling calls and open harmonic fields. Each warning
// begins immediately; longer spell flourishes stay behind the first signal.
add('boss',3,.52,.24,[L(660,.12,.24),T(990,660,.17,.28),C(660,1320,.20,.27),...bloom(880,.35,.67,.215)],{jitter:0,hp:150,lp:5600,wet:.26,focus:.58});
add('devora',3,.54,.25,[T(1320,660,.18,.34,0,.54),L(990,.17,.18),...bloom(660,.39,.72,.22),A(2200,750,.23,.13,.23)],{jitter:0,hp:135,lp:5200,wet:.27,focus:.56});
add('nullEmperor',3,.56,.30,[L(660,.18,.24),C(440,1320,.28,.27),...bloom(880,.44,.74,.29),L(1760,.36,.21,.37)],{jitter:0,hp:130,lp:5700,wet:.30,focus:.54});
add('trueTrinity',3,.54,.25,[L(880,.12,.20),...[.10,.18,.26].flatMap((at,i)=>chime([880,1320,1760][i],.15,.25,at)),...bloom(1320,.37,.60,.34)],{jitter:0,hp:170,wet:.28,focus:.57});
add('trueQuintet',3,.56,.27,[L(660,.13,.21),...[.08,.14,.20,.26,.32].flatMap((at,i)=>chime([660,880,990,1320,1760][i],.12,.20,at)),...bloom(990,.40,.68,.39)],{jitter:0,hp:160,wet:.28,focus:.55});
add('eclipse',3,.53,.27,[T(1760,660,.21,.29,0,.38),L(1320,.12,.19),C(660,1320,.25,.24),...bloom(990,.37,.65,.29),V(660,.40,.14,.32)],{jitter:0,hp:155,lp:5600,wet:.28,focus:.57});
add('eclipseReinforce',3,.48,.18,[...chime(1320,.10,.28),T(990,660,.16,.28,.075,.36),...bloom(880,.27,.56,.20)],{jitter:0,hp:180,wet:.23,focus:.65});
add('eclipsePhase',3,.49,.20,[L(880,.11,.22),C(660,1980,.16,.26),...sweep(2200,.26,.63,.17),V(1100,.32,.13,.18)],{jitter:0,hp:170,wet:.24,focus:.61});
add('eclipseLast',3,.56,.28,[T(1760,660,.18,.33,0,.49),L(1320,.12,.18),C(660,1760,.24,.29),...bloom(880,.41,.76,.25)],{jitter:0,hp:145,wet:.27,focus:.54});
add('astraea',3,.51,.28,[...chime(1320,.15,.25),C(880,2640,.20,.23),...bloom(1760,.38,.58,.21),V(880,.42,.15,.25)],{jitter:0,hp:200,wet:.30,focus:.59});
add('bossPhase3',3,.52,.23,[L(880,.10,.22),T(1320,660,.17,.28,0,.50),C(660,1760,.18,.26),...bloom(990,.34,.69,.19)],{jitter:0,hp:160,wet:.25,focus:.57});
add('bossDown',2,.48,.20,[...pop(1320,.23,.63),L(1760,.29,.24,.055),V(880,.34,.13,.045)],{jitter:0,hp:180,wet:.24,focus:.65});
add('bossBreak',3,.56,.26,[T(1760,880,.26,.42,0,.43),L(2640,.33,.26,.014),...bloom(880,.37,.61,.085),A(2700,850,.23,.15)],{jitter:0,hp:155,wet:.27,focus:.53});
add('victory',3,.45,.29,[...chime(880,.22,.29),...chime(1320,.27,.30,.15),...petal(1760,.40,.49,.30),V(660,.56,.13,.18)],{jitter:0,hp:200,wet:.30,focus:.65});
add('defeat',3,.37,.21,[L(1320,.19,.27),T(990,660,.21,.26,.12,.25),V(880,.31,.13,.17)],{jitter:0,hp:190,lp:4900,wet:.24,focus:.76});
add('death',3,.53,.16,[T(1980,660,.24,.56,0,.53),T(1320,440,.19,.21,.012,.22),L(2640,.18,.18,.018),A(2900,750,.15,.12,.009)],{jitter:0,hp:180,lp:5600,wet:.19,focus:.57});
add('deathEcho',3,.24,.21,[T(1760,880,.23,.25,0,.17),L(1320,.28,.23,.016),V(660,.29,.10,.03)],{jitter:0,hp:220,lp:4900,wet:.26});
add('jackpotDuo',3,.53,.27,[...chime(880,.13,.22),...chime(1320,.19,.27,.08),...bloom(1760,.35,.54,.18),L(2640,.31,.18,.27)],{jitter:0,hp:200,wet:.29,focus:.57});
add('jackpotWhite',3,.50,.30,[...petal(1320,.26,.34),C(880,2640,.17,.21),...bloom(1760,.40,.50,.18),V(880,.43,.14,.23)],{jitter:0,hp:210,wet:.32,focus:.61});
add('jackpotBlack',3,.57,.28,[T(1320,660,.17,.31,0,.47),L(990,.13,.17),C(660,1760,.20,.25),...bloom(880,.41,.76,.22)],{jitter:0,hp:155,lp:5700,wet:.28,focus:.53});
// Every spell has an immediate signal: gameplay's first ultimate pulse is also
// immediate. Its distinct bloom follows, with open intervals and short motifs.
const finishers=[
 [...chime(1320,.12,.27),C(880,2640,.18,.25),...dart(1760,.32,.59,.19),...bloom(1320,.38,.52,.205)],
 [...petal(1320,.14,.32),C(880,1760,.18,.20),...petal(1760,.39,.65,.20),L(2640,.31,.19,.28),V(880,.40,.14,.23)],
 [...chime(990,.10,.22),...[.07,.13,.19].flatMap((at,i)=>dart([990,1320,1760][i],.073,.30,at)),...bloom(1320,.35,.70,.27)],
 [T(1320,660,.15,.28,0,.42),L(1760,.12,.17),C(660,1320,.20,.22),...bloom(880,.41,.74,.22),T(1760,880,.19,.17,.30,.25)],
 [...chime(880,.12,.22),C(660,2640,.24,.28),...petal(1320,.37,.45,.25),T(1760,1320,.27,.26,.265,.24),V(880,.42,.16,.27)],
 [L(1320,.12,.26),T(880,1320,.15,.18),C(660,1760,.20,.23),...sweep(2200,.31,.63,.22),...petal(1320,.36,.34,.26)],
 [...[0,.07,.135,.19].flatMap((at,i)=>chime([990,1320,1760,1320][i],.058,.23,at)),C(880,1760,.13,.19,.14),...bloom(1320,.36,.69,.285)],
 [...[0,.041,.122,.195].flatMap((at,i)=>dart([1320,990,1760,1320][i],.039,.28,at)),C(880,1980,.12,.18,.18),...bloom(990,.37,.70,.30),L(2640,.28,.14,.35)],
 [...chime(1760,.11,.23),C(880,1980,.16,.21),...[.17,.255,.34].flatMap((at,i)=>sweep([2640,2200,1980][i],.135,.43,at)),...petal(1320,.32,.36,.37)]
];
finishers.forEach((layers,i)=>add('finisher'+i,3,.54,[.24,.27,.24,.28,.27,.25,.23,.25,.25][i],layers,{jitter:0,hp:[180,210,180,150,180,180,190,170,210][i],lp:i===3?5500:6300,wet:.27,focus:.58}));
function resolve(name,opt={}){
 if(opt.cue&&Object.hasOwn(specs,opt.cue))return opt.cue;
 if(name==='jackpot')return ['jackpotDuo','jackpotWhite','jackpotBlack'][clamp(M.floor(finite(opt.jackpotType,0)),0,2)];
 if(name==='signature')return 'finisher'+clamp(M.floor(finite(opt.finisherType,0)),0,8);
 return Object.hasOwn(specs,name)?name:null;
}
function seedFor(s){let n=2166136261;for(const c of s)n=M.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
let randomState=0x6c31e2d5;
function random(){randomState=(M.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;}
function filter(kind,f,q=.7071){
 const w=TAU*f/RATE,c=M.cos(w),alpha=M.sin(w)/(2*q),a0=1+alpha;
 const high=kind==='high',b0=(high?1+c:1-c)*.5;
 return {b0:b0/a0,b1:(high?-(1+c):1-c)/a0,b2:b0/a0,a1:-2*c/a0,a2:(1-alpha)/a0,z1:0,z2:0};
}
function filtered(f,x){const y=f.b0*x+f.z1;f.z1=f.b1*x-f.a1*y+f.z2;f.z2=f.b2*x-f.a2*y;return y;}
const cacheKey=(key,variant)=>key+':'+variant;
function* buildSteps(ac,key,variant=0){
 const spec=specs[key],duration=M.max(...spec.layers.map(l=>l.at+l.d)),dry=new Float32Array(M.ceil(duration*RATE)+1);
 for(const [index,l] of spec.layers.entries()){
  const offset=M.round(l.at*RATE),len=M.min(dry.length-offset,M.ceil(l.d*RATE));
  const variation=spec.variants>1?[-.7,.45,.85][variant]:0;
  const detune=1+variation*.0015,materialGain=1+variation*((index&1)?-.045:.045);
  const brightness=1+variation*.08;
  let phase=0,lo=0,hi=0,seed=seedFor(key+':'+variant+':'+index),f=(l.f||0)*detune;
  let band1=0,band2=0,n1=0,n2=0,b0=0,b2=0,a1=0,a2=0;
  const cLo=1-M.exp(-TAU*(l.lo||700)/RATE),cHi=1-M.exp(-TAU*(l.hi||5000)/RATE);
  const sweep=l.f?M.pow(l.end/l.f,1/M.max(1,len-1)):1;
  for(let i=0;i<len;i++){
   const u=i/M.max(1,len-1),t=i/RATE,edge=M.min(1,t/(l.attack*(1+variation*.10))),end=M.min(1,(l.d-t)/.005);
   seed=(M.imul(seed,1664525)+1013904223)>>>0;
   const noise=seed/2147483648-1;hi+=cHi*(noise-hi);lo+=cLo*(noise-lo);
   const air=(hi-lo)*1.65;
   let env=edge*end,x=0;
   if(l.k==='n'){
    env*=M.exp(-u*5.2)*(1-u);x=air;
   }else if(l.k==='a'){
    if((i&31)===0){const w=TAU*f/RATE,alpha=M.sin(w)/(2*.58),a0=1+alpha;b0=alpha/a0;b2=-b0;a1=-2*M.cos(w)/a0;a2=(1-alpha)/a0;}
    x=b0*noise+b2*n2-a1*band1-a2*band2;n2=n1;n1=noise;band2=band1;band1=x;f*=sweep;
    env*=M.pow(M.sin(M.PI*(u*.89+.03)),.7)*M.exp(-u*1.9)*(1-u);x*=1.8;
   }else{
    phase+=TAU*f/RATE;f*=sweep;
    // Smooth additive partials stay harmonically related. No hard-edged square,
    // noisy phase modulation, or resonant bass pitch-drop in the rapid loop.
    const color=l.color*brightness,bright=M.exp(-u*3.5);
    // Taper each upper partial before Nyquist, including the highest spell bells.
    const h2=clamp((RATE*.48-f*2)/(RATE*.08),0,1),h3=clamp((RATE*.48-f*3)/(RATE*.08),0,1),h4=clamp((RATE*.48-f*4)/(RATE*.08),0,1);
    if(l.k==='l'){
     x=.72*M.sin(phase)+(.12+color*.13)*M.sin(phase*2)*M.exp(-u*2.4)*h2+.075*M.sin(phase*3)*M.exp(-u*4.1)*h3+.035*M.sin(phase*4)*M.exp(-u*5.7)*h4;
     env*=M.exp(-u*2.0)*M.pow(1-u,1.4);
    }else if(l.k==='v'){
     x=.67*M.sin(phase)+.18*M.sin(phase*2)*h2+.09*M.sin(phase*3)*h3;
     env*=M.sin(M.PI*M.min(1,u*4)*.5)*M.pow(1-u,1.65);
    }else{
     x=.73*M.sin(phase)+(.075+color*.20)*M.sin(phase*2)*bright*h2+(.045+color*.12)*M.sin(phase*3)*bright*h3+.02*M.sin(phase*4)*bright*h4;
     if(l.k==='c')env*=M.pow(M.sin(u*M.PI*.5),1.5);
     else env*=M.exp(-u*2.7)*M.pow(1-u,1.1);
    }
   }
   dry[offset+i]+=x*env*l.a*materialGain;
   if((i&511)===511)yield;
  }
  yield;
 }
 const hp=filter('high',spec.hp),lp=filter('low',spec.lp),reflection=new Float32Array(dry.length);
 let low=0;const lowCoef=1-M.exp(-TAU*950/RATE);
 for(let i=0;i<dry.length;i++){
  const v=filtered(lp,filtered(hp,M.tanh(dry[i]*spec.drive)));
  dry[i]=v*M.min(1,i/(RATE*.0008),(dry.length-1-i)/(RATE*.006));
  low+=lowCoef*(dry[i]-low);reflection[i]=dry[i]-low;
  if((i&511)===511)yield;
 }
 yield;
 const frames=dry.length+M.ceil(spec.tail*RATE),buffer=ac.createBuffer(2,frames,RATE);
 const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
 // Positive, decorrelated upper-band reflections leave the dry center and body
 // intact in mono. Large events get a deeper room, ordinary fire only a short edge.
 const taps=[[.011,.62,.17],[.019,.18,.58],[.031,.32,.11],[.043,.12,.30],[.067,.23,.08],[.089,.08,.20],[.127,.13,.04],[.173,.04,.10],[.229,.055,.025],[.281,.025,.05]].filter(t=>t[0]<spec.tail);
 const delays=taps.map(([d,l,r])=>[M.round(d*RATE),l*spec.wet,r*spec.wet]);let peak=0,energy=0;
 for(let i=0;i<frames;i++){
  const v=i<dry.length?dry[i]:0;let l=v,r=v;
  for(const [d,a,b] of delays){const j=i-d;if(j>=0&&j<dry.length){l+=reflection[j]*a;r+=reflection[j]*b;}}
  const fade=M.min(1,(frames-1-i)/M.round(.008*RATE));
  left[i]=l*fade;right[i]=r*fade;peak=M.max(peak,M.abs(left[i]),M.abs(right[i]));energy+=left[i]*left[i]+right[i]*right[i];
  if((i&511)===511)yield;
 }
 yield;
 // Peak and RMS ceilings keep soft harmonic tones comfortable in dense volleys.
 // Role gains below preserve the difference between a hit tick and a spell.
 const rms=M.sqrt(energy/(frames*2));const gain=M.min(.78/M.max(.1,peak),(spec.p<2?.19:.21)/M.max(.001,rms));
 for(let i=0;i<frames;i++){left[i]*=gain;right[i]*=gain;if((i&511)===511)yield;}
 return buffer;
}
const engines=new WeakMap();
function bank(engine){
 let b=engines.get(engine);if(!b){b={cache:new Map(),building:new Map(),variants:new Map(),voices:new Set(),peakVoices:0,dropped:0,warm:false,muted:false,focusUntil:0,focusLevel:1};engines.set(engine,b);}return b;
}
function sample(engine,key,variant=0){
 const b=bank(engine),id=cacheKey(key,variant);
 if(!b.cache.has(id)){
  const task=b.building.get(id)||buildSteps(engine.ac,key,variant);
  try{let step;do{step=task.next();}while(!step.done);b.cache.set(id,step.value);}
  finally{b.building.delete(id);}
 }
 return b.cache.get(id);
}
function remove(b,v,stop=false){
 if(!b.voices.delete(v))return;
 if(stop)try{v.src.stop();}catch{}
 for(const n of v.nodes)try{n.disconnect();}catch{}
}
function stopAll(engine){if(!engine)return;const b=engines.get(engine);if(b){for(const v of [...b.voices])remove(b,v,true);b.focusUntil=0;b.focusLevel=1;}}
function masterGain(on=true){return on ? .58*volume('sfx'):0;}
function syncMaster(engine,on=true){
 if(!engine?.gain?.gain)return;bank(engine).muted=!on;const p=engine.gain.gain,v=masterGain(on);
 try{p.cancelScheduledValues(engine.ac.currentTime);p.setTargetAtTime(v,engine.ac.currentTime,.015);}catch{try{p.value=v;}catch{}}
 if(!on||v===0)stopAll(engine);
}
function focusVoice(v,b,now){
 if(v.priority>=2||b.focusUntil<=now)return;
 const p=v.amp.gain;
 try{p.cancelScheduledValues(now);p.setTargetAtTime(v.baseGain*b.focusLevel,now,.012);p.setTargetAtTime(v.baseGain,b.focusUntil,.15);}catch{}
}
function play(name,engine,opt={}){
 const key=resolve(name,opt);if(!key||!engine?.ac||!engine.gain||engine.ac.state!=='running')return false;
 if(volume('sfx')===0)return true;
 const spec=specs[key],b=bank(engine),ac=engine.ac;
 if(b.muted)return true;
 if(spec.p<2&&b.voices.size>=ROUTINE){b.dropped++;return true;}
 if(b.voices.size>=LIMIT){
  let victim=null;for(const v of b.voices)if(v.priority<spec.p&&(!victim||v.priority<victim.priority))victim=v;
  if(victim)remove(b,victim,true);else{b.dropped++;return true;}
 }
 let voice=null;
 try{
  const src=ac.createBufferSource();voice={src,amp:null,baseGain:0,nodes:[src],priority:spec.p};
  const amp=ac.createGain(),variant=b.variants.get(key)||0;voice.amp=amp;voice.nodes.push(amp);
  src.buffer=sample(engine,key,variant);b.variants.set(key,(variant+1)%spec.variants);
  src.playbackRate.value=1+(random()*2-1)*spec.jitter;
  const distance=clamp(finite(opt.distance,0),0,1800),position=clamp(finite(opt.pan,0),-.85,.85);
  const attenuation=spec.p>=2?1:1/(1+distance/1400);
  const baseGain=spec.g*attenuation*(spec.jitter?(.96+.07*random()):1);
  amp.gain.value=baseGain;
  voice.baseGain=baseGain;src.connect(amp);
  if(typeof ac.createStereoPanner==='function'){const pan=ac.createStereoPanner();pan.pan.value=position;voice.nodes.push(pan);amp.connect(pan);pan.connect(engine.gain);}else amp.connect(engine.gain);
  b.voices.add(voice);b.peakVoices=M.max(b.peakVoices,b.voices.size);
  src.onended=()=>remove(b,voice);src.start();
  if(spec.focus){
   const now=ac.currentTime;b.focusLevel=b.focusUntil>now?M.min(b.focusLevel,spec.focus):spec.focus;
   b.focusUntil=M.max(b.focusUntil,now+M.min(.70,src.buffer.duration*.70));
   for(const v of b.voices)focusVoice(v,b,now);
  }
  focusVoice(voice,b,ac.currentTime);
  return true;
 }catch(e){if(voice){if(b.voices.has(voice))remove(b,voice,true);else for(const n of voice.nodes)try{n.disconnect();}catch{}}return false;}
}
function prime(engine){
 if(!engine?.ac)return;const b=bank(engine);if(b.warm)return;b.warm=true;
 const quick=['shoot','hit','kill','gem'],opening=['dash','hurt','select','menu','start','shield','levelup'];
 const rest=Object.keys(specs).filter(k=>!quick.includes(k)&&!opening.includes(k));
 const takes=(keys,from=0)=>keys.flatMap(key=>Array.from({length:specs[key].variants-from},(_,i)=>({key,variant:i+from})));
 // The second and third rapid hits must be ready before distant boss cues.
 // First give each core action one take, then finish its small variation bank.
 const queue=[...quick.map(key=>({key,variant:0})),...takes(quick,1),...takes(opening),...takes(rest)];
 let item=null;
 const clock=typeof performance!=='undefined'&&typeof performance.now==='function'?()=>performance.now():()=>Date.now();
 const schedule=fn=>typeof requestIdleCallback==='function'?requestIdleCallback(fn,{timeout:600}):typeof setTimeout==='function'?setTimeout(fn,16):null;
 function next(deadline){
  if(engine.ac.state==='closed'){b.building.clear();queue.length=0;item=null;return;}
  const begin=clock();let chunks=0;
  while(item||queue.length){
   if(chunks&&(clock()-begin>=3||chunks>=64))break;
   if(typeof deadline?.timeRemaining==='function'&&deadline.timeRemaining()<1&&(!deadline.didTimeout||chunks))break;
   if(!item)item=queue.shift();
   const {key,variant}=item,id=cacheKey(key,variant);
   if(b.cache.has(id)){b.building.delete(id);item=null;continue;}
   let task=b.building.get(id);
   if(!task){task=buildSteps(engine.ac,key,variant);b.building.set(id,task);}
   try{
    const step=task.next();chunks++;
    if(step.done){if(!b.cache.has(id))b.cache.set(id,step.value);b.building.delete(id);item=null;}
   }catch{b.building.delete(id);item=null;chunks++;}
  }
  if(item||queue.length)schedule(next);
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
